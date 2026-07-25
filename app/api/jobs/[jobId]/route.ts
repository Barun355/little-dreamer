import { NextResponse } from "next/server"

import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Poll target for the generating screen. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      failedReason: true,
      updatedAt: true,
      child: { select: { name: true } },
      book: {
        select: {
          id: true,
          title: true,
          coverKey: true,
          pdfKey: true,
          pages: {
            select: { section: true, index: true, text: true, imageKey: true },
            orderBy: { index: "asc" },
          },
        },
      },
    },
  })

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(
    {
      id: job.id,
      status: job.status,
      childName: job.child.name,
      failedReason: job.failedReason,
      updatedAt: job.updatedAt,
      book: job.book,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
