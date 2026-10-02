import { useState } from "react";
import PhotoPicker from "../components/PhotoPicker";
import QrCode from "../components/QrCode";
import ScenePicker from "../components/ScenePicker";
import { LOCALES, useI18n } from "../i18n";
import type { Scene } from "../scenes";

/** Where the app itself is hosted, for the share QR code — resolved at
 *  runtime (not hardcoded) so it's correct wherever this build is served. */
const APP_URL = `${window.location.origin}${import.meta.env.BASE_URL}`;

/** The language picker's value for "follow the device". */
const AUTO = "auto";

interface Props {
  scene: Scene;
  onChooseScene: (scene: Scene) => void;
  showStats: boolean;
  onToggleStats: (show: boolean) => void;
  onRestart: () => void;
  onBack: () => void;
}

export default function SettingsScreen({
  scene,
  onChooseScene,
  showStats,
  onToggleStats,
  onRestart,
  onBack,
}: Props) {
  const { t, chosen, choose } = useI18n();
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);

  return (
    <section className="screen settings">
      <header className="screen-header">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label={t.common.backToHome}
        >
          <BackIcon />
        </button>
        <h1>{t.settings.title}</h1>
      </header>

      <PhotoPicker emptyHint={t.settings.photosEmpty} />

      <div className="field">
        <span className="toggle-text" id="scene-label">
          <span className="toggle-title">{t.scenes.title}</span>
          <span className="toggle-hint">{t.scenes.hint}</span>
        </span>
        <ScenePicker
          scene={scene}
          onChoose={onChooseScene}
          labelledBy="scene-label"
        />
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <label className="toggle-text" htmlFor="language">
            <span className="toggle-title">{t.settings.language}</span>
            <span className="toggle-hint">{t.settings.languageHint}</span>
          </label>
          <select
            id="language"
            className="select"
            value={chosen ?? AUTO}
            onChange={(e) =>
              choose(e.target.value === AUTO ? null : e.target.value)
            }
          >
            <option value={AUTO}>{t.settings.languageAuto}</option>
            {LOCALES.map((l) => (
              <option key={l.id} value={l.id} lang={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <label className="toggle-text" htmlFor="show-stats">
            <span className="toggle-title">{t.settings.showStats}</span>
            <span className="toggle-hint">{t.settings.showStatsHint}</span>
          </label>
          <input
            id="show-stats"
            type="checkbox"
            role="switch"
            className="switch"
            checked={showStats}
            onChange={(e) => onToggleStats(e.target.checked)}
          />
        </div>
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <span className="toggle-text">
            <span className="toggle-title">{t.settings.share}</span>
            <span className="toggle-hint">{t.settings.shareHint}</span>
          </span>
          <button
            className="button button-ghost"
            onClick={() => setSharingOpen(true)}
          >
            {t.settings.shareButton}
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <span className="toggle-text">
            <span className="toggle-title">{t.settings.restart}</span>
            <span className="toggle-hint">{t.settings.restartHint}</span>
          </span>
          <button
            className="button button-ghost"
            onClick={() => setConfirmingRestart(true)}
          >
            {t.settings.restartButton}
          </button>
        </div>
      </div>

      {confirmingRestart && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-title"
          onClick={() => setConfirmingRestart(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="restart-title">{t.settings.restartTitle}</h2>
            <p>{t.settings.restartBody}</p>
            <div className="modal-actions">
              <button
                className="button button-ghost"
                onClick={() => setConfirmingRestart(false)}
              >
                {t.common.cancel}
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  setConfirmingRestart(false);
                  onRestart();
                }}
              >
                {t.settings.restartButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {sharingOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
          onClick={() => setSharingOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="share-title">{t.settings.shareTitle}</h2>
            <p>{t.settings.shareBody}</p>
            <div className="qr-frame">
              <QrCode value={APP_URL} size={220} label={t.settings.qrLabel} />
            </div>
            <p className="muted qr-url">{APP_URL}</p>
            <div className="modal-actions">
              <button
                className="button button-primary"
                onClick={() => setSharingOpen(false)}
              >
                {t.common.done}
              </button>
            </div>
          </div>
        </div>
      )}
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
