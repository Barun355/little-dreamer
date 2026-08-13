import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/db"

export type SyncUserInput = {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export async function syncUser(input: SyncUserInput) {
  const profile = {
    email: input.email,
    name: input.name ?? null,
    image: input.image ?? null,
  }

  try {
    return await prisma.user.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        ...profile,
        role: "USER",
      },
      update: profile,
    })
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!existing) {
      throw error
    }

    if (existing.id === input.id) {
      return prisma.user.update({
        where: { id: input.id },
        data: profile,
      })
    }

    return prisma.$transaction(async (tx) => {
      await tx.storybook.updateMany({
        where: { userId: existing.id },
        data: { userId: input.id },
      })
      await tx.user.delete({ where: { id: existing.id } })
      return tx.user.create({
        data: {
          id: input.id,
          ...profile,
          role: existing.role,
        },
      })
    })
  }
}
