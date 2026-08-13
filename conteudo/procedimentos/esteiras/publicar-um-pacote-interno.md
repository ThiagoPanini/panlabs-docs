---
title: Publicar um pacote interno
description: Do merge em main até o pacote disponível no índice interno, com versão derivada da tag e publicação sem senha.
---

# Publicar um pacote interno

<Untranslated />

Publicar é o passo que mais tenta virar manual, porque a primeira vez sempre
funciona à mão. O procedimento abaixo existe para que a segunda vez também
funcione, feita por outra pessoa, sem que ninguém precise de credencial de
publicação na máquina.

## Antes de começar

O repositório precisa do workflow `publicar.yml` do template e de uma variável
de repositório com o papel de publicação. Nenhum segredo de longa duração: a
autenticação é por identidade federada do próprio runner.

## Os passos

<Steps>
  <Step title="Marcar a versão">
    A versão sai da tag, e a tag é a única fonte. Nada de editar número em
    arquivo — dois lugares divergem no dia em que alguém esquece um.

    ```bash
    git tag -a v2.4.0 -m "cursor opaco na listagem"
    git push origin v2.4.0
    ```
  </Step>

  <Step title="Deixar a esteira construir">
    O passo lê a tag e a injeta na build. Sem tag, a versão sai com sufixo de
    desenvolvimento e o índice a recusa.

    ```yaml
    - name: Construir
      run: |
        export VERSAO="${GITHUB_REF_NAME#v}"
        python -m build
    ```
  </Step>

  <Step title="Publicar sem senha">
    O runner troca o token de identidade por uma credencial de curta duração.
    Nenhum segredo de publicação existe em lugar nenhum.

    ```yaml
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ vars.PAPEL_PUBLICACAO }}
        aws-region: us-east-1
    - run: panlabs-publicar dist/*
    ```
  </Step>
</Steps>

## Verificação

O pacote aparece no índice em menos de um minuto. O teste real é instalá-lo
numa máquina que não é a sua — ou num container limpo, que é mais rápido:

```bash
docker run --rm python:3.12-slim \
  pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo-contrato==2.4.0"
```

:::tip
Instalar fixando a versão exata é o que prova a publicação. `pip install pacote`
sem versão pode resolver para uma cópia em cache e passar mesmo quando a
publicação falhou.
:::

## Variações

**Pré-lançamento.** Tag com sufixo — `v2.5.0rc1` — publica normalmente e o
índice a marca como pré-lançamento; `pip` só a instala com `--pre`.

**Republicar a mesma versão.** Não existe. O índice recusa sobrescrita, e é
deliberado: um pacote que muda de conteúdo mantendo a versão quebra todo cache
que já o baixou.

:::warning
Apagar uma tag publicada não despublica o pacote. A saída é publicar uma versão
nova, sempre — inclusive quando a anterior tem duas horas de vida.
:::
