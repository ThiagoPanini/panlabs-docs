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

import {ESPECIES, RECUSAS, lerContrato, validar, validarPar} from './lib/assinatura.mjs';
import {FORMA, contextoDe, corpoMdx, frontMatter} from './gerar-referencia.mjs';
import {marcador, marcadoresDe, substituir} from '../src/theme/MDXComponents/placeholder.mjs';

const CONTRATO_PT = 'contratos/overpower.pt-BR.json';
const CONTRATO_EN = 'contratos/overpower.en.json';

/**
 * Os índices do par commitado, por nome. Quatro entradas: a raiz e os três
 * comandos.
 *
 * **Eles existem para que um caso diga o que exercita.** O par anterior tinha
 * seis entradas e os casos as endereçavam por número cru, então trocar o
 * contrato quebrava cada linha em silêncio, uma a uma, sem que o número dissesse
 * qual propriedade tinha ido embora. `RAIZ` tem membros, opções globais e a
 * tabela de saída; `SEM_OPCAO` é o comando sem `parametros`, que é a forma que o
 * `sempre: false` da `FORMA` exercita.
 */
const RAIZ = 0;
const LIST = 1;
const INSTALL = 2;
const SEM_OPCAO = 3;

/** O contrato de verdade, relido do disco a cada caso para ninguém mutar o do vizinho. */
const contrato = () => JSON.parse(fs.readFileSync(CONTRATO_PT, 'utf8'));

/** A primeira recusa, ou `undefined` — quase todo caso abaixo tem exatamente uma. */
const primeira = (contrato) => validar(contrato)[0];

/** O `api_exemplos` de uma página, lido do front matter. */
const painelDoTexto = (bruto) => JSON.parse(bruto.match(/^api_exemplos: (.+)$/m)[1]);

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

test('especie-fora-da-lista — a lista é fechada, e `classe` não está nela', () => {
  const c = contrato();
  c.entradas[1].especie = 'classe';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.especieForaDaLista);
  assert.equal(recusa.ponteiro, '/entradas/1/especie');
});

// A fatia CONTRACT do ADR 9: as três espécies de biblioteca saíram com o
// contrato mockado que as pedia, e a lista volta a duas — o tamanho que ela tinha
// antes do expand. O que o §a) preserva não é o tamanho, é a propriedade de ser
// fechada e validada.
test('a lista fechada tem as duas espécies de CLI, e nenhuma terceira', () => {
  assert.deepEqual(ESPECIES, ['aplicacao', 'comando']);
});

test('as DUAS listas fechadas casam — validador e gerador não divergem', () => {
  // Uma espécie aceita pelo validador e sem forma no gerador não daria recusa
  // nomeada: daria `TypeError` no meio da emissão, que é o oposto de recusar
  // alto. São dois arquivos, e nada além deste caso os amarra.
  assert.deepEqual(Object.keys(FORMA).sort(), [...ESPECIES].sort());
});

for (const especie of ESPECIES) {
  test(`\`${especie}\` é espécie aceita, e o validador não a trata como caso especial`, () => {
    const c = contrato();
    c.entradas[SEM_OPCAO].especie = especie;
    assert.deepEqual(validar(c), []);
  });
}

test('o detalhe da recusa não crava a contagem — ele lista a lista', () => {
  const c = contrato();
  c.entradas[1].especie = 'classe';
  const {detalhe} = primeira(c);
  // A redação original dizia "não é uma das três". Ela virou mentira quando a
  // lista foi a cinco, e voltaria a ser verdade agora que ela é duas — o caso
  // fica assim mesmo, porque o que ele trava é a recusa NÃO depender do tamanho.
  assert.doesNotMatch(detalhe, /uma das (três|duas|quatro|cinco)/);
  for (const nomeada of ESPECIES) {
    assert.match(detalhe, new RegExp(nomeada));
  }
});

