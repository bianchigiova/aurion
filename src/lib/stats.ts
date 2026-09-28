import { calendarDaysSince } from "./days";
import { getChangedMindCount, getJourneyStartISO, getRelapseISOs } from "./prefs";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface Stats {
  /** ISO date the journey began. */
  journeyStartISO: string;
  /** Whole days since the journey began — unlike the home screen's streak,
   *  this never resets on a relapse (matches the sky, which doesn't either). */
  journeyDays: number;
  /** Number of relapses so far (equivalently, spells that have already ended). */
  relapseCount: number;
  /** Longest spell in whole days, including the current ongoing one. */
  longestSpellDays: number;
  /** True when the current ongoing spell is the longest so far. */
  longestIsCurrent: boolean;
  /** Mean length of past (ended) spells, in days (1 dp). Null if none have ended. */
  averageSpellDays: number | null;
  /** Times the user chose "I changed my mind". */
  changedMindCount: number;
}

/**
 * Derives the stats screen's numbers from the stored journey history.
 *
 * The timeline is `journeyStart → relapse₁ → … → relapseₙ → now`. Each gap is a
 * sober spell; the first n are "completed" (ended in a relapse) and the last is
 * the current ongoing one.
 */
export function computeStats(now: number = Date.now()): Stats {
  const journeyStartISO = getJourneyStartISO();
  const journeyStart = new Date(journeyStartISO).getTime();

  const relapses = getRelapseISOs()
    .map((iso) => new Date(iso).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);

  const bounds = [journeyStart, ...relapses, now];
  const spells: number[] = [];
  for (let i = 1; i < bounds.length; i++) {
    spells.push(Math.max(0, bounds[i] - bounds[i - 1]));
  }

  const completed = spells.slice(0, -1);
  const longestMs = spells.length ? Math.max(...spells) : 0;
  const currentMs = spells.length ? spells[spells.length - 1] : 0;
  const avgMs = completed.length
    ? completed.reduce((a, b) => a + b, 0) / completed.length
    : null;

  return {
    journeyStartISO,
    journeyDays: calendarDaysSince(journeyStartISO),
    relapseCount: completed.length,
    longestSpellDays: Math.floor(longestMs / MS_PER_DAY),
    longestIsCurrent: spells.length > 0 && currentMs === longestMs,
    averageSpellDays:
      avgMs === null ? null : Math.round((avgMs / MS_PER_DAY) * 10) / 10,
    changedMindCount: getChangedMindCount(),
  };
}
