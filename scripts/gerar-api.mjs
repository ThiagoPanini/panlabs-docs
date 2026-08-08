#!/usr/bin/env node
/**
 * O gerador da Referência da API.
 *
 * **Script fora do build, rodado à mão.** Nenhuma linha dele entra no
 * `docusaurus.config.js`. A saída — as 24 páginas `.mdx` geradas e
 * `sidebars-api.js` — é **commitada**, entra no diff, e o `api` a lê como
 * qualquer outra instância lê MDX. `npm run portao:5` roda este script de
 * novo em CI e reprova em `git diff --exit-code`: divergência entre contrato
 * e páginas reprova o build.
 *
 * Fonte única: os dois contratos em `contratos/`. Zero dependência —
 * `JSON.parse` é o parser inteiro, e é por isso que o contrato é `.json` e
 * não `.yaml`. O validador (`scripts/lib/openapi.mjs`) roda antes de
 * qualquer escrita: contrato inválido não produz página nenhuma, só erro com
 * o JSON Pointer do nó ofensor.
 *
 * O que este script NUNCA emite no corpo da página: cerca de código. Na
 * página de endpoint todo bloco vive no painel (front matter
 * `api_exemplos`, lido por `src/theme/ApiDocItem`), então não existe
 * breakout aqui — é a décima perda nomeada da rota, e ela é estrutural, não
 * esquecimento.
 *
 * Procedência: docs/design/api-reference.md · issue #38.
 */
