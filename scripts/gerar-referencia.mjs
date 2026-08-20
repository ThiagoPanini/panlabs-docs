/**
 * O gerador da referência — lê o par de contratos de assinatura, valida, e
 * escreve as quatro páginas `.mdx` nos dois locales mais o **fragmento** de
 * sidebar que `sidebars-ferramentas.js` importa.
 *
 * **O nome não é `gerar-api`.** O contrato deixou de falar HTTP na ADR 8 e
 * deixou de falar biblioteca na ADR 9; hoje ele descreve **superfície de
 * comando**. `gerar-referencia` não mentiu em nenhuma das três, e é por isso que
 * ele não troca de nome a cada troca de sujeito.
 *
 * **Fragmento, não árvore.** O gerador anterior emitia a sidebar inteira da
 * instância dele. Aqui a instância é `ferramentas`, a sidebar dela é escrita à
 * mão, e o ramo gerado mora dentro da categoria `Comandos`, no nível 4, que é o
 * teto. Emitir a árvore inteira daria ao gerador a posse de vinte e duas folhas
 * autorais que ele não conhece — a categoria `Comandos` inclusive, cujo rótulo e
 * cuja folha de abertura são nossos.
 *
 * **Fora do build, saída commitada.** Ele não entra no `docusaurus.config.js`:
 * roda à mão (`npm run gerar:referencia`), e o portão 5 regenera e reprova em
 * `git diff --exit-code`. Um gerador determinístico rodado duas vezes sobre o
 * mesmo contrato produz bytes idênticos; se não produzir, o contrato mudou sem o
 * gerador rodar, ou alguém editou a saída à mão.
 *
 * **Zero snippet escrito à mão.** A linha de comando do exemplo é COMPOSTA: a
 * raiz percorre o `fluxo` dos membros, o membro emite a própria cadeia, e cada
 * opção com exemplo entra com o valor dela ou com o marcador que o painel
 * substitui. Nenhuma das quatro entradas tem snippet próprio — é a mesma
 * disciplina de zero-segunda-fonte que motivou o gerador inteiro.
 *
 * Uso: node scripts/gerar-referencia.mjs
 *
 * Procedência: docs/adr/0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md ·
 * docs/design/referencia.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {lerContrato, validarPar} from './lib/assinatura.mjs';
// O modelo de linha vem do MESMO arquivo que o painel lê, e é o que faz a
// assinatura emitida aqui e a linha montada lá não poderem divergir: são a mesma
// função sobre o mesmo campo. Ver o cabeçalho de `linha.mjs`.
import {assinaturaDe} from '../src/theme/MDXComponents/linha.mjs';

const CONTRATOS = {
  'pt-BR': 'contratos/overpower.pt-BR.json',
  en: 'contratos/overpower.en.json',
};

/** Onde cada locale escreve. O EN é a árvore de tradução da instância `ferramentas`. */
const DESTINOS = {
  'pt-BR': 'conteudo/ferramentas/bibliotecas/overpower/comandos',
  en: 'i18n/en/docusaurus-plugin-content-docs-ferramentas/current/bibliotecas/overpower/comandos',
};

/** O prefixo de id de documento — o mesmo nos dois locales. */
const PREFIXO = 'bibliotecas/overpower/comandos';

const FRAGMENTO = 'sidebars-referencia.js';

/**
 * A tag do painel, emitida no corpo de toda página gerada.
 *
 * Ela é literal e sem atributo de propósito: serializar o painel como prop
 * dentro do MDX seria uma segunda cópia do `api_exemplos` que o front matter já
 * carrega, e o portão 5 não veria as duas divergirem — ele regenera e diffa a
 * saída contra ela mesma. O componente lê o front matter pela mesma porta que a
 * página, `useDoc()`.
 */
const PAINEL = '<PainelComando />';

/**
 * A chave de ícone de uma folha gerada — e ela passou a ser POR ENTRADA.
 *
 * A história tem três degraus. Enquanto o ramo gerado morava espalhado entre as
 * folhas autorais de uma biblioteca, ele herdava `--bibliotecas`, a família do
 * separador. Com o ADR 9 §d) ganhou categoria própria e passou a `--comandos`, a
 * família da seção — e as quatro páginas viraram uma fileira de quatro linhas
 * com o mesmo glifo, que é exatamente o que a #118 veio desfazer.
 *
 * Hoje **o contrato carrega a chave**, em `entrada.icone`. Ela não é dedutível
 * do `id`: `sidebar-icone--install` colidiria com a página autoral `Instalação`
 * do mesmo ramo, e é por isso que o campo é dado e não convenção. O gerador
 * confere que ela existe — uma entrada sem chave sairia com `undefined` no
 * `className`, e o portão 5 diffaria a saída contra ela mesma sem ver nada.
 */
