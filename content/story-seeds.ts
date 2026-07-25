/**
 * Turns a theme id into the nine inputs the Make scenario expects.
 *
 * The landing page and the wizard both let a parent pick a *theme*; the
 * pipeline needs a world, a direction, a pool of adventures, an ending and an
 * emotional arc. Rather than ask a parent eight questions, each theme carries
 * its own seed data and the wizard stays a single choice.
 *
 * `possibleAdventures` is deliberately larger than the number of beats a book
 * uses — the story engine selects and orders a subset per `seed`, which is
 * what stops two books on the same theme reading identically.
 */

import { themes, type Theme } from "./themes"

export type StorySeed = {
  storyWorld: string
  storyDirection: string
  possibleAdventures: string[]
  ending: string
  emotionalTheme: string[]
  audiencePreference: string[]
  recommendedAgeGroup: string
}

const BY_CATEGORY: Record<Theme["category"], Omit<StorySeed, "storyWorld" | "recommendedAgeGroup">> = {
  fantasy: {
    storyDirection: "a quiet act of courage that changes everything",
    possibleAdventures: [
      "befriending a creature everyone else fears",
      "finding a door that was not there yesterday",
      "solving a riddle no grown-up could",
      "returning something precious that was lost",
      "calming a storm with a song",
      "sharing the last of something when it matters",
      "climbing higher than they thought they could",
      "keeping a promise in the dark",
    ],
    ending: "comes home changed, and falls asleep smiling",
    emotionalTheme: ["courage", "kindness", "wonder"],
    audiencePreference: ["gentle", "magical"],
  },
  adventure: {
    storyDirection: "an unlikely rescue that only they could manage",
    possibleAdventures: [
      "navigating by the stars when the map is wrong",
      "helping a lost creature find its family",
      "crossing something that looked impossible",
      "sharing supplies with a stranger",
      "repairing something broken and important",
      "outwitting a storm",
      "discovering a place no one had named",
      "turning back to help someone slower",
    ],
    ending: "returns home a hero and sleeps under the stars",
    emotionalTheme: ["courage", "friendship", "curiosity"],
    audiencePreference: ["exciting", "warm"],
  },
  become: {
    storyDirection: "a first real day on the job, and one person who needed them",
    possibleAdventures: [
      "being trusted with something important",
      "making a mistake and putting it right",
      "listening carefully when it mattered most",
      "staying calm while everyone else worried",
      "asking for help and getting it",
      "teaching someone else what they had just learned",
      "working through the night to finish",
      "being thanked by someone they helped",
    ],
    ending: "is told they were exactly what was needed, and sleeps proud",
    emotionalTheme: ["confidence", "responsibility", "belonging"],
    audiencePreference: ["encouraging", "true to life"],
  },
}

/** Worlds that read better than a bare theme name in a prompt. */
const WORLD_OVERRIDES: Record<string, string> = {
  "unicorn-kingdom": "The Unicorn Kingdom, beyond the last hill",
  "fairy-forest": "A forest where the lanterns are alive",
  "dragon-rider": "The high crags where dragons nest",
  "wizard-school": "A school for young wizards",
  "mermaid-adventure": "A coral city under a warm sea",
  "jungle-safari": "A jungle loud with birds and rivers",
  "dinosaur-explorer": "A valley where dinosaurs still roam",
  "space-explorer": "The deep space frontier",
  "pirate-treasure": "A chain of islands and hidden coves",
  "treasure-hunter": "An old map and the places it names",
}

export function seedForTheme(themeId: string): (StorySeed & { theme: Theme }) | null {
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return null

  const base = BY_CATEGORY[theme.category]
  const storyWorld =
    WORLD_OVERRIDES[theme.id] ??
    (theme.category === "become"
      ? `The everyday world, seen through the eyes of a ${theme.name.toLowerCase()}`
      : theme.name)

  return {
    theme,
    storyWorld,
    recommendedAgeGroup: `${theme.ageRange[0]}-${theme.ageRange[1]}`,
    ...base,
  }
}
