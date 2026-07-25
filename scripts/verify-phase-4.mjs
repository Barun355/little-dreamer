// Phase 4 (Core bento + Proof scroll scene) checkpoint gate.
// Run against a PRODUCTION build:  pnpm build && pnpm start
//   then: node scripts/verify-phase-4.mjs
import { chromium } from "playwright"
import { AxeBuilder } from "@axe-core/playwright"
import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const BASE = process.env.BASE ?? "http://localhost:3000"

{
  const html = await (await fetch(BASE)).text()
  if (/__next_hmr|react-refresh|__nextjs_original-stack-frame/.test(html)) {
    console.error("\n  ABORT: " + BASE + " is serving a DEV build.\n")
    process.exit(2)
  }
}

const results = []
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(6)} ${detail}`)
}

const browser = await chromium.launch()

// Scroll the whole page so every lazy trigger fires.
const sweep = async (page, steps = 24) => {
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (h / steps) * i)
    await page.waitForTimeout(70)
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

const stCount = (page) =>
  page.evaluate(() => {
    const ST = window.__ScrollTrigger
    return ST ? ST.getAll().length : -1
  })

// ── C4.1 bento + proof render across widths ─────────────────────────────────
{
  const bad = []
  for (const w of [375, 768, 1280, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.goto(BASE, { waitUntil: "load" })
    await sweep(page, 10)
    const r = await page.evaluate(() => {
      const core = document.querySelector("#core")
      const cards = document.querySelectorAll("#core [data-reveal]")
      const pages = document.querySelectorAll("#proof .pf-page")
      const doc = document.documentElement
      return {
        core: !!core,
        cards: cards.length,
        pages: pages.length,
        overflow: doc.scrollWidth > doc.clientWidth + 1,
      }
    })
    if (!r.core || r.cards !== 6 || r.pages !== 6 || r.overflow) {
      bad.push(`${w}px cards=${r.cards} pages=${r.pages} overflow=${r.overflow}`)
    }
    await page.close()
  }
  rec("C4.1", bad.length === 0,
    bad.length ? bad.join(" | ") : "6 bento cards + 6 proof pages at 375/768/1280/1920, no overflow")
}

// ── C4.2 bento reveals once, does not re-fire ───────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 14)
  const after = await page.evaluate(() =>
    [...document.querySelectorAll("#core [data-reveal]")].map(
      (e) => getComputedStyle(e).opacity
    )
  )
  // scroll back up and down again — must stay visible
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await sweep(page, 14)
  const second = await page.evaluate(() =>
    [...document.querySelectorAll("#core [data-reveal]")].map(
      (e) => getComputedStyle(e).opacity
    )
  )
  const allVisible = after.every((o) => o === "1") && second.every((o) => o === "1")
  rec("C4.2", allVisible, `opacities after first pass ${after.join(",")} / after re-scroll ${second.join(",")}`)
  await page.close()
}

// ── C4.3 / C4.4 proof pins and scrubs on desktop ────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 8)

  const info = await page.evaluate(() => {
    const ST = window.__ScrollTrigger
    if (!ST) return { ok: false }
    const pinned = ST.getAll().filter((t) => t.pin)
    return {
      ok: true,
      total: ST.getAll().length,
      pinned: pinned.length,
      spacers: document.querySelectorAll(".pin-spacer").length,
    }
  })
  rec("C4.3", info.ok && info.pinned >= 1 && info.spacers >= 1,
    `desktop: ${info.pinned} pinned trigger(s), ${info.spacers} pin-spacer(s), ${info.total} triggers total`)

  // Drive the pinned trigger to the end and confirm progress reaches 1
  // and the scene's last element has finished animating in.
  const end = await page.evaluate(async () => {
    const ST = window.__ScrollTrigger
    const t = ST.getAll().find((x) => x.pin)
    if (!t) return null
    window.scrollTo(0, t.end + 10)
    await new Promise((r) => setTimeout(r, 500))
    ST.update()
    const compare = document.querySelector("#proof .pf-compare")
    return {
      progress: t.progress,
      compareOpacity: compare ? getComputedStyle(compare).opacity : "?",
    }
  })
  rec("C4.4", end && end.progress >= 0.999 && end.compareOpacity === "1",
    `at pin end: progress=${end?.progress?.toFixed(3)} final element opacity=${end?.compareOpacity}`)
  await page.close()
}

// ── C4.5 mobile does NOT pin ────────────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 14)
  const r = await page.evaluate(() => {
    const ST = window.__ScrollTrigger
    return {
      pinned: ST ? ST.getAll().filter((t) => t.pin).length : -1,
      spacers: document.querySelectorAll(".pin-spacer").length,
      pagesVisible: [...document.querySelectorAll("#proof .pf-page")].filter(
        (e) => getComputedStyle(e).opacity === "1"
      ).length,
    }
  })
  rec("C4.5", r.pinned === 0 && r.spacers === 0 && r.pagesVisible === 6,
    `mobile: pinned=${r.pinned} spacers=${r.spacers} visible pages=${r.pagesVisible}/6`)
  await page.close()
}

// ── C4.6 no long tasks during the scene ─────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const client = await page.context().newCDPSession(page)
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 })
  await page.goto(BASE, { waitUntil: "load" })

  // Hydration cost and scene cost are different problems and must be measured
  // separately. Registering the observer straight after `load` conflates them:
  // GSAP setup, React hydration and font swap all land in that window, and
  // attributing their long tasks to the scroll animation is simply wrong.
  await page.evaluate(() => {
    window.__hydration = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__hydration.push(Math.round(e.duration))
    }).observe({ type: "longtask", buffered: true })
  })
  await page.waitForTimeout(2500) // let hydration + idle-deferred GSAP settle
  const hydration = await page.evaluate(() => window.__hydration ?? [])

  await page.evaluate(() => {
    window.__scroll = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__scroll.push(Math.round(e.duration))
    }).observe({ type: "longtask", buffered: false })
  })
  await sweep(page, 30)
  const scroll = await page.evaluate(() => window.__scroll ?? [])

  const worstScroll = scroll.length ? Math.max(...scroll) : 0
  const worstHydration = hydration.length ? Math.max(...hydration) : 0
  rec("C4.6", scroll.length === 0,
    `SCROLL: ${scroll.length} long tasks${scroll.length ? `, worst ${worstScroll}ms` : " (clean)"} · ` +
    `hydration (separate concern): ${hydration.length} tasks, worst ${worstHydration}ms · 4x CPU throttle`)
  await page.close()
}

// ── C4.7 pinning contributes no layout shift ────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await page.evaluate(() => {
    window.__cls = 0
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: "layout-shift", buffered: true })
  })
  await sweep(page, 30)
  const cls = await page.evaluate(() => window.__cls)
  rec("C4.7", cls < 0.05, `CLS across full scroll incl. pin/unpin = ${cls.toFixed(4)}`)
  await page.close()
}

// ── C4.8 no ScrollTrigger leak across navigations ───────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 8)
  const baseline = await stCount(page)
  const counts = [baseline]
  for (let i = 0; i < 5; i++) {
    await page.goto(`${BASE}/create`, { waitUntil: "load" })
    await page.waitForTimeout(200)
    await page.goto(BASE, { waitUntil: "load" })
    await sweep(page, 8)
    counts.push(await stCount(page))
  }
  const stable = counts.every((c) => c === baseline)
  rec("C4.8", stable && baseline > 0,
    `counts across 5 round-trips: [${counts.join(", ")}] ${stable ? "— stable" : "— LEAK"}`)
  await page.close()
}

// ── C4.9 resize desktop -> mobile -> desktop leaves no orphaned spacer ──────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 8)
  const d1 = await page.evaluate(() => document.querySelectorAll(".pin-spacer").length)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(700)
  await sweep(page, 8)
  const m = await page.evaluate(() => ({
    spacers: document.querySelectorAll(".pin-spacer").length,
    pinned: window.__ScrollTrigger?.getAll().filter((t) => t.pin).length ?? -1,
  }))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(700)
  await sweep(page, 8)
  const d2 = await page.evaluate(() => ({
    spacers: document.querySelectorAll(".pin-spacer").length,
    overflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    stuck: [...document.querySelectorAll("#proof .pf-page")].filter(
      (e) => getComputedStyle(e).opacity !== "1"
    ).length,
  }))

  const ok = m.spacers === 0 && m.pinned === 0 && d2.spacers === d1 && !d2.overflow
  rec("C4.9", ok,
    `desktop spacers=${d1} -> mobile spacers=${m.spacers}/pinned=${m.pinned} -> back to desktop spacers=${d2.spacers}, overflow=${d2.overflow}, stuck pages=${d2.stuck}`)
  await page.close()
}

// ── C4.10 / C4.11 comparison slider: keyboard, pointer, touch, ARIA ─────────
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    hasTouch: true,
  })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 10)

  // The slider sits INSIDE the pinned, scrubbed scene, so its bounding box
  // moves with scroll progress. Settle the scene at its end before measuring
  // or interacting — otherwise coordinates go stale mid-gesture and the test
  // is flaky for reasons that have nothing to do with the slider.
  await page.evaluate(async () => {
    const ST = window.__ScrollTrigger
    const t = ST?.getAll().find((x) => x.pin)
    if (t) window.scrollTo(0, t.end + 20)
    await new Promise((r) => setTimeout(r, 600))
    ST?.update()
  })
  await page.waitForTimeout(300)

  const slider = page.locator('[role="slider"]')
  const aria = await slider.evaluate((el) => ({
    role: el.getAttribute("role"),
    now: el.getAttribute("aria-valuenow"),
    min: el.getAttribute("aria-valuemin"),
    max: el.getAttribute("aria-valuemax"),
    label: el.getAttribute("aria-label"),
    text: el.getAttribute("aria-valuetext"),
    focusable: el.tabIndex >= 0,
  }))
  rec("C4.11",
    aria.role === "slider" && aria.now !== null && aria.min === "0" &&
      aria.max === "100" && !!aria.label && !!aria.text && aria.focusable,
    `role=${aria.role} now=${aria.now} min/max=${aria.min}/${aria.max} focusable=${aria.focusable} label="${aria.label}"`)

  // keyboard
  await slider.focus()
  const before = Number(await slider.getAttribute("aria-valuenow"))
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  const afterKeys = Number(await slider.getAttribute("aria-valuenow"))
  await page.keyboard.press("Home")
  const home = Number(await slider.getAttribute("aria-valuenow"))
  await page.keyboard.press("End")
  const end = Number(await slider.getAttribute("aria-valuenow"))

  // Pointer: drag along the track to a known fraction and confirm the value
  // follows. Targets the track, not the handle — at value 100 the handle sits
  // on the right edge, where a grab can miss it entirely.
  const track = await page.locator("[data-comparison-track]").boundingBox()
  const targetX = track.x + track.width * 0.3
  const midY = track.y + track.height / 2
  await page.mouse.move(track.x + track.width * 0.7, midY)
  await page.mouse.down()
  await page.mouse.move(targetX, midY, { steps: 10 })
  await page.mouse.up()
  const afterDrag = Number(await slider.getAttribute("aria-valuenow"))

  // Touch, via a real touch drag rather than a mouse event.
  await page.touchscreen.tap(track.x + track.width * 0.85, midY)
  await page.waitForTimeout(150)
  const afterTouch = Number(await slider.getAttribute("aria-valuenow"))

  const kbOk = afterKeys > before && home === 0 && end === 100
  const ptrOk = Math.abs(afterDrag - 30) <= 6
  const touchOk = afterTouch > afterDrag
  rec("C4.10", kbOk && ptrOk && touchOk,
    `keyboard ${before}->${afterKeys}, Home=${home}, End=${end}; ` +
    `pointer drag to 30% -> ${afterDrag}; touch tap at 85% -> ${afterTouch}`)
  await page.close()
}

// ── C4.12 reduced motion: no pin, no scrub, static comparison ───────────────
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  })
  await page.goto(BASE, { waitUntil: "load" })
  await sweep(page, 14)
  const r = await page.evaluate(() => {
    const ST = window.__ScrollTrigger
    return {
      triggers: ST ? ST.getAll().length : -1,
      spacers: document.querySelectorAll(".pin-spacer").length,
      sliders: document.querySelectorAll('[role="slider"]').length,
      pagesVisible: [...document.querySelectorAll("#proof .pf-page")].filter(
        (e) => getComputedStyle(e).opacity === "1"
      ).length,
      cardsVisible: [...document.querySelectorAll("#core [data-reveal]")].filter(
        (e) => getComputedStyle(e).opacity === "1"
      ).length,
      running: document.getAnimations().filter((a) => a.playState === "running").length,
    }
  })
  rec("C4.12",
    r.triggers === 0 && r.spacers === 0 && r.sliders === 0 &&
      r.pagesVisible === 6 && r.cardsVisible === 6 && r.running === 0,
    `triggers=${r.triggers} spacers=${r.spacers} dragSlider=${r.sliders} pages=${r.pagesVisible}/6 cards=${r.cardsVisible}/6 running=${r.running}`)
  await page.close()
}

// ── C4.13 no dev markers committed ──────────────────────────────────────────
{
  const walk = (dir) => {
    let out = []
    for (const f of readdirSync(dir)) {
      const p = join(dir, f)
      if (statSync(p).isDirectory()) out = out.concat(walk(p))
      else if (/\.tsx?$/.test(p)) out.push(p)
    }
    return out
  }
  const src = [...walk("components"), ...walk("app"), ...walk("lib"), ...walk("hooks")]
  const hits = src.filter((f) => /markers\s*:\s*true/.test(readFileSync(f, "utf8")))
  rec("C4.13", hits.length === 0,
    hits.length ? `markers:true in ${hits.join(", ")}` : `no markers:true across ${src.length} source files`)
}

// ── C4.14 JS added by this phase ────────────────────────────────────────────
{
  const measure = async (url) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(url, { waitUntil: "load" })
    await page.waitForTimeout(400)
    const r = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((x) => /\.js(\?|$)/.test(x.name))
        .reduce((a, x) => a + (x.encodedBodySize || 0), 0)
    )
    await page.close()
    return r / 1024
  }
  const landing = await measure(BASE)
  const control = await measure(`${BASE}/legal/privacy`)
  const delta = landing - control
  rec("C4.14", delta < 60,
    `landing ${landing.toFixed(1)}kb vs control ${control.toFixed(1)}kb -> +${delta.toFixed(1)}kb (GSAP+ScrollTrigger, budget <60kb)`)
}

// ── C4.15 axe ───────────────────────────────────────────────────────────────
{
  for (const w of [375, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: "load" })
    await sweep(page, 12)
    await settle(page)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    const detail = violations
      .map((v) => `${v.id} [${v.impact}] x${v.nodes.length} :: ${v.nodes[0]?.target?.join(" ")}`)
      .join("; ")
    rec(`C4.15${w === 375 ? "a" : "b"}`, violations.length === 0,
      violations.length ? `${w}px: ${detail}` : `${w}px: 0 violations`)
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
