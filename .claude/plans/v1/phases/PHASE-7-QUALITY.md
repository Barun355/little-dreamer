# Phase 7 — Quality Gate & Deploy

**Goal:** Meet every number in the Definition of Done, then ship.

**Prerequisites:** P6 exit criteria met — the full page renders.

**Skills to load:** `next-dev-loop`, `seo-schema`, `seo-page`, `playwright-skill`,
optionally `next-cache-components-optimizer`

---

## Tasks

### 7.1 Performance pass

Budget accounting across the build:

```
   P3  hero + trust          < 40kb
   P4  core + proof (GSAP)   < 60kb
   P5  content (Lottie)      < 45kb
   P6  conversion            < 25kb
   ────────────────────────────────
       running total         < 170kb        target < 180kb gzip
```

If over budget, in order:
1. Cut Lottie entirely — it is decorative (P5 §5.4 already sets this rule)
2. Dynamic-import `<ScrollScene>` with `ssr: false`, below-fold only
3. Replace Motion in low-value spots with CSS transitions
4. Only then reconsider GSAP — but PROOF is the differentiator, so it goes last

Other work:
- `next/image` everywhere, correct `sizes`, AVIF+WebP
- Font subsetting; `preload` display face only
- `next build --analyze` to find surprises
- **Optional:** Next 16 Cache Components (`cacheComponents: true`) for a larger
  static shell. Genuinely useful here since the page is almost entirely static —
  but it is an adoption project with its own failure modes. Only attempt it if the
  budget is missed without it.

### 7.2 Accessibility pass

- axe-core across the full page, all four breakpoints
- Manual keyboard traversal, top to bottom, focus never lost or trapped
- Screen reader smoke test: heading outline, landmarks, carousel + accordion + slider
- Contrast re-verified on final composed backgrounds — gradients and overlays can
  break pairs that passed in isolation at C1.3
- Reduced motion end-to-end across all three libraries
- Heading hierarchy: exactly one `h1`, no skipped levels

### 7.3 SEO

- Metadata API: title template, description, canonical, OG + Twitter cards
- `app/opengraph-image.tsx` — generated 1200×630 (asset A12)
- JSON-LD via `lib/seo.ts`:
  - `Organization` — brand, logo, social
  - `Product` / `Offer` — pricing tiers from `content/pricing.ts`
  - `FAQPage` — from `content/faq.ts`, the same source as section 11
- `sitemap.ts`, `robots.ts`
- Validate every JSON-LD block; drifted or invalid structured data is worse than none

### 7.4 Cross-browser + device

Chrome, Safari, Firefox desktop · iOS Safari · Android Chrome.
Safari gets particular attention: `backdrop-filter` on the nav, `preserve-3d` on the
page-turn, and pinned ScrollTrigger behaviour all differ there.

Playwright captures screenshots at all four breakpoints for review.

### 7.5 Pre-launch content gate

```
  □  No entry in content/testimonials.ts has isPlaceholder: true   ← BLOCKING
  □  No TODO markers remain in content/pricing.ts, or D2/D8 signed off
  □  Fabricated trust-bar stats replaced or removed (P3 §3.5)
  □  Asset track: every A1–A12 either shipped or consciously deferred
  □  /_dev/tokens route deleted
  □  No `markers: true`, no console.log, no commented-out blocks
  □  All 5 legal routes have real or honest-stub content
```

### 7.6 Deploy

- Vercel project, connect repo
- Env vars from `.env.example` (all inert this phase)
- Preview deploy → run the full checkpoint list against the preview URL
- Production deploy
- Analytics per D4 (default: Vercel Analytics)
- Custom domain per D1

---

## Checkpoints

```
  PERFORMANCE                                        target      measured
  □  C7.1   Lighthouse Performance, mobile           ≥ 95        ______
  □  C7.2   LCP                                      < 2.0s      ______
  □  C7.3   CLS                                      < 0.05      ______
  □  C7.4   INP                                      < 200ms     ______
  □  C7.5   Total JS transferred                     < 180kb     ______
  □  C7.6   Lighthouse Best Practices                100         ______

  ACCESSIBILITY
  □  C7.7   Lighthouse Accessibility                 100         ______
  □  C7.8   axe-core, full page, 4 breakpoints       0 issues
  □  C7.9   Keyboard traversal complete, focus always visible
  □  C7.10  Screen reader: landmarks + heading outline coherent
  □  C7.11  Reduced motion honoured across Motion, GSAP AND Lottie
  □  C7.12  Contrast re-verified on FINAL composed backgrounds
  □  C7.13  Exactly one h1; no skipped heading levels

  SEO
  □  C7.14  Lighthouse SEO                           100         ______
  □  C7.15  All 3 JSON-LD blocks validate
  □  C7.16  FAQPage JSON-LD matches visible FAQ copy exactly
  □  C7.17  OG image renders correctly in a real link preview
  □  C7.18  sitemap.xml + robots.txt served correctly
  □  C7.19  /create and legal stubs are noindex

  CROSS-BROWSER
  □  C7.20  Chrome / Safari / Firefox desktop — no visual breakage
  □  C7.21  iOS Safari: nav blur, page-turn, proof scene all correct
  □  C7.22  Android Chrome: proof scene NOT pinned, smooth
  □  C7.23  No horizontal scroll at ANY width from 320 → 2560

  CONTENT GATE
  □  C7.24  Every item in §7.5 satisfied                    ← BLOCKING

  DELIVERY
  □  C7.25  Preview deploy passes the full checklist
  □  C7.26  Production deploy live
  □  C7.27  Analytics reporting
```

**Exit criteria:** C7.1–C7.27. **C7.24 blocks launch regardless of every other
number being green.**

---

## Risks

| Risk | Mitigation |
|---|---|
| Cumulative JS over budget (R1) | 7.1 gives an ordered cut list, decided in advance |
| Contrast passes in isolation, fails composed | C7.12 re-verifies on real backgrounds |
| Safari-specific breakage found at the end | 7.4 + C7.21; Safari-sensitive features listed |
| Placeholder content ships (R3, D3) | C7.24 is a blocking gate |
| Cache Components adoption destabilises late | 7.1 makes it conditional and last-resort |
| Structured data drifts from visible copy | Single-source `content/faq.ts`; C7.16 |
