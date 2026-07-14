---
name: scroll-hero
description: Turn a product into the signature scroll-scrubbed 3D hero (Apple-product-page style) — an AI-generated product clip sliced into transparent frames and scrubbed by scroll. Runs a gated pipeline (storyboard → consistent keyframes → directed video → matte → wire) with all the hard-won rules baked in. Use when a page needs an animated product hero. Proven on pages/example-sneaker.html (turntable) and pages/example-airpods.html (exploded-engineering + callouts).
---

# scroll-hero

The effect is NOT 3D or WebGL. It is a **flipbook tied to the scrollbar**: an AI
video of a product, sliced into frames, with scroll position choosing the frame.
The frames are **background-removed (transparent)** so the product composites onto
any page with no seam. This is the exact Apple-product-page technique.

Two proven references live in `pages/`: **example-sneaker** (a side-profile
turntable) and **example-airpods** (a centered exploded-engineering hero with
scroll-synced part labels). Read the one closest to your product before starting.

## Prerequisites (check first, install what's missing)
- **kie.ai key** — Nano Banana 2 (stills) + Seedance 2.0 (video). Set `KIE_API_KEY` in
  `.env` (see `SETUP.md`). Call kie through the bundled REST wrapper — **no MCP needed**:
  - `scripts/kie.sh submit '<json body>'` → prints the `taskId`
  - `scripts/kie.sh wait <taskId> [taskId ...]` → `RESULT <id> <state> <url|failMsg>` (park it in the background)
  - `scripts/kie.sh download <url> <destPath>`
  The JSON bodies shown below are exactly what you pass to `kie.sh submit`.
  *(Power users may instead wire the kie MCP and call `kie_post`/`kie_get` — same payloads.)*
- **ffmpeg** (slice) + **cwebp** (transparent WebP) + **rembg** (background matte) — plain
  command-line tools, **no MCP**: `brew install ffmpeg webp && pip install rembg` (or `pipx`).
- **No QC tool required.** At the consistency gate, YOU (Claude) look at the reference mockup
  yourself and confirm it's one product — your own vision is the accuracy check.
  *(Optional power-up: a Gemini-Flash `visual-qc` script batch-checks many images cheaply
  without spending your context — handy, but not required and not needed for accuracy.)*

> No kie access, or a simple product? Skip the pipeline and use a **static hero**
> (a single generated still) — the kit works fine without the animation.

---

## The pipeline (GATED — never spend on the next step before the current one is approved)

### Step 0 — Product source (STOP — ask before generating)
Never generate a product from a bare name. First ask the user, explicitly, and wait:
> *"Do you have product photos I should use, or should I generate the product from a description?"*
- **They have photos** → use their image as the **anchor** of the keyframe chain (Step 2),
  so the hero is their REAL product. Everything downstream stays consistent to it.
- **Generate** → get a specific description (finish, colour, accent, details) and confirm it.

Also confirm the accent/brand (from `brand/tokens.css` / `brand-setup`) so the studio set +
rim light match the brand. Only then proceed.

### Step 1 — Storyboard (design gate, $0)
Author a beat-table BEFORE generating anything. Map scroll% → product state →
camera → copy/callout. Approve it first. Example (AirPods):

| Scroll | Product state (the pose) | Camera | Copy / callout |
|---|---|---|---|
| 0–15% | case closed, slow orbit | orbit | headline |
| 15–30% | lid opens | push-in | "Open." |
| 30–50% | bud lifts out, rotates | track up | "Featherlight." |
| **50–75%** | **explodes into parts, HOLDS** | **locked** | **part labels** |
| 75–100% | reassembles → closes | settle | CTA |

