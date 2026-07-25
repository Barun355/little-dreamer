import Link from "next/link"
import { LockIcon, ChevronDownIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { brand, footer } from "@/content/copy"

/**
 * lucide-react v1 removed brand glyphs (Instagram, YouTube, Facebook), so
 * these are inlined rather than pulling in a second icon dependency for
 * three marks. Kept at the same 24px grid as the rest of the icon set.
 */
const SOCIAL_ICONS = {
  instagram: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  ),
  youtube: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  ),
  facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  ),
} as const

function LinkList({
  links,
}: {
  links: readonly { readonly label: string; readonly href: string }[]
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="rounded-sm text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Site footer. Server Component — no interactivity beyond the mobile
 * accordion, which is a shadcn primitive and degrades to visible content.
 *
 * Every legal link resolves to a real route. On a page whose central
 * objection is "what happens to my child's photo?", a dead Privacy or
 * Photo-use link is worse than not linking at all.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-lavender-50/40">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 rounded-md font-heading text-body-lg font-semibold focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden className="text-lavender-500">
                {brand.mark}
              </span>
              {brand.name}
            </Link>
            <p className="max-w-56 text-small text-muted-foreground">{footer.blurb}</p>

            <ul className="flex items-center gap-2 pt-1">
              {footer.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon]
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <Icon className="size-4" aria-hidden />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Desktop: four columns. */}
          {footer.columns.map((col) => (
            <div key={col.title} className="hidden flex-col gap-3.5 lg:flex">
              <h2 className="font-heading text-small font-semibold">{col.title}</h2>
              <LinkList links={col.links} />
            </div>
          ))}

          {/*
            Mobile / tablet: native <details> rather than the Accordion
            primitive. Disclosure is exactly what <details> is for — it is
            keyboard operable, screen-reader announced and works with
            JavaScript disabled, at zero bundle cost. The JS accordion buys
            nothing here but weight in the critical path.
          */}
          <div className="flex flex-col lg:hidden">
            {footer.columns.map((col) => (
              <details key={col.title} className="group border-b border-border">
                <summary className="flex cursor-pointer items-center justify-between gap-2 py-3.5 font-heading text-body font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <ChevronDownIcon
                    className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="pb-4">
                  <LinkList links={col.links} />
                </div>
              </details>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-small text-muted-foreground">{footer.copyright}</p>
          <p className="flex items-center gap-2 text-small text-muted-foreground">
            <LockIcon className="size-3.5" aria-hidden />
            {footer.reassurance}
          </p>
        </div>
      </div>
    </footer>
  )
}
