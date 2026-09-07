---
title: A versão 0.31.0 do overpower troca clone por endereço
description: O que muda quando uma receita de servidor MCP passa a declarar a fonte do próprio código, em vez de instalar a partir de um clone.
date: 2026-09-07
tags: [novidades, overpower]
authors: thiago
---

Uso o `overpower` para instalar skill, servidor MCP e receita a partir de um
catálogo declarado, e a versão 0.31.0 mudou uma peça que eu não esperava:
como uma receita aponta para um servidor com código próprio.

## O que era antes

Uma receita cujo servidor tinha código próprio dependia de um clone. O
`overpower` mantinha esse clone em `~/.overpower/mcp/`, um diretório por
receita, escopo de máquina por natureza: o clone vivia ali, e o arquivo de
configuração escrito para cada projeto apontava para ele.

## O que muda na 0.31.0

Agora a receita declara `source:`, com quatro chaves: `git`, `ref`, `runner`
e `entrypoint`. O `overpower` monta a linha do runner a partir delas, com o
`server.args` da receita aposto no fim, e não clona nada. O
`~/.overpower/mcp/` deixou de existir, e é por isso que uma receita com fonte
volta a instalar em escopo de projeto: o arquivo que cada máquina escreve sai
idêntico, porque não depende mais de um clone local.

O `ref` é obrigatório, e o `runner` é vocabulário fechado: só `uvx` ou `npx`,
recusados por nome fora dessas duas opções. `transport`, `server.command` e a
precondição de runner passaram a **derivados**: declarar qualquer um deles ao
lado de `source:` também é recusa por nome, porque os dois jeitos de
descrever o mesmo servidor deixariam de concordar em algum momento.

O `source:` antigo, com a chave `url`, e o token de substituição que ele
usava pararam de ser lidos. **Sem janela de compatibilidade**: uma receita
escrita no formato anterior falha, nomeando o que precisa mudar.

## O que isso resolve no dia a dia

O `doctor` perdeu as duas conferências que existiam para o clone e ganhou
uma no lugar: re-roda a precondição do runner contra o `PATH`, offline. E o
`list --from` passou a mostrar a origem e a ref na linha do servidor, o que
antes exigia abrir o arquivo da receita para saber.

O registro completo, com todas as versões, está no
[changelog do overpower](/ferramentas/bibliotecas/overpower/referencia/changelog).
