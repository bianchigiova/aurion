import { useEffect, useState, type CSSProperties } from "react";
import { usePhotos } from "../hooks/usePhotos";

interface Props {
  promiseName: string;
  onGoAhead: () => void;
  onChangedMind: () => void;
}

export default function AreYouSureScreen({
  promiseName,
  onGoAhead,
  onChangedMind,
}: Props) {
  const { photos, loading } = usePhotos();
  const [start, setStart] = useState<number | null>(null);
  const [clicks, setClicks] = useState(0);

  // Pick the starting photo once, at random, when the list first loads.
  useEffect(() => {
    if (loading || start !== null) return;
    setStart(photos.length > 0 ? Math.floor(Math.random() * photos.length) : 0);
  }, [loading, photos, start]);

  const who = promiseName.trim() || "someone you love";

  // "I'm doing it" is a deliberate hurdle: it takes one click per photo before
  // it goes through, stepping to the next photo (with rollover) each time and
  // filling like a progress bar.
  const steps = Math.max(1, photos.length);
  const current =
    start !== null && photos.length > 0
      ? photos[(start + clicks) % photos.length]
      : null;
  const progress = Math.min(1, clicks / steps);
  const fillStyle = { "--progress": `${progress * 100}%` } as CSSProperties;

  const onGoAheadClick = () => {
    const next = clicks + 1;
    if (next >= steps) {
      onGoAhead();
    } else {
      setClicks(next);
    }
  };

  return (
    <section className={`screen are-you-sure${current ? " has-photo" : ""}`}>
      {current && (
        <div className="photo-backdrop">
          <img key={clicks} src={current.url} alt="" className="photo-fade" />
        </div>
      )}

      <div className="prompt">
        <h1>Are you sure?</h1>
        <p>You made a promise to {who}.</p>
      </div>

      <div className="actions">
        <button
          className="button button-ghost button-progress"
          style={fillStyle}
          onClick={onGoAheadClick}
        >
          <span className="button-progress-label">I'm doing it</span>
        </button>
        <button className="button button-primary" onClick={onChangedMind}>
          I changed my mind
        </button>
      </div>
    </section>
  );
}
