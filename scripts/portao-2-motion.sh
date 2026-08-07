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
