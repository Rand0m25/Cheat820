window.cheat820 = (function () {
  "use strict";
  var ST = "background:#16a34a;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold";
  function log(m, x) { if (x !== undefined) console.log("%c82-0", ST, m, x); else console.log("%c82-0", ST, m); }
  var undo = [];
  function root() {
    var els = document.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var key = Object.keys(els[i]).find(function (k) { return k.indexOf("__reactFiber$") === 0 || k.indexOf("__reactInternalInstance$") === 0; });
      if (key) { var f = els[i][key]; while (f && f.return) f = f.return; return f; }
    }
    return null;
  }
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
          if (d) { (function (node, nm, ix, disp) { out.push({ component: nm, index: ix, get value() { return node.memoizedState; }, dispatch: disp }); })(h, name, i, d); }
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
  api.scan = function () {
    var rows = hooks().map(function (h, i) {
      var p; try { p = JSON.stringify(h.value, function (k, v) { return typeof v === "function" ? "[fn]" : v; }); } catch (e) { p = String(h.value); }
      if (p && p.length > 160) p = p.slice(0, 160) + "...";
      var g = isLineupObj(h.value) ? "LINEUP" : isSettings(h.value) ? "SETTINGS" : (isRecObj(h.value) || isRecStr(h.value)) ? "RECORD" : "";
      return { row: i, component: h.component, type: Array.isArray(h.value) ? "array(" + h.value.length + ")" : typeof h.value, guess: g, preview: p };
    });
    console.table(rows); return rows;
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
        nv.testMode = true; nv.hardMode = false;
        if ("ballKnowledgeMode" in nv) nv.ballKnowledgeMode = false;
        if (Array.isArray(nv.enabledDecades)) nv.enabledDecades = ["60's", "70's", "80's", "90's", "00's", "10's", "20's"];
        // NB: leave testModeTeamSelection alone — flipping it mid-draft disrupts the pick.
        set(h, nv); n++;
      }
    });
    log("unlockAll: " + n + " setting(s) unlocked (applies instantly)"); return n;
  };
  api.goPerfect = function () {
    // The 82-0 record is DERIVED from the roster, so go-perfect = max it.
    var rec = 0; hooks().forEach(function (h) {
      var v = h.value;
      if (isRecObj(v)) { var nv = copy(v); if ("wins" in nv) { nv.wins = 82; nv.losses = 0; } if ("w" in nv) { nv.w = 82; nv.l = 0; } set(h, nv); rec++; }
      else if (isRecStr(v)) { set(h, "82-0"); rec++; }
    });
    var m = api.maxStats();
    log("goPerfect: maxed " + m + " lineup(s)" + (rec ? (" + " + rec + " record(s)") : "") + " → 82-0 (record derived from roster).");
    return m;
  };
  api.all = function () { return { reveal: api.revealStats(), unlock: api.unlockAll(), perfect: api.goPerfect() }; };
  api.undo = function () { var n = 0; while (undo.length) { var u = undo.pop(); try { u.d(u.p); n++; } catch (e) {} } log("undo: reverted " + n); return n; };

  var block = true;
  api.blockLeaderboard = function (on) { block = on !== false; log("leaderboard " + (block ? "BLOCKED" : "ALLOWED")); return block; };
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