import { z } from "zod"

import { getServerEnv } from "@/lib/env"

import { AIProviderError } from "./errors"
import type { AIModelConfig, ResolvedAIModelConfig } from "./types"

export const aiProviderIdSchema = z.literal("openai")

export const aiModelConfigSchema = z.object({
  provider: aiProviderIdSchema,
  apiKey: z.string().min(1, "API key is required."),
  textModel: z.string().min(1).optional(),
  imageModel: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
})

export const DEFAULT_TEXT_MODEL = "gpt-4o-mini"
export const DEFAULT_IMAGE_MODEL = "dall-e-3"

export function resolveModelConfig(config: AIModelConfig): ResolvedAIModelConfig {
  const parsed = aiModelConfigSchema.parse(config)

  return {
    ...parsed,
    textModel: parsed.textModel ?? DEFAULT_TEXT_MODEL,
    imageModel: parsed.imageModel ?? DEFAULT_IMAGE_MODEL,
    baseUrl: parsed.baseUrl,
  }
}

export function createConfigFromEnv(): AIModelConfig {
  const env = getServerEnv()

  if (!env.OPENAI_API_KEY) {
    throw new AIProviderError(
      "OPENAI_API_KEY is required for OpenAI image generation.",
      "openai"
    )
  }

  return {
    provider: "openai",
    apiKey: env.OPENAI_API_KEY,
    textModel: env.OPENAI_TEXT_MODEL,
    imageModel: env.OPENAI_IMAGE_MODEL,
  }
}