Each **row boundary = one keyframe still**. Each **row = one motion beat**. Keep
the camera **LOCKED** on any beat that needs annotation labels (a moving target
can't hold labels). If the arc opens and closes, see **Palindrome** (Step 4) —
you may only need to storyboard the FORWARD half.

### Step 2 — Product master + storyboard sheet (GPT Image 2) — the v2 method
**This replaced chained keyframes** (v1, kept below as fallback). Two images total,
both gated:

**2a. Product master** — `gpt-image-2-text-to-image`, 16:9, `resolution: "4K"`.
One definitive hero still. Lock: finish, accent, `pure black studio void`,
`ABSOLUTELY NO text, letters, numbers, logos, or labels anywhere`. This is the
single identity anchor for everything downstream. **GATE: user approves the product.**

**2b. Storyboard sheet** — `gpt-image-2-image-to-image`, `input_urls:[master]`,
16:9, `resolution: "2K"`. **ONE image containing all beats as numbered panels**
(3×2 grid for 6 beats works well). Because every panel comes out of a single
generation anchored to the master, product identity AND motion continuity are
consistent *by construction* — no chain to drift. Each panel must render: a big
panel number (top-left), a small timestamp for its slice of the clip, and a
one-line caption bar. The ONLY text in the image is those labels — the product
itself stays clean (forbid engraved pseudo-text on movements/parts and duplicate
crowns/stems explicitly; GPT Image 2 renders panel text legibly, which is why
it's locked for this step). **GATE: user approves the sheet — the last cheap step.**

```jsonc
// storyboard sheet — standard envelope
{ "model":"gpt-image-2-image-to-image",
  "input":{ "prompt":"A film director's storyboard sheet …, 3-column by 2-row grid …
              Every panel shows THE EXACT SAME product as the reference image …
              Panel 1 — timestamp '0:00-1.5s' — <beat>. Caption: '<caption>' …",
            "input_urls":["<master url>"], "aspect_ratio":"16:9", "resolution":"2K" } }
```
- The kie image endpoint throws transient 500/524s — **resubmit** (0cr on fail).
- Inspect at full zoom before showing the user: crop-zoom any part that tends to
  carry engraved text (movements, chips, batteries).

*(v1 fallback — chained keyframes with nano-banana-2: anchor from text, then each
next frame image-to-image from the PREVIOUS frame — strictly sequential, "this is
the NEXT keyframe of a continuous film, only change X". Use when a sheet's panels
come out inconsistent for a complex product.)*

### Step 3 — Direct the video (Seedance 2.0 Mini — the project default; confirm cost first)
**Default model: `bytedance/seedance-2-mini`, 720p, 16:9** (~205cr for 10s vs
~1020cr for Pro 1080p; 720p output is 1280px wide = exactly the desktop slice
width, so nothing is lost for this pipeline). Seedance does **one continuous,
directed, multi-beat clip** with no hard cuts — perfect for scrubbing. Feed the
**storyboard sheet + product master** as multimodal references and transcribe the
panels into SHOT blocks — the storyboard prompting method. (First-frame /
first+last / multimodal-reference are mutually exclusive — use multimodal here.)

```jsonc
{ "model":"bytedance/seedance-2-mini",
  "input":{ "reference_image_urls":["<storyboard sheet url>","<master url>"], // ≤9
            "generate_audio":false, "resolution":"720p", "aspect_ratio":"16:9", "duration":10,
            "prompt":"<storyboard prompt below>" } }
```
**Storyboard prompt structure** (max 20000 chars):
1. **SHOT SPEC** — `single continuous shot · 16:9 · pure black studio void · audio off`
2. **REFERENCE IMAGE SLOTS** — `Image 1 = storyboard sheet — beat layout only`,
   `Image 2 = product identity master`.
3. **THE NOTE (required)** — `NOTE: Image 1 (storyboard) is a layout reference only —
   do NOT render panel grids, borders, numbers, timestamps, captions, or any text in
   the output. The shot compositions are described in the SHOT blocks below. The
   product in every frame must match Image 2 exactly.`
4. **CONSISTENCY LOCK** — identity + finish + accent 100% identical to Image 2;
   exploded parts exactly Panel <N> of Image 1 and they reassemble; exactly ONE of
   any single component (crowns/stems duplicate easily); NO text/labels anywhere.
5. **TIMELINE — one SHOT block per storyboard panel**, tagged with the panel's
   timestamp, opening `match Panel N of Image 1:` and then **literally transcribing
   that panel's composition in spatial language** (where each element sits in frame,
   camera move) — never paraphrased intent. Camera explicitly `LOCKED, zero movement`
   during the exploded HOLD (a moving target can't hold labels).
6. **STYLE TAIL** — `black void, soft key + accent rim, shallow DoF, premium product
   film, ultra sharp, no blur/ghosting/flicker/morphing, stable, no text. audio off.`

Duration note: scrub smoothness comes from FRAME COUNT (set at slice), not
duration — but the **explosion must HOLD long enough** for the label section.
8–12s is the sweet spot. Persist the taskId to `.gen.json` immediately (billed on
submit) and read the account balance before/after submit to report the exact
charge (`GET /api/v1/chat/credit`). Park the wait in the background.
**GATE before submitting:** show the user the full prompt + params + cost estimate
(publish it where they can actually read it) and get an explicit go.

### Step 4 — Frames: slice → matte → transparent WebP
See `assets/hero-airpods/build-frames.sh` for the exact, working script. Core:
```bash
# slice to ~120–160 frames (pick fps = count/duration); 1280w desktop, 720w mobile
ffmpeg -i clip.mp4 -vf "fps=18,scale=1280:-1:flags=lanczos" raw/desktop/frame_%04d.png
# MATTE — isnet-general-use keeps fine parts (mics, chips) the default model drops
rembg p -m isnet-general-use raw/desktop cut/desktop
# transparent WebP
for f in cut/desktop/*.png; do cwebp -q 86 -alpha_q 92 "$f" -o "frames/<name>-desktop/$(basename ${f%.png}).webp"; done
```
**Palindrome (for open→close loops):** don't rely on the model generating a clean
close — it rarely lands exactly. Instead pick the **apex frame** (fully-exploded,
mid-hold) and build the sequence **forward [1..K] then reverse [K-1..1]**. The
reverse is the opening played backward, so it closes *perfectly* on frame 1, free.
(See build-frames.sh's `build_palin`.)

### Step 5 — Wire the section (pick the composition preset)
Set the `.seq` data attributes to the real frame counts/paths, then choose:
- **OFFSET** (side-profile product, e.g. shoe): copy in a LEFT column, product
  RIGHT. `data-anchor-x≈0.72`, text aligned to the container `--edge`. See example-sneaker.
- **CENTERED** (product sits center-frame, e.g. AirPods / bottles): copy in a TOP
  band, product center-lower. `data-anchor-x=0.5 data-anchor-y≈0.62`, smaller
  `data-subject` so the headline has clear air above the product. See example-airpods.

```html
<section class="seq"
  data-frames="../assets/frames/<name>-desktop" data-count="199"
  data-frames-mobile="../assets/frames/<name>-mobile" data-count-mobile="99"
  data-ext="webp" data-pad="4"
  data-fit="subject" data-subject="0.72" data-anchor-x="0.5" data-anchor-y="0.62"
  data-subject-mobile="0.94" data-anchor-x-mobile="0.5" data-anchor-y-mobile="0.6"
  style="--seq-scroll: 620vh; --seq-scroll-mobile: 380vh;">
```

### Step 6 — Callout labels (optional): MEASURE, don't eyeball
To point labels at exploded parts, **scan the rendered canvas** for the real
component positions instead of guessing (this is why the AirPods labels landed in
one pass). Scroll to the apex, then in the page console:
```js
// returns each component's x-center (% of viewport) + the row's y-center
const cv=document.querySelector('.seq__canvas'),g=cv.getContext('2d'),bw=cv.width,bh=cv.height,dpr=bw/cv.clientWidth;
const d=g.getImageData(0,0,bw,bh).data;const col=[];let minY=bh,maxY=-1;
for(let x=0;x<bw;x++){let c=0;for(let y=0;y<bh;y+=2){if(d[(y*bw+x)*4+3]>40){c++;if(y<minY)minY=y;if(y>maxY)maxY=y;}}col[x]=c;}
const grp=[];let s=-1;for(let x=0;x<bw;x++){const on=col[x]>2;if(on&&s<0)s=x;if((!on||x===bw-1)&&s>=0){if((x-1)-s>4)grp.push([s,x-1]);s=-1;}}
console.log(grp.map(a=>+(((a[0]+a[1])/2/dpr)/cv.clientWidth*100).toFixed(1)), 'rowY%', +(((minY+maxY)/2/dpr)/cv.clientHeight*100).toFixed(1));
```
Put each `.co` at the measured `--x`; set `.co { top: <rowY%> }`. Show the callout
layer only over the hold range (`p>=0.45 && p<=0.59` in the choreography tick).
Stagger label stems (short/long) so adjacent labels don't collide.

### Step 7 — Verify (the locked rules) + deploy
The engine (`assets/scroll-sequence.js/.css`) already enforces these — don't
re-derive them, just confirm they hold:
- **Full-bleed canvas** in a band **below the nav** (`--nav-h` measured in JS): the
  product can never be clipped by a side or the header, and there's no first-frame jump.
- **Subject-fit** guarantees the product always fits the canvas (no side clip); the
  right edge aligns to a target via anchor, not by clipping.
- **Glow follows the product** (`--glow-x/--glow-y`), reactive anchors on resize,
  and a **resize-guard** (`html.is-resizing *{transition:none}`) so the mobile nav
  doesn't slide when crossing the 640px breakpoint.
Serve locally, scrub top→bottom on desktop AND at 390px. Then `launch` (Cloudflare).

## Receipts
Write `assets/hero-<name>/<name>.gen.json` with every taskId, model, prompt,
resolution, credits, and the composition preset — so a build reproduces without
re-reading this file. See `assets/hero-airpods/airpods.gen.json` for the shape.

## Improve
When the user corrects something (a pose, an anchor, a label position), fold the
fix into THIS file so the next hero starts closer to right. Hard-won so far:
chain keyframes for consistency · chain SEQUENTIALLY (prev frame, not anchor) so
frames also flow as motion · Seedance multimodal-ref+timeline over start-end ·
rembg isnet for fine parts · palindrome for clean closes · measure canvas for labels ·
watch products: forbid engraved "text" on movements/parts and duplicate crowns/stems.
