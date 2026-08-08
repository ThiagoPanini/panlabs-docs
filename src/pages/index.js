/**
 * A landing — a segunda das duas rupturas de layout do site.
 *
 * Cinco seções, uma faixa de espetáculo cobrindo as duas primeiras, quatro
 * camadas de profundidade paradas, e a única licença de "wow" do projeto.
 *
 * **Ela não inventa componente nenhum.** Compõe, aqui no JSX, o que o catálogo
 * já tem — `card`, `card-group`, `code-group`, `code-block`, `icon`. O catálogo
 * fica em dezoito.
 *
 * **`<main>` é obrigatório.** Página de doc ganha um pelo layout; página em
 * `src/pages/` só tem se alguém escrever, e sem ele o skip link cai na reserva
 * e o marco de página fica errado. Ver docs/design/foco.md §7.
 *
 * A regra de `className` solto que o catálogo proíbe governa o **MDX** — o que
 * o autor de documentação escreve. Isto é JSX de rota com CSS Module, o mesmo
 * território onde o reveal por rolagem já morava. Não é exceção à regra; está
 * fora do escopo dela.
 *
 * Procedência: docs/design/landing.md.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import Card, {CardGroup} from '@site/src/components/Card';
import CodeGroup from '@site/src/components/CodeGroup';

import estilos from './index.module.css';

/**
 * A figura da camada 1 — **o slot trocável da landing**.
 *
 * O contrato inteiro, para quem transplantar o projeto e quiser outra landing
 * sem tocar em uma linha de CSS:
 *
 *   1. devolve **um** `<svg>`, e nada em volta dele;
 *   2. `viewBox` obrigatório; **sem** `width` e **sem** `height` — quem
 *      dimensiona é `.figura`, que a estica sobre a caixa inteira do hero;
 *   3. `preserveAspectRatio="none"`, porque a caixa do hero muda de proporção
 *      com a viewport e a figura precisa manter o ponto de fuga no mesmo lugar
 *      relativo. O traço não distorce junto por causa do (4);
 *   4. todo traço com `vector-effect="non-scaling-stroke"` — é ele que
 *      sobrevive ao esticão do (3);
 *   5. pinta com `currentColor`, nunca com valor próprio. A tinta desce de
 *      `.figura`, que a deriva dos tokens da ilha;
 *   6. `aria-hidden="true"` e `focusable="false"`. A figura é decoração, e o
 *      `pointer-events: none` que a tira do caminho do mouse vem do CSS.
 *
 * Cumprido o contrato, trocar esta função é trocar a landing inteira.
 *
 * **Uma versão, e acabou.** Dentro da ilha não existe modo claro, então esta
 * figura só encontra fundo escuro — o problema de imagem que a documentação
 * tem nos dois modos aqui não existe.
 *
 * A geometria é uma projeção em perspectiva de um ponto: os dois trilhos saem
 * do ponto de fuga e sangram pelas laterais, e os dormentes ficam em `u = i /
 * (i + 3)` sobre a reta, que é o espaçamento constante em profundidade visto de
 * frente. O degradê é interno à `<svg>` de propósito — é o que mantém o
 * contrato "troque o arquivo, não o CSS".
 *
 * Ela fica **fora do manifesto de ícones** e não consome nenhum dos 64: o
 * manifesto governa glifo de contorno em tamanho de UI, e figura sangrada não é
 * isso. Ver docs/design/icones.md §5.
 */
function FiguraDoTrilho() {
  return (
    <svg
      className={estilos.figura}
      viewBox="0 0 1440 560"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false">
      <defs>
        {/* O sumiço no ponto de fuga. `currentColor` nos dois stops: o que muda
            é só o alfa, então a tinta continua vindo de fora. */}
        <linearGradient
          id="sd-trilho-profundidade"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="120"
          x2="0"
          y2="560">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.35" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* `vector-effect` NÃO é herdado — SVG o declara assim —, então ele vai em
          cada traço e não no grupo. Grupo com o atributo é a armadilha silenciosa
          aqui: nada avisa, e o traço volta a distorcer com o esticão. */}
      <g fill="none" stroke="url(#sd-trilho-profundidade)">
        <path
          vectorEffect="non-scaling-stroke"
          strokeWidth="1"
          d="M-420 560H1860M-135 450H1575M36 384H1404M150 340H1290M231.4 308.6H1208.6M292.5 285H1147.5M340 266.7H1100M378 252H1062M409.1 240H1030.9M435 230H1005M456.9 221.5H983.1M475.7 214.3H964.3M492 208H948M506.3 202.5H933.8M518.8 197.6H921.2M530 193.3H910M540 189.5H900M549 186H891M557.1 182.9H882.9M564.5 180H875.5M571.3 177.4H868.7M577.5 175H862.5M583.2 172.8H856.8M588.5 170.8H851.5M593.3 168.9H846.7"
        />
        <path
          vectorEffect="non-scaling-stroke"
          strokeWidth="2"
          d="M-280 560L720 120M1720 560L720 120"
        />
      </g>
    </svg>
  );
}

