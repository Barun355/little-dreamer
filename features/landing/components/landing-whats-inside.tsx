import { BookMarked, BookOpen, Layers } from "lucide-react"

const pages = [
  {
    icon: BookMarked,
    label: "Front cover",
    detail: "A personalized cover featuring the child as the star.",
  },
  {
    icon: BookOpen,
    label: "5 story pages",
    detail: "A complete adventure written and illustrated around them.",
  },
  {
    icon: Layers,
    label: "Back cover",
    detail: "A finishing touch that makes it feel like a real storybook.",
  },
] as const

export function LandingWhatsInside() {
  return (
    <section className="border-t border-white/10 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            What&apos;s inside every storybook
          </h2>
          <p className="mt-4 text-white/60">
            Each digital storybook is a complete, gift-ready experience — ready
            to read together tonight.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pages.map((page) => (
            <article
              key={page.label}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-center"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/25">
                <page.icon className="size-5 text-violet-300" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-white">{page.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {page.detail}
              </p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-white/40">
          Printed keepsake editions are on the way — for now, every storybook is
          delivered as a beautiful digital experience you can read together
          anytime.
        </p>
      </div>
    </section>
  )
}
