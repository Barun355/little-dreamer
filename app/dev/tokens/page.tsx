import type { Metadata } from "next"

import { ContrastTable, type Pair } from "./contrast"
import { SceneDemo } from "./scene-demo"
import { Reveal, StaggerGroup, StaggerItem, Drift } from "@/components/motion/reveal"
import { Parallax } from "@/components/motion/parallax"
import {
  AssetPlaceholder,
  PlaceholderPoster,
  PlaceholderIllustration,
  PlaceholderTheme,
  PlaceholderSpread,
  PlaceholderAvatar,
  PlaceholderLottie,
} from "@/components/placeholder"
import { DURATION, EASING, DISTANCE, STAGGER } from "@/lib/motion"

export const metadata: Metadata = {
  title: "Design tokens — dev only",
  robots: { index: false, follow: false },
}

const RAMPS = ["lavender", "sky", "gold", "mint"] as const
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const SEMANTIC = [
  "background",
  "foreground",
  "card",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "input",
  "ring",
  "destructive",
] as const

const TYPE = [
  ["display", "text-display font-heading"],
  ["h1", "text-h1 font-heading"],
  ["h2", "text-h2 font-heading"],
  ["h3", "text-h3 font-heading"],
  ["body-lg", "text-body-lg"],
  ["body", "text-body"],
  ["small", "text-small"],
  ["micro", "text-micro"],
] as const

