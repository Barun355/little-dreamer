# Phase 1 — Design System & Motion Primitives

**Goal:** Every colour, type step, spacing unit, motion primitive and asset
placeholder exists and is provably correct — before a single page section is built.

**Prerequisites:** P0 exit criteria met.

**Skill to load:** `meta-skills:modern-web-design`

---

## Tasks

### 1.1 Brand tokens → Tailwind v4 `@theme`

Tailwind v4 uses `@theme inline` in `app/globals.css`, **not** `tailwind.config.js`.
Overwrite the shadcn preset's palette with the brand palette from the product brief.

```
  PRIMARY      lavender      #8B5CF6
  SECONDARY    sky blue      #60A5FA
  ACCENT       golden yellow #FBBF24
  BACKGROUND   warm cream    #FFF9F3
  SUPPORT      mint green    #6EE7B7
```

Map these onto shadcn's **semantic** tokens — `--background`, `--foreground`,
`--primary`, `--muted`, `--card`, `--border`, `--ring` — so every primitive inherits
the brand automatically and no component ever hardcodes a hex.

Derive and verify a full tint/shade ramp (50→950) for lavender and sky.

> **Contrast is a hard gate, not a preference.** Golden `#FBBF24` on warm cream
> `#FFF9F3` is roughly 1.6:1 — it fails body text badly. It is usable only as a
> decorative fill or a large-display accent, never for copy. Every text/background
> pair goes in the table at C1.3 with a measured ratio.

**Dark mode:** the brand is explicitly warm, cream and dreamy. A dark theme is a
genuine design project, not a token flip. Recommendation: **ship light-only for v1**,
and set `next-themes` to `forcedTheme="light"` rather than shipping a broken auto
dark mode. Flag for later.

### 1.2 Type scale

Fluid scale with `clamp()`, 1.250 major-third on mobile widening to 1.333 on desktop.

```
  display    clamp(2.5rem, 6vw, 4.5rem)     hero headline
  h1         clamp(2rem, 4.5vw, 3.25rem)    section headings
  h2         clamp(1.5rem, 3vw, 2.25rem)    card titles
  h3         1.25rem                        sub-headings
  body-lg    1.125rem                       hero subhead, testimonial quotes
  body       1rem                           default
  small      0.875rem                       captions, trust bar
  micro      0.75rem                        legal, footnotes
```

**Fonts (decision D5, default applied):** `Fraunces` variable for display — warm,
slightly literary, carries "storybook" without being twee — and `Inter` for body.
Both free, both variable, loaded via `next/font/google` with `display: "swap"` and
subsetting. Confirm or override before P3.

### 1.3 Spacing, radius, elevation

- Spacing: 4px base, Tailwind default scale. Section rhythm `py-24 md:py-32`.
- Radius: generous — `--radius: 1rem` base, `1.5rem` for cards. Soft, not sharp;
  matches "gentle" in the brand brief.
- Shadows: soft, warm-tinted (lavender-tinted rather than neutral black), never
  harsh. Three steps: `sm` / `md` / `lg`.

### 1.4 Motion tokens → `lib/motion.ts`

One vocabulary, shared by all three libraries.

```
  DURATION    instant 0.15   fast 0.3   base 0.5   slow 0.8   scene 1.2
  EASING      out    [0.16, 1, 0.3, 1]      enter, most UI
              inOut  [0.65, 0, 0.35, 1]     bidirectional
              soft   [0.4, 0, 0.2, 1]       hovers, small moves
              scrub  "none"                 GSAP scrubbed — MUST be linear
  DISTANCE    sm 8px   md 16px   lg 32px   xl 64px
  STAGGER     tight 0.04   base 0.08   loose 0.15
```

Export Motion `Variants` objects (`fadeUp`, `fadeIn`, `scaleIn`, `staggerParent`) so
sections never hand-write transition configs.

### 1.5 Reduced-motion gate

`hooks/use-reduced-motion.ts` — a single source of truth consumed by all three
libraries:

