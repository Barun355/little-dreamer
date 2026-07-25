# Phase 5 — Content Sections

**Goal:** Sections 06 (How it works), 07 (Themes) and 08 (Sample spread).

**Prerequisites:** P4 exit criteria met.

**Skills to load:** `animation-components:lottie-animations`,
`animation-components:scroll-reveal-libraries`

---

## Tasks

### 5.1 How it works — section 06

Four steps in the staggered zig-zag from `LANDING.md`: upload → tell us → we write →
read tonight.

- Desktop: alternating vertical offset, connector line drawn on scroll
- Mobile: single column, vertical connector
- Connector: SVG `stroke-dashoffset` scrubbed via `<ScrollScene>`
- Step numbers count in as each enters
- Pure Server Components + one `<ScrollScene>` wrapper for the connector

### 5.2 Themes — section 07

Three category columns (Fantasy · Adventure · I Want To Become), five visible each,
16 total, driven entirely from `content/themes.ts`.

```ts
type Theme = {
  id: string
  name: string
  category: "fantasy" | "adventure" | "become"
  thumbnail: string | null      // null → placeholder A6
  ageRange: [number, number]
}
```

- Hover: card lift + thumbnail scale (Motion, `whileHover`)
- Mobile: horizontal scroll-snap per category
- "Browse all 16 themes" → `/create` for now

> The brief lists 16 professions under "I Want To Become" alone, plus 5 fantasy and
> 5 adventure — 26 total, not 16. `content/themes.ts` must be the single source of
> truth and the "16 themes" copy in section 04 must match whatever it actually
> contains. **Decide the real launch count before writing the file** — mismatched
> counts across sections is the kind of detail reviewers notice immediately.

### 5.3 Sample spread — section 08

Two-page book spread with a centre spine, illustration left, story text right,
paginated through six spreads.

- shadcn `Carousel` — gives keyboard, drag, and ARIA for free
- Page-turn transition: Motion, subtle 3D `rotateY` with `transform-style: preserve-3d`
- Dot indicators, prev/next controls
- Spread shadow along the spine for physicality
- Placeholder A7 until real spreads exist

**Accessibility:** carousel is a labelled region, controls have discernible names,
`aria-live="polite"` announces the current spread, autoplay off (or pausable).

### 5.4 Lottie integration (A9/A10)

First real `<Lottie>` usage. Confirm the lazy + intersection-gated + reduced-motion
contract from P1 holds in practice, and measure the actual bundle cost of
`@lottiefiles/dotlottie-react`. **If it exceeds ~40kb gzip for decorative-only use,
cut it** and keep the Motion/SVG fallbacks — a marketing page does not owe anyone a
Lottie.

---

## Checkpoints

```
  □  C5.1   All three sections render at 375 / 768 / 1280 / 1920
  □  C5.2   Every theme renders from content/themes.ts — zero hardcoded
              theme markup in components
  □  C5.3   Theme count in section 04 copy === themes.ts length (D-decision
              resolved and consistent)
  □  C5.4   Connector line draws in sync with scroll; resets correctly on
              scroll-up
  □  C5.5   Carousel: keyboard arrows navigate, focus stays managed,
              aria-live announces spread changes
  □  C5.6   Carousel drag works on touch; no vertical-scroll hijack
  □  C5.7   Page-turn animation 60fps; no flicker on transform-style
  □  C5.8   Reduced motion → connector renders complete, page turns become
              instant cross-fades, no 3D rotation
  □  C5.9   Lottie lazy-loads only on viewport entry (Network tab confirms)
  □  C5.10  Lottie bundle cost measured; cut if > 40kb gzip decorative
  □  C5.11  Theme mobile scroll-snap lands cleanly on each card
  □  C5.12  All sections readable with JS disabled (carousel degrades to a
              scrollable list)
  □  C5.13  Client JS added this phase < 45kb gzip
  □  C5.14  axe-core: 0 violations
```

**Exit criteria:** C5.1–C5.14 pass.

---

## Risks

| Risk | Mitigation |
|---|---|
| Theme count inconsistent across sections | C5.2 + C5.3 — single source of truth |
| Carousel is a common a11y failure | shadcn primitive + C5.5/C5.6 |
| Lottie added for its own sake (R1) | 5.4 gives it an explicit budget and a cut rule |
| 3D page-turn flickers on Safari | `preserve-3d` + `backface-visibility`; C5.7 |
| Placeholder theme art looks unfinished (R3) | A6 tracked; gradient-per-category is deliberately decorative |
