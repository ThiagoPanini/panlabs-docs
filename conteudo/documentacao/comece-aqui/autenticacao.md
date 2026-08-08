---
title: Autenticação
description: As três chaves do Trilho, onde cada uma pode viver e como a rotação acontece sem derrubar a integração.
---

# Autenticação

<Untranslated />

Toda requisição ao Trilho carrega uma chave no cabeçalho `Authorization`, como
*bearer token*. Não há OAuth, não há sessão e não há login — uma API que move
dinheiro entre servidores não tem usuário para autenticar, tem credencial para
apresentar.

Antes de começar: você precisa de uma conta no painel e de um ambiente
escolhido. Se ainda não leu [Ambientes](ambientes), leia — é o que decide qual
prefixo de chave você vai usar.

## As três chaves

| Chave | Prefixo | Onde pode viver | O que ela faz |
| --- | --- | --- | --- |
| Secreta | `tk_test_` · `tk_live_` | só no seu servidor | tudo |
| Publicável | `tk_pub_` | navegador, app, código do cliente | tokeniza cartão |
| De webhook | `whsec_` | só no seu servidor | verifica assinatura de evento |

A chave publicável é a única credencial do Trilho que pode ir para o código do
cliente, e ela não lê nada: com ela em mãos, um terceiro consegue criar tokens
de cartão e nada mais.

A chave de webhook não autentica requisição nenhuma. Ela é o segredo do HMAC que
o Trilho usa para assinar o que envia — ver
[Conceitos › Webhooks](../conceitos/webhooks).

:::warning[A chave secreta de produção não volta]

A chave `tk_live_` é exibida **uma única vez**, no momento em que é criada. O
Trilho guarda só o hash. Se ela se perder, o caminho é revogar e criar outra —
não há tela que a mostre de novo.

:::

## Autenticar uma requisição

<Steps>
<Step title="Pegue a chave secreta do ambiente">
No painel, em **Desenvolvedores › Chaves**. Copie a de sandbox para começar.
</Step>
<Step title="Mande-a no cabeçalho `Authorization`">

```bash
curl https://api.sandbox.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 14990,
    "moeda": "BRL",
    "descricao": "Plano Trilho Pro — mensal"
  }'
```

</Step>
<Step title="Confira o eco de identidade">

Toda resposta traz `X-Trilho-Conta` com o `id` da conta que a chave abriu. É o
jeito mais barato de descobrir que você mandou a chave errada antes de descobrir
pelo extrato.

</Step>
<Step title="Guarde a chave fora do código" icon="lock">

Variável de ambiente, cofre de segredos, o que a sua casa usar. O Trilho varre o
GitHub público em busca de chaves `tk_live_` e revoga o que encontra — sem aviso
prévio, porque avisar levaria mais tempo do que um bot leva para usar.

</Step>
</Steps>

## Verificar que funcionou

Uma chamada de leitura basta, e ela não cria nada:

```bash
curl https://api.sandbox.trilho.dev/v1/conta \
  -H "Authorization: Bearer tk_test_9f2c4a1e8b7d6503"
```

```json title="Resposta"
{
  "id": "acc_7Kd0mR",
  "nome": "Loja Exemplo Ltda",
  "ambiente": "sandbox",
  "versao_api": "2026-01-15"
}
```

O campo `ambiente` é o que fecha a dúvida. Se ele disser `sandbox` e você
esperava `producao`, o problema é a chave, não a base.

## Rotação sem janela de queda

Cada ambiente aceita **duas chaves secretas vivas ao mesmo tempo**, e é isso que
torna a rotação um procedimento em vez de um susto:

1. Crie a segunda chave. As duas passam a valer.
2. Implante a nova nos seus servidores.
3. Confira em **Desenvolvedores › Chaves** que a antiga parou de receber
   requisições — a coluna *último uso* atualiza em até um minuto.
4. Revogue a antiga.

:::note[Revogar é imediato e não é reversível]

A revogação vale no instante em que você confirma, inclusive para requisições em
voo. Não existe período de carência e não existe desfazer — por isso o passo 3
existe.

:::

## Quando a autenticação falha

| Resposta | `codigo` | O que aconteceu |
| --- | --- | --- |
| `401` | `chave_ausente` | não veio cabeçalho `Authorization` |
| `401` | `chave_invalida` | a chave não existe ou foi revogada |
| `401` | `chave_de_ambiente_incorreto` | chave de sandbox contra base de produção, ou o inverso |
| `403` | `chave_sem_permissao` | chave publicável tentando um endpoint de servidor |

`401` e `403` dizem coisas diferentes de propósito. `401` é *não sei quem você
é*; `403` é *sei quem você é e isso não é seu*. Tratar os dois como o mesmo erro
é o que produz o laço de retentativa que insiste com uma chave revogada.
