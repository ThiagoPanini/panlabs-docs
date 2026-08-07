#!/usr/bin/env bash
#
# Portão 2 — duração ou curva cravada numa transição.
#
# Cadência: commit.
#
# Nenhum CSS do projeto escreve duração ou curva fora dos seis movimentos
# nomeados. Não é higiene: é o que faz `prefers-reduced-motion` alcançar o
# Infima e o theme-classic, que nós não escrevemos. Movimento que compõe da
# escala herda a redefinição; movimento com número cravado, não.
#
# A varredura cobre `src/` INTEIRO, inclusive o arquivo de tokens — e isso não é
# mais estrito por acaso. O bloco de vocabulário sobrevive porque ele declara
# TOKENS (`--sd-dur-*`, `--sd-ease-*`, `--sd-move-*`), não declarações
# `transition:` ou `animation:`. "Fora do bloco de vocabulário" e "em toda
# parte" coincidem por construção, e um `transition: color 200ms` escrito dentro
# do próprio arquivo de tokens reprova como qualquer outro.
#
# Limite conhecido, escrito em voz alta: `grep` é orientado a linha, então uma
# declaração `transition:` cujo valor quebre em várias linhas escapa. Fora do
# arquivo de tokens isso não importa — o portão 1 pega o literal de tempo em
# qualquer posição. Dentro dele, este é o único guarda, e hoje não há nenhuma
# declaração de transição multilinha lá. O dia em que houver é o dia de trocar a
# varredura por uma que normalize espaço em branco — não de ignorar o achado.

set -uo pipefail

PADRAO='(transition|animation)[a-z-]*:[^;{}]*([0-9.]+m?s\b|cubic-bezier)'

achados=$(grep -rnE "$PADRAO" src/ --include='*.css') || true

if [ -n "$achados" ]; then
  echo "Portão 2 REPROVOU — duração ou curva cravada numa transição/animação:"
  echo
  echo "$achados"
  echo
  echo "Use um dos seis movimentos: --sd-move-{state,enter,expand,showcase,reveal,ambient}."
  exit 1
fi

echo "Portão 2 passou — toda transição compõe do vocabulário de motion."
