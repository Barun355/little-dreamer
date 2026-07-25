"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { fadeUp, variantsFor, DURATION, STAGGER } from "@/lib/motion"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Override the default fade-up. */
  variants?: Variants
  /** Seconds to wait before animating. */
  delay?: number
  /** Fraction of the element that must be visible to trigger. */
  amount?: number
  as?: "div" | "section" | "li" | "span"
}

/**
 * Fades and rises its children when they scroll into view. Fires once.
 *
 * Motion, not GSAP: this is a one-shot enter transition, not scroll
 * choreography, and Motion's viewport API is lighter for the job.
 */
export function Reveal({
  children,
  className,
  variants,
  delay = 0,
  amount = 0.25,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion()
  const Comp = motion[as]

  return (
    <Comp
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variantsFor(reduced, variants ?? fadeUp)}
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </Comp>
  )
}

type StaggerGroupProps = {
  children: React.ReactNode
  className?: string
  /** Seconds between each child. */
  stagger?: number
  amount?: number
  as?: "div" | "ul" | "section"
}

/**
 * Parent orchestrator. Children must be <StaggerItem> (or any element using
 * the "hidden"/"visible" variant names) for the stagger to propagate.
 */
export function StaggerGroup({
  children,
  className,
  stagger = STAGGER.base,
  amount = 0.2,
  as = "div",
}: StaggerGroupProps) {
  const reduced = useReducedMotion()
  const Comp = motion[as]

  return (
    <Comp
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduced ? 0 : stagger },
        },
      }}
    >
      {children}
    </Comp>
  )
}

type StaggerItemProps = {
  children: React.ReactNode
  className?: string
  variants?: Variants
  as?: "div" | "li" | "span"
}

export function StaggerItem({
  children,
  className,
  variants,
  as = "div",
}: StaggerItemProps) {
  const reduced = useReducedMotion()
  const Comp = motion[as]

  return (
    <Comp className={cn(className)} variants={variantsFor(reduced, variants ?? fadeUp)}>
      {children}
    </Comp>
  )
}

/** Ambient float loop — sparkles, drifting glyphs. Pauses under reduced motion. */
export function Drift({
  children,
  className,
  distance = 10,
  duration = 6,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  distance?: number
  duration?: number
  delay?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div
      className={cn(className)}
      aria-hidden
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "loop",
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  )
}

export { DURATION }
