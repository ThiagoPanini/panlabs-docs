/**
 * The half that needs draw.io: turning one tab's `<mxGraphModel>` back into
 * a drawing.
 *
 * There is no reimplementation of that in Node. mxGraph's renderer, the
 * shape libraries, the AWS stencils and the text layout are draw.io's own,
 * so the only honest options are to run draw.io or to not render at all.
 *
 * WHICH draw.io, AND WHY THIS ONE. The `hediet.vscode-drawio` extension
 * ships the whole web app on disk — 102 MB, version 26.0.2 in the copy this
 * was measured against — and it is the SAME engine that draws the file when
 * the editor saves it. Using it means the generated drawing and the drawing
 * in the editor come from one renderer, with no network in the loop, no CDN
 * (which this project does not use), no Electron app to install, and no
 * 102 MB vendored into the repository.
 *
 * Fidelity is measured, not assumed. Re-rendering this repository's own two
 * diagrams through here and comparing against what the editor had written:
 * `<path>` 18/18 and 69/69, `<text>` 15/15 and 36/36, `<rect>` 12/12 and
 * 21/21, `<image>` 2/2, `light-dark()` 79 to 79 and 168 to 170, identical
 * `viewBox` on one and draw.io's own half-pixel convention on the other.
 * The `light-dark()` count matters most: it is how a diagram carries both
 * color modes in one file, and losing it would break dark mode silently.
 *
 * WHY RAW CDP. Driving Chrome takes a WebSocket and six protocol methods.
 * A driver dependency would be a dependency added to rewrite what already
 * works, which this project refuses. `WebSocket` has been global in Node
 * since 21, and the engine floor here is 20 — see `openRenderer`, which
 * refuses rather than crashing when it is missing.
 *
 * THE RENDERER IS WARM. Booting the app costs 3.3 s; rendering with it
 * already loaded costs a median of 281 ms, measured over alternating
 * renders of a 582x555 drawing and a 1904x953 one with 21 AWS shapes. That
 * difference is the whole reason the session is held open across saves: it
 * is what keeps `salvo e vejo` feeling like it did before.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

/**
 * Point either of these at an absolute path to override discovery. The
 * webapp one is the escape hatch for the risk this design carries: the
 * engine lives inside an editor extension, and a version bump moves it.
 */
const WEBAPP_ENV = 'PANLABS_DRAWIO_WEBAPP';
const CHROME_ENV = 'PANLABS_CHROME';

/** Where a VS Code extension directory sits, per install shape. */
const EXTENSION_ROOTS = [
  '.vscode/extensions',
  '.vscode-server/extensions',
  '.vscode-insiders/extensions',
  '.vscode-server-insiders/extensions',
];

/** The path inside the extension that holds the app itself. */
const WEBAPP_INSIDE = 'drawio/src/main/webapp';

/** Chrome, as the two browser-driver packages cache it, then as a system install. */
const CHROME_CANDIDATES = [
  '.cache/puppeteer/chrome/*/chrome-linux64/chrome',
  '.cache/puppeteer/chrome/*/chrome-linux/chrome',
  '.cache/ms-playwright/chromium-*/chrome-linux/chrome',
  '.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell',
];

const CHROME_ON_PATH = ['google-chrome', 'chromium', 'chromium-browser'];

