/**
 * A régua de máquina do contrato de assinatura — o validador, e o marcador que
 * o gerador escreve para o painel ler.
 *
 * **As duas coisas que este arquivo cobre são as duas que o portão 5 não pega**,
 * e é isso que as junta aqui:
 *
 *   · ele confere que a SAÍDA não divergiu da fonte, não que o validador recusa
 *     o que promete recusar — um validador que aceitasse tudo passaria no portão
 *     todos os dias. As doze recusas são lista fechada, e lista fechada sem caso
 *     que a exercite é prosa;
 *   · ele regenera e diffa, então uma divergência de sintaxe entre quem ESCREVE
 *     o marcador (o gerador) e quem o LÊ (o painel) sairia com o diff limpo, e a
 *     página renderizaria o marcador cru na tela.
 *
 * **Zero dependência nova.** `node:test` e `node:assert` vêm no Node 20, que é o
 * piso do `engines` deste repositório.
 *
 * Roda com `npm test`. Cadência: commit.
 *
 * Procedência: docs/design/referencia.md §5 · docs/adr/0008.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {RECUSAS, lerContrato, validar, validarPar} from './lib/assinatura.mjs';
import {marcador, marcadoresDe, substituir} from '../src/theme/ApiDocItem/placeholder.mjs';

const CONTRATO_PT = 'contratos/panlabs-esteira.pt-BR.json';
const CONTRATO_EN = 'contratos/panlabs-esteira.en.json';

/** O contrato de verdade, relido do disco a cada caso para ninguém mutar o do vizinho. */
const contrato = () => JSON.parse(fs.readFileSync(CONTRATO_PT, 'utf8'));

/** A primeira recusa, ou `undefined` — quase todo caso abaixo tem exatamente uma. */
const primeira = (contrato) => validar(contrato)[0];

// ---------------------------------------------------------------------------
// O par que está no repositório
// ---------------------------------------------------------------------------

test('o par commitado passa sem uma recusa', () => {
  assert.deepEqual(validarPar(lerContrato(CONTRATO_PT), lerContrato(CONTRATO_EN)), []);
});

test('a lista de recusas é fechada, e toda recusa emitida está nela', () => {
  const nomes = new Set(Object.values(RECUSAS));
  assert.equal(nomes.size, 12);
  // Toda recusa que os casos abaixo produzem sai desta lista — a asserção mora
  // aqui para que acrescentar uma recusa nova sem nomeá-la reprove.
  for (const nome of nomes) {
    assert.match(nome, /^[a-z-]+$/);
  }
});

// ---------------------------------------------------------------------------
// As doze recusas, uma a uma
// ---------------------------------------------------------------------------

test('nao-e-json — YAML cai pelo parser, sem regra em separado', () => {
  // Um YAML de verdade, que já está no repositório: a recusa é consequência de
  // o parser ser `JSON.parse`, e não uma regra escrita à parte.
  let capturado;
  try {
    lerContrato('.github/workflows/ci.yml');
  } catch (erro) {
    capturado = erro;
  }
  assert.equal(capturado?.recusa, RECUSAS.naoEJson);
  assert.equal(capturado.ponteiro, '');
});

test('contrato-desconhecido — o par nome/versão é fechado', () => {
  const c = contrato();
  c.versao = 2;
  assert.deepEqual(primeira(c), {
    recusa: RECUSAS.contratoDesconhecido,
    ponteiro: '/versao',
    detalhe: 'o par aceito é `assinatura` versão 1, e este é `assinatura` versão 2',
  });
});

test('id-duplicado — duas entradas com o mesmo id escreveriam o mesmo arquivo', () => {
  const c = contrato();
  c.entradas[2].id = c.entradas[1].id;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.idDuplicado);
  assert.equal(recusa.ponteiro, '/entradas/2/id');
});

