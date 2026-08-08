/**
 * O validador do contrato — recusa alta, com JSON Pointer do nó ofensor.
 *
 * Zero dependência: JSON.parse é o parser inteiro. É por isso que o contrato
 * é `.json` e não `.yaml` — aceitar YAML custaria uma dependência para
 * comprar o que este projeto não precisa, e a recusa de YAML abaixo é
 * consequência dessa escolha, não capricho.
 *
 * Falha sempre com o JSON Pointer do nó ofensor (RFC 6901). Nunca ignora em
 * silêncio — cada regra abaixo é uma das reprovações do contrato de #38.
 *
 * Procedência: docs/design/api-reference.md · issue #38.
 */

/** Erro de validação com o JSON Pointer do nó que reprovou. */
export class ErroDeValidacao extends Error {
  constructor(mensagem, ponteiro) {
    super(`${mensagem}\n  em ${ponteiro || '/'}`);
    this.name = 'ErroDeValidacao';
    this.ponteiro = ponteiro;
  }
}

/** RFC 6901 — `~` vira `~0`, `/` vira `~1`. */
function ponteiro(caminho) {
  return '/' + caminho.map((s) => String(s).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
}

/**
 * Lê e faz o parse de um contrato a partir de texto bruto. Recusa qualquer
 * coisa que não seja JSON — é a única forma de "recusar YAML" que faz
 * sentido quando o parser inteiro é `JSON.parse`: um documento YAML que não
 * seja também JSON válido (a esmagadora maioria) já cai aqui.
 */
export function lerContrato(texto, nomeArquivo) {
  try {
    return JSON.parse(texto);
  } catch (erroOriginal) {
    throw new ErroDeValidacao(
      [
        `"${nomeArquivo}" não é JSON válido — o contrato recusa YAML e qualquer outro formato.`,
        `Detalhe do parser: ${erroOriginal.message}`,
      ].join('\n  '),
      '/',
    );
  }
}

const LINGUAGENS_PADRAO_PRISM = new Set(['javascript', 'python', 'json']);

/**
 * Valida um contrato já parseado. `opts.linguagensAdicionais` é a lista de
 * `themeConfig.prism.additionalLanguages` do site — é contra ela que a
 * última regra confere linguagem de snippet.
 */
export function validarContrato(doc, {nomeArquivo, linguagensDeSnippet = [], linguagensAdicionais = []} = {}) {
  const contexto = {nomeArquivo};

  // --- Swagger 2.0 e versão do OpenAPI ---------------------------------------
  if (doc.swagger) {
    throw new ErroDeValidacao(`Swagger 2.0 é recusado — este contrato precisa ser OpenAPI 3.1.`, ponteiro(['swagger']));
  }
  if (typeof doc.openapi !== 'string' || !/^3\.1\.\d+$/.test(doc.openapi)) {
    throw new ErroDeValidacao(`"openapi" precisa ser "3.1.x" — encontrado ${JSON.stringify(doc.openapi)}.`, ponteiro(['openapi']));
  }

  // --- webhooks (objeto de topo do 3.1) e callbacks (por operação) ----------
  if (doc.webhooks) {
    throw new ErroDeValidacao('O objeto de topo "webhooks" é recusado — este contrato não os modela.', ponteiro(['webhooks']));
  }

  // --- description obrigatória em toda operação, parâmetro e schema --------
  function exigirDescricao(node, caminho, rotulo) {
    if (!node || typeof node.description !== 'string' || node.description.trim() === '') {
      throw new ErroDeValidacao(`${rotulo} sem "description".`, ponteiro(caminho));
    }
  }

  // --- $ref: só interno --------------------------------------------------
  function conferirRef(valor, caminho) {
    if (!valor.startsWith('#/')) {
      throw new ErroDeValidacao(`"$ref" externo é recusado: "${valor}". Só ponteiros internos ("#/...") são aceitos.`, ponteiro(caminho));
    }
  }

  function resolverRef(valor) {
    const partes = valor.replace(/^#\//, '').split('/');
    let alvo = doc;
    for (const parte of partes) alvo = alvo?.[parte.replace(/~1/g, '/').replace(/~0/g, '~')];
    return alvo;
  }

  // --- multipart/form-data e upload ---------------------------------------
  function conferirContentTypes(content, caminho) {
    for (const tipo of Object.keys(content ?? {})) {
      if (tipo === 'multipart/form-data' || /^image\//.test(tipo) || tipo === 'application/octet-stream') {
        throw new ErroDeValidacao(`Content-type de upload é recusado: "${tipo}". Este contrato é só "application/json".`, ponteiro([...caminho, tipo]));
      }
    }
  }

  // --- oneOf/anyOf com discriminador --------------------------------------
  function conferirDiscriminador(schema, caminho) {
    if ((schema.oneOf || schema.anyOf) && schema.discriminator) {
      throw new ErroDeValidacao('"oneOf"/"anyOf" com "discriminator" é recusado.', ponteiro(caminho));
    }
  }

  // --- aninhamento: teto de 4 níveis, contando o schema raiz como nível 1 --
  const TETO_DE_ANINHAMENTO = 4;
  function passearSchema(schema, caminho, nivel, visitados) {
    if (!schema || typeof schema !== 'object') return;

    if (schema.$ref) {
      conferirRef(schema.$ref, [...caminho, '$ref']);
      const alvo = resolverRef(schema.$ref);
      if (!alvo) throw new ErroDeValidacao(`"$ref" não resolve: "${schema.$ref}".`, ponteiro([...caminho, '$ref']));
      // Um $ref para um schema NOMEADO reseta a contagem para 1: o teto é
      // sobre a forma interna de CADA objeto documentado, não sobre a
      // profundidade de onde ele foi embutido — senão o mesmo `Cobranca`
      // teria um orçamento de aninhamento diferente dentro de
      // `GET /cobrancas/{id}` (embutido direto) e de `GET /cobrancas`
      // (embutido num envelope de paginação), o que não é sinal nenhum de
      // estrutura, só de onde a rota decidiu paginar. Ciclo (não
      // profundidade) é quem cobre $ref recursivo, à parte em
      // `verificarCiclos`.
      passearSchema(alvo, caminho, 1, visitados);
      return;
    }

    conferirDiscriminador(schema, caminho);

    if (schema.type === 'object' || (Array.isArray(schema.type) && schema.type.includes('object'))) {
      if (nivel > TETO_DE_ANINHAMENTO) {
        throw new ErroDeValidacao(
          `Aninhamento acima de ${TETO_DE_ANINHAMENTO} níveis. O teto é calibrado em "cobranca.pagamento.cartao.verificacoes" — quatro níveis reais; um quinto reprova aqui.`,
          ponteiro(caminho),
        );
      }
      for (const [nome, filho] of Object.entries(schema.properties ?? {})) {
        passearSchema(filho, [...caminho, 'properties', nome], nivel + 1, visitados);
      }
    }
    if (schema.items) {
      passearSchema(schema.items, [...caminho, 'items'], nivel, visitados);
    }
  }

  // --- ciclo entre components.schemas, via $ref -----------------------------
  function verificarCiclos() {
    const schemas = doc.components?.schemas ?? {};
    const arestas = (nome) => {
      const alvo = [];
      const varrer = (node) => {
        if (!node || typeof node !== 'object') return;
        if (node.$ref) {
          const m = node.$ref.match(/^#\/components\/schemas\/([^/]+)$/);
          if (m) alvo.push(m[1]);
          return;
        }
        for (const v of Object.values(node)) {
          if (v && typeof v === 'object') varrer(v);
        }
      };
      varrer(schemas[nome]);
      return alvo;
    };

    const EM_PROGRESSO = 1;
    const FECHADO = 2;
    const estado = new Map();
    const pilha = [];

    function dfs(nome) {
      estado.set(nome, EM_PROGRESSO);
      pilha.push(nome);
      for (const vizinho of arestas(nome)) {
        if (estado.get(vizinho) === EM_PROGRESSO) {
          const inicio = pilha.indexOf(vizinho);
          const ciclo = [...pilha.slice(inicio), vizinho].join(' -> ');
          throw new ErroDeValidacao(`Schema circular: ${ciclo}.`, ponteiro(['components', 'schemas', vizinho]));
        }
        if (!estado.get(vizinho)) dfs(vizinho);
      }
      pilha.pop();
      estado.set(nome, FECHADO);
    }

    for (const nome of Object.keys(schemas)) {
      if (!estado.get(nome)) dfs(nome);
    }
  }
  verificarCiclos();

  // --- por schema nomeado: description + aninhamento ------------------------
  for (const [nome, schema] of Object.entries(doc.components?.schemas ?? {})) {
    exigirDescricao(schema, ['components', 'schemas', nome], `O schema "${nome}"`);
    passearSchema(schema, ['components', 'schemas', nome], 1, new Set());
  }

  // --- por operação -----------------------------------------------------
  const linguagensUsadas = new Set(linguagensDeSnippet);
  for (const [caminhoRota, item] of Object.entries(doc.paths ?? {})) {
    if (item.callbacks) {
      throw new ErroDeValidacao('"callbacks" é recusado nesta rota.', ponteiro(['paths', caminhoRota, 'callbacks']));
    }
    for (const [metodo, operacao] of Object.entries(item)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(metodo)) continue;
      const base = ['paths', caminhoRota, metodo];

      if (operacao.callbacks) {
        throw new ErroDeValidacao('"callbacks" é recusado nesta operação.', ponteiro([...base, 'callbacks']));
      }

      exigirDescricao(operacao, base, `A operação "${operacao.operationId ?? metodo + ' ' + caminhoRota}"`);

      for (const [i, parametro] of (operacao.parameters ?? []).entries()) {
        exigirDescricao(parametro, [...base, 'parameters', i], `O parâmetro "${parametro.name}"`);
      }

      if (operacao.requestBody) {
        const conteudo = operacao.requestBody.content ?? {};
        conferirContentTypes(conteudo, [...base, 'requestBody', 'content']);
        for (const [tipo, media] of Object.entries(conteudo)) {
          if (media.schema) passearSchema(media.schema, [...base, 'requestBody', 'content', tipo, 'schema'], 1, new Set());
        }
      }

      const respostas = Object.entries(operacao.responses ?? {});
      if (respostas.length > 4) {
        throw new ErroDeValidacao(
          `${respostas.length} respostas documentadas — o teto por operação é 4.`,
          ponteiro([...base, 'responses']),
        );
      }
      for (const [status, resposta] of respostas) {
        exigirDescricao(resposta, [...base, 'responses', status], `A resposta "${status}"`);
        const conteudo = resposta.content ?? {};
        conferirContentTypes(conteudo, [...base, 'responses', status, 'content']);
        for (const [tipo, media] of Object.entries(conteudo)) {
          if (media.schema) passearSchema(media.schema, [...base, 'responses', status, 'content', tipo, 'schema'], 1, new Set());
        }
      }
    }
  }

  // --- linguagem de snippet registrada em additionalLanguages ---------------
  const disponiveis = new Set([...LINGUAGENS_PADRAO_PRISM, ...linguagensAdicionais]);
  for (const linguagem of linguagensUsadas) {
    if (!disponiveis.has(linguagem)) {
      throw new ErroDeValidacao(
        `A linguagem de snippet "${linguagem}" não está no bundle padrão do Prism nem em themeConfig.prism.additionalLanguages.`,
        '/',
      );
    }
  }

  return contexto;
}

/**
 * A checagem de congruência estrutural entre os dois locales — pt-BR e en
 * precisam ter exatamente a mesma forma, e só podem divergir no texto de
 * `description`/`summary`/`title`. É o que impede um contrato bilíngue
 * derrapar: uma rota, parâmetro ou schema que existe num e não no outro
 * reprova aqui, e não silenciosamente na hora de gerar a página.
 */
export function verificarCongruencia(docA, docB, {nomeA, nomeB}) {
  const CHAVES_TRADUZIVEIS = new Set(['description', 'summary', 'title']);

  function normalizar(node) {
    if (Array.isArray(node)) return node.map(normalizar);
    if (node && typeof node === 'object') {
      const out = {};
      for (const chave of Object.keys(node).sort()) {
        if (CHAVES_TRADUZIVEIS.has(chave)) continue;
        out[chave] = normalizar(node[chave]);
      }
      return out;
    }
    return node;
  }

  function comparar(a, b, caminho) {
    const na = normalizar(a);
    const nb = normalizar(b);
    if (JSON.stringify(na) !== JSON.stringify(nb)) {
      throw new ErroDeValidacao(
        `"${nomeA}" e "${nomeB}" divergem em estrutura (fora de description/summary/title).`,
        ponteiro(caminho),
      );
    }
  }

  comparar(docA.paths, docB.paths, ['paths']);
  comparar(docA.components?.schemas, docB.components?.schemas, ['components', 'schemas']);
}
