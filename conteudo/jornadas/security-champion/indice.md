---
title: Security Champion
description: O papel de ponte entre segurança e engenharia numa squad de plataforma, do bloqueio que parou seis repositórios até o inventário que sobreviveu ao papel.
---

# Security Champion

<Untranslated />

Encerrada quando o programa interno trocou o formato de champion por equipe pelo
de revisão sob demanda. Foram quatro trimestres, e o que sobrou de valor não foi
nenhuma ferramenta: foi descobrir em que ordem as coisas precisam acontecer para
que uma trava seja aceita em vez de contornada.

## Como foi

1. **Primeiro trimestre**, [A varredura que reprovava tudo](a-varredura-que-reprovava-tudo):
   ligar a varredura em modo bloqueante no primeiro dia parou seis repositórios
   e não produziu um achado acionável.
2. **Segundo trimestre**, [O segredo no commit](o-segredo-no-commit):
   o vazamento não foi o problema; o problema foi descobrir que rotacionar era
   manual.
3. **Terceiro trimestre**, [A exceção que virou regra](a-excecao-que-virou-regra):
   toda trava precisa de uma saída, e a saída precisa de prazo.
4. **Quarto trimestre**, [O inventário de imagens](o-inventario-de-imagens):
   a pergunta *"onde essa imagem roda?"* não tinha dono, e passou a ter.

## O que não funcionou

**Ligar a varredura em modo bloqueante no primeiro dia.** Seis repositórios
pararam, e nenhum achado era acionável. Voltou para relatório por três meses
antes de bloquear de novo, e o segundo bloqueio passou sem uma reclamação.

**Medir o programa por número de achados.** O número sobe quando a ferramenta
fica mais barulhenta, não quando o sistema fica mais seguro. Trocado por tempo
até a correção, que é o que dói de verdade.

**Tratar exceção como falha de disciplina.** Sem uma saída declarada, quem
precisa entregar contorna a trava por fora, e aí ninguém sabe quantas exceções
existem. Exceção com prazo e dono é registro; exceção proibida é ponto cego.
