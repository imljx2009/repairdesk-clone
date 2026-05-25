import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function getStoreId(request: NextRequest) {
  return Number(request.headers.get("x-store-id")) || 1;
}

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  const items = await prisma.inventoryItem.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
  });
  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const storeId = getStoreId(request);
  const body = await request.json();
  const item = await prisma.inventoryItem.create({ data: { ...body, storeId } });
  return Response.json(item, { status: 201 });
}
