import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

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

export function userRootKey(username: string) {
  return username
}

export function userAssetsPrefix(username: string) {
  return `${username}/assets`
}

export function userStorybooksPrefix(username: string) {
  return `${username}/storybooks`
}

export function assetChildPhotoKey(params: {
  username: string
  storybookId: string
  extension: string
}) {
  return `${userAssetsPrefix(params.username)}/child-${params.storybookId}.${params.extension}`
}

export function storybookImageKey(params: {
  username: string
  storybookId: string
  slot: string
}) {
  return `${userStorybooksPrefix(params.username)}/storybook-${params.storybookId}/${params.slot}.png`
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

/** Create R2 key-prefix markers for a user (idempotent overwrites of tiny markers). */
export async function ensureUserStorageLayout(username: string) {
  const marker = Buffer.from("")
  const keys = [
    `${userRootKey(username)}/.keep`,
    `${userAssetsPrefix(username)}/.keep`,
    `${userStorybooksPrefix(username)}/.keep`,
  ]

  await Promise.all(
    keys.map((key) =>
      uploadObject({
        key,
        body: marker,
        contentType: "application/octet-stream",
      })
    )
  )
}

export async function uploadChildPhoto(params: {
  username: string
  storybookId: string
  buffer: Buffer
  contentType: string
  fileName: string
}) {
  const extension = params.fileName.split(".").pop()?.toLowerCase() || "jpg"
  const key = assetChildPhotoKey({
    username: params.username,
    storybookId: params.storybookId,
    extension,
  })

  return uploadObject({
    key,
    body: params.buffer,
    contentType: params.contentType,
  })
}

export async function uploadStoryImage(params: {
  username: string
  storybookId: string
  slot: string
  buffer: Buffer
  contentType?: string
}) {
  const key = storybookImageKey({
    username: params.username,
    storybookId: params.storybookId,
    slot: params.slot,
  })

  return uploadObject({
    key,
    body: params.buffer,
    contentType: params.contentType ?? "image/png",
  })
}
