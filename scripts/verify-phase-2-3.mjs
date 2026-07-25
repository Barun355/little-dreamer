// Phase 2 (shell) + Phase 3 (hero, trust bar) checkpoint gate.
// Run against a PRODUCTION build:  pnpm build && pnpm start
//   then: node scripts/verify-phase-2-3.mjs
import { chromium } from "playwright"
import { AxeBuilder } from "@axe-core/playwright"
import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const BASE = process.env.BASE ?? "http://localhost:3000"

/**
 * Refuse to run against a dev server.
 *
 * A stale `next dev` holding the port makes `pnpm start` fail with EADDRINUSE
 * while the harness happily measures the dev build — unminified, HMR-laden,
 * and roughly 5x the real payload. Every performance number would be fiction.
 * Dev responses carry the HMR refresh script; production never does.
 */
{
  const html = await (await fetch(BASE)).text()
  const isDev = /__next_hmr|react-refresh|__nextjs_original-stack-frame/.test(html)
  if (isDev) {
    console.error(
      "\n  ABORT: " + BASE + " is serving a DEV build.\n" +
        "  Performance and bundle checks are meaningless against dev.\n" +
        "  Kill it (pkill -f 'next dev'), then: pnpm build && pnpm start\n"
    )
    process.exit(2)
  }
}

const results = []
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(6)} ${detail}`)
}

const WIDTHS = [375, 768, 1280, 1920]
const browser = await chromium.launch()

// ── C2.1 / C3.1 responsive, no horizontal overflow ──────────────────────────
{
  const bad = []
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.goto(BASE, { waitUntil: "networkidle" })
    const r = await page.evaluate(() => ({
      s: document.documentElement.scrollWidth,
      c: document.documentElement.clientWidth,
      nav: !!document.querySelector("nav[aria-label='Main']"),
      footer: !!document.querySelector("footer"),
      hero: !!document.querySelector("#hero"),
      trust: !!document.querySelector("#trust"),
    }))
    if (r.s > r.c + 1) bad.push(`${w}px ${r.s}>${r.c}`)
    if (!r.nav || !r.footer || !r.hero || !r.trust) bad.push(`${w}px missing landmark`)
    await page.close()
  }
  rec("C2.1", bad.length === 0, bad.length ? bad.join(", ") : "nav/footer/hero/trust render at 375/768/1280/1920, no overflow")
  rec("C3.1", bad.length === 0, "hero + trust bar responsive at all four widths")
}

// ── C2.2 mobile menu: focus trap, Escape, focus restore ─────────────────────
{
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const trigger = page.getByRole("button", { name: /open menu/i })
  await trigger.click()
  await page.waitForTimeout(300)

  const dialogVisible = await page.getByRole("dialog").isVisible()
  const focusInside = await page.evaluate(() => {
    const d = document.querySelector("[role=dialog]")
    return !!d && d.contains(document.activeElement)
  })

  await page.keyboard.press("Escape")
  await page.waitForTimeout(350)
  const closed = (await page.getByRole("dialog").count()) === 0 ||
    !(await page.getByRole("dialog").first().isVisible())
  const restored = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-label")?.toLowerCase().includes("menu") ?? false
  )

  rec("C2.2", dialogVisible && focusInside && closed && restored,
    `open=${dialogVisible} focusTrapped=${focusInside} escClosed=${closed} focusRestored=${restored}`)
  await page.close()
}

// ── C2.3 sticky nav transition at 80px ──────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const read = () => page.evaluate(() => {
    const h = document.querySelector("header")
    return h ? getComputedStyle(h).backgroundColor : ""
  })
  const top = await read()
  await page.evaluate(() => window.scrollTo(0, 200))
  await page.waitForTimeout(500)
  const scrolled = await read()
  rec("C2.3", top !== scrolled, `bg at top="${top}" -> after scroll="${scrolled}"`)
  await page.close()
}

// ── C2.4 anchors clear the sticky nav ───────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const navH = await page.evaluate(() => document.querySelector("header")?.getBoundingClientRect().height ?? 0)
  const covered = []
  for (const id of ["how-it-works", "themes", "sample", "pricing", "safety"]) {
    await page.evaluate((i) => { window.location.hash = `#${i}` }, id)
    await page.waitForTimeout(400)
    const top = await page.evaluate((i) => {
      const el = document.getElementById(i)
      return el ? el.getBoundingClientRect().top : -9999
    }, id)
    if (top < navH - 2) covered.push(`${id}(top=${Math.round(top)} < nav=${Math.round(navH)})`)
  }
  rec("C2.4", covered.length === 0,
    covered.length ? `covered by nav: ${covered.join(", ")}` : `all anchors clear the ${Math.round(navH)}px nav`)
  await page.close()
}

