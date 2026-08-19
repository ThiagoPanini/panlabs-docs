/**
 * O gerador da referência de biblioteca — lê o par de contratos de assinatura,
 * valida, e escreve as seis páginas `.mdx` nos dois locales mais o **fragmento**
 * de sidebar que `sidebars-ferramentas.js` importa.
 *
 * **O nome não é `gerar-api`.** O contrato deixou de falar HTTP: ele descreve
 * assinatura de função, tipo e módulo, e um script chamado `gerar-api` sobre ele
 * mentiria no nome do arquivo.
 *
 * **Fragmento, não árvore.** O gerador anterior emitia a sidebar inteira da
 * instância dele. Aqui a instância é `ferramentas`, a sidebar dela é escrita à
 * mão, e o ramo gerado é um sub-ramo de `Bibliotecas › Biblioteca C` — no nível
 * 3, que é o teto. Emitir a árvore inteira daria ao gerador a posse de quinze
 * folhas autorais que ele não conhece.
 *
 * **Fora do build, saída commitada.** Ele não entra no `docusaurus.config.js`:
 * roda à mão (`npm run gerar:referencia`), e o portão 5 regenera e reprova em
 * `git diff --exit-code`. Um gerador determinístico rodado duas vezes sobre o
 * mesmo contrato produz bytes idênticos; se não produzir, o contrato mudou sem o
 * gerador rodar, ou alguém editou a saída à mão.
 *
 * **Zero snippet escrito à mão.** O texto do exemplo em Python é COMPOSTO: a
 * linha de import sai dos símbolos que a cadeia usa, o preâmbulo sai da entrada
 * que liga o receptor, e a chamada sai da assinatura com os exemplos dos
 * parâmetros. Nenhuma das seis entradas tem snippet próprio — é a mesma
 * disciplina de zero-segunda-fonte que motivou o gerador inteiro.
 *
 * Uso: node scripts/gerar-referencia.mjs
 *
 * Procedência: docs/adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md ·
 * docs/design/referencia.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {lerContrato, validarPar} from './lib/assinatura.mjs';
// O marcador de argumento editável vem do MESMO arquivo que o painel lê. Ver o
// cabeçalho de `placeholder.mjs`: o portão 5 regenera e diffa, e uma divergência
// de sintaxe entre as duas árvores passaria por ele com o diff limpo.
import {marcador, marcadoresDe} from '../src/theme/ApiDocItem/placeholder.mjs';

const CONTRATOS = {
  'pt-BR': 'contratos/panlabs-esteira.pt-BR.json',
  en: 'contratos/panlabs-esteira.en.json',
};

/** Onde cada locale escreve. O EN é a árvore de tradução da instância `ferramentas`. */
const DESTINOS = {
  'pt-BR': 'conteudo/ferramentas/bibliotecas/biblioteca-c/referencia',
  en: 'i18n/en/docusaurus-plugin-content-docs-ferramentas/current/bibliotecas/biblioteca-c/referencia',
};

/** O prefixo de id de documento — o mesmo nos dois locales. */
const PREFIXO = 'bibliotecas/biblioteca-c/referencia';

const FRAGMENTO = 'sidebars-referencia.js';

/**
 * O que cada espécie emite — a tabela que existe no lugar do `if (especie ===)`.
 *
 * O gerador do ADR 8 roteava por três comparações de string espalhadas em dois
 * arquivos-função; com cinco espécies isso vira dez. A tabela troca ramo por
 * DADO: a espécie nova se declara aqui e cai nos mesmos caminhos, que é o que
 * faz a fatia expand deste ticket caber sem duplicar renderizador.
 *
 * Os campos:
 *
 *   · `membros` — a chave de rótulo da tabela de filhos, ou `null`. **Ter
 *     membros é ser raiz**: é a mesma pergunta, e a perna de hierarquia que o
 *     ADR 9 §a) manda `aplicacao` guardar. A raiz percorre `fluxo` no snippet;
 *     o membro emite a própria cadeia, com marcador.
 *   · `campos` — a chave de rótulo da seção de `<ParamField>`, ou `null`.
 *   · `retorno` — a chave de rótulo da seção de `<ResponseField>`, e se ela sai
 *     **sempre** (com a frase de `semRetorno` quando a entrada não tem retorno)
 *     ou só quando há o que dizer.
 *   · `dialeto` — quem compõe o snippet do painel, e em que linguagem.
 *
 * `ParamField` lê como parâmetro nas três primeiras e como **opção** nas duas
 * últimas; `ResponseField`, como retorno e como **código de saída**. Nenhum dos
 * dois muda, e é a leitura que muda (ADR 9 §c): eles nunca foram específicos de
 * protocolo nem de linguagem, que é por que sobreviveram à morte do `VerbBadge`.
 */
