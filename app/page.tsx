import type { Metadata } from "next"

import { LandingPage } from "@/features/landing"

export const metadata: Metadata = {
  title: "Little Dreamer — Give a Child a Story Where They Are the Hero",
  description:
    "Create a personalized storybook for a special child. Share their name, age, and photo — and give them a magical keepsake made just for them.",
}

export default function Page() {
  return <LandingPage />
}
