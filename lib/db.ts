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
 * LAZY ON PURPOSE. Building the client at module scope meant that merely
 * importing this file read DATABASE_URL — and Next evaluates route modules
 * while collecting page data, so `next build` failed with "DATABASE_URL is
 * not set" on any machine without a populated .env. On Vercel that killed the
 * build outright, which is what produced a 404: no successful deployment
 * existed to serve.
 *
 * A build should never need runtime secrets. The Proxy defers construction to
 * the first actual property access, which only happens while serving a
 * request.
 *
 * Cached on globalThis so Next's dev server does not open a fresh pool on
 * every hot reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: env.databaseUrl })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient()
  }
  return globalForPrisma.prisma
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === "function" ? value.bind(client) : value
  },
})
