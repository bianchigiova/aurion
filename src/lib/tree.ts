/**
 * Deterministic state of the cherry tree home scene: one blossom per day of
 * the journey, and one blossom falling to the ground per relapse.
 *
 * Blossoms grow on the tree's mount points (found by scripts/tree-mounts.py)
 * in an order shuffled by the journey seed, so the first few dozen are spread
 * over the whole crown instead of filling one branch at a time. The tree acts
 * like a stack along that order: with `n` blossoms on it, they sit on the
 * first `n` mount points. A relapse takes off the newest one, and the next
 * good day regrows a blossom in that same spot.
 *
 * A relapse when the tree is bare drops nothing. Once every mount point
 * carries a blossom the tree is full, and further days add leaves instead —
 * one per day, among the blossoms, until there's one by every blossom. In
 * that leafy stretch a relapse still drops a blossom to the ground, but the
 * tree is so full that it's the newest leaf that goes missing, not a blossom.
 *
 * Fallen blossoms stay on the ground for good, each at a spot fixed by its
 * relapse's timestamp, so earlier ones never move as more fall.
 */

import { calendarDaysBetween } from "./days";
import { hashString, mulberry32 } from "./random";

/** A mount point in the tree image's own pixels: position, and the branch's
 *  direction there (radians). */
export type Mount = [x: number, y: number, angle: number];

export interface Blossom {
  /** Index into the mount points. */
  mount: number;
  /** Which of the blossom sprites to draw. */
  variant: number;
  /** Radians. */
  rotation: number;
  /** Size multiplier. */
  scale: number;
}

export interface Leaf {
  /** Index into the mount points; the leaf sprouts beside it. */
  mount: number;
  /** Which side of the branch it grows on: -1 or 1. */
  side: -1 | 1;
  /** Radians, relative to the branch's own direction. */
  splay: number;
  scale: number;
}

export interface FallenBlossom {
  /** The relapse it fell for. */
  relapseISO: string;
  /** Where on the tree it fell from (to animate the fall). */
  from: number;
  /** Where it lies, in the tree image's pixels. */
  x: number;
  y: number;
  look: Blossom;
}

export interface TreeState {
  /** On the tree, oldest first; the last one is the newest. */
  blossoms: Blossom[];
  /** On the tree once it's full, oldest first. */
  leaves: Leaf[];
  /** On the ground, in the order they fell. */
  fallen: FallenBlossom[];
}

/** How many blossom sprites there are (src/assets/blossoms). */
export const BLOSSOM_VARIANTS = 20;

/** Where fallen blossoms gather: the ground around the base of the trunk, in
 *  the tree image's pixels. */
const GROUND_CENTER_X = 470;
const GROUND_SPREAD_X = 170;
const GROUND_MIN_X = 130;
const GROUND_MAX_X = 810;
const GROUND_TOP = 1545;
const GROUND_BOTTOM = 1598;
/** The trunk's foot: blossoms right in front of it lie further forward. */
const TRUNK_HALF_WIDTH = 85;
const TRUNK_FOOT = 1568;

/** Standard normal sample (Box–Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** The order the mount points fill in, shuffled by the journey seed. */
function growthOrder(seed: number, mountCount: number): number[] {
  const order = Array.from({ length: mountCount }, (_, i) => i);
  const rand = mulberry32(seed);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** How the blossom on a given mount point looks — the same every time it
 *  grows back there. */
function blossomAt(seed: number, mount: number): Blossom {
  const rand = mulberry32(seed ^ Math.imul(mount + 1, 0x9e3779b1));
  return {
    mount,
    variant: Math.floor(rand() * BLOSSOM_VARIANTS),
    // Only a little: the art is lit from the top left.
    rotation: (rand() - 0.5) * 1.2,
    scale: 0.82 + rand() * 0.36,
  };
}

function leafAt(seed: number, mount: number): Leaf {
  const rand = mulberry32((seed ^ 0x5bd1e995) ^ Math.imul(mount + 1, 0x85ebca6b));
  return {
    mount,
    side: rand() < 0.5 ? -1 : 1,
    splay: 0.6 + rand() * 0.6,
    scale: 0.85 + rand() * 0.3,
  };
}

function groundSpot(relapseISO: string): { x: number; y: number } {
  const rand = mulberry32(hashString(`fall:${relapseISO}`));
  let x: number;
  do {
    x = GROUND_CENTER_X + gaussian(rand) * GROUND_SPREAD_X;
  } while (x < GROUND_MIN_X || x > GROUND_MAX_X);
  const inFrontOfTrunk = Math.abs(x - GROUND_CENTER_X) < TRUNK_HALF_WIDTH;
  const top = inFrontOfTrunk ? TRUNK_FOOT : GROUND_TOP;
  return { x, y: top + rand() * (GROUND_BOTTOM - top) };
}

/**
 * The tree for a journey begun at `journeyStartISO`, `days` days in (the
 * lifetime count, not the current streak), with `relapseISOs` the complete
 * relapse history, oldest first. `mountCount` is how many mount points the
 * tree art has.
 */
export function growTree(
  journeyStartISO: string,
  days: number,
  relapseISOs: string[],
  mountCount: number,
): TreeState {
  const seed = hashString(journeyStartISO);
  const order = growthOrder(seed, mountCount);

  const fallen: FallenBlossom[] = [];
  for (const relapseISO of relapseISOs) {
    // Blossoms on the tree just before this relapse: every day so far grew
    // one, every earlier relapse took one away.
    const grown = calendarDaysBetween(journeyStartISO, relapseISO);
    const onTree = Math.min(grown - fallen.length, mountCount);
    if (onTree <= 0) continue;
    const from = order[onTree - 1];
    fallen.push({
      relapseISO,
      from,
      ...groundSpot(relapseISO),
      look: blossomAt(seed, from),
    });
  }

  const net = Math.max(0, days - fallen.length);
  const blossomCount = Math.min(net, mountCount);
  const leafCount = Math.min(net - blossomCount, mountCount);

  return {
    blossoms: order.slice(0, blossomCount).map((m) => blossomAt(seed, m)),
    leaves: order.slice(0, leafCount).map((m) => leafAt(seed, m)),
    fallen,
  };
}
