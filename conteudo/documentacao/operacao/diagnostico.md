---
title: Diagnóstico
description: Os sintomas mais comuns de uma integração com o Trilho, a causa provável de cada um e o que fazer — do webhook que não chega ao saldo que não bate.
---

# Diagnóstico

<Untranslated />

Sete sintomas cobrem a esmagadora maioria dos chamados abertos contra o Trilho.
Cada um tem uma causa provável, e quase nenhuma delas está do nosso lado — o que
é uma boa notícia, porque significa que você consegue resolver sozinho.

Comece pela tabela e pule para a seção do seu sintoma.

## Tabela de sintomas

| Sintoma | Causa mais provável | Seção |
| --- | --- | --- |
| `401` numa chamada que funcionava | chave de ambiente trocada, ou revogada | [Autenticação](#a-chamada-devolve-401) |
| o webhook nunca chega | endpoint não público, ou respondendo além de 10 s | [Webhook](#o-webhook-nao-chega) |
| o webhook chega e a assinatura não confere | corpo reserializado antes do HMAC | [Assinatura](#a-assinatura-do-webhook-nao-confere) |
| o pedido é confirmado duas vezes | evento sem deduplicação | [Duplicata](#o-mesmo-pedido-e-confirmado-duas-vezes) |
| a taxa de aprovação caiu sem motivo | reapresentação agressiva, ou 3-D Secure novo | [Aprovação](#a-taxa-de-aprovacao-caiu) |
| `429` em rajada | retentativa sem espera, ou laço de *polling* | [Limite](#429-em-rajada) |
| o saldo não bate com o extrato | soma do bruto em vez do líquido | [Saldo](#o-saldo-nao-bate) |

## A chamada devolve `401` {#a-chamada-devolve-401}

**Causa.** Em ordem de frequência: a chave é de um ambiente e a base é de outro;
a chave foi revogada numa rotação que não terminou; a variável de ambiente não
foi recarregada depois do deploy.

**Solução.** Chame `GET /v1/conta` com a chave suspeita e leia o campo
`ambiente`. Ele fecha a dúvida em uma requisição — se responder, a chave está
viva e você descobre em qual ambiente; se der `401`, o `codigo` diz qual dos três
casos é. Ver [Comece aqui › Autenticação](../comece-aqui/autenticacao).

## O webhook não chega {#o-webhook-nao-chega}

**Causa.** Quatro possibilidades, e a primeira responde por metade: o endpoint
não é alcançável da internet — está atrás de VPN, de autenticação básica ou de um
firewall que só libera o escritório.

As outras três: o endpoint devolve `3xx` (o Trilho **não segue redirect**), ele
demora mais de 10 segundos para responder, ou o certificado TLS está vencido.

**Solução.** Abra **Desenvolvedores › Webhooks › Entregas** e leia o status e o
corpo da última tentativa — ele traz a resposta crua do seu servidor. Se a lista
estiver vazia, o problema é o cadastro do endpoint, não a entrega.

:::note[Responda antes de processar]

A janela de 10 segundos é para o `200`, não para o seu trabalho. Devolva o status
e enfileire. Processar antes de responder é a causa da metade restante.

:::

## A assinatura do webhook não confere {#a-assinatura-do-webhook-nao-confere}

**Causa.** Quase sempre uma só: o corpo foi **reserializado** antes do cálculo do
HMAC. O seu framework decodificou o JSON, você o serializou de novo, e a nova
string tem outra ordem de chaves, outros escapes ou outra formatação de número.

A segunda causa é a tolerância de relógio: um servidor com horário adiantado ou
atrasado em mais de 5 minutos reprova toda assinatura válida.

**Solução.** Use o corpo cru — `express.raw()`, `request.get_data()`, `io.ReadAll`
antes de qualquer decodificação. E sincronize o relógio por NTP. As três
implementações completas estão em
[Conceitos › Webhooks](../conceitos/webhooks).

## O mesmo pedido é confirmado duas vezes {#o-mesmo-pedido-e-confirmado-duas-vezes}

**Causa.** A entrega de eventos é **no mínimo uma vez**, por desenho. O mesmo
`cobranca.paga` chega de novo quando a sua resposta se perde, quando você
devolveu `5xx` depois de já ter processado, ou quando alguém reenviou pelo
painel.

**Solução.** Deduplique pelo `id` do evento, com restrição de unicidade no banco:

```sql
INSERT INTO eventos_processados (id, tipo, ocorrido_em)
VALUES ($1, $2, $3)
ON CONFLICT (id) DO NOTHING
RETURNING id;
```

Nenhuma linha devolvida significa *já processei este*. Deduplicar pelo `id` da
**cobrança** não resolve: uma cobrança legitimamente emite vários eventos.

## A taxa de aprovação caiu {#a-taxa-de-aprovacao-caiu}

**Causa.** Três candidatos, em ordem: reapresentação agressiva (retentar
`suspeita_de_fraude` piora o seu escore no emissor e derruba a aprovação de todas
as outras cobranças); um lote de cartões vencendo no mesmo mês; ou uma mudança de
política de 3-D Secure que passou a exigir autenticação onde antes dispensava.

**Solução.** Quebre a métrica por `motivo_recusa.codigo` e por bandeira antes de
qualquer hipótese. A tabela em
[Códigos de recusa](codigos-de-recusa) diz o que é reapresentável; tudo o que
está marcado com **não** deve sair do seu laço de retentativa hoje.

:::warning[Reapresentar recusa não reapresentável é o que mais derruba aprovação]

O emissor lê a insistência como sinal de risco. Uma correção de laço costuma
recuperar mais aprovação do que qualquer otimização de checkout.

:::

## `429` em rajada {#429-em-rajada}

**Causa.** Duas: um laço de retentativa sem espera, que consome a janela inteira
em segundos, ou *polling* de status onde deveria haver webhook. A segunda é a
mais cara — consultar uma cobrança Pix a cada segundo por 30 minutos são 1.800
requisições para descobrir o que o evento entregaria de graça.

**Solução.** Respeite o `Retry-After` da resposta, que já vem em segundos. E
troque *polling* por webhook: se a integração está esperando por uma mudança de
estado, o evento é o canal.

:::note[O limite folgado do sandbox esconde este defeito]

São 100 requisições por minuto no sandbox contra 1.000 em produção — mas o
padrão de uso em teste é mil vezes menor. Um laço sem espera passa despercebido
no sandbox e derruba a primeira hora de produção.

:::

## O saldo não bate {#o-saldo-nao-bate}

**Causa.** Por larga margem: soma do `valor_bruto` comparada com o extrato
bancário, que é líquido. A diferença é exatamente a soma da coluna `taxa`.

Depois dela vêm as três divergências legítimas — antecipação, devolução de
período anterior e a diferença entre posição e fechamento.

**Solução.** Siga a ordem de investigação de
[Arquivo de movimento](arquivo-de-movimento), que é montada da causa mais barata
para a mais cara. Abrir chamado é o quinto passo, não o primeiro, e quando ele é
o primeiro a resposta costuma ser um dos quatro anteriores.
