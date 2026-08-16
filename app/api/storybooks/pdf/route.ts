import { auth } from "@/lib/auth/server"
import { prisma } from "@/lib/db"
import { getServerEnv } from "@/lib/env"
import { createStorybookPdfFileName, generateStorybookPdf } from "@/lib/pdf"
import { completedStorybookResourcesSchema } from "@/types/schemas"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_IMAGE_BYTES = 20 * 1024 * 1024

async function downloadStorybookImage(url: string) {
  const imageUrl = new URL(url)
  const allowedOrigin = new URL(getServerEnv().R2_PUBLIC_BASE_URL).origin

  if (imageUrl.origin !== allowedOrigin) {
    throw new Error(
      "Storybook image URL is not from the configured storage origin."
    )
  }

  const response = await fetch(imageUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Could not download storybook image (${response.status}).`)
  }

  const declaredSize = Number(response.headers.get("content-length") ?? 0)

  if (declaredSize > MAX_IMAGE_BYTES) {
    throw new Error("A storybook image is too large to include in the PDF.")
  }

  const bytes = new Uint8Array(await response.arrayBuffer())

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("A storybook image is too large to include in the PDF.")
  }

  return bytes
}

export async function POST(
  request: Request,
) {

  const req = await request.json();

  console.log("req", { req })
  const { storyId, userId } = req;

  if (!storyId || !userId) {  
    return Response.json({ error: "Story ID and user ID are required." }, { status: 400 })
  }

  const storybook = await prisma.storybook.findFirst({
    where: {
      id: storyId,
      userId,
    },
    select: {
      status: true,
      resources: true,
    },
  })

  console.log("storybook", { storybook, storyId, userId })
  if (!storybook) {
    return Response.json({ error: "Storybook not found." }, { status: 404 })
  }

  if (storybook.status !== "COMPLETED") {
    return Response.json(
      { error: "The storybook is not ready to download." },
      { status: 409 }
    )
  }

  const resources = completedStorybookResourcesSchema.safeParse(
    storybook.resources
  )

  if (!resources.success) {
    return Response.json(
      { error: "The storybook does not contain all required images." },
      { status: 409 }
    )
  }

  const { story, story_images: images } = resources.data
  const orderedUrls = [images.frontCover, ...images.stories, images.backCover]

  try {
    const imageBytes = await Promise.all(
      orderedUrls.map(downloadStorybookImage)
    )
    const pdf = await generateStorybookPdf({
      images: imageBytes,
      title: story.title,
    })
    const fileName = createStorybookPdfFileName(story.title)
    const responseBody = new Uint8Array(pdf.byteLength)
    responseBody.set(pdf)

    return new Response(responseBody.buffer, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/pdf",
      },
    })
  } catch (error) {
    console.error("[storybook pdf] generation failed:", error)
    return Response.json(
      { error: "Could not generate the storybook PDF." },
      { status: 500 }
    )
  }
}
