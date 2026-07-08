#!/usr/bin/env bash
# Slice the AirPods clip -> matte (rembg) -> transparent WebP frame sequences.
set -euo pipefail
cd "$(dirname "$0")"
FF=/opt/homebrew/bin/ffmpeg
MP4=airpods-v2.mp4
RAW=_raw; CUT=_cut
OUTD=../frames/airpods-desktop; OUTM=../frames/airpods-mobile
rm -rf "$RAW" "$CUT" "$OUTD" "$OUTM"
mkdir -p "$RAW/desktop" "$RAW/mobile" "$CUT/desktop" "$CUT/mobile" "$OUTD" "$OUTM"

echo "=== slice desktop (18fps, 1280w) ==="
"$FF" -hide_banner -loglevel error -i "$MP4" -vf "fps=18,scale=1280:-1:flags=lanczos" "$RAW/desktop/frame_%04d.png"
echo "=== slice mobile (9fps, 720w) ==="
"$FF" -hide_banner -loglevel error -i "$MP4" -vf "fps=9,scale=720:-1:flags=lanczos" "$RAW/mobile/frame_%04d.png"
echo "desktop raw: $(ls "$RAW/desktop" | wc -l)  mobile raw: $(ls "$RAW/mobile" | wc -l)"

echo "=== matte desktop (rembg isnet-general-use, keeps fine parts) ==="
rembg p -m isnet-general-use "$RAW/desktop" "$CUT/desktop"
echo "=== matte mobile ==="
rembg p -m isnet-general-use "$RAW/mobile" "$CUT/mobile"

echo "=== webp-alpha desktop ==="
for f in "$CUT/desktop"/*.png; do cwebp -quiet -q 86 -alpha_q 92 "$f" -o "$OUTD/$(basename "${f%.png}").webp"; done
echo "=== webp-alpha mobile ==="
for f in "$CUT/mobile"/*.png; do cwebp -quiet -q 86 -alpha_q 92 "$f" -o "$OUTM/$(basename "${f%.png}").webp"; done

echo "=== RESULT ==="
echo "desktop: $(ls "$OUTD" | wc -l) webp, $(du -sh "$OUTD" | cut -f1)"
echo "mobile:  $(ls "$OUTM" | wc -l) webp, $(du -sh "$OUTM" | cut -f1)"
rm -rf "$RAW" "$CUT"
echo "DONE"
