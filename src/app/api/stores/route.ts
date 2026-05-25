import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
  return Response.json(stores);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = await prisma.store.create({ data: body });
  return Response.json(store, { status: 201 });
}
