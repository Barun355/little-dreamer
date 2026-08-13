import type { AIMessage, JsonSchemaResponseFormat } from "./types"

const JSON_ONLY_RULES = `You are a structured JSON generator.

Output rules (mandatory):
- Respond with raw JSON only.
- Do not wrap the JSON in markdown or code fences.
- Do not use \`\`\`json or \`\`\` anywhere in the response.
- Do not add explanations, labels, comments, or any text before or after the JSON.
- The root value must be a JSON object matching the required schema exactly.
- Use the exact property names from the schema and example (camelCase). Never use snake_case such as page_number, child_name, or base_story.
- Do not include extra keys beyond the schema.`

export const GENERATED_STORY_EXAMPLE = {
  title: "Maya and the Moonlit Forest",
  baseStory:
    "Curious seven-year-old Maya follows glowing fireflies into an enchanted forest where friendly animals share bedtime stories beneath the stars.",
  pages: [
    {
      pageNumber: 1,
      text: "On a soft summer evening, Maya noticed tiny golden lights dancing above the garden gate. She slipped on her red boots and followed the fireflies down the lane, heart beating with happy curiosity.",
    },
    {
      pageNumber: 2,
      text: "The path led into a forest where the trees whispered her name. Fireflies formed a glowing trail over mossy stones, guiding Maya toward a hidden clearing filled with warm lantern light.",
    },
    {
      pageNumber: 3,
      text: "In the clearing, a gentle deer, a sleepy owl, and a cheerful fox welcomed Maya to their moonlit circle. They invited her to sit on a soft stump and listen to stories carried by the night breeze.",
    },
    {
      pageNumber: 4,
      text: "Maya shared her own story about helping her little brother build a blanket fort. The animals clapped their paws and wings, and the fireflies swirled above her like sparkling applause.",
    },
    {
      pageNumber: 5,
      text: "When the moon climbed high, Maya waved goodbye and followed the fireflies home. She climbed into bed with a smile, knowing the forest friends would be waiting for her next adventure.",
    },
  ],
} as const

export const IMAGE_PROMPT_LIST_EXAMPLE = {
  prompts: [
    {
      slot: "frontCover",
      prompt:
        "Children's storybook cover illustration of Maya, a seven-year-old girl with curly dark hair and a yellow raincoat, standing at a glowing forest entrance at dusk. Preserve the child's exact facial identity from the reference photo. Warm watercolor style, magical fireflies, no text.",
    },
    {
      slot: "page1",
      prompt:
        "Storybook illustration of Maya in red boots walking along a village lane at twilight, following golden fireflies. Preserve the child's exact facial identity from the reference photo. Soft watercolor, cozy and whimsical, no text.",
    },
    {
      slot: "page2",
      prompt:
        "Storybook illustration of Maya entering a moonlit forest with fireflies lighting a mossy path. Preserve the child's exact facial identity from the reference photo. Gentle watercolor style, no text.",
    },
    {
      slot: "page3",
      prompt:
        "Storybook illustration of Maya sitting with a deer, owl, and fox in a lantern-lit forest clearing. Preserve the child's exact facial identity from the reference photo. Warm watercolor, no text.",
    },
    {
      slot: "page4",
      prompt:
        "Storybook illustration of Maya happily telling a story to forest animals while fireflies sparkle overhead. Preserve the child's exact facial identity from the reference photo. Soft watercolor, no text.",
    },
    {
      slot: "page5",
      prompt:
        "Storybook illustration of Maya walking home under the moon with fireflies guiding her. Preserve the child's exact facial identity from the reference photo. Gentle watercolor bedtime mood, no text.",
    },
    {
      slot: "backCover",
      prompt:
        "Children's storybook back cover illustration of Maya waving from her bedroom window as fireflies drift toward the distant forest. Preserve the child's exact facial identity from the reference photo. Soft watercolor, peaceful closing scene, no text.",
    },
  ],
} as const

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
}): AIMessage[] {
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

export const GENERATED_STORY_JSON_SCHEMA: JsonSchemaResponseFormat = {
  name: "generated_story",
  strict: true,
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      baseStory: { type: "string" },
      pages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pageNumber: { type: "integer", minimum: 1, maximum: 5 },
            text: { type: "string" },
          },
          required: ["pageNumber", "text"],
          additionalProperties: false,
        },
        minItems: 5,
        maxItems: 5,
      },
    },
    required: ["title", "baseStory", "pages"],
    additionalProperties: false,
  },
}

export const IMAGE_PROMPT_LIST_JSON_SCHEMA: JsonSchemaResponseFormat = {
  name: "image_prompt_list",
  strict: true,
  schema: {
    type: "object",
    properties: {
      prompts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            slot: {
              type: "string",
              enum: [
                "frontCover",
                "page1",
                "page2",
                "page3",
                "page4",
                "page5",
                "backCover",
              ],
            },
            prompt: { type: "string", minLength: 20 },
          },
          required: ["slot", "prompt"],
          additionalProperties: false,
        },
        minItems: 7,
        maxItems: 7,
      },
    },
    required: ["prompts"],
    additionalProperties: false,
  },
}
