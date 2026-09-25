import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { usePhotos } from "../hooks/usePhotos";

const MAX_PAN = 80;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;

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

  const photoRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pan = useRef({ x: 0, y: 0, zoom: 1 });

  const applyPan = () => {
    const img = photoRef.current;
    if (!img) return;
    const { x, y, zoom } = pan.current;
    img.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  };

  const onPhotoPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const img = photoRef.current;
    if (img) img.style.transition = "none";
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };

  const onPhotoPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = pointers.current.get(event.pointerId);
    if (!point) return;

    const ids = [...pointers.current.keys()];
    if (ids.length === 1) {
      pan.current.x += event.clientX - point.x;
      pan.current.y += event.clientY - point.y;
    } else {
      const otherId = ids.find((id) => id !== event.pointerId);
      const other = otherId !== undefined ? pointers.current.get(otherId) : undefined;
      if (other) {
        const oldDist = Math.hypot(point.x - other.x, point.y - other.y);
        const newDist = Math.hypot(event.clientX - other.x, event.clientY - other.y);
        if (oldDist > 0) {
          pan.current.zoom = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, pan.current.zoom * (newDist / oldDist)),
          );
        }
        const oldMidX = (point.x + other.x) / 2;
        const oldMidY = (point.y + other.y) / 2;
        const newMidX = (event.clientX + other.x) / 2;
        const newMidY = (event.clientY + other.y) / 2;
        pan.current.x += newMidX - oldMidX;
        pan.current.y += newMidY - oldMidY;
      }
    }

    pan.current.x = Math.min(MAX_PAN, Math.max(-MAX_PAN, pan.current.x));
    pan.current.y = Math.min(MAX_PAN, Math.max(-MAX_PAN, pan.current.y));
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    applyPan();
  };

  const onPhotoPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) return;

    pan.current = { x: 0, y: 0, zoom: 1 };
    const img = photoRef.current;
    if (img) img.style.transition = "";
    applyPan();
  };

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
        <div
          className="photo-backdrop"
          onPointerDown={onPhotoPointerDown}
          onPointerMove={onPhotoPointerMove}
          onPointerUp={onPhotoPointerUp}
          onPointerCancel={onPhotoPointerUp}
        >
          <img key={clicks} ref={photoRef} src={current.url} alt="" className="photo-fade" />
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
