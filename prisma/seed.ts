import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const store1 = await prisma.store.create({
    data: {
      name: "Downtown Repair Shop",
      address: "123 Main St, New York, NY 10001",
      phone: "555-0001",
      email: "downtown@repairdesk.local",
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Uptown Electronics Repair",
      address: "456 Park Ave, New York, NY 10065",
      phone: "555-0002",
      email: "uptown@repairdesk.local",
    },
  });

  const customersS1 = await Promise.all([
    prisma.customer.create({
      data: { storeId: store1.id, name: "John Smith", email: "john@example.com", phone: "555-0101", address: "123 Main St", notes: "Regular customer" },
    }),
    prisma.customer.create({
      data: { storeId: store1.id, name: "Sarah Johnson", email: "sarah@example.com", phone: "555-0102", address: "456 Oak Ave" },
    }),
    prisma.customer.create({
      data: { storeId: store2.id, name: "Mike Chen", phone: "555-0103", address: "789 Pine Rd" },
    }),
  ]);

  const itemsS1 = await Promise.all([
    prisma.inventoryItem.create({
      data: { storeId: store1.id, name: "iPhone 15 Screen", sku: "SCR-IP15", category: "Screens", quantity: 10, price: 89.99, cost: 45.00, minStock: 3 },
    }),
    prisma.inventoryItem.create({
      data: { storeId: store1.id, name: "Samsung Battery", sku: "BAT-S23", category: "Batteries", quantity: 5, price: 39.99, cost: 18.00, minStock: 2 },
    }),
    prisma.inventoryItem.create({
      data: { storeId: store1.id, name: "USB-C Charging Port", sku: "CHG-USBC", category: "Charging Ports", quantity: 15, price: 19.99, cost: 8.00, minStock: 5 },
    }),
    prisma.inventoryItem.create({
      data: { storeId: store2.id, name: "MacBook Pro Screen", sku: "SCR-MBP14", category: "Screens", quantity: 3, price: 299.99, cost: 150.00, minStock: 1 },
    }),
    prisma.inventoryItem.create({
      data: { storeId: store2.id, name: "Laptop Battery", sku: "BAT-MBP", category: "Batteries", quantity: 7, price: 129.99, cost: 60.00, minStock: 2 },
    }),
  ]);

  const ticketsS1 = await Promise.all([
    prisma.repairTicket.create({
      data: {
        storeId: store1.id, ticketNumber: "TKT-1001",
        customerId: customersS1[0].id,
        deviceName: "iPhone 15 Pro", deviceModel: "A3104", serialNumber: "SN-IP15-001",
        issue: "Cracked screen, not responding to touch",
        status: "IN_PROGRESS", cost: 89.99,
        notes: "Customer requested original quality screen",
      },
    }),
    prisma.repairTicket.create({
      data: {
        storeId: store1.id, ticketNumber: "TKT-1002",
        customerId: customersS1[1].id,
        deviceName: "Samsung Galaxy S23", deviceModel: "SM-S911B", serialNumber: "SN-S23-001",
        issue: "Battery draining quickly, needs replacement",
        status: "PENDING", cost: 39.99,
      },
    }),
    prisma.repairTicket.create({
      data: {
        storeId: store2.id, ticketNumber: "TKT-1003",
        customerId: customersS1[2].id,
        deviceName: "MacBook Pro 14", deviceModel: "M3 Pro", serialNumber: "SN-MBP-001",
        issue: "USB-C port not charging",
        status: "COMPLETED", cost: 79.99,
        notes: "Replaced charging port, tested working",
      },
    }),
  ]);

  const sale = await prisma.sale.create({
    data: {
      storeId: store1.id, saleNumber: "SALE-0001",
      customerId: customersS1[0].id,
      total: 129.98, payment: "CARD",
      items: {
        create: [
          { itemId: itemsS1[0].id, quantity: 1, price: 89.99, subtotal: 89.99 },
          { itemId: itemsS1[1].id, quantity: 1, price: 39.99, subtotal: 39.99 },
        ],
      },
    },
  });

  console.log("Seed data created successfully");
  console.log(`  ${2} stores`);
  console.log(`  ${customersS1.length} customers`);
  console.log(`  ${itemsS1.length} inventory items`);
  console.log(`  ${ticketsS1.length} repair tickets`);
  console.log(`  1 sale`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
