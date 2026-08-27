---
title: O bundle federado
description: Como um repositório declara o que oferece num único .overpower.yaml na raiz, e o que isso muda no plano.
---

# O bundle federado

Um **bundle** é uma composição nomeada, e um repositório federa uma escrevendo
`.overpower.yaml` na raiz dele. O mesmo arquivo declara também os servidores MCP
que o repositório oferece: **um arquivo, um formato, um leitor**.

## Escrever o manifesto

```yaml
bundles:
  api-python:
    description: Tudo que é preciso para trabalhar na API em Python.
    items:
      - skill:fastapi-conventions
      - skill:pytest-fixtures
      - mcp:meu-servidor

mcp:
  meu-servidor:
    description: O servidor interno de catálogo, como processo local.
    transport: stdio
    server:
      command: "npx"
      args: ["-y", "@interno/catalogo-mcp@1.4.0"]

  servidor-de-fonte:
    description: O servidor que o nosso próprio repositório mantém.
    source:
      git: https://github.com/acme/catalogo-mcp
      ref: v1.4.0
      runner: uvx
      entrypoint: catalogo-mcp
```

| Campo | O que ele aceita |
| --- | --- |
| `bundles.<nome>` | o nome pelo qual `--bundle` pede a composição |
| `bundles.<nome>.description` | a frase que o `list` imprime por inteiro, nunca truncada |
| `bundles.<nome>.items` | **nomes com o espaço de nomes como prefixo**, `skill:<nome>` ou `mcp:<nome>`, resolvidos dentro daquele mesmo repositório. Nunca um caminho |
| `mcp.<slug>` | o nome pelo qual `--mcp` pede o servidor, e a receita inteira dentro |
| `mcp.<slug>.source` | o **endereço** do código do servidor: `git`, `ref`, `runner` e `entrypoint`, os quatro obrigatórios. Quem declara `source` não declara `transport`, `server.command` nem precondição de runner, porque os três passam a derivados |

Esse arquivo é lido pelo **mesmo leitor** que lê o catálogo que o `overpower`
publica, então um manifesto malformado é recusado nomeando o mesmo campo dos dois
lados, e não existe um segundo validador em lugar nenhum para discordar do
primeiro. Os `items` não alcançam nem o catálogo embutido nem um terceiro
repositório, e um nome que não resolve sai `3` dizendo qual nome.

**O arquivo é opcional.** Um repositório que não escreveu nenhum não está
quebrado: as skills dele continuam listadas e instaláveis, e o que falta é só o
que a declaração teria dito.

:::warning
**A convenção anterior não é lida, e não há janela de compatibilidade.** Um
repositório que ainda guarda `.overpower/mcp/<slug>.toml` na raiz e não tem
`.overpower.yaml` sai `3`, nomeando os arquivos achados e o arquivo a escrever no
lugar. A alternativa seria a metade silenciosa: listar as skills, omitir os
servidores e sair `0`, descrevendo o repositório como oferecendo menos do que o
autor declarou.
:::

:::warning
**O prefixo em `items` também não tem janela de compatibilidade.** Uma entrada
sem prefixo, ou com prefixo fora do conjunto fechado, é recusa por nome. Todo
`items` escrito antes precisa ganhar o `skill:`, e vale igual para o catálogo
embutido e para o federado. O motivo é que um bundle passou a alcançar servidor
MCP, e sem o espaço de nomes um nome solto ficaria ambíguo entre as duas coisas.
:::

## A anatomia do manifesto

O manifesto aninha até quatro níveis, e esse é o teto: o quinto não apareceu em
nenhum repositório federado, e um teto declarado é o que impede o arquivo de
virar um mapa do catálogo inteiro.

<ResponseField name=".overpower.yaml" type="object">
  Tudo o que o repositório declara, num arquivo só, na raiz.

  <Expandable title="campos">
    <ResponseField name="bundles" type="object">
      As composições nomeadas. A chave de cada uma é o nome pelo qual `--bundle`
      a pede.

      <Expandable title="campos">
        <ResponseField name="nome-do-bundle" type="object">
          Uma composição.

          <Expandable title="campos">
            <ResponseField name="description" type="string">
              A frase que o `list` imprime por inteiro, nunca truncada.
            </ResponseField>

            <ResponseField name="items" type="array">
              Os nomes dos artefatos que compõem o bundle, cada um com o espaço
              de nomes como prefixo: `skill:<nome>` resolve contra o `skills/`
              deste mesmo repositório, `mcp:<nome>` contra as receitas que este
              mesmo arquivo declara. Nunca um caminho, e nunca um endereço.
            </ResponseField>
          </Expandable>
        </ResponseField>
      </Expandable>
    </ResponseField>

    <ResponseField name="mcp" type="object">
      As receitas de servidor MCP, pela mesma chave e no mesmo leitor do catálogo
      embutido.
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

**A declaração é ancorada na raiz, e não alcançada.** O subcaminho de uma URL
`tree/<ref>/<path>` estreita o alcance de `--skill`, e não move o arquivo que
`--bundle` e `--mcp` leem: uma dependência vendorizada que carregue o próprio
`.overpower.yaml` fala pelo repositório dela, e deixá-la responder mudaria o que
este repositório é dito oferecer.
