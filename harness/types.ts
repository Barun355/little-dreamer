import type { ImagePromptSlot } from "@/types/schemas"

export type HarnessMessageRole = "system" | "user" | "assistant"

export type HarnessTextContentPart = {
  type: "text"
  text: string
}

export type HarnessImageUrlContentPart = {
  type: "image_url"
  image_url: {
    url: string
    detail?: "auto" | "low" | "high"
  }
}

export type HarnessMessageContentPart =
  | HarnessTextContentPart
  | HarnessImageUrlContentPart

export type HarnessMessageContent = string | HarnessMessageContentPart[]

export type HarnessMessage = {
  role: HarnessMessageRole
  content: HarnessMessageContent
}

export type HarnessJsonSchema = {
  name: string
  schema: Record<string, unknown>
  strict?: boolean
}

export type StoryGenerationRequest = {
  messages: HarnessMessage[]
  jsonSchema: HarnessJsonSchema
  jsonMode?: boolean
}

export type StoryThemeInput = {
  title: string
  baseStory: string
}

export type PhotoInput = {
  base64: string
  contentType: string
}

export type BuildStoryGenerationParams = {
  childName: string
  childAge: number
  theme: StoryThemeInput
  /** Actual photo bytes for vision — preferred over photoUrl. */
  photo?: PhotoInput
  /** Stored URL for product/UI only; not used as vision input. */
  photoUrl?: string
}

export type StoryCharacter = {
  name: string
  visualDescription: string
  photoUrl?: string
  referenceImageUrl?: string
}

export type StoryPageWithScene = {
  pageNumber: number
  text: string
  sceneDescription: string
  /** Short line for an on-image speech/thought bubble (≤12 words preferred). */
  dialogueBubble: string
}

export type StoryBundle = {
  title: string
  /** Short cover tagline shown under the title. */
  coverSubtitle: string
  baseStory: string
  /** Short back-cover blurb or closing line. */
  backCoverBlurb: string
  pages: StoryPageWithScene[]
  character: StoryCharacter
}

export type AssembleImagePromptsParams = {
  character: StoryCharacter
  pages: StoryPageWithScene[]
  slots: readonly ImagePromptSlot[]
  title: string
  coverSubtitle?: string
  backCoverBlurb?: string
  baseStory?: string
}

export type AssembledImagePrompt = {
  slot: ImagePromptSlot
  prompt: string
}
