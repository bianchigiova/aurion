"""
Cuts the sakura sprite sheet (src/assets/cherry-tree-source/sakura-sheet.png)
into one small PNG per blossom, in src/assets/blossoms/, for the cherry tree
home scene (src/components/CherryTree.tsx).

Run again whenever the sheet changes:

    pip install pillow numpy scipy
    python scripts/blossom-sprites.py

The sheet's transparent background is sprinkled with faint specks; each
blossom is the solid shape found by thresholding the alpha, and only pixels
close to it are kept, so the specks don't come along. Sprites are numbered in
reading order (row by row, left to right) — CherryTree refers to the single,
budless flowers among them by number, so check those if the sheet's layout
changes.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/cherry-tree-source/sakura-sheet.png"
OUT_DIR = ROOT / "src/assets/blossoms"

# Alpha above this is part of a blossom; the specks are fainter.
SOLID_ALPHA = 128
# Anything smaller (in px of the sheet) is a speck, not a blossom.
MIN_AREA = 5_000
# Keep soft edges this many px beyond the solid shape.
EDGE_PX = 4
# Longest side of each output sprite. Blossoms are drawn at most ~40 device
# px wide (~50 while today's one swells), so this is plenty.
SPRITE_PX = 96


def main() -> None:
    sheet = np.asarray(Image.open(SRC).convert("RGBA"))
    alpha = sheet[..., 3]

    solid = ndimage.binary_closing(alpha >= SOLID_ALPHA, iterations=3)
    solid = ndimage.binary_fill_holes(solid)
    labels, count = ndimage.label(solid)
    boxes = ndimage.find_objects(labels)

    blobs = []
    for i, box in enumerate(boxes, start=1):
        area = int((labels[box] == i).sum())
        if area >= MIN_AREA:
            blobs.append((i, box))

    # Reading order: bucket into rows by vertical centre, then left to right.
    def centre(box):
        return ((box[0].start + box[0].stop) / 2, (box[1].start + box[1].stop) / 2)

    blobs.sort(key=lambda b: centre(b[1])[0])
    rows: list[list] = []
    for blob in blobs:
        cy = centre(blob[1])[0]
        if rows and abs(centre(rows[-1][0][1])[0] - cy) < 120:
            rows[-1].append(blob)
        else:
            rows.append([blob])
    ordered = [b for row in rows for b in sorted(row, key=lambda b: centre(b[1])[1])]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("blossom-*.png"):
        old.unlink()

    for n, (label, box) in enumerate(ordered, start=1):
        keep = ndimage.binary_dilation(labels == label, iterations=EDGE_PX)
        ys, xs = np.nonzero(keep)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = sheet[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(keep[y0:y1, x0:x1], crop[..., 3], 0)

        img = Image.fromarray(crop, "RGBA")
        img.thumbnail((SPRITE_PX, SPRITE_PX), Image.LANCZOS)
        # A 256-colour palette (alpha included) is indistinguishable at this
        # size and a fraction of the bytes.
        img = img.quantize(256, method=Image.Quantize.FASTOCTREE)
        img.save(OUT_DIR / f"blossom-{n:02d}.png", optimize=True)

    print(f"{len(ordered)} blossoms -> {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
