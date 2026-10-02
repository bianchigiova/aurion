import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import AreYouSureScreen from "./screens/AreYouSureScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StatsScreen from "./screens/StatsScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import {
  beginJourney,
  getSceneId,
  getShowStats,
  getSobrietyStartISO,
  hasSobrietyStart,
  recordChangedMind,
  recordRelapse,
  restartJourney,
  setSceneId,
  setShowStats as persistShowStats,
} from "./lib/prefs";
import { sceneById, type Scene } from "./scenes";

type Screen = "home" | "areYouSure" | "stats" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  // null until the welcome screen has been answered (fresh install only).
  const [startISO, setStartISO] = useState<string | null>(() =>
    hasSobrietyStart() ? getSobrietyStartISO() : null,
  );
  const [showStats, setShowStats] = useState(getShowStats);
  const [scene, setScene] = useState(() => sceneById(getSceneId()));
  // `?setup` in the URL shows first-time setup again, for testing it on a
  // device that's already set up.
  const [previewingSetup, setPreviewingSetup] = useState(() =>
    new URLSearchParams(window.location.search).has("setup"),
  );

  const chooseScene = (next: Scene) => {
    setSceneId(next.id);
    setScene(next);
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

  // Finishing a `?setup` preview leaves an existing journey alone (the date
  // step is just for show) and drops the parameter, so a reload goes home.
  // Photos and the scene picked along the way are real, and stay.
  const endSetupPreview = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("setup");
    window.history.replaceState(null, "", url);
    setPreviewingSetup(false);
  };

  if (startISO === null || previewingSetup) {
    return (
      <div className="app">
        <WelcomeScreen
          scene={scene}
          onChooseScene={chooseScene}
          onStart={(iso) => {
            if (startISO === null) setStartISO(beginJourney(iso));
            if (previewingSetup) endSetupPreview();
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          startISO={startISO}
          scene={scene}
          showStats={showStats}
          onAboutToUse={() => setScreen("areYouSure")}
          onOpenStats={() => setScreen("stats")}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "areYouSure" && (
        <AreYouSureScreen
          onGoAhead={confirmRelapse}
          onChangedMind={changedMind}
        />
      )}

      {screen === "stats" && showStats && (
        <StatsScreen onBack={() => setScreen("home")} />
      )}

      {screen === "settings" && (
        <SettingsScreen
          scene={scene}
          onChooseScene={chooseScene}
          showStats={showStats}
          onToggleStats={toggleStats}
          onRestart={restart}
          onBack={() => setScreen("home")}
        />
      )}
    </div>
  );
}
