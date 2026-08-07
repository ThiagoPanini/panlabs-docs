#!/usr/bin/env bash
#
# Portão 1 — literal fora do arquivo de tokens.
#
# Cadência: commit.
#
# Cor, comprimento, tempo e curva nascem em `src/css/tokens.css` e em nenhum
# outro lugar. Este portão não depende de ninguém lembrar da regra: depende de a
# varredura passar.
#
# Escopo deliberado nas quatro categorias que carregam desenho. `0`, número sem
# unidade, `%`, `fr`, `ch`, `lh` e `auto` ficam de fora: são layout, e flagrá-los
# transformaria o portão em ruído, que é como portão morre.
#
# `lh` entrou na lista no slice do catálogo, e entrou por decisão em vez de por
# omissão. Ele é a altura da linha do próprio elemento — uma REFERÊNCIA ao que a
# escala de tipografia já decidiu, como `%` é referência ao contêiner. Quem
# escreve `calc((1lh - var(--sd-space-4)) / 2)` para centrar um ícone na primeira
# linha não escolheu um número: pediu o que a entrelinha der. Cravar o mesmo
# recuo em `px` é que seria literal, e esse o portão pega.
#
# ---------------------------------------------------------------------------
# A SEGUNDA PERNA — e ela nasceu de um limite que a primeira redação previu
#
# Media query não lê custom property, e o limiar dela é um comprimento. A
# redação original deste portão escreveu, em voz alta: *"o dia em que um CSS
# Module precisar do limiar é o dia de reabrir esta linha — e não de afrouxar o
# portão em silêncio."* O slice 2 é esse dia: `chrome.css` e `foco.css` têm o
# limiar do estreito, e `foco.css` tem `(pointer: coarse)` e `(hover: none)`.
#
# Reabrir em voz alta significa trocar uma regra por outra mais forte, não
# abrir uma exceção. O prelúdio de `@media` sai da varredura de literal E entra
# numa varredura própria, que exige que **todo limiar de comprimento do projeto
# seja 996px ou 997px** — os literais compilados do Infima.
#
# O portão passa a cobrar o que a spec de fato decidiu: um limiar só no projeto
# inteiro, e não os 1024 da âncora brigando com os 996/997 do framework. Um
# `@media (min-width: 1024px)` novo reprova aqui, que é onde ele precisa
# reprovar.
# ---------------------------------------------------------------------------

set -uo pipefail

ARQUIVO_DE_TOKENS='src/css/tokens.css'
PADRAO='#[0-9a-fA-F]{3,8}\b|[0-9.]+(px|rem|em|ms|s)\b|cubic-bezier|oklch\(|rgb\(|hsl\('
LIMIAR_UNICO='99[67]px'

# A varredura cobre DECLARAÇÃO, não prosa: comentário sai antes, com o número de
# linha preservado. Ver `scripts/css-sem-comentario.awk`.
codigo() { find src -name '*.css' -exec awk -f scripts/css-sem-comentario.awk {} +; }

# --- perna 1: literal de desenho fora do arquivo de tokens -------------------
# O prelúdio de `@media` é excluído aqui e cobrado na perna 2.
achados=$(codigo \
  | grep -E "$PADRAO" \
  | grep -v "^${ARQUIVO_DE_TOKENS}:" \
  | grep -vE '^[^:]+:[0-9]+:[[:space:]]*@media') || true

if [ -n "$achados" ]; then
  echo "Portão 1 REPROVOU — literal de cor, comprimento, tempo ou curva fora de ${ARQUIVO_DE_TOKENS}:"
  echo
  echo "$achados"
  echo
  echo "O valor precisa nascer como token em ${ARQUIVO_DE_TOKENS} e ser citado por nome."
  exit 1
fi

# --- perna 2: um limiar só no projeto inteiro --------------------------------
# Toda media query com comprimento precisa usar o limiar único. As que não têm
# comprimento — `hover`, `pointer`, `prefers-reduced-motion` — passam livres.
limiares=$(codigo \
  | grep -E '^[^:]+:[0-9]+:[[:space:]]*@media' \
  | grep -E '[0-9.]+(px|rem|em)' \
  | grep -vE "$LIMIAR_UNICO") || true

if [ -n "$limiares" ]; then
  echo "Portão 1 REPROVOU — limiar de media query fora do único do projeto (996/997px):"
  echo
  echo "$limiares"
  echo
  echo "O projeto tem UM limiar, e ele é o literal compilado do Infima — o mesmo"
  echo "que mostra e esconde a sidebar. Dois limiares no mesmo eixo brigam."
  exit 1
fi

echo "Portão 1 passou — nenhum literal de desenho fora de ${ARQUIVO_DE_TOKENS}, e um limiar só."
