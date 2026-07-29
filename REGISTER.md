# AKAL Creator — Design Register (LOCKED)

Read this before touching any UI file. Locked 2026-07-28. No agent reopens
typography, ground, layout grammar, or the signature interaction without Ryan
saying so explicitly.

## What this is

**AKAL Creator** — managed creator marketing for **B2B SaaS and AI/dev-tool
companies**. We source, price, contract and pay creators; every placement
carries a tracked link, so the client sees clicks and signups per creator.
**20% of creator budget. Month to month. Cancel anytime.**

The pitch is *attribution*: creator marketing that reports like a paid channel.

Operated by **Akal Digital Services Ltd**, England & Wales **#17229387**.
Brand is AKAL throughout. The codebase started as a carbon copy of another
site for its geometry only — no other brand appears anywhere.

## The five axes

| Axis | Lock |
|---|---|
| Type | **Satoshi** (UI/display) + **Commit Mono** (all figures) — self-hosted in `public/fonts` |
| Ground | White `#FFFFFF` alternating with band `#F6F7F9` · ink `#171717` · muted `#6B6B6B` · rules `#E1E4E8` |
| Grammar | **The ledger** — the page is a document, not a deck |
| Signature | **Live attribution ledger** in the hero (`src/components/AttributionLedger.tsx`) |
| Imagery | **None.** Zero photography, stock, illustration, 3D, gradients, mockups |
| Mark | The AKAL Didone wordmark, `public/akal-wordmark.svg` — vector, `currentColor` |

## Non-negotiable rules

1. **`--radius: 0` everywhere.** Hard corners. Never soften.
2. **No shadows.** Not on cards, frames, or text. Depth comes from rules and
   ground value only.
3. **Hairline rules are the structural device.** 1px `border-border`, edge to
   edge. This is what makes it read as a document.
3b. **Sections alternate white / band down the page.** `SectionShell` derives
   this from the section `index` parity, so the rhythm cannot drift out of step
   when sections are reordered. The band is cool (`220 14% 97%`), never warm —
   a warm band on white reads as a stain, a cool one reads as a plate.
4. **Left-aligned throughout.** Nothing centred.
5. **Every figure is Commit Mono with `tabular-nums`** — use the `.num` or
   `.col-num` class. A number in the sans face is a bug.
6. **The accent (`hsl(var(--accent))`, rose `#E02966`) appears at most three
   times per viewport.** It is for CTAs and live-data marks. Never headings,
   never decoration.
7. **`positive` / `negative` colours are for ledger deltas only.**
8. Section row label in the left gutter, mono: `01 / SOURCING`. Use `.row-label`.
9. Numbers right-align to a column axis that holds across sections.

## Banned outright

Serif + cream + hairline editorial · glassmorphism · neumorphism ·
radial-gradient glows · gradient-clip text · centred heroes · canvas
frame-scrub · photographic heroes · `rounded-full` · `rounded-2xl` · bento
grids · animated borders · aurora backgrounds · logo marquees · drop shadows ·
floaty container cards · AI-generated video or imagery of any kind.

## The brand mark — the one carve-out

The no-imagery rule is about **decoration**. AKAL's own mark is identity, and
typing "AKAL" in Satoshi is an approximation of the brand rather than the brand.

- `public/akal-wordmark.svg` — the Didone wordmark with the red crossbars,
  vectorised from the brand asset. **Vector, 2.4KB, letterforms take
  `currentColor`.** The site still ships zero raster images.
- Favicons are raster by necessity (`favicon-16/32/48/180/512`, `favicon.ico`).
  The small sizes carry an **optically thickened crossbar** — at 32px the
  source hairline vanishes entirely, and the bar is what the mark is
  recognised by.
- Note: the mark's red is `#E00000`; the site accent is rose `#E02966`. The
  mark is not recoloured to match — a brand mark is fixed. They never sit
  adjacent at size, so the difference does not read as inconsistency.
- This carve-out covers the mark and the favicons **only**. It is not a licence
  to introduce photography, illustration, or any other image.

## Fabricated proof — the hard rule

**Never ship a metric, logo, testimonial, rating, case study, or client name we
cannot substantiate.** UK DMCC Act, and it is the one thing on this site that
can actually cost Ryan money.

Specifically forbidden, because they have been proposed and are not ours:

- "$100k+ saved on rates" and "3M+ views" — these are **Beluga's** numbers
- "100% precise attribution" — not achievable by anyone
- "94% audience fit" or any invented score
- Client logo strips, case studies, testimonials — **we have none yet**
- "Real Maison Tanneurs campaign data" — that campaign has never run

Where illustrative numbers are genuinely useful (the hero ledger), they must:
- use **role descriptors**, never real handles (`Dev-tools reviewer · 84k`)
- carry a visible label: `Example campaign · illustrative figures · not client results`

What we *can* say truthfully: the pricing model, what the service does, how
tracking works, and who it is for.

## Copy

English only. ICP is US/UK B2B software. Copy lives **inline in each section
component** — the inherited i18n locale files are being retired, so do not add
keys to `src/locales/`.

Tone: plain, specific, operator-to-operator. No agency language, no
"transform your growth", no exclamation marks, no em-dash-heavy hype.

Strong lines already approved:
- `Creator marketing that reports like a paid channel.` (hero)
- `Spend should scale. Headcount shouldn't.` (final CTA)
- `Source · Negotiate · Attribute` (feature triad)

## Motion

CSS + IntersectionObserver only. **No framer-motion, no GSAP, no canvas scrub.**

- `.animate-appear` — opacity + 10px rise, 500ms ease-out
- `.animate-appear-zoom` — opacity + scale .98→1
- Delays: `.delay-100` `.delay-300` `.delay-700` `.delay-1000`
- Ledger rows stagger at 60ms
- Count-up via `src/hooks/useCountUp.ts` — animates from current value, honours
  `prefers-reduced-motion`
- Everything must survive `prefers-reduced-motion: reduce`

## Stack

Vite + React 19 + react-router-dom + Tailwind + radix + lucide.
Vercel serverless in `api/`. Neon Postgres (schema in `db/schema.sql`,
`DATABASE_URL` in `.env.local`, gitignored).

## Verification before anything is shown

- `pnpm typecheck && pnpm build` clean
- Rendered and **looked at** at 390 / 768 / 1440 — a build passing is not
  "working". Working means seen.
- **No horizontal scroll at 390px.** Grid/flex children holding wide content
  need `min-w-0`; this has already bitten once.
- Grep for fabricated proof before any deploy.