const FORMA = {
  modulo: {membros: 'exportacoes', campos: null, retorno: null, dialeto: 'python'},
  tipo: {membros: null, campos: 'parametros', retorno: {rotulo: 'atributos', sempre: true}, dialeto: 'python'},
  funcao: {membros: null, campos: 'parametros', retorno: {rotulo: 'retorno', sempre: true}, dialeto: 'python'},
  // A raiz da CLI: as opções globais e a tabela dos códigos de saída que valem
  // para todos os comandos. Ela SEMPRE traz a tabela, porque é o único lugar
  // onde ela mora.
  aplicacao: {
    membros: 'comandos',
    campos: 'opcoesGlobais',
    retorno: {rotulo: 'codigosDeSaida', sempre: true},
    dialeto: 'cli',
  },
  // O comando traz código de saída só quando tem um que a raiz não cobre.
  // Repetir os quatro da aplicação em cada página seria a segunda fonte que o
  // gerador inteiro existe para não ter.
  comando: {
    membros: null,
    campos: 'opcoes',
    retorno: {rotulo: 'codigosDeSaida', sempre: false},
    dialeto: 'cli',
  },
};

// ---------------------------------------------------------------------------
// Python, a partir de JSON
// ---------------------------------------------------------------------------

/** Um valor JSON escrito como literal de Python. */
function literal(valor) {
  if (valor === null) {
    return 'None';
  }
  if (typeof valor === 'boolean') {
    return valor ? 'True' : 'False';
  }
  if (typeof valor === 'number') {
    return String(valor);
  }
  if (typeof valor === 'string') {
    return `"${valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  if (Array.isArray(valor)) {
    return `[${valor.map(literal).join(', ')}]`;
  }
  return `{${Object.entries(valor)
    .map(([chave, dentro]) => `${literal(chave)}: ${literal(dentro)}`)
    .join(', ')}}`;
}

/**
 * O parâmetro é editável?
 *
 * **Escalar com exemplo, e nada além.** É o porte direto da regra anterior — lá
 * caminho e consulta eram editáveis e o corpo era estático. Um `dict` ou uma
 * lista dentro de um `<input type="text">` obrigaria o painel a parsear texto de
 * volta para estrutura, que é um interpretador dentro de um site estático.
 */
const editavel = (parametro) =>
  typeof parametro.exemplo === 'string' || typeof parametro.exemplo === 'number';

/**
 * O que o parâmetro vale dentro da chamada — placeholder quando ele é editável
 * aqui, e o literal do dialeto quando não.
 *
 * O `escrever` entra por parâmetro porque `True` é Python e `true` não é nada
 * numa linha de shell. O resto da regra — código cru vence, editável vira
 * marcador, string ganha aspas — é a mesma nos dois, e é a que casa com o que o
 * painel substitui.
 */
function valorDe(parametro, comPlaceholder, escrever) {
  if (parametro.exemploCodigo !== undefined) {
    return parametro.exemploCodigo;
  }
  if (comPlaceholder && editavel(parametro)) {
    return typeof parametro.exemplo === 'string'
      ? `"${marcador(parametro.nome)}"`
      : marcador(parametro.nome);
  }
  return escrever(parametro.exemplo);
}

const temExemplo = (parametro) =>
  parametro.exemplo !== undefined || parametro.exemploCodigo !== undefined;

/** A linha de chamada de uma entrada, com atribuição quando ela devolve valor. */
function chamadaPython(entrada, comPlaceholder) {
  const argumentos = (entrada.parametros ?? [])
    .filter(temExemplo)
    .map((parametro) => `${parametro.nome}=${valorDe(parametro, comPlaceholder, literal)}`);
  const atribuicao = entrada.resultado ? `${entrada.resultado} = ` : '';
  return `${atribuicao}${entrada.chamada}(${argumentos.join(', ')})`;
}

/** Um valor JSON escrito como palavra de uma linha de shell. */
const literalDeComando = (valor) =>
  typeof valor === 'string' ? `"${valor.replace(/"/g, '\\"')}"` : String(valor);