const chaveDeIcone = (entrada) => {
  if (typeof entrada.icone !== 'string' || entrada.icone === '') {
    throw new Error(
      `${entrada.id}: falta \`icone\` no contrato, e é ele que dá o \`className\` da folha na sidebar.`,
    );
  }
  return entrada.icone;
};

/**
 * O que cada espécie emite — a tabela que existe no lugar do `if (especie ===)`.
 *
 * O gerador do ADR 8 roteava por três comparações de string espalhadas em dois
 * arquivos-função. A tabela troca ramo por DADO: a espécie se declara aqui e cai
 * nos mesmos caminhos, e foi isso que fez a fatia expand caber sem duplicar
 * renderizador. É também o que faz a fatia **contract** ser uma deleção de dado
 * em vez de uma cirurgia de fluxo — as três espécies de biblioteca saíram com o
 * contrato mockado que as pedia, e nenhum caminho de emissão precisou mudar.
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
 *   · `erros` — se a espécie tem tabela de erros.
 *   · `dialeto` — quem compõe o snippet do painel, e em que linguagem.
 *
 * **A tabela é fechada contra `ESPECIES`**, e o `npm test` amarra as duas: uma
 * espécie que entrasse na lista do validador sem forma aqui não daria recusa
 * nomeada, daria `TypeError` no meio da emissão.
 *
 * `ParamField` lê aqui como **opção** e `ResponseField` como **código de
 * saída**. Nenhum dos dois muda, e é a leitura que muda (ADR 9 §c): eles nunca
 * foram específicos de protocolo nem de linguagem, que é por que sobreviveram à
 * morte do `VerbBadge` e à do contrato de biblioteca.
 */
export const FORMA = {
  // A raiz da CLI: as opções globais e a tabela dos códigos de saída que valem
  // para todos os comandos. Ela SEMPRE traz a tabela, porque é o único lugar
  // onde ela mora.
  aplicacao: {
    membros: 'comandos',
    campos: 'opcoesGlobais',
    retorno: {rotulo: 'codigosDeSaida', sempre: true},
    erros: true,
    dialeto: 'cli',
  },
  // O comando traz código de saída só quando tem um que a raiz não cobre.
  // Repetir os quatro da aplicação em cada página seria a segunda fonte que o
  // gerador inteiro existe para não ter.
  comando: {
    membros: null,
    campos: 'opcoes',
    retorno: {rotulo: 'codigosDeSaida', sempre: false},
    erros: true,
    dialeto: 'cli',
  },
};

// ---------------------------------------------------------------------------
// A linha de comando, a partir de JSON
// ---------------------------------------------------------------------------

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
 * O que o parâmetro vale dentro da linha: código cru vence, e o resto vira
 * literal do shell.
 *
 * **A terceira perna saiu com o marcador.** Até a versão 1 do contrato havia um
 * ramo `comPlaceholder` que trocava o valor por `{{nome}}` para o cliente
 * substituir. Quem monta a linha editável agora é `linha.mjs`, e as únicas
 * linhas que este arquivo ainda compõe são as da raiz, que são estáticas.
 */
function valorDe(parametro) {
  if (parametro.exemploCodigo !== undefined) {
    return parametro.exemploCodigo;
  }
  return literalDeComando(parametro.exemplo);
}

const temExemplo = (parametro) =>
  parametro.exemplo !== undefined || parametro.exemploCodigo !== undefined;

/**
 * Um valor JSON escrito como palavra de uma linha de shell.
 *
 * Dentro de aspas duplas o shell ainda expande `$`, executa crase e consome a
 * contrabarra, e esta é a linha que o leitor copia para o terminal dele. A
 * ordem importa: escapar `\\` depois de `"` escaparia a barra que acabou de ser
 * inserida.
 */
