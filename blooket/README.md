# BlooketBox — self-only Blooket trainer

A polished, client-side trainer GUI for Blooket — think Cookie-Clicker-style cheat
menu. It runs entirely in **your** browser and touches only **your** client,
account, and screen.

> **Design preview:** https://claude.ai/design/p/6f55bac0-8612-4dc2-85ba-7d8db892b63a?file=BlooketBox+Panel.dc.html

## Scope & ethics (read first)

- Everything here affects **only your own client / account / screen**.
- **No** bots, spam, kicking, lag, crashing, or anything that touches other
  players' sessions. None of that exists in the code, by design.
- A client-side script **cannot** change what renders on other people's devices —
  **except** through fields Blooket itself syncs to everyone:
  - your **own nickname** (allowed characters only), and
  - your **own owned blook**.
  Those are the only "make it look cool to others" levers, and they're honest:
  they go through Blooket's normal flow.
- Every control in the panel is tagged so you always know what it does:
  - `DISPLAY-ONLY` — changes only your screen; resets on reload.
  - `SERVER-SYNCED` — a real authenticated write to **your** account.
  - `RISK` — server-synced **and** the kind of thing anti-cheat watches. These are
    **off by default** and clamped to conservative amounts. Use at your own risk.

This is a casual-game trainer, comparable to a single-player game trainer/userscript.
It is not for use where it would count as academic dishonesty — that's on you.

## Install (userscript — recommended)

1. Install a userscript manager: **Tampermonkey** (Chrome/Edge) or **Violentmonkey** (Firefox).
2. Open the manager → **Create a new script** → paste the contents of
   [`blooket-trainer.user.js`](./blooket-trainer.user.js) → **Save**.
   (Or open the `.user.js` file directly and the manager will offer to install it.)
3. Go to **blooket.com** / **play.blooket.com**. The **BlooketBox** panel appears
   top-right. Drag it anywhere; it remembers where you put it.

> The script uses `@grant none` on purpose — it must run in the page's own context
> to read React state. Don't add `@grant GM_*`; that sandboxes it and the game
> features go dark.

### One-click bookmarklet (no install, no hosting)
The whole script is encoded into a single bookmark link — nothing to host.

1. Open [`install.html`](./install.html) in your browser.
2. **Drag** the “BlooketBox” button onto your bookmarks bar.
3. Go to blooket.com / a game and **click** the bookmark.

(Or copy the contents of [`bookmarklet.txt`](./bookmarklet.txt) and paste it as the
URL of a new bookmark.) To regenerate after editing the script: `node make-bookmarklet.js`.

Caveats: a bookmarklet runs once per page load (not persistent), and if a site
blocks injected scripts via a strict Content-Security-Policy it may not run — you’ll
get a small alert telling you to use the userscript or console instead.

### No-install fallback (console)
Open DevTools (F12) → **Console** → paste the whole file → Enter. Works once per
page load (not persistent). Some managed Chromebooks disable the console.

## Features

| Tab | Feature | Scope |
|---|---|---|
| Player | Set tokens / Set XP (rewrites your own end-of-game reward, clamped) | `RISK` |
| Player | **Set in-game currency** — gold/cash/tokens/coins/fossils/etc. for the current mode (your own client) | `SERVER-SYNCED` |
| Player | Claim daily reward · Reflect owned blooks | `SERVER-SYNCED` / `DISPLAY-ONLY` |
| Game | Answer highlighter / Answer reveal / Question peek | `DISPLAY-ONLY` |
| Game | Auto-answer (multiple-choice **and** typing) + human-delay slider | `RISK`, off by default |
| Cosmetics | Theme accent hue, confetti, animated background, cursor trail | `DISPLAY-ONLY` |
| Cosmetics | Fancy nickname · **Blook chooser** (searchable grid of 120+ blooks) | `SERVER-SYNCED` |
| Settings | Master switch, panel opacity, panic key, log viewer, reset | — |

