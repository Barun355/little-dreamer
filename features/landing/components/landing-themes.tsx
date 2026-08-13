const themes = [
  "Adventure",
  "Space",
  "Fantasy",
  "Animals",
  "Dinosaurs",
  "Superheroes",
  "Magical Worlds",
  "Ocean",
] as const

export function LandingThemes() {
  return (
    <section className="border-t border-white/10 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Pick a world they&apos;ll love
          </h2>
          <p className="mt-4 text-white/60">
            Choose a theme that matches their imagination — then we weave their
            personality into every page.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-100"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
