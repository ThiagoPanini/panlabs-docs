---
title: Catálogo de eventos
description: Os quarenta e sete eventos que o Trilho entrega por webhook, organizados por recurso, cada um com o que dispara e o que o payload traz.
---

# Catálogo de eventos

Todo evento que o Trilho entrega tem a forma de
[`Evento`](/api-reference/webhooks/objeto-evento): um `id`, um `tipo`, um
`ocorrido_em`, e `dados` — cujo formato varia por `tipo`. Esta página é o
índice completo dos valores que `tipo` assume, organizados pelo recurso que
os dispara.

Nenhum evento novo desta lista quebra uma integração existente: adicionar
um `tipo` é sempre compatível, pela mesma regra de
[URL base e versão](/api-reference/introducao/url-base-e-versao) que trata
campo novo e endpoint novo como aditivos. Uma integração que escuta
`cobranca.paga` continua funcionando no dia em que `assinatura.plano_alterado`
é lançado, sem tocar em uma linha.

## Como ler esta tabela

Cada linha tem três colunas. **Evento** é o valor exato de `tipo` — o que a
sua lógica de roteamento compara. **Quando** é o gatilho, em uma frase.
**`dados` traz** diz o que esperar dentro do campo `dados` do evento — quase
sempre o recurso inteiro no estado em que ficou, não só o que mudou.

Um evento não é uma notificação de campo — é uma notificação de **estado**.
`cobranca.paga` não diz "o campo status virou paga"; ele entrega a
[`Cobrança`](/api-reference/cobrancas/objeto-cobranca) inteira, já com
`status: "paga"`. Isso significa que processar um evento nunca exige uma
segunda chamada de `GET` só para saber o resto do recurso — o resto já
está ali.

**A ordem de entrega não é garantida**, e o mecanismo de assinatura, de
retentativa e de deduplicação está inteiro em
[Conceitos › Webhooks](/docs/conceitos/webhooks). Esta página é só o
vocabulário: o que existe, não como ele chega.

### Um roteador mínimo

A maioria das integrações não trata os quarenta e sete eventos — trata um
punhado, e ignora o resto em silêncio. Um roteador por prefixo de `tipo`
cobre a forma mais comum:

```js title="Roteador por tipo"
const MANIPULADORES = {
  'cobranca.paga': marcarPedidoComoPago,
  'cobranca.recusada': notificarFalhaDePagamento,
  'assinatura.inadimplente': suspenderAcesso,
  'chargeback.aberto': abrirTicketDeDisputa,
};

function despachar(evento) {
  const manipulador = MANIPULADORES[evento.tipo];
  if (!manipulador) return; // tipo desconhecido — ignore, não é erro
  manipulador(evento.dados);
}
```

Reparar no comentário da última linha é o ponto inteiro desta seção: um
`tipo` que o mapa não conhece **não é uma falha do seu código**. É o
catálogo crescendo, e a nota final desta página volta a esse ponto.

## Cobranças

O recurso com mais eventos, porque é o único cujo ciclo de vida tem mais de
um desfecho possível — pago, recusado, expirado, cancelado, estornado, e as
variações de cada um. É também o grupo que a maioria das integrações
escuta primeiro: `cobranca.paga` sozinho já cobre o caso de uso mais comum,
que é liberar um pedido depois da confirmação de pagamento.

