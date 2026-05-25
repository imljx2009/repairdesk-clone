import { prisma } from "@/lib/prisma";
import { getSessionToken, verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, storeId: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
}
