import type { Variants } from "motion/react"

/**
 * One motion vocabulary, shared by Motion, GSAP and Lottie.
 *
 * Sections never hand-write transition configs — they compose from here.
 * If a value needs changing, it changes in one place and the whole page
 * moves consistently.
 */

export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  base: 0.5,
  slow: 0.8,
  scene: 1.2,
} as const

export const EASING = {
  /** Enter transitions and most UI. Decisive, no overshoot. */
  out: [0.16, 1, 0.3, 1],
  /** Bidirectional moves. */
  inOut: [0.65, 0, 0.35, 1],
  /** Hovers and small nudges. */
  soft: [0.4, 0, 0.2, 1],
} as const

/**
 * GSAP equivalents of EASING above.
 *
 * GSAP takes named ease STRINGS; cubic-bezier arrays are a Motion idiom and
 * GSAP only accepts bezier syntax via the CustomEase plugin, which is not
 * worth loading for this. These are the closest native curves, so the two
 * libraries stay visually consistent without a third dependency.
 */
export const GSAP_EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  soft: "power1.out",
} as const

/**
 * GSAP scrubbed tweens MUST be linear. Easing a scrub decouples the
 * animation from the scrollbar and reads as lag, not polish.
 */
export const SCRUB_EASE = "none" as const

export const DISTANCE = { sm: 8, md: 16, lg: 32, xl: 64 } as const

export const STAGGER = { tight: 0.04, base: 0.08, loose: 0.15 } as const

// ─── Motion variants ─────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASING.out },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: DISTANCE.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASING.out },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASING.out },
  },
}

export const staggerParent = (stagger: number = STAGGER.base): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
})

/**
 * Reduced-motion equivalents. Opacity only — no translation, no scale.
 * Content still arrives, it just does not travel.
 */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.instant } },
}

/** Picks the right variant set for the current motion preference. */
export function variantsFor(reduced: boolean, full: Variants): Variants {
  return reduced ? reducedVariants : full
}
