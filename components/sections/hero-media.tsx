"use client"

import * as React from "react"
import { PlayIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { PlaceholderPoster } from "@/components/placeholder"
import { hero } from "@/content/copy"

type HeroMediaProps = {
  /** Asset A1. Absent until the real video exists. */
  src?: string
  /** Asset A2. This — never the video — is the intended LCP element. */
  poster?: string
}

/**
 * Hero video, poster-first.
 *
 * The poster carries the LCP; the video is `preload="none"` with no autoplay,
 * so nothing downloads until the user asks for it. Autoplaying a 1080p hero
 * video is the most common way a landing page loses its LCP budget.
 *
 * `controls` is on the native element, so with JavaScript disabled the video
 * is still fully playable — the custom overlay below is an enhancement, not
 * the mechanism.
 */
export function HeroMedia({ src, poster }: HeroMediaProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [started, setStarted] = React.useState(false)

  const play = () => {
    setStarted(true)
    videoRef.current?.play()
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft-lg">
      <AspectRatio ratio={16 / 9}>
        {src ? (
          <video
            ref={videoRef}
            className="size-full object-cover"
            poster={poster}
            preload="none"
            controls
            playsInline
            aria-label={hero.video.caption}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <PlaceholderPoster className="rounded-none" />
        )}

        {/* Overlay affordance. Hidden once playback starts, and absent
            entirely without JS — where the native controls take over. */}
        {!started ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4",
              src ? "bg-lavender-950/10" : ""
            )}
          >
            <button
              type="button"
              onClick={play}
              disabled={!src}
              aria-label={hero.video.playLabel}
              className="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-background/90 text-primary shadow-soft-md backdrop-blur-sm transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60 sm:size-20"
            >
              <PlayIcon className="size-6 translate-x-0.5 fill-current sm:size-7" aria-hidden />
            </button>

            <p className="pointer-events-none rounded-full bg-background/85 px-3 py-1 text-small font-medium text-foreground backdrop-blur-sm">
              {hero.video.caption}
            </p>
          </div>
        ) : null}
      </AspectRatio>
    </div>
  )
}
