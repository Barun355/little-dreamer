import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { allocateUsername } from "../username"

describe("allocateUsername", () => {
  it("slugifies display name and appends id suffix", () => {
    assert.equal(
      allocateUsername({
        userId: "AbC123XYZ",
        name: "Prarambhi Varane",
        email: "someone@example.com",
      }),
      "prarambhi-varane-abc123"
    )
  })

  it("falls back to email local-part when name is missing", () => {
    assert.equal(
      allocateUsername({
        userId: "user99id",
        name: null,
        email: "Maya.Kid@example.com",
      }),
      "maya-kid-user99"
    )
  })
})
