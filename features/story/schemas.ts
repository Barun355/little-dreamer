import { z } from "zod"

import { storybookResourcesSchema, storybookThemeSchema } from "@/types/schemas"

import { STORY_THEMES } from "./constants/themes"

const themeIds = STORY_THEMES.map((theme) => theme.id) as [string, ...string[]]

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

export const storybookStatusSchema = z.enum([
  "DRAFT",
  "GENERATING",
  "COMPLETED",
  "FAILED",
])

export const storyPhotoPayloadSchema = z.object({
  base64: z.string().min(1),
  contentType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, "Photo must be JPG, PNG, or WEBP."),
  fileName: z.string().min(1),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_PHOTO_BYTES, "Photo must be 2 MB or smaller."),
})

export const createStorybookInputSchema = z.object({
  storybookId: z.string().min(1),
  childName: z
    .string()
    .trim()
    .min(1, "Please enter the child's name.")
    .max(100, "Name must be 100 characters or fewer."),
  childAge: z
    .number()
    .int()
    .min(1, "Please enter an age between 1 and 12.")
    .max(12, "Please enter an age between 1 and 12."),
  themeId: z.enum(themeIds, {
    message: "Please choose a valid story theme.",
  }),
  photo: storyPhotoPayloadSchema,
})

export const createStorybookFormSchema = z.object({
  childName: z.string(),
  childAge: z.string(),
  themeId: z.string(),
  photo: z
    .instanceof(File, { message: "Please upload a photo of the child." })
    .refine((file) => file.size > 0, "Please upload a photo of the child.")
    .refine(
      (file) => file.size <= MAX_PHOTO_BYTES,
      "Photo must be 2 MB or smaller."
    )
    .refine(
      (file) => /^image\/(jpeg|jpg|png|webp)$/i.test(file.type),
      "Photo must be JPG, PNG, or WEBP."
    ),
})

export const storybookGenerationEventSchema = createStorybookInputSchema

export const storybookSummarySchema = z.object({
  id: z.string().min(1),
  childName: z.string().min(1),
  themeTitle: z.string().min(1),
  status: storybookStatusSchema,
  updatedAt: z.date(),
})

export const storybookSummaryListSchema = z.array(storybookSummarySchema)

export const storyIdParamSchema = z.object({
  storyId: z.string().min(1),
})

export const storybookDetailSchema = z.object({
  id: z.string().min(1),
  childName: z.string().min(1),
  childAge: z.number().int().min(1).max(12),
  photoUrl: z.string().nullable(),
  theme: storybookThemeSchema.nullable(),
  resources: storybookResourcesSchema.nullable(),
  status: storybookStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CreateStorybookInput = z.infer<typeof createStorybookInputSchema>
export type StorybookSummary = z.infer<typeof storybookSummarySchema>
export type StorybookDetail = z.infer<typeof storybookDetailSchema>
export type StoryPhotoPayload = z.infer<typeof storyPhotoPayloadSchema>

export async function mapFormValuesToCreateInput(
  values: z.infer<typeof createStorybookFormSchema>,
  storybookId: string
): Promise<CreateStorybookInput> {
  const photoBuffer = Buffer.from(await values.photo.arrayBuffer())

  return createStorybookInputSchema.parse({
    storybookId,
    childName: values.childName,
    childAge: Number(values.childAge),
    themeId: values.themeId,
    photo: {
      base64: photoBuffer.toString("base64"),
      contentType: values.photo.type,
      fileName: values.photo.name,
      size: values.photo.size,
    },
  })
}

export function mapFormErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}
