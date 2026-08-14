/**
 * A régua do comparador de paridade — `node --test`, do próprio runtime.
 *
 * O comparador tem duas metades, e só uma é conferível por varredura. Dirigir
 * Chromium e ler o DOM é I/O: para exercitá-lo é preciso um navegador, um site
 * construído e um relógio. Já *decidir se o medido fecha com o publicado* é
 * aritmética sobre texto — e é onde moram os erros que importam, porque um
 * comparador que erra a conta não reprova nada e ainda parece verde.
 *
 * Por isso a lógica pura mora em `lib/paridade.mjs`, longe do driver, e é esta
 * a única superfície de teste unitário do trabalho. É a mesma decisão que a
 * escada de pontuação da busca tomou pelo mesmo motivo: separar para poder
 * cobrar.
 *
 * **Zero dependência nova.** `node:test` e `node:assert` vêm no runtime.
 *
 * Roda com `npm test`. Cadência: commit.
 *
 * Procedência: docs/design/principios.md §6 · docs/research/paridade-devin.md.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';

import {
  analisarTolerancia,
  analisarValor,
  comparar,
  formatar,
  lerAlvos,
} from './lib/paridade.mjs';

/** Um documento de mentira, no formato que a spec publica. */
const DOC = [
  '# Chrome',
  '',
  '## 7. Alvo medido — geometria a 1512',
  '',
  '| Sonda | Alvo | Tolerância |',
  '| --- | --- | --- |',
  '| Sidebar `left` | `52px` | ±1 |',
  '| Caixa do TOC | `304px` | ±1 |',
  '| Coluna de texto | `720,81px` | ±0,5 |',
  '| Sidebar `border-right` | `0px` | exato |',
  '',
].join('\n');

/** A declaração que amarra rótulo publicado a identificador de sonda. */
const DECL = {
  colunas: ['alvo'],
  linhas: [
    ['Sidebar `left`', ['chrome.sidebar.left']],
    ['Caixa do TOC', ['chrome.toc.caixa']],
    ['Coluna de texto', ['chrome.prosa.largura']],
    ['Sidebar `border-right`', ['chrome.sidebar.borda']],
  ],
};

const alvosDe = (texto = DOC, decl = DECL, doc = 'docs/design/chrome.md') =>
  lerAlvos(doc, texto, decl);

/** Acha o alvo de uma sonda pela lista devolvida. */
const alvo = (leitura, sonda) => leitura.alvos.find((a) => a.sonda === sonda);

// ---------------------------------------------------------------------------
// A tabela publicada
// ---------------------------------------------------------------------------

test('a tabela bem formada devolve um alvo por sonda declarada, sem falha', () => {
  const leitura = alvosDe();
  assert.deepEqual(leitura.falhas, []);
  assert.equal(leitura.alvos.length, 4);
  assert.deepEqual(
    leitura.alvos.map((a) => a.sonda),
    ['chrome.sidebar.left', 'chrome.toc.caixa', 'chrome.prosa.largura', 'chrome.sidebar.borda'],
  );
});

test('o alvo carrega documento, rótulo e a ordem de publicação', () => {
  const a = alvo(alvosDe(), 'chrome.toc.caixa');
  assert.equal(a.documento, 'docs/design/chrome.md');
  assert.equal(a.rotulo, 'Caixa do TOC');
  assert.equal(a.ordem, 1);
});

test('a vírgula decimal da spec é lida como número', () => {
  assert.deepEqual(analisarValor('`720,81px`'), {tipo: 'numero', numero: 720.81, unidade: 'px'});
});

test('o menos tipográfico da spec é lido como sinal', () => {
  assert.deepEqual(analisarValor('`−0,9px`'), {tipo: 'numero', numero: -0.9, unidade: 'px'});
});

test('cor publicada é texto, não número', () => {
  assert.deepEqual(analisarValor('`#fcfcfc`'), {tipo: 'texto', texto: '#fcfcfc'});
});

test('célula vazia é ausência, e não zero', () => {
  assert.equal(analisarValor(''), null);
  assert.equal(analisarValor('  '), null);
  assert.notEqual(analisarValor('`0px`'), null);
});

