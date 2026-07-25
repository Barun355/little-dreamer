import { Suspense } from "react"
import type { Metadata } from "next"

import { QueryProvider } from "@/providers/query-provider"
import { Wizard } from "@/components/create/wizard"

export const metadata: Metadata = {
  title: "Create a book",
  description: "Turn one photo into a storybook where your child is the hero.",
  robots: { index: false, follow: false },
}

/**
 * The create wizard.
 *
 * QueryProvider is mounted here rather than in the root layout — the landing
 * page has no server state, and this is the only route that polls.
 *
 * Suspense wraps the wizard because it reads searchParams (?job=) to resume
 * a run in progress.
 */
export default function CreatePage() {
  return (
    <main id="main" className="min-h-svh bg-background">
      <QueryProvider>
        <Suspense fallback={null}>
          <Wizard />
        </Suspense>
      </QueryProvider>
    </main>
  )
}
