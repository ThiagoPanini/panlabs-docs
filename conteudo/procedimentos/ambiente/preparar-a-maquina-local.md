---
title: Preparar a máquina local
description: Os quatro passos entre uma máquina nova e o primeiro comando que fala com dev, sem privilégio de administrador.
---

# Preparar a máquina local

<Untranslated />

O objetivo é chegar até `panlabs ambiente atual` respondendo `dev`. Nada aqui
exige privilégio de administrador, e nada instala pacote do sistema — o
ambiente inteiro mora no diretório do projeto, que é o que torna o
procedimento repetível e descartável.

## Antes de começar

Python 3.12 ou mais novo, `git`, e acesso ao índice interno de pacotes. O acesso
ao índice vem do mesmo login corporativo; se `pip` pedir usuário e senha, o
login não está propagado ainda.

## Os passos

<Steps>
  <Step title="Criar o ambiente virtual">
    Dentro do diretório do projeto, sempre com o nome `.venv` — a esteira e os
    editores procuram por esse nome.

    ```bash
    python3.12 -m venv .venv
    source .venv/bin/activate
    ```
  </Step>

  <Step title="Instalar as ferramentas da casa">
    Um pacote só, que traz o CLI e as dependências de desenvolvimento.

    ```bash
    pip install --index-url "$PANLABS_INDICE" "panlabs-cli>=3.2"
    ```
  </Step>

  <Step title="Apontar para o ambiente">
    O comando escreve o perfil da AWS e o papel a assumir. Ele não guarda
    credencial: guarda a instrução de como obtê-la.

    ```bash
    panlabs ambiente usar dev
    ```
  </Step>

  <Step title="Conferir">
    A saída deve nomear o ambiente e o papel, nesta ordem.

    ```bash
    panlabs ambiente atual
    # dev · papel-<equipe>-dev · us-east-1 · sessão válida por 11h58
    ```
  </Step>
</Steps>

## Verificação

Se `panlabs ambiente atual` responde `dev` e a sessão tem validade, a máquina
está pronta. O primeiro comando que de fato fala com a nuvem é o de listagem, e
ele é o teste real:

```bash
panlabs catalogo listar --limite 1
```

:::tip
`panlabs ambiente atual` não faz chamada de rede: ele lê a configuração local. É
por isso que ele responde rápido e é por isso que ele **não** prova acesso — quem
prova é o comando de listagem.
:::

## Variações

**Sem acesso ao índice interno.** Use o espelho público e instale só o CLI, sem
as dependências internas: `pip install panlabs-cli --no-deps`. Vários
subcomandos vão faltar, e o de ambiente funciona.

**Mais de um projeto na mesma máquina.** Cada projeto tem o próprio `.venv` e a
própria configuração de ambiente. O `panlabs ambiente usar` escreve no diretório
do projeto, nunca no diretório do usuário — trocar de projeto troca de ambiente
sozinho.

:::warning
Não copie o `.venv` entre máquinas nem o comite. Ele carrega caminhos absolutos,
e um `.venv` copiado falha com erro de interpretador que não aponta para a causa.
:::
