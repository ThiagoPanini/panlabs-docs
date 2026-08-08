---
title: Changelog
description: O único canal onde mudança de contrato da API do Trilho se comunica, em ordem cronológica reversa.
---

# Changelog

<Untranslated />

A documentação do Trilho **não é versionada**. A API é — por cabeçalho,
`Trilho-Version: 2026-01-15` — e esta página é o único lugar onde uma mudança de
contrato é anunciada.

## Como ler

Cada entrada é uma data de versão de API. Enquanto o seu cabeçalho apontar para
uma data anterior, a mudança não te alcança: o Trilho continua respondendo no
formato daquele dia.

Mudança que **não** aparece aqui é mudança que não muda contrato — campo novo
opcional, código de erro novo dentro de uma classe existente, ou correção de
comportamento que já estava documentado.

## Como subir de versão

Mande o cabeçalho com a data nova numa chamada de leitura, confira a resposta, e
só então troque no seu código. A versão travada na conta continua valendo para
quem não manda o cabeçalho, e trocá-la é uma decisão separada, feita no painel.

## As versões

<Update label="2026-08-01" tag="2026-08-01">
**`split` aceita `percentual`.** Cada recebedor pode declarar `valor` **ou**
`percentual`, e misturar os dois na mesma lista devolve `422`.

**A sobra do arredondamento vai para o primeiro recebedor da lista.** A regra é
nova porque o campo é novo, e ela está escrita para não ser descoberta por
diferença de centavo.

Sem quebra: quem só usa `valor` não é alcançado.
</Update>

<Update label="2026-06-10" tag="2026-06-10">
**`motivo_recusa` ganha `reapresentar` e `reapresentar_apos`.** Os dois campos
tornam legível na resposta o que antes só existia no catálogo de códigos.

**Quebra:** `motivo_recusa` deixou de ser string e passou a ser objeto. Quem
comparava `motivo_recusa === "saldo_insuficiente"` precisa ler
`motivo_recusa.codigo`.
</Update>

<Update label="2026-05-14" tag="2026-05-14">
**`descricao_curta` marcada como obsoleta** em favor de `descricao`. Ela continua
sendo aceita e continua sendo devolvida — obsoleto aqui significa *não use em
código novo*, não *vai sumir*.

**`GET /movimentos` passa a aceitar `de` e `ate`** no lugar de uma data única.
</Update>

<Update label="2026-04-02" tag="2026-04-02">
**Devolução de Pix vira recurso próprio,** em `POST /devolucoes`. Antes ela era
`POST /cobrancas/{id}/estornar`, que tratava Pix e cartão como a mesma operação —
e eles têm prazos, origens de dinheiro e modos de falhar diferentes.

**Quebra:** a rota antiga responde `410` a partir desta versão.
</Update>

<Update label="2026-03-18" tag="2026-03-18">
**Erros de validação passam a devolver `detalhes` com a lista completa** de
campos inválidos, em vez de parar no primeiro.

Sem quebra: o envelope, o `codigo` e a `mensagem` continuam onde estavam.
</Update>

<Update label="2026-02-20" tag="2026-02-20">
**`assinatura.politica_de_falha` ganha `retentar_e_suspender`,** que passa a ser
o padrão para assinaturas novas. As existentes mantêm a política declarada.

**Novo evento `cliente.meio_prestes_a_vencer`,** 30 dias antes da validade do
cartão salvo.
</Update>

<Update label="2026-02-05" tag="2026-02-05">
**Todo valor passa a ser inteiro na menor unidade da moeda.** Os campos que
aceitavam decimal — `valor`, `taxa`, `valor_liquido` — passam a aceitar e
devolver centavos.

**Quebra, e é a maior da lista.** Um cliente que mandava `149.90` passa a criar
uma cobrança de R$ 1,49. A versão anterior continua respondendo no formato
antigo, e é por isso que o cabeçalho existe.
</Update>

<Update label="2026-01-15" tag="2026-01-15">
Primeira versão pública estável. Cobranças, clientes, assinaturas, reembolsos e
webhooks, com Pix, boleto e cartão.
</Update>
