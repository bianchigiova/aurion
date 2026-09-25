import { useEffect, useMemo, useRef } from "react";
import skyUrl from "../assets/night-sky.jpg";
import { generateStars, type Star } from "../lib/stars";

/** Natural size of night-sky.jpg, and how far down its sky the stars reach
 *  (into the tops of the clouds, where they fade out). */
const IMAGE_W = 941;
const IMAGE_H = 1672;
const HORIZON = 1215 / IMAGE_H;

/** Twinkling is subtle; 30fps is plenty and halves the battery cost. */
const FRAME_MS = 1000 / 30;

/** On opening the home screen, the chance a comet shows up within seconds... */
const COMET_ON_OPEN_CHANCE = 0.2;
/** ...and, while it stays open, the mean wait between comets. */
const COMET_MEAN_GAP_MS = 3 * 60_000;

/** Today's star fades in with a sparkle each time the app is opened: after a
 *  short pause to let the screen settle, over this long. */
const BIRTH_DELAY_MS = 700;
const BIRTH_MS = 3_000;

interface Props {
  /** Seeds the star positions, so the same sky comes back every time. */
  seedKey: string;
  /** One star per sober day. */
  count: number;
}

interface Comet {
  start: number;
  duration: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  tail: number;
}

/**
 * Full-screen night sky: the background illustration with one star per day
 * drawn above its horizon. The stars sit on two canvases — steady ones are
 * painted once per resize, twinkling ones (and the odd comet) every frame.
 *
 * The newest star (today's) is born again every time the screen opens or the
 * app comes back to the foreground, and when the day rolls over while the app
 * is open, the new count brings a new newest star with it.
 */
