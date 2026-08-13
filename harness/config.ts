import { z } from "zod"

export const harnessVersionSchema = z.literal("v1")

export const storybookTextProviderSchema = z.enum(["openai", "ninerouter"])
export const storybookImageProviderSchema = z.enum(["openai"])

export const storybookPipelineConfigSchema = z.object({
  harnessVersion: harnessVersionSchema.default("v1"),
  text: z.object({
    provider: storybookTextProviderSchema,
    model: z.string().min(1).optional(),
    apiKey: z.string().min(1),
    baseUrl: z.url().optional(),
  }),
  image: z.object({
    provider: storybookImageProviderSchema,
    model: z.string().min(1).optional(),
    apiKey: z.string().min(1),
  }),
})

export type StorybookPipelineConfig = z.infer<typeof storybookPipelineConfigSchema>

export const DEFAULT_PIPELINE_CONFIG = {
  harnessVersion: "v1" as const,
  text: {
    provider: "ninerouter" as const,
    model: "kr/claude-sonnet-4.5",
  },
  image: {
    provider: "openai" as const,
    model: "gpt-image-1-mini",
  },
}
