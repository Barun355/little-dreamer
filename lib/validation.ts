import { z } from "zod"

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ")
}

export function parseInput<T extends z.ZodType>(
  schema: T,
  data: unknown,
  fallbackMessage = "Invalid input"
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(formatZodError(result.error) || fallbackMessage)
  }

  return result.data
}

export function parseOutput<T extends z.ZodType>(
  schema: T,
  data: unknown,
  fallbackMessage = "Invalid output"
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(formatZodError(result.error) || fallbackMessage)
  }

  return result.data
}

export function safeParseOutput<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> | null {
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}
