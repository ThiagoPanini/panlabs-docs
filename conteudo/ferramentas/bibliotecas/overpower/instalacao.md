---
title: Instalação
description: Como obter o overpower, o atalho op que de propósito não é instalado, e a flag que prova que o pacote chegou inteiro.
---

# Instalação

Não há nada a instalar, no sentido usual, para experimentar o `overpower` uma
vez. Escolha o gerenciador que você já usa.

## Obter

<CodeGroup>

```bash title="uvx"
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code
```

```bash title="uv tool"
uv tool install overpower
uv tool upgrade overpower
```

```bash title="pipx"
pipx install overpower
pipx upgrade overpower
```

</CodeGroup>

O `uvx` baixa o pacote num ambiente isolado e efêmero, roda e joga o ambiente
fora. Nada sobra na máquina além do que o próprio `overpower` escreveu, sem
entrada em site-packages global, sem virtualenv esquecido, sem nada para
desinstalar depois porque você experimentou uma flag uma vez. É a forma certa de
rodar a partir de CI, de um terminal de uma vez só, ou de qualquer contexto em
que *instalado para sempre* seja o padrão errado.

Se você recorre ao `overpower` com frequência suficiente para que digitar `uvx
overpower@latest` toda vez vire atrito, instale como ferramenta persistente. Isso
põe um executável `overpower` no seu `PATH`, resolvido uma vez em vez de a cada
invocação, o que significa que ele deixa de se atualizar sozinho como o `@latest`
faz, e `uv tool upgrade` passa a ser algo que você roda de propósito.

## O que ele exige da máquina

**Python 3.12 ou mais novo.** É o piso declarado pelo pacote, e o `uvx` o
respeita sozinho: ele monta o ambiente com um interpretador que sirva, baixando
um se a máquina não tiver nenhum que sirva.

As dependências vêm com o pacote e você não instala nada à mão. São quatro, e
todas de terminal: o parser da linha de comando, o desenhista das telas, o
motor das perguntas do assistente e a camada de teclado embaixo dele.

O catálogo **não** é uma delas. Ele vem embutido no próprio pacote, e é por isso
que a versão da ferramenta é a versão do catálogo.

## O atalho `op` que você mesmo faz

Digitar `overpower` por extenso, toda vez, é mais longo do que a maioria das
pessoas quer. A correção óbvia é um alias de shell:

```bash
alias op='overpower'
```

O `overpower` não cria esse alias para você, e não publica um executável `op`.
É omissão deliberada, não descuido. `op` já é o nome da CLI do 1Password, que
mora em `/usr/local/bin/op` em muitas máquinas de desenvolvimento e costuma vir
antes de `~/.local/bin` no `PATH`. Publicar um segundo `op` sombrearia calado uma
ferramenta de credencial, e o `uv` recusa a instalação inteira assim que detecta
colisão de nome entre ferramentas que ele gerencia, então até o modo de falha
honesto custaria também o comando `overpower`.

:::warning
Se você já usa o `op` do 1Password, escolha um nome que não colida. Só você sabe
o que ocupa esse nome na sua máquina, e é por isso que a decisão fica com você,
como uma linha que se digita uma vez, em vez de embutida no que o pacote instala.

```bash
alias opw='uvx overpower@latest'
```
:::

Um alias é conveniência de shell interativo e nada além. Ele não expande sob `sh
-c`, que é como um alvo de `Makefile` e vários runners de CI invocam um comando,
então `op` dentro de um desses contextos falha com *command not found*
independentemente do que o seu perfil define. Isso não custa nada na prática,
porque a linha que um `Makefile`, um workflow de CI ou este próprio site
escrevem é o `uvx overpower@latest` inteiro de qualquer forma.

## `--version` como prova de que o pacote chegou inteiro

```bash
uvx overpower@latest --version
```

O `--version` lê a versão dos metadados do próprio pacote instalado, e não de um
texto fixado em algum ponto do código. Como o catálogo vem embutido na mesma
wheel que o código, o número que ele imprime é também, por construção, a versão
do catálogo que veio junto.

:::note
É a conferência mais barata disponível de que o que chegou na máquina é o que
deveria chegar. Sem instalação parcial, sem cache velho se passando por atual,
sem ambiguidade sobre de qual catálogo você está prestes a instalar.
:::
