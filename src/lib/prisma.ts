import { PrismaClient } from "@/generated/prisma/client";

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "";

  if (url.startsWith("file:")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  }

  if (url.startsWith("postgresql")) {
    const { PrismaNeon } = require("@prisma/adapter-neon");
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
  }

  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  return new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
