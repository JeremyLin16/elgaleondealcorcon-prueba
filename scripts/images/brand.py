"""Builds the brand assets: icons, the link-preview image and the logo.

    python3 -I scripts/images/brand.py <path to CormorantGaramond-600.ttf>

The font is only needed to draw the "G" monogram. Download it (SIL Open Font
License) with:

    curl -sS "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600" \\
      | grep -o 'https://[^)]*\\.ttf' | head -1 | xargs curl -sS -o /tmp/CormorantGaramond-600.ttf

Writes:
- app/icon.png (512), app/apple-icon.png (180), app/favicon.ico (16/32/48):
  Next.js adds the <link> tags for these automatically.
- public/icons/icon-192.png, icon-512.png, icon-maskable-512.png: web manifest.
- public/og-default.jpg: 1200x630 link preview (WhatsApp, Facebook, X...).
- public/logo.png: the gold logo, re-compressed; header, footer and the
  schema.org Organization logo (Google wants a raster of at least 112 px).
Requires Pillow.
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "scripts", "images", "originals")

# Keep in sync with lib/theme.ts (the site's palette), so the link preview
# looks like the site.
GREEN = (0, 55, 26)  # #00371a, green: brand primary
NIGHT = (8, 34, 21)  # #082215, night: page background
GLOW = (15, 63, 40)  # #0f3f28, glow: the green glow
MAT = (14, 53, 36)  # #0e3524, mat: around framed photos
GOLD = (207, 180, 133)  # #cfb485, gold: brand secondary


def monogram(size, font_path, scale=0.74):
    """Gold serif G centred on brand green. scale = glyph height / icon size.

    At 0.74 the glyph's ink stays inside the central 80% circle, the safe zone
    of maskable icons (Android crops icons to a circle or a squircle)."""
    big = size * 4  # draw large, then downsample: smoother curves
    im = Image.new("RGB", (big, big), GREEN)
    draw = ImageDraw.Draw(im)
    font = ImageFont.truetype(font_path, round(big * scale))
    left, top, right, bottom = draw.textbbox((0, 0), "G", font=font)
    x = (big - (right - left)) / 2 - left
    y = (big - (bottom - top)) / 2 - top
    draw.text((x, y), "G", font=font, fill=GOLD)
    return im.resize((size, size), Image.LANCZOS)


def save_png(im, *path):
    out = os.path.join(ROOT, *path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "PNG", optimize=True)
    print(f"  {os.path.join(*path):32} {im.width}x{im.height}  {os.path.getsize(out) / 1024:5.1f} KB")


def og_image(path):
    """Night-green background with the brand glow, the gold logo on the left
    and the pulpo hung on the right as a framed painting, as on the site."""
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), NIGHT)

    # Soft green glow behind the logo (not gold: gold gradients look cheap).
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((-80, 40, 720, 600), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    im = Image.composite(Image.new("RGB", (W, H), GLOW), im, glow)

    # Painting: 4:5 pulpo on a mat with a gold hairline.
    canvas_w, canvas_h = 400, 500
    pad = 14
    frame_x = W - 96 - (canvas_w + 2 * pad)
    frame_y = (H - (canvas_h + 2 * pad)) // 2
    draw = ImageDraw.Draw(im)
    draw.rectangle(
        (frame_x, frame_y, frame_x + canvas_w + 2 * pad - 1, frame_y + canvas_h + 2 * pad - 1),
        fill=MAT,
        outline=GOLD,
        width=1,
    )
    pulpo = Image.open(os.path.join(SRC, "pulpo.jpg")).convert("RGB")
    unit = min(pulpo.width // 4, pulpo.height // 5)
    cw, ch = unit * 4, unit * 5
    cx = round((pulpo.width - cw) * 0.46)
    pulpo = pulpo.crop((cx, (pulpo.height - ch) // 2, cx + cw, (pulpo.height - ch) // 2 + ch))
    im.paste(pulpo.resize((canvas_w, canvas_h), Image.LANCZOS), (frame_x + pad, frame_y + pad))

    # Logo, original size (442 px), centred in the free space on the left.
    logo = Image.open(os.path.join(SRC, "logo.png")).convert("RGBA")
    free = frame_x
    im.paste(logo, ((free - logo.width) // 2, (H - logo.height) // 2), logo)

    im.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    size_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.relpath(path, ROOT):32} {W}x{H}  {size_kb:5.1f} KB")
    if size_kb > 300:
        sys.exit("og-default.jpg is over 300 KB")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    font_path = sys.argv[1]

    save_png(monogram(512, font_path), "app", "icon.png")
    save_png(monogram(180, font_path), "app", "apple-icon.png")
    save_png(monogram(192, font_path), "public", "icons", "icon-192.png")
    save_png(monogram(512, font_path), "public", "icons", "icon-512.png")
    # Maskable: smaller glyph, the platform may crop up to 20% on each side.
    save_png(monogram(512, font_path, scale=0.6), "public", "icons", "icon-maskable-512.png")

    # favicon.ico: browsers request /favicon.ico on their own; a bigger glyph
    # stays legible at 16 px.
    ico = monogram(256, font_path, scale=0.86)
    ico_path = os.path.join(ROOT, "app", "favicon.ico")
    ico.save(ico_path, sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  {'app/favicon.ico':32} 16/32/48  {os.path.getsize(ico_path) / 1024:5.1f} KB")

    logo = Image.open(os.path.join(SRC, "logo.png"))
    save_png(logo, "public", "logo.png")

    og_image(os.path.join(ROOT, "public", "og-default.jpg"))


if __name__ == "__main__":
    main()
