/**
 * O gerador da referência — lê o contrato de assinatura, valida, e escreve as
 * quatro páginas `.mdx` mais o **fragmento** de sidebar que
 * `sidebars-ferramentas.js` importa.
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
 * roda à mão (`npm run generate:reference`), e o portão 5 regenera e reprova em
 * `git diff --exit-code`. Um gerador determinístico rodado duas vezes sobre o
 * mesmo contrato produz bytes idênticos; se não produzir, o contrato mudou sem o
 * gerador rodar, ou alguém editou a saída à mão.
 *
 * **Zero snippet escrito à mão, e desde a #133 zero snippet congelado.** A raiz
 * percorre o `fluxo` dos membros e emite linhas estáticas; a página de um comando
 * não recebe texto nenhum, e sim o MODELO, e quem compõe a linha é `line.mjs`,
 * dos dois lados. Nenhuma das quatro entradas tem snippet próprio, e a
 * `assinatura` também deixou de ser escrita — é a mesma disciplina de
 * zero-segunda-fonte que motivou o gerador inteiro.
 *
 * Uso: node scripts/generate-reference.mjs
 *
 * Procedência: docs/adr/0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md ·
 * docs/design/referencia.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {readContract, validate} from './lib/signature.mjs';
// O modelo de linha vem do MESMO arquivo que o painel lê, e é o que faz a
// assinatura emitida aqui e a linha montada lá não poderem divergir: são a mesma
// função sobre o mesmo campo. Ver o cabeçalho de `line.mjs`.
import {shellQuote, signatureOf} from '../src/theme/MDXComponents/line.mjs';

const CONTRACT_PATH = 'contracts/overpower.json';

const DESTINATION = 'content/ferramentas/bibliotecas/overpower/comandos';

/** O prefixo de id de documento. */
const PREFIX = 'bibliotecas/overpower/comandos';

const FRAGMENT = 'sidebars-referencia.js';

/**
 * A tag do painel, emitida no corpo de toda página gerada.
 *
 * Ela é literal e sem atributo de propósito: serializar o painel como prop
 * dentro do MDX seria uma segunda cópia do `api_exemplos` que o front matter já
 * carrega, e o portão 5 não veria as duas divergirem — ele regenera e diffa a
 * saída contra ela mesma. O componente lê o front matter pela mesma porta que a
 * página, `useDoc()`.
 */
const PANEL = '<CommandPanel />';

/**
 * A chave de ícone de uma folha gerada — e ela passou a ser POR ENTRADA.
 *
 * A história tem três degraus. Enquanto o ramo gerado morava espalhado entre as
 * folhas autorais de uma biblioteca, ele herdava `--bibliotecas`, a família do
 * separador. Com o ADR 9 §d) ganhou categoria própria e passou a `--comandos`, a
 * família da seção — e as quatro páginas viraram uma fileira de quatro linhas
 * com o mesmo glifo, que é exatamente o que a #118 veio desfazer.
 *
 * Hoje **o contrato carrega a chave**, em `entry.icon`. Ela não é dedutível
 * do `id`: `sidebar-icon--install` colidiria com a página autoral `Instalação`
 * do mesmo ramo, e é por isso que o campo é dado e não convenção. O gerador
 * confere que ela existe — uma entrada sem chave sairia com `undefined` no
 * `className`, e o portão 5 diffaria a saída contra ela mesma sem ver nada.
 */
