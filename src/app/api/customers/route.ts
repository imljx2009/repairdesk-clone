import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function getStoreId(request: NextRequest) {
  return Number(request.headers.get("x-store-id")) || 1;
}

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  const customers = await prisma.customer.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(customers);
}

export async function POST(request: NextRequest) {
  const storeId = getStoreId(request);
  const body = await request.json();
  const customer = await prisma.customer.create({ data: { ...body, storeId } });
  return Response.json(customer, { status: 201 });
}
