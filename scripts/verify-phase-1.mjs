import { chromium } from "playwright"
// Run with: pnpm dev  (separate terminal), then  node scripts/verify-phase-1.mjs

const BASE = "http://localhost:3000"
const TOKENS = `${BASE}/dev/tokens`
const results = []
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(6)} ${detail}`)
}

const browser = await chromium.launch()

// ── C1.1 / C1.3 / C1.11 ─────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const consoleErrors = []
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()))
  page.on("pageerror", (e) => consoleErrors.push(String(e)))

  await page.goto(TOKENS, { waitUntil: "networkidle" })

  const headings = await page.locator("section h2").allInnerTexts()
  rec("C1.1", headings.length >= 8, `${headings.length} sections: ${headings.join(", ")}`)

  // contrast table
  const rows = await page.locator("table tbody tr").all()
  const bad = []
  for (const r of rows) {
    const cells = await r.locator("td").allInnerTexts()
    if (cells[3]?.trim() === "FAIL") bad.push(`${cells[0]} = ${cells[1]}`)
  }
  rec("C1.3", bad.length === 0 && rows.length > 0,
    bad.length ? `FAILING: ${bad.join(" | ")}` : `${rows.length} pairs measured, zero failures`)

  // every measured ratio actually rendered (not "—")
  const dashes = (await page.locator("table tbody td:nth-child(2)").allInnerTexts())
    .filter((t) => t.trim() === "—").length
  rec("C1.3b", dashes === 0, `${dashes} unmeasured pairs`)

  // placeholders
  const ph = await page.locator("[data-placeholder]").count()
  const ids = await page.locator("[data-placeholder]").evaluateAll((els) =>
    [...new Set(els.map((e) => e.getAttribute("data-placeholder")))].sort()
  )
  rec("C1.11", ph >= 12, `${ph} placeholder nodes, ids: ${ids.join(" ")}`)

  rec("C1.12b", consoleErrors.length === 0,
    consoleErrors.length ? consoleErrors.slice(0, 2).join(" | ") : "no console errors")

  await page.close()
}

// ── C1.5 responsive overflow ────────────────────────────────────────────────
{
  const widths = [375, 768, 1280, 1920]
  const overflow = []
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.goto(TOKENS, { waitUntil: "networkidle" })
    const res = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    if (res.scrollW > res.clientW + 1) overflow.push(`${w}px (${res.scrollW}>${res.clientW})`)
    await page.close()
  }
  rec("C1.5", overflow.length === 0,
    overflow.length ? `horizontal overflow at ${overflow.join(", ")}` : "no overflow at 375/768/1280/1920")
}

// ── C1.6 fonts ──────────────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(TOKENS, { waitUntil: "networkidle" })
  const fonts = await page.evaluate(() => {
    const h1 = document.querySelector("h1")
    const body = document.body
    return {
      heading: h1 ? getComputedStyle(h1).fontFamily : "",
      body: getComputedStyle(body).fontFamily,
      loaded: [...document.fonts].map((f) => f.family),
    }
  })
  const okHeading = /Fraunces/i.test(fonts.heading)
  const okBody = /Inter/i.test(fonts.body)
  rec("C1.6", okHeading && okBody, `heading=${fonts.heading.split(",")[0]} body=${fonts.body.split(",")[0]}`)
  await page.close()
}

// ── C1.7 Motion primitives fire ─────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(TOKENS, { waitUntil: "networkidle" })
  const reveal = page.locator("text=Fades and rises once on enter.")
  await reveal.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  const op = await reveal.evaluate((el) => {
    let n = el
    while (n && n !== document.body) {
      const o = getComputedStyle(n).opacity
      if (o !== "1") return o
      n = n.parentElement
    }
    return "1"
  })
  rec("C1.7", op === "1", `Reveal settled at opacity ${op}`)
  await page.close()
}

// ── C1.8 / C1.9 ScrollTrigger cleanup + StrictMode ──────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(TOKENS, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)

  const count = () =>
    page.evaluate(() => {
      const ST = window.__ScrollTrigger
      return ST ? ST.getAll().length : -1
    })

  const baseline = await count()
  rec("C1.9", baseline > 0, `baseline ScrollTrigger count after first mount = ${baseline} (StrictMode double-invoke produced no duplicates if stable below)`)

  const counts = [baseline]
  for (let i = 0; i < 5; i++) {
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(250)
    await page.goto(TOKENS, { waitUntil: "networkidle" })
    await page.waitForTimeout(700)
    counts.push(await count())
  }
  const stable = counts.every((c) => c === baseline)
  rec("C1.8", stable, `counts across 5 round-trips: [${counts.join(", ")}] ${stable ? "— stable, no leak" : "— GROWING, LEAK"}`)
  await page.close()
}

// ── C1.10 reduced motion ────────────────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  })
  await page.goto(TOKENS, { waitUntil: "networkidle" })
  await page.waitForTimeout(900)

  const st = await page.evaluate(() => {
    const ST = window.__ScrollTrigger
    return ST ? ST.getAll().length : -1
  })
  rec("C1.10a", st === 0, `ScrollTriggers created under reduced motion = ${st} (must be 0)`)

  const reveal = page.locator("text=Fades and rises once on enter.")
  await reveal.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const visible = await reveal.isVisible()
  rec("C1.10b", visible, `content still readable under reduced motion: ${visible}`)

  // Drift must not be looping
  const drifting = await page.evaluate(() => {
    return document.getAnimations().filter((a) => a.playState === "running").length
  })
  rec("C1.10c", drifting === 0, `running animations under reduced motion = ${drifting}`)
  await page.close()
}

await browser.close()

console.log("\n" + "=".repeat(60))
const failed = results.filter((r) => !r.ok)
console.log(failed.length === 0
  ? `ALL ${results.length} CHECKS PASSED`
  : `${failed.length}/${results.length} FAILED: ${failed.map((f) => f.id).join(", ")}`)
process.exit(failed.length === 0 ? 0 : 1)
