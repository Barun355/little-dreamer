"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { MailIcon, AlertTriangleIcon, ArrowLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { STATUS_COPY, type JobStatusValue } from "@/lib/create-schema"
import { requestNotification } from "@/app/create/notify"

const ORDER: JobStatusValue[] = [
  "QUEUED",
  "ANALYZING",
  "PLANNING",
  "STORY_READY",
  "ILLUSTRATING",
  "ASSEMBLING",
  "READY",
]

export type JobSnapshot = {
  id: string
  status: JobStatusValue
  childName: string
  failedReason: string | null
  book: { id: string; title: string } | null
}

/**
 * Step 4 — the wait.
 *
 * This is where TanStack Query finally earns its place: a polled job status
 * with retry and background refetch is exactly the server state it is for.
 *
 * Generation takes several minutes, so the screen offers to email instead of
 * asking someone to sit and watch a spinner.
 */
export function StepGenerating({
  jobId,
  onReady,
}: {
  jobId: string
  onReady: (snapshot: JobSnapshot) => void
}) {
  const [email, setEmail] = React.useState("")
  const [emailed, setEmailed] = React.useState(false)
  const [emailSending, setEmailSending] = React.useState(false)
  const [emailNote, setEmailNote] = React.useState<string>()

  const { data, error } = useQuery<JobSnapshot>({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Could not reach the workshop")
      return res.json()
    },
    // Generation is minutes long; poll gently and stop once terminal.
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return s === "READY" || s === "FAILED" ? false : 4000
    },
    refetchOnWindowFocus: true,
    retry: 3,
  })

  React.useEffect(() => {
    if (data?.status === "READY") onReady(data)
  }, [data, onReady])

  const status = data?.status ?? "QUEUED"
  const copy = STATUS_COPY[status]
  const currentIndex = Math.max(0, ORDER.indexOf(status))
  const pct = Math.round((currentIndex / (ORDER.length - 1)) * 100)

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold-100 text-gold-800">
          <AlertTriangleIcon className="size-6" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-h2 font-semibold">
            {STATUS_COPY.FAILED.label}
          </h2>
          <p className="max-w-md text-body text-muted-foreground text-pretty">
            {data?.failedReason ??
              "The workshop ran into a problem part-way through."}{" "}
            Nothing was charged.
          </p>
        </div>
        <Button size="xl" render={<Link href="/create" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Start again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-heading text-h2 font-semibold text-balance">
          {copy.label}
        </h2>
        <p className="max-w-md text-body-lg text-muted-foreground text-pretty">
          {copy.detail}
        </p>
        {error ? (
          <p role="status" className="text-small text-muted-foreground">
            Lost contact for a moment — still trying.
          </p>
        ) : null}
      </div>

      {/* Progress is derived from real job status, not a fake timer. */}
      <div className="flex flex-col gap-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Generation progress"
          className="h-2 w-full overflow-hidden rounded-full bg-lavender-100"
        >
          <div
            className="h-full rounded-full bg-lavender-500 transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(6, pct)}%` }}
          />
        </div>

        <ol className="flex flex-col gap-1.5">
          {ORDER.slice(0, -1).map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2.5 text-small transition-colors",
                i < currentIndex
                  ? "text-muted-foreground"
                  : i === currentIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/60"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  i <= currentIndex ? "bg-lavender-500" : "bg-lavender-200"
                )}
              />
              {STATUS_COPY[s].label}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-1 flex items-center gap-2 font-heading text-h3 font-semibold">
          <MailIcon className="size-4" aria-hidden />
          Not got time to wait?
        </h3>
        <p className="mb-4 text-small text-muted-foreground text-pretty">
          This takes a few minutes. Leave your email and we will send a link the
          moment it is ready.
        </p>

        {emailed ? (
          <p className="text-small text-mint-700">{emailNote}</p>
        ) : (
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault()
              setEmailSending(true)
              const res = await requestNotification({ jobId, email })
              setEmailSending(false)
              if (!res.ok) {
                setEmailNote(res.error)
                return
              }
              setEmailed(true)
              // Say what actually happened. If no mail provider is
              // configured the address is stored but nothing was sent, and
              // claiming otherwise would be a lie the user acts on.
              setEmailNote(
                res.sent
                  ? `Sent — we will email ${email} when the book is done.`
                  : `Saved. We will email ${email} when the book is done.`
              )
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="lg" disabled={emailSending}>
              {emailSending ? "Saving…" : "Email me the link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
