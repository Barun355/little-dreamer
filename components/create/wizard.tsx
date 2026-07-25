"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { brand } from "@/content/copy"
import { StepDetails } from "./step-details"
import { StepTheme } from "./step-theme"
import { StepPhotos } from "./step-photos"
import { StepGenerating, type JobSnapshot } from "./step-generating"
import { StepPreview } from "./step-preview"
import { startGeneration } from "@/app/create/actions"
import type { ChildDetails, Photos } from "@/lib/create-schema"

const STEPS = [
  { id: "details", label: "About them" },
  { id: "theme", label: "The adventure" },
  { id: "photos", label: "Their photo" },
  { id: "generating", label: "Making it" },
  { id: "preview", label: "Your book" },
] as const

type StepId = (typeof STEPS)[number]["id"]

export function Wizard() {
  const router = useRouter()
  const params = useSearchParams()

  // A jobId in the URL means someone came back to a run in progress — resume
  // at the waiting screen rather than making them start over.
  const resumeJobId = params.get("job")

  const [step, setStep] = React.useState<StepId>(resumeJobId ? "generating" : "details")
  const [details, setDetails] = React.useState<ChildDetails>()
  const [themeId, setThemeId] = React.useState<string>()
  const [photos, setPhotos] = React.useState<Photos>()
  const [jobId, setJobId] = React.useState<string | undefined>(resumeJobId ?? undefined)
  const [snapshot, setSnapshot] = React.useState<JobSnapshot>()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const index = STEPS.findIndex((s) => s.id === step)

  const generate = async (p: Photos) => {
    if (!details || !themeId) return
    setBusy(true)
    setError(undefined)
    setPhotos(p)

    const result = await startGeneration({ ...details, themeId, ...p })
    setBusy(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    setJobId(result.jobId)
    setStep("generating")
    // Put the job in the URL so a refresh or a shared link resumes.
    router.replace(`/create?job=${result.jobId}`, { scroll: false })
  }

  const onReady = React.useCallback((s: JobSnapshot) => {
    setSnapshot(s)
    setStep("preview")
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-6">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 rounded-md font-heading text-body-lg font-semibold focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span aria-hidden className="text-lavender-500">
            {brand.mark}
          </span>
          {brand.name}
        </Link>

        <ol className="flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => {
            const state = i < index ? "done" : i === index ? "current" : "upcoming"
            return (
              <li key={s.id} className="flex flex-1 flex-col gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    state === "upcoming" ? "bg-lavender-100" : "bg-lavender-500"
                  )}
                />
                <span
                  className={cn(
                    "hidden text-micro sm:block",
                    state === "current"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {s.label}
                  {state === "current" ? (
                    <span className="sr-only"> (current step)</span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ol>

        <h1 className="font-heading text-h1 font-semibold text-balance">
          {step === "details" && "Who is this book for?"}
          {step === "theme" && "Choose the adventure"}
          {step === "photos" && "Add their photo"}
          {step === "generating" && "Making your book"}
          {step === "preview" && "It is ready"}
        </h1>
      </header>

      {step === "details" && (
        <StepDetails
          value={details ?? {}}
          onNext={(v) => {
            setDetails(v)
            setStep("theme")
          }}
        />
      )}

      {step === "theme" && details && (
        <StepTheme
          value={themeId}
          childName={details.name}
          onBack={() => setStep("details")}
          onNext={(id) => {
            setThemeId(id)
            setStep("photos")
          }}
        />
      )}

      {step === "photos" && details && (
        <StepPhotos
          value={photos ?? {}}
          childName={details.name}
          busy={busy}
          error={error}
          onBack={() => setStep("theme")}
          onGenerate={generate}
        />
      )}

      {step === "generating" && jobId && (
        <StepGenerating jobId={jobId} onReady={onReady} />
      )}

      {step === "preview" && snapshot && <StepPreview job={snapshot} />}
    </div>
  )
}
