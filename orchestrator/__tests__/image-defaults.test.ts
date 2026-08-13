import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { DEFAULT_IMAGE_MODEL } from "../config"

describe("orchestrator image defaults", () => {
  it("defaults image model to gpt-image-1-mini for reference face-lock", () => {
    assert.equal(DEFAULT_IMAGE_MODEL, "gpt-image-1-mini")
  })
})
