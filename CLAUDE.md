# Webpage Starter Kit — build instructions for Claude Code

You build **premium, on-brand, mobile-friendly landing pages** in this project — including an
Apple-style **scroll-scrubbed 3D product hero**. Plain HTML, CSS, and JS. No build step, no
framework, no npm. It deploys anywhere static.

First run: make sure the user has copied `.env.example` → `.env` (Cloudflare token to deploy;
kie.ai key only if they want the AI hero). Full steps live in `SETUP.md`.

## Rule 0 — Work step by step: PROPOSE → CONFIRM → PROCEED (never surprise them)
This kit is collaborative. At every decision point you MAY draft or propose to make it easy
(suggest a brand, draft the copy, infer the specs, name the exploded parts) — but you must
SHOW the proposal and get an explicit "yes" before you treat it as final, generate, or spend.
**Never advance to the next step on your own**, and never hand back a finished page full of
choices the user never saw. When unsure, ask — they'd rather answer than get a surprise.

**INTAKE first — ask, then WAIT** (if the user just says "build me a page", your first reply is
this intake, not a page):
1. **Brand.** If the accent is still default (`#6c5cff`), run **`brand-setup`** (name, accent,
   vibe, voice). Offer: *"tell me, or I'll propose and you approve."*
2. **Product source.** *"Do you have product photos I should use, or should I generate the
   product from a description?"* Photos → their REAL product is the hero. Generate → get + confirm a description.
3. **Product details.** What it is, key **specs/numbers**, main features, and — for an exploded
   hero — the **parts/components** to show and label. Offer to propose these and have them confirm.
4. **The page.** One-line promise, which sections, animated vs static hero, composition.

**Then keep confirming at each later step:** the **storyboard**, the **copy** (draft it, show it,
get a yes — never finalize headlines/specs silently), the **generated stills**, and **every paid
generation**. Approve, then proceed — one step at a time.

## The one rule that stops slop
Before writing any page, **read `brand/tokens.css` and `brand/brand.md` and the `design-intelligence` skill.** Then:

1. **Use ONLY the tokens** in `brand/tokens.css` for color, type, spacing, radius, and shadow. Never introduce a hex code, font, or pixel value that is not a token. This is why the output looks designed instead of generic. (To change the brand itself, run **`brand-setup`** — don't hard-code.)
2. **Compose pages from `sections/`.** Reuse the blocks there. If you need a block that does not exist, build it from tokens so it matches everything, then save it into `sections/`.
3. **Obey `design-intelligence/anti-patterns.md`.** No default AI purple-to-pink gradient, no 5 competing accent colors, no cramped spacing, no walls of body text, no motion on everything.
4. **Write copy in the voice in `brand/brand.md`.** Short, concrete, benefit-first. No filler.

## How to build a page
1. Read the brand + design-intelligence. If the brand is still the default, offer `brand-setup`.
2. Plan in **plan mode** first. Ask: product name, one-line promise, sections wanted, accent if not default.
3. **Hero:** if the page needs an animated product hero, run the **`scroll-hero`** skill (storyboard → consistent keyframes → directed video → matte → wire). Read the closest example first — `pages/example-sneaker.html` (side-profile turntable) or `pages/example-airpods.html` (centered, exploded-engineering with scroll-synced part labels). Otherwise use a static hero.
4. Assemble the page from `sections/` into `pages/<name>.html`, wiring `assets/base.css`, `brand/tokens.css`, and any section CSS.
5. **Test locally**: `python3 -m http.server 8000` and open the page. Verify at **desktop AND a 390px mobile width** before calling it done.
6. **Deploy** via the **`launch`** skill (Cloudflare, free) only when the user asks. See `deploy.md`.

## Non-negotiables
- **Mobile-friendly is not optional.** Every page must look right at 390px: readable type, tap targets >=44px, no horizontal scroll, the scroll-hero uses its mobile frame set.
- **Accessibility floor:** color contrast AA, visible focus states, `alt` on images, `prefers-reduced-motion` respected (the scroll-sequence already handles it).
- **Ship the frames.** When deploying a page with a scroll-hero, `assets/frames/**` MUST be committed/uploaded, or the animation vanishes in production. `.gitignore` already keeps them in and only excludes the raw working clips.
- **Don't re-derive the locked hero rules.** The engine already handles full-bleed no-clip canvas, the below-nav band, reactive anchors, glow-follows-product, and the resize-guard. Verify them; don't rebuild them (see `scroll-hero` → "Verify").
- **Improve the skills.** After a build, if the user gives feedback ("I liked X, not Y"), fold it into the relevant `SKILL.md` so the next build is better.

## Layout of this project
- `brand/` — tokens.css (the design system) + brand.md (voice)
- `sections/` — reusable HTML blocks
- `assets/` — base.css, scroll-sequence.css/js, generated frames + media
- `pages/` — assembled pages (+ the two worked examples)
- `scripts/kie.sh` — portable kie.ai REST wrapper (no MCP needed)
- `.claude/skills/` — `scroll-hero`, `build-page`, `brand-setup`, `launch`, `design-intelligence`
- `SETUP.md` (keys + tools) · `deploy.md` (going live, Cloudflare)
