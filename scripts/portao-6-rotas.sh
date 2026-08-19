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
#
# E aconteceu de novo, do outro lado: o default daqui foi atualizado com a
# árvore do `panlabs`, mas o ARGUMENTO do locale EN em `deploy.yml` continuou
# apontando para `/en/docs/comece-aqui/ambientes`, que devolve 404 desde que a
# árvore mudou. O portão do segundo locale estava quebrado e ninguém sabia,
# porque a cadeia inteira — o portão, a rota e o host — só se encontra depois
# do deploy.
#
# São DUAS rotas, e elas moram em dois arquivos porque a rota é argumento deste
# script — o que o torna reusável, e o que espalha a lista. A lista fica aqui,
# que é onde quem mexe na árvore vem parar:
#
#   pt-BR   /procedimentos/ambiente/preparar-a-maquina-local  ← o default abaixo
#   en      /en/ferramentas/bibliotecas/biblioteca-b           ← argumento em deploy.yml
#
# A rota do EN não é escolha de gosto: `Ferramentas` é a única aba traduzida
# (`informacao.md` §8), e apontar para outra mediria a rota de FALLBACK em
# português em vez da rota traduzida. Mudou a árvore? Confira as duas linhas
# acima, e depois `.github/workflows/deploy.yml`.
#
# NENHUMA DAS DUAS PODE SER PÁGINA DE `slug: /`, e a razão é a rota 3: a forma
# com barra de uma rota nua é o diretório que abriga as páginas filhas da
# instância, e um host que serve listagem de diretório devolveria 200 ali por um
# motivo que não é o que a rota 3 mede. As duas rotas acima são folhas comuns,
# fundo do poço da árvore, e a barra depois delas não é diretório de nada.
#
# --- as três rotas nuas, e por que elas ganharam bloco próprio ----------------
#
# `/jornadas`, `/procedimentos` e `/ferramentas` são páginas de verdade desde a
# issue #114: a primeira folha de cada instância carrega `slug: /` no front
# matter (ADR 10 §h). Antes disso as três eram 404 — o `docSidebar` da navbar
# leva à primeira doc por outro caminho, e a rota digitada não resolvia.
#
# Elas NÃO entram como argumento porque as três formas acima medem coisas
# diferentes de uma rota só: 200/html, a emissão `.md`, e a não-canonicidade da
# barra. O que se quer das três nuas é a primeira pergunta apenas, e para as
# três de uma vez. Por isso o bloco separado, e por isso ele roda uma vez só —
# na execução sem argumento de rota, que é a do locale pt-BR.
#
# A pergunta `200 + text/html` é literalmente a mesma da rota 1, e mora na função
# `html_200`, não em duas cópias.

set -uo pipefail

BASE="${1:?uso: portao-6-rotas.sh <url-base> [caminho-da-rota]}"
BASE="${BASE%/}"
ROTA="${2:-/procedimentos/ambiente/preparar-a-maquina-local}"
# `sim` quando quem chamou escolheu a rota — é a execução do EN, em `deploy.yml`.
# O bloco das rotas nuas roda só na outra, e a distinção é essa e não o valor da rota.
if [ $# -ge 2 ]; then ROTA_VEIO_POR_ARGUMENTO=sim; else ROTA_VEIO_POR_ARGUMENTO=nao; fi

falhas=0

cabecalhos() { curl -sS -o /dev/null -D - --max-time 30 "$1"; }
status_final() { curl -sS -o /dev/null -w '%{http_code}' -L --max-time 30 "$1"; }

# `200` mais `text/html`, sem redirect — a pergunta que a rota 1 e as três rotas
# nuas fazem igual. Ela mora numa função só desde a #114: eram dois blocos com o
# mesmo `grep`, o mesmo teste e a mesma mensagem, e o segundo nasceu de copiar o
# primeiro. Um portão cujo critério existe em duas cópias é um portão que aperta
# de um lado só no dia em que alguém mexer numa delas.
#
# O `$2` é a dica de conserto, e é o que difere entre os dois usos: rota errada e
# `slug: /` errado se consertam em arquivos diferentes.
html_200() {
  local url="$1" dica="$2" resp codigo tipo
  resp="$(cabecalhos "$url")"
  codigo="$(printf '%s' "$resp" | grep -aiE '^HTTP/' | head -1 | awk '{print $2}')"
  tipo="$(printf '%s' "$resp" | grep -aiE '^content-type:' | head -1 | tr -d '\r' | cut -d' ' -f2-)"
  echo "        status ${codigo:-?} · content-type ${tipo:-—}"
  if [ "${codigo:-}" = "200" ] && printf '%s' "${tipo:-}" | grep -qi 'text/html'; then
    echo "        PASSOU"
    return 0
  fi
  echo "        REPROVOU — esperado 200 text/html sem redirect."
  printf '%s\n' "$dica"
  falhas=$((falhas + 1))
  return 1
}

echo "Portão 6 contra ${BASE}"
echo

# --- rota 1 -------------------------------------------------------------------
url1="${BASE}${ROTA}"
echo "rota 1  GET ${url1}"
html_200 "$url1" \
  "        Acione a alavanca de emissão dupla do ADR 7 (docs/adr/0007-trailingslash-false.md §Alavanca)." ||
  true
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

# --- as três rotas nuas -------------------------------------------------------
#
# Roda só na execução sem argumento de rota. Na execução do EN o argumento existe,
# e conferir `/jornadas` de lá mediria a rota pt-BR uma segunda vez.
if [ "$ROTA_VEIO_POR_ARGUMENTO" = nao ]; then
  echo "rotas nuas  as três instâncias, por \`slug: /\` na folha de abertura"
  for nua in /jornadas /procedimentos /ferramentas; do
    echo "        GET ${BASE}${nua}"
    html_200 "${BASE}${nua}" \
      "        A rota nua sai do \`slug: /\` na primeira folha da instância; confira
        o front matter dela e a ordem em \`sidebars-*.js\` (ADR 10 §h)." || true
  done
  echo
fi

if [ "$falhas" -gt 0 ]; then
  echo "Portão 6 REPROVOU em ${falhas} rota(s)."
  exit 1
fi

echo "Portão 6 passou — as três formas da rota canônica, e as três rotas nuas."