test('a linha renomeada reprova — renomear não tira da conferência', () => {
  const leitura = alvosDe(DOC.replace('| Caixa do TOC |', '| Caixa do sumário |'));
  assert.equal(leitura.alvos.length, 3);
  assert.equal(leitura.falhas.length, 1);
  assert.match(leitura.falhas[0], /Caixa do TOC/);
});

test('a tabela malformada reprova em vez de adivinhar', () => {
  const semTolerancia = DOC.replace('| Sidebar `left` | `52px` | ±1 |', '| Sidebar `left` | `52px` |');
  assert.match(alvosDe(semTolerancia).falhas.join(' '), /Sidebar `left`/);

  const toleranciaLixo = DOC.replace('| `304px` | ±1 |', '| `304px` | mais ou menos |');
  assert.match(alvosDe(toleranciaLixo).falhas.join(' '), /tolerância/i);
});

test('tolerância numérica sobre valor não numérico reprova a declaração', () => {
  const cor = DOC.replace('| Caixa do TOC | `304px` | ±1 |', '| Caixa do TOC | `#141414` | ±1 |');
  assert.match(alvosDe(cor).falhas.join(' '), /não numérico|numérica/i);
});

test('a seção recorta — rótulo repetido noutra tabela do documento não confunde', () => {
  const comHomonimo = [
    '# Chrome',
    '',
    '## 1. A cadeia de proporções',
    '',
    '| Sonda | Alvo | Tolerância |',
    '| --- | --- | --- |',
    '| Caixa do TOC | `288px` | ±1 |',
    '',
    '## 7. Alvo medido — geometria a 1512',
    '',
    '| Sonda | Alvo | Tolerância |',
    '| --- | --- | --- |',
    '| Caixa do TOC | `304px` | ±1 |',
    '',
  ].join('\n');

  const decl = {colunas: ['alvo'], linhas: [['Caixa do TOC', ['chrome.toc.caixa']]]};

  assert.equal(lerAlvos('d.md', comHomonimo, decl).alvos[0].publicado, '288px');
  assert.equal(
    lerAlvos('d.md', comHomonimo, {...decl, secao: '## 7. Alvo medido'}).alvos[0].publicado,
    '304px',
  );
});

test('a seção que sumiu reprova em vez de ler a tabela errada', () => {
  const decl = {colunas: ['alvo'], linhas: [['Caixa do TOC', ['x']]], secao: '## 99. Não existe'};
  const {alvos, falhas} = lerAlvos('d.md', DOC, decl);
  assert.deepEqual(alvos, []);
  assert.match(falhas[0], /seção/i);
});

// ---------------------------------------------------------------------------
// A tolerância
// ---------------------------------------------------------------------------

test('a tolerância entende `exato` e a margem com vírgula', () => {
  assert.deepEqual(analisarTolerancia('exato'), {tipo: 'exato'});
  assert.deepEqual(analisarTolerancia('±1'), {tipo: 'margem', margem: 1});
  assert.deepEqual(analisarTolerancia('±0,5'), {tipo: 'margem', margem: 0.5});
});

test('tolerância que não é nem `exato` nem margem lança', () => {
  assert.throws(() => analisarTolerancia('perto'), /tolerância/i);
});

// ---------------------------------------------------------------------------
// A comparação
// ---------------------------------------------------------------------------

test('logo abaixo do limite fecha, e no limite ainda fecha', () => {
  const {alvos} = alvosDe();
  assert.deepEqual(comparar(alvos, {'chrome.sidebar.left': '52.9px'}).map((d) => d.sonda), []);
  assert.deepEqual(comparar(alvos, {'chrome.sidebar.left': '53px'}).map((d) => d.sonda), []);
  assert.deepEqual(comparar(alvos, {'chrome.sidebar.left': '51px'}).map((d) => d.sonda), []);
});

test('logo acima do limite diverge', () => {
  const {alvos} = alvosDe();
  const d = comparar(alvos, {'chrome.sidebar.left': '53.1px'});
  assert.equal(d.length, 1);
  assert.equal(d[0].tipo, 'divergente');
  assert.equal(d[0].sonda, 'chrome.sidebar.left');
});