/** Enough to serve the app; anything unlisted is served as bytes. */
const MIME = {
  '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css',
  '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.txt': 'text/plain', '.xml': 'text/xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

/** How long one drawing may take before the render is called failed. */
const RENDER_TIMEOUT_MS = 30_000;

/**
 * `mxscript` lives in draw.io's own `index.html`, not in `app.min.js`, and
 * `App.loadScripts` calls it by name. The extension bundles no `index.html`
 * — it composes one for its webview — so a page that only loads the bundle
 * dies on `ReferenceError: mxscript is not defined` before the embed
 * protocol ever says `init`. This is that missing bootstrap, matching what
 * the extension writes.
 *
 * `alert` is stubbed because a modal dialog blocks the renderer's main
 * thread, and a blocked main thread hangs every CDP evaluation against the
 * page rather than failing it.
 */
const PREAMBLE = `
var urlParams = {embed:'1', proto:'json', configure:'0', ui:'min',
  noSaveBtn:'1', noExitBtn:'1', browser:'1', stealth:'1', math:'0', pages:'1'};
window.mxIsElectron = false;
var isLocalStorage = false;
function mxscript(src, onLoad, id, dataAppKey) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  var done = false;
  if (id != null) s.setAttribute('id', id);
  if (dataAppKey != null) s.setAttribute('data-app-key', dataAppKey);
  if (onLoad != null) {
    s.onload = s.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState === 'complete')) { done = true; onLoad(); }
    };
  }
  var first = document.getElementsByTagName('script')[0];
  if (first != null) first.parentNode.insertBefore(s, first);
}
function mxinclude(src) { mxscript(src); }
window.alert = function () {};
window.onerror = function (message, url, line) {
  window.__err = (window.__err || []);
  window.__err.push(message + ' @ ' + url + ':' + line);
  return true;
};
`;

const EMBED_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles/grapheditor.css">
<script>${PREAMBLE}</script>
</head><body><script src="/js/app.min.js"></script>
<script>try { App.main(); } catch (e) { window.__boot = String(e); }</script>
</body></html>`;

/**
 * The app runs in an iframe and the host drives it, which is the embed
 * protocol's documented shape: the app posts `init` when it is ready,
 * `load` once a drawing is in, and `export` with the result.
 */
const HOST_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<iframe id="f" style="width:1200px;height:900px;border:0"></iframe>
<script>
window.__out = null; window.__events = [];
window.addEventListener('message', (event) => {
  let message;
  try { message = JSON.parse(event.data); } catch { return; }
  window.__events.push(message.event);
  const app = document.getElementById('f').contentWindow;
  if (message.event === 'init') {
    app.postMessage(JSON.stringify({action: 'load', xml: window.__xml}), '*');
  } else if (message.event === 'load') {
    app.postMessage(JSON.stringify({action: 'export', format: 'svg'}), '*');
  } else if (message.event === 'export') {
    window.__out = message.data;
  }
});
window.__boot = function (xml) {
  window.__xml = xml; window.__out = null; window.__events = [];
  document.getElementById('f').src = '/embed.html';
};
window.__again = function (xml) {
  window.__out = null; window.__events = [];
  document.getElementById('f').contentWindow.postMessage(
    JSON.stringify({action: 'load', xml}), '*');
};
</script></body></html>`;

/**
 * A path with exactly one wildcard segment, newest match first.
 * Written by hand rather than pulled in: the two patterns above are the
 * only globbing this file will ever do.
 *
 * @param {string} pattern absolute, containing one `*` segment
 */
function newestMatch(pattern) {
  const segments = pattern.split('/');
  const index = segments.findIndex((segment) => segment.includes('*'));
  if (index === -1) {
    return fs.existsSync(pattern) ? pattern : null;
  }
  const parent = segments.slice(0, index).join('/');
  const prefix = segments[index].replace('*', '');
  const rest = segments.slice(index + 1).join('/');

  let entries;
  try {
    entries = fs.readdirSync(parent);
  } catch {
    return null;
  }
  const matches = entries
    .filter((entry) => entry.startsWith(prefix))
    .sort()
    .reverse()
    .map((entry) => path.join(parent, entry, rest))
    .filter((candidate) => fs.existsSync(candidate));

  return matches[0] ?? null;
}

/**
 * The draw.io the editor itself uses, or `null`.
 *
 * Under WSL the extension is installed on the Windows side, so the host's
 * profile directories are searched too — that is where it was found on the
 * machine this was built against.
 */
export function findWebapp() {
  const override = process.env[WEBAPP_ENV];
  if (override) {
    return fs.existsSync(override) ? override : null;
  }

  const homes = [os.homedir()];
  for (const drive of ['/mnt/c', '/mnt/d']) {
    let users;
    try {
      users = fs.readdirSync(path.join(drive, 'Users'));
    } catch {
      continue;
    }
    for (const user of users) {
      homes.push(path.join(drive, 'Users', user));
    }
  }

  for (const home of homes) {
    for (const root of EXTENSION_ROOTS) {
      const found = newestMatch(path.join(home, root, 'hediet.vscode-drawio-*', WEBAPP_INSIDE));
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** A Chrome to drive, or `null`. */
export function findChrome() {
  const override = process.env[CHROME_ENV];
  if (override) {
    return fs.existsSync(override) ? override : null;
  }
  for (const candidate of CHROME_CANDIDATES) {
    const found = newestMatch(path.join(os.homedir(), candidate));
    if (found) {
      return found;
    }
  }
  for (const name of CHROME_ON_PATH) {
    for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
      const candidate = path.join(dir, name);
      if (dir && fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

/**
 * What is missing, in the words the operator needs, or `null` when the
 * engine is ready. Callers degrade on this rather than throwing: the
 * derived drawings are committed, so a missing engine means "cannot
 * refresh", never "cannot build".
 */
export function engineComplaint() {
  if (typeof WebSocket === 'undefined') {
    return `Node ${process.versions.node} não tem WebSocket global (veio no 21). Sem ele não dá para dirigir o Chrome.`;
  }
  if (!findWebapp()) {
    return [
      'Não achei o draw.io da extensão `hediet.vscode-drawio`.',
      `Instale a extensão no VS Code, ou aponte ${WEBAPP_ENV} para o diretório \`${WEBAPP_INSIDE}\` dela.`,
    ].join('\n');
  }
  if (!findChrome()) {
    return [
      'Não achei um Chrome para renderizar.',
      `Instale um Chromium, ou aponte ${CHROME_ENV} para o binário.`,
    ].join('\n');
  }
  return null;
}

/**
 * A live draw.io, held open for as many drawings as the caller wants.
 *
 * @returns {Promise<{render: (xml: string, label: string) => Promise<string>, close: () => void}>}
 */
export async function openRenderer() {
  const complaint = engineComplaint();
  if (complaint) {
    throw new Error(complaint);
  }
  const webapp = findWebapp();
  const chromePath = findChrome();

  const server = http.createServer((request, response) => {
    const url = decodeURIComponent(request.url.split('?')[0]);
    if (url === '/host.html' || url === '/embed.html') {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(url === '/host.html' ? HOST_HTML : EMBED_HTML);
      return;
    }
    // The app asks for hundreds of its own files by relative path; anything
    // climbing out of the webapp is refused rather than served.
    const file = path.join(webapp, url);
    if (!file.startsWith(webapp)) {
      response.writeHead(403);
      response.end();
      return;
    }
    fs.readFile(file, (error, buffer) => {
      if (error) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.writeHead(200, {'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream'});
      response.end(buffer);
    });
  });
  // Loopback only: this serves a local directory and exists for the
  // lifetime of one dev server.
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const {port} = server.address();

  const profile = await fsp.mkdtemp(path.join(os.tmpdir(), 'pd-drawio-'));
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);

  const endpoint = await new Promise((resolve, reject) => {
    let buffered = '';
    const timer = setTimeout(
      () => reject(new Error(`Chrome não abriu a porta de debug em 20s:\n${buffered.slice(-400)}`)),
      20_000,
    );
    chrome.stderr.on('data', (chunk) => {
      buffered += chunk.toString();
      const match = buffered.match(/ws:\/\/\S+/);
      if (match) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    });
    chrome.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome saiu com ${code} antes de abrir a porta de debug.`));
    });
  });

  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, {once: true});
    socket.addEventListener('error', () => reject(new Error('Não consegui falar com o Chrome.')), {once: true});
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });

  const call = (method, params = {}, sessionId) =>
    new Promise((resolve) => {
      const id = (nextId += 1);
      pending.set(id, resolve);
      socket.send(JSON.stringify({id, method, params, sessionId}));
    });

  const {result: {targetId}} = await call('Target.createTarget', {url: 'about:blank'});
  const {result: {sessionId}} = await call('Target.attachToTarget', {targetId, flatten: true});
  await call('Page.enable', {}, sessionId);
  await call('Runtime.enable', {}, sessionId);

  const evaluate = async (expression, awaitPromise = false) => {
    const answer = await call(
      'Runtime.evaluate',
      {expression, awaitPromise, returnByValue: true},
      sessionId,
    );
    return answer.result?.result?.value;
  };

  await call('Page.navigate', {url: `http://127.0.0.1:${port}/host.html`}, sessionId);
  // The host page is three lines of script with no imports; it is ready as
  // soon as the document is, and the app it drives announces itself.
  await new Promise((resolve) => setTimeout(resolve, 300));

  let booted = false;

  /**
   * One drawing. The first call boots the app inside the iframe; every one
   * after reuses it, which is the 3.3 s versus 281 ms difference.
   *
   * @param {string} xml a single-page `<mxfile>`
   * @param {string} label what to name in a failure
   */
  async function render(xml, label) {
    const entry = booted ? '__again' : '__boot';
    booted = true;
    await evaluate(`window.${entry}(${JSON.stringify(xml)}); true`);

    const result = await evaluate(
      `new Promise((resolve) => {
        const started = Date.now();
        (function poll() {
          if (window.__out) return resolve(window.__out);
          if (Date.now() - started > ${RENDER_TIMEOUT_MS}) {
            let detail = '';
            try {
              const app = document.getElementById('f').contentWindow;
              detail = ' erros=' + JSON.stringify(app.__err || null);
            } catch { detail = ' (sem acesso ao iframe)'; }
            return resolve('TIMEOUT eventos=' + JSON.stringify(window.__events) + detail);
          }
          setTimeout(poll, 100);
        })();
      })`,
      true,
    );

    if (typeof result !== 'string' || !result.startsWith('data:')) {
      // A failed boot leaves the iframe unusable, so the next render starts
      // it over rather than talking to a dead app.
      booted = false;
      throw new Error(`Não consegui renderizar ${label}: ${String(result).slice(0, 300)}`);
    }
    return Buffer.from(result.slice(result.indexOf(',') + 1), 'base64').toString('utf8');
  }

  function close() {
    try {
      socket.close();
    } catch {
      // Already gone; nothing to close.
    }
    chrome.kill();
    server.close();
  }

  return {render, close};
}
