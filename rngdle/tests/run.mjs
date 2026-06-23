// Verification harness for the RNGdle cheat.
//
// Serves a mock fiber page over HTTP (so the rngdle_user cookie used for
// logged-in detection actually works), drives a real Chrome over the DevTools
// Protocol, and pastes the script with Runtime.evaluate at top scope — exactly
// what pasting into the devtools console does. Asserts: install + API surface,
// GUI panel mount + Shadow-DOM style isolation, submissions blocked by default,
// guest "Roll it" forces the exact number AND the game scores it, re-roll /
// daily-lock bypass, logged-in faithful display spoof, undo, idempotent
// re-paste, and graceful behavior with no React tree. Also runs the standalone
// rngdle-scoring.js against the game's embedded match/reject test vectors.
//
// Usage:
//   npm install            # installs puppeteer-core (no bundled browser)
//   node run.mjs [../rngdle-cheat.js]   # default: ../rngdle-cheat.js
// Requires a system Chrome/Chromium. Override with CHROME_PATH=...
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = process.argv[2] || path.join(HERE, '..', 'rngdle-cheat.js');
let SCRIPT = fs.readFileSync(SCRIPT_PATH, 'utf8');
// If the build doesn't already embed the scoring engine, prepend it (the
// one-line paste build bundles it; the readable source relies on it being loaded).
const SCORING_PATH = path.join(HERE, '..', 'rngdle-scoring.js');
if (!/RNGDLE_SCORING\s*=/.test(SCRIPT) && fs.existsSync(SCORING_PATH)) {
  SCRIPT = fs.readFileSync(SCORING_PATH, 'utf8') + '\n;\n' + SCRIPT;
}
const PAGE = fs.readFileSync(path.join(HERE, 'page.html'), 'utf8');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

console.log('script under test:', SCRIPT_PATH);

