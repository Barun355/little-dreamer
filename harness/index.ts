import { assembleImagePrompts } from "./prompts/assemble-image-prompts"
import { buildStoryGenerationRequest } from "./story/generate-story"
import { parseStoryOutput } from "./story/normalize-story"
import type {
  AssembleImagePromptsParams,
  AssembledImagePrompt,
  BuildStoryGenerationParams,
  StoryBundle,
  StoryGenerationRequest,
} from "./types"

export {
  DEFAULT_PIPELINE_CONFIG,
  storybookPipelineConfigSchema,
  type StorybookPipelineConfig,
} from "./config"
export { harnessStoryBundleSchema } from "./schemas"
export type {
  AssembleImagePromptsParams,
  AssembledImagePrompt,
  BuildStoryGenerationParams,
  PhotoInput,
  StoryBundle,
  StoryCharacter,
  StoryGenerationRequest,
  StoryPageWithScene,
  StoryThemeInput,
} from "./types"

export class StoryHarness {
  buildStoryGenerationRequest(
    params: BuildStoryGenerationParams
  ): StoryGenerationRequest {
    return buildStoryGenerationRequest(params)
  }

  parseStoryOutput(
    rawText: string,
    options?: { fallbackChildName?: string }
  ): StoryBundle {
    return parseStoryOutput(rawText, options)
  }

  assembleImagePrompts(
    params: AssembleImagePromptsParams
  ): AssembledImagePrompt[] {
    return assembleImagePrompts(params)
  }
}
