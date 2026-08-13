export type JsonOutputMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type JsonSchemaResponseFormat = {
  name: string
  schema: Record<string, unknown>
  strict?: boolean
}

const JSON_ONLY_RULES = `You are a structured JSON generator.

Output rules (mandatory):
- Respond with raw JSON only.
- Do not wrap the JSON in markdown or code fences.
- Do not use \`\`\`json or \`\`\` anywhere in the response.
- Do not add explanations, labels, comments, or any text before or after the JSON.
- The root value must be a JSON object matching the required schema exactly.
- Use the exact property names from the schema and example (camelCase). Never use snake_case such as page_number, child_name, or base_story.
- Do not include extra keys beyond the schema.`

export function buildJsonOnlySystemPrompt(params: {
  schemaName: string
  taskDescription: string
  example: Record<string, unknown>
}): string {
  return `${JSON_ONLY_RULES}

Schema name: ${params.schemaName}
Task: ${params.taskDescription}

Required property names (use exactly as written):
${Object.keys(params.example)
  .map((key) => `- ${key}`)
  .join("\n")}

Dummy example (structure and key names only — replace all values with content for the current request):
${JSON.stringify(params.example, null, 2)}`
}

export function buildStructuredJsonMessages(params: {
  schemaName: string
  taskDescription: string
  userPrompt: string
  example: Record<string, unknown>
}): JsonOutputMessage[] {
  return [
    {
      role: "system",
      content: buildJsonOnlySystemPrompt({
        schemaName: params.schemaName,
        taskDescription: params.taskDescription,
        example: params.example,
      }),
    },
    {
      role: "user",
      content: params.userPrompt,
    },
  ]
}

export function parseJsonModelOutput<T = unknown>(raw: string): T {
  const trimmed = raw.trim()

  if (!trimmed) {
    throw new Error("Model returned an empty response.")
  }

  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed

  try {
    return JSON.parse(candidate) as T
  } catch (error) {
    const jsonStart = candidate.indexOf("{")
    const jsonEnd = candidate.lastIndexOf("}")

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(candidate.slice(jsonStart, jsonEnd + 1)) as T
      } catch {
        // fall through to original error
      }
    }

    throw new Error(
      `Model response is not valid JSON: ${error instanceof Error ? error.message : "Unknown parse error"}`
    )
  }
}
