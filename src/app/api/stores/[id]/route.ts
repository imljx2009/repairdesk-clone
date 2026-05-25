import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const store = await prisma.store.update({
    where: { id: Number(id) },
    data: body,
  });
  return Response.json(store);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.store.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
