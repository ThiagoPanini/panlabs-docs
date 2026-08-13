# Referência da API

A segunda ruptura de layout do site — a primeira é a landing. Trinta
páginas, geradas de contrato OpenAPI (ver [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md)
para a decisão de arquitetura; este documento é o desenho), um componente de
tema próprio (`ApiDocItem`, ver [`swizzle.md`](swizzle.md)), e um único
degrau de interatividade confinado a um painel.

**Nenhum valor numérico nasce aqui sem citar `tokens.md`.** Os comprimentos
moram lá; este documento faz contas com eles.

---

> ### Errata — o contrato deixou de falar HTTP, e este documento está entre dois
>
> A árvore do `panlabs` ([#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81)) **matou o produto que este documento descreve.** Não há mais API de pagamentos, não há mais instância `api`, não há mais contrato OpenAPI, não há mais gerador `gerar-api.mjs`, e o `VerbBadge` saiu do catálogo por não ter sobrado verbo HTTP para pintar.
>
> **O que sobreviveu, e está no ar:** o `ApiDocItem` como componente de tema próprio (degrau 2), o comutador por front matter, a aritmética do layout de três colunas, e `align-self: start` junto com `position: sticky`. A instância que o declara agora é `ferramentas`, e as 15 folhas autorais dela passam pela perna que **delega** — o painel é inalcançável, não vazio.
>
> **O que morreu e ainda está escrito abaixo:** tudo o que descreve verbo, caminho, `paths`, `requestBody`, snippet de cURL e as 24 páginas geradas de endpoint. **Leia como registro histórico**, não como spec.
>
> Este documento é **renomeado e reescrito** no ticket seguinte, contra um contrato de assinatura de função, tipo e módulo. Reescrevê-lo aqui seria escrever contra um contrato que ainda não existe.

> ### Errata — o cartão morreu, e com ele a premissa deste documento
>
> A geometria `mint` ([#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78)) matou o cartão da página de doc: **nenhuma página do site tem fundo, anel, preenchimento ou raio no corpo.** Ver [`chrome.md`](chrome.md) §2.
>
> Três consequências caem sobre este documento, e ele **é reescrito no slice da Referência da API**, não aqui:
>
> - **os números da aritmética mudaram**, e estão corrigidos abaixo — a medida de prosa foi de 672 para 720, e o painel, que é o resto da conta, de 448 para 400. A soma continua fechando o container exato, **sem uma linha de ajuste**: o `calc()` deriva em vez de repetir, e foi ele que absorveu a troca sozinho;
> - **a frase *"o painel é o cartão"* perdeu o referente.** Não há cartão do qual ele seja a versão desta página. O painel continua sendo objeto porque é um bloco de dados ao lado do texto, não porque herdou uma moldura;
> - **a perda 10 perdeu a premissa.** Ela dizia que esta é *"a única página do site sem cartão"*. Hoje isso vale para todas, e a perda que sobrevive é outra e menor: **esta página não tem TOC**, porque o painel ocupa a coluna dele.
>
> O que continua verdadeiro sem ressalva: a aritmética manda no layout, o comutador é o front matter, e o `position: sticky` do painel exige `align-self: start`.

## 1. A aritmética decide o layout, não o gosto

```
720 (--sd-prose-width) + 32 (--sd-space-8) + 400 = 1152 (--sd-container-width)
```

O painel não é uma largura escolhida — é o resto da conta:

```
400 = calc(var(--sd-container-width) - var(--sd-prose-width) - var(--sd-space-8))
```

`--sd-space-8` aqui é o gutter **entre as duas colunas desta grade**, não o
`--sd-gutter` do shell do site (que seria o espaço entre a coluna de conteúdo e
a sidebar/TOC numa página comum) — os dois vêm da mesma escala por coincidência
de valor, não porque sejam o mesmo token.

**É o `calc()` que faz esta seção sobreviver à geometria `mint`.** A prosa subiu
de 672 para 720 e o painel desceu de 448 para 400 **sozinho**, sem uma linha de
ajuste — e a soma continua fechando o container no pixel. Um 448 cravado teria
quebrado calado.

## 2. O comutador, nas duas pernas

`ApiDocItem` decide pelo front matter `api_exemplos` — nunca por marcador
solto no corpo do MDX, e nunca por `hide_table_of_contents`. As duas razões
são mecânicas, não estéticas:

- um marcador em MDX obrigaria o painel a ser irmão de grid dos
  parágrafos, e `position: sticky` precisa de um ancestral com contexto de
  rolagem previsível — não de uma posição arbitrária que o fluxo do
  Markdown decidiu;
- `hide_table_of_contents` seria segunda fonte de verdade para uma decisão
  que o componente já toma sozinho ao ler o front matter — e é por isso que
  **nenhuma página desta instância carrega esse campo**.

| `api_exemplos` | Layout | Largura da coluna de conteúdo | TOC |
| --- | --- | --- | --- |
| ausente | delega para `@theme/DocItem`, sem tocar em mais nada | `--sd-prose-width` (720, dentro da coluna de 864) | coluna de 288, se houver heading |
| presente | layout próprio, `LayoutComPainel` | `--sd-prose-width` (720) | ausente — o painel ocupa o espaço |

A perna "ausente" é a que prova que o painel é **inalcançável, não vazio**,
quando a página não é de endpoint: `Referência da API › Introdução ›
Autenticação` é a fixture — prosa autoral, zero `api_exemplos`, coluna e
TOC como qualquer página de doc comum. Uma implementação que deixasse uma
coluna direita vazia ali estaria errada; o correto é essa coluna nem
existir, porque a página passou pela **outra** perna do comutador.

A perna "presente" é as vinte e quatro páginas geradas. Nenhuma delas
declara `hide_table_of_contents`, e a ausência de TOC nelas é 100%
consequência de `ApiDocItem` nunca renderizar `@theme/TOC` neste ramo — não
de front matter nenhum.

## 3. `align-self: start`, junto com `position: sticky`

**O erro nº 1 de quem reconstrói este layout.** Dentro de um `display: flex`
com `align-items: stretch` (o default), um item de flex sem `align-self`
próprio estica para a altura do irmão mais alto — aqui, a prosa. Um painel
esticado para a altura da prosa **já preenche toda a área de rolagem
disponível**, então `position: sticky` não tem para onde grudar: parece
travado desde o topo, e o sintoma é sutil o bastante para passar batido
numa tela onde a prosa é curta.

```css
.colunaPainel {
  align-self: start;
  position: sticky;
  top: var(--sd-topo-grudado); /* o topo INTEIRO: com a faixa de tabs montada, a linha 1 sozinha deixaria o painel deslizar por baixo dela */
}
```

`align-self: start` encolhe o painel para a altura do próprio conteúdo, e é
só depois disso que "sticky" tem alguma distância para percorrer.

**Zero `order`, zero duplicação de HTML por breakpoint.** O DOM é sempre
prosa-depois-painel; o que muda entre largo e estreito é só
`flex-direction` (`column` abaixo de 997px, `row` a partir dele — o mesmo
limiar único do projeto inteiro). No estreito, isso empilha o painel
**depois** da prosa, sem regra a escrever: é a mesma ordem do DOM, só que
lida de cima para baixo em vez de lado a lado. A largura fixa das duas
colunas só existe dentro da media query de 997px — declará-la fora
aplicaria a `flex-basis` no eixo errado (altura, não largura) quando
`flex-direction` é `column`.

## 4. A ordem das seções da página de endpoint

Fixa, e o gerador a produz sempre na mesma sequência:

1. `# Título` — o `summary` da operação
2. `<VerbBadge/>` mais o caminho, em prosa — o gerador escreve a pílula
   (ver `componentes/verb-badge.md`, **removido** com o catálogo), o autor nunca
3. A `description` da operação
4. `## Parâmetros` — um `<ParamField>` por parâmetro de caminho, consulta
   e cabeçalho, nesta ordem; ausente quando a operação não tem nenhum
5. `## Corpo` — a árvore `<ParamField>` do `requestBody`, ausente em `GET`
   e em operações sem corpo
6. `## Resposta` — a árvore `<ResponseField>` da resposta de sucesso (a
   primeira `2xx`); "Sem corpo." nas que não têm
7. `## Erros` — uma tabela Status/Quando para as respostas restantes

O painel, à direita, não é uma seção da prosa — ele é a **outra** coluna, e
a ordem dele é interna e fixa: verbo + caminho, a fileira de parâmetros
editáveis (só quando existem), as abas de linguagem (sempre), as abas de
resposta (sempre que há respostas documentadas).

**No estreito, o painel completo vem depois de toda a prosa** — não
intercalado por seção. É consequência do §3: a grade tem exatamente dois
filhos, prosa e painel, e o empilhamento respeita essa fronteira.

## 5. O gerador e o contrato

Resumo; a decisão de arquitetura completa está no
[ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md).

`contratos/trilho.pt-BR.json` e `contratos/trilho.en.json` — OpenAPI 3.1,
JSON puro, estruturalmente congruentes. `scripts/gerar-api.mjs` os lê,
valida (`scripts/lib/openapi.mjs`), e escreve 24 páginas `.mdx` nos dois
locales mais `sidebars-api.js`. Rodado à mão, fora do build; a saída é
commitada, e `npm run portao:5` reprova se regenerar produzir um diff
contra o que está commitado.

**Os seis autorais não vêm do contrato**, e o gerador precisa conhecê-los
mesmo assim, porque é ele quem monta a árvore inteira da sidebar: as cinco
folhas de `Introdução` e `Webhooks › Catálogo de eventos` entram num
pequeno manifesto dentro do próprio `scripts/gerar-api.mjs`, não porque
sejam geradas, mas porque a posição delas na árvore é.

Os três snippets de cada endpoint — cURL, Python, JavaScript — são
**templados**, não escritos por operação: o gerador deriva o método, o
caminho, os parâmetros e o `requestBody.example` do contrato, e produz os
três textos por função genérica. Nenhuma das dezenove operações tem um
snippet hand-rolado à parte — é a mesma disciplina de zero-segunda-fonte
que motivou o gerador inteiro.

## 6. As nove perdas nomeadas da rota vanilla, e a décima desta rota

O ledger completo, com o motivo de cada uma, mora em
[`swizzle.md`](swizzle.md) §4. Aqui elas entram numa linha cada, porque um
leitor desta página precisa saber o que a rota comum **já** não tem, antes
de entender o que esta rota acrescenta.

| # | Perda |
| ---: | --- |
| 1 | Nó injetado dentro do corpo da página — eyebrow, bloco de feedback, CTA lateral |
| 2 | Breadcrumb reestruturado como a eyebrow da âncora |
| 3 | A proporção da âncora entre conteúdo e painel |
| 4 | Faixa de tabs de largura total abaixo do navbar |
| 5 | TOC com anatomia nova — barra de progresso, seções extras |
| 6 | Ícone preso dentro de componente `unsafe` mantém o desenho do Docusaurus |
| 7 | Footer dentro da coluna de prosa, como a âncora faz |
| 8 | Armadilha de foco na sidebar de tela estreita |
| 9 | Posição do botão de voltar ao topo na ordem de tabulação |

A décima é desta rota, e diferente das nove: não é preço do orçamento
`unsafe` zero — `ApiDocItem` não esbarrou em nenhum limite de swizzle para
chegar nela. É consequência pura da aritmética do §1: 720 + 32 + 400 fecha
o container exato, e não sobra coluna para o TOC.

| # | Perda | Por quê |
| ---: | --- | --- |
| 10 | A página de endpoint não tem TOC | a soma das três medidas já fecha o container, e a coluna do TOC é justamente o que o painel ocupa; ver §1 |

**A perda 10 encolheu com a geometria `mint`.** Ela dizia *"a página de
endpoint não tem cartão nem breakout"*; hoje nenhuma página tem cartão e
nenhuma tem breakout, então isso deixou de ser uma perda DESTA rota. O que
sobra é o TOC: o painel ocupa a coluna dele, e o leitor navega a página pela
lista de operações da sidebar em vez de pela dos headings. Na prática isso
nunca aperta, porque o gerador emite duas seções de prosa por página.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A aritmética 720 + 32 + 400 = 1152 | origem própria | issue #38 — a medida de prosa, o gutter e o painel somam o container; o `calc()` absorveu a troca de medida da [#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78) sem ajuste |
| O painel é objeto, e o único do corpo | **origem própria (correção)** | era *"o painel é o cartão"*; o cartão morreu na [#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78) e o painel sobrevive por ser bloco de dados ao lado do texto, não moldura de prosa |
| Front matter em vez de marcador em MDX | origem própria | `position: sticky` exige ancestral com contexto de rolagem previsível |
| Nenhuma página da instância carrega `hide_table_of_contents` | origem própria | seria segunda fonte para uma decisão que o componente já toma |
| `align-self: start` com `position: sticky` | **origem própria (implementação)** | o erro nº 1 medido ao implementar o layout — sem ele o item estica e sticky não tem onde grudar |
| Offset do sticky em `--sd-topo-grudado` | **origem própria (correção)** | era `--sd-navbar-height`, que passou a medir só a linha 1 quando a faixa de tabs entrou na [#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78) |
| Zero `order`, DOM fixo prosa-depois-painel | origem própria | issue #38 — a mesma ordem em `row` largo e `column` estreito |
| A ordem das seções de endpoint | origem própria (implementação) | decidida ao escrever `scripts/gerar-api.mjs` |
| O gerador e o contrato | origem própria | [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) |
| As nove perdas nomeadas, restatadas | herdado | [`swizzle.md`](swizzle.md) §4 |
| A décima perda, desta rota | origem própria | issue #38 — consequência aritmética do §1, não do orçamento `unsafe` |
