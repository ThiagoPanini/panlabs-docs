---
paths:
  - "content/**/*.md"
  - "content/**/*.mdx"
  - "i18n/**/*.md"
  - "i18n/**/*.mdx"
  - "i18n/**/*.json"
  - "contracts/**/*.json"
---

# Conteúdo — o que a arquitetura de informação pede

Nada aqui é cobrado por máquina. Uma página a mais não quebra build nenhum, e nenhuma varredura confere as contagens abaixo — elas descrevem a árvore de hoje, e envelhecem caladas.

## A árvore de hoje

| Aba | Páginas autorais |
| --- | --- |
| `content/ferramentas/` | 27 |
| `content/jornadas/` | 4 |
| `content/procedimentos/` | 1 |
| `content/times/` | 1 |

A ordem é a do navbar. Mais o ramo gerado, somado por fora — **37 no site**, 33 autorais mais 4 geradas. Recontar é `find content -name '*.md' -type f | wc -l`.

**Dívida declarada:** o tipo `Índice de jornada` não tem instância, o gabarito `capítulo` está sem sujeito, e o caso `diff` está sem dona. `Procedimentos` e `Times` são um marcador de lugar cada, à espera de conteúdo real.

## Proibição por localização

`<Steps>` é a espinha de `Procedimentos` e não entra em `Jornadas` — sem isso o leitor não sabe dizer por que a página não está na outra aba. `<CardGroup>` não entra no índice de jornada, porque grade não tem ordem e o traço que justifica o tipo é ordenar por tempo.

## O teto de profundidade

É **4**, e ele é **confinado** a dois ramos: `content/ferramentas/bibliotecas/overpower/` fecha em 4 e `content/jornadas/api-owner/` fecha em 3. Fora dos dois nada passa do nível 2. O racional está no [ADR 10](../../docs/adr/0010-a-categoria-de-sidebar-nao-e-destino.md).

## Locale

**Só `Ferramentas` é traduzida.** As outras três abas existem só em pt-BR, e isso é decisão, não pendência.

Tradução mora em `i18n/en/docusaurus-plugin-content-docs-tools/current/`, espelhando a árvore de `content/ferramentas/`. Rótulo de UI vai em `i18n/en/docusaurus-theme-classic/`.

## Voz

**`você` + imperativo. Zero primeira pessoa, sem exceção** — no site inteiro, nos dois locales. O acervo é pessoal pelo que escolhe documentar, não pela gramática.

## Travessão

**Zero `—` em `content/`, `i18n/` e `contracts/`.** O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um site que se olha. A saída é vírgula, dois-pontos, parênteses ou a frase reescrita, **escolhida uma a uma**: travessão é pontuação legítima do português, e trocar o caractere por outro fixo produz frase truncada ou pontuação dobrada.

Vale para o `.drawio.svg` de um diagrama co-locado também, e nele o rótulo aparece duas vezes: no `<text>` renderizado e no XML embutido no atributo `content`.

**A exceção é citação de saída de ferramenta**: dentro de cerca de código, na linha `api_exemplos:` de página gerada, ou num valor `"message"`, onde o travessão é o que a ferramenta imprimiu.

Conferir à mão: `grep -rn '—' content/ i18n/ contracts/`.

## Link quebrado

`onBrokenLinks: 'throw'` só dispara em `npm run build`. `docusaurus start` devolve 200 com o shell da SPA para qualquer rota — ele nunca vai te avisar.
