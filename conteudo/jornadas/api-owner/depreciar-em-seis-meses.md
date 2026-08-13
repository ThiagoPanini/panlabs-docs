---
title: Depreciar em seis meses
description: Como o aviso de depreciação saiu do changelog e passou a viajar na própria resposta, com prazo e destino de migração.
---

# Depreciar em seis meses

<Untranslated />

Remover o endpoint de busca por nome era decisão fácil: ele tinha substituto
melhor havia um ano e custava um índice inteiro para manter. A primeira
tentativa de removê-lo foi anunciada no changelog do pacote, com três meses de
prazo. No dia do corte, duas das cinco equipes que o usavam não sabiam que ele
existia — o código que chamava era herdado, e ninguém do time atual o havia
escrito.

## Por que o changelog não alcança

Changelog é um canal **pull**: ele exige que alguém vá ler. Isso funciona para
quem está fazendo o upgrade naquela semana, e não funciona para quem tem uma
chamada estável rodando em produção há dois anos.

O único canal que alcança todo mundo que ainda chama é a **própria chamada**.

## O aviso na resposta

O serviço passou a devolver um cabeçalho em toda resposta de rota depreciada.

```python
DEPRECIADAS = {
    "/catalogo/buscar-por-nome": Depreciacao(
        desde="2.1.0",
        remocao_em="2026-09-01",
        use="/catalogo/buscar",
    ),
}

def anotar(resposta, rota):
    d = DEPRECIADAS.get(rota)
    if d:
        resposta.cabecalhos["Deprecation"] = d.desde
        resposta.cabecalhos["Sunset"] = d.remocao_em
        resposta.cabecalhos["Link"] = f'<{d.use}>; rel="successor-version"'
    return resposta
```

Três informações, e nenhuma opcional: **desde quando**, **até quando** e **o que
usar no lugar**. Um aviso sem destino de migração transfere o trabalho de
descobrir o substituto para quem foi avisado.

:::warning
Prazo sem data é prazo que não existe. `Sunset` carrega uma data absoluta, nunca
*"em seis meses"* — a frase relativa é lida meses depois de ter sido escrita, e
aí ela não diz nada.
:::

## Como o prazo virou conferível

O cliente Python passou a emitir um `DeprecationWarning` quando vê o cabeçalho,
e a esteira das equipes consumidoras passa a falhar quando a data do `Sunset`
está a menos de trinta dias.

```bash
$ pytest -W error::DeprecationWarning
DeprecationWarning: /catalogo/buscar-por-nome sai em 2026-09-01.
  Use /catalogo/buscar. Faltam 27 dias.
```

## O que ficou

Seis meses, e não três. O prazo dobrou porque a medição do primeiro corte
mostrou que o gargalo não era a mudança de código — era a janela de deploy de
quem consome, e times com deploy mensal precisam de mais de um ciclo para
descobrir, corrigir, testar e subir.

No segundo corte, todas as cinco equipes migraram dentro do prazo, e três delas
descobriram a depreciação pelo próprio teste, sem que ninguém avisasse.
