#!/usr/bin/env bash
#
# Portão 4 — o volume, o tipo de página, os dois gabaritos de `Jornadas`, a
# regra de heading, as fixtures, a cobertura de locale e o travessão.
#
# Cadência: commit.
#
# Este portão existe porque os critérios da arquitetura de informação são todos
# CONTAGENS, e contagem escrita em documento é contagem que envelhece calada.
# Uma página a mais em `Esteiras` não quebra build nenhum; um `Guia` sem
# `<Steps>` tampouco. Os dois só fazem a spec passar a mentir. Aqui eles
# reprovam.
#
# **Ele foi reescrito inteiro com a árvore do `panlabs`**, e o que ele ganhou é
# uma classe de cobrança que a versão do Trilho não tinha: **proibição por
# localização**. Até aqui um gabarito EXIGIA e LIMITAVA; nenhum dizia *"aqui não
# entra"*. `<Steps>` fora de toda `Jornadas` e `<CardGroup>` fora dos dois
# índices são teto de zero, e existem onde a alternativa era confiar em bom
# senso.
#
# São quatorze cobranças: as **doze** que a árvore nova trouxe; a cobertura de
# locale, que é a única sobrevivente da versão anterior deste portão — ela não é
# acréscimo, é a linha que não foi jogada fora com o resto; e a varredura de
# travessão, a única que olha o caractere em vez da estrutura.
#
#    1. o volume por aba e por categoria     12 · 16 · 17, e 45 no total
#    2. o tipo de cada página                 e o orçamento ESTRUTURAL dele
#    3. a regra de heading                    com UMA exceção nomeada
#    4. `<Steps>` ausente em `Jornadas`       a fronteira entre duas abas
#    5. o índice de jornada                   `<CardGroup>` fora, dois headings
#                                             literais dentro
#    6. prosa antes do primeiro `##`          em todo capítulo
#    7. a lista ordenada de `## Como foi`     N itens para N capítulos
#    8. o estado                              exatamente uma palavra na abertura
#    9. o marcador de tradução                31 páginas, e nenhuma tradução
#   10. `description`                         em 100% das páginas
#   11. as onze fixtures                      por caminho nomeado
#   12. os dez tipos têm instância            e nenhum fica pendente
#   13. a cobertura de locale                 17 em EN, e só `Ferramentas`
#   14. o travessão                           zero nas três superfícies
#
# **A pendência do décimo tipo fechou, e o portão a cobra pelo avesso.** Até o
# ramo gerado chegar, `Referência de API` era o único tipo sem instância, e a
# ausência era DECLARADA aqui — declarar a pendência é o que impede uma lista de
# dez de virar lista de nove sem ninguém notar. Agora ele tem seis, e o que este
# portão passa a cobrar é o contrário: que as seis existam, e que continuem sendo
# `.mdx` gerado em vez de `.md` escrito à mão. O portão 5 é quem confere que elas
# são a projeção do contrato; aqui elas são CONTAGEM, que é o assunto deste.
#
# **O tipo mora AQUI, e não no conteúdo.** `informacao.md` §6 trava que tipo de
# página é convenção de conteúdo e ZERO layout — sem front matter `type:`, sem
# classe CSS por tipo. Um manifesto de build não é nenhum dos dois: ele não
# toca a página nem o CSS, e some do artefato publicado.
#
# **A exceção de heading é uma só, e é nomeada.** `ambiente/indice` carrega ZERO
# `##` de propósito: é a fixture que prova que a coluna fica no mesmo pixel sem
# coluna de TOC. Os tetos que saem de GABARITO — `Receita` em no máximo um, o
# índice de jornada em exatamente dois — não são exceção: são o orçamento do
# tipo. Exceção é a página que rompe a própria forma, e ela é uma.
#
# **A coluna de palavras do §6.2 NÃO é cobrada, e isso é decisão.** O que
# estressa layout é contagem de estrutura; palavra é proxy ruim, e as páginas
# cujo corpo é código ficam abaixo da faixa porque o código é o conteúdo.
#
# Contagem de `##` e de componente ignora bloco cercado — senão um comentário
# `##` ou um `<Steps>` citado dentro de um trecho de código contariam.
#
# Procedência: docs/design/informacao.md §4, §6, §7 e §8.

set -uo pipefail

CONTEUDO='conteudo'
JORNADAS='conteudo/jornadas'
PROCEDIMENTOS='conteudo/procedimentos'
FERRAMENTAS='conteudo/ferramentas'
EN='i18n/en/docusaurus-plugin-content-docs-ferramentas/current'

