import { useState } from "react";
import PhotoPicker from "../components/PhotoPicker";
import ScenePicker from "../components/ScenePicker";
import { dateInputToISO, todayInputValue } from "../lib/days";
import type { Scene } from "../scenes";

type Step = "date" | "photos" | "scene";
const STEPS: Step[] = ["date", "photos", "scene"];

interface Props {
  scene: Scene;
  onChooseScene: (scene: Scene) => void;
  onStart: (startISO: string) => void;
}

/**
 * First-time setup, shown once on a fresh install: when the user last gave
 * in, their photos, and the home screen. Photos and the scene are saved as
 * they're picked; the journey itself only begins on the last step, so
 * closing the app halfway brings setup back next time. Restarting the
 * journey later (from Settings) doesn't come through here.
 */
export default function WelcomeScreen({ scene, onChooseScene, onStart }: Props) {
  const [step, setStep] = useState<Step>("date");
  const [today] = useState(todayInputValue);
  const [date, setDate] = useState(today);
  const startISO = dateInputToISO(date);
  const index = STEPS.indexOf(step);

  const back = () => setStep(STEPS[index - 1]);
  const next = () => setStep(STEPS[index + 1]);

  return (
    <section className="screen welcome">
      <ol className="setup-steps" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <li key={s} className={i <= index ? "is-done" : undefined} />
        ))}
      </ol>

      {step === "date" && (
        <>
          <div className="prompt">
            <h1>Welcome</h1>
            <p>When was the last time you gave in?</p>
          </div>

          <div className="field">
            <label htmlFor="last-use">Last day you gave in</label>
            <div className="field-row">
              <input
                id="last-use"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <p className="muted">
              Starting fresh? Leave it as today. Switching phones or picking up
              from earlier? Choose the day you last used and the counter
              carries on from there.
            </p>
            {date > today && (
              <p className="field-error">That date is in the future.</p>
            )}
          </div>

          <div className="setup-actions">
            <button
              className="button button-primary"
              disabled={!startISO}
              onClick={next}
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === "photos" && (
        <>
          <div className="prompt">
            <h1>Your reasons</h1>
            <p>
              When you're about to give in, Aurion first shows you a photo of
              someone you love — or of yourself, happy and proud. Each photo
              is one more moment to think it over.
            </p>
          </div>

          <PhotoPicker emptyHint="No photos yet. Tap + to add some." />

          <p className="muted">You can add or change them later in Settings.</p>

          <div className="setup-actions">
            <button className="button button-ghost" onClick={back}>
              Back
            </button>
            <button className="button button-primary" onClick={next}>
              Next
            </button>
          </div>
        </>
      )}

      {step === "scene" && (
        <>
          <div className="prompt">
            <h1 id="setup-scene-label">Home screen</h1>
            <p>The picture behind your day count, and how it grows.</p>
          </div>

          <ScenePicker
            scene={scene}
            onChoose={onChooseScene}
            labelledBy="setup-scene-label"
          />

          <p className="muted">You can change it later in Settings.</p>

          <div className="setup-actions">
            <button className="button button-ghost" onClick={back}>
              Back
            </button>
            <button
              className="button button-primary"
              disabled={!startISO}
              onClick={() => startISO && onStart(startISO)}
            >
              Start counting
            </button>
          </div>
        </>
      )}
    </section>
  );
}