/**
 * A cerca, montada à mão na forma exata que o MDX produz.
 *
 * `<CodeGroup>` lê cerca de Markdown: um `<pre>` cujo único filho é o `<code>`,
 * com `className` e `metastring` **no `<code>`**. Fora do MDX ninguém monta
 * essa forma, então ela é montada aqui — e este é o único lugar do projeto,
 * fora do próprio `CodeGroup`, que a conhece por escrito.
 *
 * **É uma fábrica, e não um componente, e a diferença é o defeito que ela
 * fecha.** O `CodeGroup` inspeciona as props dos filhos que recebe; com um
 * componente no meio, o que ele inspeciona são as props DELE, e `className` e
 * `metastring` nunca chegam. O sintoma é mudo: as abas saem numeradas e o
 * realce de sintaxe cai para texto puro. Chamada como função, ela devolve o
 * `<pre>` de verdade.
 *
 * O `<pre>` **nunca é renderizado**: o `CodeGroup` lê as props e devolve
 * `<CodeBlock>` no lugar. É por isso que `metastring`, que não é atributo de
 * DOM, não vira aviso do React.
 *
 * Compor `<Tabs>` e `<CodeBlock>` direto aqui seria mais curto e estaria
 * errado: a landing passaria a ter uma segunda anatomia de grupo de código, e o
 * dia em que o `code-group` mudasse ela não mudaria junto.
 *
 * @param {string} linguagem
 * @param {string} titulo
 * @param {string} codigo
 */
function cerca(linguagem, titulo, codigo) {
  return (
    <pre key={titulo}>
      <code className={`language-${linguagem}`} metastring={`title="${titulo}"`}>
        {codigo}
      </code>
    </pre>
  );
}

const CURL = `curl https://api.trilho.dev/v1/cobrancas \\
  -H "Authorization: Bearer $TRILHO_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: pedido-4821" \\
  -d '{"valor": 14990, "moeda": "BRL", "meio": "pix"}'
`;

const NODE = `const cobranca = await trilho.cobrancas.criar(
  {valor: 14990, moeda: 'BRL', meio: 'pix'},
  {idempotencyKey: 'pedido-4821'},
);

console.log(cobranca.pagamento.pix.copia_e_cola);
`;

const PYTHON = `cobranca = trilho.cobrancas.criar(
    valor=14990, moeda="BRL", meio="pix", idempotency_key="pedido-4821"
)

print(cobranca.pagamento.pix.copia_e_cola)
`;

/** Seção 3 — uma porta por tab do navbar. Sem ícone, e é ritmo, não esquecimento. */
const PORTAS = [
  {
    titulo: 'Documentação',
    href: '/docs/comece-aqui/visao-geral',
    linha:
      'Do primeiro POST ao webhook assinado, na ordem em que a integração acontece.',
  },
  {
    titulo: 'Referência da API',
    href: '/api-reference/introducao/visao-geral',
    linha:
      'Todo endpoint, todo campo e todo código de erro — gerados do contrato.',
  },
  {
    titulo: 'Receitas',
    href: '/receitas/intro',
    linha: 'Um problema por página, com o trecho pronto para copiar.',
  },
];

/** Seção 4 — cinco cartões pequenos, e a primeira aparição dos ícones de autoria. */
const COBERTURA = [
  {
    titulo: 'Pix',
    icone: 'zap',
    linha: 'Cobrança dinâmica, QR com expiração e devolução parcial.',
  },
  {
    titulo: 'Boleto',
    icone: 'file-text',
    linha: 'Registro, vencimento, desconto e baixa automática.',
  },
  {
    titulo: 'Cartão',
    icone: 'credit-card',
    linha: 'Tokenização, captura tardia e autenticação do emissor.',
  },
  {
    titulo: 'Split',
    icone: 'workflow',
    linha: 'Divide uma cobrança entre recebedores no momento da criação.',
  },
  {
    titulo: 'Assinaturas',
    icone: 'repeat',
    linha: 'Ciclos, prorrateio e retentativa com espera exponencial.',
  },
];

