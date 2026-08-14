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
  NINEROUTER_API_KEY: z.string().min(1).optional(),
  NINEROUTER_BASE_URL: z.string().url().default("http://localhost:20128/v1"),
  NINEROUTER_TEXT_MODEL: z.string().min(1).default("kr/claude-sonnet-4.5"),
  STORYBOOK_TEXT_PROVIDER: z.enum(["openai", "ninerouter"]).optional(),
  STORYBOOK_TEXT_MODEL: z.string().min(1).optional(),
  STORYBOOK_IMAGE_PROVIDER: z.enum(["openai"]).optional(),
  STORYBOOK_IMAGE_MODEL: z.string().min(1).optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_DEV: z.string().optional(),
  NEON_AUTH_BASE_URL: z.string().url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().default("Little Dreamer <onboarding@resend.dev>"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
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
