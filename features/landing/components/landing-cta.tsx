import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type LandingCtaProps = {
  isSignedIn: boolean
}

export function LandingCta({ isSignedIn }: LandingCtaProps) {
  return (
    <section className="px-6 pb-20 pt-4 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-[#12121c] to-amber-500/10 px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.15),transparent_55%)]"
          />

          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Give them something they&apos;ll never forget
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">
              Whether you&apos;re a parent, grandparent, or someone who loves a
              special child — create a storybook that makes them feel seen, celebrated,
              and truly the hero.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-violet-500 px-8 text-base text-white hover:bg-violet-400"
            >
              <Link href={isSignedIn ? "/dashboard" : "/auth/sign-in"}>
                Create Their Storybook
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
