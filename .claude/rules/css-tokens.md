---
paths:
  - "src/css/*.css"
---

# CSS — a camada de token

Área tocada por 14 das 33 sessões que editaram o repo. Três portões cobram estes cinco arquivos, e os três são varredura: passam ou reprovam, sem julgamento.

## O andaime que já existe — clone dele, não invente

| Arquivo | O que mora nele |
| --- | --- |
| `src/css/tokens.css` | as três camadas. **O único arquivo do projeto com literal de cor, comprimento, tempo ou curva.** |
| `src/css/foco.css` | o contrato de estado de entrada. **O único arquivo que escreve `outline`.** |
| `src/css/chrome.css` | navbar, sidebar, TOC, footer, paginação |
| `src/css/componentes.css` | os componentes MDX de autoria |
| `src/css/custom.css` | a entrada; importa os demais |

## A regra de referência

Três camadas, e a direção é uma só. Detalhe em `docs/design/tokens.md` § 1. As três camadas, e a regra de referência.

- **Camada 1, raiz.** Literais. Bloco de troca (o que o corporativo re-marca) + base (escalas e a forma da rampa).
- **Camada 2, semântica.** **Só cor.** Oito papéis, onde o modo é resolvido — `:root` escuro e `:root[data-theme='light']` claro.
- **Camada 3, componente.** Declarada no escopo do próprio componente, **nunca** em `:root`.

**Cor sempre desce pela camada 2** — nenhum componente lê a rampa ou a marca direto. **Dimensão vem direto da camada 1.**

Faltou o papel na camada 2? A escada está em `docs/design/tokens.md` § 1. As três camadas, subseção "Quando a camada semântica não tem o valor". O degrau default nunca é um literal novo.

## Os três portões desta área

- **Portão 1** (`npm run portao:1`) — cor, comprimento, tempo ou curva fora de `tokens.css`. `0`, número sem unidade, `%`, `fr`, `ch`, `lh` e `auto` ficam de fora do escopo: são layout.
- **Portão 2** (`npm run portao:2`) — duração ou curva cravada numa transição. Os sete movimentos nomeados são o vocabulário fechado, e é o que faz `prefers-reduced-motion` alcançar o Infima e o theme-classic, que não escrevemos aqui.
- **Portão 3** (`npm run portao:3`) — `outline` fora de `src/css/foco.css`. Ele existe contra o `outline: none` escrito para "limpar" um botão.

Cada um roda em menos de meio segundo. Rode o que a mudança ativa enquanto trabalha.

## O espelho — a pegadinha cara

Editou `src/css/tokens.css`? **Rode `node scripts/espelho-tokens.mjs --sincronizar`.** O bloco `css` de `docs/design/tokens.md` é espelho **byte a byte** do arquivo, e a CI reprova a divergência num passo que não é portão e não aparece em `npm run portoes`.

Mexeu em cor? `npm run contraste` recomputa as duas tabelas de contraste da spec a partir do CSS. Ela nasceu de um defeito real: duas seções mediam o mesmo par e discordavam em três das quatro células.