# As três superfícies do conteúdo publicado, para a varredura de travessão. `EN`
# não serve aqui: ele aponta uma aba, e a régua é sobre tudo o que sai no site.
I18N='i18n'
CONTRATOS='contratos'

# O ramo gerado, nos dois locales. Ele é contado à parte de toda contagem de
# autoral: `.mdx` é o sinal greppável de *gerado, não editar*, e ele é o que
# separa as duas posses sem uma lista de exceção a manter.
GERADO_PT='conteudo/ferramentas/bibliotecas/biblioteca-c/referencia'
GERADO_EN="${EN}/bibliotecas/biblioteca-c/referencia"
GERADAS=6

# A única página que pode ficar abaixo do piso de heading sem que um gabarito o
# autorize. Ver informacao.md §4.1.
EXCECAO_DE_HEADING='procedimentos/ambiente/indice'

falhas=0

reprova() {
  echo "  REPROVOU — $1"
  falhas=$((falhas + 1))
}

# `chave=valor` separados por espaço, lidos com `${par%%=*}` / `${par##*=}` —
# o repo não tem bash 4 garantido, então nada de array associativo.
#
# **Estas contagens são de AUTORAL**, e são 11 para `Ferramentas`: a função conta
# `.md`, e o ramo gerado é `.mdx`. A soma das duas — 17 folhas na aba e 45 no
# site — é cobrada logo abaixo, com o número gerado somado por fora.
VOLUME_JORNADAS='api-owner=7 security-champion=5'
VOLUME_PROCEDIMENTOS='ambiente=3 esteiras=3 infraestrutura=3 acessos=3 diagnostico=4'
VOLUME_FERRAMENTAS='bibliotecas=6 modulos-terraform=2 skills=2 servidores-mcp=1'

# O manifesto de tipo — `caminho:tipo`, um por linha, para as 39 autorais.
#
# **A forma `indice` MORREU com a issue #114**, e com ela sete páginas: o
# conteúdo delas era *a lista do que está logo abaixo*, e a sidebar já é essa
# lista (ADR 10 §c). Nenhuma linha `:indice` sobrou aqui, e é por isso que o
# `indice` não aparece — não é omissão, é a forma que deixou de existir.
#
# `fixture-curta` é a forma que ficou, e ela não é tipo (§6.3): é o gabarito de
# `Ambiente › Índice`, que sobreviveu como FOLHA por carregar a fixture
# `pagina-muito-curta` e a única exceção nomeada da regra de heading.
# `capitulo` é o gabarito da folha de `Jornadas`, e também não é tipo — os dez
# tipos são os da tabela do §6.1, e `indice-de-jornada` é o décimo.
TIPOS=$(cat <<'FIM'
jornadas/api-owner/indice:indice-de-jornada
jornadas/api-owner/o-contrato-que-nao-existia:capitulo
jornadas/api-owner/o-que-o-contrato-nao-cobre:capitulo
jornadas/api-owner/a-politica-de-versao:capitulo
jornadas/api-owner/o-schema-que-mudou-sem-aviso:capitulo
jornadas/api-owner/depreciar-em-seis-meses:capitulo
jornadas/api-owner/o-consumidor-invisivel:capitulo
jornadas/security-champion/indice:indice-de-jornada
jornadas/security-champion/a-varredura-que-reprovava-tudo:capitulo
jornadas/security-champion/o-segredo-no-commit:capitulo
jornadas/security-champion/a-excecao-que-virou-regra:capitulo
jornadas/security-champion/o-inventario-de-imagens:capitulo
procedimentos/ambiente/indice:fixture-curta
procedimentos/ambiente/comparativo-dev-staging-prod:catalogo
procedimentos/ambiente/preparar-a-maquina-local:guia
procedimentos/esteiras/verificar-a-assinatura-hmac:guia
procedimentos/esteiras/publicar-um-pacote-interno:guia
procedimentos/esteiras/rodar-a-esteira-localmente:guia
procedimentos/infraestrutura/o-output-de-um-modulo:conceitual
procedimentos/infraestrutura/criar-um-bucket-versionado:guia
procedimentos/infraestrutura/promover-um-modulo:guia
procedimentos/acessos/permissoes-por-papel:catalogo
procedimentos/acessos/assumir-um-papel-na-aws:guia
procedimentos/acessos/rotacionar-uma-chave:guia
procedimentos/diagnostico/indice-de-sintomas:troubleshooting
procedimentos/diagnostico/monitoramento-e-alertas:conceitual
procedimentos/diagnostico/o-mesmo-erro-em-tres-formas:troubleshooting
procedimentos/diagnostico/o-diff-que-resolveu:troubleshooting
ferramentas/bibliotecas/biblioteca-a:sdk
ferramentas/bibliotecas/biblioteca-b:sdk
ferramentas/bibliotecas/biblioteca-c/visao-geral:quickstart
ferramentas/bibliotecas/biblioteca-c/instalacao-e-configuracao:guia
ferramentas/bibliotecas/biblioteca-c/tratamento-de-erros:conceitual
ferramentas/bibliotecas/biblioteca-c/changelog:changelog
ferramentas/modulos-terraform/modulo-de-bucket:guia
ferramentas/modulos-terraform/modulo-de-papel-iam:guia
ferramentas/skills/scaffold-de-esteira:receita
ferramentas/skills/rotacao-de-segredo:receita
ferramentas/servidores-mcp/servidor-de-catalogo-mcp:sdk
FIM
)

