"use client"

import * as React from "react"
import { ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StoryPhotoUploadProps = {
  value: File | null
  onChange: (file: File | null) => void
  required?: boolean
}

export function StoryPhotoUpload({
  value,
  onChange,
  required = false,
}: StoryPhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(value)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [value])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      return
    }

    onChange(file)
  }

  function clearPhoto() {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className={cn(
          "relative flex aspect-square w-full max-w-56 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/30",
          previewUrl && "border-solid"
        )}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Child photo preview"
              className="size-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-xs"
              className="absolute top-2 right-2"
              onClick={clearPhoto}
            >
              <X />
              <span className="sr-only">Remove photo</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <ImagePlus />
            <span>Photo preview</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        required={required}
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Replace photo" : "Upload photo"}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · up to 2 MB</p>
      </div>
    </div>
  )
}
