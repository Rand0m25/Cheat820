(function () {
  "use strict";

  /* ============================================================
   * RNGdle CHEAT — engine + floating GUI, single self-contained IIFE.
   * ES5-compatible, dependency-free, idempotent on re-paste.
   *
   * HOW THE GAME WORKS (reverse-engineered from the live bundle):
   *  - A guest's daily roll is generated 100% client-side:
   *        rollRandomNumber() === Math.floor(1000001 * Math.random())   // 0..1,000,000
   *    then the game's own analyzeNumber()/composeRollResult() compute
   *    the badges + score from that number. The "one roll per day" lock
   *    is just localStorage['rngdle_guest_roll_date'] === today (UTC).
   *  - A logged-in user's roll is issued by the SERVER (server action
   *    `rollDiceAction`); the client only displays what the server sends.
   *
   * WHAT THIS CHEAT DOES (and doesn't):
   *  - For GUESTS: it hijacks Math.random for exactly one roll and then
   *    triggers the game's OWN roll handler, so the game rolls the number
   *    YOU choose and computes the REAL badges/score for it — fully
   *    authentic, and it persists to localStorage like a normal guest roll.
   *  - It can clear the daily lock so you can roll as many times as you like.
   *  - For LOGGED-IN users the number is server-issued and CANNOT be forced;
   *    setNumber() falls back to a local display-only spoof and says so.
   *  - "Block submissions" (ON by default) stops the social/leaderboard
   *    writes (poem submit, hearts) so messing around never posts anything.
   *    Guest rolls are never submitted anyway.
   *
   * Sanctioned globals: window.rngdle, window.__rngnet (fetch-patch guard),
   * and the panel host element id (rng-cheat-host).
   * ============================================================ */

  var ST = "background:#7c3aed;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold";
  var MAXN = 1000000; // inclusive upper bound of a roll (0..1,000,000)

  // The two statically-known server-action ids (Next-Action header values).
  var ACTION_ROLL = "00aa1221b1e3f98828fa7aec2ea1c272c3f9c8d3be"; // rollDiceAction (authoritative; NOT blocked)
  var ACTION_POEM = "40c06977b686c043b8dd3c31de7c21867ef7d3bff6"; // submitPoem (a leaderboard write -> blocked)

  // Guest localStorage keys (verbatim from the game).
  var K_DATE = "rngdle_guest_roll_date";
  var K_DATA = "rngdle_guest_roll_data";
  var K_TOKEN = "rngdle_guest_claim_token";

  /* ---- React-root finder, owned by this script (so the GUI never depends
   * on the engine exporting it). Walks up from any DOM node carrying a
   * __reactFiber$… key to the fiber root. */
  function localRoot() {
    var els = document.querySelectorAll("body *");
    for (var i = 0; i < els.length; i++) {
      var key = Object.keys(els[i]).find(function (k) { return k.indexOf("__reactFiber$") === 0; });
      if (key) { var f = els[i][key]; while (f.return) f = f.return; return f; }
    }
    return null;
  }

  /* ============================================================
   * PART 1 — ENGINE (window.rngdle)
   * ============================================================ */

  if (!window.rngdle) {
    window.rngdle = (function () {

      var sinks = [];
      function emit(line) { for (var i = 0; i < sinks.length; i++) { try { sinks[i](line); } catch (e) {} } }
      function ssafe(v) { if (typeof v === "string") return v; try { return JSON.stringify(v); } catch (e) { return String(v); } }
      function log(m, x) {
        if (x !== undefined) console.log("%cRNGdle", ST, m, x); else console.log("%cRNGdle", ST, m);
        try { emit((x !== undefined) ? (m + " " + ssafe(x)) : m); } catch (e) {}
      }

      var undo = []; // stack of revert thunks

      function root() { return localRoot(); }

      // Collect the dispatchable (useState/useReducer) hooks of one fiber, in order.
      function dispatchables(fiber) {
        var out = [], h = fiber && fiber.memoizedState, i = 0;
        while (h && typeof h === "object" && "memoizedState" in h && "next" in h) {
          if (h.queue && typeof h.queue.dispatch === "function") out.push(h);
          h = h.next; i++; if (i > 400) break;
        }
        return out;
      }

      // Generic flat hook scan (used by scan()).
      function allHooks() {
        var r = root();
        if (!r) return [];
        var out = [], stack = [r], seen = new Set();
        while (stack.length) {
          var f = stack.pop();
          if (!f || seen.has(f)) continue;
          seen.add(f);
          var name = (f.type && (f.type.displayName || f.type.name)) || "anon";
          dispatchables(f).forEach(function (h, ix) {
            out.push({ component: name, index: ix, get value() { return h.memoizedState; }, dispatch: h.queue.dispatch });
          });
          if (f.child) stack.push(f.child);
          if (f.sibling) stack.push(f.sibling);
        }
        return out;
      }

      // A roll-result value looks like { number:int 0..1e6, badges:[], totalScore:number }.
      function isRollResult(v) {
        return !!v && typeof v === "object" && !Array.isArray(v) &&
          typeof v.number === "number" && v.number >= 0 && v.number <= MAXN &&
          Array.isArray(v.badges) && (typeof v.totalScore === "number" || typeof v.score === "number");
      }
      // The analysis value looks like { number, scoringBadges:[], totalScore }.
      function isAnalysis(v) {
        return !!v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.scoringBadges);
      }

      // Find the main game component fiber + its roll-result hook (E).
      // Strategy 1: a result is on screen -> the hook whose value isRollResult.
      // Strategy 2 (pre-roll / logged-in idle): walk up from the GENERATE
      // button's fiber to the ancestor that owns the roll-result useState
      // (E is its 1st dispatchable hook, value null before a roll). This lets
      // us inject a spoofed result even when no result is currently shown.
      function findGameFiber() {
        var r = root();
        if (!r) return null;
        var stack = [r], seen = new Set();
        while (stack.length) {
          var f = stack.pop();
          if (!f || seen.has(f)) continue;
          seen.add(f);
          var hs = dispatchables(f);
          for (var i = 0; i < hs.length; i++) {
            if (isRollResult(hs[i].memoizedState)) return { hooks: hs, eIdx: i, e: hs[i] };
          }
          if (f.child) stack.push(f.child);
          if (f.sibling) stack.push(f.sibling);
        }
        return findGameFiberViaButton();
      }
      function findGameFiberViaButton() {
        // locate the fiber carrying onRoll, climb to an ancestor with >=3
        // dispatchable hooks whose 1st is null/rollResult — that's component L.
        var rt = root();
        if (!rt) return null;
        var btnFiber = null, stack = [rt], seen = new Set();
        while (stack.length) {
          var f = stack.pop();
          if (!f || seen.has(f)) continue;
          seen.add(f);
          if (f.memoizedProps && typeof f.memoizedProps.onRoll === "function") { btnFiber = f; break; }
          if (f.child) stack.push(f.child);
          if (f.sibling) stack.push(f.sibling);
        }
        if (!btnFiber) return null;
        var a = btnFiber.return, guard = 0;
        while (a && guard++ < 60) {
          var hs = dispatchables(a);
          if (hs.length >= 3 && (hs[0].memoizedState === null || isRollResult(hs[0].memoizedState))) {
            return { hooks: hs, eIdx: 0, e: hs[0] };
          }
          a = a.return;
        }
        return null;
      }

      // The game's "GENERATE" button is a child component with an onRoll prop.
      // Its onRoll IS the real roll handler (eU) — we can call it directly.
      function findRollHandler() {
        var r = root();
        if (!r) return null;
        var stack = [r], seen = new Set();
        while (stack.length) {
          var f = stack.pop();
          if (!f || seen.has(f)) continue;
          seen.add(f);
          var p = f.memoizedProps;
          if (p && typeof p.onRoll === "function") return p.onRoll;
          if (f.child) stack.push(f.child);
          if (f.sibling) stack.push(f.sibling);
        }
        return null;
      }

      // Fallback: the DOM button whose label is GENERATE.
      function findGenerateButton() {
        var bs = document.querySelectorAll("button");
        for (var i = 0; i < bs.length; i++) {
          if (/generate|roll/i.test((bs[i].textContent || ""))) return bs[i];
        }
        return null;
      }

      function setHook(h, v) {
        if (!h) return false;
        var prev = h.memoizedState;
        undo.push(function () { try { h.queue.dispatch(prev); } catch (e) {} });
        try { h.queue.dispatch(v); return true; } catch (e) { return false; }
      }

      function todayUTC() { return new Date().toISOString().split("T")[0]; }

      function snapshotGuest() {
        var snap = {}; try {
          snap[K_DATE] = localStorage.getItem(K_DATE);
          snap[K_DATA] = localStorage.getItem(K_DATA);
          snap[K_TOKEN] = localStorage.getItem(K_TOKEN);
        } catch (e) {}
        undo.push(function () {
          try { Object.keys(snap).forEach(function (k) { snap[k] == null ? localStorage.removeItem(k) : localStorage.setItem(k, snap[k]); }); } catch (e) {}
        });
      }

      function clearGuestLock() {
        try { localStorage.removeItem(K_DATE); localStorage.removeItem(K_DATA); localStorage.removeItem(K_TOKEN); } catch (e) {}
      }

      // The game decides logged-in vs guest purely by the presence of the
      // `rngdle_user` HINT COOKIE: base64url(JSON({id,displayName,displayNameColor})).
      // (The real session is a separate HTTP-only better-auth cookie JS can't read.)
      function getUserHint() {
        try {
          var m = (document.cookie || "").match(/(?:^|;\s*)rngdle_user=([^;]+)/);
          if (!m) return null;
          var raw = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
          var obj = JSON.parse(typeof atob === "function" ? atob(raw) : "");
          return (obj && typeof obj.id === "string") ? obj : null;
        } catch (e) { return null; }
      }
      function isGuest() { return !getUserHint(); }

      // Scoring engine (RNGdle's own logic, ported + validated). Used to paint
      // CORRECT badges on a logged-in display spoof. Resolved lazily so the
      // cheat still works if the scoring block isn't embedded.
      function scoring() { return window.RNGDLE_SCORING || (typeof RNGDLE_SCORING !== "undefined" ? RNGDLE_SCORING : null); }
      function scoreFor(n) {
        var sc = scoring();
        if (sc && typeof sc.composeRollResult === "function") {
          try { var r = sc.composeRollResult(n); return { badges: r.badges || [], totalScore: (r.totalScore != null ? r.totalScore : 0) }; } catch (e) {}
        }
        return { badges: [], totalScore: 0 };
      }

      // One-shot Math.random override so the next roll lands on `n`.
      function withForcedNumber(n, fn) {
        var orig = Math.random;
        var used = false;
        Math.random = function () {
          if (!used) { used = true; return (n + 0.5) / (MAXN + 1); } // floor((MAXN+1)*r) === n
          return orig.apply(this, arguments);
        };
        try { return fn(); } finally {
          // restore after the synchronous guest roll has consumed the value
          try { if (Math.random !== orig) Math.random = orig; } catch (e) {}
        }
      }

      // Reset the on-screen result back to the GENERATE state (so a new roll
      // can be triggered) and clear the guest daily lock.
      function resetToRollReady() {
        snapshotGuest();
        clearGuestLock();
        var g = findGameFiber();
        if (g) {
          // E (roll result) -> null clears the result view
          setHook(g.e, null);
          // the lock is the first boolean dispatchable after E in the same fiber
          for (var i = g.eIdx + 1; i < g.hooks.length; i++) {
            if (typeof g.hooks[i].memoizedState === "boolean") { setHook(g.hooks[i], false); break; }
          }
        }
        return !!g;
      }

      var api = {};
      api.root = root;
      api.hooks = allHooks;
      api.__sinks = sinks;
      api.__addSink = function (fn) { if (typeof fn === "function" && sinks.indexOf(fn) === -1) sinks.push(fn); };
      api.__removeSink = function (fn) { var i = sinks.indexOf(fn); if (i !== -1) sinks.splice(i, 1); };
      api.constants = { MAXN: MAXN, K_DATE: K_DATE, K_DATA: K_DATA, ACTION_ROLL: ACTION_ROLL, ACTION_POEM: ACTION_POEM };

      // --- report current state -------------------------------------------
      api.scan = function () {
        var g = findGameFiber();
        var guest = isGuest();
        var locked = false;
        try { locked = (localStorage.getItem(K_DATE) === todayUTC()); } catch (e) {}
        var cur = g ? g.e.memoizedState : null;
        var rows = [{
          account: guest ? "GUEST (fully cheatable)" : "LOGGED-IN (rolls are server-issued)",
          reactTree: root() ? "found" : "MISSING",
          resultOnScreen: cur ? (cur.number + " (" + (cur.badges ? cur.badges.length : 0) + " badges, score " + (cur.totalScore != null ? cur.totalScore : cur.score) + ")") : "none",
          guestDailyLock: locked ? "LOCKED (rolled today)" : "open",
          rollHandler: findRollHandler() ? "reachable" : (findGenerateButton() ? "button only" : "not on screen")
        }];
        try { console.table(rows); } catch (e) { console.log(rows[0]); }
        log("scan: " + rows[0].account + " · " + rows[0].guestDailyLock);
        return rows[0];
      };

      // --- clear the daily lock so you can roll again ----------------------
      api.reroll = function () {
        var had = resetToRollReady();
        log("reroll: daily lock cleared" + (had ? " + result reset — click GENERATE (or use setNumber)" : " — GENERATE is ready"));
        return true;
      };

      // --- THE headline: make the game roll a specific number --------------
      // Returns a Promise resolving to { ok, number, badges, totalScore, mode }.
      //  - GUEST: triggers a REAL roll forced to n; the game computes authentic
      //    badges/score and persists it locally. Fully real (just not on the
      //    global leaderboard, because guest rolls never are).
      //  - LOGGED-IN: the server owns the real roll, so we paint a faithful
      //    LOCAL spoof of n WITH correct badges (via the ported scoring). It
      //    looks real on screen, resets on reload, and never touches the server.
      api.setNumber = function (n) {
        n = Math.max(0, Math.min(MAXN, Math.floor(Number(n) || 0)));
        return new Promise(function (resolve) {
          if (!root()) { log("setNumber: no React tree — open rngdle.com first", true); return resolve({ ok: false, reason: "no-tree" }); }
          if (!isGuest()) {
            var s = scoreFor(n);
            var ok = api.setDisplay(n, s.badges, s.totalScore);
            log("setNumber: logged-in — server controls the real roll, so this is a faithful LOCAL spoof of " + n.toLocaleString() + " with " + s.badges.length + " real badge(s). Not saved, not on the leaderboard." + (s.badges.length || !ok ? "" : " (embed rngdle-scoring.js for badges)"));
            return resolve({ ok: ok, number: n, badges: s.badges, totalScore: s.totalScore, mode: "display-spoof" });
          }
          var guest = true;
          resetToRollReady();
          // let React re-render the GENERATE button before we trigger it
          setTimeout(function () {
            var handler = findRollHandler();
            var btn = handler ? null : findGenerateButton();
            if (!handler && !btn) {
              log("setNumber: couldn't reach the roll handler — falling back to display spoof", true);
              api.setDisplay(n);
              return resolve({ ok: false, number: n, mode: "display-spoof" });
            }
            withForcedNumber(n, function () { try { handler ? handler() : btn.click(); } catch (e) { log("setNumber: roll trigger failed " + (e && e.message), true); } });
            // verify after the roll settles
            setTimeout(function () {
              var g = findGameFiber();
              var got = g && g.e.memoizedState;
              if (got && got.number === n) {
                api.setNumber.last = got;
                log("setNumber: rolled " + n.toLocaleString() + " → " + (got.badges ? got.badges.length : 0) + " badge(s), score " + (got.totalScore != null ? got.totalScore : got.score));
                resolve({ ok: true, number: n, badges: got.badges, totalScore: got.totalScore, mode: guest ? "guest-roll" : "roll" });
              } else if (got) {
                log("setNumber: the server issued " + got.number.toLocaleString() + " instead — logged-in rolls can't be forced. Showing a display-only spoof of " + n.toLocaleString() + ".", true);
                api.setDisplay(n);
                resolve({ ok: false, number: n, served: got.number, mode: "display-spoof" });
              } else {
                log("setNumber: no result detected after rolling " + n, true);
                resolve({ ok: false, number: n, mode: "unknown" });
              }
            }, 120);
          }, 90);
        });
      };
      api.setNumber.last = null;

      // --- max it out -------------------------------------------------------
      api.maxRoll = function () { return api.setNumber(MAXN); };

      // --- pure display spoof (no real roll; for logged-in or instant set) --
      // If badges/score omitted, they're computed with the ported scoring so
      // the badge grid is correct. Works whether or not a result is on screen.
      api.setDisplay = function (n, badges, score) {
        n = Math.max(0, Math.min(MAXN, Math.floor(Number(n) || 0)));
        if (!badges) { var s = scoreFor(n); badges = s.badges; if (score == null) score = s.totalScore; }
        score = (score != null) ? score : 0;
        var g = findGameFiber();
        if (!g) { log("setDisplay: can't find the game component to overwrite (open the game page)", true); return false; }
        setHook(g.e, { number: n, badges: badges, totalScore: score });
        // analysis hook (next hook whose value is null or looks like analysis)
        for (var i = g.eIdx + 1; i < g.hooks.length; i++) {
          var v = g.hooks[i].memoizedState;
          if (v === null || isAnalysis(v)) { setHook(g.hooks[i], { number: n, badges: badges, scoringBadges: badges, totalScore: score }); break; }
        }
        // flip the first boolean hook after E (the daily lock) so the result view renders
        for (var j = g.eIdx + 1; j < g.hooks.length; j++) {
          if (typeof g.hooks[j].memoizedState === "boolean") { setHook(g.hooks[j], true); break; }
        }
        log("setDisplay: showing " + n.toLocaleString() + " with " + (badges ? badges.length : 0) + " badge(s) (display-only spoof)");
        return true;
      };

      // --- analyze any number with the ported scoring (no UI change) -------
      api.analyze = function (n) {
        var sc = scoring();
        if (!sc || typeof sc.analyzeNumber !== "function") { log("analyze: scoring engine not embedded", true); return null; }
        n = Math.max(0, Math.min(MAXN, Math.floor(Number(n) || 0)));
        var r = sc.analyzeNumber(n);
        log("analyze " + n.toLocaleString() + ": " + (r.badges ? r.badges.length : 0) + " badge(s), score " + r.totalScore);
        return r;
      };

      // --- undo every change made this session -----------------------------
      api.undo = function () { var k = 0; while (undo.length) { try { undo.pop()(); k++; } catch (e) {} } log("undo: reverted " + k + " change(s)"); return k; };

      // --- safe mode: block social/leaderboard writes ----------------------
      var block = true;
      api.blockLeaderboard = function (on) { block = on !== false; log("submissions " + (block ? "BLOCKED" : "ALLOWED")); return block; };
      api.isLeaderboardBlocked = function () { return block; };

      function actionIdOf(input, init) {
        function fromHeaders(h) {
          if (!h) return null;
          try {
            if (typeof h.get === "function") return h.get("next-action");
            if (Array.isArray(h)) { for (var i = 0; i < h.length; i++) if (String(h[i][0]).toLowerCase() === "next-action") return h[i][1]; return null; }
            for (var k in h) if (String(k).toLowerCase() === "next-action") return h[k];
          } catch (e) {}
          return null;
        }
        return fromHeaders(init && init.headers) || (input && input.headers ? fromHeaders(input.headers) : null);
      }

      if (!window.__rngnet) {
        window.__rngnet = true;
        var of = window.fetch;
        window.fetch = function (input, init) {
          try {
            if (block) {
              var aid = actionIdOf(input, init);
              if (aid && aid !== ACTION_ROLL) {
                // submitPoem / toggleHeart / other writes — stub a clean response
                var body = (aid === ACTION_POEM)
                  ? JSON.stringify({ success: false, error: "Blocked by RNGdle cheat (safe mode)" })
                  : JSON.stringify({ hearted: false, heartCount: 0 });
                log("blocked submission " + (aid === ACTION_POEM ? "(submitPoem)" : "(action " + String(aid).slice(0, 8) + "…)"));
                return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "application/json" } }));
              }
            }
          } catch (e) {}
          return of.apply(this, arguments);
        };
      }

      // Curated "legendary" numbers (each earns a named badge from the game).
      api.legendary = [
        { n: 69, name: "NICE" }, { n: 420, name: "BOTANIST" }, { n: 666, name: "DEVIL" },
        { n: 777, name: "JACKPOT" }, { n: 1337, name: "LEET" }, { n: 8008, name: "BOOB" },
        { n: 350, name: "TREE FIDDY" }, { n: 911, name: "EMERGENCY" }, { n: 1984, name: "BIG BROTHER" },
        { n: 12345, name: "STRAIGHT" }, { n: 123456, name: "SEQUENCE" }, { n: MAXN, name: "MAX" }
      ];

      log("installed ✓ — submissions BLOCKED (safe). Try rngdle.scan() or rngdle.setNumber(1000000)");
      return api;
    })();
  } else {
    try { console.log("%cRNGdle", ST, "engine already installed — reused"); } catch (e) {}
  }

  /* ============================================================
   * PART 2 — FLOATING GUI PANEL (Shadow DOM, draggable)
   * ============================================================ */

  var HOST_ID = "rng-cheat-host";
  var cheat = window.rngdle;

  var lbBlocked = true;
  try { if (cheat && cheat.isLeaderboardBlocked) lbBlocked = !!cheat.isLeaderboardBlocked(); } catch (e) { lbBlocked = true; }

  // Idempotency: remove any prior panel + detach its listeners.
  (function removeOld() {
    var old = document.getElementById(HOST_ID);
    if (old) { if (old.__rngCleanup) { try { old.__rngCleanup(); } catch (e) {} } if (old.parentNode) old.parentNode.removeChild(old); }
  })();

  var host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;margin:0;padding:0;border:0;z-index:2147483647";
  var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  var style = document.createElement("style");
  style.textContent = [
    ":host{ all: initial; }",
    "*{ box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }",
    ".card{ position: fixed; top: max(20px, env(safe-area-inset-top)); right: max(20px, env(safe-area-inset-right)); width: 320px; background:#160d27; color:#f5f3ff; border:2px solid #7c3aed; border-radius:14px; box-shadow:0 14px 48px rgba(0,0,0,.6); font-size:13px; line-height:1.4; overflow:hidden; }",
    ".hdr{ display:flex; align-items:center; gap:8px; background:linear-gradient(90deg,#7c3aed,#a855f7); color:#fff; padding:9px 11px; cursor:move; touch-action:none; user-select:none; -webkit-user-select:none; }",
    ".hdr .title{ font-weight:800; font-size:14px; letter-spacing:.6px; flex:1; }",
    ".hdr .dice{ font-size:15px; }",
    ".hdr button{ background:rgba(255,255,255,.18); color:#fff; border:1px solid rgba(255,255,255,.5); width:26px; height:24px; border-radius:6px; cursor:pointer; font-weight:800; font-size:14px; padding:0; }",
    ".hdr button:hover{ background:rgba(255,255,255,.35); }",
    ".hdr button:focus{ outline:3px solid #fde047; outline-offset:1px; }",
    ".body{ padding:11px; }",
    ".status{ display:flex; align-items:center; gap:8px; margin-bottom:10px; padding:8px; border-radius:8px; background:#1f1338; border:1px solid #3b2768; }",
    ".status .dot{ width:11px; height:11px; border-radius:50%; flex:0 0 auto; }",
    ".status .dot.ok{ background:#22c55e; box-shadow:0 0 8px #22c55e; }",
    ".status .dot.bad{ background:#ef4444; box-shadow:0 0 8px #ef4444; }",
    ".status .txt{ flex:1; font-size:11.5px; }",
    ".status .txt b{ color:#fde047; }",
    ".status button{ background:#6d28d9; color:#fff; border:1px solid #a78bfa; border-radius:6px; padding:4px 8px; cursor:pointer; font-weight:700; font-size:11px; }",
    ".status button:hover{ background:#7c3aed; }",
    ".rollrow{ display:flex; gap:8px; margin-bottom:8px; }",
    ".rollrow input{ flex:1; min-width:0; background:#0f0820; color:#f5f3ff; border:1px solid #3b2768; border-radius:8px; padding:9px 10px; font-size:14px; font-weight:700; font-family:ui-monospace,Menlo,Consolas,monospace; }",
    ".rollrow input:focus{ outline:2px solid #a855f7; }",
    ".act{ position:relative; display:flex; align-items:center; justify-content:center; background:#2a1a4d; color:#f5f3ff; border:1px solid #4c2f86; border-radius:8px; padding:9px 8px; cursor:pointer; font-weight:700; font-size:12.5px; min-height:38px; text-align:center; width:100%; }",
    ".act:hover{ background:#3a2568; border-color:#7c3aed; }",
    ".act:focus{ outline:3px solid #fde047; outline-offset:1px; }",
    ".act.primary{ background:linear-gradient(90deg,#7c3aed,#a855f7); border-color:#a855f7; color:#fff; font-size:14px; }",
    ".act.primary:hover{ filter:brightness(1.08); }",
    ".grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }",
    ".seclabel{ margin:12px 0 6px; font-size:10.5px; letter-spacing:1px; text-transform:uppercase; color:#a78bfa; font-weight:800; }",
    ".chips{ display:flex; flex-wrap:wrap; gap:6px; }",
    ".chip{ background:#0f0820; color:#ddd6fe; border:1px solid #4c2f86; border-radius:999px; padding:4px 9px; cursor:pointer; font-size:11px; font-weight:700; font-family:ui-monospace,Menlo,Consolas,monospace; }",
    ".chip:hover{ background:#2a1a4d; border-color:#a855f7; }",
    ".chip:focus{ outline:3px solid #fde047; outline-offset:1px; }",
    ".chip small{ display:block; font-size:8.5px; color:#a78bfa; letter-spacing:.5px; font-family:inherit; }",
    ".toggle{ display:flex; align-items:center; gap:8px; margin-top:12px; padding:8px; border-radius:8px; background:#1f1338; border:1px solid #3b2768; }",
    ".toggle label{ flex:1; font-weight:700; cursor:pointer; }",
    ".sw{ position:relative; width:46px; height:24px; border-radius:999px; background:#475569; cursor:pointer; border:0; flex:0 0 auto; transition:background .15s; padding:0; }",
    ".sw:focus{ outline:3px solid #fde047; outline-offset:1px; }",
    ".sw .knob{ position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:#fff; transition:left .15s; }",
    ".sw.on{ background:#16a34a; }",
    ".sw.on .knob{ left:24px; }",
    ".tray{ margin-top:11px; border:1px solid #3b2768; border-radius:8px; overflow:hidden; }",
    ".traybar{ display:flex; align-items:center; gap:8px; padding:7px 9px; cursor:pointer; background:#1f1338; user-select:none; -webkit-user-select:none; }",
    ".traybar .lbl{ flex:1; font-weight:700; font-size:12px; }",
    ".traybar .cnt{ min-width:20px; text-align:center; padding:0 6px; height:18px; line-height:18px; border-radius:9px; background:#4c2f86; color:#ede9fe; font-size:11px; font-weight:800; }",
    ".traybar .car{ transition:transform .2s; font-size:11px; color:#a78bfa; }",
    ".traybar:focus{ outline:3px solid #fde047; outline-offset:-2px; }",
    ".traywrap{ max-height:0; opacity:0; transition:max-height .25s ease, opacity .25s ease; }",
    ".tray.open .traywrap{ max-height:172px; opacity:1; }",
    ".tray.open .traybar .car{ transform:rotate(180deg); }",
    ".console{ height:132px; overflow-y:auto; padding:8px; background:#0a0613; border-top:1px solid #3b2768; font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size:11px; color:#cbd5e1; white-space:pre-wrap; word-break:break-word; }",
    ".console .ln{ padding:1px 0; border-bottom:1px solid rgba(167,139,250,.08); }",
    ".console .ln.warn{ color:#fca5a5; }",
    ".clearbtn{ width:100%; background:#2a1a4d; color:#ede9fe; border:0; border-top:1px solid #4c2f86; padding:5px; cursor:pointer; font-weight:700; font-size:11px; }",
    ".clearbtn:hover{ background:#3a2568; }",
    ".note{ margin-top:9px; font-size:10px; color:#a78bfa; line-height:1.5; }",
    ".card.pill{ width:auto; border-radius:999px; }",
    ".card.pill .body{ display:none; }",
    ".card.pill .hdr{ padding:7px 13px; border-radius:999px; }",
    ".card.pill .hdr button.min{ display:none; }"
  ].join("\n");
  shadow.appendChild(style);

  var card = document.createElement("div");
  card.className = "card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-label", "RNGdle cheat panel");

  // Header
  var hdr = document.createElement("div"); hdr.className = "hdr";
  var dice = document.createElement("span"); dice.className = "dice"; dice.textContent = "🎲";
  var title = document.createElement("div"); title.className = "title"; title.textContent = "RNGdle CHEAT";
  var btnMin = document.createElement("button"); btnMin.type = "button"; btnMin.className = "min"; btnMin.title = "Collapse / expand"; btnMin.setAttribute("aria-label", "Collapse or expand"); btnMin.textContent = "−";
  var btnClose = document.createElement("button"); btnClose.type = "button"; btnClose.title = "Close (engine stays active)"; btnClose.setAttribute("aria-label", "Close panel"); btnClose.textContent = "×";
  hdr.appendChild(dice); hdr.appendChild(title); hdr.appendChild(btnMin); hdr.appendChild(btnClose);
  card.appendChild(hdr);

  var body = document.createElement("div"); body.className = "body";

  // Status
  var status = document.createElement("div"); status.className = "status";
  var dot = document.createElement("div"); dot.className = "dot bad";
  var statusTxt = document.createElement("div"); statusTxt.className = "txt"; statusTxt.textContent = "Checking…";
  var btnRefresh = document.createElement("button"); btnRefresh.type = "button"; btnRefresh.textContent = "Scan"; btnRefresh.setAttribute("aria-label", "Re-scan game state");
  status.appendChild(dot); status.appendChild(statusTxt); status.appendChild(btnRefresh);
  body.appendChild(status);

  // Roll-a-number row
  var rollrow = document.createElement("div"); rollrow.className = "rollrow";
  var input = document.createElement("input");
  input.type = "number"; input.min = "0"; input.max = "1000000"; input.placeholder = "0 – 1,000,000"; input.value = "1000000";
  input.setAttribute("aria-label", "Number to roll");
  var btnRoll = document.createElement("button"); btnRoll.type = "button"; btnRoll.className = "act primary"; btnRoll.style.width = "108px"; btnRoll.textContent = "Roll it";
  rollrow.appendChild(input); rollrow.appendChild(btnRoll);
  body.appendChild(rollrow);

  // Secondary action grid
  var grid = document.createElement("div"); grid.className = "grid";
  function mkAct(label) { var b = document.createElement("button"); b.type = "button"; b.className = "act"; b.textContent = label; return b; }
  var btnMax = mkAct("Max (1,000,000)");
  var btnReroll = mkAct("Unlock / Re-roll");
  var btnScan = mkAct("Scan");
  var btnUndo = mkAct("Undo");
  grid.appendChild(btnMax); grid.appendChild(btnReroll); grid.appendChild(btnScan); grid.appendChild(btnUndo);
  body.appendChild(grid);

  // Legendary quick-picks
  var qlabel = document.createElement("div"); qlabel.className = "seclabel"; qlabel.textContent = "Legendary numbers";
  body.appendChild(qlabel);
  var chips = document.createElement("div"); chips.className = "chips";
  ((cheat && cheat.legendary) || []).forEach(function (item) {
    var c = document.createElement("button"); c.type = "button"; c.className = "chip";
    c.innerHTML = item.n.toLocaleString() + "<small>" + item.name + "</small>";
    c.__n = item.n;
    chips.appendChild(c);
  });
  body.appendChild(chips);

  // Block-submissions toggle
  var toggleWrap = document.createElement("div"); toggleWrap.className = "toggle";
  var toggleLabel = document.createElement("label"); toggleLabel.textContent = "Block submissions"; toggleLabel.id = "rng-lb-label";
  var sw = document.createElement("button"); sw.type = "button"; sw.className = "sw"; sw.setAttribute("role", "switch"); sw.setAttribute("aria-labelledby", "rng-lb-label");
  var knob = document.createElement("span"); knob.className = "knob"; sw.appendChild(knob);
  toggleWrap.appendChild(toggleLabel); toggleWrap.appendChild(sw);
  body.appendChild(toggleWrap);

  var note = document.createElement("div"); note.className = "note";
  note.textContent = "As a guest, rolling any number is real and saved locally. Logged in, the number is server-issued — setNumber is display-only there. Nothing is ever sent to the shared leaderboard.";
  body.appendChild(note);

  // Log tray
  var tray = document.createElement("div"); tray.className = "tray open";
  var traybar = document.createElement("div"); traybar.className = "traybar"; traybar.setAttribute("role", "button"); traybar.setAttribute("tabindex", "0"); traybar.setAttribute("aria-expanded", "true"); traybar.setAttribute("aria-label", "Toggle log");
  var trayLbl = document.createElement("span"); trayLbl.className = "lbl"; trayLbl.textContent = "Log";
  var trayCnt = document.createElement("span"); trayCnt.className = "cnt"; trayCnt.textContent = "0";
  var trayCar = document.createElement("span"); trayCar.className = "car"; trayCar.textContent = "▼";
  traybar.appendChild(trayLbl); traybar.appendChild(trayCnt); traybar.appendChild(trayCar);
  tray.appendChild(traybar);
  var traywrap = document.createElement("div"); traywrap.className = "traywrap";
  var consoleEl = document.createElement("div"); consoleEl.className = "console"; consoleEl.setAttribute("role", "log"); consoleEl.setAttribute("aria-live", "polite");
  traywrap.appendChild(consoleEl);
  var btnClear = document.createElement("button"); btnClear.type = "button"; btnClear.className = "clearbtn"; btnClear.textContent = "Clear log";
  traywrap.appendChild(btnClear);
  tray.appendChild(traywrap);
  body.appendChild(tray);

  card.appendChild(body);
  shadow.appendChild(card);
  (document.body || document.documentElement).appendChild(host);

  /* ---------------- logging ---------------- */
  var logCount = 0;
  function appendLog(msg, isWarn) {
    var ln = document.createElement("div"); ln.className = "ln" + (isWarn ? " warn" : "");
    var t = new Date(); var ts = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2);
    ln.textContent = "[" + ts + "] " + msg;
    consoleEl.appendChild(ln);
    while (consoleEl.childNodes.length > 200) consoleEl.removeChild(consoleEl.firstChild);
    consoleEl.scrollTop = consoleEl.scrollHeight;
    logCount++; trayCnt.textContent = String(logCount);
  }
  function panelSink(line) { appendLog(line, /no React tree|couldn't|can't|failed|error|instead/i.test(line)); }
  if (cheat && cheat.__addSink) cheat.__addSink(panelSink);
  btnClear.addEventListener("click", function () { while (consoleEl.firstChild) consoleEl.removeChild(consoleEl.firstChild); appendLog("log cleared"); });

  function toggleTray() { var open = tray.classList.toggle("open"); traybar.setAttribute("aria-expanded", open ? "true" : "false"); }
  traybar.addEventListener("click", toggleTray);
  traybar.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); toggleTray(); } });

  /* ---------------- status ---------------- */
  function refreshStatus() {
    var found = false; try { found = !!cheat.root(); } catch (e) {}
    if (!found) { dot.className = "dot bad"; statusTxt.innerHTML = "React tree <b>NOT FOUND</b> · open rngdle.com"; return; }
    var s = null; try { s = cheat.scan(); } catch (e) {}
    dot.className = "dot ok";
    if (s) statusTxt.innerHTML = (/GUEST/.test(s.account) ? "<b>GUEST</b> · cheatable" : "<b>LOGGED-IN</b> · display-only") + " · lock " + (/LOCKED/.test(s.guestDailyLock) ? "<b>ON</b>" : "off");
    else statusTxt.innerHTML = "React tree <b>FOUND</b>";
  }
  btnRefresh.addEventListener("click", function () { refreshStatus(); appendLog("status refreshed"); });

  /* ---------------- actions ---------------- */
  function ready() { var f = false; try { f = !!cheat.root(); } catch (e) {} if (!f) appendLog("no React tree — open rngdle.com first", true); return f; }
  function doRoll(n) {
    if (!ready()) return;
    n = Math.max(0, Math.min(1000000, Math.floor(Number(n) || 0)));
    appendLog("rolling " + n.toLocaleString() + "…");
    try { cheat.setNumber(n).then(function () { refreshStatus(); }); } catch (e) { appendLog("error: " + (e && e.message), true); }
  }
  btnRoll.addEventListener("click", function () { doRoll(input.value); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") doRoll(input.value); });
  btnMax.addEventListener("click", function () { input.value = "1000000"; doRoll(1000000); });
  btnReroll.addEventListener("click", function () { if (!ready()) return; try { cheat.reroll(); refreshStatus(); } catch (e) { appendLog("error: " + (e && e.message), true); } });
  btnScan.addEventListener("click", function () { if (!ready()) return; refreshStatus(); });
  btnUndo.addEventListener("click", function () { if (!ready()) return; try { cheat.undo(); refreshStatus(); } catch (e) { appendLog("error: " + (e && e.message), true); } });
  chips.addEventListener("click", function (e) {
    var c = e.target.closest ? e.target.closest(".chip") : null;
    if (c && c.__n != null) { input.value = String(c.__n); doRoll(c.__n); }
  });

  /* ---------------- toggle ---------------- */
  function syncToggle() { if (lbBlocked) { sw.classList.add("on"); sw.setAttribute("aria-checked", "true"); } else { sw.classList.remove("on"); sw.setAttribute("aria-checked", "false"); } }
  sw.addEventListener("click", function () {
    var next = !lbBlocked;
    try { var r = cheat.blockLeaderboard(next); lbBlocked = (typeof r === "boolean") ? r : next; } catch (e) { lbBlocked = next; }
    syncToggle();
  });

  /* ---------------- minimize / close / drag ---------------- */
  function clampToViewport() {
    var vw = window.innerWidth, vh = window.innerHeight, w = card.offsetWidth, h = card.offsetHeight;
    var left = parseFloat(card.style.left), top = parseFloat(card.style.top);
    if (isNaN(left) || isNaN(top)) { var r = card.getBoundingClientRect(); if (isNaN(left)) left = r.left; if (isNaN(top)) top = r.top; }
    card.style.right = "auto";
    card.style.left = Math.max(0, Math.min(left, vw - w)) + "px";
    card.style.top = Math.max(0, Math.min(top, vh - h)) + "px";
  }
  btnMin.addEventListener("click", function () { var p = card.classList.toggle("pill"); btnMin.textContent = p ? "□" : "−"; clampToViewport(); });
  function closePanel() {
    if (host.__rngCleanup) { try { host.__rngCleanup(); } catch (e) {} }
    if (host.parentNode) host.parentNode.removeChild(host);
    try { if (cheat && cheat.__removeSink) cheat.__removeSink(panelSink); } catch (e) {}
    try { console.log("%cRNGdle", ST, "panel closed — engine still active (window.rngdle)"); } catch (e) {}
  }
  btnClose.addEventListener("click", closePanel);

  var dragging = false, offX = 0, offY = 0, dragId = null;
  function onMove(e) {
    if (!dragging) return;
    var vw = window.innerWidth, vh = window.innerHeight, w = card.offsetWidth, h = card.offsetHeight;
    var left = e.clientX - offX, top = e.clientY - offY;
    card.style.right = "auto";
    card.style.left = Math.max(0, Math.min(left, vw - w)) + "px";
    card.style.top = Math.max(0, Math.min(top, vh - h)) + "px";
  }
  function onUp(e) { if (!dragging) return; dragging = false; try { if (dragId !== null && hdr.releasePointerCapture) hdr.releasePointerCapture(dragId); } catch (err) {} dragId = null; if (document.body) document.body.style.userSelect = ""; }
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.isPrimary === false) return;
    if (e.target === btnMin || e.target === btnClose) return;
    dragging = true; var r = card.getBoundingClientRect(); offX = e.clientX - r.left; offY = e.clientY - r.top;
    dragId = (e.pointerId !== undefined) ? e.pointerId : null;
    try { if (dragId !== null && hdr.setPointerCapture) hdr.setPointerCapture(dragId); } catch (err) {}
    if (document.body) document.body.style.userSelect = "none";
    if (e.preventDefault) e.preventDefault();
  }
  var hasPointer = (typeof window.PointerEvent !== "undefined");
  if (hasPointer) {
    hdr.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
  } else {
    hdr.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseup", onUp, true);
  }
  function onResize() { clampToViewport(); }
  window.addEventListener("resize", onResize);
  host.__rngCleanup = function () {
    if (hasPointer) { hdr.removeEventListener("pointerdown", onDown); document.removeEventListener("pointermove", onMove, true); document.removeEventListener("pointerup", onUp, true); document.removeEventListener("pointercancel", onUp, true); }
    else { hdr.removeEventListener("mousedown", onDown); document.removeEventListener("mousemove", onMove, true); document.removeEventListener("mouseup", onUp, true); }
    window.removeEventListener("resize", onResize);
    try { if (cheat && cheat.__removeSink) cheat.__removeSink(panelSink); } catch (e) {}
  };

  /* ---------------- init ---------------- */
  syncToggle();
  refreshStatus();
  appendLog("panel ready. Engine: " + (window.rngdle ? "ok" : "MISSING"), !window.rngdle);
  appendLog("submissions " + (lbBlocked ? "BLOCKED (default)" : "ALLOWED"));

})();
