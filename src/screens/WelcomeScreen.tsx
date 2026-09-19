import { useState } from "react";
import { dateInputToISO, todayInputValue } from "../lib/days";

interface Props {
  onStart: (startISO: string) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [today] = useState(todayInputValue);
  const [date, setDate] = useState(today);
  const startISO = dateInputToISO(date);

  return (
    <section className="screen welcome">
      <div className="prompt">
        <h1>Welcome</h1>
        <p>When was the last day you used drugs?</p>
      </div>

      <div className="field">
        <label htmlFor="last-use">Last day of use</label>
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
          Starting fresh? Leave it as today. Switching phones or picking up from
          earlier? Choose the day you last used and the counter carries on from
          there.
        </p>
        {date > today && <p className="field-error">That date is in the future.</p>}
      </div>

      <button
        className="button button-primary"
        disabled={!startISO}
        onClick={() => startISO && onStart(startISO)}
      >
        Start counting
      </button>
    </section>
  );
}
