---
name: brand-setup
description: Make the kit yours — set the ONE accent color, the font pairing, and the writing voice in one place (brand/tokens.css + brand/brand.md), so every page Claude builds is instantly on-brand. Run this first, or any time you want to rebrand the whole kit. Invoke by saying "set my brand" / "make this mine".
---

# brand-setup

Everything visual flows from `brand/tokens.css`. Change it here, once, and every
page updates. The whole philosophy: **one accent, real neutrals, one font pair,
one voice** — that restraint is what stops pages looking like generic AI slop.

## Interview (ask, don't assume)
Ask the user for (offer smart defaults so they can just say "you pick"):
1. **Brand / product name.**
2. **One accent color** — a hex, or a vibe ("energetic lime", "calm teal",
   "luxury gold"). Pick ONE. Suggest from `design-intelligence/palettes.md`.
3. **Mood** — e.g. editorial-luxe / techy / playful / minimal. This drives the font pair.
4. **Voice** — how the copy should sound (2–3 adjectives + who it's for).

## Write it (tokens first, then voice)

### brand/tokens.css — the accent + fonts
- Set the **one** accent triplet and keep neutrals real:
  ```css
  --accent:        #YOURHEX;   /* the ONE accent — change this first */
  --accent-strong: <a touch lighter/brighter>;  /* hover / emphasis */
  --accent-ink:    <text color that sits ON the accent: #fff or #0a0b0d>;
  ```
- Set the font pair (a **display** for headings + a **body** for text). Pick a
  pairing from `design-intelligence/type-pairings.md`:
  ```css
  --font-display: "<Display>", system-ui, sans-serif;
  --font-body:    "<Body>", system-ui, -apple-system, sans-serif;
  ```
- Do NOT introduce new hex codes, fonts, or pixel values elsewhere — only tokens.
- Light theme block at the bottom of tokens.css: adjust `--accent-ink` if needed
  so text on the accent stays readable in both themes (contrast AA).

### The Google Fonts link (pages use it)
When `build-page` assembles a page, it must load the chosen fonts. Give it the
one line to put in `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=<Display>:wght@500;600;700;800&family=<Body>:wght@400;500;600&display=swap" rel="stylesheet">
```

### brand/brand.md — the voice
Write a short voice guide: the 2–3 adjectives, who it's for, do/don't examples,
and 3–4 sample lines in-voice (a headline, a subhead, a CTA). `build-page` reads
this to write copy — short, concrete, benefit-first, no filler.

## Verify
Open any example page after editing tokens — the accent, fonts, and buttons
should all have shifted with zero per-page edits. If something didn't move, it
was hard-coded instead of tokenised — fix it to use the token.

## Note
For a per-product hero accent that differs from the site (like the demos' Volt
override), a page can set a scoped `:root{ --accent: … }` in its own `<style>` —
but the DEFAULT for the whole kit lives here.
