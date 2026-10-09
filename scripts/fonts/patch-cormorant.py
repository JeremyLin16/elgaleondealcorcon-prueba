"""Builds the display font files in app/_fonts/ (Cormorant Garamond 500).

    python3 -I scripts/fonts/patch-cormorant.py <dir with the @fontsource files>

Why a local copy instead of next/font/google: in the roman (upright) style,
Cormorant's "á" carries its acute over the left half of the letter, so
"Milán" and "Página" read as if the accent belonged to the previous letter.
The other acutes (é í ó ú, capitals) and the italic are fine. This script moves
the accent of "aacute" 50 font units to the right, the offset the other
lowercase acutes already have. Nothing else in the font changes.

Source files: the latin subset of @fontsource/cormorant-garamond 5.3.0
(Cormorant Garamond version 4.001, the same version Google Fonts serves):

    npm pack @fontsource/cormorant-garamond@5.3.0 && tar -xzf fontsource-cormorant-garamond-5.3.0.tgz
    python3 -I scripts/fonts/patch-cormorant.py package/files

Writes:
- app/_fonts/cormorant-garamond-500.woff2 (patched "á")
- app/_fonts/cormorant-garamond-500-italic.woff2 (copied unchanged)
The fonts are under the SIL Open Font License 1.1 (app/_fonts/OFL.txt), which
allows modified versions; Cormorant declares no Reserved Font Name.
Requires fontTools and brotli (pip install fonttools brotli).
"""

import os
import shutil
import sys

from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "app", "_fonts")

# Measured on version 4.001: aacute's accent spans x 198-320 over an "a" of
# 51-424, i.e. +21 units from the letter's centre, while é, ó and ú sit +39
# to +71 units right. +50 puts it in line with them (checked on renders of
# "Página", "Milán", "café", "cómo" at 22-64 px).
AACUTE_SHIFT = 50


def patch_aacute(font: TTFont) -> None:
    glyf = font["glyf"]
    base = glyf["a"]
    accented = glyf["aacute"]
    if base.isComposite() or accented.isComposite():
        sys.exit("unexpected composite glyphs: the font version changed, re-measure")
    coords, ends, _ = accented.getCoordinates(glyf)
    base_contours = base.numberOfContours
    if accented.numberOfContours != base_contours + 1:
        sys.exit("aacute is not 'a' plus one accent contour: re-measure")
    first_accent_point = ends[base_contours - 1] + 1
    points = [tuple(p) for p in coords]
    for i in range(first_accent_point, len(points)):
        x, y = points[i]
        points[i] = (x + AACUTE_SHIFT, y)
    accented.coordinates = type(accented.coordinates)(points)
    accented.recalcBounds(glyf)

    # Say in the font itself that this is a modified version (OFL section 2).
    name = font["name"]
    version = name.getDebugName(5) or ""
    name.setName(f"{version}; El Galeón de Alcorcón: aacute accent moved +{AACUTE_SHIFT}", 5, 3, 1, 0x409)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)

    roman = TTFont(os.path.join(src, "cormorant-garamond-latin-500-normal.woff2"))
    if roman["name"].getDebugName(5) != "Version 4.001":
        sys.exit("expected Cormorant Garamond version 4.001: re-measure AACUTE_SHIFT first")
    patch_aacute(roman)
    roman.flavor = "woff2"
    roman.save(os.path.join(OUT, "cormorant-garamond-500.woff2"))

    shutil.copyfile(
        os.path.join(src, "cormorant-garamond-latin-500-italic.woff2"),
        os.path.join(OUT, "cormorant-garamond-500-italic.woff2"),
    )
    print("wrote", OUT)


if __name__ == "__main__":
    main()
