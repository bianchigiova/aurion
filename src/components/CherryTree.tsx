import { useEffect, useMemo, useRef, useState } from "react";
import treeUrl from "../assets/cherry-tree.jpg";
import treeData from "../assets/cherry-tree-mounts.json";
import { getTreeFallsSeen, setTreeFallsSeen } from "../lib/prefs";
import {
  growTree,
  type Blossom,
  type FallenBlossom,
  type Leaf,
  type Mount,
} from "../lib/tree";
import type { SceneProps } from "../scenes";

/** Natural size of cherry-tree.jpg; mount points are in its pixels. */
const IMAGE_W = treeData.width;
const IMAGE_H = treeData.height;
const MOUNTS = treeData.mounts as Mount[];

/** A blossom's width, and a leaf's length, in the tree image's pixels. */
const BLOSSOM_SIZE = 31;
const LEAF_SIZE = 20;
/** Fallen blossoms are seen side-on, lying on the ground: squashed this much. */
const GROUND_SQUASH = 0.62;

/** Little is moving; 30fps is plenty and halves the battery cost. */
const FRAME_MS = 1000 / 30;

/** Today's blossom blooms each time the app is opened — a bud swells, bursts
 *  open with a ripple and a few sparks, and settles — after a short pause to
 *  let the screen settle, over this long. */
const BIRTH_DELAY_MS = 700;
const BIRTH_MS = 3_200;
/** Within that, when the bud bursts open, and when the burst is at its
 *  biggest (from there it settles to its normal size). */
const BURST_AT = 0.32;
const BURST_PEAK = 0.55;
/** How big the blossom gets at the burst's peak, and on each later pulse. */
const BURST_SIZE = 1.9;
const PULSE_SIZE = 1.45;
/** After that it keeps catching the eye: a swell and a ripple this often... */
const PULSE_EVERY_MS = 10_000;
/** ...lasting this long. */
const PULSE_MS = 2_000;
/** Sparks thrown out by the burst. */
const SPARK_COUNT = 9;

/** A blossom that fell since the tree was last on screen falls again, once,
 *  for the user to see: this long after opening, taking this long... */
const FALL_DELAY_MS = 900;
const FALL_MS = 5_000;
/** ...one after the other, if there are several... */
const FALL_STAGGER_MS = 1_400;
/** ...though no more than this many (the most recent); older ones are just
 *  already down. */
const MAX_FALLS_SHOWN = 5;

/**
 * Full-screen cherry tree: the bare tree illustration with one blossom per day
 * of the journey on its branches, and one fallen blossom on the ground per
 * relapse (see lib/tree). Everything settled is painted once per resize on a
 * static canvas; the newest blossom and any blossom still falling are drawn
 * on a live one every frame.
 */
