import { useRef } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { useI18n } from "../i18n";

interface Props {
  /** Shown instead of the grid while there are no photos yet. */
  emptyHint: string;
}

/**
 * The user's photo library: an add button, and a grid of the photos with a
 * remove button on each. Used in Settings and in first-time setup.
 */
export default function PhotoPicker({ emptyHint }: Props) {
  const { t } = useI18n();
  const { photos, loading, addFiles, remove } = usePhotos();
  const fileInput = useRef<HTMLInputElement>(null);

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files);
    }
    e.target.value = "";
  };

  return (
    <div className="field">
      <div className="field-row field-row--spread">
        <label>{t.photos.label}</label>
        <button
          className="icon-button icon-button--framed"
          onClick={() => fileInput.current?.click()}
          aria-label={t.photos.add}
        >
          <PlusIcon />
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onPickFiles}
      />

      {loading ? (
        <p className="muted">{t.photos.loading}</p>
      ) : photos.length === 0 ? (
        <p className="muted">{emptyHint}</p>
      ) : (
        <div className="photo-grid">
          {photos.map((p) => (
            <div className="photo-tile" key={p.id}>
              <img src={p.url} alt={p.name} />
              <button
                className="photo-remove"
                onClick={() => remove(p.id)}
                aria-label={t.photos.remove(p.name)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
