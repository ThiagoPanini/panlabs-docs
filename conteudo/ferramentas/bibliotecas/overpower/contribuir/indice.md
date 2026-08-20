---
title: Contribuir
description: O laço de quatro comandos para contribuir com o overpower, e o que rodar antes de abrir o pull request.
---

# Contribuir

Esta página cobre o laço de trabalho para contribuir com o `overpower`: montar o
ambiente, e os quatro comandos que você roda repetidamente. Os ganchos que rodam
sem ser pedidos estão em [os dois hooks](hooks).

## Antes de começar

O `uv` instalado, e o clone do repositório. Não há task runner, e a ausência é
deliberada: o `uv` já faz o que um acrescentaria.

## Os passos

<Steps>
  <Step title="Rodar o laço de quatro comandos">
    Os mesmos quatro rodam na CI, a partir do mesmo lockfile, então *passou
    local* e *passou na CI* querem dizer a mesma coisa.

    ```bash
    uv run ruff format --check .          # formatação
    uv run ruff check .                   # lint
    uv run --group typecheck pyright      # tipos, estrito
    uv run pytest                         # testes
    ```
  </Step>

  <Step title="Armar os hooks, uma vez por clone">
    Um worktree não precisa do próprio `lefthook install`: ele compartilha
    `.git/hooks` com o clone que o possui.

    ```bash
    lefthook install
    ```
  </Step>

  <Step title="Perguntar o que não tem teste, quando a pergunta aparecer">
    Cobertura é diagnóstico, não portão. Não há limiar em `pyproject.toml`, não
    há selo, e não há nada na CI.

    ```bash
    uv run --with pytest-cov pytest --cov=src/overpower --cov-report=term-missing
    ```
  </Step>
</Steps>

## Verificação

Rode as três conferências que o pull request vai rodar, na mesma ordem:

```bash
uv run pyright
```

```bash
uv run pytest
```

```bash
lefthook run pre-commit
```

As três precisam sair `0`. O `pyright` termina em `0 errors`, o `pytest` fecha
sem falha nem erro, e o `pre-commit` imprime cada tarefa com `ok`. Qualquer saída
diferente de zero é o mesmo veredito que o portão daria mais tarde.

:::warning
O `pyright` roda em modo `strict`, contra o Python de piso, `3.12`, e nunca
contra a versão que o seu interpretador por acaso tem. Se você rodar sem `uv run`,
a conferência local usa outro interpretador e o resultado deixa de valer.
:::

## O que a suíte cobre

O `pytest` roda a suíte inteira, em toda plataforma da matriz. Não há marcador
para *lento* e não há camada que rode num sistema operacional só, porque o que a
suíte testa é comportamento de disco, e comportamento de disco é exatamente o que
diverge entre plataformas.

:::note
O hook é o atalho, não o portão. O portão é o conjunto de regras em `main`, e um
conjunto de regras não tem `--no-verify`: as listas de quem pode passar por cima
estão vazias, inclusive para o dono do repositório. O que o hook compra é
velocidade, ao pegar o erro barato antes de um push pagar por um job de CI.
:::
