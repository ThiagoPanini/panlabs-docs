---
title: Solução de problemas
description: As recusas comuns organizadas pela mensagem que você viu, o que cada uma significa, e o que fazer a respeito.
---

# Solução de problemas

Esta página é organizada pela mensagem que você de fato viu, citada como o
`overpower` a imprime, para que você ache a sua linha casando texto em vez de
adivinhar a causa interna primeiro. Onde uma mensagem nomeia um valor
específico, o runtime que você digitou, o escopo, um caminho, ele aparece aqui
como `‹marcador›`.

## As recusas, por mensagem

| Mensagem | Saída | O que fazer |
| --- | --- | --- |
| `not inside a git repository: pass --global to write under the home directory` | `2` | rode dentro de um repositório, ou acrescente `--global` |
| `unknown runtime ‹chave›; the table is: ‹todas as chaves›` | `2` | a chave não está na tabela fechada; veja [Alvos](../alvos/indice) |
| `‹chave› has no destination in ‹escopo› scope` | `3` | tire o `--global`, ou escolha outro runtime |
| `unknown skill ‹nome›; the pool is: ‹todo o pool›` | `2` | confira o nome contra a [Referência](indice) |
| `list shows one item at a time, and got ‹as flags›` | `2` | deixe um seletor só na linha |
| `‹nome› is not an MCP server in this catalog` | `2` | mova o valor para a flag que ele nomeia |
| `already exists, use --force to overwrite: ‹os caminhos›` | `3` | acrescente `--force`, ou rode interativamente |
| `‹caminho› is not ours to repair, and it is broken` | `3` | conserte o arquivo à mão e rode de novo |
| `--from ‹url› is not a GitHub repository URL` | `2` | corrija a URL para um endereço real |

## As três que confundem mais

**`unknown runtime` contra `has no destination`.** As duas falam de `--runtime` e
saem por códigos diferentes de propósito. A primeira é `2` porque o valor não
existe em lugar nenhum: a mensagem lista toda chave válida, porque não há
correspondência parcial nem escape por `--dir` para onde recuar. A segunda é `3`
porque o valor é real e o que não existe é o par: acontece com o `eve` e o
`promptscript` sob `--global`, já que nenhum dos dois declara destino global.

**O `vscode` sai `3` pelo mesmo eixo e com outra mensagem, e ela não fala de
escopo:**

```
`vscode` takes MCP servers and has no skills destination of its own;
the runtimes that take one there are: ...
```

Ele não tem destino de skill em escopo nenhum, então a recusa vale igual com e
sem `--global`. `--runtime vscode --mcp <nome>` instala normalmente.

**`already exists`.** Em escopo global, fora de um terminal ou sob `--yes` ou
`--dry-run`, um destino que já tem conteúdo é recusado em vez de substituído
calado. O escopo global não tem `git status` para revelar ou desfazer uma
sobrescrita do jeito que o de projeto tem.

Num terminal, sem essas flags, ele **pergunta** em vez de recusar. Vale reler a
lista acima: `--yes` entra nela, e é isso que faz `-y` transformar uma pergunta
que você poderia responder `sim` numa saída `3`.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime cursor --global --force
```

**`is not ours to repair`.** O arquivo de configuração de MCP em que o
`overpower` enxertaria já falha ao ser parseado, por razão própria, quase sempre
JSON inválido. O `overpower` não conserta arquivo que não é dele.

:::warning
Conserte o arquivo à mão primeiro, e só então rode a instalação de novo. Ele
recusa em vez de reparar porque reparar um documento que é seu, por iniciativa
própria dele, não é coisa que uma instalação tenha permissão de fazer.
:::

## Quando a saída sai torta

Quando o problema é a tela e não a escrita, o `doctor` responde os quatro fatos
que explicam isso sem uma ida e volta para perguntar: se há um TTY ligado, que
sistema de cor foi detectado, a largura do terminal e se `NO_COLOR` está posto.

```bash
uvx overpower@latest doctor
```

:::note
A saída sob um cano nunca carrega código ANSI, e a marca é suprimida quando não
há TTY. Se você está vendo sequência de escape dentro de um arquivo redirecionado,
o problema não é de configuração de cor, e vale reportar.
:::
