---
title: A exceção que virou regra
description: Toda trava precisa de uma saída declarada; sem ela, quem precisa entregar contorna por fora e ninguém sabe quantas exceções existem.
---

# A exceção que virou regra

<Untranslated />

Com o bloqueio de dependências estabilizado em onze achados, apareceu o caso que
a política não previa: uma correção publicada que exigia subir de major uma
biblioteca com mudança de contrato, no meio de um trimestre já comprometido. A
equipe pediu duas semanas. A política dizia *"sem exceção"*, e o que aconteceu
foi previsível: a trava foi contornada por fora, num commit que desligava o
passo com um comentário explicando o motivo.

## Por que a saída de emergência é obrigatória

Uma trava sem saída não produz zero exceções. Produz **exceções invisíveis**, que
é estritamente pior: o número existe, ninguém o conhece, e o mecanismo que
deveria medir o risco passou a esconder parte dele.

:::tip
A pergunta certa não é *"devemos permitir exceção?"*, e sim *"onde a exceção vai
ficar registrada?"*. Quem responde a segunda já respondeu a primeira.
:::

## A forma que a exceção ganhou

Um arquivo no repositório, versionado, com três campos obrigatórios e uma data.

```yaml
# .panlabs/excecoes.yml
- achado: CVE-2026-31337
  motivo: "correção exige major de biblioteca-de-relatorio; migração no Q4"
  dono: equipe-alfa
  expira_em: 2026-11-30
```

Três decisões vão escritas aqui.

**`dono` é a equipe, nunca a pessoa.** Uma exceção que expira depois de a pessoa
trocar de time não tem a quem voltar.

**`expira_em` é obrigatório e tem teto.** Noventa dias, e o passo recusa datas
além disso. Exceção sem prazo é revogação da regra.

**O arquivo mora no repositório de quem pede**, não num painel central. Quem
revisa o `pull request` vê a exceção nascer, e isso é revisão sem processo novo.

## Como o prazo se cobra sozinho

O mesmo passo da varredura lê o arquivo e reprova quando a data passou.

```python
def aplicar_excecoes(achados, excecoes, hoje):
    vencidas = [e for e in excecoes if e.expira_em < hoje]
    if vencidas:
        raise ExcecaoVencida(vencidas)     # reprova, e nomeia cada uma
    perdoados = {e.achado for e in excecoes}
    return [a for a in achados if a.identificador not in perdoados]
```

A exceção vencida reprova o build da mesma forma que o achado reprovaria, e é o
que impede o arquivo de virar um depósito.

## O que ficou

Em quatro trimestres o arquivo teve nove entradas, e sete expiraram sem
renovação. As duas que foram renovadas geraram a única conversa útil do
programa: as duas apontavam para a mesma biblioteca, e foi o pedido de renovação
que transformou *"alguém precisa migrar isso"* numa tarefa com dono.
