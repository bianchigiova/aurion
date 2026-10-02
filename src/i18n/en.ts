/**
 * English: the source language. Its shape is `Messages`, which every other
 * language must match key for key (TypeScript enforces it). Plain strings for
 * fixed text; functions where a number or name goes in, so each language can
 * handle its own word order and plurals.
 */
export const en = {
  common: {
    back: "Back",
    next: "Next",
    cancel: "Cancel",
    done: "Done",
    backToHome: "Back to home",
  },

  welcome: {
    stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
    title: "Welcome",
    question: "When was the last time you gave in?",
    dateLabel: "Last day you gave in",
    dateHint:
      "Starting fresh? Leave it as today. Switching phones or picking up from earlier? Choose the day you last gave in and the counter carries on from there.",
    dateInFuture: "That date is in the future.",
    photosTitle: "Your reasons",
    photosIntro:
      "When you're about to give in, Aurion first shows you a photo of someone you love — or of yourself, happy and proud. Each photo is one more moment to think it over.",
    photosEmpty: "No photos yet. Tap + to add some.",
    photosLater: "You can add or change them later in Settings.",
    sceneLater: "You can change it later in Settings.",
    start: "Start counting",
  },

  photos: {
    label: "Photos",
    add: "Add photos",
    loading: "Loading…",
    remove: (name: string) => `Remove ${name}`,
  },

  scenes: {
    title: "Home screen",
    hint: "The picture behind your day count, and how it grows.",
    sky: {
      name: "Night sky",
      description:
        "A new star every day. Clouds drift over for a while after giving in.",
    },
    cherry: {
      name: "Cherry tree",
      description:
        "A new blossom every day. One falls to the ground after giving in.",
    },
  },

  home: {
    daysWithout: (days: number): string =>
      days === 1 ? "day without" : "days without",
    since: (date: string) => `Since ${date}`,
    aboutToGiveIn: "I'm about to give in",
    stats: "Stats",
    settings: "Settings",
  },

  areYouSure: {
    title: "Are you sure?",
    promise: "You made a promise to someone you love.",
    doingIt: "I'm doing it",
    changedMind: "I changed my mind",
  },

  stats: {
    title: "Stats",
    journeyStarted: "Journey started",
    journeyDays: "Days in your journey",
    journeyDaysCaption: "Every day counts, even the hard ones — it never resets.",
    longest: "Longest stretch before giving in",
    longestIsCurrent: "That's your current streak.",
    average: "Average stretch before giving in",
    neverGivenIn: "Haven't given in yet.",
    timesGivenIn: "Times you've given in",
    timesChangedMind: "Times you changed your mind",
  },

  settings: {
    title: "Settings",
    photosEmpty:
      "No photos yet. Add the people you're doing this for — or yourself, happy and proud.",
    language: "Language",
    languageAuto: "Automatic",
    languageHint: "Automatic follows your phone's language.",
    showStats: "Show stats",
    showStatsHint:
      "A stats screen with your longest and average stretch before giving in. Off by default so it doesn't become a score.",
    share: "Share the app",
    shareHint:
      "A QR code that points to the app, so someone nearby can scan it and install it themselves.",
    shareButton: "Share",
    shareTitle: "Share Aurion",
    shareBody: "Scan this to open and install the app.",
    qrLabel: "QR code linking to the app",
    restart: "Restart the journey",
    restartHint:
      "Clears your history and stats and sets the counter back to zero, starting again from today. Photos stay.",
    restartButton: "Restart",
    restartTitle: "Restart the journey?",
    restartBody:
      "This permanently clears your history and stats and resets the counter to zero. This can't be undone.",
  },
};

export type Messages = typeof en;
