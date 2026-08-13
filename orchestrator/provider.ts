import { createConfigFromEnv, resolveModelConfig } from "./config"
import { AIProviderError } from "./errors"
import { NineRouterModel } from "./models/ninerouter-model"
import { OpenAIModel } from "./models/openai-model"
import type { AIModelConfig, AIProviderId } from "./types"
import type { BaseAIModel } from "./base/base-model"

export class AIProvider {
  create(config: AIModelConfig): BaseAIModel {
    const resolved = resolveModelConfig(config)

    switch (resolved.provider) {
      case "openai":
        return new OpenAIModel(resolved)
      case "ninerouter":
        return new NineRouterModel(resolved)
      default: {
        const unsupported: never = resolved.provider
        throw new AIProviderError(`Unsupported AI provider: ${unsupported}`)
      }
    }
  }

  createFromEnv(provider: AIProviderId = "openai"): BaseAIModel {
    return this.create(createConfigFromEnv(provider))
  }

  static create(config: AIModelConfig): BaseAIModel {
    return new AIProvider().create(config)
  }

  static createFromEnv(provider: AIProviderId = "openai"): BaseAIModel {
    return new AIProvider().createFromEnv(provider)
  }
}
