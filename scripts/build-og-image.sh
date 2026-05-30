#!/usr/bin/env bash
# Build public/og-image.png — 1200x630 social card.
# Requires: ImageMagick 7 (magick command). Uses system Helvetica
# (closest available match to Inter Tight without bundling a font).
set -euo pipefail

cd "$(dirname "$0")/.."

PAPER="#F4F1EC"
INK="#111114"
ACCENT="#E25A3C"
SECONDARY="#5b5b62"
TERTIARY="#86868b"

OUT="public/og-image.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Two soft coral orbs, blurred for depth.
magick -size 1200x630 canvas:none \
  -fill "$ACCENT" -draw "circle 120,120 380,120" \
  -blur 0x60 \
  -channel A -evaluate Multiply 0.55 +channel \
  "$TMP/orb1.png"

magick -size 1200x630 canvas:none \
  -fill "$ACCENT" -draw "circle 1080,560 1320,560" \
  -blur 0x60 \
  -channel A -evaluate Multiply 0.45 +channel \
  "$TMP/orb2.png"

# Pivot mark transformed by SVG (translate 96,156) and (scale 1.05).
# x_c = 96 + 1.05*x_svg, y_c = 156 + 1.05*y_svg
#   First L  : 40,40 110,40 110,60 60,60 60,150 40,150  -> 138,198 211,198 211,219 159,219 159,314 138,314
#   Second L : 160,160 90,160 90,140 140,140 140,50 160,50 -> 264,324 191,324 191,303 243,303 243,209 264,209
#   Square   : 92,92 -> 109,164 -> 16*1.05 = 17 wide/tall
magick -size 1200x630 canvas:"$PAPER" \
  "$TMP/orb1.png" -composite \
  "$TMP/orb2.png" -composite \
  -fill "$INK" \
  -draw "polygon 138,198 211,198 211,219 159,219 159,314 138,314" \
  -draw "polygon 264,324 191,324 191,303 243,303 243,209 264,209" \
  -fill "$ACCENT" \
  -draw "rectangle 193,253 210,270" \
  "$TMP/base.png"

# Wordmark — "Gerente" in Helvetica Bold, tight tracking.
magick "$TMP/base.png" \
  -font Helvetica-Bold -pointsize 132 -fill "$INK" -kerning -4 \
  -gravity NorthWest -annotate +290+182 "Gerente" \
  "$TMP/with-wordmark.png"

# Tagline (two lines) + author byline.
magick "$TMP/with-wordmark.png" \
  -font Helvetica -pointsize 42 -fill "$SECONDARY" -kerning -0.5 \
  -gravity NorthWest \
  -annotate +98+390 "A focused task manager with workspaces," \
  -annotate +98+444 "priorities, and a built-in Pomodoro timer." \
  -font Helvetica-Bold -pointsize 22 -fill "$TERTIARY" -kerning 4 \
  -annotate +98+548 "BUILT BY RIAN FERNANDO" \
  -depth 8 -strip \
  "$OUT"

echo "Wrote $OUT"
identify "$OUT"
ls -lh "$OUT" | awk '{print "Size:", $5}'
