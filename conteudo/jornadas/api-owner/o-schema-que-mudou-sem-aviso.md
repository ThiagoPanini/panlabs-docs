---
title: O schema que mudou sem aviso
description: Um campo opcional virou obrigatório sem subir de major, e o erro só apareceu no terminal de quem consumia — em três formatos diferentes.
---

# O schema que mudou sem aviso

<Untranslated />

A política de versão estava escrita, a esteira cobrava, e mesmo assim um campo
opcional virou obrigatório numa `1.5.0`. O motivo é chato e vale registrado: a
mudança não foi no contrato, foi na **validação de entrada** do serviço, e a
esteira só comparava os tipos publicados. O contrato continuou dizendo
`opcional`; o serviço passou a recusar.

## Como o erro chegou

Não chegou pelo painel, nem pelo alerta. Chegou no terminal de três pessoas
diferentes, em três formatos, e nenhum dos três nomeava o campo.

```
$ python -m equipe_alfa.sincronizar --ambiente prod
Traceback (most recent call last):
  File "/opt/alfa/sincronizar.py", line 88, in <module>
    resposta = catalogo.registrar(recurso)
  File "/opt/alfa/cliente.py", line 41, in registrar
    resposta.raise_for_status()
panlabs.catalogo.ErroDeValidacao: 422 Unprocessable Entity

$ terraform apply
Error: erro ao registrar recurso no catálogo
  status 422, corpo: {"erro":"validacao"}
  with panlabs_catalogo_recurso.bucket_relatorios,
  on catalogo.tf line 12, in resource "panlabs_catalogo_recurso" "bucket_relatorios":

$ gh run view 4821 --log-failed
Registrar no catálogo
  Erro: o registro falhou (exit 1)
  Process completed with exit code 1.
```

Três equipes, três horas de investigação, e a informação que faltava era a mesma
em todos: **qual campo**.

## O que a correção foi de verdade

A correção não foi reverter — o campo precisava mesmo ser obrigatório. Foi fazer
a recusa dizer o que recusou.

```python
# antes: o corpo tinha a categoria do erro e nada mais
return Resposta(status=422, corpo={"erro": "validacao"})

# depois: o campo, o motivo e a versão do contrato que passou a exigi-lo
return Resposta(
    status=422,
    corpo={
        "erro": "validacao",
        "campo": "dono",
        "motivo": "obrigatorio_desde",
        "contrato": "2.0.0",
    },
)
```

:::tip
A pergunta que separa uma mensagem de erro boa de uma ruim é sempre a mesma:
**ela diz o que fazer a seguir?** `422 validacao` diz que algo está errado;
`campo=dono contrato=2.0.0` diz para subir de versão e preencher o campo.
:::

## O que ficou

A esteira ganhou um terceiro passo, que compara as regras de **validação** e não
só os tipos. E ficou uma regra de redação para resposta de erro: categoria,
campo e versão, sempre os três — porque quem lê a mensagem está num terminal
que não tem o contrato aberto ao lado.
