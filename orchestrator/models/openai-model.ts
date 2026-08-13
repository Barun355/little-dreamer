import OpenAI from "openai"

import { AIModelError } from "../errors"
import { BaseAIModel } from "../base/base-model"
import type {
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
  GenerateTextResult,
  ResolvedAIModelConfig,
  StreamTextOptions,
  TextStreamChunk,
} from "../types"

export class OpenAIModel extends BaseAIModel {
  readonly provider = "openai" as const

  private readonly client: OpenAI

  constructor(config: ResolvedAIModelConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.textModel,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: options.jsonMode
          ? { type: "json_object" }
          : undefined,
      })

      return {
        text: response.choices[0]?.message?.content ?? "",
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        raw: response,
      }
    } catch (error) {
      throw new AIModelError("OpenAI text generation failed.", this.provider, error)
    }
  }

  async *streamText(
    options: StreamTextOptions
  ): AsyncGenerator<TextStreamChunk, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.textModel,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: options.jsonMode
          ? { type: "json_object" }
          : undefined,
        stream: true,
      })

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content

        if (text) {
          yield { text }
        }
      }

      yield { text: "", done: true }
    } catch (error) {
      throw new AIModelError("OpenAI text streaming failed.", this.provider, error)
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    try {
      const response = await this.client.images.generate({
        model: this.imageModel,
        prompt: options.prompt,
        size: options.size ?? "1024x1024",
        quality: options.quality ?? "standard",
        n: options.n ?? 1,
      })

      return {
        images:
          response.data?.map((image) => ({
            url: image.url ?? undefined,
            b64Json: image.b64_json ?? undefined,
          })) ?? [],
        raw: response,
      }
    } catch (error) {
      throw new AIModelError("OpenAI image generation failed.", this.provider, error)
    }
  }
}
