---
title: Ambiente
description: Os três ambientes, o que distingue um do outro, e por onde começar quando a máquina é nova.
---

# Ambiente

<Untranslated />

São três ambientes, e eles não se falam. Um recurso criado em `dev` não existe
em `staging`; uma permissão concedida em `staging` não vale em `prod`. Não há
sincronização, importação nem promoção automática entre eles.

O ambiente não é um parâmetro do comando. Ele está **no papel IAM** que a sessão
assume, e o papel carrega o nome do ambiente no próprio identificador.

O [comparativo](comparativo-dev-staging-prod) mostra as diferenças linha a
linha. Se a máquina é nova, comece por
[Preparar a máquina local](preparar-a-maquina-local).