let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
  else { fail++; fails.push(name); console.log('  \x1b[31mFAIL\x1b[0m ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
}

// --- tiny static server so document.cookie / page.setCookie work ---
const server = http.createServer((req, res) => { res.setHeader('content-type', 'text/html'); res.end(PAGE); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const URL = 'http://127.0.0.1:' + PORT + '/';

async function paste(page) {
  const client = await page.target().createCDPSession();
  return client.send('Runtime.evaluate', { expression: SCRIPT, includeCommandLineAPI: true, userGesture: true, awaitPromise: false });
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
async function fresh() { const p = await browser.newPage(); await p.goto(URL, { waitUntil: 'load' }); await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); return p; }

try {
  console.log('\n[1] paste / install / API surface');
  {
    const page = await fresh();
    const res = await paste(page);
    check('paste throws no exception', !res.exceptionDetails, res.exceptionDetails && res.exceptionDetails.text);
    const api = await page.evaluate(() => {
      const c = window.rngdle || {};
      const need = ['scan', 'setNumber', 'maxRoll', 'reroll', 'setDisplay', 'analyze', 'undo', 'blockLeaderboard'];
      return { present: !!window.rngdle, missing: need.filter(m => typeof c[m] !== 'function') };
    });
    check('window.rngdle exposed', api.present);
    check('all engine methods present', api.missing.length === 0, api.missing);
    const ui = await page.evaluate(() => {
      const hosts = [...document.querySelectorAll('*')].filter(e => e.shadowRoot);
      const btns = []; hosts.forEach(h => btns.push.apply(btns, h.shadowRoot.querySelectorAll('button')));
      return { usesShadow: hosts.length > 0, btnCount: btns.length };
    });
    check('GUI panel injected (shadow host present)', ui.usesShadow, ui);
    check('panel has multiple buttons (>=6)', ui.btnCount >= 6, ui);
    await page.close();
  }

  console.log('\n[2] style isolation (page sets button{font-size:40px !important})');
  {
    const page = await fresh(); await paste(page);
    const style = await page.evaluate(() => {
      const host = [...document.querySelectorAll('*')].find(e => e.shadowRoot && e.shadowRoot.querySelector('button'));
      if (!host) return null;
      return { fontSize: getComputedStyle(host.shadowRoot.querySelector('button')).fontSize, zIndex: getComputedStyle(host).zIndex };
    });
    check('panel buttons NOT 40px (CSS isolated)', style && style.fontSize !== '40px', style);
    check('host has high z-index', style && style.zIndex !== 'auto' && parseInt(style.zIndex, 10) >= 1000, style);
    await page.close();
  }

  console.log('\n[3] block submissions default ON (next-action write stubbed)');
  {
    const page = await fresh(); await paste(page);
    const r = await page.evaluate(async () => {
      const resp = await fetch('/x', { method: 'POST', headers: { 'next-action': '40c06977b686c043b8dd3c31de7c21867ef7d3bff6' } });
      return { status: resp.status, body: await resp.json() };
    });
    check('submitPoem POST intercepted (stub, success:false)', r.status === 200 && r.body && r.body.success === false, r);
    const allowed = await page.evaluate(async () => {
      // rollDiceAction is NOT blocked (it is the user's own authoritative roll)
      const resp = await fetch('/x', { method: 'POST', headers: { 'next-action': '00aa1221b1e3f98828fa7aec2ea1c272c3f9c8d3be' } }).catch(() => null);
      return !!resp; // reaches network (here: our server) -> not stubbed by header
    });
    check('rollDiceAction NOT blocked by default', allowed, { allowed });
    await page.close();
  }

  console.log('\n[4] GUEST: setNumber forces the exact number + game scores it');
  {
    const page = await fresh(); await paste(page);
    const got = await page.evaluate(async () => { await window.rngdle.setNumber(777777); const s = window.__state; return { num: s.E && s.E.number, rolls: s.rolls, badges: s.E && s.E.badges, stored: localStorage.getItem('rngdle_guest_roll_data') }; });
    check('rolled exactly 777777', got.num === 777777, got);
    check('real roll handler fired (not display-only)', got.rolls >= 1, got);
    check('game computed badges for the number (JACKPOT)', Array.isArray(got.badges) && got.badges.some(b => b.id === 'JACKPOT'), got.badges);
    check('persisted to guest localStorage', !!got.stored && JSON.parse(got.stored).number === 777777, got.stored);
    await page.close();
  }

  console.log('\n[5] GUEST: re-roll bypasses the daily lock');
  {
    const page = await fresh(); await paste(page);
    const r = await page.evaluate(async () => { await window.rngdle.setNumber(69); const a = window.__state.rolls; await window.rngdle.setNumber(666); return { rolls: window.__state.rolls, num: window.__state.E.number, first: a }; });
    check('second setNumber rolled again (lock bypassed)', r.rolls >= 2 && r.num === 666, r);
    await page.close();
  }

  console.log('\n[6] LOGGED-IN: faithful local display spoof (no real roll)');
  {
    const page = await browser.newPage();
    // set the rngdle_user hint cookie -> the cheat treats us as logged in
    const hint = Buffer.from(JSON.stringify({ id: 'u1', displayName: 'tester', displayNameColor: '#fff' })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await page.setCookie({ name: 'rngdle_user', value: hint, url: URL });
    await page.goto(URL, { waitUntil: 'load' });
    await paste(page);
    const r = await page.evaluate(async () => {
      const res = await window.rngdle.setNumber(666);
      const E = window.__state.E;
      return { mode: res.mode, num: E && E.number, badges: E && E.badges, rolls: window.__state.rolls, scan: window.rngdle.scan() };
    });
    check('logged-in setNumber is a display spoof (no real roll)', r.mode === 'display-spoof' && r.rolls === 0, r);
    check('logged-in spoof shows the chosen number', r.num === 666, r);
    check('logged-in spoof has REAL badges (ported scoring)', Array.isArray(r.badges) && r.badges.length > 0 && r.badges.some(b => b.id === 'DEVIL'), r.badges && r.badges.map(b => b.id));
    check('scan reports LOGGED-IN', r.scan && /LOGGED-IN/.test(r.scan.account), r.scan);
    await page.close();
  }

  console.log('\n[7] undo reverts mutations');
  {
    const page = await fresh(); await paste(page);
    const r = await page.evaluate(async () => { await window.rngdle.setNumber(1000000); const maxed = window.__state.E.number; window.rngdle.undo(); return { maxed, after: window.__state.E, date: localStorage.getItem('rngdle_guest_roll_date') }; });
    check('number set before undo', r.maxed === 1000000, r);
    check('undo restored result to null', r.after === null, r);
    await page.close();
  }

  console.log('\n[8] idempotency (paste twice)');
  {
    const page = await fresh(); await paste(page);
    const r1 = await paste(page);
    check('second paste throws no exception', !r1.exceptionDetails, r1.exceptionDetails && r1.exceptionDetails.text);
    check('exactly one panel host after double-paste', (await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.shadowRoot).length)) === 1);
    check('fetch guard flag set (no double patch)', await page.evaluate(() => window.__rngnet === true));
    await page.close();
  }

  console.log('\n[9] graceful when no React tree');
  {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><body><div>no react here</div></body>');
    const res = await paste(page);
    check('paste throws no exception (no React)', !res.exceptionDetails, res.exceptionDetails && res.exceptionDetails.text);
    const safe = await page.evaluate(async () => { try { await window.rngdle.setNumber(123); return 'ok'; } catch (e) { return String(e); } });
    check('setNumber without React does not throw', safe === 'ok', safe);
    await page.close();
  }

  console.log('\n[10] scoring port vs the game\'s own embedded vectors');
  {
    const scoringPath = path.join(HERE, '..', 'rngdle-scoring.js');
    if (!fs.existsSync(scoringPath)) { check('rngdle-scoring.js present', false, 'missing'); }
    else {
      const mod = await import('file://' + scoringPath);
      const S = mod.default || globalThis.RNGDLE_SCORING || mod;
      const an = S.analyzeNumber;
      check('analyzeNumber exported', typeof an === 'function');
      if (typeof an === 'function') {
        const has = (n, id) => (an(n).badges || []).some(b => (b.id || b) === id || b === id);
        check('69 -> NICE', has(69, 'NICE'));
        check('666 -> DEVIL', has(666, 'DEVIL'));
        check('1337 -> LEET', has(1337, 'LEET'));
        check('777 -> JACKPOT', has(777, 'JACKPOT'));
        check('1000000 scores > 0', an(1000000).totalScore > 0, an(1000000).totalScore);
      }
    }
  }
} catch (e) {
  console.error('\nRUNNER ERROR:', (e && e.stack) || e); fail++;
} finally { await browser.close(); server.close(); }

console.log('\n================ RESULT ================');
console.log('PASS ' + pass + '   FAIL ' + fail);
if (fails.length) console.log('failed: ' + fails.join(' | '));
process.exit(fail ? 1 : 0);
