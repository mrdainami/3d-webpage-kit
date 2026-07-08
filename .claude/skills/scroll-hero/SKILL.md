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

### Step 2 — Consistent keyframes (Nano Banana, ~8–12cr each) — THE lesson
Generate one still per keyframe pose. **The #1 mistake is generating each still
independently from text — you get a different product every time** (different case
shape, stemmed vs stemless, etc.). Instead **CHAIN them**:

1. Generate the **anchor** keyframe from text (the hero pose). Lock: matte finish,
   accent color, `pure black studio void`, `no text, no logo, no labels`, 16:9.
2. Generate **every other** keyframe by feeding the previous one as `image_input`
   with a "keep it identical, only change X" instruction — never from scratch.

```jsonc
// image-to-image chain — model "nano-banana-2", standard envelope
{ "model":"nano-banana-2",
  "input":{ "prompt":"Take the EXACT product in the reference image and <do X>. Keep the
              identical shape, proportions, finish, and accent — do NOT redesign it. …
              ABSOLUTELY NO text, letters, numbers, or labels anywhere.",
            "image_input":["<url of the previous keyframe>"],
            "aspect_ratio":"16:9", "output_format":"png" } }
```
- For an **exploded view**, feed the hero bud and say *"exploded diagram of THIS
  exact product… every part reassembles into the reference."* Watch for the model
  stamping text on parts (e.g. a battery) — our prompt must forbid it explicitly.
- The kie image endpoint throws transient 500/524s — **resubmit** (0cr on fail).

**GATE (before any video spend):** tile the keyframes into one mockup, then **LOOK at it
yourself** and confirm: same product across every panel? no stray text/letters? do the
exploded parts reassemble into the hero? Any FAIL → regenerate that frame from the anchor,
don't proceed. Show the mockup to the user for a final yes. Only pass a set where all frames
are unmistakably one product.
*(Optional: a Gemini-Flash `visual-qc` script can pre-flag `SAME_PRODUCT / NO_TEXT / REASSEMBLES`
cheaply — but your own eyes are the check that matters and are all that's required.)*

### Step 3 — Direct the video (Seedance 2.0, ~102cr/s at 1080p — confirm cost first)
Seedance does **one continuous, directed, multi-beat clip** and **flows between
beats with no hard cuts** — perfect for scrubbing. Feed the keyframes as
**multimodal references** and direct a timeline. (First-frame / first+last /
multimodal-reference are mutually exclusive — use multimodal-reference here.)

```jsonc
{ "model":"bytedance/seedance-2",
  "input":{ "reference_image_urls":["<@image1>","<@image2>","<@image3>","<@image4>"], // ≤9
            "generate_audio":false, "resolution":"1080p", "aspect_ratio":"16:9", "duration":8,
            "prompt":"<5-block prompt below>" } }
```
**5-block prompt** (max 20000 chars):
1. **SHOT SPEC** — `single continuous shot · 16:9 · pure black studio void · audio off`
2. **REFERENCE SLOTS** — one line per ref in array order: `@image1 = closed case (hero + first/last frame)…`
3. **TIMELINE** — `[0s] orbit… [2s] lid opens (match @image2)… [4s] EXPLODES (match @image4), parts HOLD — camera LOCKED… [6.5s] reassembles… [7.2s] back into case`
4. **CONSISTENCY LOCK** — identity + finish + accent 100% identical; exploded parts exactly @image4; NO text/labels.
5. **STYLE TAIL** — `black void, soft key + accent rim, shallow DoF, premium product film, ultra sharp, no blur/ghosting/flicker, stable, no text. audio off.`

Duration note: scrub smoothness comes from FRAME COUNT (set at slice), not
duration — but the **explosion must HOLD long enough** for the label section, and
7 beats need room. 8–12s is the sweet spot. Persist the taskId to `.gen.json`
immediately (billed on submit). Park `kie-watch.sh <taskId>` in the background.

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
chain keyframes for consistency · Seedance multimodal-ref+timeline over start-end ·
rembg isnet for fine parts · palindrome for clean closes · measure canvas for labels.
