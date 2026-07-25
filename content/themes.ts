/**
 * The theme catalogue — single source of truth.
 *
 * COUNT DECISION: 26 themes, taken straight from the product brief
 * (5 fantasy + 5 adventure + 16 professions). The wireframe and early copy
 * said "16", which matched only the profession list. Rather than curate 10
 * themes out of the brief, the catalogue carries all of them and the copy
 * reads its length — so the two can never disagree again (PHASE-5 C5.3).
 *
 * `thumbnail: null` means asset A6 has not been supplied and a tinted
 * placeholder renders instead.
 */

export type ThemeCategory = "fantasy" | "adventure" | "become"

export type Theme = {
  id: string
  name: string
  category: ThemeCategory
  thumbnail: string | null
  /** Inclusive age band the theme is written for. */
  ageRange: [number, number]
}

export const categories: Record<
  ThemeCategory,
  { label: string; blurb: string; tone: "lavender" | "sky" | "gold" | "mint" }
> = {
  fantasy: {
    label: "Fantasy",
    blurb: "Magic, and the courage to use it well.",
    tone: "lavender",
  },
  adventure: {
    label: "Adventure",
    blurb: "Big worlds, and a small hero who is equal to them.",
    tone: "sky",
  },
  become: {
    label: "I Want To Become",
    blurb: "The job they already say they want to do.",
    tone: "gold",
  },
}

export const themes: Theme[] = [
  // Fantasy
  { id: "unicorn-kingdom", name: "Magical Unicorn Kingdom", category: "fantasy", thumbnail: null, ageRange: [3, 7] },
  { id: "fairy-forest", name: "Fairy Forest", category: "fantasy", thumbnail: null, ageRange: [3, 6] },
  { id: "dragon-rider", name: "Dragon Rider", category: "fantasy", thumbnail: null, ageRange: [5, 10] },
  { id: "wizard-school", name: "Wizard School", category: "fantasy", thumbnail: null, ageRange: [6, 10] },
  { id: "mermaid-adventure", name: "Mermaid Adventure", category: "fantasy", thumbnail: null, ageRange: [3, 8] },

  // Adventure
  { id: "jungle-safari", name: "Jungle Safari", category: "adventure", thumbnail: null, ageRange: [3, 8] },
  { id: "dinosaur-explorer", name: "Dinosaur Explorer", category: "adventure", thumbnail: null, ageRange: [4, 9] },
  { id: "space-explorer", name: "Space Explorer", category: "adventure", thumbnail: null, ageRange: [5, 10] },
  { id: "pirate-treasure", name: "Pirate Treasure Hunt", category: "adventure", thumbnail: null, ageRange: [4, 9] },
  { id: "treasure-hunter", name: "Treasure Hunter", category: "adventure", thumbnail: null, ageRange: [6, 10] },

  // I Want To Become
  { id: "doctor", name: "Doctor", category: "become", thumbnail: null, ageRange: [4, 10] },
  { id: "astronaut", name: "Astronaut", category: "become", thumbnail: null, ageRange: [4, 10] },
  { id: "scientist", name: "Scientist", category: "become", thumbnail: null, ageRange: [5, 10] },
  { id: "engineer", name: "Engineer", category: "become", thumbnail: null, ageRange: [6, 10] },
  { id: "firefighter", name: "Firefighter", category: "become", thumbnail: null, ageRange: [3, 8] },
  { id: "police-officer", name: "Police Officer", category: "become", thumbnail: null, ageRange: [4, 9] },
  { id: "pilot", name: "Pilot", category: "become", thumbnail: null, ageRange: [4, 10] },
  { id: "veterinarian", name: "Veterinarian", category: "become", thumbnail: null, ageRange: [4, 10] },
  { id: "chef", name: "Chef", category: "become", thumbnail: null, ageRange: [3, 9] },
  { id: "teacher", name: "Teacher", category: "become", thumbnail: null, ageRange: [4, 9] },
  { id: "artist", name: "Artist", category: "become", thumbnail: null, ageRange: [3, 10] },
  { id: "musician", name: "Musician", category: "become", thumbnail: null, ageRange: [3, 10] },
  { id: "detective", name: "Detective", category: "become", thumbnail: null, ageRange: [6, 10] },
  { id: "programmer", name: "Programmer", category: "become", thumbnail: null, ageRange: [7, 10] },
  { id: "farmer", name: "Farmer", category: "become", thumbnail: null, ageRange: [3, 8] },
  { id: "royalty", name: "King or Queen", category: "become", thumbnail: null, ageRange: [3, 8] },
]

export const themeCount = themes.length

export function themesByCategory(category: ThemeCategory): Theme[] {
  return themes.filter((t) => t.category === category)
}

/** How many to show per column before the "see all" affordance. */
export const VISIBLE_PER_CATEGORY = 5
