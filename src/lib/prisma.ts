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

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // node-postgres defaults to 10 connections per pool. On a serverless host
      // that pool is per instance, so a modest ceiling and a short idle timeout
      // stop cold instances holding connections they will never reuse. Tuning,
      // not a fix — a hosted pooler tolerates far more clients than this.
      max: 5,
      idleTimeoutMillis: 10_000,
    }),
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