import {readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {lerContrato, validarContrato, verificarCongruencia} from './lib/openapi.mjs';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const DIR_PT = join(RAIZ, 'conteudo/api-reference');
const DIR_EN = join(RAIZ, 'i18n/en/docusaurus-plugin-content-docs-api/current');
const ARQUIVO_SIDEBAR = join(RAIZ, 'sidebars-api.js');
const LINGUAGENS_DE_SNIPPET = ['bash', 'python', 'javascript'];

// ---------------------------------------------------------------------------
// 1. Carrega a config do site (só para `additionalLanguages` — nenhuma outra
//    chave é lida, e o gerador não escreve nela).
// ---------------------------------------------------------------------------
const configUrl = pathToFileURL(join(RAIZ, 'docusaurus.config.js')).href;
const {default: config} = await import(configUrl);
const linguagensAdicionais = config.themeConfig?.prism?.additionalLanguages ?? [];

// ---------------------------------------------------------------------------
// 2. Lê e valida os dois contratos, e confere a congruência entre eles.
// ---------------------------------------------------------------------------
const textoPt = readFileSync(join(RAIZ, 'contratos/trilho.pt-BR.json'), 'utf8');
const textoEn = readFileSync(join(RAIZ, 'contratos/trilho.en.json'), 'utf8');
const docs = {
  'pt-BR': lerContrato(textoPt, 'trilho.pt-BR.json'),
  en: lerContrato(textoEn, 'trilho.en.json'),
};

validarContrato(docs['pt-BR'], {nomeArquivo: 'trilho.pt-BR.json', linguagensDeSnippet: LINGUAGENS_DE_SNIPPET, linguagensAdicionais});
validarContrato(docs.en, {nomeArquivo: 'trilho.en.json', linguagensDeSnippet: LINGUAGENS_DE_SNIPPET, linguagensAdicionais});
verificarCongruencia(docs['pt-BR'], docs.en, {nomeA: 'trilho.pt-BR.json', nomeB: 'trilho.en.json'});
console.log('contratos válidos e congruentes.');

// ---------------------------------------------------------------------------
// 3. Metadados de recurso — a única ponte entre a tag do contrato (natureza
//    da operação) e a árvore de informação do site (pasta, ícone, o
//    namespace do SDK fictício nos snippets). Fora daqui nada no gerador
//    conhece nome de pasta.
// ---------------------------------------------------------------------------
const RECURSOS = [
  {tag: 'Cobranças', pasta: 'cobrancas', schema: 'Cobranca', slugObjeto: 'objeto-cobranca', tituloObjeto: {'pt-BR': 'O objeto Cobrança', en: 'The Cobrança object'}},
  {tag: 'Clientes', pasta: 'clientes', schema: 'Cliente', slugObjeto: 'objeto-cliente', tituloObjeto: {'pt-BR': 'O objeto Cliente', en: 'The Cliente object'}},
  {tag: 'Assinaturas', pasta: 'assinaturas', schema: 'Assinatura', slugObjeto: 'objeto-assinatura', tituloObjeto: {'pt-BR': 'O objeto Assinatura', en: 'The Assinatura object'}},
  {tag: 'Reembolsos', pasta: 'reembolsos', schema: 'Reembolso', slugObjeto: 'objeto-reembolso', tituloObjeto: {'pt-BR': 'O objeto Reembolso', en: 'The Reembolso object'}},
  {tag: 'Eventos', pasta: 'webhooks', schema: 'Evento', slugObjeto: 'objeto-evento', tituloObjeto: {'pt-BR': 'O objeto Evento', en: 'The Evento object'}},
];
const recursoPorTag = Object.fromEntries(RECURSOS.map((r) => [r.tag, r]));

// As folhas autorais que não vêm do contrato — o gerador é quem monta a
// árvore inteira da instância `api`, então ele precisa saber onde elas
// entram. Escritas à mão em `conteudo/api-reference/**` (task #4), lidas
// aqui só pelo `id` de doc.
const INTRODUCAO_AUTORAL = ['introducao/visao-geral', 'introducao/autenticacao', 'introducao/url-base-e-versao', 'introducao/erros', 'introducao/idempotencia'];
const WEBHOOKS_CATALOGO = 'webhooks/catalogo-de-eventos';

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------
function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Front matter YAML — cada valor via JSON.stringify, que é sempre YAML de
 * fluxo válido (JSON é subconjunto de YAML). Evita depender de um emissor de
 * YAML — zero dependência — sem arriscar escapes errados em texto livre. */
function frontMatter(campos) {
  const linhas = Object.entries(campos)
    .filter(([, v]) => v !== undefined)
    .map(([chave, valor]) => `${chave}: ${JSON.stringify(valor)}`);
  return ['---', '# gerado por scripts/gerar-api.mjs — não editar à mão', ...linhas, '---', '', ''].join('\n');
}

function resolverRef(doc, ref) {
  const partes = ref.replace(/^#\//, '').split('/');
  let alvo = doc;
  for (const parte of partes) alvo = alvo?.[parte];
  return alvo;
}

function resolver(doc, schema) {
  return schema?.$ref ? resolver(doc, resolverRef(doc, schema.$ref)) : schema;
}

const NOME_TIPO = {'pt-BR': {array: 'array de'}, en: {array: 'array of'}};

function tipoLegivel(schema, doc, locale) {
  const tipos = Array.isArray(schema.type) ? schema.type.filter((t) => t !== 'null') : [schema.type];
  const tipo = tipos[0];
  if (tipo === 'array') {
    const doItem = schema.items ? tipoLegivel(resolver(doc, schema.items), doc, locale) : 'unknown';
    return `${NOME_TIPO[locale].array} ${doItem}`;
  }
  return tipo ?? 'object';
}

const ROTULO_VALORES = {'pt-BR': 'Valores possíveis', en: 'Possible values'};

/** Constrói a árvore `<ParamField>`/`<ResponseField>` + `<Expandable>` de um
 * schema de objeto — a mesma anatomia que `conteudo/documentacao/meios-de-
 * pagamento/cartao.md` já escreve à mão para `cobranca.pagamento.cartao.
 * verificacoes`. Só o primeiro nível de aninhamento nasce `defaultOpen`. */
function emitirCampos(schema, doc, locale, {especie, obrigatorios = new Set(), nivel = 1} = {}) {
  const Componente = especie === 'param' ? 'ParamField' : 'ResponseField';
  let saida = '';
  for (const [nome, bruto] of Object.entries(schema.properties ?? {})) {
    const prop = resolver(doc, bruto);
    const tipo = tipoLegivel(prop, doc, locale);
    const atributos = [`name="${nome}"`, `type="${tipo}"`];
    if (especie === 'param' && obrigatorios.has(nome)) atributos.push('required');
    if (prop.default !== undefined) atributos.push(`default="${prop.default}"`);

    let descricao = prop.description ?? '';
    if (prop.enum) {
      descricao += `\n\n${ROTULO_VALORES[locale]}: ${prop.enum.map((v) => `\`${v}\``).join(', ')}.`;
    }

    const tipoBase = Array.isArray(prop.type) ? prop.type.filter((t) => t !== 'null')[0] : prop.type;
    const ehArray = tipoBase === 'array';
    // Um $ref para um schema NOMEADO reseta o nível para 1, pela mesma razão
    // do validador: `Cobranca` embutido direto (`GET /cobrancas/{id}`) e
    // `Cobranca` dentro do array `dados` de uma listagem são a MESMA forma, e
    // o campo `pagamento` dela precisa nascer `defaultOpen` nas duas — senão
    // o mesmo campo lê diferente em duas páginas por acidente de onde foi
    // embutido, não por diferença real de estrutura.
    const refDoFilho = ehArray ? bruto.items?.$ref : bruto.$ref;
    const filhos = tipoBase === 'object' ? prop.properties : ehArray ? resolver(doc, prop.items ?? {})?.properties : undefined;
    const schemaFilhos = tipoBase === 'object' ? prop : resolver(doc, prop.items ?? {});
    const proximoNivel = refDoFilho ? 1 : nivel + 1;

    saida += `<${Componente} ${atributos.join(' ')}>\n${descricao}\n`;
    if (filhos && Object.keys(filhos).length > 0) {
      const rotulo = ehArray
        ? locale === 'pt-BR' ? `cada item de ${nome}` : `each item of ${nome}`
        : locale === 'pt-BR' ? `objeto ${nome}` : `${nome} object`;
      saida += `\n<Expandable title="${rotulo}"${nivel === 1 ? ' defaultOpen' : ''}>\n\n`;
      saida += emitirCampos(schemaFilhos, doc, locale, {especie, obrigatorios: new Set(schemaFilhos.required ?? []), nivel: proximoNivel}).trimEnd();
      saida += `\n\n</Expandable>\n`;
    }
    saida += `</${Componente}>\n\n`;
  }
  return saida;
}

/** Uma amostra de valor para um schema — usada quando a resposta não declara
 * `example` explícito (as de erro, e os envelopes de listagem). Prefere o
 * `example` de cada propriedade; sem ele, um valor plausível do tipo. */
function amostrar(schema, doc, profundidade = 0) {
  if (profundidade > 6 || !schema) return null;
  const s = resolver(doc, schema);
  if (s.example !== undefined) return s.example;
  const tipos = Array.isArray(s.type) ? s.type.filter((t) => t !== 'null') : [s.type];
  const tipo = tipos[0];
  if (tipo === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(s.properties ?? {})) out[k] = amostrar(v, doc, profundidade + 1);
    return out;
  }
  if (tipo === 'array') return s.items ? [amostrar(s.items, doc, profundidade + 1)] : [];
  if (s.enum) return s.enum[0];
  if (tipo === 'integer' || tipo === 'number') return 0;
  if (tipo === 'boolean') return true;
  return s.format === 'date-time' ? '2026-08-07T18:12:04Z' : 'string';
}

// ---------------------------------------------------------------------------
// Os três templates de snippet — todos derivados de método, caminho,
// parâmetros e `requestBody.example`. Nenhum é escrito à mão por operação:
// dezenove operações com snippet hand-rolado é exatamente a segunda fonte de
// verdade que este gerador existe para não ter.
// ---------------------------------------------------------------------------
function acaoDe(operationId) {
  return operationId.match(/^(criar|listar|obter|atualizar|remover|cancelar|capturar)/)[1];
}

function curlSnippet(caminho, metodo, operacao) {
  const params = operacao.parameters ?? [];
  const doPath = params.filter((p) => p.in === 'path');
  const daQuery = params.filter((p) => p.in === 'query');
  const doHeader = params.filter((p) => p.in === 'header');

  let rota = caminho;
  for (const p of doPath) rota = rota.replace(`{${p.name}}`, `{{${p.name}}}`);
  let url = `https://api.trilho.dev/v1${rota}`;
  if (daQuery.length) url += '?' + daQuery.map((q) => `${q.name}={{${q.name}}}`).join('&');

  const linhas = [`curl ${url} \\`, `  -X ${metodo.toUpperCase()} \\`, `  -H "Authorization: Bearer $TRILHO_API_KEY"`];
  for (const h of doHeader) {
    linhas[linhas.length - 1] += ' \\';
    linhas.push(`  -H "${h.name}: <${slugify(h.name)}>"`);
  }
  const corpo = operacao.requestBody?.content?.['application/json']?.example;
  if (corpo) {
    linhas[linhas.length - 1] += ' \\';
    linhas.push('  -H "Content-Type: application/json" \\');
    linhas.push(`  -d '${JSON.stringify(corpo)}'`);
  }
  return linhas.join('\n');
}

function valorLiteral(linguagem, v) {
  if (v && typeof v === 'object' && '__espacoReservado' in v) {
    return `'{{${v.__espacoReservado}}}'`;
  }
  if (v === null) return linguagem === 'python' ? 'None' : 'null';
  if (Array.isArray(v)) return '[' + v.map((x) => valorLiteral(linguagem, x)).join(', ') + ']';
  if (typeof v === 'object') {
    const chave = (k) => (linguagem === 'python' ? `'${k}'` : /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`);
    const separador = linguagem === 'python' ? ': ' : ': ';
    return '{' + Object.entries(v).map(([k, val]) => `${chave(k)}${separador}${valorLiteral(linguagem, val)}`).join(', ') + '}';
  }
  if (typeof v === 'boolean') return linguagem === 'python' ? (v ? 'True' : 'False') : String(v);
  if (typeof v === 'number') return String(v);
  return `'${v}'`;
}

function chamadaSdk(linguagem, recurso, operacao) {
  const acao = acaoDe(operacao.operationId);
  const params = operacao.parameters ?? [];
  const doPath = params.filter((p) => p.in === 'path');
  const daQuery = params.filter((p) => p.in === 'query');
  const corpo = operacao.requestBody?.content?.['application/json']?.example ?? null;

  const posicionais = doPath.map((p) => `'{{${p.name}}}'`);

  let objArg = null;
  if (daQuery.length) {
    objArg = {};
    for (const q of daQuery) objArg[q.name] = {__espacoReservado: q.name};
  } else if (corpo && typeof corpo === 'object') {
    objArg = corpo;
  }

  const args = [...posicionais];
  if (objArg) args.push(valorLiteral(linguagem, objArg));

  const chamada = `trilho.${recurso.pasta}.${acao}(${args.join(', ')})`;
  return linguagem === 'javascript' ? `await ${chamada};` : chamada;
}

function gerarExemplos(caminho, metodo, operacao, recurso) {
  return [
    {linguagem: 'bash', titulo: 'cURL', modelo: curlSnippet(caminho, metodo, operacao)},
    {linguagem: 'python', titulo: 'Python', modelo: chamadaSdk('python', recurso, operacao)},
    {linguagem: 'javascript', titulo: 'JavaScript', modelo: chamadaSdk('javascript', recurso, operacao)},
  ];
}

// ---------------------------------------------------------------------------
// 4. As páginas de endpoint.
// ---------------------------------------------------------------------------
const CABECALHO_SECAO = {'pt-BR': {parametros: 'Parâmetros', corpo: 'Corpo', resposta: 'Resposta', erros: 'Erros'}, en: {parametros: 'Parameters', corpo: 'Body', resposta: 'Response', erros: 'Errors'}};
const SEM_CORPO = {'pt-BR': 'Sem corpo.', en: 'No body.'};
const TABELA_ERROS_CABECALHO = {'pt-BR': ['Status', 'Quando'], en: ['Status', 'When']};

/** O corpo de exemplo de cada status de erro no painel — por status, não o
 * mesmo texto do schema `Erro` repetido em toda aba. Uma mensagem de
 * "chave de idempotência reusada" debaixo da aba `401` seria exatamente o
 * fato cruzado que este projeto já reprovou em revisão antes: o mock
 * precisa condizer com o status que ele ilustra. */
const EXEMPLO_ERRO_POR_STATUS = {
  400: {'pt-BR': {codigo: 'requisicao_invalida', mensagem: 'A requisição não é válida contra o contrato.'}, en: {codigo: 'requisicao_invalida', mensagem: 'The request is not valid against the contract.'}},
  401: {'pt-BR': {codigo: 'chave_invalida', mensagem: 'A chave está ausente, é inválida, ou é de outro ambiente.'}, en: {codigo: 'chave_invalida', mensagem: 'The key is missing, invalid, or from another environment.'}},
  404: {'pt-BR': {codigo: 'recurso_nao_encontrado', mensagem: 'O recurso não existe nesta conta.'}, en: {codigo: 'recurso_nao_encontrado', mensagem: 'The resource does not exist on this account.'}},
  409: {'pt-BR': {codigo: 'conflito_de_estado', mensagem: 'O recurso não está num estado que aceite esta operação.'}, en: {codigo: 'conflito_de_estado', mensagem: 'The resource is not in a state that accepts this operation.'}},
  422: {'pt-BR': {codigo: 'valores_invalidos', mensagem: 'A requisição é válida e os valores não são.', detalhes: [{campo: 'valor', motivo: 'deve ser maior que zero'}]}, en: {codigo: 'valores_invalidos', mensagem: 'The request is valid and the values are not.', detalhes: [{campo: 'valor', motivo: 'must be greater than zero'}]}},
  429: {'pt-BR': {codigo: 'limite_de_taxa_excedido', mensagem: 'Limite de taxa excedido. O cabeçalho diz quantas chamadas sobram.'}, en: {codigo: 'limite_de_taxa_excedido', mensagem: 'Rate limit exceeded. The header says how many calls remain.'}},
};

function paginaEndpoint(caminho, metodo, operacao, recurso, doc, locale) {
  const params = operacao.parameters ?? [];
  const doPath = params.filter((p) => p.in === 'path');
  const daQuery = params.filter((p) => p.in === 'query');
  const doHeader = params.filter((p) => p.in === 'header');

  const linhas = [`# ${operacao.summary}`, '', `<VerbBadge verb="${metodo.toUpperCase()}" /> \`${caminho}\``, '', operacao.description, ''];

  if (doPath.length || daQuery.length || doHeader.length) {
    linhas.push(`## ${CABECALHO_SECAO[locale].parametros}`, '');
    for (const p of [...doPath, ...daQuery, ...doHeader]) {
      const atributos = [`name="${p.name}"`, `type="${p.schema.type ?? 'string'}"`];
      if (p.required) atributos.push('required');
      if (p.schema.default !== undefined) atributos.push(`default="${p.schema.default}"`);
      linhas.push(`<ParamField ${atributos.join(' ')}>`, p.description, `</ParamField>`, '');
    }
  }

  if (operacao.requestBody) {
    const schemaCorpo = operacao.requestBody.content['application/json'].schema;
    linhas.push(`## ${CABECALHO_SECAO[locale].corpo}`, '', emitirCampos(resolver(doc, schemaCorpo), doc, locale, {especie: 'param', obrigatorios: new Set(resolver(doc, schemaCorpo).required ?? [])}).trimEnd(), '');
  }

  const entradasResposta = Object.entries(operacao.responses);
  const [statusPrincipal, respostaPrincipal] = entradasResposta.find(([s]) => s.startsWith('2')) ?? entradasResposta[0];
  linhas.push(`## ${CABECALHO_SECAO[locale].resposta}`, '');
  const schemaResposta = respostaPrincipal.content?.['application/json']?.schema;
  if (schemaResposta) {
    linhas.push(emitirCampos(resolver(doc, schemaResposta), doc, locale, {especie: 'response'}).trimEnd(), '');
  } else {
    linhas.push(SEM_CORPO[locale], '');
  }

  const errosDocumentados = entradasResposta.filter(([s]) => s !== statusPrincipal);
  if (errosDocumentados.length) {
    linhas.push(`## ${CABECALHO_SECAO[locale].erros}`, '');
    const [cabStatus, cabQuando] = TABELA_ERROS_CABECALHO[locale];
    linhas.push(`| ${cabStatus} | ${cabQuando} |`, '| --- | --- |');
    for (const [status, resposta] of errosDocumentados) {
      linhas.push(`| \`${status}\` | ${resposta.description} |`);
    }
    linhas.push('');
  }

  const apiExemplos = {
    metodo: metodo.toUpperCase(),
    caminho,
    parametros: [...doPath, ...daQuery].map((p) => ({nome: p.name, em: p.in, exemplo: String(p.schema.example ?? p.schema.default ?? '')})),
    exemplos: gerarExemplos(caminho, metodo, operacao, recurso),
    respostas: entradasResposta.slice(0, 4).map(([status, resposta]) => ({
      status,
      titulo: status,
      corpo:
        resposta.content?.['application/json']?.example ??
        EXEMPLO_ERRO_POR_STATUS[status]?.[locale] ??
        (resposta.content ? amostrar(resposta.content['application/json'].schema, doc) : null),
    })),
  };

  const front = frontMatter({
    title: operacao.summary,
    description: operacao.description,
    sidebar_class_name: `api-metodo api-metodo--${metodo}`,
    api_exemplos: apiExemplos,
  });

  return front + linhas.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// 5. As páginas "O objeto X".
// ---------------------------------------------------------------------------
const INTRO_OBJETO = {
  'pt-BR': (nome) => `A forma completa de \`${nome}\`, como qualquer endpoint desta seção a devolve.`,
  en: (nome) => `The complete shape of \`${nome}\`, as any endpoint in this section returns it.`,
};

function paginaObjeto(recurso, doc, locale) {
  const schema = doc.components.schemas[recurso.schema];
  const titulo = recurso.tituloObjeto[locale];
  const linhas = [`# ${titulo}`, '', schema.description, '', INTRO_OBJETO[locale](recurso.schema), '', emitirCampos(schema, doc, locale, {especie: 'response'}).trimEnd(), ''];
  const front = frontMatter({title: titulo, description: schema.description});
  return front + linhas.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// 6. Escreve os arquivos — limpa o que o gerador possui antes de reescrever,
//    para que um recurso removido do contrato não deixe página órfã. Só os
//    arquivos `.mdx` são tocados: as folhas autorais de `webhooks/` (o
//    catálogo de eventos) e de `introducao/` são `.md`, e este laço nunca as
//    enxerga.
// ---------------------------------------------------------------------------
function escrever(caminhoAbs, conteudo) {
  mkdirSync(dirname(caminhoAbs), {recursive: true});
  writeFileSync(caminhoAbs, conteudo);
}

function limparGerado(dir) {
  for (const recurso of RECURSOS) {
    const pasta = join(dir, recurso.pasta);
    if (!existsSync(pasta)) continue;
    for (const nome of readdirSync(pasta)) {
      if (nome.endsWith('.mdx')) rmSync(join(pasta, nome));
    }
  }
}
limparGerado(DIR_PT);
limparGerado(DIR_EN);

// ---------------------------------------------------------------------------
// 7. Gera as 24 páginas — 5 "O objeto X" + 19 de endpoint — nos dois
//    locales, e agrupa os ids de doc por recurso para montar a sidebar.
// ---------------------------------------------------------------------------
const DIR_POR_LOCALE = {'pt-BR': DIR_PT, en: DIR_EN};
const idsPorRecurso = Object.fromEntries(RECURSOS.map((r) => [r.tag, []]));

for (const recurso of RECURSOS) {
  for (const locale of ['pt-BR', 'en']) {
    const doc = docs[locale];
    const conteudo = paginaObjeto(recurso, doc, locale);
    escrever(join(DIR_POR_LOCALE[locale], recurso.pasta, `${recurso.slugObjeto}.mdx`), conteudo);
  }
}

let contagemEndpoints = 0;
for (const [caminho, item] of Object.entries(docs['pt-BR'].paths)) {
  for (const metodo of Object.keys(item)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(metodo)) continue;
    contagemEndpoints += 1;
    const tag = item[metodo].tags[0];
    const recurso = recursoPorTag[tag];
    if (!recurso) throw new Error(`Operação "${item[metodo].operationId}" tem a tag "${tag}", sem recurso mapeado em RECURSOS.`);

    let slugPt;
    for (const locale of ['pt-BR', 'en']) {
      const operacao = docs[locale].paths[caminho][metodo];
      const slug = locale === 'pt-BR' ? slugify(operacao.summary) : slugPt;
      if (locale === 'pt-BR') slugPt = slug;
      const conteudo = paginaEndpoint(caminho, metodo, operacao, recurso, docs[locale], locale);
      escrever(join(DIR_POR_LOCALE[locale], recurso.pasta, `${slug}.mdx`), conteudo);
    }
    idsPorRecurso[tag].push(`${recurso.pasta}/${slugPt}`);
  }
}

// ---------------------------------------------------------------------------
// 8. `sidebars-api.js` — a árvore inteira da instância, 6 categorias.
//    Introdução e Webhooks intercalam folha autoral com folha gerada; as
//    outras quatro são só folha gerada. O `className` de ícone reusa os
//    doze pares já vendorizados em `src/icons/manifest.js`.
// ---------------------------------------------------------------------------
function categoria(label, pasta, linkId, items) {
  return {type: 'category', label, className: `sidebar-icone sidebar-icone--${pasta}`, collapsed: false, link: {type: 'doc', id: linkId}, items};
}

const categorias = [
  categoria('Introdução', 'introducao', INTRODUCAO_AUTORAL[0], INTRODUCAO_AUTORAL.slice(1)),
  ...RECURSOS.filter((r) => r.tag !== 'Eventos').map((r) => categoria(r.tag, r.pasta, `${r.pasta}/${r.slugObjeto}`, idsPorRecurso[r.tag])),
];

const eventos = recursoPorTag.Eventos;
categorias.push(categoria('Webhooks', 'webhooks', `webhooks/${eventos.slugObjeto}`, [WEBHOOKS_CATALOGO, ...idsPorRecurso.Eventos]));

const sidebarJs = `// @ts-check

/**
 * A sidebar da tab \`Referência da API\` — instância \`api\`.
 *
 * **Este arquivo é gerado.** \`scripts/gerar-api.mjs\` o emite a partir dos
 * dois contratos em \`contratos/\` mais o pequeno manifesto de folhas
 * autorais que o próprio gerador conhece (Introdução e o catálogo de
 * eventos). Editar à mão é a segunda fonte de verdade que o gerador existe
 * para impedir — o portão 5 roda o gerador de novo em CI e reprova em
 * \`git diff --exit-code\`.
 *
 * A árvore fechada é **6 · 0 · 6**: seis categorias de topo, as mesmas seis
 * regras da tab \`Documentação\`, e os mesmos doze pares seção→ícone.
 *
 * Procedência: docs/design/informacao.md · docs/design/api-reference.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  api: ${JSON.stringify(categorias, null, 2).replace(/\n/g, '\n  ')},
};

export default sidebars;
`;

writeFileSync(ARQUIVO_SIDEBAR, sidebarJs);

console.log(`gerado: ${RECURSOS.length} páginas "O objeto X" × 2 locales, ${contagemEndpoints} páginas de endpoint × 2 locales, e sidebars-api.js.`);
