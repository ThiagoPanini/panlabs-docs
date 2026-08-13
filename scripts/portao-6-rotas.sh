#!/usr/bin/env bash
#
# Portão 6 — as rotas, contra o host real.
#
# Cadência: implantação. É o único portão do projeto que depende de alguém fora
# dele, e o único que roda contra o mundo.
#
#   rota 1  GET <base>/<qualquer>      -> 200 · text/html · SEM redirect
#   rota 2  GET <base>/<qualquer>.md   -> 200 · text/markdown · disposição != attachment
#   rota 3  GET <base>/<qualquer>/     -> NÃO 200 (404, ou 301 para a forma sem barra)
#
# A rota 2 exige que a disposição NÃO seja `attachment`, e não que o cabeçalho
# `Content-Disposition: inline` exista. Medido no slice 1: as referências do alvo
# mandam o cabeçalho; o GitHub Pages não manda nenhum. Ausente não é attachment —
# pela RFC 6266 a disposição default é inline, e o navegador confirma. Exigir o
# cabeçalho literal reprovaria um host onde o recurso funciona, e portão que
# reprova o que funciona é portão que alguém desliga.
#
# As rotas 1 e 3 nascem no slice 1. A rota 2 nasceu no slice 7, com o plugin
# `sd-ai-era` — ela deixou de ser pulada e passou a rodar.
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
#
# **A rota default é a fixture de página curta**, e a escolha não é decorativa:
# ela é a única página do acervo sem coluna de TOC, então o `.md` dela é o menor
# do site e o teste das três rotas roda contra o caso mais magro que existe. Se
# ele passa ali, o host não está tratando o `.md` por tamanho nem por conteúdo.
#
# Ela é também a rota que mais envelhece: um portão de cadência de IMPLANTAÇÃO
# não roda em commit, então uma rota morta aqui só aparece no dia do deploy.
# Este default já apontou para `/docs/comece-aqui/ambientes` depois de `/docs`
# deixar de existir, e quem pegou foi revisão e não execução.

set -uo pipefail

BASE="${1:?uso: portao-6-rotas.sh <url-base> [caminho-da-rota]}"
BASE="${BASE%/}"
ROTA="${2:-/procedimentos/ambiente/indice}"

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

# --- rota 2 -------------------------------------------------------------------
# `permalink + '.md'`, concatenação pura — é assim que o plugin escreve o
# arquivo, e é assim que o leitor (ou a máquina) monta a URL.
url2="${BASE}${ROTA}.md"
resp2="$(cabecalhos "$url2")"
codigo2="$(printf '%s' "$resp2" | grep -aiE '^HTTP/' | head -1 | awk '{print $2}')"
tipo2="$(printf '%s' "$resp2" | grep -aiE '^content-type:' | head -1 | tr -d '\r' | cut -d' ' -f2-)"
disp2="$(printf '%s' "$resp2" | grep -aiE '^content-disposition:' | head -1 | tr -d '\r' | cut -d' ' -f2-)"

echo "rota 2  GET ${url2}"
echo "        status ${codigo2:-?} · content-type ${tipo2:-—} · disposição ${disp2:-—(ausente)}"
if [ "${codigo2:-}" = "200" ] &&
  printf '%s' "${tipo2:-}" | grep -qi 'text/markdown' &&
  ! printf '%s' "${disp2:-}" | grep -qi 'attachment'; then
  echo "        PASSOU"
else
  echo "        REPROVOU — esperado 200 · text/markdown · disposição != attachment."
  echo "        Ausente NÃO é attachment: pela RFC 6266 a disposição default é inline."
  echo "        O que mata o recurso é \`attachment\`, que faz o link virar download."
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

if [ "$falhas" -gt 0 ]; then
  echo "Portão 6 REPROVOU em ${falhas} rota(s)."
  exit 1
fi

echo "Portão 6 passou nas três rotas."
