import { createConfigFromEnv } from "@/orchestrator/config"
import {
  DEFAULT_PIPELINE_CONFIG,
  storybookPipelineConfigSchema,
  type StorybookPipelineConfig,
} from "@/harness/config"
import { getServerEnv } from "@/lib/env"

/**
 * Resolve text/image providers from env into a full pipeline config with API keys.
 * Kept in inngest so harness never reads process.env.
 */
export function loadPipelineConfig(): StorybookPipelineConfig {
  const env = getServerEnv()

  const textProvider =
    env.STORYBOOK_TEXT_PROVIDER ?? DEFAULT_PIPELINE_CONFIG.text.provider
  const imageProvider =
    env.STORYBOOK_IMAGE_PROVIDER ?? DEFAULT_PIPELINE_CONFIG.image.provider

  const textConfig = createConfigFromEnv(textProvider)
  const imageConfig = createConfigFromEnv(imageProvider)

  return storybookPipelineConfigSchema.parse({
    harnessVersion: "v1",
    text: {
      provider: textProvider,
      model:
        env.STORYBOOK_TEXT_MODEL ??
        textConfig.textModel ??
        DEFAULT_PIPELINE_CONFIG.text.model,
      apiKey: textConfig.apiKey,
      baseUrl: textConfig.baseUrl,
    },
    image: {
      provider: imageProvider,
      model: env.STORYBOOK_IMAGE_MODEL ?? DEFAULT_PIPELINE_CONFIG.image.model,
      apiKey: imageConfig.apiKey,
    },
  })
}
