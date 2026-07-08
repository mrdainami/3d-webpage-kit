---
name: design-intelligence
description: Inject senior-designer taste before building any page — curated palettes, type pairings, layout rules, and an anti-slop checklist. Read this and its data files BEFORE composing HTML so the output looks designed, not generic.
---

# design-intelligence

AI does not design badly. It designs **blind** — with no taste to draw on, it
reaches for the average of the internet (purple gradient, cramped spacing,
five fonts). This skill hands Claude taste as data so it stops guessing.

**Always read this before building a page.** Pull the relevant rows, then build.

## How to use
1. Read `brand/brand.md` for the mood + `brand/tokens.css` for the locked system.
2. Open the data files here and select what fits the product:
   - `palettes.md` — pick or confirm the accent + neutrals (respect tokens).
   - `type-pairings.md` — confirm the display/body pairing.
   - `anti-patterns.md` — the never-do list. Obey it.
   - `qa-checklist.md` — run it before declaring the page done.
3. Build using ONLY `tokens.css` values. If the brand needs a color the tokens
   lack, add it as a token first, then use it. Never inline a raw hex.

## The five levers that separate premium from slop
Most "AI website" output fails on the same five things. Get these right:

1. **Type scale + hierarchy.** One display face, one body face. A real scale
   (big headline, calm body). Never same-size gray text everywhere.
2. **Whitespace.** Generous section padding (`--space-3xl`). Crowding reads cheap.
3. **Restraint in color.** One accent. Neutrals do the work. Color is a spice.
4. **Real imagery / motion, used sparingly.** One hero moment, not confetti.
5. **Alignment + rhythm.** Consistent container width, consistent vertical
   rhythm between sections. Everything on a grid.

If a page feels "off", it is almost always one of these five, not the copy.
