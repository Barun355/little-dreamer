"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { useReducedMotion, useDeferredUntilIdle } from "@/hooks/use-reduced-motion"
import { DURATION, DISTANCE, STAGGER, GSAP_EASE } from "@/lib/motion"

gsap.registerPlugin(useGSAP, ScrollTrigger)

type RevealGroupProps = {
  children: React.ReactNode
  className?: string
  /** Selector for the items to stagger, scoped to this container. */
  selector?: string
  stagger?: number
  distance?: number
  as?: "div" | "ul" | "section"
}

/**
 * Staggered enter-on-scroll, built on GSAP rather than Motion.
 *
 * The landing page already loads GSAP for the pinned Proof scene, which is
 * non-negotiable — ScrollTrigger's pinning and scrubbing have no equivalent
 * in Motion. Adding Motion purely for fade-ups would mean shipping a second
 * ~50kb animation library to do something the first one already does.
 *
 * Motion is still the right tool for the app phase (gestures, layout
 * animations, shared-element transitions). It is simply not earning its
 * weight on a marketing page that already has GSAP.
 *
 * Uses ScrollTrigger.batch so N items share ONE trigger instead of N.
 */
export function RevealGroup({
  children,
  className,
  selector = "[data-reveal]",
  stagger = STAGGER.base,
  distance = DISTANCE.lg,
  as: Tag = "div",
}: RevealGroupProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const ready = useDeferredUntilIdle()

  useGSAP(
    () => {
      const el = root.current
      // Deferred to idle — see useDeferredUntilIdle.
      if (!el || !ready) return

      const items = gsap.utils.toArray<HTMLElement>(selector, el)
      if (!items.length) return

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0, clearProps: "transform" })
        return
      }

      gsap.set(items, { opacity: 0, y: distance })

      ScrollTrigger.batch(items, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: DURATION.base,
            ease: GSAP_EASE.out,
            stagger,
            overwrite: true,
          }),
      })
    },
    { scope: root, dependencies: [reduced, stagger, distance, ready], revertOnUpdate: true }
  )

  return (
    <Tag ref={root as never} className={cn(className)}>
      {children}
    </Tag>
  )
}
