"use client"

import * as React from "react"

/**
 * Live contrast measurement.
 *
 * Reads the ACTUAL computed colours off the DOM rather than trusting numbers
 * pasted in from a build script — so if a token is edited, this page
 * immediately tells the truth about it instead of going quietly stale.
 *
 * Canvas normalises any CSS colour (including oklch) to #rrggbb, which gives
 * us sRGB channels to run the WCAG relative-luminance formula on.
 */

/**
 * Resolves a CSS expression (including `var(--token)`) to an absolute colour.
 *
 * Canvas cannot parse `var()` — feeding it one silently leaves fillStyle at
 * its previous value, which makes every pair measure 1.00:1. So the variable
 * is resolved through the cascade first, then handed to canvas.
 */
function resolve(expr: string): string {
  const el = document.createElement("span")
  el.style.color = expr
  el.style.display = "none"
  document.body.appendChild(el)
  const computed = getComputedStyle(el).color
  el.remove()
  return computed
}

/**
 * Resolves any CSS colour to sRGB channels by painting it and reading the
 * pixel back.
 *
 * Reading `ctx.fillStyle` after assignment does NOT work here: Chrome keeps
 * wide-gamut inputs like `oklch()` in their own space rather than normalising
 * to `#rrggbb`, so the string check fails and every pair reads as unmeasured.
 * Rasterising sidesteps the format question entirely — whatever the browser
 * actually paints is what a user actually sees, which is the thing WCAG is
 * asking about.
 */
function normalize(color: string): [number, number, number] | null {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null

  const resolved = resolve(color)
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = resolved
  ctx.fillRect(0, 0, 1, 1)

  try {
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    if (a === 0) return null
    return [r / 255, g / 255, b / 255]
  } catch {
    return null
  }
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

function ratio(fg: string, bg: string): number | null {
  const a = normalize(fg)
  const b = normalize(bg)
  if (!a || !b) return null
  const L = (c: [number, number, number]) => {
    const [r, g, bl] = c.map(lin)
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [hi, lo] = L(a) > L(b) ? [L(a), L(b)] : [L(b), L(a)]
  return (hi + 0.05) / (lo + 0.05)
}

export type Pair = {
  label: string
  fg: string
  bg: string
  /** "body" needs 4.5:1, "large" needs 3:1, "decorative" is exempt. */
  requirement: "body" | "large" | "decorative"
}

const noopSubscribe = () => () => {}

/**
 * True only after hydration. `useSyncExternalStore` rather than a
 * setState-in-effect mount flag — measurement needs the DOM, but it does not
 * need to go through component state to get there.
 */
function useIsClient() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

export function ContrastTable({ pairs }: { pairs: Pair[] }) {
  const isClient = useIsClient()

  const rows = React.useMemo(
    () =>
      isClient
        ? pairs.map((p) => ({
            label: p.label,
            value: ratio(p.fg, p.bg),
            requirement: p.requirement,
          }))
        : [],
    [isClient, pairs]
  )

  return (
    <table className="w-full border-collapse text-small">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="py-2 pr-4 font-medium">Pair</th>
          <th className="py-2 pr-4 font-medium">Ratio</th>
          <th className="py-2 pr-4 font-medium">Requires</th>
          <th className="py-2 font-medium">Result</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const need =
            r.requirement === "body" ? 4.5 : r.requirement === "large" ? 3 : 0
          const ok = r.value !== null && r.value >= need
          return (
            <tr key={r.label} className="border-b border-border/60">
              <td className="py-2 pr-4">{r.label}</td>
              <td className="py-2 pr-4 font-mono tabular-nums">
                {r.value === null ? "—" : `${r.value.toFixed(2)}:1`}
              </td>
              <td className="py-2 pr-4 text-muted-foreground">
                {r.requirement === "decorative" ? "exempt" : `${need}:1`}
              </td>
              <td className="py-2 font-medium">
                {r.requirement === "decorative" ? (
                  <span className="text-muted-foreground">decorative only</span>
                ) : ok ? (
                  <span className="text-mint-700">PASS</span>
                ) : (
                  <span className="text-destructive">FAIL</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
