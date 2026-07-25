/**
 * Copy for sections 09–12.
 *
 * TWO THINGS HERE ARE NOT REAL AND MUST NOT SHIP AS IF THEY WERE:
 *  - every testimonial (`isPlaceholder: true`)
 *  - the prices and currency (`isPlaceholder: true` on pricing)
 *
 * Publishing invented customer reviews is deceptive and, in most
 * jurisdictions, unlawful. The components render placeholder entries behind a
 * visible "Sample" label so nothing masquerades as genuine, and the launch
 * gate (PHASE-7 §7.5) blocks release while any flag is still set.
 */

export const testimonials = {
  heading: "Parents, after bedtime",
  /** Shown while any entry is a placeholder. */
  placeholderNotice:
    "Sample copy — we have not launched yet, so these are illustrative, not real customer reviews.",
  items: [
    {
      id: "priya",
      stars: 5,
      quote:
        "She gasped. She actually gasped when she saw herself on the cover.",
      name: "Priya M.",
      role: "mum of 2",
      initials: "PM",
      isPlaceholder: true,
    },
    {
      id: "daniel",
      stars: 5,
      quote: "He has asked for the same book eleven nights in a row.",
      name: "Daniel R.",
      role: "dad of 1",
      initials: "DR",
      isPlaceholder: true,
    },
    {
      id: "sofia",
      stars: 5,
      quote:
        "It genuinely looks like her. That was the part I did not expect.",
      name: "Sofia A.",
      role: "mum of 3",
      initials: "SA",
      isPlaceholder: true,
    },
    {
      id: "meera",
      stars: 5,
      quote:
        "Bought it as a birthday gift. His mum cried. I am not exaggerating.",
      name: "Meera K.",
      role: "aunt",
      initials: "MK",
      isPlaceholder: true,
    },
    {
      id: "tom",
      stars: 5,
      quote: "My son is 4 and the words were actually pitched at a 4-year-old.",
      name: "Tom B.",
      role: "dad of 2",
      initials: "TB",
      isPlaceholder: true,
    },
    {
      id: "aisha",
      stars: 4,
      quote:
        "Took five minutes. I was expecting to fight with it for an hour.",
      name: "Aisha N.",
      role: "mum of 1",
      initials: "AN",
      isPlaceholder: true,
    },
  ],
} as const

export const pricing = {
  heading: "Pay per book. No subscription.",
  subheading: "A storybook is a keepsake, not a service you rent.",
  /** TODO_PRICING — figures and currency are invented. Decisions D2/D8. */
  isPlaceholder: true,
  placeholderNotice: "Indicative pricing — not final.",
  currency: "₹",
  tiers: [
    {
      id: "preview",
      name: "Preview",
      price: "Free",
      badge: null,
      cta: { label: "Start free", href: "/create" },
      highlighted: false,
      features: [
        { text: "First 3 pages", included: true },
        { text: "One theme", included: true },
        { text: "Watermarked preview", included: true },
        { text: "Download", included: false },
        { text: "Print-ready file", included: false },
      ],
    },
    {
      id: "one-book",
      name: "One Book",
      price: "₹499",
      badge: "Most popular",
      cta: { label: "Create my book", href: "/create" },
      highlighted: true,
      features: [
        { text: "Full illustrated book", included: true },
        { text: "All themes", included: true },
        { text: "Cover and dedication", included: true },
        { text: "Print-ready PDF", included: true },
        { text: "Physical copy posted", included: false },
      ],
    },
    {
      id: "keepsake",
      name: "Keepsake",
      price: "₹1,499",
      badge: null,
      cta: { label: "Order a keepsake", href: "/create" },
      highlighted: false,
      features: [
        { text: "Everything in One Book", included: true },
        { text: "Hardcover, posted to you", included: true },
        { text: "Gift wrap and card", included: true },
        { text: "Audiobook", included: false },
      ],
    },
  ],
  guarantee: "Not happy with an illustration? Regenerate it free.",
} as const

/**
 * Ordered by the objections competitor research found parents actually raise,
 * strongest first. This same data feeds the FAQPage structured data, so the
 * visible copy and the markup can never disagree.
 */
export const faq = {
  heading: "The questions parents actually ask",
  items: [
    {
      id: "photo",
      q: "What happens to my child's photo?",
      a: "It is used once to build their character, then deleted within 30 days. It is never added to a training set, never sold, and never shared. You can delete it sooner from your account at any time.",
    },
    {
      id: "likeness",
      q: "Will it actually look like my child?",
      a: "We build a single character reference from your photo first, then draw every page from that reference. Most tools redraw the child from scratch on each page, which is why the face drifts. You can see the difference in the comparison above.",
    },
    {
      id: "edit",
      q: "Can I edit the story or redo a picture?",
      a: "Yes. Any illustration can be regenerated, and the story text can be edited before you download. Regenerating an illustration is free.",
    },
    {
      id: "unique",
      q: "Do two books ever come out the same?",
      a: "No. Each book selects and orders a different set of story beats, so the same child and the same theme produce a genuinely different book each time.",
    },
    {
      id: "print",
      q: "Can I get it printed?",
      a: "Every book includes a print-ready PDF you can take to any printer. A hardcover option posted to your door is coming.",
    },
  ],
} as const

export const finalCta = {
  heading: "Every child deserves to be the hero of their own story.",
  cta: { label: "Try it free", href: "/create" },
  reassurance: "No card needed · Ready in about four minutes",
} as const