Nem todo meio passa pelos mesmos eventos na mesma ordem. Um Pix típico vai
direto de `cobranca.criada` a `cobranca.paga`, muitas vezes em segundos —
não há estado `pendente` observável do lado de fora, porque a confirmação
do arranjo Pix costuma chegar antes do seu servidor terminar de processar
o evento de criação. Um boleto, ao contrário, passa dias em
`cobranca.pendente` antes de qualquer desfecho, e é o único meio em que
`cobranca.expirada` e o vencimento são a mesma data.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `cobranca.criada` | a cobrança foi registrada, antes de qualquer confirmação | a `Cobrança`, com `status: "pendente"` |
| `cobranca.pendente` | o meio aguarda confirmação — típico logo após a criação de um Pix ou boleto | a `Cobrança` |
| `cobranca.paga` | o valor foi confirmado pelo meio de pagamento | a `Cobrança`, com `status: "paga"` |
| `cobranca.recusada` | o emissor do cartão ou o arranjo Pix recusou a operação | a `Cobrança`, com `motivo_recusa` preenchido |
| `cobranca.expirada` | o QR Pix ou a autorização de cartão passou da janela sem confirmação | a `Cobrança`, com `status: "expirada"` |
| `cobranca.cancelada` | a cobrança foi cancelada antes de qualquer confirmação | a `Cobrança` |
| `cobranca.estornada` | o valor inteiro foi devolvido ao pagador | a `Cobrança`, com `status: "estornada"` |
| `cobranca.parcialmente_estornada` | parte do valor foi devolvida; a cobrança continua `paga` | a `Cobrança` mais o `Reembolso` que disparou o evento |
| `cobranca.captura_expirada` | uma autorização de cartão não capturada em sete dias liberou o limite reservado | a `Cobrança`, com `status: "expirada"` |
| `cobranca.risco_sinalizado` | o sistema de risco marcou a cobrança para revisão manual antes de decidir | a `Cobrança`, ainda `pendente` |

## Boleto

Três eventos específicos do meio, além dos genéricos de `cobranca.*` que
todo boleto também dispara.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `boleto.registrado` | a linha digitável e o código de barras foram emitidos junto ao banco emissor | a `Cobrança`, com `pagamento.boleto` preenchido |
| `boleto.vencido` | passou a data de vencimento sem pagamento | a `Cobrança` |
| `boleto.pago_apos_vencimento` | o boleto foi pago depois do vencimento — a liquidação segue o acordo do convênio bancário, não a regra padrão de `cobranca.paga` | a `Cobrança` |

## Clientes

O recurso mais simples da lista: quatro eventos, um por operação de
escrita que o objeto admite.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `cliente.criado` | um cliente foi cadastrado | o `Cliente` |
| `cliente.atualizado` | qualquer campo do cliente mudou, exceto o documento | o `Cliente`, já com o valor novo |
| `cliente.documento_atualizado` | o CPF ou CNPJ do cliente foi trocado | o `Cliente`; ganha evento próprio porque muda a identidade fiscal, não um dado de contato |
| `cliente.removido` | o cliente foi removido da conta | o `id` do cliente removido, e mais nada — o objeto já não existe para se consultar |

## Assinaturas

O ciclo de vida mais longo do catálogo: uma assinatura nasce, pode ter
período de teste, cobra em cadência, pode falhar, pode ser pausada, e
eventualmente termina. Dez eventos parece muito para um recurso só, mas
cada um responde a uma pergunta que uma integração de cobrança recorrente
precisa saber responder sem consultar a API de novo: *este cliente está em
dia? Ele está no teste ou já pagando? A cobrança deste mês passou?*

A distinção entre `assinatura.ciclo_falhou` e `assinatura.inadimplente`
é a que mais gera dúvida. O primeiro dispara a cada tentativa recusada
dentro da janela de retentativa — pode disparar três ou quatro vezes para
o mesmo ciclo, sem que nada mude no acesso do cliente. O segundo dispara
uma vez só, quando a última retentativa da janela também falha, e é esse
o evento que deveria suspender acesso — nunca o primeiro.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `assinatura.criada` | a assinatura foi registrada | a `Assinatura`, com `status: "ativa"` ou em teste |
| `assinatura.ativada` | a primeira cobrança do ciclo foi confirmada | a `Assinatura` |
| `assinatura.periodo_de_teste_iniciado` | a assinatura entrou num período sem cobrança, quando o plano o define | a `Assinatura` |
| `assinatura.periodo_de_teste_finalizado` | o período de teste terminou e a primeira cobrança real será tentada | a `Assinatura` |
| `assinatura.ciclo_cobrado` | uma cobrança recorrente do ciclo foi confirmada | a `Assinatura` mais a `Cobrança` do ciclo |
| `assinatura.ciclo_falhou` | a cobrança do ciclo foi recusada; uma retentativa está agendada | a `Assinatura` mais a `Cobrança` recusada |
| `assinatura.inadimplente` | todas as retentativas do ciclo falharam, sem cancelamento automático | a `Assinatura`, com `status: "inadimplente"` |
| `assinatura.plano_alterado` | o valor ou a cadência da assinatura mudou | a `Assinatura`, já com o plano novo |
| `assinatura.pausada` | a assinatura parou de cobrar sem ser cancelada | a `Assinatura` |
| `assinatura.cancelada` | a assinatura foi cancelada | a `Assinatura`, com `cancelada_em` preenchido |

