// Load OpenAI / GenAI OpenTelemetry instrumentation before Inngest or openai imports.
import "@inngest/otel/node"

import { serve } from "inngest/next"

import { inngest } from "@/inngest/client"
import { generateStorybookWorkflow } from "@/inngest/functions"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateStorybookWorkflow],
})
