import { createConfigFromEnv, resolveModelConfig } from "./config"
import { OpenAIModel } from "./models/openai-model"
import type { AIModelConfig } from "./types"
import type { BaseAIModel } from "./base/base-model"

export class AIProvider {
  create(config: AIModelConfig): BaseAIModel {
    return new OpenAIModel(resolveModelConfig(config))
  }

  createFromEnv(): BaseAIModel {
    return this.create(createConfigFromEnv())
  }

  static create(config: AIModelConfig): BaseAIModel {
    return new AIProvider().create(config)
  }

  static createFromEnv(): BaseAIModel {
    return new AIProvider().createFromEnv()
  }
}
