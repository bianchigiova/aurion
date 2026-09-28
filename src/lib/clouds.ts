/**
 * Deterministic cloud generation for the home-screen sky: one cloud
 * "formation" per relapse, drifting across part of the sky and fading away
 * as it goes.
 *
 * A formation is several sprite puffs clustered together rather than one
 * sprite scaled up — scaling a single sprite past its native resolution
 * reads as pixelated (see StarrySky's per-puff size cap), so covering a
 * meaningful chunk of the sky needs more, modestly-sized pieces instead of
 * one big one. A week of daily relapses should read as a fully overcast
 * sky, so each formation targets roughly a seventh of the usable sky area.
 *
 * Formations lower in the sky (nearer the horizon) use smaller puffs to read
 * as farther away, with more of them spread wider to still hit that same
 * target area — the classic depth cue of distant things looking both
 * smaller and hazier/denser.
 *
 * The sky is divided into ROW_COUNT horizontal bands, one row per relapse —
 * assigned by that relapse's index in its *entire lifetime* history (which
 * only ever grows by appending, so the index is permanent), not by how many
 * relapses happen to be active right now. That's what makes a week of daily
 * relapses reliably claim all ROW_COUNT rows instead of leaving gaps or
 * doubling up by luck, while keeping every formation's row fixed forever —
 * an earlier version picked a cloud's row from its position among the
 * *currently active* relapses, which tiled just as evenly but meant every
 * formation's row shifted on every later, unrelated relapse as that count
 * changed. Only a row's worth of vertical space is tracked (not horizontal
 * position, and not per-puff) — a formation already spans a good chunk of
 * its row's width via its puffs and drift, so column-level bookkeeping
 * isn't needed to avoid visible gaps the way row-level bookkeeping is.
 *
 * Within its row, a formation's shape, size and horizontal drift are fixed
 * by its relapse timestamp alone. Its opacity and how far it's drifted are a
 * function of how many calendar days have passed since that relapse —
 * computed by the caller, not stored here. That elapsed time is per-cloud
 * and never reset by a later relapse, so an earlier cloud always finishes
 * fading at or before a later one.
 */

import { calendarDaysSince } from "./days";
import { hashString, mulberry32 } from "./random";

/** How many days a cloud takes to fully dissipate. Tunable. */
export const DISSIPATION_DAYS = 30;

/** How many horizontal bands the sky is divided into — one per relapse, by
 *  lifetime order, wrapping back to row 0 beyond this many. A week of daily
 *  relapses fully clouding the sky is the intent behind 7. */
const ROW_COUNT = 7;

/** Vertical range covered by the rows, 0..1 down the sky. This deliberately
 *  reaches almost to the horizon/hills line so the lowest row still covers
 *  the stars just above it — StarrySky hard-clamps each puff's own bottom
 *  edge above that line (and, below it, the boy and his telescope), so
 *  formations that would otherwise dip past it get pulled back up there
 *  instead of leaving a gap by staying clear of it in the first place. */
const MIN_BAND_Y = 0.05;
const MAX_BAND_Y = 0.88;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface CloudPuff {
  /** Offset from the formation's centre, in units of screen width. */
  dx: number;
  dy: number;
  spriteIndex: number;
  /** Size multiplier (combines with StarrySky's own native-resolution cap). */
  scale: number;
  flip: boolean;
}

export interface Cloud {
  /** The relapse this formation came from; also its seed. */
  bornISO: string;
  /** 0..1 down the sky, where the formation is centred. */
  bandY: number;
  /** 0..1 across the sky, where it starts before drifting. */
  startX: number;
  /** Which way it drifts: -1 towards the left edge, 1 towards the right. */
  direction: -1 | 1;
  puffs: CloudPuff[];
}

function makeCloud(bornISO: string, spriteCount: number, lifetimeIndex: number): Cloud {
  const rand = mulberry32(hashString(bornISO));

  const rowSpan = (MAX_BAND_Y - MIN_BAND_Y) / ROW_COUNT;
  const row = lifetimeIndex % ROW_COUNT;
  const bandY = MIN_BAND_Y + row * rowSpan + rand() * rowSpan;
  // 0 near the top of the sky (closer, so bigger/fewer puffs), 1 near the
  // horizon (farther, so smaller/more puffs spread wider).
  const depth = (bandY - MIN_BAND_Y) / (MAX_BAND_Y - MIN_BAND_Y);

  const baseScale = lerp(1.5, 0.75, depth);
  const spreadX = lerp(0.42, 0.85, depth);
  const spreadY = spreadX * 0.4;

  // A handful of puffs scattered independently tends to read as sparse dots
  // rather than one mass — lay them out on a jittered grid instead, spaced
  // closer than a puff's own width so neighbours overlap and merge. One
  // formation needs to visibly fill its whole row on its own (not just on
  // average over several relapses landing in the same row), so this errs
  // dense.
  const cols = Math.round(lerp(6, 9, depth));
  const rows = Math.round(lerp(3, 4, depth));
  const puffs: CloudPuff[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Drop a few cells at random (more readily towards the edges) so the
      // formation's silhouette isn't a perfect rectangle.
      const edge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (rand() < (edge ? 0.3 : 0.05)) continue;

      const cellCx = lerp(-spreadX, spreadX, (c + 0.5) / cols);
      const cellCy = lerp(-spreadY, spreadY, (r + 0.5) / rows);
      puffs.push({
        dx: cellCx + (rand() - 0.5) * (spreadX / cols),
        dy: cellCy + (rand() - 0.5) * (spreadY / rows),
        spriteIndex: Math.floor(rand() * spriteCount),
        scale: baseScale * (0.85 + rand() * 0.3),
        flip: rand() < 0.5,
      });
    }
  }

  return {
    bornISO,
    bandY,
    startX: 0.15 + rand() * 0.7,
    direction: rand() < 0.5 ? -1 : 1,
    puffs,
  };
}

/**
 * One formation per relapse still within its dissipation window; older
 * relapses are fully dissipated and omitted entirely, so this list stays
 * short. `relapseISOs` must be the *complete* lifetime history, oldest
 * first — each formation's row comes from its index in that full list (see
 * the file comment), not its index among the ones still active. `spriteCount`
 * is how many cloud sprite images are available.
 */
export function generateClouds(relapseISOs: string[], spriteCount: number): Cloud[] {
  if (spriteCount <= 0) return [];
  const clouds: Cloud[] = [];
  relapseISOs.forEach((iso, lifetimeIndex) => {
    if (calendarDaysSince(iso) >= DISSIPATION_DAYS) return;
    clouds.push(makeCloud(iso, spriteCount, lifetimeIndex));
  });
  return clouds;
}

/** How far along its life a cloud is, 0 (just happened) .. 1 (fully gone). */
export function cloudProgress(cloud: Cloud): number {
  return Math.min(1, calendarDaysSince(cloud.bornISO) / DISSIPATION_DAYS);
}
