#!/usr/bin/env node
/**
 * Vendoriza os desenhos do manifesto de ícones.
 *
 *   node scripts/vendor-icons.mjs            baixa o que falta
 *   node scripts/vendor-icons.mjs --conferir não baixa; só confere
 *
 * Não é portão de CI — precisa de rede, e a rede é exatamente o que o ambiente
 * corporativo alvo não tem. É a ferramenta do **ato de copiar**, e ela existe
 * por um motivo específico: o Lucide **renomeia glifo entre versões**
 * (`code-xml` já foi `code-2`). Um nome que sumiu vira 404 aqui, alto, em vez
 * de virar quadrado vazio na sidebar seis meses depois.
 *
 * O manifesto é lido do fonte, não redigitado: `src/icons/manifest.js` é o
 * contrato, e duplicar a lista aqui criaria a segunda versão da mesma verdade
 * que o espelho de tokens existe para impedir.
 */

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const MANIFEST = 'src/icons/manifest.js';
const SIDEBAR_CSS = 'src/css/chrome.css';
const DESTINATION = 'static/icons';

const source = readFileSync(MANIFEST, 'utf8');

const version = source.match(/LUCIDE_VERSION = '([^']+)'/)?.[1];
if (!version) {
  console.error(`${MANIFEST} não declara LUCIDE_VERSION.`);
  process.exit(2);
}

// O teto vem do manifesto, não redigitado aqui. Um teto com duas versões é um
// teto que vale o menor dos dois, e ninguém saberia qual.
const CEILING = Number(source.match(/CEILING = (\d+)/)?.[1]);
if (!CEILING) {
  console.error(`${MANIFEST} não declara TETO.`);
  process.exit(2);
}

const entries = [...source.matchAll(/\{nome: '([^']+)', papeis: \[([^\]]*)\][^}]*\}/g)].map((m) => ({
  name: m[1],
  roles: [...m[2].matchAll(/'([^']+)'/g)].map((p) => p[1]),
  // O nome do upstream só existe onde ele diverge do nosso.
  lucide: m[0].match(/lucide: '([^']+)'/)?.[1] ?? m[1],
}));

// ---------------------------------------------------------------------------
// A aritmética do orçamento, conferida antes de qualquer download.
// ---------------------------------------------------------------------------

const files = new Map(entries.map((e) => [e.name, e.lucide]));
const tags = entries.reduce((n, e) => n + e.roles.length, 0);
const byRole = (role) => entries.filter((e) => e.roles.includes(role)).length;

// Os onze pares seção→ícone existem em três lugares: `SECTION_ICON_PAIRS` no
// manifesto, o `className` de cada categoria nos arquivos de sidebar, e a regra
// de máscara no CSS. Três cópias da mesma verdade e nenhuma marcada como errada
// é o defeito que este repositório mais recusa — então aqui elas se conferem.
const pairs = [...(source.match(/SECTION_ICON_PAIRS = \{([^}]*)\}/s)?.[1] ?? '').matchAll(
  /'?([a-z-]+)'?:\s*'([a-z0-9-]+)'/g,
)].map((m) => ({section: m[1], icon: m[2]}));

const sidebarCss = readFileSync(SIDEBAR_CSS, 'utf8');

// O TERCEIRO lado, que este script afirmava conferir e não conferia.
//
// Ele casava `SECTION_ICON_PAIRS` contra o manifesto e contra o CSS — dois lados —, e o
// comentário acima já prometia três. O `className` das sidebars ficava de fora, e
// o modo de falhar é exatamente o que a máscara tem de pior: **mudo**. Renomear
// uma categoria no arquivo de sidebar sem mexer no manifesto não quebra build,
// não some com a página, e não tira o item da lista; ele só deixa de ter ícone,
// e a sidebar continua parecendo certa para quem não conhece a árvore.
//
// A varredura ficou barata quando as sidebars viraram três: um arquivo por aba,
// com o `className` escrito à mão em toda categoria de topo.
//
// **A quarta é GERADA, e entra na varredura pela mesma porta.** Deixá-la de
// fora punha o portão 5 e este script cobrando lados diferentes do mesmo par:
// desde a #118 as folhas de `sidebars-referencia.js` carregam chave por página
// (`comando-raiz`, `comando-list`, …), e sem ela aqui todas as quatro
// apareceriam como par sem declarante. Ela é saída de gerador e não se edita à
// mão, o que não a torna menos declarante — o que se lê é o `className` que foi
// parar no arquivo, venha ele de onde vier.
const SIDEBARS = [
  'sidebars-jornadas.js',
  'sidebars-procedimentos.js',
  'sidebars-ferramentas.js',
  'sidebars-referencia.js',
  'sidebars-times.js',
];
// O `'` de fechamento no fim NÃO é enfeite: `[a-z0-9-]+` casa PREFIXO, então
// `sidebar-icon--api-ownerX` extrairia `api-owner` e a conferência passaria
// achando que o par existe. Medido escrevendo o rename de propósito.
const declaredInSidebar = new Set(
  SIDEBARS.flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/sidebar-icon--([a-zA-Z0-9-]+)'/g)].map((m) => m[1]),
  ),
);

