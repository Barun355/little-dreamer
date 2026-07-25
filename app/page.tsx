import { Nav } from "@/components/sections/nav"
import { Footer } from "@/components/sections/footer"
import { Hero } from "@/components/sections/hero"
import { TrustBar } from "@/components/sections/trust-bar"
import { Core } from "@/components/sections/core"
import { Proof } from "@/components/sections/proof"

/**
 * The landing page.
 *
 * Sections 02 and 03 are built. The remainder are placeholder <section>
 * blocks so their anchor ids, DOM order and vertical rhythm are locked
 * before content lands — nav links and scroll offsets therefore do not
 * shift as later phases fill them in.
 */

const PENDING = [
  { id: "how-it-works", label: "06 · How it works", phase: "Phase 5" },
  { id: "themes", label: "07 · Themes", phase: "Phase 5" },
  { id: "sample", label: "08 · Sample", phase: "Phase 5" },
  { id: "testimonials", label: "09 · Testimonials", phase: "Phase 6" },
  { id: "pricing", label: "10 · Pricing", phase: "Phase 6" },
  { id: "safety", label: "11 · Safety", phase: "Phase 6" },
  { id: "final-cta", label: "12 · Final CTA", phase: "Phase 6" },
] as const

export default function Page() {
  return (
    <>
      <Nav />

      <main id="main">
        <Hero />
        <TrustBar />
        <Core />
        <Proof />

        {PENDING.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-label={section.label}
            className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-5 py-24 sm:px-8 md:py-32"
          >
            <p className="font-mono text-micro tracking-widest text-muted-foreground uppercase">
              {section.label}
            </p>
            {/* Full-strength muted, not /70 — an opacity modifier drops this
                below 4.5:1 on cream and fails contrast. */}
            <p className="text-small text-muted-foreground">{section.phase}</p>
          </section>
        ))}
      </main>

      <Footer />
    </>
  )
}
