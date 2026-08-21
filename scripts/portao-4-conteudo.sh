#!/usr/bin/env bash
#
# Portão 4 — o volume, o tipo de página, os dois gabaritos de `Jornadas`, a
# regra de heading, as fixtures e a cobertura de locale.
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
# São dezessete cobranças: as **doze** que a árvore nova trouxe; a cobertura de
# locale, que é a única sobrevivente da versão anterior deste portão — ela não é
# acréscimo, é a linha que não foi jogada fora com o resto; a varredura de
# travessão, a única que olha o caractere em vez da estrutura; o teto de
# profundidade, que entrou com o `overpower`; e as **duas últimas**, que a #133
# trouxe e que cobram uma promessa em vez de uma contagem — uma seção chamada
# `Verificação` que de fato traz o que rodar, e um vocabulário que a página que
# se declara dicionário de fato define.
#
#    1. o volume por aba e por categoria     31 · 4 · 1 · 1, e 37 no total
#    2. o tipo de cada página                 e o orçamento ESTRUTURAL dele
#    3. a regra de heading                    e o teto zero do marcador de lugar
#    4. `<Steps>` ausente em `Jornadas`       a fronteira entre duas abas
#    5. o índice de jornada                   pendente, e a pendência é cobrada
#    6. prosa antes do primeiro `##`          em todo capítulo
#    7. a lista ordenada de `## Como foi`     N itens para N capítulos (pendente)
#    8. o estado                              exatamente uma palavra na abertura
#    9. o marcador de tradução                6 páginas, e nenhuma tradução
#   10. `description`                         em 100% das páginas
#   11. as doze fixtures                      por caminho nomeado, ou pendentes
#   12. os onze tipos têm instância           e nenhum fica pendente
#   13. a cobertura de locale                 31 em EN, e só `Ferramentas`
#   14. o travessão                           zero nas três superfícies
#   15. o teto de profundidade                4, alcançado, e confinado a dois ramos
#   16. a `Verificação` verifica            bloco cercado na seção, nos dois locales
#   17. o vocabulário do ramo               termo listado, e definido em `conceitos.md`
#
# **A ÁRVORE FOI RECONSTRUÍDA PARA CONTEÚDO REAL, e este portão registra o que
# ficou pendente.** `Jornadas` era narrativa — duas jornadas, dez capítulos, um
# índice por jornada ordenando por tempo —, e `Procedimentos` e `Times` eram
# acervo mockado. Os três saíram: a jornada passa a ser trilha de aprendizado
# (`Visão Geral` · `Conteúdo Teórico` · `Conteúdo Prático`) e as duas outras abas
# ficam numa folha de marcador de lugar cada.
#
# O que isso faz com um portão que só sabe contar: várias cobranças passam a
# contar ZERO. **Elas ficam, e cada uma cobra o zero por escrito**, porque é
# assim que uma lista de dezessete não vira uma lista de treze sem ninguém
# notar. É o mesmo mecanismo que a nota abaixo descreve para o décimo tipo, lido
# na direção contrária.
#
# **A pendência do décimo tipo fechou, e o portão a cobra pelo avesso.** Até o
# ramo gerado chegar, `Referência de API` era o único tipo sem instância, e a
# ausência era DECLARADA aqui — declarar a pendência é o que impede uma lista de
# dez de virar lista de nove sem ninguém notar. Agora ele tem quatro, e o que
# este portão passa a cobrar é o contrário: que as quatro existam, e que
# continuem sendo `.mdx` gerado em vez de `.md` escrito à mão. O portão 5 é quem confere que elas
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
TIMES='conteudo/times'
EN='i18n/en/docusaurus-plugin-content-docs-ferramentas/current'

# As três superfícies do conteúdo publicado, para a varredura de travessão. `EN`
# não serve aqui: ele aponta uma aba, e a régua é sobre tudo o que sai no site.
I18N='i18n'
# O espelho de conteúdo da aba `Ferramentas`, que é a única traduzida. Ele é
# mais fundo que `$I18N`, e as duas raízes NÃO são intercambiáveis: `$I18N`
# cobre também os rótulos de UI, que não têm contraparte em `conteudo/`.
ESPELHO_EN='i18n/en/docusaurus-plugin-content-docs-ferramentas/current'
CONTRATOS='contratos'

# O ramo gerado, nos dois locales. Ele é contado à parte de toda contagem de
# autoral: `.mdx` é o sinal greppável de *gerado, não editar*, e ele é o que
# separa as duas posses sem uma lista de exceção a manter.
GERADO_PT='conteudo/ferramentas/bibliotecas/overpower/comandos'
GERADO_EN="${EN}/bibliotecas/overpower/comandos"
GERADAS=4

# Os ramos com teto próprio, `prefixo=teto`, e o teto de todo o resto. Ver a
# cobrança 15.
#
# **Eram um ramo e viraram dois**, e o segundo não subiu o teto do site: a trilha
# de `Jornadas` desce a 3 porque a seção da trilha é um nó de verdade, com folhas
# dentro. O teto absoluto continua 4, e continua tendo um consumidor só.
RAMOS_PROFUNDOS='ferramentas/bibliotecas/overpower=4 jornadas/api-owner=3'
TETO_DE_PROFUNDIDADE=4
TETO_FORA_DOS_RAMOS=2

falhas=0

reprova() {
  echo "  REPROVOU — $1"
  falhas=$((falhas + 1))
}

