import "server-only"

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { env } from "./env"

/**
 * Cloudflare R2 via its S3-compatible API.
 *
 * Two settings are load-bearing:
 *
 *  - `region: "auto"` — R2 has no regions, and a real region name makes the
 *    SDK sign requests R2 rejects.
 *  - `forcePathStyle: true` — without it the SDK builds a virtual-hosted URL
 *    (`<bucket>.<account>.r2.cloudflarestorage.com`) which resolved to an AWS
 *    address here and hung until the socket timed out. Path style keeps every
 *    request on the account endpoint.
 */
let client: S3Client | undefined

function r2() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
      requestHandler: { requestTimeout: 20_000, connectionTimeout: 8_000 },
    })
  }
  return client
}

/** Uploads a buffer. Returns the object key — NOT a URL. */
export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
) {
  await r2().send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return key
}

/**
 * A short-lived signed GET URL.
 *
 * This is how Make reads a child's photograph. The bucket stays private —
 * making it publicly readable would put every uploaded photo of a child on
 * a guessable URL forever, which no retention policy can walk back. A signed
 * link expires, so a URL leaking from a log is worth minutes, not years.
 */
export async function signedGetUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(
    r2(),
    new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }),
    { expiresIn }
  )
}

/**
 * A short-lived signed PUT URL, so Make can write generated images straight
 * to R2 without ever holding R2 credentials.
 */
export async function signedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const url = await getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  )
  return { url, key }
}
