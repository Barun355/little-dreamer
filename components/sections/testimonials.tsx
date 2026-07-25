import { StarIcon, InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { RevealGroup } from "@/components/motion/gsap-reveal"
import { PlaceholderAvatar } from "@/components/placeholder"
import { testimonials } from "@/content/conversion"

/**
 * Section 09 — Testimonials.
 *
 * Every entry is currently `isPlaceholder: true`. Rather than hide them (which
 * loses the layout) or print them as if real (which would be deceptive), the
 * section carries a visible, unmissable notice while any placeholder remains.
 * Delete the notice by replacing the entries with real, attributable quotes.
 */
export function Testimonials() {
  const hasPlaceholders = testimonials.items.some((t) => t.isPlaceholder)

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            id="testimonials-heading"
            className="font-heading text-h1 font-semibold text-balance"
          >
            {testimonials.heading}
          </h2>

          {hasPlaceholders ? (
            <p className="flex max-w-xl items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-left text-small text-gold-800">
              <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="text-pretty">{testimonials.placeholderNotice}</span>
            </p>
          ) : null}
        </div>

        <RevealGroup
          as="ul"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {testimonials.items.map((t) => (
            <li
              key={t.id}
              data-reveal
              data-placeholder-testimonial={t.isPlaceholder ? "true" : undefined}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft-sm"
            >
              {/* role="img" is required: aria-label is prohibited on a bare
                  div, which has no role to name. */}
              <div
                role="img"
                aria-label={`${t.stars} out of 5 stars`}
                className="flex items-center gap-0.5"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    aria-hidden
                    className={cn(
                      "size-4",
                      i < t.stars
                        ? "fill-gold-400 text-gold-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              <blockquote className="text-body text-pretty">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-3">
                <PlaceholderAvatar initials={t.initials} />
                <span className="flex flex-col">
                  <span className="text-small font-medium">{t.name}</span>
                  <span className="text-micro text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
