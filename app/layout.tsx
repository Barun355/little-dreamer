import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

/**
 * Fraunces for display — warm and slightly literary, carries "storybook"
 * without tipping into twee. Inter for body. Both variable, both subset,
 * both `display: swap` so text is never invisible during load.
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
  title: "Little Dreamer — A Story as Unique as Your Child",
  description:
    "Upload one photo. Pick an adventure. Get an illustrated storybook where the hero actually looks like your child.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fraunces.variable, inter.variable, "font-sans antialiased")}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