/**
 * A linha de uso de um comando — `overpower install --from "…"`.
 *
 * **A flag booleana não recebe valor.** `--json true` não é linha que alguém
 * digita; a opção verdadeira entra nua e a falsa não entra. O nome vem inteiro
 * do contrato, traços e tudo, porque é ele que o leitor copia e é ele que o
 * painel usa como chave do marcador.
 */
function chamadaComando(entrada, comPlaceholder) {
  const opcoes = (entrada.parametros ?? []).filter(temExemplo).flatMap((parametro) => {
    if (typeof parametro.exemplo === 'boolean') {
      return parametro.exemplo ? [parametro.nome] : [];
    }
    return [`${parametro.nome} ${valorDe(parametro, comPlaceholder, literalDeComando)}`];
  });
  return [entrada.chamada, ...opcoes].join(' ');
}

/** O identificador que abre uma expressão — `padrao.python(…)` devolve `padrao`. */
const raizDe = (expressao) => String(expressao).trim().split(/[^A-Za-z0-9_]/)[0];

/**
 * Os símbolos que a cadeia de uma entrada importa.
 *
 * Entrada com receptor NÃO contribui a raiz da própria chamada: `esteira.gerar`
 * abre com a variável que o preâmbulo ligou, não com um nome importado.
 */
function simbolosDe(entrada, porId, dentro = new Set()) {
  if (entrada.receptor) {
    simbolosDe(porId.get(entrada.receptor), porId, dentro);
  } else if (entrada.chamada) {
    dentro.add(raizDe(entrada.chamada));
  }
  for (const parametro of entrada.parametros ?? []) {
    if (parametro.exemploCodigo !== undefined) {
      dentro.add(raizDe(parametro.exemploCodigo));
    }
  }
  return dentro;
}

/**
 * Quem compõe o snippet do painel, por dialeto.
 *
 * **O dialeto é da espécie, não do contrato.** Uma entrada `funcao` sempre se
 * usa a partir de Python e uma `comando` sempre a partir do shell; não há
 * contrato que troque isso, então não há campo de contrato a inventar para
 * dizê-lo. `bash` é a linguagem que o Prism já carrega
 * (`docusaurus.config.js` § `additionalLanguages`), então o painel a pinta sem
 * dependência nova.
 */
const DIALETOS = {
  python: {
    linguagem: 'python',
    chamada: chamadaPython,
    // A linha 1 do módulo É a assinatura dele — o que se escreve para alcançar
    // o módulo é o `import`, e ter duas fontes para a mesma linha era o convite
    // a elas divergirem.
    preambulo: (entrada, {contrato, simbolos}) =>
      FORMA[entrada.especie].membros
        ? entrada.assinatura
        : `from ${contrato.biblioteca.modulo} import ${[...simbolos].sort().join(', ')}`,
  },
  cli: {
    linguagem: 'bash',
    chamada: chamadaComando,
    // Não há o que importar antes de chamar um comando, e uma linha em branco
    // no topo do bloco seria enfeite que o leitor copiaria junto.
    preambulo: () => null,
  },
};

