---
title: Visão geral
description: Esteira como código — do primeiro workflow gerado ao pipeline rodando, em cinco passos e sem editar YAML à mão.
---

# Visão geral

A Biblioteca C descreve esteiras em Python e emite os workflows de GitHub
Actions. Ela existe porque YAML de esteira é copiado entre repositórios e
diverge em silêncio — e um workflow que diverge não é notado até o dia em que
ele deixa de reprovar o que deveria.

## Instalação e primeiro workflow

<Steps>
  <Step title="Instalar">
    ```bash
    pip install --index-url "$PANLABS_INDICE" "panlabs-esteira>=4.0"
    ```
  </Step>

  <Step title="Descrever a esteira">
    Um arquivo Python, no lugar do YAML. Os passos são objetos, e o que a casa
    já decidiu vem de `panlabs.esteira.padrao`.

    ```python
    # esteira.py
    from panlabs.esteira import Esteira, padrao

    esteira = Esteira(nome="verificar", em=["pull_request"])
    esteira.trabalho("verificar", padrao.python(versao="3.12"))
    ```
  </Step>

  <Step title="Gerar">
    O YAML sai no diretório de workflows, com um cabeçalho dizendo que ele é
    gerado.

    ```bash
    python -m panlabs.esteira gerar esteira.py
    ```
  </Step>

  <Step title="Conferir na esteira">
    O passo que reprova quando o YAML commitado não é o que o Python produz. É
    ele que impede a edição à mão.

    ```bash
    python -m panlabs.esteira conferir esteira.py
    ```
  </Step>

  <Step title="Empurrar">
    ```bash
    git add .github/workflows esteira.py
    git commit -m "esteira de verificação"
    git push
    ```
  </Step>
</Steps>

:::warning
O YAML gerado **não é editável**. Ele abre com um cabeçalho dizendo isso, e o
passo de conferência reprova qualquer edição — a fonte é o Python, e duas fontes
divergem no dia em que alguém corrige só uma.
:::

:::tip
`padrao.python()` já traz teste, tipo, formato e varredura na ordem que a casa
usa. Comece por ele e acrescente o que for específico do repositório; começar do
zero é como se herda o workflow de outro time por cópia.
:::

## O que ela não faz

Ela não executa esteira e não fala com o GitHub. A saída dela é YAML no disco, e
quem o executa é o Actions como sempre — trocar o executor seria trocar uma
ferramenta auditada por dívida própria.

Ela também não valida se a esteira **funciona**: só se ela está completa e
segura. As quatro recusas estão em [Tratamento de erros](tratamento-de-erros).

## Próximos passos

<CardGroup>
  <Card title="Instalação e configuração" icon="download" href="instalacao-e-configuracao">
    As opções de instalação, o arquivo de configuração e o que fazer num
    repositório que já tem workflows.
  </Card>
  <Card title="Tratamento de erros" icon="circle-alert" href="tratamento-de-erros">
    Por que a geração falha alto, e como ler o erro que ela levanta.
  </Card>
  <Card title="Changelog" icon="clock" href="changelog">
    O que mudou em cada versão, e o que quebrou contrato.
  </Card>
</CardGroup>
