# Cheat820

Browser-console helper for the **82-0** NBA game (a React app). It reads the
game's React state directly and lets you max stats, reveal/unlock content, and
rewrite your record to a perfect **82-0** — with an optional floating GUI panel
so you don't have to type console commands. Leaderboard/score writes are blocked
by default so nothing you do gets submitted.

> For personal/offline tinkering and learning how React state hacking works.
> Don't use it to pollute shared leaderboards — that's why writes are blocked by
> default.

## Files

| File | What it is |
| --- | --- |
| `cheat820-gui.js` | **The GUI build** — embedded engine + floating Shadow-DOM control panel. Readable source. |
| `cheat820-gui-oneline.js` | The GUI build minified to a **single line** — paste this into the console. |
| `cheat820.js` | Console-only engine (full): `scan`, `maxStats`, `revealStats`, `unlockAll`, `goPerfect`, `all`, `undo`, `blockLeaderboard`. |
| `cheat820-min.js` | Smaller console-only engine (subset of the above). |
| `cheat820-oneline.js` | `cheat820-min.js` minified to one line. |
| `tests/` | Real-Chrome verification harness (see below). |

## Use the GUI (recommended)

1. Open the 82-0 game page.
2. Open DevTools → **Console**.
3. Paste the entire contents of **`cheat820-gui-oneline.js`** and press Enter.
4. A panel appears (top-left). Click:
   - **Run All** – reveal + unlock + max your roster (→ 82-0)
   - **Max Stats**, **Reveal Stats**, **Unlock All**, **Go Perfect**, **Undo**
   - **Block Leaderboard** toggle (ON by default)

Every action applies **instantly**, even in the middle of a pick. **Unlock All**
flips `testMode`/`hardMode` live without disrupting your current pick (it no longer
touches `testModeTeamSelection`, which would reset the draft). The 82-0 record is
**derived from your roster** — there is no win/loss field to set — so **Go Perfect**
(and **Max Stats**) max your drafted players and the rating saturates to 82-0.

The panel is draggable and collapses to a pill: in the pill the **×** is hidden so a
stray tap can't destroy it — click the **□** button (or tap the pill) to reopen. It
isolates its own styles (Shadow DOM) and is safe to paste more than once. **Undo**
always works — it replays the changes it recorded (immutable React state), even if
the React tree can't be re-detected at that moment.

## Use the console engine (no GUI)

Paste `cheat820.js` (or the one-line `cheat820-oneline.js`), then:

```js
cheat820.all();          // reveal + unlock + go perfect
cheat820.maxStats();     // max every player's stats
cheat820.scan();         // console.table of detected React state
cheat820.undo();         // revert changes made this session
cheat820.blockLeaderboard(false); // allow score submission again
```

## How it works

It walks the React fiber tree (`__reactFiber$…`), enumerates each component's
hook states, and dispatches new values into the ones that look like the roster
(position-keyed players) or the settings object. The game stores these as plain
immutable `useState`, read live every render, so a dispatch applies instantly and
re-dispatching a captured previous value reverts it (that's how Undo works). The
win/loss record isn't stored — it's derived from the roster — so the cheat reaches
82-0 by maxing the players, not by setting a record. Network writes to
Firestore/leaderboard/score endpoints are intercepted (`fetch` + `XHR`) and stubbed
with a `200 {}` while blocking is on.

## Verification

`cheat820-gui.js` and its one-line build are tested in real headless Chrome via
the DevTools Protocol (`Runtime.evaluate` — exactly what pasting into the console
does) against a mock React-fiber page. The suite checks: install + API surface,
GUI button → real state mutation, Shadow-DOM style isolation against hostile page
CSS, default leaderboard blocking, idempotent re-paste, undo, and graceful
behavior when no React tree is present. See `tests/README.md`.
