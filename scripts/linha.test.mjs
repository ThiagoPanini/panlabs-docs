/**
 * A régua do modelo de linha de comando — `src/theme/MDXComponents/linha.mjs`.
 *
 * **Por que este arquivo existe, e não um teste de componente.** Não há
 * infraestrutura de teste de React neste repositório, e criá-la custaria
 * dependência npm nova, que o axioma 2 fecha em zero. A saída é a mesma que
 * `placeholder.mjs` e `SearchBar/escada.mjs` já tomaram: a lógica sai do
 * componente para um módulo puro — zero React, zero DOM — e é o módulo que a
 * régua exercita. O que sobra em `PainelComando.js` é render.
 *
 * **O que esta régua cobra que o portão 5 não cobraria.** O portão 5 regenera e
 * diffa: ele pega a saída divergindo do contrato, e não pega o modelo estando
 * errado sobre a ferramenta. Uma exclusividade escrita ao contrário produz uma
 * página byte a byte igual à que o gerador acabou de emitir, com um painel que
 * monta linha que a CLI recusa.
 *
 * Cadência: commit. Entra em `npm test` pelo `package.json`.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';

import {
  assinaturaDe,
  avaliar,
  estadoInicial,
  montar,
} from '../src/theme/MDXComponents/linha.mjs';
import {RECUSAS, lerContrato, validar} from './lib/assinatura.mjs';

// ---------------------------------------------------------------------------
// As fixtures — medidas contra `overpower 0.27.0`, não inventadas
// ---------------------------------------------------------------------------

/**
 * `list`, como a CLI real o declara: cinco seletores, todos únicos, mutuamente
 * exclusivos dois a dois, sem guarda que os suspenda.
 *
 * Medido por `typer.main.get_command(app)`, e não pelo `--help`: o `--help`
 * esconde a aridade, e é essa omissão que produziu o contrato v1.
 */
const LIST = {
  id: 'list',
  especie: 'comando',
  qualificado: 'overpower list',
  chamada: 'overpower list',
  parametros: [
    {nome: '--skill', curta: '-s', tipo: 'name', aridade: {multiplo: false}},
    {nome: '--bundle', curta: '-b', tipo: 'name', aridade: {multiplo: false}},
    {nome: '--mcp', tipo: 'name', aridade: {multiplo: false}},
    {nome: '--ai-framework', tipo: 'name', aridade: {multiplo: false}},
    {nome: '--from', tipo: 'url', aridade: {multiplo: false}},
  ],
  minimo: [{contexto: 'sempre', flags: []}],
  restricoes: [
    {
      tipo: 'exclusivo',
      precedencia: 1,
      membros: ['--skill', '--bundle', '--mcp', '--ai-framework'],
      guarda: null,
      mensagem: '`list` shows one item at a time, and got {flags}',
      exit: 2,
      classe: 'TooManySelectorsError',
    },
    {
      tipo: 'proibe',
      precedencia: 2,
      quando: '--from',
      proibida: '--ai-framework',
      mensagem: '`--from` on `list` shows skills, MCP servers and bundles',
      exit: 2,
      classe: 'UnsupportedRemoteListUnitError',
    },
  ],
};

/**
 * `install`, como a CLI real o declara: cinco flags que acumulam com vírgula,
 * quatro booleanas, e uma exclusividade que é PARTIÇÃO, não todos-contra-todos.
 *
 * `{--mcp}` contra `{--ai-framework, --bundle, --skill}`, suspensa por
 * `--runtime` (`cli.py:652`). Um grupo exclusivo plano erraria os dois comandos.
 */
