# Palettes — curated, accessible starting points

Each palette lists an accent + the mood it carries. Neutrals stay near-black
(dark theme) or near-white (light). Set the accent as `--accent` in tokens.css.
Pick by product mood, then confirm contrast (AA) with the QA checklist.

| Palette | Accent | Mood / fits |
| --- | --- | --- |
| Violet Signal (default) | `#6c5cff` | modern tech, SaaS, tools |
| Volt | `#c8ff00` | sport, sneakers, energy, bold |
| Ember | `#ff5a36` | food, fitness, urgent, warm |
| Blood Orange | `#ff3b2f` | performance, appliances, power |
| Aqua | `#22d3ee` | clean, health, fresh, calm |
| Emerald | `#10b981` | finance, sustainable, trust |
| Gold | `#d4af7a` | luxury, fragrance, editorial |
| Sky | `#3b82f6` | corporate, dependable, classic |
| Magenta | `#ec4899` | beauty, creator, playful |
| Ice | `#e6edf5` | minimalist, monochrome, premium |

## Rules
- **One accent.** The neutrals in `tokens.css` carry the design; the accent
  points at ONE thing per screen (the primary action).
- **Dark hero.** The scroll-hero product sits on black; keep the hero dark even
  on a light-theme site so the product blends into the page.
- **Contrast.** Accent-on-bg and text-on-bg must pass AA. If an accent is too
  light for text, use it only for fills/borders, not for words.

## Sneaker demo (this kit's example)
Palette **Volt** (`--accent: #c8ff00`) on the default near-black neutrals.
Energetic, sporty, reads instantly as a performance product.
