export type AIProviderId = "openai"

export type AIMessageRole = "system" | "user" | "assistant"

export interface AIMessage {
  role: AIMessageRole
  content: string
}

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface GenerateTextOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface GenerateTextResult {
  text: string
  usage?: TokenUsage
  raw?: unknown
}

export interface StreamTextOptions extends GenerateTextOptions {}

export interface TextStreamChunk {
  text: string
  done?: boolean
}

export type ImageSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1792x1024"
  | "1024x1792"

export interface GenerateImageOptions {
  prompt: string
  size?: ImageSize
  quality?: "standard" | "hd"
  n?: number
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