test('descricao-ausente — em qualquer nó, e o ponteiro nomeia qual', () => {
  const c = contrato();
  delete c.entradas[RAIZ].retorno.campos[1].descricao;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.descricaoAusente);
  assert.equal(recusa.ponteiro, `/entradas/${RAIZ}/retorno/campos/1`);
});

test('descricao-ausente — o `quando` de um erro é a prosa dele', () => {
  // **O par commitado fecha `erros` em zero nas quatro entradas**, e é decisão:
  // as recusas do `overpower` são mensagens, não identificadores, e uma coluna
  // `Erro` com a frase inteira dentro de crase não é tabela que se leia. A perna
  // do validador continua, e é este caso que a exercita.
  const c = contrato();
  c.entradas[LIST].erros = [{nome: 'RecusaQualquer'}];
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.descricaoAusente);
  assert.equal(recusa.ponteiro, `/entradas/${LIST}/erros/0`);
});

test('assinatura-ausente — o painel não tem cabeçalho sem ela', () => {
  const c = contrato();
  delete c.entradas[SEM_OPCAO].assinatura;
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.assinaturaAusente);
  assert.equal(recusa.ponteiro, `/entradas/${SEM_OPCAO}/assinatura`);
});

test('exemplo-ambiguo — valor e código no mesmo nó não decidem o snippet', () => {
  const c = contrato();
  c.entradas[LIST].parametros[0].exemploCodigo = 'overpower list';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.exemploAmbiguo);
  assert.equal(recusa.ponteiro, `/entradas/${LIST}/parametros/0`);
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
  c.entradas[RAIZ].retorno.campos = [cadeia(5)];
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.aninhamentoAcimaDeQuatro);
  assert.equal(recusa.ponteiro, `/entradas/${RAIZ}/retorno/campos/0/campos/0/campos/0/campos/0/campos/0`);
});

test('aninhamento-acima-de-quatro — quatro níveis passam, e é o teto calibrado', () => {
  const c = contrato();
  c.entradas[RAIZ].retorno.campos = [cadeia(4)];
  assert.deepEqual(validar(c), []);
});

test('mais-de-quatro-erros — quatro é o teto, e o quinto reprova', () => {
  const c = contrato();
  c.entradas[LIST].erros = [1, 2, 3, 4, 5].map((n) => ({nome: `R${n}`, quando: 'nunca'}));
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.maisDeQuatroErros);
  assert.equal(recusa.ponteiro, `/entradas/${LIST}/erros`);
});

test('referencia-morta — id citado e inexistente, em qualquer dos quatro campos', () => {
  for (const [indice, campo, ponteiro] of [
    [RAIZ, 'exporta', `/entradas/${RAIZ}/exporta/0`],
    [RAIZ, 'fluxo', `/entradas/${RAIZ}/fluxo/0`],
    [SEM_OPCAO, 'receptor', `/entradas/${SEM_OPCAO}/receptor`],
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
  c.entradas[SEM_OPCAO].retorno.entrada = 'nao-existe';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.referenciaMorta);
  assert.equal(recusa.ponteiro, `/entradas/${SEM_OPCAO}/retorno/entrada`);
});

test('ciclo-de-receptor — o preâmbulo do snippet não fecha sem isto', () => {
  // O contrato de CLI não usa `receptor`, e o campo continua sendo do contrato de
  // assinatura: `emitirCadeia` o percorre e o validador o confere. Um par que
  // deixasse de exercitá-lo tiraria duas das doze recusas do alcance do teste.
  const c = contrato();
  c.entradas[LIST].receptor = 'install';
  c.entradas[INSTALL].receptor = 'list';
  const recusa = primeira(c);
  assert.equal(recusa.recusa, RECUSAS.cicloDeReceptor);
  assert.equal(recusa.ponteiro, `/entradas/${LIST}/receptor`);
});

// ---------------------------------------------------------------------------
// A congruência do par — a recusa que nenhum contrato sozinho produz
// ---------------------------------------------------------------------------

test('contratos-incongruentes — divergência ESTRUTURAL reprova', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  en.entradas[INSTALL].parametros[1].tipo = 'str';
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, `/entradas/${INSTALL}/parametros/1/tipo`);
});

