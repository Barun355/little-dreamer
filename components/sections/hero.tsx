import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HeroHeadline } from "./hero-headline"
import { HeroMedia } from "./hero-media"
import { hero } from "@/content/copy"

const SPARKLES = [
  { char: "✦", top: "12%", left: "8%", size: "text-h2", tone: "text-lavender-300", delay: 0 },
  { char: "˚", top: "22%", left: "88%", size: "text-h1", tone: "text-gold-300", delay: 0.8 },
  { char: "✦", top: "58%", left: "4%", size: "text-h3", tone: "text-sky-300", delay: 1.6 },
  { char: "·", top: "8%", left: "62%", size: "text-h1", tone: "text-mint-300", delay: 0.4 },
  { char: "✦", top: "70%", left: "93%", size: "text-h2", tone: "text-lavender-200", delay: 2.2 },
  { char: "˚", top: "44%", left: "78%", size: "text-body-lg", tone: "text-gold-200", delay: 1.2 },
]

/**
 * Section 02 — Hero.
 *
 * Server Component. Only the headline motion and the video overlay are
 * client islands, keeping the static shell large and the JS island small.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-(--nav-height)"
      aria-labelledby="hero-eyebrow"
    >
      {/*
        Ambient field. Decorative, aria-hidden, and animated in CSS so the
        hero needs no client JS. The global reduced-motion backstop freezes
        these to a single static frame.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={`animate-drift absolute ${s.size} ${s.tone}`}
            style={
              {
                top: s.top,
                left: s.left,
                "--delay": `${s.delay}s`,
                "--drift-distance": `${8 + (i % 3) * 4}px`,
                "--drift-duration": `${5 + (i % 4)}s`,
              } as React.CSSProperties
            }
          >
            {s.char}
          </span>
        ))}
      </div>

      {/* Warm radial wash behind the fold. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,var(--color-lavender-100),transparent_65%)] opacity-70"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 pt-14 pb-16 text-center sm:px-8 sm:pt-20 sm:pb-24">
        <p
          id="hero-eyebrow"
          className="flex items-center gap-2 text-small font-medium tracking-wide text-lavender-700"
        >
          <span aria-hidden>✦</span>
          {hero.eyebrow}
          <span aria-hidden>✦</span>
        </p>

        <HeroHeadline words={hero.headline} />

        <p className="max-w-xl text-body-lg text-muted-foreground text-pretty">
          {hero.subhead}
        </p>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button size="xl" className="w-full sm:w-auto" render={<Link href={hero.primaryCta.href} />}>
            {hero.primaryCta.label}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="w-full sm:w-auto"
            render={<a href={hero.secondaryCta.href} />}
          >
            {hero.secondaryCta.label}
          </Button>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-small text-muted-foreground">
          {hero.reassurance.map((item, i) => (
            <li key={item} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden>·</span> : null}
              {item}
            </li>
          ))}
        </ul>

        <div className="w-full pt-4">
          <HeroMedia />
        </div>
      </div>
    </section>
  )
}