const iconKey = (entry) => {
  if (typeof entry.icon !== 'string' || entry.icon === '') {
    throw new Error(
      `${entry.id}: falta \`icon\` no contrato, e é ele que dá o \`className\` da folha na sidebar.`,
    );
  }
  return entry.icon;
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
export const SHAPE = {
  // A raiz da CLI: as opções globais e a tabela dos códigos de saída que valem
  // para todos os comandos. Ela SEMPRE traz a tabela, porque é o único lugar
  // onde ela mora.
  application: {
    members: 'commands',
    fields: 'globalOptions',
    returnValue: {label: 'exitCodes', always: true},
    errors: true,
    dialect: 'cli',
  },
  // O comando traz código de saída só quando tem um que a raiz não cobre.
  // Repetir os quatro da aplicação em cada página seria a segunda fonte que o
  // gerador inteiro existe para não ter.
  command: {
    members: null,
    fields: 'options',
    returnValue: {label: 'exitCodes', always: false},
    errors: true,
    dialect: 'cli',
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
const editable = (parameter) =>
  typeof parameter.example === 'string' || typeof parameter.example === 'number';

/**
 * O que o parâmetro vale dentro da linha: código cru vence, e o resto vira
 * literal do shell.
 *
 * **A terceira perna saiu com o marcador.** Até a versão 1 do contrato havia um
 * ramo `comPlaceholder` que trocava o valor por `{{nome}}` para o cliente
 * substituir. Quem monta a linha editável agora é `line.mjs`, e as únicas
 * linhas que este arquivo ainda compõe são as da raiz, que são estáticas.
 */
function valueFor(parameter) {
  if (parameter.codeExample !== undefined) {
    return parameter.codeExample;
  }
  return commandLiteral(parameter.example);
}

const hasExample = (parameter) =>
  parameter.example !== undefined || parameter.codeExample !== undefined;

/**
 * Um valor JSON escrito como palavra de uma linha de shell.
 *
 * **O escape vem de `line.mjs`, e não de uma cópia daqui.** As duas linhas que
 * este projeto emite — a de exemplo da raiz, composta no build, e a editada no
 * painel, composta no cliente — precisam escapar igual, e um leitor que copia as
 * duas espera o mesmo texto. Duas cópias da regra divergiriam sem que nenhum
 * portão visse: o 5 regenera e diffa a saída contra ela mesma.
 *
 * O que sobra aqui é a única diferença real: número não leva aspas.
 */
const commandLiteral = (value) =>
  typeof value === 'string' ? shellQuote(value) : String(value);

/**
 * A linha de uso de um comando — `overpower install --from "…"`.
 *
 * **A flag booleana não recebe valor.** `--json true` não é linha que alguém
 * digita; a opção verdadeira entra nua e a falsa não entra. O nome vem inteiro
 * do contrato, traços e tudo, porque é ele que o leitor copia e é ele que o
 * painel usa como chave do marcador.
 */
function commandCall(entry) {
  const options = (entry.parameters ?? []).filter(hasExample).flatMap((parameter) => {
    if (typeof parameter.example === 'boolean') {
      return parameter.example ? [parameter.name] : [];
    }
    return [`${parameter.name} ${valueFor(parameter)}`];
  });
  return [entry.call, ...options].join(' ');
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
const DIALECTS = {
  cli: {
    language: 'bash',
    call: commandCall,
    // Não há o que importar antes de chamar um comando, e uma linha em branco
    // no topo do bloco seria enfeite que o leitor copiaria junto.
    preamble: () => null,
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
function emitChain(entry, porId, vistos, lines, dialect) {
  if (vistos.has(entry.id)) {
    return;
  }
  if (entry.receiver) {
    emitChain(porId.get(entry.receiver), porId, vistos, lines, dialect);
  }
  vistos.add(entry.id);
  lines.push(dialect.call(entry));
}

/**
 * As linhas estáticas da raiz — preâmbulo, receptor e a chamada de cada membro.
 *
 * **Só a raiz passa por aqui.** A página de um comando não tem snippet
 * congelado: ela carrega o modelo, e quem compõe a linha é o painel. A raiz
 * mostra o fluxo dos membros e não a si mesma, porque o que se digita para usar
 * uma CLI é um comando dela — ter membros é ser raiz.
 */
function snippetFor(entry, {contract, porId}) {
  const shape = SHAPE[entry.kind];
  const dialect = DIALECTS[shape.dialect];
  const vistos = new Set();
  const lines = [];

  for (const id of entry.flow ?? []) {
    emitChain(porId.get(id), porId, vistos, lines, dialect);
  }

  const preamble = dialect.preamble(entry, {contract, shape});
  return (preamble === null ? lines : [preamble, '', ...lines]).join('\n');
}

// ---------------------------------------------------------------------------
// MDX
// ---------------------------------------------------------------------------

const attribute = (name, value) => ` ${name}="${String(value).replace(/"/g, '&quot;')}"`;

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
function label(labels, key) {
  const value = labels[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`o contrato não traz o rótulo \`${key}\`, e a seção sairia sem título.`);
  }
  return value;
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
function entryLink(id, {porId, labels}) {
  const target = porId.get(id);
  return `${label(labels, 'seeAlso')} [\`${target.title}\`](./${target.id}.mdx)`;
}

/** Um `<ParamField>`/`<ResponseField>`, com a recursão por `<Expandable>`. */
function fieldMdx(field, tag, context, nivel) {
  const {labels} = context;
  const opening =
    `<${tag}${attribute('name', field.name)}${attribute('type', field.type)}` +
    `${field.defaultValue === undefined ? '' : attribute('default', field.defaultValue)}` +
    `${field.required ? ' required' : ''}${field.deprecated ? ' deprecated' : ''}>`;

  const body = [field.description];

  // **A aridade é do modelo, e a página a diz sozinha.** Cinco flags de
  // `install` acumulam — repetir a flag e separar por vírgula chegam à mesma
  // tupla — e nenhuma página dizia isso. Escrever a frase à mão em dez lugares
  // é a deriva que este gerador existe para não ter; escrevê-la aqui faz cada
  // `<ParamField>` herdá-la do campo que a declara.
  if (field.arity?.multiple) {
    body.push('', label(labels, 'multipleArity'));
  }

  if (field.entry !== undefined) {
    body.push('', entryLink(field.entry, context));
  }

  if ((field.fields ?? []).length > 0) {
    body.push('', `<Expandable${attribute('title', field.type)}${nivel === 1 ? ' defaultOpen' : ''}>`, '');
    for (const filho of field.fields) {
      body.push(fieldMdx(filho, tag, context, nivel + 1), '');
    }
    body.push('</Expandable>');
  }

  return [opening, ...body, `</${tag}>`].join('\n');
}

/** A tabela de erros — `Erro` e `Quando`, nesta ordem. */
function errorsTable(errors, {labels}) {
  return [
    `| ${label(labels, 'errorColumn')} | ${label(labels, 'whenColumn')} |`,
    '| --- | --- |',
    ...errors.map((error) => `| \`${error.name}\` | ${error.when} |`),
  ].join('\n');
}

/**
 * A tabela de membros da raiz — nome, espécie e o resumo da própria entrada.
 *
 * Serve as exportações de um módulo e os comandos de uma aplicação sem saber a
 * diferença: nos dois casos é a raiz apontando para os filhos, e o que muda é o
 * rótulo da seção, que já é dado.
 */
function membersTable(entry, {porId, labels}) {
  return [
    `| ${label(labels, 'nameColumn')} | ${label(labels, 'kindColumn')} | ${label(labels, 'summaryColumn')} |`,
    '| --- | --- | --- |',
    ...entry.exports.map((id) => {
      const target = porId.get(id);
      return `| [\`${target.title}\`](./${id}.mdx) | ${label(labels, target.kind)} | ${target.summary} |`;
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
export function bodyMdx(entry, context) {
  const {labels} = context;
  const shape = SHAPE[entry.kind];
  const parts = [
    `# ${entry.title}`,
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
    `**${label(labels, entry.kind)}** · \`${entry.qualified}\``,
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
    PANEL,
    '',
    entry.description,
  ];

  if (shape.members) {
    parts.push('', `## ${label(labels, shape.members)}`, '', membersTable(entry, context));
  }

  if (shape.fields && (entry.parameters ?? []).length > 0) {
    parts.push('', `## ${label(labels, shape.fields)}`, '');
    for (const parameter of entry.parameters) {
      parts.push(fieldMdx(parameter, 'ParamField', context, 1), '');
    }
    parts.pop();
  }

  if (shape.returnValue && (shape.returnValue.always || entry.returnValue)) {
    parts.push('', `## ${label(labels, shape.returnValue.label)}`, '', ...returnLines(entry, context));
  }

  if (shape.errors && (entry.errors ?? []).length > 0) {
    parts.push('', `## ${label(labels, 'errors')}`, '', errorsTable(entry.errors, context));
  }

  return `${parts.join('\n')}\n`;
}

/** As linhas da seção de retorno — a frase, o link, ou a árvore de campos. */
function returnLines(entry, context) {
  const {labels} = context;

  if (!entry.returnValue) {
    // A raiz é a ÚNICA dona da tabela de códigos de saída: os comandos não a
    // repetem, e apontam para ela. Uma raiz sem retorno emitiria a seção com a
    // frase de "não devolve valor" — a página que devia trazer os códigos
    // dizendo que não há códigos, com o diff limpo. Parar aqui é o mesmo
    // remédio do rótulo ausente.
    if (SHAPE[entry.kind].members) {
      throw new Error(
        `${entry.id}: a raiz \`${entry.kind}\` não traz \`retorno\`, e é ela que carrega a tabela para todos os membros.`,
      );
    }
    return [label(labels, 'noReturn')];
  }

  if ((entry.returnValue.fields ?? []).length === 0) {
    return [
      entry.returnValue.entry === undefined
        ? entry.returnValue.description
        : `${entry.returnValue.description} ${entryLink(entry.returnValue.entry, context)}`,
    ];
  }

  const lines = [entry.returnValue.description, ''];
  for (const field of entry.returnValue.fields) {
    lines.push(fieldMdx(field, 'ResponseField', context, 1), '');
  }
  lines.pop();
  return lines;
}

/**
 * O front matter — dois campos de conteúdo, mais o comutador do painel.
 *
 * **O painel deixou de receber um template e passou a receber o modelo.** Até a
 * versão 1 do contrato o campo carregava `snippet.modelo`, uma linha congelada no
 * build com `{{marcadores}}` que o cliente substituía a cada tecla. Um template
 * congelado não sabe dizer *opcional*: apagar o campo produzia `--skill ""`, que
 * não é linha que a CLI aceite. Agora vai o modelo — aridade, mínimo por contexto
 * e restrições — e quem monta a linha é `line.mjs`, dos dois lados.
 *
 * **A raiz não é montável, e continua sendo linhas.** O que se digita para usar
 * uma CLI é um comando dela: a página da raiz mostra o fluxo dos membros, que é
 * texto estático, e não tem campo a editar.
 */
export function frontMatter(entry, context) {
  const shape = SHAPE[entry.kind];

  const panel = {
    // Derivada, nunca lida do contrato: a `assinatura` escrita à mão era a
    // segunda fonte de verdade sobre a forma do comando, e ela e `parametros`
    // já discordavam da ordem das flags sem que nada pudesse notar.
    signature: signatureOf(entry),
    language: DIALECTS[shape.dialect].language,
  };

  if (shape.members) {
    panel.lines = snippetFor(entry, context).split('\n');
  } else {
    panel.model = {
      call: entry.call ?? entry.qualified,
      qualified: entry.qualified,
      // O contexto em que a página abre o painel: o **primeiro** `minimo` do
      // contrato, e a ordem ali é a decisão. Para `install` ele é `terminal`,
      // porque `overpower install` nu é linha completa num terminal e é a que a
      // maioria digita; a linha de pipe continua no modelo, e o leitor a alcança
      // ligando as flags que ela exige.
      context: (entry.minimum ?? [{context: 'always'}])[0].context,
      parameters: (entry.parameters ?? []).map((parameter) => ({
        name: parameter.name,
        type: parameter.type,
        arity: parameter.arity,
        ...(editable(parameter) ? {example: String(parameter.example)} : {}),
      })),
      minimum: entry.minimum ?? [],
      constraints: entry.constraints ?? [],
    };
  }

  return [
    '---',
    `# GERADO por scripts/generate-reference.mjs a partir de ${context.contractPath}.`,
    '# Não edite à mão: o portão 5 regenera e reprova em `git diff --exit-code`.',
    `title: ${entry.title}`,
    `description: ${entry.summary}`,
    `api_exemplos: ${JSON.stringify(panel)}`,
    '---',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

/**
 * O contexto de emissão — o contrato, indexado por id.
 *
 * Ele sai de `writeDocs` porque a régua de máquina precisa emitir uma
 * página sem escrever no disco. O par de disco existe e o teste o lê, mas ele
 * também monta pares sintéticos para exercitar o que o contrato publicado de
 * propósito não tem — flag booleana, rótulo ausente, raiz sem tabela de saída —,
 * e um teste que tivesse de chamar o gerador inteiro reescreveria o ramo gerado
 * para conferir uma string.
 */
export function contextFor(contract, contractPath) {
  return {
    contract,
    contractPath,
    labels: contract.labels,
    porId: new Map(contract.entries.map((entry) => [entry.id, entry])),
  };
}

/** Escreve o diretório inteiro e apaga o `.mdx` que sobrou de um contrato anterior. */
function writeDocs(contract) {
  const context = contextFor(contract, CONTRACT_PATH);
  const destination = DESTINATION;
  fs.mkdirSync(destination, {recursive: true});

  const written = new Set();
  for (const entry of contract.entries) {
    const file = `${entry.id}.mdx`;
    written.add(file);
    fs.writeFileSync(
      path.join(destination, file),
      `${frontMatter(entry, context)}\n\n${bodyMdx(entry, context)}`,
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
  for (const orphan of fs.readdirSync(destination)) {
    if (orphan.endsWith('.mdx') && !written.has(orphan)) {
      fs.rmSync(path.join(destination, orphan), {recursive: true});
    }
  }
  return written.size;
}

/** O fragmento — uma lista de itens de folha, e nada além. Quem monta a árvore é
 * a sidebar da aba. */
function writeFragment(contract) {
  const lines = [
    '// @ts-check',
    '',
    '/**',
    ' * O ramo gerado de `Ferramentas › Bibliotecas › overpower › Comandos` —',
    ' * **fragmento**, não árvore.',
    ' *',
    ' * GERADO por scripts/generate-reference.mjs. Não edite à mão: o portão 5 regenera',
    ' * e reprova em `git diff --exit-code`.',
    ' *',
    ' * Ele é uma LISTA DE ITENS DE FOLHA e nada além. A árvore da aba é escrita à',
    ' * mão em `sidebars-ferramentas.js`, que importa esta lista e a espalha dentro',
    ' * da categoria `Comandos` — no nível 4, que é o teto de profundidade desde o',
    ' * ADR 10 §g). Emitir a árvore inteira daria ao gerador a posse da categoria e',
    ' * da folha autoral que a abre, `Comandos › Índice`, que ele não conhece.',
    ' *',
    ' * Cada item carrega `className: \'sidebar-icon sidebar-icon--<chave>\'`,',
    ' * e a chave é a da PRÓPRIA ENTRADA, lida de `icon` no contrato. Ela era a',
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
    ...contract.entries.map(
      (entry) =>
        `  {type: 'doc', id: '${PREFIX}/${entry.id}', className: 'sidebar-icon sidebar-icon--${iconKey(entry)}'},`,
    ),
    '];',
    '',
    'export default referencia;',
    '',
  ];
  fs.writeFileSync(FRAGMENT, lines.join('\n'));
}

// ---------------------------------------------------------------------------

function main() {
  let contract;
  try {
    contract = readContract(CONTRACT_PATH);
  } catch (error) {
    console.error(`RECUSADO ${error.refusal} em "${error.pointer}" — ${error.message}`);
    process.exit(1);
  }

  const refusals = validate(contract);
  if (refusals.length > 0) {
    console.error(`O contrato foi RECUSADO em ${refusals.length} ponto(s):`);
    for (const {refusal, pointer, detail} of refusals) {
      console.error(`  ${refusal}  em "${pointer}"`);
      console.error(`    ${detail}`);
    }
    process.exit(1);
  }

  const written = writeDocs(contract);
  writeFragment(contract);

  console.log(`Referência gerada — ${written} página(s) · ${FRAGMENT}`);
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
function isTheCommand() {
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
// `bodyMdx` e `frontMatter` daqui para exercitar as formas que o contrato
// publicado não tem; sem esta guarda, um `node --test` reescreveria o ramo
// gerado como efeito colateral de conferir uma string.
if (isTheCommand()) {
  main();
}
