# Phase 4 — Core Bento & Proof

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
