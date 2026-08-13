import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

type LandingNavProps = {
  isSignedIn: boolean
}

export function LandingNav({ isSignedIn }: LandingNavProps) {
  const entryHref = isSignedIn ? "/dashboard" : "/auth/sign-in"
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-400/30">
            <Sparkles className="size-4 text-violet-300" aria-hidden />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-white">
              Little Dreamer
            </span>
            <span className="hidden text-[11px] text-white/45 sm:block">
              Personalized storybooks for children
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Link href={entryHref}>{isSignedIn ? "Dashboard" : "Sign in"}</Link>
          </Button>
          <Button
            asChild
            className="hidden bg-violet-500 text-white hover:bg-violet-400 sm:inline-flex"
          >
            <Link href={entryHref}>Create Their Storybook</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
