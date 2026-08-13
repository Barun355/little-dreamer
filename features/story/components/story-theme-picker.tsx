"use client"

import { cn } from "@/lib/utils"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { STORY_THEMES } from "../constants/themes"

type StoryThemePickerProps = {
  value: string
  onValueChange: (value: string) => void
  invalid?: boolean
}

export function StoryThemePicker({
  value,
  onValueChange,
  invalid,
}: StoryThemePickerProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onValueChange(next)}
      className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      aria-invalid={invalid}
    >
      {STORY_THEMES.map((theme) => {
        const Icon = theme.icon

        return (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            aria-label={theme.title}
            className={cn(
              "group h-auto min-h-28 flex-col items-start justify-between rounded-xl border bg-card p-3 text-left whitespace-normal shadow-none transition-all",
              "data-[state=on]:border-primary data-[state=on]:ring-2 data-[state=on]:ring-primary/20",
              "hover:bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg bg-gradient-to-br",
                theme.accent
              )}
            >
              <Icon />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">{theme.label}</span>
              <span className="text-xs text-muted-foreground">{theme.title}</span>
            </span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
