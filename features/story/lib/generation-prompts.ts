import type { GeneratedStory, ImagePrompt } from "@/types/schemas"
import type { StoryThemeOption } from "@/features/story/constants/themes"

export function buildStoryGenerationPrompt(params: {
  childName: string
  childAge: number
  theme: StoryThemeOption
}) {
  return `Create a personalized children's storybook for ${params.childName}, age ${params.childAge}.

Theme title: ${params.theme.title}
Theme direction: ${params.theme.baseStory}

Return JSON with this exact shape:
{
  "title": "story title",
  "baseStory": "one paragraph summary",
  "pages": [
    { "pageNumber": 1, "text": "page text" },
    { "pageNumber": 2, "text": "page text" },
    { "pageNumber": 3, "text": "page text" },
    { "pageNumber": 4, "text": "page text" },
    { "pageNumber": 5, "text": "page text" }
  ]
}

Rules:
- ${params.childName} must be the hero in every page.
- Language must be warm, age-appropriate, and magical.
- Each page should be 2-4 sentences.
- Do not include markdown or extra keys.`
}

export function buildImagePromptGenerationPrompt(params: {
  childName: string
  childAge: number
  photoUrl: string
  theme: StoryThemeOption
  story: GeneratedStory
}) {
  return `You are creating image generation prompts for a personalized children's storybook.

Child hero: ${params.childName}, age ${params.childAge}
Reference photo URL: ${params.photoUrl}
Theme: ${params.theme.title}
Story summary: ${params.story.baseStory}

Story pages:
${params.story.pages.map((page) => `Page ${page.pageNumber}: ${page.text}`).join("\n")}

Return JSON with exactly 7 prompts in this shape:
{
  "prompts": [
    { "slot": "frontCover", "prompt": "..." },
    { "slot": "page1", "prompt": "..." },
    { "slot": "page2", "prompt": "..." },
    { "slot": "page3", "prompt": "..." },
    { "slot": "page4", "prompt": "..." },
    { "slot": "page5", "prompt": "..." },
    { "slot": "backCover", "prompt": "..." }
  ]
}

Rules for every prompt:
- Describe ${params.childName} as the main character with the exact same face, hair, skin tone, and likeness as the reference photo.
- Explicitly say: "Preserve the child's exact facial identity from the reference photo."
- Use a consistent children's storybook illustration style.
- Include the theme setting and page-specific action.
- No text overlays, no watermarks, no collage, no split panels.
- Each prompt must be precise, visual, and self-contained.`
}

export function getImagePromptForSlot(
  prompts: ImagePrompt[],
  slot: ImagePrompt["slot"]
) {
  const prompt = prompts.find((item) => item.slot === slot)

  if (!prompt) {
    throw new Error(`Missing image prompt for ${slot}.`)
  }

  return prompt.prompt
}
