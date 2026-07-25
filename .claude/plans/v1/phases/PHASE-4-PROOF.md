# Phase 4 — Core Bento & Proof

> **STATUS: COMPLETE — 2026-07-25.** All 16 checkpoints pass, stable across
> three consecutive runs. `scripts/verify-phase-4.mjs`.
>
> ```
> pin        1 pinned trigger + 1 pin-spacer on desktop, progress reaches 1.000
> mobile     0 pinned, 0 spacers, all 6 pages visible  (<768px never pins)
> scroll     0 long tasks across a full sweep at 4x CPU throttle
> CLS        0.0000 including pin and unpin
> leak       ScrollTrigger count [1,1,1,1,1,1] across 5 round-trips
> resize     desktop -> mobile -> desktop leaves no orphaned pin spacer
> slider     keyboard + pointer + touch all drive aria-valuenow
> reduced    0 triggers, 0 spacers, no drag affordance, everything visible
> axe        0 violations at 375 and 1440
> JS         +0.0kb over a bare control route
> ```
>
> **Motion was dropped from the landing page.** GSAP is mandatory here —
> ScrollTrigger's pinning and scrubbing have no Motion equivalent — so adding
> Motion for fade-ups would ship a second ~50kb animation library to do what
> the first already does. `RevealGroup` (GSAP, using `ScrollTrigger.batch` so
> N items share one trigger) replaces `Reveal`/`StaggerGroup` here. This
> deviates from the three-library choice made at planning time; Motion remains
> the right tool for the app phase, where gestures and layout animation earn
> its weight.
>
> **Two performance fixes, both found by the gate:**
> - **GSAP setup deferred to `requestIdleCallback`.** Running it inline with
>   hydration cost 250ms+ of main-thread time for animation nobody can see
>   yet.
> - **`gpu-layer` promotion on scrubbed elements.** Animating opacity across
>   two dozen gradient-filled placeholders was repainting on the main thread.
>   Scroll long tasks went from 4 (worst 275ms) to **0**.
>
> **Three harness bugs that had been corrupting results:**
> 1. `pnpm start` spawns `next-server` as a **grandchild**. Killing the wrapper
>    PID orphaned it, so it kept holding port 3000 and later runs silently
>    measured a stale server — this is what produced the confusing
>    "stale build" episodes in P3 too. Fixed by
>    `scripts/with-prod-server.sh`, which tears down explicitly and refuses
>    to run against a dev build.
> 2. C4.6 registered its long-task observer immediately after `load`, so it
>    was measuring **hydration** and attributing it to the scroll animation.
>    The two are now reported separately.
> 3. C4.10 measured the slider's bounding box while the pinned scene was
>    mid-scrub, so coordinates went stale mid-gesture. It now settles the
>    scene at its pin end first.
>
> **Instrumentation:** `window.__ScrollTrigger` is exposed in development, and
> in production only when the build sets `NEXT_PUBLIC_EXPOSE_GSAP=1`. Pin and
> leak checks must run against a production build to mean anything, but a real
> release should not hand every visitor a global GSAP handle.
>
> **Carried to P7:** hydration still shows ~6 long tasks, worst ~300ms at 4×
> CPU throttle. That is framework + GSAP init, not the scene, and P7 owns the
> TBT/INP targets. It is the single biggest remaining performance risk.

**Goal:** Sections 04 and 05. The competitive argument. The hardest scroll work in
the build.

**Prerequisites:** P3 exit criteria met — especially C1.8 (ScrollTrigger cleanup).

**Skill to load:** `gsap-scrolltrigger` *(rules already captured in IMPLEMENTATION §5)*

---

## Why this phase is separate

Competitor research found **character consistency is the #1 purchase criterion and
the most-cited failure of existing tools.** Reviewers call it "the underrated
criterion"; buyers want *"the child to recognise themselves"* on every page.

Little Dreamer's pipeline is built around exactly that — one character reference
first, every page rendered from it. Section 05 exists to make that legible in under
five seconds. If it lands, the page converts. If it is a static image grid, the
product looks like everyone else's.

---

## Tasks

### 4.1 Core bento — section 04

Asymmetric grid per `LANDING.md`: one wide card + two stacked, then three equal.

| Card | Content | Motion |
|---|---|---|
| Wide | "The same child on every page" + 3 page thumbnails | Thumbnails stagger in, subtle float |
| Small | "One photo is enough" | Icon scale-in |
| Small | "Ready before bedtime" — 4m | Number count-up |
| Third | "16 themes" | Icon grid shimmer |
| Third | "Written for their reading age" | Type-size morph Aa |
| Third | "Yours to keep" — PDF/print/audio | Icon row stagger |

