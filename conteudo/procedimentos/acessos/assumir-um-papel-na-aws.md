---
title: Assumir um papel na AWS
description: O procedimento de todo dia — do login corporativo à sessão temporária, com MFA onde ele é exigido.
---

# Assumir um papel na AWS

<Untranslated />

Nenhuma credencial de longa duração fica na máquina. O que fica é a instrução de
como obter uma temporária: o login corporativo autentica a pessoa, e o papel diz
o que ela pode fazer enquanto a sessão durar.

## Antes de começar

O CLI da casa instalado e o ambiente escolhido. Ver
[Preparar a máquina local](/procedimentos/ambiente/preparar-a-maquina-local).

## Os passos

<Steps>
  <Step title="Autenticar">
    Abre o navegador, autentica no provedor corporativo e grava o token de
    sessão. Uma vez por dia útil em `dev`; a cada quatro horas em `staging`.

    ```bash
    panlabs login
    ```
  </Step>

  <Step title="Assumir o papel">
    O papel sai da configuração do projeto, e o comando não aceita um papel que
    não esteja declarado — digitar o identificador à mão é como se assume o
    papel de outra equipe por engano.

    ```bash
    panlabs assumir leitura
    # papel-<equipe>-leitura-dev · us-east-1 · expira 11:58
    ```
  </Step>

  <Step title="Conferir quem você é">
    Antes de qualquer comando que escreva. A sessão anterior pode não ter
    expirado, e a diferença entre `dev` e `prd` é uma letra no identificador.

    ```bash
    aws sts get-caller-identity --query Arn --output text
    ```
  </Step>
</Steps>

## Verificação

O identificador devolvido termina com o nome do papel e o do ambiente. Se ele
termina com o seu nome de usuário, você está usando credencial pessoal e não
assumiu papel nenhum:

```bash
aws sts get-caller-identity --query Arn --output text
# arn:aws:sts::000000000000:assumed-role/papel-<equipe>-leitura-dev/<sessao>
```

:::warning
`assumed-role` no identificador é a parte que importa. `arn:aws:iam::…:user/…`
significa credencial pessoal ativa — e ela não deveria existir na máquina.
Rode `panlabs doutor` para achar de onde ela está vindo.
:::

## Variações

**Papel de plantão.** Exige justificativa na linha de comando, e ela vai para o
registro de auditoria junto com a sessão. A sessão dura uma hora e não renova.

```bash
panlabs assumir plantao --justificativa "incidente 4821, fila parada"
```

**Mais de uma sessão ao mesmo tempo.** Cada terminal pode ter a sua: o comando
exporta para o processo, não para o usuário. Duas abas com papéis diferentes é o
uso normal, e é mais seguro que uma sessão ampla.

:::tip
A sessão expirada não avisa: o comando seguinte falha com erro de credencial que
não menciona expiração. `panlabs assumir` de novo resolve, e é mais rápido que
ler a mensagem.
:::
