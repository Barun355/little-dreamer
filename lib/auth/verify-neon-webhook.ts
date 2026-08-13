import { compactVerify, createRemoteJWKSet } from "jose"

import { getServerEnv } from "@/lib/env"

const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000

type RemoteJWKSet = ReturnType<typeof createRemoteJWKSet>

let remoteJwks: RemoteJWKSet | undefined
let remoteJwksUrl: string | undefined

export class NeonWebhookVerificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NeonWebhookVerificationError"
  }
}

export async function verifyNeonWebhook(
  rawBody: string,
  headers: Headers
): Promise<unknown> {
  const signature = headers.get("x-neon-signature")
  const kid = headers.get("x-neon-signature-kid")
  const timestamp = headers.get("x-neon-timestamp")

  if (!signature || !kid || !timestamp) {
    throw new NeonWebhookVerificationError("Missing Neon webhook signature headers.")
  }

  const ageMs = Date.now() - Number(timestamp)

  if (!Number.isFinite(ageMs) || ageMs > WEBHOOK_MAX_AGE_MS || ageMs < -WEBHOOK_MAX_AGE_MS) {
    throw new NeonWebhookVerificationError("Webhook timestamp is too old or invalid.")
  }

  const [headerB64, emptyPayload, signatureB64] = signature.split(".")

  if (!headerB64 || emptyPayload !== "" || !signatureB64) {
    throw new NeonWebhookVerificationError("Expected detached JWS format.")
  }

  try {
    const payloadB64 = Buffer.from(rawBody, "utf8").toString("base64url")
    const signaturePayloadB64 = Buffer.from(
      `${timestamp}.${payloadB64}`,
      "utf8"
    ).toString("base64url")

    await compactVerify(
      `${headerB64}.${signaturePayloadB64}.${signatureB64}`,
      getRemoteJwks()
    )
  } catch (error) {
    if (error instanceof NeonWebhookVerificationError) {
      throw error
    }

    const message =
      error instanceof Error ? error.message : "Invalid webhook signature."
    throw new NeonWebhookVerificationError(message)
  }

  try {
    return JSON.parse(rawBody) as unknown
  } catch {
    throw new NeonWebhookVerificationError("Webhook payload is not valid JSON.")
  }
}

function getRemoteJwks(): RemoteJWKSet {
  const jwksUrl = `${getServerEnv().NEON_AUTH_BASE_URL.replace(/\/$/, "")}/.well-known/jwks.json`

  if (!remoteJwks || remoteJwksUrl !== jwksUrl) {
    remoteJwks = createRemoteJWKSet(new URL(jwksUrl))
    remoteJwksUrl = jwksUrl
  }

  return remoteJwks
}