test('contratos-incongruentes — entrada a mais de um lado é divergência de forma', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  // Uma entrada que passa sozinha: o que reprova é ela existir de um lado só.
  en.entradas.push({
    id: 'so-em-en',
    especie: 'comando',
    titulo: 'overpower nuke',
    qualificado: 'overpower nuke',
    assinatura: 'overpower nuke',
    resumo: 'r',
    descricao: 'd',
    chamada: 'overpower nuke',
    parametros: [],
    retorno: null,
    erros: [],
  });
  assert.deepEqual(validar(en), []);
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, '/entradas/4');
});

test('a espécie é ESTRUTURA, não prosa — trocá-la de um lado só reprova', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  // `aplicacao` é espécie válida, então o contrato do EN passa sozinho. O que
  // reprova é o par: uma página que fosse `comando` em pt-BR e `aplicacao` em EN
  // teria seções diferentes nos dois locales.
  en.entradas[SEM_OPCAO].especie = 'aplicacao';
  assert.deepEqual(validar(en), []);
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, `/entradas/${SEM_OPCAO}/especie`);
});

test('a PROSA diverge de propósito — é o que faz o par ser monolíngue', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  assert.notEqual(pt.entradas[LIST].descricao, en.entradas[LIST].descricao);
  assert.notEqual(pt.rotulos.opcoes, en.rotulos.opcoes);
  assert.notEqual(
    pt.entradas[RAIZ].retorno.campos[0].descricao,
    en.entradas[RAIZ].retorno.campos[0].descricao,
  );
  assert.deepEqual(validarPar(pt, en), []);
});

