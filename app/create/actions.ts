"use server"

import { randomUUID } from "node:crypto"

import { db } from "@/lib/db"
import { signedGetUrl } from "@/lib/r2"
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
 * 3. hand Make short-lived SIGNED links to photos the browser already
 *    uploaded — never the image bytes
 *
 * Photos arrive as R2 keys, not data. They were uploaded straight from the
 * browser via a presigned PUT, because a Server Action body caps at 1 MB and
 * base64 adds a third on top: any real photograph 413'd before reaching this
 * function.
 *
 * Signed links rather than public URLs: Make retains full request bodies in
 * its execution history, and the bucket stays private, so a link that leaks
 * from a log is worth an hour rather than forever.
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

    // The browser already put these in R2; we only mint read links.
    const photoKeys = data.photos
    const photoUrls = await Promise.all(
      photoKeys.map((key) => signedGetUrl(key, 60 * 60))
    )

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
