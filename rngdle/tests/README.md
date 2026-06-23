# Verification harness

Serves a mock fiber page (`page.html`) over a tiny local HTTP server — so the
`rngdle_user` hint cookie used for logged-in detection actually works — drives a
real Chrome over the DevTools Protocol, and pastes the cheat with
`Runtime.evaluate` at top scope, **exactly what pasting into the devtools console
does**.

`page.html` builds a React fiber tree shaped like RNGdle's home component: a
component `L` with hooks `[ rollResult, analysis, lock(bool), anim(bool),
revealed(int) ]` and a GENERATE button whose `memoizedProps.onRoll` is the real
guest roll handler (`Math.floor(1000001*Math.random())` → stub scorer →
localStorage), so the script's `Math.random` hijack can be observed forcing an
exact number.

## Run

```bash
cd tests
npm install                 # puppeteer-core only — no bundled browser download
node run.mjs                # tests ../rngdle-cheat.js
node run.mjs ../rngdle-cheat-oneline.js   # tests the one-line paste build
```

Requires a system Chrome/Chromium. Default path is `/usr/bin/google-chrome`;
override with `CHROME_PATH=/path/to/chrome node run.mjs`.

## What it checks

1. **Install / API** — paste throws nothing, `window.rngdle` and all methods
   exist, the Shadow-DOM panel mounts with its buttons.
2. **Style isolation** — `page.html` sets a hostile global
   `button { font-size: 40px !important }`; the panel's buttons must ignore it
   (Shadow DOM) and the host must sit at a high `z-index`.
3. **Submissions blocked by default** — a `next-action` `submitPoem` POST is
   stubbed (`success:false`); the `rollDiceAction` header is **not** blocked.
4. **Guest force-roll** — `setNumber(777777)` fires the real handler so the
   number lands exactly, the game scores its badges (JACKPOT), and it persists
   to the guest localStorage keys.
5. **Re-roll** — a second `setNumber` bypasses the daily lock.
6. **Logged-in spoof** — with the `rngdle_user` cookie set, `setNumber` is a
   display-only spoof (no real roll) and `scan()` reports `LOGGED-IN`.
7. **Undo** — reverts the result back to `null`.
8. **Idempotent re-paste** — pasting twice leaves exactly one panel and patches
   `fetch` only once (`window.__rngnet`).
9. **No React tree** — pasting on a non-React page doesn't throw and actions stay
   harmless.
10. **Scoring port** — `rngdle-scoring.js`'s `analyzeNumber` earns the right
    badges (69→NICE, 666→DEVIL, 1337→LEET, 777→JACKPOT) and scores 1,000,000 > 0.
    (The port is also validated against the game's full embedded match/reject
    vectors when it is generated.)
