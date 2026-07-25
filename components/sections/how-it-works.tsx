import { CameraIcon, PencilIcon, SparklesIcon, BookOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { RevealGroup } from "@/components/motion/gsap-reveal"
import { StepConnector } from "./step-connector"
import { howItWorks } from "@/content/journey"

const ICONS = {
  camera: CameraIcon,
  pencil: PencilIcon,
  sparkles: SparklesIcon,
  book: BookOpenIcon,
} as const

/**
 * Section 06 — How it works.
 *
 * Four steps, offset alternately on desktop so the eye zig-zags down the
 * connector. Server Component; the connector draw and the card reveal are
 * client islands.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="hiw-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col items-center gap-3">
          {/*
            Lottie was CUT here — measured at 656kb (623kb of it a WASM
            binary) against a 40kb decorative budget. A static glyph carries
            the same decorative weight for nothing. See PHASE-5 §5.4.
          */}
          <span aria-hidden className="text-h2 text-lavender-400">
            ✦
          </span>
          <h2
            id="hiw-heading"
            className="text-center font-heading text-h1 font-semibold text-balance"
          >
            {howItWorks.heading}
          </h2>
        </div>

        <div className="relative">
          <StepConnector />

          <RevealGroup as="ul" className="relative flex flex-col gap-6 md:gap-2">
            {howItWorks.steps.map((step, i) => {
              const Icon = ICONS[step.icon]
              const offset = i % 2 === 1
              return (
                <li
                  key={step.n}
                  data-reveal
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:w-[calc(50%-1.5rem)]",
                    offset ? "md:ml-auto" : "md:mr-auto"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lavender-600 text-small font-semibold text-primary-foreground tabular-nums"
                    >
                      {step.n}
                    </span>
                    <span className="flex size-9 items-center justify-center rounded-xl bg-lavender-100 text-lavender-800">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-heading text-h3 font-semibold">
                      <span className="sr-only">Step {step.n}: </span>
                      {step.title}
                    </h3>
                    <p className="text-small text-muted-foreground text-pretty">
                      {step.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
