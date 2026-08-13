---
title: Rodar a esteira localmente
description: Como reproduzir uma reprovação de esteira na própria máquina, sem gastar um ciclo de push por tentativa.
---

# Rodar a esteira localmente

<Untranslated />

Investigar uma reprovação pelo log do runner custa um push, uma fila e três
minutos por tentativa. O template da casa existe para que isso não seja
necessário: todo passo de verificação é uma linha do `Makefile`, e o workflow
chama o `Makefile` em vez de repetir o comando.

## Antes de começar

O ambiente virtual do projeto ativo, e as dependências de desenvolvimento
instaladas. Ver [Preparar a máquina local](/procedimentos/ambiente/preparar-a-maquina-local).

## Os passos

<Steps>
  <Step title="Achar o alvo que falhou">
    O nome do passo no log é o nome do alvo. `Verificar tipos` é `make tipos`.

    ```bash
    make -n verificar        # lista os alvos que a esteira roda, em ordem
    ```
  </Step>

  <Step title="Rodar só ele">
    Rodar `make verificar` inteiro repete o que já passou e esconde a falha no
    meio da saída.

    ```bash
    make tipos
    ```
  </Step>

  <Step title="Rodar tudo antes de empurrar">
    Só depois de o alvo isolado passar. A ordem importa: alguns alvos escrevem
    artefato que os seguintes leem.

    ```bash
    make verificar
    ```
  </Step>
</Steps>

## Verificação

A saída local e a do runner precisam ser a mesma. Quando não são, a diferença é
quase sempre de versão de intérprete ou de variável de ambiente ausente — e o
alvo `make ambiente` imprime as duas para comparação:

```bash
make ambiente
# python 3.12.7  ·  panlabs-cli 3.2.1  ·  PANLABS_INDICE definido
```

:::tip
Se `make ambiente` local e o do runner concordam e o resultado ainda diverge, a
diferença é de **estado**: cache, arquivo não versionado, ou banco local com
dados de uma execução anterior. `git clean -ndx` lista o que existe na sua
máquina e não existe na do runner.
:::

## Variações

**O passo depende de credencial da nuvem.** Assuma o papel de `dev` antes; o
runner assume o dele por identidade federada, e localmente o equivalente é
`panlabs ambiente usar dev`.

**O passo roda em container.** O `Makefile` traz o alvo com sufixo `-container`,
que monta o diretório e roda o mesmo comando com a imagem que a esteira usa.

:::warning
Não copie o comando do arquivo de workflow para o terminal. Ele frequentemente
depende de variável que o Actions injeta, e o que você reproduz passa a ser um
comando parecido em vez do mesmo — que é a forma mais cara de investigar.
:::
