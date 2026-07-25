"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { nav, brand } from "@/content/copy"

/**
 * Sticky top navigation.
 *
 * Client-side only because of the scroll state and the mobile sheet. Kept
 * deliberately small: the links themselves are plain anchors, so the nav
 * works with JavaScript disabled.
 */
export function Nav() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-(--nav-height) transition-colors duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-heading text-body-lg font-semibold focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span aria-hidden className="text-lavender-500">
            {brand.mark}
          </span>
          {brand.name}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-small font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="hidden sm:inline-flex"
            render={<Link href={nav.signIn.href} />}
          >
            {nav.signIn.label}
          </Button>

          <Button
            size="lg"
            className="hidden sm:inline-flex"
            render={<Link href={nav.cta.href} />}
          >
            {nav.cta.label}
          </Button>

          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="icon-lg" className="lg:hidden" />
              }
              aria-label={nav.menuLabel}
            >
              <MenuIcon />
            </DialogTrigger>

            <DialogContent
              showCloseButton
              className="top-0 left-1/2 max-h-svh w-full max-w-none translate-x-[-50%] translate-y-0 rounded-none border-0 sm:max-w-none"
            >
              {/* Base UI requires a title for the accessible name. */}
              <DialogTitle className="font-heading text-h3">
                {nav.menuTitle}
              </DialogTitle>

              <ul className="flex flex-col gap-1 pt-2">
                {nav.links.map((link) => (
                  <li key={link.href}>
                    <DialogClose
                      // These are navigation links that also dismiss the
                      // sheet, so the rendered element is an <a>, not a
                      // <button>. Base UI assumes a native button unless
                      // told otherwise.
                      nativeButton={false}
                      render={
                        <a
                          href={link.href}
                          className="block rounded-lg px-3 py-3 text-body-lg font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        />
                      }
                    >
                      {link.label}
                    </DialogClose>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 pt-2">
                <Button size="xl" render={<Link href={nav.cta.href} />}>
                  <SparklesIcon data-icon="inline-start" />
                  {nav.cta.label}
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  render={<Link href={nav.signIn.href} />}
                >
                  {nav.signIn.label}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  )
}
