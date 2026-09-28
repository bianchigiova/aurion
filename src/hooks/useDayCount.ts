import { useCallback, useEffect, useState } from "react";
import { calendarDaysSince } from "../lib/days";
import {
  getDayCountMax,
  getLifetimeDayCountMax,
  setDayCountMax,
  setLifetimeDayCountMax,
} from "../lib/prefs";

/**
 * Derives a day count from a fixed start timestamp. Nothing is persisted
 * per-day — the number simply recomputes:
 *   - every 60s (covers the app being left open across midnight),
 *   - whenever the tab regains focus / visibility (covers reopening the app).
 *
 * `startISO` changing (a reset) immediately re-derives the count.
 *
 * The raw figure is calendar days since the start date, so it ticks over at
 * local midnight. Crossing into a timezone behind the previous one could nudge
 * that backwards, so the result is clamped to a stored high-water mark that
 * only ever rises. `variant` picks which mark: "streak" (the default) clamps
 * the current sober spell and is cleared on every relapse; "lifetime" clamps
 * the sky's ever-growing star count and is only cleared when the journey
 * itself restarts (see prefs).
 */
export function useDayCount(
  startISO: string,
  variant: "streak" | "lifetime" = "streak",
): number {
  const [count, setCount] = useState(() => derive(startISO, variant));

  const refresh = useCallback(() => {
    setCount(derive(startISO, variant));
  }, [startISO, variant]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return count;
}

function derive(startISO: string, variant: "streak" | "lifetime"): number {
  const getMax = variant === "lifetime" ? getLifetimeDayCountMax : getDayCountMax;
  const setMax = variant === "lifetime" ? setLifetimeDayCountMax : setDayCountMax;
  const days = Math.max(calendarDaysSince(startISO), getMax());
  setMax(days);
  return days;
}
