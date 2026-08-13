import Link from "next/link"
import { Sparkles } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Sparkles className="size-4 text-violet-300" aria-hidden />
          <span>Little Dreamer</span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
          <Link href="/privacy" className="transition-colors hover:text-white/80">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white/80">
            Terms
          </Link>
          <Link href="mailto:hello@littledreamer.app" className="transition-colors hover:text-white/80">
            Contact
          </Link>
        </nav>

        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} Little Dreamer
        </p>
      </div>
    </footer>
  )
}
