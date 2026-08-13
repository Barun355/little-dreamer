"use server"

import { prisma } from "@/lib/db"
import { parseOutput } from "@/lib/validation"
import { storybookThemeSchema } from "@/types/schemas"

import {
  storybookSummaryListSchema,
  type StorybookSummary,
} from "../schemas"

function getThemeTitle(theme: unknown): string {
  const parsedTheme = storybookThemeSchema.safeParse(theme)

  if (parsedTheme.success) {
    return parsedTheme.data.title
  }

  return "Untitled story"
}

export async function getRecentStorybooks(): Promise<StorybookSummary[]> {
  const storybooks = await prisma.storybook.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      childName: true,
      theme: true,
      status: true,
      updatedAt: true,
    },
  })

  const summaries = storybooks.map((storybook) => ({
    id: storybook.id,
    childName: storybook.childName,
    themeTitle: getThemeTitle(storybook.theme),
    status: storybook.status,
    updatedAt: storybook.updatedAt,
  }))

  return parseOutput(
    storybookSummaryListSchema,
    summaries,
    "Invalid storybook list returned from database."
  )
}
