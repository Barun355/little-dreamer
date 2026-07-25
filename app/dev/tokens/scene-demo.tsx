"use client"

import { ScrollScene } from "@/components/motion/scroll-scene"
import { SCRUB_EASE } from "@/lib/motion"

/**
 * Exercises <ScrollScene> end to end: pinning, scrubbing, scoped selection,
 * responsive opt-out and reduced-motion collapse.
 *
 * Exists so C1.8 / C1.9 (cleanup and StrictMode safety) can be verified
 * against a real pinned scene rather than asserted.
 */
export function SceneDemo() {
  return (
    <ScrollScene
      desktopOnly
      className="relative h-[60vh] overflow-hidden rounded-md bg-lavender-50"
      scrollTrigger={{ start: "top 60%", end: "+=80%", scrub: 1, pin: false }}
      build={({ tl, q }) => {
        tl.from(q(".scene-card"), {
          yPercent: 40,
          opacity: 0,
          stagger: 0.1,
          ease: SCRUB_EASE,
        }).to(
          q(".scene-line"),
          { scaleX: 1, ease: SCRUB_EASE },
          0
        )
      }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <div
          className="scene-line h-0.5 w-2/3 origin-left scale-x-0 bg-lavender-400"
          aria-hidden
        />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="scene-card flex size-16 items-center justify-center rounded-lg bg-lavender-200 text-lavender-800"
            >
              {i}
            </div>
          ))}
        </div>
        <p className="text-small text-muted-foreground">
          Scrubbed on desktop · static below 768px · static under reduced motion
        </p>
      </div>
    </ScrollScene>
  )
}