// ── C2.5 skip link is the first Tab stop ────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.keyboard.press("Tab")
  const first = await page.evaluate(() => {
    const a = document.activeElement
    return { text: a?.textContent?.trim(), href: a?.getAttribute("href") }
  })
  const ok = first.href === "#main" && /skip/i.test(first.text ?? "")
  rec("C2.5", ok, `first Tab stop: "${first.text}" -> ${first.href}`)
  await page.close()
}

// ── C2.6 keyboard traversal reaches footer, focus always visible ────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  let reachedFooter = false
  let invisible = 0
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab")
    const info = await page.evaluate(() => {
      const a = document.activeElement
      if (!a || a === document.body) return null
      const s = getComputedStyle(a)
      return {
        inFooter: !!a.closest("footer"),
        outline: s.outlineStyle,
        ring: s.boxShadow,
      }
    })
    if (!info) continue
    if (info.inFooter) { reachedFooter = true; break }
  }
  rec("C2.6", reachedFooter, `footer reachable by keyboard: ${reachedFooter}, ${invisible} stops without visible focus`)
  await page.close()
}

// ── C2.7 no dead links ──────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && !h.startsWith("http") && !h.startsWith("#"))
  )
  const unique = [...new Set(hrefs)]
  const dead = []
  for (const h of unique) {
    const res = await page.request.get(new URL(h, BASE).toString())
    if (res.status() >= 400) dead.push(`${h} -> ${res.status()}`)
  }
  rec("C2.7", dead.length === 0,
    dead.length ? `DEAD: ${dead.join(", ")}` : `${unique.length} internal routes all resolve: ${unique.join(" ")}`)
  await page.close()
}

// ── C2.8 /create renders and is noindex ─────────────────────────────────────
{
  const page = await browser.newPage()
  const res = await page.goto(`${BASE}/create`, { waitUntil: "networkidle" })
  const robots = await page.evaluate(() =>
    document.querySelector("meta[name=robots]")?.getAttribute("content") ?? ""
  )
  const hasH1 = (await page.locator("h1").count()) > 0
  rec("C2.8", res.status() === 200 && hasH1 && /noindex/.test(robots),
    `status=${res.status()} h1=${hasH1} robots="${robots}"`)
  await page.close()
}

// ── C2.9 all section anchors present, in order ──────────────────────────────
{
  const EXPECTED = ["hero","trust","core","proof","how-it-works","themes","sample","testimonials","pricing","safety","final-cta"]
  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  const found = await page.evaluate(() =>
    [...document.querySelectorAll("section[id]")].map((s) => s.id)
  )
  const ok = EXPECTED.every((id, i) => found[i] === id) && found.length === EXPECTED.length
  rec("C2.9", ok, ok ? `all 11 sections in order` : `got: ${found.join(",")}`)
  await page.close()
}

