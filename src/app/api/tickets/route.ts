import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function getStoreId(request: NextRequest) {
  return Number(request.headers.get("x-store-id")) || 1;
}

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  const tickets = await prisma.repairTicket.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
  return Response.json(tickets);
}

export async function POST(request: NextRequest) {
  const storeId = getStoreId(request);
  const body = await request.json();
  const lastTicket = await prisma.repairTicket.findFirst({
    where: { storeId },
    orderBy: { id: "desc" },
  });
  const nextNum = lastTicket ? Number(lastTicket.ticketNumber.split("-")[1]) + 1 : 1001;
  const ticket = await prisma.repairTicket.create({
    data: { ...body, storeId, ticketNumber: `TKT-${nextNum}` },
  });
  return Response.json(ticket, { status: 201 });
}
