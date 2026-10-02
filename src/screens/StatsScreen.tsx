import { useStats } from "../hooks/useStats";
import { useI18n } from "../i18n";
import { formatDate, formatUnit } from "../lib/days";

interface Props {
  onBack: () => void;
}

export default function StatsScreen({ onBack }: Props) {
  const stats = useStats();
  const { t, formatTag } = useI18n();
  const dayLabel = (n: number) => formatUnit(n, "day", formatTag);

  return (
    <section className="screen stats">
      <header className="screen-header">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label={t.common.backToHome}
        >
          <BackIcon />
        </button>
        <h1>{t.stats.title}</h1>
      </header>

      <div className="stat-list">
        <div className="stat-row">
          <span className="stat-label">{t.stats.journeyStarted}</span>
          <span className="stat-value">
            {formatDate(stats.journeyStartISO, formatTag)}
          </span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t.stats.journeyDays}</span>
          <span className="stat-value">{dayLabel(stats.journeyDays)}</span>
          <span className="stat-caption">{t.stats.journeyDaysCaption}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t.stats.longest}</span>
          <span className="stat-value">{dayLabel(stats.longestSpellDays)}</span>
          {stats.longestIsCurrent && stats.longestSpellDays > 0 && (
            <span className="stat-caption">{t.stats.longestIsCurrent}</span>
          )}
        </div>

        <div className="stat-row">
          <span className="stat-label">{t.stats.average}</span>
          <span className="stat-value">
            {stats.averageSpellDays === null
              ? "—"
              : dayLabel(stats.averageSpellDays)}
          </span>
          {stats.relapseCount === 0 && (
            <span className="stat-caption">{t.stats.neverGivenIn}</span>
          )}
        </div>

        <div className="stat-row">
          <span className="stat-label">{t.stats.timesGivenIn}</span>
          <span className="stat-value">{stats.relapseCount}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t.stats.timesChangedMind}</span>
          <span className="stat-value">{stats.changedMindCount}</span>
        </div>
      </div>
    </section>
  );
}

function BackIcon() {
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
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
