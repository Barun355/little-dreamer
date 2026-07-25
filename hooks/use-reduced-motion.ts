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
