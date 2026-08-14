---
paths:
  - "src/theme/**/*.js"
  - "src/theme/**/*.mjs"
  - "src/theme/**/*.css"
---

# `src/theme/` — swizzle, e o ledger que o cobra

Área tocada por 9 das 33 sessões. Baixa frequência, **falha silenciosa alta**: o portão que cobra esta pasta só tem o que reprovar quando o `@docusaurus/theme-classic` muda de versão, e nenhum build quebra antes disso.

## A pegadinha que custa a CI

Swizzlou um componente novo, ou mexeu na superfície? **Rode `npm run swizzle:congelar`.** Ele reescreve `scripts/swizzle-list.txt` (220 linhas hoje), e o **portão 7** (`npm run portao:7`) confere `src/theme/` contra ela.

O portão 7 **não está em `npm run portoes`** — ele roda na CI a cada PR. Verde no bundle local não diz nada sobre ele.

## Zero `unsafe`

`npm run zeros` cobra swizzle `unsafe` em zero. Um componente marcado `unsafe` no ledger do Docusaurus não entra por decisão de conveniência — a escada de `docs/design/swizzle.md` § 1. A escada, em uma tabela, existe para achar o degrau que alcança sem descer até lá.

## Antes de descer para o swizzle

A escada tem degraus mais baratos, e a disciplina é subir até achar o que não alcança:

- **Degrau 0** — variável do Infima, via o adaptador em `src/css/tokens.css`.
- **Degrau 1** — classe estável em `src/css/chrome.css`.
- **Degrau 2+** — swizzle.

Cada linha do ledger carrega **por que o degrau acima não alcançou**. Ao acrescentar uma, escreva essa coluna — é o que cobra `docs/design/swizzle.md` § 5. A disciplina de registro, e é o que faz o ledger revisável. O racional está no ADR 2, `docs/adr/0002-politica-de-swizzle.md`.

## O que já mora aqui

`src/theme/MDXComponents/` (o registro dos componentes de autoria), `src/theme/ApiDocItem/` (a página de referência gerada), `src/theme/SearchBar/` (o modal e a escada de pontuação), `src/theme/NavbarItem/` e `src/theme/Admonition/Types.js`. Três coisas diferentes convivem nesta pasta e não se misturam — a separação está em `docs/design/swizzle.md` § 3. O ledger.
