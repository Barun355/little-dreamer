import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth/server"

const neonAuthProxy = auth.middleware({
  loginUrl: "/auth/sign-in",
})

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const hasSessionVerifier = searchParams.has("neon_auth_session_verifier")
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  if (hasSessionVerifier || isDashboard) {
    return neonAuthProxy(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"],
}
