import { getServerEnv } from "@/lib/env"

import { sendEmail } from "./resend"

type SendStorybookReadyEmailInput = {
  to: string
  storybookId: string
  storyTitle: string
  childName: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function sendStorybookReadyEmail(
  input: SendStorybookReadyEmailInput
) {
  const storybookUrl = new URL(
    `/dashboard/story/${encodeURIComponent(input.storybookId)}`,
    getServerEnv().NEXT_PUBLIC_SITE_URL
  ).toString()
  const storyTitle = escapeHtml(input.storyTitle)
  const childName = escapeHtml(input.childName)
  const subjectTitle = input.storyTitle.replace(/[\r\n]+/g, " ").trim()

  return sendEmail({
    to: input.to,
    subject: `${subjectTitle} is ready`,
    idempotencyKey: `storybook-ready/${input.storybookId}`,
    html: `
      <div style="margin:0;background:#f7f7f2;padding:32px 16px;font-family:Arial,sans-serif;color:#243127">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dde5dd;border-radius:16px;padding:32px">
          <p style="margin:0 0 8px;color:#26734d;font-size:14px;font-weight:700">LITTLE DREAMER</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${storyTitle} is ready!</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6">
            ${childName}&rsquo;s personalized storybook has finished generating.
          </p>
          <a href="${storybookUrl}" style="display:inline-block;border-radius:10px;background:#26734d;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700">
            Open storybook
          </a>
        </div>
      </div>
    `,
  })
}
