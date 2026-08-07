#!/usr/bin/env bash
#
# Portão 6 — as rotas, contra o host real.
#
# Cadência: implantação. É o único portão do projeto que depende de alguém fora
# dele, e o único que roda contra o mundo.
#
#   rota 1  GET <base>/docs/<qualquer>      -> 200 · text/html · SEM redirect
#   rota 2  GET <base>/docs/<qualquer>.md   -> 200 · text/markdown · Content-Disposition: inline
#   rota 3  GET <base>/docs/<qualquer>/     -> NÃO 200 (404, ou 301 para a forma sem barra)
#
# As rotas 1 e 3 nascem no slice 1. A rota 2 nasce no slice em que existirem
# `.md` por rota; até lá ela é PULADA, e o pulo é dito em voz alta em vez de
# passar como sucesso.
#
# Armadilha registrada: `docusaurus serve` NÃO testa isto. Ele aplica
# `applyTrailingSlash` ao `req.url` e passa `cleanUrls: true` ao
# `serve-handler` — valida a config, não o host.
#
# Reprovar a rota 1 aciona a alavanca de emissão dupla do ADR 7, e não uma
# mudança no `trailingSlash`.
#
# Uso: scripts/portao-6-rotas.sh <url-base> [caminho-da-rota]
#      scripts/portao-6-rotas.sh https://panlabs-tech.github.io/shinydoc-docusaurus

set -uo pipefail

BASE="${1:?uso: portao-6-rotas.sh <url-base> [caminho-da-rota]}"
BASE="${BASE%/}"
ROTA="${2:-/docs/comece-aqui/ambientes}"

falhas=0

cabecalhos() { curl -sS -o /dev/null -D - --max-time 30 "$1"; }
status_final() { curl -sS -o /dev/null -w '%{http_code}' -L --max-time 30 "$1"; }

echo "Portão 6 contra ${BASE}"
echo

# --- rota 1 -------------------------------------------------------------------
url1="${BASE}${ROTA}"
resp1="$(cabecalhos "$url1")"
codigo1="$(printf '%s' "$resp1" | grep -aiE '^HTTP/' | head -1 | awk '{print $2}')"
tipo1="$(printf '%s' "$resp1" | grep -aiE '^content-type:' | head -1 | tr -d '\r' | cut -d' ' -f2-)"

echo "rota 1  GET ${url1}"
echo "        status ${codigo1:-?} · content-type ${tipo1:-—}"
if [ "${codigo1:-}" = "200" ] && printf '%s' "${tipo1:-}" | grep -qi 'text/html'; then
  echo "        PASSOU"
else
  echo "        REPROVOU — esperado 200 text/html sem redirect."
  echo "        Acione a alavanca de emissão dupla do ADR 7 (docs/adr/0007-trailingslash-false.md §Alavanca)."
  falhas=$((falhas + 1))
fi
echo

# --- rota 3 -------------------------------------------------------------------
url3="${BASE}${ROTA}/"
resp3="$(cabecalhos "$url3")"
codigo3="$(printf '%s' "$resp3" | grep -aiE '^HTTP/' | head -1 | awk '{print $2}')"

echo "rota 3  GET ${url3}"
echo "        status ${codigo3:-?}"
if [ "${codigo3:-}" != "200" ]; then
  echo "        PASSOU (a forma com barra não é canônica)"
else
  echo "        REPROVOU — a forma com barra devolveu 200; há duas URLs vivas para a mesma página."
  falhas=$((falhas + 1))
fi
echo

# --- rota 2 -------------------------------------------------------------------
echo "rota 2  PULADA — o \`.md\` por rota nasce num slice posterior."
echo "        Quando existir: esperado 200 · text/markdown · Content-Disposition: inline."
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 6 REPROVOU em ${falhas} rota(s)."
  exit 1
fi

echo "Portão 6 passou nas rotas 1 e 3."