/** As linhas de uso, com o preâmbulo de receptor emitido uma vez só. */
function emitirCadeia(entrada, porId, vistos, linhas, comPlaceholder, dialeto) {
  if (vistos.has(entrada.id)) {
    return;
  }
  if (entrada.receptor) {
    emitirCadeia(porId.get(entrada.receptor), porId, vistos, linhas, false, dialeto);
  }
  vistos.add(entrada.id);
  linhas.push(dialeto.chamada(entrada, comPlaceholder));
}

/** O snippet inteiro de uma página — preâmbulo, receptor e chamada. */
function snippetDe(entrada, {contrato, porId}) {
  const dialeto = DIALETOS[FORMA[entrada.especie].dialeto];
  const vistos = new Set();
  const linhas = [];
  const simbolos = new Set();

  // A raiz mostra o fluxo dos membros e não a si mesma: o que se digita para
  // usar um módulo é a função dele, e o que se digita para usar uma CLI é um
  // comando dela. Ter membros é ser raiz.
  if (FORMA[entrada.especie].membros) {
    for (const id of entrada.fluxo ?? []) {
      const alvo = porId.get(id);
      emitirCadeia(alvo, porId, vistos, linhas, false, dialeto);
      for (const simbolo of simbolosDe(alvo, porId)) {
        simbolos.add(simbolo);
      }
    }
  } else {
    emitirCadeia(entrada, porId, vistos, linhas, true, dialeto);
    for (const simbolo of simbolosDe(entrada, porId)) {
      simbolos.add(simbolo);
    }
  }

  const preambulo = dialeto.preambulo(entrada, {contrato, simbolos});
  return (preambulo === null ? linhas : [preambulo, '', ...linhas]).join('\n');
}

// ---------------------------------------------------------------------------
// MDX
// ---------------------------------------------------------------------------

const atributo = (nome, valor) => ` ${nome}="${String(valor).replace(/"/g, '&quot;')}"`;

/**
 * Um rótulo, lido do bloco `rotulos` do contrato — **e nunca com reserva**.
 *
 * É o que torna *"Parâmetros" → "Opções"* uma troca de dado e não de código
 * (ADR 8, e o acidente feliz que o ADR 9 §c) cobra). O acesso passa por aqui em
 * vez de por `rotulos.x` cru porque uma chave ausente saía `## undefined`, e o
 * portão 5 não a pegaria: ele regenera e diffa a saída contra ela mesma, então
 * o `undefined` estaria dos dois lados e o diff sairia limpo. É o mesmo buraco
 * do marcador órfão, e a mesma resposta — parar alto, nomeando a chave.
 */
function rotulo(rotulos, chave) {
  const valor = rotulos[chave];
  if (typeof valor !== 'string' || valor === '') {
    throw new Error(`o contrato não traz o rótulo \`${chave}\`, e a seção sairia sem título.`);
  }
  return valor;
}

/**
 * O link para outra entrada.
 *
 * **Um campo cujo tipo é outra entrada não aninha — ele linka**, e é isso que
 * dispensou o reset de profundidade que o contrato anterior precisava: não há
 * expansão embutida cujo orçamento de aninhamento dependa de onde ela foi
 * referenciada. O alvo vai em caminho de ARQUIVO (`./x.mdx`), e não em rota: é a
 * forma que o `onBrokenMarkdownLinks: 'throw'` confere no build.
 */
function linkDaEntrada(id, {porId, rotulos}) {
  const alvo = porId.get(id);
  return `${rotulo(rotulos, 'veja')} [\`${alvo.titulo}\`](./${alvo.id}.mdx)`;
}

/** Um `<ParamField>`/`<ResponseField>`, com a recursão por `<Expandable>`. */
function campoMdx(campo, tag, contexto, nivel) {
  const {rotulos} = contexto;
  const abre =
    `<${tag}${atributo('name', campo.nome)}${atributo('type', campo.tipo)}` +
    `${campo.padrao === undefined ? '' : atributo('default', campo.padrao)}` +
    `${campo.obrigatorio ? ' required' : ''}${campo.deprecated ? ' deprecated' : ''}>`;

  const corpo = [campo.descricao];

  if (campo.entrada !== undefined) {
    corpo.push('', linkDaEntrada(campo.entrada, contexto));
  }

  if ((campo.campos ?? []).length > 0) {
    corpo.push('', `<Expandable${atributo('title', campo.tipo)}${nivel === 1 ? ' defaultOpen' : ''}>`, '');
    for (const filho of campo.campos) {
      corpo.push(campoMdx(filho, tag, contexto, nivel + 1), '');
    }
    corpo.push('</Expandable>');
  }

  return [abre, ...corpo, `</${tag}>`].join('\n');
}

