---
title: Idempotência
description: O cabeçalho Idempotency-Key, os quatro endpoints que o aceitam, a janela de 24 horas e o contrato exato de repetição.
---

# Idempotência

Esta página documenta o **contrato** do cabeçalho `Idempotency-Key` — o que
ele garante, byte a byte. Para o raciocínio de quando e como escolher uma
chave, ver [Conceitos › Idempotência](/docs/conceitos/idempotencia) na
documentação principal.

<ParamField name="Idempotency-Key" type="string">
Uma string de até 255 caracteres, escolhida por quem chama — o Trilho não a
gera e não impõe formato além do comprimento.
</ParamField>

## Onde ela se aplica

Os quatro endpoints que criam recurso a aceitam. Nenhum outro verbo lê o
cabeçalho — mandá-lo num `GET`, `PATCH` ou `DELETE` não tem efeito, e não é
erro.

- [`POST /cobrancas`](/api-reference/cobrancas/criar-cobranca)
- [`POST /clientes`](/api-reference/clientes/criar-cliente)
- [`POST /assinaturas`](/api-reference/assinaturas/criar-assinatura)
- [`POST /reembolsos`](/api-reference/reembolsos/criar-reembolso)

## O contrato exato

> Mesma chave, mesmo corpo, dentro de 24 horas → a resposta original, byte a
> byte, com o mesmo `id`, sem criar nada de novo.

| Situação | Resposta |
| --- | --- |
| Chave nova | cria o recurso normalmente |
| Mesma chave, mesmo corpo, dentro de 24h | devolve a resposta original — mesmo `id`, mesmo status HTTP |
| Mesma chave, corpo **diferente**, dentro de 24h | `409`, `codigo: "chave_de_idempotencia_reusada"` — nada é criado |
| Mesma chave, depois de 24h | a chave foi esquecida; cria um recurso novo |
| Sem cabeçalho | cria normalmente, sem proteção de repetição |

"Mesmo corpo" é comparado campo a campo do JSON decodificado, não byte a
byte do texto da requisição — reordenar as chaves ou mudar o espaçamento
não conta como corpo diferente.

## A resposta de replay

A segunda chamada com a mesma chave e o mesmo corpo carrega um cabeçalho a
mais, para quem precisa distinguir por observabilidade:

```http
Idempotency-Replayed: true
```

Ele não deveria mudar o comportamento do seu código — se a lógica de
chamada precisa saber se foi replay para decidir alguma coisa, o desenho
está pedindo revisão. O ponto inteiro da idempotência é o chamador **não**
precisar saber.
