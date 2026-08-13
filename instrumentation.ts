/**
 * Loads OpenTelemetry (including OpenAI GenAI spans) before app modules run.
 * Required for Inngest AI metadata extraction (`aiMetadata: true`).
 * Does not enable Extended Traces — that needs separate middleware.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@inngest/otel/node")
  }
}
