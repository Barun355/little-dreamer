import "server-only"

import { Resend } from "resend"

import { env } from "./env"
import { brand } from "@/content/copy"

/**
 * Transactional email via Resend.
 *
 * Every send returns a result rather than throwing. Email is a side effect of
 * the generation flow, not a precondition for it — a book that generated
 * successfully must not be reported as failed because a mail provider was
 * briefly unreachable.
 *
 * If RESEND_API_KEY is absent the module degrades to a no-op that logs and
 * reports `skipped`, so local development works without a key and nothing
 * silently pretends to have sent.
 */
export type SendResult =
  | { ok: true; id: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string }

let client: Resend | undefined

function resend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

function from() {
  // Must be a verified domain in Resend. onboarding@resend.dev works for
  // testing but can only deliver to the account owner's own address.
  return process.env.RESEND_FROM ?? `${brand.name} <onboarding@resend.dev>`
}

async function send(opts: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  const r = resend()
  if (!r) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${opts.subject}"`)
    return { ok: false, skipped: true, reason: "RESEND_API_KEY not set" }
  }

  try {
    const { data, error } = await r.emails.send({
      from: from(),
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    })
    if (error) return { ok: false, skipped: false, error: error.message }
    return { ok: true, id: data?.id ?? "" }
  } catch (e) {
    return { ok: false, skipped: false, error: (e as Error).message }
  }
}

// ─── templates ───────────────────────────────────────────────────────────────

const shell = (heading: string, body: string, cta?: { label: string; href: string }) => `
<!doctype html>
<html><body style="margin:0;padding:0;background:#FFF9F3;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#2A2118">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFDFB;border:1px solid #EDE3D8;border-radius:16px;padding:32px">
        <tr><td>
          <p style="margin:0 0 24px;font-size:15px;font-weight:600;color:#6537be">☾ ✦ ${brand.name}</p>
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:600">${heading}</h1>
          <div style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B5F52">${body}</div>
          ${
            cta
              ? `<a href="${cta.href}" style="display:inline-block;background:#7a4ae0;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:15px;font-weight:500">${cta.label}</a>`
              : ""
          }
          <p style="margin:32px 0 0;font-size:12px;color:#6B5F52">
            ${brand.tagline}<br>
            Photos are deleted within 30 days and never used for training.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

/** Sent when a generation run finishes. */
export function sendBookReady(opts: {
  to: string
  childName: string
  title: string
  url: string
}) {
  return send({
    to: opts.to,
    subject: `${opts.childName}'s storybook is ready`,
    html: shell(
      `${opts.childName}'s book is ready`,
      `<p style="margin:0 0 8px"><strong>${opts.title}</strong></p>
       <p style="margin:0">It is waiting for you — have a look inside.</p>`,
      { label: "Open the book", href: opts.url }
    ),
    text: `${opts.childName}'s storybook is ready.\n\n${opts.title}\n\nOpen it: ${opts.url}`,
  })
}

/** Sent when someone asks to be notified instead of waiting. */
export function sendGenerationStarted(opts: {
  to: string
  childName: string
  url: string
}) {
  return send({
    to: opts.to,
    subject: `We're making ${opts.childName}'s storybook`,
    html: shell(
      `We're making ${opts.childName}'s book`,
      `<p style="margin:0">This usually takes a few minutes. We will email you
       the moment it is ready — you can close the tab.</p>`,
      { label: "Check on it", href: opts.url }
    ),
    text: `We're making ${opts.childName}'s storybook. We'll email you when it's ready.\n\nCheck on it: ${opts.url}`,
  })
}

/** Sent when a run fails, so nobody is left staring at a spinner. */
export function sendGenerationFailed(opts: {
  to: string
  childName: string
  url: string
}) {
  return send({
    to: opts.to,
    subject: `We couldn't finish ${opts.childName}'s storybook`,
    html: shell(
      "Something went wrong",
      `<p style="margin:0 0 8px">We ran into a problem partway through making
       ${opts.childName}'s book. <strong>Nothing was charged.</strong></p>
       <p style="margin:0">Try again whenever suits you.</p>`,
      { label: "Try again", href: opts.url }
    ),
    text: `We couldn't finish ${opts.childName}'s storybook. Nothing was charged.\n\nTry again: ${opts.url}`,
  })
}

export { send as sendRaw, env }
