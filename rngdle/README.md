# RNGdle Cheat

A Cookie-Clicker-style **console "cheat"** for [RNGdle](https://www.rngdle.com) — the
daily random-number game (roll a number 0–1,000,000, earn badges, climb the
leaderboard). Paste one file into the browser DevTools console and a floating
**GUI panel** appears: roll any number you want, collect every badge, and re-roll
as many times as you like.

> Built for personal/offline tinkering and to learn how the game works.
> It is **leaderboard-safe by default** — see [Safety & honesty](#safety--honesty).
> Don't use it to pollute the shared leaderboard.

## TL;DR — use it

1. Open <https://www.rngdle.com>.
2. Open DevTools → **Console**.
3. Paste the entire contents of **`rngdle-cheat-oneline.js`** and press Enter.
4. A purple panel appears (top-right). Type a number → **Roll it**, or tap a
   **Legendary** chip (69, 666, 1337, 777, 1,000,000…). **Unlock / Re-roll**
   clears the daily limit so you can keep going.

The panel is draggable, collapses to a pill, isolates its own styles (Shadow DOM),
and is safe to paste more than once.

## How RNGdle actually works (and what that means for cheating)

Reverse-engineered from the live bundle:

| | Guest (logged out) | Logged in |
|---|---|---|
| Who picks the number | **Your browser** — `Math.floor(1000001 * Math.random())` | **The server** (`rollDiceAction`); the client sends no number |
| Who computes badges/score | Your browser (`analyzeNumber`) | The server |
| Daily "one roll" lock | `localStorage['rngdle_guest_roll_date']` | Server (`/api/home → hasRolledToday`) |
| Counts on the leaderboard | **No** (guest rolls never are) | **Yes** |

So the cheat works **two different ways**:

- **As a guest** it does the real thing: it hijacks `Math.random` for exactly one
  roll and then fires the game's *own* roll handler, so the game rolls **the number
  you chose** and computes the **real** badges/score for it — then persists it like
  any normal guest roll. Authentic, just local-only.
- **Logged in** the number is server-issued and **cannot be forced** onto the
  leaderboard (that's the server protecting itself — it's why *other* people can't
  forge your leaderboard either). So the cheat paints a **faithful local spoof**:
  your chosen number with its **correct badges** (computed by the ported scoring in
  `rngdle-scoring.js`), shown on screen. It resets on reload and never hits the server.

> Want a chosen logged-in roll to *actually count*? That requires a **server-side**
> change to `rollDiceAction` (which you can make if you own the backend) — a console
> script can't, by design.

## Files

| File | What it is |
| --- | --- |
| `rngdle-cheat-oneline.js` | **The file you paste** — scoring engine + cheat engine + floating Shadow-DOM panel, bundled into one self-contained blob. |
| `rngdle-cheat.js` | Readable source of the cheat engine + GUI (uses the scoring engine for logged-in badges). |
| `rngdle-scoring.js` | Standalone port of RNGdle's badge/score logic (`analyzeNumber`, `composeRollResult`) — all 204 badges, validated against the game's own embedded test vectors (1945/1945). The slim percentile lookup table is omitted (the game computes percentile itself). |
| `tests/` | Real-Chrome verification harness (DevTools-Protocol paste against a mock fiber page). 31 checks, all green. |

## Console API (`window.rngdle`)

The GUI just calls these — you can use them directly too:

```js
rngdle.scan();            // report: guest vs logged-in, daily lock, current result
rngdle.setNumber(1337);   // guest: really rolls 1337; logged-in: faithful local spoof
rngdle.maxRoll();         // setNumber(1000000)
rngdle.reroll();          // clear the daily lock so you can roll again
rngdle.analyze(80085);    // {number, badges, scoringBadges, totalScore} — no UI change
rngdle.setDisplay(777);   // paint a number on screen (display-only, auto-scored badges)
rngdle.blockLeaderboard(true);  // safe mode (default ON)
rngdle.undo();            // revert everything this session
```

## Legendary numbers

Quick-pick chips that each earn a named badge (full catalog in the game):

`69` NICE · `420` BOTANIST · `666` DEVIL · `777` JACKPOT · `1337` LEET ·
`8008` BOOB · `350` TREE FIDDY · `911` EMERGENCY · `1984` BIG BROTHER ·
`12345` STRAIGHT · `123456` SEQUENCE · `1000000` MAX.

## Safety & honesty

- **Block submissions** (ON by default) intercepts the social/leaderboard *writes*
  — `submitPoem` and hearts (`toggleHeart`) — by their `next-action` request header,
  so messing around never posts anything. Reads are left alone.
- Guest rolls are **never** submitted to the leaderboard by the game, so nothing you
  do as a guest can pollute it regardless.
- Logged-in rolls are **server-authoritative**; the cheat does not (and cannot) forge
  them onto the leaderboard. The logged-in feature is an honest **display-only** spoof.

## How it works (internals)

The cheat walks the React fiber tree (`__reactFiber$…`) to find the game component's
hooks and the GENERATE button's `onRoll` handler. To roll a chosen number as a guest
it overrides `Math.random` for one call — `(n + 0.5) / 1000001` makes
`Math.floor(1000001 * Math.random())` land exactly on `n` — then triggers the real
handler so the game scores it authentically. The daily lock is cleared via
`localStorage`. Leaderboard-write requests are recognized by the Next.js
`next-action` header and stubbed while safe mode is on. `rngdle-scoring.js` is a
faithful port of the game's own `analyzeNumber`/badge predicates, validated against
the `tests:{match,reject}` vectors embedded in the bundle.

## Verification

`tests/run.mjs` drives a real headless Chrome over the DevTools Protocol and pastes
the script with `Runtime.evaluate` — exactly what pasting into the console does —
against a mock fiber page. It checks install + API surface, GUI mount, Shadow-DOM
style isolation, default submission-blocking, that **Roll it** forces the exact
number and the game computes its badges, re-roll/lock-bypass, the logged-in spoof,
undo, idempotent re-paste, and graceful behavior with no React tree. See
`tests/README.md`.
