/**
 * Copy for sections 06 (How it works) and 08 (Sample).
 */

export const howItWorks = {
  heading: "Four minutes, four steps",
  steps: [
    {
      n: 1,
      icon: "camera" as const,
      title: "Upload a photo",
      body: "One clear photo of their face is all we need. It is deleted within 30 days.",
    },
    {
      n: 2,
      icon: "pencil" as const,
      title: "Tell us about them",
      body: "Their name, their age, and the adventure you want them to have.",
    },
    {
      n: 3,
      icon: "sparkles" as const,
      title: "We write and illustrate",
      body: "A story, a cover and six pages, pitched at their reading age and drawn from one character reference.",
    },
    {
      n: 4,
      icon: "book" as const,
      title: "Read it tonight",
      body: "Preview the first pages free. Download the full book whenever you are ready.",
    },
  ],
} as const

export const sample = {
  heading: "Look inside a real book",
  intro: "Six spreads from a finished storybook. Swipe, drag, or use the arrow keys.",
  /**
   * Spread text is illustrative sample prose, not output from a real
   * generation run. Once the Make pipeline produces its first book, replace
   * these with genuine pages so the section shows the actual product.
   */
  spreads: [
    {
      id: "intro",
      page: 1,
      text: "Aarav could not sleep. The stars outside his window looked closer than usual — close enough, almost, to touch.",
    },
    {
      id: "ch1",
      page: 4,
      text: "Aarav pressed his hand to the glass, and the stars pressed back. A door opened where no door had been.",
    },
    {
      id: "ch2",
      page: 7,
      text: "The little ship knew his name. It hummed it softly, the way his mother did when she thought he was asleep.",
    },
    {
      id: "ch3",
      page: 10,
      text: "The satellite was old and tired and very far from home. Aarav knew exactly how that felt.",
    },
    {
      id: "ch4",
      page: 13,
      text: "It took both of them to fix it — one small pair of hands, and one very patient alien child.",
    },
    {
      id: "ch5",
      page: 16,
      text: "Aarav came home a hero, and fell asleep under the same stars. They did not look so far away any more.",
    },
  ],
} as const
