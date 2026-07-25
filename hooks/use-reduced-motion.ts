"use client"

import * as React from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Single source of truth for motion preference across Motion, GSAP and Lottie.
 *
 * Motion ships its own `useReducedMotion`, but GSAP and Lottie need the same
 * answer and it must be identical everywhere — three libraries disagreeing
 * about whether to animate is worse than none of them honouring it.
 *
 * SSR-safe: returns `false` on the server and on first client paint, then
 * corrects in a layout effect before paint. `useSyncExternalStore` keeps it
 * in sync if the user changes the OS setting while the page is open.
 */
/**
 * True once the browser has been idle after hydration.
 *
 * GSAP setup — building timelines, creating ScrollTriggers, inserting pin
 * spacers — is measurably expensive: it produced 250ms+ long tasks when it ran
 * inline with hydration. None of it is needed for first paint, and scroll
 * always begins well after. Deferring to idle keeps it off the critical path
 * without risking triggers being absent when the user reaches the section.
 *
 * Falls back to a short timeout where requestIdleCallback is unavailable.
 */
export function useDeferredUntilIdle(timeout = 400): boolean {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const go = () => {
      if (!cancelled) setReady(true)
    }

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(go, { timeout })
      return () => {
        cancelled = true
        w.cancelIdleCallback?.(handle)
      }
    }

    const t = window.setTimeout(go, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [timeout])

  return ready
}

export function useReducedMotion(): boolean {
  const subscribe = React.useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {}
    const mql = window.matchMedia(QUERY)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(QUERY).matches
  }, [])

  const getServerSnapshot = React.useCallback(() => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
