# Protótipo — centralização da área útil (issue #96)

## Pergunta

A centralização do grupo sidebar+conteúdo+TOC é alcançável por CSS puro sobre
classes estáveis do substrato nativo, sem ejeção `unsafe`?

## Por que a pergunta é real

`DocRoot/Layout/{Sidebar,Main}` são `unsafe` no ledger de swizzle. O elemento
que precisa ganhar `max-width` + `margin-inline: auto` para centralizar o
grupo é o `<div>` flex que envolve sidebar e `<main>` — mas essa `<div>` só
existe hoje sob uma classe hasheada de CSS Module (`styles.docRoot`), a mesma
categoria de seletor frágil que o `chrome.css` evita em todo o resto do
projeto (é a categoria citada em `docs/design/chrome.md` §1.2 para a largura
do TOC — "vive numa classe hasheada de CSS Module e custaria `unsafe`").

## Mecanismo testado

Seleção estrutural em vez de nominal — `<main>` é sempre filho direto dessa
`<div>`, e `<main>` é um landmark HTML5 estável:

```css
html.docs-doc-page div:has(> main) {
  max-width: 1472px; /* o congelamento, §1.1 */
  margin-inline: auto;
}
```

## Método

`docusaurus start` real, página real (`/procedimentos/esteiras/publicar-um-pacote-interno`),
chrome inteiro (navbar, sidebar, TOC, footer) — não espécime isolado. Chrome
headless (`puppeteer`, binário do cache `~/.cache/puppeteer`, sem entrar como
dependência do projeto) injeta a regra via `page.addStyleTag` em cima do HTML
já renderizado — nenhum arquivo do repo tocado. Medição via
`getBoundingClientRect`, duas larguras: 1920 (acima do congelamento) e 1300
(abaixo). Script: `prototype-centering.mjs`, saída bruta e capturas em
`proto-1920.png` / `proto-1300.png`.

## Resultado

- `div:has(> main)` casa **exatamente um** elemento na página — sem ambiguidade.
- A 1920: `sidebar.left` foi de `0` para `224`; `main.right` foi de `1920`
  para `1696` — `1920 − 1696 = 224`. As duas margens fecham **iguais**, é a
  correção que a issue-pai pede.
- A 1300 (abaixo do congelamento): nada mudou — comportamento correto, a
  cadeia ainda está crescendo, não há folga a distribuir.
- TOC continuou `position: sticky` antes e depois — o mecanismo não interfere
  na coluna a direita.
- `document.body.scrollWidth` igual à viewport nas duas larguras — sem
  overflow horizontal introduzido.
- Zero arquivo de `src/theme/` tocado — o teste não passa perto de swizzle.

## Veredito

**Passa.** A implementação segue sem gasto de orçamento `unsafe`. O mecanismo
real vai para `src/css/chrome.css` como parte da issue #96, endereçado na
branch de implementação (não nesta).

## O que este protótipo NÃO testou

Alinhamento do navbar/marca com o cabeçalho de grupo da sidebar, remoção do
divisor/faixa, scrollbar, breakpoints — estão fora do escopo desta pergunta;
a issue #96 cobre o resto sem risco de ejeção (são regras CSS comuns, não
mexem em `unsafe`).
