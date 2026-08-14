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
 * Procedência: research/paridade-devin · docs/design/principios.md §6.
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

/* A porta de depuração é fixa, ao contrário da do servidor de arquivos, que é
   efêmera: o Chrome só anuncia o endereço do WebSocket depois de abrir a porta,
   e descobri-la exigiria ler o stdout dele. Fixa e alta, fora da faixa que
   qualquer serviço local costuma tomar. */
const PORTA_CDP = 9411;

/* Altura de janela. Não há alvo que dependa dela — toda sonda mede largura,
   caixa ou estilo —, mas ela precisa ser alta o bastante para o TOC e a sidebar
   caberem sem virar rolagem interna. */
const ALTURA_JANELA = 900;

/* Esperas, em ms. São o preço de medir um site que hidrata: o HTML servido já
   tem a árvore, mas as classes e os estilos que o React aplica só existem
   depois. Medir antes disso devolve a página estática, que não é o produto. */
const ESPERA = {
  hidratacao: 900, // React montar e aplicar o que o CSS Module renomeia
  tema: 120, // a folha repintar depois de trocar `data-theme`
  modal: 500, // o `<dialog>` abrir e assentar
};

/* Sondagens de porta: `abrirChrome` espera o processo subir, `irPara` espera o
   `load`. Os dois são o mesmo laço com tetos diferentes. */
const TETO_CHROME = {tentativas: 150, intervalo: 100};
const TETO_CARGA = {tentativas: 200, intervalo: 50};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Repete `tentar` até devolver verdade, ou desiste e devolve `false`. */
async function esperarPor(tentar, {tentativas, intervalo}) {
  for (let i = 0; i < tentativas; i += 1) {
    if (await tentar()) return true;
    await dormir(intervalo);
  }
  return false;
}

/* As rotas são escolhidas por quem renderiza o que se quer medir: componente
   que não aparece em página nenhuma não tem como ser sondado, e fingir que tem
   seria publicar um alvo que nunca reprova. */
const ROTAS = {
  prosa: '/procedimentos/acessos/rotacionar-uma-chave',
  codigo: '/ferramentas/bibliotecas/biblioteca-b',
  tabela: '/ferramentas/bibliotecas/indice',
  cartao: '/',
  passos: '/procedimentos/acessos/assumir-um-papel-na-aws',
  api: '/ferramentas/bibliotecas/biblioteca-c/referencia/esteira-gerar',
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
  'passos@1512/escuro': {rota: ROTAS.passos, largura: 1512, tema: 'dark'},
  'api@1512/escuro': {rota: ROTAS.api, largura: 1512, tema: 'dark'},
};

