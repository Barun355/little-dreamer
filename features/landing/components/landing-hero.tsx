import Link from "next/link"
import { ArrowRight, BookOpen, Gift, Star } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-32 size-72 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-200">
            <Gift className="size-3.5 text-amber-300" />
            A keepsake gift for parents, grandparents &amp; family
          </p>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Give a Child a Story Where{" "}
            <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
              They Are the Hero
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70">
            Little Dreamer turns a child&apos;s name, age, and photo into a
            personalized storybook made for one child — not a generic tale, but a
            magical keepsake they&apos;ll want to read again and again.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-12 bg-violet-500 px-8 text-base text-white hover:bg-violet-400"
            >
              <Link href="/dashboard">
                Create Their Storybook
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-white/45">
            Perfect for birthdays, holidays, bedtime, or a surprise from
            grandma and grandpa
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-amber-400/20 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121c] p-6 shadow-2xl shadow-violet-950/50 ring-1 ring-white/5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <BookOpen className="size-4 text-violet-300" />
                Maya&apos;s Storybook · Page 1
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-medium text-amber-200">
                <Star className="size-3 fill-amber-300 text-amber-300" />
                Made for Maya
              </span>
            </div>

            <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex gap-4">
                <div className="size-16 shrink-0 rounded-xl bg-gradient-to-br from-violet-400/30 to-fuchsia-500/20 ring-1 ring-white/10" />
                <div className="min-w-0 flex-1 space-y-2 pt-1">
                  <p className="text-xs text-white/45">Illustrated as the hero</p>
                  <div className="h-2 w-3/4 rounded-full bg-white/15" />
                  <div className="h-2 w-full rounded-full bg-white/10" />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-white/75">
                On the night of her seventh birthday,{" "}
                <span className="font-medium text-violet-200">Maya</span> spotted a
                rocket-shaped cloud above the oak tree — and followed it toward the
                stars she had always dreamed of reaching.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {["Loves space", "Age 7", "Theme: Adventure"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-white/35">
              Front cover · 5 story pages · Back cover
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