export default function Home() {
  return (
    <Layout description="Documentação do Trilho — a API de pagamentos brasileira. Pix, boleto, cartão, split e assinaturas numa interface só.">
      <main>
        {/* ------------------------------------------------------------------
            A faixa de espetáculo — a ÚNICA do site.

            Uma faixa contínua, cobrindo as seções 1 e 2. O footer fica fora
            porque ele aparece em toda página, e ilha que aparece em toda página
            deixa de ser ilha. As grades ficam fora porque grade de cartão é
            oclusão pura, e oclusão atravessa os modos sozinha.

            `data-sd-showcase` não tem valor, e isso é desenho: um atributo com
            valor convidaria alguém a escrever `="light"`, e ilha clara não
            existe. Dentro dele os tokens do escuro valem nos dois modos, então
            a faixa é inerte na troca de tema.

            String vazia e não `{true}` no JSX: as duas casam o seletor, mas
            `{true}` serializa como `data-sd-showcase="true"`, e um atributo com
            valor no HTML publicado é o convite que o nome dele existe para não
            dar.
            ------------------------------------------------------------------ */}
        <div className={estilos.faixa} data-sd-showcase="">
          <section className={estilos.hero}>
            {/* As camadas 1 e 2 num contêiner só, porque figura e glow são um
                objeto só: a luz na linha. É este contêiner que carrega a
                entrada da ilha — a luz sobe uma vez e termina. */}
            {/* `data-sd-part` no glow não é enfeite de contrato: é o único
                gancho por onde o bloco `reduce` de `tokens.css` alcança este
                elemento para remover a respiração. A classe do módulo é
                hasheada, e a camada de token não tem como conhecê-la. */}
            <div className={estilos.luz}>
              <FiguraDoTrilho />
              <span className={estilos.glow} data-sd-part="glow" />
            </div>

            {/* Camada 3 — o conteúdo do hero, em 672. É a medida de leitura do
                site inteiro, e mantê-la aqui é o que faz a landing ler como a
                mesma coisa que a documentação. */}
            <div className={estilos.prosa}>
              <h1 className={estilos.titulo}>
                A API de pagamentos que some do caminho
              </h1>
              <p className={estilos.pitch}>
                Pix, boleto, cartão e assinaturas numa API REST só — idempotente
                por contrato, com webhooks assinados.
              </p>
              <div className={estilos.acoes}>
                <Link
                  className={clsx(estilos.acao, estilos.acaoPrimaria)}
                  to="/docs/comece-aqui/visao-geral">
                  Começar
                </Link>
                <Link
                  className={clsx(estilos.acao, estilos.acaoSecundaria)}
                  to="/api-reference/introducao/visao-geral">
                  Referência da API
                </Link>
              </div>
            </div>
          </section>

          {/* Camada 4 — a laje, em 768, sobre tudo. Ela mantém o gutter:
              sangrar é o fundo, não o conteúdo.

              Dentro da ilha o bloco de código renderiza ESCURO mesmo no modo
              claro, e não porque ele carregue substrato próprio — ele continua
              não carregando nenhum. É a ilha que declara os tokens escuros, e o
              bloco só lê os tokens do lugar onde está. */}
          <section className={estilos.laje}>
            <h2 className={clsx(estilos.prosa, estilos.tituloDeSecao)}>
              A primeira cobrança
            </h2>
            <div className={estilos.codigo}>
              <CodeGroup>
                {cerca('bash', 'cURL', CURL)}
                {cerca('js', 'Node', NODE)}
                {cerca('python', 'Python', PYTHON)}
              </CodeGroup>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------------
            Seções 3 e 4 — fora da faixa, e as duas que revelam por rolagem.

            A regra é conferível: revela o que nasce abaixo da dobra. O hero e a
            laje nascem acima dela, e `animation-timeline: view()` numa peça já
            visível começa com a linha do tempo parcialmente percorrida.
            ------------------------------------------------------------------ */}
        <section className={clsx(estilos.secao, estilos.revela)}>
          <header className={estilos.prosa}>
            <h2 className={estilos.tituloDeSecao}>As três portas</h2>
            <p className={estilos.lede}>
              A documentação é dividida pelo que você está fazendo, não pelo
              tamanho do texto.
            </p>
          </header>
          <div className={estilos.grade}>
            <CardGroup>
              {PORTAS.map((porta) => (
                <Card key={porta.titulo} title={porta.titulo} href={porta.href}>
                  <p>{porta.linha}</p>
                </Card>
              ))}
            </CardGroup>
          </div>
        </section>

        <section className={clsx(estilos.secao, estilos.revela)}>
          <header className={estilos.prosa}>
            <h2 className={estilos.tituloDeSecao}>O que o Trilho cobre</h2>
            <p className={estilos.lede}>
              Cinco meios, uma autenticação, um formato de erro e um envelope de
              webhook.
            </p>
          </header>
          <div className={estilos.grade}>
            <CardGroup>
              {COBERTURA.map((meio) => (
                <Card key={meio.titulo} title={meio.titulo} icon={meio.icone}>
                  <p>{meio.linha}</p>
                </Card>
              ))}
            </CardGroup>
          </div>
        </section>

        {/* Seção 5 — o footer, e ele é o do site, sem variante. Vem do
            `<Layout>`, fora do `<main>`. */}
      </main>
    </Layout>
  );
}