# `chave=valor` separados por espaço, lidos com `${par%%=*}` / `${par##*=}` —
# o repo não tem bash 4 garantido, então nada de array associativo.
#
# **Estas contagens são de AUTORAL**, e são 27 para `Ferramentas`: a função conta
# `.md`, e o ramo gerado é `.mdx`. A soma das duas — 31 folhas na aba e 59 no
# site — é cobrada logo abaixo, com o número gerado somado por fora.
#
# `bibliotecas` foi de 17 para 23 na #133: seis páginas nasceram de recorte do
# que já existia, e nenhuma delas trouxe prosa nova.
#
# **`Procedimentos` e `Times` não declaram categoria nenhuma**, e a lista vazia é
# a declaração: as duas abas são uma folha de marcador de lugar no nível 1, sem
# separador acima. A contagem da aba continua sendo cobrada; o que não existe é
# categoria a conferir dentro dela.
VOLUME_JORNADAS='api-owner=4'
VOLUME_PROCEDIMENTOS=''
VOLUME_FERRAMENTAS='bibliotecas=22 modulos-terraform=2 skills=2 servidores-mcp=1'
VOLUME_TIMES=''

# O manifesto de tipo — `caminho:tipo`, um por linha, para as 33 autorais.
#
# **A forma `indice` MORREU com a issue #114**, e com ela sete páginas: o
# conteúdo delas era *a lista do que está logo abaixo*, e a sidebar já é essa
# lista (ADR 10 §c). Nenhuma linha `:indice` sobrou aqui, e é por isso que o
# `indice` não aparece — não é omissão, é a forma que deixou de existir.
#
# **`fixture-curta` morreu com a página que a carregava, e `placeholder` ocupa o
# lugar dela.** Ele também não é tipo (§6.3): é o gabarito da folha que diz *isto
# ainda não foi escrito* — zero `##`, zero componente do catálogo, e o
# `<Untranslated />` que toda página fora de `Ferramentas` carrega. São seis, e
# as seis herdam da antiga fixture curta a única coisa que ela provava: a perna
# sem heading, com o TOC ausente do DOM.
#
# `capitulo` é o gabarito da folha narrativa de `Jornadas`, e também não é tipo.
# **Ele está sem linha hoje**, e a ausência é declarada e não esquecida: a árvore
# narrativa saiu inteira. O `case` da cobrança 2 e as cobranças 5 a 8 continuam
# aqui pelo mesmo motivo.
TIPOS=$(cat <<'FIM'
jornadas/api-owner/visao-geral/resumo-das-trilhas:placeholder
jornadas/api-owner/visao-geral/links-e-referencias:placeholder
jornadas/api-owner/conteudo-teorico/work-in-progress:placeholder
jornadas/api-owner/conteudo-pratico/work-in-progress:placeholder
procedimentos/work-in-progress:placeholder
times/work-in-progress:placeholder
ferramentas/bibliotecas/overpower/visao-geral:quickstart
ferramentas/bibliotecas/overpower/instalacao:sdk
ferramentas/bibliotecas/overpower/conceitos:conceitual
ferramentas/bibliotecas/overpower/comandos/indice:referencia
ferramentas/bibliotecas/overpower/alvos/indice:catalogo
ferramentas/bibliotecas/overpower/alvos/servidores-mcp:conceitual
ferramentas/bibliotecas/overpower/alvos/from:guia
ferramentas/bibliotecas/overpower/alvos/bundle-federado:conceitual
ferramentas/bibliotecas/overpower/referencia/indice:referencia
ferramentas/bibliotecas/overpower/referencia/codigos-de-saida:referencia
ferramentas/bibliotecas/overpower/referencia/solucao-de-problemas:troubleshooting
ferramentas/bibliotecas/overpower/referencia/changelog:changelog
ferramentas/bibliotecas/overpower/contribuir/indice:guia
ferramentas/bibliotecas/overpower/contribuir/arquitetura:conceitual
ferramentas/bibliotecas/overpower/contribuir/mapa-de-modulos:catalogo
ferramentas/bibliotecas/overpower/contribuir/hooks:conceitual
ferramentas/bibliotecas/overpower/contribuir/testes:conceitual
ferramentas/bibliotecas/overpower/contribuir/telas:guia
ferramentas/bibliotecas/overpower/contribuir/curadoria:guia
ferramentas/bibliotecas/overpower/contribuir/criterios-de-catalogo:conceitual
ferramentas/bibliotecas/overpower/contribuir/release:guia
ferramentas/bibliotecas/overpower/contribuir/release-ready:catalogo
ferramentas/modulos-terraform/modulo-de-bucket:guia
ferramentas/modulos-terraform/modulo-de-papel-iam:guia
ferramentas/skills/scaffold-de-esteira:receita
ferramentas/skills/rotacao-de-segredo:receita
ferramentas/servidores-mcp/servidor-de-catalogo-mcp:sdk
FIM
)

