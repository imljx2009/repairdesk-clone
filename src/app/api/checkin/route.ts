import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const storeId = Number(request.headers.get("x-store-id")) || 1;
    const body = await request.json();
    const { firstName, lastName, phone, email, brand, deviceType, model, serial, colour, problemDesc, urgency, chips } = body;

    if (!firstName || !lastName || !phone) {
      return Response.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`.trim();

    let customer = await prisma.customer.findFirst({
      where: { storeId, phone },
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name, email: email || customer.email },
      });
    } else {
      customer = await prisma.customer.create({
        data: { storeId, name, email: email || null, phone },
      });
    }

    const lastTicket = await prisma.repairTicket.findFirst({
      where: { storeId },
      orderBy: { id: "desc" },
    });
    const nextNum = lastTicket
      ? Number(lastTicket.ticketNumber.split("-")[1]) + 1
      : 1001;

    const issueParts = [`[${deviceType || "Device"}] ${problemDesc}`];
    if (chips?.length) issueParts.push(`Issues: ${chips.join(", ")}`);
    if (urgency) issueParts.push(`Urgency: ${urgency}`);

    const ticket = await prisma.repairTicket.create({
      data: {
        storeId,
        customerId: customer.id,
        ticketNumber: `TKT-${nextNum}`,
        deviceName: `${brand || ""} ${model || ""}`.trim(),
        deviceModel: model || null,
        serialNumber: serial || null,
        issue: issueParts.join("\n"),
        notes: colour ? `Colour: ${colour}` : null,
        status: "PENDING",
        cost: 0,
      },
    });

    return Response.json({ customer, ticket, ticketNumber: ticket.ticketNumber }, { status: 201 });
  } catch (error) {
    console.error("Checkin error:", error);
    return Response.json({ error: "Check-in failed" }, { status: 500 });
  }
}
