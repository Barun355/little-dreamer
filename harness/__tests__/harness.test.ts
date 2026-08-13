import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { StoryHarness } from "../index"
import { assembleImagePrompts } from "../prompts/assemble-image-prompts"
import { normalizeStoryOutput } from "../story/normalize-story"
import { DEFAULT_PIPELINE_CONFIG } from "../config"

const FIXTURE_STORY = {
  title: "Leo and the Star Path",
  coverSubtitle: "A glowing night-sky adventure",
  baseStory: "Leo follows a ribbon of stars across a quiet night sky.",
  backCoverBlurb: "The End — sweet dreams, Leo!",
  character: {
    name: "Leo",
    visualDescription:
      "A six-year-old boy with short black hair, warm brown skin, bright eyes, wearing a blue hoodie and yellow sneakers",
  },
  pages: [
    {
      pageNumber: 1,
      text: "Leo peeked out the window and saw a glowing path of stars.",
      sceneDescription: "Looking out a bedroom window at a glowing path of stars",
      dialogueBubble: "Wow, a path of stars!",
    },
    {
      pageNumber: 2,
      text: "He stepped onto soft clouds that floated like stepping stones.",
      sceneDescription: "Stepping across soft cloud stepping stones in the night sky",
      dialogueBubble: "Clouds like stepping stones!",
    },
    {
      pageNumber: 3,
      text: "A friendly comet waved and offered Leo a ride.",
      sceneDescription: "Riding beside a friendly comet with a sparkling trail",
      dialogueBubble: "Want a sparkling ride?",
    },
    {
      pageNumber: 4,
      text: "Together they visited a quiet moon garden full of silver flowers.",
      sceneDescription: "Walking through a moon garden of silver flowers",
      dialogueBubble: "Silver flowers everywhere!",
    },
    {
      pageNumber: 5,
      text: "Leo drifted home, tucked into bed, and dreamed of stars.",
      sceneDescription: "Drifting home toward a cozy bed under a starry sky",
      dialogueBubble: "Goodnight, little stars!",
    },
  ],
}

describe("normalizeStoryOutput", () => {
  it("accepts camelCase fixture output", () => {
    const bundle = normalizeStoryOutput(FIXTURE_STORY)
    assert.equal(bundle.character.name, "Leo")
    assert.equal(bundle.pages.length, 5)
    assert.equal(bundle.coverSubtitle, "A glowing night-sky adventure")
    assert.equal(bundle.backCoverBlurb, "The End — sweet dreams, Leo!")
    assert.match(bundle.pages[0]!.sceneDescription, /bedroom window/)
    assert.equal(bundle.pages[0]!.dialogueBubble, "Wow, a path of stars!")
  })

  it("coerces snake_case keys from messy model output", () => {
    const bundle = normalizeStoryOutput(
      {
        title: "Ada's Ocean",
        cover_subtitle: "A coral reef bedtime journey",
        base_story: "Ada explores a glowing coral reef.",
        back_cover_blurb: "The End — sweet dreams, Ada!",
        character: {
          name: "Ada",
          visual_description:
            "A five-year-old girl with wavy auburn hair, freckles, and a green swimsuit",
        },
        pages: [
          {
            page_number: 1,
            text: "Ada dipped her toes in warm water.",
            scene_description: "Standing at the shoreline dipping toes in warm water",
            dialogue_bubble: "The water feels warm!",
          },
          {
            page_number: 2,
            text: "A dolphin spun nearby.",
            scene_description: "Watching a dolphin spin in clear turquoise water",
          },
          {
            page_number: 3,
            text: "Coral castles shimmered ahead.",
            scene_description: "Approaching shimmering coral castles underwater",
          },
          {
            page_number: 4,
            text: "Ada shared shells with a turtle.",
            scene_description: "Sharing seashells with a gentle sea turtle",
          },
          {
            page_number: 5,
            text: "She swam home for bedtime.",
            scene_description: "Swimming home toward a sandy shore at dusk",
          },
        ],
      },
      { fallbackChildName: "Ada" }
    )

    assert.equal(bundle.baseStory, "Ada explores a glowing coral reef.")
    assert.equal(bundle.coverSubtitle, "A coral reef bedtime journey")
    assert.match(bundle.character.visualDescription, /auburn/)
    assert.equal(bundle.pages[2]!.pageNumber, 3)
    assert.match(bundle.pages[1]!.dialogueBubble, /dolphin/i)
  })
})

