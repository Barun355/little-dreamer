import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Typed stand-ins for the 12 tracked assets (IMPLEMENTATION §8).
 *
 * Deliberately loud — diagonal hatching, the asset ID and the required
 * dimensions are all visible — so an unreplaced asset cannot quietly survive
 * a review and reach production. Props mirror the real asset's API so
 * swapping one in is a one-line change.
 */

const HATCH =
  "repeating-linear-gradient(45deg," +
  "var(--hatch-a) 0 8px," +
  "var(--hatch-b) 8px 16px)"

type Tone = "lavender" | "sky" | "gold" | "mint" | "neutral"

const TONES: Record<Tone, { a: string; b: string; ink: string }> = {
  lavender: { a: "var(--color-lavender-100)", b: "var(--color-lavender-200)", ink: "var(--color-lavender-800)" },
  sky: { a: "var(--color-sky-100)", b: "var(--color-sky-200)", ink: "var(--color-sky-800)" },
  gold: { a: "var(--color-gold-100)", b: "var(--color-gold-200)", ink: "var(--color-gold-800)" },
  mint: { a: "var(--color-mint-100)", b: "var(--color-mint-200)", ink: "var(--color-mint-800)" },
  neutral: { a: "var(--color-muted)", b: "var(--color-border)", ink: "var(--color-muted-foreground)" },
}

export type AssetPlaceholderProps = {
  /** Asset ID from the tracking table, e.g. "A3". */
  id: string
  /** Human label, e.g. "Character reference". */
  label: string
  /** Required final dimensions, e.g. "800×800". */
  dimensions?: string
  tone?: Tone
  className?: string
  children?: React.ReactNode
}

export function AssetPlaceholder({
  id,
  label,
  dimensions,
  tone = "lavender",
  className,
  children,
}: AssetPlaceholderProps) {
  const t = TONES[tone]

  return (
    <div
      role="img"
      aria-label={`Placeholder for ${label}. Asset ${id} not yet supplied.`}
      data-placeholder={id}
      className={cn(
        "relative flex size-full min-h-24 flex-col items-center justify-center overflow-hidden rounded-lg",
        className
      )}
      style={
        {
          "--hatch-a": t.a,
          "--hatch-b": t.b,
          backgroundImage: HATCH,
          color: t.ink,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col items-center gap-0.5 rounded-md bg-background/85 px-2.5 py-1.5 text-center">
        <span className="font-mono text-micro font-semibold tracking-wide">{id}</span>
        <span className="text-micro leading-tight font-medium">{label}</span>
        {dimensions ? (
          <span className="text-micro opacity-70 tabular-nums">{dimensions}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** A1/A2 — hero video poster. */
export function PlaceholderPoster({ className }: { className?: string }) {
  return (
    <AssetPlaceholder
      id="A1/A2"
      label="Hero video + poster"
      dimensions="1920×1080"
      tone="lavender"
      className={className}
    />
  )
}

/** A3/A4/A5 — the proof section imagery. */
export function PlaceholderIllustration({
  variant,
  className,
}: {
  variant: "photo" | "character" | "page"
  className?: string
}) {
  const map = {
    photo: { id: "A3", label: "Source photo", dimensions: "800×800", tone: "sky" },
    character: { id: "A4", label: "Character reference", dimensions: "800×800", tone: "lavender" },
    page: { id: "A5", label: "Page illustration", dimensions: "1536×1024", tone: "gold" },
  } as const

  const a = map[variant]
  return (
    <AssetPlaceholder
      id={a.id}
      label={a.label}
      dimensions={a.dimensions}
      tone={a.tone}
      className={className}
    />
  )
}

/** A6 — theme thumbnails. */
export function PlaceholderTheme({
  name,
  tone = "mint",
  className,
}: {
  name: string
  tone?: Tone
  className?: string
}) {
  return (
    <AssetPlaceholder
      id="A6"
      label={name}
      dimensions="400×400"
      tone={tone}
      className={className}
    />
  )
}

/** A7 — sample book spreads. */
export function PlaceholderSpread({ className }: { className?: string }) {
  return (
    <AssetPlaceholder
      id="A7"
      label="Sample spread"
      dimensions="2048×1365"
      tone="gold"
      className={className}
    />
  )
}

/** A8 — testimonial avatars. Initials on a tinted circle. */
export function PlaceholderAvatar({
  initials,
  className,
}: {
  initials: string
  className?: string
}) {
  return (
    <div
      data-placeholder="A8"
      aria-hidden
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-lavender-100 text-small font-semibold text-lavender-800",
        className
      )}
    >
      {initials}
    </div>
  )
}

/** A9/A10 — Lottie fallbacks. Static, no player required. */
export function PlaceholderLottie({
  id,
  label,
  className,
}: {
  id: "A9" | "A10"
  label: string
  className?: string
}) {
  return (
    <AssetPlaceholder
      id={id}
      label={label}
      dimensions="lottie"
      tone="mint"
      className={className}
    />
  )
}