### How the cheats actually work
The trainer reads the **live React component instance** (the standard Blooket access path — walk `body>div` to the wrapper whose `Object.values(el)[1].children[0]._owner.stateNode` is the game component) and uses its real `state`/`props`:
- **Answer assist** reads `state.question` / `props.client.question` (`answers`, `correctAnswers`, `qType`), highlights/clicks the right `answerContainer` tile by index, and submits typing questions via the typing component's own `sendAnswer`. It only acts while the question is answerable (gated on `state.stage`).
- **In-game currency** calls `stateNode.setState({...})` with the right key per mode (`gold`, `cash`, `cafeCash`, `crypto`, `weight`, `fossils`, `coins`, `tokens`, …) and, in live games, syncs **only your own node** via `liveGameController.setVal({ path: 'c/<your name>', ... })`.
- **Blook chooser** sets your own in-game blook through `liveGameController.setVal({ path: 'c/<your name>/b', val })` — your node only, which Blooket then shows to everyone. Account-level permanent ownership still requires actually owning the blook (opening Market boxes); this changes your *in-game* blook.

### GUI upgrades
Feature **search/filter** bar, **collapsible** section cards (state persisted), a live **status strip** (mode · role · active features · daily token/XP used), per-row **help tooltips**, and the searchable **blook picker grid**.

> ⚠️ **Not included by request:** anything that puts text/effects on *other* players' screens or alters their game. The trainer never writes to another player's node — only your own. The one honest way others see a change is your own server-synced nickname/blook.

## Hotkeys

| Key | Action |
|---|---|
| `` ` `` (backtick) | Show / hide the panel |
| `F2` | Master switch (all features) on / off |
| `Shift` + `Esc` | Panic — hide everything instantly |

You can also minimize to the floating button (bottom-right) and click it to reopen.

## How it works (architecture)

Single self-contained file, internally organized into modules:

- **state-bridge** — the *only* place that touches the network or game state.
  Installs resilient `fetch` / history hooks at `document-start`, and reads the
  live question/economy from React by **finding the fiber by key-prefix** and
  walking it for the right **data shape** (never hardcoded indexes or minified
  names). Only ever clones *your own* requests.
- **mode-detector** — figures out the current mode/screen/role from data signatures
  and re-runs on every route change.
- **registry** — feature lifecycle gated on `master ∧ per-feature toggle ∧ mode`.
  Every feature is isolated in try/catch so one broken feature can't kill the menu.
- **ui/panel** — the GUI in a **Shadow DOM** (`:host{all:initial}`) so Blooket's
  CSS can't leak in and ours can't leak out. Built with pure DOM APIs (no
  `innerHTML`/`eval`) so it survives strict CSP / Trusted Types. Mounted on
  `<html>` with a self-heal observer so SPA re-renders never remove it.

## Known limitations & fragility

Blooket ships a minified, frequently-updated React build. Some things **will**
need adjusting after a Blooket update — handled defensively (features degrade to a
clean no-op and the footer shows status rather than crashing):

- **Answer-assist / auto-answer** depend on the question + correct answer being in
  client memory. If a mode doesn't expose it, the feature simply does nothing.
- **Token/XP setters** rewrite your own outgoing reward request. The server has the
  final say: it can clamp or reject implausible values, and hammering it can flag
  your account. They're clamped and off by default for this reason.
- **Server-synced cosmetics** must pass Blooket's own validation (name filter,
  owned-blook check).
- Tested for **syntax + safety lint** only; live behavior against the current
  Blooket build hasn't been verified end-to-end here. Treat selectors/state-shape
  as the parts most likely to need a tweak.

## Uninstall / panic

- Toggle the master switch off, or remove the script in your userscript manager.
- `BlooketBox.eject` is also exposed: run `window.__BX.eject()` in the console to
  fully tear down (restores `fetch`, removes the panel and all listeners).