/** A tabela de erros — `Erro` e `Quando`, nesta ordem. */
function tabelaDeErros(erros, {rotulos}) {
  return [
    `| ${rotulo(rotulos, 'colunaErro')} | ${rotulo(rotulos, 'colunaQuando')} |`,
    '| --- | --- |',
    ...erros.map((erro) => `| \`${erro.nome}\` | ${erro.quando} |`),
  ].join('\n');
}

/**
 * A tabela de membros da raiz — nome, espécie e o resumo da própria entrada.
 *
 * Serve as exportações de um módulo e os comandos de uma aplicação sem saber a
 * diferença: nos dois casos é a raiz apontando para os filhos, e o que muda é o
 * rótulo da seção, que já é dado.
 */
function tabelaDeMembros(entrada, {porId, rotulos}) {
  return [
    `| ${rotulo(rotulos, 'colunaNome')} | ${rotulo(rotulos, 'colunaEspecie')} | ${rotulo(rotulos, 'colunaResumo')} |`,
    '| --- | --- | --- |',
    ...entrada.exporta.map((id) => {
      const alvo = porId.get(id);
      return `| [\`${alvo.titulo}\`](./${id}.mdx) | ${rotulo(rotulos, alvo.especie)} | ${alvo.resumo} |`;
    }),
  ].join('\n');
}

/**
 * O corpo da página, na ordem fixa que o gerador produz sempre:
 *
 *   1. `# Título`
 *   2. a espécie e o nome qualificado, em prosa — o lugar onde a pílula de verbo
 *      ficava, agora sem verbo para pintar
 *   3. a descrição
 *   4. a tabela de membros — `## Exportações` no módulo, `## Comandos` na
 *      aplicação; ausente em quem não é raiz
 *   5. a seção de `<ParamField>` — `## Parâmetros`, `## Opções globais` ou
 *      `## Opções`; ausente quando não há nenhum
 *   6. a seção de `<ResponseField>` — `## Retorno`, `## Atributos` ou
 *      `## Códigos de saída`, com a árvore de campos ou a frase de "não devolve
 *      valor"
 *   7. `## Erros` — a tabela; ausente quando a entrada não levanta nada
 *
 * **Quem escolhe as seções é `FORMA`, e quem escreve os títulos é o contrato.**
 * A função não nomeia espécie nenhuma: ela lê a forma da espécie e indexa o
 * bloco `rotulos` pela chave que a forma aponta. É por isso que *"Parâmetros" →
 * "Opções"* não toca uma linha daqui.
 */
export function corpoMdx(entrada, contexto) {
  const {rotulos} = contexto;
  const forma = FORMA[entrada.especie];
  const partes = [
    `# ${entrada.titulo}`,
    '',
    `**${rotulo(rotulos, entrada.especie)}** · \`${entrada.qualificado}\``,
    '',
    entrada.descricao,
  ];

  if (forma.membros) {
    partes.push('', `## ${rotulo(rotulos, forma.membros)}`, '', tabelaDeMembros(entrada, contexto));
  }

  if (forma.campos && (entrada.parametros ?? []).length > 0) {
    partes.push('', `## ${rotulo(rotulos, forma.campos)}`, '');
    for (const parametro of entrada.parametros) {
      partes.push(campoMdx(parametro, 'ParamField', contexto, 1), '');
    }
    partes.pop();
  }

  if (forma.retorno && (forma.retorno.sempre || entrada.retorno)) {
    partes.push('', `## ${rotulo(rotulos, forma.retorno.rotulo)}`, '');
    corpoDoRetorno(entrada, contexto, partes);
  }

  if ((entrada.erros ?? []).length > 0) {
    partes.push('', `## ${rotulo(rotulos, 'erros')}`, '', tabelaDeErros(entrada.erros, contexto));
  }

  return `${partes.join('\n')}\n`;
}

