"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlaceholderTheme } from "@/components/placeholder"
import {
  categories,
  themesByCategory,
  themeCount,
  type ThemeCategory,
} from "@/content/themes"

const ORDER: ThemeCategory[] = ["fantasy", "adventure", "become"]

/**
 * Step 2 — the adventure.
 *
 * Not in the original wireframe, but the generation pipeline needs a world, a
 * direction, a pool of adventures and an ending. Asking for a single theme and
 * deriving the rest (content/story-seeds.ts) keeps that to one choice rather
 * than eight questions.
 */
export function StepTheme({
  value,
  childName,
  onBack,
  onNext,
}: {
  value?: string
  childName: string
  onBack: () => void
  onNext: (themeId: string) => void
}) {
  const [selected, setSelected] = React.useState(value ?? "")
  const [error, setError] = React.useState(false)

  const submit = () => {
    if (!selected) {
      setError(true)
      return
    }
    onNext(selected)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-body text-muted-foreground text-pretty">
          Pick the world {childName} will be the hero of.{" "}
          <span className="text-foreground">{themeCount} to choose from.</span>
        </p>
        {error ? (
          <p role="alert" className="text-small text-destructive">
            Choose a theme to continue.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-8">
        {ORDER.map((key) => {
          const meta = categories[key]
          return (
            <fieldset key={key} className="flex flex-col gap-3">
              <legend className="mb-1 font-heading text-h3 font-semibold">
                {meta.label}
              </legend>
              <p className="-mt-2 text-small text-muted-foreground">{meta.blurb}</p>

              <div
                role="radiogroup"
                aria-label={`${meta.label} themes`}
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
              >
                {themesByCategory(key).map((theme) => {
                  const isSelected = selected === theme.id
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelected(theme.id)
                        setError(false)
                      }}
                      className={cn(
                        "group relative flex flex-col gap-2 rounded-xl border p-2.5 text-left transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        isSelected
                          ? "border-lavender-500 bg-lavender-50 shadow-soft-md"
                          : "border-border bg-card hover:shadow-soft-sm"
                      )}
                    >
                      {isSelected ? (
                        <span
                          aria-hidden
                          className="absolute top-3.5 right-3.5 z-10 flex size-5 items-center justify-center rounded-full bg-lavender-600 text-primary-foreground"
                        >
                          <CheckIcon className="size-3" />
                        </span>
                      ) : null}

                      <div className="aspect-square w-full overflow-hidden rounded-lg">
                        <PlaceholderTheme
                          name={theme.name}
                          tone={meta.tone}
                          className="rounded-lg"
                        />
                      </div>

                      <span className="flex flex-col">
                        <span className="text-small font-medium text-balance">
                          {theme.name}
                        </span>
                        <span className="text-micro text-muted-foreground tabular-nums">
                          Ages {theme.ageRange[0]}&ndash;{theme.ageRange[1]}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="xl" onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button type="button" size="xl" onClick={submit}>
          Next step
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
