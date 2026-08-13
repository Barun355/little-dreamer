import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

import { AIModelError } from "../errors"
import { BaseAIModel } from "../base/base-model"
import type {
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
  GenerateTextResult,
  ResolvedAIModelConfig,
} from "../types"

type JsonObjectResponseFormat = { type: "json_object" }

function wantsJsonOutput(options: GenerateTextOptions): boolean {
  return Boolean(options.jsonSchema || options.jsonMode)
}

export class NineRouterModel extends BaseAIModel {
  readonly provider = "ninerouter" as const

  private readonly client: OpenAI

  constructor(config: ResolvedAIModelConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    const jsonRequested = wantsJsonOutput(options)

    try {
      return await this.completeText(
        options,
        jsonRequested ? { type: "json_object" } : undefined
      )
    } catch (error) {
      if (!jsonRequested) {
        throw new AIModelError(
          "NineRouter text generation failed.",
          this.provider,
          error
        )
      }

      try {
        return await this.completeText(options)
      } catch (retryError) {
        throw new AIModelError(
          "NineRouter text generation failed.",
          this.provider,
          retryError
        )
      }
    }
  }

  async generateImage(
    _options: GenerateImageOptions
  ): Promise<GenerateImageResult> {
    throw new AIModelError(
      "NineRouter does not support image generation in this app.",
      this.provider
    )
  }

  private async completeText(
    options: GenerateTextOptions,
    responseFormat?: JsonObjectResponseFormat
  ): Promise<GenerateTextResult> {
    const response = await this.client.chat.completions.create({
      model: this.textModel,
      messages: options.messages as ChatCompletionMessageParam[],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: responseFormat,
      stream: false,
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
  }
}