const literalDeComando = (valor) =>
  typeof valor === 'string'
    ? `"${valor.replace(/[\\$`"]/g, (c) => `\\${c}`)}"`
    : String(valor);

/**
 * A linha de uso de um comando — `overpower install --from "…"`.
 *
 * **A flag booleana não recebe valor.** `--json true` não é linha que alguém
 * digita; a opção verdadeira entra nua e a falsa não entra. O nome vem inteiro
 * do contrato, traços e tudo, porque é ele que o leitor copia e é ele que o
 * painel usa como chave do marcador.
 */
function chamadaComando(entrada) {
  const opcoes = (entrada.parametros ?? []).filter(temExemplo).flatMap((parametro) => {
    if (typeof parametro.exemplo === 'boolean') {
      return parametro.exemplo ? [parametro.nome] : [];
    }
    return [`${parametro.nome} ${valorDe(parametro)}`];
  });
  return [entrada.chamada, ...opcoes].join(' ');
}

/**
 * Quem compõe o snippet do painel, por dialeto.
 *
 * **O dialeto é da espécie, não do contrato.** Uma entrada `comando` sempre se
 * usa a partir do shell; não há contrato que troque isso, então não há campo de
 * contrato a inventar para dizê-lo. `bash` é a linguagem que o Prism já carrega
 * (`docusaurus.config.js` § `additionalLanguages`), então o painel a pinta sem
 * dependência nova.
 *
 * **A tabela ficou com uma linha, e a tabela fica.** O `python` saiu com as três
 * espécies de biblioteca; o que ele provava — que a espécie escolhe o dialeto em
 * vez de o contrato declarar um — continua sendo o que dispensa um campo novo no
 * JSON no dia em que a segunda linha voltar.
 */
const DIALETOS = {
  cli: {
    linguagem: 'bash',
    chamada: chamadaComando,
    // Não há o que importar antes de chamar um comando, e uma linha em branco
    // no topo do bloco seria enfeite que o leitor copiaria junto.
    preambulo: () => null,
  },
};

/**
 * As linhas de uso, com o receptor emitido uma vez só, antes de quem o usa.
 *
 * **O `receptor` continua aqui, e o contrato de CLI não o usa.** Ele é campo do
 * contrato de assinatura, e o validador o confere em duas das doze recusas
 * nomeadas — `referencia-morta` e `ciclo-de-receptor`. Tirá-lo daqui deixaria o
 * validador cobrando um campo que a emissão ignora, que é a divergência entre as
 * duas listas fechadas que o `npm test` existe para não ter.
 */
function emitirCadeia(entrada, porId, vistos, linhas, dialeto) {
  if (vistos.has(entrada.id)) {
    return;
  }
  if (entrada.receptor) {
    emitirCadeia(porId.get(entrada.receptor), porId, vistos, linhas, dialeto);
  }
  vistos.add(entrada.id);
  linhas.push(dialeto.chamada(entrada));
}

/**
 * As linhas estáticas da raiz — preâmbulo, receptor e a chamada de cada membro.
 *
 * **Só a raiz passa por aqui.** A página de um comando não tem snippet
 * congelado: ela carrega o modelo, e quem compõe a linha é o painel. A raiz
 * mostra o fluxo dos membros e não a si mesma, porque o que se digita para usar
 * uma CLI é um comando dela — ter membros é ser raiz.
 */
function snippetDe(entrada, {contrato, porId}) {
  const forma = FORMA[entrada.especie];
  const dialeto = DIALETOS[forma.dialeto];
  const vistos = new Set();
  const linhas = [];

  for (const id of entrada.fluxo ?? []) {
    emitirCadeia(porId.get(id), porId, vistos, linhas, dialeto);
  }

  const preambulo = dialeto.preambulo(entrada, {contrato, forma});
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

  // **A aridade é do modelo, e a página a diz sozinha.** Cinco flags de
  // `install` acumulam — repetir a flag e separar por vírgula chegam à mesma
  // tupla — e nenhuma página dizia isso. Escrever a frase à mão em dez lugares,
  // em dois locales, é a deriva que este gerador existe para não ter; escrevê-la
  // aqui faz cada `<ParamField>` herdá-la do campo que a declara.
  if (campo.aridade?.multiplo) {
    corpo.push('', rotulo(rotulos, 'aridadeMultipla'));
  }

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
    // A declaração que a cobrança 14 do portão 4 lê. Ela é **obrigatória em toda
    // página gerada**, e não só nas duas que hoje carregam travessão: o
    // `api_exemplos` é projeção do contrato, e uma mensagem de recusa que ganhe
    // travessão amanhã reprovaria uma página que ninguém editou.
    //
    // **Ela entra DEPOIS do `h1`, e não antes.** O plugin `ai-era` reprova no
    // build a página que não abre com `# título`, e o front matter gasta sete
    // linhas — pôr a declaração na nona ainda a deixa dentro das vinte que a
    // cobrança lê.
    //
    // `{/* */}` e não `<!-- -->`: sob MDX 3 o comentário HTML não compila.
    '{/* cita-saida-de-ferramenta */}',
    '',
    `**${rotulo(rotulos, entrada.especie)}** · \`${entrada.qualificado}\``,
    '',
    // O painel — assinatura, argumentos editáveis e snippet — entra AQUI, e a
    // posição é a decisão da #118. Ele era um trilho grudado à direita, o que
    // comutava o layout da página inteira e a deixava com prosa de 577 sem
    // coluna para o TOC.
    //
    // Em fluxo, ele fica **imediatamente depois da linha que nomeia o
    // comando** e antes da prosa, e a ordem tem uma razão: a linha diz *como
    // isto se chama*, e a pergunta seguinte de quem chega numa página de CLI é
    // *como isto se digita*. Pôr a prosa entre as duas obrigaria a rolar dois
    // parágrafos para achar a linha copiável. A prosa explica o que a
    // assinatura já mostrou, e explicar depois de mostrar é a ordem barata.
    //
    // A tag não leva prop: quem carrega os dados é o `api_exemplos` do front
    // matter, lido por `useDoc()`.
    PAINEL,
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
    partes.push('', `## ${rotulo(rotulos, forma.retorno.rotulo)}`, '', ...linhasDoRetorno(entrada, contexto));
  }

  if (forma.erros && (entrada.erros ?? []).length > 0) {
    partes.push('', `## ${rotulo(rotulos, 'erros')}`, '', tabelaDeErros(entrada.erros, contexto));
  }

  return `${partes.join('\n')}\n`;
}

