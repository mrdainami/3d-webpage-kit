/* ============================================================
   SCROLL-SEQUENCE  —  the signature "Apple product page" effect
   A product video, sliced into frames, scrubbed by scroll.
   It is a flipbook tied to the scrollbar, not a playing video.

   Mobile-friendly by design:
   - Desktop pulls the full frame set from data-frames.
   - Mobile (<=640px) pulls a lighter set from data-frames-mobile
     (fewer, smaller frames) so cellular users are not downloading
     120 full-res images.
   - prefers-reduced-motion: shows a single poster frame, no scrub.

   Markup (see sections/hero-scroll.html):
   <section class="seq" data-frames="frames/desktop" data-frames-mobile="frames/mobile"
            data-count="120" data-count-mobile="48" style="--seq-scroll: 320vh">
     <div class="seq__pin"><canvas class="seq__canvas"></canvas></div>
   </section>
   ============================================================ */

(function () {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp  = (a, b, t) => a + (b - a) * t;

  // Where the product sits, derived LIVE from the viewport's aspect ratio so the
  // hero re-composes continuously as the window resizes — not at a single breakpoint.
  //   Wide (A >= 1.5): product to the RIGHT, so a text column can live on the left.
  //   Narrower/tall  : product drops to BOTTOM-CENTER and grows, so a text band can
  //                    live across the TOP. It never shares space with the copy.
  // Matches the CSS aspect breakpoint (3/2) so shoe-zone and text-zone always agree.
  function autoLayout(cw, ch) {
    const A = cw / ch;
    if (A >= 1.5) return { subj: 0.60, ax: 0.68, ay: 0.50 };
    const t = clamp((1.5 - A) / (1.5 - 0.56), 0, 1); // 0 at A=1.5 -> 1 at phone portrait
    return { subj: lerp(0.62, 0.96, t), ax: 0.5, ay: lerp(0.60, 0.67, t) };
  }
  const isMobile = matchMedia("(max-width: 640px)").matches;
  const reduced  = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".seq").forEach((seq) => {
    const canvas = seq.querySelector(".seq__canvas");
    const ctx = canvas.getContext("2d");

    const dir   = (isMobile && seq.dataset.framesMobile) ? seq.dataset.framesMobile : seq.dataset.frames;
    const count = parseInt((isMobile && seq.dataset.countMobile) ? seq.dataset.countMobile : seq.dataset.count, 10);
    const pad   = (seq.dataset.pad ? +seq.dataset.pad : 4);
    const ext   = seq.dataset.ext || "webp";
    // Composition. Two modes:
    //   fit="subject"  — THE responsive one. The frames are alpha-matted, so we
    //     measure the product's real pixel bounds and lock IT (not the 16:9 frame)
    //     to a target size + anchor. The shoe then holds the same size/position at
    //     ANY viewport aspect — wide desktop or narrow phone — which is how Apple-
    //     tier scroll sites stay composed across breakpoints.
    //       data-subject   = fraction of the limiting viewport dim the product spans (0.72)
    //       data-anchor-x  = where the product's center sits, 0..1 across width (0.5)
    //       data-anchor-y  = ditto down height (0.46 = slightly high, leaves room for copy)
    //     Each takes a -mobile override.
    //   fit="cover"/"contain" — legacy frame-based fit with data-scale / data-shift-*.
    const fit      = seq.dataset.fit || "cover";
    const fitScale = parseFloat((isMobile && seq.dataset.scaleMobile) || seq.dataset.scale || "1");
    const shiftX   = parseFloat((isMobile && seq.dataset.shiftXMobile) || seq.dataset.shiftX || "0");
    const shiftY   = parseFloat(seq.dataset.shiftY || "0");
    // Read the product size/anchor LIVE (re-checking the mobile query each draw) so that
    // resizing across the 640px breakpoint re-centers the shoe instead of leaving the
    // desktop anchor in place (which pulled it off-frame and clipped it on phones).
    const staticLayout = () => {
      const m = matchMedia("(max-width: 640px)").matches;
      return {
        subj: parseFloat((m && seq.dataset.subjectMobile) || seq.dataset.subject || "0.72"),
        ax:   parseFloat((m && seq.dataset.anchorXMobile) || seq.dataset.anchorX || "0.5"),
        ay:   parseFloat((m && seq.dataset.anchorYMobile) || seq.dataset.anchorY || "0.46"),
      };
    };
    const src   = (i) => `${dir}/frame_${String(i).padStart(pad, "0")}.${ext}`;

    const frames = [];
    let loaded = 0, ready = false, aspect = 16 / 9, subjectBox = null;

    // Measure the union bounding box of the opaque pixels across a sample of frames.
    // Union (not per-frame) so a rotating/moving product never clips at any scroll
    // position. Done once at low res for speed. Returns box in natural-pixel coords.
    function computeSubjectBox() {
      const first = frames.find((f) => f && f.complete && f.width);
      if (!first) return null;
      const iw = first.width, ih = first.height;
      const S  = 240 / Math.max(iw, ih);          // sample at ~240px long edge
      const sw = Math.max(1, Math.round(iw * S)), sh = Math.max(1, Math.round(ih * S));
      const off = document.createElement("canvas");
      off.width = sw; off.height = sh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      const N = Math.min(count, 14);
      let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
      for (let k = 0; k < N; k++) {
        const idx = N === 1 ? 0 : Math.round((k * (count - 1)) / (N - 1));
        const img = frames[idx];
        if (!img || !img.complete || !img.width) continue;
        octx.clearRect(0, 0, sw, sh);
        octx.drawImage(img, 0, 0, sw, sh);
        let data;
        try { data = octx.getImageData(0, 0, sw, sh).data; } catch (e) { return null; } // tainted -> bail to frame-fit
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            if (data[(y * sw + x) * 4 + 3] > 24) {
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
      }
      if (maxX < 0) return null;
      return { x: minX / S, y: minY / S, w: (maxX - minX + 1) / S, h: (maxY - minY + 1) / S };
    }

    // Fit the canvas to its box at device pixel ratio (crisp on retina).
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(currentFrame);
    }

    // Draw one frame, object-fit: cover, centered.
    let currentFrame = 0;
    function draw(i) {
      const img = frames[i];
      if (!img || !img.complete) return;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      if (fit === "subject" && subjectBox) {
        // Lock the PRODUCT (not the frame) to a target fraction + anchor. When the
        // page sets explicit data-subject/anchor we honour them; otherwise the layout
        // is derived live from the aspect ratio (autoLayout) so it reacts at all sizes.
        const b = subjectBox;
        const L = seq.dataset.subject ? staticLayout() : autoLayout(cw, ch);
        const s = L.subj * Math.min(cw / b.w, ch / b.h);
        const dw = img.width * s, dh = img.height * s;
        const x = L.ax * cw - (b.x + b.w / 2) * s;
        const y = L.ay * ch - (b.y + b.h / 2) * s;
        ctx.drawImage(img, x, y, dw, dh);
        return;
      }
      const cover = Math.max(cw / img.width, ch / img.height);
      const contain = Math.min(cw / img.width, ch / img.height);
      const s = (fit === "contain" ? contain : cover) * fitScale;
      const dw = img.width * s, dh = img.height * s;
      const x = (cw - dw) / 2 + shiftX * cw, y = (ch - dh) / 2 + shiftY * ch;
      ctx.drawImage(img, x, y, dw, dh); // frames are matted (alpha) -> composite cleanly on the page set
    }

    // Map scroll through the tall section to a frame index.
    function onScroll() {
      if (!ready) return;
      const rect = seq.getBoundingClientRect();
      const total = seq.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / (total || 1), 0, 1);
      const i = Math.round(progress * (count - 1));
      if (i !== currentFrame) { currentFrame = i; draw(i); }
    }

    // Reduced motion: just paint the middle frame and stop.
    if (reduced) {
      const img = new Image();
      img.onload = () => { frames[0] = img; ready = true; resize(); };
      img.src = src(Math.round(count / 2));
      seq.style.setProperty("--seq-scroll", "100vh"); // collapse the scrub runway
      window.addEventListener("resize", resize);
      return;
    }

    // Preload every frame, then wire scroll.
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      img.onload = () => {
        if (i === 1) aspect = img.width / img.height;
        if (++loaded === count) {
          if (fit === "subject") subjectBox = computeSubjectBox();
          ready = true; resize(); onScroll();
        }
      };
      img.src = src(i);
      frames[i - 1] = img;
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { onScroll(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", resize);
  });
})();
