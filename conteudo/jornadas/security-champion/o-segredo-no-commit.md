---
title: O segredo no commit
description: O vazamento de uma chave num commit não foi o problema; o problema foi descobrir que rotacionar era um procedimento manual de quarenta minutos.
---

# O segredo no commit

<Untranslated />

Uma chave de integração apareceu num commit de uma branch de teste, achada pela
própria varredura de segredos, dezoito minutos depois do push. A detecção
funcionou; o que não funcionou foi o que veio depois. A pergunta *"quanto tempo
até essa chave estar morta?"* não tinha resposta escrita, e a resposta medida
naquele dia foi quarenta minutos, todos manuais, todos dependentes de uma
pessoa específica estar disponível.

## O que os quarenta minutos eram

Sete passos, e nenhum deles difícil: abrir o console, gerar a chave nova,
atualizar o segredo no gerenciador, disparar o deploy do serviço que a lê,
esperar, conferir, revogar a antiga. O custo não estava em nenhum passo; estava
em serem sete, em sequência, com espera no meio.

:::warning
Detecção rápida com resposta lenta é uma métrica bonita e um risco intacto. O
tempo que importa é **detecção até revogação**, e ele só encurta encurtando a
resposta.
:::

## A rotação como procedimento executável

O primeiro ganho foi transformar os sete passos num comando, ainda manual.

```bash
# o comando cru, com o lambda de rotação já criado
aws secretsmanager rotate-secret \
  --secret-id prod/integracao/chave-externa \
  --region us-east-1 \
  --rotation-lambda-arn "$ARN_ROTACAO"
```

Isso levou os quarenta minutos para cerca de seis, e deixou à vista o que ainda
era manual: o *runtime* só relê o segredo no próximo deploy, então a chave nova
não chega sozinha a quem a usa.

## A propagação, que é a parte que engana

O gerenciador de segredos guarda a versão nova imediatamente. Quem lê o segredo
em memória continua com a antiga até reiniciar, e é por isso que revogar a
antiga logo depois de rotacionar derruba o serviço.

```python
from panlabs.segredos import Rotacao, PropagacaoParcial

rotacao = Rotacao(segredo="prod/integracao/chave-externa", regiao="us-east-1")

try:
    nova = rotacao.executar(propagar_para=["esteira", "runtime"], esperar=True)
except PropagacaoParcial as erro:
    # o runtime só relê no próximo deploy; a esteira já está na versão nova
    print(erro.pendentes, erro.versao_ativa)
```

`PropagacaoParcial` não é falha: é o estado normal entre a rotação e o próximo
deploy, e nomeá-lo é o que impede alguém de revogar a chave antiga cedo demais.

## O que ficou

A terceira vez que uma chave precisou ser rotacionada, o procedimento já era uma
skill de esteira, documentada em
[Rotação de segredo](/ferramentas/skills/rotacao-de-segredo). O tempo de
detecção até revogação caiu de quarenta minutos para pouco mais de um deploy, e
deixou de depender de quem está de plantão.

O que sobrou de manual é a decisão de revogar, e ela continua manual de
propósito: revogar antes da propagação terminar é o único jeito de transformar
um vazamento em incidente.
