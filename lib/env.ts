import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_TEXT_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_IMAGE_MODEL: z.string().default("dall-e-3"),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_DEV: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cachedEnv: ServerEnv | null = null

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv
  }

  cachedEnv = serverEnvSchema.parse(process.env)
  return cachedEnv
}
