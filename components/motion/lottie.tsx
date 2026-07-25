"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// The player is ~40kb. It must never sit in the initial bundle for what is
// always decorative content, so it is dynamically imported AND gated behind
// an IntersectionObserver.
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false }
)

type LottieProps = {
  /** Path to a .lottie file under /public. */
  src: string
  /**
   * Rendered until the animation enters the viewport, and permanently under
   * reduced motion. Required — a Lottie with no fallback is a blank box for
   * anyone who cannot or chooses not to load it.
   */
  fallback: React.ReactNode
  className?: string
  loop?: boolean
  /** Accessible name. Omit for purely decorative art (then it is aria-hidden). */
  label?: string
}

export function Lottie({
  src,
  fallback,
  className,
  loop = true,
  label,
}: LottieProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "200px" }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true }

  return (
    <div ref={ref} className={cn(className)} {...a11y}>
      {reduced || !visible ? (
        fallback
      ) : (
        <DotLottieReact src={src} loop={loop} autoplay className="size-full" />
      )}
    </div>
  )
}
