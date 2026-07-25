"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
  CameraIcon,
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

/** Step 3 — the photo the likeness is built from. */
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
  const [photos, setPhotos] = React.useState<string[]>(value.photos ?? [])
  const [consent, setConsent] = React.useState(value.photoConsent ?? false)
  const [localError, setLocalError] = React.useState<string>()
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const addFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      const room = MAX_PHOTOS - photos.length
      if (room <= 0) {
        setLocalError(`You can add up to ${MAX_PHOTOS} photos`)
        return
      }

      const next: string[] = []
      for (const file of list.slice(0, room)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          setLocalError("Please use a JPG, PNG or WebP image")
          continue
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setLocalError("That photo is over 8 MB — please use a smaller one")
          continue
        }
        next.push(
          await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          })
        )
      }
      if (next.length) {
        setPhotos((p) => [...p, ...next])
        setLocalError(undefined)
      }
    },
    [photos.length]
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!photos.length) return setLocalError("Add at least one photo")
    if (!consent) return setLocalError("Please confirm before we generate")
    setLocalError(undefined)
    onGenerate({ photos, photoConsent: true })
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
            void addFiles(e.dataTransfer.files)
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
              {photos.length ? "Add another photo" : `Add a photo of ${childName}`}
            </p>
            <p className="text-small text-muted-foreground">
              Drag one here, or choose a file. Up to {MAX_PHOTOS}.
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
              if (e.target.files) void addFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </div>

        {photos.length ? (
          <ul className="grid grid-cols-3 gap-2.5">
            {photos.map((src, i) => (
              <li key={i} className="relative">
                <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                  {/* Local data URL preview — next/image cannot optimise these. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1} of ${childName}`}
                    className="size-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
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
            It is sent to our illustration model once, stored in our own bucket,
            and deleted within 30 days. It is never used to train anything.
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
        <Button type="submit" size="xl" disabled={busy}>
          <SparklesIcon data-icon="inline-start" />
          {busy ? "Starting…" : "Generate my book"}
        </Button>
      </div>
    </form>
  )
}
