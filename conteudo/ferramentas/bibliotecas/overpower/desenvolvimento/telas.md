---
title: Telas
description: Como uma tela é testada, com estrutura no portão e um snapshot por tela, e como atualizar um snapshot de propósito.
---

# Telas

Esta página cobre a saída de terminal como superfície testada: o que um snapshot
captura, quais telas têm um, e como atualizar um snapshot de propósito em vez de
por acidente. Ela traça a linha entre o que o portão afirma sobre estrutura e o
que o snapshot fixa sobre aparência.

## Antes de começar

A suíte rodando localmente, e o entendimento de que cor não quebra teste aqui.
Layout quebra. Dividir a asserção em duas é o que mantém as duas baratas.

## Os passos

<Steps>
  <Step title="Rodar as telas isoladas">
    As telas gravadas vivem em `tests/snapshots/`, um arquivo de texto puro por
    tela, capturado a 80 e a 60 colunas, sem cor.

    ```bash
    uv run pytest tests/test_screens.py
    ```
  </Step>

  <Step title="Atualizar só quando a mudança foi de propósito">
    Reescrever um snapshot é ato explícito, nunca efeito colateral de rodar a
    suíte.

    ```bash
    uv run pytest --snapshot-update tests/test_screens.py
    ```
  </Step>

  <Step title="Ler o diff antes de commitar">
    Se o diff depois da atualização toca uma tela que você não pretendia mudar,
    esse é o sinal de que a mudança teve raio de alcance maior que o pretendido.

    ```bash
    git diff --stat tests/snapshots/
    ```
  </Step>
</Steps>

## Verificação

Um snapshot é tirado do console renderizado, com `Console(record=True).export_text()`,
e nunca do fluxo cru de bytes que um terminal receberia. Os dois não são a mesma
coisa: o fluxo cru também carrega as sequências de controle de cursor da barra de
progresso transitória, que descrevem uma animação e não a tela que uma pessoa de
fato vê no fim.

:::note
Cada snapshot renderiza uma **fixture**, e não o catálogo publicado. Assim, uma
renovação de conteúdo, uma skill acrescentada ou uma descrição reescrita lá em
cima, não reescreve telas que nada têm a ver com conteúdo.
:::

## Estrutura no portão, aparência no snapshot

Uma gravação de sessão inteira é um diff que ninguém lê: um ajuste visual pequeno
e deliberado pode tocar metade dos bytes de uma captura longa, e uma regressão de
verdade pode se esconder dentro desse ruído.

O **portão afirma estrutura**, com propriedades que carregam significado e que um
ajuste de borda ou de espaçamento não tem por que tocar: saída sob cano não
carrega ANSI nenhum, a marca é suprimida quando não há TTY, nenhuma descrição é
truncada a 80 nem a 60 colunas, nenhuma linha renderizada passa da largura do
terminal, e todo caminho do plano está também na saída renderizada.

O **snapshot fixa aparência**, um arquivo por tela, para que um redesenho que
toca uma tela apareça como mudança em exatamente um arquivo.

:::warning
Não há plugin de snapshot neste projeto. O comparador é pequeno e mora em
`tests/support/snapshots.py`, ao lado de `--snapshot-update`, declarado em
`conftest.py`. Uma dependência de desenvolvimento a menos, e o caminho de
atualização continua sendo algo que se lê no arquivo de teste.
:::

## O que não é snapshot

A tela de seleção do assistente, a lista que o `questionary` desenha para
escolher artefatos, em boa parte não é deste projeto para gravar: as linhas de
onde uma pessoa escolhe são desenhadas pelo `InquirerControl` do próprio
`questionary`, e gravar a renderização de outra pessoa fixa a mudança futura de
outra pessoa.

O que **é** desenho deste projeto, o bloco travado, o viewport, o contador e o
rodapé em volta daquela lista, é afirmado estruturalmente: pergunta, bloco
estático, viewport, contador e rodapé precisam caber na altura de um terminal
real, e o viewport nunca pode cair abaixo de um piso de linhas visíveis. Ao lado
dessa aritmética, um teste de PTY prova que o chrome em volta chega a um terminal
de verdade, que é a mesma divisão usada em todo o resto desta página.
