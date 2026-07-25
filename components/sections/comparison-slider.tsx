"use client"

import * as React from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { AssetPlaceholder, PlaceholderIllustration } from "@/components/placeholder"
import { proof } from "@/content/core"

/** Consistent side — every page drawn from one locked character reference. */
function OursRow() {
  return (
    <div className="grid grid-cols-6 gap-2">
      {proof.sections.map((s) => (
        <div key={s.id} className="aspect-[3/2] overflow-hidden rounded-lg">
          <PlaceholderIllustration variant="page" className="rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/**
 * Drifting side — a different tone per page, standing in for the face
 * changing between illustrations when each page is redrawn from scratch.
 */
const DRIFT_TONES = ["sky", "mint", "gold", "lavender", "mint", "sky"] as const

function TheirsRow() {
  return (
    <div className="grid grid-cols-6 gap-2">
      {proof.sections.map((s, i) => (
        <div key={s.id} className="aspect-[3/2] overflow-hidden rounded-lg">
          <AssetPlaceholder
            id="A5"
            label="drifts"
            tone={DRIFT_TONES[i]}
            className="rounded-lg"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Before/after wipe comparing reference-locked pages against redraw-per-page.
 *
 * Operable three ways, all mandatory:
 *  - pointer (Pointer Events, so touch and pen work, not just mouse)
 *  - keyboard (arrows / Home / End on a real `role="slider"`)
 *  - reduced motion (collapses to a labelled static side-by-side, no drag)
 */
export function ComparisonSlider() {
  const reduced = useReducedMotion()
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState(55)
  const draggingRef = React.useRef(false)

  const setFromClientX = React.useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const pct = ((clientX - left) / width) * 100
    setValue(Math.min(100, Math.max(0, pct)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    setFromClientX(e.clientX)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    const map: Record<string, number> = {
      ArrowLeft: -step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowUp: step,
    }
    if (e.key in map) {
      e.preventDefault()
      setValue((v) => Math.min(100, Math.max(0, v + map[e.key])))
    } else if (e.key === "Home") {
      e.preventDefault()
      setValue(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setValue(100)
    }
  }

  // Reduced motion: no wipe, no drag — both rows shown, plainly labelled.
  if (reduced) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-small font-semibold text-lavender-700">
            {proof.comparison.ours}
          </p>
          <OursRow />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-small font-semibold text-muted-foreground">
            {proof.comparison.theirs}
          </p>
          <TheirsRow />
        </div>
        <p className="text-micro text-muted-foreground">
          {proof.comparison.disclaimer}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        data-comparison-track
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none overflow-hidden rounded-xl border border-border bg-card p-3 select-none"
      >
        {/* Base layer: the drifting comparison. */}
        <TheirsRow />

        {/* Wipe layer: ours, revealed from the left. */}
        <div
          className="absolute inset-0 p-3"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <OursRow />
        </div>

        {/* Divider + handle. */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-lavender-500"
          style={{ left: `${value}%` }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label={proof.comparison.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value)}
            aria-valuetext={`${Math.round(value)}% ${proof.comparison.ours}, ${
              100 - Math.round(value)
            }% ${proof.comparison.theirs}`}
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-background shadow-soft-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span aria-hidden className="text-micro font-semibold text-lavender-700">
              ⟷
            </span>
          </div>
        </div>

        {/* Side labels. */}
        <span className="absolute top-1.5 left-4 rounded-full bg-background/90 px-2 py-0.5 text-micro font-semibold text-lavender-700">
          {proof.comparison.ours}
        </span>
        <span className="absolute top-1.5 right-4 rounded-full bg-background/90 px-2 py-0.5 text-micro font-semibold text-muted-foreground">
          {proof.comparison.theirs}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-micro text-muted-foreground">{proof.comparison.hint}</p>
        <p className="text-micro text-muted-foreground">
          {proof.comparison.disclaimer}
        </p>
      </div>
    </div>
  )
}