- **Motion** → variants collapse to opacity-only, duration → `instant`
- **GSAP** → `ScrollTrigger` scenes register with scrub disabled; timelines jump to
  their end state via `progress(1)`
- **Lottie** → renders a static poster frame, autoplay off

Also add the CSS-level backstop in `globals.css`:

```
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
```

### 1.6 Motion primitives → `components/motion/`

| Component | Library | Contract |
|---|---|---|
| `<Reveal>` | Motion | Fades + rises children on viewport enter, once, respects RM |
| `<StaggerGroup>` | Motion | Parent orchestrating child stagger |
| `<ScrollScene>` | GSAP | `useGSAP` + `scope` + `ScrollTrigger`; children get a timeline |
| `<Parallax>` | GSAP | Scrubbed y-translate layer, `speed` prop |
| `<Lottie>` | dotLottie | Lazy, intersection-gated, RM-aware, poster fallback |

**`<ScrollScene>` is the one that must be right.** It is the wrapper every scroll
animation in P4–P6 depends on. It must:
- be `"use client"`
- call `gsap.registerPlugin(ScrollTrigger)` exactly once, module-scope
- use `useGSAP(() => {...}, { scope: ref })` — never bare `useEffect`
- return cleanly under React 19 StrictMode double-invocation
- accept `matchMedia` breakpoint config so mobile can opt out of pinning

### 1.7 Placeholder components → `components/placeholder/`

Typed stand-ins for all 12 tracked assets. Every one renders a **diagonal-hatch fill,
a dimension label, and the asset ID** (`A3`, `A7`…) so an unreplaced asset is
impossible to miss in review. Props mirror the real asset's API so swapping is a
one-line change.

### 1.8 Token proof page

`app/_dev/tokens/page.tsx` — not linked from anywhere, deleted before launch.
Renders every colour with its measured contrast ratio, every type step, every
spacing unit, every shadow, every motion primitive firing, and every placeholder.

This is the artifact that makes C1.x verifiable rather than assertions.

---

## Checkpoints

```
  □  C1.1   /_dev/tokens renders every token with no missing values
  □  C1.2   All 5 brand colours resolve through semantic shadcn tokens;
              grep finds ZERO raw hex values in components/
  □  C1.3   Contrast table complete, every body pair ≥ 4.5:1,
              every large-text pair ≥ 3:1 — MEASURED, not eyeballed
  □  C1.4   Golden yellow is documented as decorative-only
  □  C1.5   Type scale fluid from 375 → 1920 with no overflow at any width
  □  C1.6   Fonts load via next/font; no layout shift on refresh (CLS 0)
  □  C1.7   <Reveal> and <StaggerGroup> fire on viewport enter
  □  C1.8   <ScrollScene> mounts, animates, and FULLY cleans up:
              navigate away and back 5× → ScrollTrigger.getAll().length
              returns to its baseline, not growing
  □  C1.9   StrictMode double-invocation produces no duplicate triggers
  □  C1.10  OS reduced-motion ON → all three libraries visibly degrade;
              no scrub, no autoplay, content still fully readable
  □  C1.11  All 12 placeholders render with visible ID + dimensions
  □  C1.12  pnpm build passes
```

**C1.8 is the phase's real gate.** A leaking ScrollTrigger is invisible in
development and destroys P4. Prove cleanup here or pay for it later.

**Exit criteria:** C1.1–C1.12 pass. No page section built yet.

---

## Risks

| Risk | Mitigation |
|---|---|
| shadcn preset colours bleed through (R4) | C1.2 greps for raw hex; semantic tokens only |
| Golden-on-cream shipped as body text | C1.3 + C1.4 make it an explicit gate |
| GSAP leak under StrictMode (R2) | C1.8 / C1.9 — the phase does not exit without them |
| Dark mode half-built | Explicitly deferred in 1.1 with `forcedTheme="light"` |
| Font choice churns later | D5 flagged now, cheap to change before P3 |
