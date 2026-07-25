import { z } from "zod"

/**
 * The create-wizard contract. Shared by the client form and the server action,
 * so validation cannot drift between them.
 */

export const RELATIONSHIPS = [
  "Parent",
  "Grandparent",
  "Aunt or uncle",
  "Sibling",
  "Family friend",
  "Guardian",
  "Other",
] as const

export const GENDERS = [
  { value: "girl", label: "Girl" },
  { value: "boy", label: "Boy" },
  { value: "other", label: "Prefer not to say" },
] as const

export const childDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter their name")
    .max(40, "That name is a little too long"),
  gender: z.enum(["girl", "boy", "other"]),
  age: z
    .number()
    .int()
    .min(2, "This is designed for ages 2 and up")
    .max(12, "This is designed for ages 12 and under"),
  relationship: z.enum(RELATIONSHIPS),
  /**
   * Consent is a checkbox the uploader must actively tick. It is stored with
   * a timestamp on the Job — for a product built on photographs of children,
   * "they agreed" needs to be a record, not an assumption.
   */
  consent: z.literal(true, {
    message: "Please confirm you may use this child's photo",
  }),
})

export const themeChoiceSchema = z.object({
  themeId: z.string().min(1, "Pick a theme"),
})

export const photosSchema = z.object({
  /**
   * R2 object KEYS, not image data.
   *
   * The browser uploads each photo straight to R2 with a presigned PUT and
   * passes back the key. Sending base64 through the Server Action hit the
   * 1 MB body cap on any real photograph.
   */
  photos: z
    .array(z.string().startsWith("photos/"))
    .min(1, "Add at least one photo")
    .max(3, "Three photos is plenty"),
  photoConsent: z.literal(true, {
    message: "Please confirm before we generate",
  }),
})

export const createInputSchema = childDetailsSchema
  .and(themeChoiceSchema)
  .and(photosSchema)

export type ChildDetails = z.infer<typeof childDetailsSchema>
export type ThemeChoice = z.infer<typeof themeChoiceSchema>
export type Photos = z.infer<typeof photosSchema>
export type CreateInput = z.infer<typeof createInputSchema>

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

/** Job states the UI cares about, mirrored from the Prisma enum. */
export type JobStatusValue =
  | "QUEUED"
  | "ANALYZING"
  | "PLANNING"
  | "STORY_READY"
  | "ILLUSTRATING"
  | "ASSEMBLING"
  | "READY"
  | "FAILED"

export const STATUS_COPY: Record<JobStatusValue, { label: string; detail: string }> = {
  QUEUED: { label: "Getting started", detail: "Setting up the workshop." },
  ANALYZING: { label: "Meeting your child", detail: "Studying the photo you sent." },
  PLANNING: { label: "Planning the adventure", detail: "Choosing which things happen." },
  STORY_READY: { label: "Writing the story", detail: "Pitching every word at their reading age." },
  ILLUSTRATING: { label: "Drawing the pages", detail: "Keeping the same child on every page." },
  ASSEMBLING: { label: "Binding the book", detail: "Putting the pages together." },
  READY: { label: "Your book is ready", detail: "Have a look inside." },
  FAILED: { label: "Something went wrong", detail: "Nothing was charged." },
}