# Os dez tipos, e onde cada um tem instância. **Nenhum fica pendente.** O
# décimo, `referencia-de-api`, é o único que não aparece no manifesto acima: o
# gabarito dele é *a saída do gerador*, e a instância dele é contada do disco —
# declará-lo no manifesto seria escrever à mão o que o contrato decide.
DEZ_TIPOS='quickstart conceitual guia sdk referencia-de-api receita catalogo troubleshooting changelog indice-de-jornada'
TIPO_GERADO='referencia-de-api'

# As onze fixtures, por caminho nomeado. Cada caso difícil tem exatamente uma
# página dona — a spec aponta para o artefato em vez de descrever a hipótese, e
# quem implementa sabe onde olhar para saber se acertou.
#
# `fallback-de-locale` é a única que se prova por AUSÊNCIA: a página existe em
# pt-BR e NÃO tem contraparte em EN, que é o estado que ela exercita.
FIXTURES=$(cat <<'FIM'
tabela-larga:procedimentos/acessos/permissoes-por-papel
tabela-como-pagina-inteira:procedimentos/ambiente/comparativo-dev-staging-prod
bloco-de-codigo-longo:procedimentos/esteiras/verificar-a-assinatura-hmac
pagina-muito-curta:procedimentos/ambiente/indice
prosa-pura:jornadas/security-champion/indice
item-de-sidebar-mais-largo:jornadas/security-champion/a-varredura-que-reprovava-tudo
prosa-minima-codigo-maximo:ferramentas/skills/scaffold-de-esteira
fallback-de-locale:jornadas/api-owner/a-politica-de-versao
aninhamento-profundo:procedimentos/infraestrutura/o-output-de-um-modulo
pagina-muito-longa:jornadas/api-owner/o-contrato-que-nao-existia
painel-direito-vazio:ferramentas/bibliotecas/biblioteca-c/instalacao-e-configuracao
FIM
)

