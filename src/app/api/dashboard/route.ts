import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function getStoreId(request: NextRequest) {
  return Number(request.headers.get("x-store-id")) || 1;
}

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  const [customerCount, ticketCount, inventoryCount, pendingTickets, revenue] =
    await Promise.all([
      prisma.customer.count({ where: { storeId } }),
      prisma.repairTicket.count({ where: { storeId } }),
      prisma.inventoryItem.count({ where: { storeId } }),
      prisma.repairTicket.count({ where: { storeId, status: "PENDING" } }),
      prisma.sale.aggregate({ where: { storeId }, _sum: { total: true } }),
    ]);

  const lowStockItems = await prisma.inventoryItem.findMany({ where: { storeId } });
  const lowStock = lowStockItems.filter((item) => item.quantity <= item.minStock);

  const recentTickets = await prisma.repairTicket.findMany({
    where: { storeId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const statusCounts = await prisma.repairTicket.groupBy({
    by: ["status"],
    where: { storeId },
    _count: true,
  });

  return Response.json({
    customerCount,
    ticketCount,
    inventoryCount,
    pendingTickets,
    lowStockCount: lowStock.length,
    revenue: revenue._sum.total || 0,
    recentTickets,
    statusCounts,
  });
}
