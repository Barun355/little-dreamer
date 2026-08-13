export type AIProviderId = "openai" | "ninerouter"

export type AIMessageRole = "system" | "user" | "assistant"

export type AITextContentPart = {
  type: "text"
  text: string
}

export type AIImageUrlContentPart = {
  type: "image_url"
  image_url: {
    url: string
    detail?: "auto" | "low" | "high"
  }
}

export type AIMessageContentPart = AITextContentPart | AIImageUrlContentPart

export type AIMessageContent = string | AIMessageContentPart[]

export interface AIMessage {
  role: AIMessageRole
  content: AIMessageContent
}

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface JsonSchemaResponseFormat {
  name: string
  schema: Record<string, unknown>
  strict?: boolean
}

export interface GenerateTextOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  jsonSchema?: JsonSchemaResponseFormat
}

export interface GenerateTextResult {
  text: string
  usage?: TokenUsage
  raw?: unknown
}

export type ImageSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1792x1024"
  | "1024x1792"
  | "1536x1024"
  | "1024x1536"
  | "auto"

export type ImageQuality =
  | "standard"
  | "hd"
  | "low"
  | "medium"
  | "high"
  | "auto"

export type ReferenceImageInput = {
  base64: string
  contentType: string
}

export interface GenerateImageOptions {
  prompt: string
  size?: ImageSize
  quality?: ImageQuality
  n?: number
  /** Child photo (or other reference) for gpt-image edits. */
  referenceImage?: ReferenceImageInput
}

export interface GeneratedImage {
  url?: string
  b64Json?: string
}

export interface GenerateImageResult {
  images: GeneratedImage[]
  raw?: unknown
}

export interface AIModelConfig {
  provider: AIProviderId
  apiKey: string
  textModel?: string
  imageModel?: string
  baseUrl?: string
}

export interface ResolvedAIModelConfig extends AIModelConfig {
  textModel: string
  imageModel: string
}
