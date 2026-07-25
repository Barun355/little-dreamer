"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Light-only for v1.
 *
 * The brand is explicitly warm cream; a dark theme is a real design project
 * rather than a token flip, so it is deferred (PHASE-1 §1.1). `forcedTheme`
 * keeps next-themes mounted — so switching it on later is a one-line change —
 * without shipping a half-built dark palette.
 *
 * The scaffold preset also bound a global "d" hotkey to toggle dark mode.
 * Removed: it does nothing under forcedTheme, and a page-wide single-key
 * handler is a poor citizen on a marketing page.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="light"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
