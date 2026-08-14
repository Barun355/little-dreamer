import { getStoryThemeById } from "@/features/story/constants/themes"
import { storybookGenerationEventSchema } from "@/features/story/schemas"
import { StoryHarness } from "@/harness"
import { StorybookRunner } from "@/harness/runner"
import { loadPipelineConfig } from "@/inngest/lib/pipeline-config"
import { prisma } from "@/lib/db"
import { sendStorybookReadyEmail } from "@/lib/email/storybook-ready"
import { uploadChildPhoto, uploadStoryImage } from "@/lib/r2"
import { assertStorybookWithinDailyQuota } from "@/lib/subscription"
import { parseInput, parseOutput } from "@/lib/validation"
import type { GenerateImageOptions, ReferenceImageInput } from "@/orchestrator"
import {
  completedStorybookResourcesSchema,
  type ImagePromptSlot,
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
] as const satisfies readonly ImagePromptSlot[]

type GenerateAndStoreImageInput = {
  prompt: string
  referenceImage: ReferenceImageInput
  username: string
  storybookId: string
  slot: ImagePromptSlot
  size: NonNullable<GenerateImageOptions["size"]>
  quality: NonNullable<GenerateImageOptions["quality"]>
  n: number
}

type GenerateAndStoreImageResult = {
  url: string
}

async function markStorybookFailed(storybookId: string) {
  await prisma.storybook.updateMany({
    where: {
      id: storybookId,
      status: {
        not: "COMPLETED",
      },
    },
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

    await step.run("check-subscription-quota", async () => {
      await assertStorybookWithinDailyQuota(payload.userId, payload.storybookId)
    })

    const theme = getStoryThemeById(payload.themeId)

    if (!theme) {
      throw new Error("Invalid story theme.")
    }

    const harness = new StoryHarness()
    // Load outside step.run so API keys are not persisted in Inngest step state.
    const runner = new StorybookRunner(loadPipelineConfig())

    const photoInput: ReferenceImageInput = {
      base64: payload.photo.base64,
      contentType: payload.photo.contentType,
    }

    /**
     * Generate with OpenAI then upload to R2 in the same durable step.
     * Returns only a small URL (+ usage) so Inngest never memoizes multi-MB base64.
     */
    async function generateAndStoreStoryImage(
      input: GenerateAndStoreImageInput
    ): Promise<GenerateAndStoreImageResult> {
      const result = await runner.generateImage({
        prompt: input.prompt,
        referenceImage: input.referenceImage,
        size: input.size,
        quality: input.quality,
        n: input.n,
      })

      const image = result.images[0]

      if (!image) {
        throw new Error(
          `Orchestrator did not return an image for ${input.slot}.`
        )
      }

      let buffer: Buffer
      let contentType = "image/png"

      if (image.b64Json) {
        buffer = Buffer.from(image.b64Json, "base64")
      } else if (image.url) {
        const response = await fetch(image.url)

        if (!response.ok) {
          throw new Error(
            `Failed to download generated image for ${input.slot}.`
          )
        }

        buffer = Buffer.from(await response.arrayBuffer())
        contentType = response.headers.get("content-type") ?? "image/png"
      } else {
        throw new Error(
          `Orchestrator returned no image URL or data for ${input.slot}.`
        )
      }

      const url = await uploadStoryImage({
        username: input.username,
        storybookId: input.storybookId,
        slot: input.slot,
        buffer,
        contentType,
      })

      return { url }
    }

    const photoUrl = await step.run("upload-child-photo-to-r2", async () => {
      const buffer = Buffer.from(payload.photo.base64, "base64")

      return uploadChildPhoto({
        username: payload.username,
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

    const storyRequest = harness.buildStoryGenerationRequest({
      childName: payload.childName,
      childAge: payload.childAge,
      theme: {
        title: theme.title,
        baseStory: theme.baseStory,
      },
      photo: photoInput,
      photoUrl,
    })

    const storyResponse = await step.ai.wrap(
      "generate-story-content",
      runner.generateStory.bind(runner),
      storyRequest
    )

    const storyBundle = await step.run("persist-generated-story", async () => {
      const parsed = harness.parseStoryOutput(storyResponse.text, {
        fallbackChildName: payload.childName,
      })

      const story = {
        title: parsed.title,
        coverSubtitle: parsed.coverSubtitle,
        baseStory: parsed.baseStory,
        backCoverBlurb: parsed.backCoverBlurb,
        pages: parsed.pages,
        character: {
          name: parsed.character.name,
          visualDescription: parsed.character.visualDescription,
          photoUrl,
        },
      }

      await prisma.storybook.update({
        where: { id: payload.storybookId },
        data: {
          resources: {
            story,
          },
        },
      })

      return { ...parsed, character: story.character }
    })

    const imagePrompts = await step.run("assemble-image-prompts", async () => {
      return harness.assembleImagePrompts({
        character: storyBundle.character,
        pages: storyBundle.pages,
        slots: IMAGE_SLOTS,
        title: storyBundle.title,
        coverSubtitle: storyBundle.coverSubtitle,
        backCoverBlurb: storyBundle.backCoverBlurb,
        baseStory: storyBundle.baseStory,
      })
    })

    const storedImages = await Promise.all(
      IMAGE_SLOTS.map((slot) => {
        const prompt = imagePrompts.find((item) => item.slot === slot)?.prompt

        if (!prompt) {
          throw new Error(`Missing assembled image prompt for ${slot}.`)
        }

        return step.ai.wrap(
          `generate-image-${slot}`,
          generateAndStoreStoryImage,
          {
            prompt,
            referenceImage: photoInput,
            username: payload.username,
            storybookId: payload.storybookId,
            slot,
            size: "1024x1024",
            quality: "medium",
            n: 1,
          } satisfies GenerateAndStoreImageInput
        )
      })
    )

    // Build + validate resources inside a durable step so Finalization never
    // re-runs Zod against incomplete parallel image outputs.
    const resources = await step.run(
      "build-and-save-storybook-resources",
      async () => {
        const built = parseOutput(completedStorybookResourcesSchema, {
          story: {
            title: storyBundle.title,
            coverSubtitle: storyBundle.coverSubtitle,
            baseStory: storyBundle.baseStory,
            backCoverBlurb: storyBundle.backCoverBlurb,
            pages: storyBundle.pages,
            character: storyBundle.character,
          },
          story_images: {
            frontCover: storedImages[0]?.url,
            backCover: storedImages[6]?.url,
            stories: storedImages.slice(1, 6).map((item) => item.url),
          },
        })

        await prisma.storybook.update({
          where: { id: payload.storybookId },
          data: {
            resources: built,
            status: "COMPLETED",
          },
        })

        return built
      }
    )

    const email = await step.run("send-storybook-ready-email", async () => {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { email: true },
      })

      if (!user) {
        throw new Error(
          "Could not find the storybook owner for email delivery."
        )
      }

      return sendStorybookReadyEmail({
        to: user.email,
        storybookId: payload.storybookId,
        storyTitle: storyBundle.title,
        childName: payload.childName,
      })
    })

    return {
      storybookId: payload.storybookId,
      photoUrl,
      resources,
      emailId: email?.id,
      status: "COMPLETED",
    }
  }
)