Grid: `8/4` then `4/4/4` desktop · `6/6` then `3×6` tablet · stack mobile.
`<Reveal>` + `<StaggerGroup>` (Motion), viewport-triggered, `once: true`.

### 4.2 Proof scroll scene — section 05

The centrepiece. A pinned, scrubbed GSAP timeline.

```
  ┌ SCROLL TIMELINE (pinned, scrub: 1) ────────────────────────────────┐
  │                                                                     │
  │  0.00  photo card alone, centred                                    │
  │  0.15  arrow draws left→right                                       │
  │  0.30  character reference fades up beside it                       │
  │  0.45  connector drops from reference toward the page row           │
  │  0.55  six page thumbnails stagger in from the connector            │
  │  0.75  labels appear: intro · ch1 … ch5                             │
  │  0.85  comparison control fades in                                  │
  │  1.00  release pin                                                  │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘

  DESKTOP  ≥1024   pinned, scrubbed, full choreography
  TABLET   768     pinned, shortened timeline
  MOBILE   <768    NOT PINNED — plain stacked <Reveal> sequence
```

**Mobile does not pin.** Pinned scroll-jacking on mobile is the fastest way to make a
page feel broken on the device most parents will use (risk R6). `ScrollTrigger.matchMedia`
gives mobile an honest stacked reveal instead.

Implementation rules — all from the GSAP skill:
- One `ScrollTrigger` on the parent timeline. **Never** one per tween.
- `ease: "none"` on every scrubbed tween — non-linear easing on a scrub feels wrong.
- `transform` + `opacity` only. No `width`/`height`/`top`.
- `invalidateOnRefresh: true` — the timeline uses viewport-derived distances.
- `useGSAP(..., { scope })` for automatic revert.
- `markers: true` during development, stripped before the phase exits.

### 4.3 Before/after comparison

Draggable divider comparing Little Dreamer vs a typical tool across the six pages.

- Pointer Events (not mouse events) so touch and pen work
- Keyboard: focusable divider, arrow keys move it, `role="slider"` with
  `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-label`
- Reduced motion → renders as a static side-by-side, no drag affordance

### 4.4 Assets

A3 (source photo), A4 (character reference), A5 (six page images) — the highest-value
assets in the whole build. Placeholders until then, but the section is **not
persuasive with placeholder art**. This is the strongest argument for finishing the
Make pipeline and generating one real book.

---

## Checkpoints

```
  □  C4.1   Bento grid correct at 375 / 768 / 1280 / 1920
  □  C4.2   Bento cards reveal once on enter; no re-fire on scroll up
  □  C4.3   Proof scene pins and scrubs smoothly on desktop
  □  C4.4   Timeline completes exactly at pin release — no dead scroll,
              no content jump on unpin
  □  C4.5   MOBILE < 768: NOT pinned. Stacked reveal. Verified on a real
              device or accurate emulation, not just a narrow window
  □  C4.6   60fps through the whole scene — Performance panel, 4× CPU
              throttle, no long tasks > 50ms
  □  C4.7   CLS contribution from pinning = 0
  □  C4.8   ScrollTrigger.getAll().length returns to baseline after
              navigating away and back 5×
  □  C4.9   Resize desktop→mobile→desktop mid-scene: no orphaned pin
              spacer, no stuck transforms
  □  C4.10  Comparison slider works with mouse, touch, AND keyboard
  □  C4.11  Slider exposes role=slider + aria-valuenow; screen reader
              announces position changes
  □  C4.12  Reduced motion → no pin, no scrub, static side-by-side,
              full content still reachable
  □  C4.13  No `markers: true` anywhere in the committed source
  □  C4.14  Client JS added this phase < 60kb gzip (GSAP + ScrollTrigger)
  □  C4.15  axe-core: 0 violations
```

**C4.5, C4.6 and C4.9 are the gates.** A pinned scene that janks on mobile or leaves
an orphaned spacer after resize is worse than no scene at all.

**Exit criteria:** C4.1–C4.15 pass.

---

## Risks

| Risk | Mitigation |
|---|---|
| Pinned scene janks on mobile (R6) | 4.2 `matchMedia` — mobile never pins; C4.5 |
| ScrollTrigger leak across navigations (R2) | C4.8, building on C1.8 |
| Resize leaves orphaned pin spacer | `invalidateOnRefresh`; C4.9 explicitly tests it |
| GSAP blows the JS budget (R1) | C4.14; GSAP core + ScrollTrigger only, no extra plugins |
| Section unpersuasive with placeholder art (R3) | 4.4 — flagged as the top asset priority |
| Comparison slider mouse-only | C4.10 + C4.11 make keyboard and touch mandatory |
