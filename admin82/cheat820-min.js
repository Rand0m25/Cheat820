window.cheat820 = (function () {
  function R() {
    var e = document.querySelectorAll("*");
    for (var i = 0; i < e.length; i++) {
      var k = Object.keys(e[i]).find(function (x) { return x.indexOf("__reactFiber$") === 0 || x.indexOf("__reactInternalInstance$") === 0; });
      if (k) { var f = e[i][k]; while (f && f.return) f = f.return; return f; }
    }
    return null;
  }
  function H() {
    var r = R(); if (!r) { console.log("82-0: open a game page first"); return []; }
    var o = [], s = [r], seen = new Set();
    while (s.length) {
      var f = s.pop(); if (!f || seen.has(f)) continue; seen.add(f);
      var h = f.memoizedState, i = 0;
      while (h && typeof h === "object" && "memoizedState" in h && "next" in h) {
        var d = h.queue && h.queue.dispatch;
        if (d) (function (n, dp) { o.push({ get v() { return n.memoizedState; }, d: dp }); })(h, d);
        h = h.next; if (++i > 300) break;
      }
      if (f.child) s.push(f.child);
      if (f.sibling) s.push(f.sibling);
    }
    return o;
  }
  function P(o) { return o && typeof o === "object" && !Array.isArray(o) && ("ppg" in o || "pts" in o); }
  function cp(o) { var c = {}, k; for (k in o) c[k] = o[k]; return c; }
  var M = { ppg: 99, pts: 99, rpg: 99, reb: 99, apg: 99, ast: 99, spg: 99, stl: 99, bpg: 99, blk: 99 };
  function mx(p) { var c = cp(p), k; for (k in c) { var l = k.toLowerCase(); if (M[l] !== undefined && typeof c[k] === "number") c[k] = M[l]; } return c; }
  var a = {};
  a.hooks = H;
  a.maxStats = function () {
    var n = 0;
    H().forEach(function (h) {
      var v = h.v;
      if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).some(function (k) { return P(v[k]); })) {
        var nv = {}, k; for (k in v) nv[k] = P(v[k]) ? mx(v[k]) : v[k]; h.d(nv); n++;
      } else if (Array.isArray(v) && v.some(P)) { h.d(v.map(function (p) { return P(p) ? mx(p) : p; })); n++; }
    });
    console.log("82-0 maxStats: maxed " + n + " lineup(s)"); return n;
  };
  a.revealStats = function () {
    var n = 0;
    H().forEach(function (h) {
      var v = h.v;
      if (v && typeof v === "object" && "testMode" in v && ("hardMode" in v || "enabledDecades" in v)) {
        var nv = cp(v); nv.testMode = true; nv.hardMode = false; if ("ballKnowledgeMode" in nv) nv.ballKnowledgeMode = false; h.d(nv); n++;
      }
    });
    console.log("82-0 reveal/unlock: " + n + " settings"); return n;
  };
  a.unlockAll = a.revealStats;
  a.goPerfect = function () {
    var n = 0;
    H().forEach(function (h) {
      var v = h.v;
      if (v && typeof v === "object" && !Array.isArray(v) && typeof v.wins === "number" && typeof v.losses === "number") {
        var nv = cp(v); nv.wins = 82; nv.losses = 0; h.d(nv); n++;
      } else if (typeof v === "string" && /^\d{1,2}\s*-\s*\d{1,2}$/.test(v)) { h.d("82-0"); n++; }
    });
    var m = a.maxStats();
    console.log("82-0 goPerfect: maxed " + m + " lineup(s) -> 82-0 (record derived from roster)"); return m;
  };
  a.all = function () { a.revealStats(); return a.goPerfect(); };
  console.log("82-0 cheat ready. Run: cheat820.all()");
  return a;
})();