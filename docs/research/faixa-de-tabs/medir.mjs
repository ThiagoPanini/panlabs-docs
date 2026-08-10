#!/usr/bin/env node
/**
 * O instrumento da pesquisa da issue #51 — a faixa de tabs, MEDIDA.
 *
 * A convenção deste repositório (pesquisa da #8) é escrever o código, rodar o
 * build e olhar o resultado. "Olhar" aqui é `getBoundingClientRect()` num
 * Chrome de verdade sobre o `npm run build` real — não leitura de doc.
 *
 * Zero dependência npm: o Node 24 tem `WebSocket` nativo, então o Chrome
 * DevTools Protocol é dirigido direto, sem puppeteer nem playwright. Isso não é
 * economia de gosto — é o axioma 2, que vale também para o instrumento.
 *
 * COMO RODAR
 *
 *   1. copie `faixa.css` para `src/css/` e acrescente-o ao fim de
 *      `presets[0][1].theme.customCss`, em `docusaurus.config.js`;
 *   2. acrescente o espaçador de quebra ao `themeConfig.navbar.items`, LOGO
 *      DEPOIS da marca e ANTES das tabs:
 *
 *        {type: 'html', position: 'left', className: 'quebra-de-faixa',
 *         value: '<!--quebra-->'},
 *
 *   3. `npm run build && npm run serve -- --port 3213`
 *   4. `node docs/research/faixa-de-tabs/medir.mjs`
 *
 * O Chrome sai de `CHROME=` no ambiente, ou do cache do puppeteer/playwright se
 * houver um. Nenhum dos dois é dependência deste repositório.
 */
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir, homedir} from 'node:os';
import path from 'node:path';

// --- o binário do Chrome -----------------------------------------------------
function acharChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidatos = [];
  for (const [raiz, sufixo] of [
    [path.join(homedir(), '.cache/puppeteer/chrome'), 'chrome-linux64/chrome'],
    [path.join(homedir(), '.cache/ms-playwright'), 'chrome-linux64/chrome'],
  ]) {
    if (!existsSync(raiz)) continue;
    for (const dir of readdirSync(raiz)) candidatos.push(path.join(raiz, dir, sufixo));
  }
  for (const c of ['/usr/bin/google-chrome', '/usr/bin/chromium', ...candidatos]) {
    if (existsSync(c)) return c;
  }
  throw new Error('Chrome não encontrado. Aponte com CHROME=/caminho/do/chrome');
}

const BASE = process.env.BASE || 'http://localhost:3213/shinydoc-docusaurus';
const ROTA_PT = `${BASE}/docs/comece-aqui/visao-geral`;
const ROTA_EN = `${BASE}/en/docs/comece-aqui/visao-geral`;
const PORTA = 9400;

// --- driver de CDP -----------------------------------------------------------
async function abrirChrome() {
  const perfil = mkdtempSync(path.join(tmpdir(), 'sd-chrome-'));
  const proc = spawn(
    acharChrome(),
    [
      '--headless=new',
      `--remote-debugging-port=${PORTA}`,
      `--user-data-dir=${perfil}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      'about:blank',
    ],
    {stdio: ['ignore', 'ignore', 'ignore']},
  );
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORTA}/json/version`)).ok) {
        return {fechar: () => (proc.kill('SIGKILL'), rmSync(perfil, {recursive: true, force: true}))};
      }
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Chrome não subiu');
}

class Sessao {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pendentes = new Map();
    this.eventos = [];
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id == null) return void this.eventos.push(m);
      const p = this.pendentes.get(m.id);
      this.pendentes.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    });
  }
  enviar(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({id, method, params}));
    return new Promise((res, rej) => this.pendentes.set(id, {res, rej}));
  }
  fechar() {
    this.ws.close();
  }
}

async function novaAba() {
  const alvo = await (await fetch(`http://127.0.0.1:${PORTA}/json/new?about:blank`, {method: 'PUT'})).json();
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, {once: true});
    ws.addEventListener('error', rej, {once: true});
  });
  const s = new Sessao(ws);
  await s.enviar('Page.enable');
  await s.enviar('Runtime.enable');
  return s;
}

async function irPara(s, url, largura, altura = 900) {
  await s.enviar('Emulation.setDeviceMetricsOverride', {
    width: largura,
    height: altura,
    deviceScaleFactor: 1,
    mobile: false,
  });
  s.eventos.length = 0;
  await s.enviar('Page.navigate', {url});
  for (let i = 0; i < 150; i++) {
    if (s.eventos.some((e) => e.method === 'Page.loadEventFired')) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 900)); // hidratação do React
}

