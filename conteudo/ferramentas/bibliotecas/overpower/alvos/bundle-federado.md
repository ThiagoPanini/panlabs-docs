---
title: O bundle federado
description: Como um repositório federa uma composição nomeada em .overpower/catalog.yaml, e o que isso muda no plano.
---

# O bundle federado

Um **bundle** é uma composição nomeada, e um repositório federa uma escrevendo
`.overpower/catalog.yaml` na raiz dele.

## Escrever o manifesto

```yaml
bundles:
  api-python:
    description: Tudo que é preciso para trabalhar na API em Python.
    items:
      - fastapi-conventions
      - pytest-fixtures
```

| Campo | O que ele aceita |
| --- | --- |
| `bundles.<nome>` | o nome pelo qual `--bundle` pede a composição |
| `description` | a frase que o `list` imprime por inteiro, nunca truncada |
| `items` | **nomes**, nunca caminhos, das skills que aquele mesmo repositório oferece sob `skills/` |

Esse arquivo é lido pelo **mesmo leitor** que lê o catálogo que o `overpower`
publica, então um manifesto malformado é recusado nomeando o mesmo campo dos dois
lados, e não existe um segundo validador em lugar nenhum para discordar do
primeiro. Os `items` não alcançam nem o catálogo embutido nem um terceiro
repositório, e um nome que não resolve sai `3` dizendo qual nome.

## Instalar de um bundle federado

```bash
uvx overpower@latest install --from https://github.com/dono/repo --bundle api-python
```

:::note
Não há cache. Todo `--from` busca fresco, por decisão. Conteúdo remoto muda no
calendário de outra pessoa, e uma cópia guardada localmente derrotaria em
silêncio a razão inteira de o `--from` existir.
:::

## O que muda no plano

O que muda no plano é só a [procedência](../conceitos). A confirmação, o
`--dry-run` e a mecânica de escrita são as mesmas do conteúdo que vem do catálogo
embutido.
