import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { brand } from "@/content/copy"

export const metadata: Metadata = {
  title: "Create a book",
  robots: { index: false, follow: false },
}

/**
 * CTA destination.
 *
 * Every call to action on the landing page points here, so it must be a real
 * route — a 404 behind the primary CTA is worse than no CTA. The generation
 * wizard replaces this in the app phase.
 */
export default function CreatePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-5 px-5 text-center"
    >
      <span aria-hidden className="text-h1 text-lavender-500">
        {brand.mark}
      </span>

      <h1 className="font-heading text-h1 font-semibold">Coming soon</h1>

      <p className="text-body-lg text-muted-foreground text-pretty">
        The storybook builder is still being written. {brand.promise}
      </p>

      <Button variant="outline" size="xl" render={<Link href="/" />}>
        <ArrowLeftIcon data-icon="inline-start" />
        Back to home
      </Button>
    </main>
  )
}