# Os QUATRO casos que o domínio novo trouxe e que NÃO são fixture — eles não
# substituem nenhum caso antigo e não nasceram de um teto de layout; são
# cobertura de conteúdo com dona nomeada. Ficam cobrados pelo mesmo mecanismo
# para não virarem promessa em prosa.
#
# `irmao-curto` é o quarto, e ele mora aqui e não em FIXTURES: o lado longo do
# par prova *página muito longa* sozinho — TOC longo, `sticky`, scroll-spy —, e o
# que o par prova junto é *comprimento desigual entre irmãos*, que é caso do
# domínio. Contá-lo como fixture faria a lista fechar em doze, e são onze.
CASOS_DO_DOMINIO=$(cat <<'FIM'
saida-literal-de-terminal:jornadas/api-owner/o-schema-que-mudou-sem-aviso
varias-linguagens-na-mesma-pagina:procedimentos/diagnostico/o-mesmo-erro-em-tres-formas
diff:procedimentos/diagnostico/o-diff-que-resolveu
irmao-curto:jornadas/api-owner/o-que-o-contrato-nao-cobre
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

# O volume de uma aba, categoria a categoria, mais o total.
#
# O resultado sai em `$volume`, e não por `echo` dentro de `$( )`: a substituição
# de comando roda em subshell, e ali `falhas` incrementaria numa cópia que morre
# no fecha-parêntese. Um portão que conta errado as próprias reprovações é pior
# que um portão ausente.
volume=0
volume_da_aba() {
  local raiz="$1" esperado_total="$2" nome="$3" pares="$4"
  local par categoria esperado achado
  volume=0
  for par in $pares; do
    categoria="${par%%=*}"
    esperado="${par##*=}"
    achado=$(find "${raiz}/${categoria}" -name '*.md' 2>/dev/null | wc -l)
    volume=$((volume + achado))
    [ "$achado" = "$esperado" ] ||
      reprova "${nome}/${categoria}: ${achado} páginas, esperado ${esperado}"
  done
  [ "$volume" = "$esperado_total" ] ||
    reprova "${nome}: ${volume} páginas, esperado ${esperado_total}"
}

echo "Portão 4 — conteúdo"
echo

# --- 1. o volume --------------------------------------------------------------
echo "1  volume por aba e por categoria"

volume_da_aba "$JORNADAS" 12 'Jornadas' "$VOLUME_JORNADAS"; total_jornadas=$volume
volume_da_aba "$PROCEDIMENTOS" 16 'Procedimentos' "$VOLUME_PROCEDIMENTOS"; total_procedimentos=$volume
volume_da_aba "$FERRAMENTAS" 11 'Ferramentas' "$VOLUME_FERRAMENTAS"; total_ferramentas=$volume

autorais=$((total_jornadas + total_procedimentos + total_ferramentas))
[ "$autorais" = 39 ] || reprova "o acervo tem ${autorais} páginas autorais, esperado 39"

# O ramo gerado, somado por fora. Ele fecha `Bibliotecas` em 12, `Ferramentas`
# em 17 e o site em 45 — os três números que a spec publica.
geradas=$(find "$GERADO_PT" -name '*.mdx' 2>/dev/null | wc -l)
[ "$geradas" = "$GERADAS" ] ||
  reprova "o ramo gerado tem ${geradas} páginas, esperado ${GERADAS}"

bibliotecas=$(( $(find "${FERRAMENTAS}/bibliotecas" -name '*.md' | wc -l) + geradas ))
[ "$bibliotecas" = 12 ] || reprova "Ferramentas/bibliotecas: ${bibliotecas} páginas, esperado 12"

folhas_ferramentas=$((total_ferramentas + geradas))
[ "$folhas_ferramentas" = 17 ] || reprova "Ferramentas: ${folhas_ferramentas} folhas, esperado 17"

total=$((autorais + geradas))
[ "$total" = 45 ] || reprova "o site tem ${total} páginas, esperado 45"

echo "   Jornadas ${total_jornadas} · Procedimentos ${total_procedimentos} · Ferramentas ${folhas_ferramentas} = ${total}"
echo "   (${autorais} autorais mais ${geradas} geradas; Bibliotecas fecha em ${bibliotecas})"
echo

# --- 2. o tipo, e o orçamento estrutural dele ---------------------------------
echo "2  tipo de página e orçamento estrutural"

declaradas=$(printf '%s\n' "$TIPOS" | wc -l)
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
  #
  # **A cerca INDENTADA conta**, e essa é uma correção de fato contra a versão
  # anterior deste portão: ela casava `^```` e a função `contar` casa
  # `^[[:space:]]*````, então uma cerca dentro de `<Steps>` abria e fechava o
  # estado *dentro de bloco* sem nunca ser contada como bloco. O desacordo era
  # inofensivo enquanto o `<Steps>` carregava pouco código; na árvore nova ele
  # carrega quase todo o código dos guias, e a contagem saía pela metade.
  #
  # Indentar cerca dentro de JSX é seguro: o MDX **desliga** o bloco de código
  # por indentação, que é exatamente o que permite indentar Markdown dentro de
  # um componente.
  blocos=$(( $(grep -c '^[[:space:]]*```' "$arquivo") / 2 ))

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
    # O gabarito do capítulo: 2 blocos e 1 `:::`. A espinha de 3 a 6 `##` e a
    # prosa antes do primeiro heading são cobradas nas seções 3 e 6.
    capitulo)       exigir 'blocos' "$blocos" 2; exigir 'callouts' "$callouts" 1 ;;
    # O décimo tipo. As duas seções obrigatórias são cobradas na seção 5, e a
    # ausência de componente é o que faz dele a página mais nua do site.
    indice-de-jornada) : ;;
    indice)         : ;; # forma, não tipo — o piso do tipo da seção, mais o índice
    fixture-curta)  : ;; # a exceção de heading, cobrada na seção 3
    *)              reprova "${relativo}: tipo desconhecido '${tipo}'" ;;
  esac
done <<< "$TIPOS"

echo "   ${declaradas} páginas com tipo declarado, cada uma no orçamento estrutural dele"
echo

# --- 3. a regra de heading ----------------------------------------------------
#
# O piso é três `##` em toda página. Dois gabaritos abrem teto próprio, e nenhum
# dos dois é exceção: `Receita` fica em no máximo um, e o índice de jornada em
# exatamente dois, que são os dois literais da seção 5. A exceção NOMEADA é uma
# só — a página que rompe a própria forma.
echo "3  regra de heading"
sem_toc=0
com_toc=0

