---
title: Tratamento de erros
description: Por que a geração falha alto em vez de emitir YAML parcial, quais são as quatro recusas, e como ler o ponteiro que cada uma devolve.
---

# Tratamento de erros

A biblioteca gera um artefato que outra máquina vai executar sem ninguém olhar.
Isso decide o modelo de erro inteiro: **ela nunca emite saída parcial.** Ou o
YAML descreve a esteira completa, ou não há YAML, porque um workflow que roda
faltando um passo passa, e passar sem verificar é pior que não rodar.

## A lista fechada de recusas

| Recusa | O que a dispara | O que o ponteiro nomeia |
| --- | --- | --- |
| `PassoSemNome` | passo sem `nome` | o trabalho e a posição do passo |
| `ReferenciaNaoFixada` | ação de terceiro sem versão fixada | a ação e o trabalho |
| `SegredoInline` | valor com aparência de segredo no YAML | o passo e a chave |
| `PermissaoAmpla` | `permissions: write-all` | o trabalho |

A lista é fechada de propósito: uma recusa que não está aqui é um defeito da
biblioteca, não uma esteira inválida. Recusa aberta convida a validação a crescer
até virar opinião.

## Como um erro se apresenta

```python
from panlabs.esteira import Esteira, ErroDeGeracao

try:
    esteira.gerar()
except ErroDeGeracao as erro:
    print(erro.recusa)      # ReferenciaNaoFixada
    print(erro.ponteiro)    # trabalhos.verificar.passos[2].uses
    print(erro.detalhe)     # "actions/checkout sem versão fixada"
```

`ponteiro` é o campo que faz a mensagem valer alguma coisa. Uma recusa que diz
*"há uma ação sem versão"* obriga a procurar; uma que diz
`trabalhos.verificar.passos[2].uses` aponta.

## Por que fixar versão é recusa e não aviso

Uma ação de terceiro referenciada por tag move debaixo de você: a tag é
reescrita, o conteúdo muda, e a esteira passa a executar código que ninguém
revisou. É a única recusa da lista que existe por razão de segurança e não de
correção.

```python
# recusado
esteira.passo(usa="actions/checkout@v4")

# aceito: a tag continua legível no comentário
esteira.passo(usa="actions/checkout@b4ffde6…", comentario="v4.2.2")
```

:::warning
A recusa vale para ação de terceiro, e **não** para ação da casa: as internas
vivem no mesmo domínio de confiança e são referenciadas por tag de propósito,
para que a correção chegue sem um `pull request` em cada repositório.
:::

## O que a biblioteca não valida

Ela não confere se o workflow **funciona**, só se ele está completo e seguro.
Erro de lógica de esteira aparece na execução, e o lugar de reproduzi-lo é
local: ver
[Rodar a esteira localmente](/procedimentos/esteiras/rodar-a-esteira-localmente).