const INSTALL = {
  id: 'install',
  especie: 'comando',
  qualificado: 'overpower install',
  chamada: 'overpower install',
  parametros: [
    {nome: '--runtime', tipo: 'key', aridade: {multiplo: true, separador: ','}},
    {nome: '--skill', curta: '-s', tipo: 'name', aridade: {multiplo: true, separador: ','}},
    {nome: '--mcp', tipo: 'name', aridade: {multiplo: true, separador: ','}},
    {nome: '--ai-framework', tipo: 'name', aridade: {multiplo: true, separador: ','}},
    {nome: '--global', curta: '-g', tipo: 'flag', aridade: {multiplo: false}},
    {nome: '--dry-run', tipo: 'flag', aridade: {multiplo: false}},
  ],
  minimo: [
    {contexto: 'terminal', flags: []},
    {contexto: 'sem-terminal', flags: ['--skill', '--runtime']},
  ],
  restricoes: [
    {
      tipo: 'exclusivo',
      precedencia: 1,
      membros: ['--mcp', '--ai-framework', '--skill'],
      particao: [['--mcp'], ['--ai-framework', '--skill']],
      guarda: '--runtime',
      mensagem:
        'a skill and an MCP server on one line need --runtime named explicitly, or two separate commands — one per class',
      exit: 2,
      classe: 'MixedClassesWithoutRuntimeError',
    },
  ],
};

/** O estado com um punhado de flags ligadas, para encurtar os casos. */
const ligar = (entrada, contexto, ligadas) => {
  const estado = estadoInicial(entrada, contexto);
  for (const [nome, valor] of Object.entries(ligadas)) {
    estado[nome] = {ligada: true, valor: String(valor)};
  }
  return estado;
};

// ---------------------------------------------------------------------------
// `assinaturaDe` — derivada do modelo, nunca escrita à mão
// ---------------------------------------------------------------------------

test('a assinatura sai do modelo, com metavar do tipo e colchete de opcional', () => {
  assert.equal(
    assinaturaDe(LIST),
    'overpower list [--skill <name>] [--bundle <name>] [--mcp <name>] ' +
      '[--ai-framework <name>] [--from <url>]',
  );
});

test('a flag booleana entra sem metavar, porque não recebe valor', () => {
  const derivada = assinaturaDe(INSTALL);
  assert.match(derivada, /\[--global\]/);
  assert.match(derivada, /\[--dry-run\]/);
  assert.doesNotMatch(derivada, /--global </);
});

test('comando sem parâmetro tem assinatura igual ao qualificado', () => {
  const doctor = {id: 'doctor', especie: 'comando', qualificado: 'overpower doctor', parametros: []};
  assert.equal(assinaturaDe(doctor), 'overpower doctor');
});

test('a raiz anuncia o membro, porque o que se digita é um comando dela', () => {
  const raiz = {
    id: 'overpower',
    especie: 'aplicacao',
    qualificado: 'overpower',
    parametros: [{nome: '--version', tipo: 'flag', aridade: {multiplo: false}}],
    fluxo: ['list'],
  };
  assert.equal(assinaturaDe(raiz), 'overpower [--version] <command>');
});

/**
 * As quatro assinaturas como o contrato v1 as trazia escritas à mão.
 *
 * Congeladas aqui de propósito: são o que o leitor via antes da derivação, e
 * esta régua é a prova de que apagá-las do JSON não mudou uma vírgula do que a
 * página mostra. Mudar uma delas é decisão, não conserto — e o diff obriga a
 * declará-la.
 */
const ASSINATURAS_V1 = {
  overpower: 'overpower [--help] [--version] <command>',
  list:
    'overpower list [--skill <name>] [--bundle <name>] [--mcp <name>] ' +
    '[--ai-framework <name>] [--from <url>]',
  install:
    'overpower install [--runtime <key>] [--skill <name>] [--bundle <name>] ' +
    '[--mcp <name>] [--ai-framework <name>] [--from <url>] [--global] [--force] ' +
    '[--yes] [--dry-run]',
  doctor: 'overpower doctor',
};

