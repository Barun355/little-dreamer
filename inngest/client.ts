import { Inngest } from "inngest"

/**
 * AI metadata extraction is enabled (SDK default). With `@inngest/otel` loaded
 * before openai imports, GenAI span attrs (tokens, model, provider) attach as
 * `inngest.ai` on each step. Extended Traces middleware is intentionally omitted.
 */
export const inngest = new Inngest({
  id: "little-dreamer",
  aiMetadata: true,
})

export const STORYBOOK_GENERATION_REQUESTED = "storybook/generation.requested"