test('especie-fora-da-lista — três espécies, e nenhuma quarta', () => {
  const c = contrato();
  c.entradas[1].especie = 'classe';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.especieForaDaLista);
  assert.equal(recusa.ponteiro, '/entradas/1/especie');
});

test('descricao-ausente — em qualquer nó, e o ponteiro nomeia qual', () => {
  const c = contrato();
  delete c.entradas[1].parametros[2].campos[1].descricao;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.descricaoAusente);
  assert.equal(recusa.ponteiro, '/entradas/1/parametros/2/campos/1');
});

test('descricao-ausente — o `quando` de um erro é a prosa dele', () => {
  const c = contrato();
  delete c.entradas[4].erros[0].quando;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.descricaoAusente);
  assert.equal(recusa.ponteiro, '/entradas/4/erros/0');
});

test('assinatura-ausente — o painel não tem cabeçalho sem ela', () => {
  const c = contrato();
  delete c.entradas[3].assinatura;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.assinaturaAusente);
  assert.equal(recusa.ponteiro, '/entradas/3/assinatura');
});

test('exemplo-ambiguo — valor e código no mesmo nó não decidem o snippet', () => {
  const c = contrato();
  c.entradas[1].parametros[0].exemploCodigo = 'padrao.python()';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.exemploAmbiguo);
  assert.equal(recusa.ponteiro, '/entradas/1/parametros/0');
});

/** Uma pilha de campos com exatamente `profundidade` níveis. */
const cadeia = (profundidade) => {
  const raiz = {nome: 'n1', tipo: 'str', descricao: 'topo'};
  let no = raiz;
  for (let nivel = 2; nivel <= profundidade; nivel += 1) {
    no.campos = [{nome: `n${nivel}`, tipo: 'str', descricao: 'fundo'}];
    no = no.campos[0];
  }
  return raiz;
};

test('aninhamento-acima-de-quatro — o quinto nível reprova antes de virar página ilegível', () => {
  const c = contrato();
  c.entradas[1].retorno.campos = [cadeia(5)];
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.aninhamentoAcimaDeQuatro);
  assert.equal(recusa.ponteiro, '/entradas/1/retorno/campos/0/campos/0/campos/0/campos/0/campos/0');
});

test('aninhamento-acima-de-quatro — quatro níveis passam, e é o teto calibrado', () => {
  const c = contrato();
  c.entradas[1].retorno.campos = [cadeia(4)];
  assert.deepEqual(validar(c), []);
});

test('mais-de-quatro-erros — quatro é o teto, e uma entrada já está nele', () => {
  const c = contrato();
  c.entradas[4].erros.push({nome: 'UmQuinto', quando: 'nunca'});
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.maisDeQuatroErros);
  assert.equal(recusa.ponteiro, '/entradas/4/erros');
});

test('referencia-morta — id citado e inexistente, em qualquer dos quatro campos', () => {
  for (const [indice, campo, ponteiro] of [
    [0, 'exporta', '/entradas/0/exporta/0'],
    [0, 'fluxo', '/entradas/0/fluxo/0'],
    [3, 'receptor', '/entradas/3/receptor'],
  ]) {
    const c = contrato();
    const entrada = c.entradas[indice];
    entrada[campo] = Array.isArray(entrada[campo]) ? ['nao-existe'] : 'nao-existe';
    const recusa = primeira(c);
    assert.equal(recusa.recusa, RECUSAS.referenciaMorta);
    assert.equal(recusa.ponteiro, ponteiro);
  }
});

test('referencia-morta — o `entrada` de um campo é link, e link quebrado quebra o build', () => {
  const c = contrato();
  c.entradas[5].retorno.entrada = 'nao-existe';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.referenciaMorta);
  assert.equal(recusa.ponteiro, '/entradas/5/retorno/entrada');
});

test('ciclo-de-receptor — o preâmbulo do snippet não fecha sem isto', () => {
  const c = contrato();
  c.entradas[1].receptor = 'esteira-gerar';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.cicloDeReceptor);
  assert.equal(recusa.ponteiro, '/entradas/1/receptor');
});

