import { ProofScene } from "./proof-scene"
import { proof } from "@/content/core"

/**
 * Section 05 — Proof.
 *
 * Server Component shell around the client scroll scene, so the heading and
 * intro are in the static HTML and readable before (and without) hydration.
 */
export function Proof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className="border-y border-border bg-lavender-50/50 py-20 sm:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 text-center sm:px-8">
        <h2
          id="proof-heading"
          className="font-heading text-h1 font-semibold text-balance"
        >
          {proof.heading}
        </h2>
        <p className="max-w-2xl text-body-lg text-muted-foreground text-pretty">
          {proof.intro}
        </p>
      </div>

      <ProofScene />
    </section>
  )
}
