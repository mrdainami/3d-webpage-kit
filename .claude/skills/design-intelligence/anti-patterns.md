# Anti-patterns — the never-do list

These are the tells of AI-generated slop. If any appear, the page fails.

## Color
- The default **purple-to-pink / blue-to-purple gradient** hero. Banned.
- More than **one** accent color competing for attention.
- Pure black `#000` on pure white `#fff` for body text (harsh). Use tokens.
- Neon everything. Saturation with no neutrals to rest the eye.

## Type
- More than **two** typefaces.
- Everything the same weight and size (no hierarchy).
- Body text wider than ~70 characters per line.
- Centered long paragraphs.

## Layout & space
- Cramped sections with tiny vertical padding. Give it air.
- Full-width text with no container. Content needs a max width.
- Ten sections that all look identical (stat / stat / stat / stat).
- Card grids where every card is a different height.

## Motion
- Everything animating on load. Motion on everything = motion on nothing.
- Bounce / elastic easings on serious brands. Use the one `--ease` curve.
- Parallax or scroll effects with no `prefers-reduced-motion` fallback.
- Autoplaying sound. Never.

## Copy
- "Unlock the power of...", "Revolutionize your...", "Seamlessly...".
- Feature lists with no benefit. Say what it does FOR them.
- Exclamation marks as energy. Em dashes. Emoji as decoration.

## Mobile
- Desktop-only layouts that overflow at 390px.
- Tap targets under 44px. Text under 16px. Fixed widths in px.
