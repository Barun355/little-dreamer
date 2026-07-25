/**
 * Every user-facing string on the landing page.
 *
 * Components import from here and never inline copy, so a marketing rewrite
 * is a one-file edit and never touches component code (risk R8). A CMS can
 * replace this module later without a rewrite.
 *
 * Strings marked `TODO_` are placeholders that MUST be resolved or removed
 * before launch — see the pre-launch content gate in PHASE-7 §7.5.
 */

export const brand = {
  name: "Little Dreamer",
  tagline: "A Story as Unique as Your Child",
  promise: "Every child deserves to be the hero of their own story.",
  mark: "☾",
} as const

export const nav = {
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Themes", href: "#themes" },
    { label: "Sample", href: "#sample" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#safety" },
  ],
  signIn: { label: "Sign in", href: "/create" },
  cta: { label: "Create a book", href: "/create" },
  menuLabel: "Open menu",
  menuTitle: "Menu",
} as const

export const hero = {
  eyebrow: "A Story as Unique as Your Child",
  // Split for word-by-word motion. Joined for the accessible name.
  headline: ["Your", "child", "becomes", "the", "hero", "of", "their", "own", "storybook"],
  subhead:
    "Upload one photo. Pick an adventure. Get an illustrated book where the hero actually looks like your child.",
  video: {
    caption: "See a book made in 4 minutes",
    duration: "1:12",
    playLabel: "Play the demo video",
  },
  primaryCta: { label: "Try it free", href: "/create" },
  secondaryCta: { label: "See sample books", href: "#sample" },
  reassurance: ["No card needed", "First 3 pages free", "Ready in 4 minutes"],
} as const

/**
 * TODO_SOCIAL_PROOF — the rating and book count are INVENTED placeholders.
 * Publishing fabricated metrics is a credibility and legal risk. Replace with
 * real figures or delete the two entries before launch (PHASE-3 §3.5, C3.10).
 */
export const trust = {
  items: [
    {
      id: "rating",
      icon: "star" as const,
      headline: "TODO_SOCIAL_PROOF",
      detail: "Awaiting real review data — do not ship this placeholder.",
      isPlaceholder: true,
    },
    {
      id: "coppa",
      icon: "shield" as const,
      headline: "COPPA-aligned",
      detail:
        "Built to the US Children's Online Privacy Protection Act. We collect the minimum needed to make one book.",
      isPlaceholder: false,
    },
    {
      id: "training",
      icon: "ban" as const,
      headline: "Photos never train our AI",
      detail:
        "Your child's photo is used once to build their character, then deleted. It is never added to a training set and never shared.",
      isPlaceholder: false,
    },
    {
      id: "retention",
      icon: "clock" as const,
      headline: "Deleted within 30 days",
      detail:
        "Source photos are removed automatically. You can delete them sooner from your account at any time.",
      isPlaceholder: false,
    },
  ],
} as const

export const footer = {
  blurb: "A Story as Unique as Your Child.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Create a book", href: "/create" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Sample books", href: "#sample" },
        { label: "Pricing", href: "#pricing" },
        { label: "Gift cards", href: "/create" },
      ],
    },
    {
      title: "Themes",
      links: [
        { label: "Fantasy", href: "#themes" },
        { label: "Adventure", href: "#themes" },
        { label: "I Want To Become", href: "#themes" },
        { label: "Seasonal", href: "#themes" },
        { label: "Birthdays", href: "#themes" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/create" },
        { label: "Contact", href: "/create" },
        { label: "Blog", href: "/create" },
        { label: "Careers", href: "/create" },
        { label: "Press", href: "/create" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "COPPA", href: "/legal/coppa" },
        { label: "Photo use", href: "/legal/photo-use" },
        { label: "Refunds", href: "/legal/refunds" },
      ],
    },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" as const },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" as const },
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" as const },
  ],
  reassurance: "Photos deleted within 30 days · never used for training",
  copyright: `© ${new Date().getFullYear()} ${brand.name}`,
} as const

/** Section anchors. Single source so nav links and DOM ids cannot drift. */
export const sections = [
  { id: "hero", label: "Hero" },
  { id: "trust", label: "Trust" },
  { id: "core", label: "Core" },
  { id: "proof", label: "Proof" },
  { id: "how-it-works", label: "How it works" },
  { id: "themes", label: "Themes" },
  { id: "sample", label: "Sample" },
  { id: "testimonials", label: "Testimonials" },
  { id: "pricing", label: "Pricing" },
  { id: "safety", label: "Safety" },
  { id: "final-cta", label: "Final CTA" },
] as const

export type SectionId = (typeof sections)[number]["id"]
