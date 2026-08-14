import { Resend } from "resend"

import { getServerEnv } from "@/lib/env"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  idempotencyKey: string
}

let resendClient: Resend | null = null

function getResendClient() {
  if (!resendClient) {
    const { RESEND_API_KEY } = getServerEnv()

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set.")
    }

    resendClient = new Resend(RESEND_API_KEY)
  }

  return resendClient
}

export async function sendEmail(input: SendEmailInput) {
  const { RESEND_FROM } = getServerEnv()
  const { data, error } = await getResendClient().emails.send(
    {
      from: RESEND_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    },
    {
      idempotencyKey: input.idempotencyKey,
    }
  )

  if (error) {
    throw new Error(`Resend could not send the email: ${error.message}`)
  }

  return data
}
