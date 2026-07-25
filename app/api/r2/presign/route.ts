import { NextResponse } from "next/server"

import { signedPutUrl } from "@/lib/r2"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

/**
 * Issues a short-lived signed PUT URL so Make can write generated images
 * directly to R2 without ever holding R2 credentials.
 *
 * Authenticated with the same shared secret Make already uses, and the key is
 * constrained to paths this app owns — an open presign endpoint is a writable
 * bucket for anyone who finds it.
 */
const ALLOWED_PREFIXES = ["pages/", "characters/", "covers/", "books/"]

export async function POST(req: Request) {
  if (req.headers.get("x-make-apikey") !== env.make.apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { key?: string; contentType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const key = String(body.key ?? "")
  const contentType = String(body.contentType ?? "image/png")

  if (!ALLOWED_PREFIXES.some((p) => key.startsWith(p)) || key.includes("..")) {
    return NextResponse.json({ error: "Disallowed key" }, { status: 400 })
  }

  const signed = await signedPutUrl(key, contentType)
  return NextResponse.json(signed, { headers: { "Cache-Control": "no-store" } })
}
