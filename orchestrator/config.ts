import { z } from "zod"

import { getServerEnv } from "@/lib/env"

import { AIProviderError } from "./errors"
import type { AIModelConfig, AIProviderId, ResolvedAIModelConfig } from "./types"

export const aiProviderIdSchema = z.enum(["openai", "ninerouter"])

export const aiModelConfigSchema = z.object({
  provider: aiProviderIdSchema,
  apiKey: z.string().min(1, "API key is required."),
  textModel: z.string().min(1).optional(),
  imageModel: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
})

export const DEFAULT_TEXT_MODEL = "gpt-4o-mini"
export const DEFAULT_IMAGE_MODEL = "gpt-image-1-mini"
export const DEFAULT_NINEROUTER_TEXT_MODEL = "kr/claude-sonnet-4.5"
export const DEFAULT_NINEROUTER_BASE_URL = "http://localhost:20128/v1"

function defaultTextModel(provider: AIProviderId): string {
  return provider === "ninerouter"
    ? DEFAULT_NINEROUTER_TEXT_MODEL
    : DEFAULT_TEXT_MODEL
}

export function resolveModelConfig(config: AIModelConfig): ResolvedAIModelConfig {
  const parsed = aiModelConfigSchema.parse(config)

  return {
    ...parsed,
    textModel: parsed.textModel ?? defaultTextModel(parsed.provider),
    imageModel: parsed.imageModel ?? DEFAULT_IMAGE_MODEL,
    baseUrl:
      parsed.baseUrl ??
      (parsed.provider === "ninerouter" ? DEFAULT_NINEROUTER_BASE_URL : undefined),
  }
}

export function createConfigFromEnv(
  provider: AIProviderId = "openai"
): AIModelConfig {
  const env = getServerEnv()

  if (provider === "ninerouter") {
    if (!env.NINEROUTER_API_KEY) {
      throw new AIProviderError(
        "NINEROUTER_API_KEY is required for NineRouter text generation.",
        "ninerouter"
      )
    }

    return {
      provider: "ninerouter",
      apiKey: env.NINEROUTER_API_KEY,
      textModel: env.NINEROUTER_TEXT_MODEL,
      baseUrl: env.NINEROUTER_BASE_URL,
    }
  }

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
  }
}
