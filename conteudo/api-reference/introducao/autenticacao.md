---
title: Autenticação
description: A chave secreta, os dois ambientes que ela carrega, rotação e o que fazer quando ela vaza.
---

# Autenticação

Toda requisição ao Trilho carrega uma chave secreta no cabeçalho
`Authorization`, como *bearer token*. Não há OAuth, não há sessão, não há
segundo fator na chamada — a chave **é** a identidade da conta.

```bash
curl https://api.trilho.dev/v1/cobrancas \
  -H "Authorization: Bearer tk_live_9f2c7a1e4b6d0938"
```

Omitir o cabeçalho, ou mandar uma chave que não existe mais, devolve `401`. O
envelope de erro é o mesmo de qualquer outra falha — ver
[Visão geral › Erros](visao-geral#erros).

## O ambiente mora na chave

Não existe parâmetro de ambiente na requisição, nem uma segunda base de URL
para o sandbox. O prefixo da chave decide sozinho:

| Prefixo | Ambiente | O que ele nunca faz |
| --- | --- | --- |
| `tk_test_` | Sandbox | move dinheiro de verdade. Boleto não registra no banco emissor real; cartão só aceita os números de teste documentados em [Comece aqui › Ambientes](/docs/comece-aqui/ambientes) |
| `tk_live_` | Produção | volta a ser reversível depois de criada uma cobrança paga |

As duas chaves apontam para a **mesma conta**, e os dois catálogos de
recursos são isolados por completo: uma cobrança criada no sandbox nunca
aparece numa listagem feita com a chave de produção, e vice-versa. É esse
isolamento — não a URL — que faz o sandbox seguro para testar contra o
contrato real sem risco de escrita cruzada.

:::warning[Cartão em produção não aceita número de teste]

O emissor real recusa qualquer um dos números de cartão documentados para o
sandbox. Isso é intencional: se aceitasse, o sandbox deixaria de provar
alguma coisa sobre o comportamento de produção.

:::

## Onde a chave não deveria estar

A chave secreta é o segredo inteiro — quem a tem pode criar cobrança, ler
dado de cliente e disparar reembolso. Ela nunca deveria chegar ao navegador
do pagador, a um repositório público, ou a um log de erro.

O único uso legítimo de uma chave *pública* — a que tokeniza cartão no
navegador, com prefixo `tk_pub_` — está em
[Meios de pagamento › Cartão](/docs/meios-de-pagamento/cartao). Ela
tokeniza e não faz mais nada: uma chave `tk_pub_` não autentica nenhuma
chamada deste contrato.

Nos exemplos desta referência, a chave aparece como a variável de ambiente
`$TRILHO_API_KEY` — nunca como um valor literal. É a mesma prática que vale
para o seu próprio código: a chave entra por variável de ambiente ou
cofre de segredo, nunca por literal no código-fonte.

## Rotação

Uma conta pode ter mais de uma chave viva ao mesmo tempo, em cada ambiente.
Isso é o que torna a rotação segura: gerar uma chave nova, trocar a
integração para ela, confirmar que o tráfego migrou, e só então revogar a
antiga. Revogar a única chave em uso interrompe a integração até que uma
nova seja gerada e implantada — não há janela de tolerância.

Suspeita de vazamento pede revogação imediata da chave suspeita, mesmo sem
confirmação — o custo de rotacionar sem necessidade é minutos; o custo de
não rotacionar é a conta inteira.

## Erros de autenticação

| Status | `codigo` | Quando |
| --- | --- | --- |
| `401` | `chave_ausente` | nenhum cabeçalho `Authorization` na requisição |
| `401` | `chave_invalida` | a chave não existe, foi revogada, ou está malformada |
| `403` | `chave_sem_permissao` | a chave é válida, mas não tem escopo para esta operação |

Nenhum dos três diferencia "chave errada" de "conta errada" na `mensagem` —
diferenciar isso convidaria alguém a enumerar chaves por tentativa e erro
contra o código de status.
