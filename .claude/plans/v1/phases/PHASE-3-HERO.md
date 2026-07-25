# Phase 3 — Hero & Trust Bar

**Goal:** Sections 02 and 03. The first screen — and the phase where the performance
budget is won or lost.

**Prerequisites:** P2 exit criteria met.

**Skill to load:** `core-3d-animation:motion-framer`

---

## Tasks

### 3.1 Hero structure — section 02

Server Component shell, client islands only where motion lives.

```
  eyebrow      "A Story as Unique as Your Child"
  h1           "Your child becomes the hero of their own storybook"
  subhead      "Upload one photo. Pick an adventure…"
  media        video player, 16:9, poster-first
  CTAs         [Try it free →]  [See sample books]
  reassurance  "No card needed · First 3 pages free · 4 min"
  ambience     drifting sparkles ✦ · ˚
```

### 3.2 Video — the LCP decision

**The poster image is the LCP element, never the video.**

- `<AspectRatio ratio={16/9}>` reserves space → zero CLS
- `next/image` poster, `priority`, `fetchPriority="high"`, explicit `sizes`
- `<video preload="none" playsInline>` with no `autoPlay`
- Click play → swap to the video element, or open a shadcn `Dialog` lightbox
- Placeholder A1/A2 until real assets exist (asset track)

> Autoplaying a 1080p hero video is the single most common way a landing page fails
> its LCP budget. The poster-first pattern is non-negotiable here (risk R5).

### 3.3 Headline motion

Motion, on mount, **not** scroll-triggered — it is above the fold.

- Word-by-word rise on the h1: `y: 16 → 0`, `opacity: 0 → 1`, stagger `0.04`
- Subhead and CTAs follow via `<StaggerGroup>`
- Ambient sparkles: slow independent float loops, `transform`-only, GPU-composited
- Reduced motion → everything renders final-state instantly, sparkles static

**Do not animate the LCP element's opacity from 0.** It delays LCP measurably. The
poster renders immediately; only text and chrome animate in.

### 3.4 Lottie (A9)

Optional accent near the brand mark. Lazy-loaded, intersection-gated, ≤200kb, static
SVG fallback until the real file exists. If it costs more than ~30kb of critical JS,
it moves below the fold or gets cut.

### 3.5 Trust bar — section 03

Four items: rating · COPPA · never-trains-AI · human-reviewed.
Pure Server Component. Icons + short labels, `Tooltip` for detail on desktop.
Horizontal scroll on mobile, wrapping grid on desktop.

> The 4.9/5 and 12,400-books figures are **invented**. They are social proof claims —
> shipping fabricated metrics is both a credibility and a legal risk. Mark them
> `TODO` in `content/copy.ts` and either substitute real numbers or remove the
> component before launch. Same family of problem as D3.

---

## Checkpoints

```
  □  C3.1   Hero renders at 375 / 768 / 1280 / 1920, no overflow
  □  C3.2   LCP < 2.0s on local production build, throttled Fast 3G + 4× CPU
  □  C3.3   LCP element IS the poster image — confirmed in Lighthouse trace
  □  C3.4   CLS = 0 across a full page load; AspectRatio reserves media space
  □  C3.5   Video does NOT download until play is clicked
              (Network tab: no .mp4 request on initial load)
  □  C3.6   Headline motion fires once on mount, never re-fires on scroll
  □  C3.7   Reduced motion → text at final state instantly, sparkles frozen,
              no autoplay anywhere
  □  C3.8   Both CTAs reach /create; keyboard-activatable; focus visible
  □  C3.9   Trust bar readable at 375 without truncation
  □  C3.10  Fabricated stats flagged TODO in content/copy.ts
  □  C3.11  Hero is fully readable with JS disabled
  □  C3.12  Client JS added by this phase < 40kb gzip (measured, before/after)
  □  C3.13  axe-core on hero + trust bar: 0 violations
```

**C3.3 and C3.5 are the phase gates.** If the video is the LCP element or it
downloads eagerly, the P7 performance target is already unreachable.

**Exit criteria:** C3.1–C3.13 pass.

---

## Risks

| Risk | Mitigation |
|---|---|
| Video destroys LCP (R5) | 3.2 poster-first; C3.3 + C3.5 verify |
| Sparkle loops burn CPU on low-end mobile | `transform`/`opacity` only; cap count; pause off-screen |
| Motion library pulled into the critical path (R1) | C3.12 measures the delta this phase |
| Animating the LCP element's opacity | Explicitly forbidden in 3.3 |
| Fabricated social proof ships | C3.10 |
