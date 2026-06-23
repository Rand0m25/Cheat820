(function () {
  "use strict";

  /* ============================================================
   * 82-0 CHEAT GUI — FINAL
   * Single self-contained IIFE: embedded cheat engine (faithful to
   * cheat820.js) + floating Shadow-DOM control panel. ES5-compatible,
   * dependency-free, idempotent on re-paste.
   *
   * Sanctioned globals: window.cheat820, window.__c820net, and the
   * panel host element id (c820-gui-host). The engine owns its own
   * log-sink list (cheat820.__sinks) so no extra global is leaked.
   * ============================================================ */

  var ST = "background:#16a34a;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold";

  /* ---- Standalone React-root finder, owned by this script so the
   * GUI never depends on the engine exporting root(). Used both to
   * (a) install onto/repair the engine and (b) detect tree presence
   * for the status header regardless of which engine is installed. */
  function localRoot() {
    // Scan ALL elements (not just body descendants) and accept either modern
    // (__reactFiber$) or legacy (__reactInternalInstance$) fiber keys, so the
    // root is found across React versions and app shells.
    var els = document.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var ks = Object.keys(els[i]), key = null;
      for (var j = 0; j < ks.length; j++) {
        if (ks[j].indexOf("__reactFiber$") === 0 || ks[j].indexOf("__reactInternalInstance$") === 0) { key = ks[j]; break; }
      }
      if (key) { var f = els[i][key]; while (f && f.return) f = f.return; return f; }
    }
    return null;
  }

  /* ============================================================
   * PART 1 — EMBEDDED CHEAT ENGINE (window.cheat820)
   * Installed once. On reuse, a possibly-older engine (e.g. the
   * raw cheat820.js) is UPGRADED in place so the GUI's assumptions
   * (root, isLeaderboardBlocked, log sinks) always hold.
   * ============================================================ */

  if (!window.cheat820) {
    window.cheat820 = (function () {
      var sinks = [];
      function emit(line) {
        for (var i = 0; i < sinks.length; i++) {
          try { sinks[i](line); } catch (e) {}
        }
      }
      function stringifySafe(v) {
        if (typeof v === "string") return v;
        try { return JSON.stringify(v); } catch (e) { return String(v); }
      }
      function log(m, x) {
        if (x !== undefined) console.log("%c82-0", ST, m, x);
        else console.log("%c82-0", ST, m);
        try { emit((x !== undefined) ? (m + " " + stringifySafe(x)) : m); } catch (e) {}
      }

      var undo = [];
      function root() { return localRoot(); }
      function hooks() {
        var r = root();
        if (!r) { log("no React tree - open a game page first"); return []; }
        var out = [], stack = [r], seen = new Set();
        while (stack.length) {
          var f = stack.pop();
          if (!f || seen.has(f)) continue;
          seen.add(f);
          if (typeof f.type === "function" || typeof f.type === "object") {
            var name = (f.type && (f.type.displayName || f.type.name)) || "anon";
            var h = f.memoizedState, i = 0;
            while (h && typeof h === "object" && "memoizedState" in h && "next" in h) {
              var d = h.queue && h.queue.dispatch;
              if (d) {
                (function (node, nm, ix, disp) {
                  out.push({ component: nm, index: ix, get value() { return node.memoizedState; }, dispatch: disp });
                })(h, name, i, d);
              }
              h = h.next; i++; if (i > 300) break;
            }
          }
          if (f.child) stack.push(f.child);
          if (f.sibling) stack.push(f.sibling);
        }
        return out;
      }
      function set(h, v) { undo.push({ d: h.dispatch, p: h.value }); try { h.dispatch(v); return true; } catch (e) { return false; } }
      function copy(o) { var c = {}, k; for (k in o) c[k] = o[k]; return c; }
      function isPlayer(o) { return o && typeof o === "object" && !Array.isArray(o) && ("ppg" in o || "pts" in o); }
      function isLineupObj(v) { if (!v || typeof v !== "object" || Array.isArray(v)) return false; var ks = Object.keys(v); for (var i = 0; i < ks.length; i++) if (isPlayer(v[ks[i]])) return true; return false; }
      function isSettings(v) { return v && typeof v === "object" && !Array.isArray(v) && ("testMode" in v) && (("hardMode" in v) || ("enabledDecades" in v)); }
      function isRecObj(v) { return v && typeof v === "object" && !Array.isArray(v) && ((typeof v.wins === "number" && typeof v.losses === "number") || (typeof v.w === "number" && typeof v.l === "number")); }
      function isRecStr(v) { return typeof v === "string" && /^\d{1,2}\s*-\s*\d{1,2}$/.test(v.trim()); }
      var MAX = { ppg: 99, pts: 99, rpg: 99, reb: 99, apg: 99, ast: 99, spg: 99, stl: 99, bpg: 99, blk: 99 };
      function maxP(p) { var c = copy(p), k; for (k in c) { var lk = k.toLowerCase(); if (MAX[lk] !== undefined && typeof c[k] === "number") c[k] = MAX[lk]; } return c; }

      var api = {};
      api.hooks = hooks;
      api.root = root;
      // log-sink registry: GUI panels register/unregister appenders here
      api.__sinks = sinks;
      api.__addSink = function (fn) { if (typeof fn === "function" && sinks.indexOf(fn) === -1) sinks.push(fn); };
      api.__removeSink = function (fn) { var i = sinks.indexOf(fn); if (i !== -1) sinks.splice(i, 1); };

      api.scan = function () {
        var rows = hooks().map(function (h, i) {
          var p; try { p = JSON.stringify(h.value, function (k, v) { return typeof v === "function" ? "[fn]" : v; }); } catch (e) { p = String(h.value); }
          if (p && p.length > 160) p = p.slice(0, 160) + "...";
          var g = isLineupObj(h.value) ? "LINEUP" : isSettings(h.value) ? "SETTINGS" : (isRecObj(h.value) || isRecStr(h.value)) ? "RECORD" : "";
          return { row: i, component: h.component, type: Array.isArray(h.value) ? "array(" + h.value.length + ")" : typeof h.value, guess: g, preview: p };
        });
        console.table(rows);
        log("scan: " + rows.length + " hook(s)");
        return rows;
      };
      api.maxStats = function () {
        var n = 0; hooks().forEach(function (h) {
          var v = h.value;
          if (isLineupObj(v)) { var nv = {}, k; for (k in v) nv[k] = isPlayer(v[k]) ? maxP(v[k]) : v[k]; set(h, nv); n++; }
          else if (Array.isArray(v) && v.some(isPlayer)) { set(h, v.map(function (p) { return isPlayer(p) ? maxP(p) : p; })); n++; }
        });
        log("maxStats: maxed " + n + " lineup(s)"); return n;
      };
      api.revealStats = function () {
        var n = 0; hooks().forEach(function (h) { if (isSettings(h.value)) { var nv = copy(h.value); nv.testMode = true; set(h, nv); n++; } });
        log("revealStats: ratings shown via testMode in " + n + " settings"); return n;
      };
      api.unlockAll = function () {
        var n = 0; hooks().forEach(function (h) {
          if (isSettings(h.value)) {
            var nv = copy(h.value);
            nv.testMode = true;            // reveal ratings + boosted scoring
            nv.hardMode = false;           // allow skipping team/decade
            if ("ballKnowledgeMode" in nv) nv.ballKnowledgeMode = false; // stop hiding stats
            if (Array.isArray(nv.enabledDecades)) nv.enabledDecades = ["60's", "70's", "80's", "90's", "00's", "10's", "20's"];
            // Do NOT touch testModeTeamSelection: flipping it mid-draft switches
            // the screen mode and disrupts the pick you're in the middle of.
            set(h, nv); n++;
          }
        });
        log("unlockAll: " + n + " setting(s) unlocked (applies instantly)"); return n;
      };
      api.goPerfect = function () {
        // The 82-0 record is DERIVED from your roster (there is no stored
        // win/loss state to set), so "Go Perfect" = max every drafted player.
        // The team rating then saturates and the record reads 82-0 instantly.
        // (If a record-style state ever exists, set it too — harmless no-op here.)
        var rec = 0; hooks().forEach(function (h) {
          var v = h.value;
          if (isRecObj(v)) { var nv = copy(v); if ("wins" in nv) { nv.wins = 82; nv.losses = 0; } if ("w" in nv) { nv.w = 82; nv.l = 0; } set(h, nv); rec++; }
          else if (isRecStr(v)) { set(h, "82-0"); rec++; }
        });
        var m = api.maxStats();
        api.goPerfect.lastMaxed = m;
        api.goPerfect.lastRec = rec;
        log("goPerfect: maxed " + m + " lineup(s)" + (rec ? (" + " + rec + " record(s)") : "") + ". A maxed five = 82-0 (record is derived from your roster).");
        return m;
      };
      api.goPerfect.lastMaxed = 0;
      api.goPerfect.lastRec = 0;
      api.all = function () {
        var reveal = api.revealStats();
        var unlock = api.unlockAll();
        var maxed = api.goPerfect();
        return { reveal: reveal, unlock: unlock, maxed: maxed };
      };
      api.undo = function () { var n = 0; while (undo.length) { var u = undo.pop(); try { u.d(u.p); n++; } catch (e) {} } log("undo: reverted " + n); return n; };

      var block = true;
      api.blockLeaderboard = function (on) { block = on !== false; log("leaderboard " + (block ? "BLOCKED" : "ALLOWED")); return block; };
      api.isLeaderboardBlocked = function () { return block; };
      function isWrite(u) { return typeof u === "string" && ((/firestore\.googleapis\.com/i.test(u) && /(Write|commit)/i.test(u)) || /leaderboard|submit|\/score/i.test(u)); }
      if (!window.__c820net) {
        window.__c820net = true;
        var of = window.fetch;
        window.fetch = function (input, init) {
          var u = typeof input === "string" ? input : (input && input.url);
          var m = (init && init.method) || (input && input.method) || "GET";
          if (block && /post|put|patch/i.test(m) && isWrite(u)) { log("blocked write", u); return Promise.resolve(new Response("{}", { status: 200, headers: { "content-type": "application/json" } })); }
          return of.apply(this, arguments);
        };
        var xo = XMLHttpRequest.prototype.open, xs = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (m, u) { this.__c = { m: m, u: u }; return xo.apply(this, arguments); };
        XMLHttpRequest.prototype.send = function () {
          if (block && this.__c && /post|put|patch/i.test(this.__c.m) && isWrite(this.__c.u)) {
            log("blocked XHR", this.__c.u);
            Object.defineProperty(this, "readyState", { value: 4, configurable: true });
            Object.defineProperty(this, "status", { value: 200, configurable: true });
            var s = this; setTimeout(function () { if (s.onreadystatechange) s.onreadystatechange(); if (s.onload) s.onload(); }, 0);
            return;
          }
          return xs.apply(this, arguments);
        };
      }
      log("installed [ok] - leaderboard BLOCKED. Try cheat820.all()");
      return api;
    })();
  } else {
    // Engine already present (possibly the raw cheat820.js that lacks
    // root/isLeaderboardBlocked/log-sinks). Upgrade it in place so the
    // GUI works regardless of which engine installed first.
    var ce = window.cheat820;
    if (!ce.root) ce.root = localRoot;
    if (!ce.isLeaderboardBlocked) {
      // Old engines don't expose the block flag. Derive it from
      // blockLeaderboard()'s return value (it returns the new state).
      ce.isLeaderboardBlocked = function () {
        try { return ce.blockLeaderboard(ce.__lbState !== false); } catch (e) { return true; }
      };
    }
    if (!ce.__sinks) {
      // Old engines have no sink registry. Add a no-op-safe one; old
      // log() won't push to it, but new actions (if any) and the GUI
      // side appendLog still work.
      ce.__sinks = [];
      ce.__addSink = function (fn) { if (typeof fn === "function" && ce.__sinks.indexOf(fn) === -1) ce.__sinks.push(fn); };
      ce.__removeSink = function (fn) { var i = ce.__sinks.indexOf(fn); if (i !== -1) ce.__sinks.splice(i, 1); };
    }
    try { console.log("%c82-0", ST, "engine already installed - reused & upgraded"); } catch (e) {}
  }

  /* ============================================================
   * PART 2 — FLOATING GUI PANEL (Shadow DOM, draggable card)
   * Draggable card with collapse-to-pill, status header, per-action
   * count badges, leaderboard toggle, and an expandable log tray.
   * ============================================================ */

  var HOST_ID = "c820-gui-host";
  var cheat = window.cheat820;

  // GUI-owned leaderboard state, seeded from the engine. Reading
  // isLeaderboardBlocked() on a fresh engine is non-destructive; on
  // an upgraded old engine we fall back to the seeded value.
  var lbBlocked = true;
  try {
    if (cheat && cheat.isLeaderboardBlocked) lbBlocked = !!cheat.isLeaderboardBlocked();
  } catch (e) { lbBlocked = true; }

  // --- Idempotency: remove any prior panel and detach its listeners ---
  (function removeOld() {
    var old = document.getElementById(HOST_ID);
    if (old) {
      if (old.__c820cleanup) { try { old.__c820cleanup(); } catch (e) {} }
      if (old.parentNode) old.parentNode.removeChild(old);
    }
  })();

  // --- Host element + Shadow DOM for full style isolation ---
  // Host owns only stacking + a fixed anchor; the .card owns its own
  // placement relative to the viewport (also position:fixed). The
  // host carries no width/height so it never intercepts page clicks.
  var host = document.createElement("div");
  host.id = HOST_ID;
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.margin = "0";
  host.style.padding = "0";
  host.style.border = "0";
  host.style.zIndex = "2147483647";

  var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  // --- Stylesheet (scoped inside shadow root) ---
  // ':host{all:initial}' is intentionally overridden by the inline
  // host styles above (inline beats :host) — isolation stays intact.
  var style = document.createElement("style");
  style.textContent = [
    ":host{ all: initial; }",
    "*{ box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }",
    ".card{",
    "  position: fixed; top: max(20px, env(safe-area-inset-top)); left: max(20px, env(safe-area-inset-left));",
    "  width: 320px; background: #0b1220; color: #f8fafc;",
    "  border: 2px solid #16a34a; border-radius: 12px;",
    "  box-shadow: 0 10px 40px rgba(0,0,0,.6);",
    "  font-size: 13px; line-height: 1.4; overflow: hidden;",
    "}",
    ".hdr{",
    "  display: flex; align-items: center; gap: 8px;",
    "  background: #16a34a; color: #ffffff; padding: 8px 10px;",
    "  cursor: move; touch-action: none; user-select: none; -webkit-user-select: none;",
    "}",
    ".hdr .title{ font-weight: 800; font-size: 14px; letter-spacing: .5px; flex: 1; }",
    ".hdr button{",
    "  background: rgba(255,255,255,.18); color: #fff; border: 1px solid rgba(255,255,255,.5);",
    "  width: 26px; height: 24px; border-radius: 6px; cursor: pointer; font-weight: 800; font-size: 14px;",
    "  padding: 0;",
    "}",
    ".hdr button:hover{ background: rgba(255,255,255,.35); }",
    ".hdr button:focus{ outline: 3px solid #fde047; outline-offset: 1px; }",
    ".body{ padding: 10px; }",
    ".status{",
    "  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;",
    "  padding: 8px; border-radius: 8px; background: #111c30; border: 1px solid #1e293b;",
    "}",
    ".status .dot{ width: 12px; height: 12px; border-radius: 50%; flex: 0 0 auto; }",
    ".status .dot.ok{ background: #22c55e; box-shadow: 0 0 8px #22c55e; }",
    ".status .dot.bad{ background: #ef4444; box-shadow: 0 0 8px #ef4444; }",
    ".status .txt{ flex: 1; font-size: 12px; }",
    ".status .txt b{ color: #fde047; }",
    ".status button{",
    "  background: #1d4ed8; color: #fff; border: 1px solid #93c5fd; border-radius: 6px;",
    "  padding: 4px 8px; cursor: pointer; font-weight: 700; font-size: 12px;",
    "}",
    ".status button:hover{ background: #2563eb; }",
    ".status button:focus{ outline: 3px solid #fde047; outline-offset: 1px; }",
    ".cta{ margin-bottom: 8px; }",
    ".grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }",
    ".act{",
    "  position: relative; display: flex; align-items: center; justify-content: center;",
    "  background: #1e293b; color: #f8fafc; border: 1px solid #334155;",
    "  border-radius: 8px; padding: 9px 8px; cursor: pointer; font-weight: 700; font-size: 12.5px;",
    "  min-height: 38px; text-align: center; width: 100%;",
    "}",
    ".act:hover{ background: #334155; border-color: #64748b; }",
    ".act:focus{ outline: 3px solid #fde047; outline-offset: 1px; }",
    ".act.primary{ background: #16a34a; border-color: #22c55e; color: #ffffff; font-size: 14px; min-height: 42px; }",
    ".act.primary:hover{ background: #15803d; }",
    ".badge{",
    "  position: absolute; top: -7px; right: -7px; min-width: 20px; height: 20px;",
    "  padding: 0 5px; border-radius: 10px; background: #fde047; color: #111827;",
    "  font-size: 11px; font-weight: 800; line-height: 20px; text-align: center;",
    "  border: 2px solid #0b1220; display: none;",
    "}",
    ".badge.show{ display: block; }",
    ".toggle{",
    "  display: flex; align-items: center; gap: 8px; margin: 10px 0 0;",
    "  padding: 8px; border-radius: 8px; background: #111c30; border: 1px solid #1e293b;",
    "}",
    ".toggle label{ flex: 1; font-weight: 700; cursor: pointer; }",
    ".sw{",
    "  position: relative; width: 46px; height: 24px; border-radius: 999px;",
    "  background: #475569; cursor: pointer; border: 0; flex: 0 0 auto; transition: background .15s; padding: 0;",
    "}",
    ".sw:focus{ outline: 3px solid #fde047; outline-offset: 1px; }",
    ".sw .knob{",
    "  position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%;",
    "  background: #fff; transition: left .15s;",
    "}",
    ".sw.on{ background: #16a34a; }",
    ".sw.on .knob{ left: 24px; }",
    /* log tray (collapsible) */
    ".tray{ margin-top: 10px; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }",
    ".traybar{",
    "  display: flex; align-items: center; gap: 8px; padding: 7px 9px; cursor: pointer;",
    "  background: #111c30; user-select: none; -webkit-user-select: none;",
    "}",
    ".traybar .lbl{ flex: 1; font-weight: 700; font-size: 12px; }",
    ".traybar .cnt{",
    "  min-width: 20px; text-align: center; padding: 0 6px; height: 18px; line-height: 18px;",
    "  border-radius: 9px; background: #334155; color: #e2e8f0; font-size: 11px; font-weight: 800;",
    "}",
    ".traybar .car{ transition: transform .2s; font-size: 11px; color: #94a3b8; }",
    ".traybar:focus{ outline: 3px solid #fde047; outline-offset: -2px; }",
    ".traywrap{ max-height: 0; opacity: 0; transition: max-height .25s ease, opacity .25s ease; }",
    ".tray.open .traywrap{ max-height: 172px; opacity: 1; }",
    ".tray.open .traybar .car{ transform: rotate(180deg); }",
    ".console{",
    "  height: 132px; overflow-y: auto; padding: 8px;",
    "  background: #020617; border-top: 1px solid #1e293b;",
    "  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 11px;",
    "  color: #cbd5e1; white-space: pre-wrap; word-break: break-word;",
    "}",
    ".console .ln{ padding: 1px 0; border-bottom: 1px solid rgba(148,163,184,.08); }",
    ".console .ln:last-child{ border-bottom: 0; }",
    ".console .ln.warn{ color: #fca5a5; }",
    ".clearbtn{",
    "  width: 100%; background: #334155; color: #e2e8f0; border: 0; border-top: 1px solid #475569;",
    "  padding: 5px; cursor: pointer; font-weight: 700; font-size: 11px;",
    "}",
    ".clearbtn:hover{ background: #475569; }",
    ".clearbtn:focus{ outline: 3px solid #fde047; outline-offset: -2px; }",
    /* collapsed-to-pill state: hide everything but a compact pill */
    ".card.pill{ width: auto; border-radius: 999px; }",
    ".card.pill .body{ display: none; }",
    ".card.pill .hdr{ padding: 7px 12px; border-radius: 999px; cursor: pointer; }",
    /* In the collapsed pill, HIDE close (×) and KEEP the minimize/expand button,
       so a stray tap can't destroy the panel and there's always a clear way back. */
    ".card.pill .hdr .cls{ display: none; }",
    ".card.pill .hdr .title{ font-size: 13px; }"
  ].join("\n");
  shadow.appendChild(style);

  // --- Build the card DOM ---
  var card = document.createElement("div");
  card.className = "card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-label", "82-0 cheat panel");

  // Header
  var hdr = document.createElement("div");
  hdr.className = "hdr";
  var title = document.createElement("div");
  title.className = "title";
  title.textContent = "82-0 CHEAT";
  var btnMin = document.createElement("button");
  btnMin.type = "button";
  btnMin.className = "min";
  btnMin.title = "Collapse to pill / expand";
  btnMin.setAttribute("aria-label", "Collapse or expand panel");
  btnMin.textContent = "−"; // minus sign
  var btnClose = document.createElement("button");
  btnClose.type = "button";
  btnClose.title = "Close panel (engine stays active)";
  btnClose.setAttribute("aria-label", "Close panel");
  btnClose.className = "cls";
  btnClose.textContent = "×"; // multiplication X
  hdr.appendChild(title);
  hdr.appendChild(btnMin);
  hdr.appendChild(btnClose);
  card.appendChild(hdr);

  // Body
  var body = document.createElement("div");
  body.className = "body";

  // Status header
  var status = document.createElement("div");
  status.className = "status";
  var dot = document.createElement("div");
  dot.className = "dot bad";
  var statusTxt = document.createElement("div");
  statusTxt.className = "txt";
  statusTxt.textContent = "Checking…";
  status.appendChild(dot);
  status.appendChild(statusTxt);
  body.appendChild(status);

  // Helper to build an action button with a count badge
  function makeAction(label, opts) {
    opts = opts || {};
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "act" + (opts.primary ? " primary" : "");
    var span = document.createElement("span");
    span.textContent = label;
    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "";
    btn.appendChild(span);
    btn.appendChild(badge);
    btn.__badge = badge;
    return btn;
  }
  function showBadge(btn, value) {
    if (!btn || !btn.__badge) return;
    btn.__badge.textContent = String(value);
    btn.__badge.className = "badge show";
  }

  // Primary full-width CTA stacked above the secondary action grid
  var btnRunAll = makeAction("Run All", { primary: true });
  var cta = document.createElement("div");
  cta.className = "cta";
  cta.appendChild(btnRunAll);
  body.appendChild(cta);

  var grid = document.createElement("div");
  grid.className = "grid";
  var btnMax = makeAction("Max Stats");
  var btnReveal = makeAction("Reveal Stats");
  var btnUnlock = makeAction("Unlock All");
  var btnPerfect = makeAction("Go Perfect");
  var btnUndo = makeAction("Undo");
  grid.appendChild(btnMax);
  grid.appendChild(btnReveal);
  grid.appendChild(btnUnlock);
  grid.appendChild(btnPerfect);
  grid.appendChild(btnUndo);
  body.appendChild(grid);

  // Leaderboard toggle
  var toggleWrap = document.createElement("div");
  toggleWrap.className = "toggle";
  var toggleLabel = document.createElement("label");
  toggleLabel.textContent = "Block Leaderboard";
  toggleLabel.id = "c820-lb-label";
  var sw = document.createElement("button");
  sw.type = "button";
  sw.className = "sw";
  sw.setAttribute("role", "switch");
  sw.setAttribute("aria-labelledby", "c820-lb-label");
  var knob = document.createElement("span");
  knob.className = "knob";
  sw.appendChild(knob);
  toggleWrap.appendChild(toggleLabel);
  toggleWrap.appendChild(sw);
  body.appendChild(toggleWrap);

  // Log tray (collapsible, with live line counter)
  var tray = document.createElement("div");
  tray.className = "tray open";
  var traybar = document.createElement("div");
  traybar.className = "traybar";
  traybar.setAttribute("role", "button");
  traybar.setAttribute("tabindex", "0");
  traybar.setAttribute("aria-expanded", "true");
  traybar.setAttribute("aria-label", "Toggle log");
  var trayLbl = document.createElement("span");
  trayLbl.className = "lbl";
  trayLbl.textContent = "Log";
  var trayCnt = document.createElement("span");
  trayCnt.className = "cnt";
  trayCnt.textContent = "0";
  var trayCar = document.createElement("span");
  trayCar.className = "car";
  trayCar.textContent = "▼";
  traybar.appendChild(trayLbl);
  traybar.appendChild(trayCnt);
  traybar.appendChild(trayCar);
  tray.appendChild(traybar);

  var traywrap = document.createElement("div");
  traywrap.className = "traywrap";
  var consoleEl = document.createElement("div");
  consoleEl.className = "console";
  consoleEl.setAttribute("role", "log");
  consoleEl.setAttribute("aria-live", "polite");
  traywrap.appendChild(consoleEl);
  var btnClear = document.createElement("button");
  btnClear.type = "button";
  btnClear.className = "clearbtn";
  btnClear.textContent = "Clear log";
  traywrap.appendChild(btnClear);
  tray.appendChild(traywrap);
  body.appendChild(tray);

  card.appendChild(body);
  shadow.appendChild(card);

  // Guarded mount: documentElement always exists even if <body> doesn't.
  var mount = document.body || document.documentElement;
  mount.appendChild(host);

  /* ---------------- Logging into the panel ---------------- */
  var logCount = 0;
  function appendLog(msg, isWarn) {
    var ln = document.createElement("div");
    ln.className = "ln" + (isWarn ? " warn" : "");
    var t = new Date();
    var ts = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2);
    ln.textContent = "[" + ts + "] " + msg;
    consoleEl.appendChild(ln);
    while (consoleEl.childNodes.length > 200) consoleEl.removeChild(consoleEl.firstChild);
    consoleEl.scrollTop = consoleEl.scrollHeight;
    logCount++;
    trayCnt.textContent = String(logCount);
  }

  // Engine log sink — registered on the engine's own sink registry.
  // Warn only on genuine failure signals; 'blocked'/'BLOCKED' are the
  // intended healthy default state and must NOT render as warnings.
  function panelSink(line) {
    var warn = /no React tree|cannot|fail(ed)?|error/i.test(line);
    appendLog(line, warn);
  }
  if (cheat && cheat.__addSink) cheat.__addSink(panelSink);

  btnClear.addEventListener("click", function () {
    while (consoleEl.firstChild) consoleEl.removeChild(consoleEl.firstChild);
    appendLog("log cleared");
  });

  // Tray expand/collapse
  function toggleTray() {
    var open = tray.classList.toggle("open");
    traybar.setAttribute("aria-expanded", open ? "true" : "false");
  }
  traybar.addEventListener("click", toggleTray);
  traybar.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault();
      toggleTray();
    }
  });

  /* ---------------- Status / refresh ---------------- */
  // Status uses our own localRoot() so it works on ANY engine. Hook
  // count uses cheat.hooks() (exported by every engine variant).
  function refreshStatus() {
    var found = false;
    try { found = !!localRoot(); } catch (e) { found = false; }
    if (found) { dot.className = "dot ok"; statusTxt.innerHTML = "Cheat <b>active</b>"; }
    else { dot.className = "dot bad"; statusTxt.innerHTML = "Open the <b>82-0</b> game first"; }
    return { found: found };
  }

  /* ---------------- Action wiring ---------------- */
  // Pre-action presence check gives a friendly hint instead of letting
  // the engine silently log 'no React tree'. Each handler shows a count
  // badge and a concise green result summary. Never throws.
  function ensureTree() {
    var found = false;
    try { found = !!localRoot(); } catch (e) { found = false; }
    if (!found) {
      refreshStatus();
      appendLog("no React tree yet - open a game page first", true);
    }
    return found;
  }
  function engineReady() { return !!window.cheat820; }

  function runAction(btn, name, fn, summarize) {
    if (!engineReady()) { appendLog("engine not available", true); return; }
    if (!ensureTree()) { showBadge(btn, "0"); return; }
    try {
      var res = fn();
      var summary = summarize ? summarize(res) : { badge: res, line: name + ": done" };
      if (summary && (typeof summary.badge === "number" || typeof summary.badge === "string")) showBadge(btn, summary.badge);
      if (summary && summary.line) appendLog(summary.line);
      // refresh status without an extra fiber walk when we can reuse count
      refreshStatus();
    } catch (e) {
      appendLog("action error: " + (e && e.message ? e.message : e), true);
      showBadge(btn, "!");
    }
  }

  btnRunAll.addEventListener("click", function () {
    runAction(btnRunAll, "Run All", function () { return cheat.all(); }, function (r) {
      r = r || {};
      var reveal = r.reveal || 0, unlock = r.unlock || 0, maxed = r.maxed || 0;
      return {
        badge: reveal + unlock + maxed,
        line: "Run All: revealed " + reveal + ", unlocked " + unlock + ", maxed " + maxed + " lineup(s) → 82-0"
      };
    });
  });
  btnMax.addEventListener("click", function () {
    runAction(btnMax, "Max Stats", function () { return cheat.maxStats(); }, function (n) {
      return { badge: n, line: "Max Stats: maxed " + n + " lineup(s)" };
    });
  });
  btnReveal.addEventListener("click", function () {
    runAction(btnReveal, "Reveal Stats", function () { return cheat.revealStats(); }, function (n) {
      return { badge: n, line: "Reveal Stats: " + n + " settings updated" };
    });
  });
  btnUnlock.addEventListener("click", function () {
    runAction(btnUnlock, "Unlock All", function () { return cheat.unlockAll(); }, function (n) {
      return { badge: n, line: "Unlock All: " + n + " settings unlocked" };
    });
  });
  btnPerfect.addEventListener("click", function () {
    runAction(btnPerfect, "Go Perfect", function () { return cheat.goPerfect(); }, function (n) {
      return { badge: n, line: "Go Perfect: maxed " + n + " lineup(s) → 82-0 (derived from roster)" };
    });
  });
  // Undo must NOT be gated behind tree detection: it just replays the setters
  // captured earlier, so it has to run even if the React root can't be located
  // at this instant. Always-runs, never throws.
  btnUndo.addEventListener("click", function () {
    if (!engineReady()) { appendLog("engine not available", true); return; }
    try {
      var n = cheat.undo();
      showBadge(btnUndo, n);
      appendLog(n > 0 ? ("Undo: reverted " + n + " change(s)") : "Undo: nothing to undo");
      refreshStatus();
    } catch (e) {
      appendLog("undo error: " + (e && e.message ? e.message : e), true);
      showBadge(btnUndo, "!");
    }
  });

  /* ---------------- Leaderboard toggle ---------------- */
  function syncToggle() {
    if (lbBlocked) { sw.classList.add("on"); sw.setAttribute("aria-checked", "true"); }
    else { sw.classList.remove("on"); sw.setAttribute("aria-checked", "false"); }
  }
  function toggleLeaderboard() {
    var next = !lbBlocked;
    try {
      if (cheat && cheat.blockLeaderboard) {
        var ret = cheat.blockLeaderboard(next);
        lbBlocked = (typeof ret === "boolean") ? ret : next;
        if (cheat) cheat.__lbState = lbBlocked; // assist upgraded old engines
      } else {
        lbBlocked = next;
      }
    } catch (e) {
      lbBlocked = next;
      appendLog("toggle error: " + (e && e.message ? e.message : e), true);
    }
    syncToggle();
    appendLog("leaderboard " + (lbBlocked ? "BLOCKED" : "ALLOWED"));
  }
  sw.addEventListener("click", toggleLeaderboard);

  /* ---------------- Viewport clamping ---------------- */
  function clampToViewport() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = card.offsetWidth, h = card.offsetHeight;
    var left = parseFloat(card.style.left);
    var top = parseFloat(card.style.top);
    // If not yet explicitly positioned, read computed rect.
    if (isNaN(left) || isNaN(top)) {
      var rect = card.getBoundingClientRect();
      if (isNaN(left)) left = rect.left;
      if (isNaN(top)) top = rect.top;
    }
    if (left > vw - w) left = vw - w;
    if (top > vh - h) top = vh - h;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  /* ---------------- Minimize (pill) / Close ---------------- */
  btnMin.addEventListener("click", function () {
    var pilled = card.classList.toggle("pill");
    btnMin.textContent = pilled ? "□" : "−";
    // re-clamp for the new (smaller/larger) card size
    clampToViewport();
  });
  function closePanel() {
    if (host.__c820cleanup) { try { host.__c820cleanup(); } catch (e) {} }
    if (host.parentNode) host.parentNode.removeChild(host);
    // de-register this panel's sink so a removed panel stops receiving logs
    try { if (cheat && cheat.__removeSink) cheat.__removeSink(panelSink); } catch (e) {}
    try { console.log("%c82-0", ST, "panel closed - engine still active (window.cheat820)"); } catch (e) {}
  }
  btnClose.addEventListener("click", closePanel);

  /* ---------------- Dragging (Pointer Events: mouse + touch) -------- */
  var dragging = false, offX = 0, offY = 0, dragId = null, moved = false, downX = 0, downY = 0;

  function expandPill() {
    if (!card.classList.contains("pill")) return false;
    card.classList.remove("pill");
    btnMin.textContent = "−";
    clampToViewport();
    return true;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    if (!moved && (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4)) moved = true;
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = card.offsetWidth, h = card.offsetHeight;
    var left = e.clientX - offX;
    var top = e.clientY - offY;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left > vw - w) left = Math.max(0, vw - w);
    if (top > vh - h) top = Math.max(0, vh - h);
    card.style.left = left + "px";
    card.style.top = top + "px";
  }
  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    try { if (dragId !== null && hdr.releasePointerCapture) hdr.releasePointerCapture(dragId); } catch (err) {}
    dragId = null;
    if (document.body) document.body.style.userSelect = "";
    // A tap (no real drag) on the collapsed pill expands it again. We use the
    // pointer sequence rather than a 'click' event because onPointerDown calls
    // preventDefault, which can suppress the synthetic click on the header.
    if (!moved) expandPill();
  }
  function onPointerDown(e) {
    // only primary button / primary pointer; ignore header buttons
    if (e.button !== undefined && e.button !== 0) return;
    if (e.isPrimary === false) return;
    if (e.target === btnMin || e.target === btnClose) return;
    dragging = true;
    moved = false;
    downX = e.clientX; downY = e.clientY;
    var rect = card.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dragId = (e.pointerId !== undefined) ? e.pointerId : null;
    try { if (dragId !== null && hdr.setPointerCapture) hdr.setPointerCapture(dragId); } catch (err) {}
    if (document.body) document.body.style.userSelect = "none";
    if (e.preventDefault) e.preventDefault();
  }

  var hasPointer = (typeof window.PointerEvent !== "undefined");
  if (hasPointer) {
    hdr.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
  } else {
    // Fallback for very old engines without Pointer Events
    hdr.addEventListener("mousedown", onPointerDown);
    document.addEventListener("mousemove", onPointerMove, true);
    document.addEventListener("mouseup", onPointerUp, true);
  }

  // Re-clamp the panel when the window shrinks so it can't be stranded.
  function onResize() { clampToViewport(); }
  window.addEventListener("resize", onResize);

  // Cleanup hook stored on host so a future re-paste can detach our
  // document/window-level listeners (prevents duplicate listeners).
  host.__c820cleanup = function () {
    if (hasPointer) {
      hdr.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
    } else {
      hdr.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("mousemove", onPointerMove, true);
      document.removeEventListener("mouseup", onPointerUp, true);
    }
    window.removeEventListener("resize", onResize);
    try { if (cheat && cheat.__removeSink) cheat.__removeSink(panelSink); } catch (e) {}
  };

  /* ---------------- Init ---------------- */
  syncToggle();
  refreshStatus();
  appendLog("panel ready. Engine: " + (window.cheat820 ? "ok" : "MISSING"), !window.cheat820);
  appendLog("leaderboard " + (lbBlocked ? "BLOCKED (default)" : "ALLOWED"));

})();