# Os onze tipos, e onde cada um tem instância. `referencia-de-api` não aparece no
# manifesto acima: o gabarito dele é *a saída do gerador*, e a instância dele é
# contada do disco — declará-lo no manifesto seria escrever à mão o que o
# contrato decide.
#
# **UM fica pendente, e a pendência é cobrada por nome.** `indice-de-jornada`
# tinha duas instâncias, e as duas eram os índices narrativos que saíram com a
# reconstrução da árvore. O tipo NÃO some da lista: uma lista de onze que vira
# lista de dez sem ninguém decidir é exatamente o modo de falhar que este bloco
# existe para impedir. O portão cobra que ele siga em ZERO enquanto a pendência
# durar, e reprova no dia em que alguém escrever uma instância sem tirar o nome
# daqui — que é a mesma régua que `referencia-de-api` cumpriu ao contrário.
ONZE_TIPOS='quickstart conceitual guia sdk referencia referencia-de-api receita catalogo troubleshooting changelog indice-de-jornada'
TIPO_GERADO='referencia-de-api'
TIPO_PENDENTE='indice-de-jornada'

# As doze fixtures, por caminho nomeado. A décima segunda,
# `aninhamento-de-sidebar-maximo`, nasceu com o `overpower`: ela prova que os 40px
# de recuo do nível 4, mais o ícone, mais o rótulo, cabem nos 288px da coluna.
# Cada caso difícil tem exatamente uma página dona — a spec aponta para o artefato em vez de descrever a hipótese, e
# quem implementa sabe onde olhar para saber se acertou.
#
# `fallback-de-locale` é a única que se prova por AUSÊNCIA: a página existe em
# pt-BR e NÃO tem contraparte em EN, que é o estado que ela exercita.
# **Nove das doze trocaram de dona de uma vez**, e nenhuma por gosto: a dona de
# cada uma morava em `Procedimentos` ou na `Jornadas` narrativa, e as duas
# saíram. A herdeira de cada caso foi MEDIDA no que sobrou, e o número está na
# tabela do §7 ao lado do nome. Onde nada no acervo exercita mais o caso, a linha
# vale `pendente` em vez de apontar para uma página que não prova o que promete.
FIXTURES=$(cat <<'FIM'
tabela-larga:ferramentas/bibliotecas/overpower/referencia/solucao-de-problemas
tabela-como-pagina-inteira:ferramentas/bibliotecas/overpower/contribuir/mapa-de-modulos
bloco-de-codigo-longo:ferramentas/bibliotecas/overpower/referencia/indice
pagina-muito-curta:procedimentos/work-in-progress
prosa-pura:times/work-in-progress
item-de-sidebar-mais-largo:ferramentas/servidores-mcp/servidor-de-catalogo-mcp
prosa-minima-codigo-maximo:ferramentas/skills/scaffold-de-esteira
fallback-de-locale:jornadas/api-owner/visao-geral/links-e-referencias
aninhamento-profundo:ferramentas/bibliotecas/overpower/alvos/bundle-federado
pagina-muito-longa:ferramentas/bibliotecas/overpower/alvos/indice
painel-direito-vazio:ferramentas/bibliotecas/overpower/comandos/indice
aninhamento-de-sidebar-maximo:ferramentas/bibliotecas/overpower/alvos/from
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
# domínio. Contá-lo como fixture faria a lista fechar em treze, e são doze.
#
# **`diff` ficou PENDENTE.** A dona dele era `Diagnóstico › O diff que resolveu`,
# e nenhuma página do acervo que sobrou carrega uma cerca ```` ```diff ````.
# Escrever uma só para reencher a linha seria inventar conteúdo para satisfazer
# uma contagem, que é o defeito que esta lista existe para não ter. A linha fica,
# marcada, e o dia em que alguém escrever a cerca é o dia em que ela volta a
# apontar para uma página.
CASOS_DO_DOMINIO=$(cat <<'FIM'
saida-literal-de-terminal:ferramentas/bibliotecas/overpower/referencia/codigos-de-saida
varias-linguagens-na-mesma-pagina:ferramentas/servidores-mcp/servidor-de-catalogo-mcp
diff:pendente
irmao-curto:ferramentas/bibliotecas/overpower/alvos/bundle-federado
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
#
# **O total sai da ÁRVORE, e não da soma das categorias declaradas**, e a
# diferença é uma cobrança a mais de graça: uma página escrita fora de toda
# categoria declarada some da soma antiga e reprova nesta. É também o que permite
# uma aba sem categoria nenhuma — `Procedimentos` e `Times`, com a folha de
# marcador de lugar no nível 1 — continuar sendo contada.
volume=0
volume_da_aba() {
  local raiz="$1" esperado_total="$2" nome="$3" pares="$4"
  local par categoria esperado achado
  volume=$(find "$raiz" -name '*.md' 2>/dev/null | wc -l)
  for par in $pares; do
    categoria="${par%%=*}"
    esperado="${par##*=}"
    achado=$(find "${raiz}/${categoria}" -name '*.md' 2>/dev/null | wc -l)
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

volume_da_aba "$JORNADAS" 4 'Jornadas' "$VOLUME_JORNADAS"; total_jornadas=$volume
volume_da_aba "$PROCEDIMENTOS" 1 'Procedimentos' "$VOLUME_PROCEDIMENTOS"; total_procedimentos=$volume
volume_da_aba "$FERRAMENTAS" 27 'Ferramentas' "$VOLUME_FERRAMENTAS"; total_ferramentas=$volume
volume_da_aba "$TIMES" 1 'Times' "$VOLUME_TIMES"; total_times=$volume

autorais=$((total_jornadas + total_procedimentos + total_ferramentas + total_times))
[ "$autorais" = 33 ] || reprova "o acervo tem ${autorais} páginas autorais, esperado 33"

# O ramo gerado, somado por fora. Ele fecha `Bibliotecas` em 26, `Ferramentas`
# em 31 e o site em 37 — os três números que a spec publica.
geradas=$(find "$GERADO_PT" -name '*.mdx' 2>/dev/null | wc -l)
[ "$geradas" = "$GERADAS" ] ||
  reprova "o ramo gerado tem ${geradas} páginas, esperado ${GERADAS}"

bibliotecas=$(( $(find "${FERRAMENTAS}/bibliotecas" -name '*.md' | wc -l) + geradas ))
[ "$bibliotecas" = 26 ] || reprova "Ferramentas/bibliotecas: ${bibliotecas} páginas, esperado 26"

folhas_ferramentas=$((total_ferramentas + geradas))
[ "$folhas_ferramentas" = 31 ] || reprova "Ferramentas: ${folhas_ferramentas} folhas, esperado 31"

total=$((autorais + geradas))
[ "$total" = 37 ] || reprova "o site tem ${total} páginas, esperado 37"

# A ordem impressa é a do navbar, e ela mudou: `Jornadas` subiu para segunda.
echo "   Ferramentas ${folhas_ferramentas} · Jornadas ${total_jornadas} · Procedimentos ${total_procedimentos} · Times ${total_times} = ${total}"
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
    # O DÉCIMO PRIMEIRO tipo, nascido na #133. A taxonomia não tinha slot para
    # referência autoral, então toda página assim era empurrada para
    # `conceitual` — e `comandos/indice` media 83,3% Referência sob esse
    # carimbo. O gabarito é *o que é, a tabela ou lista que se consulta, e as
    # notas de uso*; o que a máquina cobra dele é a tabela, porque é ela que
    # separa referência de argumento.
    referencia)     exigir 'tabelas' "$tabelas" 1 ;;
    troubleshooting) exigir 'tabelas' "$tabelas" 1 ;;
    changelog)      exigir 'entradas <Update>' "$(contar "$arquivo" '^<Update ')" 6 ;;
    # O gabarito do capítulo: 2 blocos e 1 `:::`. A espinha de 3 a 6 `##` e a
    # prosa antes do primeiro heading são cobradas nas seções 3 e 6.
    # **Sem linha no manifesto hoje** — ver a nota do manifesto.
    capitulo)       exigir 'blocos' "$blocos" 2; exigir 'callouts' "$callouts" 1 ;;
    # O décimo tipo, e o tipo PENDENTE. As duas seções obrigatórias são cobradas
    # na seção 5, e a ausência de componente é o que faz dele a página mais nua
    # do site. **Sem linha no manifesto hoje** — ver a cobrança 12.
    indice-de-jornada) : ;;
    # Forma, não tipo. O marcador de lugar é a folha que diz *isto ainda não foi
    # escrito*: zero `##` (cobrado na seção 3), zero componente, e nenhum
    # orçamento estrutural a cobrar aqui — cobrar estrutura de uma página que
    # declara não ter conteúdo seria pedir moldura para o quadro que falta.
    placeholder)    : ;;
    *)              reprova "${relativo}: tipo desconhecido '${tipo}'" ;;
  esac
