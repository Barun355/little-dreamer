// End-to-end check of the /create wizard: form -> R2 upload -> Neon job ->
// Make dispatch. Run against a DEV server (server actions need a real runtime).
//   bash scripts/with-dev-server.sh node scripts/verify-create-flow.mjs
import { chromium } from "playwright"
import { neon } from "@neondatabase/serverless"
import "dotenv/config"
import zlib from "node:zlib"

const BASE = process.env.BASE ?? "http://localhost:3000"
const results = []
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(7)} ${detail}`)
}

const rawSql = neon(process.env.DATABASE_URL)

// Neon's serverless driver occasionally drops a cold connection. Retry so a
// transient network blip is not reported as a product failure.
const sql = async (...args) => {
  let last
  for (let i = 0; i < 4; i++) {
    try {
      return await rawSql(...args)
    } catch (e) {
      last = e
      await new Promise((r) => setTimeout(r, 500 * (i + 1)))
    }
  }
  throw last
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })

const consoleErrors = []
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160))
})
page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 160)))

// ── Step 1: child details ───────────────────────────────────────────────────
await page.goto(`${BASE}/create`, { waitUntil: "load" })
await page.waitForTimeout(600)

rec("W1", (await page.locator("h1").innerText()).includes("Who is this book for"),
  `step 1 heading: "${await page.locator("h1").innerText()}"`)

await page.getByLabel("Their name").fill("Aarav")
await page.getByRole("button", { name: "Boy", exact: true }).click()
await page.getByRole("button", { name: "Increase age" }).click() // 6 -> 7
await page.getByRole("combobox").click()
await page.waitForTimeout(300)
await page.getByRole("option", { name: "Parent", exact: true }).click()
await page.waitForTimeout(200)

// Consent gate must block progress.
await page.getByRole("button", { name: /next step/i }).click()
await page.waitForTimeout(400)
const blocked = (await page.locator("h1").innerText()).includes("Who is this book for")
rec("W2", blocked, `consent unticked blocks progress: ${blocked}`)

await page.getByRole("checkbox").first().click()
await page.getByRole("button", { name: /next step/i }).click()
await page.waitForTimeout(600)

// ── Step 2: theme ───────────────────────────────────────────────────────────
const onTheme = (await page.locator("h1").innerText()).includes("Choose the adventure")
const themeCount = await page.locator('[role="radio"]').count()
rec("W3", onTheme && themeCount === 26,
  `step 2 reached, ${themeCount} themes offered (expected 26)`)

await page.locator('[role="radio"]').filter({ hasText: "Space Explorer" }).first().click()
await page.waitForTimeout(200)
const checked = await page.locator('[role="radio"][aria-checked="true"]').count()
rec("W4", checked === 1, `exactly ${checked} theme selected, aria-checked set`)

await page.getByRole("button", { name: /next step/i }).click()
await page.waitForTimeout(600)

// ── Step 3: photo ───────────────────────────────────────────────────────────
const onPhotos = (await page.locator("h1").innerText()).includes("Add their photo")
rec("W5", onPhotos, `step 3 reached: "${await page.locator("h1").innerText()}"`)

// A REALISTICALLY SIZED photo (~1.5 MB), not a 155-byte fixture.
//
// The original test used a tiny PNG, which is exactly why it passed while
// real users hit "Body exceeded 1 MB limit": a Server Action caps its body at
// 1 MB and base64 adds a third. A fixture smaller than the limit can never
// catch a size bug. Built here rather than committed, and containing no
// child's likeness.
const png = makeLargePng(1_500_000)

function makeLargePng(targetBytes) {
  const { deflateSync, crc32 } = zlib
  const w = 700, h = 700
  // Random RGB so the data does not compress away to nothing.
  const raw = Buffer.alloc(h * (1 + w * 3))
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3)
    raw[row] = 0
    for (let x = 0; x < w * 3; x++) raw[row + 1 + x] = (Math.random() * 256) | 0
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type, "ascii"), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(td) >>> 0)
    return Buffer.concat([len, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 2
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 0 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
  if (png.length < targetBytes) {
    console.log(`  (test photo is ${(png.length / 1024 / 1024).toFixed(2)} MB)`)
  }
  return png
}
await page.setInputFiles('input[type="file"]', {
  name: "test-photo.png",
  mimeType: "image/png",
  buffer: png,
})
// Wait for the direct-to-R2 upload to finish, not just for the preview.
await page.waitForFunction(
  () => !document.querySelector('[role="status"][aria-label="Uploading"]'),
  undefined,
  { timeout: 60_000 }
)
const thumbs = await page.locator('[data-testid="photo-list"] img').count()
rec("W6",
  thumbs === 1,
  `${thumbs} photo uploaded direct to R2 (${(png.length / 1024 / 1024).toFixed(2)} MB — over the 1 MB Server Action cap)`)

await page.getByRole("checkbox", { name: /Use this photo to build/ }).click()
await page.waitForTimeout(200)

const before = await sql`SELECT count(*)::int AS n FROM "Job"`
await page.getByRole("button", { name: /generate my book/i }).click()

// ── Generation dispatch ─────────────────────────────────────────────────────
await page.waitForURL(/\?job=/, { timeout: 60_000 }).catch(() => {})
const url = page.url()
const jobId = new URL(url).searchParams.get("job")
rec("W7", !!jobId, `job created and pushed to URL: ${jobId ?? "NONE"}`)

await page.waitForTimeout(1500)
const onGenerating = await page.locator("h1").innerText()
rec("W8", onGenerating.includes("Making your book"),
  `step 4 reached: "${onGenerating}"`)

// ── Database ────────────────────────────────────────────────────────────────
if (jobId) {
  const [job] = await sql`
    SELECT j.id, j.status, j."storyTheme", j."storyWorld", j."themeId",
           j."consentAt", j.pronouns, j."ageBand",
           array_length(j."possibleAdventures",1) AS adventures,
           c.name, c.age, c.gender, c.relationship,
           array_length(c."photoKeys",1) AS photos,
           c."photosDeleteAfter"
    FROM "Job" j JOIN "Child" c ON c.id = j."childId"
    WHERE j.id = ${jobId}`
  rec("W9", !!job, job ? `Job row written: ${job.name}, age ${job.age}, ${job.gender}, ${job.relationship}` : "NO ROW")
  if (job) {
    rec("W10", job.storyTheme === "Space Explorer" && job.themeId === "space-explorer",
      `theme resolved: "${job.storyTheme}" / world "${job.storyWorld}"`)
    rec("W11", job.adventures >= 6,
      `${job.adventures} possible adventures seeded (pool > beats used)`)
    rec("W12", job.pronouns === "he/him" && job.ageBand === "6-7",
      `derived pronouns=${job.pronouns} ageBand=${job.ageBand}`)
    rec("W13", !!job.consentAt && !!job.photosDeleteAfter,
      `consent recorded ${!!job.consentAt}, deletion scheduled ${job.photosDeleteAfter?.toISOString?.().slice(0,10) ?? job.photosDeleteAfter}`)
    rec("W14", job.photos === 1, `${job.photos} photo key stored on Child`)
    rec("W15", job.status !== "FAILED",
      `job status after dispatch: ${job.status}` +
      (job.status === "FAILED" ? "  <- Make rejected it" : ""))
  }

  const after = await sql`SELECT count(*)::int AS n FROM "Job"`
  rec("W16", after[0].n === before[0].n + 1,
    `Job count ${before[0].n} -> ${after[0].n}`)
}

// ── R2 ──────────────────────────────────────────────────────────────────────
if (jobId) {
  const [row] = await sql`
    SELECT c."photoKeys"[1] AS key FROM "Job" j
    JOIN "Child" c ON c.id = j."childId" WHERE j.id = ${jobId}`
  // The bucket is deliberately PRIVATE, so read it back the same way Make
  // does — with a signed link — rather than expecting a public URL to work.
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3")
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")
  const c = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
  const signed = await getSignedUrl(
    c,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: row.key }),
    { expiresIn: 300 }
  )
  const res = await fetch(signed)
  const bytes = res.ok ? (await res.arrayBuffer()).byteLength : 0
  rec("W17", res.ok && bytes > 0,
    `photo readable from R2 via signed GET: ${res.status}, ${bytes} bytes, key ${row.key}`)
}

rec("W18", consoleErrors.length === 0,
  consoleErrors.length ? `console errors: ${consoleErrors.slice(0,2).join(" | ")}` : "no console errors")

await browser.close()
console.log("\n" + "=".repeat(64))
const failed = results.filter((r) => !r.ok)
console.log(failed.length === 0
  ? `ALL ${results.length} CHECKS PASSED`
  : `${failed.length}/${results.length} FAILED: ${failed.map((f) => f.id).join(", ")}`)
process.exit(failed.length === 0 ? 0 : 1)
