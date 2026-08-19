#!/usr/bin/env bash
#
# Portão 5 — a referência de biblioteca, gerada de contrato de assinatura.
#
# Cadência: commit.
#
# **Ele voltou a ser o que o ADR 5 desenhou, contra o contrato que o ADR 8
# escreve:** roda o gerador e reprova em `git diff`. A disciplina atravessou a
# troca de premissa inteira — o que morreu foi OpenAPI, não a régua. Saída gerada
# é projeção de um contrato, nunca arquivo editado à mão.
#
# **O número continua 5, e o nome do arquivo não.** O ADR o cita pelo número, e
# renumerar um portão citado por ADR, por script e por `package.json` quebra uma
# citação. Já `portao-5-api` mente pelo mesmo motivo que `gerar-api` mentia: não
# há API HTTP nenhuma neste caminho.
#
# São seis cobranças:
#
#   1. o par de contratos           JSON puro, sem dependência de parser
#   2. o gerador                    `gerar-api` não sobrevive ao nome
#   3. a projeção                   regenera e diffa contra o commitado
#   4. a parte `meta`               a condição que a segura no catálogo
#   5. zero verbo HTTP              em `src/` e no contrato
#   6. a contagem do ramo           6 páginas por locale, 6 ids no fragmento
#
# **A cobrança 4 é conferência de CADEIA, e vale dita.** A instrução herdada é
# *"o gerador nomeia `data-sd-part=\"meta\"`"*, e o literal não pode aparecer no
# MDX emitido: quem escreve o atributo é `src/components/Campo.js`, e a página
# escreve a TAG. Grepar a string no `.mdx` conferiria uma coisa que nenhum
# renderizador lê. O que sustenta a parte no contrato do catálogo é a cadeia —
# a página gerada consome o campo, e o campo nomeia a parte —, e são os dois
# elos que este portão casa.
#
# Procedência: docs/design/referencia.md §5 · docs/adr/0008.

set -uo pipefail

GERADOR='scripts/gerar-referencia.mjs'
FRAGMENTO='sidebars-referencia.js'
CAMPO='src/components/Campo.js'
PT='conteudo/ferramentas/bibliotecas/overpower/comandos'
EN='i18n/en/docusaurus-plugin-content-docs-ferramentas/current/bibliotecas/overpower/comandos'
CONTRATO_PT='contratos/overpower.pt-BR.json'
CONTRATOS="${CONTRATO_PT} contratos/overpower.en.json"

# O prefixo de id no fragmento. A família de ícone NÃO é mais uma só: desde a
# #118 cada folha gerada carrega a chave da própria entrada, lida de `icone` no
# contrato, e o que se cobra aqui passou de *todas iguais a esta* para *todas
# presentes e todas distintas*.
PREFIXO_DE_ID='bibliotecas/overpower/comandos'
GERADAS=4

# Os seis verbos, mais os três substantivos que só existem num contrato HTTP. A
# varredura de `src/` remove COMENTÁRIO antes de olhar, pelo mesmo motivo dos
# portões 1, 2 e 3: ela cobra código, e o comentário que explica *por que o verbo
# morreu* é a documentação da regra, não a violação dela.
VERBOS='\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|requestBody|openapi|VerbBadge'

falhas=0

reprova() {
  echo "  REPROVOU — $1"
  falhas=$((falhas + 1))
}

echo "Portão 5 — a referência gerada de contrato de assinatura"
echo

# --- 1. o par de contratos ----------------------------------------------------
echo "1  o par de contratos"
for contrato in $CONTRATOS; do
  if [ ! -f "$contrato" ]; then
    reprova "${contrato} não existe, e o gerador não tem de onde ler"
  elif ! node -e "JSON.parse(require('node:fs').readFileSync('${contrato}', 'utf8'))" 2>/dev/null; then
    reprova "${contrato} não é JSON legível — o parser inteiro é \`JSON.parse\`, e YAML cai aqui"
  fi
done
[ "$falhas" = 0 ] && echo "   dois arquivos monolíngues, JSON puro, zero dependência de parser"
echo

# --- 2. o gerador -------------------------------------------------------------
echo "2  o gerador"
if [ -f scripts/gerar-api.mjs ]; then
  reprova "scripts/gerar-api.mjs existe, e o nome mente: o contrato não é mais API HTTP"
fi
if [ ! -f "$GERADOR" ]; then
  reprova "${GERADOR} não existe — sem gerador, a saída é página escrita à mão"
fi
grep -q '"gerar:referencia"' package.json ||
  reprova "package.json não expõe \`gerar:referencia\`, e o gerador vira comando de memória"