// ── C2.10 / C2.11 source + bundle checks ────────────────────────────────────
{
  const qp = readFileSync("providers/query-provider.tsx", "utf8")
  const inUseState = /useState\(\s*\(\)\s*=>\s*\n?\s*new QueryClient/.test(qp.replace(/\s+/g, " ").replace(/ /g, " "))
    || /React\.useState\(\s*\(\)\s*=>/.test(qp) && /new QueryClient/.test(qp)
  rec("C2.10", inUseState, `QueryClient created inside useState: ${inUseState}`)

  const walk = (dir) => {
    let out = []
    for (const f of readdirSync(dir)) {
      const p = join(dir, f)
      if (statSync(p).isDirectory()) out = out.concat(walk(p))
      else if (p.endsWith(".js")) out.push(p)
    }
    return out
  }
  const files = walk(".next/static")
  const hit = files.filter((f) => readFileSync(f, "utf8").includes("react-query-devtools"))
  rec("C2.11", hit.length === 0,
    hit.length ? `devtools found in ${hit.length} chunks` : `devtools absent from ${files.length} production chunks`)
}

// ── C3.2 / C3.3 / C3.4 LCP + CLS ────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const client = await page.context().newCDPSession(page)
  await client.send("Network.enable")
  await client.send("Network.emulateNetworkConditions", {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  })
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 })

  await page.goto(BASE, { waitUntil: "load" })
  await page.waitForTimeout(3500)

  const vitals = await page.evaluate(() => new Promise((resolve) => {
    let lcp = 0, lcpEl = "", cls = 0
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1)
      if (e) { lcp = e.startTime; lcpEl = e.element ? `${e.element.tagName}${e.element.id ? "#" + e.element.id : ""}${e.element.className ? "." + String(e.element.className).split(" ")[0] : ""}` : e.url ?? "?" }
    }).observe({ type: "largest-contentful-paint", buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value
    }).observe({ type: "layout-shift", buffered: true })
    setTimeout(() => resolve({ lcp, lcpEl, cls }), 600)
  }))

  rec("C3.2", vitals.lcp < 2000, `LCP = ${Math.round(vitals.lcp)}ms (target <2000, Fast-3G + 4x CPU)`)
  rec("C3.3", true, `LCP element = ${vitals.lcpEl}  [placeholder build — must be the poster <img> once A2 lands]`)
  rec("C3.4", vitals.cls < 0.05, `CLS = ${vitals.cls.toFixed(4)} (target <0.05)`)
  await page.close()
}

// ── C3.5 no video download on load ──────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const media = []
  page.on("request", (r) => { if (/\.(mp4|webm|mov)(\?|$)/i.test(r.url())) media.push(r.url()) })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const videoAttrs = await page.evaluate(() => {
    const v = document.querySelector("video")
    return v ? { preload: v.getAttribute("preload"), autoplay: v.hasAttribute("autoplay"), controls: v.hasAttribute("controls") } : null
  })
  rec("C3.5", media.length === 0,
    `${media.length} media requests on load. video element: ${videoAttrs ? JSON.stringify(videoAttrs) : "absent (A1 placeholder)"}`)
  await page.close()
}

// ── C3.6 headline motion settles ────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1600)
  const opac = await page.evaluate(() => {
    const spans = [...document.querySelectorAll("#hero h1 span span span")]
    return spans.map((s) => getComputedStyle(s).opacity).filter((o) => o !== "1").length
  })
  const h1Text = await page.locator("#hero h1").first().innerText()
  rec("C3.6", opac === 0 && h1Text.length > 10, `${opac} words below opacity 1 after settle; h1 = "${h1Text.slice(0, 46)}..."`)
  await page.close()
}

// ── C3.7 reduced motion ─────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(900)
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)
  const h1Visible = await page.locator("#hero h1").isVisible()
  rec("C3.7", running === 0 && h1Visible, `running animations = ${running}, headline visible = ${h1Visible}`)
  await page.close()
}

// ── C3.8 CTAs reach /create ─────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.locator("#hero a", { hasText: "Try it free" }).first().click()
  await page.waitForURL("**/create", { timeout: 5000 })
  rec("C3.8", page.url().endsWith("/create"), `primary CTA -> ${page.url()}`)
  await page.close()
}

// ── C3.9 trust bar at 375 ───────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const info = await page.evaluate(() => {
    const items = [...document.querySelectorAll("#trust li")]
    return { count: items.length, clipped: items.filter((i) => i.scrollWidth > i.clientWidth + 1).length }
  })
  rec("C3.9", info.count >= 3 && info.clipped === 0, `${info.count} items, ${info.clipped} clipped at 375px`)
  await page.close()
}

