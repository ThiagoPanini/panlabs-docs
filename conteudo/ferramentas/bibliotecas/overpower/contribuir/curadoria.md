---
title: Curadoria
description: Como o conteúdo vendorizado é renovado, e o que um candidato precisa ser para ganhar lugar no catálogo.
---

# Curadoria

Esta página cobre as duas perguntas que decidem o que o `overpower` carrega: como
o conteúdo vindo de fora é renovado sem derivar, e o que um candidato tem de ser
antes de ganhar lugar no catálogo.

## Antes de começar

O ambiente de desenvolvimento montado, e a referência nova lá de cima em mãos.
Renovar o catálogo é algo que uma pessoa faz à mão, de propósito, e não um job
agendado.

## Os passos

<Steps>
  <Step title="Ler o manifesto de lá em cima, na referência nova">
    Para o `mattpocock/skills`, é o array `skills` de
    `.claude-plugin/plugin.json`, e especificamente nunca o campo `version` ao
    lado dele, que foi medido parado enquanto o array se movia.

    ```bash
    git -C ../skills show <ref>:.claude-plugin/plugin.json
    ```
  </Step>

  <Step title="Trocar a árvore e atualizar a atribuição">
    Se o que aterrissa não é a árvore versionada verbatim, a transformação
    acontece na curadoria e o que é vendorizado é a saída dela. Atualize o
    `NOTICE`, com a referência e o commit por origem, e o `licenses/` se o
    arquivo de licença lá em cima mudou de lugar.

    ```bash
    uv run pytest tests/test_content.py
    ```
  </Step>

  <Step title="Rodar os quatro comandos, mais o teste de rede">
    O teste que toca o GitHub de verdade é passo de curadoria, e não portão.

    ```bash
    OVERPOWER_NETWORK_TESTS=1 uv run pytest -m network
    ```
  </Step>

  <Step title="Subir a versão">
    A versão do `overpower` é a versão do catálogo que ele embute, então uma
    renovação que ninguém consegue instalar não é renovação.

    ```bash
    uv version --bump minor
    ```
  </Step>
</Steps>

## Verificação

Confirme que o item novo aparece no catálogo e abre por inteiro:

```bash
uvx overpower@latest list
```

```bash
uvx overpower@latest list --skill <nome>
```

O `list` nu imprime o catálogo em quatro blocos, e o item novo tem de estar no
bloco da classe dele. Com o seletor, a saída traz o tamanho, a contagem de
arquivos e a descrição por inteiro, nunca truncada, mais a linha que instala o
item.

:::warning
Um portão bloqueia o que este repositório controla. O que depende de terceiro é
verificado aqui, à mão, porque automatizar uma conferência contra o repositório de
outra pessoa poria a disponibilidade e a estabilidade de um terceiro dentro da CI
deste projeto, o que foi medido instável e recusado exatamente por isso.
:::

:::note
Este último passo deixou de ser algo a lembrar. O `src/overpower/content/` está
dentro da wheel, então o `release-ready` recusa o pull request até que a subida
aconteça.
:::
