/**
 * Deterministic initial-JS measurement.
 *
 * Resource Timing proved unreliable for this: the total depends on how long
 * you wait, and Next's route prefetching pulls OTHER routes' chunks into the
 * number. Two phases reported figures that were really just artefacts of a
 * 400ms vs 600ms timeout.
 *
 * Instead: fetch the HTML, extract the script URLs the document actually
 * references, and sum their gzipped transfer sizes. No timing, no prefetch,
 * no browser — the same answer every run.
 */

import { gzipSync, brotliCompressSync, constants } from "node:zlib"

export async function measureInitialJs(url) {
  const html = await (await fetch(url)).text()

  const srcs = new Set()
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) srcs.add(m[1])
  // Next also preloads chunks via <link rel="preload" as="script">.
  for (const m of html.matchAll(
    /<link[^>]+rel="preload"[^>]+href="([^"]+\.js)"[^>]*>/g
  ))
    srcs.add(m[1])

  const origin = new URL(url).origin
  let raw = 0
  let gzip = 0
  let brotli = 0
  const files = []

  for (const src of srcs) {
    const abs = src.startsWith("http") ? src : origin + src
    const res = await fetch(abs)
    const buf = Buffer.from(await res.arrayBuffer())

    // `next start` does NOT compress /_next/static — it expects the CDN to.
    // So compress locally to model what Vercel actually serves, rather than
    // reporting raw bytes and calling them "gzip".
    const g = gzipSync(buf, { level: 9 }).byteLength
    const b = brotliCompressSync(buf, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).byteLength

    raw += buf.byteLength
    gzip += g
    brotli += b
    files.push({
      name: abs.split("/").pop(),
      raw: +(buf.byteLength / 1024).toFixed(1),
      gzip: +(g / 1024).toFixed(1),
    })
  }

  return {
    raw: raw / 1024,
    gzip: gzip / 1024,
    brotli: brotli / 1024,
    count: srcs.size,
    files: files.sort((a, b) => b.gzip - a.gzip),
  }
}

// CLI: node scripts/measure-js.mjs [url...]
if (import.meta.url === `file://${process.argv[1]}`) {
  const urls = process.argv.slice(2)
  if (!urls.length) urls.push("http://localhost:3000")
  for (const u of urls) {
    const r = await measureInitialJs(u)
    console.log(`\n${u}`)
    console.log(
      `  ${r.gzip.toFixed(1)} kb gzip · ${r.brotli.toFixed(1)} kb brotli · ` +
      `${r.raw.toFixed(1)} kb raw · ${r.count} scripts`
    )
    for (const f of r.files.slice(0, 8)) {
      console.log(`    ${String(f.gzip).padStart(7)} kb gz  (${String(f.raw).padStart(7)} raw)  ${f.name}`)
    }
  }
}
