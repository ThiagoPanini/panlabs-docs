---
title: O atalho op
description: Por que o overpower não publica um executável op, e como escrever o seu alias sem sombrear a CLI do 1Password.
---

# O atalho `op`

Digitar `overpower` por extenso, toda vez, é mais longo do que a maioria das
pessoas quer. A correção é um alias de shell, escrito por você, no seu perfil.

## Escolher o nome do alias

Escolha o nome antes de escrever a linha. Rode `command -v op` e veja o que
responde: se vier um caminho, aquele nome já está ocupado na sua máquina.

| O que `command -v op` responde | Escreva o alias como |
| --- | --- |
| nada | `alias op='uvx overpower@latest'` |
| `/usr/local/bin/op` ou outro caminho | `alias opw='uvx overpower@latest'` |
| um alias que você mesmo pôs | troque o nome, ou aceite substituí-lo |

```bash
alias op='uvx overpower@latest'
```

:::warning
Se você já usa o `op` do 1Password, escolha um nome que não colida. Só você sabe
o que ocupa esse nome na sua máquina, e é por isso que a decisão fica com você,
como uma linha que se digita uma vez, em vez de embutida no que o pacote instala.

```bash
alias opw='uvx overpower@latest'
```
:::

## Por que a ferramenta não publica o `op`

O `overpower` não cria esse alias para você, e não publica um executável `op`.
É omissão deliberada, não descuido. `op` já é o nome da CLI do 1Password, que
mora em `/usr/local/bin/op` em muitas máquinas de desenvolvimento e costuma vir
antes de `~/.local/bin` no `PATH`. Publicar um segundo `op` sombrearia calado uma
ferramenta de credencial, e o `uv` recusa a instalação inteira assim que detecta
colisão de nome entre ferramentas que ele gerencia, então até o modo de falha
honesto custaria também o comando `overpower`.

## Onde o alias não vale

Um alias é conveniência de shell interativo e nada além. Ele não expande sob `sh
-c`, que é como um alvo de `Makefile` e vários runners de CI invocam um comando,
então `op` dentro de um desses contextos falha com *command not found*
independentemente do que o seu perfil define. Isso não custa nada na prática,
porque a linha que um `Makefile`, um workflow de CI ou este próprio site
escrevem é o `uvx overpower@latest` inteiro de qualquer forma.

:::note
Escreva a linha no arquivo que o seu shell lê ao abrir, `~/.zshrc` ou
`~/.bashrc`, e abra um terminal novo para valer. Conferir é rodar `op --version`
e ver a versão que a [instalação](instalacao) descreve.
:::
