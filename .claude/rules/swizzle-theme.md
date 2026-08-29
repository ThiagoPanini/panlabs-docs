---
paths:
  - "src/theme/**/*.js"
  - "src/theme/**/*.mjs"
  - "src/theme/**/*.css"
---

# `src/theme/` — swizzle, e a escada que o precede

**Falha silenciosa alta**: swizzle quebra quando o `@docusaurus/theme-classic` muda de versão, e nenhum build quebra antes disso. Nada aqui é cobrado por máquina — a disciplina é de leitura.

## Zero `unsafe`

Componente marcado `unsafe` no ledger do Docusaurus **não entra** por decisão de conveniência. A escada existe para achar o degrau que alcança sem descer até lá.

## Antes de descer para o swizzle

A escada tem degraus mais baratos, e a disciplina é subir até achar o que não alcança:

- **Degrau 0** — variável do Infima, via o adaptador em `src/css/tokens.css`.
- **Degrau 1** — classe estável em `src/css/chrome.css`.
- **Degrau 2+** — swizzle.

Ao acrescentar um swizzle, escreva **por que o degrau acima não alcançou**. É o que faz a decisão revisável depois, e o racional está no [ADR 2](../../docs/adr/0002-politica-de-swizzle.md).

## O que já mora aqui

`src/theme/MDXComponents/` (o registro dos componentes de autoria), `src/theme/ApiDocItem/` (a página de referência gerada), `src/theme/SearchBar/` (o modal e a escada de pontuação), `src/theme/NavbarItem/` e `src/theme/Admonition/Types.js`. Três coisas diferentes convivem nesta pasta e não se misturam.
