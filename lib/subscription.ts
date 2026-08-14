import { z } from "zod"

import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/db"

const subscriptionSchema = z.object({
  storybooksPerDay: z.number().int().min(0),
})

type QuotaClient = Pick<Prisma.TransactionClient, "storybook" | "user">

export class StorybookQuotaExceededError extends Error {
  constructor(limit: number) {
    super(
      limit === 1
        ? "You can generate 1 storybook per day. Please try again tomorrow."
        : `You can generate ${limit} storybooks per day. Please try again tomorrow.`
    )
    this.name = "StorybookQuotaExceededError"
  }
}

function parseDailyLimit(subscription: Prisma.JsonValue): number {
  return subscriptionSchema.parse(subscription).storybooksPerDay
}

function getUtcDayRange(date: Date) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  return { start, end }
}

export async function assertCanGenerateStorybook(
  userId: string,
  db: QuotaClient = prisma
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscription: true },
  })

  if (!user) {
    throw new Error("User subscription could not be found.")
  }

  const limit = parseDailyLimit(user.subscription)
  const { start, end } = getUtcDayRange(new Date())
  const used = await db.storybook.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  })

  if (used >= limit) {
    throw new StorybookQuotaExceededError(limit)
  }

  return { limit, used }
}

export async function assertStorybookWithinDailyQuota(
  userId: string,
  storybookId: string,
  db: QuotaClient = prisma
) {
  const [user, storybook] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { subscription: true },
    }),
    db.storybook.findUnique({
      where: { id: storybookId },
      select: { createdAt: true, userId: true },
    }),
  ])

  if (!user || !storybook || storybook.userId !== userId) {
    throw new Error("Storybook subscription could not be validated.")
  }

  const limit = parseDailyLimit(user.subscription)
  const { start, end } = getUtcDayRange(storybook.createdAt)
  const allowedStorybooks = await db.storybook.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit,
    select: { id: true },
  })

  if (!allowedStorybooks.some(({ id }) => id === storybookId)) {
    throw new StorybookQuotaExceededError(limit)
  }

  return { limit }
}
