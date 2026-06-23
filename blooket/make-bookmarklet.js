// Generates a self-contained bookmarklet from blooket-trainer.user.js
// (no hosting required — the whole script is encoded into the javascript: URL,
// decoded at click time, and injected as a <script> element — no eval).
//
//   node make-bookmarklet.js
//
// Outputs:  blooket-trainer.min.js  (lightly minified source, for verifying)
//           bookmarklet.txt         (the javascript: URL to paste into a bookmark)
//           install.html            (open it, drag the button to your bookmarks bar)

const fs = require('fs');

const SRC_FILE = 'blooket-trainer.user.js';
let src = fs.readFileSync(SRC_FILE, 'utf8');

// 1) drop the userscript metadata header (it's comments; bookmarklet doesn't use it)
src = src.replace(/\/\/ ==UserScript==[\s\S]*?==\/UserScript==\r?\n/, '');
// 2) strip /* ... */ block comments (safe: no regex/string in this file contains the literal "/*")
src = src.replace(/\/\*[\s\S]*?\*\//g, '');
// 3) per line: trim, drop blank lines and whole-line // comments
src = src.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');

fs.writeFileSync('blooket-trainer.min.js', src);

// Encode the source as a URL-safe payload, then build a tiny injector wrapper.
// NOTE: encodeURIComponent does NOT escape ' ( ) * ! ~ — and the source contains
// apostrophes, which would close the wrapper's '...' string early. Escape ' too.
const inner = encodeURIComponent(src).replace(/'/g, '%27');
const wrapper =
  "(function(){try{" +
  "var d=document,s=d.createElement('script');" +
  "s.textContent=decodeURIComponent('" + inner + "');" +
  "(d.head||d.documentElement).appendChild(s);s.remove();" +
  "}catch(e){alert('BlooketBox could not load here (page security policy). Use the userscript or paste into the console instead.');}})();";

const bookmarklet = 'javascript:' + wrapper;
fs.writeFileSync('bookmarklet.txt', bookmarklet);

// install.html — the bookmarklet contains single quotes but NO double quotes,
// no &, no <, no > (all encoded), so it is safe inside a double-quoted href.
const hrefSafe = bookmarklet.replace(/"/g, '%22'); // belt-and-suspenders
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Install BlooketBox</title>
<style>
  :root{ color-scheme:dark; }
  body{ margin:0; min-height:100vh; display:grid; place-items:center; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
    color:#eef2ff; background:radial-gradient(900px 600px at 70% 10%,rgba(123,121,201,.18),transparent 60%),linear-gradient(160deg,#221c40,#0c0a1f); }
  .card{ width:min(560px,92vw); background:rgba(13,17,28,.7); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:30px 32px; backdrop-filter:blur(14px); }
  h1{ margin:0 0 4px; font-size:22px; } .sub{ color:#9aa6c4; margin:0 0 22px; font-size:14px; }
  .dragbtn{ display:inline-flex; align-items:center; gap:10px; text-decoration:none; color:#08121a; font-weight:700; font-size:16px;
    padding:13px 22px; border-radius:12px; background:linear-gradient(135deg,#3fadb8,#7d79c9); cursor:grab; }
  .dragbtn .g{ width:20px; height:20px; border-radius:6px; background:#0d111c33; border:1px solid #ffffff55; }
  ol{ color:#cdd4f5; font-size:14px; line-height:1.7; margin:22px 0 0; padding-left:20px; }
  code{ font-family:ui-monospace,Consolas,monospace; background:#0a0e18; padding:2px 6px; border-radius:5px; color:#52c0c9; }
  .note{ margin-top:18px; font-size:12.5px; color:#5d6885; }
  .badge{ font-size:10px; font-weight:800; letter-spacing:.5px; color:#52c0c9; background:rgba(82,192,201,.1); border:1px solid rgba(82,192,201,.3); padding:3px 7px; border-radius:999px; }
</style>
</head>
<body>
  <div class="card">
    <h1>BlooketBox <span class="badge">SELF-ONLY</span></h1>
    <p class="sub">Drag the button below up to your bookmarks bar. Then click it on blooket.com.</p>
    <a class="dragbtn" href="${hrefSafe}"><span class="g"></span>BlooketBox</a>
    <ol>
      <li>Make sure your bookmarks bar is visible (<code>Ctrl/Cmd + Shift + B</code>).</li>
      <li><b>Drag</b> the “BlooketBox” button onto the bookmarks bar.</li>
      <li>Go to <code>blooket.com</code> / a game, then <b>click</b> the bookmark.</li>
    </ol>
    <p class="note">Self-only client-side trainer. If clicking it does nothing, this page/site is blocking injected scripts (CSP) — use the Tampermonkey userscript or paste the script into the DevTools console instead. Re-click is a no-op until you reload; run <code>window.__BX.eject()</code> to remove it.</p>
  </div>
</body>
</html>
`;
fs.writeFileSync('install.html', html);

console.log('minified source: ' + src.length + ' bytes');
console.log('bookmarklet:     ' + bookmarklet.length + ' chars');
console.log('wrote: blooket-trainer.min.js, bookmarklet.txt, install.html');
