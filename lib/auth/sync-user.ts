import { prisma } from "@/lib/db"
import { ensureUserStorageLayout } from "@/lib/r2"

import { allocateUsername } from "./username"

export type SyncUserInput = {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User already exists for email ${email}.`)
    this.name = "UserAlreadyExistsError"
  }
}

/**
 * Ensure the app user exists for this auth identity.
 * - If the user id already exists: return as-is (no profile update, no R2 work).
 * - If new: create once and provision R2 folders.
 * Never deletes or recreates users.
 */
export async function syncUser(input: SyncUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existingUser) {
    return existingUser
  }

  const username = allocateUsername({
    userId: input.id,
    name: input.name,
    email: input.email,
  })

  try {
    const created = await prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
        image: input.image ?? null,
        username,
        role: "USER",
        subscription: {
          storybooksPerDay: 1,
        },
      },
    })

    try {
      await ensureUserStorageLayout(created.username)
      return prisma.user.update({
        where: { id: created.id },
        data: { storageProvisionedAt: new Date() },
      })
    } catch (error) {
      console.error("[syncUser] R2 storage provision failed:", error)
      return created
    }
  } catch (error) {
    throw error
  }
}
