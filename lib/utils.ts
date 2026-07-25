import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Custom font-size scale from globals.css (`--text-*`).
 *
 * tailwind-merge has to be told these are FONT SIZES. Without it, it sees
 * `text-body` and `text-primary-foreground` as two `text-*` utilities in the
 * same group and drops the earlier one — so `size="xl"` silently stripped the
 * white text off every primary button, leaving ink on lavender at 2.92:1.
 *
 * Caught by axe in Phase 6; the failure is invisible in review because the
 * button still looks deliberate, just wrong.
 */
const FONT_SIZES = [
  "micro",
  "small",
  "body",
  "body-lg",
  "h3",
  "h2",
  "h1",
  "display",
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": FONT_SIZES.map((s) => `text-${s}`),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
