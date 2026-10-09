"""Builds the site's photos: public/images/*.webp + lib/images.json.

    python3 -I scripts/images/photos.py

Reads the originals in scripts/images/originals/ (never served) and writes
pre-optimised WebP files, because Cloudflare Workers serves images as they are
(images.unoptimized in next.config.ts). public/images/ is generated: change
this script, not the files. Requires Pillow and NumPy.

What it does and why:
- Hero (pulpo): 4:5 crop, the only truly high-resolution photo.
- Kitchen dishes: one 4:3 crop for all of them, so the gallery is a grid of
  identical frames with no per-photo sizes in the CSS. One shared colour grade
  so photos taken in different light hang together as a series.
- Colour grading is baked into the files instead of CSS filters (no runtime
  paint cost on phones). vino.png has a cyan back-light, the only cool colour
  on the page: it is desaturated and warmed. The brownie's white plate is
  toned down so it does not glare on the dark page.
- Several widths per photo when the original allows it, for srcset. A photo
  is never exported wider than its original: the largest width in
  lib/images.json is the most CSS pixels it may ever be displayed at.
"""

import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "scripts", "images", "originals")
OUT = os.path.join(ROOT, "public", "images")
MANIFEST = os.path.join(ROOT, "lib", "images.json")
QUALITY = 80


# --- CSS filter functions as sRGB colour matrices (Filter Effects spec), so a
# grade designed in the browser can be reproduced exactly here.
def saturate(s):
    return np.array([
        [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
        [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
        [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
    ]), 0.0


def sepia(a):
    k = 1 - a
    return np.array([
        [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k],
        [0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k],
        [0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k],
    ]), 0.0


def brightness(b):
    return np.eye(3) * b, 0.0


def contrast(c):
    return np.eye(3) * c, 0.5 - 0.5 * c


def grade(im, *steps):
    px = np.asarray(im, dtype=np.float64) / 255.0
    for matrix, offset in steps:
        px = np.clip(px @ matrix.T + offset, 0.0, 1.0)
    return Image.fromarray(np.round(px * 255).astype(np.uint8), "RGB")


# vino: warm sepia grade, so the bar photo matches the dark green page.
VINO_GRADE = (saturate(0.35), sepia(0.4), saturate(1.25), brightness(0.92), contrast(1.06))
# Kitchen gallery: one grade for the whole series.
DISH_GRADE = (saturate(0.86), contrast(1.03))
BROWNIE_GRADE = DISH_GRADE + (brightness(0.9),)


def crop_to(im, ratio_w, ratio_h, focus_x=0.5, focus_y=0.5):
    """Largest crop with an exact ratio_w:ratio_h ratio, centred on focus."""
    unit = min(im.width // ratio_w, im.height // ratio_h)
    w, h = unit * ratio_w, unit * ratio_h
    x = round((im.width - w) * focus_x)
    y = round((im.height - h) * focus_y)
    return im.crop((x, y, x + w, y + h))


def export(name, im, widths):
    """Saves one WebP per width (never wider than the crop) and returns the variants."""
    variants = []
    for width in sorted({min(w, im.width) for w in widths}):
        height = round(im.height * width / im.width)
        out = im if width == im.width else im.resize((width, height), Image.LANCZOS)
        filename = f"{name}-{width}.webp"
        out.save(os.path.join(OUT, filename), "WEBP", quality=QUALITY, method=6)
        size_kb = os.path.getsize(os.path.join(OUT, filename)) / 1024
        print(f"  {filename:24} {width}x{height}  {size_kb:5.0f} KB")
        if size_kb > 300:
            sys.exit(f"{filename} is over 300 KB: lower QUALITY or the width")
        variants.append({"src": f"/images/{filename}", "width": width, "height": height})
    return variants


def load(filename):
    return Image.open(os.path.join(SRC, filename)).convert("RGB")


# name: (original, crop ratio or None, focus, grade, widths)
PHOTOS = {
    "pulpo": ("pulpo.jpg", (4, 5), (0.46, 0.5), (), (700, 1100, 1364)),
    "vino": ("vino.png", None, None, VINO_GRADE, (640, 1000)),
    "huevoroto": ("huevoroto.jpg", (4, 3), (0.5, 0.5), DISH_GRADE, (480, 840)),
    "anchoa": ("anchoa.jpg", (4, 3), (0.5, 0.5), DISH_GRADE, (480, 840)),
    "ternera": ("ternera.png", (4, 3), (0.5, 0.5), DISH_GRADE, (480, 840)),
    # 545 px wide originals: one size only, they cannot be enlarged.
    "chuleton": ("chuleton.jpg", (4, 3), (0.55, 0.5), DISH_GRADE, (484,)),
    "alcachofa": ("alcachofa.jpg", (4, 3), (0.5, 0.5), DISH_GRADE, (484,)),
    "brownie": ("brownie.jpg", (4, 3), (0.5, 0.5), BROWNIE_GRADE, (484,)),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for stale in os.listdir(OUT):
        if stale.endswith(".webp"):
            os.remove(os.path.join(OUT, stale))
    manifest = {}
    for name, (filename, ratio, focus, steps, widths) in PHOTOS.items():
        im = load(filename)
        if ratio:
            im = crop_to(im, *ratio, *focus)
        if steps:
            im = grade(im, *steps)
        manifest[name] = export(name, im, widths)
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print(f"wrote {os.path.relpath(MANIFEST, ROOT)}")


if __name__ == "__main__":
    main()
