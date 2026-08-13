import { z } from "zod"

export const storybookPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(5),
  text: z.string().min(1),
})

export const storybookThemeSchema = z.object({
  title: z.string().min(1),
  baseStory: z.string().min(1),
  pages: z.array(storybookPageSchema).length(5).optional(),
})

export const storybookResourcesSchema = z.object({
  story_images: z.object({
    frontCover: z.string().url(),
    backCover: z.string().url(),
    stories: z.array(z.string().url()).length(5),
  }),
})

export const generatedStorySchema = z.object({
  title: z.string().min(1),
  baseStory: z.string().min(1),
  pages: z.array(storybookPageSchema).length(5),
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

export const imagePromptSchema = z.object({
  slot: imagePromptSlotSchema,
  prompt: z.string().min(20),
})

export const imagePromptListSchema = z.array(imagePromptSchema).length(7)

export type StorybookTheme = z.infer<typeof storybookThemeSchema>
export type StorybookResources = z.infer<typeof storybookResourcesSchema>
export type GeneratedStory = z.infer<typeof generatedStorySchema>
export type ImagePrompt = z.infer<typeof imagePromptSchema>
