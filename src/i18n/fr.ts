import type { Messages } from "./en";

/** Thin no-break space, which French typography puts before ? ! ; : and
 *  inside « » — so the mark never wraps onto a line of its own. */
const S = " ";

/** French. Informal "tu". "Give in" is «craquer», the everyday word for
 *  slipping with an addiction. Phrased to avoid gendered adjectives
 *  ("sûr·e", "fier·ère"). */
export const fr: Messages = {
  common: {
    back: "Retour",
    next: "Suivant",
    cancel: "Annuler",
    done: "OK",
    backToHome: "Retour à l'accueil",
  },

  welcome: {
    stepOf: (step, total) => `Étape ${step} sur ${total}`,
    title: "Bienvenue",
    question: `À quand remonte la dernière fois où tu as craqué${S}?`,
    dateLabel: "Le dernier jour où tu as craqué",
    dateHint: `Tu pars de zéro${S}? Laisse la date d'aujourd'hui. Tu changes de téléphone ou tu reprends là où tu en étais${S}? Choisis le dernier jour où tu as craqué, et le compteur continue à partir de là.`,
    dateInFuture: "Cette date est dans le futur.",
    photosTitle: "Tes raisons",
    photosIntro:
      "Quand tu es sur le point de craquer, Aurion te montre d'abord la photo de quelqu'un que tu aimes — ou une photo de toi dans un moment heureux. Chaque photo, c'est un moment de plus pour y réfléchir.",
    photosEmpty: "Pas encore de photos. Touche + pour en ajouter.",
    photosLater:
      "Tu pourras en ajouter ou les changer plus tard dans les Réglages.",
    sceneLater: "Tu pourras le changer plus tard dans les Réglages.",
    start: `C'est parti${S}!`,
  },

  photos: {
    label: "Photos",
    add: "Ajouter des photos",
    loading: "Chargement…",
    remove: (name) => `Supprimer ${name}`,
  },

  scenes: {
    title: "Écran d'accueil",
    hint: "L'image derrière ton compteur de jours, et la façon dont elle grandit.",
    sky: {
      name: "Ciel nocturne",
      description:
        "Une nouvelle étoile chaque jour. Quand tu craques, des nuages passent un moment.",
    },
    cherry: {
      name: "Cerisier",
      description:
        "Une nouvelle fleur chaque jour. Quand tu craques, une fleur tombe au sol.",
    },
  },

  home: {
    daysWithout: (days) => (days <= 1 ? "jour sans" : "jours sans"),
    since: (date) => `Depuis le ${date}`,
    aboutToGiveIn: "Je vais craquer",
    stats: "Statistiques",
    settings: "Réglages",
  },

  areYouSure: {
    title: `Tu veux vraiment le faire${S}?`,
    promise: "Tu as fait une promesse à quelqu'un que tu aimes.",
    doingIt: "Je le fais",
    changedMind: "J'ai changé d'avis",
  },

  stats: {
    title: "Statistiques",
    journeyStarted: "Début du parcours",
    journeyDays: "Jours dans ton parcours",
    journeyDaysCaption:
      "Chaque jour compte, même les plus durs — rien n'est jamais remis à zéro.",
    longest: "Plus longue période sans craquer",
    longestIsCurrent: "C'est ta période en cours.",
    average: "Période moyenne sans craquer",
    neverGivenIn: "Tu n'as pas encore craqué.",
    timesGivenIn: "Nombre de fois où tu as craqué",
    timesChangedMind: "Nombre de fois où tu as changé d'avis",
  },

  settings: {
    title: "Réglages",
    photosEmpty:
      "Pas encore de photos. Ajoute les personnes pour qui tu le fais — ou une photo de toi dans un moment heureux.",
    language: "Langue",
    languageAuto: "Automatique",
    languageHint: `«${S}Automatique${S}» suit la langue de ton téléphone.`,
    showStats: "Afficher les statistiques",
    showStatsHint:
      "Un écran avec ta plus longue période et ta période moyenne sans craquer. Désactivé par défaut, pour que ça ne devienne pas un score.",
    share: "Partager l'app",
    shareHint:
      "Un code QR qui mène à l'app, pour que quelqu'un près de toi puisse le scanner et l'installer.",
    shareButton: "Partager",
    shareTitle: "Partager Aurion",
    shareBody: "Scanne ce code pour ouvrir et installer l'app.",
    qrLabel: "Code QR qui mène à l'app",
    restart: "Recommencer le parcours",
    restartHint:
      "Efface ton historique et tes statistiques et remet le compteur à zéro, à partir d'aujourd'hui. Les photos restent.",
    restartButton: "Recommencer",
    restartTitle: `Recommencer le parcours${S}?`,
    restartBody:
      "Ton historique et tes statistiques seront effacés pour de bon et le compteur sera remis à zéro. C'est irréversible.",
  },
};
