// Phase 6 (testimonials · pricing · FAQ · final CTA) functional gate.
// Perf/SEO deferred by request — this checks that it WORKS.
import { chromium } from "playwright"
import { AxeBuilder } from "@axe-core/playwright"
import { readFileSync } from "fs"

const BASE = process.env.BASE ?? "http://localhost:3000"
const results = []
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(6)} ${detail}`)
}

const browser = await chromium.launch()
const sweep = async (page, steps = 20) => {
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (h / steps) * i)
    await page.waitForTimeout(60)
  }
}

// Wait until every reveal has finished animating. axe measures COMPUTED
// contrast, so sampling a card at opacity 0.6 mid-reveal reports a false
// failure that disappears on the next run.
const settle = async (page, timeout = 6000) => {
  await page.evaluate((t) => {
    const deadline = Date.now() + t
    return new Promise((resolve) => {
      const check = () => {
        const pending = [...document.querySelectorAll("[data-reveal]")].filter(
          (e) => getComputedStyle(e).opacity !== "1"
        ).length
        if (pending === 0 || Date.now() > deadline) resolve(pending)
        else requestAnimationFrame(check)
      }
      check()
    })
  }, timeout)
  await page.waitForTimeout(250)
}

const EXPECTED = ["hero","trust","core","proof","how-it-works","themes","sample","testimonials","pricing","safety","final-cta"]

// ── C6.1 all 13 sections render, four widths, no overflow ───────────────────
{
  const bad = []
  for (const w of [375, 768, 1280, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.goto(BASE, { waitUntil: "load" })
    await sweep(page, 10)
    const r = await page.evaluate(() => ({
      ids: [...document.querySelectorAll("section[id]")].map((s) => s.id),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      tiers: document.querySelectorAll("#pricing li[data-reveal]").length,
      quotes: document.querySelectorAll("#testimonials blockquote").length,
    }))
    const ordered = EXPECTED.every((id, i) => r.ids[i] === id)
    if (!ordered || r.overflow || r.tiers !== 3 || r.quotes !== 6) {
      bad.push(`${w}px ordered=${ordered} overflow=${r.overflow} tiers=${r.tiers} quotes=${r.quotes}`)
    }
    await page.close()
  }
  rec("C6.1", bad.length === 0,
    bad.length ? bad.join(" | ") : "11 sections in order, 3 tiers, 6 quotes, no overflow at 4 widths")
}

// ── C6.2 FAQ accordion: keyboard, aria-expanded, one open on load ───────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => document.querySelector("#safety")?.scrollIntoView())
  await page.waitForTimeout(500)

  const triggers = page.locator("#safety button[aria-expanded]")
  const count = await triggers.count()
  const openOnLoad = await page.locator('#safety button[aria-expanded="true"]').count()

  await triggers.nth(1).focus()
  await page.keyboard.press("Enter")
  await page.waitForTimeout(400)
  const afterEnter = await triggers.nth(1).getAttribute("aria-expanded")

  rec("C6.2", count === 5 && openOnLoad === 1 && afterEnter === "true",
    `${count} triggers, ${openOnLoad} open on load, keyboard toggle -> aria-expanded=${afterEnter}`)
  await page.close()
}

// ── C6.3 FAQ copy matches the data source exactly ───────────────────────────
{
  const src = readFileSync("content/conversion.ts", "utf8")
  const qs = [...src.matchAll(/q:\s*"([^"]+)"/g)].map((m) => m[1])
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => document.querySelector("#safety")?.scrollIntoView())
  await page.waitForTimeout(400)
  const rendered = await page.evaluate(() =>
    [...document.querySelectorAll("#safety button[aria-expanded]")].map((b) =>
      b.textContent.trim()
    )
  )
  const allPresent = qs.every((q) => rendered.some((r) => r.includes(q)))
  rec("C6.3", allPresent && qs.length === 5,
    `${qs.length} questions in content, all rendered verbatim: ${allPresent}`)
  await page.close()
}

// ── C6.4 pricing state is conveyed in text, not colour alone ────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => document.querySelector("#pricing")?.scrollIntoView())
  await page.waitForTimeout(400)
  const r = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#pricing li li")]
    return {
      total: rows.length,
      labelled: rows.filter((li) =>
        /Included:|Not included:/.test(li.textContent ?? "")
      ).length,
    }
  })
  rec("C6.4", r.total > 0 && r.total === r.labelled,
    `${r.labelled}/${r.total} feature rows carry an explicit Included/Not included label`)
  await page.close()
}

// ── C6.5 popular tier is first in DOM order ─────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => document.querySelector("#pricing")?.scrollIntoView())
  await page.waitForTimeout(400)
  const first = await page.evaluate(
    () => document.querySelector("#pricing li[data-reveal] h3")?.textContent?.trim()
  )
  const hasBadge = await page.evaluate(
    () => !!document.querySelector("#pricing li[data-reveal] [data-slot='badge']")
  )
  rec("C6.5", first === "One Book",
    `first tier in DOM = "${first}" (badge present: ${hasBadge})`)
  await page.close()
}

// ── C6.7 placeholder content is flagged AND visibly labelled ────────────────
{
  const src = readFileSync("content/conversion.ts", "utf8")
  const stillFlagged = (src.match(/isPlaceholder:\s*true/g) ?? []).length
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 12)
  const notices = await page.evaluate(() => ({
    testimonial: document.body.innerText.includes("illustrative, not real customer reviews"),
    pricing: document.body.innerText.includes("Indicative pricing"),
    flaggedNodes: document.querySelectorAll("[data-placeholder-testimonial]").length,
  }))
  // While placeholders exist, the notices MUST be visible.
  const ok = stillFlagged === 0
    ? true
    : notices.testimonial && notices.pricing && notices.flaggedNodes === 6
  rec("C6.7", ok,
    `${stillFlagged} isPlaceholder flags remain; notices visible: testimonials=${notices.testimonial} pricing=${notices.pricing}` +
    (stillFlagged ? "  ← LAUNCH BLOCKER until resolved (D2/D3)" : ""))
  await page.close()
}

// ── C6.9 every internal route resolves ──────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  const hrefs = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && !h.startsWith("http") && !h.startsWith("#")))]
  )
  const dead = []
  for (const h of hrefs) {
    const res = await page.request.get(new URL(h, BASE).toString())
    if (res.status() >= 400) dead.push(`${h}->${res.status()}`)
  }
  rec("C6.9", dead.length === 0,
    dead.length ? `DEAD: ${dead.join(", ")}` : `${hrefs.length} internal routes resolve`)
  await page.close()
}

// ── C6.10 CTAs reach /create ────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => document.querySelector("#final-cta")?.scrollIntoView())
  await page.waitForTimeout(500)
  await page.locator("#final-cta a").first().click()
  await page.waitForURL("**/create", { timeout: 5000 })
  rec("C6.10", page.url().endsWith("/create"), `final CTA -> ${page.url()}`)
  await page.close()
}

// ── C6.11 reduced motion ────────────────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 14)
  const r = await page.evaluate(() => ({
    running: document.getAnimations().filter((a) => a.playState === "running").length,
    quotes: [...document.querySelectorAll("#testimonials li[data-reveal]")].filter(
      (e) => getComputedStyle(e).opacity === "1"
    ).length,
    tiers: [...document.querySelectorAll("#pricing li[data-reveal]")].filter(
      (e) => getComputedStyle(e).opacity === "1"
    ).length,
  }))
  rec("C6.11", r.running === 0 && r.quotes === 6 && r.tiers === 3,
    `running=${r.running} quotes visible=${r.quotes}/6 tiers visible=${r.tiers}/3`)
  await page.close()
}

// ── C6.14 whole page works without JavaScript ───────────────────────────────
{
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  const r = await page.evaluate(() => ({
    sections: [...document.querySelectorAll("section[id]")].map((s) => s.id),
    quotes: document.querySelectorAll("#testimonials blockquote").length,
    faqs: document.querySelectorAll("#safety [aria-expanded]").length,
    ctas: document.querySelectorAll("a[href='/create']").length,
  }))
  const ok = EXPECTED.every((id, i) => r.sections[i] === id) && r.quotes === 6 && r.ctas > 0
  rec("C6.14", ok,
    `no-JS: ${r.sections.length} sections in order, ${r.quotes} quotes, ${r.faqs} FAQ triggers, ${r.ctas} CTAs`)
  await ctx.close()
}

// ── C6.13 axe across the full page ──────────────────────────────────────────
{
  for (const w of [375, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: "load" })
    await sweep(page, 14)
    await settle(page)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    rec(`C6.13${w === 375 ? "a" : "b"}`, violations.length === 0,
      violations.length
        ? `${w}px: ${violations.map((v) => `${v.id} [${v.impact}] x${v.nodes.length} :: ${v.nodes[0]?.target?.join(" ")}`).join("; ")}`
        : `${w}px: 0 violations`)
    await ctx.close()
  }
}

await browser.close()
console.log("\n" + "=".repeat(64))
const failed = results.filter((r) => !r.ok)
console.log(failed.length === 0
  ? `ALL ${results.length} CHECKS PASSED`
  : `${failed.length}/${results.length} FAILED: ${failed.map((f) => f.id).join(", ")}`)
process.exit(failed.length === 0 ? 0 : 1)
