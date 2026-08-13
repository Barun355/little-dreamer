import { z } from "zod"

import {
  syncUser,
  UserAlreadyExistsError,
} from "@/lib/auth/sync-user"
import {
  NeonWebhookVerificationError,
  verifyNeonWebhook,
} from "@/lib/auth/verify-neon-webhook"

const neonAuthUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
})

const neonAuthWebhookSchema = z.object({
  event_type: z.string(),
  user: neonAuthUserSchema.optional(),
})

export async function POST(request: Request) {
  const rawBody = await request.text()

  try {
    const verified = await verifyNeonWebhook(rawBody, request.headers)
    const payload = neonAuthWebhookSchema.safeParse(verified)

    if (!payload.success) {
      return Response.json({ error: "Invalid webhook payload." }, { status: 400 })
    }

    if (payload.data.event_type !== "user.created") {
      return Response.json({ ok: true })
    }

    if (!payload.data.user) {
      return Response.json({ error: "Missing user payload." }, { status: 400 })
    }

    await syncUser({
      id: payload.data.user.id,
      email: payload.data.user.email,
      name: payload.data.user.name,
      image: payload.data.user.image,
    })

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof NeonWebhookVerificationError) {
      console.error("[neon-auth webhook] verification failed:", error)
      return Response.json({ error: error.message }, { status: 401 })
    }

    if (error instanceof UserAlreadyExistsError) {
      console.warn("[neon-auth webhook]", error.message)
      return Response.json({ ok: true, message: error.message })
    }

    console.error("[neon-auth webhook] processing failed:", error)
    return Response.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}
