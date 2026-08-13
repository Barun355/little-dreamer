import { Sparkles } from "lucide-react"

const highlights = [
  {
    title: "Their name, their face, their world",
    description:
      "Every story is built around one child — their photo becomes the hero, and their chosen theme shapes the adventure.",
  },
  {
    title: "Not a generic AI story",
    description:
      "This isn't a template with a name swapped in. It's a keepsake designed to feel like it was made for this child alone.",
  },
  {
    title: "An experience they'll remember",
    description:
      "When a child sees themselves in a story, something magical happens. That's the heart of Little Dreamer.",
  },
] as const

export function LandingPersonalization() {
  return (
    <section className="border-t border-white/10 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-violet-300">
              Why it feels different
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              This story belongs to{" "}
              <span className="text-violet-200">this specific child</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Parents, grandparents, and relatives choose Little Dreamer when they
              want to give something meaningful — not just entertaining, but deeply
              personal and emotionally connected.
            </p>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-300" aria-hidden />
                  <h3 className="font-medium text-white">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
