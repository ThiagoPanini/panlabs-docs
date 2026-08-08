---
title: Node
description: Instalação, configuração, uso e tratamento de erro do SDK oficial do Trilho para Node — tipos inclusos, sem dependência de runtime.
---

# Node

<Untranslated />

`@trilho/node` cobre a API inteira, traz os tipos junto e não arrasta nenhuma
dependência de runtime. Requer Node 20 ou mais novo.

## Instalação

<CodeGroup groupId="gerenciador-node" queryString="pm">

```bash title="npm"
npm install @trilho/node
```

```bash title="pnpm"
pnpm add @trilho/node
```

```bash title="yarn"
yarn add @trilho/node
```

</CodeGroup>

## Configuração

```js
import {Trilho} from '@trilho/node';

export const trilho = new Trilho(process.env.TRILHO_SECRET_KEY, {
  // Opcional: sem isto, o SDK usa a versão travada na sua conta.
  versaoApi: '2026-01-15',
  // 3 tentativas com espera exponencial em 429 e 5xx. Nunca em 4xx.
  maxTentativas: 3,
  timeoutMs: 20_000,
});
```

A base da API sai do **prefixo da chave** — `tk_test_` aponta para o sandbox,
`tk_live_` para produção. Não existe opção de ambiente, e é de propósito: uma
chave e uma base que discordam é um erro que só aparece no extrato.

## Uso

```js
const cobranca = await trilho.cobrancas.criar(
  {
    valor: 14990,
    moeda: 'BRL',
    meio: 'pix',
    referencia_externa: 'pedido-4821',
  },
  {idempotencyKey: 'pedido-4821'},
);
```

A segunda posição é o objeto de opções por requisição — `idempotencyKey`,
`timeoutMs` e `signal`. Ela existe separada do corpo para que nenhuma opção do
SDK possa colidir com um campo da API no dia em que a API ganhar um campo novo.

Paginação é iteração, e o cursor é problema do SDK:

```js
for await (const cobranca of trilho.cobrancas.listar({status: 'liquidada'})) {
  console.log(cobranca.id, cobranca.valor);
}
```

E a verificação de assinatura de webhook é uma chamada:

```js
const evento = trilho.webhooks.verificar(
  corpoCru,                       // Buffer, não objeto — o HMAC é sobre os bytes
  req.get('X-Trilho-Assinatura'),
  process.env.TRILHO_WEBHOOK_SECRET,
);
```

## Tratamento de erro

Toda falha da API vira uma subclasse de `TrilhoError`, e o `codigo` é o que se
ramifica — nunca a mensagem.

```js
import {TrilhoError, ErroDeValidacao, ErroDeLimite} from '@trilho/node';

export async function cobrar(dados) {
  try {
    return await trilho.cobrancas.criar(dados);
  } catch (erro) {
    if (erro instanceof ErroDeValidacao) {
      // erro.detalhes -> [{campo, codigo}, ...] — todos de uma vez
      return responder(422, erro.detalhes);
    }
    if (erro instanceof ErroDeLimite) {
      // `retryAfterMs` já vem em milissegundos, pronto para um `setTimeout`.
      return agendar(erro.retryAfterMs);
    }
    if (erro instanceof TrilhoError) {
      log.error({requisicao: erro.requisicao, codigo: erro.codigo});
    }
    throw erro;
  }
}
```

`erro.requisicao` é o `req_...` daquela chamada. É o primeiro dado que o suporte
pede, e guardá-lo no log transforma uma conversa de horas numa de minutos.

:::warning[Recusa não lança]

Uma cobrança recusada por `saldo_insuficiente` é uma resposta de sucesso — o
`catch` não roda. Leia `cobranca.status` e `cobranca.motivo_recusa`. Ver
[Conceitos › Erros](../conceitos/erros).

:::

## Escape para HTTP cru

Recurso novo aparece na API antes de aparecer no SDK. O escape usa a mesma base,
a mesma chave e a mesma política de retentativa:

```js
const resposta = await trilho.requisitar('POST', '/recurso-novo', {
  corpo: {campo: 'valor'},
});
```

Usá-lo não é sinal de que algo está errado.

:::note[Tipos vêm no pacote]

Não existe `@types/trilho`. Os tipos são gerados do mesmo contrato OpenAPI que a
[Referência da API](/api-reference/introducao/visao-geral) publica, então o SDK
não conhece um campo que a referência não documente.

:::
