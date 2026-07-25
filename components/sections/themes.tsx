import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RevealGroup } from "@/components/motion/gsap-reveal"
import { PlaceholderTheme } from "@/components/placeholder"
import {
  categories,
  themesByCategory,
  themeCount,
  VISIBLE_PER_CATEGORY,
  type ThemeCategory,
} from "@/content/themes"

const ORDER: ThemeCategory[] = ["fantasy", "adventure", "become"]

const TONE_HEADER = {
  lavender: "text-lavender-700",
  sky: "text-sky-700",
  gold: "text-gold-700",
  mint: "text-mint-700",
} as const

/**
 * Section 07 — Themes.
 *
 * Three category columns, every entry read from content/themes.ts. The
 * "all N themes" figure is derived from the catalogue length, never typed by
 * hand, so the copy cannot drift from the data.
 *
 * Mobile keeps each category as a horizontal scroll-snap rail; a 26-item
 * vertical list would bury the rest of the page.
 */
export function Themes() {
  return (
    <section
      id="themes"
      aria-labelledby="themes-heading"
      className="border-y border-border bg-card/50 py-20 sm:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 sm:px-8">
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="themes-heading"
            className="font-heading text-h1 font-semibold text-balance"
          >
            Pick the world. They&rsquo;ll be the hero.
          </h2>
          <p className="text-body-lg text-muted-foreground">
            {themeCount} themes across three kinds of story.
          </p>
        </div>

        <RevealGroup className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {ORDER.map((key) => {
            const meta = categories[key]
            const list = themesByCategory(key)
            const visible = list.slice(0, VISIBLE_PER_CATEGORY)
            const remaining = list.length - visible.length

            return (
              // min-w-0 is required: a grid item containing a horizontally
              // scrolling child expands to its content width by default,
              // which pushed the whole document wider than the viewport at
              // 375 and 768 (C5.1).
              <div key={key} data-reveal className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3
                    className={cn(
                      "font-heading text-h3 font-semibold",
                      TONE_HEADER[meta.tone]
                    )}
                  >
                    {meta.label}
                  </h3>
                  <p className="text-small text-muted-foreground">{meta.blurb}</p>
                </div>

                <ul
                  aria-label={`${meta.label} themes`}
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-2.5 lg:overflow-visible lg:pb-0"
                  tabIndex={0}
                >
                  {visible.map((theme) => (
                    <li
                      key={theme.id}
                      className="w-36 shrink-0 snap-start lg:w-auto"
                    >
                      <Link
                        href="/create"
                        // 26 theme cards all pointing at /create would each
                        // fire a route prefetch on viewport entry — the same
                        // payload, fetched over and over, for bandwidth the
                        // visitor did not ask to spend.
                        prefetch={false}
                        className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5 transition-shadow hover:shadow-soft-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:flex-row lg:items-center lg:gap-3"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-lg lg:size-12 lg:w-auto lg:shrink-0">
                          <PlaceholderTheme
                            name={theme.name}
                            tone={meta.tone}
                            className="rounded-lg transition-transform group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-small font-medium text-balance">
                            {theme.name}
                          </span>
                          <span className="text-micro text-muted-foreground tabular-nums">
                            Ages {theme.ageRange[0]}&ndash;{theme.ageRange[1]}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {remaining > 0 ? (
                  <p className="text-small text-muted-foreground">
                    + {remaining} more {meta.label.toLowerCase()} themes
                  </p>
                ) : null}
              </div>
            )
          })}
        </RevealGroup>

        <div className="flex justify-center">
          <Button size="lg" variant="outline" render={<Link href="/create" />}>
            Browse all {themeCount} themes
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
