# Aurion

_Aurion_ (αὔριον) is Ancient Greek for "tomorrow".

A small personal PWA to support staying away from an addiction — drugs,
alcohol, smoking or anything else. It keeps a big, always-visible
count of days without, and puts a deliberate pause — a photo of someone you
love, or yourself, happy and proud — between the impulse and the act.

## How it works

- **Welcome** — a short setup, shown once, on first install (restarting the
  journey later doesn't bring it back):
  1. The last day you gave in, so you don't have to start from zero (handy when
     moving to a new phone). Leave it as today to start fresh; future dates
     aren't accepted.
  2. Your photos, with a word on what they're for.
  3. The home screen scene.

  The counter only starts on the last step, so leaving halfway brings setup
  back next time. To see setup again on a device that's already set up, open
  the app with `?setup` in the URL; finishing it then goes home without
  touching the counter (photos and the scene picked along the way do stick).
- **Home** — large day counter (`days without`) plus `Since <date>`.
  The count is calendar days since a stored start timestamp, so it ticks over at
  local midnight and advances on its own (it also refreshes when you reopen or
  refocus the app). A high-water mark keeps it from slipping backwards if you
  cross into an earlier timezone. A cogwheel (top-right) opens Settings; the red
  button starts the "are you sure?" flow.
- **Are you sure?** — shows a random photo from your library and
  `You made a promise to someone you love.`
  - `I'm doing it` → a deliberate hurdle: it takes one click per photo before it
    goes through, stepping to the next photo (with rollover) and filling like a
    progress bar each time. On the final click it resets the counter to 0 and
    returns home.
  - `I changed my mind` → just returns home.
- **Home screen scenes** — the picture behind the counter, picked in Settings:
  - _Night sky_ (default): a new star every day of the journey; after a relapse
    a cloud drifts over for a while and fades.
  - _Cherry tree_: starts bare and grows a blossom every day; each relapse
    makes one fall to the ground, where it stays (nothing falls from a bare
    tree). Once every branch is in bloom, further days add leaves. Blossom
    spots come from `scripts/tree-mounts.py`, and the blossom sprites are cut
    from the sakura sheet by `scripts/blossom-sprites.py` — re-run them if the
    art changes.

  Scenes live in `src/scenes.ts`; adding one is a component plus an entry there.
- **Settings** — choose the home screen scene and the language, add or remove
  photos, and restart the journey (a confirm dialog first) — which clears the
  history and stats and resets the counter to zero from today. Photos are kept.

## Languages

English, German, Spanish, French, Italian and Modern Greek. By default the app follows the phone's
language (falling back to English); Settings can pin one instead. Each
language is a file in `src/i18n/` — `en.ts` is the source, and TypeScript
won't build if another language is missing a message. Dates and durations
("1 anno, 3 mesi") come from the browser's `Intl` APIs. To add a language,
copy `en.ts`, translate it, and list it in `src/i18n/index.tsx`.

## Data & privacy

Everything stays on your device. The start date lives in `localStorage`;
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
