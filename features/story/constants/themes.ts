import type { LucideIcon } from "lucide-react"
import {
  Fish,
  PawPrint,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  TreePine,
} from "lucide-react"

import type { StorybookTheme } from "@/types"

export type StoryThemeOption = StorybookTheme & {
  id: string
  label: string
  icon: LucideIcon
  accent: string
}

export const STORY_THEMES: StoryThemeOption[] = [
  {
    id: "space",
    label: "Space",
    title: "Space Adventure",
    baseStory:
      "A brave child discovers a hidden rocket and sets off on an interstellar journey among glowing stars and friendly planets.",
    icon: Rocket,
    accent: "from-indigo-500/25 via-violet-500/15 to-sky-500/10",
  },
  {
    id: "forest",
    label: "Forest",
    title: "Enchanted Forest",
    baseStory:
      "Deep in a whispering woodland, a curious child follows a trail of fireflies to a secret grove where animals share ancient stories.",
    icon: TreePine,
    accent: "from-emerald-500/25 via-green-500/15 to-lime-500/10",
  },
  {
    id: "ocean",
    label: "Ocean",
    title: "Ocean Quest",
    baseStory:
      "Beneath rolling waves, a young explorer befriends playful dolphins and uncovers a coral kingdom filled with wonder.",
    icon: Fish,
    accent: "from-cyan-500/25 via-blue-500/15 to-teal-500/10",
  },
  {
    id: "dino",
    label: "Dino",
    title: "Dinosaur Discovery",
    baseStory:
      "On a sunny hillside, a fearless child finds dinosaur tracks that lead to a valley where gentle giants still roam.",
    icon: PawPrint,
    accent: "from-amber-500/25 via-orange-500/15 to-yellow-500/10",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    title: "Magical Kingdom",
    baseStory:
      "Through a shimmering portal, a child enters a realm of castles, dragons, and spells woven just for them.",
    icon: Sparkles,
    accent: "from-fuchsia-500/25 via-purple-500/15 to-pink-500/10",
  },
  {
    id: "superhero",
    label: "Hero",
    title: "Superhero Origin",
    baseStory:
      "When their town needs help, a child discovers a special power and learns what it truly means to be a hero.",
    icon: Shield,
    accent: "from-red-500/25 via-rose-500/15 to-orange-500/10",
  },
  {
    id: "adventure",
    label: "Adventure",
    title: "Grand Adventure",
    baseStory:
      "With a map in hand and courage in heart, a child sets out on a quest full of puzzles, friends, and surprises.",
    icon: Swords,
    accent: "from-violet-500/25 via-indigo-500/15 to-blue-500/10",
  },
]

export function getStoryThemeById(id: string) {
  return STORY_THEMES.find((theme) => theme.id === id)
}
