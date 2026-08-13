/**
 * A landing — a segunda das duas rupturas de layout do site.
 *
 * **Quatro seções**, uma faixa de espetáculo cobrindo a primeira, três camadas
 * de profundidade paradas, e a única licença de "wow" do projeto.
 *
 * A licença não é adjetivo: ela é uma **lista fechada de seis**, e cada linha é
 * contagem que `scripts/portao-8-landing.sh` confere. Um sétimo efeito é
 * extravagância por definição.
 *
 * **Ela não inventa componente nenhum.** Compõe, aqui no JSX, o que o catálogo
 * já tem — `card`, `card-group`, `code-group`, `code-block`, `icon`.
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
 * **A figura morreu, e com ela a única imagem do site.** O trilho era literal
 * enquanto o produto se chamava Trilho; o `panlabs` não tem referente, e uma
 * figura nova seria invenção pura na página que já carrega a procedência mais
 * frágil do sistema. O que resta de origem própria aqui é composição de partes
 * que já existem, não um desenho.
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

/**
 * A laje: **a mesma tarefa nos três lugares do cenário fixado.**
 *
 * Não é um primeiro uso — é a textura do material. Um acervo pessoal não tem
 * "a primeira cobrança"; o que ele tem é a mesma rotação de segredo escrita em
 * Python, em GitHub Actions e no comando cru da AWS, e o que a laje mostra é
 * que os três moram no mesmo lugar.
 *
 * **Quem nomeia a laje são as abas**, e não um `<h2>`. Aquele heading saiu, e
 * não é economia de pixel: são 56px devolvidos ao orçamento da dobra — o
 * heading (32) mais o `gap` da seção (24). Ver docs/design/landing.md §4.
 */
const PYTHON = `# o segredo vazou num commit; na terceira vez a rotação virou skill de esteira
from panlabs.segredos import Rotacao, PropagacaoParcial

rotacao = Rotacao(segredo="prod/api/chave-externa", regiao="us-east-1")

try:
    nova = rotacao.executar(propagar_para=["esteira", "runtime"], esperar=True)
except PropagacaoParcial as erro:
    # o runtime só relê no próximo deploy — a esteira já está na versão nova
    print(erro.pendentes, erro.versao_ativa)
`;

const ACTIONS = `# .github/workflows/rotacao.yml
- name: Rotacionar a chave externa
  uses: panlabs/rotacao-de-segredo@v2
  with:
    segredo: prod/api/chave-externa
    regiao: us-east-1
    propagar-para: esteira,runtime
`;

const AWS = `# quando a skill não serve: o comando cru, com o lambda de rotação já criado
aws secretsmanager rotate-secret \\
  --secret-id prod/api/chave-externa \\
  --region us-east-1 \\
  --rotation-lambda-arn "$ARN_ROTACAO"
`;

/**
 * Seção 2 — **a aposta desta landing**, e a única coisa aqui que nenhuma
 * documentação copia.
 *
 * Ela consome direto o heading que o índice de jornada torna obrigatório e
 * greppável, e sobe para antes das portas porque **argumento não mora embaixo
 * da navegação**. Impacto por conteúdo, não por efeito.
 *
 * Coluna, não grade: o ritmo entre as duas seções de baixo é ritmo de FORMA,
 * agora que só sobrou uma grade na página.
 */
const FALHAS = [
  {
    tentativa: 'Ligar a varredura em modo bloqueante no primeiro dia.',
    linha:
      'Seis repositórios pararam, e nenhum achado era acionável. Voltou para relatório por três meses antes de bloquear de novo.',
    capitulo: 'Security Champion › A varredura que reprovava tudo',
  },
  {
    tentativa: 'Versionar o contrato por data.',
    linha:
      '2024-03-14 não diz se quebra. Trocado por semver no dia em que o terceiro consumidor apareceu sem aviso.',
    capitulo: 'API Owner › A política de versão',
  },
  {
    tentativa: 'Depreciar avisando no changelog.',
    linha:
      'Ninguém lê changelog de serviço interno. O aviso passou a sair no próprio response, com header e prazo.',
    capitulo: 'API Owner › Depreciar em seis meses',
  },
];

