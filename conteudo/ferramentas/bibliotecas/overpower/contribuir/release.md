---
title: Release
description: O towncrier, a subida de versão como ato do autor, e por que publicar é mergear.
---

# Release

Esta página cobre como uma mudança vira um lançamento: o fragmento de changelog
que todo pull request carrega, o `towncrier` montando os fragmentos, e a subida
de versão como ato deliberado do autor em vez de algo calculado.

## Antes de começar

Um branch com a mudança pronta e o portão local verde. Publicar é mergear: um
merge em `main` que move a versão em `pyproject.toml` cria a tag e dispara o
lançamento, e um merge que não a move não publica nada.

## Os passos

<Steps>
  <Step title="Deixar um fragmento por pull request">
    Todo pull request que muda comportamento deixa um fragmento em
    `changelog.d/`, nomeado `<issue>.<tipo>.md`, onde o tipo é um de `breaking`,
    `added`, `changed`, `deprecated`, `removed`, `fixed` ou `security`.

    ```bash
    echo "O que mudou, em uma frase." > changelog.d/142.added.md
    ```
  </Step>

  <Step title="Subir a versão no nível que os fragmentos exigem">
    O nível não é julgamento. Ele é lido dos tipos dos fragmentos que estão em
    `changelog.d/`.

    ```bash
    uv version --bump minor
    ```
  </Step>

  <Step title="Montar o changelog">
    Entradas em `CHANGELOG.md` nunca são escritas à mão. O número da issue vem de
    graça no nome do arquivo, e é isso que transforma o changelog num índice
    navegável de volta para as decisões.

    ```bash
    uv run towncrier build --version "$(uv version --short)"
    ```
  </Step>
</Steps>

## Verificação

Confira a versão que o pull request leva, antes de abri-lo:

```bash
uv version
```

O número impresso tem de estar acima do que a `main` publica. Depois do merge e do
deploy, confirme que o PyPI serve a versão nova:

```bash
uvx overpower@latest --version
```

A saída é a mesma versão que o `uv version` mostrou. Enquanto o PyPI ainda não
propagou, `@latest` continua devolvendo a anterior.

:::note
O `release-ready` é uma conferência obrigatória ao lado do `gate`, e recusa um
pull request que muda o que aterrissa na wheel sem também mover a versão. A
mensagem de falha imprime o nível que ele calculou e os dois comandos a rodar; a
tabela de níveis está em [o release-ready](release-ready).
:::

:::warning
`uvx overpower@latest` guarda o que já baixou. Se a versão nova não aparecer,
force a busca em vez de concluir que o deploy falhou.
:::
