import Link from "next/link"
import {
  CameraIcon,
  ClockIcon,
  SparklesIcon,
  TypeIcon,
  DownloadIcon,
  ArrowRightIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RevealGroup } from "@/components/motion/gsap-reveal"
import { PlaceholderIllustration } from "@/components/placeholder"
import { core } from "@/content/core"

const ICONS = {
  camera: CameraIcon,
  clock: ClockIcon,
  sparkles: SparklesIcon,
  type: TypeIcon,
  download: DownloadIcon,
} as const

const TONE_STYLES = {
  lavender: "bg-lavender-100 text-lavender-800",
  sky: "bg-sky-100 text-sky-800",
  gold: "bg-gold-100 text-gold-800",
  mint: "bg-mint-100 text-mint-800",
} as const

function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-reveal
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-7",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Section 04 — Core.
 *
 * Asymmetric bento: the consistency claim takes the wide cell because it is
 * the product's entire competitive argument, with the five supporting
 * benefits arranged around it.
 *
 * Server Component; only the scroll reveal is a client island.
 */
export function Core() {
  const [first, second, ...rest] = core.cards

  return (
    <section id="core" aria-labelledby="core-heading" className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 sm:px-8">
        <h2
          id="core-heading"
          className="max-w-2xl font-heading text-h1 font-semibold text-balance"
        >
          {core.heading}
        </h2>

        <RevealGroup className="grid gap-4 lg:grid-cols-3">
          {/* Lead card — spans two columns on desktop. */}
          <Card className="lg:col-span-2 lg:row-span-2">
            <div className="flex items-end gap-2.5">
              {core.lead.pages.map((label) => (
                <figure key={label} className="flex flex-1 flex-col gap-1.5">
                  <div className="aspect-[3/2] overflow-hidden rounded-xl">
                    <PlaceholderIllustration variant="page" className="rounded-xl" />
                  </div>
                  <figcaption className="text-center text-micro text-muted-foreground tabular-nums">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <h3 className="font-heading text-h2 font-semibold">{core.lead.title}</h3>
              <p className="max-w-lg text-body text-muted-foreground text-pretty">
                {core.lead.body}
              </p>
            </div>

            <div>
              <Button
                variant="outline"
                size="lg"
                render={<Link href={core.lead.cta.href} />}
              >
                {core.lead.cta.label}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </Card>

          {[first, second].map((card) => {
            const Icon = ICONS[card.icon]
            return (
              <Card key={card.id}>
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    TONE_STYLES[card.tone]
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-h3 font-semibold">{card.title}</h3>
                  <p className="text-small text-muted-foreground text-pretty">
                    {card.body}
                  </p>
                </div>
              </Card>
            )
          })}

          {rest.map((card) => {
            const Icon = ICONS[card.icon]
            return (
              <Card key={card.id}>
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    TONE_STYLES[card.tone]
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-h3 font-semibold">{card.title}</h3>
                  <p className="text-small text-muted-foreground text-pretty">
                    {card.body}
                  </p>
                </div>
              </Card>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
