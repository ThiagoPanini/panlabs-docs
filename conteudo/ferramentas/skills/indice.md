---
title: Skills
description: As duas skills de esteira publicadas — o que uma skill é aqui, quando ela vale mais que um workflow copiado, e como consumi-la.
---

# Skills

Uma skill é uma ação composta de GitHub Actions, publicada no repositório de
skills da casa e referenciada por tag. Ela empacota um procedimento que já foi
executado à mão vezes suficientes para que a variação entre execuções tenha
virado risco.

## Quando uma skill vale a pena

| Situação | Skill? |
| --- | --- |
| O procedimento tem passos em ordem fixa | sim |
| Ele já foi executado errado pelo menos uma vez | sim |
| Ele depende de julgamento no meio | não |
| Ele roda uma vez por trimestre | provavelmente não |

A terceira linha é a que corta. Um procedimento com decisão no meio vira skill
com um parâmetro que ninguém sabe preencher, e aí o julgamento apenas mudou de
lugar.

## As duas publicadas

- [Scaffold de esteira](scaffold-de-esteira) — cria a esteira inicial de um
  repositório novo, com os três workflows do template.
- [Rotação de segredo](rotacao-de-segredo) — executa a rotação com janela de
  aceitação dupla, sem intervenção manual.

## Como consumir

Sempre por tag, e a tag é da casa — a regra de fixar por commit vale para ação
de terceiro, não para as internas:

```yaml
- uses: panlabs/rotacao-de-segredo@v2
  with:
    segredo: prod/api/chave-externa
    regiao: us-east-1
```