const problems = [];
if (files.size !== entries.length) {
  problems.push('há nome repetido no manifesto — papel é tag na entrada, não entrada nova');
}
if (files.size > CEILING) {
  problems.push(`${files.size} arquivos contra o teto duro de ${CEILING}`);
}
if (pairs.length !== byRole('navigation')) {
  problems.push(
    `SECTION_ICON_PAIRS tem ${pairs.length} pares contra ${byRole('navigation')} tags de navegação`,
  );
}
for (const {section, icon} of pairs) {
  const entry = entries.find((e) => e.name === icon);
  if (!entry) {
    problems.push(`o par \`${section}\` aponta para \`${icon}\`, que não está no manifesto`);
  } else if (!entry.roles.includes('navigation')) {
    problems.push(`\`${icon}\` é usado por \`${section}\` mas não carrega a tag \`navegacao\``);
  }
  if (!sidebarCss.includes(`.sidebar-icon--${section} `)) {
    problems.push(`o par \`${section}\` não tem regra \`.sidebar-icon--${section}\` em ${SIDEBAR_CSS}`);
  } else if (!sidebarCss.includes(`/icons/${icon}.svg`)) {
    problems.push(`${SIDEBAR_CSS} não mascara \`${icon}.svg\`, que o par \`${section}\` pede`);
  }
  if (!declaredInSidebar.has(section)) {
    problems.push(
      `o par \`${section}\` não é declarado por nenhuma sidebar — nenhum nó carrega \`sidebar-icon--${section}\``,
    );
  }
}
// E o sentido contrário, que é o que pega o rename: uma categoria que pede um
// ícone que o manifesto não conhece fica sem máscara, calada.
for (const section of declaredInSidebar) {
  if (!pairs.some((p) => p.section === section)) {
    problems.push(
      `uma sidebar declara \`sidebar-icon--${section}\` e \`SECTION_ICON_PAIRS\` não tem esse par`,
    );
  }
}
if (problems.length) {
  console.error('Manifesto REPROVOU:');
  problems.forEach((p) => console.error(`  · ${p}`));
  process.exit(1);
}

console.log(
  `Manifesto: ${byRole('system')} sistema · ${byRole('navigation')} navegação · ` +
    `${byRole('authoring')} autoria = ${tags} tags sobre ${files.size} arquivos ` +
    `(teto ${CEILING}, folga ${CEILING - files.size}).`,
);
console.log(`Os ${pairs.length} pares seção→ícone batem com o manifesto e com ${SIDEBAR_CSS}.`);

if (process.argv[2] === '--conferir') {
  const missing = [...files.keys()].filter((n) => !existsSync(join(DESTINATION, `${n}.svg`)));
  // O terceiro lado da bijeção: desenho em `static/icons/` que ninguém declarou.
  // O registro React pega os outros dois; este só o vendorizador vê, porque um
  // arquivo órfão não é importado por ninguém e viaja calado.
  const orphans = readdirSync(DESTINATION)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''))
    .filter((n) => !files.has(n));

  if (missing.length || orphans.length) {
    if (missing.length) {
      console.error(`Faltam ${missing.length} desenhos em ${DESTINATION}: ${missing.join(', ')}`);
    }
    if (orphans.length) {
      console.error(`${orphans.length} desenhos sem entrada no manifesto: ${orphans.join(', ')}`);
    }
    process.exit(1);
  }
  console.log(`Os ${files.size} desenhos estão em ${DESTINATION}, e nenhum a mais.`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// O download, contra a tag fixada.
// ---------------------------------------------------------------------------

mkdirSync(DESTINATION, {recursive: true});

const base = `https://raw.githubusercontent.com/lucide-icons/lucide/${version}/icons`;
const missing2 = [];

for (const [name, upstream] of files) {
  const target = join(DESTINATION, `${name}.svg`);
  if (existsSync(target)) {
    continue;
  }
  const response = await fetch(`${base}/${upstream}.svg`);
  if (!response.ok) {
    missing2.push(name === upstream ? name : `${name} (via ${upstream})`);
    continue;
  }
  // O SVG do Lucide já nasce pronto para herdar cor: `stroke="currentColor"`,
  // `fill="none"`, `viewBox="0 0 24 24"`. Nada a reescrever.
  writeFileSync(target, await response.text());
  console.log(`  ↓ ${name}.svg`);
}

if (missing2.length) {
  console.error(
    `\nO Lucide ${version} não tem ${missing2.length} destes desenhos: ${missing2.join(', ')}\n` +
      'Ou o glifo foi renomeado entre versões, ou o nome está errado.\n' +
      'Confira em https://lucide.dev/icons e acrescente o campo `lucide:` na entrada.\n' +
      'O nome do manifesto é NOSSO contrato e não se move por renomeação de terceiro.',
  );
  process.exit(1);
}

console.log(`\nOs ${files.size} desenhos do Lucide ${version} estão em ${DESTINATION}.`);
