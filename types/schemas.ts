import { z } from "zod"

export const storybookPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(5),
  text: z.string().min(1),
  sceneDescription: z.string().min(1).optional(),
  dialogueBubble: z.string().min(1).optional(),
})

export const storybookCharacterSchema = z.object({
  name: z.string().min(1),
  visualDescription: z.string().min(1),
  photoUrl: z.string().url().optional(),
  referenceImageUrl: z.string().url().optional(),
})

/** User-selected theme direction stored on the storybook row. */
export const storybookThemeSchema = z.object({
  title: z.string().min(1),
  baseStory: z.string().min(1),
})

export const storybookStoryContentSchema = z.object({
  title: z.string().min(1),
  coverSubtitle: z.string().min(1).optional(),
  baseStory: z.string().min(1),
  backCoverBlurb: z.string().min(1).optional(),
  pages: z.array(storybookPageSchema).length(5),
  character: storybookCharacterSchema.optional(),
})

export const storybookImagesSchema = z.object({
  frontCover: z.string().url(),
  backCover: z.string().url(),
  stories: z.array(z.string().url()).length(5),
})

/** Generated story content and illustration URLs produced by the workflow. */
export const storybookResourcesSchema = z.object({
  story: storybookStoryContentSchema.optional(),
  story_images: storybookImagesSchema.optional(),
})

export const completedStorybookResourcesSchema = z.object({
  story: storybookStoryContentSchema,
  story_images: storybookImagesSchema,
})

export const imagePromptSlotSchema = z.enum([
  "frontCover",
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "backCover",
])

export type StorybookTheme = z.infer<typeof storybookThemeSchema>
export type StorybookCharacter = z.infer<typeof storybookCharacterSchema>
export type StorybookStoryContent = z.infer<typeof storybookStoryContentSchema>
export type StorybookImages = z.infer<typeof storybookImagesSchema>
export type StorybookResources = z.infer<typeof storybookResourcesSchema>
export type ImagePromptSlot = z.infer<typeof imagePromptSlotSchema>
