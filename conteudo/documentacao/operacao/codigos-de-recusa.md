---
title: Códigos de recusa
description: Os quarenta motivos de recusa do Trilho, o que cada um significa, se a reapresentação faz sentido e em quanto tempo.
---

# Códigos de recusa

<Untranslated />

Recusa não é erro de integração. É uma resposta legítima do sistema financeiro,
devolvida com `201`, no campo `motivo_recusa.codigo`.

## Como ler a tabela

**Reapresentar** diz se tentar de novo com os mesmos dados tem chance de mudar o
desfecho. **Prazo** é a espera mínima antes disso — reapresentar antes gasta
limite de taxa e costuma piorar a sua taxa de aprovação com o emissor.

## A tabela

| Código | Meio | Significado | Reapresentar? | Prazo |
| --- | --- | --- | --- | --- |
| `saldo_insuficiente` | Pix, cartão | o pagador não tem o valor disponível | sim | 24 h |
| `limite_excedido` | cartão | acima do limite total do cartão | sim | 24 h |
| `limite_diario_excedido` | Pix, cartão | estourou o teto do dia | sim | no dia seguinte |
| `limite_noturno_excedido` | Pix | teto reduzido entre 20h e 6h | sim | após as 6h |
| `cartao_expirado` | cartão | a validade passou | **não** | peça outro cartão |
| `cartao_bloqueado` | cartão | bloqueio temporário pelo emissor | sim | 24 h |
| `cartao_cancelado` | cartão | cancelado definitivamente | **não** | peça outro cartão |
| `cartao_restrito` | cartão | restrição cadastral no emissor | **não** | peça outro cartão |
| `cartao_nao_habilitado_online` | cartão | função de compra pela internet desligada | **não** | o pagador habilita no app |
| `numero_invalido` | cartão | dígito verificador não fecha | **não** | corrija o dado |
| `validade_invalida` | cartão | mês ou ano fora de faixa | **não** | corrija o dado |
| `cvv_invalido` | cartão | código de segurança não confere | **não** | corrija o dado |
| `cvv_obrigatorio` | cartão | o emissor exige CVV nesta transação | **não** | recolha o CVV |
| `endereco_divergente` | cartão | AVS reprovou | **não** | corrija o endereço |
| `conta_encerrada` | cartão, Pix | a conta do pagador não existe mais | **não** | peça outro meio |
| `suspeita_de_fraude` | cartão | o antifraude do emissor barrou | **não** | não insista |
| `tentativas_excedidas` | cartão | recusas demais no mesmo cartão | sim | 24 h |
| `transacao_nao_permitida` | cartão | o emissor não permite este tipo de compra | **não** | peça outro meio |
| `parcelamento_nao_permitido` | cartão | o cartão não parcela | sim | à vista |
| `moeda_nao_suportada` | cartão | o cartão não opera em BRL | **não** | peça outro meio |
| `valor_acima_do_permitido` | cartão | acima do teto por transação do emissor | sim | valor menor |
| `valor_abaixo_do_minimo` | Pix, cartão, boleto | abaixo do mínimo do meio | **não** | corrija o valor |
| `emissor_indisponivel` | cartão | o banco emissor não respondeu | sim | 30 s |
| `emissor_recusou_sem_motivo` | cartão | recusa genérica, sem detalhe | sim | 2 h |
| `timeout_do_emissor` | cartão | o emissor demorou além da janela | sim | 30 s |
| `adquirente_indisponivel` | cartão | falha na rede adquirente | sim | 60 s |
| `autenticacao_indisponivel` | cartão | 3-D Secure fora do ar no emissor | sim | 5 min |
| `autenticacao_recusada` | cartão | o pagador errou o desafio | sim | imediato |
| `autenticacao_expirada` | cartão | o desafio passou de 15 min | sim | imediato |
| `autenticacao_obrigatoria` | cartão | o emissor exige 3-D Secure | sim | com autenticação |
| `chave_pix_invalida` | Pix | a chave não existe ou foi removida | **não** | corrija a chave |
| `chave_pix_nao_cadastrada` | Pix | a sua conta não tem chave ativa | **não** | cadastre no painel |
| `psp_do_pagador_indisponivel` | Pix | o banco do pagador está fora | sim | 5 min |
| `qr_expirado` | Pix | o `expira_em` passou | **não** | gere outra cobrança |
| `valor_divergente_do_qr` | Pix | o pagador alterou o valor | **não** | gere outra cobrança |
| `pix_devolvido_pelo_pagador` | Pix | devolvido pelo MED do Banco Central | **não** | abra disputa |
| `boleto_vencido` | boleto | a data de vencimento passou | **não** | gere outro |
| `boleto_baixado` | boleto | cancelado antes do pagamento | **não** | gere outro |
| `documento_do_sacado_invalido` | boleto | CPF ou CNPJ não fecha | **não** | corrija o dado |
| `recebedor_inabilitado` | split | um recebedor não pode receber | **não** | corrija o split |

## Notas

**`emissor_recusou_sem_motivo` é o mais frequente e o menos informativo.** Ele
cobre metade das recusas de cartão em qualquer operação, e o emissor não detalha
por política antifraude. Reapresentar em duas horas resolve uma parte
considerável.

**Nunca insista em `suspeita_de_fraude`.** Reapresentar aumenta o escore de risco
do seu estabelecimento no emissor e piora a aprovação de todas as outras
cobranças.

A política automática de retentativa de assinaturas usa exatamente esta coluna —
ver [Guias › Assinar um cliente](../guias/assinar-um-cliente).
