// Verification harness for the 82-0 cheat GUI.
//
// Drives a real Chrome over the DevTools Protocol and pastes the script with
// Runtime.evaluate at top scope — exactly what pasting into the devtools console
// does — against a mock React-fiber page (page.html). Asserts that GUI button
// clicks mutate real fiber state, that styles are isolated, that the leaderboard
// is blocked by default, that re-paste is idempotent, that undo works, and that
// it degrades gracefully with no React tree.
//
// Usage:
//   npm install            # installs puppeteer-core (no bundled browser)
//   node run.mjs [../cheat820-gui-oneline.js]   # default: ../cheat820-gui.js
//
// Requires a system Chrome/Chromium. Override its path with CHROME_PATH=...
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = process.argv[2] || path.join(HERE, '..', 'cheat820-gui.js');
const SCRIPT = fs.readFileSync(SCRIPT_PATH, 'utf8');
const URL = 'file://' + path.join(HERE, 'page.html');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

console.log('script under test:', SCRIPT_PATH);

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
  else { fail++; fails.push(name); console.log('  \x1b[31mFAIL\x1b[0m ' + name + (extra ? '  -> ' + JSON.stringify(extra) : '')); }
}

async function paste(page) {
  const client = await page.target().createCDPSession();
  return client.send('Runtime.evaluate', {
    expression: SCRIPT, includeCommandLineAPI: true, userGesture: true, awaitPromise: false,
  });
}

const HELPERS = `
  window.__hosts = function(){ return Array.prototype.slice.call(document.querySelectorAll('*')).filter(function(e){return e.shadowRoot;}); };
  window.__btns = function(){ var b=[]; window.__hosts().forEach(function(h){ b=b.concat(Array.prototype.slice.call(h.shadowRoot.querySelectorAll('button'))); }); b=b.concat(Array.prototype.slice.call(document.querySelectorAll('button'))); return b; };
  window.__click = function(t){ var b=window.__btns().find(function(x){return (x.textContent||'').trim().toLowerCase().indexOf(t.toLowerCase())>=0;}); if(!b) return false; b.click(); return true; };
`;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

async function fresh() { const p = await browser.newPage(); await p.goto(URL, { waitUntil: 'load' }); return p; }

