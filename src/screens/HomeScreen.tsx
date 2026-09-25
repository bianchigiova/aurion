import StarrySky from "../components/StarrySky";
import { useDayCount } from "../hooks/useDayCount";
import { formatDate } from "../lib/days";

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

  return (
    <section className="screen home">
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
        <span className="counter-number">{days}</span>
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