while IFS=: read -r relativo tipo; do
  arquivo="${CONTEUDO}/${relativo}.md"
  [ -f "$arquivo" ] || continue
  h2=$(contar "$arquivo" '^## ')

  if [ "$relativo" = "$EXCECAO_DE_HEADING" ]; then
    [ "$h2" = 0 ] || reprova "${relativo}: ${h2} \`##\`, e a fixture exige ZERO"
  elif [ "$tipo" = 'receita' ]; then
    [ "$h2" -le 1 ] 2>/dev/null ||
      reprova "${relativo}: ${h2} \`##\`, máximo 1 em Receita"
  elif [ "$tipo" = 'indice-de-jornada' ]; then
    [ "$h2" = 2 ] ||
      reprova "${relativo}: ${h2} \`##\`, e o índice de jornada tem exatamente 2"
  elif [ "$tipo" = 'capitulo' ]; then
    { [ "$h2" -ge 3 ] && [ "$h2" -le 6 ]; } 2>/dev/null ||
      reprova "${relativo}: ${h2} \`##\`, e a espinha do capítulo é de 3 a 6"
  else
    [ "$h2" -ge 3 ] 2>/dev/null ||
      reprova "${relativo}: ${h2} \`##\`, mínimo 3"
  fi

  if [ "$h2" = 0 ]; then sem_toc=$((sem_toc + 1)); else com_toc=$((com_toc + 1)); fi
done <<< "$TIPOS"

echo "   ${sem_toc} sem coluna de TOC · ${com_toc} com"

# **A exceção nomeada já foi cobrada acima**, página a página: fora de um
# gabarito, só `EXCECAO_DE_HEADING` pode ficar abaixo do piso. Contar aqui
# quantas páginas ficam sem TOC seria cobrar outra coisa — a `Receita` fica em
# zero pelo orçamento dela, e orçamento não é exceção.
#
# O que esta contagem cobra é que as DUAS configurações de coluna que este
# acervo produz existam no artefato.
#
# **A terceira NÃO chegou com o ramo gerado, e a linha anterior errava ao
# prometê-la.** Ela dizia que `hide_table_of_contents` viria com as páginas
# geradas; ele não vem, e não vir é decisão escrita: o campo seria segunda fonte
# de verdade para algo que o `ApiDocItem` já decide sozinho — ele simplesmente
# nunca renderiza `@theme/TOC` na perna do painel. As geradas ficam sem TOC por
# COMPONENTE, não por front matter, e é a varredura logo abaixo — deste portão,
# não do 5 — que cobra que nenhuma delas declare o campo.
[ "$sem_toc" -ge 1 ] || reprova "nenhuma página sem coluna de TOC"
[ "$com_toc" -ge 1 ] || reprova "nenhuma página monta coluna de TOC"

geradas_com_campo=$(grep -Rl '^hide_table_of_contents:' "$GERADO_PT" "$GERADO_EN" 2>/dev/null) || true
if [ -n "$geradas_com_campo" ]; then
  reprova "página gerada declarando \`hide_table_of_contents\` — o componente já decide:"
  echo "$geradas_com_campo" | sed 's/^/    /'
fi
echo

# --- 4. `<Steps>` fora de `Jornadas` ------------------------------------------
#
# A fronteira entre duas abas, escrita como regra conferível: `Procedimentos`
# diz como se faz; `Jornadas` diz o que aconteceu e o que ficou. Se um capítulo
# pode carregar `<Steps>`, o leitor abre a página e não consegue dizer por que
# ela não está na outra aba.
echo "4  \`<Steps>\` fora de \`Jornadas\`"
com_steps=''
while IFS= read -r arquivo; do
  [ "$(contar "$arquivo" '^<Steps>')" = 0 ] || com_steps="${com_steps}${arquivo}"$'\n'
done < <(find "$JORNADAS" -name '*.md' | sort)

if [ -n "$com_steps" ]; then
  reprova "\`<Steps>\` é a espinha de \`Procedimentos\`, e não entra em \`Jornadas\`:"
  printf '%s' "$com_steps" | sed 's/^/    /'
else
  echo "   nenhuma das ${total_jornadas} páginas de Jornadas carrega \`<Steps>\`"
fi
echo