done <<< "$TIPOS"

echo "   ${declaradas} páginas com tipo declarado, cada uma no orçamento estrutural dele"
echo

# --- 3. a regra de heading ----------------------------------------------------
#
# O piso é três `##` em toda página. Três gabaritos abrem teto próprio, e nenhum
# dos três é exceção: `Receita` fica em no máximo um, o índice de jornada em
# exatamente dois (os dois literais da seção 5), e o marcador de lugar em ZERO.
#
# **A exceção NOMEADA acabou, e não por relaxamento.** Ela era
# `procedimentos/ambiente/indice`, a única página que rompia a própria forma; a
# página saiu com a aba, e o que ficou no lugar dela tem GABARITO — orçamento do
# tipo, não exceção. Uma varredura com lista de exceção vazia é uma varredura
# mais forte do que uma com uma linha.
echo "3  regra de heading"
sem_toc=0
com_toc=0

while IFS=: read -r relativo tipo; do
  arquivo="${CONTEUDO}/${relativo}.md"
  [ -f "$arquivo" ] || continue
  h2=$(contar "$arquivo" '^## ')

  if [ "$tipo" = 'placeholder' ]; then
    [ "$h2" = 0 ] ||
      reprova "${relativo}: ${h2} \`##\`, e o marcador de lugar fica em ZERO"
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

# **O piso já foi cobrado acima**, página a página, e não há mais lista de
# exceção: quem fica abaixo dele fica por gabarito. Contar aqui quantas páginas
# ficam sem TOC seria cobrar outra coisa — a `Receita` fica em zero pelo
# orçamento dela, e orçamento não é exceção.
#
# O que esta contagem cobra é que as DUAS configurações de coluna que este
# acervo produz existam no artefato.
#
# **A terceira NÃO chegou com o ramo gerado, e a linha anterior errava ao
# prometê-la.** Ela dizia que `hide_table_of_contents` viria com as páginas
# geradas; ele não veio, e não vir era decisão escrita: o campo seria segunda
# fonte de verdade para algo que o componente da rota decidia sozinho.
#
# **Desde a #118 nem o componente decide.** O `ApiDocItem` saiu, e as quatro
# páginas geradas ganharam TOC como qualquer outra. Quem fica sem TOC hoje é
# quem não tem heading para listar — que é a regra do site inteiro, e é ela que
# as duas contagens abaixo continuam cobrando. A varredura de
# `hide_table_of_contents` nas geradas fica: o campo continua proibido lá, e
# agora por um motivo mais simples — não há decisão nenhuma para ele
# sobrescrever.
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

