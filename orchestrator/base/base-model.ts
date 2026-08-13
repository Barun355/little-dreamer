import type {
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
  GenerateTextResult,
  ResolvedAIModelConfig,
  StreamTextOptions,
  TextStreamChunk,
} from "../types"
import type { AIProviderId } from "../types"

export abstract class BaseAIModel {
  abstract readonly provider: AIProviderId

  constructor(protected readonly config: ResolvedAIModelConfig) {}

  get textModel(): string {
    return this.config.textModel
  }

  get imageModel(): string {
    return this.config.imageModel
  }

  abstract generateText(options: GenerateTextOptions): Promise<GenerateTextResult>

  abstract streamText(
    options: StreamTextOptions
  ): AsyncGenerator<TextStreamChunk, void, unknown>

  abstract generateImage(options: GenerateImageOptions): Promise<GenerateImageResult>
}
