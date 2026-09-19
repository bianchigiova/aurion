import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import AreYouSureScreen from "./screens/AreYouSureScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StatsScreen from "./screens/StatsScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import {
  beginJourney,
  getPromiseName,
  getShowStats,
  getSobrietyStartISO,
  hasSobrietyStart,
  recordChangedMind,
  recordRelapse,
  restartJourney,
  setPromiseName as persistPromiseName,
  setShowStats as persistShowStats,
} from "./lib/prefs";

type Screen = "home" | "areYouSure" | "stats" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [promiseName, setPromiseName] = useState(getPromiseName);
  // null until the welcome screen has been answered (fresh install only).
  const [startISO, setStartISO] = useState<string | null>(() =>
    hasSobrietyStart() ? getSobrietyStartISO() : null,
  );
  const [showStats, setShowStats] = useState(getShowStats);

  const savePromiseName = (name: string) => {
    persistPromiseName(name);
    setPromiseName(getPromiseName());
  };

  const toggleStats = (show: boolean) => {
    persistShowStats(show);
    setShowStats(show);
  };

  const confirmRelapse = () => {
    setStartISO(recordRelapse());
    setScreen("home");
  };

  const changedMind = () => {
    recordChangedMind();
    setScreen("home");
  };

  const restart = () => {
    setStartISO(restartJourney());
    setScreen("home");
  };

  if (startISO === null) {
    return (
      <div className="app">
        <WelcomeScreen onStart={(iso) => setStartISO(beginJourney(iso))} />
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          startISO={startISO}
          showStats={showStats}
          onAboutToUse={() => setScreen("areYouSure")}
          onOpenStats={() => setScreen("stats")}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "areYouSure" && (
        <AreYouSureScreen
          promiseName={promiseName}
          onGoAhead={confirmRelapse}
          onChangedMind={changedMind}
        />
      )}

      {screen === "stats" && showStats && (
        <StatsScreen onBack={() => setScreen("home")} />
      )}

      {screen === "settings" && (
        <SettingsScreen
          promiseName={promiseName}
          showStats={showStats}
          onSaveName={savePromiseName}
          onToggleStats={toggleStats}
          onRestart={restart}
          onBack={() => setScreen("home")}
        />
      )}
    </div>
  );
}
