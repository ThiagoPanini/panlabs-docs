---
sidebar_position: 1
title: Ambientes
description: Os dois ambientes do Trilho, como as chaves distinguem um do outro e o que muda entre eles.
---

# Ambientes

O Trilho tem **dois ambientes**, e eles não se falam. Uma cobrança criada no
sandbox não existe em produção; um cliente cadastrado em produção não aparece no
sandbox. Não há sincronização, importação nem migração entre os dois — é
deliberado, e é o que permite testar um estorno sem medo.

O ambiente não é um parâmetro da requisição. Ele está **na chave**.

## As duas bases

| Ambiente | Base da API | Prefixo da chave |
| --- | --- | --- |
| Sandbox | `https://api.sandbox.trilho.dev/v1` | `tk_test_` |
| Produção | `https://api.trilho.dev/v1` | `tk_live_` |

Usar uma chave `tk_test_` contra a base de produção devolve `401` com
`codigo: "chave_de_ambiente_incorreto"`. O contrário também. O erro é explícito
porque a alternativa — aceitar a chave e operar no ambiente dela — é como se
cobra um cartão de verdade durante um teste.

## Autenticação

A chave vai no cabeçalho `Authorization`, como *bearer token*:

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

Valores monetários são **inteiros na menor unidade da moeda**. `14990` em `BRL`
são R$ 149,90. Não existe campo decimal em lugar nenhum da API, e isso não é
economia de bytes: é a única forma de o valor sobreviver a um `JSON.parse` sem
depender da precisão de ponto flutuante de quem chama.

:::warning[A chave de produção não volta]

A chave `tk_live_` é exibida **uma única vez**, no momento em que é criada. O
Trilho guarda só o hash. Se ela se perder, o caminho é revogar e criar outra —
não há tela que a mostre de novo.

:::

## O que muda entre os dois

O que **não** muda: o formato das requisições, os códigos de erro, os nomes dos
campos, a paginação e o versionamento. Um cliente escrito contra o sandbox roda
em produção trocando a base e a chave, e nada mais.

O que muda são três coisas:

1. **Os meios de pagamento são simulados.** No sandbox, cartões e chaves Pix são
   determinísticos: o número decide o desfecho. `4000 0000 0000 0002` sempre é
   recusado por saldo insuficiente; `4242 4242 4242 4242` sempre autoriza.
2. **Os webhooks entregam mais rápido e desistem antes.** Sandbox tenta 3 vezes
   em 5 minutos; produção tenta 12 vezes em 72 horas, com espera exponencial.
3. **Os limites de taxa são menores.** 100 requisições por minuto no sandbox,
   contra 1.000 em produção. O cabeçalho `X-Trilho-Limite-Restante` diz quantas
   sobram na janela atual, nos dois.

> Um relato que aparece com frequência no suporte: o time testa uma integração
> inteira no sandbox, sobe para produção, e a primeira cobrança falha com
> `429`. É quase sempre um laço de *retry* sem espera, que o limite folgado do
> sandbox escondia.

## Chaves publicáveis

Além da chave secreta, cada ambiente entrega uma **chave publicável**, com
prefixo `tk_pub_`. Ela só serve para tokenizar dados de cartão no navegador, e é
a única credencial do Trilho que pode ir para o código do cliente.

```js
const trilho = Trilho('tk_pub_31d7b0a5c9e24f68');

const token = await trilho.tokenizarCartao({
  numero: '4242424242424242',
  validade: '12/2030',
  cvv: '123',
});
// token.id -> "cart_8Nq2v..." — é isto que vai para o seu servidor
```

O número do cartão nunca chega ao seu servidor. O que chega é o `id` do token,
que só a chave secreta do **mesmo ambiente** consegue cobrar.

## Próximo passo

Com uma chave de sandbox em mãos, o caminho mais curto até a primeira cobrança
autorizada é a receita de checkout — ela leva dez minutos e usa os cartões
determinísticos acima.
