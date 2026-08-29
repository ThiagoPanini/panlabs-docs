---
paths:
  - "content/**/*.md"
  - "content/**/*.mdx"
  - "i18n/**/*.md"
  - "i18n/**/*.mdx"
  - "i18n/**/*.json"
  - "contracts/**/*.json"
---

# Conteúdo — o que é contado, e por quem

O portão 4 (`npm run portao:4`) transforma em varredura os critérios da arquitetura de informação, porque são todos **contagens**, e contagem escrita em documento é contagem que envelhece calada. Uma página a mais não quebra build nenhum; só faz a spec passar a mentir.

## As contagens travadas

| Aba | Páginas autorais |
| --- | --- |
| `content/ferramentas/` | 27 |
| `content/jornadas/` | 4 |
| `content/procedimentos/` | 1 |
| `content/times/` | 1 |

A ordem é a do navbar, e `Jornadas` subiu para segunda. Mais o ramo gerado, somado por fora — **37 no site**, 33 autorais mais 4 geradas. Acrescentar ou remover página **exige acertar o portão 4 junto**. São dezessete cobranças ao todo; a lista está no cabeçalho de `scripts/portao-4-conteudo.sh`.

**Cinco cobranças contam ZERO hoje, e as cinco ficam.** A `Jornadas` narrativa saiu, `Procedimentos` e `Times` foram esvaziadas, e o que sobrou tem dívida declarada por nome: o tipo `Índice de jornada` está **pendente**, o gabarito `capítulo` está sem sujeito, e o caso `diff` está sem dona. Escrever qualquer um deles de volta **sem tirar o nome da lista de pendentes reprova** — é assim que a dívida reaparece no dia em que alguém a pagar.

## Proibição por localização

O portão 4 tem uma classe de cobrança que não é só teto — é *"aqui não entra"*. `<Steps>` fora de `Jornadas` e `<CardGroup>` fora dos dois índices têm teto **zero**. Antes de usar um componente de autoria, confira o tipo de página em `docs/design/informacao.md` § 6. Tipos de página.

## O teto de profundidade

É **4**, e ele é **confinado** a dois ramos, com teto próprio cada um: `content/ferramentas/bibliotecas/overpower/` fecha em 4 e `content/jornadas/api-owner/` fecha em 3. Fora dos dois nada passa do nível 2, e cada ramo declarado precisa **alcançar** o próprio teto. O portão 4 cobra as três metades, e a régua está em `docs/design/informacao.md` § 3.1.

## A regra de heading

É decisão de layout disfarçada de conteúdo, e o portão a cobra: `docs/design/informacao.md` § 4. A regra de heading. **A lista de exceção está vazia**: quem fica abaixo do piso fica por gabarito, e o marcador de lugar (`Work in Progress`) fica em **zero** `##`.

## Locale

**Só `Ferramentas` é traduzida** — 31 folhas, cobertura cobrada pelo portão 4. As outras três abas existem só em pt-BR, e isso é decisão, não pendência: `docs/design/informacao.md` § 8. Locale. São **6** páginas com `<Untranslated />`, e o portão crava o número.

Tradução mora em `i18n/en/docusaurus-plugin-content-docs-tools/current/`, espelhando a árvore de `content/ferramentas/`. Rótulo de UI vai em `i18n/en/docusaurus-theme-classic/`.

## Voz

**`você` + imperativo. Zero primeira pessoa, sem exceção** — no site inteiro, nos dois locales. O acervo é pessoal pelo que escolhe documentar, não pela gramática.

## Travessão

**Zero `—` em `content/`, `i18n/` e `contracts/`.** O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um site que se olha. A saída é vírgula, dois-pontos, parênteses ou a frase reescrita, **escolhida uma a uma**: travessão é pontuação legítima do português, e trocar o caractere por outro fixo produz frase truncada ou pontuação dobrada.

A cobrança 14 do portão 4 varre as três superfícies e reprova apontando arquivo e linha. `docs/` fica de fora, e por decisão: a spec não é produto, e `scripts/invariantes.sh` exige o literal `Livre — <dono>` lá dentro.

**A varredura não filtra extensão** — ela roda `find -type f`, então alcança o `.drawio.svg` de um diagrama co-locado. Rótulo de desenho não leva travessão, e cada rótulo conta duas vezes: no `<text>` renderizado e no XML embutido no atributo `content`.

**A única exceção é citação de saída de ferramenta.** Um arquivo que declara `{/* cita-saida-de-ferramenta */}` (ou `"citesToolOutput": true`, em `contracts/`) nas 20 primeiras linhas pode carregar `—` **dentro de cerca de código**, na linha `api_exemplos:` de página gerada, ou num valor `"message"`. Fora dessas regiões o portão reprova igual. O marcador é `{/* */}` porque o comentário HTML não compila sob MDX 3.

## Link quebrado

`onBrokenLinks: 'throw'` só dispara em `npm run build`. `docusaurus start` devolve 200 com o shell da SPA para qualquer rota — ele nunca vai te avisar.
