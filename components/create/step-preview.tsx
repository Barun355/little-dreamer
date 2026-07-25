"use client"

import Link from "next/link"
import { LockIcon, SparklesIcon, DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlaceholderSpread } from "@/components/placeholder"
import { pricing } from "@/content/conversion"
import type { JobSnapshot } from "./step-generating"

/**
 * Step 5 — the payoff.
 *
 * Two spreads are shown in full; the rest are blurred behind the payment gate.
 * That mirrors the free-preview pattern the research found reduces purchase
 * friction, and it is honest: the book genuinely exists at this point.
 */
export function StepPreview({ job }: { job: JobSnapshot }) {
  const paid = pricing.tiers.find((t) => t.highlighted)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge>Ready</Badge>
        <h2 className="font-heading text-h1 font-semibold text-balance">
          {job.book?.title ?? `${job.childName}'s story`}
        </h2>
        <p className="max-w-md text-body-lg text-muted-foreground text-pretty">
          Here are the first two pages. {job.childName} is the hero of all of
          them.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((n) => (
          <li
            key={n}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-md"
          >
            <div className="aspect-[3/2]">
              <PlaceholderSpread className="size-full rounded-none" />
            </div>
            <p className="p-4 text-small text-muted-foreground">Page {n}</p>
          </li>
        ))}
      </ul>

      {/* Locked remainder. */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <ul aria-hidden className="grid grid-cols-2 gap-4 p-4 blur-sm sm:grid-cols-4">
          {[3, 4, 5, 6].map((n) => (
            <li key={n} className="aspect-[3/2] overflow-hidden rounded-xl">
              <PlaceholderSpread className="size-full rounded-xl" />
            </li>
          ))}
        </ul>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 p-6 text-center backdrop-blur-[2px]">
          <span className="flex size-11 items-center justify-center rounded-full bg-lavender-100 text-lavender-700">
            <LockIcon className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-h3 font-semibold">
              Unlock the full book
            </p>
            <p className="max-w-sm text-small text-muted-foreground text-pretty">
              All pages, the cover, and a print-ready PDF you can keep.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button size="xl" render={<Link href="#" prefetch={false} />}>
              <SparklesIcon data-icon="inline-start" />
              Unlock for {paid?.price ?? "—"}
            </Button>
            <Button variant="outline" size="xl" disabled>
              <DownloadIcon data-icon="inline-start" />
              Download PDF
            </Button>
          </div>

          {/*
            Payment is not wired. The button goes nowhere on purpose rather
            than to a checkout that does not exist — needs a provider
            (Stripe/Razorpay) and the pricing decision (D2/D8) settled first.
          */}
          <p className="text-micro text-muted-foreground">
            Checkout is not connected yet.
          </p>
        </div>
      </div>
    </div>
  )
}