# **ZERO, e o zero é a cobrança.** Os dois índices narrativos saíram com a
# reconstrução da árvore, e o tipo está pendente (cobrança 12). Escrever um
# índice de jornada sem tirar o tipo da lista de pendentes reprova aqui.
[ "$indices" = 0 ] ||
  reprova "${indices} índice(s) de jornada, e o tipo está declarado PENDENTE na cobrança 12"
echo "   ${indices} índices, e o tipo está pendente: a jornada virou trilha, e a trilha não narra"
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

# **ZERO hoje, pelo mesmo motivo da cobrança 5.** O gabarito `capitulo` continua
# escrito, e a varredura volta a ter sujeito no dia em que uma linha `:capitulo`
# entrar no manifesto.
[ "$capitulos" = 0 ] ||
  reprova "${capitulos} capítulo(s), e o gabarito está sem linha no manifesto"
echo "   ${capitulos} capítulos: a árvore narrativa saiu, e o gabarito fica sem sujeito"
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
echo "   nenhuma jornada tem \`indice.md\` hoje, e a varredura fica sem sujeito"
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
echo "   \`Em curso\` · \`Encerrada\` — o vocabulário fecha em dois, e fica sem índice a carimbar"
echo

# --- 9. o marcador de tradução ------------------------------------------------
#
# **A regra apertou**, e é consequência de o locale ter fronteira: `<Untranslated
# />` é sobre a página SÓ existir num locale, e isso acontece em `Jornadas`,
# `Procedimentos` e `Times`. As de `Ferramentas` nascem traduzidas, então
# marcá-las seria carimbar um estado que elas nunca terão.
echo "9  marcador de tradução"
sem_marcador=$(grep -RL '<Untranslated />' --include='*.md' "$JORNADAS" "$PROCEDIMENTOS" "$TIMES") || true
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

marcadas=$(grep -Rl '<Untranslated />' --include='*.md' "$JORNADAS" "$PROCEDIMENTOS" "$TIMES" 2>/dev/null | wc -l)
[ "$marcadas" = 6 ] || reprova "${marcadas} páginas com marcador, esperado 6"
echo "   ${marcadas} marcam (4 de Jornadas + 1 de Procedimentos + 1 de Times); Ferramentas e as traduções não"
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

# --- 11. as doze fixtures, por caminho nomeado --------------------------------
echo "11  as doze fixtures"
n_fixtures=0
pendentes=0
while IFS=: read -r caso caminho; do
  n_fixtures=$((n_fixtures + 1))
  if [ "$caminho" = 'pendente' ]; then
    pendentes=$((pendentes + 1))
    echo "   PENDENTE  a fixture \`${caso}\` está sem dona, e a linha fica declarada"
    continue
  fi
  [ -f "${CONTEUDO}/${caminho}.md" ] ||
    reprova "a fixture \`${caso}\` aponta para ${caminho}, que não existe"
done <<< "$FIXTURES"

# A fixture de fallback se prova por AUSÊNCIA da contraparte. `Jornadas` inteira
# fica fora do EN, então a conferência é a mesma da seção 9 vista pelo avesso —
# e vale escrita, porque o dia em que alguém traduzir a aba é o dia em que a
# fixture morre calada.
[ ! -e "i18n/en/docusaurus-plugin-content-docs/current/api-owner/visao-geral/links-e-referencias.md" ] ||
  reprova "a fixture de fallback ganhou contraparte em EN, e o estado que ela prova sumiu"

while IFS=: read -r caso caminho; do
  if [ "$caminho" = 'pendente' ]; then
    pendentes=$((pendentes + 1))
    echo "   PENDENTE  o caso \`${caso}\` está sem dona, e a linha fica declarada"
    continue
  fi
  [ -f "${CONTEUDO}/${caminho}.md" ] ||
    reprova "o caso \`${caso}\` aponta para ${caminho}, que não existe"
done <<< "$CASOS_DO_DOMINIO"

n_casos=$(printf '%s\n' "$CASOS_DO_DOMINIO" | wc -l)
[ "$n_fixtures" = 12 ] || reprova "${n_fixtures} fixtures declaradas, e a spec fecha em doze"
[ "$n_casos" = 4 ] || reprova "${n_casos} casos do domínio declarados, e a spec fecha em quatro"
# **O número de pendentes é CRAVADO**, e é o que impede a lista de virar
# formulário: sem ele, marcar mais uma linha como `pendente` passaria calado.
[ "$pendentes" = 1 ] ||
  reprova "${pendentes} linha(s) marcada(s) \`pendente\`, e a spec declara UMA (\`diff\`)"
echo "   ${n_fixtures} fixtures e ${n_casos} casos do domínio, ${pendentes} pendente e o resto por caminho nomeado"
echo

# --- 12. os onze tipos têm instância -------------------------------------------
echo "12  os onze tipos têm instância"
for tipo in $ONZE_TIPOS; do
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
  if [ "$tipo" = "$TIPO_PENDENTE" ]; then
    # A pendência lida ao contrário: o tipo continua na lista, e o portão cobra
    # que ele siga sem instância enquanto ninguém decidir escrevê-lo de volta.
    [ "$n" = 0 ] ||
      reprova "\`${tipo}\` está declarado PENDENTE e tem ${n} instância(s) — tire-o de TIPO_PENDENTE"
    echo "   PENDENTE  \`${tipo}\` segue sem instância, e a linha fica declarada"
    continue
  fi
  [ "$n" -ge 1 ] || reprova "o tipo \`${tipo}\` não tem nenhuma instância no artefato"
