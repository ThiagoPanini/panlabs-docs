#!/usr/bin/env node
/**
 * Contraste — a tabela de `docs/design/tokens.md` §10 e a de `foco.md` §6,
 * COMPUTADAS de `src/css/tokens.css` e CONFERIDAS contra o que os documentos
 * afirmam.
 *
 * Não é um portão. A régua está no `README.md` §5: verificação que protege uma
 * REGRA DE ESCRITA é portão; verificação que confere que duas cópias da mesma
 * verdade não divergiram, não é. Aqui as cópias são o número escrito na spec e a
 * cor que o CSS entrega — o mesmo formato do espelho de tokens.
 *
 * Por que ele existe. As duas tabelas mediam o MESMO par — o anel de foco contra
 * a superfície levantada e contra a página — e discordavam em três das quatro
 * células, desde o teste do axioma 6. Uma tabela transcrita à mão diverge da
 * outra calada; duas tabelas lidas por um comando não têm como.
 *
 *   node scripts/contraste.mjs               imprime a medição inteira
 *   node scripts/contraste.mjs --verificar   falha se um piso cair OU se uma
 *                                            célula publicada divergir
 *
 * ZERO DEPENDÊNCIA, e nenhum navegador: a aritmética de sRGB↔OKLCH e a fórmula
 * de luminância relativa da WCAG cabem aqui inteiras. Conferido contra o valor
 * computado do Chrome, canal a canal, nos dois modos.
 *
 * ---------------------------------------------------------------------------
 * A REGRA DE CONTEÚDO DESTE ARQUIVO, e ela é a mesma do resto do projeto:
 * NENHUM VALOR DE DESENHO MORA AQUI. Nem cor, nem alfa, nem luminosidade, nem
 * trava de acento. Tudo é lido de `tokens.css` pelo avaliador abaixo, e uma
 * declaração que mude de forma faz o script MORRER em vez de cair num valor
 * velho. Um conferidor que guarda a própria cópia do que confere é o defeito que
 * ele existe para pegar.
 *
 * O que mora aqui é o que a spec não tem como derivar: quais pares importam,
 * sobre que superfície cada um assenta, e os pisos que a spec afirma.
 * ---------------------------------------------------------------------------
 */

import {readFileSync} from 'node:fs';

const CSS = 'src/css/tokens.css';
const DOC_TOKENS = 'docs/design/tokens.md';
const DOC_FOCO = 'docs/design/foco.md';

/* ---------------------------------------------------------------------------
   Cor — sRGB, OKLab e a ida e volta entre os dois.

   As matrizes são as do CSS Color 4. Elas não são valor de desenho: são a
   definição do espaço.
   --------------------------------------------------------------------------- */

const paraLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const paraGama = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const trava = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));

function hexParaRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? [...h].map((c) => c + c) : h.match(/../g);
  return n.slice(0, 3).map((p) => parseInt(p, 16) / 255);
}

function rgbParaOklab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(paraLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabParaRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => trava(paraGama(v)));
}

const rgbParaOklch = (rgb) => {
  const [L, a, b] = rgbParaOklab(rgb);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
};

const oklchParaRgb = ([L, C, H]) =>
  oklabParaRgb([L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)]);

/* O contraste é medido sobre a cor DE OITO BITS, e isso não é detalhe.

   A tela recebe `#RRGGBB`; a aritmética contínua da conversão OKLCH→sRGB não.
   Medir no contínuo produz números que ninguém reproduz a partir dos hex
   publicados na spec — e uma tabela irreproduzível é exatamente a que diverge
   calada da outra. */
const oitoBits = (rgb) => rgb.slice(0, 3).map((c) => Math.round(trava(c) * 255) / 255);

/* Alfa sobre um fundo opaco. As duas camadas entram QUANTIZADAS e o resultado
   sai quantizado, porque é assim que a pintura acontece: o fundo já foi pintado
   num buffer de oito bits antes de o preenchimento translúcido chegar. */
