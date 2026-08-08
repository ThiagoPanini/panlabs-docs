---
title: Conciliação
description: O que é conciliar, por que o saldo lido pela API não é o saldo contábil e onde as duas leituras legitimamente divergem.
---

# Conciliação

<Untranslated />

Conciliar é responder a uma pergunta que parece trivial e não é: **quanto entrou,
de quem, e por quê**. Ela é difícil porque o dinheiro chega por um caminho, a
informação sobre ele chega por outro, e os dois caminhos têm relógios
diferentes. Esta página é sobre o conceito. O formato do arquivo, o fuso e o
procedimento de fechamento estão em Operação.

## As duas leituras de saldo

O Trilho expõe o seu dinheiro de duas maneiras, e elas quase nunca coincidem —
não por defeito, mas porque medem coisas diferentes.

A primeira é **posição**: o saldo que a API devolve quando você pergunta agora.
É a soma de tudo o que já liquidou menos tudo o que já saiu, no instante da
leitura. Ela é útil para decidir se cabe um saque, e é inútil para fechar um
mês, porque muda enquanto você lê.

A segunda é **fechamento**: o saldo que o arquivo de movimento declara para um
dia encerrado. Ele não muda mais depois de emitido — nem quando uma cobrança
daquele dia é estornada uma semana depois, porque o estorno pertence ao dia em
que aconteceu, não ao dia da venda. É essa imutabilidade que torna o arquivo a
única fonte de verdade contábil, e é ela que a posição não tem para dar.

Confundir as duas produz o relatório que não bate por poucos centavos e que
ninguém consegue explicar. A regra que evita isso cabe numa linha: posição se lê
da API, série se lê do evento, e fechamento se lê do arquivo.

## Por que o corte tem hora

Todo fechamento precisa de uma fronteira, e a fronteira é arbitrária por
necessidade — alguém precisa decidir de que lado da meia-noite mora uma
transação que aconteceu às 23h59m58s. O Trilho corta às 23h59 no fuso de São
Paulo, e usa o horário em que o **evento de liquidação** ocorreu, não o da venda.

A consequência aparece no primeiro mês: uma cobrança em cartão vendida em janeiro
e liquidada em fevereiro pertence contabilmente a fevereiro. Quem espera vê-la em
janeiro vai encontrar uma divergência do tamanho do ticket médio multiplicado por
trinta dias de vendas, e vai procurar um bug que não existe.

O mesmo vale na direção contrária para o Pix, onde venda e liquidação acontecem
com segundos de diferença e a distinção some. É por isso que integrações que
nasceram só com Pix costumam descobrir esse conceito no dia em que ligam cartão.

## A chave que amarra os dois lados

Do lado do Trilho, cada linha do movimento tem um identificador nosso. Do seu
lado, cada linha tem um identificador seu — o número do pedido, o da nota, o do
contrato. Conciliar é casar os dois, e o campo que existe para isso é a
referência externa.

Ela é um campo livre, indexado, e não precisa ser único. Isso é deliberado: três
cobranças com a mesma referência são três tentativas do mesmo pedido, e é assim
que elas devem aparecer. O que não pode acontecer é o inverso — duas intenções
de negócio diferentes compartilharem a mesma referência —, porque aí a
conciliação passa a somar coisas que não são a mesma coisa e ninguém percebe até
o fechamento do trimestre.

Quem não preenche a referência externa não fica sem conciliação; fica com uma
conciliação por valor e data, que funciona bem enquanto não houver dois pedidos
do mesmo valor no mesmo dia. Em qualquer operação com preço tabelado, isso
acontece na primeira semana.

## As divergências que são legítimas

Três diferenças entre o que você espera e o que o arquivo diz não são erro, e
reconhecê-las de véspera economiza um dia de investigação.

A primeira é a **taxa**. O valor que entra é sempre líquido, e o bruto aparece
numa coluna separada. Um relatório que soma o bruto e compara com o extrato
bancário nunca vai bater, e a diferença vai ser exatamente a soma das taxas.

A segunda é a **antecipação**. Uma venda em cartão antecipada muda de data de
liquidação e ganha um desconto, e portanto aparece num dia diferente e por um
valor diferente daquele que a venda original prometia. As duas informações
convivem no mesmo movimento, em linhas distintas.

A terceira é o **estorno cruzado de período**, já descrito acima, e é a que mais
custa a aceitar, porque ela faz o total de um mês fechado mudar de sinal no mês
seguinte sem que nada do mês fechado tenha sido alterado.

## Onde a conciliação encosta no desenho do produto

Vale registrar o que essa conversa toda implica, porque é fácil tratá-la como
assunto do financeiro e descobrir tarde que era assunto de arquitetura.

Se o seu sistema não guarda o identificador do Trilho ao lado do identificador do
pedido, no momento em que a cobrança é criada, nenhuma reconstrução posterior é
confiável — o casamento vai depender de heurística de valor e data, que é
exatamente o que se estava tentando evitar. Guardar esse par no ato da criação
custa uma coluna e resolve o problema para sempre. Descobrir isso depois custa
uma migração e um período que nunca mais fecha direito.
