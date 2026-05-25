import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function getStoreId(request: NextRequest) {
  return Number(request.headers.get("x-store-id")) || 1;
}

export async function POST(request: NextRequest) {
  const storeId = getStoreId(request);
  const body = await request.json();
  const { customerId, payment, items } = body;

  const lastSale = await prisma.sale.findFirst({
    where: { storeId },
    orderBy: { id: "desc" },
  });
  const nextNum = lastSale ? Number(lastSale.saleNumber.split("-")[1]) + 1 : 1001;

  const total = items.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0
  );

  const sale = await prisma.sale.create({
    data: {
      storeId,
      saleNumber: `SALE-${nextNum}`,
      customerId: customerId || null,
      total,
      payment,
      items: {
        create: items.map(
          (item: { itemId: number; quantity: number; price: number }) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })
        ),
      },
    },
    include: { items: { include: { item: true } } },
  });

  for (const item of items) {
    await prisma.inventoryItem.update({
      where: { id: item.itemId },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  return Response.json(sale, { status: 201 });
}

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  const sales = await prisma.sale.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      customer: { select: { name: true } },
      items: { include: { item: { select: { name: true } } } },
    },
  });
  return Response.json(sales);
}
