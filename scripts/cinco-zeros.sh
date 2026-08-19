#!/usr/bin/env bash
#
# Os cinco zeros — conferidos por varredura, não afirmados.
#
# Cadência: commit. Não é portão: cada um dos cinco já tem, ou um portão que o
# cobre por outro ângulo, ou um build que quebraria. O que este script compra é
# que os cinco sejam **uma afirmação verificável num lugar só** — é o parágrafo
# mais citado do README da spec, e um parágrafo citado que ninguém confere é
# como uma spec passa a mentir.
#
#   1  zero swizzle `unsafe`
#   2  zero dependência npm nova
#   3  zero serviço externo
#   4  zero JS de interação no catálogo
#   5  um único JS de interação no projeto inteiro
#
# Uso: scripts/cinco-zeros.sh
#
# Procedência: docs/design/README.md §7.

set -uo pipefail

falhas=0

# As sete de produção e as duas de desenvolvimento que o `create-docusaurus`
# classic escreve, e nada mais. **Esta lista É a definição de "zero dependência
# nova"** — o axioma 2 não diz *poucas*, diz *nenhuma além do preset*.
DEPS_ESPERADAS='@docusaurus/core @docusaurus/preset-classic @mdx-js/react clsx prism-react-renderer react react-dom'
DEV_ESPERADAS='@docusaurus/module-type-aliases @docusaurus/types'

# DUAS réguas, e a diferença entre elas é a decisão inteira dos zeros 4 e 5.
#
# `COMPORTAMENTO` é ampla: handler, escuta de DOM, estado. É o que o CATÁLOGO
# não pode ter — lá a regra é o substrato nativo, e um componente de conteúdo
# que guarda estado já saiu do que o elemento do navegador entrega.
#
# `MODELO_DE_INTERACAO` é estreita, e é a que conta para o projeto inteiro:
# **escuta de DOM e tecla.** Ela vem verbatim do vocabulário de domínio — *"zero
# `keydown` escrito no projeto"* —, e a razão de ser essa e não a ampla está no
# axioma 6: o que obriga a spec a descrever tecla, foco, anúncio de leitor de
# tela e ARIA em prosa é AUTORAR modelo de interação. Um campo controlado não
# obriga nada disso: quem trata a digitação, o foco e o cursor é o navegador, e
# o React só espelha o valor.
COMPORTAMENTO='addEventListener|onClick|onKeyDown|onKeyUp|onKeyPress|onMouseDown|onInput|onChange|onSubmit|useState|useEffect'
MODELO_DE_INTERACAO='addEventListener|onKeyDown|onKeyUp|onKeyPress'

# A varredura cobra CÓDIGO, não prosa. Sem isto, o comentário de `Accordion.js`
# que explica *"um `<div onClick>` seria pixel a pixel idêntico"* reprovaria o
# zero que ele documenta. Mesmo mecanismo dos portões 1, 2 e 3.
codigo() { find "$@" -name '*.js' -o -name '*.jsx' -o -name '*.mjs' | sort | xargs awk -f scripts/js-sem-comentario.awk; }

echo "Os cinco zeros"
echo

# --- 1 ------------------------------------------------------------------------
# O portão 7 já percorre `src/theme/` e casa cada arquivo com o `swizzle --list`
# congelado. Repetir a lógica aqui criaria uma segunda versão dela.
echo "1  zero swizzle \`unsafe\`"
if node scripts/swizzle-list.mjs --verificar > /dev/null 2>&1; then
  echo "   portão 7 confirma: todo arquivo de src/theme/ casa com componente \`Safe\`."
else
  echo "   REPROVOU — rode \`npm run portao:7\` para o detalhe."
  falhas=$((falhas + 1))
fi
echo

# --- 2 ------------------------------------------------------------------------
echo "2  zero dependência npm nova"
deps="$(node -p "Object.keys(require('./package.json').dependencies).sort().join(' ')")"
dev="$(node -p "Object.keys(require('./package.json').devDependencies).sort().join(' ')")"
esperadas="$(printf '%s\n' $DEPS_ESPERADAS | sort | tr '\n' ' ' | sed 's/ $//')"
dev_esperadas="$(printf '%s\n' $DEV_ESPERADAS | sort | tr '\n' ' ' | sed 's/ $//')"
if [ "$deps" = "$esperadas" ] && [ "$dev" = "$dev_esperadas" ]; then
  echo "   7 de produção e 2 de desenvolvimento — exatamente o que o preset classic escreve."
else
  echo "   REPROVOU — package.json divergiu do preset:"
  echo "     dependencies esperadas: $esperadas"
  echo "     dependencies em uso:    $deps"
  echo "     devDependencies esperadas: $dev_esperadas"
  echo "     devDependencies em uso:    $dev"
  falhas=$((falhas + 1))
fi
echo

# --- 3 ------------------------------------------------------------------------
# Duas pernas: nada no nosso código busca na rede, e nada no HTML publicado
# aponta para outra origem. A segunda é a que pegaria uma fonte de terceiro ou
# um script de analytics entrando de carona por config.
echo "3  zero serviço externo"
rede="$(codigo src | grep -E 'fetch\(|XMLHttpRequest|new WebSocket|EventSource\(' || true)"

