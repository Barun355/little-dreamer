import { z } from "zod"

export const harnessCharacterSchema = z.object({
  name: z.string().min(1),
  visualDescription: z.string().min(10),
  photoUrl: z.string().url().optional(),
  referenceImageUrl: z.string().url().optional(),
})

export const harnessStoryPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(5),
  text: z.string().min(1),
  sceneDescription: z.string().min(1),
  dialogueBubble: z.string().min(1),
})

export const harnessStoryBundleSchema = z.object({
  title: z.string().min(1),
  coverSubtitle: z.string().min(1),
  baseStory: z.string().min(1),
  backCoverBlurb: z.string().min(1),
  pages: z.array(harnessStoryPageSchema).length(5),
  character: harnessCharacterSchema,
})

export type HarnessStoryBundle = z.infer<typeof harnessStoryBundleSchema>
