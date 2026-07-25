"use client"

import { ArrowRightIcon } from "lucide-react"

import { ScrollScene } from "@/components/motion/scroll-scene"
import { SCRUB_EASE } from "@/lib/motion"
import { PlaceholderIllustration } from "@/components/placeholder"
import { ComparisonSlider } from "./comparison-slider"
import { proof } from "@/content/core"

/**
 * Section 05 — the Proof scene.
 *
 * A pinned, scrubbed timeline that shows the pipeline doing the one thing
 * competitors fail at: photo → one character reference → six pages that all
 * hold the same likeness.
 *
 * DESKTOP / TABLET  pinned, scrubbed, full choreography.
 * MOBILE            NOT pinned. The same elements simply animate in as the
 *                   section passes. Pinned scroll-jacking on a phone reads
 *                   as a broken page, and phones are the majority device
 *                   for the parents this is aimed at.
 * REDUCED MOTION    ScrollScene builds the timeline and jumps it to its end
 *                   state — every element visible, nothing moving.
 */
export function ProofScene() {
  return (
    <ScrollScene
      className="relative"
      scrollTrigger={(c) =>
        c.mobile
          ? { start: "top 75%", end: "bottom 60%", scrub: 0.6, pin: false }
          : {
              start: "top top",
              end: "+=140%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            }
      }
      build={({ tl, q, conditions }) => {
        const soft = { ease: SCRUB_EASE }

        tl.from(q(".pf-photo"), { autoAlpha: 0, y: 24, ...soft }, 0)
          .fromTo(
            q(".pf-arrow"),
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, ...soft },
            0.15
          )
          .from(q(".pf-ref"), { autoAlpha: 0, y: 24, ...soft }, 0.3)
          .fromTo(
            q(".pf-connector"),
            { scaleY: 0, transformOrigin: "top center" },
            { scaleY: 1, ...soft },
            0.45
          )
          .from(
            q(".pf-page"),
            { autoAlpha: 0, y: 32, stagger: 0.06, ...soft },
            0.55
          )
          .from(q(".pf-label"), { autoAlpha: 0, stagger: 0.03, ...soft }, 0.75)
          .from(q(".pf-compare"), { autoAlpha: 0, y: 16, ...soft }, 0.85)

        // On mobile the timeline is short and unpinned, so give it a little
        // tail rather than ending abruptly at the section boundary.
        if (conditions.mobile) tl.to({}, { duration: 0.1 })
      }}
    >
      <div className="mx-auto flex min-h-[80svh] max-w-5xl flex-col justify-center gap-8 px-5 py-16 sm:px-8">
        {/* photo -> reference */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <figure className="pf-photo gpu-layer flex w-28 flex-col items-center gap-2 sm:w-40">
            <div className="aspect-square w-full overflow-hidden rounded-2xl">
              <PlaceholderIllustration variant="photo" className="rounded-2xl" />
            </div>
            <figcaption className="text-center">
              <span className="block text-small font-semibold">
                {proof.steps.photo.label}
              </span>
              <span className="block text-micro text-muted-foreground">
                {proof.steps.photo.caption}
              </span>
            </figcaption>
          </figure>

          <div className="pf-arrow gpu-layer flex h-0.5 w-10 items-center bg-lavender-400 sm:w-20">
            <ArrowRightIcon
              className="ml-auto size-4 shrink-0 text-lavender-500"
              aria-hidden
            />
          </div>

          <figure className="pf-ref gpu-layer flex w-28 flex-col items-center gap-2 sm:w-40">
            <div className="aspect-square w-full overflow-hidden rounded-2xl ring-2 ring-lavender-400 ring-offset-2 ring-offset-background">
              <PlaceholderIllustration variant="character" className="rounded-2xl" />
            </div>
            <figcaption className="text-center">
              <span className="block text-small font-semibold">
                {proof.steps.reference.label}
              </span>
              <span className="block text-micro text-muted-foreground">
                {proof.steps.reference.caption}
              </span>
            </figcaption>
          </figure>
        </div>

        {/* connector */}
        <div
          className="pf-connector gpu-layer mx-auto h-8 w-0.5 bg-lavender-300"
          aria-hidden
        />

        {/* six pages */}
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {proof.sections.map((s) => (
            <li key={s.id} className="flex flex-col gap-1.5">
              <div className="pf-page gpu-layer aspect-[3/2] overflow-hidden rounded-lg">
                <PlaceholderIllustration variant="page" className="rounded-lg" />
              </div>
              <span className="pf-label gpu-layer text-center text-micro text-muted-foreground">
                {s.label}
              </span>
            </li>
          ))}
        </ul>

        {/*
          The slider owns its own state. ScrollScene's useGSAP is keyed on
          [reduced, desktopOnly], so slider re-renders never rebuild the
          timeline.
        */}
        <div className="pf-compare gpu-layer">
          <ComparisonSlider />
        </div>
      </div>
    </ScrollScene>
  )
}
