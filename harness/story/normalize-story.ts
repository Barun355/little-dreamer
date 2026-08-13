import { parseJsonModelOutput } from "@/lib/json-output"
import { parseOutput } from "@/lib/validation"

import { deriveCoverSubtitle, deriveDialogueBubble } from "../prompts/assemble-image-prompts"
import { harnessStoryBundleSchema } from "../schemas"
import type { StoryBundle, StoryPageWithScene } from "../types"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  return undefined
}

function coercePageNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value.trim())
  }

  return fallback
}

function normalizePages(rawPages: unknown, childName: string): StoryPageWithScene[] {
  if (!Array.isArray(rawPages)) {
    return []
  }

  return rawPages.slice(0, 5).map((page, index) => {
    const record = asRecord(page) ?? {}
    const text =
      coerceString(record.text) ??
      coerceString(record.pageText) ??
      coerceString(record.content) ??
      ""
    const sceneDescription =
      coerceString(record.sceneDescription) ??
      coerceString(record.scene_description) ??
      coerceString(record.scene) ??
      `${childName} in a gentle storybook scene for page ${index + 1}`
    const dialogueBubble =
      coerceString(record.dialogueBubble) ??
      coerceString(record.dialogue_bubble) ??
      coerceString(record.speechBubble) ??
      (text ? deriveDialogueBubble(text) : `${childName} says hello!`)

    return {
      pageNumber: coercePageNumber(
        record.pageNumber ?? record.page_number,
        index + 1
      ),
      text,
      sceneDescription,
      dialogueBubble,
    }
  })
}

function normalizeCharacter(
  rawCharacter: unknown,
  fallbackName: string
): StoryBundle["character"] {
  const record = asRecord(rawCharacter) ?? {}
  const name =
    coerceString(record.name) ??
    coerceString(record.childName) ??
    coerceString(record.child_name) ??
    fallbackName
  const visualDescription =
    coerceString(record.visualDescription) ??
    coerceString(record.visual_description) ??
    coerceString(record.description) ??
    `A child named ${name} with a warm friendly expression, soft features, and simple colorful storybook clothes`

  return {
    name,
    visualDescription,
    photoUrl: coerceString(record.photoUrl ?? record.photo_url),
    referenceImageUrl: coerceString(
      record.referenceImageUrl ?? record.reference_image_url
    ),
  }
}

/** Coerce messy model JSON into a validated story bundle. */
export function normalizeStoryOutput(
  raw: unknown,
  options?: { fallbackChildName?: string }
): StoryBundle {
  const record = asRecord(raw) ?? {}
  const fallbackName = options?.fallbackChildName ?? "the child"
  const pages = normalizePages(record.pages, fallbackName)
  const character = normalizeCharacter(record.character, fallbackName)
  const title =
    coerceString(record.title) ??
    coerceString(record.storyTitle) ??
    `${character.name}'s Adventure`
  const baseStory =
    coerceString(record.baseStory) ??
    coerceString(record.base_story) ??
    coerceString(record.summary) ??
    ""

  const candidate = {
    title,
    coverSubtitle:
      coerceString(record.coverSubtitle) ??
      coerceString(record.cover_subtitle) ??
      coerceString(record.subtitle) ??
      deriveCoverSubtitle(baseStory, `${character.name}'s magical adventure`),
    baseStory,
    backCoverBlurb:
      coerceString(record.backCoverBlurb) ??
      coerceString(record.back_cover_blurb) ??
      `The End — sweet dreams, ${character.name}!`,
    pages,
    character,
  }

  return parseOutput(
    harnessStoryBundleSchema,
    candidate,
    "Story generation returned invalid JSON."
  )
}

export function parseStoryOutput(
  rawText: string,
  options?: { fallbackChildName?: string }
): StoryBundle {
  return normalizeStoryOutput(parseJsonModelOutput(rawText), options)
}