done
echo "   dez dos onze com instância — \`${TIPO_GERADO}\` com as ${geradas} do ramo gerado, e \`${TIPO_PENDENTE}\` pendente"
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
[ "$traduzidas" = 31 ] || reprova "EN: ${traduzidas} páginas, esperado 31"

for outra in i18n/en/docusaurus-plugin-content-docs i18n/en/docusaurus-plugin-content-docs-procedimentos i18n/en/docusaurus-plugin-content-docs-times; do
  n=$(find "$outra" -name '*.md' 2>/dev/null | wc -l)
  [ "$n" = 0 ] ||
    reprova "${outra}: ${n} páginas, e estas três abas são buraco de propósito"
done

echo "   ${traduzidas} traduzidas · ${marcadas} das ${autorais} autorais sem EN, de propósito"
echo

# --- 14. o travessão fora do conteúdo publicado -------------------------------
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
#
# **As três raízes são conferidas antes da varredura.** `grep` sobre caminho
# inexistente devolve vazio, e vazio AQUI é aprovação: das dezessete, esta é a
# única cuja forma de passar é não achar nada. Sem a guarda, um diretório
# renomeado transformaria a cobrança num carimbo.
#
# ---------------------------------------------------------------------------
# A EXCEÇÃO: citação de saída de ferramenta (#133)
#
# Duas regras deste repositório colidiam de frente. `solucao-de-problemas.md`
# promete citar a mensagem de recusa **como a ferramenta a imprime**, e três das
# mensagens do `overpower` carregam travessão literal — entre elas a que o painel
# de `install` mostra. Reescrever a frase falsificaria a citação: o leitor
# procuraria no terminal um texto que não existe.
#
# A saída reusa o padrão da invariante 2 de `invariantes.sh`: **quem carrega o
# literal declara no próprio preâmbulo que carrega.** Sem declaração, nada muda;
# com ela, o travessão passa **só dentro de região de citação**, que é onde a
# ferramenta fala e o autor não.
#
#   markdown   `{/* cita-saida-de-ferramenta */}` nas 20 primeiras linhas, e o
#              travessão dentro de cerca de código ou na linha `api_exemplos:`
#              da página gerada
#   json       `"citaSaidaDeFerramenta": true` nas 20 primeiras linhas, e o
#              travessão dentro de um valor `"mensagem":`
#
# **O marcador é `{/* */}` e não `<!-- -->`.** Medido: sob MDX 3 o comentário
# HTML não compila (*Unexpected character `!`*), e toda página deste site passa
# pelo compilador MDX, `.md` inclusive, porque a config não declara `format`.
echo "14  travessão em \`conteudo\`, \`i18n\` e \`contratos\`"
faltando=''
for raiz in "$CONTEUDO" "$I18N" "$CONTRATOS"; do
  [ -d "$raiz" ] || faltando="${faltando}${raiz} "
done

if [ -n "$faltando" ]; then
  reprova "superfície ausente, e sem ela a varredura passaria calada: ${faltando% }"