test('`exato` não perdoa um décimo', () => {
  const {alvos} = alvosDe();
  assert.equal(comparar(alvos, {'chrome.sidebar.borda': '0px'}).length, 0);
  assert.equal(comparar(alvos, {'chrome.sidebar.borda': '0.1px'})[0].tipo, 'divergente');
});

test('unidade diferente diverge, mesmo com o número igual', () => {
  const {alvos} = alvosDe();
  const d = comparar(alvos, {'chrome.toc.caixa': '304rem'});
  assert.equal(d.length, 1);
  assert.equal(d[0].tipo, 'divergente');
});

test('a divergência carrega alvo, medido e delta legíveis', () => {
  const {alvos} = alvosDe();
  const [d] = comparar(alvos, {'chrome.toc.caixa': '288px'});
  assert.equal(d.alvo, '304px');
  assert.equal(d.medido, '288px');
  assert.equal(d.delta, -16);
});

test('sonda que o navegador não achou é `sem-medida`, não divergência', () => {
  const {alvos} = alvosDe();
  const [d] = comparar(alvos, {'chrome.toc.caixa': null});
  assert.equal(d.tipo, 'sem-medida');
  assert.equal(d.medido, null);
});

test('medida sem alvo publicado é `sem-alvo`, e não se confunde com divergência', () => {
  const {alvos} = alvosDe();
  const d = comparar(alvos, {
    'chrome.sidebar.left': '52px',
    'chrome.toc.caixa': '304px',
    'chrome.prosa.largura': '720,81px',
    'chrome.sidebar.borda': '0px',
    'chrome.inventada': '10px',
  });
  assert.equal(d.length, 1);
  assert.equal(d[0].tipo, 'sem-alvo');
  assert.equal(d[0].sonda, 'chrome.inventada');
});

test('alvo publicado que o navegador não achou vira `sem-medida`, não silêncio', () => {
  const {alvos} = alvosDe();
  const medidas = Object.fromEntries(alvos.map((a) => [a.sonda, null]));
  const tipos = comparar(alvos, medidas).map((d) => d.tipo);
  assert.deepEqual(tipos, ['sem-medida', 'sem-medida', 'sem-medida', 'sem-medida']);
});

test('sonda fora do cenário é ignorada — cobrar o que não se pediu é ruído', () => {
  const {alvos} = alvosDe();
  assert.deepEqual(comparar(alvos, {}), []);
});

// ---------------------------------------------------------------------------
// A ordenação
// ---------------------------------------------------------------------------

test('a lista sai em ordem de documento e de publicação, não de medição', () => {
  const outro = lerAlvos(
    'docs/design/busca.md',
    ['| Sonda | Alvo | Tolerância |', '| --- | --- | --- |', '| Painel | `640px` | ±1 |', ''].join('\n'),
    {colunas: ['alvo'], linhas: [['Painel', ['busca.painel.largura']]]},
  );
  const alvos = [...alvosDe().alvos, ...outro.alvos];

  const medidas = {
    'chrome.prosa.largura': '700px',
    'busca.painel.largura': '720px',
    'chrome.sidebar.left': '0px',
  };
  const ordem = comparar(alvos, medidas).map((d) => d.sonda);

  assert.deepEqual(ordem, ['busca.painel.largura', 'chrome.sidebar.left', 'chrome.prosa.largura']);
});

test('a ordem não depende da ordem das chaves medidas', () => {
  const {alvos} = alvosDe();
  const a = comparar(alvos, {'chrome.toc.caixa': '1px', 'chrome.sidebar.left': '1px'});
  const b = comparar(alvos, {'chrome.sidebar.left': '1px', 'chrome.toc.caixa': '1px'});
  assert.deepEqual(a.map((d) => d.sonda), b.map((d) => d.sonda));
});

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------

test('o relatório nomeia o documento, o rótulo e os dois valores', () => {
  const {alvos} = alvosDe();
  const texto = formatar(comparar(alvos, {'chrome.toc.caixa': '288px'}));
  assert.match(texto, /docs\/design\/chrome\.md/);
  assert.match(texto, /Caixa do TOC/);
  assert.match(texto, /304px/);
  assert.match(texto, /288px/);
});

test('sem diferença, o relatório diz que fechou', () => {
  assert.match(formatar([]), /fecha|nenhuma diferença/i);
});
