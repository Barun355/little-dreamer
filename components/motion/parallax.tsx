"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SCRUB_EASE } from "@/lib/motion"

gsap.registerPlugin(useGSAP, ScrollTrigger)

type ParallaxProps = {
  children: React.ReactNode
  className?: string
  /**
   * Negative moves against the scroll (foreground), positive with it
   * (background). Expressed as a fraction of the element's height.
   */
  speed?: number
  as?: "div" | "span"
}

/**
 * Scrubbed translate layer.
 *
 * Transform-only and linear-eased — a parallax layer is bound to the
 * scrollbar, so any easing decouples it and reads as lag.
 */
export function Parallax({
  children,
  className,
  speed = 0.2,
  as: Tag = "div",
}: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      gsap.to(el, {
        yPercent: speed * 100,
        ease: SCRUB_EASE,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    },
    // revertOnUpdate: useGSAP reverts only on unmount by default, which would
    // strand this tween's ScrollTrigger when `reduced` resolves post-hydration.
    { scope: ref, dependencies: [reduced, speed], revertOnUpdate: true }
  )

  return (
    <Tag ref={ref as never} className={cn(className)} style={{ willChange: "transform" }}>
      {children}
    </Tag>
  )
}