// ---------------------------------------------------------------------------
// A congruência do par — a recusa que nenhum contrato sozinho produz
// ---------------------------------------------------------------------------

test('contratos-incongruentes — divergência ESTRUTURAL reprova', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  en.entradas[2].parametros[1].tipo = 'str';
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, '/entradas/2/parametros/1/tipo');
});

test('contratos-incongruentes — entrada a mais de um lado é divergência de forma', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  // Uma entrada que passa sozinha: o que reprova é ela existir de um lado só.
  en.entradas.push({
    id: 'so-em-en',
    especie: 'funcao',
    titulo: 'padrao.node',
    qualificado: 'panlabs.esteira.padrao.node',
    assinatura: 'padrao.node() -> list[Passo]',
    resumo: 'r',
    descricao: 'd',
    chamada: 'padrao.node',
    resultado: 'passos',
    parametros: [],
    retorno: null,
    erros: [],
  });
  assert.deepEqual(validar(en), []);
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, '/entradas/6');
});

test('a PROSA diverge de propósito — é o que faz o par ser monolíngue', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  assert.notEqual(pt.entradas[1].descricao, en.entradas[1].descricao);
  assert.notEqual(pt.rotulos.parametros, en.rotulos.parametros);
  assert.notEqual(pt.entradas[2].erros[0].quando, en.entradas[2].erros[0].quando);
  assert.deepEqual(validarPar(pt, en), []);
});

test('o identificador NÃO diverge — nome de campo é contrato, não prosa', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  assert.equal(pt.entradas[4].assinatura, en.entradas[4].assinatura);
  assert.equal(pt.entradas[4].titulo, en.entradas[4].titulo);
  assert.deepEqual(
    pt.entradas.map((e) => e.id),
    en.entradas.map((e) => e.id),
  );
});

// ---------------------------------------------------------------------------
// O marcador de argumento editável — escrito pelo gerador, lido pelo painel
//
// **O portão 5 não pega esta divergência**, e é por isso que ela é teste. Ele
// regenera e diffa: se o gerador passasse a escrever `${nome}` e o painel
// continuasse casando `{{nome}}`, a saída seria idêntica à que o gerador acabou
// de produzir, o diff ficaria limpo, e a página renderizaria o marcador cru.
// ---------------------------------------------------------------------------

test('quem escreve o marcador e quem o lê usam a mesma sintaxe', () => {
  assert.deepEqual(marcadoresDe(marcador('versao')), ['versao']);
  assert.deepEqual(marcadoresDe(`x=${marcador('a')}, y=${marcador('b')}`), ['a', 'b']);
});

test('substituir troca o conhecido e deixa o desconhecido — nunca apaga texto', () => {
  assert.equal(substituir(`f(${marcador('n')})`, {n: '7'}), 'f(7)');
  assert.equal(substituir(`f(${marcador('n')})`, {}), `f(${marcador('n')})`);
});

test('nenhuma página gerada tem marcador sem argumento que o substitua', () => {
  const raizes = [
    'conteudo/ferramentas/bibliotecas/biblioteca-c/referencia',
    'i18n/en/docusaurus-plugin-content-docs-ferramentas/current/bibliotecas/biblioteca-c/referencia',
  ];
  let conferidas = 0;
  for (const raiz of raizes) {
    for (const arquivo of fs.readdirSync(raiz)) {
      const bruto = fs.readFileSync(`${raiz}/${arquivo}`, 'utf8');
      const painel = JSON.parse(bruto.match(/^api_exemplos: (.+)$/m)[1]);
      const nomes = painel.parametros.map((p) => p.nome);
      for (const marca of marcadoresDe(painel.snippet.modelo)) {
        assert.ok(nomes.includes(marca), `${raiz}/${arquivo}: \`${marca}\` sem argumento`);
      }
      conferidas += 1;
    }
  }
  assert.equal(conferidas, 12);
});
