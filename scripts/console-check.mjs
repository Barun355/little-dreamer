/**
 * Fails on any browser console error or warning across the whole page.
 *
 * Run against a DEV server: React and Base UI strip their development
 * warnings from production builds, so a production run would report clean
 * while the warnings are still there for anyone working on the app.
 */
import { chromium } from "playwright"

const BASE = process.env.BASE ?? "http://localhost:3000"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const msgs = []
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    msgs.push(`[${m.type()}] ${m.text()}`)
  }
})
page.on("pageerror", (e) => msgs.push(`[pageerror] ${String(e).slice(0, 200)}`))

await page.goto(BASE, { waitUntil: "load" })
const h = await page.evaluate(() => document.body.scrollHeight)
for (let i = 0; i <= 16; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), (h / 16) * i)
  await page.waitForTimeout(120)
}
await page.waitForTimeout(1500)

// Exercise the interactive pieces too — some warnings only fire on mount.
await page.setViewportSize({ width: 375, height: 800 })
await page.waitForTimeout(400)
const menu = page.getByRole("button", { name: /open menu/i })
if (await menu.count()) {
  await menu.click()
  await page.waitForTimeout(400)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}

await browser.close()

const native = msgs.filter((m) => /nativeButton/.test(m)).length
console.log(msgs.length ? msgs.join("\n") : "  zero console errors or warnings")
console.log(`\nnativeButton warnings: ${native}`)
console.log(`total console errors/warnings: ${msgs.length}`)
process.exit(msgs.length === 0 ? 0 : 1)
