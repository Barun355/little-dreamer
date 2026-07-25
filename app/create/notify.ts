"use server"

import { z } from "zod"

import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { sendGenerationStarted } from "@/lib/email"

const schema = z.object({
  jobId: z.string().min(1),
  email: z.email("That does not look like an email address"),
})

export type NotifyResult = { ok: true; sent: boolean } | { ok: false; error: string }

/**
 * "Email me when it's ready."
 *
 * Records the address on the job so the Make callback can send the real
 * notification later, and sends an immediate acknowledgement.
 *
 * `sent: false` means the address was stored but no mail went out — usually
 * RESEND_API_KEY missing. The UI reports that honestly rather than claiming
 * an email is on its way.
 */
export async function requestNotification(input: {
  jobId: string
  email: string
}): Promise<NotifyResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const job = await db.job.findUnique({
    where: { id: parsed.data.jobId },
    select: { id: true, child: { select: { name: true } } },
  })
  if (!job) return { ok: false, error: "We could not find that book" }

  await db.job.update({
    where: { id: job.id },
    data: { notifyEmail: parsed.data.email },
  })

  const result = await sendGenerationStarted({
    to: parsed.data.email,
    childName: job.child.name,
    url: `${env.siteUrl}/create?job=${job.id}`,
  })

  if (!result.ok && !result.skipped) {
    // The address is saved either way, so the ready-email can still fire.
    console.error("[notify] acknowledgement failed:", result.error)
  }

  return { ok: true, sent: result.ok }
}