# A LISTA FECHADA de chamadas de rede à PRÓPRIA origem, e ela é a definição
# operante de "externo" nesta perna — o mesmo idioma de `DEPS_ESPERADAS` acima.
#
# A régua era *"nada em `src/` chama a rede"*, e ela pegava demais: o zero se
# chama zero serviço EXTERNO, e a segunda perna, dez linhas abaixo, já sabe
# distinguir a nossa origem da de terceiro — ela exclui `panlabs-tech.github.io`
# da varredura de recurso carregado. Buscar uma rota do próprio site não
# acrescenta serviço nenhum: se o site está no ar, a rota está no ar, no mesmo
# deploy e no mesmo host.
#
# Uma linha só mora aqui hoje, e ela carrega o alvo escrito. Chamada de rede
# nova reprova até alguém declará-la — que é o que uma lista fechada compra
# sobre uma exceção genérica.
REDE_PROPRIA='src/theme/MDXComponents/CopiarPagina.js'  # `permalink + .md`, a rota que o plugin ai-era publica
externa="$(printf '%s' "$rede" | grep -vE "^(${REDE_PROPRIA})" || true)"
comEsquema="$(printf '%s' "$rede" | grep -E 'fetch\(\s*.?(https?:)?//' || true)"

if [ -n "$externa" ] || [ -n "$comEsquema" ]; then
  echo "   REPROVOU — chamada de rede fora da lista da própria origem:"
  printf '%s\n%s\n' "$externa" "$comEsquema" | grep -v '^$' | sort -u | sed 's/^/     /'
  falhas=$((falhas + 1))
elif [ ! -d build ]; then
  echo "   src/ limpo. O HTML publicado NÃO foi conferido — rode \`npm run build\` antes."
else
  externos="$(grep -rhoE '(src|href)="https?://[^"]+"' build --include='*.html' \
    | grep -vE '"https?://(panlabs-tech\.github\.io|schema\.org|www\.w3\.org)' \
    | sed -E 's/^(src|href)="//; s/"$//' \
    | sed -E 's|(https?://[^/]+).*|\1|' | sort -u)"
  # Sobram os links de conteúdo — o GitHub do rodapé, o status fictício. Link é
  # navegação do leitor, não requisição da página. O que importa é `src` e
  # `href` de folha de estilo, e é isso que a segunda varredura isola.
  carregados="$(grep -rhoE '<(script|link)[^>]+(src|href)="https?://[^"]+"' build --include='*.html' \
    | grep -vE 'panlabs-tech\.github\.io' || true)"
  if [ -n "$carregados" ]; then
    echo "   REPROVOU — o HTML publicado carrega recurso de outra origem:"
    echo "$carregados" | sed 's/^/     /'
    falhas=$((falhas + 1))
  else
    echo "   nenhuma chamada de rede a outra origem; o HTML publicado não carrega nada de fora."
    # A nuance vai IMPRESSA, como no zero 5: uma afirmação limpa que esconde um
    # fato é pior que uma afirmação com nota de rodapé.
    if [ -n "$rede" ]; then
      echo "   à própria origem, declarada:"
      printf '%s\n' "$rede" | sed 's/^/     · /'
    fi
    echo "   (origens citadas em link de navegação, que o leitor clica: $(printf '%s' "$externos" | tr '\n' ' '))"
  fi
fi
echo

# --- 4 ------------------------------------------------------------------------
# O substrato nativo: ou o elemento do navegador entrega o comportamento
# (`<details>`, `<a>`, `<table>`), ou o Docusaurus entrega (`Tabs`). Nenhum dos
# dezessete escreve o seu.
echo "4  zero JS de interação no catálogo"
catalogo="$(codigo src/components | grep -E "$COMPORTAMENTO" || true)"
if [ -z "$catalogo" ]; then
  n="$(find src/components -name '*.js' | wc -l | tr -d ' ')"
  echo "   ${n} arquivos em src/components/, zero handler e zero estado."
else
  echo "   REPROVOU — comportamento interativo no catálogo:"
  echo "$catalogo" | sed 's/^/     /'
  falhas=$((falhas + 1))
fi
echo

# --- 5 ------------------------------------------------------------------------
echo "5  um único autor de modelo de interação no projeto inteiro"
donos="$(codigo src | grep -E "$MODELO_DE_INTERACAO" | cut -d: -f1 | sort -u)"
n_donos="$(printf '%s' "$donos" | grep -c . || true)"
if [ "$n_donos" = "1" ] && [ "$donos" = 'src/theme/SearchBar/index.js' ]; then
  echo "   um: src/theme/SearchBar/index.js — e ele mora no chrome."
  # A nuance vai IMPRESSA, não escondida. `ApiDocItem/Painel.js` guarda estado e
  # ouve `onChange` — é o degrau de interatividade que `referencia.md` §4.1 já
  # declara. Ele não autora modelo: não escuta tecla, não move foco, não escreve
  # ARIA. Deixá-lo fora da contagem sem dizer que ele existe seria o tipo de
  # afirmação limpa que esconde um fato.
  outras="$(codigo src | grep -E "$COMPORTAMENTO" | cut -d: -f1 | sort -u | grep -v 'src/theme/SearchBar/index.js' || true)"
  if [ -n "$outras" ]; then
    echo "   com estado ou campo controlado, sem autorar modelo:"
    printf '%s\n' "$outras" | sed 's/^/     · /'
  fi
else
  echo "   REPROVOU — esperado exatamente src/theme/SearchBar/index.js, encontrado ${n_donos}:"
  printf '%s\n' "$donos" | sed 's/^/     /'
  falhas=$((falhas + 1))
fi
echo

if [ "$falhas" -gt 0 ]; then
  echo "Os cinco zeros REPROVARAM em ${falhas}."
  exit 1
fi
echo "Os cinco zeros conferidos."
