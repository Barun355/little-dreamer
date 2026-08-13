import { z } from "zod"

export const storybookPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(5),
  text: z.string().min(1),
})

/** User-selected theme direction stored on the storybook row. */
export const storybookThemeSchema = z.object({
  title: z.string().min(1),
  baseStory: z.string().min(1),
})

export const storybookStoryContentSchema = z.object({
  title: z.string().min(1),
  baseStory: z.string().min(1),
  pages: z.array(storybookPageSchema).length(5),
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

export const generatedStorySchema = storybookStoryContentSchema

export const imagePromptSlotSchema = z.enum([
  "frontCover",
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "backCover",
])

export const imagePromptSchema = z.object({
  slot: imagePromptSlotSchema,
  prompt: z.string().min(20),
})

export const imagePromptListSchema = z.array(imagePromptSchema).length(7)

export type StorybookTheme = z.infer<typeof storybookThemeSchema>
export type StorybookStoryContent = z.infer<typeof storybookStoryContentSchema>
export type StorybookImages = z.infer<typeof storybookImagesSchema>
export type StorybookResources = z.infer<typeof storybookResourcesSchema>
export type GeneratedStory = z.infer<typeof generatedStorySchema>
export type ImagePrompt = z.infer<typeof imagePromptSchema>
