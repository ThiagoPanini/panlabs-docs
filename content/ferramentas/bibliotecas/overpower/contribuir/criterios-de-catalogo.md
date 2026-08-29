---
title: Critérios de catálogo
description: O que ganha lugar no catálogo embutido, e o que fica de fora por decisão.
---

# O que ganha lugar no catálogo

Três portões decidem se um candidato vira AI Framework, e o primeiro que falha
encerra a avaliação. Leia-os na ordem, porque a ordem é a da avaliação.

## Os três portões, em ordem

| Ordem | Portão | O que reprova |
| --- | --- | --- |
| 1 | legal | conteúdo que não é redistribuível dentro da wheel |
| 2 | autocontido | conteúdo que exige ferramental que o `overpower` não garante no alvo |
| 3 | transformação na curadoria | conteúdo que precisaria ser transformado na hora de instalar |

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

## Por que um enxerto lê o segundo portão de outro jeito

Um enxerto lê a cláusula de ferramental de outro jeito, e sem essa diferença a
classe inteira nasceria morta: quase todo servidor stdio sobe por `uvx`, `npx` ou
`docker`, e recusar qualquer coisa que precise de ferramental externo recusaria
todos eles. A distinção é o que de fato aterrissa. Uma cópia põe em disco conteúdo
que só funciona com alguma ferramenta; um enxerto põe em disco nada além de uma
declaração, e a receita nomeia o que precisa como precondição, que o `overpower`
confere sozinho antes de escrever.

## Conferir um candidato antes de propor

Abra o item pelo catálogo e leia a descrição inteira, que é onde a decisão de
instalar é de fato tomada:

```bash
uvx overpower@latest list --skill <nome>
```

```bash
uvx overpower@latest doctor
```

:::note
O `doctor` não avalia candidato, e sim o que já aterrissou. Ele entra aqui porque
um enxerto que falha a precondição no seu próprio disco vai falhar no de quem
instalar, e é mais barato descobrir antes da proposta.
:::
