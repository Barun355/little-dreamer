"use client"

import { ScrollScene } from "@/components/motion/scroll-scene"
import { SCRUB_EASE } from "@/lib/motion"

/**
 * The line threading the four steps, drawn as you scroll.
 *
 * Desktop only: the zig-zag layout it traces does not exist below `md`, where
 * the steps are a single column. Purely decorative, so it is aria-hidden and
 * its absence costs nothing.
 *
 * Not pinned — this scrubs against the section as it passes, so there is no
 * scroll-jacking to opt out of on mobile.
 */
export function StepConnector() {
  return (
    <ScrollScene
      className="pointer-events-none absolute inset-0 hidden md:block"
      scrollTrigger={{
        start: "top 80%",
        end: "bottom 70%",
        scrub: 0.8,
        pin: false,
      }}
      build={({ tl, q }) => {
        // strokeDashoffset only — GSAP's DrawSVG is a paid plugin and this
        // needs nothing it provides.
        tl.fromTo(
          q(".sc-line"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: SCRUB_EASE }
        )
      }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="size-full"
      >
        {/* Faint full-length track so the path reads even before it draws. */}
        <path
          d="M50 0 L50 100"
          className="stroke-lavender-200"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
        {/*
          pathLength=1 normalises the dash maths, so a dashoffset of 1 hides
          the stroke and 0 reveals it regardless of the rendered height.
        */}
        <path
          d="M50 0 L50 100"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          className="sc-line stroke-lavender-500"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>
    </ScrollScene>
  )
}
