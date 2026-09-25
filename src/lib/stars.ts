/**
 * Deterministic star generation for the home-screen sky: one star per sober day.
 *
 * Star `i` depends only on the seed and `i`, so tomorrow's sky is today's plus
 * one new star — nothing already there moves or changes. Positions are fractions
 * of the sky area (0..1 across, 0..1 from the top down to the horizon), so every
 * star stays on screen whatever the device's aspect ratio.
 */

export interface Star {
  /** 0..1 across the sky. */
  x: number;
  /** 0..1 from the top of the sky down to the horizon. */
  y: number;
  /** Core radius in CSS px. */
  radius: number;
  /** Peak opacity of the core, 0..1. */
  brightness: number;
  /** RGB tint. */
  color: [number, number, number];
  /** Draw a soft halo around the star. */
  halo: boolean;
  /** Draw diffraction spikes (only the rarest, brightest stars). */
  spikes: boolean;
  /** How much the star's brightness wavers, 0 (steady) .. ~0.6. */
  twinkle: number;
  /** Twinkle speed in radians per second. */
  twinkleSpeed: number;
  twinklePhase: number;
}

/** Real stars are tinted by temperature: mostly white, a few blue or warm. */
const PALETTE: { color: [number, number, number]; weight: number }[] = [
  { color: [255, 255, 255], weight: 34 }, // white
  { color: [214, 228, 255], weight: 26 }, // blue-white
  { color: [186, 206, 255], weight: 10 }, // blue
  { color: [255, 244, 224], weight: 16 }, // warm white
  { color: [255, 226, 178], weight: 9 }, // pale yellow
  { color: [255, 196, 160], weight: 5 }, // orange (rare)
];
const PALETTE_TOTAL = PALETTE.reduce((sum, p) => sum + p.weight, 0);

/** 32-bit string hash (FNV-1a). */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast seeded PRNG returning floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickColor(r: number): [number, number, number] {
  let acc = r * PALETTE_TOTAL;
  for (const p of PALETTE) {
    acc -= p.weight;
    if (acc < 0) return p.color;
  }
  return PALETTE[0].color;
}

/** Standard normal sample (Box–Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

function makeStar(seed: number, index: number): Star {
  const rand = mulberry32(seed ^ Math.imul(index + 1, 0x9e3779b1));

  // Position: most stars are scattered evenly, a quarter gather loosely along a
  // faint diagonal band, like a hint of the Milky Way. Fewer stars show near
  // the horizon, where real skies are hazier.
  // Samples that land outside the sky are redrawn rather than clamped, which
  // would pile stars up in lines along the edges.
  const inBand = rand() < 0.25;
  let x: number;
  let y: number;
  do {
    if (inBand) {
      const t = rand();
      const offset = gaussian(rand) * 0.09;
      x = t + offset * 0.5;
      y = 0.05 + t * 0.7 + offset;
    } else {
      x = rand();
      // Density thins out linearly to 40% at the horizon (inverse CDF of 1 - 0.6y).
      y = (1 - Math.sqrt(1 - 0.84 * rand())) / 0.6;
    }
  } while (x < 0 || x > 1 || y < 0 || y > 1);

  // Magnitude: a steep power law, so faint stars vastly outnumber bright ones.
  // The very first star is always a bright one, so day one feels like something.
  const mag = index === 0 ? 0.97 : Math.pow(rand(), 3.2);
  const brightness = 0.35 + 0.65 * Math.pow(rand(), 0.6) * (0.4 + 0.6 * mag);
  const radius = 0.45 + mag * 1.6 + rand() * 0.25;
  const halo = mag > 0.907; // ~3% of stars
  const spikes = mag > 0.953; // ~1.5%

  // Everything twinkles a little; roughly a third shimmer noticeably.
  const shimmer = rand() < 0.35;
  const twinkle = shimmer ? 0.3 + rand() * 0.3 : 0.05 + rand() * 0.1;

  return {
    x,
    y,
    radius,
    brightness,
    color: pickColor(rand()),
    halo,
    spikes,
    twinkle,
    twinkleSpeed: (shimmer ? 1.2 : 0.4) + rand() * 1.6,
    twinklePhase: rand() * Math.PI * 2,
  };
}

/** The first `count` stars of the sky seeded by `seedKey` (e.g. the start date). */
export function generateStars(seedKey: string, count: number): Star[] {
  const seed = hashString(seedKey);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) stars.push(makeStar(seed, i));
  return stars;
}
