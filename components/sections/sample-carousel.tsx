"use client"

import * as React from "react"
import type { CarouselApi } from "@/components/ui/carousel"

import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { PlaceholderSpread } from "@/components/placeholder"
import { sample } from "@/content/journey"

/**
 * Dot controls and the live region.
 *
 * Deliberately a SEPARATE component that owns `current` itself. When this
 * state lived in the parent, every page turn re-rendered all six spreads —
 * and each spread contains a gradient-filled placeholder, so React's
 * reconciliation plus the repaint produced 400ms long tasks. Keeping the
 * selection state down here means the slides render once and never again.
 */
function CarouselControls({ api, total }: { api?: CarouselApi; total: number }) {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  return (
    <>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to spread ${i + 1} of ${total}`}
            aria-current={i === current ? "true" : undefined}
            className={cn(
              "size-2 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              i === current ? "bg-lavender-600" : "bg-lavender-200"
            )}
          />
        ))}
      </div>

      {/*
        Embla changes slides without announcing anything. Without this a
        screen-reader user hears silence after pressing the next button.
      */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        Spread {current + 1} of {total}
      </p>
    </>
  )
}

/** The six spreads. Rendered once — see CarouselControls above. */
const Spreads = React.memo(function Spreads() {
  return (
    <CarouselContent>
      {sample.spreads.map((spread) => (
        <CarouselItem key={spread.id}>
          <div className="gpu-layer grid overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg sm:grid-cols-2">
            <div className="aspect-[3/2] sm:aspect-auto sm:min-h-72">
              <PlaceholderSpread className="size-full rounded-none" />
            </div>

            <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-8">
              {/* Spine shadow — physicality, decorative only. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-px hidden w-6 bg-gradient-to-r from-lavender-950/10 to-transparent sm:block"
              />
              <p className="font-heading text-body-lg leading-relaxed text-pretty">
                {spread.text}
              </p>
              <p className="text-right text-micro text-muted-foreground tabular-nums">
                &mdash; {spread.page}
              </p>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  )
})

/**
 * Book-spread carousel.
 *
 * Built on the shadcn Carousel (Embla) rather than hand-rolled, so keyboard
 * navigation, drag and the ARIA roles come from a maintained primitive.
 */
export function SampleCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const total = sample.spreads.length

  return (
    <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
      <Spreads />

      <div className="mt-4 flex items-center justify-between gap-4">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselControls api={api} total={total} />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  )
}
