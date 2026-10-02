import { useState } from "react";
import PhotoPicker from "../components/PhotoPicker";
import QrCode from "../components/QrCode";
import ScenePicker from "../components/ScenePicker";
import type { Scene } from "../scenes";

/** Where the app itself is hosted, for the share QR code — resolved at
 *  runtime (not hardcoded) so it's correct wherever this build is served. */
const APP_URL = `${window.location.origin}${import.meta.env.BASE_URL}`;

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
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);

  return (
    <section className="screen settings">
      <header className="screen-header">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label="Back to home"
        >
          <BackIcon />
        </button>
        <h1>Settings</h1>
      </header>

      <PhotoPicker
        emptyHint="No photos yet. Add the people you're doing this for — or yourself, happy and proud."
      />

      <div className="field">
        <span className="toggle-text" id="scene-label">
          <span className="toggle-title">Home screen</span>
          <span className="toggle-hint">
            The picture behind your day count, and how it grows.
          </span>
        </span>
        <ScenePicker
          scene={scene}
          onChoose={onChooseScene}
          labelledBy="scene-label"
        />
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <label className="toggle-text" htmlFor="show-stats">
            <span className="toggle-title">Show stats</span>
            <span className="toggle-hint">
              A stats screen with your longest and average stretch before
              giving in. Off by default so it doesn't become a score.
            </span>
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
            <span className="toggle-title">Share the app</span>
            <span className="toggle-hint">
              A QR code that points to the app, so someone nearby can scan it
              and install it themselves.
            </span>
          </span>
          <button
            className="button button-ghost"
            onClick={() => setSharingOpen(true)}
          >
            Share
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <span className="toggle-text">
            <span className="toggle-title">Restart the journey</span>
            <span className="toggle-hint">
              Clears your history and stats and sets the counter back to zero,
              starting again from today. Photos stay.
            </span>
          </span>
          <button
            className="button button-ghost"
            onClick={() => setConfirmingRestart(true)}
          >
            Restart
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
            <h2 id="restart-title">Restart the journey?</h2>
            <p>
              This permanently clears your history and stats and resets the
              counter to zero. This can't be undone.
            </p>
            <div className="modal-actions">
              <button
                className="button button-ghost"
                onClick={() => setConfirmingRestart(false)}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  setConfirmingRestart(false);
                  onRestart();
                }}
              >
                Restart
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
            <h2 id="share-title">Share Aurion</h2>
            <p>Scan this to open and install the app.</p>
            <div className="qr-frame">
              <QrCode value={APP_URL} size={220} />
            </div>
            <p className="muted qr-url">{APP_URL}</p>
            <div className="modal-actions">
              <button
                className="button button-primary"
                onClick={() => setSharingOpen(false)}
              >
                Done
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
