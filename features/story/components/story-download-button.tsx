"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type StoryDownloadButtonProps = {
  storybookId: string
  userId: string
}

export function StoryDownloadButton({ storybookId, userId }: StoryDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  async function handleDownload() {
    setIsDownloading(true)

    try {
      const response = await fetch(
        `/api/storybooks/pdf`,
        {
          method: "POST",
          body: JSON.stringify({ storyId: storybookId, userId }),
        }
      )

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Could not download the storybook.")
      }

      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition")
      const fileName =
        disposition?.match(/filename="([^"]+)"/)?.[1] ?? "storybook.pdf"
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
      toast.success("Storybook PDF downloaded.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not download the storybook."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Download data-icon="inline-start" />
      )}
      {isDownloading ? "Preparing PDF..." : "Download PDF"}
    </Button>
  )
}
