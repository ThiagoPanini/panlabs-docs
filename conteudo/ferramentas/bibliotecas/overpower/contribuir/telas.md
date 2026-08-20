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

Rode só os testes de tela e leia o diff, se houver:

```bash
uv run pytest -k snapshot
```

Sem mudança de tela, a saída fecha sem falha. Com mudança, o `pytest` imprime o
diff entre a tela gravada e a tela nova, linha a linha. **Leia o diff antes de
regravar**: ele é a única revisão que a tela recebe.

```bash
uv run pytest -k snapshot --snapshot-update
```

:::warning
Regravar sem ler o diff transforma o snapshot em carimbo. O teste passa a
registrar o que a ferramenta faz, em vez de o que ela deve fazer, e para de
reprovar exatamente quando você mais precisaria.
:::

## O que um snapshot grava

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
