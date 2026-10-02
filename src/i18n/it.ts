import type { Messages } from "./en";

/** Italian. Informal "tu", and phrased to avoid gendered adjectives
 *  ("sicuro/a", "orgoglioso/a") since we don't know who's reading. */
export const it: Messages = {
  common: {
    back: "Indietro",
    next: "Avanti",
    cancel: "Annulla",
    done: "Fatto",
    backToHome: "Torna alla schermata principale",
  },

  welcome: {
    stepOf: (step, total) => `Passo ${step} di ${total}`,
    title: "Ti diamo il benvenuto",
    question: "Quand'è stata l'ultima volta che hai ceduto?",
    dateLabel: "L'ultimo giorno in cui hai ceduto",
    dateHint:
      "Inizi da zero? Lascia la data di oggi. Cambi telefono o riprendi da prima? Scegli l'ultimo giorno in cui hai ceduto e il contatore prosegue da lì.",
    dateInFuture: "Questa data è nel futuro.",
    photosTitle: "I tuoi motivi",
    photosIntro:
      "Quando stai per cedere, Aurion ti mostra prima la foto di una persona che ami, o una tua foto in un momento felice. Ogni foto è un momento in più per pensarci.",
    photosEmpty: "Nessuna foto per ora. Tocca + per aggiungerne.",
    photosLater: "Potrai aggiungerle o cambiarle in seguito nelle Impostazioni.",
    sceneLater: "Potrai cambiarla in seguito nelle Impostazioni.",
    start: "Inizia a contare",
  },

  photos: {
    label: "Foto",
    add: "Aggiungi foto",
    loading: "Caricamento…",
    remove: (name) => `Rimuovi ${name}`,
  },

  scenes: {
    title: "Schermata principale",
    hint: "L'immagine dietro il conteggio dei giorni, e come cresce.",
    sky: {
      name: "Cielo notturno",
      description:
        "Una nuova stella ogni giorno. Quando cedi, per un po' passano delle nuvole.",
    },
    cherry: {
      name: "Ciliegio",
      description: "Un nuovo fiore ogni giorno. Quando cedi, uno cade a terra.",
    },
  },

  home: {
    daysWithout: (days) => (days === 1 ? "giorno senza" : "giorni senza"),
    since: (date) => `Dal ${date}`,
    aboutToGiveIn: "Sto per cedere",
    stats: "Statistiche",
    settings: "Impostazioni",
  },

  areYouSure: {
    title: "Vuoi davvero farlo?",
    promise: "Hai fatto una promessa a qualcuno che ami.",
    doingIt: "Lo faccio",
    changedMind: "Ho cambiato idea",
  },

  stats: {
    title: "Statistiche",
    journeyStarted: "Inizio del percorso",
    journeyDays: "Giorni nel tuo percorso",
    journeyDaysCaption:
      "Ogni giorno conta, anche quelli difficili: non si azzera mai.",
    longest: "Periodo più lungo senza cedere",
    longestIsCurrent: "È il periodo che stai vivendo ora.",
    average: "Periodo medio senza cedere",
    neverGivenIn: "Non hai ancora ceduto.",
    timesGivenIn: "Volte in cui hai ceduto",
    timesChangedMind: "Volte in cui hai cambiato idea",
  },

  settings: {
    title: "Impostazioni",
    photosEmpty:
      "Nessuna foto per ora. Aggiungi le persone per cui lo fai, o una tua foto in un momento felice.",
    language: "Lingua",
    languageAuto: "Automatica",
    languageHint: "Automatica segue la lingua del telefono.",
    showStats: "Mostra statistiche",
    showStatsHint:
      "Una schermata con il tuo periodo più lungo e quello medio senza cedere. Disattivata all'inizio, così non diventa un punteggio.",
    share: "Condividi l'app",
    shareHint:
      "Un codice QR che porta all'app, così chi ti sta vicino può inquadrarlo e installarla.",
    shareButton: "Condividi",
    shareTitle: "Condividi Aurion",
    shareBody: "Inquadra il codice per aprire e installare l'app.",
    qrLabel: "Codice QR che porta all'app",
    restart: "Ricomincia il percorso",
    restartHint:
      "Cancella la cronologia e le statistiche e riporta il contatore a zero, ripartendo da oggi. Le foto restano.",
    restartButton: "Ricomincia",
    restartTitle: "Ricominciare il percorso?",
    restartBody:
      "La cronologia e le statistiche verranno cancellate per sempre e il contatore tornerà a zero. Non si può annullare.",
  },
};