export default function StarrySky({ seedKey, count }: Props) {
  const staticRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const stars = useMemo(() => generateStars(seedKey, count), [seedKey, count]);

  useEffect(() => {
    const staticCanvas = staticRef.current;
    const liveCanvas = liveRef.current;
    const staticCtx = staticCanvas?.getContext("2d");
    const liveCtx = liveCanvas?.getContext("2d");
    if (!staticCanvas || !liveCanvas || !staticCtx || !liveCtx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const newest =
      !reduceMotion && stars.length > 0 ? stars[stars.length - 1] : null;
    const others = newest ? stars.slice(0, -1) : stars;
    const steady = reduceMotion ? others : others.filter((s) => !isLive(s));
    const live = reduceMotion ? [] : others.filter(isLive);

    let width = 0;
    let height = 0;
    let skyHeight = 0;

    const resize = () => {
      const rect = liveCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = rect.width;
      height = rect.height;
      // Same geometry as the <img>'s `object-fit: cover` anchored to the bottom.
      const scale = Math.max(rect.width / IMAGE_W, rect.height / IMAGE_H);
      const imageTop = rect.height - IMAGE_H * scale;
      skyHeight = imageTop + HORIZON * IMAGE_H * scale;

      for (const [canvas, ctx] of [
        [staticCanvas, staticCtx],
        [liveCanvas, liveCtx],
      ] as const) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      staticCtx.clearRect(0, 0, width, height);
      for (const star of steady) {
        drawStar(staticCtx, star, star.x * width, star.y * skyHeight, 1);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(liveCanvas);

    if (reduceMotion) return () => observer.disconnect();

    let comet: Comet | null = null;
    let nextComet =
      performance.now() +
      (Math.random() < COMET_ON_OPEN_CHANCE
        ? 2_000 + Math.random() * 8_000
        : randomCometGap());

    let birthStart = performance.now() + BIRTH_DELAY_MS;
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

      const t = now / 1000;
      liveCtx.clearRect(0, 0, width, height);
      for (const star of live) {
        drawStar(liveCtx, star, star.x * width, star.y * skyHeight, shimmer(star, t));
      }

      if (newest) {
        const x = newest.x * width;
        const y = newest.y * skyHeight;
        const intensity = isLive(newest) ? shimmer(newest, t) : 1;
        const age = now - birthStart;
        if (age >= BIRTH_MS) drawStar(liveCtx, newest, x, y, intensity);
        else if (age >= 0) drawBirth(liveCtx, newest, x, y, age / BIRTH_MS, intensity);
      }

      if (!comet && now >= nextComet) comet = spawnComet(now, width, skyHeight);
      if (comet) {
        if (!drawComet(liveCtx, comet, now, width, skyHeight)) {
          comet = null;
          nextComet = now + randomCometGap();
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [stars]);

  return (
    <div className="sky" aria-hidden="true">
      <img src={skyUrl} alt="" />
      <canvas ref={staticRef} />
      <canvas ref={liveRef} />
    </div>
  );
}

/** Stars that visibly change frame to frame; the rest are painted once. */
function isLive(star: Star): boolean {
  return star.halo || star.twinkle > 0.2;
}

/** Brightness multiplier for a star at time `t` (seconds). Two out-of-step
 *  waves keep the flicker from looking mechanical. */
function shimmer(star: Star, t: number): number {
  const a = t * star.twinkleSpeed + star.twinklePhase;
  const wave = 0.6 * Math.sin(a) + 0.4 * Math.sin(a * 2.3 + star.twinklePhase);
  return 1 - star.twinkle * (0.5 + 0.5 * wave);
}

function randomCometGap(): number {
  return -Math.log(1 - Math.random()) * COMET_MEAN_GAP_MS;
}

// ---------- Drawing ----------

/** Soft round sprites, one per star colour, cached and scaled on draw. */
const sprites = new Map<string, HTMLCanvasElement>();
const SPRITE_SIZE = 64;

function sprite(color: [number, number, number], kind: "core" | "halo") {
  const key = `${kind}:${color.join(",")}`;
  let canvas = sprites.get(key);
  if (canvas) return canvas;

  canvas = document.createElement("canvas");
  canvas.width = canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d")!;
  const r = SPRITE_SIZE / 2;
  const [cr, cg, cb] = color;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  if (kind === "core") {
    // A hot white centre bleeding into the star's tint.
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, `rgba(${cr},${cg},${cb},0.9)`);
    g.addColorStop(0.55, `rgba(${cr},${cg},${cb},0.25)`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  } else {
    g.addColorStop(0, `rgba(${cr},${cg},${cb},0.45)`);
    g.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.12)`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  sprites.set(key, canvas);
  return canvas;
}

/** Stars dim towards the horizon, where there's more air to look through,
 *  and vanish entirely at it, so the starfield has no visible bottom edge. */
function horizonFade(y: number): number {
  const k = Math.min(1, Math.max(0, (y - 0.75) / 0.25));
  return 1 - k * k * (3 - 2 * k);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  intensity: number,
) {
  const alpha = star.brightness * intensity * horizonFade(star.y);

  if (star.halo) {
    const r = star.radius * 9;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite(star.color, "halo"), x - r, y - r, r * 2, r * 2);
  }

  const r = star.radius * 2.6;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite(star.color, "core"), x - r, y - r, r * 2, r * 2);

  if (star.spikes) {
    const len = star.radius * 9 * (0.75 + 0.25 * intensity);
    ctx.globalAlpha = alpha * 0.8;
    drawSpikes(ctx, x, y, len, 0, 0.6, star.color);
  }

  ctx.globalAlpha = 1;
}

/** A cross of two thin lines through (x, y), fading out towards the tips. */
function drawSpikes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  angle: number,
  lineWidth: number,
  color: [number, number, number],
) {
  const [cr, cg, cb] = color;
  ctx.lineWidth = lineWidth;
  for (const a of [angle, angle + Math.PI / 2]) {
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len;
    const g = ctx.createLinearGradient(x - dx, y - dy, x + dx, y + dy);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
    g.addColorStop(0.5, "rgba(255,255,255,0.9)");
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - dx, y - dy);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }
}

/**
 * Today's star being born, `p` running 0..1: a sparkle flares up, turning
 * slowly, and dies away while the star itself fades in beneath it.
 */
function drawBirth(
  ctx: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  p: number,
  intensity: number,
) {
  const appear = Math.min(1, p / 0.6);
  drawStar(ctx, star, x, y, intensity * (1 - Math.pow(1 - appear, 3)));

  // Peaks a third of the way in, gone by 80%.
  const flare = Math.pow(Math.sin(Math.PI * Math.min(1, p / 0.8)), 2);
  if (flare <= 0.001) return;

  const r = 34 * flare;
  ctx.globalAlpha = flare * 0.9;
  ctx.drawImage(sprite(star.color, "halo"), x - r, y - r, r * 2, r * 2);
  const angle = p * 0.8;
  drawSpikes(ctx, x, y, 40 * flare, angle, 1, star.color);
  ctx.globalAlpha = flare * 0.5;
  drawSpikes(ctx, x, y, 18 * flare, angle + Math.PI / 4, 0.8, star.color);
  const c = 5 * flare;
  ctx.globalAlpha = flare;
  ctx.drawImage(sprite(star.color, "core"), x - c, y - c, c * 2, c * 2);
  ctx.globalAlpha = 1;
}

function spawnComet(now: number, width: number, skyHeight: number): Comet {
  // Slants downwards at 15-40°, from either side, starting high in the sky.
  const angle = ((15 + Math.random() * 25) * Math.PI) / 180;
  const fromLeft = Math.random() < 0.5;
  const distance = width * (0.55 + Math.random() * 0.35);
  const duration = 1_800 + Math.random() * 1_400;
  return {
    start: now,
    duration,
    x: fromLeft ? width * Math.random() * 0.4 : width * (1 - Math.random() * 0.4),
    y: skyHeight * (0.05 + Math.random() * 0.35),
    dx: ((fromLeft ? 1 : -1) * Math.cos(angle) * distance) / duration,
    dy: (Math.sin(angle) * distance) / duration,
    tail: width * (0.28 + Math.random() * 0.14),
  };
}

/** Draws the comet at `now`; returns false once it has faded out. */
function drawComet(
  ctx: CanvasRenderingContext2D,
  comet: Comet,
  now: number,
  width: number,
  skyHeight: number,
): boolean {
  const elapsed = now - comet.start;
  if (elapsed > comet.duration) return false;

  const progress = elapsed / comet.duration;
  const fade = Math.sin(Math.PI * progress);
  const hx = comet.x + comet.dx * elapsed;
  const hy = comet.y + comet.dy * elapsed;
  const speed = Math.hypot(comet.dx, comet.dy);
  const ux = comet.dx / speed;
  const uy = comet.dy / speed;
  // The tail grows out behind the head as it gets going.
  const tail = comet.tail * Math.min(1, 0.3 + progress * 1.5);
  const tx = hx - ux * tail;
  const ty = hy - uy * tail;
  // Perpendicular, for the tail's width at the head.
  const px = -uy * 2.2;
  const py = ux * 2.2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, skyHeight); // stay behind the clouds and hills
  ctx.clip();

  const g = ctx.createLinearGradient(hx, hy, tx, ty);
  g.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
  g.addColorStop(0.25, `rgba(200,220,255,${0.45 * fade})`);
  g.addColorStop(1, "rgba(160,190,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(hx + px, hy + py);
  ctx.lineTo(tx, ty);
  ctx.lineTo(hx - px, hy - py);
  ctx.closePath();
  ctx.fill();

  const r = 11;
  ctx.globalAlpha = fade;
  ctx.drawImage(sprite([220, 232, 255], "halo"), hx - r * 2, hy - r * 2, r * 4, r * 4);
  ctx.drawImage(sprite([220, 232, 255], "core"), hx - r / 2, hy - r / 2, r, r);
  ctx.restore();
  return true;
}
