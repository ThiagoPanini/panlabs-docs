/**
 * O modelo da linha de comando — **o que o painel monta, e o que o gerador
 * deriva**, num arquivo só.
 *
 * **Por que ele existe.** Antes dele o painel não tinha modelo de flag: o
 * gerador congelava um template no build e `PainelComando` fazia
 * `String.replace` de `{{marcador}}` sobre ele. Um template congelado não sabe
 * dizer *opcional* — apagar o campo de `--skill` produzia
 * `overpower list --skill ""`, que não é linha que a CLI aceite, e ligar um
 * segundo seletor produzia uma linha que ela recusa. O template também não sabia
 * dizer que a mesma flag tem aridade diferente em dois subcomandos.
 *
 * **A `assinatura` some do contrato por causa deste arquivo.** Ela era escrita à
 * mão ao lado dos `parametros`, e nada obrigava as duas a concordarem: estava
 * certa por sorte. Derivá-la aqui faz o contrato ter uma fonte só para a forma
 * do comando, e faz o painel e a assinatura não poderem divergir — porque são a
 * mesma função lendo o mesmo campo.
 *
 * **Zero React, zero DOM**, para que o script de build possa importá-lo. É a
 * mesma doutrina de `placeholder.mjs` e de `SearchBar/escada.mjs`: a régua e os
 * dois consumidores leem o mesmo arquivo. `scripts/linha.test.mjs` é a régua;
 * `scripts/gerar-referencia.mjs` e `PainelComando.js` são os consumidores.
 *
 * **O que este modelo NÃO faz, de propósito.** Ele modela a *linha*, não a
 * máquina: aridade, exclusividade com guarda, mínimo por contexto e proibição
 * por presença de outra flag. Fora dele ficam o estado de disco (`--force` só é
 * exigida quando o destino global já existe), a alcançabilidade de um runtime
 * por escopo, e o pulo não monotônico em que acrescentar uma flag transforma
 * recusa em sucesso. Isso não cabe num montador estático e vira prosa ao lado do
 * painel — ver `docs/design/referencia.md` §5.
 *
 * Procedência: ADR 12, `docs/adr/0012-o-painel-monta-a-linha-do-modelo-do-contrato.md`.
 */

/**
 * Uma palavra de shell entre aspas duplas, escapada.
 *
 * Dentro de aspas duplas o shell ainda expande `$`, executa crase e consome a
 * contrabarra, e esta é a linha que o leitor copia para o terminal dele. A ordem
 * importa: escapar `\\` depois de `"` escaparia a barra recém-inserida.
 *
 * **Ela é exportada porque o gerador a usa também**, e ter duas cópias da mesma
 * regra é exatamente o defeito que este módulo existe para não repetir: o
 * gerador escreve a linha de exemplo da raiz e o painel escreve a linha editada,
 * e um leitor que copia as duas espera o mesmo escape. Duas cópias divergem, e
 * nenhum portão veria — o 5 regenera e diffa a saída contra ela mesma.
 */
