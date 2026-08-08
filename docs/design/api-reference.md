# Referência da API

A segunda ruptura de layout do site — a primeira é a landing. Trinta
páginas, geradas de contrato OpenAPI (ver [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md)
para a decisão de arquitetura; este documento é o desenho), um componente de
tema próprio (`ApiDocItem`, ver [`swizzle.md`](swizzle.md)), e um único
degrau de interatividade confinado a um painel.

**Nenhum valor numérico nasce aqui sem citar `tokens.md`.** Os comprimentos
moram lá; este documento faz contas com eles.

---

## 1. A aritmética decide o layout, não o gosto

```
672 (--sd-prose-width) + 32 (--sd-space-8) + 448 = 1152 (--sd-container-width)
```

O painel não é uma largura escolhida — é o resto da conta:

```
448 = calc(var(--sd-container-width) - var(--sd-prose-width) - var(--sd-space-8))
```

`--sd-space-8` aqui é o gutter **entre as duas colunas desta grade**, não o
`--sd-gutter` do shell do site (que seria o espaço entre o cartão e a
sidebar/TOC numa página comum) — os dois têm o mesmo valor de raiz por
coincidência de escala, não porque sejam o mesmo token.

A soma fecha exatamente o container, e é isso que fecha a decisão central
da rota: **não sobra pixel para os 96px de preenchimento do cartão**
(2 × `--sd-space-12`, o mesmo preenchimento que `.theme-doc-markdown` usa em
toda página comum). A página de endpoint é a única do site sem cartão — não
por escolha visual, por aritmética de grid. É a décima perda nomeada, no
§6.

O que resolve isso sem ficar com uma página nua: **o painel é o cartão.**
Ele carrega preenchimento, raio e sombra — os mesmos tokens de elevação do
cartão comum, só que com um preenchimento menor (`--sd-space-6`, não
`--sd-space-12` — não sobra pixel para o maior). Continua havendo
exatamente **uma** superfície elevada na tela; ela só migrou de dono.

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
| ausente | delega para `@theme/DocItem`, sem tocar em mais nada | `--sd-doc-width` (864, cartão) | coluna de 288, se houver heading |
| presente | layout próprio, `LayoutComPainel` | `--sd-prose-width` (672, sem cartão) | ausente — o painel ocupa o espaço |

A perna "ausente" é a que prova que o painel é **inalcançável, não vazio**,
quando a página não é de endpoint: `Referência da API › Introdução ›
Autenticação` é a fixture — prosa autoral, zero `api_exemplos`, cartão e
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
  top: var(--sd-navbar-height); /* 56px — gruda abaixo do navbar fixo, não no topo absoluto */
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
   (ver [`verb-badge.md`](componentes/verb-badge.md)), o autor nunca
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
chegar nela. É consequência pura da aritmética do §1: 672 + 32 + 448 fecha
o container exato, sem sobra para os 96px que o cartão precisaria.

| # | Perda | Por quê |
| ---: | --- | --- |
| 10 | A página de endpoint não tem cartão nem breakout | não sobra largura para o preenchimento do cartão — a soma das três medidas já fecha o container; ver §1 |

**A perda 10 não é troca de um cartão por nada.** O painel herda a
elevação — preenchimento, raio, sombra — e continua havendo exatamente uma
superfície elevada na página. O que se perde é o breakout: sem cartão, não
existe "interior" do qual código ou tabela larga possam escapar. Na
prática isso nunca aperta, porque o gerador nunca emite cerca de código no
corpo — todo bloco vive no painel — e a única tabela que a prosa gerada
produz (`## Erros`) cabe dentro dos 672px sem precisar respirar mais.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A aritmética 672 + 32 + 448 = 1152 | origem própria | issue #38 — a medida de prosa, o gutter e o painel medido somam o container travado pela #14 |
| O painel é o cartão | origem própria | issue #38 — resolve a falta de espaço para o preenchimento sem perder a elevação |
| Front matter em vez de marcador em MDX | origem própria | `position: sticky` exige ancestral com contexto de rolagem previsível |
| Nenhuma página da instância carrega `hide_table_of_contents` | origem própria | seria segunda fonte para uma decisão que o componente já toma |
| `align-self: start` com `position: sticky` | **origem própria (implementação)** | o erro nº 1 medido ao implementar o layout — sem ele o item estica e sticky não tem onde grudar |
| Offset do sticky em `--sd-navbar-height` | herdado | o valor já é medido em `tokens.md` |
| Zero `order`, DOM fixo prosa-depois-painel | origem própria | issue #38 — a mesma ordem em `row` largo e `column` estreito |
| A ordem das seções de endpoint | origem própria (implementação) | decidida ao escrever `scripts/gerar-api.mjs` |
| O gerador e o contrato | origem própria | [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) |
| As nove perdas nomeadas, restatadas | herdado | [`swizzle.md`](swizzle.md) §4 |
| A décima perda, desta rota | origem própria | issue #38 — consequência aritmética do §1, não do orçamento `unsafe` |
