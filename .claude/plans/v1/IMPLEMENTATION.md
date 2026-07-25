# Little Dreamer — Landing Page Implementation Plan

> **Scope:** Marketing landing page only. No auth, no DB writes, no R2 uploads, no
> generation wizard. CTAs route to `/create` which is a stub in this build.
> **Design source:** [`LANDING.md`](./LANDING.md) — 13 sections, mobile, states, grid.
> **Status:** Plan only. No code written.

---

## 1 · Decisions locked

| Question | Answer | Consequence |
|---|---|---|
| Scope | **Landing page only** | Prisma/Neon/R2/TanStack Query are scaffolded but inert |
| Components | **shadcn/ui + Tailwind v4** | CLI-scaffolded, restyled to brand palette |
| Motion | **Motion + GSAP ScrollTrigger + Lottie** | Three libraries, each with a defined job (§5) |
| Assets | **None yet** | Placeholder contracts + a parallel asset track (§8) |

---

## 2 · Verified toolchain

Checked live on 2026-07-25, not assumed:

```
  node          24.0.0          pnpm          10.33.2
  npm           11.4.1          bun           1.3.5
  git           2.43.0          yarn          1.22.22

  next          16.2.11         react              19.2.8
  tailwindcss   4.3.3           shadcn CLI         4.14.1
  motion        12.42.2         gsap               3.15.0
  @gsap/react   2.1.2           lottie-react       2.4.1
  @lottiefiles/dotlottie-react  0.19.12
  @tanstack/react-query         5.101.4
  prisma / @prisma/client       7.9.0    ← MAJOR v7, driver-adapter based
  @prisma/adapter-neon          7.9.0
  @neondatabase/serverless      1.1.0
  zod           4.4.3           react-hook-form    7.83.0
  next-themes   0.4.6           lenis              1.3.25
```

**Package manager: pnpm.** Fastest of the three installed, and the shadcn CLI reads
`packageManager` from `package.json` to pick its runner (`pnpm dlx`).

**Prisma is v7.** Materially different from v5/v6 — it is driver-adapter based, so
Neon connects through `@prisma/adapter-neon` rather than a raw connection string in
the datasource block. This only matters from the app phase onward, but the P0
scaffold must be written the v7 way or it gets redone later.

---

## 3 · Architecture

```
little-dreamer/
├─ app/
│  ├─ layout.tsx                  root · fonts · providers · metadata
│  ├─ page.tsx                    the landing page — composes 13 sections
│  ├─ globals.css                 Tailwind v4 @theme + brand tokens
│  ├─ opengraph-image.tsx         generated OG card
│  ├─ icon.tsx                    favicon
│  ├─ sitemap.ts   robots.ts
│  └─ create/page.tsx             STUB — CTA destination, "coming soon"
│
├─ components/
│  ├─ ui/                         shadcn primitives (CLI-managed, do not hand-edit)
│  ├─ sections/                   one file per LANDING.md section
│  │   ├─ nav.tsx                 01
│  │   ├─ hero.tsx                02
│  │   ├─ trust-bar.tsx           03
│  │   ├─ core.tsx                04   bento
│  │   ├─ proof.tsx               05   ← the differentiator, heaviest scroll work
│  │   ├─ how-it-works.tsx        06
│  │   ├─ themes.tsx              07
│  │   ├─ sample.tsx              08
│  │   ├─ testimonials.tsx        09
│  │   ├─ pricing.tsx             10
│  │   ├─ safety.tsx              11   FAQ accordion
│  │   ├─ final-cta.tsx           12
│  │   └─ footer.tsx              13
│  ├─ motion/                     reusable motion primitives (§5)
│  │   ├─ reveal.tsx              Motion — enter on view
│  │   ├─ stagger-group.tsx       Motion — children stagger
│  │   ├─ scroll-scene.tsx        GSAP — useGSAP + ScrollTrigger wrapper
│  │   ├─ parallax.tsx            GSAP — scrub layer
│  │   └─ lottie.tsx              dotLottie — lazy, reduced-motion aware
│  └─ placeholder/                typed stand-ins for missing assets (§8)
│      ├─ poster.tsx  illustration.tsx  avatar.tsx
│
├─ content/
│  ├─ copy.ts                     every string on the page, typed
│  ├─ themes.ts                   16 themes × 3 categories
│  ├─ testimonials.ts             6 entries
│  ├─ pricing.ts                  3 tiers
│  └─ faq.ts                      5 Q&A
│
├─ lib/
│  ├─ utils.ts                    cn() — shadcn
│  ├─ motion.ts                   shared easings, durations, variants
│  └─ seo.ts                      JSON-LD builders
│
├─ hooks/
│  └─ use-reduced-motion.ts
│
├─ providers/
│  ├─ query-provider.tsx          TanStack — mounted, unused this phase
│  └─ theme-provider.tsx          next-themes
│
├─ prisma/schema.prisma           INERT — schema only, no migrations run
├─ public/                        assets land here (§8)
└─ .env.example                   documented, no real secrets
```

