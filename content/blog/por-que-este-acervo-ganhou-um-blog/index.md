---
title: Por que este acervo ganhou um blog
description: A lacuna que as quatro abas de documentação não cobriam, e a decisão que abriu a quinta.
date: 2026-09-07
tags: [notas, panlabs-docs]
authors: thiago
---

As quatro abas deste site são a mesma coisa, no fundo: documentação,
organizada por eixo, escrita em "você mais imperativo", sem autor e sem
data. Isso serve bem a `Ferramentas`, a `Jornadas`, a `Procedimentos` e a
`Times`, mas deixa de fora um tipo de texto que eu queria escrever: uma
novidade que vale comentar, uma nota sobre um tema do dia a dia. Um texto
assim não é uma jornada nem um procedimento, e forçá-lo dentro de uma dessas
abas seria mentir sobre o que ele é.

O sintoma já estava no código antes de eu decidir nada: o plugin de blog do
Docusaurus vinha desligado, com um comentário dizendo que nenhum consumidor
tinha pedido um. Este artigo é esse consumidor.

## O que este ticket abriu

O Blog entrou como a quinta aba, por último na faixa, e não como mais uma
instância de documentação: é o plugin oficial de blog, que já vinha junto do
preset instalado, então nenhuma dependência nova entrou no projeto. Cada
artigo mora numa pasta própria, com o título só no front matter, nunca como
`# título` no corpo. Cada um carrega exatamente um tipo, entre `novidades`,
`tutoriais` e `notas`, mais as tags de assunto que fizerem sentido, todas de
um catálogo fechado.

A regra de voz da documentação, "você mais imperativo, zero primeira
pessoa", não alcança o blog. Aqui a voz é minha, artigo a artigo, e este
texto mistura primeira e terceira pessoa por escolha, não por descuido. O
que não muda é o zero travessão: essa regra vale em qualquer texto publicado
deste site, blog incluído.

As páginas ainda são as padrão do tema Docusaurus enquanto escrevo isto. Um
próximo ticket troca a cara delas por componentes deste próprio repositório,
sem nenhum swizzle: todo componente de blog do tema é território `unsafe`
para essa técnica, e o orçamento disso aqui é zero.
