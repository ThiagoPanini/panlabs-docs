---
title: A varredura que reprovava tudo
description: Ligar a varredura de dependências em modo bloqueante no primeiro dia parou seis repositórios e não produziu um achado acionável.
---

# A varredura que reprovava tudo

<Untranslated />

O programa de champion começou com uma tarefa concreta: ligar a varredura de
dependências na esteira das seis aplicações da squad. A ferramenta já estava
contratada, o passo era de cinco linhas, e a decisão de ligá-lo bloqueando
pareceu óbvia: uma trava que só avisa é uma trava que ninguém obedece. Na
manhã seguinte os seis repositórios estavam vermelhos, ninguém conseguia subir
nada, e a lista de achados tinha 340 linhas.

## Por que 340 linhas é o mesmo que zero

Uma lista longa demais não é informação: é ruído com aparência de rigor. Das 340
linhas, a esmagadora maioria era de vulnerabilidade em dependência transitiva,
sem correção publicada, em caminho de código que a aplicação não executa.

O efeito prático de bloquear com essa lista é que **a única saída disponível
vira desligar a trava**. Quem precisa entregar não tem como escolher entre 340
itens indistinguíveis, e a conversa que se segue não é sobre segurança, é sobre
o build parado.

:::warning
O erro não foi ligar a varredura. Foi ligar bloqueio e relatório **no mesmo dia**:
o bloqueio precisa de uma lista curta para ser justo, e a lista só encurta depois
de o relatório rodar por um tempo.
:::

## O que a ordem certa parecia

Três meses de relatório, com o mesmo passo e sem `exit 1`.

```yaml
# .github/workflows/dependencias.yml: a fase de relatório
- name: Varrer dependências
  run: |
    panlabs-scan --formato json > achados.json
    panlabs-scan --resumo achados.json
  continue-on-error: true

- name: Publicar o resumo no sumário do job
  run: panlabs-scan --markdown achados.json >> "$GITHUB_STEP_SUMMARY"
```

`continue-on-error` com o resumo no `GITHUB_STEP_SUMMARY` é o par que faz a fase
de relatório valer alguma coisa. Sem o resumo à vista, relatório é arquivo que
ninguém abre; com ele, a lista aparece na mesma tela onde a pessoa já está
olhando o resultado do build.

## O critério que encurtou a lista

O que transformou 340 em 11 não foi corrigir 329 coisas. Foi parar de tratar
todas como equivalentes.

```python
# o filtro que passou a decidir o que bloqueia
def bloqueia(achado):
    return (
        achado.severidade in {"alta", "critica"}
        and achado.tem_correcao_publicada
        and achado.caminho_alcancavel        # a análise de alcance, e é ela que corta
    )
```

`caminho_alcancavel` é a linha que faz o trabalho. Uma vulnerabilidade numa
função que a aplicação nunca chama é dívida de inventário, não risco. Ela entra
no relatório e não para ninguém.

## O segundo bloqueio

Passou sem uma reclamação. Onze achados na squad inteira, todos com correção
publicada, todos em caminho executado; o mais antigo tinha quatro dias.

O que mudou entre as duas tentativas não foi ferramenta, nem política, nem
patrocínio: foi a **ordem**. Relatar primeiro, encurtar com critério, bloquear
depois. E a lista curta é o que torna o bloqueio defensável, porque cada linha
dele responde à pergunta *"o que fazer agora?"*.