try {
  console.log('\n[1] paste / install / API surface');
  {
    const page = await fresh();
    const res = await paste(page);
    check('paste throws no exception', !res.exceptionDetails, res.exceptionDetails && res.exceptionDetails.text);
    const api = await page.evaluate(() => {
      const c = window.cheat820 || {};
      const need = ['maxStats','revealStats','unlockAll','goPerfect','all','undo','blockLeaderboard'];
      return { present: !!window.cheat820, missing: need.filter(m => typeof c[m] !== 'function') };
    });
    check('window.cheat820 exposed', api.present);
    check('all engine methods present', api.missing.length === 0, api.missing);
    const ui = await page.evaluate(() => {
      const hosts = Array.prototype.slice.call(document.querySelectorAll('*')).filter(e => e.shadowRoot);
      const btns = []; hosts.forEach(h => btns.push.apply(btns, h.shadowRoot.querySelectorAll('button')));
      return { usesShadow: hosts.length > 0, btnCount: btns.length };
    });
    check('GUI panel injected (shadow host present)', ui.usesShadow, ui);
    check('panel has multiple buttons (>=5)', ui.btnCount >= 5, ui);
    await page.close();
  }

  console.log('\n[2] style isolation (page sets button{font-size:40px !important})');
  {
    const page = await fresh(); await paste(page);
    const style = await page.evaluate(() => {
      const host = Array.prototype.slice.call(document.querySelectorAll('*')).find(e => e.shadowRoot && e.shadowRoot.querySelector('button'));
      if (!host) return null;
      return { fontSize: getComputedStyle(host.shadowRoot.querySelector('button')).fontSize, zIndex: getComputedStyle(host).zIndex };
    });
    check('panel buttons NOT 40px (CSS isolated)', style && style.fontSize !== '40px', style);
    check('host has high z-index', style && style.zIndex !== 'auto' && parseInt(style.zIndex, 10) >= 1000, style);
    await page.close();
  }

  console.log('\n[3] blockLeaderboard default ON');
  {
    const page = await fresh(); await paste(page);
    const r = await page.evaluate(async () => {
      try { const resp = await fetch('https://example.com/leaderboard/submit', { method: 'POST', body: '{}' }); return { ok: true, status: resp.status, text: (await resp.text()).trim() }; }
      catch (e) { return { ok: false, err: String(e) }; }
    });
    check('leaderboard POST intercepted (stub 200 {})', r.ok && r.status === 200 && r.text === '{}', r);
    await page.close();
  }

  async function clickScenario(btnText, assertFn) {
    console.log('\n[4] click "' + btnText + '"');
    const page = await fresh(); await paste(page); await page.evaluate(HELPERS);
    check('button "' + btnText + '" found & clicked', await page.evaluate(t => window.__click(t), btnText));
    assertFn(await page.evaluate(() => ({ lineup: window.__fake.lineup, settings: window.__fake.settings, record: window.__fake.record, recordStr: window.__fake.recordStr })));
    await page.close();
  }
  await clickScenario('reveal', s => check('revealStats -> testMode true', s.settings.testMode === true, s.settings));
  await clickScenario('unlock', s => { check('unlockAll -> hardMode false', s.settings.hardMode === false, s.settings); check('unlockAll -> decades expanded', s.settings.enabledDecades.length > 1, s.settings); });
  await clickScenario('max stat', s => { check('maxStats -> PG.ppg 60', s.lineup.PG.ppg === 60, s.lineup.PG); check('maxStats -> C.pts 60', s.lineup.C.pts === 60, s.lineup.C); });
  await clickScenario('perfect', s => { check('goPerfect -> record 82/0', s.record.wins === 82 && s.record.losses === 0, s.record); check('goPerfect -> "82-0"', s.recordStr === '82-0', s.recordStr); });
  await clickScenario('all', s => { check('Run All -> testMode true', s.settings.testMode === true, s.settings); check('Run All -> record 82-0', s.record.wins === 82 && s.recordStr === '82-0', s); });

  console.log('\n[5] undo reverts mutations');
  {
    const page = await fresh(); await paste(page); await page.evaluate(HELPERS);
    const before = await page.evaluate(() => window.__fake.lineup.PG.ppg);
    await page.evaluate(() => window.__click('max stat'));
    const maxed = await page.evaluate(() => window.__fake.lineup.PG.ppg);
    await page.evaluate(() => window.__click('undo'));
    const after = await page.evaluate(() => window.__fake.lineup.PG.ppg);
    check('ppg maxed to 60 before undo', maxed === 60, { before, maxed });
    check('undo restored original ppg', after === before, { before, after });
    await page.close();
  }

  console.log('\n[6] idempotency (paste twice)');
  {
    const page = await fresh(); await paste(page);
    const r1 = await paste(page);
    check('second paste throws no exception', !r1.exceptionDetails, r1.exceptionDetails && r1.exceptionDetails.text);
    check('exactly one panel host after double-paste', (await page.evaluate(() => Array.prototype.slice.call(document.querySelectorAll('*')).filter(e => e.shadowRoot).length)) === 1);
    check('fetch/XHR guard flag set (no double patch)', await page.evaluate(() => window.__c820net === true));
    await page.close();
  }

  console.log('\n[7] graceful when no React tree');
  {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><body><div>no react here</div></body>');
    const res = await paste(page);
    check('paste throws no exception (no React)', !res.exceptionDetails, res.exceptionDetails && res.exceptionDetails.text);
    await page.evaluate(HELPERS);
    check('clicking action without React does not throw', (await page.evaluate(() => { try { window.__click('max stat'); return 'ok'; } catch (e) { return String(e); } })) === 'ok');
    await page.close();
  }
} catch (e) {
  console.error('\nRUNNER ERROR:', (e && e.stack) || e); fail++;
} finally { await browser.close(); }

console.log('\n================ RESULT ================');
console.log('PASS ' + pass + '   FAIL ' + fail);
if (fails.length) console.log('failed: ' + fails.join(' | '));
process.exit(fail ? 1 : 0);