/**
 * Seção 3 — uma porta por tab, com **ícone e contagem**.
 *
 * Cartão de navegação com número é conteúdo; sem número é decoração. As portas
 * de hoje eram declaradas *"sem ícone, e é ritmo, não esquecimento"* — elas
 * ganham glifo por decisão, não por herança, sob uma regra: **a porta não pode
 * repetir o glifo de nenhuma das categorias que ela abre**, senão o cartão e um
 * quarto da aba leem a mesma hierarquia.
 *
 * **A árvore chegou, e as contagens fecham.** A landing prometia `2 jornadas ·
 * 10 capítulos`, `5 categorias · 19 páginas` e `4 famílias · 21 páginas` antes
 * de o conteúdo existir; os três números são agora o que o portão 4 conta — com
 * a ressalva de que as 6 últimas de `Ferramentas` são o ramo gerado de
 * `Biblioteca C`, que é o ticket seguinte. **Nada liga os dois lados**: mudar
 * uma contagem aqui sem mudar a árvore não reprova em lugar nenhum.
 *
 * Os `href` deixaram de apontar para a tab que ocupava a posição e passaram a
 * apontar para a raiz de cada aba — o destino da categoria clicável, que é onde
 * a sidebar abre.
 */
const PORTAS = [
  {
    titulo: 'Jornadas',
    icone: 'book-open',
    href: '/jornadas/api-owner/indice',
    linha:
      'Dois papéis, na ordem em que aconteceram — e cada índice termina com o que não funcionou.',
    conta: '2 jornadas · 10 capítulos',
  },
  {
    titulo: 'Procedimentos',
    icone: 'terminal',
    href: '/procedimentos/ambiente/indice',
    linha:
      'Ambiente, esteiras, infraestrutura, acessos e diagnóstico. O passo a passo que a máquina cobra.',
    conta: '5 categorias · 19 páginas',
  },
  {
    titulo: 'Ferramentas',
    icone: 'wrench',
    href: '/ferramentas/bibliotecas/indice',
    linha:
      'Bibliotecas, módulos Terraform, skills e servidores MCP — o que saiu daqui para outros times.',
    conta: '4 famílias · 21 páginas',
  },
];