async function avaliar(s, fn) {
  const r = await s.enviar('Runtime.evaluate', {
    expression: `(${fn.toString()})()`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'erro');
  return r.result.value;
}

// --- as sondas ---------------------------------------------------------------
const sondaGeometria = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1)};
  };
  const cs = getComputedStyle;
  const nav = document.querySelector('nav.navbar');
  const esq = document.querySelector('.navbar__items:not(.navbar__items--right)');
  const tabs = [...document.querySelectorAll('.navbar__items:not(.navbar__items--right) .navbar__link')];
  const vis = tabs.filter((t) => cs(t).display !== 'none');
  const ys = vis.map((t) => +t.getBoundingClientRect().y.toFixed(1));
  const marca = document.querySelector('.navbar__brand');

  return {
    vw: innerWidth,
    token: cs(document.documentElement).getPropertyValue('--ifm-navbar-height').trim(),
    nav: {...r(nav), position: cs(nav).position, overflow: cs(nav).overflow},
    // SANGRAMENTO: quem pinta a faixa é o <nav>, e ele vai de 0 a 100vw.
    sangra: nav.getBoundingClientRect().left <= 0 && nav.getBoundingClientRect().right >= innerWidth,
    pontosNaFaixa: [2, 20, innerWidth / 2, innerWidth - 20, innerWidth - 2].map((x) => {
      const el = document.elementFromPoint(x, 80);
      return {x: Math.round(x), dentroDoNav: el ? nav.contains(el) || el === nav : false};
    }),
    esq: {...r(esq), wrap: cs(esq).flexWrap},
    marca: r(marca),
    toggle: cs(document.querySelector('.navbar__toggle')).display,
    faixa: {
      tabsVisiveis: vis.length,
      mesmaLinha: new Set(ys).size === 1,
      y: [...new Set(ys)],
      abaixoDaMarca: marca && vis.length ? Math.min(...ys) >= marca.getBoundingClientRect().bottom - 1 : null,
    },
    conteudoComecaEm: r(document.querySelector('.main-wrapper') || document.querySelector('main'))?.y,
    tocY: r(document.querySelector('[class*=tableOfContents]'))?.y ?? null,
  };
};

const sondaSticky = async () => {
  scrollTo(0, 800);
  await new Promise((r) => setTimeout(r, 250));
  const b = document.querySelector('nav.navbar').getBoundingClientRect();
  scrollTo(0, 0);
  return {scrollY: 800, navTop: +b.top.toFixed(1), navBottom: +b.bottom.toFixed(1), grudado: Math.abs(b.top) < 0.5};
};

const sondaDrawer = async () => {
  document.querySelector('.navbar__toggle').click();
  await new Promise((r) => setTimeout(r, 500));
  const h = (sel) => {
    const el = document.querySelector(sel);
    return el ? +el.getBoundingClientRect().height.toFixed(1) : null;
  };
  return {
    aberto: document.querySelector('.navbar').classList.contains('navbar-sidebar--show'),
    token: getComputedStyle(document.documentElement).getPropertyValue('--ifm-navbar-height').trim(),
    brandH: h('.navbar-sidebar__brand'),
    itemsH: h('.navbar-sidebar__items'),
    viewportH: innerHeight,
  };
};

// --- execução ----------------------------------------------------------------
const chrome = await abrirChrome();
const saida = {};

for (const [nome, url, largura] of [
  ['pt-1440', ROTA_PT, 1440],
  ['pt-1200', ROTA_PT, 1200],
  ['en-1440', ROTA_EN, 1440],
  ['pt-996', ROTA_PT, 996],
  ['pt-390', ROTA_PT, 390],
]) {
  const s = await novaAba();
  await irPara(s, url, largura);
  saida[nome] = {...(await avaliar(s, sondaGeometria)), sticky: await avaliar(s, sondaSticky)};
  s.fechar();
}

// O dropdown de locale, aberto por HOVER de verdade (não por classe forçada).
{
  const s = await novaAba();
  await irPara(s, ROTA_PT, 1440);
  const alvo = await avaliar(s, () => {
    const d = document.querySelector('.navbar__items--right .dropdown > .navbar__link');
    const b = d.getBoundingClientRect();
    return {x: b.x + b.width / 2, y: b.y + b.height / 2};
  });
  await s.enviar('Input.dispatchMouseEvent', {type: 'mouseMoved', x: alvo.x, y: alvo.y, buttons: 0});
  await new Promise((r) => setTimeout(r, 600));
  saida.dropdownPorHover = await avaliar(s, () => {
    const menu = document.querySelector('.navbar__items--right .dropdown .dropdown__menu');
    const b = menu.getBoundingClientRect();
    const cs = getComputedStyle(menu);
    return {
      abertoDeFato: cs.opacity === '1' && cs.visibility === 'visible',
      rect: {y: +b.y.toFixed(1), h: +b.height.toFixed(1)},
      navBottom: +document.querySelector('nav.navbar').getBoundingClientRect().bottom.toFixed(1),
      recortado: getComputedStyle(document.querySelector('nav.navbar')).overflow !== 'visible',
      links: [...menu.querySelectorAll('a')].map((a) => {
        const ab = a.getBoundingClientRect();
        const t = document.elementFromPoint(ab.x + ab.width / 2, ab.y + ab.height / 2);
        return {t: a.textContent.trim(), acerta: t === a || a.contains(t)};
      }),
    };
  });
  s.fechar();
}

// O drawer do estreito, ABERTO — é ele que a alta do token poderia estragar.
{
  const s = await novaAba();
  await irPara(s, ROTA_PT, 390, 800);
  saida.drawer390 = await avaliar(s, sondaDrawer);
  s.fechar();
}

// A ordem de foco: a faixa desalinha Tab da leitura visual?
{
  const s = await novaAba();
  await irPara(s, ROTA_PT, 1440);
  saida.ordemDeFoco = await avaliar(s, () =>
    [...document.querySelectorAll('nav.navbar a[href], nav.navbar button')]
      .filter((el) => {
        const c = getComputedStyle(el);
        return c.display !== 'none' && c.visibility !== 'hidden' && el.getBoundingClientRect().width > 0;
      })
      .map((el) => {
        const b = el.getBoundingClientRect();
        return {t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24), x: +b.x.toFixed(1), y: +b.y.toFixed(1)};
      }),
  );
  s.fechar();
}

console.log(JSON.stringify(saida, null, 2));
chrome.fechar();
