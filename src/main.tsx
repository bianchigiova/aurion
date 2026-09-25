import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { dateInputToISO } from "./lib/days";
import { beginJourney } from "./lib/prefs";
import "./styles.css";

applySinceParam();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

/**
 * `?since=YYYY-MM-DD` sets the sobriety start to that date, like answering the
 * welcome screen, so any day count (and its sky) can be tried out. Relapse
 * history is left alone. The parameter is stripped from the address afterwards
 * so reloading the page doesn't apply it again.
 */
function applySinceParam() {
  const url = new URL(window.location.href);
  const since = url.searchParams.get("since");
  if (since === null) return;
  const iso = dateInputToISO(since);
  if (iso) beginJourney(iso);
  else console.warn(`Ignoring ?since=${since}: expected a past YYYY-MM-DD date`);
  url.searchParams.delete("since");
  window.history.replaceState(null, "", url);
}
