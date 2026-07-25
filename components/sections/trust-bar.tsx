import { StarIcon, ShieldCheckIcon, BanIcon, ClockIcon } from "lucide-react"

import { trust } from "@/content/copy"

const ICONS = {
  star: StarIcon,
  shield: ShieldCheckIcon,
  ban: BanIcon,
  clock: ClockIcon,
} as const

/**
 * Section 03 — Trust bar.
 *
 * Answers the top purchase objection ("what happens to my child's photo?")
 * within the first scroll. Server Component; the tooltips are client
 * primitives but carry no page-level state.
 *
 * Entries flagged `isPlaceholder` are filtered out. Fabricated social proof
 * must never render — see PHASE-3 §3.5 / C3.10. Resolve or delete them in
 * content/copy.ts rather than re-enabling them here.
 */
export function TrustBar() {
  const items = trust.items.filter((item) => !item.isPlaceholder)

  return (
    <section
      id="trust"
      aria-label="Trust and safety"
      className="border-y border-border bg-card/60"
    >
      {/*
        Stacks on mobile rather than scrolling horizontally. A horizontal
        scroll container has to be keyboard-focusable to be operable
        (axe: scrollable-region-focusable), and for three short items that
        is a worse experience than simply wrapping.
      */}
      <ul className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:px-8 md:grid md:grid-cols-3 md:gap-6">
        {items.map((item) => {
          const Icon = ICONS[item.icon]
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
                <Icon className="size-4.5" aria-hidden />
              </span>

              {/*
                Detail is shown inline rather than behind a tooltip.

                This bar exists to answer the single biggest purchase
                objection — "what happens to my child's photo?". Hiding that
                answer behind a hover fails on touch entirely and buries the
                reassurance on the device most parents will use. It also
                drops the Tooltip primitive from the critical bundle.
              */}
              <span className="flex flex-col gap-0.5">
                <span className="text-small font-semibold text-foreground">
                  {item.headline}
                </span>
                <span className="text-small text-muted-foreground text-pretty">
                  {item.detail}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
