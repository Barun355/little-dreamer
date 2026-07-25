"use server"

import { randomUUID } from "node:crypto"

import { db } from "@/lib/db"
import { putObject, signedGetUrl } from "@/lib/r2"
import { env } from "@/lib/env"
import { createInputSchema, type CreateInput } from "@/lib/create-schema"
import { seedForTheme } from "@/content/story-seeds"

export type StartResult =
  | { ok: true; jobId: string }
  | { ok: false; error: string }

/**
 * Starts a generation run.
 *
 * 1. validate
 * 2. persist child + job (Neon is the source of truth for status)
 * 3. upload the photo to R2
 * 4. hand Make a short-lived PUBLIC URL, never the image bytes
 *
 * Step 4 matters: Make retains full request bodies in its execution history,
 * so posting base64 photographs of a child would leave them sitting in those
 * logs indefinitely. A URL to R2 keeps the bytes under our control and lets
 * the retention policy actually mean something.
 */
export async function startGeneration(input: CreateInput): Promise<StartResult> {
  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const data = parsed.data

  const seed = seedForTheme(data.themeId)
  if (!seed) return { ok: false, error: "That theme no longer exists" }

  const jobId = `job_${randomUUID().replace(/-/g, "").slice(0, 20)}`
  const variationSeed = Math.floor(Math.random() * 1_000_000)

  try {
    // A single anonymous owner until auth exists. Deliberately not inventing
    // an account: the wizard works without sign-in, and a real user can be
    // attached later without changing the job's shape.
    const user = await db.user.upsert({
      where: { email: "guest@little-dreamer.local" },
      update: {},
      create: { email: "guest@little-dreamer.local", name: "Guest" },
    })

    const child = await db.child.create({
      data: {
        userId: user.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        relationship: data.relationship,
        photoKeys: [],
        photosDeleteAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Upload photos before creating the job, so a storage failure never
    // leaves an orphan job stuck at QUEUED.
    const photoUrls: string[] = []
    const photoKeys: string[] = []
    for (const [i, dataUrl] of data.photos.entries()) {
      const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
      if (!match) return { ok: false, error: "That photo could not be read" }
      const [, contentType, b64] = match
      const ext = contentType.split("/")[1].replace("jpeg", "jpg")
      const key = `photos/${child.id}/${i}.${ext}`
      await putObject(key, Buffer.from(b64, "base64"), contentType)
      photoKeys.push(key)
      // A signed link, not a public URL: the bucket stays private, and the
      // link Make receives expires within the hour.
      photoUrls.push(await signedGetUrl(key, 60 * 60))
    }

    await db.child.update({ where: { id: child.id }, data: { photoKeys } })

    const job = await db.job.create({
      data: {
        id: jobId,
        userId: user.id,
        childId: child.id,
        status: "QUEUED",
        seed: variationSeed,
        themeId: data.themeId,
        consentAt: new Date(),
        recommendedAgeGroup: seed.recommendedAgeGroup,
        audiencePreference: [...seed.audiencePreference],
        storyWorld: seed.storyWorld,
        storyDirection: seed.storyDirection,
        possibleAdventures: [...seed.possibleAdventures],
        ending: seed.ending,
        storyTheme: seed.theme.name,
        emotionalTheme: [...seed.emotionalTheme],
        pronouns:
          data.gender === "girl"
            ? "she/her"
            : data.gender === "boy"
              ? "he/him"
              : "they/them",
        ageBand: data.age < 6 ? "3-5" : data.age < 8 ? "6-7" : "8-10",
      },
    })

    const callbackBase = env.publicCallbackUrl
    const res = await fetch(env.make.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-make-apikey": env.make.apiKey,
      },
      body: JSON.stringify({
        jobId: job.id,
        seed: variationSeed,
        recommendedAgeGroup: seed.recommendedAgeGroup,
        audiencePreference: seed.audiencePreference,
        storyWorld: seed.storyWorld,
        storyDirection: seed.storyDirection,
        possibleAdventures: seed.possibleAdventures,
        ending: seed.ending,
        storyTheme: seed.theme.name,
        child: {
          name: data.name,
          age: data.age,
          gender: data.gender,
          relationship: data.relationship,
          images: photoUrls,
        },
        emotionalTheme: seed.emotionalTheme,
        // Omitted entirely when there is no public tunnel — Make's callback
        // module is filtered on this existing, so an absent value simply
        // skips the callback instead of failing the run.
        ...(callbackBase ? { callback: { baseUrl: callbackBase } } : {}),
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      await db.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          failedStage: "DISPATCH",
          failedReason: `Make returned ${res.status}: ${body.slice(0, 200)}`,
        },
      })
      return { ok: false, error: "We could not start the workshop. Nothing was charged." }
    }

    await db.job.update({ where: { id: job.id }, data: { status: "ANALYZING" } })
    return { ok: true, jobId: job.id }
  } catch (err) {
    console.error("startGeneration failed", err)
    return {
      ok: false,
      error: "Something went wrong starting your book. Nothing was charged.",
    }
  }
}