**Rendering model.** `app/page.tsx` is a Server Component. Every section is a Server
Component by default. Motion is pushed to the leaf — only the pieces that animate are
`"use client"`. This keeps the static shell large and the JS island small, which is the
whole point on a marketing page.

**Content is separated from markup** in `content/*.ts` so copy changes never touch
component code, and so a CMS can replace those files later without a rewrite.

---

## 4 · CLI-first scaffolding

Everything that has a CLI gets scaffolded by that CLI, per the brief.

```bash
# 1 · Project + shadcn in ONE command (shadcn CLI scaffolds Next.js itself)
pnpm dlx shadcn@latest init --name little-dreamer --template next --preset base-nova

# 2 · Primitives actually used by the design
pnpm dlx shadcn@latest add button card accordion carousel avatar badge \
  separator dialog skeleton sonner aspect-ratio tooltip

# 3 · Motion stack
pnpm add motion gsap @gsap/react @lottiefiles/dotlottie-react

# 4 · State + forms (inert this phase, wired next)
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
pnpm add zod react-hook-form @hookform/resolvers

# 5 · Data layer (INERT — scaffolded, not wired)
pnpm add -D prisma
pnpm add @prisma/client @prisma/adapter-neon @neondatabase/serverless
pnpm dlx prisma init --datasource-provider postgresql

# 6 · Misc
pnpm add next-themes
```

> `shadcn init --template next` is preferred over `create-next-app` + `shadcn init`
> because it produces a project already wired for Tailwind v4, the `@/` alias, RSC,
> and `components.json` in a single step. Confirm the generated Next version is 16.x
> before proceeding — if the template lags, fall back to
> `pnpm create next-app@latest` then `pnpm dlx shadcn@latest init --defaults`.

---

## 5 · Motion architecture

Three libraries, three non-overlapping jobs. Overlap is what bloats bundles.

```
┌──────────────┬────────────────────────────┬───────────────────────────────┐
│ LIBRARY      │ OWNS                       │ NEVER USED FOR                │
├──────────────┼────────────────────────────┼───────────────────────────────┤
│ Motion       │ component enter, hover,    │ scroll choreography           │
│ 12.42.2      │ tap, layout, exit,         │ (weaker than ScrollTrigger    │
│              │ shared-layout transitions  │  for pinning + scrub)         │
├──────────────┼────────────────────────────┼───────────────────────────────┤
│ GSAP +       │ scroll-driven timelines,   │ hover/tap micro-interactions  │
│ ScrollTrigger│ pinning, scrub, parallax,  │ (overkill, and Motion's       │
│ 3.15.0       │ the PROOF photo→hero       │  React ergonomics are better) │
│              │ transform, section reveals │                               │
├──────────────┼────────────────────────────┼───────────────────────────────┤
│ dotLottie    │ hero loop, generating      │ anything a CSS transition or  │
│ 0.19.12      │ state, empty states,       │ Motion tween can already do   │
│              │ celebratory moments        │                               │
└──────────────┴────────────────────────────┴───────────────────────────────┘
```

**GSAP in React 19 / Next 16 — the rules that matter:**

- Always `useGSAP()` from `@gsap/react`, never bare `useEffect`. It handles cleanup,
  which is what breaks under StrictMode double-invocation.
- Always pass `{ scope: containerRef }` so selectors are contained and reverted.
- `gsap.registerPlugin(ScrollTrigger)` runs once, in a client-only module.
- Every GSAP component is `"use client"` and dynamically imported with `ssr: false`
  where it touches layout measurement.
- Responsive variants via `ScrollTrigger.matchMedia`, not manual resize listeners.
- One ScrollTrigger per timeline — never one per tween inside a timeline.
- Animate `transform`/`opacity` only. No `width`/`height`/`top` scrubs.

**Reduced motion is a global gate, not a per-component afterthought.** A single
`useReducedMotion` hook feeds all three libraries; when set, scrubs become instant
state changes, Lottie renders its static poster frame, and Motion variants collapse to
opacity-only. This is checkpointed in every phase that adds motion.

---

## 6 · Phases

```
  P0  SCAFFOLD          toolchain, CLI, repo, CI-less baseline
       │
  P1  DESIGN SYSTEM     tokens, type scale, motion primitives, placeholders
       │
  P2  SHELL             nav, footer, layout, providers, metadata
       │
  P3  HERO + TRUST      02 · 03      ← first visual milestone
       │
  P4  CORE + PROOF      04 · 05      ← the differentiator, hardest scroll work
       │
  P5  CONTENT           06 · 07 · 08
       │
  P6  CONVERSION        09 · 10 · 11 · 12
       │
  P7  QUALITY + DEPLOY  perf, a11y, SEO, Vercel
```

