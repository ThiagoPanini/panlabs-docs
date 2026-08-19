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

O `release-ready`, uma conferência obrigatória ao lado do `gate`, recusa um pull
request que muda o que aterrissa na wheel sem também mover a versão, e a mensagem
de falha dele imprime o nível que calculou e os dois comandos a rodar.

| Tipo de fragmento | Nível em `0.x` | Nível em `≥ 1.0` |
| --- | --- | --- |
| `breaking` e `removed` | minor | major |
| `added`, `changed` e `deprecated` | minor | minor |
| `fixed` e `security` | patch | patch |

:::note
O `release-ready` só dispara quando um pull request toca o gatilho da **wheel**,
que é `src/`, `README.md`, `NOTICE`, `LICENSE`, `licenses/` ou a tabela
`[project]` de `pyproject.toml`. Um pull request confinado a `docs/`, `tests/`,
`.github/` ou uma tabela `[tool.*]` mergeia sem publicar nada.
:::

Enquanto o projeto está em `0.x`, uma quebra não promove o primeiro dígito. Isso é
o Versionamento Semântico §4 lido ao pé da letra: nada é estável ainda, então nada
pode quebrar estabilidade. Chegar em `1.0.0` continua sendo um ato deliberado
próprio, e um pull request que fixa `uv version 1.0.0` passa, porque a conferência
impõe um **piso**, nunca igualdade.

## Dois portões, dois remédios diferentes

O `gate` e o `release-ready` são os dois obrigatórios em `main`, e ficam
deliberadamente separados em vez de fundidos num só. O `gate` quer dizer *o código
está são*; o `release-ready` quer dizer *mergear isto publica*. As duas falhas têm
correções diferentes, e um nome por remédio é o que permite a quem contribui,
pessoa ou agente trabalhando sozinho, agir certo na primeira leitura da conferência
vermelha.

:::warning
Nada que entra em `main` pula isso. Não há lista de exceção, nem para o dono do
repositório, porque um bot empurrando com as credenciais do próprio autor faria de
*passar por cima* e *empurrar como o agente* a mesma porta.
:::
