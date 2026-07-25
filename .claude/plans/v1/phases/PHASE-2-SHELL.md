# Phase 2 — App Shell

**Goal:** Root layout, providers, nav (01) and footer (13) complete and responsive.
The frame the whole page hangs in.

**Prerequisites:** P1 exit criteria met.

---

## Tasks

### 2.1 Root layout

`app/layout.tsx` — Server Component:
- `next/font` for Fraunces + Inter, exposed as CSS variables
- `<html lang="en">`, `suppressHydrationWarning` for next-themes
- Skip-to-content link as the first focusable element
- Base metadata (full SEO lands in P7)
- Provider tree

### 2.2 Provider tree → `providers/`

```
  <ThemeProvider forcedTheme="light">      next-themes — light-only for v1 (P1 §1.1)
    <QueryProvider>                        TanStack — MOUNTED, UNUSED this phase
      {children}
      <Toaster />                          sonner
    </QueryProvider>
  </ThemeProvider>
```

`QueryProvider` is `"use client"`, creates the `QueryClient` inside `useState` (never
at module scope — that leaks state across requests on the server), and mounts
devtools only when `NODE_ENV === "development"`.

### 2.3 Content layer → `content/copy.ts`

Every string on the page, typed, in one file. Nav labels, footer columns, section
headings. Sections import from here and never inline copy.

This is what makes D-series copy decisions (and R8) a one-file edit.

### 2.4 Nav — section 01

Desktop: logo left, 5 links centre, `Sign in` + `Create a book` right.
Mobile: logo + hamburger → shadcn `Dialog` as a full-screen sheet.

Behaviour:
- Sticky, `backdrop-blur` + translucent cream once scrolled past 80px
- Scroll state via a tiny `"use client"` island — **not** the whole nav
- Anchor links scroll to sections with `scroll-margin-top` offsetting the nav height
- Active-section highlight via `IntersectionObserver` (defer to P5 when sections exist)

**Accessibility:** `<nav aria-label="Main">`, mobile dialog needs `DialogTitle`
(`sr-only` if visually hidden — shadcn requires it), focus trapped in the open sheet
and restored to the trigger on close, Escape closes.

### 2.5 Footer — section 13

4 columns + brand block, collapsing to accordions on mobile per `LANDING.md`.

Links: Product (5) · Themes (5) · Company (5) · Legal (5).
Social: Instagram, Facebook, YouTube, LinkedIn.
Bottom bar: copyright + the photo-retention reassurance line.

> **Decision D7 bites here.** The footer links to Privacy, Terms, COPPA, Refunds and
> Photo use. Shipping dead links on a page whose core objection is *"what happens to
> my child's photo?"* is actively harmful. Either write real pages or create stub
> routes with an honest "coming soon" — but **do not** link to nothing.

### 2.6 CTA destination

`app/create/page.tsx` — a real route so no CTA 404s. Per D6 default: brand mark,
"Coming soon", link home. Correct metadata, `noindex`.

### 2.7 Page skeleton

`app/page.tsx` composes all 13 sections in order. P2 renders nav + footer for real
and every middle section as a labelled empty `<section id>` block with the right
vertical rhythm. This locks the anchor IDs and scroll offsets before content exists.

---

## Checkpoints

```
  □  C2.1   Nav + footer render at 375 / 768 / 1280 / 1920, no horizontal scroll
  □  C2.2   Mobile menu: opens, traps focus, Escape closes, focus returns
              to the hamburger trigger
  □  C2.3   Sticky nav transitions at exactly 80px scroll; no jitter
  □  C2.4   Every nav anchor scrolls to its section with the nav NOT
              covering the heading (scroll-margin-top correct)
  □  C2.5   Skip-to-content is the first Tab stop and works
  □  C2.6   Full keyboard traversal nav → footer, focus always visible
  □  C2.7   Zero dead links — every footer href resolves (stub or real)
  □  C2.8   /create renders, is noindex, links home
  □  C2.9   All 13 <section id> anchors exist in the DOM in order
  □  C2.10  QueryClient created inside useState, not module scope
  □  C2.11  Devtools absent from the production bundle:
              pnpm build && grep -r "react-query-devtools" .next/static → no hits
  □  C2.12  axe-core on the shell: 0 violations
  □  C2.13  JS disabled → nav links and footer still work as plain anchors
```

**Exit criteria:** C2.1–C2.13 pass.

---

## Risks

| Risk | Mitigation |
|---|---|
| Whole nav becomes a client component for one scroll listener | 2.4 isolates scroll state to a leaf island |
| Devtools ship to production | C2.11 greps the built output |
| Footer links to non-existent legal pages | 2.5 + C2.7 make stubs mandatory |
| `QueryClient` at module scope leaks between requests | C2.10 |
| Anchor offsets break once real content lands | 2.7 locks IDs and rhythm now |
