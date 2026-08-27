---
title: Solução de problemas
description: As recusas comuns organizadas pela mensagem que você viu, o que cada uma significa, e o que fazer a respeito.
---

# Solução de problemas

{/* cita-saida-de-ferramenta */}

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
| `a skill and an MCP server on one line need --runtime named explicitly` | `2` | nomeie o runtime, ou parta em dois comandos |
| `nothing to install: name at least one --skill, --ai-framework, --bundle or --mcp` | `2` | diga o que instalar, ou rode num terminal e deixe o assistente perguntar |
| `‹chave› has no MCP document in ‹escopo› scope` | `3` | escolha outro escopo, ou outro runtime |
| `‹caminho› is not in ‹dono›/‹repo› at ‹ref›` | `3` | o subcaminho do `--from` não existe naquela referência |
| `‹origem› offers nothing to install` | `3` | o repositório não tem o diretório que o `--from` procura na raiz |
| `no skill named ‹nome› under ‹origem›` | `3` | confira o nome contra o que aquele repositório oferece |
| `‹nome› is ambiguous under ‹origem›: ‹os caminhos›` | `3` | aponte o `--from` para um deles |
| `no bundle named ‹nome› in ‹origem›` | `3` | idem, para bundle |
| `the bundle ‹nome› of ‹origem› names ‹item›, which is not among the skills that repository offers` | `3` | o manifesto do bundle está furado do lado de lá |
| `` `--from` names where to look, and no --skill and no --mcp name what to look for `` | `2` | acrescente um seletor, ou rode num terminal e deixe a vitrine abrir |
| `` `--from` on `list` shows skills, MCP servers and bundles `` | `2` | tire o `--ai-framework`; um framework é pasta da wheel, e não existe remotamente |

### As recusas por nome de classe

A tabela acima é indexada pela mensagem, que é o que você vê. Quando o que você
tem é o nome da exceção, vindo de um traceback, de um relatório de CI ou da
leitura do fonte, entre por aqui:

| Classe | Saída | A mensagem que ela imprime |
| --- | --- | --- |
| `TooManySelectorsError` | `2` | `list shows one item at a time, and got ‹as flags›` |
| `MixedClassesWithoutRuntimeError` | `2` | `a skill and an MCP server on one line need --runtime named explicitly` |
| `NothingToSearchForError` | `2` | `` `--from` names where to look, and no --skill and no --mcp name what to look for `` |
| `UnsupportedRemoteListUnitError` | `2` | `` `--from` on `list` shows skills, MCP servers and bundles `` |
| `UnsupportedRemoteUnitError` | `2` | `` `--from` installs skills, MCP servers and bundles `` |
| `OutsideRepositoryError` | `2` | `not inside a git repository: pass --global to write under the home directory` |
| `NothingSelectedError` | `2` | `nothing to install: name at least one --skill, --ai-framework, --bundle or --mcp` |

As três últimas linhas da tabela por mensagem, e as três primeiras desta, são a
mesma recusa vista pelos dois lados.

### As três mensagens que carregam travessão

Três recusas trazem travessão literal, e a tabela acima as abrevia porque uma
linha de tabela não é citação. Elas saem do terminal exatamente assim:

```text
a skill and an MCP server on one line need --runtime named explicitly, or two separate commands — one per class

`--from` on `list` shows skills, MCP servers and bundles — an AI Framework does not exist remotely: it is a folder of the overpower's own wheel, and --ai-framework names one of those

`--from` installs skills, MCP servers and bundles — an AI Framework does not exist remotely: it is a folder of the overpower's own wheel, and --ai-framework names one of those
```

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

## Os cinco achados do `doctor`

Um **achado** é um defeito no que aterrissou, e um só leva o `doctor` a sair `3`.
São cinco, e a lista é fechada.

| Achado | O que significa | O que fazer |
| --- | --- | --- |
| link pendurado | uma escrita que aterrissou aponta para algo que não está lá | reinstale o artefato, ou remova o que sobrou |
| link virado texto | um arquivo dentro do equipamento aterrissado é alvo de um link e está grafado como conteúdo | reinstale; a cópia perdeu o link no caminho |
| divergência | duas cópias de um artefato, no mesmo escopo, não concordam no conteúdo | reinstale para reconciliar, e decida qual escopo é o dono |
| aprovação pendente | um servidor foi escrito num enxerto que o Claude Code controla, e ele não o aprovou | aprove o servidor no runtime, fora do `overpower` |
| runner sumido | um enxerto renderizado de uma receita com `source:` nomeia um runner que não está mais no `PATH` | instale o runner que a receita exige, `uvx` ou `npx`, ou tire o enxerto |

Na tela, cada achado sai com o caminho envolvido logo abaixo do nome, e a saída
é `3`:

```text
  _____   _____ _ __ _ __   _____      _____ _ __
 / _ \ \ / / _ \ '__| '_ \ / _ \ \ /\ / / _ \ '__|
| (_) \ V /  __/ |  | |_) | (_) \ V  V /  __/ |
 \___/ \_/ \___|_|  | .__/ \___/ \_/\_/ \___|_|
                    |_|

  installs curated agent equipment   v0.27.3
╭─ terminal  how this screen is set up ────────────────────╮
│                                                          │
│  tty       yes                                           │
│  colour    truecolor                                     │
│  width     60 columns                                    │
│  NO_COLOR  unset                                         │
│                                                          │
╰──────────────────────────────────────────────────────────╯

╭─ integrity  what is installed ───────────────────────────╮
│                                                          │
│  2 artifacts · 3 places                                  │
│                                                          │
│  dangling link                                           │
│    .agents/skills/panlabs-python-standards-old/  ←       │
│    ../../.claude/skills/panlabs-python-standards-old     │
│                                                          │
│  copies of `panlabs-python-standards` differ             │
│    .agents/skills/panlabs-python-standards/              │
│    .claude/skills/panlabs-python-standards/              │
│                                                          │
╰──────────────────────────────────────────────────────────╯
```

## O aviso do `doctor`

Um **aviso** é observação sobre o ambiente, não sobre o que aterrissou. Ele
**não** reprova: uma execução só com avisos sai `0`.

| Aviso | O que significa | O que fazer |
| --- | --- | --- |
| slot sem valor | um enxerto lê um slot do ambiente, e este ambiente não o tem | ponha a variável, ou aceite que aquele servidor não sobe aqui |

:::note
Achado e aviso são vocabulário do produto, e a definição de cada um mora em
[conceitos](../conceitos). A diferença entre os dois é o código de saída, e é por
isso que eles viajam em listas separadas.
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