export default function CherryTree({
  journeyStartISO,
  days,
  relapseISOs,
}: SceneProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const tree = useMemo(
    () => growTree(journeyStartISO, days, relapseISOs, MOUNTS.length),
    [journeyStartISO, days, relapseISOs],
  );

  // Falls the user hasn't seen yet: read once, so a re-render (the day
  // rolling over) doesn't replay them. Nothing on the tree's first showing —
  // anything already down simply is.
  const [unseenFrom] = useState(
    () => getTreeFallsSeen() ?? tree.fallen.length,
  );
  const fallStarts = useRef(new Map<string, number>());
  useEffect(() => {
    setTreeFallsSeen(tree.fallen.length);
  }, [tree.fallen.length]);

  useEffect(() => {
    const image = imageRef.current;
    const staticCanvas = staticRef.current;
    const liveCanvas = liveRef.current;
    const staticCtx = staticCanvas?.getContext("2d");
    const liveCtx = liveCanvas?.getContext("2d");
    if (!image || !staticCanvas || !liveCanvas || !staticCtx || !liveCtx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // The newest growth on the tree blooms on every opening, like the night
    // sky's newest star — even on a day that took one away, so it's always
    // clear where the tree is growing from.
    const newestLeaf =
      !reduceMotion && tree.leaves.length > 0
        ? tree.leaves[tree.leaves.length - 1]
        : null;
    const newestBlossom =
      !reduceMotion && !newestLeaf && tree.blossoms.length > 0
        ? tree.blossoms[tree.blossoms.length - 1]
        : null;
    const blossoms = newestBlossom ? tree.blossoms.slice(0, -1) : tree.blossoms;
    const leaves = newestLeaf ? tree.leaves.slice(0, -1) : tree.leaves;

    const now0 = performance.now();
    const falling: FallenBlossom[] = [];
    if (!reduceMotion) {
      const unseen = tree.fallen.slice(
        Math.max(unseenFrom, tree.fallen.length - MAX_FALLS_SHOWN),
      );
      unseen.forEach((f, i) => {
        if (!fallStarts.current.has(f.relapseISO)) {
          fallStarts.current.set(
            f.relapseISO,
            now0 + FALL_DELAY_MS + i * FALL_STAGGER_MS,
          );
        }
      });
      for (const f of tree.fallen) {
        if (fallStarts.current.has(f.relapseISO)) falling.push(f);
      }
    }
    const fallen = tree.fallen
      .filter((f) => !falling.includes(f))
      .sort((a, b) => a.y - b.y);

    let width = 0;
    let height = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    const toScreen = (x: number, y: number): [number, number] => [
      offsetX + x * scale,
      offsetY + y * scale,
    ];

    const resize = () => {
      const rect = liveCanvas.getBoundingClientRect();
      const box = image.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = rect.width;
      height = rect.height;
      // Same geometry as the <img>'s `object-fit: cover` anchored to the
      // bottom centre. The <img> stops short of the bottom of the screen (see
      // .scene--tree in styles.css), the canvases don't.
      scale = Math.max(box.width / IMAGE_W, box.height / IMAGE_H);
      offsetX = box.left - rect.left + (box.width - IMAGE_W * scale) / 2;
      offsetY = box.top - rect.top + box.height - IMAGE_H * scale;

      for (const [canvas, ctx] of [
        [staticCanvas, staticCtx],
        [liveCanvas, liveCtx],
      ] as const) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      staticCtx.clearRect(0, 0, width, height);
      for (const f of fallen) {
        const [x, y] = toScreen(f.x, f.y);
        drawBlossom(staticCtx, singleOf(f.look), x, y, scale, {
          squash: GROUND_SQUASH,
          faded: true,
        });
      }
      for (const leaf of leaves) drawLeaf(staticCtx, leaf, toScreen, scale, 1);
      for (const b of blossoms) {
        const [x, y] = toScreen(MOUNTS[b.mount][0], MOUNTS[b.mount][1]);
        drawBlossom(staticCtx, b, x, y, scale);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(liveCanvas);

    // The first resize() above most likely painted before the blossom art
    // arrived (it skips sprites still loading): paint again once it's here.
    let cancelled = false;
    loadBlossoms().then(() => {
      if (!cancelled) resize();
    });

    if (!newestLeaf && !newestBlossom && falling.length === 0) {
      return () => {
        cancelled = true;
        observer.disconnect();
      };
    }

    let birthStart = now0 + BIRTH_DELAY_MS;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        birthStart = performance.now() + BIRTH_DELAY_MS;
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    let raf = 0;
    let lastFrame = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      liveCtx.clearRect(0, 0, width, height);

      for (const f of falling) {
        drawFall(liveCtx, f, (now - fallStarts.current.get(f.relapseISO)!) / FALL_MS, toScreen, scale);
      }

      const bloom = bloomPhase(now - birthStart);
      if (newestLeaf) {
        // Leaves just unfurl: no bud, but the same burst and settle.
        const [mx, my] = MOUNTS[newestLeaf.mount];
        const [x, y] = toScreen(mx, my);
        drawBloomEffects(liveCtx, bloom, x, y, LEAF_SIZE * scale);
        if (bloom.size > 0) drawLeaf(liveCtx, newestLeaf, toScreen, scale, bloom.size);
      }
      if (newestBlossom) {
        const [mx, my] = MOUNTS[newestBlossom.mount];
        const [x, y] = toScreen(mx, my);
        const s = BLOSSOM_SIZE * newestBlossom.scale * scale;
        drawBloomEffects(liveCtx, bloom, x, y, s);
        if (bloom.bud > 0) drawBud(liveCtx, x, y, s * bloom.bud, bloom.spin);
        if (bloom.size > 0) {
          drawBlossom(liveCtx, newestBlossom, x, y, scale, {
            size: bloom.size,
            spin: bloom.spin,
          });
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      observer.disconnect();
    };
  }, [tree, unseenFrom]);

  return (
    <div className="scene scene--tree" aria-hidden="true">
      <img ref={imageRef} src={treeUrl} alt="" />
      <canvas ref={staticRef} />
      <canvas ref={liveRef} />
    </div>
  );
}

interface Bloom {
  /** The closed bud's size, as a fraction of the blossom's (0: no bud). */
  bud: number;
  /** The blossom's size multiplier (0: not open yet). */
  size: number;
  /** How far it's still turning, radians. */
  spin: number;
  /** Strength of the soft glow behind it, 0..1. */
  glow: number;
  /** Progress 0..1 of the ripple spreading out from it, if there is one. */
  ripple: number | null;
  /** How far the ripple reaches, in blossom widths. */
  rippleReach: number;
  /** Progress 0..1 of the sparks flying out, if there are any. */
  sparks: number | null;
}

const NO_BLOOM: Bloom = {
  bud: 0,
  size: 0,
  spin: 0,
  glow: 0,
  ripple: null,
  rippleReach: 0,
  sparks: null,
};

/**
 * Where today's growth is in its routine, `age` ms after it started blooming:
 * not there yet; a bud swelling (with a little wobble); bursting open, past
 * its normal size, with a ripple and sparks; settling back; then resting,
 * with a swell and a smaller ripple every PULSE_EVERY_MS.
 */
function bloomPhase(age: number): Bloom {
  if (age < 0) return NO_BLOOM;
  if (age < BIRTH_MS) {
    const p = age / BIRTH_MS;
    if (p < BURST_AT) {
      const q = p / BURST_AT;
      return {
        ...NO_BLOOM,
        bud: 0.65 * (1 - Math.pow(1 - q, 3)),
        spin: Math.sin(q * Math.PI * 5) * 0.25 * q,
        glow: 0.5 * q,
      };
    }
    const after = (p - BURST_AT) / (1 - BURST_AT);
    let size: number;
    if (p < BURST_PEAK) {
      const q = (p - BURST_AT) / (BURST_PEAK - BURST_AT);
      size = 0.3 + (BURST_SIZE - 0.3) * easeOutBack(q);
    } else {
      const q = (p - BURST_PEAK) / (1 - BURST_PEAK);
      size = BURST_SIZE + (1 - BURST_SIZE) * (q * q * (3 - 2 * q));
    }
    return {
      bud: 0,
      size,
      spin: -0.9 * Math.pow(1 - after, 3),
      glow: Math.pow(1 - after, 2),
      ripple: Math.min(1, after / 0.7),
      rippleReach: 3.4,
      sparks: Math.min(1, after / 0.65),
    };
  }
  const sinceBirth = (age - BIRTH_MS) % PULSE_EVERY_MS;
  const pulseAt = PULSE_EVERY_MS - PULSE_MS;
  if (sinceBirth < pulseAt) return { ...NO_BLOOM, size: 1 };
  const q = (sinceBirth - pulseAt) / PULSE_MS;
  const swell = Math.pow(Math.sin(Math.PI * q), 2);
  return {
    ...NO_BLOOM,
    size: 1 + (PULSE_SIZE - 1) * swell,
    glow: 0.7 * swell,
    ripple: Math.min(1, q / 0.8),
    rippleReach: 2.4,
  };
}

function easeOutBack(p: number): number {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
}

// ---------- Drawing ----------

/** Procedural sprites (leaf, glow) are drawn once at this size and scaled
 *  down on draw. */
const SPRITE_SIZE = 96;

/** The painted blossoms, cut from the sakura sheet by
 *  scripts/blossom-sprites.py, in its reading order. */
const blossomModules = import.meta.glob<string>("../assets/blossoms/*.png", {
  eager: true,
  import: "default",
});
const blossomUrls = Object.keys(blossomModules)
  .sort()
  .map((key) => blossomModules[key]);

/** Which of them are a lone flower, without buds or neighbours: what comes
 *  off the tree and lies on the ground is always one of these. */
const SINGLE_BLOSSOMS = [0, 6, 12];

const blossomImages: HTMLImageElement[] = [];
const fadedBlossoms = new Map<number, HTMLCanvasElement>();

/** Starts every blossom sprite loading (once), and resolves when they've all
 *  arrived. */
function loadBlossoms(): Promise<unknown> {
  if (blossomImages.length === 0) {
    for (const url of blossomUrls) {
      const img = new Image();
      img.src = url;
      blossomImages.push(img);
    }
  }
  return Promise.all(blossomImages.map((img) => img.decode().catch(() => {})));
}

function blossomSprite(
  variant: number,
  faded: boolean,
): HTMLImageElement | HTMLCanvasElement | null {
  const img = blossomImages[variant % blossomImages.length];
  if (!img || !img.complete || img.naturalWidth === 0) return null;
  return faded ? fadedBlossom(variant % blossomImages.length, img) : img;
}

/** A blossom that's been lying on the ground a while: a little paler and
 *  duller. Done on the pixels once, since canvas filters aren't everywhere. */
function fadedBlossom(index: number, img: HTMLImageElement): HTMLCanvasElement {
  let canvas = fadedBlossoms.get(index);
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const grey = (px[i] + px[i + 1] + px[i + 2]) / 3;
    for (let c = 0; c < 3; c++) {
      const muted = px[i + c] + (grey - px[i + c]) * 0.25;
      px[i + c] = muted + (250 - muted) * 0.1;
    }
  }
  ctx.putImageData(data, 0, 0);
  fadedBlossoms.set(index, canvas);
  return canvas;
}

/** The blossom that comes off the tree for a fall: a lone flower from the
 *  spot's cluster. */
function singleOf(blossom: Blossom): Blossom {
  return {
    ...blossom,
    variant: SINGLE_BLOSSOMS[blossom.variant % SINGLE_BLOSSOMS.length],
  };
}

let leafSpriteCanvas: HTMLCanvasElement | null = null;

/** A leaf pointing right, its stalk at the left edge's middle. */
function leafSprite(): HTMLCanvasElement {
  if (leafSpriteCanvas) return leafSpriteCanvas;
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE / 2;
  const ctx = canvas.getContext("2d")!;
  const w = SPRITE_SIZE;
  const h = SPRITE_SIZE / 2;
  const fill = ctx.createLinearGradient(0, 0, 0, h);
  fill.addColorStop(0, "#b3c785");
  fill.addColorStop(1, "#6f8c46");
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#4d662e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, h / 2);
  ctx.quadraticCurveTo(w * 0.45, -h * 0.12, w - 4, h / 2);
  ctx.quadraticCurveTo(w * 0.45, h * 1.12, 4, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, h / 2);
  ctx.lineTo(w * 0.8, h / 2);
  ctx.stroke();
  leafSpriteCanvas = canvas;
  return canvas;
}

let glowSpriteCanvas: HTMLCanvasElement | null = null;

function glowSprite(): HTMLCanvasElement {
  if (glowSpriteCanvas) return glowSpriteCanvas;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d")!;
  const r = SPRITE_SIZE / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  // Pink, not white: white would vanish into the paper.
  g.addColorStop(0, "rgba(255,190,212,0.85)");
  g.addColorStop(0.4, "rgba(240,140,175,0.35)");
  g.addColorStop(1, "rgba(240,140,175,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  glowSpriteCanvas = canvas;
  return canvas;
}

function drawBlossom(
  ctx: CanvasRenderingContext2D,
  blossom: Blossom,
  x: number,
  y: number,
  scale: number,
  {
    size = 1,
    spin = 0,
    squash = 1,
    faded = false,
  }: { size?: number; spin?: number; squash?: number; faded?: boolean } = {},
) {
  const s = BLOSSOM_SIZE * blossom.scale * scale * size;
  const sprite = blossomSprite(blossom.variant, faded);
  if (s <= 0 || !sprite) return;
  ctx.save();
  ctx.translate(x, y);
  // Squash vertically on screen (lying flat), not along the petals.
  ctx.scale(1, squash);
  ctx.rotate(blossom.rotation + spin);
  // Fit the sprite's longer side to the blossom's size.
  const k = s / Math.max(sprite.width, sprite.height);
  const w = sprite.width * k;
  const h = sprite.height * k;
  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  leaf: Leaf,
  toScreen: (x: number, y: number) => [number, number],
  scale: number,
  size: number,
) {
  const [mx, my, branch] = MOUNTS[leaf.mount];
  // Branch directions are lines, not arrows: pick the end that points up, so
  // leaves reach outwards and up rather than drooping.
  const along = Math.sin(branch) > 0 ? branch + Math.PI : branch;
  const angle = along + leaf.side * leaf.splay;
  const [x, y] = toScreen(mx, my);
  const len = LEAF_SIZE * leaf.scale * scale * size;
  if (len <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(leafSprite(), 0, -len / 4, len, len / 2);
  ctx.restore();
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
) {
  if (alpha <= 0.001) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite(), x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

/**
 * The glow, ripple and sparks around a blossom (or leaf) `s` wide at (x, y)
 * as it blooms: everything but the blossom itself.
 */
function drawBloomEffects(
  ctx: CanvasRenderingContext2D,
  bloom: Bloom,
  x: number,
  y: number,
  s: number,
) {
  drawGlow(ctx, x, y, s * 1.8, bloom.glow);

  if (bloom.ripple !== null && bloom.ripple < 1) {
    const q = bloom.ripple;
    const r = s * (0.5 + (bloom.rippleReach - 0.5) * (1 - Math.pow(1 - q, 2)));
    ctx.globalAlpha = 0.75 * Math.pow(1 - q, 1.5);
    ctx.strokeStyle = "#e0628a";
    ctx.lineWidth = 0.6 + 1.8 * (1 - q);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (bloom.sparks !== null && bloom.sparks < 1) {
    const q = bloom.sparks;
    const travel = 1 - Math.pow(1 - q, 3);
    const fade = 1 - q;
    for (let i = 0; i < SPARK_COUNT; i++) {
      // Evenly round, nudged a little so it doesn't look stamped out.
      const a = (i / SPARK_COUNT) * Math.PI * 2 + (i % 2) * 0.35;
      const reach = s * (0.5 + travel * (i % 3 === 0 ? 2.6 : 2));
      // They sink a little as they go, like falling glitter.
      const sx = x + Math.cos(a) * reach;
      const sy = y + Math.sin(a) * reach + travel * travel * s * 0.5;
      ctx.globalAlpha = fade;
      drawSpark(ctx, sx, sy, Math.max(0.5, s * 0.22 * fade), i % 2 ? "#f2b632" : "#e0628a");
    }
    ctx.globalAlpha = 1;
  }
}

/** A four-pointed twinkle. */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  const w = r * 0.28;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + w, y - w, x + r, y);
  ctx.quadraticCurveTo(x + w, y + w, x, y + r);
  ctx.quadraticCurveTo(x - w, y + w, x - r, y);
  ctx.quadraticCurveTo(x - w, y - w, x, y - r);
  ctx.fill();
}

/** A closed bud `s` wide at (x, y): a plump pink teardrop in a green cup. */
function drawBud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  spin: number,
) {
  if (s <= 0.5) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  const h = s * 1.25;
  const body = ctx.createLinearGradient(-s / 2, -h / 2, s / 2, h / 2);
  body.addColorStop(0, "#fbd0dc");
  body.addColorStop(1, "#e2678e");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(s * 0.62, -h * 0.2, s * 0.5, h * 0.4, 0, h * 0.42);
  ctx.bezierCurveTo(-s * 0.5, h * 0.4, -s * 0.62, -h * 0.2, 0, -h / 2);
  ctx.fill();
  ctx.fillStyle = "#7d9a4b";
  ctx.beginPath();
  ctx.moveTo(-s * 0.36, h * 0.18);
  ctx.quadraticCurveTo(0, h * 0.75, s * 0.36, h * 0.18);
  ctx.quadraticCurveTo(0, h * 0.42, -s * 0.36, h * 0.18);
  ctx.fill();
  ctx.restore();
}

/**
 * A blossom coming off the tree, `p` running 0..1 over the fall (below 0 it's
 * still on its branch; past 1 it lies where it landed): it drifts down,
 * swaying side to side and tumbling, the way petals do, and comes to rest
 * flat on the ground.
 */
function drawFall(
  ctx: CanvasRenderingContext2D,
  fall: FallenBlossom,
  p: number,
  toScreen: (x: number, y: number) => [number, number],
  scale: number,
) {
  const [x0, y0] = MOUNTS[fall.from];
  if (p <= 0) {
    const [x, y] = toScreen(x0, y0);
    drawBlossom(ctx, fall.look, x, y, scale);
    return;
  }
  if (p >= 1) {
    const [x, y] = toScreen(fall.x, fall.y);
    drawBlossom(ctx, singleOf(fall.look), x, y, scale, {
      squash: GROUND_SQUASH,
      faded: true,
    });
    return;
  }

  // Quick to let go, then a steady drift down, easing into the landing.
  const drop = 0.35 * p * p + 0.65 * (p * p * (3 - 2 * p));
  const sway = Math.sin(p * Math.PI * 3.2) * 38 * (1 - 0.7 * p);
  const ix = x0 + (fall.x - x0) * p + sway;
  const iy = y0 + (fall.y - y0) * drop;
  const [x, y] = toScreen(ix, iy);
  const tumble = Math.abs(Math.cos(p * Math.PI * 4.5));
  const squash = p > 0.9 ? GROUND_SQUASH : 0.35 + 0.65 * tumble;
  drawBlossom(ctx, singleOf(fall.look), x, y, scale, {
    spin: p * Math.PI * 3,
    squash,
    faded: p > 0.85,
  });
}