describe("assembleImagePrompts", () => {
  it("builds seven cinematic prompts with cover typography and speech bubbles", () => {
    const prompts = assembleImagePrompts({
      character: FIXTURE_STORY.character,
      pages: FIXTURE_STORY.pages,
      slots: [
        "frontCover",
        "page1",
        "page2",
        "page3",
        "page4",
        "page5",
        "backCover",
      ],
      title: FIXTURE_STORY.title,
      coverSubtitle: FIXTURE_STORY.coverSubtitle,
      backCoverBlurb: FIXTURE_STORY.backCoverBlurb,
      baseStory: FIXTURE_STORY.baseStory,
    })

    assert.equal(prompts.length, 7)
    assert.equal(prompts[0]!.slot, "frontCover")
    assert.match(prompts[0]!.prompt, /Leo:/)
    assert.match(prompts[0]!.prompt, /blue hoodie/)
    assert.match(prompts[0]!.prompt, /Pixar and Disney-quality/)
    assert.match(prompts[0]!.prompt, /Title text exactly: "Leo and the Star Path"/)
    assert.match(
      prompts[0]!.prompt,
      /Subtitle text exactly: "A glowing night-sky adventure"/
    )
    assert.doesNotMatch(prompts[0]!.prompt, /watercolor/)
    assert.doesNotMatch(prompts[0]!.prompt, /no text/)
    assert.match(prompts[1]!.prompt, /Speech bubble dialogue exactly/)
    assert.match(prompts[1]!.prompt, /Wow, a path of stars!/)
    assert.match(prompts[6]!.prompt, /Back cover text exactly/)
    assert.match(prompts[6]!.prompt, /sweet dreams, Leo/)

    for (const item of prompts) {
      assert.match(item.prompt, /consistent character design/)
      assert.match(item.prompt, /reference photo/)
    }
  })
})

describe("StoryHarness facade", () => {
  it("builds a story request and assembles prompts end-to-end", () => {
    const harness = new StoryHarness()
    const request = harness.buildStoryGenerationRequest({
      childName: "Leo",
      childAge: 6,
      theme: {
        title: "Space Adventure",
        baseStory: "A child travels among glowing stars.",
      },
      photoUrl: "https://example.com/leo.jpg",
    })

    assert.ok(request.messages.length >= 2)
    assert.equal(request.jsonSchema.name, "generated_story_with_character")
    assert.equal(typeof request.messages[1]!.content, "string")
    assert.match(request.messages[1]!.content as string, /Leo/)
    assert.match(request.messages[1]!.content as string, /dialogueBubble/)

    const bundle = harness.parseStoryOutput(JSON.stringify(FIXTURE_STORY))
    const prompts = harness.assembleImagePrompts({
      character: bundle.character,
      pages: bundle.pages,
      slots: ["frontCover", "page1", "page2", "page3", "page4", "page5", "backCover"],
      title: bundle.title,
      coverSubtitle: bundle.coverSubtitle,
      backCoverBlurb: bundle.backCoverBlurb,
      baseStory: bundle.baseStory,
    })

    assert.equal(prompts.length, 7)
  })

  it("attaches photo as multimodal image_url part in the user message", () => {
    const harness = new StoryHarness()
    const request = harness.buildStoryGenerationRequest({
      childName: "Leo",
      childAge: 6,
      theme: {
        title: "Space Adventure",
        baseStory: "A child travels among glowing stars.",
      },
      photo: {
        base64: "abc123",
        contentType: "image/jpeg",
      },
    })

    const userContent = request.messages[1]!.content
    assert.ok(Array.isArray(userContent))
    assert.equal(userContent[0]?.type, "text")
    assert.match((userContent[0] as { text: string }).text, /attached photo/i)
    assert.equal(userContent[1]?.type, "image_url")
    assert.equal(
      (userContent[1] as { image_url: { url: string } }).image_url.url,
      "data:image/jpeg;base64,abc123"
    )
  })
})

describe("pipeline defaults", () => {
  it("keeps NineRouter for text and gpt-image-1-mini for images", () => {
    assert.equal(DEFAULT_PIPELINE_CONFIG.text.provider, "ninerouter")
    assert.equal(DEFAULT_PIPELINE_CONFIG.image.model, "gpt-image-1-mini")
  })
})
