---
title: Migrar de outro provedor
description: Importação de tokens de cartão, o que não migra de jeito nenhum e o período de convivência que evita o corte de fim de semana.
---

# Migrar de outro provedor

<Untranslated />

Migrar de provedor de pagamento tem uma parte fácil e uma difícil. A fácil é
reescrever as chamadas. A difícil é levar junto os cartões salvos dos seus
clientes — porque eles não são seus, estão tokenizados no provedor antigo, e um
token não vale nada fora de quem o emitiu.

Este guia trata do caminho inteiro, e é honesto sobre o que não vem junto.

## Pré-requisitos

Conta Trilho aprovada em produção, certificação PCI-DSS do provedor de origem (é
ela que autoriza a transferência entre cofres), e uma janela de convivência de
pelo menos duas semanas.

## O que migra e o que não migra

| Item | Migra? | Como |
| --- | --- | --- |
| Cartões salvos | **sim** | transferência de cofre, provedor a provedor |
| Clientes e documentos | sim | importação por CSV ou API |
| Assinaturas ativas | sim, recriadas | as datas de ciclo são preservadas |
| Consentimento de 3-D Secure | **não** | a primeira cobrança aqui autentica de novo |
| Histórico de cobranças | **não** | fica no provedor antigo, e você deve mantê-lo acessível |
| Chargebacks em aberto | **não** | são resolvidos lá, com as regras de lá |
| Chaves de webhook | não se aplica | as suas mudam |

As três linhas com **não** são as que costumam aparecer tarde. A do consentimento
custa conversão no primeiro ciclo pós-migração; a do histórico costuma virar
requisito contábil que ninguém previu.

## O caminho

<Steps>
<Step title="Peça a transferência de cofre">

A conversa é entre os dois provedores, e você é quem autoriza. Abra o pedido em
**Configurações › Migração**, informe o provedor de origem, e o Trilho conduz o
resto. O prazo típico é de 5 a 10 dias úteis.

O resultado é um arquivo de correspondência:

```json title="tokens-migrados.json"
[
  {"token_origem": "pm_1KxYzABC", "token_trilho": "cart_8Nq2vB", "status": "ok"},
  {"token_origem": "pm_1KxYzDEF", "token_trilho": null, "status": "cartao_expirado"}
]
```

</Step>
<Step title="Importe clientes com a correspondência em mãos">

```js
for (const linha of correspondencia) {
  if (linha.status !== 'ok') continue;

  await trilho.clientes.criar({
    nome: legado.nome,
    email: legado.email,
    documento: legado.documento,
    referencia_externa: legado.id,
    meio_padrao: {tipo: 'cartao', token: linha.token_trilho},
  });
}
```

`referencia_externa` com o `id` do provedor antigo é o que permite auditar a
migração depois. Sem ele, a única correspondência vive num arquivo que alguém vai
apagar.

</Step>
<Step title="Rode os dois em paralelo">

Não corte de uma vez. Mande **cobranças novas** para o Trilho e deixe as
assinaturas em curso no provedor antigo até o ciclo virar. Duas semanas de
convivência custam duas integrações vivas e evitam a única classe de erro que não
tem desfazer: cobrar duas vezes o mesmo cliente.

</Step>
<Step title="Vire as assinaturas na data do ciclo" icon="calendar">

```js
await trilho.assinaturas.criar({
  cliente_id: cliente.id,
  plano_id: 'pln_pro_mensal',
  dia_de_cobranca: legado.dia_de_cobranca,
  primeira_cobranca_em: proximoCicloDoLegado,
});
```

`primeira_cobranca_em` no futuro evita a cobrança duplicada no mês da virada. É o
campo que existe exatamente para migração.

</Step>
</Steps>

:::warning[Cancele no provedor antigo só depois de a primeira cobrança passar aqui]

A ordem certa é: criar aqui com data futura, confirmar que a cobrança daqui foi
paga, cancelar lá. Cancelar primeiro deixa uma janela em que ninguém cobra, e um
mês de receita perdido não se recupera pedindo ao cliente.

:::

## Verificação

Antes de virar qualquer cliente real, prove os três casos no sandbox:

1. Um token migrado cobra com sucesso.
2. Um token com `status` diferente de `ok` não vira cliente — e o seu laço não
   quebra por causa disso.
3. Uma assinatura com `primeira_cobranca_em` no futuro **não** cobra hoje.

## Variações

**Sem transferência de cofre.** Alguns provedores não fazem. O caminho é
retokenizar com o cliente presente — na próxima vez que ele entrar, peça o cartão
de novo. É lento e perde base, e é a razão pela qual vale insistir na
transferência antes de desistir dela.

:::note[Guarde o histórico antigo antes de encerrar a conta]

Exporte tudo do provedor de origem enquanto a conta ainda está ativa. Depois do
encerramento, o acesso costuma cair em 30 a 90 dias — e a obrigação de guardar
comprovante de transação costuma ser de cinco anos.

:::
