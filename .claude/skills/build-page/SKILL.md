---
name: build-page
description: Assemble a full premium, mobile-friendly landing page from the brand + sections + a hero. The conductor — reads design-intelligence, plans, decides how the product hero is made (real photos vs AI-generated), calls scroll-hero for animation, composes sections, writes on-brand copy, tests locally. Use to build any page in this kit.
---

# build-page

The conductor. It does not invent design — it applies the kit. Fastest path is
usually **start from the closest example page and swap in the brand + product +
copy**, rather than composing from a blank file.

## Flow

### 0. INTAKE FIRST — stop and ask, do not build yet (blocking)
If the user just says "build me a page", your first move is **not** a page — it's the
intake. Collect and confirm ALL of this before composing or generating anything:

- **Brand.** Read `brand/brand.md` + `brand/tokens.css`. If the accent is still the
  default (`#6c5cff`), **run `brand-setup`** and interview them. Offer both: *"tell me
  your brand (name, color, vibe, voice), or I'll propose one and you approve."*
- **Product source — ASK explicitly, never assume:**
  > *"Do you have product photos I should use, or should I generate the product from a description?"*
  - **They have photos** → get the file(s). Those become the hero reference so it's their
    REAL product (a static hero uses them directly; an animated one feeds them to `scroll-hero`).
  - **Generate** → get a clear description and **confirm it** before generating.
- **Product details.** What it is, the key **specs/numbers** (for the specs section), main
  features, and — for an exploded hero — the **parts/components** to show and label. You may
  *propose* these ("here are the 4 specs and 5 parts I'd show — good?") but get a yes first.
- **The page.** Product name, one-line promise, which sections, and **hero style**
  (animated `scroll-hero` vs static image).
- **Composition** (for the hero): side-profile products (shoes, bottles, phones-in-hand)
  → **offset** preset (copy left, product right, like `pages/example-sneaker.html`).
  Center-framed products (earbuds, watches, jars) → **centered** preset (copy top, product
  center, like `pages/example-airpods.html`).

**Do not proceed to step 1 until the brand + product source are answered.** Never hand back
a finished page with a product the user never described or approved.

Then read `design-intelligence` (palettes, type, anti-patterns, qa-checklist) and continue.

3. **Scaffold.** Duplicate the closest example page as the starting point (it already
   has the nav, the locked hero engine, the reveal script, and the sections wired).
   Then replace its brand tokens, product, and copy. (Or compose from `sections/`
   for a non-product page.)

4. **Hero.**
   - **Animated** → run **`scroll-hero`**, passing the product source (real photos
     or a description) + the composition preset. It returns the wired `.seq` section.
   - **Static** → a single generated/real product still, full-bleed on the dark set,
     with the headline beside/above it (reuse the example's hero markup, drop the canvas).

5. **Compose the rest.** Use the real sections — `nav`, `features`, `specs`, `cta`,
   `footer` — in a sensible order (nav, hero, promise/features, specs/social-proof,
   cta, footer). Need a block that doesn't exist (pricing, faq, logos, how-it-works)?
   **Build it from tokens only** so it matches, then save it into `sections/` for reuse.

6. **Copy — draft, then CONFIRM.** Write it in the `brand/brand.md` voice (benefit-first,
   concrete, short; never lorem/buzzwords), then **show the user the headlines + key lines and
   get a yes before finalizing.** Don't silently lock in copy or specs they haven't seen — offer
   to tweak. (You may draft from the product details they gave to make it easy.)

7. **Reveal.** Add `class="reveal"` to blocks that should fade in on scroll; the tiny
   IntersectionObserver at the bottom of the page `<script>` (copy it from an example)
   handles it. Stat counters use `data-to` the same way.

8. **Test.** `python3 -m http.server 8000`, open the page, verify against
   `design-intelligence/qa-checklist.md` at **full width AND 390px**.

9. **Deploy** only when asked — the **`launch`** skill (Cloudflare). Ship `assets/frames/**`.

## Available sections
`nav` · `hero-scroll` · `features` · `specs` · `cta` · `footer`. Anything else is
built-from-tokens on demand (step 5) and banked back into `sections/`.

## Rules
- Mobile-friendly is mandatory (390px): no horizontal scroll, tap targets 44px+.
- **Tokens only** — no raw hex/px/font outside `tokens.css`.
- One accent, real whitespace, one hero moment. Don't re-derive the locked hero
  rules — the engine already handles them (see `scroll-hero` → "Verify").
- **Keep the footer attribution link** (`Built with the Webpage Starter Kit` → the freebie
  URL) by default — it's a subtle, faint link, not a badge, and it's how the kit stays free.
  Only remove it if the user explicitly asks.
- After feedback, fold the lesson into the relevant `SKILL.md`.
