"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { createStorybook } from "../actions/create-storybook"
import { createStorybookFormSchema, mapFormErrors } from "../schemas"
import { StoryPhotoUpload } from "./story-photo-upload"
import { StoryThemePicker } from "./story-theme-picker"

type StoryCreateFormProps = {
  title: string
  description: string
}

export function StoryCreateForm({ title, description }: StoryCreateFormProps) {
  const [childName, setChildName] = React.useState("")
  const [childAge, setChildAge] = React.useState("")
  const [themeId, setThemeId] = React.useState("")
  const [photo, setPhoto] = React.useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      createStorybookFormSchema.parse({
        childName,
        childAge,
        themeId,
        photo,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(mapFormErrors(error))
        return
      }

      toast.error("Could not validate the form.")
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set("childName", childName.trim())
      formData.set("childAge", childAge)
      formData.set("themeId", themeId)
      formData.set("photo", photo as File)

      await createStorybook(formData)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create the storybook."
      )
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-8">
          <FieldSet>
            <FieldLegend>About your child</FieldLegend>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <FieldGroup>
                <Field data-invalid={!!errors.childName}>
                  <FieldLabel htmlFor="child-name">Name *</FieldLabel>
                  <Input
                    id="child-name"
                    value={childName}
                    onChange={(event) => setChildName(event.target.value)}
                    placeholder="Maya"
                    aria-invalid={!!errors.childName}
                  />
                  {errors.childName ? (
                    <FieldDescription>{errors.childName}</FieldDescription>
                  ) : null}
                </Field>

                <Field data-invalid={!!errors.childAge}>
                  <FieldLabel htmlFor="child-age">Age *</FieldLabel>
                  <Input
                    id="child-age"
                    type="number"
                    min={1}
                    max={12}
                    value={childAge}
                    onChange={(event) => setChildAge(event.target.value)}
                    placeholder="7"
                    aria-invalid={!!errors.childAge}
                  />
                  {errors.childAge ? (
                    <FieldDescription>{errors.childAge}</FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>

              <Field data-invalid={!!errors.photo}>
                <FieldLabel>Photo *</FieldLabel>
                <StoryPhotoUpload value={photo} onChange={setPhoto} required />
                {errors.photo ? (
                  <FieldDescription>{errors.photo}</FieldDescription>
                ) : (
                  <FieldDescription>
                    Required. This photo helps keep the child&apos;s face consistent
                    in every illustration.
                  </FieldDescription>
                )}
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Choose a theme *</FieldLegend>
            <Field data-invalid={!!errors.themeId}>
              <StoryThemePicker
                value={themeId}
                onValueChange={setThemeId}
                invalid={!!errors.themeId}
              />
              {errors.themeId ? (
                <FieldDescription>{errors.themeId}</FieldDescription>
              ) : (
                <FieldDescription>
                  Pick the world that fits their imagination best.
                </FieldDescription>
              )}
            </Field>
          </FieldSet>
        </CardContent>

        <CardFooter className="justify-end border-t bg-muted/20 px-6 py-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !photo}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
            Generate Storybook
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
