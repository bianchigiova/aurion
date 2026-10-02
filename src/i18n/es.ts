import type { Messages } from "./en";

/** Spanish. Informal "tú". "Give in" is «ceder» («recaer», to relapse, is
 *  the clinical word the app avoids). Phrased to avoid gendered adjectives
 *  ("seguro/a", "orgulloso/a"). */
export const es: Messages = {
  common: {
    back: "Atrás",
    next: "Siguiente",
    cancel: "Cancelar",
    done: "Listo",
    backToHome: "Volver al inicio",
  },

  welcome: {
    stepOf: (step, total) => `Paso ${step} de ${total}`,
    title: "Te damos la bienvenida",
    question: "¿Cuándo fue la última vez que cediste?",
    dateLabel: "El último día que cediste",
    dateHint:
      "¿Empiezas de cero? Deja la fecha de hoy. ¿Cambias de móvil o retomas donde lo dejaste? Elige el último día que cediste y el contador seguirá desde ahí.",
    dateInFuture: "Esa fecha está en el futuro.",
    photosTitle: "Tus motivos",
    photosIntro:
      "Cuando estés a punto de ceder, Aurion te mostrará primero la foto de alguien a quien quieres, o una foto tuya en un momento feliz. Cada foto es un momento más para pensarlo.",
    photosEmpty: "Aún no hay fotos. Toca + para añadir algunas.",
    photosLater: "Puedes añadirlas o cambiarlas más tarde en Ajustes.",
    sceneLater: "Puedes cambiarla más tarde en Ajustes.",
    start: "¡Empezamos!",
  },

  photos: {
    label: "Fotos",
    add: "Añadir fotos",
    loading: "Cargando…",
    remove: (name) => `Quitar ${name}`,
  },

  scenes: {
    title: "Pantalla de inicio",
    hint: "La imagen detrás de tu contador de días, y cómo crece.",
    sky: {
      name: "Cielo nocturno",
      description:
        "Una estrella nueva cada día. Cuando cedes, pasan nubes durante un tiempo.",
    },
    cherry: {
      name: "Cerezo",
      description: "Una flor nueva cada día. Cuando cedes, una cae al suelo.",
    },
  },

  home: {
    daysWithout: (days) => (days === 1 ? "día sin" : "días sin"),
    since: (date) => `Desde el ${date}`,
    aboutToGiveIn: "Estoy a punto de ceder",
    stats: "Estadísticas",
    settings: "Ajustes",
  },

  areYouSure: {
    title: "¿De verdad quieres hacerlo?",
    promise: "Le hiciste una promesa a alguien a quien quieres.",
    doingIt: "Lo hago",
    changedMind: "He cambiado de idea",
  },

  stats: {
    title: "Estadísticas",
    journeyStarted: "Inicio del camino",
    journeyDays: "Días en tu camino",
    journeyDaysCaption:
      "Cada día cuenta, incluso los difíciles: nunca vuelve a cero.",
    longest: "Racha más larga sin ceder",
    longestIsCurrent: "Es tu racha actual.",
    average: "Racha media sin ceder",
    neverGivenIn: "Aún no has cedido.",
    timesGivenIn: "Veces que has cedido",
    timesChangedMind: "Veces que has cambiado de idea",
  },

  settings: {
    title: "Ajustes",
    photosEmpty:
      "Aún no hay fotos. Añade a las personas por las que lo haces, o una foto tuya en un momento feliz.",
    language: "Idioma",
    languageAuto: "Automático",
    languageHint: "«Automático» sigue el idioma de tu móvil.",
    showStats: "Mostrar estadísticas",
    showStatsHint:
      "Una pantalla con tu racha más larga y tu racha media sin ceder. Desactivada por defecto para que no se convierta en una puntuación.",
    share: "Compartir la app",
    shareHint:
      "Un código QR que lleva a la app, para que alguien cerca de ti pueda escanearlo e instalarla.",
    shareButton: "Compartir",
    shareTitle: "Compartir Aurion",
    shareBody: "Escanea el código para abrir e instalar la app.",
    qrLabel: "Código QR que lleva a la app",
    restart: "Empezar de nuevo",
    restartHint:
      "Borra tu historial y tus estadísticas y pone el contador a cero, empezando desde hoy. Las fotos se quedan.",
    restartButton: "Empezar de nuevo",
    restartTitle: "¿Empezar de nuevo?",
    restartBody:
      "Tu historial y tus estadísticas se borrarán para siempre y el contador volverá a cero. No se puede deshacer.",
  },
};
