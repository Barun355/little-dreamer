import { AIProvider } from "@/orchestrator"
import type { GenerateImageOptions, GenerateTextOptions } from "@/orchestrator"

/**
 * Temporary hardcoded Nine Router config for Inngest text generation (testing only).
 * Story + image-prompt steps use this; image generation uses OpenAI via env.
 */
const NINE_ROUTER_TEXT_CONFIG = {
  provider: "openai" as const,
  apiKey: "sk-ad6cb46849a55708-un681f-30ee8f04",
  baseUrl: "http://localhost:20128/v1",
  textModel: "kr/claude-sonnet-4.5",
}

export async function orchestratorGenerateText(options: GenerateTextOptions) {
  const model = AIProvider.create(NINE_ROUTER_TEXT_CONFIG)
  return model.generateText(options)
}

export async function orchestratorGenerateImage(options: GenerateImageOptions) {
  const model = AIProvider.createFromEnv()
  return model.generateImage(options)
}
