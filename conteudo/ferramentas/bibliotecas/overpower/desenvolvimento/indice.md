---
title: Desenvolvimento
description: O laço de quatro comandos, e os hooks locais que guardam todo commit.
---

# Desenvolvimento

Esta página cobre o laço de trabalho para contribuir com o `overpower`: montar o
ambiente, e os quatro comandos que você roda repetidamente. Ela cobre também os
hooks que rodam sem ser pedidos, e o que cada um rejeita.

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

O `pyright` roda em modo `strict`, contra o Python de piso, `3.12`, e nunca
contra a versão que o seu interpretador por acaso tem. O `pytest` roda a suíte
inteira, em toda plataforma da matriz. Não há marcador para *lento* e não há
camada que rode num sistema operacional só, porque o que a suíte testa é
comportamento de disco, e comportamento de disco é exatamente o que diverge entre
plataformas.

:::note
O hook é o atalho, não o portão. O portão é o conjunto de regras em `main`, e um
conjunto de regras não tem `--no-verify`: as listas de quem pode passar por cima
estão vazias, inclusive para o dono do repositório. O que o hook compra é
velocidade, ao pegar o erro barato antes de um push pagar por um job de CI.
:::

## Os dois hooks

O **`pre-commit`** roda sobre o conjunto em stage, em paralelo, e rejeita quatro
coisas: formatação fora do padrão nos `.py` em stage, lint nos mesmos arquivos,
qualquer coisa sob `src/overpower/content/` escondida do git, e segredo detectado
pelo `gitleaks` sobre o diff em stage.

O **`commit-msg`** roda o `commitlint`, conferindo Conventional Commits com
assunto em minúsculas.

:::warning
Uma execução sem sujeito, quando o diretório não existe ou o git não rastreia
nada sob ele, é tratada como falha, e não como aprovação vazia. Um portão que
passa por não ter o que conferir é um portão que some no dia em que o caminho
muda de nome.
:::

O `lefthook`, o `gitleaks` e o ferramental de que o `commitlint` precisa são
equipamento da máquina, não do repositório. Um clone numa máquina sem eles perde
o atalho por desenho, e ainda encontra o mesmo portão no pull request. Quando um
hook rejeita um commit, ele imprime a saída do próprio comando que falhou, na
hora da rejeição, então não há log separado para ir procurar.
