---
title: Monitoramento e alertas
description: Por que a casa alerta sobre sintoma e não sobre causa, quais são os quatro sinais que valem página, e o que fica só no painel.
---

# Monitoramento e alertas

<Untranslated />

Alerta é caro: cada um que dispara consome atenção, e atenção gasta com alarme
falso não volta. A regra que decide o que vira alerta não é sobre gravidade — é
sobre **acionabilidade**, e ela tem uma forma verificável: um alerta precisa
dizer o que fazer a seguir, ou ele é um painel com notificação.

## Sintoma, não causa

Alertar sobre causa parece mais útil e envelhece pior. `CPU acima de 80%` é
causa: ela dispara quando nada está errado e fica calada quando algo está
errado por outro motivo. `p99 acima de 800ms` é sintoma: ela dispara quando o
usuário sente, seja qual for a causa.

A consequência prática é que a casa tem **poucos alertas e muitos painéis**. O
painel responde *por quê*; o alerta responde *se*.

## Os quatro sinais que valem página

| Sinal | Limiar | Janela | Por que ele é acionável |
| --- | --- | --- | --- |
| Taxa de erro | acima de 1% | 5 min | há resposta imediata: rollback |
| Latência p99 | acima de 800 ms | 10 min | há resposta imediata: escalar ou rollback |
| Idade da mensagem mais antiga | acima de 15 min | 5 min | há resposta imediata: reiniciar ou escalar |
| Falha de deploy | qualquer | — | há resposta imediata: investigar antes do próximo |

Nada mais chama alguém de madrugada. Saturação de disco, uso de memória e
contagem de réplicas moram no painel, e viram tarefa no horário comercial.

## A ordem de leitura num incidente

De fora para dentro, e a razão é medida: a maioria dos incidentes que pareciam
do serviço eram da dependência.

```bash
# 1. a dependência está bem?
panlabs painel dependencias --servico catalogo --ultimos 60m

# 2. o tráfego mudou?
panlabs painel entrada --servico catalogo --ultimos 60m

# 3. e só então: o serviço mudou?
panlabs painel servico catalogo --ultimos 60m
```

Ler na ordem inversa produz a investigação clássica de duas horas que termina
em *"era o banco"*.

## O que o alerta precisa carregar

```yaml
# alertas/taxa-de-erro.yml
alerta: taxa-de-erro
sintoma: "acima de 1% por 5 minutos"
painel: https://painel.interno/catalogo/erros
primeira_acao: "conferir o último deploy; rollback se houver um nos últimos 30 min"
dono: equipe-alfa
```

`primeira_acao` é o campo que separa um alerta de um susto. Ele não descreve a
solução — descreve o primeiro passo, que é o que a pessoa acordada consegue
executar sem contexto.

:::tip
O teste de um alerta novo é lê-lo às três da manhã, sem contexto, e perguntar
*"o que eu faço agora?"*. Se a resposta for *"olhar o painel para entender"*, ele
é um painel, e o lugar dele é lá.
:::
