import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { signedPutUrl } from "@/lib/r2"
import { ACCEPTED_IMAGE_TYPES, MAX_PHOTO_BYTES } from "@/lib/create-schema"

export const dynamic = "force-dynamic"

/**
 * Hands the browser a short-lived slot to upload one photo straight to R2.
 *
 * WHY DIRECT UPLOAD: photos were previously base64'd into the Server Action
 * payload. Server Actions cap the request body at 1 MB, and base64 inflates
 * by a third — so any real photograph (1 MB+) failed with a 413 before it
 * reached any of our code. Raising the cap only moves the wall (Vercel stops
 * at 4.5 MB) and pushes megabytes of binary through the RSC pipeline for no
 * benefit. The browser now PUTs to R2 and the action carries only keys.
 *
 * The SERVER picks the key. If the client named it, anyone could overwrite
 * any object in the bucket by asking politely.
 */
export async function POST(req: Request) {
  let body: { contentType?: string; size?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const contentType = String(body.contentType ?? "")
  const size = Number(body.size ?? 0)

  if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Please use a JPG, PNG or WebP image" },
      { status: 400 }
    )
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large — please use one under 8 MB" },
      { status: 400 }
    )
  }

  const ext = contentType.split("/")[1].replace("jpeg", "jpg")
  const key = `photos/uploads/${randomUUID()}.${ext}`

  const signed = await signedPutUrl(key, contentType, 600)
  return NextResponse.json(signed, { headers: { "Cache-Control": "no-store" } })
}
