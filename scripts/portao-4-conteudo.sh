#!/usr/bin/env bash
#
# Portão 4 — o volume, a regra de heading e a cobertura de locale.
#
# Cadência: commit.
#
# Este portão existe porque os critérios da arquitetura de informação são todos
# CONTAGENS, e contagem escrita em documento é contagem que envelhece calada.
# Uma página a mais em `Guias` não quebra build nenhum; ela só faz a spec
# passar a mentir. Aqui ela reprova.
#
# São quatro cobranças:
#
#   1. o volume por seção          33 em Documentação, 10 em Receitas
#   2. a regra de heading          Documentação >= 3 `##`; Receita <= 1
#   3. o marcador de tradução      todo fonte pt-BR tem `<Untranslated />`,
#                                  e nenhum arquivo de tradução tem
#   4. a cobertura de locale       exatamente 14 páginas em EN, e são as três
#                                  seções declaradas
#
# **A exceção é nomeada, e é uma só.** `comece-aqui/ambientes` carrega ZERO `##`
# de propósito: ela é a fixture que prova que o cartão fica no mesmo pixel sem
# coluna de TOC, e a regra de heading existe justamente para produzir as três
# configurações que ela fecha. Exceção anônima seria buraco; nomeada aqui, ela
# reprova no dia em que alguém escrever a segunda.
#
# Contagem de `##` ignora bloco cercado — senão um comentário `##` dentro de um
# trecho de código contaria como heading.
#
# Procedência: docs/design/informacao.md §4, §6, §7 e §8.

set -uo pipefail

DOCS='conteudo/documentacao'
RECEITAS='conteudo/receitas'
EN='i18n/en/docusaurus-plugin-content-docs/current'

# A única página de `Documentação` que pode ter menos de três `##`.
EXCECAO_DE_HEADING='comece-aqui/ambientes'

falhas=0

reprova() {
  echo "  REPROVOU — $1"
  falhas=$((falhas + 1))
}

# Conta `##` de topo de linha, fora de bloco cercado.
contar_h2() {
  awk '
    /^[[:space:]]*```/ { dentro = !dentro; next }
    !dentro && /^## / { n++ }
    END { print n + 0 }
  ' "$1"
}

echo "Portão 4 — conteúdo"
echo

# --- 1. o volume --------------------------------------------------------------
echo "1  volume por seção"
esperado_por_secao='comece-aqui=4 conceitos=6 meios-de-pagamento=7 guias=6 sdks=4 operacao=6'
total_docs=0

for par in $esperado_por_secao; do
  secao="${par%%=*}"
  esperado="${par##*=}"
  achado=$(find "${DOCS}/${secao}" -name '*.md' 2>/dev/null | wc -l)
  total_docs=$((total_docs + achado))
  if [ "$achado" != "$esperado" ]; then
    reprova "${secao}: ${achado} páginas, esperado ${esperado}"
  fi
done

[ "$total_docs" = 33 ] || reprova "Documentação: ${total_docs} páginas, esperado 33"

total_receitas=$(find "$RECEITAS" -name '*.md' | wc -l)
[ "$total_receitas" = 10 ] || reprova "Receitas: ${total_receitas} páginas, esperado 10"

echo "   Documentação ${total_docs} · Receitas ${total_receitas}"
echo

# --- 2. a regra de heading ----------------------------------------------------
echo "2  regra de heading"
sem_toc=0

while IFS= read -r arquivo; do
  relativo="${arquivo#"${DOCS}/"}"
  relativo="${relativo%.md}"
  h2=$(contar_h2 "$arquivo")

  if [ "$relativo" = "$EXCECAO_DE_HEADING" ]; then
    [ "$h2" = 0 ] || reprova "${relativo}: ${h2} \`##\`, e a fixture exige ZERO"
    sem_toc=$((sem_toc + 1))
  elif [ "$h2" -lt 3 ]; then
    reprova "${relativo}: ${h2} \`##\`, mínimo 3 em Documentação"
  fi
done < <(find "$DOCS" -name '*.md' | sort)

receitas_com_toc=0
while IFS= read -r arquivo; do
  h2=$(contar_h2 "$arquivo")
  if [ "$h2" -gt 1 ]; then
    reprova "${arquivo#"${RECEITAS}/"}: ${h2} \`##\`, máximo 1 em Receita"
  elif [ "$h2" = 1 ]; then
    receitas_com_toc=$((receitas_com_toc + 1))
  else
    sem_toc=$((sem_toc + 1))
  fi
done < <(find "$RECEITAS" -name '*.md' | sort)

echo "   ${sem_toc} páginas sem coluna de TOC · ${receitas_com_toc} receitas com um \`##\`"
[ "$sem_toc" -ge 2 ] ||
  reprova "as três configurações de TOC exigem pelo menos duas páginas sem heading"
echo

# --- 3. o marcador de tradução ------------------------------------------------
echo "3  marcador de tradução"
sem_marcador=$(grep -RL '<Untranslated />' --include='*.md' conteudo) || true
if [ -n "$sem_marcador" ]; then
  reprova "fonte pt-BR sem \`<Untranslated />\`:"
  echo "$sem_marcador" | sed 's/^/    /'
fi

com_marcador_en=$(grep -Rl '<Untranslated />' --include='*.md' "$EN" 2>/dev/null) || true
if [ -n "$com_marcador_en" ]; then
  reprova "tradução COM \`<Untranslated />\` — a página traduzida não o carrega:"
  echo "$com_marcador_en" | sed 's/^/    /'
fi
[ -z "$sem_marcador" ] && [ -z "$com_marcador_en" ] &&
  echo "   todo fonte pt-BR marca; nenhuma tradução marca"
echo

# --- 4. a cobertura de locale -------------------------------------------------
echo "4  cobertura de locale"
traduzidas=$(find "$EN" -name '*.md' 2>/dev/null | wc -l)
[ "$traduzidas" = 14 ] || reprova "EN: ${traduzidas} páginas, esperado 14"

for secao in comece-aqui conceitos sdks; do
  esperado=$(find "${DOCS}/${secao}" -name '*.md' | wc -l)
  achado=$(find "${EN}/${secao}" -name '*.md' 2>/dev/null | wc -l)
  [ "$achado" = "$esperado" ] ||
    reprova "EN/${secao}: ${achado} de ${esperado} páginas traduzidas"
done

for secao in meios-de-pagamento guias operacao; do
  achado=$(find "${EN}/${secao}" -name '*.md' 2>/dev/null | wc -l)
  [ "$achado" = 0 ] ||
    reprova "EN/${secao}: ${achado} páginas, e esta seção é buraco de propósito"
done

buracos=$(( total_docs + total_receitas - traduzidas ))
echo "   ${traduzidas} traduzidas · ${buracos} sem EN, de propósito"
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 4 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/informacao.md — mude os dois lados, ou nenhum."
  exit 1
fi

echo "Portão 4 passou."