echo "   ${GERADOR}, e \`gerar-api\` não sobrevive ao contrato que deixou de falar HTTP"
echo

# --- 3. a projeção ------------------------------------------------------------
#
# O ÚNICO portão que não é varredura de texto — junto com o 7, que é da mesma
# família. Um gerador determinístico rodado duas vezes sobre o mesmo contrato
# produz bytes idênticos; se não produzir, o contrato mudou sem o gerador rodar,
# ou alguém editou a saída à mão.
echo "3  a projeção — regenera e diffa"
if [ -f "$GERADOR" ]; then
  saida=$(node "$GERADOR" 2>&1)
  if [ $? -ne 0 ]; then
    reprova "o contrato foi RECUSADO pelo validador:"
    printf '%s\n' "$saida" | sed 's/^/    /'
  else
    # **O filtro por extensão é o que separa as duas posses dentro de uma pasta
    # só.** Desde o ADR 9 §d) o ramo gerado tem categoria própria, e a folha
    # autoral que a abre — `Comandos › Índice` — mora ao lado das quatro `.mdx`.
    # Sem o filtro, editar essa folha reprovaria aqui com a mensagem *a página foi
    # editada à mão*, que é verdade e não é defeito: ela é autoral, e editá-la à
    # mão é a única forma de mexer nela. `.mdx` é o sinal greppável de *gerado*, e
    # é o mesmo teste que o portão 4 usa para contar as duas posses em separado.
    sujo=$(git status --porcelain -- "$PT" "$EN" "$FRAGMENTO" |
      grep -E "\.mdx\$|${FRAGMENTO}\$") || true
    if [ -n "$sujo" ]; then
      reprova "regenerar mexeu na saída commitada — o contrato mudou sem o gerador rodar, ou a página foi editada à mão:"
      printf '%s\n' "$sujo" | sed 's/^/    /'
    else
      echo "   ${saida}"
      echo "   \`git status\` limpo nos três caminhos gerados"
    fi
  fi
fi
echo

# --- 4. a parte `meta`, e a cadeia que a segura -------------------------------
echo "4  a parte \`meta\` — a condição que a mantém publicada"
grep -q 'data-sd-part="meta"' "$CAMPO" ||
  reprova "${CAMPO} não nomeia \`data-sd-part=\"meta\"\`, e a parte perde o consumidor"

