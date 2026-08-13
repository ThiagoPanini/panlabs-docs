---
title: O consumidor invisível
description: Como o inventário de quem chama o serviço deixou de sair de conversa e passou a sair do log de acesso, sem pedir cadastro a ninguém.
---

# O consumidor invisível

<Untranslated />

Todo corte de rota até aqui dependeu de saber quem chama, e a resposta sempre
saiu de memória: alguém do time lembrava de três equipes, o canal produzia mais
uma, e a quinta aparecia no dia do corte. O formulário de cadastro que existia
registrava quem se lembrava de preencher, que é o mesmo conjunto de quem já
avisaria de qualquer jeito.

## O que o log já sabia

A informação nunca esteve faltando — ela estava no log de acesso e ninguém a
lia. Cada chamada carrega o papel IAM que a autenticou, e o papel carrega o
nome do time no prefixo, porque a convenção de nomes de papel exige isso desde
antes deste serviço existir.

```python
# a consulta inteira, contra a tabela de log dos últimos 30 dias
CONSUMIDORES = """
SELECT
  regexp_extract(papel_iam, 'papel-([a-z-]+)-', 1) AS equipe,
  rota,
  count(*)                                          AS chamadas,
  max(instante)                                     AS ultima
FROM log_de_acesso
WHERE instante > current_date - interval '30' day
GROUP BY 1, 2
ORDER BY chamadas DESC
"""
```

## Por que 30 dias e não 90

Trinta dias é a janela em que um consumidor real aparece pelo menos uma vez.
Noventa traz de volta chamadas de rotina que já foram desligadas e infla a lista
com times que não usam mais — e uma lista inflada custa exatamente o que ela
deveria economizar: conversas com quem não precisa ser avisado.

:::note
A janela é a decisão inteira deste inventário. Curta demais, some quem roda
mensal; longa demais, entra quem já saiu. Trinta dias cobre o mensal com folga
de um ciclo, e é o menor número que faz isso.
:::

## Onde ele passou a rodar

Semanal, na esteira do serviço, com a saída commitada no próprio repositório.

```yaml
# .github/workflows/consumidores.yml
name: consumidores
on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:

jobs:
  inventariar:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.PAPEL_LEITURA_LOG }}
          aws-region: us-east-1
      - run: python -m panlabs.catalogo.consumidores > CONSUMIDORES.md
      - run: |
          git add CONSUMIDORES.md
          git diff --cached --quiet || git commit -m "consumidores da semana"
          git push
```

Commitar a saída é o que transforma o inventário em histórico: o diff semanal
mostra quem entrou e quem sumiu, e quem sumiu por quatro semanas seguidas é
candidato a uma pergunta.

## O que ficou

O formulário de cadastro foi desligado. Ele não estava errado sobre o que
perguntar — estava errado sobre quem responderia, e um inventário que depende de
alguém lembrar mede memória, não uso.

O corte seguinte foi o primeiro em que a lista de equipes a avisar saiu pronta,
e nenhuma apareceu no dia.