export default function Home() {
  return (
    <Layout description="O acervo pessoal de aprendizado de um desenvolvedor: as jornadas na ordem em que aconteceram, os procedimentos que a esteira exige, e as ferramentas que saíram daqui.">
      <main>
        {/* ------------------------------------------------------------------
            A faixa de espetáculo — a ÚNICA do site.

            Uma faixa contínua, cobrindo o hero inteiro: a laje de código está
            DENTRO dele, e não numa segunda seção. O footer fica fora porque ele
            aparece em toda página, e ilha que aparece em toda página deixa de
            ser ilha. As seções de baixo ficam fora porque coluna de texto e
            grade de cartão são oclusão pura, e oclusão atravessa os modos
            sozinha.

            **Com o cartão morto, esta é a única região do site que declara os
            próprios tokens.** O site plano é pré-requisito da ilha, não
            argumento contra ela: um elemento vivo num sistema imóvel lê como
            assinatura; dois é enfeite.

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
          {/* **Uma seção só**, e é o que o `<h2>` que saiu comprou: título,
              pitch, botões e a laje de código são a mesma unidade editorial, e
              o `<main>` tem exatamente TRÊS `<section>`. A quarta seção é o
              footer, que vem do `<Layout>` e mora fora do `<main>`. */}
          <section>
            <div className={estilos.topo}>
              {/* Camada 1 — a luz, e ela são DOIS focos.

                O magenta ancora na aresta de cima da laje: a luz nasce ATRÁS do
                material em vez de flutuar num fundo qualquer. O cyan fica no
                canto oposto, parado. O critério que autoriza a ilha continua
                sendo emissão, e o segundo foco não o afrouxa — é luz emitida
                pelo mesmo mecanismo, num tom diferente.

                É este contêiner que carrega a ENTRADA da ilha — a luz sobe uma
                vez, no carregamento, e termina sozinha.

                `data-sd-part` no magenta não é enfeite de contrato: é o único
                gancho por onde o bloco `reduce` de `tokens.css` alcança este
                elemento para remover a respiração, e a classe do módulo é
                hasheada. O cyan NÃO ganha parte publicada — ele não respira,
                então não há nada que precise alcançá-lo, e parte se publica
                quando o CSS não chega de outro jeito. */}
            <div className={estilos.luz}>
              <span
                className={clsx(estilos.foco, estilos.focoMagenta)}
                data-sd-part="glow"
              />
              <span className={clsx(estilos.foco, estilos.focoCyan)} />
            </div>

            {/* Camada 2 — o conteúdo do hero.

                O bloco É o container, como todo bloco desta página. A medida de
                leitura vive DENTRO dele, como teto do pitch — nunca como um
                segundo bloco centrado. É essa regra que faz título, pitch,
                botões, laje, lista de falhas e grade começarem todos no mesmo
                x. Ver docs/design/landing.md §3. */}
              <div className={estilos.bloco}>
                <h1 className={estilos.titulo}>O que funcionou, e o que não</h1>
                <p className={estilos.pitch}>
                  As jornadas na ordem em que aconteceram, os procedimentos que
                  a esteira exige, e as ferramentas que saíram daqui.
                </p>
                <div className={estilos.acoes}>
                  <Link
                    className={clsx(estilos.acao, estilos.acaoPrimaria)}
                    to="/jornadas/api-owner/indice">
                    Abrir o acervo
                  </Link>
                  <Link
                    className={clsx(estilos.acao, estilos.acaoSecundaria)}
                    to="/ferramentas/bibliotecas/indice">
                    Ferramentas
                  </Link>
                </div>
              </div>
            </div>

            {/* Camada 3 — a laje, e ela toma o container. É isso que faz dela o
                argumento em vez de um anexo: é o objeto mais largo da página.

                **A seção do código não morreu; ela fundiu com o hero** — está
                dentro do mesmo `<section>`. O `<h2>` saiu, e quem nomeia a laje
                são as abas do próprio `<CodeGroup>`.

                Dentro da ilha o bloco de código renderiza ESCURO mesmo no modo
                claro, e não porque ele carregue substrato próprio — ele continua
                não carregando nenhum. É a ilha que declara os tokens escuros, e
                o bloco só lê os tokens do lugar onde está. Com
                `--sd-surface-code` na parada 900, ele **se vê** como superfície
                contra a página aqui dentro; antes isso só acontecia por estar
                dentro do cartão. */}
            <div className={clsx(estilos.bloco, estilos.laje)}>
              <CodeGroup>
                {cerca('python', 'rotacao.py', PYTHON)}
                {cerca('yaml', 'rotacao.yml', ACTIONS)}
                {cerca('bash', 'aws-cli', AWS)}
              </CodeGroup>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------------
            Seções 2 e 3 — fora da faixa, e as duas que revelam por rolagem.

            A regra é conferível: revela o que nasce abaixo da dobra. O hero e a
            laje nascem acima dela, e `animation-timeline: view()` numa peça já
            visível começa com a linha do tempo parcialmente percorrida.
            ------------------------------------------------------------------ */}
        <section className={clsx(estilos.secao, estilos.revela)}>
          <header className={estilos.bloco}>
            <h2 className={estilos.tituloDeSecao}>O que não funcionou</h2>
            <p className={estilos.lede}>
              Todo índice de jornada fecha com esta seção. Três do que está
              publicado.
            </p>
          </header>
          <div className={estilos.bloco}>
            <ul className={estilos.falhas}>
              {FALHAS.map((falha) => (
                <li key={falha.capitulo}>
                  <strong>{falha.tentativa}</strong> {falha.linha}
                  <span className={estilos.capitulo}>{falha.capitulo}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={clsx(estilos.secao, estilos.revela)}>
          <header className={estilos.bloco}>
            <h2 className={estilos.tituloDeSecao}>As três portas</h2>
            <p className={estilos.lede}>
              O acervo é dividido pelo que você está fazendo, não pelo tamanho
              do texto.
            </p>
          </header>
          <div className={estilos.bloco}>
            <CardGroup>
              {PORTAS.map((porta) => (
                <Card
                  key={porta.titulo}
                  title={porta.titulo}
                  icon={porta.icone}
                  href={porta.href}>
                  <p>{porta.linha}</p>
                  <p className={estilos.conta}>{porta.conta}</p>
                </Card>
              ))}
            </CardGroup>
          </div>
        </section>

        {/* Seção 4 — o footer, e ele é o do site, sem variante. Vem do
            `<Layout>`, fora do `<main>`. */}
      </main>
    </Layout>
  );
}
