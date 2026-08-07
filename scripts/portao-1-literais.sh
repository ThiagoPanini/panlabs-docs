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
# unidade, `%`, `fr`, `ch` e `auto` ficam de fora: são layout, e flagrá-los
# transformaria o portão em ruído, que é como portão morre.
#
# Limite conhecido, escrito em voz alta: media query não lê custom property, e o
# limiar dela é um comprimento. Enquanto o único limiar do projeto (996/997, o
# literal compilado do Infima) morar em `tokens.css`, o portão passa sem
# exceção. O dia em que um CSS Module precisar do limiar é o dia de reabrir esta
# linha — e não de afrouxar o portão em silêncio.

set -uo pipefail

ARQUIVO_DE_TOKENS='src/css/tokens.css'
PADRAO='#[0-9a-fA-F]{3,8}\b|[0-9.]+(px|rem|em|ms|s)\b|cubic-bezier|oklch\(|rgb\(|hsl\('

achados=$(grep -rnE "$PADRAO" src/ --include='*.css' | grep -v "^${ARQUIVO_DE_TOKENS}:") || true

if [ -n "$achados" ]; then
  echo "Portão 1 REPROVOU — literal de cor, comprimento, tempo ou curva fora de ${ARQUIVO_DE_TOKENS}:"
  echo
  echo "$achados"
  echo
  echo "O valor precisa nascer como token em ${ARQUIVO_DE_TOKENS} e ser citado por nome."
  exit 1
fi

echo "Portão 1 passou — nenhum literal de desenho fora de ${ARQUIVO_DE_TOKENS}."
