/**
 * Small wrapper over localStorage for the scalar state the app keeps: the
 * promise recipient's name, the current sobriety start timestamp, and the
 * journey history used by the stats screen (first-ever start, every relapse,
 * and how many times the user backed out of the "are you sure?" screen).
 *
 * Every access is guarded: in private-browsing modes localStorage can throw on
 * read or write, so we fall back to an in-memory store and the app keeps working
 * for the current session.
 */

const NS = "aurion";

const NAME_KEY = `${NS}.promiseName`;
const START_KEY = `${NS}.sobrietyStartISO`;
const JOURNEY_KEY = `${NS}.journeyStartISO`;
const RELAPSES_KEY = `${NS}.relapses`;
const CHANGED_MIND_KEY = `${NS}.changedMindCount`;
const SHOW_STATS_KEY = `${NS}.showStats`;
const DAY_COUNT_MAX_KEY = `${NS}.dayCountMax`;

/**
 * One-time migration of persisted state from the app's former name ("drugaway").
 * Copies each legacy key to its `aurion.` equivalent (unless already set) and
 * drops the old one. Guarded like every other access — if storage throws, there
 * is nothing to migrate and the app carries on.
 */
const LEGACY_NS = "drugaway";
const KEY_SUFFIXES = [
  "promiseName",
  "sobrietyStartISO",
  "journeyStartISO",
  "relapses",
  "changedMindCount",
  "showStats",
];

function migrateLegacyKeys(): void {
  for (const suffix of KEY_SUFFIXES) {
    try {
      const legacy = window.localStorage.getItem(`${LEGACY_NS}.${suffix}`);
      if (legacy === null) continue;
      if (window.localStorage.getItem(`${NS}.${suffix}`) === null) {
        window.localStorage.setItem(`${NS}.${suffix}`, legacy);
      }
      window.localStorage.removeItem(`${LEGACY_NS}.${suffix}`);
    } catch {
      /* ignore — storage unavailable, nothing to migrate */
    }
  }
}

migrateLegacyKeys();

const memory = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* ignore */
  }
  return memory.has(key) ? memory.get(key)! : null;
}

function writeRaw(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore — memory fallback already holds it */
  }
}

function removeRaw(key: string): void {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore — memory fallback already cleared */
  }
}

export function getPromiseName(): string {
  return readRaw(NAME_KEY) ?? "";
}

export function setPromiseName(name: string): void {
  writeRaw(NAME_KEY, name.trim());
}

/**
 * Whether the stats screen is available. Off by default — surfacing streak
 * numbers unprompted risks turning relapses into a score.
 */
export function getShowStats(): boolean {
  return readRaw(SHOW_STATS_KEY) === "1";
}

export function setShowStats(show: boolean): void {
  writeRaw(SHOW_STATS_KEY, show ? "1" : "0");
}

/**
 * High-water mark for the day counter, in whole days. The count is derived from
 * calendar days, which can slip backwards when the device moves into a timezone
 * behind the previous one (flying west); clamping the display to this stored
 * maximum keeps the number from ever decreasing during a single sober spell. It
 * is cleared whenever the spell restarts — see `recordRelapse` / `restartJourney`.
 */
export function getDayCountMax(): number {
  const raw = readRaw(DAY_COUNT_MAX_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setDayCountMax(days: number): void {
  writeRaw(DAY_COUNT_MAX_KEY, String(Math.max(0, Math.floor(days))));
}

/**
 * Whether a sobriety start has been stored yet. False only on a fresh install
 * (or once storage is unavailable), before the welcome screen has been answered.
 */
export function hasSobrietyStart(): boolean {
  return readRaw(START_KEY) !== null;
}

/**
 * Returns the sobriety start timestamp, initialising it to "now" on first run so
 * the counter has a defined origin.
 */
export function getSobrietyStartISO(): string {
  const existing = readRaw(START_KEY);
  if (existing) return existing;
  const now = new Date().toISOString();
  writeRaw(START_KEY, now);
  return now;
}

/**
 * The date the whole journey began — the first sobriety start, pinned and never
 * moved by later relapses. Back-filled from the current start for anyone who was
 * already using the app before stats existed.
 */
export function getJourneyStartISO(): string {
  const existing = readRaw(JOURNEY_KEY);
  if (existing) return existing;
  const seed = getSobrietyStartISO();
  writeRaw(JOURNEY_KEY, seed);
  return seed;
}

/** Timestamps of every relapse ("I'm doing it"), oldest first. */
export function getRelapseISOs(): string[] {
  const raw = readRaw(RELAPSES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

/** How many times the user chose "I changed my mind". */
export function getChangedMindCount(): number {
  const raw = readRaw(CHANGED_MIND_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Record a relapse: append it to the history and move the current sobriety start
 * to now. Ensures the journey start is pinned first, so it keeps the original
 * date rather than this moment.
 */
export function recordRelapse(): string {
  getJourneyStartISO();
  const now = new Date().toISOString();
  writeRaw(RELAPSES_KEY, JSON.stringify([...getRelapseISOs(), now]));
  writeRaw(START_KEY, now);
  removeRaw(DAY_COUNT_MAX_KEY);
  return now;
}

/** Increment and return the "changed my mind" tally. */
export function recordChangedMind(): number {
  const next = getChangedMindCount() + 1;
  writeRaw(CHANGED_MIND_KEY, String(next));
  return next;
}

/**
 * Wipe the whole journey history — relapses, "changed my mind" tally, and the
 * pinned journey start — and begin again from now. The promise name and photos
 * are left untouched. Returns the new sobriety start timestamp.
 */
export function restartJourney(): string {
  removeRaw(RELAPSES_KEY);
  removeRaw(CHANGED_MIND_KEY);
  return beginJourney(new Date().toISOString());
}

/**
 * Pin the sobriety start and the journey start to `startISO` and clear the day
 * counter's high-water mark. Used by the first-run welcome screen (where the
 * start is the user's last day of use, possibly in the past) and by restarts.
 */
export function beginJourney(startISO: string): string {
  removeRaw(DAY_COUNT_MAX_KEY);
  writeRaw(START_KEY, startISO);
  writeRaw(JOURNEY_KEY, startISO);
  return startISO;
}