/** As linhas da seção de retorno — a frase, o link, ou a árvore de campos. */
function linhasDoRetorno(entrada, contexto) {
  const {rotulos} = contexto;

  if (!entrada.retorno) {
    // A raiz é a ÚNICA dona da tabela de códigos de saída: os comandos não a
    // repetem, e apontam para ela. Uma raiz sem retorno emitiria a seção com a
    // frase de "não devolve valor" — a página que devia trazer os códigos
    // dizendo que não há códigos, com o diff limpo. Parar aqui é o mesmo
    // remédio do rótulo ausente.
    if (FORMA[entrada.especie].membros) {
      throw new Error(
        `${entrada.id}: a raiz \`${entrada.especie}\` não traz \`retorno\`, e é ela que carrega a tabela para todos os membros.`,
      );
    }
    return [rotulo(rotulos, 'semRetorno')];
  }

  if ((entrada.retorno.campos ?? []).length === 0) {
    return [
      entrada.retorno.entrada === undefined
        ? entrada.retorno.descricao
        : `${entrada.retorno.descricao} ${linkDaEntrada(entrada.retorno.entrada, contexto)}`,
    ];
  }

  const linhas = [entrada.retorno.descricao, ''];
  for (const campo of entrada.retorno.campos) {
    linhas.push(campoMdx(campo, 'ResponseField', contexto, 1), '');
  }
  linhas.pop();
  return linhas;
}

/**
 * O front matter — dois campos de conteúdo, mais o comutador do painel.
 *
 * **O painel deixou de receber um template e passou a receber o modelo.** Até a
 * versão 1 do contrato o campo carregava `snippet.modelo`, uma linha congelada no
 * build com `{{marcadores}}` que o cliente substituía a cada tecla. Um template
 * congelado não sabe dizer *opcional*: apagar o campo produzia `--skill ""`, que
 * não é linha que a CLI aceite. Agora vai o modelo — aridade, mínimo por contexto
 * e restrições — e quem monta a linha é `linha.mjs`, dos dois lados.
 *
 * **A raiz não é montável, e continua sendo linhas.** O que se digita para usar
 * uma CLI é um comando dela: a página da raiz mostra o fluxo dos membros, que é
 * texto estático, e não tem campo a editar.
 */
