---
title: Conciliar com referência externa
description: Casar o arquivo de movimento do dia com os seus pedidos e listar as três classes de divergência.
---

# Conciliar com referência externa

<Untranslated />

**O problema:** provar, todo dia, que o que o Trilho liquidou é o que o seu
sistema esperava — e listar o que não bate.

```python title="conciliar.py"
import csv
import io
import os
from collections import defaultdict

from trilho import Trilho

trilho = Trilho(os.environ["TRILHO_SECRET_KEY"])


def conciliar(dia: str) -> dict:
    bruto = trilho.movimentos.baixar(dia)          # bytes, CSV com cabeçalho
    linhas = csv.DictReader(io.StringIO(bruto.decode("utf-8")), delimiter=";")

    # Some por referência externa: um pedido pode ter várias linhas —
    # crédito, taxa, devolução — e só o total delas é comparável.
    liquido_por_pedido: dict[str, int] = defaultdict(int)
    sem_referencia: list[str] = []

    for linha in linhas:
        referencia = linha["referencia_externa"]
        if not referencia:
            sem_referencia.append(linha["cobranca_id"])
            continue
        # `valor_liquido`, nunca `valor_bruto`: o extrato bancário é líquido.
        liquido_por_pedido[referencia] += int(linha["valor_liquido"])

    esperado = db.pedidos_liquidados_em(dia)       # {referencia: centavos}

    divergencias = {
        "so_no_trilho": sorted(set(liquido_por_pedido) - set(esperado)),
        "so_no_sistema": sorted(set(esperado) - set(liquido_por_pedido)),
        "valor_diferente": sorted(
            referencia
            for referencia in set(liquido_por_pedido) & set(esperado)
            if liquido_por_pedido[referencia] != esperado[referencia]
        ),
        "sem_referencia": sem_referencia,
    }

    return {
        "dia": dia,
        "total_trilho": sum(liquido_por_pedido.values()),
        "total_sistema": sum(esperado.values()),
        "divergencias": divergencias,
    }
```

Somar `valor_liquido` e não `valor_bruto` resolve a divergência mais comum de
todas. Quem soma o bruto e compara com o extrato bancário encontra uma diferença
exatamente igual à soma da coluna `taxa`, todo dia, e passa horas procurando um
bug que não existe.

`so_no_sistema` quase nunca é erro: é uma cobrança em cartão vendida antes e
liquidada depois, ou uma venda antecipada que mudou de data. A investigação certa
é olhar a data de liquidação da cobrança antes de abrir chamado.

`sem_referencia` deve ser sempre vazio. Se não for, alguém está criando cobranças
sem preencher `referencia_externa` — e para essas a conciliação vira casamento por
valor e data, que funciona até existirem dois pedidos do mesmo valor no mesmo
dia.
