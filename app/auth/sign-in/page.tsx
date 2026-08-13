import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { auth } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export default async function SignInPage() {
  const { data: session } = await auth.getSession()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#07070f] px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-400/30">
            <Sparkles className="size-5 text-violet-300" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to Little Dreamer
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Continue with Google to create and save personalized storybooks.
            </p>
          </div>
        </div>
        <GoogleSignInButton />
      </div>
    </main>
  )
}
