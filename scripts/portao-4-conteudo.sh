#!/usr/bin/env bash
#
# Portão 4 — o volume, o tipo de página, a regra de heading e a cobertura de
# locale.
#
# Cadência: commit.
#
# Este portão existe porque os critérios da arquitetura de informação são todos
# CONTAGENS, e contagem escrita em documento é contagem que envelhece calada.
# Uma página a mais em `Guias` não quebra build nenhum; um `Guia` sem `<Steps>`
# tampouco. Os dois só fazem a spec passar a mentir. Aqui eles reprovam.
#
# São cinco cobranças:
#
#   1. o volume por seção          33 em Documentação, 10 em Receitas
#   2. o tipo de cada página        toda página tem tipo declarado, e cumpre o
#                                   orçamento ESTRUTURAL dele
#   3. a regra de heading           Documentação >= 3 `##`; Receita <= 1
#   4. o marcador de tradução       todo fonte pt-BR tem `<Untranslated />`,
#                                   e nenhum arquivo de tradução tem
#   5. a cobertura de locale        14 páginas em EN, e são as três seções
#                                   declaradas
#
# **O tipo mora AQUI, e não no conteúdo.** `informacao.md` §6 trava que tipo de
# página é convenção de conteúdo e ZERO layout — sem front matter `type:`, sem
# classe CSS por tipo. Um manifesto de build não é nenhum dos dois: ele não
# toca a página nem o CSS, e some do artefato publicado. O que ele compra é que
# a tabela do §6.2 deixe de ser uma afirmação e vire um fato conferido.
#
# **A exceção de heading é uma só, e é nomeada.** `comece-aqui/ambientes`
# carrega ZERO `##` de propósito: é a fixture que prova que o cartão fica no
# mesmo pixel sem coluna de TOC. Exceção anônima seria buraco; nomeada aqui,
# ela reprova no dia em que alguém escrever a segunda.
#
# **A coluna de palavras do §6.2 NÃO é cobrada, e isso é decisão.** O que
# estressa layout é contagem de estrutura; palavra é proxy ruim, e as páginas
# cujo corpo é código ficam abaixo da faixa porque o código é o conteúdo.
#
# Contagem de `##` e de componente ignora bloco cercado — senão um comentário
# `##` ou um `<Steps>` citado dentro de um trecho de código contariam.
#
# Procedência: docs/design/informacao.md §4.2, §6, §7 e §8.

set -uo pipefail

CONTEUDO='conteudo'
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

# `chave=valor` separados por espaço, lidos com `${par%%=*}` / `${par##*=}` —
# o repo não tem bash 4 garantido, então nada de array associativo.
VOLUME_ESPERADO='comece-aqui=4 conceitos=6 meios-de-pagamento=7 guias=6 sdks=4 operacao=6'

# O manifesto de tipo — `caminho:tipo`, um por linha, para as 43 autorais.
# `indice` e `fixture-curta` são FORMAS, não tipos: ver §6.3 e §4.1.
TIPOS=$(cat <<'FIM'
documentacao/comece-aqui/visao-geral:indice
documentacao/comece-aqui/ambientes:fixture-curta
documentacao/comece-aqui/autenticacao:guia
documentacao/comece-aqui/primeira-cobranca:quickstart
documentacao/conceitos/mapa-dos-conceitos:indice
documentacao/conceitos/ciclo-de-vida:conceitual
documentacao/conceitos/idempotencia:conceitual
documentacao/conceitos/webhooks:conceitual
documentacao/conceitos/conciliacao:fixture-prosa-pura
documentacao/conceitos/erros:conceitual
documentacao/meios-de-pagamento/comparativo:catalogo
documentacao/meios-de-pagamento/pix:guia
documentacao/meios-de-pagamento/pix-qr-dinamico:conceitual
documentacao/meios-de-pagamento/pix-devolucao:guia
documentacao/meios-de-pagamento/boleto:guia
documentacao/meios-de-pagamento/cartao:guia
documentacao/meios-de-pagamento/split:conceitual
documentacao/guias/indice-de-guias:indice
documentacao/guias/aceitar-pix-com-qr-dinamico:guia
documentacao/guias/cobrar-cartao-com-autenticacao:guia
documentacao/guias/assinar-um-cliente:guia
documentacao/guias/migrar-de-outro-provedor:guia
documentacao/guias/catalogo-de-componentes:guia
documentacao/sdks/visao-geral:indice
documentacao/sdks/node:sdk
documentacao/sdks/python:sdk
documentacao/sdks/go:sdk
documentacao/operacao/indice:indice
documentacao/operacao/monitoramento:guia
documentacao/operacao/diagnostico:troubleshooting
documentacao/operacao/codigos-de-recusa:catalogo
documentacao/operacao/arquivo-de-movimento:guia
documentacao/operacao/changelog:changelog
receitas/intro:indice
receitas/checkout-pix-em-dez-minutos:receita
receitas/verificar-assinatura-de-webhook:receita
receitas/cobrar-cartao-salvo:receita
receitas/emitir-boleto-com-vencimento:receita
receitas/dividir-uma-cobranca-com-split:receita
receitas/estornar-parcialmente:receita
receitas/retentativa-com-espera-exponencial:receita
receitas/paginar-o-historico-de-cobrancas:receita
receitas/conciliar-com-referencia-externa:receita
FIM
)

