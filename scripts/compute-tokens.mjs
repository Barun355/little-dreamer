// Brand token computation: hex -> OKLCH, WCAG contrast, tint/shade ramps.
// Used to satisfy PHASE-1 C1.3 ("MEASURED, not eyeballed").

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)

function hexToRgb(hex) {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}
function rgbToHex([r, g, b]) {
  const f = (v) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${f(r)}${f(g)}${f(b)}`
}

function rgbToOklch(rgb) {
  const [lr, lg, lb] = rgb.map(srgbToLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(a, bb)
  let H = (Math.atan2(bb, a) * 180) / Math.PI
  if (H < 0) H += 360
  return [L, C, H]
}

function oklchToRgb([L, C, H]) {
  const hr = (H * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return [lr, lg, lb].map(linearToSrgb)
}

const relLum = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(hexA, hexB) {
  const a = relLum(hexToRgb(hexA))
  const b = relLum(hexToRgb(hexB))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const fmtOklch = ([L, C, H]) =>
  `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`

const BRAND = {
  lavender: "#8B5CF6",
  sky: "#60A5FA",
  gold: "#FBBF24",
  cream: "#FFF9F3",
  mint: "#6EE7B7",
}

console.log("=".repeat(72))
console.log("BRAND -> OKLCH")
console.log("=".repeat(72))
for (const [name, hex] of Object.entries(BRAND)) {
  console.log(`${name.padEnd(10)} ${hex}  ${fmtOklch(rgbToOklch(hexToRgb(hex)))}`)
}

// Ramps: hold hue, vary lightness, taper chroma at the extremes.
const STEPS = [
  [50, 0.971, 0.16], [100, 0.936, 0.32], [200, 0.885, 0.55], [300, 0.811, 0.78],
  [400, 0.714, 0.94], [500, 0.623, 1.0], [600, 0.548, 0.98], [700, 0.474, 0.9],
  [800, 0.404, 0.78], [900, 0.345, 0.64], [950, 0.256, 0.48],
]

console.log()
console.log("=".repeat(72))
console.log("RAMPS")
console.log("=".repeat(72))
const ramps = {}
for (const [name, hex] of Object.entries(BRAND)) {
  if (name === "cream") continue
  const [, C, H] = rgbToOklch(hexToRgb(hex))
  ramps[name] = {}
  const out = []
  for (const [step, L, cMul] of STEPS) {
    const o = [L, C * cMul, H]
    ramps[name][step] = { oklch: fmtOklch(o), hex: rgbToHex(oklchToRgb(o)) }
    out.push(`${step}:${ramps[name][step].hex}`)
  }
  console.log(`${name}\n  ${out.join("  ")}\n`)
}

console.log("=".repeat(72))
console.log("WCAG CONTRAST — text on backgrounds")
console.log("=".repeat(72))
const CREAM = BRAND.cream
const WHITE = "#FFFFFF"
const INK = "#2A2118" // warm near-black candidate for body text

const pairs = [
  ["ink on cream", INK, CREAM],
  ["ink on white", INK, WHITE],
  ["lavender-500 raw on cream", BRAND.lavender, CREAM],
  ["lavender-600 on cream", ramps.lavender[600].hex, CREAM],
  ["lavender-700 on cream", ramps.lavender[700].hex, CREAM],
  ["lavender-800 on cream", ramps.lavender[800].hex, CREAM],
  ["white on lavender-500", WHITE, BRAND.lavender],
  ["white on lavender-600", WHITE, ramps.lavender[600].hex],
  ["sky raw on cream", BRAND.sky, CREAM],
  ["sky-700 on cream", ramps.sky[700].hex, CREAM],
  ["GOLD raw on cream", BRAND.gold, CREAM],
  ["gold-700 on cream", ramps.gold[700].hex, CREAM],
  ["gold-800 on cream", ramps.gold[800].hex, CREAM],
  ["ink on gold raw", INK, BRAND.gold],
  ["MINT raw on cream", BRAND.mint, CREAM],
  ["mint-700 on cream", ramps.mint[700].hex, CREAM],
  ["muted candidate #6B5F52 on cream", "#6B5F52", CREAM],
  ["muted candidate #7A6E60 on cream", "#7A6E60", CREAM],
]

for (const [label, fg, bg] of pairs) {
  const r = contrast(fg, bg)
  const body = r >= 4.5 ? "PASS" : "FAIL"
  const large = r >= 3 ? "PASS" : "FAIL"
  console.log(
    `${label.padEnd(36)} ${fg} on ${bg}  ${r.toFixed(2)}:1   body ${body.padEnd(4)}  large ${large}`
  )
}
