import Link from "next/link"
import { CheckIcon, XIcon, InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RevealGroup } from "@/components/motion/gsap-reveal"
import { pricing } from "@/content/conversion"

/**
 * Section 10 — Pricing.
 *
 * Included/excluded state is conveyed by an icon WITH an accessible label,
 * never by colour alone — a red cross and a green tick look identical to a
 * significant share of readers.
 *
 * The popular tier is first in DOM order so mobile sees it first without
 * needing CSS reordering that would desync the tab sequence.
 */
export function Pricing() {
  const ordered = [...pricing.tiers].sort(
    (a, b) => Number(b.highlighted) - Number(a.highlighted)
  )

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="border-y border-border bg-card/50 py-20 sm:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            id="pricing-heading"
            className="font-heading text-h1 font-semibold text-balance"
          >
            {pricing.heading}
          </h2>
          <p className="text-body-lg text-muted-foreground">{pricing.subheading}</p>

          {pricing.isPlaceholder ? (
            <p className="flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-left text-small text-gold-800">
              <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{pricing.placeholderNotice}</span>
            </p>
          ) : null}
        </div>

        <RevealGroup
          as="ul"
          className="grid gap-4 md:grid-cols-3 md:items-start"
          stagger={0.08}
        >
          {ordered.map((tier) => (
            <li
              key={tier.id}
              data-reveal
              className={cn(
                "flex h-full flex-col gap-5 rounded-2xl border bg-card p-6 sm:p-7",
                tier.highlighted
                  ? "border-lavender-400 shadow-soft-lg md:order-2 md:-mt-3 md:pb-9"
                  : "border-border shadow-soft-sm md:order-1 last:md:order-3"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-h3 font-semibold">{tier.name}</h3>
                  {tier.badge ? <Badge>{tier.badge}</Badge> : null}
                </div>
                <p className="font-heading text-h2 font-semibold tabular-nums">
                  {tier.price}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.included ? (
                      <CheckIcon
                        className="mt-0.5 size-4 shrink-0 text-mint-700"
                        aria-hidden
                      />
                    ) : (
                      <XIcon
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "text-small text-pretty",
                        f.included ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {/* State in text, not colour alone. */}
                      <span className="sr-only">
                        {f.included ? "Included: " : "Not included: "}
                      </span>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-1">
                <Button
                  size="xl"
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full"
                  render={<Link href={tier.cta.href} prefetch={false} />}
                >
                  {tier.cta.label}
                </Button>
              </div>
            </li>
          ))}
        </RevealGroup>

        <p className="text-center text-small text-muted-foreground">
          {pricing.guarantee}
        </p>
      </div>
    </section>
  )
}
