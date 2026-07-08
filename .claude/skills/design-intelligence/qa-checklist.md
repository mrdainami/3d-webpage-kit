# QA checklist — run before declaring a page done

Do not ship until every box is true. Check the live localhost page, not the code.

## Design
- [ ] One display face, one body face. Nothing else.
- [ ] One accent color. Neutrals carry the rest.
- [ ] Clear hierarchy: headline >> subhead >> body.
- [ ] Generous section padding; the page breathes.
- [ ] Consistent container width and vertical rhythm across sections.
- [ ] No anti-pattern from `anti-patterns.md` is present.

## Responsive (check at 390px AND full width)
- [ ] No horizontal scroll at 390px.
- [ ] Body text >= 16px; headings scale down, do not overflow.
- [ ] Tap targets >= 44px.
- [ ] The scroll-hero loads its MOBILE frame set on small screens.
- [ ] Nav collapses cleanly (menu or stacked).

## Accessibility
- [ ] Text/background contrast passes AA.
- [ ] Visible focus state on links, buttons, inputs.
- [ ] Every image has meaningful `alt`.
- [ ] `prefers-reduced-motion` respected (scroll-hero shows a still).

## Performance / deploy
- [ ] Frames are WebP and reasonably sized; mobile set is lighter.
- [ ] Only the font weights in use are loaded.
- [ ] `frames/` folders are committed (not gitignored) before deploy.
