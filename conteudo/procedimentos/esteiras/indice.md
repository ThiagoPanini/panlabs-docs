---
title: Esteiras
description: Os workflows de GitHub Actions que todo repositório da casa herda, e o que fazer quando um deles reprova.
---

# Esteiras

<Untranslated />

Todo repositório herda três workflows do template da casa: um de verificação em
`pull request`, um de publicação em `main`, e um agendado de inventário. Eles
moram em `.github/workflows/` e são atualizados por `pull request` do próprio
template — nunca editados no repositório de destino, porque uma edição local
some no próximo sincronismo.

## O que cada um faz

| Workflow | Quando roda | O que reprova |
| --- | --- | --- |
| `verificar.yml` | todo `pull request` | teste, tipo, formato, varredura |
| `publicar.yml` | push em `main` | build da imagem, assinatura, empurrar |
| `inventario.yml` | segunda-feira, 06h | nada — só registra |

## A regra que evita a maior perda de tempo

**Reprovação de esteira se reproduz localmente antes de qualquer outra coisa.**
O mesmo comando que a esteira roda está no `Makefile`, com o mesmo nome do passo
que falhou. Investigar direto no log de um runner custa um ciclo de push por
tentativa.

Ver [Rodar a esteira localmente](rodar-a-esteira-localmente).

## As páginas desta seção

- [Verificar a assinatura HMAC](verificar-a-assinatura-hmac) — como conferir que
  um evento veio de quem diz ter vindo.
- [Publicar um pacote interno](publicar-um-pacote-interno) — do `pull request`
  ao pacote disponível no índice.
- [Rodar a esteira localmente](rodar-a-esteira-localmente) — o mesmo conjunto de
  passos, sem esperar por runner.
