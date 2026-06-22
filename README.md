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
4. A panel appears (bottom-right). Click:
   - **Run All** – reveal + unlock + go perfect (and max stats)
   - **Max Stats**, **Reveal Stats**, **Unlock All**, **Go Perfect**, **Scan**, **Undo**
   - **Block Leaderboard** toggle (ON by default)
5. Finish the draft and sim the season to land 82-0.

The panel is draggable, collapses to a pill, isolates its own styles (Shadow DOM),
and is safe to paste more than once.

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
hook states, and dispatches new values into the ones that look like a lineup,
the settings object, or a win/loss record. Network writes to
Firestore/leaderboard/score endpoints are intercepted (`fetch` + `XHR`) and
stubbed with a `200 {}` while blocking is on.

## Verification

`cheat820-gui.js` and its one-line build are tested in real headless Chrome via
the DevTools Protocol (`Runtime.evaluate` — exactly what pasting into the console
does) against a mock React-fiber page. The suite checks: install + API surface,
GUI button → real state mutation, Shadow-DOM style isolation against hostile page
CSS, default leaderboard blocking, idempotent re-paste, undo, and graceful
behavior when no React tree is present. See `tests/README.md`.