export const aspasDeShell = (valor) => `"${String(valor).replace(/[\\$`"]/g, (c) => `\\${c}`)}"`;

/** Uma flag booleana entra nua; `--dry-run true` não é linha que alguém digite. */
const ehBooleana = (parametro) => parametro.tipo === 'flag';

const parametrosDe = (entrada) => entrada.parametros ?? [];

/** A posição da flag no contrato, que é a ordem em que a linha a escreve. */
const ordemDe = (entrada) => {
  const posicao = new Map();
  parametrosDe(entrada).forEach((parametro, indice) => posicao.set(parametro.nome, indice));
  return posicao;
};

/**
 * A assinatura, derivada do modelo.
 *
 * Todo parâmetro entra entre colchetes porque **nenhum parâmetro desta CLI é
 * obrigatório no parser**: os quatro grupos são `required=False`, e a
 * obrigatoriedade real é sempre condicional a algo que não está na linha — não
 * haver terminal, o `cwd` estar fora de repositório, o destino já existir. Uma
 * assinatura que cravasse `<--skill>` mentiria sobre o parser; o que a linha
 * precisa de fato vive em `minimo`, por contexto.
 *
 * **A raiz anuncia o membro, não a si mesma.** O que se digita para usar uma CLI
 * é um comando dela, e ter `fluxo` é ser raiz.
 */
export function assinaturaDe(entrada) {
  const opcoes = parametrosDe(entrada).map((parametro) =>
    ehBooleana(parametro) ? `[${parametro.nome}]` : `[${parametro.nome} <${parametro.tipo}>]`,
  );

  const membros = Array.isArray(entrada.fluxo) && entrada.fluxo.length > 0 ? ['<command>'] : [];

  return [entrada.qualificado, ...opcoes, ...membros].join(' ');
}

/**
 * O estado em que o painel abre, por contexto.
 *
 * **O mínimo é declarado por contexto porque terminal e pipe são linhas
 * diferentes.** `overpower install` num terminal abre o assistente e é linha
 * completa; o mesmo texto num pipe sai em erro, porque não há assistente a
 * abrir. Duas linhas mínimas, uma por contexto, e o painel abre na do contexto
 * que a página escolheu mostrar.
 *
 * **É determinístico de propósito.** O painel é pintado no servidor e reidratado
 * no cliente; um estado inicial que dependesse do navegador faria o React
 * reclamar de divergência e a linha piscar na primeira tinta.
 */
export function estadoInicial(entrada, contexto) {
  const minimo =
    (entrada.minimo ?? []).find((candidato) => candidato.contexto === contexto) ??
    (entrada.minimo ?? [])[0];
  const exigidas = new Set(minimo?.flags ?? []);

  return Object.fromEntries(
    parametrosDe(entrada).map((parametro) => [
      parametro.nome,
      {
        ligada: exigidas.has(parametro.nome),
        // Sem exemplo no contrato, o metavar é o que ocupa o lugar: ele diz o
        // que digitar sem fingir um valor que a ferramenta talvez não conheça.
        valor: ehBooleana(parametro)
          ? ''
          : String(parametro.exemplo ?? `<${parametro.tipo}>`),
      },
    ]),
  );
}

/** As flags que o estado tem ligadas, em ordem de contrato. */
const ligadas = (entrada, estado) =>
  parametrosDe(entrada)
    .filter((parametro) => estado[parametro.nome]?.ligada)
    .map((parametro) => parametro.nome);

/**
 * Os membros de um grupo exclusivo que colidem no conjunto dado, ou vazio.
 *
 * **A partição é o que separa `list` de `install`.** Em `list` os quatro
 * seletores se excluem dois a dois; em `install` a fronteira é entre a classe
 * MCP e as outras três, e duas flags do MESMO lado convivem. Um grupo plano
 * erraria os dois comandos.
 *
 * **Ela é exportada porque o validador a usa também.** A recusa
 * `exclusiva-obrigatoria` de `scripts/lib/assinatura.mjs` pergunta exatamente
 * isto sobre as flags de um `minimo`, e uma segunda implementação da mesma conta
 * é a divergência que este módulo existe para não ter: o validador aprovaria uma
 * linha mínima que o painel recusa, ou o contrário.
 */
export function membrosEmConflito(restricao, presentes) {
  if (restricao?.tipo !== 'exclusivo') {
    return [];
  }
  if (restricao.guarda && presentes.has(restricao.guarda)) {
    return [];
  }
  const membros = (restricao.membros ?? []).filter((nome) => presentes.has(nome));
  const blocos = restricao.particao
    ? new Set(membros.map((nome) => restricao.particao.findIndex((b) => b.includes(nome))))
    : new Set(membros);
  return blocos.size < 2 ? [] : membros;
}

/**
 * Se ligar `candidata` violaria a restrição, e com que mensagem.
 *
 * Devolve `null` quando não viola. A avaliação é sempre sobre o estado *com* a
 * candidata ligada, e não sobre o estado corrente: a pergunta que o painel faz é
 * "posso ligar isto?", e ela só tem resposta no mundo em que já ligou.
 */
function violacao(entrada, restricao, presentes) {
  // A guarda suspende a regra inteira. É o escape hatch de `cli.py:652`: a
  // mistura de classes é recusada *a menos que* `--runtime` esteja nomeado, e um
  // modelo sem guarda marcaria como inválida uma linha que a CLI aceita.
  if (restricao.guarda && presentes.has(restricao.guarda)) {
    return null;
  }

  if (restricao.tipo === 'exclusivo') {
    const membros = membrosEmConflito(restricao, presentes);
    if (membros.length === 0) {
      return null;
    }
    const ordem = ordemDe(entrada);
    const nomeadas = [...membros].sort((a, b) => ordem.get(a) - ordem.get(b));
    return {
      mensagem: (restricao.mensagem ?? '').replace('{flags}', nomeadas.join(' and ')),
      exit: restricao.exit,
      classe: restricao.classe,
    };
  }

  if (restricao.tipo === 'proibe') {
    if (presentes.has(restricao.quando) && presentes.has(restricao.proibida)) {
      return {
        mensagem: restricao.mensagem ?? '',
        exit: restricao.exit,
        classe: restricao.classe,
      };
    }
    return null;
  }

  // `desliga` descreve o que a presença de uma flag muda no comportamento da
  // ferramenta, não o que a linha pode conter. Não bloqueia campo nenhum; é
  // prosa que a página escreve ao lado do painel.
  return null;
}

/**
 * O veredito por flag: se a linha pode tê-la, e a mensagem da CLI quando não.
 *
 * A ordem de avaliação é a `precedencia` do contrato, e ela importa porque
 * decide **qual mensagem o leitor vê** quando duas regras batem na mesma linha.
 * A CLI avalia numa ordem; o painel a copia em vez de escolher a sua.
 */
/**
 * O veredito carrega `classe`, e ela tem dois consumidores nomeados.
 *
 * A tela não a mostra — o leitor quer a mensagem, não o nome da exceção Python.
 * Quem a lê é a **régua** (`scripts/linha.test.mjs` afirma qual restrição
 * disparou, e sem isso uma falha diria só *a flag foi recusada*) e a **varredura
 * do overpower**, que instancia a classe no fonte da ferramenta e compara
 * `str(Erro(...))` com a `mensagem` do contrato, byte a byte. Sem o nome da
 * classe essa conferência não teria por onde começar.
 */
export function avaliar(entrada, estado) {
  const restricoes = [...(entrada.restricoes ?? [])].sort(
    (a, b) => (a.precedencia ?? 0) - (b.precedencia ?? 0),
  );

  return Object.fromEntries(
    parametrosDe(entrada).map((parametro) => {
      const presentes = new Set(ligadas(entrada, estado));
      presentes.add(parametro.nome);

      for (const restricao of restricoes) {
        const encontrada = violacao(entrada, restricao, presentes);
        if (encontrada) {
          return [parametro.nome, {permitida: false, ...encontrada}];
        }
      }
      return [parametro.nome, {permitida: true}];
    }),
  );
}

/**
 * A linha que o leitor copia.
 *
 * Três regras, e cada uma existe por um defeito medido:
 *
 * 1. **Flag desligada não entra.** O painel abre no mínimo e o leitor acrescenta
 *    por escolha, em vez de apagar o que não quer.
 * 2. **Flag ligada sem valor não entra.** É o defeito nomeado na #133: o
 *    template congelado escrevia `--skill ""`, e nenhuma linha da CLI tem essa
 *    forma. Sem valor, a flag sai — a linha continua válida enquanto o leitor
 *    digita.
 * 3. **Flag recusada não entra.** O painel desabilita o campo, então o estado
 *    não chega aqui violado pela interface; a filtragem é o que garante que
 *    nenhum outro caminho monte uma linha que a própria avaliação recusa.
 */
export function montar(entrada, estado) {
  const veredito = avaliar(entrada, estado);

  const opcoes = parametrosDe(entrada).flatMap((parametro) => {
    const campo = estado[parametro.nome];
    if (!campo?.ligada || !veredito[parametro.nome]?.permitida) {
      return [];
    }
    if (ehBooleana(parametro)) {
      return [parametro.nome];
    }
    const valor = String(campo.valor ?? '').trim();
    return valor === '' ? [] : [`${parametro.nome} ${aspasDeShell(valor)}`];
  });

  return [entrada.chamada ?? entrada.qualificado, ...opcoes].join(' ');
}