# --- 5. o índice de jornada ---------------------------------------------------
#
# `<CardGroup>` é proibido porque grade não tem ordem, e o traço que justifica o
# décimo tipo é ORDENAR POR TEMPO. Uma página que ordenasse por tempo e
# renderizasse em grade não mostraria o traço.
echo "5  o índice de jornada — grade fora, duas seções dentro"
indices=0
while IFS=: read -r relativo tipo; do
  [ "$tipo" = 'indice-de-jornada' ] || continue
  arquivo="${CONTEUDO}/${relativo}.md"
  [ -f "$arquivo" ] || continue
  indices=$((indices + 1))

  cards=$(contar "$arquivo" '^<CardGroup>')
  [ "$cards" = 0 ] ||
    reprova "${relativo}: ${cards} \`<CardGroup>\`, e grade não tem ordem"

  for heading in '## Como foi' '## O que não funcionou'; do
    grep -qxF "$heading" "$arquivo" ||
      reprova "${relativo}: falta o heading literal \`${heading}\`"
  done
done <<< "$TIPOS"

[ "$indices" = 2 ] || reprova "${indices} índices de jornada, esperado 2"
echo "   ${indices} índices, sem grade, com \`## Como foi\` e \`## O que não funcionou\`"
echo

# --- 6. prosa antes do primeiro `##`, em todo capítulo -------------------------
#
# O parágrafo de contexto é o que separa o capítulo de uma lista de passos com
# outro nome. A varredura ignora o `<Untranslated />` — ele é convenção de
# autoria, não prosa — e ignora componente e cerca.
echo "6  prosa entre o \`# h1\` e o primeiro \`##\`"
capitulos=0
while IFS=: read -r relativo tipo; do
  [ "$tipo" = 'capitulo' ] || continue
  arquivo="${CONTEUDO}/${relativo}.md"
  [ -f "$arquivo" ] || continue
  capitulos=$((capitulos + 1))

  prosa=$(awk '
    /^# / { depois_do_titulo = 1; next }
    /^## / { exit }
    !depois_do_titulo { next }
    /^[[:space:]]*```/ { dentro = !dentro; next }
    dentro { next }
    /^[[:space:]]*$/ { next }
    /^<Untranslated \/>$/ { next }
    /^[<:|]/ { next }
    { n++ }
    END { print n + 0 }
  ' "$arquivo")

  [ "$prosa" -ge 1 ] 2>/dev/null ||
    reprova "${relativo}: nenhuma linha de prosa entre o título e o primeiro \`##\`"
done <<< "$TIPOS"

[ "$capitulos" = 10 ] || reprova "${capitulos} capítulos, esperado 10"
echo "   ${capitulos} capítulos, todos com parágrafo de contexto antes da espinha"
echo

# --- 7. a lista ordenada de `## Como foi` --------------------------------------
#
# Um item por capítulo, e é a lista que carrega o traço do tipo: tempo precisa
# de linha, e lista ordenada é a linha. O número sai da árvore, não de uma
# constante — assim a cobrança acompanha a jornada que crescer.
echo "7  \`## Como foi\` com um item por capítulo"
while IFS= read -r jornada; do
  arquivo="${JORNADAS}/${jornada}/indice.md"
  [ -f "$arquivo" ] || continue
  capitulos_da_jornada=$(( $(find "${JORNADAS}/${jornada}" -name '*.md' | wc -l) - 1 ))

  itens=$(awk '
    /^## Como foi$/ { dentro = 1; next }
    /^## / { dentro = 0 }
    dentro && /^[0-9]+\. / { n++ }
    END { print n + 0 }
  ' "$arquivo")

  [ "$itens" = "$capitulos_da_jornada" ] ||
    reprova "${jornada}: \`## Como foi\` lista ${itens} itens para ${capitulos_da_jornada} capítulos"
done < <(find "$JORNADAS" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort)
echo "   as duas listas têm um item por capítulo"
echo

# --- 8. o estado, uma palavra na abertura -------------------------------------
#
# `Em curso` · `Encerrada`, e o vocabulário fecha em dois. `Abandonada` saiu por
# não ter instância — vocabulário sem consumidor é o defeito que este projeto
# mata por nome. A abertura é o que vem entre o marcador de tradução e o
# primeiro `##`.
echo "8  o estado — exatamente uma palavra na abertura"
while IFS=: read -r relativo tipo; do
  [ "$tipo" = 'indice-de-jornada' ] || continue
  arquivo="${CONTEUDO}/${relativo}.md"
  [ -f "$arquivo" ] || continue

  estados=$(awk '
    /^# / { depois_do_titulo = 1; next }
    /^## / { exit }
    !depois_do_titulo { next }
    { n += gsub(/Em curso|Encerrada/, "&") }
    END { print n + 0 }
  ' "$arquivo")

  [ "$estados" = 1 ] ||
    reprova "${relativo}: ${estados} palavras de estado na abertura, e é exatamente uma"
done <<< "$TIPOS"
echo "   \`Em curso\` · \`Encerrada\` — uma palavra por índice, e o vocabulário fecha em dois"
echo

# --- 9. o marcador de tradução ------------------------------------------------
#
# **A regra apertou**, e é consequência de o locale ter fronteira: `<Untranslated
# />` é sobre a página SÓ existir num locale, e isso só acontece em `Jornadas` e
# `Procedimentos`. As 11 de `Ferramentas` nascem traduzidas, então marcá-las
# seria carimbar um estado que elas nunca terão.
echo "9  marcador de tradução"
sem_marcador=$(grep -RL '<Untranslated />' --include='*.md' "$JORNADAS" "$PROCEDIMENTOS") || true
if [ -n "$sem_marcador" ]; then
  reprova "fonte sem contraparte em EN e sem \`<Untranslated />\`:"
  echo "$sem_marcador" | sed 's/^/    /'
fi

com_marcador_demais=$(grep -Rl '<Untranslated />' --include='*.md' --include='*.mdx' "$FERRAMENTAS") || true
if [ -n "$com_marcador_demais" ]; then
  reprova "\`Ferramentas\` nasce traduzida — o marcador não se aplica:"
  echo "$com_marcador_demais" | sed 's/^/    /'
fi

com_marcador_en=$(grep -Rl '<Untranslated />' --include='*.md' --include='*.mdx' "$EN" 2>/dev/null) || true
if [ -n "$com_marcador_en" ]; then
  reprova "tradução COM \`<Untranslated />\` — a página traduzida não o carrega:"
  echo "$com_marcador_en" | sed 's/^/    /'
fi

marcadas=$(grep -Rl '<Untranslated />' --include='*.md' "$JORNADAS" "$PROCEDIMENTOS" 2>/dev/null | wc -l)
[ "$marcadas" = 28 ] || reprova "${marcadas} páginas com marcador, esperado 28"
echo "   ${marcadas} marcam (12 de Jornadas + 16 de Procedimentos); Ferramentas e as traduções não"
echo

# --- 10. `description` em 100% ------------------------------------------------
#
# O subtítulo abaixo do `h1` sai deste campo, e ele já quebra o build quando
# falta — o registro de `MDXComponents` lança. O portão o cobra mesmo assim
# porque build quebrado diz *uma* página, e a varredura diz TODAS de uma vez.
echo "10  \`description\` em toda página"
sem_description=$(grep -RL '^description: ' --include='*.md' --include='*.mdx' "$CONTEUDO" "$EN" 2>/dev/null) || true
if [ -n "$sem_description" ]; then
  reprova "página sem \`description\` no front matter:"
  echo "$sem_description" | sed 's/^/    /'
else
  todas=$(find "$CONTEUDO" "$EN" \( -name '*.md' -o -name '*.mdx' \) 2>/dev/null | wc -l)
  echo "   ${todas} de ${todas} páginas com \`description\` — o subtítulo tem fonte única"
fi
echo

# --- 11. as onze fixtures, por caminho nomeado --------------------------------
echo "11  as onze fixtures"
n_fixtures=0
while IFS=: read -r caso caminho; do
  n_fixtures=$((n_fixtures + 1))
  [ -f "${CONTEUDO}/${caminho}.md" ] ||
    reprova "a fixture \`${caso}\` aponta para ${caminho}, que não existe"
done <<< "$FIXTURES"

# A fixture de fallback se prova por AUSÊNCIA da contraparte. `Jornadas` inteira
# fica fora do EN, então a conferência é a mesma da seção 9 vista pelo avesso —
# e vale escrita, porque o dia em que alguém traduzir a aba é o dia em que a
# fixture morre calada.
[ ! -e "i18n/en/docusaurus-plugin-content-docs/current/api-owner/a-politica-de-versao.md" ] ||
  reprova "a fixture de fallback ganhou contraparte em EN, e o estado que ela prova sumiu"

while IFS=: read -r caso caminho; do
  [ -f "${CONTEUDO}/${caminho}.md" ] ||
    reprova "o caso \`${caso}\` aponta para ${caminho}, que não existe"
done <<< "$CASOS_DO_DOMINIO"

n_casos=$(printf '%s\n' "$CASOS_DO_DOMINIO" | wc -l)
[ "$n_fixtures" = 11 ] || reprova "${n_fixtures} fixtures declaradas, e a spec fecha em onze"
[ "$n_casos" = 4 ] || reprova "${n_casos} casos do domínio declarados, e a spec fecha em quatro"
echo "   ${n_fixtures} fixtures e ${n_casos} casos do domínio novo, todos por caminho nomeado"
echo

# --- 12. os dez tipos têm instância -------------------------------------------
echo "12  os dez tipos têm instância"
for tipo in $DEZ_TIPOS; do
  n=$(printf '%s\n' "$TIPOS" | grep -c ":${tipo}$" || true)
  if [ "$tipo" = "$TIPO_GERADO" ]; then
    # A instância do décimo tipo é contada do DISCO, e ela é `.mdx`. Uma linha
    # dele no manifesto seria página escrita à mão sob o gabarito *a saída do
    # gerador*, que é a incoerência que esta spec já adjudicou uma vez.
    [ "$n" = 0 ] ||
      reprova "\`${tipo}\` aparece ${n} vez(es) no manifesto, e o gabarito dele é a saída do gerador"
    [ "$geradas" -ge 1 ] ||
      reprova "o tipo \`${tipo}\` não tem nenhuma instância no artefato"
    continue
  fi
  [ "$n" -ge 1 ] || reprova "o tipo \`${tipo}\` não tem nenhuma instância no artefato"
done
echo "   os dez com instância — \`${TIPO_GERADO}\` com as ${geradas} do ramo gerado, e nenhum pendente"
echo

# --- 13. a cobertura de locale ------------------------------------------------
echo "13  cobertura de locale — só \`Ferramentas\`"
traduzidas=$(find "$EN" -name '*.md' 2>/dev/null | wc -l)
[ "$traduzidas" = "$total_ferramentas" ] ||
  reprova "EN: ${traduzidas} páginas autorais, esperado ${total_ferramentas} (uma por folha autoral de Ferramentas)"

# O ramo gerado é BIJEÇÃO, e não tradução: o gerador escreve os dois locales do
# par de contratos, então uma página em EN a menos significa gerador rodado pela
# metade — não fallback silencioso.
geradas_en=$(find "$GERADO_EN" -name '*.mdx' 2>/dev/null | wc -l)
[ "$geradas_en" = "$geradas" ] ||
  reprova "EN: ${geradas_en} páginas geradas, e o pt-BR tem ${geradas} — o gerador escreve os dois"
traduzidas=$((traduzidas + geradas_en))
[ "$traduzidas" = 17 ] || reprova "EN: ${traduzidas} páginas, esperado 17"

for outra in i18n/en/docusaurus-plugin-content-docs i18n/en/docusaurus-plugin-content-docs-procedimentos; do
  n=$(find "$outra" -name '*.md' 2>/dev/null | wc -l)
  [ "$n" = 0 ] ||
    reprova "${outra}: ${n} páginas, e estas duas abas são buraco de propósito"
done

echo "   ${traduzidas} traduzidas · ${marcadas} das ${autorais} autorais sem EN, de propósito"
echo

# --- 14. o travessão fora do conteúdo publicado --------------------------------
#
# O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um
# site que se olha. Português tem pontuação para tudo o que ele faz — vírgula,
# dois-pontos, parênteses, ponto final — e nenhuma dessas denuncia a origem.
#
# **A régua cobra a ausência, nunca a substituição.** Travessão é pontuação
# legítima, e cada ocorrência cai numa saída diferente: a que vira vírgula não é
# a que vira dois-pontos, e algumas exigem reescrever a frase. Por isso o portão
# aponta arquivo e linha e para por aí; quem decide é quem escreve.
#
# `docs/` fica de fora, e por decisão: a spec não é produto, ninguém a navega
# como página, e `invariantes.sh` EXIGE o literal `Livre — <dono>` lá dentro.
# Varrê-la aqui seria uma régua de máquina reprovando o que a outra obriga.
echo "14  travessão em \`conteudo\`, \`i18n\` e \`contratos\`"
com_travessao=$(grep -Rn '—' "$CONTEUDO" "$I18N" "$CONTRATOS" 2>/dev/null) || true
if [ -n "$com_travessao" ]; then
  reprova "travessão no conteúdo publicado; reescreva a frase, em vez de trocar o caractere:"
  echo "$com_travessao" | sed 's/^/    /'
else
  varridos=$(find "$CONTEUDO" "$I18N" "$CONTRATOS" -type f | wc -l)
  echo "   ${varridos} arquivos varridos, e nenhum travessão"
fi
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 4 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/informacao.md — mude os dois lados, ou nenhum."
  exit 1
fi

echo "Portão 4 passou."
