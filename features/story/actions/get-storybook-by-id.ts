"use server"

import { notFound } from "next/navigation"

import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import { parseInput, parseOutput } from "@/lib/validation"
import { storybookResourcesSchema, storybookThemeSchema } from "@/types/schemas"

import {
  storybookDetailSchema,
  storyIdParamSchema,
  type StorybookDetail,
} from "../schemas"

export async function getStorybookById(storyId: unknown): Promise<StorybookDetail> {
  const user = await requireUser()
  const { storyId: id } = parseInput(storyIdParamSchema, { storyId })

  const storybook = await prisma.storybook.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      childName: true,
      childAge: true,
      photoUrl: true,
      theme: true,
      resources: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!storybook) {
    notFound()
  }

  const parsedTheme = storybookThemeSchema.safeParse(storybook.theme)
  const parsedResources = storybookResourcesSchema.safeParse(storybook.resources)

  return parseOutput(storybookDetailSchema, {
    ...storybook,
    theme: parsedTheme.success ? parsedTheme.data : null,
    resources: parsedResources.success ? parsedResources.data : null,
  })
}