| Phase | File | Gate to exit |
|---|---|---|
| P0 | [`phases/PHASE-0-SCAFFOLD.md`](./phases/PHASE-0-SCAFFOLD.md) | `pnpm build` passes on an empty page |
| P1 | [`phases/PHASE-1-DESIGN-SYSTEM.md`](./phases/PHASE-1-DESIGN-SYSTEM.md) | Token page renders all tokens; reduced-motion toggle proven |
| P2 | [`phases/PHASE-2-SHELL.md`](./phases/PHASE-2-SHELL.md) | Nav + footer responsive at 3 breakpoints, keyboard navigable |
| P3 | [`phases/PHASE-3-HERO.md`](./phases/PHASE-3-HERO.md) | LCP < 2.0s local, hero renders without JS |
| P4 | [`phases/PHASE-4-PROOF.md`](./phases/PHASE-4-PROOF.md) | Scroll scene runs 60fps, cleans up on unmount, no layout shift |
| P5 | [`phases/PHASE-5-CONTENT.md`](./phases/PHASE-5-CONTENT.md) | All 16 themes render from data; carousel keyboard accessible |
| P6 | [`phases/PHASE-6-CONVERSION.md`](./phases/PHASE-6-CONVERSION.md) | FAQ accordion passes axe; pricing correct at all breakpoints |
| P7 | [`phases/PHASE-7-QUALITY.md`](./phases/PHASE-7-QUALITY.md) | Lighthouse ≥95/100/100/100, deployed, JSON-LD validates |

---

## 7 · Definition of done

```
  ┌────────────────────────────────────────────────────────────────────┐
  │  FUNCTIONAL                                                        │
  │   □  All 13 sections render at 375 / 768 / 1280 / 1920             │
  │   □  Every CTA navigates to /create                                │
  │   □  Page is fully readable and navigable with JS disabled         │
  │   □  Zero console errors or warnings                               │
  │                                                                     │
  │  PERFORMANCE                                    target             │
  │   □  Lighthouse Performance                     ≥ 95   mobile      │
  │   □  LCP                                        < 2.0s             │
  │   □  CLS                                        < 0.05             │
  │   □  INP                                        < 200ms            │
  │   □  Total JS transferred                       < 180kb gzip       │
  │                                                                     │
  │  ACCESSIBILITY                                                     │
  │   □  Lighthouse a11y                            100                │
  │   □  axe-core                                   0 violations       │
  │   □  Full keyboard traversal, visible focus throughout             │
  │   □  prefers-reduced-motion fully honoured, all 3 libraries        │
  │   □  Contrast ≥ 4.5:1 body, ≥ 3:1 large — verified, not assumed    │
  │                                                                     │
  │  SEO                                                               │
  │   □  Metadata, canonical, OG + Twitter cards                       │
  │   □  JSON-LD: Organization · Product · FAQPage — validated         │
  │   □  sitemap.xml + robots.txt                                      │
  │                                                                     │
  │  DELIVERY                                                          │
  │   □  Deployed to Vercel, preview + production                      │
  │   □  Asset track (§8) either complete or explicitly deferred       │
  └────────────────────────────────────────────────────────────────────┘
```

---

## 8 · Asset track (parallel)

You have no assets yet, so every one is a typed placeholder with a hard contract.
Nothing silently ships missing. Placeholders are visually obvious — diagonal-hatch
fill and a dimension label — so an unreplaced asset cannot survive review.

| # | Asset | Format | Dimensions | Placeholder until then | Blocks |
|---|---|---|---|---|---|
| A1 | Hero video | mp4 + webm | 1920×1080, <8MB | `<PlaceholderPoster>` + play chrome | P3 ships without it |
| A2 | Hero poster | webp | 1920×1080 | gradient + sparkles | LCP tuning |
| A3 | Proof: source photo | webp | 800×800 | `<PlaceholderIllustration variant="photo">` | P4 |
| A4 | Proof: character ref | webp | 800×800 | same, variant="character" | P4 |
| A5 | Proof: 6 page images | webp | 1536×1024 ×6 | same, variant="page" | P4 |
| A6 | Theme thumbnails ×16 | webp | 400×400 | gradient per category | P5 |
| A7 | Sample spread ×6 | webp | 2048×1365 | book-frame placeholder | P5 |
| A8 | Testimonial avatars ×6 | webp | 128×128 | initials on tinted circle | P6 |
| A9 | Lottie: hero loop | .lottie | ≤200kb | static SVG mark | P3 |
| A10 | Lottie: generating | .lottie | ≤80kb | Motion dot-pulse | P7 |
| A11 | Logo mark + wordmark | svg | — | text + ☾✦ glyph | P2 |
| A12 | OG image | png | 1200×630 | generated `opengraph-image.tsx` | P7 |

