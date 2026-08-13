import type { Metadata } from "next"

import { LandingPage } from "@/features/landing"
import { auth } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Little Dreamer — Give a Child a Story Where They Are the Hero",
  description:
    "Create a personalized storybook for a special child. Share their name, age, and photo — and give them a magical keepsake made just for them.",
}

export const dynamic = "force-dynamic"

export default async function Page() {
  const { data: session } = await auth.getSession()

  return <LandingPage isSignedIn={Boolean(session?.user)} />
}