## Reembolsos

Só quatro eventos, porque um reembolso não tem os estados intermediários de
uma cobrança — ele nasce, e termina de um dos três jeitos possíveis. A
distinção entre `reembolso.falhou` e `reembolso.limite_excedido` importa: a
primeira é uma falha do meio de pagamento depois que o reembolso já foi
aceito pelo Trilho; a segunda é uma rejeição antes de qualquer tentativa —
o `Reembolso` correspondente **nunca chega a existir**, e é por isso que
`dados` traz a `Cobrança`, não um objeto que não foi criado.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `reembolso.criado` | um reembolso, total ou parcial, foi solicitado | o `Reembolso`, com `status: "pendente"` |
| `reembolso.concluido` | o valor foi devolvido ao pagador — Pix e boleto em minutos, cartão em dias | o `Reembolso`, com `status: "concluido"` |
| `reembolso.falhou` | o meio de pagamento recusou a devolução — conta encerrada, por exemplo | o `Reembolso`, com `status: "falhou"` |
| `reembolso.limite_excedido` | uma tentativa de reembolso pediu mais do que o saldo reembolsável da cobrança; nenhum recurso é criado | a `Cobrança` e o valor que foi recusado |

## Split

Eventos do recurso de divisão de cobrança entre recebedores, documentado em
[Meios de pagamento › Split](/docs/meios-de-pagamento/split).

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `split.recebedor_cadastrado` | um novo recebedor foi habilitado para dividir cobranças | o `id` e os dados bancários do recebedor |
| `split.recebedor_removido` | um recebedor foi desabilitado | o `id` do recebedor removido |
| `split.recebedor_creditado` | a fatia de uma cobrança foi transferida ao recebedor | o `id` do recebedor, a `Cobrança` e o valor creditado |
| `split.recebedor_falhou` | a transferência da fatia falhou — conta bancária inválida, por exemplo | o `id` do recebedor, a `Cobrança` e o motivo da falha |

## Chargeback