> **A3–A5 are the highest-value assets in the build.** The PROOF section is the
> entire competitive argument (§9) and it is worth nothing with placeholder art.
> These are exactly what the Make scenario produces once its OpenAI connection
> exists — so finishing that pipeline and generating one real book unblocks the
> most persuasive part of the page.

---

## 9 · Why PROOF gets its own phase

From the competitor research: character consistency is the #1 purchase criterion and
the most-cited failure of existing tools — reviewers call it "the underrated
criterion," and buyers want *"the child to recognise themselves"* on every page.

Little Dreamer's Make pipeline is architected around exactly this: one character
reference generated first, then every page rendered from it. The landing page's job
is to make that visible in under five seconds. That is why section 05 is a scrubbed,
pinned scroll scene rather than a static image grid, and why it gets a dedicated
phase with its own performance gate.

---

## 10 · Risk register

| # | Risk | Impact | Mitigation | Phase |
|---|---|---|---|---|
| R1 | Three motion libs blow the JS budget | Perf gate fails | Strict ownership (§5); all lazy below fold; budget checked every phase | P3–P7 |
| R2 | GSAP + React 19 StrictMode double-fire | Broken/duplicated scroll scenes | `useGSAP` + `scope` mandatory; checkpointed in P1 | P1, P4 |
| R3 | Placeholder art ships to production | Credibility loss | Placeholders visually loud; A-track is a P7 exit gate | P7 |
| R4 | shadcn `base-nova` preset fights the dreamy brand | Generic look | P1 restyles tokens before any section is built | P1 |
| R5 | Hero video destroys LCP | Perf gate fails | Poster is the LCP element; video lazy, `preload="none"` | P3 |
| R6 | Pinned PROOF scene janky on mobile | Worst impression on the majority device | `ScrollTrigger.matchMedia` — mobile gets a simple stacked reveal | P4 |
| R7 | Prisma v7 scaffolded the v6 way | Rework in app phase | Driver-adapter pattern from the start | P0 |
| R8 | Copy written by dev, not marketer | Weak conversion | All copy isolated in `content/copy.ts` for one-pass rewrite | P1 |

---

## 11 · Decisions still needed

Not blocking P0–P2. Each is flagged in the phase where it first bites.

| # | Question | Needed by | Default if unanswered |
|---|---|---|---|
| D1 | Production domain? | P7 | `little-dreamer.vercel.app` |
| D2 | Currency + real price points — ₹499/₹1,499 are my invention | P6 | Ship as-is, marked TODO in `content/pricing.ts` |
| D3 | Testimonials are fabricated. Real ones, or label as illustrative? | P6 | Placeholder-styled + `TODO` — **fake reviews must not ship as real** |
| D4 | Analytics — Vercel Analytics, Plausible, GA4, none? | P7 | Vercel Analytics |
| D5 | Font pairing. Brand says warm/premium — buy a display face or use variable Google fonts? | P1 | `Fraunces` display + `Inter` body, both free |
| D6 | Waitlist on `/create`, or plain "coming soon"? | P2 | Plain stub |
| D7 | Legal pages (privacy, terms, COPPA) — real copy or stubs? Footer links to 5 of them | P6 | Stub routes, flagged |
| D8 | Is the ₹ pricing India-first, or multi-currency at launch? | P6 | Single currency |

---

## 12 · Skills to load per phase

The plan assumes these are loaded at the start of the phase, not now — skills are
working instructions, and loading them all up front wastes the context they need.

| Phase | Skill | Why |
|---|---|---|
| P0 | `shadcn` | init flags, preset codes, CLI-first scaffolding |
| P1 | `meta-skills:modern-web-design` | type scale, spacing, colour system rigour |
| P1 | `dataviz` | only if a comparison chart lands in PRICING |
| P3 | `core-3d-animation:motion-framer` | Motion variants, layout transitions |
| P4 | `gsap-scrolltrigger` | pin/scrub/matchMedia — **loaded, rules captured in §5** |
| P4 | `extended-3d-scroll:locomotive-scroll` | only if smooth-scroll is added; Lenis preferred |
| P5 | `animation-components:lottie-animations` | dotLottie integration, lazy loading |
| P5 | `animation-components:scroll-reveal-libraries` | reveal patterns |
| P7 | `next-dev-loop` | verify runtime behaviour in a real browser |
| P7 | `seo-schema` | JSON-LD generation + validation |
| P7 | `seo-page` | single-page SEO audit before launch |
| P7 | `next-cache-components-optimizer` | optional — static shell tuning under Next 16 |
| any | `playwright-skill` | responsive screenshots, keyboard traversal proof |
```
