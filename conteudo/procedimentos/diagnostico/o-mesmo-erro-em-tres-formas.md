---
title: O mesmo erro em três formas
description: Uma falha de credencial expirada aparece diferente em Python, em Terraform e no log do Actions — e só uma das três nomeia a causa.
---

# O mesmo erro em três formas

<Untranslated />

A causa mais comum de chamado interno é sessão expirada, e ela quase nunca é
reconhecida na primeira leitura. O motivo é que cada camada reescreve a mensagem
da camada de baixo, e a informação se perde por reescrita — não por ausência.

## O que a AWS de fato devolve

A mensagem original é precisa e nomeia a causa:

```json
{
  "Error": {
    "Code": "ExpiredToken",
    "Message": "The security token included in the request is expired"
  }
}
```

## Como ela chega em Python

O cliente da casa embrulha o erro numa exceção de domínio. A causa vira `__cause__`
e some do que a pessoa lê:

```python
Traceback (most recent call last):
  File "/opt/alfa/sincronizar.py", line 88, in <module>
    resposta = catalogo.registrar(recurso)
  File "/opt/alfa/cliente.py", line 41, in registrar
    resposta.raise_for_status()
panlabs.catalogo.ErroDeAcesso: acesso negado ao registrar recurso
```

`acesso negado` manda a pessoa pedir permissão. A permissão está correta; a
sessão é que morreu.

## Como ela chega em Terraform

O provedor reescreve de novo, e o que sobra é o endereço do recurso:

```hcl
Error: creating S3 Bucket (relatorios-dev): AccessDenied

  with module.relatorios.aws_s3_bucket.este,
  on .terraform/modules/relatorios/main.tf line 8, in resource "aws_s3_bucket" "este":
   8: resource "aws_s3_bucket" "este" {
```

O endereço é útil e a causa sumiu. `AccessDenied` aqui e `ExpiredToken` lá são o
mesmo evento.

## Como ela chega no log do Actions

A terceira reescrita perde até a categoria:

```
Run panlabs infra aplicar
  panlabs infra aplicar
  shell: /usr/bin/bash -e {0}
Erro: o apply falhou (exit 1)
Error: Process completed with exit code 1.
```

## Como reconhecer as três

| Camada | O que a mensagem diz | O que ela esconde |
| --- | --- | --- |
| AWS | `ExpiredToken` | nada — é a mensagem completa |
| Python | `acesso negado` | a expiração, e o serviço |
| Terraform | `AccessDenied` | a expiração |
| Actions | `exit code 1` | tudo |

O comando que resolve as quatro é o mesmo, e ele leva dois segundos:

```bash
aws sts get-caller-identity
```

Se ele falha com `ExpiredToken`, a causa está achada, seja qual for a forma em
que o erro apareceu.

:::tip
A regra geral que sai daqui: **quando uma mensagem de erro não nomeia a causa,
desça uma camada em vez de investigar a que você está lendo.** A camada de baixo
quase sempre sabe, e chegar até ela é mais rápido que deduzir.
:::
