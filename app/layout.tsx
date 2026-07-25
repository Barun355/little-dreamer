import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { brand, hero } from "@/content/copy"

/**
 * Fraunces for display — warm and slightly literary, carries "storybook"
 * without tipping into twee. Inter for body. Both variable, both subset,
 * both `display: swap` so text is never invisible while fonts load.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: hero.subhead,
}

/**
 * Root layout — deliberately provider-free.
 *
 * next-themes was removed: v1 ships light-only, `:root` already IS the light
 * palette, and a theme provider running `forcedTheme="light"` is client-side
 * weight that changes nothing on screen. It comes back the day a real dark
 * palette exists.
 *
 * QueryProvider and Toaster are likewise not mounted — nothing here fetches
 * server state or raises a toast. Both remain in the repo for the app phase.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(fraunces.variable, inter.variable, "font-sans antialiased")}
    >
      <body>
        <a
          href="#main"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
