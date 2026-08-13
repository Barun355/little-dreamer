import { z } from "zod"

import { getStoryThemeById } from "@/features/story/constants/themes"
import {
  buildImagePromptGenerationPrompt,
  buildStoryGenerationPrompt,
  getImagePromptForSlot,
} from "@/features/story/lib/generation-prompts"
import { storybookGenerationEventSchema } from "@/features/story/schemas"
import {
  buildStructuredJsonMessages,
  GENERATED_STORY_EXAMPLE,
  GENERATED_STORY_JSON_SCHEMA,
  IMAGE_PROMPT_LIST_EXAMPLE,
  IMAGE_PROMPT_LIST_JSON_SCHEMA,
  parseJsonModelOutput,
} from "@/orchestrator"
import {
  orchestratorGenerateImage,
  orchestratorGenerateText,
} from "@/inngest/lib/orchestrator-steps"
import { prisma } from "@/lib/db"
import { uploadChildPhoto, uploadImageFromUrl, uploadStoryImage } from "@/lib/r2"
import { parseInput, parseOutput } from "@/lib/validation"
import {
  completedStorybookResourcesSchema,
  imagePromptListSchema,
  storybookStoryContentSchema,
} from "@/types/schemas"

import { inngest, STORYBOOK_GENERATION_REQUESTED } from "../client"

const IMAGE_SLOTS = [
  "frontCover",
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "backCover",
] as const

const imagePromptResponseSchema = z.object({
  prompts: imagePromptListSchema,
})

async function markStorybookFailed(storybookId: string) {
  await prisma.storybook.updateMany({
    where: { id: storybookId },
    data: { status: "FAILED" },
  })
}

export const generateStorybookWorkflow = inngest.createFunction(
  {
    id: "generate-storybook",
    triggers: { event: STORYBOOK_GENERATION_REQUESTED },
    onFailure: async ({ event }) => {
      const parsed = storybookGenerationEventSchema.safeParse(
        (event.data as { event?: { data?: unknown } }).event?.data
      )

      if (parsed.success) {
        await markStorybookFailed(parsed.data.storybookId)
      }
    },
  },
  async ({ event, step }) => {
    const payload = parseInput(storybookGenerationEventSchema, event.data)
    const theme = getStoryThemeById(payload.themeId)

    if (!theme) {
      throw new Error("Invalid story theme.")
    }

    const photoUrl = await step.run("upload-child-photo-to-r2", async () => {
      const buffer = Buffer.from(payload.photo.base64, "base64")

      return uploadChildPhoto({
        storybookId: payload.storybookId,
        buffer,
        contentType: payload.photo.contentType,
        fileName: payload.photo.fileName,
      })
    })

    await step.run("save-storybook-to-database", async () => {
      await prisma.storybook.update({
        where: { id: payload.storybookId },
        data: {
          childName: payload.childName,
          childAge: payload.childAge,
          photoUrl,
          theme: {
            title: theme.title,
            baseStory: theme.baseStory,
          },
          status: "GENERATING",
        },
      })
    })

    const storyResponse = await step.ai.wrap(
      "generate-story-content",
      orchestratorGenerateText,
      {
        messages: buildStructuredJsonMessages({
          schemaName: GENERATED_STORY_JSON_SCHEMA.name,
          taskDescription:
            "Write a personalized five-page children's storybook as structured JSON.",
          example: GENERATED_STORY_EXAMPLE,
          userPrompt: buildStoryGenerationPrompt({
            childName: payload.childName,
            childAge: payload.childAge,
            theme,
          }),
        }),
        jsonSchema: GENERATED_STORY_JSON_SCHEMA,
      }
    )

    const story = parseOutput(
      storybookStoryContentSchema,
      parseJsonModelOutput(storyResponse.text),
      "Story generation returned invalid JSON."
    )

    await step.run("persist-generated-story", async () => {
      await prisma.storybook.update({
        where: { id: payload.storybookId },
        data: {
          resources: {
            story: {
              title: story.title,
              baseStory: story.baseStory,
              pages: story.pages,
            },
          },
        },
      })
    })

    const promptResponse = await step.ai.wrap(
      "generate-image-prompts",
      orchestratorGenerateText,
      {
        messages: buildStructuredJsonMessages({
          schemaName: IMAGE_PROMPT_LIST_JSON_SCHEMA.name,
          taskDescription:
            "Create seven precise image-generation prompts for a children's storybook as structured JSON.",
          example: IMAGE_PROMPT_LIST_EXAMPLE,
          userPrompt: buildImagePromptGenerationPrompt({
            childName: payload.childName,
            childAge: payload.childAge,
            photoUrl,
            theme,
            story,
          }),
        }),
        jsonSchema: IMAGE_PROMPT_LIST_JSON_SCHEMA,
      }
    )

    const promptPayload = parseOutput(
      imagePromptResponseSchema,
      parseJsonModelOutput(promptResponse.text),
      "Image prompt generation returned invalid JSON."
    )

    const generatedImages = await Promise.all(
      IMAGE_SLOTS.map((slot) =>
        step.ai.wrap(`generate-image-${slot}`, orchestratorGenerateImage, {
          prompt: getImagePromptForSlot(promptPayload.prompts, slot),
          size: "1024x1024",
          quality: "standard",
          n: 1,
        })
      )
    )

    const uploadedImages = await Promise.all(
      IMAGE_SLOTS.map((slot, index) =>
        step.run(`store-image-${slot}`, async () => {
          const image = generatedImages[index]?.images[0]

          if (!image) {
            throw new Error(`Orchestrator did not return an image for ${slot}.`)
          }

          if (image.url) {
            return uploadImageFromUrl({
              storybookId: payload.storybookId,
              slot,
              imageUrl: image.url,
            })
          }

          if (image.b64Json) {
            return uploadStoryImage({
              storybookId: payload.storybookId,
              slot,
              buffer: Buffer.from(image.b64Json, "base64"),
            })
          }

          throw new Error(`Orchestrator returned no image URL or data for ${slot}.`)
        })
      )
    )

    const resources = parseOutput(completedStorybookResourcesSchema, {
      story: {
        title: story.title,
        baseStory: story.baseStory,
        pages: story.pages,
      },
      story_images: {
        frontCover: uploadedImages[0],
        backCover: uploadedImages[6],
        stories: uploadedImages.slice(1, 6),
      },
    })

    await step.run("save-storybook-resources", async () => {
      await prisma.storybook.update({
        where: { id: payload.storybookId },
        data: {
          resources,
          status: "COMPLETED",
        },
      })
    })

    return {
      storybookId: payload.storybookId,
      photoUrl,
      resources,
      status: "COMPLETED",
    }
  }
)
