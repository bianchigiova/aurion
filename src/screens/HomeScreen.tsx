import { useEffect, useRef, useState, type MouseEvent } from "react";
import StarrySky from "../components/StarrySky";
import { useDayCount } from "../hooks/useDayCount";
import { formatDate, humanizeDays } from "../lib/days";

/** How long the day-count tooltip stays up before hiding itself. */
const TOOLTIP_MS = 4_000;
/** How long a tap on the sky hides the UI for, unless tapped again sooner. */
const STARGAZE_MS = 8_000;

interface Props {
  startISO: string;
  showStats: boolean;
  onAboutToUse: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  startISO,
  showStats,
  onAboutToUse,
  onOpenStats,
  onOpenSettings,
}: Props) {
  const days = useDayCount(startISO);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const numberRef = useRef<HTMLButtonElement>(null);
  const [stargazing, setStargazing] = useState(false);
  // Whether the tap now in progress started while the tooltip was up; such a
  // tap only dismisses the tooltip, it doesn't also hide the UI.
  const tapDismissesTooltip = useRef(false);

  // The home screen fits the screen exactly: stop the page scrolling or
  // rubber-banding underneath it (other screens, like settings, still scroll).
  useEffect(() => {
    document.documentElement.classList.add("no-scroll");
    return () => document.documentElement.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    if (!stargazing) return;
    const timer = window.setTimeout(() => setStargazing(false), STARGAZE_MS);
    return () => window.clearTimeout(timer);
  }, [stargazing]);

  // Tapping the sky (anywhere but a button) fades the UI out to leave just the
  // stars; the next tap anywhere, or a few seconds, brings it back.
  const onScreenTap = (e: MouseEvent) => {
    if (tapDismissesTooltip.current) return;
    if (!stargazing && (e.target as Element).closest("button")) return;
    setStargazing((on) => !on);
  };

  // The tooltip hides itself after a few seconds, or on any tap elsewhere.
  useEffect(() => {
    if (!tooltipOpen) return;
    const timer = window.setTimeout(() => setTooltipOpen(false), TOOLTIP_MS);
    const onPointerDown = (e: PointerEvent) => {
      if (!numberRef.current?.contains(e.target as Node)) setTooltipOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [tooltipOpen]);

  return (
    <section
      className={`screen home${stargazing ? " is-stargazing" : ""}`}
      onPointerDown={() => {
        tapDismissesTooltip.current = tooltipOpen;
      }}
      onClick={onScreenTap}
    >
      <StarrySky seedKey={startISO} count={days} />

      <div className="home-actions">
        {showStats && (
          <button
            className="icon-button"
            onClick={onOpenStats}
            aria-label="Stats"
          >
            <StatsIcon />
          </button>
        )}
        <button
          className="icon-button"
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          <CogIcon />
        </button>
      </div>

      <div className="counter">
        <button
          ref={numberRef}
          className="counter-number"
          onClick={() => setTooltipOpen((open) => !open)}
          aria-describedby="counter-tooltip"
        >
          {days}
          <span
            id="counter-tooltip"
            role="tooltip"
            className={`counter-tooltip${tooltipOpen ? " is-open" : ""}`}
          >
            {humanizeDays(startISO, days)}
          </span>
        </button>
        <span className="counter-label">
          {days === 1 ? "day" : "days"} without drugs
        </span>
        <span className="counter-since">Since {formatDate(startISO)}</span>
      </div>

      <button className="button button-danger" onClick={onAboutToUse}>
        I'm about to do drugs
      </button>
    </section>
  );
}

function StatsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="20" x2="4" y2="13" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="20" y1="20" x2="20" y2="9" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
