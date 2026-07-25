import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { brand } from "@/content/copy"
import { finalCta } from "@/content/conversion"

const SPARKLES = [
  { char: "✦", top: "18%", left: "10%", tone: "text-lavender-300", d: 0 },
  { char: "˚", top: "70%", left: "14%", tone: "text-gold-300", d: 1.1 },
  { char: "✦", top: "28%", left: "86%", tone: "text-sky-300", d: 0.6 },
  { char: "·", top: "76%", left: "82%", tone: "text-mint-300", d: 1.7 },
]

/**
 * Section 12 — Final CTA.
 *
 * The emotional close, bookending the hero. Server Component; the drift is
 * CSS, so this section ships no JavaScript at all.
 */
export function FinalCta() {
  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-t border-border bg-lavender-50/60 py-24 sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={`animate-drift absolute text-h2 ${s.tone}`}
            style={
              {
                top: s.top,
                left: s.left,
                "--delay": `${s.d}s`,
                "--drift-distance": `${8 + (i % 3) * 4}px`,
                "--drift-duration": `${5 + (i % 4)}s`,
              } as React.CSSProperties
            }
          >
            {s.char}
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 text-center sm:px-8">
        <span aria-hidden className="text-h1 text-lavender-500">
          {brand.mark} ✦
        </span>

        <h2
          id="final-cta-heading"
          className="font-heading text-h1 font-semibold text-balance"
        >
          {finalCta.heading}
        </h2>

        <Button size="xl" render={<Link href={finalCta.cta.href} prefetch={false} />}>
          {finalCta.cta.label}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>

        <p className="text-small text-muted-foreground">{finalCta.reassurance}</p>
      </div>
    </section>
  )
}
