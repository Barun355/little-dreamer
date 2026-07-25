"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
  CameraIcon,
  LoaderIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PHOTO_BYTES,
  type Photos,
} from "@/lib/create-schema"

const GUIDANCE = [
  { good: true, text: "A clear, front-facing photo of their face" },
  { good: true, text: "Good light — daylight is ideal" },
  { good: true, text: "Just them in the frame" },
  { good: false, text: "Sunglasses, hats or anything covering the face" },
  { good: false, text: "Blurry, dark or very small photos" },
  { good: false, text: "Group photos — we may pick the wrong child" },
]

const MAX_PHOTOS = 3

type Upload = {
  id: string
  preview: string
  key?: string
  status: "uploading" | "done" | "error"
  error?: string
}

/**
 * Step 3 — the photo the likeness is built from.
 *
 * Each file is uploaded to R2 the moment it is chosen, via a presigned PUT,
 * and only the resulting key travels onward. Photos never pass through the
 * Server Action: its body caps at 1 MB and base64 adds a third on top, so a
 * real photograph failed with a 413 before reaching any application code.
 */
export function StepPhotos({
  value,
  childName,
  busy,
  error,
  onBack,
  onGenerate,
}: {
  value: Partial<Photos>
  childName: string
  busy: boolean
  error?: string
  onBack: () => void
  onGenerate: (v: Photos) => void
}) {
  const [uploads, setUploads] = React.useState<Upload[]>([])
  const [consent, setConsent] = React.useState(value.photoConsent ?? false)
  const [localError, setLocalError] = React.useState<string>()
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Object URLs are cheap but must be released, or every re-pick leaks.
  React.useEffect(() => {
    return () => {
      for (const u of uploads) URL.revokeObjectURL(u.preview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const uploadOne = React.useCallback(async (file: File, id: string) => {
    try {
      const presign = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      })
      if (!presign.ok) {
        const { error } = await presign.json().catch(() => ({ error: "" }))
        throw new Error(error || "Could not prepare the upload")
      }
      const { url, key } = await presign.json()

      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!put.ok) throw new Error(`Upload failed (${put.status})`)

      setUploads((list) =>
        list.map((u) => (u.id === id ? { ...u, key, status: "done" } : u))
      )
    } catch (e) {
      setUploads((list) =>
        list.map((u) =>
          u.id === id
            ? { ...u, status: "error", error: (e as Error).message }
            : u
        )
      )
    }
  }, [])

  const addFiles = React.useCallback(
    (files: FileList | File[]) => {
      const room = MAX_PHOTOS - uploads.length
      if (room <= 0) {
        setLocalError(`You can add up to ${MAX_PHOTOS} photos`)
        return
      }

      for (const file of Array.from(files).slice(0, room)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          setLocalError("Please use a JPG, PNG or WebP image")
          continue
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setLocalError("That photo is over 8 MB — please use a smaller one")
          continue
        }
        const id = crypto.randomUUID()
        setUploads((list) => [
          ...list,
          { id, preview: URL.createObjectURL(file), status: "uploading" },
        ])
        setLocalError(undefined)
        void uploadOne(file, id)
      }
    },
    [uploads.length, uploadOne]
  )

  const ready = uploads.filter((u) => u.status === "done" && u.key)
  const pending = uploads.some((u) => u.status === "uploading")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pending) return setLocalError("Give the upload a second to finish")
    if (!ready.length) return setLocalError("Add at least one photo")
    if (!consent) return setLocalError("Please confirm before we generate")
    setLocalError(undefined)
    onGenerate({ photos: ready.map((u) => u.key!), photoConsent: true })
  }

  const shown = error ?? localError

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <section
        aria-labelledby="guidance-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <h2 id="guidance-heading" className="mb-3 font-heading text-h3 font-semibold">
          How to pick a good photo
        </h2>
        <p className="mb-4 text-small text-muted-foreground text-pretty">
          The whole book is drawn from this one face, so it is worth thirty
          seconds getting it right.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {GUIDANCE.map((g) => (
            <li key={g.text} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  g.good ? "bg-mint-100 text-mint-700" : "bg-muted text-muted-foreground"
                )}
              >
                {g.good ? <CheckIcon className="size-3" /> : <XIcon className="size-3" />}
              </span>
              <span className="text-small text-pretty">
                <span className="sr-only">{g.good ? "Do: " : "Avoid: "}</span>
                {g.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
            dragging ? "border-lavender-500 bg-lavender-50" : "border-border bg-card"
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-700">
            <CameraIcon className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {uploads.length ? "Add another photo" : `Add a photo of ${childName}`}
            </p>
            <p className="text-small text-muted-foreground">
              Drag one here, or choose a file. Up to {MAX_PHOTOS}, 8 MB each.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon data-icon="inline-start" />
            Choose a photo
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            aria-label="Choose photos"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </div>

        {uploads.length ? (
          <ul className="grid grid-cols-3 gap-2.5" data-testid="photo-list">
            {uploads.map((u, i) => (
              <li key={u.id} className="relative">
                <div
                  className={cn(
                    "aspect-square overflow-hidden rounded-xl border bg-muted",
                    u.status === "error" ? "border-destructive/50" : "border-border"
                  )}
                >
                  {/* Local object URL preview — next/image cannot optimise these. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.preview}
                    alt={`Photo ${i + 1} of ${childName}`}
                    className={cn(
                      "size-full object-cover transition-opacity",
                      u.status === "done" ? "opacity-100" : "opacity-60"
                    )}
                  />
                </div>

                {u.status === "uploading" ? (
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    role="status"
                    aria-label="Uploading"
                  >
                    <LoaderIcon className="size-5 animate-spin text-lavender-700" aria-hidden />
                  </span>
                ) : null}

                {u.status === "error" ? (
                  <span className="absolute inset-x-1 bottom-1 rounded bg-destructive/10 p-1 text-center text-micro text-destructive">
                    {u.error ?? "Failed"}
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(u.preview)
                    setUploads((list) => list.filter((x) => x.id !== u.id))
                  }}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-soft-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <XIcon className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border p-4">
        <Checkbox
          id="photo-consent"
          checked={consent}
          onCheckedChange={(c) => setConsent(c === true)}
        />
        <label htmlFor="photo-consent" className="flex flex-col gap-1">
          <span className="text-small font-medium">
            Use this photo to build {childName}&rsquo;s character
          </span>
          <span className="text-small text-muted-foreground text-pretty">
            It is stored in our own private bucket, sent to our illustration
            model once, and deleted within 30 days. It is never used to train
            anything.
          </span>
        </label>
      </div>

      {shown ? (
        <p role="alert" className="text-small text-destructive">
          {shown}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="xl" onClick={onBack} disabled={busy}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button type="submit" size="xl" disabled={busy || pending}>
          <SparklesIcon data-icon="inline-start" />
          {busy ? "Starting…" : pending ? "Uploading…" : "Generate my book"}
        </Button>
      </div>
    </form>
  )
}
