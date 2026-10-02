"""
Finds the blossom "mount points" on the bare cherry tree illustration and
writes them to src/assets/cherry-tree-mounts.json, for the cherry tree home
scene (src/components/CherryTree.tsx).

Run again whenever the tree art changes:

    pip install pillow numpy scikit-image scipy
    python scripts/tree-mounts.py [--preview out.png]

How: the branches are everything clearly darker than the paper. Their
skeleton (centre lines), weighted by how thin the branch is there, gives the
candidate spots; blossoms grow on twigs and smaller branches, not on the
trunk. A greedy pass over them in random order keeps only spots at least
MIN_SPACING apart, so blossoms cover the tree evenly instead of clumping.
Each spot also gets the branch's local direction, so leaves can sprout off it
at a sensible angle.
"""

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/cherry-tree.jpg"
OUT = ROOT / "src/assets/cherry-tree-mounts.json"

# Paper is ~240 luminance; ink and bark are well below.
BRANCH_LUM = 215
# Half-width (px) above which a branch counts as a bough/trunk: no blossoms.
MAX_HALF_WIDTH = 9
# Nothing lower than this (the bare trunk and roots).
MAX_Y = 1180
# Minimum distance between two mount points, in image px.
MIN_SPACING = 15


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    rgb = np.asarray(img).astype(int)
    lum = (rgb[..., 0] * 299 + rgb[..., 1] * 587 + rgb[..., 2] * 114) // 1000

    mask = ndimage.binary_opening(lum < BRANCH_LUM, iterations=1)
    mask = ndimage.binary_closing(mask, iterations=2)
    half_width = ndimage.distance_transform_edt(mask)
    skeleton = skeletonize(mask)

    ys, xs = np.nonzero(skeleton)
    keep = (half_width[ys, xs] <= MAX_HALF_WIDTH) & (ys < MAX_Y)
    ys, xs = ys[keep], xs[keep]

    # Local branch direction from the skeleton's neighbourhood (principal axis).
    sk_ys, sk_xs = np.nonzero(skeleton)
    sk_set = set(zip(sk_ys.tolist(), sk_xs.tolist()))

    def direction(y: int, x: int) -> float:
        pts = [
            (yy, xx)
            for yy in range(y - 6, y + 7)
            for xx in range(x - 6, x + 7)
            if (yy, xx) in sk_set
        ]
        if len(pts) < 3:
            return 0.0
        a = np.array(pts, dtype=float)
        a -= a.mean(0)
        _, vecs = np.linalg.eigh(a.T @ a)
        dy, dx = vecs[:, -1]
        return math.atan2(dy, dx)

    rng = np.random.default_rng(7)
    order = rng.permutation(len(xs))
    cell = MIN_SPACING
    grid: dict[tuple[int, int], list[tuple[int, int]]] = {}
    mounts: list[list[float]] = []
    for i in order:
        x, y = int(xs[i]), int(ys[i])
        gx, gy = x // cell, y // cell
        clash = any(
            (x - px) ** 2 + (y - py) ** 2 < MIN_SPACING**2
            for ox in (-1, 0, 1)
            for oy in (-1, 0, 1)
            for px, py in grid.get((gx + ox, gy + oy), [])
        )
        if clash:
            continue
        grid.setdefault((gx, gy), []).append((x, y))
        mounts.append([x, y, round(direction(y, x), 2)])

    # Stable, readable output: top to bottom, left to right. The scene picks
    # its own seeded order to grow them in.
    mounts.sort(key=lambda m: (m[1], m[0]))
    OUT.write_text(
        json.dumps(
            {"width": img.width, "height": img.height, "mounts": mounts},
            separators=(",", ":"),
        )
        + "\n"
    )
    print(f"{len(mounts)} mount points -> {OUT.relative_to(ROOT)}")

    if "--preview" in sys.argv:
        preview = img.copy()
        draw = ImageDraw.Draw(preview)
        for x, y, _ in mounts:
            draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(236, 120, 160))
        preview.save(sys.argv[sys.argv.index("--preview") + 1])


if __name__ == "__main__":
    main()