export function frontMatter(entrada, contexto) {
  const forma = FORMA[entrada.especie];

  const painel = {
    // Derivada, nunca lida do contrato: a `assinatura` escrita à mão era a
    // segunda fonte de verdade sobre a forma do comando, e ela e `parametros`
    // já discordavam da ordem das flags sem que nada pudesse notar.
    assinatura: assinaturaDe(entrada),
    linguagem: DIALETOS[forma.dialeto].linguagem,
  };

  if (forma.membros) {
    painel.linhas = snippetDe(entrada, contexto).split('\n');
  } else {
    painel.modelo = {
      chamada: entrada.chamada ?? entrada.qualificado,
      qualificado: entrada.qualificado,
      // O contexto que a página abre. `sem-terminal` é o que fecha a linha
      // sozinha, e é o que um leitor copiando para um script precisa ver.
      contexto: (entrada.minimo ?? [{contexto: 'sempre'}])[0].contexto,
      parametros: (entrada.parametros ?? []).map((parametro) => ({
        nome: parametro.nome,
        tipo: parametro.tipo,
        aridade: parametro.aridade,
        ...(editavel(parametro) ? {exemplo: String(parametro.exemplo)} : {}),
      })),
      minimo: entrada.minimo ?? [],
      restricoes: entrada.restricoes ?? [],
    };
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
 * página sem escrever no disco. O par de disco existe e o teste o lê, mas ele
 * também monta pares sintéticos para exercitar o que o contrato publicado de
 * propósito não tem — flag booleana, rótulo ausente, raiz sem tabela de saída —,
 * e um teste que tivesse de chamar o gerador inteiro reescreveria o ramo gerado
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

  // **A varredura de órfão só alcança `.mdx`**, e o recorte é o que separa as
  // duas posses agora que elas dividem uma pasta. Com o ADR 9 §d) o ramo gerado
  // ganhou categoria própria, e a folha autoral que a abre, `Comandos › Índice`,
  // mora aqui dentro por decisão: ela é a dona da fixture `painel-direito-vazio`,
  // e o contraste que a fixture prova só existe entre irmãs.
  //
  // Apagar tudo que não foi escrito nesta rodada era correto enquanto a pasta era
  // inteiramente do gerador; agora seria o gerador tomando posse de arquivo que
  // não é dele. A extensão já é o sinal greppável de *gerado, não editar*, e ela
  // é o mesmo teste que o portão 4 usa para contar as duas posses em separado.
  for (const orfao of fs.readdirSync(destino)) {
    if (orfao.endsWith('.mdx') && !escritos.has(orfao)) {
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
    ' * O ramo gerado de `Ferramentas › Bibliotecas › overpower › Comandos` —',
    ' * **fragmento**, não árvore.',
    ' *',
    ' * GERADO por scripts/gerar-referencia.mjs. Não edite à mão: o portão 5 regenera',
    ' * e reprova em `git diff --exit-code`.',
    ' *',
    ' * Ele é uma LISTA DE ITENS DE FOLHA e nada além. A árvore da aba é escrita à',
    ' * mão em `sidebars-ferramentas.js`, que importa esta lista e a espalha dentro',
    ' * da categoria `Comandos` — no nível 4, que é o teto de profundidade desde o',
    ' * ADR 10 §g). Emitir a árvore inteira daria ao gerador a posse da categoria e',
    ' * da folha autoral que a abre, `Comandos › Índice`, que ele não conhece.',
    ' *',
    ' * Cada item carrega `className: \'sidebar-icone sidebar-icone--<chave>\'`,',
    ' * e a chave é a da PRÓPRIA ENTRADA, lida de `icone` no contrato. Ela era a',
    ' * da seção que as hospeda, o que punha o mesmo glifo nas quatro folhas; a',
    ' * #118 trocou por uma chave por página, no ramo inteiro do produto. A regra',
    ' * é a de docs/design/icones.md §8 — *nenhum ícone no separador de topo;',
    ' * ícone em tudo abaixo dele* —, e folha gerada não abre exceção.',
    ' *',
    ' * Procedência: docs/design/referencia.md §5 · docs/design/icones.md §8 ·',
    ' * docs/adr/0009 · docs/adr/0010.',
    ' *',
    ' * @type {import(\'@docusaurus/plugin-content-docs\').SidebarItemConfig[]}',
    ' */',
    'const referencia = [',
    ...contrato.entradas.map(
      (entrada) =>
        `  {type: 'doc', id: '${PREFIXO}/${entrada.id}', className: 'sidebar-icone sidebar-icone--${chaveDeIcone(entrada)}'},`,
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

/**
 * É este arquivo que está sendo executado, ou ele foi importado?
 *
 * **O link simbólico tem de ser resolvido dos dois lados.** `import.meta.url` já
 * vem com o caminho real; `process.argv[1]`, não. Invocado por um symlink, um
 * `path.resolve` cru compara caminho real com caminho de link, decide que não é
 * o comando, e **sai zero sem gerar nada** — e aí o portão 5 regenera o vazio,
 * diffa a saída antiga contra ela mesma e PASSA. É o mesmo buraco de "diff
 * limpo" que o marcador órfão e o rótulo ausente abrem, pela terceira porta.
 */
function ehOComando() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    // `argv[1]` que não existe no disco não é este arquivo.
    return false;
  }
}

// **Só roda quando é o comando, nunca quando é importado.** `npm test` importa
// `corpoMdx` e `frontMatter` daqui para exercitar as formas que o contrato
// publicado não tem; sem esta guarda, um `node --test` reescreveria o ramo
// gerado como efeito colateral de conferir uma string.
if (ehOComando()) {
  principal();
}
