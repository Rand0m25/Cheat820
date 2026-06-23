# Verification harness

Drives a real Chrome over the DevTools Protocol and pastes the cheat script with
`Runtime.evaluate` at top scope — **exactly what pasting into the devtools console
does** — against `page.html`, a mock page that builds a React fiber tree shaped
like the real game (a lineup of players, a settings object, and a win/loss
record, each exposed through a `__reactFiber$…` hook chain).

## Run

```bash
cd tests
npm install                 # puppeteer-core only — no bundled browser download
node run.mjs                # tests ../cheat820-gui.js
node run.mjs ../cheat820-gui-oneline.js   # tests the minified one-liner
```

Requires a system Chrome/Chromium. Default path is `/usr/bin/google-chrome`;
override with `CHROME_PATH=/path/to/chrome node run.mjs`.

## What it checks

1. **Install / API** — paste throws nothing, `window.cheat820` and all engine
   methods exist, the Shadow-DOM panel mounts with its buttons.
2. **Style isolation** — `page.html` sets a hostile global `button { font-size:
   40px !important }`; the panel's buttons must ignore it (Shadow DOM) and the
   host must sit at a high `z-index`.
3. **Leaderboard blocked by default** — a `POST` to a `/leaderboard/` URL is
   intercepted and stubbed `200 {}`.
4. **GUI clicks mutate real state** — clicking Reveal / Unlock / Max Stats / Go
   Perfect / Run All changes the mock fiber state (testMode on, decades expanded,
   `ppg`→60, record→`82-0`, etc.).
5. **Undo** — Max Stats then Undo restores the original value.
6. **Idempotent re-paste** — pasting twice leaves exactly one panel and patches
   `fetch`/`XHR` only once (`window.__c820net`).
7. **No React tree** — pasting on a non-React page doesn't throw and buttons stay
   harmless.

Both `cheat820-gui.js` and `cheat820-gui-oneline.js` pass all 35 checks.
