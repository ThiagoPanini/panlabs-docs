#!/usr/bin/env node
/**
 * O comparador de paridade — mede o site construído e lista o que não fecha
 * com os alvos publicados na spec.
 *
 * **NENHUM VALOR DE DESENHO MORA AQUI.** O que este arquivo declara é o que a
 * spec não sabe: qual seletor carrega cada linha publicada, em que rota, em que
 * largura e em que tema. Os números moram nas tabelas de `docs/design/`, e a
 * comparação mora em `lib/paridade.mjs`. Se um número aparecer aqui, o
 * instrumento passou a ter opinião sobre o alvo e deixou de medir a distância
 * até ele.
 *
 * **Zero dependência npm.** O Node tem `WebSocket` global e `node:http`; o
 * Chrome sai de `CHROME=` no ambiente ou do cache do puppeteer/playwright, e
 * nenhum dos dois é dependência deste repositório. O axioma 2 vale também para
 * o instrumento de medição, e é por isso que nem puppeteer nem playwright
 * entraram — a mesma decisão que a primeira medição da âncora registrou em
 * `docs/research/README.md`.
 *
 * Mede o site **construído**, nunca o servidor de desenvolvimento: `build/` é o
 * artefato que vai ao ar, e `docusaurus start` devolve 200 com o shell da SPA
 * para qualquer rota. O `build/` é servido por um `node:http` de dez linhas
 * porque o alvo precisa das rotas sem barra final, como `trailingSlash: false`
 * publica.
 *
 * Dois modos:
 *   `node scripts/paridade.mjs`              relatório legível, sempre sai 0
 *   `node scripts/paridade.mjs --verificar`  sai 1 se houver diferença
 *
 * O modo padrão é o relatório, e é ele que roda na CI: **não é portão**. O juiz
 * declarado é a avaliação visual humana sobre o produto final; este comando
 * existe para que a deriva fique escrita em vez de descoberta.
 *
 * Procedência: docs/research/paridade-devin.md · docs/design/principios.md §6.
 */

import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import path from 'node:path';

import {comparar, formatar, lerAlvos} from './lib/paridade.mjs';

const RAIZ = path.resolve(import.meta.dirname, '..');
const BUILD = path.join(RAIZ, 'build');
const BASE_URL = '/shinydoc-docusaurus';

/* As rotas são escolhidas por quem renderiza o que se quer medir: componente
   que não aparece em página nenhuma não tem como ser sondado, e fingir que tem
   seria publicar um alvo que nunca reprova. */
const ROTAS = {
  prosa: '/procedimentos/acessos/rotacionar-uma-chave',
  codigo: '/ferramentas/bibliotecas/biblioteca-b',
  tabela: '/ferramentas/bibliotecas/indice',
  cartao: '/',
};

/* Um cenário é uma rota numa largura num tema. A largura de referência é a que
   a medição da âncora usou; as outras duas existem para os limiares. */
const CENARIOS = {
  'prosa@1512/escuro': {rota: ROTAS.prosa, largura: 1512, tema: 'dark'},
  'prosa@1512/claro': {rota: ROTAS.prosa, largura: 1512, tema: 'light'},
  'prosa@1920/escuro': {rota: ROTAS.prosa, largura: 1920, tema: 'dark'},
  /* Os limiares são sondados DENTRO da faixa onde âncora e produto discordam:
     a âncora esconde o TOC abaixo de 1280 e a sidebar abaixo de 1024, e nós
     escondemos os dois abaixo de 997. Medir em 1280 e 1024 pegaria os dois
     visíveis e não diria nada. */
  'prosa@1100/escuro': {rota: ROTAS.prosa, largura: 1100, tema: 'dark'},
  'prosa@1010/escuro': {rota: ROTAS.prosa, largura: 1010, tema: 'dark'},
  'busca@1512/escuro': {rota: ROTAS.prosa, largura: 1512, tema: 'dark', abrirBusca: true},
  'codigo@1512/escuro': {rota: ROTAS.codigo, largura: 1512, tema: 'dark'},
  'tabela@1512/escuro': {rota: ROTAS.tabela, largura: 1512, tema: 'dark'},
  'cartao@1512/escuro': {rota: ROTAS.cartao, largura: 1512, tema: 'dark'},
};

/* Cada sonda diz onde olhar e o que ler. `medida` é uma das quatro formas:
   `rect:<campo>` da caixa, `margem-direita` (o que sobra até a janela),
   `css:<prop>` do estilo computado e `cor:<prop>`, que resolve a cor para sRGB
   pintando um pixel — `getComputedStyle` devolve `oklch(…)` cru, e comparar
   isso com o hex publicado nunca fecharia. */
