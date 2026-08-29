---
paths:
  - "src/css/*.css"
---

# CSS — a camada de token

Nada cobra estes arquivos por máquina. As regras abaixo valem por leitura, e é por isso que estão escritas.

## O andaime que já existe — clone dele, não invente

| Arquivo | O que mora nele |
| --- | --- |
| `src/css/tokens.css` | as três camadas. **O único arquivo do projeto com literal de cor, comprimento, tempo ou curva.** |
| `src/css/focus.css` | o contrato de estado de entrada. **O único arquivo que escreve `outline`.** |
| `src/css/chrome.css` | navbar, sidebar, TOC, footer, paginação |
| `src/css/components.css` | os componentes MDX de autoria |
| `src/css/custom.css` | a entrada; importa os demais |

## A regra de referência

Três camadas, e a direção é uma só.

- **Camada 1, raiz.** Literais. Bloco de troca (o que o corporativo re-marca) + base (escalas e a forma da rampa).
- **Camada 2, semântica.** **Só cor.** Os papéis, onde o modo é resolvido — `:root` escuro e `:root[data-theme='light']` claro.
- **Camada 3, componente.** Declarada no escopo do próprio componente, **nunca** em `:root`.

**Cor sempre desce pela camada 2** — nenhum componente lê a rampa ou a marca direto. **Dimensão vem direto da camada 1.**

Faltou o papel na camada 2? Derive dele, não crave um literal novo: sintaxe relativa (`oklch(from var(--x) …)`), `color-mix(in oklab, …)` ou `calc()` sobre a base.

## As três regras que valem ao escrever

- **Cor, comprimento, tempo e curva ficam em `tokens.css`.** `0`, número sem unidade, `%`, `fr`, `ch`, `lh` e `auto` ficam de fora do escopo: são layout.
- **Nenhuma duração ou curva cravada numa transição.** Os movimentos nomeados são o vocabulário fechado, e é o que faz `prefers-reduced-motion` alcançar o Infima e o theme-classic, que não escrevemos aqui.
- **`outline` só em `src/css/focus.css`.** A regra existe contra o `outline: none` escrito para "limpar" um botão.

O racional das três está no [ADR 1](../../docs/adr/0001-doutrina-de-css.md); o de `prefers-reduced-motion`, no [ADR 3](../../docs/adr/0003-reduced-motion-na-camada-de-token.md).
