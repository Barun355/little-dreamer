import type { ImagePromptSlot } from "@/types/schemas"

import type {
  AssembleImagePromptsParams,
  AssembledImagePrompt,
  StoryPageWithScene,
} from "../types"
import {
  BACK_COVER_COMPOSITION,
  BACK_COVER_TEXT_POLICY,
  DEFAULT_STYLE_PACK,
  FRONT_COVER_COMPOSITION,
  FRONT_COVER_TEXT_POLICY,
  LIKENESS_FOCUS,
  PAGE_COMPOSITION,
  PAGE_TEXT_POLICY,
} from "./style-pack"

/** Soft cap for on-image dialogue so lettering stays readable. */
const MAX_BUBBLE_WORDS = 12

export function deriveDialogueBubble(pageText: string): string {
  const trimmed = pageText.trim()
  if (!trimmed) {
    return ""
  }

  const firstSentence =
    trimmed.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, "").trim() ?? trimmed
  const words = firstSentence.split(/\s+/).filter(Boolean)

  if (words.length <= MAX_BUBBLE_WORDS) {
    return firstSentence
  }

  return `${words.slice(0, MAX_BUBBLE_WORDS).join(" ")}…`
}

export function deriveCoverSubtitle(baseStory: string, fallback: string): string {
  const trimmed = baseStory.trim()
  if (!trimmed) {
    return fallback
  }

  const firstSentence =
    trimmed.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, "").trim() ?? trimmed
  const words = firstSentence.split(/\s+/).filter(Boolean)

  if (words.length <= 14) {
    return firstSentence
  }

  return words.slice(0, 14).join(" ")
}

function pageForSlot(
  slot: ImagePromptSlot,
  pages: StoryPageWithScene[]
): StoryPageWithScene {
  if (slot === "frontCover") {
    return pages[0]!
  }

  if (slot === "backCover") {
    return pages[pages.length - 1]!
  }

  const pageNumber = Number(slot.replace("page", ""))
  const page = pages.find((item) => item.pageNumber === pageNumber)

  if (!page) {
    throw new Error(`Missing story page for image slot ${slot}.`)
  }

  return page
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function buildFrontCoverPrompt(params: {
  characterBlock: string
  title: string
  coverSubtitle: string
  sceneDescription: string
}): string {
  return collapseWhitespace(`
    ${FRONT_COVER_COMPOSITION}.
    ${params.characterBlock}.
    ${LIKENESS_FOCUS}.
    Scene: ${params.sceneDescription}.
    Title text exactly: "${params.title}".
    Subtitle text exactly: "${params.coverSubtitle}".
    ${FRONT_COVER_TEXT_POLICY}.
    ${DEFAULT_STYLE_PACK}
  `)
}

function buildPagePrompt(params: {
  characterBlock: string
  sceneDescription: string
  dialogueBubble: string
}): string {
  return collapseWhitespace(`
    ${PAGE_COMPOSITION}.
    ${params.characterBlock}.
    ${LIKENESS_FOCUS}.
    Scene: ${params.sceneDescription}.
    Speech bubble dialogue exactly: "${params.dialogueBubble}".
    ${PAGE_TEXT_POLICY}.
    ${DEFAULT_STYLE_PACK}
  `)
}

function buildBackCoverPrompt(params: {
  characterBlock: string
  sceneDescription: string
  backCoverBlurb: string
}): string {
  return collapseWhitespace(`
    ${BACK_COVER_COMPOSITION}.
    ${params.characterBlock}.
    ${LIKENESS_FOCUS}.
    Scene: ${params.sceneDescription}.
    Back cover text exactly: "${params.backCoverBlurb}".
    ${BACK_COVER_TEXT_POLICY}.
    ${DEFAULT_STYLE_PACK}
  `)
}

export function assembleImagePrompts(
  params: AssembleImagePromptsParams
): AssembledImagePrompt[] {
  const { character, pages, slots, title, baseStory = "" } = params
  const characterBlock = `${character.name}: ${character.visualDescription}`
  const coverSubtitle =
    params.coverSubtitle?.trim() ||
    deriveCoverSubtitle(baseStory, `${character.name}'s magical adventure`)
  const backCoverBlurb =
    params.backCoverBlurb?.trim() ||
    `The End — sweet dreams, ${character.name}!`

  return slots.map((slot) => {
    const page = pageForSlot(slot, pages)

    if (slot === "frontCover") {
      return {
        slot,
        prompt: buildFrontCoverPrompt({
          characterBlock,
          title,
          coverSubtitle,
          sceneDescription: page.sceneDescription,
        }),
      }
    }

    if (slot === "backCover") {
      return {
        slot,
        prompt: buildBackCoverPrompt({
          characterBlock,
          sceneDescription: page.sceneDescription,
          backCoverBlurb,
        }),
      }
    }

    const dialogueBubble =
      page.dialogueBubble?.trim() || deriveDialogueBubble(page.text)

    return {
      slot,
      prompt: buildPagePrompt({
        characterBlock,
        sceneDescription: page.sceneDescription,
        dialogueBubble,
      }),
    }
  })
}