const SONDAS = [
  // --- paleta, nos dois temas -------------------------------------------
  {sonda: 'paleta.pagina.escuro', cenario: 'prosa@1512/escuro', seletor: 'body', medida: 'cor:background-color'},
  {sonda: 'paleta.pagina.claro', cenario: 'prosa@1512/claro', seletor: 'body', medida: 'cor:background-color'},
  {sonda: 'paleta.navbar.escuro', cenario: 'prosa@1512/escuro', seletor: '.navbar', medida: 'cor:background-color'},
  {sonda: 'paleta.navbar.claro', cenario: 'prosa@1512/claro', seletor: '.navbar', medida: 'cor:background-color'},
  {sonda: 'paleta.texto-forte.escuro', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'cor:color'},
  {sonda: 'paleta.texto-forte.claro', cenario: 'prosa@1512/claro', seletor: 'article h1', medida: 'cor:color'},
  {sonda: 'paleta.texto-corpo.escuro', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown p', medida: 'cor:color'},
  {sonda: 'paleta.texto-corpo.claro', cenario: 'prosa@1512/claro', seletor: '.theme-doc-markdown p', medida: 'cor:color'},
  /* O acento NÃO tem alvo publicado: a cor de marca é divergência declarada da
     âncora — violeta, e não o azul dela. Publicar o azul aqui mandaria copiar
     exatamente o que a decisão registrada recusa. */

  // --- escala de tipo ----------------------------------------------------
  {sonda: 'tipo.h1.tamanho', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'css:font-size'},
  {sonda: 'tipo.h1.entrelinha', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'css:line-height'},
  {sonda: 'tipo.h1.peso', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'css:font-weight'},
  {sonda: 'tipo.h2.tamanho', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown h2', medida: 'css:font-size'},
  {sonda: 'tipo.h2.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown h2', medida: 'css:line-height'},
  {sonda: 'tipo.prosa.tamanho', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown p', medida: 'css:font-size'},
  {sonda: 'tipo.prosa.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown p', medida: 'css:line-height'},
  {sonda: 'tipo.sidebar.tamanho', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'css:font-size'},
  {sonda: 'tipo.sidebar.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'css:line-height'},
  {sonda: 'tipo.sidebar.peso', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'css:font-weight'},
  {sonda: 'tipo.toc.tamanho', cenario: 'prosa@1512/escuro', seletor: '.table-of-contents__link', medida: 'css:font-size'},
  {sonda: 'tipo.aba.tamanho', cenario: 'prosa@1512/escuro', seletor: '.navbar__item.navbar__link', medida: 'css:font-size'},

  // --- geometria a 1512 --------------------------------------------------
  {sonda: 'chrome.sidebar.left', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'rect:left'},
  {sonda: 'chrome.sidebar.largura', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'rect:width'},
  {sonda: 'chrome.sidebar.borda', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'css:border-right-width'},
  {sonda: 'chrome.prosa.largura', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown', medida: 'rect:width'},
  {sonda: 'chrome.toc.largura', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-toc-desktop', medida: 'rect:width'},
  {sonda: 'chrome.toc.borda', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-toc-desktop', medida: 'css:border-left-width'},
  {sonda: 'chrome.navbar.altura', cenario: 'prosa@1512/escuro', seletor: '.navbar', medida: 'rect:height'},
  {sonda: 'chrome.margem-direita', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-toc-desktop', medida: 'margem-direita'},

  // --- a área útil centraliza (a correção principal da issue-pai) --------
  {sonda: 'chrome.1920.esquerda', cenario: 'prosa@1920/escuro', seletor: '.theme-doc-sidebar-container', medida: 'rect:left'},
  {sonda: 'chrome.1920.direita', cenario: 'prosa@1920/escuro', seletor: '.theme-doc-toc-desktop', medida: 'margem-direita'},

  // --- limiares ----------------------------------------------------------
  {sonda: 'chrome.1100.toc', cenario: 'prosa@1100/escuro', seletor: '.theme-doc-toc-desktop', medida: 'visivel'},
  {sonda: 'chrome.1010.sidebar', cenario: 'prosa@1010/escuro', seletor: '.theme-doc-sidebar-container', medida: 'visivel'},

  // --- cabeçalho do artigo ----------------------------------------------
  {sonda: 'artigo.sobrancelha.tamanho', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-breadcrumbs', medida: 'css:font-size'},

  // --- sidebar e TOC, métrica -------------------------------------------
  {sonda: 'sidebar.item.altura', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'rect:height'},
  {sonda: 'sidebar.item.raio', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'css:border-radius'},

  // --- busca: controle e painel -----------------------------------------
  {sonda: 'busca.controle.largura', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'rect:width'},
  {sonda: 'busca.controle.altura', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'rect:height'},
  {sonda: 'busca.controle.raio', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'css:border-radius'},
  {sonda: 'busca.painel.largura', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'rect:width'},
  {sonda: 'busca.painel.topo', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'rect:top'},
  {sonda: 'busca.painel.raio', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'css:border-radius'},

  // --- componentes -------------------------------------------------------
  {sonda: 'card.raio', cenario: 'cartao@1512/escuro', seletor: '[data-sd-component="card"]', medida: 'css:border-radius'},
  {sonda: 'card.borda', cenario: 'cartao@1512/escuro', seletor: '[data-sd-component="card"]', medida: 'css:border-top-width'},
  {sonda: 'callout.raio', cenario: 'prosa@1512/escuro', seletor: '[data-sd-component="callout"]', medida: 'css:border-radius'},
  {sonda: 'callout.tamanho', cenario: 'prosa@1512/escuro', seletor: '[data-sd-component="callout"]', medida: 'css:font-size'},
  {sonda: 'codigo.raio', cenario: 'codigo@1512/escuro', seletor: '[data-sd-component="code-group"]', medida: 'css:border-radius'},
  {sonda: 'tabela.tamanho', cenario: 'tabela@1512/escuro', seletor: '[data-sd-component="table"] td', medida: 'css:font-size'},
];

/* O único acoplamento entre documento e medição: rótulo publicado ↦ sonda. O
   número fica no documento; mudar o alvo é editar a spec, e apagar a linha
   reprova. */
const ALVOS = {
  'docs/design/tokens.md': {
    secao: '## 12. Alvo medido',
    colunas: ['claro', 'escuro'],
    linhas: [
      ['Fundo da página', ['paleta.pagina.claro', 'paleta.pagina.escuro']],
      ['Fundo do navbar', ['paleta.navbar.claro', 'paleta.navbar.escuro']],
      ['Texto forte', ['paleta.texto-forte.claro', 'paleta.texto-forte.escuro']],
      ['Texto corpo', ['paleta.texto-corpo.claro', 'paleta.texto-corpo.escuro']],
    ],
  },
  'docs/design/tokens.md#tipo': {
    arquivo: 'docs/design/tokens.md',
    secao: '## 13. Alvo medido',
    colunas: ['alvo'],
    linhas: [
      ['`h1` tamanho', ['tipo.h1.tamanho']],
      ['`h1` entrelinha', ['tipo.h1.entrelinha']],
      ['`h1` peso', ['tipo.h1.peso']],
      ['`h2` tamanho', ['tipo.h2.tamanho']],
      ['`h2` entrelinha', ['tipo.h2.entrelinha']],
      ['Prosa tamanho', ['tipo.prosa.tamanho']],
      ['Prosa entrelinha', ['tipo.prosa.entrelinha']],
      ['Item de sidebar tamanho', ['tipo.sidebar.tamanho']],
      ['Item de sidebar entrelinha', ['tipo.sidebar.entrelinha']],
      ['Item de sidebar peso', ['tipo.sidebar.peso']],
      ['Item de TOC tamanho', ['tipo.toc.tamanho']],
      ['Aba do navbar tamanho', ['tipo.aba.tamanho']],
    ],
  },
  'docs/design/chrome.md': {
    secao: '## 11. Alvo medido',
    colunas: ['alvo'],
    linhas: [
      ['Sidebar `left`', ['chrome.sidebar.left']],
      ['Sidebar largura', ['chrome.sidebar.largura']],
      ['Sidebar `border-right`', ['chrome.sidebar.borda']],
      ['Coluna de texto', ['chrome.prosa.largura']],
      ['Caixa do TOC', ['chrome.toc.largura']],
      ['TOC `border-left`', ['chrome.toc.borda']],
      ['Navbar altura', ['chrome.navbar.altura']],
      ['Margem direita', ['chrome.margem-direita']],
      ['A 1920, margem esquerda', ['chrome.1920.esquerda']],
      ['A 1920, margem direita', ['chrome.1920.direita']],
      ['TOC visível a 1100', ['chrome.1100.toc']],
      ['Sidebar visível a 1010', ['chrome.1010.sidebar']],
      ['Sobrancelha tamanho', ['artigo.sobrancelha.tamanho']],
      ['Item de sidebar altura', ['sidebar.item.altura']],
      ['Item de sidebar raio', ['sidebar.item.raio']],
    ],
  },
  'docs/design/busca.md': {
    secao: '## 10. Alvo medido',
    colunas: ['alvo'],
    linhas: [
      ['Caixa do controle largura', ['busca.controle.largura']],
      ['Caixa do controle altura', ['busca.controle.altura']],
      ['Raio do controle', ['busca.controle.raio']],
      ['Painel largura', ['busca.painel.largura']],
      ['Painel topo', ['busca.painel.topo']],
      ['Painel raio', ['busca.painel.raio']],
    ],
  },
  'docs/design/componentes/card.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [
      ['Raio', ['card.raio']],
      ['Borda', ['card.borda']],
    ],
  },
  'docs/design/componentes/callout.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [
      ['Raio', ['callout.raio']],
      ['Corpo tamanho', ['callout.tamanho']],
    ],
  },
  'docs/design/componentes/code-group.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [['Raio', ['codigo.raio']]],
  },
  'docs/design/componentes/table.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [['Corpo tamanho', ['tabela.tamanho']]],
  },
};

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
  for (const c of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', ...candidatos]) {
    if (existsSync(c)) return c;
  }
  throw new Error('Chrome não encontrado. Aponte com CHROME=/caminho/do/chrome');
}

// --- o site construído, servido ----------------------------------------------

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function servir(raiz) {
  const servidor = createServer((req, res) => {
    let rota = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (rota.startsWith(BASE_URL)) rota = rota.slice(BASE_URL.length);

    let arquivo = path.normalize(path.join(raiz, rota));
    if (!arquivo.startsWith(raiz)) return void res.writeHead(403).end();
    if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
    /* `trailingSlash: false` publica `/a/b`, e o arquivo é `a/b.html`. */
    if (!existsSync(arquivo) && existsSync(`${arquivo}.html`)) arquivo = `${arquivo}.html`;
    if (!existsSync(arquivo)) return void res.writeHead(404).end('não achei');

    res.writeHead(200, {'content-type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream'});
    res.end(readFileSync(arquivo));
  });
  return new Promise((resolve) => {
    servidor.listen(0, '127.0.0.1', () =>
      resolve({porta: servidor.address().port, fechar: () => servidor.close()}),
    );
  });
}

// --- driver de CDP -----------------------------------------------------------

const PORTA_CDP = 9411;

async function abrirChrome() {
  const perfil = mkdtempSync(path.join(tmpdir(), 'sd-paridade-'));
  const proc = spawn(
    acharChrome(),
    [
      '--headless=new',
      `--remote-debugging-port=${PORTA_CDP}`,
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
  for (let i = 0; i < 150; i += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`)).ok) {
        return {
          fechar: () => {
            proc.kill('SIGKILL');
            rmSync(perfil, {recursive: true, force: true});
          },
        };
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
      if (!p) return;
      this.pendentes.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    });
  }

  enviar(method, params = {}) {
    const id = (this.id += 1);
    this.ws.send(JSON.stringify({id, method, params}));
    return new Promise((res, rej) => this.pendentes.set(id, {res, rej}));
  }

  fechar() {
    this.ws.close();
  }
}

async function novaAba() {
  const alvo = await (
    await fetch(`http://127.0.0.1:${PORTA_CDP}/json/new?about:blank`, {method: 'PUT'})
  ).json();
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

async function avaliar(sessao, expressao) {
  const r = await sessao.enviar('Runtime.evaluate', {
    expression: expressao,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description ?? 'erro na sonda');
  }
  return r.result.value;
}

async function irPara(sessao, url, largura, tema) {
  await sessao.enviar('Emulation.setDeviceMetricsOverride', {
    width: largura,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  sessao.eventos.length = 0;
  await sessao.enviar('Page.navigate', {url});
  for (let i = 0; i < 200; i += 1) {
    if (sessao.eventos.some((e) => e.method === 'Page.loadEventFired')) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  await new Promise((r) => setTimeout(r, 900)); // hidratação do React
  /* O tema é atributo no `<html>`, e a folha inteira pende dele. Cravá-lo é
     mais barato e mais determinístico do que clicar no alternador. */
  await avaliar(sessao, `document.documentElement.setAttribute('data-theme', ${JSON.stringify(tema)})`);
  await new Promise((r) => setTimeout(r, 120));
}

/* A sonda roda dentro da página. Ela é uma string porque atravessa o protocolo;
   o que ela devolve é sempre `{sonda: string|null}`, e `null` quer dizer "olhei
   e não achei o elemento" — que o comparador distingue de divergência. */
const SONDAR = (lista) => `(() => {
  const lista = ${JSON.stringify(lista)};
  /* Pinta a cor computada num pixel e lê de volta. É o único jeito de comparar
     com o hex da âncora: a folha autora em oklch(), e getComputedStyle devolve
     a forma autoral, não sRGB. O canal alfa volta junto — sem ele, um
     'rgba(0,0,0,0)' viraria '#000000', e "transparente" seria publicado como
     "preto". */
  const resolver = (cor) => {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = cor;
    g.fillRect(0, 0, 1, 1);
    const [r, v, a, alfa] = g.getImageData(0, 0, 1, 1).data;
    return {hex: '#' + [r, v, a].map((n) => n.toString(16).padStart(2, '0')).join(''), alfa};
  };
  /* Quem pinta o fundo de um elemento pode ser um ancestral: 'fundo da página'
     é a primeira superfície opaca subindo a árvore, não o que o <body> declara.
     Sem isto, medir o <body> de um site que pinta o <html> devolve preto. */
  const fundoPintado = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const {hex, alfa} = resolver(getComputedStyle(n).backgroundColor);
      if (alfa > 0) return hex;
    }
    return null;
  };
  const px = (n) => (Math.round(n * 100) / 100) + 'px';
  const saida = {};
  for (const {sonda, seletor, medida} of lista) {
    let el = null;
    try { el = document.querySelector(seletor); } catch { el = null; }
    if (medida === 'visivel') { saida[sonda] = (el && el.getClientRects().length > 0) ? 'sim' : 'nao'; continue; }
    if (!el) { saida[sonda] = null; continue; }
    if (medida === 'existe') { saida[sonda] = 'sim'; continue; }
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (medida.startsWith('rect:')) saida[sonda] = px(r[medida.slice(5)]);
    else if (medida === 'margem-direita') saida[sonda] = px(innerWidth - r.right);
    else if (medida === 'cor:background-color') saida[sonda] = fundoPintado(el);
    else if (medida.startsWith('cor:')) {
      const {hex, alfa} = resolver(cs.getPropertyValue(medida.slice(4)));
      saida[sonda] = alfa > 0 ? hex : null;
    }
    else if (medida.startsWith('css:')) saida[sonda] = cs.getPropertyValue(medida.slice(4)).trim();
    else saida[sonda] = null;
  }
  return JSON.stringify(saida);
})()`;

// --- execução ----------------------------------------------------------------

async function medir() {
  if (!existsSync(BUILD)) {
    throw new Error('Não existe `build/`. Rode `npm run build` — o comparador mede o site construído.');
  }

  const sitio = await servir(BUILD);
  const chrome = await abrirChrome();
  const medidas = {};

  try {
    const sessao = await novaAba();
    try {
      for (const [nome, cenario] of Object.entries(CENARIOS)) {
        const doCenario = SONDAS.filter((s) => s.cenario === nome);
        if (!doCenario.length) continue;

        const url = `http://127.0.0.1:${sitio.porta}${BASE_URL}${cenario.rota}`;
        await irPara(sessao, url, cenario.largura, cenario.tema);

        if (cenario.abrirBusca) {
          await avaliar(sessao, `document.querySelector('[data-sd-part="gatilho"]')?.click()`);
          await new Promise((r) => setTimeout(r, 500));
        }

        Object.assign(medidas, JSON.parse(await avaliar(sessao, SONDAR(doCenario))));
      }
    } finally {
      sessao.fechar();
    }
  } finally {
    chrome.fechar();
    sitio.fechar();
  }

  return medidas;
}

function lerTodosOsAlvos() {
  const alvos = [];
  const falhas = [];
  for (const [chave, decl] of Object.entries(ALVOS)) {
    const arquivo = decl.arquivo ?? chave;
    const caminho = path.join(RAIZ, arquivo);
    if (!existsSync(caminho)) {
      falhas.push(`${arquivo}: documento não existe, e a declaração aponta para ele`);
      continue;
    }
    const leitura = lerAlvos(arquivo, readFileSync(caminho, 'utf8'), decl);
    alvos.push(...leitura.alvos);
    falhas.push(...leitura.falhas);
  }
  return {alvos, falhas};
}

const verificar = process.argv.includes('--verificar');

const {alvos, falhas} = lerTodosOsAlvos();
if (falhas.length) {
  console.error('As tabelas de alvo não estão legíveis:\n');
  for (const f of falhas) console.error(`  · ${f}`);
  console.error('\nO comparador lê os alvos das tabelas publicadas na spec — corrija a tabela.');
  process.exit(1);
}

const medidas = await medir();
const diferencas = comparar(alvos, medidas);

console.log(`Paridade — ${alvos.length} alvos publicados, ${Object.keys(medidas).length} sondas medidas.\n`);
console.log(formatar(diferencas));

if (verificar && diferencas.length) process.exit(1);
