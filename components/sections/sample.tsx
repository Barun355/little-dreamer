import { SampleCarousel } from "./sample-carousel"
import { sample } from "@/content/journey"

/**
 * Section 08 — Sample.
 *
 * Server Component shell: the heading and intro are in the static HTML, and
 * the spreads themselves are rendered server-side inside the carousel so the
 * content is readable (as a scrollable list) without JavaScript.
 */
export function Sample() {
  return (
    <section id="sample" aria-labelledby="sample-heading" className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 sm:px-8">
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="sample-heading"
            className="font-heading text-h1 font-semibold text-balance"
          >
            {sample.heading}
          </h2>
          <p className="text-body-lg text-muted-foreground text-pretty">
            {sample.intro}
          </p>
        </div>

        <SampleCarousel />
      </div>
    </section>
  )
}