test('a assinatura derivada reproduz a que o contrato v1 trazia escrita à mão', () => {
  // A prova de que derivar não é reescrever: o v1 tinha as quatro certas por
  // sorte, e nada obrigava `assinatura` e `parametros` a concordarem.
  for (const caminho of ['contratos/overpower.pt-BR.json', 'contratos/overpower.en.json']) {
    const contrato = lerContrato(caminho);
    for (const entrada of contrato.entradas) {
      assert.equal(assinaturaDe(entrada), ASSINATURAS_V1[entrada.id], `${caminho} · ${entrada.id}`);
    }
  }
});

test('nenhum contrato commitado carrega `assinatura` escrita à mão', () => {
  for (const caminho of ['contratos/overpower.pt-BR.json', 'contratos/overpower.en.json']) {
    for (const entrada of lerContrato(caminho).entradas) {
      assert.equal(
        entrada.assinatura,
        undefined,
        `${caminho} · ${entrada.id}: a assinatura é derivada, e escrevê-la abre a segunda fonte`,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// `estadoInicial` — o mínimo por contexto, e o painel abre nele
// ---------------------------------------------------------------------------

test('`list` abre nu, sem nenhuma flag ligada', () => {
  const estado = estadoInicial(LIST, 'sempre');
  assert.equal(montar(LIST, estado), 'overpower list');
  assert.equal(
    Object.values(estado).filter((campo) => campo.ligada).length,
    0,
  );
});

test('`install` num terminal abre nu; fora de terminal abre no mínimo que fecha a linha', () => {
  assert.equal(montar(INSTALL, estadoInicial(INSTALL, 'terminal')), 'overpower install');

  const semTerminal = estadoInicial(INSTALL, 'sem-terminal');
  assert.equal(semTerminal['--skill'].ligada, true);
  assert.equal(semTerminal['--runtime'].ligada, true);
});

test('o estado inicial é determinístico, para o SSR bater com a primeira pintura', () => {
  // O painel é renderizado no servidor e reidratado no cliente. Se o estado
  // inicial dependesse de algo do navegador, o React reclamaria de divergência
  // — e o leitor veria a linha piscar.
  const primeiro = estadoInicial(INSTALL, 'sem-terminal');
  const segundo = estadoInicial(INSTALL, 'sem-terminal');
  assert.deepEqual(primeiro, segundo);
});

// ---------------------------------------------------------------------------
// `montar` — a linha que o leitor copia
// ---------------------------------------------------------------------------

test('a flag ligada entra com o valor entre aspas; a desligada não entra', () => {
  const estado = ligar(LIST, 'sempre', {'--skill': 'panlabs-python-standards'});
  assert.equal(montar(LIST, estado), 'overpower list --skill "panlabs-python-standards"');
});

test('a flag booleana entra nua, sem `true` atrás', () => {
  const estado = ligar(INSTALL, 'terminal', {'--global': ''});
  assert.equal(montar(INSTALL, estado), 'overpower install --global');
});

test('apagar o campo de uma flag ligada não deixa aspas vazias na linha', () => {
  // É o defeito nomeado na #133: o template congelado produzia
  // `overpower list --skill ""` para um campo vazio, e nenhuma linha da CLI
  // tem essa forma. Sem valor, a flag sai da linha.
  const estado = ligar(LIST, 'sempre', {'--skill': ''});
  assert.equal(montar(LIST, estado), 'overpower list');
});

test('o valor com aspas ou cifrão sai escapado, porque a linha vai para um shell', () => {
  const estado = ligar(LIST, 'sempre', {'--skill': 'a"b$c'});
  assert.equal(montar(LIST, estado), 'overpower list --skill "a\\"b\\$c"');
});

test('em `install` a vírgula separa, e o valor múltiplo sai numa flag só', () => {
  const estado = ligar(INSTALL, 'terminal', {'--skill': 'um,dois'});
  assert.equal(montar(INSTALL, estado), 'overpower install --skill "um,dois"');
});

test('em `list` a vírgula é caractere do nome, e a linha não a trata como separador', () => {
  // A mesma flag com aridade diferente por subcomando é o que obriga o
  // contrato a ser indexado por `(comando, flag)`.
  const estado = ligar(LIST, 'sempre', {'--skill': 'um,dois'});
  assert.equal(montar(LIST, estado), 'overpower list --skill "um,dois"');
  assert.equal(LIST.parametros.find((p) => p.nome === '--skill').aridade.multiplo, false);
});

// ---------------------------------------------------------------------------
// `avaliar` — a exclusividade, a guarda e a proibição
// ---------------------------------------------------------------------------

test('em `list`, ligar um seletor recusa os outros três com a mensagem da CLI', () => {
  const estado = ligar(LIST, 'sempre', {'--skill': 'x'});
  const veredito = avaliar(LIST, estado);

  for (const outro of ['--bundle', '--mcp', '--ai-framework']) {
    assert.equal(veredito[outro].permitida, false, `${outro} deveria estar recusada`);
    assert.equal(veredito[outro].exit, 2);
    assert.equal(veredito[outro].classe, 'TooManySelectorsError');
  }
  assert.equal(veredito['--skill'].permitida, true);
  assert.equal(veredito['--from'].permitida, true, '`--from` não é seletor');
});

test('a mensagem de exclusividade nomeia as flags que a linha teria, como a CLI faz', () => {
  const estado = ligar(LIST, 'sempre', {'--skill': 'x'});
  assert.equal(
    avaliar(LIST, estado)['--bundle'].mensagem,
    '`list` shows one item at a time, and got --skill and --bundle',
  );
});

test('em `install`, `--mcp` e `--skill` colidem — e `--runtime` suspende a colisão', () => {
  const semGuarda = ligar(INSTALL, 'terminal', {'--skill': 'x'});
  assert.equal(avaliar(INSTALL, semGuarda)['--mcp'].permitida, false);
  assert.equal(avaliar(INSTALL, semGuarda)['--mcp'].classe, 'MixedClassesWithoutRuntimeError');

  const comGuarda = ligar(INSTALL, 'terminal', {'--skill': 'x', '--runtime': 'cursor'});
  assert.equal(
    avaliar(INSTALL, comGuarda)['--mcp'].permitida,
    true,
    'com `--runtime` a exclusividade é suspensa — é o escape hatch de cli.py:652',
  );
});

test('a partição não recusa membro do MESMO lado', () => {
  // `--skill` e `--ai-framework` são da mesma classe: uma linha com os dois é
  // válida. Um grupo exclusivo plano recusaria, e estaria errado.
  const estado = ligar(INSTALL, 'terminal', {'--skill': 'x'});
  assert.equal(avaliar(INSTALL, estado)['--ai-framework'].permitida, true);
});

test('a proibição por presença recusa a flag nomeada, e só ela', () => {
  const estado = ligar(LIST, 'sempre', {'--from': 'https://exemplo/repo'});
  const veredito = avaliar(LIST, estado);
  assert.equal(veredito['--ai-framework'].permitida, false);
  assert.equal(veredito['--ai-framework'].classe, 'UnsupportedRemoteListUnitError');
  assert.equal(veredito['--skill'].permitida, true);
});

test('a precedência decide qual mensagem o leitor vê quando duas regras batem', () => {
  // `--from` mais um seletor: a exclusividade tem precedência 1 e a proibição
  // tem 2, então quem fala é a exclusividade. A ordem de avaliação da CLI é o
  // que decide, e é por isso que `precedencia` é campo do contrato.
  const estado = ligar(LIST, 'sempre', {'--from': 'https://exemplo/repo', '--skill': 'x'});
  assert.equal(avaliar(LIST, estado)['--ai-framework'].classe, 'TooManySelectorsError');
});

test('o painel nunca monta uma linha que a própria avaliação recusa', () => {
  // A invariante que o painel inteiro existe para ter: se `avaliar` diz que a
  // flag não é permitida, `montar` não a escreve.
  const estado = ligar(LIST, 'sempre', {'--skill': 'x', '--bundle': 'y'});
  const veredito = avaliar(LIST, estado);
  const linha = montar(LIST, estado);
  for (const [nome, campo] of Object.entries(veredito)) {
    if (!campo.permitida) {
      assert.ok(!linha.includes(nome), `${nome} está recusada e mesmo assim entrou na linha`);
    }
  }
});

// ---------------------------------------------------------------------------
// A coerência do modelo — as recusas novas do portão 5
// ---------------------------------------------------------------------------

/** Um contrato mínimo que passa, para deformar um campo de cada vez. */
const contratoCom = (entrada) => ({
  contrato: 'assinatura',
  versao: 2,
  biblioteca: {modulo: 'overpower'},
  rotulos: {aplicacao: 'Aplicação', comando: 'Comando'},
  entradas: [
    {
      id: 'raiz',
      especie: 'aplicacao',
      titulo: 'overpower',
      qualificado: 'overpower',
      resumo: 'r',
      descricao: 'd',
      fluxo: [entrada.id],
      parametros: [],
      retorno: null,
      erros: [],
    },
    entrada,
  ],
});

const recusasDe = (contrato) => validar(contrato).map((r) => r.recusa);

test('grupo exclusivo com menos de dois membros reprova', () => {
  const recusas = recusasDe(
    contratoCom({
      ...LIST,
      titulo: 'overpower list',
      resumo: 'r',
      descricao: 'd',
      retorno: null,
      erros: [],
      restricoes: [{tipo: 'exclusivo', precedencia: 1, membros: ['--skill'], mensagem: 'm', exit: 2}],
    }),
  );
  assert.ok(recusas.includes(RECUSAS.grupoExclusivoDeUm), recusas.join(', '));
});

test('`minimo` que nomeia flag inexistente reprova', () => {
  const recusas = recusasDe(
    contratoCom({
      ...LIST,
      titulo: 'overpower list',
      resumo: 'r',
      descricao: 'd',
      retorno: null,
      erros: [],
      minimo: [{contexto: 'sempre', flags: ['--nao-existe']}],
    }),
  );
  assert.ok(recusas.includes(RECUSAS.modeloNomeiaFlagInexistente), recusas.join(', '));
});

test('restrição que nomeia flag inexistente reprova', () => {
  const recusas = recusasDe(
    contratoCom({
      ...LIST,
      titulo: 'overpower list',
      resumo: 'r',
      descricao: 'd',
      retorno: null,
      erros: [],
      restricoes: [
        {
          tipo: 'exclusivo',
          precedencia: 1,
          membros: ['--skill', '--fantasma'],
          mensagem: 'm',
          exit: 2,
        },
      ],
    }),
  );
  assert.ok(recusas.includes(RECUSAS.modeloNomeiaFlagInexistente), recusas.join(', '));
});

test('flag exclusiva exigida por todo mínimo reprova, porque a linha não fecha', () => {
  const recusas = recusasDe(
    contratoCom({
      ...LIST,
      titulo: 'overpower list',
      resumo: 'r',
      descricao: 'd',
      retorno: null,
      erros: [],
      minimo: [{contexto: 'sempre', flags: ['--skill', '--bundle']}],
    }),
  );
  assert.ok(recusas.includes(RECUSAS.exclusivaObrigatoria), recusas.join(', '));
});

test('`separador` sem `multiplo` reprova, porque nada seria separado', () => {
  const recusas = recusasDe(
    contratoCom({
      ...LIST,
      titulo: 'overpower list',
      resumo: 'r',
      descricao: 'd',
      retorno: null,
      erros: [],
      parametros: [{nome: '--skill', tipo: 'name', aridade: {multiplo: false, separador: ','}}],
      restricoes: [],
      minimo: [{contexto: 'sempre', flags: []}],
    }),
  );
  assert.ok(recusas.includes(RECUSAS.aridadeIncoerente), recusas.join(', '));
});

test('os dois contratos commitados passam na coerência do modelo', () => {
  for (const caminho of ['contratos/overpower.pt-BR.json', 'contratos/overpower.en.json']) {
    assert.deepEqual(validar(lerContrato(caminho)), [], caminho);
  }
});
