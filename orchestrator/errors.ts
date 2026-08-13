import type { AIProviderId } from "./types"

export class AIModelError extends Error {
  constructor(
    message: string,
    readonly provider?: AIProviderId,
    readonly cause?: unknown
  ) {
    super(message)
    this.name = "AIModelError"
  }
}

export class AIProviderError extends AIModelError {
  constructor(message: string, provider?: AIProviderId, cause?: unknown) {
    super(message, provider, cause)
    this.name = "AIProviderError"
  }
}