function sobre(frente, fundo) {
  const alfa = frente[3] ?? 1;
  const [f, b] = [oitoBits(frente), oitoBits(fundo)];
  return oitoBits(f.map((c, i) => c * alfa + b[i] * (1 - alfa)));
}

const luminancia = (rgb) => {
  const [R, G, B] = oitoBits(rgb).map(paraLinear);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const hexDe = (rgb) =>
  '#' + oitoBits(rgb).map((c) => Math.round(c * 255).toString(16).padStart(2, '0').toUpperCase()).join('');

/* ---------------------------------------------------------------------------
   O AVALIADOR — resolve um token de `tokens.css` até uma cor.

   Ele conhece exatamente as três operações que a regra de derivação legaliza,
   mais `var()` e hex. Nada além disso, e forma que ele não reconhece é ERRO —
   nunca um default silencioso. É essa dureza que impede o script de virar uma
   segunda fonte de verdade quando o CSS mudar de forma.
   --------------------------------------------------------------------------- */

const css = readFileSync(CSS, 'utf8');

/* Os dois blocos de modo, do seletor até a chave que o fecha. O seletor é casado
   em início de linha: o cabeçalho do arquivo CITA os dois em prosa, e uma busca
   crua acharia o comentário primeiro.

   O escuro precisa de uma SEGUNDA âncora, e a necessidade nasceu quando a ilha
   de espetáculo saiu (issue #94). O bloco abria com `:root,\n[data-sd-showcase]`
   e esse par era único no arquivo. Hoje ele abre com `:root`, e há QUATRO blocos
   assim — a camada 1, este, o da sombra e o adaptador. Casar só o seletor
   recortaria o primeiro deles e passaria a medir a camada errada EM SILÊNCIO:
   `declaracao()` cai no `?? buscar(css)` e acha o token em qualquer lugar do
   arquivo, então o erro sairia como número plausível em vez de exceção.

   A âncora é a primeira declaração do bloco, que é o que o define: um bloco de
   modo é o que declara `color-scheme`. */
function recorte(padraoDeAbertura, primeiraDeclaracao) {
  const alvo = primeiraDeclaracao
    ? `^${padraoDeAbertura} \\{\\n  ${primeiraDeclaracao}$`
    : `^${padraoDeAbertura} \\{$`;
  const abre = css.search(new RegExp(alvo, 'm'));
  if (abre === -1) throw new Error(`bloco não encontrado em ${CSS}: ${padraoDeAbertura}`);
  return css.slice(abre, css.indexOf('\n}', abre));
}

const ESCURO = recorte(':root', 'color-scheme: dark;');
const CLARO = recorte(":root\\[data-theme='light'\\]");

/* A declaração vale a do bloco do modo; se ela não estiver lá, vale a da raiz.
   É a mesma cascata que o navegador aplica, e é o que faz `--sd-shadow-lip` e as
   onze paradas da rampa serem achadas de qualquer um dos dois modos. */
function declaracao(nome, bloco) {
  const buscar = (texto) => texto.match(new RegExp(`^\\s+${nome}:\\s*([^;]+);`, 'm'))?.[1];
  const achado = buscar(bloco) ?? buscar(css);
  if (achado === undefined) throw new Error(`token não declarado em ${CSS}: ${nome}`);
  return achado.trim().replace(/\s+/g, ' ');
}

/* Um número CSS: `0.72`, `27.5%`, `80%`. Percentagem vira fração. */
function numero(txt, dono) {
  const m = txt.trim().match(/^(-?[\d.]+)(%?)$/);
  if (!m) throw new Error(`número não reconhecido em ${dono}: ${txt}`);
  return m[2] ? Number(m[1]) / 100 : Number(m[1]);
}

/* Divide os argumentos de uma função no nível de parêntese zero. */
function partes(txt, separador = ' ') {
  const saida = [];
  let nivel = 0;
  let atual = '';
  for (const ch of txt) {
    if (ch === '(') nivel++;
    if (ch === ')') nivel--;
    if (nivel === 0 && ch === separador) {
      if (atual.trim()) saida.push(atual.trim());
      atual = '';
    } else atual += ch;
  }
  if (atual.trim()) saida.push(atual.trim());
  return saida;
}

/* Um canal de `oklch(from …)`: pode ser a palavra-chave herdada (`l`, `c`, `h`),
   um número, ou uma das três formas de ajuste que o arquivo de fato usa. */
function canal(txt, origem, dono, bloco) {
  const [l, c, h] = origem;
  const herdado = {l, c, h};
  const t = txt.trim();
  if (t in herdado) return herdado[t];

  /* Raiz numérica citada por nome — hoje só `--sd-brand-tint` e os quatro
     `--sd-hue-*`. Resolvê-la aqui é o que impede este arquivo de guardar uma
     segunda cópia do tint. */
  const referencia = t.match(/^var\((--sd-[a-z0-9-]+)\)$/);
  if (referencia) return numero(declaracao(referencia[1], bloco), referencia[1]);

  const chamada = t.match(/^(max|min|calc|clamp)\((.*)\)$/s);
  if (!chamada) return numero(t, dono);

  const [, fn, args] = chamada;
  const arg = partes(args, ',');

  if (fn === 'max' || fn === 'min') {
    const vs = arg.map((a) => canal(a, origem, dono, bloco));
    return fn === 'max' ? Math.max(...vs) : Math.min(...vs);
  }
  if (fn === 'calc') {
    const mult = args.match(/^(\S+)\s*\*\s*(\S+)$/);
    const soma = args.match(/^(\S+)\s*([+-])\s*(\S+)$/);
    if (mult) return canal(mult[1], origem, dono, bloco) * canal(mult[2], origem, dono, bloco);
    if (soma) {
      const [a, b] = [canal(soma[1], origem, dono, bloco), canal(soma[3], origem, dono, bloco)];
      return soma[2] === '+' ? a + b : a - b;
    }
    throw new Error(`calc não reconhecido em ${dono}: ${args}`);
  }
  /* `clamp(0, (0.62 - l) * 1000, 1)` — a fórmula do texto sobre o acento. */
  if (fn === 'clamp') {
    const meio = arg[1].match(/^\((\S+)\s*-\s*(\S+)\)\s*\*\s*(\S+)$/);
    if (!meio) throw new Error(`clamp não reconhecido em ${dono}: ${arg[1]}`);
    const v = (canal(meio[1], origem, dono, bloco) - canal(meio[2], origem, dono, bloco)) * canal(meio[3], origem, dono, bloco);
    return trava(v, canal(arg[0], origem, dono, bloco), canal(arg[2], origem, dono, bloco));
  }
  throw new Error(`função não reconhecida em ${dono}: ${fn}`);
}

/* Resolve um valor de cor para [r, g, b, alfa]. */
function resolver(valor, bloco, dono = valor, profundidade = 0) {
  if (profundidade > 12) throw new Error(`ciclo de var() ao resolver ${dono}`);
  const v = valor.trim();

  if (v.startsWith('#')) return [...hexParaRgb(v), 1];

  const referencia = v.match(/^var\((--sd-[a-z0-9-]+)\)$/);
  if (referencia) {
    return resolver(declaracao(referencia[1], bloco), bloco, referencia[1], profundidade + 1);
  }

  const oklch = v.match(/^oklch\((.*)\)$/s);
  if (oklch) {
    const arg = partes(oklch[1]);
    /* `oklch(from <cor> L C H)` deriva; `oklch(L C H)` é literal de raiz. */
    if (arg[0] === 'from') {
      const base = resolver(arg[1], bloco, dono, profundidade + 1);
      const origem = rgbParaOklch(base);
      return [...oklchParaRgb([2, 3, 4].map((i) => canal(arg[i], origem, dono, bloco))), base[3]];
    }
    const bruto = arg.map((a) => canal(a, [0, 0, 0], dono, bloco));
    /* O matiz é ângulo, e o parser de número devolveu fração se veio com `%`.
       Só L é percentagem no arquivo, então H volta a grau aqui. */
    return [...oklchParaRgb([bruto[0], bruto[1], bruto[2] > 1 ? bruto[2] : bruto[2] * 360]), 1];
  }

  const rgbRelativo = v.match(/^rgb\(from (\S+) r g b \/ ([\d.]+)%\)$/);
  if (rgbRelativo) {
    const base = resolver(rgbRelativo[1], bloco, dono, profundidade + 1);
    return [...base.slice(0, 3), Number(rgbRelativo[2]) / 100];
  }

  throw new Error(`forma de cor não reconhecida em ${dono}: ${v}`);
}

/* ---------------------------------------------------------------------------
   O que a spec decide, e o avaliador não tem como saber: quais pares importam e
   sobre que superfície cada um assenta.

   Preenchimento translúcido não tem cor própria — tem a cor do que está atrás.
   O callout mora dentro do corpo do documento, sobre a superfície levantada; o
   wash do item ativo mora na sidebar, que fica FORA dela, sobre a página.
   Trocar um desses fundos move o pior caso do corpo de 6,47 para 9,10.
   --------------------------------------------------------------------------- */

const ESTADOS = ['info', 'success', 'warn', 'danger'];
const PAPEIS_CODIGO = ['parameter', 'constant', 'keyword', 'string', 'function', 'operator', 'comment'];

const MODOS = {
  dark: {rotulo: 'escuro', bloco: ESCURO},
  light: {rotulo: 'claro', bloco: CLARO},
};

function medir(chave) {
  const {bloco} = MODOS[chave];
  const cor = (nome) => resolver(`var(${nome})`, bloco);

  const page = cor('--sd-surface-page');
  const raised = cor('--sd-surface-raised');
  const code = cor('--sd-surface-code');
  const acento = cor('--sd-accent');
  const wash = sobre(cor('--sd-surface-wash'), page);
  const fill = Object.fromEntries(ESTADOS.map((n) => [n, sobre(cor(`--sd-state-${n}-fill`), raised)]));
  const codigo = Object.fromEntries(PAPEIS_CODIGO.map((p) => [p, cor(`--sd-code-${p}`)]));

  const pares = {
    'text-strong sobre levantada': [cor('--sd-text-strong'), raised],
    'text-strong sobre página': [cor('--sd-text-strong'), page],
    'text-body sobre levantada': [cor('--sd-text-body'), raised],
    'text-body sobre página': [cor('--sd-text-body'), page],
    'text-muted sobre levantada': [cor('--sd-text-muted'), raised],
    'text-muted sobre página': [cor('--sd-text-muted'), page],
    'acento como link, sobre levantada': [acento, raised],
    'acento como link, sobre página': [acento, page],
    'text-inverse sobre preenchimento de acento': [cor('--sd-text-inverse'), acento],
    'anel de foco vs levantada': [cor('--sd-focus-ring'), raised],
    'anel de foco vs página': [cor('--sd-focus-ring'), page],
    'anel de foco vs pastilha de código': [cor('--sd-focus-ring'), code],
    'text-strong sobre o wash do item ativo': [cor('--sd-text-strong'), wash],
    'anel de foco vs wash do item ativo': [cor('--sd-focus-ring'), wash],
    ...Object.fromEntries(
      ESTADOS.map((n) => [`anel de foco vs fundo de callout ${n}`, [cor('--sd-focus-ring'), fill[n]]]),
    ),
    ...Object.fromEntries(
      ESTADOS.map((n) => [`corpo sobre fundo de callout ${n}`, [cor('--sd-text-body'), fill[n]]]),
    ),
    ...Object.fromEntries(
      ESTADOS.map((n) => [`ícone de estado ${n} sobre o próprio fundo`, [cor(`--sd-state-${n}`), fill[n]]]),
    ),
    'text-faint sobre levantada (reprovação declarada)': [cor('--sd-text-faint'), raised],
    'text-faint sobre página (reprovação declarada)': [cor('--sd-text-faint'), page],
  };

  return {
    rotulo: MODOS[chave].rotulo,
    superficies: {page: hexDe(page), raised: hexDe(raised), code: hexDe(code), acento: hexDe(acento)},
    pares: Object.fromEntries(Object.entries(pares).map(([k, [f, b]]) => [k, contraste(f, b)])),
    sintaxe: Object.fromEntries(
      PAPEIS_CODIGO.map((p) => [
        p,
        {contraste: contraste(codigo[p], code), croma: rgbParaOklch(codigo[p])[1], hex: hexDe(codigo[p])},
      ]),
    ),
  };
}

const medido = {dark: medir('dark'), light: medir('light')};

const rampa = Object.fromEntries(
  [...css.matchAll(/^\s+(--sd-gray-\d+):/gm)].map(([, nome]) => [nome, hexDe(resolver(`var(${nome})`, ESCURO))]),
);

/* ---------------------------------------------------------------------------
   Os pisos que a spec afirma. Trocar um número aqui é editar a spec.
   --------------------------------------------------------------------------- */

const PISOS = {
  // O piso do escuro desceu de 8,04 para 8,03 quando a superfície do código
  // subiu um degrau, e a razão é aritmética, não afrouxamento. O 8,04 foi
  // escrito como PREVISÃO — "o piso contra a pastilha um degrau acima na rampa,
  // que é onde ela vai parar quando o cartão sair" — e gravado com duas casas.
  // A previsão acertou a segunda decimal: a medição dá 8,0364, que EXIBE 8,04 e
  // é, no float, três milésimos menor. Um piso gravado acima do que a grandeza
  // vale nunca poderia passar. Vale o degrau honesto abaixo da medição.
  sintaxeEscuro: 8.03,
  sintaxeClaro: 6.29,
  cromaMaximo: 0.095,
  focoMinimo: 3.0, // SC 1.4.11 — contraste de conteúdo não textual
  aaMinimo: 4.5, // SC 1.4.3
};

/* Vírgula decimal, como a spec escreve. A conferência de célula compara STRING,
   então a formatação daqui é a mesma coisa que o formato publicado — trocá-la é
   trocar o que os documentos precisam dizer. */
const duasCasas = (x) => x.toFixed(2).replace('.', ',');
const tresCasas = (x) => x.toFixed(3).replace('.', ',');

const piorSintaxe = (m) => Math.min(...Object.values(medido[m].sintaxe).map((s) => s.contraste));
const maiorCroma = (m) => Math.max(...Object.values(medido[m].sintaxe).map((s) => s.croma));

/* Par cujo piso é o de conteúdo NÃO TEXTUAL: anel de foco e glifo de estado. */
const naoTextual = (nome) => nome.startsWith('anel de foco') || nome.startsWith('ícone de estado');
const reprovacaoDeclarada = (nome) => nome.startsWith('text-faint');

if (process.argv[2] !== '--verificar') {
  const marca = resolver(declaracao('--sd-brand', ESCURO), ESCURO, '--sd-brand');
  const [, c, h] = rgbParaOklch(marca);
  console.log(`\nMarca ${hexDe(marca)} — oklch c ${tresCasas(c)} h ${h.toFixed(1)}\n`);

  console.log('A rampa, parada a parada');
  for (const [nome, hex] of Object.entries(rampa)) console.log(`  ${nome.padEnd(14)} ${hex}`);

  console.log('\nAs superfícies');
  for (const m of ['dark', 'light']) {
    const s = medido[m].superficies;
    console.log(`  ${medido[m].rotulo.padEnd(7)} página ${s.page}  levantada ${s.raised}  código ${s.code}  acento ${s.acento}`);
  }

  console.log('\nContraste — todos os pares onde AA ou SC 1.4.11 é obrigatório');
  const nomes = Object.keys(medido.dark.pares);
  const larg = Math.max(...nomes.map((n) => n.length));
  console.log(`  ${'par'.padEnd(larg)}  escuro   claro`);
  for (const nome of nomes) {
    console.log(`  ${nome.padEnd(larg)}  ${duasCasas(medido.dark.pares[nome]).padStart(6)}  ${duasCasas(medido.light.pares[nome]).padStart(6)}`);
  }

  console.log('\nA paleta de sintaxe sobre a pastilha');
  for (const p of PAPEIS_CODIGO) {
    const d = medido.dark.sintaxe[p];
    const l = medido.light.sintaxe[p];
    console.log(
      `  ${p.padEnd(11)} ${d.hex} ${duasCasas(d.contraste).padStart(5)} c${tresCasas(d.croma)}  ${l.hex} ${duasCasas(l.contraste).padStart(5)} c${tresCasas(l.croma)}`,
    );
  }
  console.log(
    `\n  pior token: ${duasCasas(piorSintaxe('dark'))} escuro · ${duasCasas(piorSintaxe('light'))} claro` +
      `   croma máx: ${tresCasas(maiorCroma('dark'))} / ${tresCasas(maiorCroma('light'))}\n`,
  );
  process.exit(0);
}

/* --- modo --verificar ------------------------------------------------------ */

const falhas = [];
const exigir = (ok, msg) => ok || falhas.push(msg);

/* 1 — os pisos que a spec afirma ------------------------------------------- */

exigir(
  piorSintaxe('dark') >= PISOS.sintaxeEscuro,
  `piso de sintaxe no escuro: ${duasCasas(piorSintaxe('dark'))} < ${duasCasas(PISOS.sintaxeEscuro)}`,
);
exigir(
  piorSintaxe('light') >= PISOS.sintaxeClaro,
  `piso de sintaxe no claro: ${duasCasas(piorSintaxe('light'))} < ${duasCasas(PISOS.sintaxeClaro)}`,
);
for (const m of ['dark', 'light']) {
  exigir(
    maiorCroma(m) <= PISOS.cromaMaximo + 1e-9,
    `teto de croma no ${medido[m].rotulo}: ${tresCasas(maiorCroma(m))} > ${tresCasas(PISOS.cromaMaximo)}`,
  );
  for (const [nome, v] of Object.entries(medido[m].pares)) {
    if (reprovacaoDeclarada(nome)) continue; // a única reprovação, e ela é deliberada
    const piso = naoTextual(nome) ? PISOS.focoMinimo : PISOS.aaMinimo;
    exigir(v >= piso, `${nome} (${medido[m].rotulo}): ${duasCasas(v)} < ${duasCasas(piso)}`);
  }
}

/* 2 — as células publicadas ------------------------------------------------
   É esta metade que fecha o defeito de origem. Um piso protege contra a skin
   piorar; ele não protege contra a TABELA envelhecer, que foi o que aconteceu.
   Toda célula que os dois documentos afirmam é conferida contra a medição, e
   uma célula publicada que não exista aqui reprova junto — senão bastaria
   renomear uma linha para escapar da conferência. */

const CELULAS = {
  [DOC_TOKENS]: [
    ['`text-strong` sobre levantada / página', ['text-strong sobre levantada', 'text-strong sobre página']],
    ['`text-body` sobre levantada / página', ['text-body sobre levantada', 'text-body sobre página']],
    ['`text-muted` sobre levantada / página', ['text-muted sobre levantada', 'text-muted sobre página']],
    ['acento como link, sobre levantada / página', ['acento como link, sobre levantada', 'acento como link, sobre página']],
    ['`text-inverse` sobre preenchimento de acento', ['text-inverse sobre preenchimento de acento']],
    ['anel de foco vs levantada / página (SC 1.4.11 pede 3:1)', ['anel de foco vs levantada', 'anel de foco vs página']],
    ['anel de foco vs pastilha de código', ['anel de foco vs pastilha de código']],
    ['`text-strong` sobre o wash do item ativo', ['text-strong sobre o wash do item ativo']],
    ['**sintaxe, pior token, sobre a pastilha**', ['@sintaxe']],
    ['ícone de estado sobre o próprio fundo, pior caso', ['@pior:ícone de estado']],
    ['corpo sobre fundo de callout, pior caso', ['@pior:corpo sobre fundo de callout']],
  ],
  [DOC_FOCO]: [
    ['página', ['anel de foco vs página']],
    ['superfície levantada', ['anel de foco vs levantada']],
    ['pastilha de código', ['anel de foco vs pastilha de código']],
    ['fundo de callout `info`', ['anel de foco vs fundo de callout info']],
    ['fundo de callout `success`', ['anel de foco vs fundo de callout success']],
    ['fundo de callout `warn`', ['anel de foco vs fundo de callout warn']],
    ['fundo de callout `danger`', ['anel de foco vs fundo de callout danger']],
    ['wash do item ativo de sidebar', ['anel de foco vs wash do item ativo']],
  ],
};

/* Resolve um apelido de célula para o par de números (escuro, claro). */
function valores(chave) {
  if (chave === '@sintaxe') return [piorSintaxe('dark'), piorSintaxe('light')];
  const pior = chave.match(/^@pior:(.+)$/);
  if (pior) {
    return ['dark', 'light'].map((m) =>
      Math.min(
        ...Object.entries(medido[m].pares)
          .filter(([n]) => n.startsWith(pior[1]))
          .map(([, v]) => v),
      ),
    );
  }
  return ['dark', 'light'].map((m) => medido[m].pares[chave]);
}

for (const [arquivo, linhas] of Object.entries(CELULAS)) {
  const texto = readFileSync(arquivo, 'utf8');
  for (const [rotulo, chaves] of linhas) {
    const linha = texto
      .split('\n')
      .find((l) => l.startsWith('| ') && l.slice(2).trimStart().startsWith(rotulo));
    if (!linha) {
      falhas.push(`${arquivo}: a linha "${rotulo}" sumiu da tabela — renomeá-la não a tira da conferência`);
      continue;
    }
    /* A tabela publica MODO por coluna e chave por barra: uma linha de duas
       chaves sai `escuro-1 / escuro-2 | claro-1 / claro-2`. Achatar por chave
       inverteria o par do meio, e é exatamente o tipo de erro silencioso que
       esta conferência existe para pegar. */
    const publicados = [...linha.matchAll(/\b(\d+,\d{2})\b/g)].map((m) => m[1]);
    const porModo = chaves.map(valores);
    const esperados = [0, 1].flatMap((modo) => porModo.map((v) => duasCasas(v[modo])));
    if (publicados.join(' / ') !== esperados.join(' / ')) {
      falhas.push(
        `${arquivo}: "${rotulo}" publica ${publicados.join(' / ') || '(nada)'} e a medição dá ${esperados.join(' / ')}`,
      );
    }
  }
}

if (falhas.length) {
  console.error('Contraste REPROVOU:\n');
  for (const f of falhas) console.error(`  · ${f}`);
  console.error(`\nOs pisos e as tabelas estão em ${DOC_TOKENS} §10 e ${DOC_FOCO} §6.`);
  console.error('Rode `node scripts/contraste.mjs` para ver a medição inteira.');
  process.exit(1);
}

const celulas = Object.values(CELULAS).flat().length;
console.log(
  `Contraste em dia — sintaxe ${duasCasas(piorSintaxe('dark'))} / ${duasCasas(piorSintaxe('light'))}, ` +
    `croma máx ${tresCasas(maiorCroma('dark'))} / ${tresCasas(maiorCroma('light'))}, ` +
    `todo par obrigatório acima do piso, e as ${celulas} linhas publicadas batem com a medição.`,
);
