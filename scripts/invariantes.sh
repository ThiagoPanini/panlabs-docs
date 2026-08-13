#!/usr/bin/env bash
#
# As quatro invariantes de FORMA da spec.
#
# Cadência: commit. Não é portão — os portões cobram o CÓDIGO, e estas quatro
# cobram a SPEC. Um documento é o entregável deste projeto (axioma 6), e um
# entregável sem régua envelhece calado do mesmo jeito que código sem teste.
#
# A quinta invariante — completude — não está aqui, e a ausência é a decisão:
# ela é leitura cruzada entre as 27 resoluções do mapa e os arquivos da spec, e
# não existe varredura que a faça. O resultado dela mora em
# docs/design/README.md §6.
#
# **As quatro passariam com a tipografia inteiramente ausente.** Um documento
# que não existe não tem seção vazia, não tem número solto e não tem procedência
# órfã. É por isso que a quinta é a que importa mais.
#
# Uso: scripts/invariantes.sh
#
# Procedência: docs/design/README.md §4.

set -uo pipefail

SPEC='docs/design'
COMPONENTES="${SPEC}/componentes"
falhas=0

# O gabarito, verbatim e em ordem. Nove seções — ver componentes/README.md §"O
# gabarito, e por que ele é estrutura".
GABARITO=(
  'Papel'
  'Anatomia'
  'Variantes'
  'Autoria em MDX'
  'Tokens consumidos'
  'Light e dark'
  'Motion / reduced-motion'
  'A11y'
  'Procedência'
)

echo "As quatro invariantes de forma"
echo

