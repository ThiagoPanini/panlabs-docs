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

/** A única linguagem do painel. O cenário fixado tem uma linguagem de programação real. */
const LINGUAGEM = 'python';

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

/** O que o parâmetro vale dentro da chamada — placeholder quando ele é editável aqui. */
function valorDe(parametro, comPlaceholder) {
  if (parametro.exemploCodigo !== undefined) {
    return parametro.exemploCodigo;
  }
  if (comPlaceholder && editavel(parametro)) {
    return typeof parametro.exemplo === 'string'
      ? `"${marcador(parametro.nome)}"`
      : marcador(parametro.nome);
  }
  return literal(parametro.exemplo);
}

const temExemplo = (parametro) =>
  parametro.exemplo !== undefined || parametro.exemploCodigo !== undefined;

/** A linha de chamada de uma entrada, com atribuição quando ela devolve valor. */
function chamadaDe(entrada, comPlaceholder) {
  const argumentos = (entrada.parametros ?? [])
    .filter(temExemplo)
    .map((parametro) => `${parametro.nome}=${valorDe(parametro, comPlaceholder)}`);
  const atribuicao = entrada.resultado ? `${entrada.resultado} = ` : '';
  return `${atribuicao}${entrada.chamada}(${argumentos.join(', ')})`;
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

/** As linhas de uso, com o preâmbulo de receptor emitido uma vez só. */
function emitirCadeia(entrada, porId, vistos, linhas, comPlaceholder) {
  if (vistos.has(entrada.id)) {
    return;
  }
  if (entrada.receptor) {
    emitirCadeia(porId.get(entrada.receptor), porId, vistos, linhas, false);
  }
  vistos.add(entrada.id);
  linhas.push(chamadaDe(entrada, comPlaceholder));
}

/** O snippet inteiro de uma página — import, preâmbulo e chamada. */
function snippetDe(entrada, {contrato, porId}) {
  const vistos = new Set();
  const linhas = [];
  const simbolos = new Set();

  if (entrada.especie === 'modulo') {
    for (const id of entrada.fluxo ?? []) {
      const alvo = porId.get(id);
      emitirCadeia(alvo, porId, vistos, linhas, false);
      for (const simbolo of simbolosDe(alvo, porId)) {
        simbolos.add(simbolo);
      }
    }
  } else {
    emitirCadeia(entrada, porId, vistos, linhas, true);
    for (const simbolo of simbolosDe(entrada, porId)) {
      simbolos.add(simbolo);
    }
  }

  // A linha 1 do módulo É a assinatura dele — o que se escreve para alcançar o
  // módulo é o `import`, e ter duas fontes para a mesma linha era o convite a
  // elas divergirem.
  const importacao =
    entrada.especie === 'modulo'
      ? entrada.assinatura
      : `from ${contrato.biblioteca.modulo} import ${[...simbolos].sort().join(', ')}`;

  return [importacao, '', ...linhas].join('\n');
}

// ---------------------------------------------------------------------------
// MDX
// ---------------------------------------------------------------------------

const atributo = (nome, valor) => ` ${nome}="${String(valor).replace(/"/g, '&quot;')}"`;

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
  return `${rotulos.veja} [\`${alvo.titulo}\`](./${alvo.id}.mdx)`;
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
    `| ${rotulos.colunaErro} | ${rotulos.colunaQuando} |`,
    '| --- | --- |',
    ...erros.map((erro) => `| \`${erro.nome}\` | ${erro.quando} |`),
  ].join('\n');
}

/** A tabela de exportações do módulo — nome, espécie e o resumo da própria entrada. */
function tabelaDeExportacoes(entrada, {porId, rotulos}) {
  return [
    `| ${rotulos.colunaNome} | ${rotulos.colunaEspecie} | ${rotulos.colunaResumo} |`,
    '| --- | --- | --- |',
    ...entrada.exporta.map((id) => {
      const alvo = porId.get(id);
      return `| [\`${alvo.titulo}\`](./${id}.mdx) | ${rotulos[alvo.especie]} | ${alvo.resumo} |`;
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
 *   4. `## Parâmetros` — um campo por parâmetro; ausente quando não há nenhum
 *   5. `## Retorno` ou `## Atributos` — a árvore de campos, ou a frase de
 *      "não devolve valor"
 *   6. `## Exportações` — só no módulo, e no lugar dos dois anteriores
 *   7. `## Erros` — a tabela; ausente quando a entrada não levanta nada
 */
function corpoMdx(entrada, contexto) {
  const {porId, rotulos} = contexto;
  const partes = [`# ${entrada.titulo}`, '', `**${rotulos[entrada.especie]}** · \`${entrada.qualificado}\``, '', entrada.descricao];

  if (entrada.especie === 'modulo') {
    partes.push('', `## ${rotulos.exportacoes}`, '', tabelaDeExportacoes(entrada, contexto));
    return `${partes.join('\n')}\n`;
  }

  if ((entrada.parametros ?? []).length > 0) {
    partes.push('', `## ${rotulos.parametros}`, '');
    for (const parametro of entrada.parametros) {
      partes.push(campoMdx(parametro, 'ParamField', contexto, 1), '');
    }
    partes.pop();
  }

  const titulo = entrada.especie === 'tipo' ? rotulos.atributos : rotulos.retorno;
  partes.push('', `## ${titulo}`, '');
  if (!entrada.retorno) {
    partes.push(rotulos.semRetorno);
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

  if ((entrada.erros ?? []).length > 0) {
    partes.push('', `## ${rotulos.erros}`, '', tabelaDeErros(entrada.erros, contexto));
  }

  return `${partes.join('\n')}\n`;
}

/** O front matter — dois campos de conteúdo, mais o comutador do painel. */
function frontMatter(entrada, contexto) {
  // `editavel` já exige `exemplo` escalar, então ele implica `temExemplo`.
  const painel = {
    assinatura: entrada.assinatura,
    parametros: (entrada.parametros ?? [])
      .filter(editavel)
      .map((parametro) => ({nome: parametro.nome, exemplo: String(parametro.exemplo)})),
    snippet: {linguagem: LINGUAGEM, modelo: snippetDe(entrada, contexto)},
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

/** Escreve o diretório inteiro e apaga o `.mdx` que sobrou de um contrato anterior. */
function escreverLocale(locale, contrato) {
  const contexto = {
    contrato,
    caminhoDoContrato: CONTRATOS[locale],
    rotulos: contrato.rotulos,
    porId: new Map(contrato.entradas.map((entrada) => [entrada.id, entrada])),
  };
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
    ' * árvore inteira daria ao gerador a posse das quinze folhas autorais da aba,',
    ' * que ele não conhece.',
    ' *',
    ' * Issue #97: cada item carrega `className: \'sidebar-icone sidebar-icone--' +
      'bibliotecas\'` — a mesma família das três folhas autorais vizinhas de',
    ' * `Biblioteca C`. A regra é *toda folha tem ícone*, sem exceção para folha',
    ' * gerada; o gerador precisa saber o slug da família porque o contrato de',
    ' * assinatura não carrega posição na sidebar.',
    ' *',
    ' * Procedência: docs/design/referencia.md §5 · docs/design/icones.md §8 ·',
    ' * docs/adr/0008.',
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

principal();