# O outro elo: as páginas que consomem o campo. O número esperado sai do próprio
# CONTRATO, e não de uma constante nem de uma lista de exceção a manter.
#
# **A pergunta deixou de ser a espécie e passou a ser o conteúdo.** Enquanto o
# contrato era de biblioteca, a exclusão se escrevia `especie !== 'modulo'`,
# porque o módulo era a única espécie que por definição não tinha campo. Com
# `aplicacao` e `comando` isso deixa de valer pela espécie: um comando sem opção e
# sem código de saída próprio é legítimo, e é o contrato que diz qual é qual. A
# régua passa a perguntar o que a entrada tem, que é o que decide se a página sai
# com campo.
#
# **Os DOIS locales são cobrados.** A versão anterior desta cobrança olhava só o
# pt-BR, e o elo do EN ficava sem casamento — uma tradução que perdesse o campo
# despublicaria a parte em metade do site sem reprovar nada.
esperado=$(node -e "
  const c = JSON.parse(require('node:fs').readFileSync('${CONTRATO_PT}', 'utf8'));
  const temCampo = (e) => (e.parametros ?? []).length > 0 || e.retorno !== null;
  console.log(c.entradas.filter(temCampo).length);
")
for par in "${PT}=pt-BR" "${EN}=en"; do
  raiz="${par%%=*}"
  locale="${par##*=}"
  com_campo=$(grep -Rl '<ParamField\|<ResponseField' "$raiz" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$com_campo" != "$esperado" ]; then
    reprova "${locale}: ${com_campo} páginas geradas consomem o campo, e o contrato tem ${esperado} entradas que não são módulo"
    grep -RL '<ParamField\|<ResponseField' "$raiz" 2>/dev/null | sed 's/^/    /'
  fi
done
[ "$falhas" = 0 ] &&
  echo "   o campo nomeia a parte, e as ${esperado} entradas com opção ou código de saída o consomem nos dois locales"
echo

# --- 5. zero verbo HTTP -------------------------------------------------------
echo "5  zero verbo HTTP"
# Os dois removedores preservam `arquivo:linha:código`, que é exatamente o que
# uma varredura espera de um `grep -rn` — o mesmo contrato que os portões 1 e 2
# consomem.
verbos_src=$(
  {
    find src -name '*.css' -exec awk -f scripts/css-sem-comentario.awk {} +
    find src \( -name '*.js' -o -name '*.mjs' \) -exec awk -f scripts/js-sem-comentario.awk {} +
  } | grep -E "$VERBOS"
) || true
if [ -n "$verbos_src" ]; then
  reprova "verbo HTTP no código de src/ (comentário já removido):"
  printf '%s\n' "$verbos_src" | sed 's/^/    /'
fi

verbos_contrato=$(grep -nE "$VERBOS" $CONTRATOS) || true
if [ -n "$verbos_contrato" ]; then
  reprova "verbo HTTP no contrato, que descreve assinatura de função:"
  printf '%s\n' "$verbos_contrato" | sed 's/^/    /'
fi
[ -z "$verbos_src" ] && [ -z "$verbos_contrato" ] &&
  echo "   nenhum dos seis verbos, nem \`requestBody\`, \`openapi\` ou \`VerbBadge\`"
echo

# --- 6. a contagem do ramo ----------------------------------------------------
echo "6  a contagem do ramo gerado"
for par in "${PT}=pt-BR" "${EN}=en"; do
  raiz="${par%%=*}"
  locale="${par##*=}"
  n=$(find "$raiz" -name '*.mdx' 2>/dev/null | wc -l | tr -d ' ')
  [ "$n" = "$GERADAS" ] || reprova "${locale}: ${n} páginas geradas, esperado ${GERADAS}"
  # **A régua é a EXTENSÃO, e não o nome do arquivo.** A pasta hospeda as duas
  # posses desde o ADR 9 §d): `.mdx` é do gerador, `.md` é autoral — e a folha que
  # abre a categoria, dona da fixture `painel-direito-vazio`, é a autoral de hoje.
  # A versão anterior desta linha nomeava `indice.md`, o que fazia a cobrança
  # depender do nome que a folha por acaso tem; contar autoral é trabalho do
  # portão 4, e aqui o que se cobra é que nada além das duas extensões apareça.
  soltos=$(find "$raiz" -type f -not -name '*.mdx' -not -name '*.md' 2>/dev/null) || true
  [ -z "$soltos" ] || {
    reprova "${locale}: arquivo que não é \`.mdx\` dentro do ramo gerado:"
    printf '%s\n' "$soltos" | sed 's/^/    /'
  }
done

# Issue #97: o fragmento passou de lista de strings para lista de itens de
# folha (`{type: 'doc', id: '...', className: '...'}`), porque toda folha da
# sidebar ganhou ícone. A contagem casa o `id:`, não mais a string crua.
ids=$(grep -c "^  {type: 'doc', id: '${PREFIXO_DE_ID}/" "$FRAGMENTO" 2>/dev/null || echo 0)
[ "$ids" = "$GERADAS" ] || reprova "${FRAGMENTO} declara ${ids} ids, esperado ${GERADAS}"

# Toda folha tem ícone, e desde a #118 nenhuma repete a da vizinha. As duas
# metades são cobradas separadas porque falham por motivos diferentes: a
# primeira pega a folha que saiu sem `className`, a segunda pega o `icone`
# copiado de uma entrada para outra no contrato — que passaria calado, porque o
# portão regenera e diffa a saída contra ela mesma.
classes=$(grep -c "^  {type: 'doc', id: '${PREFIXO_DE_ID}/.*className: 'sidebar-icone sidebar-icone--[a-z-]*'}," "$FRAGMENTO" 2>/dev/null || echo 0)
[ "$classes" = "$GERADAS" ] || reprova "${FRAGMENTO}: ${classes} ids carregam chave de ícone, esperado ${GERADAS} — toda folha tem ícone"

distintas=$(grep -o "sidebar-icone--[a-z-]*'}," "$FRAGMENTO" | sort -u | wc -l | tr -d ' ')
[ "$distintas" = "$GERADAS" ] ||
  reprova "${FRAGMENTO}: ${distintas} chaves de ícone distintas em ${GERADAS} folhas — cada página gerada tem a sua, e o campo \`icone\` do contrato é onde ela mora"

grep -q "^import referencia from './${FRAGMENTO}';" sidebars-ferramentas.js ||
  reprova "sidebars-ferramentas.js não importa o fragmento, e o ramo gerado fica fora da árvore"

echo "   ${GERADAS} páginas por locale, ${GERADAS} ids no fragmento, e a sidebar da aba o importa"
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 5 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/referencia.md — edite o CONTRATO e rode \`npm run gerar:referencia\`, nunca o \`.mdx\`."
  exit 1
fi

echo "Portão 5 passou — a projeção é a do contrato, byte a byte."
