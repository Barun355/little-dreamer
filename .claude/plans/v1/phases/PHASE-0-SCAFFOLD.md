# Phase 0 — Scaffold & Toolchain

> **STATUS: COMPLETE — 2026-07-25.** All 11 checkpoints pass.
>
> **Corrections found during implementation:**
> - `--preset base-nova` is invalid. Valid values: `nova vega maia lyra mira
>   luma sera rhea`. `nova` resolves to style `base-nova` inside
>   `components.json` — the CLI flag and the resulting style name differ.
> - `shadcn init` always creates a subdirectory, so it was scaffolded to
>   `_scaffold/` and moved up. `shopt` is bash-only; this shell is zsh.
> - The preset installs **Base UI** (`base: "base"`), not Radix. All later
>   phases must use the `render` prop for custom triggers, never `asChild`.
> - Icon library is **lucide**; fonts default to **geist** (P1 replaces both
>   per D5).
> - pnpm blocks Prisma's build scripts by default →
>   `pnpm.onlyBuiltDependencies` added to `package.json`.
> - Prisma 7 `init` writes `prisma.config.ts` and a `datasource` block with
>   **no `url`**, and generates `.agents/skills/` + `.windsurf/` +
>   `skills-lock.json`. `.windsurf/` removed; `.agents/` kept (it carries
>   Prisma 7 client reference material the app phase will need).
> - `.gitignore` ships `.env*`, which would have excluded `.env.example`.
>   Added `!.env.example`.
> - `components/ui/carousel.tsx` fails React 19's
>   `react-hooks/set-state-in-effect`. Suppressed inline with a reason —
>   the initial read of an external store on subscribe is the documented
>   exception, and keeping upstream's shape keeps `add --diff` clean.

**Goal:** A running Next.js 16 app with every dependency installed, the data layer
scaffolded-but-inert, and a green production build. Nothing visual yet.

**Prerequisites:** None. This is the first phase.

**Skill to load:** `shadcn`

---

## Tasks

### 0.1 Scaffold via shadcn CLI

```bash
cd /home/localhost/Desktop/hackathon/little-dreamer
pnpm dlx shadcn@latest init --name little-dreamer --template next --preset base-nova
```

Answer prompts: TypeScript **yes**, App Router **yes**, `src/` **no**, alias `@/*`.

**If the template scaffolds Next < 16**, abandon it and use the fallback:

```bash
pnpm create next-app@latest little-dreamer \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-pnpm
cd little-dreamer && pnpm dlx shadcn@latest init --defaults
```

### 0.2 Pin the package manager

Add to `package.json` so the shadcn CLI picks `pnpm dlx`:

```json
"packageManager": "pnpm@10.33.2"
```

### 0.3 Add shadcn primitives

Only what `LANDING.md` actually uses. Do not `add --all`.

```bash
pnpm dlx shadcn@latest add button card accordion carousel avatar badge \
  separator dialog skeleton sonner aspect-ratio tooltip
```

| Primitive | Used by |
|---|---|
| `button` | nav, hero, pricing, final CTA |
| `card` | core bento, testimonials, pricing, themes |
| `accordion` | 11 · SAFETY FAQ |
| `carousel` | 08 · SAMPLE, 09 · TESTIMONIALS mobile |
| `avatar` | 09 · TESTIMONIALS |
| `badge` | 10 · PRICING "MOST POPULAR", 03 · TRUST BAR |
| `separator` | footer, section dividers |
| `aspect-ratio` | hero video, all illustration placeholders |
| `skeleton` | placeholder components |
| `dialog` | hero video lightbox |
| `tooltip` | trust bar icon explanations |
| `sonner` | not used this phase — installed for the app phase |

### 0.4 Motion stack

```bash
pnpm add motion gsap @gsap/react @lottiefiles/dotlottie-react
```

Nothing is imported yet. P1 builds the primitives.

### 0.5 State + forms (inert)

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
pnpm add zod react-hook-form @hookform/resolvers
```

> **Honest note:** a marketing landing page has no server state, so TanStack Query
> will be mounted and genuinely unused this phase. It is installed now only so the
> provider tree and devtools are already correct when the wizard arrives. If that
> feels like dead weight, it can be deferred to the app phase at zero cost.

### 0.6 Data layer — scaffold, do not wire

```bash
pnpm add -D prisma
pnpm add @prisma/client @prisma/adapter-neon @neondatabase/serverless
pnpm dlx prisma init --datasource-provider postgresql
```

**Prisma 7 uses driver adapters.** Write `prisma/schema.prisma` the v7 way from the
start — a v6-style scaffold gets thrown away in the app phase (risk R7).

Write the schema for the known domain model but **run no migration**:
`User · Child · Job · Book · Page · Asset · BeatPlan · Order`.

`.env.example` documents `DATABASE_URL`, `R2_*`, `MAKE_WEBHOOK_URL`,
`MAKE_API_KEY`, `HMAC_SECRET` — with **no real values committed**.

### 0.7 Misc + repo hygiene

```bash
pnpm add next-themes
git init && git add -A && git commit -m "chore: scaffold"
```

Confirm `.gitignore` covers `.env*` (not `.env.example`), `.next`, `node_modules`.

### 0.8 Baseline page

Replace `app/page.tsx` with a single `<main>` and an `<h1>`. Delete the Next.js
starter boilerplate, demo CSS, and starter SVGs in `public/`.

---

## Checkpoints

```
  □  C0.1   pnpm dev starts, http://localhost:3000 renders the bare h1
  □  C0.2   pnpm build completes with zero errors and zero warnings
  □  C0.3   npx next --version prints 16.x
  □  C0.4   components.json exists; tailwindVersion resolves to "v4"
  □  C0.5   pnpm dlx shadcn@latest info reports framework "Next.js",
              rsc true, typescript true, alias "@/"
  □  C0.6   components/ui/ contains all 12 added primitives
  □  C0.7   pnpm ls motion gsap @gsap/react @lottiefiles/dotlottie-react
              resolves all four
  □  C0.8   prisma/schema.prisma parses:  pnpm dlx prisma validate
  □  C0.9   NO migration has run — prisma/migrations/ does not exist
  □  C0.10  git status clean; no .env in the index
  □  C0.11  public/ contains no Next.js starter assets
```

**Exit criteria:** C0.1 through C0.11 all pass. A production build of an
almost-empty page succeeds. No visual work has begun.

---

## Risks

| Risk | Mitigation |
|---|---|
| shadcn `next` template lags Next 16 | Fallback in 0.1; verify with C0.3 before continuing |
| `base-nova` preset installs a font/theme that fights the brand | Accepted — P1 overwrites tokens wholesale |
| Prisma v7 scaffolded as v6 (R7) | C0.8 + explicit driver-adapter schema in 0.6 |
| Installing TanStack Query with nothing to query | Called out in 0.5; deferrable |