# Conta ocorrências fora de bloco cercado. $2 é uma regex de linha inteira.
contar() {
  awk -v padrao="$2" '
    /^[[:space:]]*```/ { dentro = !dentro; next }
    !dentro && $0 ~ padrao { n++ }
    END { print n + 0 }
  ' "$1"
}

echo "Portão 4 — conteúdo"
echo

# --- 1. o volume --------------------------------------------------------------
echo "1  volume por seção"
total_docs=0

for par in $VOLUME_ESPERADO; do
  secao="${par%%=*}"
  esperado="${par##*=}"
  achado=$(find "${DOCS}/${secao}" -name '*.md' 2>/dev/null | wc -l)
  total_docs=$((total_docs + achado))
  [ "$achado" = "$esperado" ] ||
    reprova "${secao}: ${achado} páginas, esperado ${esperado}"
done

[ "$total_docs" = 33 ] || reprova "Documentação: ${total_docs} páginas, esperado 33"

total_receitas=$(find "$RECEITAS" -name '*.md' | wc -l)
[ "$total_receitas" = 10 ] || reprova "Receitas: ${total_receitas} páginas, esperado 10"

echo "   Documentação ${total_docs} · Receitas ${total_receitas}"
echo

# --- 2. o tipo, e o orçamento estrutural dele ---------------------------------
echo "2  tipo de página e orçamento estrutural"

declaradas=$(printf '%s\n' "$TIPOS" | wc -l)
autorais=$((total_docs + total_receitas))
[ "$declaradas" = "$autorais" ] ||
  reprova "o manifesto declara ${declaradas} páginas e existem ${autorais}"

while IFS=: read -r relativo tipo; do
  arquivo="${CONTEUDO}/${relativo}.md"
  if [ ! -f "$arquivo" ]; then
    reprova "${relativo}: declarada no manifesto e ausente do disco"
    continue
  fi

  steps=$(contar "$arquivo" '^<Steps>')
  callouts=$(contar "$arquivo" '^:::(note|info|tip|warning)')
  tabelas=$(contar "$arquivo" '^[|] --- [|]')
  cards=$(contar "$arquivo" '^<CardGroup>')
  codegroups=$(contar "$arquivo" '^<CodeGroup')
  # A cerca é o `code-block`, e o contador de `##` já ignora o interior dela.
  blocos=$(( $(grep -c '^```' "$arquivo") / 2 ))

  exigir() { # exigir <o quê> <achado> <mínimo>
    [ "$2" -ge "$3" ] 2>/dev/null ||
      reprova "${relativo} (${tipo}): ${2} ${1}, mínimo ${3}"
  }

  case "$tipo" in
    quickstart)     exigir '<Steps>' "$steps" 1; exigir 'blocos' "$blocos" 5
                    exigir 'callouts' "$callouts" 2; exigir '<CardGroup>' "$cards" 1 ;;
    conceitual)     exigir 'blocos' "$blocos" 2; exigir 'callouts' "$callouts" 1
                    exigir 'tabelas' "$tabelas" 1 ;;
    guia)           exigir '<Steps>' "$steps" 1; exigir 'blocos' "$blocos" 3
                    exigir 'callouts' "$callouts" 2 ;;
    sdk)            exigir '<CodeGroup>' "$codegroups" 1; exigir 'blocos' "$blocos" 4 ;;
    receita)        exigir 'blocos' "$blocos" 1 ;;
    catalogo)       exigir 'tabelas' "$tabelas" 1 ;;
    troubleshooting) exigir 'tabelas' "$tabelas" 1 ;;
    changelog)      exigir 'entradas <Update>' "$(contar "$arquivo" '^<Update ')" 6 ;;
    indice)         : ;; # forma, não tipo — o piso do tipo da seção, mais o índice
    fixture-prosa-pura)
      # A fixture ganha do orçamento: `Conceitual` sem NENHUM componente.
      for achado in "$blocos:blocos" "$tabelas:tabelas" "$callouts:callouts" \
                    "$cards:<CardGroup>" "$steps:<Steps>"; do
        [ "${achado%%:*}" = 0 ] ||
          reprova "${relativo}: prosa pura não admite ${achado##*:} (achou ${achado%%:*})"
      done ;;
    fixture-curta)  : ;; # a exceção de heading, cobrada na seção 3
    *)              reprova "${relativo}: tipo desconhecido '${tipo}'" ;;
  esac
