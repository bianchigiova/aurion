# Aurion

_Aurion_ (αὔριον) is Ancient Greek for "tomorrow".

A small personal PWA to support staying away from an addiction — drugs,
alcohol, smoking or anything else. It keeps a big, always-visible
count of days without, and puts a deliberate pause — a photo of someone you love and
a reminder of a promise — between the impulse and the act.

## How it works

- **Welcome** — shown once, on first install. Asks for the last day you gave in, so
  you don't have to start from zero (handy when moving to a new phone). Leave it
  as today to start fresh; future dates aren't accepted.
- **Home** — large day counter (`days without`) plus `Since <date>`.
  The count is calendar days since a stored start timestamp, so it ticks over at
  local midnight and advances on its own (it also refreshes when you reopen or
  refocus the app). A high-water mark keeps it from slipping backwards if you
  cross into an earlier timezone. A cogwheel (top-right) opens Settings; the red
  button starts the "are you sure?" flow.
- **Are you sure?** — shows a random photo from your library and
  `You made a promise to <name>.`
  - `I'm doing it` → a deliberate hurdle: it takes one click per photo before it
    goes through, stepping to the next photo (with rollover) and filling like a
    progress bar each time. On the final click it resets the counter to 0 and
    returns home.
  - `I changed my mind` → just returns home.
- **Settings** — set the name of the person you made the promise to, add or
  remove photos, and restart the journey (a confirm dialog first) — which clears
  the history and stats and resets the counter to zero from today. Photos and the
  promise name are kept.

## Data & privacy

Everything stays on your device. The name and start date live in `localStorage`;
photos live in IndexedDB as blobs. Nothing is uploaded anywhere.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the built app (installable PWA, works offline)
```

## Stack

React + TypeScript + Vite, `vite-plugin-pwa` for the manifest and offline service
worker. No routing library — screens are a small state machine in `src/App.tsx`.
