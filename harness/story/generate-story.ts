import {
  buildStructuredJsonMessages,
  type JsonSchemaResponseFormat,
} from "@/lib/json-output"

import { buildCharacterSheetHints } from "../character/build-character-sheet"
import type {
  BuildStoryGenerationParams,
  HarnessMessage,
  StoryGenerationRequest,
} from "../types"

export const GENERATED_STORY_WITH_CHARACTER_EXAMPLE = {
  title: "Maya and the Moonlit Forest",
  coverSubtitle: "A bedtime adventure with glowing fireflies",
  baseStory:
    "Curious seven-year-old Maya follows glowing fireflies into an enchanted forest where friendly animals share bedtime stories beneath the stars.",
  backCoverBlurb: "The End — sweet dreams, Maya!",
  character: {
    name: "Maya",
    visualDescription:
      "A seven-year-old girl with curly dark brown hair, warm medium-brown skin, bright curious eyes, wearing a yellow raincoat over a soft cream sweater, red rain boots, and a small backpack",
  },
  pages: [
    {
      pageNumber: 1,
      text: "On a soft summer evening, Maya noticed tiny golden lights dancing above the garden gate. She slipped on her red boots and followed the fireflies down the lane, heart beating with happy curiosity.",
      sceneDescription:
        "Standing at a garden gate at twilight, reaching toward tiny golden fireflies dancing above the path",
      dialogueBubble: "Look! Tiny golden lights!",
    },
    {
      pageNumber: 2,
      text: "The path led into a forest where the trees whispered her name. Fireflies formed a glowing trail over mossy stones, guiding Maya toward a hidden clearing filled with warm lantern light.",
      sceneDescription:
        "Entering a moonlit forest path with fireflies lighting mossy stones toward a lantern-lit clearing",
      dialogueBubble: "The trees know my name!",
    },
    {
      pageNumber: 3,
      text: "In the clearing, a gentle deer, a sleepy owl, and a cheerful fox welcomed Maya to their moonlit circle. They invited her to sit on a soft stump and listen to stories carried by the night breeze.",
      sceneDescription:
        "Sitting on a soft stump in a lantern-lit forest clearing with a deer, owl, and fox gathered nearby",
      dialogueBubble: "Welcome to our circle!",
    },
    {
      pageNumber: 4,
      text: "Maya shared her own story about helping her little brother build a blanket fort. The animals clapped their paws and wings, and the fireflies swirled above her like sparkling applause.",
      sceneDescription:
        "Happily telling a story to forest animals while fireflies swirl overhead like sparkling applause",
      dialogueBubble: "I built a blanket fort!",
    },
    {
      pageNumber: 5,
      text: "When the moon climbed high, Maya waved goodbye and followed the fireflies home. She climbed into bed with a smile, knowing the forest friends would be waiting for her next adventure.",
      sceneDescription:
        "Walking home under a high moon with fireflies guiding the way toward a cozy bedroom window",
      dialogueBubble: "Goodnight, forest friends!",
    },
  ],
} as const

export const GENERATED_STORY_WITH_CHARACTER_JSON_SCHEMA: JsonSchemaResponseFormat =
  {
    name: "generated_story_with_character",
    strict: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        coverSubtitle: { type: "string" },
        baseStory: { type: "string" },
        backCoverBlurb: { type: "string" },
        character: {
          type: "object",
          properties: {
            name: { type: "string" },
            visualDescription: { type: "string" },
          },
          required: ["name", "visualDescription"],
          additionalProperties: false,
        },
        pages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pageNumber: { type: "integer", minimum: 1, maximum: 5 },
              text: { type: "string" },
              sceneDescription: { type: "string" },
              dialogueBubble: { type: "string" },
            },
            required: [
              "pageNumber",
              "text",
              "sceneDescription",
              "dialogueBubble",
            ],
            additionalProperties: false,
          },
          minItems: 5,
          maxItems: 5,
        },
      },
      required: [
        "title",
        "coverSubtitle",
        "baseStory",
        "backCoverBlurb",
        "character",
        "pages",
      ],
      additionalProperties: false,
    },
  }

export function buildStoryUserPrompt(params: BuildStoryGenerationParams): string {
  const characterHints = buildCharacterSheetHints({
    childName: params.childName,
    childAge: params.childAge,
    themeTitle: params.theme.title,
    hasAttachedPhoto: Boolean(params.photo),
  })

  return `Create a personalized children's bedtime storybook for ${params.childName}, age ${params.childAge}.

Theme title: ${params.theme.title}
Theme direction: ${params.theme.baseStory}

${characterHints}

Story rules:
- ${params.childName} must be the hero in every page.
- Language must be warm, age-appropriate, magical, and bedtime-friendly.
- Each page should be 2-4 sentences.
- Provide exactly 5 pages numbered 1 through 5.
- End with a soft, peaceful closing tone on page 5 and in baseStory.
- title must feel like a premium storybook cover title (include the child's name when natural).
- coverSubtitle must be a short tagline (about 4-10 words) for the front cover under the title.
- backCoverBlurb must be a short playful closing line or "The End" blurb for the back cover (one short sentence).
- For each page, sceneDescription must describe ONLY action and setting — never restate hair, skin, clothes, or face details.
- For each page, dialogueBubble must be a short spoken or thought line (max 12 words) that can appear in a speech bubble near the speaker's mouth; use the hero or another speaking character as appropriate.`
}

function attachPhotoToUserMessage(
  messages: HarnessMessage[],
  photo: { base64: string; contentType: string }
): HarnessMessage[] {
  const lastIndex = messages.length - 1
  const lastMessage = messages[lastIndex]

  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Story generation request is missing a user message.")
  }

  const text =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : lastMessage.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n")

  const withPhoto: HarnessMessage = {
    role: "user",
    content: [
      { type: "text", text },
      {
        type: "image_url",
        image_url: {
          url: `data:${photo.contentType};base64,${photo.base64}`,
          detail: "high",
        },
      },
    ],
  }

  return [...messages.slice(0, lastIndex), withPhoto]
}

export function buildStoryGenerationRequest(
  params: BuildStoryGenerationParams
): StoryGenerationRequest {
  const baseMessages = buildStructuredJsonMessages({
    schemaName: GENERATED_STORY_WITH_CHARACTER_JSON_SCHEMA.name,
    taskDescription:
      "Write a personalized five-page children's storybook as structured JSON, including a locked character visual sheet, cover title/subtitle, back-cover blurb, per-page scene descriptions, and short speech-bubble dialogue lines.",
    example: GENERATED_STORY_WITH_CHARACTER_EXAMPLE,
    userPrompt: buildStoryUserPrompt(params),
  }) as HarnessMessage[]

  const messages = params.photo
    ? attachPhotoToUserMessage(baseMessages, params.photo)
    : baseMessages

  return {
    messages,
    jsonSchema: GENERATED_STORY_WITH_CHARACTER_JSON_SCHEMA,
  }
}
