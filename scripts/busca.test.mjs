/**
 * A régua de máquina da busca — `node --test`, do próprio runtime.
 *
 * Os seis portões cobrem CSS e conteúdo por varredura. Ordenação de resultado
 * não é varrível: ou existe um caso que a exercita, ou *"escada determinística"*
 * fica sendo afirmação de prosa. Este arquivo é o que a torna conferível.
 *
 * **Zero dependência nova.** `node:test` e `node:assert` vêm no Node 20, que é o
 * piso do `engines` deste repositório.
 *
 * Roda com `npm test`. Cadência: commit.
 *
 * Procedência: docs/design/busca.md.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';

import {
  ESCADA,
  faixasDeRealce,
  normalizar,
  normalizarIndice,
  pontuar,
  termosDe,
  trecho,
} from '../src/theme/SearchBar/escada.mjs';

/** Um registro do índice, com os campos vazios preenchidos. */
const reg = (parcial) => ({d: '', s: [], b: '', x: 0, ...parcial});

const indice = (registros) => normalizarIndice(registros);

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------

test('normaliza caixa e diacrítico', () => {
  assert.equal(normalizar('Conciliação'), 'conciliacao');
  assert.equal(normalizar('IDEMPOTÊNCIA'), 'idempotencia');
  assert.equal(normalizar('Referência da API'), 'referencia da api');
});

test('a normalização roda nos DOIS lados — consulta sem acento acha o acentuado', () => {
  const i = indice([reg({u: '/a', t: 'Conciliação'})]);
  assert.equal(pontuar(i, 'conciliacao').length, 1);
  assert.equal(pontuar(i, 'CONCILIAÇÃO').length, 1);
});

test('termosDe parte em espaço e descarta o vazio', () => {
  assert.deepEqual(termosDe('  pix   dinamico '), ['pix', 'dinamico']);
  assert.deepEqual(termosDe('   '), []);
});

// ---------------------------------------------------------------------------
// A escada
// ---------------------------------------------------------------------------

test('a escada é de potências de dois — um degrau vale mais que a soma dos de baixo', () => {
  const pesos = ESCADA.map((d) => d.peso);
  assert.deepEqual(pesos, [64, 32, 16, 8, 4, 2, 1]);
  for (let i = 0; i < pesos.length; i += 1) {
    const abaixo = pesos.slice(i + 1).reduce((s, p) => s + p, 0);
    assert.ok(pesos[i] > abaixo, `${pesos[i]} deveria vencer ${abaixo}`);
  }
});

test('no título, começo de PALAVRA vence meio de palavra', () => {
  const r = pontuar(
    indice([
      // `webhook` está aqui, mas no meio de uma palavra — degrau 32.
      reg({u: '/meio', t: 'Antiwebhooks'}),
      // Aqui ele começa a segunda palavra — degrau 64, como em `Webhooks`.
      reg({u: '/palavra', t: 'Sobre webhooks'}),
    ]),
    'webhook',
  );
  assert.deepEqual(r.map((x) => x.u), ['/palavra', '/meio']);
  assert.deepEqual(r.map((x) => x.pontos), [64, 32]);
});

test('título vence heading, que vence descrição, que vence corpo, que vence URL', () => {
  const r = pontuar(
    indice([
      reg({u: '/url-pix', t: 'Zeta', d: 'nada', b: 'nada'}),
      reg({u: '/e', t: 'Zeta', b: 'fala de pix aqui'}),
      reg({u: '/d', t: 'Zeta', d: 'sobre pix'}),
      reg({u: '/c', t: 'Zeta', s: ['Erros de pix']}),
      reg({u: '/b', t: 'Sobre pix'}),
    ]),
    'pix',
  );
  assert.deepEqual(r.map((x) => x.u), ['/b', '/c', '/d', '/e', '/url-pix']);
});

test('um termo que não casa derruba o registro inteiro', () => {
  const i = indice([reg({u: '/a', t: 'Pix', d: 'pagamento instantâneo'})]);
  assert.equal(pontuar(i, 'pix').length, 1);
  assert.equal(pontuar(i, 'pix boleto').length, 0);
});

test('consulta de dois termos soma os degraus dos dois', () => {
  const i = indice([reg({u: '/a', t: 'Pix boleto'})]);
  assert.equal(pontuar(i, 'pix boleto')[0].pontos, 64 + 64);
});

test('consulta vazia não devolve nada — nem tudo', () => {
  const i = indice([reg({u: '/a', t: 'Pix'}), reg({u: '/b', t: 'Boleto'})]);
  assert.deepEqual(pontuar(i, ''), []);
  assert.deepEqual(pontuar(i, '   '), []);
});

test('sem teto: cem registros que casam devolvem cem', () => {
  const muitos = Array.from({length: 100}, (_, n) => reg({u: `/p${n}`, t: `Pix ${n}`}));
  assert.equal(pontuar(indice(muitos), 'pix').length, 100);
});

// ---------------------------------------------------------------------------
// O desempate
// ---------------------------------------------------------------------------

test('empate de pontos é desfeito pela ordem da aba', () => {
  const r = pontuar(
    indice([
      reg({u: '/receita', t: 'Webhooks', x: 2}),
      reg({u: '/api', t: 'Webhooks', x: 1}),
      reg({u: '/doc', t: 'Webhooks', x: 0}),
    ]),
    'webhooks',
  );
  assert.deepEqual(r.map((x) => x.u), ['/doc', '/api', '/receita']);
});

test('empate de aba é desfeito pela ordem da sidebar — a ordem do índice', () => {
  const r = pontuar(
    indice([
      reg({u: '/primeiro', t: 'Webhooks'}),
      reg({u: '/segundo', t: 'Webhooks'}),
    ]),
    'webhooks',
  );
  assert.deepEqual(r.map((x) => x.u), ['/primeiro', '/segundo']);
});

// ---------------------------------------------------------------------------
// O trecho
// ---------------------------------------------------------------------------

test('o trecho é a descrição quando ela casa, e o corpo quando é ele quem casa', () => {
  const r = reg({u: '/a', t: 'Zeta', d: 'sobre pix', b: 'fala de boleto'});
  assert.equal(trecho(r, ['pix']), 'sobre pix');
  assert.equal(trecho(r, ['boleto']), 'fala de boleto');
});

// ---------------------------------------------------------------------------
// O realce
// ---------------------------------------------------------------------------

test('a faixa de realce recorta o texto ORIGINAL, com acento inteiro', () => {
  const texto = 'Conciliação de saldo';
  const [faixa] = faixasDeRealce(texto, ['conciliacao']);
  assert.equal(texto.slice(faixa[0], faixa[1]), 'Conciliação');
});

test('faixas não se sobrepõem e saem em ordem', () => {
  const texto = 'pix e pix de novo';
  const faixas = faixasDeRealce(texto, ['pix']);
  assert.deepEqual(faixas, [[0, 3], [6, 9]]);
});

test('termo ausente não produz faixa', () => {
  assert.deepEqual(faixasDeRealce('Boleto', ['pix']), []);
  assert.deepEqual(faixasDeRealce('', ['pix']), []);
  assert.deepEqual(faixasDeRealce('Boleto', []), []);
});

test('o realce sobrevive a caractere fora do plano básico', () => {
  const texto = 'Ação 🚀 concluída';
  const [faixa] = faixasDeRealce(texto, ['concluida']);
  assert.equal(texto.slice(faixa[0], faixa[1]), 'concluída');
});
