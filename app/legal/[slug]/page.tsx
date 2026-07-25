import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Legal stubs.
 *
 * D7 default: honest stubs rather than dead links. The footer links to five
 * legal pages, and on a product whose central objection is "what happens to
 * my child's photo?", a 404 behind Privacy or Photo use actively damages
 * trust. These say plainly that the policy is not yet published instead of
 * pretending to be one — a fake privacy policy would be worse than no page.
 *
 * PHASE-7 §7.5 blocks launch until these carry real copy.
 */

const PAGES = {
  privacy: {
    title: "Privacy Policy",
    summary: "How we collect, use and delete your data.",
  },
  terms: {
    title: "Terms of Service",
    summary: "The agreement between you and Little Dreamer.",
  },
  coppa: {
    title: "COPPA Compliance",
    summary:
      "How we meet the US Children's Online Privacy Protection Act, and what that means for your family.",
  },
  "photo-use": {
    title: "How We Use Photos",
    summary:
      "What happens to a photo you upload: what it is used for, how long it is kept, and how to delete it.",
  },
  refunds: {
    title: "Refunds",
    summary: "When and how you can get your money back.",
  },
} as const

type Slug = keyof typeof PAGES

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = PAGES[slug as Slug]
  if (!page) return {}
  return {
    title: page.title,
    description: page.summary,
    robots: { index: false, follow: false },
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = PAGES[slug as Slug]
  if (!page) notFound()

  return (
    <main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-24 sm:px-8">
      <h1 className="font-heading text-h1 font-semibold">{page.title}</h1>

      <p className="text-body-lg text-muted-foreground text-pretty">{page.summary}</p>

      <div className="rounded-xl border border-gold-200 bg-gold-50 p-5">
        <p className="text-body text-gold-800 text-pretty">
          <strong className="font-semibold">Not yet published.</strong> This policy is
          being written and reviewed. We would rather tell you that plainly than show
          you a document we have not stood behind yet.
        </p>
      </div>

      <div>
        <Button variant="outline" size="lg" render={<Link href="/" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to home
        </Button>
      </div>
    </main>
  )
}