/** O miolo da seção de retorno — a frase, o link, ou a árvore de campos. */
function corpoDoRetorno(entrada, contexto, partes) {
  const {rotulos} = contexto;
  if (!entrada.retorno) {
    partes.push(rotulo(rotulos, 'semRetorno'));
  } else if ((entrada.retorno.campos ?? []).length === 0) {
    partes.push(
      entrada.retorno.entrada === undefined
        ? entrada.retorno.descricao
        : `${entrada.retorno.descricao} ${linkDaEntrada(entrada.retorno.entrada, contexto)}`,
    );
  } else {
    partes.push(entrada.retorno.descricao, '');
    for (const campo of entrada.retorno.campos) {
      partes.push(campoMdx(campo, 'ResponseField', contexto, 1), '');
    }
    partes.pop();
  }
}

/** O front matter — dois campos de conteúdo, mais o comutador do painel. */
export function frontMatter(entrada, contexto) {
  // `editavel` já exige `exemplo` escalar, então ele implica `temExemplo`.
  const painel = {
    assinatura: entrada.assinatura,
    parametros: (entrada.parametros ?? [])
      .filter(editavel)
      .map((parametro) => ({nome: parametro.nome, exemplo: String(parametro.exemplo)})),
    snippet: {
      linguagem: DIALETOS[FORMA[entrada.especie].dialeto].linguagem,
      modelo: snippetDe(entrada, contexto),
    },
  };

  // O casamento entre quem escreve o marcador e quem o substitui, conferido na
  // emissão: um marcador sem argumento na lista chegaria à tela cru, e o portão
  // 5 não o veria — ele diffa a saída contra ela mesma.
  const orfaos = marcadoresDe(painel.snippet.modelo).filter(
    (nome) => !painel.parametros.some((parametro) => parametro.nome === nome),
  );
  if (orfaos.length > 0) {
    throw new Error(
      `${entrada.id}: o snippet tem marcador sem argumento que o substitua — ${orfaos.join(', ')}.`,
    );
  }

  return [
    '---',
    `# GERADO por scripts/gerar-referencia.mjs a partir de ${contexto.caminhoDoContrato}.`,
    '# Não edite à mão: o portão 5 regenera e reprova em `git diff --exit-code`.',
    `title: ${entrada.titulo}`,
    `description: ${entrada.resumo}`,
    `api_exemplos: ${JSON.stringify(painel)}`,
    '---',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

/**
 * O contexto de emissão — o contrato de UM locale, indexado por id.
 *
 * Ele sai de `escreverLocale` porque a régua de máquina precisa emitir uma
 * página sem escrever no disco: as duas espécies de CLI ainda não têm contrato
 * commitado, então o único lugar onde os ramos delas rodam é o teste, e um teste
 * que tivesse de chamar o gerador inteiro reescreveria o ramo de `Biblioteca C`
 * para conferir uma string.
 */
export function contextoDe(contrato, caminhoDoContrato) {
  return {
    contrato,
    caminhoDoContrato,
    rotulos: contrato.rotulos,
    porId: new Map(contrato.entradas.map((entrada) => [entrada.id, entrada])),
  };
}

/** Escreve o diretório inteiro e apaga o `.mdx` que sobrou de um contrato anterior. */
function escreverLocale(locale, contrato) {
  const contexto = contextoDe(contrato, CONTRATOS[locale]);
  const destino = DESTINOS[locale];
  fs.mkdirSync(destino, {recursive: true});

  const escritos = new Set();
  for (const entrada of contrato.entradas) {
    const arquivo = `${entrada.id}.mdx`;
    escritos.add(arquivo);
    fs.writeFileSync(
      path.join(destino, arquivo),
      `${frontMatter(entrada, contexto)}\n\n${corpoMdx(entrada, contexto)}`,
    );
  }

  for (const orfao of fs.readdirSync(destino)) {
    if (!escritos.has(orfao)) {
      fs.rmSync(path.join(destino, orfao), {recursive: true});
    }
  }
  return escritos.size;
}

/** O fragmento — uma lista de itens de folha, e nada além. Quem monta a árvore é
 * a sidebar da aba. */
function escreverFragmento(contrato) {
  const linhas = [
    '// @ts-check',
    '',
    '/**',
    ' * O ramo gerado de `Ferramentas › Bibliotecas › Biblioteca C` — **fragmento**,',
    ' * não árvore.',
    ' *',
    ' * GERADO por scripts/gerar-referencia.mjs. Não edite à mão: o portão 5 regenera',
    ' * e reprova em `git diff --exit-code`.',
    ' *',
    ' * Ele é uma LISTA DE ITENS DE FOLHA e nada além. A árvore da aba é escrita à',
    ' * mão em `sidebars-ferramentas.js`, que importa esta lista e a espalha dentro',
    ' * de `Biblioteca C` — no nível 3, que é o teto de profundidade. Emitir a',
    ' * árvore inteira daria ao gerador a posse das folhas autorais da aba, que ele',
    ' * não conhece.',
    ' *',
    ' * Cada item carrega `className: \'sidebar-icone sidebar-icone--' +
      'bibliotecas\'` — a mesma família das três folhas autorais vizinhas de',
    ' * `Biblioteca C`. A regra é a de docs/design/icones.md §8 — *nenhum ícone no',
    ' * separador de topo; ícone em tudo abaixo dele* —, e folha gerada não abre',
    ' * exceção. O gerador precisa saber o slug da família porque o contrato de',
    ' * assinatura não carrega posição na sidebar.',
    ' *',
    ' * Procedência: docs/design/referencia.md §5 · docs/design/icones.md §8 ·',
    ' * docs/adr/0008 · docs/adr/0010.',
    ' *',
    ' * @type {import(\'@docusaurus/plugin-content-docs\').SidebarItemConfig[]}',
    ' */',
    'const referencia = [',
    ...contrato.entradas.map(
      (entrada) =>
        `  {type: 'doc', id: '${PREFIXO}/${entrada.id}', className: 'sidebar-icone sidebar-icone--bibliotecas'},`,
    ),
    '];',
    '',
    'export default referencia;',
    '',
  ];
  fs.writeFileSync(FRAGMENTO, linhas.join('\n'));
}

// ---------------------------------------------------------------------------

function principal() {
  let contratos;
  try {
    contratos = Object.fromEntries(
      Object.entries(CONTRATOS).map(([locale, caminho]) => [locale, lerContrato(caminho)]),
    );
  } catch (erro) {
    console.error(`RECUSADO ${erro.recusa} em "${erro.ponteiro}" — ${erro.message}`);
    process.exit(1);
  }

  const recusas = validarPar(contratos['pt-BR'], contratos.en);
  if (recusas.length > 0) {
    console.error(`O contrato foi RECUSADO em ${recusas.length} ponto(s):`);
    for (const {recusa, ponteiro, detalhe} of recusas) {
      console.error(`  ${recusa}  em "${ponteiro}"`);
      console.error(`    ${detalhe}`);
    }
    process.exit(1);
  }

  const contadas = Object.entries(contratos).map(
    ([locale, contrato]) => `${locale}: ${escreverLocale(locale, contrato)}`,
  );
  escreverFragmento(contratos['pt-BR']);

  console.log(`Referência gerada — ${contadas.join(' · ')} · ${FRAGMENTO}`);
}

// **Só roda quando é o comando, nunca quando é importado.** `npm test` importa
// `corpoMdx` e `frontMatter` daqui para exercitar as espécies que ainda não têm
// contrato no disco; sem esta guarda, um `node --test` reescreveria o ramo
// gerado de `Biblioteca C` como efeito colateral de conferir uma string.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal();
}
