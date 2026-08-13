import { AIProvider } from "@/orchestrator"
import type {
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
  GenerateTextResult,
} from "@/orchestrator"

import type { StorybookPipelineConfig } from "./config"
import type { StoryGenerationRequest } from "./types"

/**
 * Bridges harness request shapes to orchestrator model calls.
 * This is the only harness module allowed to import `@/orchestrator`.
 */
export class StorybookRunner {
  constructor(private readonly config: StorybookPipelineConfig) {}

  async generateStory(
    request: StoryGenerationRequest
  ): Promise<GenerateTextResult> {
    const model = AIProvider.create({
      provider: this.config.text.provider,
      apiKey: this.config.text.apiKey,
      textModel: this.config.text.model,
      baseUrl: this.config.text.baseUrl,
    })

    const options: GenerateTextOptions = {
      messages: request.messages,
      jsonSchema: request.jsonSchema,
      jsonMode: request.jsonMode ?? true,
    }

    return model.generateText(options)
  }

  async generateImage(
    options: GenerateImageOptions
  ): Promise<GenerateImageResult> {
    const model = AIProvider.create({
      provider: this.config.image.provider,
      apiKey: this.config.image.apiKey,
      imageModel: this.config.image.model,
    })

    return model.generateImage(options)
  }
}