done <<< "$TIPOS"

echo "   ${declaradas} páginas com tipo declarado, cada uma no orçamento estrutural dele"
echo

# --- 3. a regra de heading ----------------------------------------------------
echo "3  regra de heading"
docs_sem_toc=0

while IFS= read -r arquivo; do
  relativo="${arquivo#"${DOCS}/"}"
  relativo="${relativo%.md}"
  h2=$(contar "$arquivo" '^## ')

  if [ "$relativo" = "$EXCECAO_DE_HEADING" ]; then
    [ "$h2" = 0 ] || reprova "${relativo}: ${h2} \`##\`, e a fixture exige ZERO"
    docs_sem_toc=$((docs_sem_toc + 1))
  elif ! [ "$h2" -ge 3 ] 2>/dev/null; then
    reprova "${relativo}: ${h2} \`##\`, mínimo 3 em Documentação"
  fi
done < <(find "$DOCS" -name '*.md' | sort)

receitas_com_toc=0
receitas_sem_toc=0
while IFS= read -r arquivo; do
  h2=$(contar "$arquivo" '^## ')
  if ! [ "$h2" -le 1 ] 2>/dev/null; then
    reprova "${arquivo#"${RECEITAS}/"}: ${h2} \`##\`, máximo 1 em Receita"
  elif [ "$h2" = 1 ]; then
    receitas_com_toc=$((receitas_com_toc + 1))
  else
    receitas_sem_toc=$((receitas_sem_toc + 1))
  fi
done < <(find "$RECEITAS" -name '*.md' | sort)

echo "   Documentação: ${docs_sem_toc} sem coluna de TOC (a exceção nomeada)"
echo "   Receitas: ${receitas_com_toc} com um \`##\` · ${receitas_sem_toc} sem nenhum"

# As DUAS configurações de coluna que este slice pode produzir precisam existir
# no artefato. A terceira, `hide_table_of_contents`, chega com a Referência da
# API — ver informacao.md §4.
[ "$docs_sem_toc" -ge 1 ] || reprova "nenhuma página de Documentação sem TOC"
[ "$receitas_com_toc" -ge 1 ] || reprova "nenhuma Receita monta coluna de TOC"
[ "$receitas_sem_toc" -ge 1 ] || reprova "nenhuma Receita fica sem coluna de TOC"
echo

# --- 4. o marcador de tradução ------------------------------------------------
echo "4  marcador de tradução"
# `conteudo/api-reference` fica de fora dos dois lados desta checagem. As
# trinta páginas da Referência da API não têm estado de fallback para
# sinalizar — o gerador entrega os dois locales JUNTOS a partir do contrato
# bilíngue, e as seis autorais também nascem traduzidas de verdade no mesmo
# slice (#38). `<Untranslated />` é sobre a página SÓ existir num locale;
# aqui isso nunca acontece, então a convenção de uma linha não se aplica.
sem_marcador=$(grep -RL '<Untranslated />' --include='*.md' --exclude-dir='api-reference' "$CONTEUDO") || true
if [ -n "$sem_marcador" ]; then
  reprova "fonte pt-BR sem \`<Untranslated />\`:"
  echo "$sem_marcador" | sed 's/^/    /'
fi

com_marcador_en=$(grep -Rl '<Untranslated />' --include='*.md' "$EN" 2>/dev/null) || true
if [ -n "$com_marcador_en" ]; then
  reprova "tradução COM \`<Untranslated />\` — a página traduzida não o carrega:"
  echo "$com_marcador_en" | sed 's/^/    /'
fi

fontes=$(find "$CONTEUDO" -path "${CONTEUDO}/api-reference" -prune -o -name '*.md' -print | wc -l)
[ -z "$sem_marcador" ] && [ -z "$com_marcador_en" ] &&
  echo "   os ${fontes} fontes pt-BR marcam; nenhuma tradução marca (api-reference fora, de propósito)"
echo

# --- 5. a cobertura de locale -------------------------------------------------
echo "5  cobertura de locale"
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

buracos=$(( autorais - traduzidas ))
echo "   ${traduzidas} traduzidas · ${buracos} das 43 autorais sem EN, de propósito"
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 4 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/informacao.md — mude os dois lados, ou nenhum."
  exit 1
fi

echo "Portão 4 passou."
