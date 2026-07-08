# Type pairings — display + body, tested combinations

Two faces max: one for headings (display), one for text (body). All are on
Google Fonts. Set them as `--font-display` and `--font-body` in tokens.css.

| Display | Body | Mood |
| --- | --- | --- |
| Space Grotesk (default) | Inter | modern tech, confident, clean |
| Sora | Inter | product, techy, friendly |
| Clash-like: Archivo | Inter | bold, editorial, sporty |
| Fraunces | Inter | luxury, editorial, warm |
| Instrument Serif | Inter | premium, elegant, minimal |
| Bricolage Grotesque | Inter | characterful, startup |
| Syne | Inter | fashion, creative, distinctive |
| Manrope | Manrope | ultra-clean single-family |

## Rules
- Display is for h1/h2/h3 only. Body font for everything else.
- Tighten display tracking (`--tracking-tight`); never track body loosely.
- Weights: display 500 to 700, body 400 to 600. Skip hairline weights on dark.
- Load only the weights you use (keep the font URL lean).

## Sneaker demo
**Archivo** (display, heavy for the sporty headline) + **Inter** (body).
Set `--font-display: "Archivo", sans-serif;` and keep Inter for body.
