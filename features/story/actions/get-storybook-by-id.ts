"use server"

import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
import { parseInput, parseOutput } from "@/lib/validation"
import { storybookThemeSchema } from "@/types/schemas"

import {
  storybookDetailSchema,
  storyIdParamSchema,
  type StorybookDetail,
} from "../schemas"

export async function getStorybookById(storyId: unknown): Promise<StorybookDetail> {
  const { storyId: id } = parseInput(storyIdParamSchema, { storyId })

  const storybook = await prisma.storybook.findUnique({
    where: { id },
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

  return parseOutput(storybookDetailSchema, {
    ...storybook,
    theme: parsedTheme.success ? parsedTheme.data : null,
  })
}
