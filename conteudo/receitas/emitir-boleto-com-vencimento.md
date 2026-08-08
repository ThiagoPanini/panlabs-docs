---
title: Emitir boleto com vencimento
description: Emitir boleto com juros e multa, entregar a linha digitável e lembrar o pagador antes de vencer.
---

# Emitir boleto com vencimento

<Untranslated />

**O problema:** emitir um boleto com vencimento em cinco dias úteis, juros após o
prazo, e um lembrete que não dependa de `cron`.

```python title="boleto.py"
import os
from datetime import date, timedelta

from trilho import Trilho

trilho = Trilho(os.environ["TRILHO_SECRET_KEY"])

FERIADOS = {date(2026, 9, 7), date(2026, 10, 12), date(2026, 11, 2)}


def dias_uteis_a_frente(inicio: date, dias: int) -> date:
    atual, restantes = inicio, dias
    while restantes > 0:
        atual += timedelta(days=1)
        if atual.weekday() < 5 and atual not in FERIADOS:
            restantes -= 1
    return atual


def emitir(pedido) -> dict:
    cobranca = trilho.cobrancas.criar(
        valor=pedido.total,
        moeda="BRL",
        meio="boleto",
        referencia_externa=pedido.id,
        pagamento={
            "boleto": {
                "vence_em": dias_uteis_a_frente(date.today(), 5).isoformat(),
                # Inteiros em centésimos de ponto: 200 é 2,00%.
                "multa_percentual": 200,
                "juros_mensais_percentual": 100,
                "instrucoes": "Não receber após 5 dias do vencimento.",
                "aceita_apos_vencimento": True,
            }
        },
        # Obrigatório em boleto: o documento do sacado é impresso no papel.
        cliente={"nome": pedido.cliente.nome, "documento": pedido.cliente.cpf},
        idempotency_key=f"{pedido.id}-boleto-1",
    )

    # O SDK devolve modelo, não dicionário: acesso por atributo em toda parte.
    boleto = cobranca.pagamento.boleto
    return {
        "linha_digitavel": boleto.linha_digitavel,
        "pdf_url": boleto.pdf_url,
        "vence_em": boleto.vence_em,
    }
```

A linha digitável é o dado canônico — é ela que o pagador digita no app do banco,
e a maioria nunca abre o PDF. Exiba as duas coisas, com o botão de copiar em
destaque.

Percentuais são **inteiros em centésimos de ponto** pela mesma razão pela qual
valores são inteiros em centavos: um ponto flutuante escondido numa taxa de juros
é o tipo de erro que aparece meses depois, arredondado.

## Variações

**Lembrete sem `cron`.** O evento `cobranca.prestes_a_vencer` chega três dias
antes do vencimento e carrega a cobrança inteira. Escutá-lo é mais confiável que
uma varredura diária, que falha justamente nos dias de volume alto.

**Corte duro na data.** `aceita_apos_vencimento: False` faz o boleto deixar de
ser pagável às 23h59 do vencimento. O padrão é `True`, com aceite por até três
dias úteis, porque é o que gera menos atrito de suporte.

**Boleto pago depois de cancelado.** Acontece: o papel na mesa do pagador
continua existindo, e alguns bancos aceitam por até 24 horas após a baixa. O
evento chega como `cobranca.paga` normal — trate-o em vez de ignorá-lo.