else
  com_travessao=$(
    find "$CONTEUDO" "$I18N" "$CONTRATOS" -type f -print0 |
      xargs -0 awk '
        # **O arquivo é acumulado antes de ser julgado, e a razão é a ordem.** A
        # declaração mora nas 20 primeiras linhas, e numa página gerada a linha
        # com travessão é o `api_exemplos:` do front matter, que vem ANTES dela.
        # Julgar em fluxo reprovaria a linha 6 por uma declaração que só se lê na
        # 9. Guarda-se a ocorrência e decide-se no fim do arquivo.
        function fechar(   i) {
          for (i = 1; i <= n; i++) {
            if (declarado && citavel[i]) continue
            print achado[i]
          }
          n = 0
        }
        FNR == 1 { fechar(); declarado = 0; dentro = 0 }
        FNR <= 20 && (/\{\/\* cita-saida-de-ferramenta \*\/\}/ ||
                      /"citaSaidaDeFerramenta": true/) { declarado = 1 }
        # A cerca alterna a região de citação. A própria linha da cerca não é
        # prosa, então ela sai da varredura junto.
        /^[ \t]*```/ { dentro = !dentro; next }
        index($0, "—") == 0 { next }
        {
          n++
          achado[n] = FILENAME ":" FNR ":" $0
          # As três regiões em que quem fala é a ferramenta, e não o autor: a
          # cerca de código, a linha de front matter que projeta o contrato, e o
          # valor `"mensagem"` dentro do próprio contrato.
          citavel[n] = (dentro || /^api_exemplos:/ || /"mensagem":/) ? 1 : 0
        }
        END { fechar() }
      '
  ) || true
  if [ -n "$com_travessao" ]; then
    reprova "travessão no conteúdo publicado; reescreva a frase, em vez de trocar o caractere:"
    echo "$com_travessao" | sed 's/^/    /'
  else
    varridos=$(find "$CONTEUDO" "$I18N" "$CONTRATOS" -type f | wc -l)
    citando=$(grep -rlE '\{/\* cita-saida-de-ferramenta \*/\}|"citaSaidaDeFerramenta": true' \
      "$CONTEUDO" "$I18N" "$CONTRATOS" | wc -l)
    echo "   ${varridos} arquivos varridos; travessão só onde a ferramenta fala, em ${citando} que declaram"
  fi
fi
echo

# --- 15. o teto de profundidade, e o ramo em que ele vale ---------------------
#
# **A cobrança mudou de forma com o ADR 10 §g).** Ela era *"o nível 3 é usado ao
# menos uma vez"*, que é teto com consumidor mas sem fronteira: nada impedia um
# terceiro nível aparecer em `Jornadas` no dia seguinte. Agora o teto é 4 e ele é
# **confinado**, o que são três cobranças e não uma: nada passa de 4 em lugar
# nenhum, nada passa do teto do próprio ramo, e nada passa de 2 fora dos ramos
# declarados.
#
# **A fronteira deixou de ser um ramo e passou a ser dois, com teto próprio cada
# um.** `jornadas/api-owner` entrou com teto 3, e não com o teto do site: a
# trilha tem seção com folhas dentro, o que gasta um nível, e nada ali pede um
# quarto. Declarar `3` em vez de deixá-la herdar o `4` é o que impede a jornada
# de ganhar um nível de graça por estar na mesma lista do `overpower`.
#
# **Cada ramo declarado precisa ALCANÇAR o próprio teto.** Um ramo com teto 3 que
# usa 2 é a mesma coisa que um teto sem consumidor, um nível acima.
#
# A régua é a PROFUNDIDADE DE CAMINHO, contada a partir do primeiro segmento
# abaixo da aba. Ela é o teto superior do nível de sidebar e nunca o subestima: a
# folha de abertura de uma categoria gasta um segmento de caminho a mais do que o
# nível que ocupa na árvore, então `comandos/indice` mede 4 aqui e desenha 3 lá.
# Cobrar o caminho é mais estrito que cobrar a árvore, e é o que este portão
# consegue ler sem importar a sidebar.
echo "15  o teto de profundidade, confinado aos ramos declarados"
profundidade_maxima=0
acima_do_teto=''
alcance_dos_ramos=''
for par in $RAMOS_PROFUNDOS; do
  alcance_dos_ramos="${alcance_dos_ramos}${par%%=*}=0 "
done

while IFS= read -r arquivo; do
  relativo="${arquivo#${CONTEUDO}/}"
  sem_aba="${relativo#*/}"
  nivel=$(printf '%s' "${sem_aba%.*}" | tr -cd '/' | wc -c)
  nivel=$((nivel + 1))
  [ "$nivel" -le "$profundidade_maxima" ] || profundidade_maxima=$nivel

  if [ "$nivel" -gt "$TETO_DE_PROFUNDIDADE" ]; then
    reprova "${relativo}: nível ${nivel}, e o teto absoluto é ${TETO_DE_PROFUNDIDADE}"
  fi

  # O teto DESTE arquivo: o do ramo que o contém, ou o de fora dos ramos.
  teto_daqui=$TETO_FORA_DOS_RAMOS
  ramo_daqui=''
  for par in $RAMOS_PROFUNDOS; do
    case "$relativo" in
      "${par%%=*}"/*) teto_daqui="${par##*=}"; ramo_daqui="${par%%=*}" ;;
    esac
  done

  if [ "$nivel" -gt "$teto_daqui" ]; then
    acima_do_teto="${acima_do_teto}${relativo} (nível ${nivel}, teto ${teto_daqui})"$'\n'
  fi

  # O alcance do ramo, para a terceira cobrança. `chave=maior nível visto`.
  if [ -n "$ramo_daqui" ]; then
    novo=''
    for par in $alcance_dos_ramos; do
      if [ "${par%%=*}" = "$ramo_daqui" ] && [ "$nivel" -gt "${par##*=}" ]; then
        novo="${novo}${ramo_daqui}=${nivel} "
      else
        novo="${novo}${par} "
      fi
    done
    alcance_dos_ramos="$novo"
  fi
done < <(find "$CONTEUDO" \( -name '*.md' -o -name '*.mdx' \) | sort)

if [ -n "$acima_do_teto" ]; then
  reprova "profundidade acima do teto do próprio ramo (fora dos ramos declarados o teto é ${TETO_FORA_DOS_RAMOS}):"
  printf '%s' "$acima_do_teto" | sed 's/^/    /'
fi

for par in $RAMOS_PROFUNDOS; do
  ramo="${par%%=*}"
  esperado="${par##*=}"
  for medido in $alcance_dos_ramos; do
    [ "${medido%%=*}" = "$ramo" ] || continue
    [ "${medido##*=}" = "$esperado" ] ||
      reprova "${ramo}: declara teto ${esperado} e chega ao nível ${medido##*=} — teto sem consumidor sobe sozinho"
  done
done

[ "$profundidade_maxima" = "$TETO_DE_PROFUNDIDADE" ] ||
  reprova "a árvore chega ao nível ${profundidade_maxima}, e um teto de ${TETO_DE_PROFUNDIDADE} sem consumidor é teto que sobe sozinho"

echo "   teto ${TETO_DE_PROFUNDIDADE}, alcançado, e confinado a: ${RAMOS_PROFUNDOS}"
echo

# --- 16. a `Verificação` verifica --------------------------------------------
#
# **A cobrança nasceu de uma medição, não de um princípio.** Nas cinco páginas
# typed `guia` do ramo `overpower`, a seção `## Verificação` não continha nenhum
# comando de verificação e nenhum resultado esperado: continha justificativa de
# desenho. Sozinha, ela respondia por 51 das 273 linhas fora de modo do ramo
# (#133).
#
# O gabarito de `guia` diz *pré-requisitos → `<Steps>` → verificação → variações*,
# e uma seção chamada `Verificação` sem nada a rodar é a promessa quebrada mais
# barata de escrever, porque ninguém a lê como quebrada: ela parece completa.
#
# **A régua é o bloco cercado, e ela é grosseira de propósito.** Nenhuma varredura
# sabe se um comando de fato verifica; o que ela sabe é se existe algo a rodar. A
# metade que julga se a verificação verifica é da revisão, e continua sendo.
#
# Os dois locales são varridos, com o heading de cada um: uma página que verifica
# só em pt-BR deixa o leitor de EN com a mesma promessa quebrada.
echo "16  a \`Verificação\` verifica"
verificacoes=0
while IFS=: read -r relativo tipo; do
  [ "$tipo" = 'guia' ] || continue
  # **`$I18N` é a raiz de `i18n/`, e não a do espelho de conteúdo.** A primeira
  # versão desta cobrança montou o caminho do EN a partir dela e nunca achou
  # arquivo nenhum: a varredura passava calada na metade que ela anunciava
  # varrer. O espelho mora fundo, sob a instância de `ferramentas`.
  for par in "${CONTEUDO}/${relativo}.md:Verificação" \
             "${ESPELHO_EN}/${relativo#ferramentas/}.md:Checking it"; do
    arquivo="${par%:*}"
    heading="${par##*:}"
    [ -f "$arquivo" ] || continue
    # **A ausência da seção não é o que esta cobrança pega**, e o limite é
    # deliberado. A régua da #133 é sobre o CONTEÚDO da seção; exigir que ela
    # exista alcançaria `procedimentos/esteiras/verificar-a-assinatura-hmac.md`,
    # que é da aba `Procedimentos` e está fora do escopo daquele ticket. O buraco
    # fica registrado aqui, nomeado, para o ticket que o fechar.
    #
    # **O guarda vem ANTES do contador**, e a ordem é o conserto de um defeito
    # desta própria cobrança: contando antes, ela somava ARQUIVO varrido e
    # imprimia o número como se fosse SEÇÃO varrida. Numa régua que nasceu contra
    # promessa quebrada, era exatamente a promessa quebrada.
    grep -q "^## ${heading}\$" "$arquivo" || continue
    verificacoes=$((verificacoes + 1))
    # Da linha do heading até o próximo `##`, e conta cerca dentro da fatia.
    cercas=$(awk -v h="## ${heading}" '
      $0 == h { dentro = 1; next }
      dentro && /^## / { exit }
      dentro && /^[[:space:]]*```/ { n++ }
      END { print n + 0 }
    ' "$arquivo")
    if [ "$((cercas / 2))" -lt 1 ]; then
      reprova "${arquivo}: \`${heading}\` sem bloco cercado — nada a rodar, e nada a comparar"
    fi
  done
done <<< "$TIPOS"
echo "   ${verificacoes} seções de verificação varridas, cada uma com o que rodar"
echo

# --- 17. o vocabulário do ramo está definido ---------------------------------
#
# **`conceitos.md` declara, na abertura, ser onde a definição mora.** A declaração
# era falsa: `achado` é o vocabulário central do `doctor`, usado em três páginas
# como se conhecido, e definido em zero. O mesmo valia para `enxerto` (#133).
#
# A régua confere UMA das duas direções, e é a barata: todo termo de
# `scripts/termos-overpower.txt` tem definição em `conceitos.md`. A outra direção,
# termo usado na prosa e ausente da lista, é juízo e mora na skill
# `varredura-overpower` — nenhuma varredura distingue vocabulário de produto de
# palavra comum.
#
# O casamento é por `**<termo>**`, que é como a página marca uma definição. Casar
# a palavra solta acharia toda menção e a lista nunca reprovaria.
#
# **Ela varre só o pt-BR, e isso é decisão, não esquecimento.** A lista carrega os
# termos em português; o `conceitos.md` do EN usa as palavras dele, e cobri-lo
# exigiria uma segunda lista para uma página que é tradução da primeira. Quem
# confere que a tradução acompanha é a paridade de árvore da cobrança 13, mais a
# varredura da ADR 11. A cobrança 16, ao lado, varre os dois — lá o heading é
# fixo por locale e não há vocabulário a traduzir.
echo "17  o vocabulário do ramo está definido"
TERMOS='conteudo/ferramentas/bibliotecas/overpower/conceitos.md'
LISTA='scripts/termos-overpower.txt'
if [ ! -f "$LISTA" ] || [ ! -f "$TERMOS" ]; then
  reprova "a lista de termos ou \`conceitos.md\` sumiu, e sem os dois a cobrança passaria calada"
else
  definidos=0
  while IFS="$(printf '\t')" read -r termo secao; do
    case "$termo" in ''|\#*) continue ;; esac
    definidos=$((definidos + 1))
    grep -qi -- "\*\*${termo}\*\*" "$TERMOS" ||
      reprova "o termo \`${termo}\` está na lista do ramo e \`conceitos.md\` não o define (§ ${secao})"
  done < "$LISTA"
  echo "   ${definidos} termos listados, e cada um com definição em \`conceitos.md\`"
fi
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 4 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/informacao.md — mude os dois lados, ou nenhum."
  exit 1
fi

echo "Portão 4 passou."