test('o identificador NÃO diverge — nome de campo é contrato, não prosa', () => {
  const pt = lerContrato(CONTRATO_PT);
  const en = lerContrato(CONTRATO_EN);
  // A assinatura de um comando é a linha que o leitor digita, e o metavariável
  // dela é token da CLI: `&lt;name&gt;` não vira `&lt;nome&gt;` em pt-BR, pela
  // mesma regra que mantém `--from` e `install` sem tradução.
  assert.equal(pt.entradas[INSTALL].assinatura, en.entradas[INSTALL].assinatura);
  assert.equal(pt.entradas[INSTALL].titulo, en.entradas[INSTALL].titulo);
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

test('o marcador aceita nome de opção de CLI — o traço não é fim de nome', () => {
  // O argumento de um `comando` se chama `--from`, e o nome do argumento É a
  // chave do marcador: o painel casa por `painel.parametros[].nome`. Com a
  // sintaxe presa a `\\w+`, `{{--from}}` não casaria em NENHUM dos dois lados —
  // `marcadoresDe` não o veria, a conferência de órfão passaria calada, e a
  // página sairia com o marcador cru na tela.
  assert.deepEqual(marcadoresDe(marcador('--from')), ['--from']);
  assert.equal(substituir(`op ${marcador('--from')}`, {'--from': 'acervo/'}), 'op acervo/');
  // E a classe não vai além do que os dois lados precisam combinar.
  assert.deepEqual(marcadoresDe('{{a.b}}'), []);
  assert.deepEqual(marcadoresDe('{{a b}}'), []);
});

test('substituir troca o conhecido e deixa o desconhecido — nunca apaga texto', () => {
  assert.equal(substituir(`f(${marcador('n')})`, {n: '7'}), 'f(7)');
  assert.equal(substituir(`f(${marcador('n')})`, {}), `f(${marcador('n')})`);
});

test('nenhuma página gerada tem marcador sem argumento que o substitua', () => {
  const raizes = [
    'conteudo/ferramentas/bibliotecas/overpower/comandos',
    'i18n/en/docusaurus-plugin-content-docs-ferramentas/current/bibliotecas/overpower/comandos',
  ];
  let conferidas = 0;
  for (const raiz of raizes) {
    // A pasta hospeda também a folha AUTORAL que abre a categoria, e ela não tem
    // `api_exemplos` — é exatamente essa ausência que faz dela a fixture de painel
    // direito vazio. O filtro é a extensão, que é o mesmo sinal que o portão 4 usa
    // para contar as duas posses em separado.
    for (const arquivo of fs.readdirSync(raiz).filter((n) => n.endsWith('.mdx'))) {
      const painel = painelDoTexto(fs.readFileSync(`${raiz}/${arquivo}`, 'utf8'));
      const nomes = painel.parametros.map((p) => p.nome);
      for (const marca of marcadoresDe(painel.snippet.modelo)) {
        assert.ok(nomes.includes(marca), `${raiz}/${arquivo}: \`${marca}\` sem argumento`);
      }
      conferidas += 1;
    }
  }
  assert.equal(conferidas, 8);
});

// ---------------------------------------------------------------------------
// As duas espécies de CLI, e a página que o gerador emite delas
//
// **O par sintético fica, e agora o de disco existe ao lado dele.** Ele nasceu na
// fatia EXPAND, quando nenhum contrato de CLI estava commitado; o port trouxe o
// do `overpower`, e mesmo assim os dois não se substituem. O sintético exercita o
// que o contrato real de propósito NÃO tem: flag booleana ligada e desligada,
// rótulo de seção removido, raiz sem tabela de saída. Trocá-lo pelo real
// significaria ou perder esses caminhos, ou encher o contrato publicado de dado
// que só existe para o teste.
// ---------------------------------------------------------------------------

const ROTULOS_CLI_PT = {
  aplicacao: 'Aplicação',
  comando: 'Comando',
  comandos: 'Comandos',
  opcoesGlobais: 'Opções globais',
  opcoes: 'Opções',
  codigosDeSaida: 'Códigos de saída',
  semRetorno: 'Os códigos de saída são os da aplicação.',
  erros: 'Erros',
  colunaErro: 'Erro',
  colunaQuando: 'Quando',
  colunaNome: 'Nome',
  colunaEspecie: 'Espécie',
  colunaResumo: 'O que faz',
  veja: 'Os campos estão na página do tipo:',
};

const ROTULOS_CLI_EN = {
  aplicacao: 'Application',
  comando: 'Command',
  comandos: 'Commands',
  opcoesGlobais: 'Global options',
  opcoes: 'Options',
  codigosDeSaida: 'Exit codes',
  semRetorno: "The exit codes are the application's.",
  erros: 'Errors',
  colunaErro: 'Error',
  colunaQuando: 'When',
  colunaNome: 'Name',
  colunaEspecie: 'Kind',
  colunaResumo: 'What it does',
  veja: 'The fields are on the type page:',
};

/**
 * Um contrato de CLI monolíngue — uma raiz e um comando.
 *
 * A PROSA entra por parâmetro e o resto é idêntico nos dois locales: é
 * exatamente a forma que `validarPar` cobra, e montar os dois do mesmo molde
 * prova que a congruência não é acidente do que eu digitei.
 */
const contratoDeCli = (rotulos, prosa) => ({
  contrato: 'assinatura',
  versao: 1,
  biblioteca: {modulo: 'overpower'},
  // CÓPIA, e não a referência: um caso que apaga um rótulo para provar a parada
  // do gerador apagaria do banco compartilhado, e os casos seguintes herdariam
  // o buraco. É a promessa que o comentário de `parDeCli` faz.
  rotulos: {...rotulos},
  entradas: [
    {
      id: 'overpower',
      especie: 'aplicacao',
      titulo: 'overpower',
      qualificado: 'overpower',
      assinatura: 'overpower [--json] <comando>',
      resumo: prosa.resumoRaiz,
      descricao: prosa.descricaoRaiz,
      exporta: ['overpower-install'],
      fluxo: ['overpower-install'],
      parametros: [{nome: '--json', tipo: 'flag', descricao: prosa.json, exemplo: true}],
      retorno: {
        tipo: 'int',
        descricao: prosa.saida,
        campos: [
          {nome: '0', tipo: 'int', descricao: prosa.zero},
          {nome: '2', tipo: 'int', descricao: prosa.dois},
        ],
      },
      erros: [],
    },
    {
      id: 'overpower-install',
      especie: 'comando',
      titulo: 'overpower install',
      qualificado: 'overpower install',
      assinatura: 'overpower install [--from <path>]',
      resumo: prosa.resumoComando,
      descricao: prosa.descricaoComando,
      chamada: 'overpower install',
      parametros: [{nome: '--from', tipo: 'path', descricao: prosa.from, exemplo: 'acervo/'}],
      retorno: null,
      erros: [],
    },
  ],
});

/** O par, refeito a cada caso para ninguém mutar o do vizinho. */
const parDeCli = () => ({
  pt: contratoDeCli(ROTULOS_CLI_PT, {
    resumoRaiz: 'A ferramenta inteira, e as opções que valem para todo comando.',
    descricaoRaiz: 'Instale e inspecione o acervo pela linha de comando.',
    json: 'Emite a saída como JSON em vez de tabela.',
    saida: 'O que o processo devolve ao shell.',
    zero: 'Tudo correu.',
    dois: 'A linha de comando estava errada.',
    resumoComando: 'Instala um pacote do acervo.',
    descricaoComando: 'Baixa e instala, resolvendo as dependências antes.',
    from: 'De onde ler o acervo.',
  }),
  en: contratoDeCli(ROTULOS_CLI_EN, {
    resumoRaiz: 'The whole tool, and the options that hold for every command.',
    descricaoRaiz: 'Install and inspect the collection from the command line.',
    json: 'Emit output as JSON instead of a table.',
    saida: 'What the process hands back to the shell.',
    zero: 'Everything worked.',
    dois: 'The command line was wrong.',
    resumoComando: 'Installs a package from the collection.',
    descricaoComando: 'Downloads and installs, resolving dependencies first.',
    from: 'Where to read the collection from.',
  }),
});

const CAMINHO_CLI = 'contratos/overpower.pt-BR.json';

/** O `api_exemplos` de uma entrada, já parseado. */
const painelDe = (contrato, indice, caminho = CAMINHO_CLI) =>
  painelDoTexto(frontMatter(contrato.entradas[indice], contextoDe(contrato, caminho)));

test('o par de CLI é congruente, e cada contrato passa sozinho', () => {
  const {pt, en} = parDeCli();
  assert.deepEqual(validar(pt), []);
  assert.deepEqual(validar(en), []);
  assert.deepEqual(validarPar(pt, en), []);
});

test('`aplicacao` é a raiz — comandos, opções globais e códigos de saída, nesta ordem', () => {
  const {pt} = parDeCli();
  const corpo = corpoMdx(pt.entradas[0], contextoDe(pt, CAMINHO_CLI));

  assert.match(corpo, /^# overpower\n/);
  assert.match(corpo, /\*\*Aplicação\*\* · `overpower`/);
  assert.ok(
    corpo.indexOf('## Comandos') < corpo.indexOf('## Opções globais') &&
      corpo.indexOf('## Opções globais') < corpo.indexOf('## Códigos de saída'),
    'a raiz aponta para os membros antes de descrever a si mesma',
  );
  // A perna de hierarquia que o ADR 9 §a) manda `aplicacao` guardar.
  assert.match(corpo, /\| \[`overpower install`\]\(\.\/overpower-install\.mdx\) \| Comando \|/);
  assert.match(corpo, /<ParamField name="--json" type="flag">/);
  assert.match(corpo, /<ResponseField name="0" type="int">/);
  assert.match(corpo, /<ResponseField name="2" type="int">/);
});

test('`comando` é opção, e não inventa a tabela de saída que mora na raiz', () => {
  const {pt} = parDeCli();
  const corpo = corpoMdx(pt.entradas[1], contextoDe(pt, CAMINHO_CLI));

  assert.match(corpo, /\*\*Comando\*\* · `overpower install`/);
  assert.match(corpo, /## Opções\n/);
  assert.match(corpo, /<ParamField name="--from" type="path">/);
  // Os quatro códigos valem para todos os comandos, e prometê-los de novo em
  // cada página seria a segunda fonte que o gerador inteiro existe para não ter.
  assert.doesNotMatch(corpo, /## Códigos de saída/);
});

test('as duas espécies saem nos dois locales, e o rótulo é o do locale', () => {
  const {pt, en} = parDeCli();
  for (const indice of [0, 1]) {
    assert.notEqual(
      corpoMdx(pt.entradas[indice], contextoDe(pt, CAMINHO_CLI)),
      corpoMdx(en.entradas[indice], contextoDe(en, CAMINHO_CLI)),
    );
  }
  const raizEn = corpoMdx(en.entradas[0], contextoDe(en, CAMINHO_CLI));
  assert.match(raizEn, /## Commands/);
  assert.match(raizEn, /## Global options/);
  assert.match(raizEn, /## Exit codes/);
  assert.match(raizEn, /\| Name \| Kind \| What it does \|/);
  // O campo é o mesmo componente nos dois locales: o que muda é o título.
  assert.match(raizEn, /<ParamField name="--json" type="flag">/);
  assert.match(raizEn, /<ResponseField name="0" type="int">/);

  const comandoEn = corpoMdx(en.entradas[1], contextoDe(en, CAMINHO_CLI));
  assert.match(comandoEn, /## Options\n/);
  assert.match(comandoEn, /<ParamField name="--from" type="path">/);
  assert.doesNotMatch(comandoEn, /## Exit codes/);

  // E o snippet do EN é o mesmo código: só a prosa é traduzida.
  assert.equal(painelDe(pt, 1).snippet.modelo, painelDe(en, 1).snippet.modelo);
});

test('rótulo de seção some do contrato → o gerador PARA, e nomeia a chave', () => {
  // Sem a parada, a seção sairia `## undefined` e o portão 5 a diffaria contra
  // ela mesma, com o diff limpo. É o mesmo buraco do marcador órfão.
  //
  // O caso enumera as chaves que as DUAS espécies novas exigem em vez de cravar
  // uma: cravar `opcoes` deixaria as outras três sem nenhuma linha que as
  // cobrasse, e é exatamente delas que o contrato do port vai precisar.
  const exigidas = {
    0: ['aplicacao', 'comandos', 'opcoesGlobais', 'codigosDeSaida', 'colunaNome'],
    1: ['comando', 'opcoes'],
  };
  for (const [indice, chaves] of Object.entries(exigidas)) {
    for (const chave of chaves) {
      const {pt} = parDeCli();
      delete pt.rotulos[chave];
      assert.throws(
        () => corpoMdx(pt.entradas[Number(indice)], contextoDe(pt, CAMINHO_CLI)),
        new RegExp(chave),
        `remover \`${chave}\` devia parar o gerador`,
      );
    }
  }
});

test('o painel de um comando é bash, e o marcador casa com a opção', () => {
  const {pt} = parDeCli();
  const painel = painelDe(pt, 1);

  assert.equal(painel.snippet.linguagem, 'bash');
  assert.equal(painel.snippet.modelo, `overpower install --from "${marcador('--from')}"`);
  assert.deepEqual(painel.parametros, [{nome: '--from', exemplo: 'acervo/'}]);
  for (const marca of marcadoresDe(painel.snippet.modelo)) {
    assert.ok(
      painel.parametros.some((p) => p.nome === marca),
      `\`${marca}\` sem argumento que o substitua`,
    );
  }
});

test('a raiz de CLI não tem linha de import, e a flag booleana sai nua', () => {
  const {pt} = parDeCli();
  const painel = painelDe(pt, 0);

  // A cadeia da raiz é a dos membros, sem marcador — igual à do módulo.
  assert.equal(painel.snippet.modelo, 'overpower install --from "acervo/"');
  assert.doesNotMatch(painel.snippet.modelo, /import/);
  assert.deepEqual(painel.parametros, []);
});

test('a flag booleana entra nua quando verdadeira, e some quando falsa', () => {
  const {pt} = parDeCli();
  pt.entradas[1].parametros.push({
    nome: '--json',
    tipo: 'flag',
    descricao: 'Saída em JSON.',
    exemplo: true,
  });
  assert.match(painelDe(pt, 1).snippet.modelo, /--json$/);

  const desligada = parDeCli().pt;
  desligada.entradas[1].parametros.push({
    nome: '--json',
    tipo: 'flag',
    descricao: 'Saída em JSON.',
    exemplo: false,
  });
  assert.doesNotMatch(painelDe(desligada, 1).snippet.modelo, /--json/);
});

test('o par de disco emite bash nos dois locales — o dialeto é da espécie', () => {
  // O contrato deixou de descrever biblioteca, e com ele saiu o dialeto Python.
  // Este caso é o que trava que a saída do par COMMITADO é a de shell, e não só a
  // do par sintético logo acima.
  for (const caminho of [CONTRATO_PT, CONTRATO_EN]) {
    const c = lerContrato(caminho);
    for (const indice of [RAIZ, LIST, INSTALL, SEM_OPCAO]) {
      const painel = painelDe(c, indice, caminho);
      assert.equal(painel.snippet.linguagem, 'bash');
      assert.match(painel.snippet.modelo, /^overpower /);
      assert.doesNotMatch(painel.snippet.modelo, /^import |^from /m);
    }
  }
});

test('a raiz de disco traz os quatro códigos, e o comando sem retorno não os repete', () => {
  // A raiz é a única dona da tabela, e é ela que os três comandos referenciam.
  // O portão 5 diffaria a saída contra ela mesma se isto mudasse; aqui a
  // propriedade fica escrita.
  const c = lerContrato(CONTRATO_PT);
  const raiz = corpoMdx(c.entradas[RAIZ], contextoDe(c, CONTRATO_PT));
  for (const codigo of ['0', '1', '2', '3']) {
    assert.match(raiz, new RegExp(`<ResponseField name="${codigo}" type="int">`));
  }
  const list = corpoMdx(c.entradas[LIST], contextoDe(c, CONTRATO_PT));
  assert.doesNotMatch(list, /## Códigos de saída/);
  assert.match(list, /## Opções\n/);
});

test('a raiz sem códigos de saída PARA — ela é a única dona da tabela', () => {
  const {pt} = parDeCli();
  pt.entradas[0].retorno = null;
  // Sem a parada, a página que devia trazer os códigos sairia dizendo que não
  // devolve valor, e os comandos apontariam para uma tabela que não existe.
  assert.throws(
    () => corpoMdx(pt.entradas[0], contextoDe(pt, CAMINHO_CLI)),
    /overpower.*raiz|raiz.*overpower/s,
  );
  // O membro, esse, pode não ter os próprios códigos: os dele são os da raiz.
  assert.doesNotThrow(() => corpoMdx(pt.entradas[1], contextoDe(pt, CAMINHO_CLI)));
});

test('as CHAVES de `rotulos` são congruentes, e só os valores divergem', () => {
  const {pt, en} = parDeCli();
  delete en.rotulos.opcoes;
  // Sem esta cobrança o par passava, e o defeito só aparecia na emissão do EN:
  // um locale com a seção sem título, descoberto na próxima vez que alguém
  // rodasse o gerador.
  const recusa = validarPar(pt, en)[0];
  assert.equal(recusa.recusa, RECUSAS.contratosIncongruentes);
  assert.equal(recusa.ponteiro, '/rotulos/opcoes');
});

test('o par commitado continua congruente com a cobrança nova de rótulos', () => {
  // A cobrança é nova e o par é antigo: se as chaves já divergissem, isto
  // reprovaria aqui em vez de na próxima geração.
  assert.deepEqual(validarPar(lerContrato(CONTRATO_PT), lerContrato(CONTRATO_EN)), []);
});
