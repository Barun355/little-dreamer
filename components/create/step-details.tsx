"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  childDetailsSchema,
  GENDERS,
  RELATIONSHIPS,
  type ChildDetails,
} from "@/lib/create-schema"

/** Step 1 — who the book is for. */
export function StepDetails({
  value,
  onNext,
}: {
  value: Partial<ChildDetails>
  onNext: (v: ChildDetails) => void
}) {
  const [name, setName] = React.useState(value.name ?? "")
  const [gender, setGender] = React.useState<string>(value.gender ?? "")
  const [age, setAge] = React.useState<number>(value.age ?? 6)
  const [relationship, setRelationship] = React.useState<string>(
    value.relationship ?? ""
  )
  const [consent, setConsent] = React.useState(value.consent ?? false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = childDetailsSchema.safeParse({
      name,
      gender,
      age,
      relationship,
      consent,
    })
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    onNext(parsed.data)
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <FieldGroup>
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="child-name">Their name</FieldLabel>
          <Input
            id="child-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav"
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
          />
          <FieldDescription>
            This is the name that appears throughout the book.
          </FieldDescription>
          {errors.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.gender ? true : undefined}>
          <FieldLabel>How should we refer to them?</FieldLabel>
          <ToggleGroup
            value={gender ? [gender] : []}
            onValueChange={(v) => setGender((v as string[])[0] ?? "")}
            className="w-full"
          >
            {GENDERS.map((g) => (
              <ToggleGroupItem key={g.value} value={g.value} className="flex-1">
                {g.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {errors.gender ? (
            <FieldError>Please choose one</FieldError>
          ) : (
            <FieldDescription>
              This sets the pronouns used in the story.
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.age ? true : undefined}>
          <FieldLabel htmlFor="child-age">How old are they?</FieldLabel>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Decrease age"
              onClick={() => setAge((a) => Math.max(2, a - 1))}
            >
              <MinusIcon />
            </Button>
            <Input
              id="child-age"
              type="number"
              inputMode="numeric"
              min={2}
              max={12}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-20 text-center tabular-nums"
              aria-invalid={errors.age ? true : undefined}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Increase age"
              onClick={() => setAge((a) => Math.min(12, a + 1))}
            >
              <PlusIcon />
            </Button>
            <span className="text-small text-muted-foreground">years old</span>
          </div>
          <FieldDescription>
            We pitch the vocabulary and sentence length at this age.
          </FieldDescription>
          {errors.age ? <FieldError>{errors.age}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.relationship ? true : undefined}>
          <FieldLabel htmlFor="relationship">Your relationship to them</FieldLabel>
          <Select value={relationship} onValueChange={(v) => setRelationship(v ?? "")}>
            <SelectTrigger id="relationship" aria-invalid={errors.relationship ? true : undefined}>
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.relationship ? (
            <FieldError>Please choose one</FieldError>
          ) : null}
        </Field>

        <Field
          orientation="horizontal"
          data-invalid={errors.consent ? true : undefined}
          className={cn(
            "rounded-xl border p-4",
            errors.consent ? "border-destructive/40" : "border-border"
          )}
        >
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(c) => setConsent(c === true)}
            aria-invalid={errors.consent ? true : undefined}
          />
          <FieldContentBlock
            error={errors.consent}
            label="I may use this child's photo"
            description="You confirm you are their parent or guardian, or have permission from one. We use the photo once to build their character, then delete it within 30 days."
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" size="xl">
          Next step
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </form>
  )
}

function FieldContentBlock({
  label,
  description,
  error,
}: {
  label: string
  description: string
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor="consent" className="font-medium">
        {label}
      </FieldLabel>
      <FieldDescription className="text-pretty">{description}</FieldDescription>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}
