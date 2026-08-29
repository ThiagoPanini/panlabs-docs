/**
 * O modelo da linha de comando — **o que o painel monta, e o que o gerador
 * deriva**, num arquivo só.
 *
 * **Por que ele existe.** Antes dele o painel não tinha modelo de flag: o
 * gerador congelava um template no build e `CommandPanel` fazia
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
 * mesma doutrina de `SearchBar/ladder.mjs`: a régua e os dois consumidores leem
 * o mesmo arquivo. `scripts/line.test.mjs` é a régua;
 * `scripts/generate-reference.mjs` e `CommandPanel.js` são os consumidores.
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
export const shellQuote = (value) => `"${String(value).replace(/[\\$`"]/g, (c) => `\\${c}`)}"`;

/** Uma flag booleana entra nua; `--dry-run true` não é linha que alguém digite. */
const isBoolean = (parameter) => parameter.type === 'flag';

const parametersOf = (entry) => entry.parameters ?? [];

/** A posição da flag no contrato, que é a ordem em que a linha a escreve. */
const orderOf = (entry) => {
  const position = new Map();
  parametersOf(entry).forEach((parameter, index) => position.set(parameter.name, index));
  return position;
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
export function signatureOf(entry) {
  const options = parametersOf(entry).map((parameter) =>
    isBoolean(parameter) ? `[${parameter.name}]` : `[${parameter.name} <${parameter.type}>]`,
  );

  const members = Array.isArray(entry.flow) && entry.flow.length > 0 ? ['<command>'] : [];

  return [entry.qualified, ...options, ...members].join(' ');
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
export function initialState(entry, context) {
  const minimum =
    (entry.minimum ?? []).find((candidate) => candidate.context === context) ??
    (entry.minimum ?? [])[0];
  const requiredFlags = new Set(minimum?.flags ?? []);

  return Object.fromEntries(
    parametersOf(entry).map((parameter) => [
      parameter.name,
      {
        on: requiredFlags.has(parameter.name),
        // Sem exemplo no contrato, o metavar é o que ocupa o lugar: ele diz o
        // que digitar sem fingir um valor que a ferramenta talvez não conheça.
        value: isBoolean(parameter)
          ? ''
          : String(parameter.example ?? `<${parameter.type}>`),
      },
    ]),
  );
}

/** As flags que o estado tem ligadas, em ordem de contrato. */
const onFlags = (entry, state) =>
  parametersOf(entry)
    .filter((parameter) => state[parameter.name]?.on)
    .map((parameter) => parameter.name);

/**
 * Os membros de um grupo exclusivo que colidem no conjunto dado, ou vazio.
 *
 * **A partição é o que separa `list` de `install`.** Em `list` os quatro
 * seletores se excluem dois a dois; em `install` a fronteira é entre a classe
 * MCP e as outras três, e duas flags do MESMO lado convivem. Um grupo plano
 * erraria os dois comandos.
 *
 * **Ela é exportada porque o validador a usa também.** A recusa
 * `exclusiva-obrigatoria` de `scripts/lib/signature.mjs` pergunta exatamente
 * isto sobre as flags de um `minimo`, e uma segunda implementação da mesma conta
 * é a divergência que este módulo existe para não ter: o validador aprovaria uma
 * linha mínima que o painel recusa, ou o contrário.
 */
export function membersInConflict(constraint, present) {
  if (constraint?.type !== 'exclusive') {
    return [];
  }
  if (constraint.guard && present.has(constraint.guard)) {
    return [];
  }
  const members = (constraint.members ?? []).filter((name) => present.has(name));
  const blocks = constraint.partition
    ? new Set(members.map((name) => constraint.partition.findIndex((b) => b.includes(name))))
    : new Set(members);
  return blocks.size < 2 ? [] : members;
}

/**
 * A mensagem da regra, com `{flags}` preenchido na ordem do contrato.
 *
 * **`" and "` não é escolha de estilo daqui.** É o que `TooManySelectorsError`
 * faz em `cli.py`, `" and ".join(self.flags)`, e o docstring dela diz por quê:
 * *"names every flag it was given, so the line can be cut in one edit"*. Uma
 * vírgula ficaria mais bonita e faria o leitor procurar no terminal um texto
 * que não existe.
 */
function messageFor(entry, constraint, flags) {
  const order = orderOf(entry);
  const named = [...new Set(flags)].sort((a, b) => order.get(a) - order.get(b));
  return (constraint.message ?? '').replace('{flags}', named.join(' and '));
}

/**
 * Se ligar `candidata` violaria a restrição, e com que mensagem.
 *
 * Devolve `null` quando não viola. A avaliação é sempre sobre o estado *com* a
 * candidata ligada, e não sobre o estado corrente: a pergunta que o painel faz é
 * "posso ligar isto?", e ela só tem resposta no mundo em que já ligou.
 */
function violation(entry, constraint, present) {
  // A guarda suspende a regra inteira. É o escape hatch de `cli.py:652`: a
  // mistura de classes é recusada *a menos que* `--runtime` esteja nomeado, e um
  // modelo sem guarda marcaria como inválida uma linha que a CLI aceita.
  if (constraint.guard && present.has(constraint.guard)) {
    return null;
  }

  if (constraint.type === 'exclusive') {
    const members = membersInConflict(constraint, present);
    if (members.length === 0) {
      return null;
    }
    return {
      message: messageFor(entry, constraint, members),
      exit: constraint.exit,
      errorClass: constraint.class,
    };
  }

  if (constraint.type === 'forbids') {
    if (present.has(constraint.when) && present.has(constraint.forbidden)) {
      return {
        message: messageFor(entry, constraint, [constraint.when, constraint.forbidden]),
        exit: constraint.exit,
        errorClass: constraint.class,
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
 * Quem a lê é a **régua** (`scripts/line.test.mjs` afirma qual restrição
 * disparou, e sem isso uma falha diria só *a flag foi recusada*) e a **varredura
 * do overpower**, que instancia a classe no fonte da ferramenta e compara
 * `str(Erro(...))` com a `mensagem` do contrato, byte a byte. Sem o nome da
 * classe essa conferência não teria por onde começar.
 */
const byPrecedence = (entry) =>
  [...(entry.constraints ?? [])].sort((a, b) => (a.precedence ?? 0) - (b.precedence ?? 0));

export function evaluate(entry, state) {
  const constraints = byPrecedence(entry);

  return Object.fromEntries(
    parametersOf(entry).map((parameter) => {
      const present = new Set(onFlags(entry, state));
      present.add(parameter.name);

      for (const constraint of constraints) {
        const found = violation(entry, constraint, present);
        if (found) {
          // `regra` é o objeto de restrição, não uma cópia: quem agrupa por
          // regra precisa voltar a ela para reescrever `{flags}` sobre o
          // conjunto inteiro, e comparar por identidade é mais barato e mais
          // seguro que casar pela `classe`.
          return [parameter.name, {allowed: false, rule: constraint, ...found}];
        }
      }
      return [parameter.name, {allowed: true}];
    }),
  );
}

/**
 * As recusas agrupadas **por regra**, uma entrada por regra que morde.
 *
 * **Por que ela existe: o painel dizia a mesma coisa N vezes.** `avaliar`
 * responde por flag, que é o que a interface precisa para desabilitar campo. Mas
 * uma regra de exclusividade recusa TODOS os outros membros de uma vez, e o
 * painel imprimia a mensagem embaixo de cada um. Medido em `install`, marcar
 * `--mcp` fazia a MESMA frase de 105 caracteres aparecer três vezes e empurrava
 * a grade 132px para baixo; em `list`, três frases que só diferiam no nome da
 * flag, e 78px. Três cópias de uma regra não são três informações.
 *
 * **`{flags}` é reescrito sobre o conjunto inteiro**, e não sobre o par que a
 * avaliação por flag produziu. A CLI nomeia toda flag que recebeu, então a
 * mensagem de grupo é a que ela imprimiria para essa linha — não a de um par
 * arbitrário entre os vários que a regra recusa.
 *
 * A ordem é a `precedencia` do contrato, que é a ordem em que a CLI avalia.
 */
export function lineRefusals(entry, state) {
  const verdict = evaluate(entry, state);
  const present = new Set(onFlags(entry, state));
  const groups = new Map();

  for (const parameter of parametersOf(entry)) {
    const current = verdict[parameter.name];
    if (current?.allowed !== false) {
      continue;
    }
    const group = groups.get(current.rule) ?? {rule: current.rule, refused: []};
    group.refused.push(parameter.name);
    groups.set(current.rule, group);
  }

  return byPrecedence(entry)
    .filter((constraint) => groups.has(constraint))
    .map((constraint) => {
      const {refused} = groups.get(constraint);
      // As que já estão ligadas e pertencem à regra entram na frase: são elas
      // que o leitor escolheu, e sem elas a mensagem diria que a ferramenta
      // recebeu só o que ele NÃO pôde marcar.
      const involved = [
        ...refused,
        ...(constraint.members ?? [constraint.when]).filter((name) => present.has(name)),
      ];
      return {
        errorClass: constraint.class,
        exit: constraint.exit,
        refused,
        message: messageFor(entry, constraint, involved),
      };
    });
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
export function assemble(entry, state) {
  const verdict = evaluate(entry, state);

  const options = parametersOf(entry).flatMap((parameter) => {
    const field = state[parameter.name];
    if (!field?.on || !verdict[parameter.name]?.allowed) {
      return [];
    }
    if (isBoolean(parameter)) {
      return [parameter.name];
    }
    const value = String(field.value ?? '').trim();
    return value === '' ? [] : [`${parameter.name} ${shellQuote(value)}`];
  });

  return [entry.call ?? entry.qualified, ...options].join(' ');
}