Os três eventos do ciclo de contestação de cartão, documentados em detalhe
em [Meios de pagamento › Cartão](/docs/meios-de-pagamento/cartao#chargeback).
É o único grupo do catálogo em que o primeiro evento já é uma perda: o
valor sai do saldo no instante de `chargeback.aberto`, antes de qualquer
decisão — o dinheiro só volta se `chargeback.resolvido` chegar a favor do
lojista. Uma integração que só escuta o terceiro evento e ignora o
primeiro descobre a disputa tarde demais para respeitar o prazo de defesa.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `chargeback.aberto` | o emissor do cartão contestou a cobrança; o valor sai do saldo na hora | a `Cobrança` e o prazo de defesa |
| `chargeback.contestado` | uma defesa foi enviada dentro do prazo | a `Cobrança` |
| `chargeback.resolvido` | o emissor decidiu a disputa | a `Cobrança` mais o `resultado` — a favor ou contra |

## Conciliação

Eventos que acompanham a geração do arquivo de conciliação, documentado em
[Operação › Arquivo de movimento](/docs/operacao/arquivo-de-movimento). Os
dois primeiros são a rotina — o arquivo sai, o arquivo bateu certo; o
terceiro é a exceção que a maioria das integrações trata por e-mail em vez
de código, mas que existe como evento por completude: contas com volume
alto o usam para abrir uma investigação automaticamente, no minuto em que
a divergência é detectada, em vez de esperar alguém abrir o arquivo à mão.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `conciliacao.arquivo_disponibilizado` | o arquivo do dia anterior está pronto para download | a URL do arquivo e a data de referência |
| `conciliacao.arquivo_processado` | confirmação de que o arquivo foi gerado sem falha, para contas que preferem esperar este sinal em vez de fazer polling | a data de referência e a contagem de linhas |
| `conciliacao.divergencia_encontrada` | uma linha do arquivo não bate com o histórico de cobranças da conta | o identificador da linha e a natureza da divergência |

## Cartão salvo

Eventos do ciclo de vida de um cartão tokenizado para uso futuro, fora do
momento de uma cobrança específica — o caso de uso é "salvar o cartão do
cliente para a próxima compra", que não passa por `POST /cobrancas`
nenhuma vez até o cliente voltar. Note que nenhum dos dois eventos carrega
o mesmo `verificacoes` que aparece em `cobranca.pagamento.cartao` — a
tokenização não autoriza nada, então não há emissor a consultar ainda.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `cartao.tokenizado` | um cartão foi tokenizado com sucesso para reuso | o token, a bandeira e os últimos quatro dígitos — nunca o número completo |
| `cartao.removido` | um token de cartão salvo foi removido da conta do cliente | o token removido |

## Verificação de identidade

Eventos do processo assíncrono de validação de documento, quando a conta
usa verificação reforçada de cliente. "Assíncrono" é a palavra que importa
aqui: ao contrário da maioria das checagens deste catálogo, a verificação
de documento não acontece dentro da janela de resposta de nenhuma chamada
— ela roda depois, e o webhook é o único jeito de saber o resultado sem
fazer polling num endpoint que esta referência não expõe.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `verificacao.documento_validado` | o CPF ou CNPJ do cliente foi confirmado contra a base de referência | o `id` do cliente e o resultado da verificação |
| `verificacao.documento_rejeitado` | o documento não passou na verificação | o `id` do cliente e o motivo da rejeição |

## Conta

Os dois eventos que não pertencem a nenhum recurso de cobrança — eles
avisam sobre a configuração da própria integração.

| Evento | Quando | `dados` traz |
| --- | --- | --- |
| `conta.chave_rotacionada` | uma chave secreta nova foi gerada num dos dois ambientes | o prefixo da chave nova e a data em que a antiga será revogada, se agendada |
| `conta.webhook_endpoint_atualizado` | a URL de destino dos webhooks foi trocada | a URL nova |

## Notas de leitura

**Um evento por mudança de estado, não por chamada de API.** Uma única
chamada a `POST /cobrancas/{id}/capturar` pode disparar `cobranca.paga`
sozinho, ou nenhum evento, se a captura falhar — o evento reflete o que
aconteceu com o recurso, não a chamada que o causou. Isso também significa
que uma mudança de estado que **não** passa pela API — uma liquidação de
boleto que o banco confirma direto com o Trilho, sem nenhuma chamada sua —
ainda dispara o evento normalmente. Webhook não é eco de requisição; é
notificação de estado, de onde quer que a mudança tenha vindo.

**`dados` nunca inclui outro evento dentro dele.** Mesmo quando um evento
menciona dois recursos — `assinatura.ciclo_cobrado` traz a assinatura e a
cobrança do ciclo —, os dois vêm como o objeto completo de cada um, nunca
como uma referência que exigiria uma segunda consulta. O preço dessa
decisão é payload maior; o que ela compra é zero chamada adicional para
processar o evento mais comum do catálogo.

**Nem todo evento tem uma contraparte de leitura na API.** `verificacao.documento_validado`
e `conta.chave_rotacionada`, por exemplo, não correspondem a nenhum
endpoint de `GET` desta referência — o webhook é a única forma de saber
que aconteceram. Isso é deliberado, não lacuna: alguns estados não
merecem um recurso próprio só para serem consultáveis, e o webhook resolve
sozinho o caso de uso de "me avise quando".

**Este catálogo cresce sem aviso prévio dentro da mesma versão.** Um evento
novo é sempre aditivo — a regra de [URL base e versão](/api-reference/introducao/url-base-e-versao)
o trata como campo novo, não como mudança de contrato. Uma integração
robusta trata `tipo` desconhecido como "ignorar", nunca como erro, pela
mesma razão que o roteador mínimo no topo desta página devolve sem fazer
nada quando não encontra um manipulador: o alternativa — reprovar ou
travar diante de um `tipo` novo — transformaria todo lançamento de evento
numa mudança que quebra contrato, o que ele explicitamente não é.
