---
title: Receitas
description: Problemas fechados, resolvidos com código copiável e a prosa mínima que o não óbvio exige.
---

# Receitas

<Untranslated />

Uma receita resolve **um problema fechado**. Ela abre com o problema em uma
frase, entrega o código completo e comenta só o que não é óbvio lendo o código.
Se você precisa entender as escolhas em vez de copiar uma, o lugar é **Guias**.

Todas assumem chave de sandbox e webhooks configurados. Nenhuma repete essa
configuração.

<CardGroup>
<Card title="Checkout Pix em dez minutos" icon="zap" href="/receitas/checkout-pix-em-dez-minutos">
Criar a cobrança, exibir o QR e confirmar o pedido pelo webhook.
</Card>
<Card title="Verificar assinatura de webhook" icon="lock" href="/receitas/verificar-assinatura-de-webhook">
A verificação HMAC completa, sem SDK, em Node e Python.
</Card>
<Card title="Retentativa com espera exponencial" icon="refresh-cw" href="/receitas/retentativa-com-espera-exponencial">
Um laço que respeita `Retry-After` e não vira tempestade.
</Card>
<Card title="Paginar o histórico de cobranças" icon="database" href="/receitas/paginar-o-historico-de-cobrancas">
Varrer um mês inteiro por cursor, sem repetir nem pular linha.
</Card>
<Card title="Conciliar com referência externa" icon="layers" href="/receitas/conciliar-com-referencia-externa">
Casar o arquivo de movimento com os seus pedidos.
</Card>
<Card title="Cobrar um cartão salvo" icon="credit-card" href="/receitas/cobrar-cartao-salvo">
Cobrar sem o cliente presente, tratando recusa como resposta.
</Card>
<Card title="Dividir uma cobrança com split" icon="workflow" href="/receitas/dividir-uma-cobranca-com-split">
Repartir entre recebedores com a soma fechando.
</Card>
<Card title="Emitir boleto com vencimento" icon="calendar" href="/receitas/emitir-boleto-com-vencimento">
Juros, multa, linha digitável e o lembrete sem `cron`.
</Card>
<Card title="Estornar parcialmente" icon="undo-2" href="/receitas/estornar-parcialmente">
Devolver parte de uma cobrança sem estourar o devolvível.
</Card>
</CardGroup>
