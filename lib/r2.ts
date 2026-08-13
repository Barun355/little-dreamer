import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

import { getServerEnv } from "@/lib/env"

function getR2Client() {
  const env = getServerEnv()

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
}

export function getPublicObjectUrl(key: string) {
  const env = getServerEnv()
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`
}

export async function uploadObject(params: {
  key: string
  body: Buffer | Uint8Array | string
  contentType: string
}) {
  const env = getServerEnv()
  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  )

  return getPublicObjectUrl(params.key)
}

export async function uploadChildPhoto(params: {
  storybookId: string
  buffer: Buffer
  contentType: string
  fileName: string
}) {
  const extension = params.fileName.split(".").pop()?.toLowerCase() || "jpg"
  const key = `storybooks/${params.storybookId}/child-photo.${extension}`

  return uploadObject({
    key,
    body: params.buffer,
    contentType: params.contentType,
  })
}

export async function uploadStoryImage(params: {
  storybookId: string
  slot: string
  buffer: Buffer
  contentType?: string
}) {
  const key = `storybooks/${params.storybookId}/images/${params.slot}.png`

  return uploadObject({
    key,
    body: params.buffer,
    contentType: params.contentType ?? "image/png",
  })
}

export async function uploadImageFromUrl(params: {
  storybookId: string
  slot: string
  imageUrl: string
}) {
  const response = await fetch(params.imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to download generated image for ${params.slot}.`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get("content-type") ?? "image/png"

  return uploadStoryImage({
    storybookId: params.storybookId,
    slot: params.slot,
    buffer,
    contentType,
  })
}
