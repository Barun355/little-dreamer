import OpenAI, { toFile } from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

import { AIModelError } from "../errors"
import { BaseAIModel } from "../base/base-model"
import type {
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
  GenerateTextResult,
  ImageQuality,
  ResolvedAIModelConfig,
} from "../types"

function resolveResponseFormat(options: GenerateTextOptions) {
  if (options.jsonSchema) {
    return {
      type: "json_schema" as const,
      json_schema: {
        name: options.jsonSchema.name,
        schema: options.jsonSchema.schema,
        strict: options.jsonSchema.strict ?? true,
      },
    }
  }

  if (options.jsonMode) {
    return { type: "json_object" as const }
  }

  return undefined
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes("png")) {
    return "png"
  }

  if (contentType.includes("webp")) {
    return "webp"
  }

  return "jpg"
}

function resolveGptImageQuality(
  quality?: ImageQuality
): "low" | "medium" | "high" | "auto" | "standard" {
  if (quality === "hd" || quality === "high") {
    return "high"
  }

  if (quality === "low") {
    return "low"
  }

  if (quality === "auto") {
    return "auto"
  }

  if (quality === "standard") {
    return "standard"
  }

  return "medium"
}

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
        messages: options.messages as ChatCompletionMessageParam[],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: resolveResponseFormat(options),
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

  async generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    if (!options.referenceImage) {
      throw new AIModelError(
        "referenceImage is required for storybook image generation.",
        this.provider
      )
    }

    try {
      return await this.editImageWithReference(options)
    } catch (error) {
      if (error instanceof AIModelError) {
        throw error
      }

      throw new AIModelError("OpenAI image generation failed.", this.provider, error)
    }
  }

  private async editImageWithReference(
    options: GenerateImageOptions
  ): Promise<GenerateImageResult> {
    const reference = options.referenceImage

    if (!reference) {
      throw new AIModelError(
        "referenceImage is required for image edits.",
        this.provider
      )
    }

    const extension = extensionForContentType(reference.contentType)
    const imageFile = await toFile(
      Buffer.from(reference.base64, "base64"),
      `child-photo.${extension}`,
      { type: reference.contentType }
    )

    const response = await this.client.images.edit({
      model: this.imageModel,
      image: imageFile,
      prompt: options.prompt,
      size: (options.size ?? "1024x1024") as
        | "1024x1024"
        | "1024x1536"
        | "1536x1024"
        | "auto",
      quality: resolveGptImageQuality(options.quality),
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
  }
}
