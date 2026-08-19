---
title: Curadoria
description: Como o conteúdo vendorizado é renovado, e o que um candidato precisa ser para ganhar lugar no catálogo.
---

# Curadoria

Esta página cobre as duas perguntas que decidem o que o `overpower` carrega: como
o conteúdo vindo de fora é renovado sem derivar, e o que um candidato tem de ser
antes de ganhar lugar no catálogo.

## Antes de começar

O ambiente de desenvolvimento montado, e a referência nova lá de cima em mãos.
Renovar o catálogo é algo que uma pessoa faz à mão, de propósito, e não um job
agendado.

## Os passos

<Steps>
  <Step title="Ler o manifesto de lá em cima, na referência nova">
    Para o `mattpocock/skills`, é o array `skills` de
    `.claude-plugin/plugin.json`, e especificamente nunca o campo `version` ao
    lado dele, que foi medido parado enquanto o array se movia.

    ```bash
    git -C ../skills show <ref>:.claude-plugin/plugin.json
    ```
  </Step>

  <Step title="Trocar a árvore e atualizar a atribuição">
    Se o que aterrissa não é a árvore versionada verbatim, a transformação
    acontece na curadoria e o que é vendorizado é a saída dela. Atualize o
    `NOTICE`, com a referência e o commit por origem, e o `licenses/` se o
    arquivo de licença lá em cima mudou de lugar.

    ```bash
    uv run pytest tests/test_content.py
    ```
  </Step>

  <Step title="Rodar os quatro comandos, mais o teste de rede">
    O teste que toca o GitHub de verdade é passo de curadoria, e não portão.

    ```bash
    OVERPOWER_NETWORK_TESTS=1 uv run pytest -m network
    ```
  </Step>

  <Step title="Subir a versão">
    A versão do `overpower` é a versão do catálogo que ele embute, então uma
    renovação que ninguém consegue instalar não é renovação.

    ```bash
    uv version --bump minor
    ```
  </Step>
</Steps>

## Verificação

Um portão bloqueia o que este repositório controla. O que depende de terceiro é
verificado aqui, à mão, porque automatizar uma conferência contra o repositório de
outra pessoa poria a disponibilidade e a estabilidade de um terceiro dentro da CI
deste projeto, o que foi medido instável e recusado exatamente por isso.

:::note
Este último passo deixou de ser algo a lembrar. O `src/overpower/content/` está
dentro da wheel, então o `release-ready` recusa o pull request até que a subida
aconteça.
:::

## O que ganha lugar no catálogo

Três portões decidem se um candidato vira AI Framework, e o primeiro que falha
encerra a avaliação.

O primeiro é **legal, e é veto**. O conteúdo tem de ser redistribuível dentro da
wheel. Qualquer coisa que não seja MIT exige uma expressão SPDX composta nos
metadados, senão o pacote se apresentaria errado exatamente para o público que
está decidindo se ele passa numa lista corporativa de licenças permitidas.

O segundo é **ser autocontido**. O que aterrissa tem de funcionar sem ferramental
que o `overpower` não possa garantir no alvo. Falhar aqui não é *este framework
foi rejeitado*, e sim *isto não é um AI Framework sob este modelo*, porque ser
autocontido é identidade, e não uma barra de qualidade a superar.

O terceiro é que **a transformação acontece na curadoria**. Se o que é publicado
não é a árvore exatamente como versionada lá em cima, a transformação acontece
durante a curadoria, com a saída transformada vendorizada. O produto em si nunca
transforma conteúdo na hora de instalar.

:::warning
O critério mora no julgamento de quem cura, e não num campo do catálogo. Um campo
que registrasse *isto passou* seria apenas uma constante, já que o catálogo só
contém coisas que já passaram.
:::

Um enxerto lê a cláusula de ferramental de outro jeito, e sem essa diferença a
classe inteira nasceria morta: quase todo servidor stdio sobe por `uvx`, `npx` ou
`docker`, e recusar qualquer coisa que precise de ferramental externo recusaria
todos eles. A distinção é o que de fato aterrissa. Uma cópia põe em disco conteúdo
que só funciona com alguma ferramenta; um enxerto põe em disco nada além de uma
declaração, e a receita nomeia o que precisa como precondição, que o `overpower`
confere sozinho antes de escrever.
