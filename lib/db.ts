import "server-only"

import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

import { env } from "./env"

/**
 * Prisma 7 connects through a driver adapter rather than a connection string
 * in the datasource block. `PrismaNeon` speaks Neon's serverless protocol,
 * which matters on Vercel where a normal TCP pool cannot survive between
 * invocations.
 *
 * Cached on globalThis so Next's dev server does not open a new pool on every
 * hot reload — the classic way to exhaust a Postgres connection limit locally.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: env.databaseUrl })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
