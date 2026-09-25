const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole calendar days between the local date of `iso` and today's local date
 * (never negative). This rolls the count over at local midnight rather than at
 * the time of day the count started, which is what people expect from a
 * day counter. Both ends are snapped to local midnight before subtracting, and
 * the gap is rounded, so DST transitions (a 23- or 25-hour "day") don't skew it.
 */
export function calendarDaysSince(iso: string): number {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return 0;
  const now = new Date();
  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.max(0, Math.round((todayMidnight - startMidnight) / MS_PER_DAY));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Today's local date as `YYYY-MM-DD`, the format `<input type="date">` uses. */
export function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Turns a `YYYY-MM-DD` date-input value into a start timestamp for the counter.
 * Returns null for a malformed, impossible (e.g. Feb 31) or future date.
 *
 * Any time on that day gives the same count, since the count snaps to local
 * midnight; local noon is used so the date survives a shift of a few timezones,
 * capped at now so that "today" isn't a moment in the future.
 */
export function dateInputToISO(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || value > todayInputValue()) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const noon = new Date(year, month - 1, day, 12);
  if (noon.getMonth() !== month - 1) return null;
  return new Date(Math.min(noon.getTime(), Date.now())).toISOString();
}

/** Locale date string for the "Since ..." subtitle. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** `date` moved on by `months` calendar months, clamped to the end of the
 *  target month (Jan 31 + 1 month = Feb 28/29). */
function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

/**
 * A day count spelled out in calendar terms, e.g. "1 year, 3 months, 10 days".
 * Counts real calendar months and years from the local start date, so it lines
 * up with the "Since ..." date (June 1 → Sept 1 is exactly "3 months"). Under a
 * month it uses weeks instead; under a week, just days.
 */
export function humanizeDays(startISO: string, days: number): string {
  const s = new Date(startISO);
  if (Number.isNaN(s.getTime())) return plural(days, "day");
  const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + days);

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();
  if (addMonths(start, months) > end) months--;
  const rest = Math.round(
    (end.getTime() - addMonths(start, months).getTime()) / MS_PER_DAY,
  );

  if (months === 0) {
    const weeks = Math.floor(rest / 7);
    const parts = weeks > 0 ? [plural(weeks, "week")] : [];
    if (rest % 7 > 0 || weeks === 0) parts.push(plural(rest % 7, "day"));
    return parts.join(", ");
  }

  const years = Math.floor(months / 12);
  const parts: string[] = [];
  if (years > 0) parts.push(plural(years, "year"));
  if (months % 12 > 0) parts.push(plural(months % 12, "month"));
  if (rest > 0) parts.push(plural(rest, "day"));
  return parts.join(", ");
}
