import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

/**
 * Callbacks from the Make scenario.
 *
 * Authenticated with the shared API key. HMAC signing is the stronger option
 * and MAKE_CALLBACK_HMAC_SECRET already exists for it, but Make's HTTP module
 * cannot sign a raw body without a Code module — so the key is used for now
 * and the secret stays reserved. Worth upgrading before this is public.
 */
type Payload = {
  jobId?: string
  bookId?: string
  title?: string
  dedication?: string
  pages?: { section: string; text?: string; imageKey?: string; imageUrl?: string }[]
  coverKey?: string
  pdfKey?: string
  stage?: string
  reason?: string
  retryable?: boolean
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  if (req.headers.get("x-make-apikey") !== env.make.apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { event } = await params
  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const jobId = body.jobId
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })

  const job = await db.job.findUnique({ where: { id: jobId }, select: { id: true } })
  if (!job) return NextResponse.json({ error: "Unknown job" }, { status: 404 })

  switch (event) {
    case "story-ready": {
      const book = await db.book.upsert({
        where: { jobId },
        update: { title: body.title ?? "Untitled", dedication: body.dedication },
        create: {
          jobId,
          title: body.title ?? "Untitled",
          dedication: body.dedication,
        },
      })

      if (body.pages?.length) {
        for (const [i, p] of body.pages.entries()) {
          await db.page.upsert({
            where: { bookId_section: { bookId: book.id, section: p.section } },
            update: { text: p.text ?? "", index: i },
            create: { bookId: book.id, section: p.section, index: i, text: p.text ?? "" },
          })
        }
        await db.book.update({
          where: { id: book.id },
          data: { pageCount: body.pages.length },
        })
      }

      await db.job.update({ where: { id: jobId }, data: { status: "ILLUSTRATING" } })
      break
    }

    case "pages-ready": {
      const book = await db.book.findUnique({ where: { jobId }, select: { id: true } })
      if (book && body.pages?.length) {
        for (const p of body.pages) {
          const key = p.imageKey ?? p.imageUrl
          if (!key) continue
          await db.page.updateMany({
            where: { bookId: book.id, section: p.section },
            data: { imageKey: key },
          })
        }
      }
      if (book && body.coverKey) {
        await db.book.update({ where: { id: book.id }, data: { coverKey: body.coverKey } })
      }
      await db.job.update({ where: { id: jobId }, data: { status: "ASSEMBLING" } })
      break
    }

    case "book-ready": {
      const book = await db.book.upsert({
        where: { jobId },
        update: { pdfKey: body.pdfKey, title: body.title ?? undefined },
        create: { jobId, title: body.title ?? "Untitled", pdfKey: body.pdfKey },
      })
      await db.job.update({
        where: { id: jobId },
        data: { status: "READY", completedAt: new Date() },
      })
      return NextResponse.json({ ok: true, bookId: book.id })
    }

    case "job-failed": {
      await db.job.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          failedStage: body.stage ?? null,
          failedReason: body.reason ?? null,
          retryable: body.retryable ?? true,
        },
      })
      break
    }

    default:
      return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