/* Cada sonda diz onde olhar e o que ler. `medida` é uma das cinco formas:
   `caixa:<campo>` do retângulo, `margem-direita` (o que sobra até a janela),
   `estilo:<prop>` do estilo computado, `visivel` (`sim`/`não`, para limiar) e
   `cor:<prop>`, que resolve a cor para sRGB pintando um pixel —
   `getComputedStyle` devolve `oklch(…)` cru, e comparar isso com o hex
   publicado nunca fecharia. */
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
  {sonda: 'tipo.h1.tamanho', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'estilo:font-size'},
  {sonda: 'tipo.h1.entrelinha', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'estilo:line-height'},
  {sonda: 'tipo.h1.peso', cenario: 'prosa@1512/escuro', seletor: 'article h1', medida: 'estilo:font-weight'},
  {sonda: 'tipo.h2.tamanho', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown h2', medida: 'estilo:font-size'},
  {sonda: 'tipo.h2.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown h2', medida: 'estilo:line-height'},
  {sonda: 'tipo.prosa.tamanho', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown p', medida: 'estilo:font-size'},
  {sonda: 'tipo.prosa.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown p', medida: 'estilo:line-height'},
  {sonda: 'tipo.sidebar.tamanho', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'estilo:font-size'},
  {sonda: 'tipo.sidebar.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'estilo:line-height'},
  {sonda: 'tipo.sidebar.peso', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'estilo:font-weight'},
  {sonda: 'tipo.toc.tamanho', cenario: 'prosa@1512/escuro', seletor: '.table-of-contents__link', medida: 'estilo:font-size'},
  {sonda: 'tipo.aba.tamanho', cenario: 'prosa@1512/escuro', seletor: '.navbar__item.navbar__link', medida: 'estilo:font-size'},

  // --- geometria a 1512 --------------------------------------------------
  {sonda: 'chrome.sidebar.left', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'caixa:left'},
  {sonda: 'chrome.sidebar.largura', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'caixa:width'},
  {sonda: 'chrome.sidebar.borda', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-sidebar-container', medida: 'estilo:border-right-width'},
  {sonda: 'chrome.prosa.largura', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-markdown', medida: 'caixa:width'},
  /* A CAIXA do TOC é `.col--3`; `.theme-doc-toc-desktop` é a lista DENTRO dela.
     A âncora publica 304 para a caixa e 264 para a lista, e a nossa lista já dá
     os 264 dela — sondar a lista contra o alvo da caixa acusaria 40px de dívida
     onde há 16, e a linha contradiria a prosa do próprio §11. */
  {sonda: 'chrome.toc.largura', cenario: 'prosa@1512/escuro', seletor: '.col--3', medida: 'caixa:width'},
  {sonda: 'chrome.toc.borda', cenario: 'prosa@1512/escuro', seletor: '.col--3', medida: 'estilo:border-left-width'},
  {sonda: 'chrome.navbar.altura', cenario: 'prosa@1512/escuro', seletor: '.navbar', medida: 'caixa:height'},
  {sonda: 'chrome.margem-direita', cenario: 'prosa@1512/escuro', seletor: '.col--3', medida: 'margem-direita'},

  // --- a área útil centraliza (a correção principal da issue-pai) --------
  {sonda: 'chrome.1920.esquerda', cenario: 'prosa@1920/escuro', seletor: '.theme-doc-sidebar-container', medida: 'caixa:left'},
  {sonda: 'chrome.1920.direita', cenario: 'prosa@1920/escuro', seletor: '.col--3', medida: 'margem-direita'},

  // --- limiares ----------------------------------------------------------
  {sonda: 'chrome.1100.toc', cenario: 'prosa@1100/escuro', seletor: '.theme-doc-toc-desktop', medida: 'visivel'},
  {sonda: 'chrome.1010.sidebar', cenario: 'prosa@1010/escuro', seletor: '.theme-doc-sidebar-container', medida: 'visivel'},

  // --- cabeçalho do artigo ----------------------------------------------
  /* --- cabeçalho do artigo ---------------------------------------------
     A sobrancelha visível é o LINK, não o `<nav>` que o embrulha. O `<nav>`
     herda 14px do chrome e passaria no alvo enquanto o texto que o leitor vê
     renderiza 12,8 — sonda em elemento errado é o defeito que faz o
     instrumento mentir de cara verde. */
  {sonda: 'artigo.sobrancelha.tamanho', cenario: 'prosa@1512/escuro', seletor: '.breadcrumbs__link', medida: 'estilo:font-size'},
  {sonda: 'artigo.sobrancelha.peso', cenario: 'prosa@1512/escuro', seletor: '.breadcrumbs__link', medida: 'estilo:font-weight'},
  {sonda: 'artigo.subtitulo.tamanho', cenario: 'prosa@1512/escuro', seletor: '.subtitulo', medida: 'estilo:font-size'},
  {sonda: 'artigo.subtitulo.entrelinha', cenario: 'prosa@1512/escuro', seletor: '.subtitulo', medida: 'estilo:line-height'},
  /* O título do artigo NÃO é sondado aqui: ele é o `h1`, e o `h1` já tem alvo
     na escala de tipo. Publicá-lo duas vezes criaria duas verdades sobre o
     mesmo número, que é exatamente o defeito que este instrumento existe para
     não repetir. */

  // --- sidebar e TOC, métrica -------------------------------------------
  {sonda: 'sidebar.item.altura', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'caixa:height'},
  {sonda: 'sidebar.item.raio', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'estilo:border-radius'},
  {sonda: 'sidebar.item.recuo', cenario: 'prosa@1512/escuro', seletor: '.menu__link', medida: 'estilo:padding-left'},
  /* O que gruda é a lista, não a coluna: `.col--3` é `static` e
     `.theme-doc-toc-desktop` é `sticky`. */
  {sonda: 'toc.topo', cenario: 'prosa@1512/escuro', seletor: '.theme-doc-toc-desktop', medida: 'estilo:top'},

  // --- busca: controle e painel -----------------------------------------
  {sonda: 'busca.controle.largura', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'caixa:width'},
  {sonda: 'busca.controle.altura', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'caixa:height'},
  {sonda: 'busca.controle.raio', cenario: 'prosa@1512/escuro', seletor: '[data-sd-part="gatilho"]', medida: 'estilo:border-radius'},
  {sonda: 'busca.painel.largura', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'caixa:width'},
  {sonda: 'busca.painel.topo', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'caixa:top'},
  {sonda: 'busca.painel.raio', cenario: 'busca@1512/escuro', seletor: 'dialog[open]', medida: 'estilo:border-radius'},

  // --- componentes -------------------------------------------------------
  {sonda: 'card.raio', cenario: 'cartao@1512/escuro', seletor: '[data-sd-component="card"]', medida: 'estilo:border-radius'},
  {sonda: 'card.borda', cenario: 'cartao@1512/escuro', seletor: '[data-sd-component="card"]', medida: 'estilo:border-top-width'},
  {sonda: 'callout.raio', cenario: 'prosa@1512/escuro', seletor: '[data-sd-component="callout"]', medida: 'estilo:border-radius'},
  {sonda: 'callout.tamanho', cenario: 'prosa@1512/escuro', seletor: '[data-sd-component="callout"]', medida: 'estilo:font-size'},
  {sonda: 'codigo.raio', cenario: 'codigo@1512/escuro', seletor: '[data-sd-component="code-group"]', medida: 'estilo:border-radius'},
  {sonda: 'tabela.tamanho', cenario: 'tabela@1512/escuro', seletor: '[data-sd-component="table"] td', medida: 'estilo:font-size'},
  {sonda: 'passos.margem-topo', cenario: 'passos@1512/escuro', seletor: '[data-sd-component="steps"]', medida: 'estilo:margin-top'},
  {sonda: 'expandable.raio', cenario: 'api@1512/escuro', seletor: '[data-sd-component="expandable"]', medida: 'estilo:border-radius'},
  {sonda: 'grupo-cartoes.vao', cenario: 'cartao@1512/escuro', seletor: '[data-sd-component="card-group"]', medida: 'estilo:column-gap'},
  /* Accordion, Tabs, Frame e Mermaid não têm sonda porque **não são
     renderizados em página nenhuma** do site construído. Publicar alvo para
     eles daria linha que nunca mede — o instrumento diria `sem-medida` para
     sempre, e um alvo que não confere nada é pior que alvo nenhum: parece
     cobertura. Eles entram quando o catálogo ganhar espécime. */
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
      ['Item de sidebar altura', ['sidebar.item.altura']],
      ['Item de sidebar raio', ['sidebar.item.raio']],
      ['Item de sidebar recuo', ['sidebar.item.recuo']],
      ['TOC grudado em', ['toc.topo']],
    ],
  },
  'docs/design/chrome.md#artigo': {
    arquivo: 'docs/design/chrome.md',
    secao: '## 12. Alvo medido',
    colunas: ['alvo'],
    linhas: [
      ['Sobrancelha tamanho', ['artigo.sobrancelha.tamanho']],
      ['Sobrancelha peso', ['artigo.sobrancelha.peso']],
      ['Subtítulo tamanho', ['artigo.subtitulo.tamanho']],
      ['Subtítulo entrelinha', ['artigo.subtitulo.entrelinha']],
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
  'docs/design/componentes/steps.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [['Margem de topo', ['passos.margem-topo']]],
  },
  'docs/design/componentes/expandable.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [['Raio', ['expandable.raio']]],
  },
  'docs/design/componentes/card-group.md': {
    secao: '## Anatomia',
    colunas: ['alvo'],
    linhas: [['Vão entre colunas', ['grupo-cartoes.vao']]],
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
  const subiu = await esperarPor(async () => {
    try {
      return (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`)).ok;
    } catch {
      return false; // ainda subindo
    }
  }, TETO_CHROME);

  const fechar = () => {
    proc.kill('SIGKILL');
    rmSync(perfil, {recursive: true, force: true});
  };

  if (!subiu) {
    fechar();
    throw new Error('Chrome não subiu na porta de depuração');
  }
  return {fechar};
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
    height: ALTURA_JANELA,
    deviceScaleFactor: 1,
    mobile: false,
  });
  sessao.eventos.length = 0;
  await sessao.enviar('Page.navigate', {url});
  await esperarPor(
    () => sessao.eventos.some((e) => e.method === 'Page.loadEventFired'),
    TETO_CARGA,
  );
  await dormir(ESPERA.hidratacao);
  /* O tema é atributo no `<html>`, e a folha inteira pende dele. Cravá-lo é
     mais barato e mais determinístico do que clicar no alternador. */
  await avaliar(sessao, `document.documentElement.setAttribute('data-theme', ${JSON.stringify(tema)})`);
  await dormir(ESPERA.tema);
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
  /* O tema medido volta junto com as medidas. Trocar de modo por atributo só é
     confiável DEPOIS da hidratação — antes dela o script de tema do Docusaurus
     reafirma o seu por cima, e o sintoma é cruel: parte dos tokens muda e parte
     não, então a leitura parece plausível e está errada. Devolver o tema
     observado faz um modo que não pegou virar erro em vez de número errado com
     cara de certo. */
  const saida = {__tema: document.documentElement.getAttribute('data-theme')};
  for (const {sonda, seletor, medida} of lista) {
    let el = null;
    try { el = document.querySelector(seletor); } catch { el = null; }
    if (medida === 'visivel') { saida[sonda] = (el && el.getClientRects().length > 0) ? 'sim' : 'não'; continue; }
    if (!el) { saida[sonda] = null; continue; }
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (medida.startsWith('caixa:')) saida[sonda] = px(r[medida.slice(6)]);
    else if (medida === 'margem-direita') saida[sonda] = px(innerWidth - r.right);
    else if (medida === 'cor:background-color') saida[sonda] = fundoPintado(el);
    else if (medida.startsWith('cor:')) {
      const {hex, alfa} = resolver(cs.getPropertyValue(medida.slice(4)));
      saida[sonda] = alfa > 0 ? hex : null;
    }
    else if (medida.startsWith('estilo:')) saida[sonda] = cs.getPropertyValue(medida.slice(7)).trim();
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
          await dormir(ESPERA.modal);
        }

        const {__tema: temaMedido, ...doNavegador} = JSON.parse(
          await avaliar(sessao, SONDAR(doCenario)),
        );
        if (temaMedido !== cenario.tema) {
          throw new Error(
            `${nome}: pedi o tema "${cenario.tema}" e a página mediu "${temaMedido}". ` +
              'A hidratação reafirmou o tema por cima — aumente `ESPERA.hidratacao`. ' +
              'Medir no modo errado devolveria número errado com cara de certo.',
          );
        }
        Object.assign(medidas, doNavegador);
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
