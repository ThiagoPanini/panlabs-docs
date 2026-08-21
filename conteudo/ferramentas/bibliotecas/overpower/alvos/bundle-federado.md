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

## A anatomia do manifesto

O manifesto aninha até quatro níveis, e esse é o teto: o quinto não apareceu em
nenhum repositório federado, e um teto declarado é o que impede o arquivo de
virar um mapa do catálogo inteiro.

<ResponseField name="bundles" type="object">
  Todas as composições que este repositório federa, sob uma chave só.

  <Expandable title="campos">
    <ResponseField name="nome-do-bundle" type="object">
      Uma composição. A chave é o nome pelo qual `--bundle` a pede.

      <Expandable title="campos">
        <ResponseField name="description" type="string">
          A frase que o `list` imprime por inteiro, nunca truncada.
        </ResponseField>

        <ResponseField name="items" type="array">
          As skills que compõem o bundle, na ordem em que o plano as escreve.

          <Expandable title="campos">
            <ResponseField name="nome" type="string">
              O nome da skill, como ele aparece sob `skills/` no mesmo
              repositório. Nunca um caminho.
            </ResponseField>

            <ResponseField name="procedencia" type="string">
              `federado` sempre. O leitor o preenche a partir do `--from` que
              buscou o manifesto, e não do arquivo.
            </ResponseField>
          </Expandable>
        </ResponseField>
      </Expandable>
    </ResponseField>
  </Expandable>
</ResponseField>

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