# --- 1: gabarito sem seção vazia ---------------------------------------------
#
# Duas coisas de uma vez: as nove seções existem e estão na ordem, E nenhuma
# delas é só o título. Seção presente e vazia é o modo de falhar que um gabarito
# convida — o autor cria o cabeçalho para o documento "ficar completo".
echo "1  gabarito sem seção vazia"
vazias=0
fora_de_ordem=0
for arquivo in "${COMPONENTES}"/*.md; do
  [ "$(basename "$arquivo")" = 'README.md' ] && continue

  presentes="$(grep -E '^## ' "$arquivo" | sed 's/^## //')"
  esperadas="$(printf '%s\n' "${GABARITO[@]}")"
  if [ "$presentes" != "$esperadas" ]; then
    echo "   FORA DO GABARITO  $arquivo"
    diff <(printf '%s\n' "$esperadas") <(printf '%s\n' "$presentes") | sed 's/^/     /'
    fora_de_ordem=$((fora_de_ordem + 1))
    continue
  fi

  # Corpo de cada seção: as linhas entre um `## ` e o próximo. Vazio significa
  # nada além de linha em branco.
  while IFS= read -r secao; do
    corpo="$(awk -v alvo="## ${secao}" '
      $0 == alvo {dentro = 1; next}
      /^## / {dentro = 0}
      dentro && $0 !~ /^[[:space:]]*$/ {n += 1}
      END {print n + 0}
    ' "$arquivo")"
    if [ "$corpo" -eq 0 ]; then
      echo "   SEÇÃO VAZIA  ${arquivo} · ## ${secao}"
      vazias=$((vazias + 1))
    fi
  done < <(printf '%s\n' "${GABARITO[@]}")
done
if [ "$vazias" -eq 0 ] && [ "$fora_de_ordem" -eq 0 ]; then
  # A contagem é CONTADA, não redigitada. Ela já mentiu uma vez: o catálogo caiu
  # de dezoito para dezessete e esta linha continuou dizendo dezoito, num script
  # cujo assunto inteiro é impedir que a spec envelheça calada.
  echo "   $(find "$COMPONENTES" -name '*.md' -not -name 'README.md' | wc -l) documentos, ${#GABARITO[@]} seções cada, nenhuma vazia."
else
  falhas=$((falhas + 1))
fi
echo

# --- 2: zero número fora de tokens.md ----------------------------------------
#
# A varredura crua produziria trinta falsos positivos: limiar de media query,
# citação de valor de terceiro (os 1024 da âncora, os 1440 do Infima), resultado
# de verificação ("folga de 62,5px") e aritmética de derivação escrita por
# extenso. Reprovar tudo isso seria portão que reprova o que funciona.
#
# O que a invariante de fato protege é OUTRA coisa: que nenhum documento vire
# segunda fonte de valor sem dizer que virou. Então a régua é —
#
#   documento com literal de desenho PRECISA declarar, no próprio preâmbulo, o
#   que ele admite e por quê.
#
# Documento sem literal passa de graça. Documento com literal e sem declaração
# reprova, e a saída é escrever a declaração ou tirar o número.
echo "2  zero número fora de tokens.md"
PADRAO='#[0-9a-fA-F]{3,8}\b|[0-9.]+(px|rem|em|ms|s)\b|cubic-bezier|oklch\(|rgb\(|hsl\('
DECLARACAO='valor numérico|valor literal|nenhum valor de cor|Nenhum número'
sem_declaracao=0
while IFS= read -r arquivo; do
  [ "$arquivo" = "${SPEC}/tokens.md" ] && continue
  grep -qE "$PADRAO" "$arquivo" || continue
  if ! head -20 "$arquivo" | grep -qiE "$DECLARACAO"; then
    echo "   SEM DECLARAÇÃO  ${arquivo} — tem literal de desenho e não diz o que admite"
    grep -nE "$PADRAO" "$arquivo" | head -3 | sed 's/^/     /'
    sem_declaracao=$((sem_declaracao + 1))
  fi
done < <(find "$SPEC" -name '*.md' | sort)
if [ "$sem_declaracao" -eq 0 ]; then
  echo "   todo documento com literal declara o que admite; tokens.md é a sede."
else
  falhas=$((falhas + 1))
fi
echo

# --- 3: `## Procedência` sem linha órfã ---------------------------------------
#
# Toda tabela de procedência tem três colunas — decisão, classe, fonte — e órfã
# é linha com qualquer célula vazia. Sem a classe, valor medido e valor
# inventado ficam graficamente idênticos, e o axioma 5 fica infiscalizável.
echo "3  \`## Procedência\` sem linha órfã"
orfas=0
sem_secao=0
while IFS= read -r arquivo; do
  if ! grep -q '^## Procedência' "$arquivo"; then
    echo "   SEM PROCEDÊNCIA  $arquivo"
    sem_secao=$((sem_secao + 1))
    continue
  fi
  saida="$(awk -v arq="$arquivo" '
    /^## Procedência/ {dentro = 1; next}
    /^## / {dentro = 0}
    dentro && /^\|/ {
      # Cabeçalho e separador não são dados.
      if ($0 ~ /^\|[[:space:]:-]+\|[[:space:]:-]+\|[[:space:]:-]+\|?[[:space:]]*$/) next
      linha = $0
      sub(/^\|/, "", linha); sub(/\|[[:space:]]*$/, "", linha)
      n = split(linha, celula, "|")
      if (n != 3) { print "     " arq ":" NR "  " n " colunas (esperado 3)"; next }
      for (i = 1; i <= 3; i += 1) {
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", celula[i])
        if (celula[i] == "") { print "     " arq ":" NR "  célula " i " vazia" }
      }
    }
  ' "$arquivo")"
  if [ -n "$saida" ]; then
    # A primeira linha de dados é o cabeçalho da tabela; ele tem 3 colunas
    # preenchidas, então não aparece aqui.
    echo "$saida"
    orfas=$((orfas + 1))
  fi
done < <(find "$SPEC" docs/adr -name '*.md' -not -name 'README.md' | sort)
if [ "$orfas" -eq 0 ] && [ "$sem_secao" -eq 0 ]; then
  echo "   toda tabela de procedência tem decisão, classe e fonte em toda linha."
else
  falhas=$((falhas + 1))
fi
echo

# --- 4: todo bloco `Livre` nomeia o dono --------------------------------------
#
# Latitude sem dono é buraco. A forma do marcador é `Livre — <dono>`: o
# travessão e o que vem depois dele.
#
# A régua separa MARCADOR de MENÇÃO por code span, e a escolha é do próprio
# vocabulário do repositório: quando a palavra é citada — *"salvo bloco `Livre`"*,
# *"o marcador `Livre` restringe a família"* — ela vai entre crases, porque ali
# ela é o nome de uma coisa. Quando ela ABRE um bloco, ela vai em negrito ou em
# comentário de CSS, sem crase. Tirar os code spans antes de olhar é o que faz a
# varredura enxergar marcador e ignorar prosa, sem lista de exceção a manter.
echo "4  todo bloco \`Livre\` nomeia o dono"
sem_dono="$(find "$SPEC" -name '*.md' | sort | while IFS= read -r arquivo; do
  sed 's/`[^`]*`//g' "$arquivo" \
    | grep -nE 'Livre' \
    | grep -vE 'Livre[[:space:]]*—[[:space:]]*[^[:space:]]' \
    | sed "s|^|${arquivo}:|"
done)"
if [ -z "$sem_dono" ]; then
  donos="$(find "$SPEC" -name '*.md' -exec sed 's/`[^`]*`//g' {} + \
    | grep -ohE 'Livre[[:space:]]*—[[:space:]]*[^.*:]+' \
    | sed 's/Livre[[:space:]]*—[[:space:]]*//' | sort -u)"
  echo "   todo marcador nomeia. Donos em uso:"
  printf '%s\n' "$donos" | sed 's/^/     · /'
else
  echo "   MARCADOR SEM DONO:"
  echo "$sem_dono" | sed 's/^/     /'
  falhas=$((falhas + 1))
fi
echo

if [ "$falhas" -gt 0 ]; then
  echo "As invariantes REPROVARAM em ${falhas} de 4."
  exit 1
fi
echo "As quatro invariantes de forma passaram."
