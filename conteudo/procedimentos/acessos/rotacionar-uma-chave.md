---
title: Rotacionar uma chave
description: O procedimento de quando algo deu errado — trocar uma chave em uso sem derrubar quem a lê, com janela de aceitação dupla.
---

# Rotacionar uma chave

<Untranslated />

Rotacionar não é gerar uma chave nova: é gerar, propagar, conferir e **só então**
revogar a antiga. Os quatro passos existem porque quem lê o segredo o guarda em
memória, e revogar antes da propagação transforma um vazamento numa
indisponibilidade.

## Antes de começar

O identificador do segredo e a lista de quem o lê. A lista sai de
`panlabs segredos consumidores <segredo>` e não de memória — foi assim que a
jornada de Security Champion descobriu o consumidor que ninguém sabia que
existia.

## Os passos

<Steps>
  <Step title="Abrir a janela de aceitação dupla">
    Durante a janela os dois valores são aceitos. É ela que torna a rotação
    incremental em vez de instantânea.

    ```bash
    panlabs segredos janela abrir prod/integracao/chave-externa --horas 24
    ```
  </Step>

  <Step title="Gerar e propagar">
    O comando grava o valor novo e dispara o deploy de quem lê o segredo no
    boot. `esperar=True` bloqueia até a esteira confirmar.

    ```python
    from panlabs.segredos import Rotacao, PropagacaoParcial

    rotacao = Rotacao(segredo="prod/integracao/chave-externa", regiao="us-east-1")

    try:
        nova = rotacao.executar(propagar_para=["esteira", "runtime"], esperar=True)
    except PropagacaoParcial as erro:
        print(erro.pendentes, erro.versao_ativa)
    ```
  </Step>

  <Step title="Conferir que ninguém usa mais a antiga">
    O contador de uso por versão é o que autoriza o passo seguinte. Zero por
    uma hora inteira, não zero num instante.

    ```bash
    panlabs segredos uso prod/integracao/chave-externa --por-versao --ultima-hora
    # AWSCURRENT   4.812 chamadas
    # AWSPREVIOUS      0 chamadas
    ```
  </Step>

  <Step title="Revogar e fechar a janela">
    Só agora. Esta é a única etapa irreversível do procedimento.

    ```bash
    panlabs segredos janela fechar prod/integracao/chave-externa --revogar-anterior
    ```
  </Step>
</Steps>

## Verificação

A chave antiga passa a ser recusada e a nova responde. O teste é fazer as duas
chamadas, nesta ordem:

```bash
panlabs segredos testar prod/integracao/chave-externa --versao anterior
# 401 — esperado
panlabs segredos testar prod/integracao/chave-externa
# 200
```

:::warning
`AWSPREVIOUS` com zero chamadas **num instante** não prova nada: um consumidor
que roda de hora em hora aparece zerado entre execuções. A janela de uma hora é
o mínimo, e para consumidor diário o número certo é vinte e quatro.
:::

## Variações

**Vazamento confirmado.** A ordem inverte: revogar primeiro, aceitar a
indisponibilidade, rotacionar depois. É a única situação em que derrubar o
serviço é a decisão certa, e a chamada é de quem responde pelo incidente — não
de quem executa o procedimento.

**Terceiro que não suporta duas chaves.** Sem janela de aceitação dupla, a
rotação tem indisponibilidade por construção. Ela é agendada, anunciada, e cabe
dentro do menor intervalo entre chamadas do consumidor.

:::tip
Toda rotação que já precisou ser feita duas vezes na casa foi rotação feita fora
de janela. Abrir a janela custa um comando; refazer custa um incidente.
:::