const PAIRS: Pair[] = [
  { label: "foreground on background", fg: "var(--foreground)", bg: "var(--background)", requirement: "body" },
  { label: "muted-foreground on background", fg: "var(--muted-foreground)", bg: "var(--background)", requirement: "body" },
  { label: "primary-foreground on primary", fg: "var(--primary-foreground)", bg: "var(--primary)", requirement: "body" },
  { label: "secondary-foreground on secondary", fg: "var(--secondary-foreground)", bg: "var(--secondary)", requirement: "body" },
  { label: "accent-foreground on accent", fg: "var(--accent-foreground)", bg: "var(--accent)", requirement: "body" },
  { label: "foreground on card", fg: "var(--foreground)", bg: "var(--card)", requirement: "body" },
  { label: "lavender-700 on background", fg: "var(--color-lavender-700)", bg: "var(--background)", requirement: "body" },
  { label: "sky-700 on background", fg: "var(--color-sky-700)", bg: "var(--background)", requirement: "body" },
  { label: "gold-700 on background", fg: "var(--color-gold-700)", bg: "var(--background)", requirement: "body" },
  { label: "mint-700 on background", fg: "var(--color-mint-700)", bg: "var(--background)", requirement: "body" },
  { label: "foreground on brand-gold", fg: "var(--foreground)", bg: "var(--color-brand-gold)", requirement: "body" },
  { label: "RAW brand-lavender on background", fg: "var(--color-brand-lavender)", bg: "var(--background)", requirement: "decorative" },
  { label: "RAW brand-sky on background", fg: "var(--color-brand-sky)", bg: "var(--background)", requirement: "decorative" },
  { label: "RAW brand-gold on background", fg: "var(--color-brand-gold)", bg: "var(--background)", requirement: "decorative" },
  { label: "RAW brand-mint on background", fg: "var(--color-brand-mint)", bg: "var(--background)", requirement: "decorative" },
]

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 font-heading">{title}</h2>
        {note ? <p className="max-w-2xl text-small text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function TokensPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-micro tracking-widest text-muted-foreground uppercase">
          dev only · delete before launch
        </p>
        <h1 className="text-h1 font-heading">Little Dreamer design tokens</h1>
        <p className="max-w-2xl text-body-lg text-muted-foreground">
          Every token rendered from the live stylesheet. Contrast ratios are measured
          from computed styles in the browser, not pasted in — edit a token and this
          page tells the truth immediately.
        </p>
      </header>

      <Section
        title="Contrast"
        note="Body text needs 4.5:1, large text 3:1. Anything marked decorative is a fill colour and must never carry text."
      >
        <ContrastTable pairs={PAIRS} />
      </Section>

      <Section title="Semantic tokens" note="Every shadcn primitive inherits from these. No component should ever hardcode a colour.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SEMANTIC.map((name) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div
                className="h-14 w-full rounded-md border border-border"
                style={{ background: `var(--${name})` }}
              />
              <span className="font-mono text-micro break-all text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Brand ramps" note="Derived by holding hue and chroma from the brand hex and stepping lightness. The -700 step is the first that reliably carries body text on cream.">
        <div className="flex flex-col gap-4">
          {RAMPS.map((ramp) => (
            <div key={ramp} className="flex flex-col gap-1.5">
              <span className="font-mono text-micro text-muted-foreground">{ramp}</span>
              <div className="flex overflow-hidden rounded-md border border-border">
                {STEPS.map((step) => (
                  <div
                    key={step}
                    className="flex h-12 flex-1 items-end justify-center pb-1"
                    style={{ background: `var(--color-${ramp}-${step})` }}
                  >
                    <span
                      className="text-micro font-medium"
                      style={{ color: step >= 500 ? "white" : "var(--foreground)" }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale" note="Fluid via clamp() from 375px to 1920px. Resize the window — nothing should overflow at any width.">
        <div className="flex flex-col gap-4">
          {TYPE.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1 border-b border-border/60 pb-3">
              <span className="font-mono text-micro text-muted-foreground">{name}</span>
              <p className={cls}>Every child deserves to be the hero of their own story.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius &amp; elevation" note="Soft and warm. Shadows are lavender-tinted, never neutral black.">
        <div className="flex flex-wrap gap-6">
          {(["sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div className={`size-20 border border-border bg-card rounded-${r}`} />
              <span className="font-mono text-micro text-muted-foreground">radius-{r}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          {(["soft-sm", "soft-md", "soft-lg"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div className="size-20 rounded-xl bg-card" style={{ boxShadow: `var(--shadow-${s})` }} />
              <span className="font-mono text-micro text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion tokens">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            ["DURATION", Object.entries(DURATION)],
            ["EASING", Object.entries(EASING).map(([k, v]) => [k, `[${(v as readonly number[]).join(", ")}]`])],
            ["DISTANCE", Object.entries(DISTANCE).map(([k, v]) => [k, `${v}px`])],
            ["STAGGER", Object.entries(STAGGER)],
          ].map(([title, entries]) => (
            <div key={title as string} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
              <span className="font-mono text-micro tracking-wide text-muted-foreground">{title as string}</span>
              {(entries as [string, unknown][]).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 text-micro">
                  <span>{k}</span>
                  <span className="font-mono text-muted-foreground">{String(v)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Motion primitives"
        note="Scroll this section. Turn on your OS 'reduce motion' setting and reload — every one of these must degrade to an instant, readable state."
      >
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 font-mono text-micro text-muted-foreground">&lt;Reveal&gt;</p>
            <Reveal>
              <div className="rounded-md bg-lavender-100 p-6 text-lavender-800">Fades and rises once on enter.</div>
            </Reveal>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 font-mono text-micro text-muted-foreground">&lt;StaggerGroup&gt; + &lt;StaggerItem&gt;</p>
            <StaggerGroup className="grid gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <StaggerItem key={i}>
                  <div className="rounded-md bg-sky-100 p-4 text-center text-sky-800">{i}</div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 font-mono text-micro text-muted-foreground">&lt;Drift&gt; — ambient loop</p>
            <div className="flex gap-6">
              <Drift><span className="text-h2 text-lavender-500">✦</span></Drift>
              <Drift delay={0.6}><span className="text-h2 text-gold-400">✦</span></Drift>
              <Drift delay={1.2} distance={16}><span className="text-h2 text-mint-400">˚</span></Drift>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 font-mono text-micro text-muted-foreground">&lt;Parallax&gt; — scrubbed</p>
            <div className="relative h-48 overflow-hidden rounded-md bg-sky-50">
              <Parallax speed={-0.25} className="absolute inset-x-0 top-1/2">
                <div className="mx-auto w-fit rounded-md bg-sky-200 px-4 py-2 text-sky-900">moves against scroll</div>
              </Parallax>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 font-mono text-micro text-muted-foreground">
              &lt;ScrollScene&gt; — pinned + scrubbed, desktopOnly
            </p>
            <SceneDemo />
          </div>
        </div>
      </Section>

      <Section title="Asset placeholders" note="All 12 tracked assets. Every one shows its ID and required dimensions so it cannot ship unnoticed.">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="aspect-video"><PlaceholderPoster /></div>
          <div className="aspect-square"><PlaceholderIllustration variant="photo" /></div>
          <div className="aspect-square"><PlaceholderIllustration variant="character" /></div>
          <div className="aspect-[3/2]"><PlaceholderIllustration variant="page" /></div>
          <div className="aspect-square"><PlaceholderTheme name="Space Explorer" /></div>
          <div className="aspect-[3/2]"><PlaceholderSpread /></div>
          <div className="aspect-square"><PlaceholderLottie id="A9" label="Hero loop" /></div>
          <div className="aspect-square"><PlaceholderLottie id="A10" label="Generating state" /></div>
          <div className="aspect-video"><AssetPlaceholder id="A12" label="OG image" dimensions="1200×630" tone="neutral" /></div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <PlaceholderAvatar initials="PM" />
          <PlaceholderAvatar initials="DR" />
          <PlaceholderAvatar initials="SA" />
          <span className="text-small text-muted-foreground">A8 — testimonial avatars</span>
        </div>
      </Section>
    </main>
  )
}
