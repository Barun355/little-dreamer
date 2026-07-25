"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Registered once, at module scope. Registering inside a component re-runs
// on every mount and is a documented source of duplicate-plugin warnings.
gsap.registerPlugin(useGSAP, ScrollTrigger)

// Dev-only instrumentation so leak checks (PHASE-1 C1.8 / C1.9) can assert
// against the real trigger count instead of trusting that cleanup happened.
// Stripped from production builds by the constant-folded NODE_ENV check.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  ;(window as unknown as { __ScrollTrigger?: typeof ScrollTrigger }).__ScrollTrigger =
    ScrollTrigger
}

export type SceneConditions = {
  desktop: boolean
  tablet: boolean
  mobile: boolean
}

export type SceneContext = {
  /** The timeline the ScrollTrigger drives. Add tweens to this. */
  tl: gsap.core.Timeline
  /** The scene root element. */
  root: HTMLElement
  /** Selector scoped to `root` — never queries outside the scene. */
  q: gsap.utils.SelectorFunc
  conditions: SceneConditions
}

export type SceneBuilder = (ctx: SceneContext) => void

type ScrollSceneProps = {
  /** Builds the timeline. Called once per matched media condition. */
  build: SceneBuilder
  /** ScrollTrigger overrides. `trigger` defaults to the scene root. */
  scrollTrigger?: ScrollTrigger.Vars
  /**
   * When true, the scene does not run below 768px — children render in their
   * natural static state instead. Use for anything that pins: pinned
   * scroll-jacking on phones reads as broken, not premium.
   */
  desktopOnly?: boolean
  as?: "div" | "section"
  className?: string
  children?: React.ReactNode
}

/**
 * GSAP + ScrollTrigger wrapper.
 *
 * Every scroll animation in the page goes through this component so the
 * cleanup, scoping, reduced-motion and responsive rules are enforced in one
 * place rather than re-derived per section.
 *
 * Guarantees:
 *  - `useGSAP` with `scope` → full revert on unmount, safe under React 19
 *    StrictMode double-invocation
 *  - one ScrollTrigger per timeline, never one per tween
 *  - `gsap.matchMedia()` for responsive variants, auto-reverted on resize
 *  - reduced motion → timeline is built then jumped to its end state, with
 *    no ScrollTrigger created at all
 */
export function ScrollScene({
  build,
  scrollTrigger,
  desktopOnly = false,
  as: Tag = "div",
  className,
  children,
}: ScrollSceneProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = root.current
      if (!el) return

      const q = gsap.utils.selector(el)

      // Reduced motion: build the timeline so the end state is correct,
      // then jump straight to it. No ScrollTrigger, no scrub, no pinning.
      if (reduced) {
        const tl = gsap.timeline({ paused: true })
        build({
          tl,
          root: el,
          q,
          conditions: { desktop: true, tablet: false, mobile: false },
        })
        tl.progress(1).pause()
        return
      }

      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 768px) and (max-width: 1023.98px)",
          mobile: "(max-width: 767.98px)",
        },
        (ctx) => {
          const conditions = ctx.conditions as SceneConditions
          if (desktopOnly && conditions.mobile) return

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=100%",
              scrub: 1,
              // The timeline uses viewport-derived distances, so they must be
              // recomputed on resize rather than baked in at creation.
              invalidateOnRefresh: true,
              ...scrollTrigger,
            },
          })

          build({ tl, root: el, q, conditions })
        }
      )
    },
    {
      scope: root,
      dependencies: [reduced, desktopOnly],
      // useGSAP only reverts on UNMOUNT by default. Without this, the
      // ScrollTriggers created during the pre-hydration render (when the
      // reduced-motion snapshot is still false) survive after the preference
      // resolves to true — so "reduce motion" would leave live scrub
      // listeners attached. Verified by PHASE-1 C1.10a.
      revertOnUpdate: true,
    }
  )

  return (
    <Tag ref={root as never} className={cn(className)}>
      {children}
    </Tag>
  )
}
