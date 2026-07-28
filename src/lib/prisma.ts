import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Next.js hot-reloads modules in development, which would otherwise open a new
// connection pool on every edit.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at a local Postgres.",
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