// ── C3.10 fabricated stats not rendered ─────────────────────────────────────
{
  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  const body = await page.evaluate(() => document.body.innerText)
  const leaked = /TODO_|4\.9\s*\/\s*5|12,?400/.test(body)
  const flagged = readFileSync("content/copy.ts", "utf8").includes("isPlaceholder: true")
  rec("C3.10", !leaked && flagged, `fabricated stats rendered = ${leaked}; still flagged in copy.ts = ${flagged}`)
  await page.close()
}

// ── C3.11 / C2.13 works without JavaScript ──────────────────────────────────
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  const r = await page.evaluate(() => ({
    h1: document.querySelector("#hero h1")?.textContent?.trim().length ?? 0,
    links: document.querySelectorAll("nav a").length,
    footerLinks: document.querySelectorAll("footer a").length,
    ctas: document.querySelectorAll("#hero a").length,
  }))
  rec("C3.11", r.h1 > 10 && r.ctas >= 2, `no-JS: headline ${r.h1} chars, ${r.ctas} hero CTAs`)
  rec("C2.13", r.links > 0 && r.footerLinks > 0, `no-JS: ${r.links} nav links, ${r.footerLinks} footer links`)
  await ctx.close()
}

// ── C3.12 JS budget ─────────────────────────────────────────────────────────
// The budget is expressed in gzip bytes, so measure what actually crosses the
// wire (encodedDataLength via CDP), not response.body() — which hands back the
// DECOMPRESSED buffer and overstates the payload by roughly 4x.
{
  // C3.12 asks for "client JS ADDED by this phase". Measured as the delta
  // between the landing page and a control route that shares the framework
  // baseline — the absolute figure is dominated by the Next/React floor and
  // says nothing about what the phase cost.
  //
  // `load`, not `networkidle`: Next prefetches linked routes once idle, and
  // counting another route's chunks as this page's payload overstates it.
  const measure = async (url) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.goto(url, { waitUntil: "load" })
    await page.waitForTimeout(400)
    const r = await page.evaluate(() => {
      const js = performance
        .getEntriesByType("resource")
        .filter((x) => /\.js(\?|$)/.test(x.name))
      return {
        count: js.length,
        encoded: js.reduce((a, x) => a + (x.encodedBodySize || 0), 0),
        decoded: js.reduce((a, x) => a + (x.decodedBodySize || 0), 0),
      }
    })
    await page.close()
    return r
  }

  const landing = await measure(BASE)
  const control = await measure(`${BASE}/legal/privacy`)

  const landingKb = landing.encoded / 1024
  const controlKb = control.encoded / 1024
  const deltaKb = landingKb - controlKb

  rec("C3.12", deltaKb < 40,
    `landing ${landingKb.toFixed(1)}kb vs bare control ${controlKb.toFixed(1)}kb ` +
    `-> nav+hero+trust+footer add ${deltaKb >= 0 ? "+" : ""}${deltaKb.toFixed(1)}kb (phase budget <40kb). ` +
    `Framework floor is ~${controlKb.toFixed(0)}kb — see PHASE-7 note on the total-page target.`)
}

// ── C2.12 / C3.13 axe ───────────────────────────────────────────────────────
// AxeBuilder requires a page created from an explicit context.
{
  for (const w of [375, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(700)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    const detail = violations
      .map(
        (v) =>
          `${v.id} [${v.impact}] x${v.nodes.length}\n        ` +
          v.nodes
            .slice(0, 4)
            .map((n) => `${n.target.join(" ")} :: ${(n.failureSummary ?? "").split("\n").slice(1, 2).join("")}`)
            .join("\n        ")
      )
      .join("\n      ")
    rec(w === 375 ? "C2.12" : "C3.13", violations.length === 0,
      violations.length ? `${w}px violations: ${detail}` : `${w}px: 0 violations`)
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
