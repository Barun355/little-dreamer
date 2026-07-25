# Phase 6 — Conversion Sections

**Goal:** Sections 09 (Testimonials), 10 (Pricing), 11 (Safety FAQ), 12 (Final CTA).
The bottom half of the funnel.

**Prerequisites:** P5 exit criteria met.

---

## Tasks

### 6.1 Testimonials — section 09

3 × 2 grid desktop, swipeable carousel mobile. Star rating, quote, avatar, name, role.

Motion: `<StaggerGroup>` reveal, `once: true`. Subtle lift on hover.

> **D3 — this is the decision that must be made before launch, not after.**
> The six testimonials in `LANDING.md` are written by me as design placeholders.
> Publishing invented customer reviews as genuine is deceptive and, in most
> jurisdictions, unlawful. Three acceptable paths:
>
> 1. Replace with real, attributable quotes — best
> 2. Remove the section until real ones exist — safe
> 3. Keep as visibly-labelled sample content (`Illustrative example`), which is
>    weak but honest
>
> **What must not happen is shipping them unlabelled.** `content/testimonials.ts`
> carries an `isPlaceholder: true` flag and the build fails the P7 gate while any
> entry still has it set.

### 6.2 Pricing — section 10

Three tiers: Preview (free) · One Book (₹499) · Keepsake (₹1,499).
Middle tier elevated with a `Badge` and a stronger border.

- Feature lists with ✓ / ✗ — `✗` rows use `text-muted-foreground`, and the icon
  carries an accessible label, not colour alone
- Guarantee line beneath the grid
- Mobile: stack with the popular tier first

> **D2/D8 unresolved.** The prices and the currency are my invention. Marked `TODO`
> in `content/pricing.ts`. Single currency assumed; multi-currency is a real feature
> (geo-detection, formatting, tax) and out of scope for a landing page.

### 6.3 Safety FAQ — section 11

shadcn `Accordion`, five questions, first expanded by default.

Questions in priority order, derived from the competitor research on buyer objections:

```
  1  What happens to my child's photo?         ← the #1 objection
  2  Will it actually look like my child?      ← the #1 purchase criterion
  3  Can I edit the story or redo a picture?
  4  Do two books ever come out the same?
  5  Can I get it printed?
```

Content lives in `content/faq.ts` and is reused verbatim by the `FAQPage` JSON-LD in
P7 — one source, so the structured data can never drift from the visible copy.

> Q1's answer makes concrete commitments — 30-day deletion, never used for training,
> deletable on demand. **These must be true and must match the actual privacy
> policy.** Do not write a stronger promise here than the product can keep.

### 6.4 Final CTA — section 12

Full-bleed, gradient + sparkle field, brand mark, the brand-promise line, one button,
reassurance text.

Motion: `<Reveal>` on the mark, gentle sparkle drift, button `whileHover` scale.
This is the emotional close — it should feel like the hero's bookend.

### 6.5 Legal stubs (D7)

Create the five routes the footer links to: `/privacy`, `/terms`, `/coppa`,
`/refunds`, `/photo-use`. Real copy or honest stubs — but they must resolve, and the
photo-use page in particular should exist before any page claims photos are deleted
in 30 days.

---

## Checkpoints

```
  □  C6.1   All four sections render at 375 / 768 / 1280 / 1920
  □  C6.2   Accordion: keyboard operable, aria-expanded correct, only
              intended panel open on load
  □  C6.3   Accordion content matches content/faq.ts exactly (same source
              P7's JSON-LD will read)
  □  C6.4   Pricing ✗ rows convey state to a screen reader without relying
              on colour
  □  C6.5   Popular tier visually elevated AND first in mobile DOM order
  □  C6.6   Testimonial carousel: keyboard + touch, aria-live announces
  □  C6.7   EVERY testimonial still carries isPlaceholder: true, and this
              is surfaced as an unmissable build warning
  □  C6.8   Pricing values marked TODO pending D2/D8
  □  C6.9   All 5 legal routes resolve; none 404
  □  C6.10  Final CTA button reaches /create
  □  C6.11  Reduced motion → sparkles static, reveals instant
  □  C6.12  Client JS added this phase < 25kb gzip
  □  C6.13  axe-core across all four sections: 0 violations
  □  C6.14  Full page now renders end to end, all 13 sections, JS disabled
```

**C6.7 is a launch-blocking gate, not a nice-to-have.**

**Exit criteria:** C6.1–C6.14 pass.

---

## Risks

| Risk | Mitigation |
|---|---|
| Fabricated testimonials ship as real (D3) | 6.1 + C6.7 — build-level flag, P7 gate |
| Invented prices become "the" prices | 6.2 + C6.8 TODO markers |
| FAQ promises exceed what the product does | 6.3 explicit warning; must match privacy policy |
| JSON-LD drifts from visible FAQ copy | Single source `content/faq.ts`; C6.3 |
| Dead legal links on a trust-critical page (D7) | 6.5 + C6.9 |
| ✗ rows readable only by colour | C6.4 |
