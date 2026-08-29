---
title: Códigos de saída
description: Os quatro códigos de saída, a afirmação que cada um faz, e o eixo que separa o defeito da linha do defeito do mundo.
---

# Códigos de saída

O código de saída é a resposta da linha, e ele significa o mesmo nos três
comandos. Esta página é a tabela e o raciocínio que a decidiu, e a mesma tabela
sai gerada na [página da raiz](../comandos/overpower), a partir do contrato.

## A tabela

| Código | Significado |
| --- | --- |
| `0` | fez o que foi pedido |
| `1` | não conseguiu rodar |
| `2` | você me invocou errado |
| `3` | rodou, e a resposta é não |

```bash
uvx overpower@latest doctor; echo "saiu $?"
```

## O eixo entre `2` e `3`

O eixo entre `2` e `3` é **de quem é o defeito**, e é exatamente essa distinção
que torna os dois usáveis num script ou num pipeline de CI, onde *conserte a sua
entrada* e *a entrada estava certa e a resposta é não* pedem respostas
diferentes.

Um valor de `--runtime` fora da tabela fechada é `2`: o valor que você digitou não
existe em lugar nenhum, então o defeito está na própria linha. Um valor de
`--runtime` que **está** na tabela, mas não tem destino no escopo que você pediu,
é `3`: o valor é real, a flag é real, nada na invocação está malformado, e o
destino simplesmente não existe para aquele par. Isso é um fato sobre o mundo,
não sobre o que você digitou.

Uma recusa de `2` chega num painel de erro, com a mensagem nomeando toda flag
que a linha entregou:

```text
╭─ error ──────────────────────────────────────────────────╮
│                                                          │
│  `list` shows one item at a time, and got --skill and    │
│  --bundle                                                │
│                                                          │
╰──────────────────────────────────────────────────────────╯
```

:::note
A mesma leitura vale para o `--from`. Uma raiz de busca que não pôde ser obtida,
por rede inalcançável, repositório inexistente ou falta de acesso de leitura, é
`1`, e a mensagem de erro do próprio transporte passa sem modificação, porque é
ela que nomeia o problema. Depois que a raiz **foi** obtida e vasculhada, se a
skill que você pediu não está lá, ou está lá mais de uma vez com nome ambíguo,
isso é `3`.
:::

## Por que um relatório ruim nunca é `1`

O `doctor` sai `3` quando achou problema, e `0` quando não achou, nunca `1` para
um resultado insalubre, porque resultado insalubre não é queda: o comando rodou
certo e calculou uma resposta real, negativa. É essa distinção que deixa o
`doctor` sentar num CI ao lado de um `install --dry-run` como portão, porque um
script consegue separar *a conferência rodou e reprovou* de *a conferência
quebrou* só pelo código, sem parsear saída.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run \
  && uvx overpower@latest doctor
```

Um traceback nunca chega ao terminal. Uma exceção que o produto não reconhece
como uma das falhas nomeadas dele vira um painel de erro em vez de saída crua de
Python, e sai `1`.

**`1` não significa só defeito do produto, e a leitura curta engana.** Ele é
*não deu para rodar até o fim*, e três desses casos são você mesmo dizendo não:

| O que aconteceu | Por que é `1` |
| --- | --- |
| Uma exceção que o produto não reconhece | o defeito é do `overpower` |
| Você recusou a confirmação antes da escrita | a linha parou antes do primeiro byte |
| Você saiu do assistente em qualquer passo | idem, e sair de um passo aborta todos |
| `Ctrl-C` | o shell devolveria `130`, e a ferramenta traduz para `1` uma vez, para não vazar um quinto código numa tabela que declara quatro |

O que os quatro têm em comum é que **nada foi escrito**. Um script que trata `1`
como falha do produto vai reportar bug quando o operador só apertou `n`.

## `--version` decide antes do resto ser lido

Posto antes do subcomando, `--version` responde e sai ali mesmo, sem entregar o
resto da linha ao parser do subcomando: por isso uma invocação malformada depois
dele ainda sai `0`.

```bash
uvx overpower@latest --version install --nope
```

`install --nope` sozinho sai `2`, opção inexistente. Com `--version` na frente,
quem responde primeiro é a raiz, e o subcomando nunca chega a ser lido: `0`
responde por `--version`, não pelo que vem depois dele.
