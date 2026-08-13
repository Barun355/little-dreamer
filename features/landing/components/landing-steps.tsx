import { Heart, Palette, UserRound } from "lucide-react"

const steps = [
  {
    icon: UserRound,
    title: "Tell us about the child",
    description:
      "Share their name, age, and a photo — so the story reflects who they really are.",
  },
  {
    icon: Palette,
    title: "Choose a story theme",
    description:
      "Pick a world they'll love: adventure, space, fantasy, animals, dinosaurs, superheroes, or a magical realm.",
  },
  {
    icon: Heart,
    title: "Receive their storybook",
    description:
      "Get a complete digital storybook — front cover, five personalized pages, and a back cover — ready to read together.",
  },
] as const

export function LandingSteps() {
  return (
    <section
      id="how-it-works"
      className="border-t border-white/10 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From your love to their adventure
          </h2>
          <p className="mt-4 text-white/60">
            You create it. They become the hero. A gift that feels personal from
            the very first page.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/25">
                  <step.icon className="size-5 text-violet-300" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="text-lg font-medium text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
