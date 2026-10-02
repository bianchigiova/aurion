import type { Messages } from "./en";

/** German. Informal "du". "Give in" is «schwach werden», the everyday way
 *  to say you slipped with an addiction; predicative adjectives ("sicher",
 *  "stolz") don't change with gender, so nothing needs rephrasing. */
export const de: Messages = {
  common: {
    back: "Zurück",
    next: "Weiter",
    cancel: "Abbrechen",
    done: "Fertig",
    backToHome: "Zurück zum Startbildschirm",
  },

  welcome: {
    stepOf: (step, total) => `Schritt ${step} von ${total}`,
    title: "Willkommen",
    question: "Wann bist du zuletzt schwach geworden?",
    dateLabel: "Zuletzt schwach geworden am",
    dateHint:
      "Du fängst neu an? Lass das heutige Datum stehen. Du wechselst das Handy oder machst dort weiter, wo du warst? Wähle den Tag, an dem du zuletzt schwach geworden bist, und der Zähler läuft von dort weiter.",
    dateInFuture: "Dieses Datum liegt in der Zukunft.",
    photosTitle: "Deine Gründe",
    photosIntro:
      "Wenn du kurz davor bist, schwach zu werden, zeigt dir Aurion zuerst ein Foto von jemandem, den du liebst – oder von dir selbst, glücklich und stolz. Jedes Foto ist ein Moment mehr, um es dir noch einmal zu überlegen.",
    photosEmpty: "Noch keine Fotos. Tippe auf +, um welche hinzuzufügen.",
    photosLater:
      "Du kannst sie später in den Einstellungen hinzufügen oder ändern.",
    sceneLater: "Du kannst es später in den Einstellungen ändern.",
    start: "Los geht's!",
  },

  photos: {
    label: "Fotos",
    add: "Fotos hinzufügen",
    loading: "Wird geladen …",
    remove: (name) => `${name} entfernen`,
  },

  scenes: {
    title: "Startbildschirm",
    hint: "Das Bild hinter deinem Tageszähler – und wie es wächst.",
    sky: {
      name: "Nachthimmel",
      description:
        "Jeden Tag ein neuer Stern. Wirst du schwach, ziehen eine Weile Wolken vorbei.",
    },
    cherry: {
      name: "Kirschbaum",
      description:
        "Jeden Tag eine neue Blüte. Wirst du schwach, fällt eine zu Boden.",
    },
  },

  home: {
    daysWithout: (days) => (days === 1 ? "Tag ohne" : "Tage ohne"),
    since: (date) => `Seit dem ${date}`,
    aboutToGiveIn: "Ich werde gleich schwach",
    stats: "Statistik",
    settings: "Einstellungen",
  },

  areYouSure: {
    title: "Bist du sicher?",
    promise: "Du hast jemandem, den du liebst, ein Versprechen gegeben.",
    doingIt: "Ich tu's",
    changedMind: "Ich hab's mir anders überlegt",
  },

  stats: {
    title: "Statistik",
    journeyStarted: "Beginn deines Wegs",
    journeyDays: "Tage auf deinem Weg",
    journeyDaysCaption:
      "Jeder Tag zählt, auch die schweren – und nichts wird je zurückgesetzt.",
    longest: "Längste Zeit, ohne schwach zu werden",
    longestIsCurrent: "Das ist deine aktuelle Strecke.",
    average: "Durchschnittliche Zeit, ohne schwach zu werden",
    neverGivenIn: "Du bist noch nicht schwach geworden.",
    timesGivenIn: "Wie oft du schwach geworden bist",
    timesChangedMind: "Wie oft du es dir anders überlegt hast",
  },

  settings: {
    title: "Einstellungen",
    photosEmpty:
      "Noch keine Fotos. Füge die Menschen hinzu, für die du das tust – oder dich selbst, glücklich und stolz.",
    language: "Sprache",
    languageAuto: "Automatisch",
    languageHint: "„Automatisch“ folgt der Sprache deines Handys.",
    showStats: "Statistik anzeigen",
    showStatsHint:
      "Ein Bildschirm mit deiner längsten und durchschnittlichen Zeit, ohne schwach zu werden. Standardmäßig aus, damit daraus kein Punktestand wird.",
    share: "App teilen",
    shareHint:
      "Ein QR-Code, der zur App führt, damit jemand in deiner Nähe ihn scannen und die App selbst installieren kann.",
    shareButton: "Teilen",
    shareTitle: "Aurion teilen",
    shareBody: "Scanne den Code, um die App zu öffnen und zu installieren.",
    qrLabel: "QR-Code, der zur App führt",
    restart: "Weg neu beginnen",
    restartHint:
      "Löscht deinen Verlauf und deine Statistik und setzt den Zähler auf null, ab heute. Die Fotos bleiben.",
    restartButton: "Neu beginnen",
    restartTitle: "Weg neu beginnen?",
    restartBody:
      "Dein Verlauf und deine Statistik werden endgültig gelöscht und der Zähler wird auf null gesetzt. Das lässt sich nicht rückgängig machen.",
  },
};
