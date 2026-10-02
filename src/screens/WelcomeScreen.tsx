import { useState } from "react";
import PhotoPicker from "../components/PhotoPicker";
import ScenePicker from "../components/ScenePicker";
import { useI18n } from "../i18n";
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
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("date");
  const [today] = useState(todayInputValue);
  const [date, setDate] = useState(today);
  const startISO = dateInputToISO(date);
  const index = STEPS.indexOf(step);

  const back = () => setStep(STEPS[index - 1]);
  const next = () => setStep(STEPS[index + 1]);

  return (
    <section className="screen welcome">
      <ol className="setup-steps" aria-label={t.welcome.stepOf(index + 1, STEPS.length)}>
        {STEPS.map((s, i) => (
          <li key={s} className={i <= index ? "is-done" : undefined} />
        ))}
      </ol>

      {step === "date" && (
        <>
          <div className="prompt">
            <h1>{t.welcome.title}</h1>
            <p>{t.welcome.question}</p>
          </div>

          <div className="field">
            <label htmlFor="last-use">{t.welcome.dateLabel}</label>
            <div className="field-row">
              <input
                id="last-use"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <p className="muted">{t.welcome.dateHint}</p>
            {date > today && (
              <p className="field-error">{t.welcome.dateInFuture}</p>
            )}
          </div>

          <div className="setup-actions">
            <button
              className="button button-primary"
              disabled={!startISO}
              onClick={next}
            >
              {t.common.next}
            </button>
          </div>
        </>
      )}

      {step === "photos" && (
        <>
          <div className="prompt">
            <h1>{t.welcome.photosTitle}</h1>
            <p>{t.welcome.photosIntro}</p>
          </div>

          <PhotoPicker emptyHint={t.welcome.photosEmpty} />

          <p className="muted">{t.welcome.photosLater}</p>

          <div className="setup-actions">
            <button className="button button-ghost" onClick={back}>
              {t.common.back}
            </button>
            <button className="button button-primary" onClick={next}>
              {t.common.next}
            </button>
          </div>
        </>
      )}

      {step === "scene" && (
        <>
          <div className="prompt">
            <h1 id="setup-scene-label">{t.scenes.title}</h1>
            <p>{t.scenes.hint}</p>
          </div>

          <ScenePicker
            scene={scene}
            onChoose={onChooseScene}
            labelledBy="setup-scene-label"
          />

          <p className="muted">{t.welcome.sceneLater}</p>

          <div className="setup-actions">
            <button className="button button-ghost" onClick={back}>
              {t.common.back}
            </button>
            <button
              className="button button-primary"
              disabled={!startISO}
              onClick={() => startISO && onStart(startISO)}
            >
              {t.welcome.start}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
