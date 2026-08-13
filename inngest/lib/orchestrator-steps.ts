import { AIProvider } from "@/orchestrator"
import type { GenerateImageOptions, GenerateTextOptions } from "@/orchestrator"

export async function orchestratorGenerateText(options: GenerateTextOptions) {
  const model = AIProvider.createFromEnv("ninerouter")
  return model.generateText(options)
}

export async function orchestratorGenerateImage(options: GenerateImageOptions) {
  const model = AIProvider.createFromEnv("openai")
  return model.generateImage(options)
}
