/**
 * Copy for sections 04 (Core) and 05 (Proof).
 *
 * The lead card is deliberately the character-consistency claim. Competitor
 * research across eight AI storybook tools found consistency is the #1
 * purchase criterion AND the most-cited failure — reviewers call it "the
 * underrated criterion", and buyers want the child to recognise themselves
 * on every page. That is the whole positioning, so it gets the widest card
 * and its own dedicated section below.
 */

import { themeCount } from "./themes"

export const core = {
  heading: "Why parents keep these books",
  lead: {
    title: "The same child on every page",
    body: "Most tools redraw your child from scratch for each page, and the face drifts. We lock one character reference first, then draw every page from it.",
    cta: { label: "See the difference", href: "#proof" },
    pages: ["p.2", "p.7", "p.11"],
  },
  cards: [
    {
      id: "one-photo",
      icon: "camera" as const,
      title: "One photo is enough",
      body: "We build a character sheet from a single clear photo, then draw every page from that.",
      tone: "sky" as const,
    },
    {
      id: "fast",
      icon: "clock" as const,
      title: "Ready before bedtime",
      body: "Story, cover and six illustrated pages in about four minutes.",
      tone: "gold" as const,
    },
    {
      id: "themes",
      // Derived from the catalogue, never typed. The wireframe said "16",
      // which counted only the profession list — the brief actually defines
      // 26 across three categories, and two sections disagreeing about the
      // number is exactly the detail a reader notices (PHASE-5 C5.3).
      icon: "sparkles" as const,
      title: `${themeCount} themes`,
      body: "Unicorns, space, dinosaurs — or the job they say they want to be when they grow up.",
      tone: "lavender" as const,
    },
    {
      id: "age",
      icon: "type" as const,
      title: "Written for their reading age",
      body: "Ages 3–5, 6–7 and 8–10 get genuinely different vocabulary, sentence length and plot.",
      tone: "mint" as const,
    },
    {
      id: "keep",
      icon: "download" as const,
      title: "Yours to keep",
      body: "A print-ready PDF today. Hardcover and audiobook are on the way.",
      tone: "sky" as const,
    },
  ],
} as const

export const proof = {
  heading: "One child. Six pages. Zero drift.",
  intro:
    "Your photo becomes a character reference. Every page is then drawn from that reference — not from scratch.",
  steps: {
    photo: { label: "Your photo", caption: "One clear face" },
    reference: { label: "Character reference", caption: "Built once" },
  },
  sections: [
    { id: "intro", label: "Intro" },
    { id: "ch1", label: "Ch 1" },
    { id: "ch2", label: "Ch 2" },
    { id: "ch3", label: "Ch 3" },
    { id: "ch4", label: "Ch 4" },
    { id: "ch5", label: "Ch 5" },
  ],
  comparison: {
    label: "Compare illustration consistency",
    ours: "Little Dreamer",
    theirs: "Typical AI tool",
    hint: "Drag, or use the arrow keys",
    /**
     * Honest framing: this compares our reference-locked pipeline against the
     * common redraw-per-page approach. It is an illustration of the technique,
     * not a benchmark against a named competitor — do not add brand names
     * here without evidence to back the claim.
     */
    disclaimer: "Illustration of technique, not a named-product benchmark.",
  },
} as const
