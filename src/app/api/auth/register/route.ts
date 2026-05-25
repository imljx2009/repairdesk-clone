import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 409 });
    }

    const firstStore = await prisma.store.findFirst({ orderBy: { id: "asc" } });
    if (!firstStore) {
      return Response.json({ error: "No store found. Create a store first." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, storeId: firstStore.id },
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, storeId: user.storeId });
    await setSessionCookie(token);

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, storeId: user.storeId },
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
