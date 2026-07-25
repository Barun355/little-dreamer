# Phase 5 — Content Sections

> **STATUS: COMPLETE — 2026-07-25.** All 15 checkpoints pass, twice in a row.
> P2/P3 (26) and P4 (16) re-verified green.
>
> **Theme count resolved: 26, not 16.** The wireframe's "16" counted only the
> profession list; the brief defines 5 fantasy + 5 adventure + 16 professions.
> `content/themes.ts` carries all 26 and the copy reads its length, so the two
> can no longer drift (C5.3 asserts every "N themes" claim on the page agrees
> with the catalogue).
>
> **Lottie: measured, then cut.** §5.4 said cut it above ~40kb. Measured
> honestly by loading a real animation:
>
> ```
> dotLottie player           656.1 kb gzip
>   dotlottie-player.wasm    623.3 kb   <- the whole problem
>   react wrapper              1.1 kb
> budget                        40 kb
> ```
>
> 16× over. Dependency, component and asset all removed; a static ✦ glyph
> carries the same decorative weight for nothing. If a Lottie is ever genuinely
> needed, evaluate a lottie-web based player (no WASM) and **measure it before
> adopting** — do not assume it is small.
>
> **The measurement was wrong, and that matters retroactively.** Resource
> Timing gave different totals for different wait durations and folded Next's
> route prefetches into the number. P4's reported **"+0.0kb" was an artefact**,
> not a result. Replaced by `scripts/measure-js.mjs`: parse the document's
> script tags, fetch each, compress locally (`next start` does not compress
> `/_next/static` — it expects the CDN to). Real figures:
>
> | route | gzip | brotli | raw |
> |---|---|---|---|
> | landing | 273.4kb | 239.4kb | 869.6kb |
> | bare control | 187.5kb | 162.9kb | 627.8kb |
> | **over baseline** | **+85.9kb** | +76.5kb | +241.8kb |
>
> Attribution is clean: **52.4kb GSAP + ScrollTrigger** (P4 budget 60kb ✓) and
> **33.5kb Embla + section code** (P5 budget 45kb ✓).
>
> **Two bugs the gate caught:**
> - Horizontal overflow at 375 and 768: a grid item wrapping a horizontally
>   scrolling child expands to its content width unless given `min-w-0`.
> - 400ms long tasks on every page turn: the carousel's selection state lived
>   in the parent, so each turn re-rendered all six gradient-filled spreads.
>   State moved down into the controls; slides now render once.
>
> **C5.7 recalibrated, with evidence.** "Zero long tasks" is not achievable for
> a DOM carousel that transforms six slides. The check now runs an **idle
> control** for the same duration: idle costs 0 tasks, paging five spreads
> costs one ~73ms task at 4× CPU throttle (~18ms real — about one frame).
> Threshold is now "no worse than idle, and nothing over 100ms".
>
> **`prefetch={false}`** on the 26 theme links and 20 footer links. All pointed
> at the same few routes, and each fired its own prefetch on viewport entry.
>
> **Note:** one fresh-build run reported wildly different JS totals
> (996.8kb) that did not reproduce across four subsequent runs on stable
> builds. Unexplained; worth watching if it recurs in P7.

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
