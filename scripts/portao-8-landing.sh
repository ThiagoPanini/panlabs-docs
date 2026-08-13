#!/usr/bin/env bash
#
# Portão 8 — a licença de "wow" da landing, em contagem.
#
# Cadência: commit.
#
# Ele é irmão do portão 1: mesma forma de script, mesma remoção de comentário
# antes da varredura, mesma saída de contagem.
#
# ---------------------------------------------------------------------------
# POR QUE ELE É PORTÃO E NÃO VERIFICAÇÃO
#
# A régua do `docs/design/README.md` §5 separa as duas coisas: portão protege uma
# REGRA DE ESCRITA; verificação confere que duas cópias da mesma verdade não
# divergiram. Este protege uma regra de escrita, e ela é esta:
#
#   **A landing pode ter isto, e nada mais.**
#
# *"Impacto sem extravagância"* não sobrevive como adjetivo — adjetivo não passa
# por revisão. Ele vira uma lista fechada de seis efeitos, cada um com contagem
# exata, mais a metade negativa. **Um sétimo item é extravagância por definição**,
# e o modo de ele entrar não é alguém decidir que pode: é alguém acrescentar um
# efeito sem perceber que a lista era fechada.
#
# Dissenso registrado: é o oitavo portão num projeto que já tem sete, e ele
# protege UMA página. A alternativa — deixar a lista como prosa — foi recusada
# porque uma lista de contagens que ninguém conta é adjetivo com tabela.
#
# ---------------------------------------------------------------------------
# UMA CORREÇÃO DE FATO CONTRA O TICKET QUE PEDIU ESTE PORTÃO
#
# A linha 6 foi escrita como *"1 consumidor de `--sd-shadow-raised`"*, site
# inteiro. **Medido: são dois** — o botão primário da landing e o painel da
# Referência da API, e `tokens.css` já dizia isso por escrito na seção de
# elevação. A contagem que de fato vale é a da landing, e é a que este portão
# cobra: **uma sombra NA LANDING**. A régua não afrouxou; ela passou a dizer o
# que media.

set -uo pipefail

MODULO_DA_LANDING='src/pages/index.module.css'
ROTA_DA_LANDING='src/pages/index.js'
PADRAO_DE_LITERAL='#[0-9a-fA-F]{3,8}\b|[0-9.]+(px|rem|em|ms|s)\b|cubic-bezier|oklch\(|rgb\(|hsl\('

# A varredura cobre DECLARAÇÃO, não prosa: comentário sai antes, com o número de
# linha preservado. Mesmo mecanismo dos portões 1, 2 e 3.
css() { find src -name '*.css' -exec awk -f scripts/css-sem-comentario.awk {} +; }
css_da_landing() { awk -f scripts/css-sem-comentario.awk "$MODULO_DA_LANDING"; }
js() { find src -name '*.js' -exec awk -f scripts/js-sem-comentario.awk {} +; }

falhas=0

# Uma linha da lista: nome, contagem esperada, contagem medida, e o que ela
# protege. Imprime sempre — a saída deste portão É a lista de seis, e ler a saída
# é ler a licença.
confere() {
  local numero="$1" nome="$2" esperado="$3" medido="$4"
  # `%-34s` do printf conta BYTE, e os rótulos têm travessão — a coluna sairia
  # torta. `${#nome}` conta caractere, então o recuo é calculado aqui.
  local recuo=$((34 - ${#nome}))
  if [ "$medido" = "$esperado" ]; then
    printf '  %s  %s%*s  %s  ok\n' "$numero" "$nome" "$recuo" '' "$medido"
  else
    printf '  %s  %s%*s  %s  REPROVOU (esperado %s)\n' "$numero" "$nome" "$recuo" '' "$medido" "$esperado"
    falhas=$((falhas + 1))
  fi
}

echo "Portão 8 — a landing pode ter isto e nada mais"
echo

# --- 1 · a faixa escura sangrada ---------------------------------------------
# A ilha é UMA região no site inteiro. A contagem é sobre o atributo no JSX, que
# é onde o elemento nasce; no CSS o nome aparece em vários seletores de propósito.
faixas=$(js | grep -cE 'data-sd-showcase')
confere 1 'faixa escura — data-sd-showcase' 1 "$faixas"

# --- 2 · dois focos de luz ----------------------------------------------------
# Não basta contar dois `radial-gradient`: eles precisam estar DENTRO da regra da
# ilha. Um gradiente igual declarado em `:root` acenderia o site inteiro e
# passaria numa contagem cega. Ver `scripts/seletor-do-gradiente.awk`.
gradientes=$(css | awk -f scripts/seletor-do-gradiente.awk)
focos=$(printf '%s' "$gradientes" | grep -c . )
confere 2 'focos de luz — radial-gradient' 2 "$focos"

fora_da_ilha=$(printf '%s\n' "$gradientes" | grep -v $'^\\[data-sd-showcase\\]\t') || true
if [ -n "$fora_da_ilha" ] && [ "$focos" != "0" ]; then
  echo
  echo "     REPROVOU — gradiente fora da regra \`[data-sd-showcase]\`:"
  printf '     %s\n' "$fora_da_ilha"
  echo
  echo "     O glow mora na camada de componente da ilha. Em \`:root\` ele vaza"
  echo "     para o site inteiro, e a confinação deixa de ser fato de escopo."
  falhas=$((falhas + 1))
fi

# --- 3 · um loop ambiente -----------------------------------------------------
# A respiração do magenta, e nada mais respira no projeto. O cyan é luz parada.
loops=$(css | grep -cE '\binfinite\b')
confere 3 'loop ambiente — infinite' 1 "$loops"

# --- 4 · um reveal por rolagem ------------------------------------------------
# Só a DECLARAÇÃO conta. O prelúdio `@supports (animation-timeline: view())`
# carrega o mesmo texto e não é um segundo reveal — contá-lo daria dois onde há
# um, que é como um portão vira ruído.
reveals=$(css | grep -cE '^[^:]+:[0-9]+:[[:space:]]*animation-timeline:')
confere 4 'reveal por rolagem — timeline' 1 "$reveals"

# --- 5 · um degrau de tipo acima do site --------------------------------------
# O consumidor único de `--sd-type-6xl`. O `5xl` saiu da escala em vez de ficar
# declarado sem ninguém que o leia.
displays=$(css | grep -cE 'var\(--sd-type-6xl\)')
confere 5 'degrau de display — type-6xl' 1 "$displays"

orfao=$(css | grep -E -- '--sd-type-5xl') || true
if [ -n "$orfao" ]; then
  echo
  echo "     REPROVOU — \`--sd-type-5xl\` voltou:"
  printf '     %s\n' "$orfao"
  falhas=$((falhas + 1))
fi

# --- 6 · uma sombra de conteúdo -----------------------------------------------
# NA LANDING. Ver a correção de fato no cabeçalho: o segundo consumidor do
# projeto é o painel da Referência da API, e ele não é assunto desta página.
sombras=$(css_da_landing | grep -cE 'var\(--sd-shadow-raised\)')
confere 6 'sombra de conteúdo — na landing' 1 "$sombras"

echo
echo "  a metade negativa"

# --- zero `@keyframes` novo ---------------------------------------------------
# Quatro no projeto inteiro: busca, entrada da ilha, respiração e reveal. A
# landing consome três deles e não define nenhum.
quadros=$(css | grep -cE '@keyframes')
confere '·' 'keyframes no projeto' 4 "$quadros"

# --- zero componente novo -----------------------------------------------------
# A landing COMPÕE o catálogo; ela não inventa arquivo. Dois arquivos em
# `src/pages/`, e todo import de componente aponta para arquivo que já existe.
arquivos_da_rota=$(find src/pages -type f | sort | tr '\n' ' ')
confere '·' 'arquivos em src/pages' 'src/pages/index.js src/pages/index.module.css ' "$arquivos_da_rota"

for importado in $(grep -oE "@site/src/components/[A-Za-z]+" "$ROTA_DA_LANDING" | sort -u); do
  alvo="src/components/${importado##*/}.js"
  if [ ! -f "$alvo" ]; then
    echo "     REPROVOU — a landing importa \`$importado\`, e $alvo não existe."
    falhas=$((falhas + 1))
  fi
done

# --- zero literal no CSS Module da landing ------------------------------------
# O portão 1 já cobra isto em `src/` inteiro. A perna existe aqui para a lista
# fechar num lugar só: quem lê a saída deste portão lê a licença inteira, sem
# precisar cruzar com outro script.
literais=$(css_da_landing \
  | grep -E "$PADRAO_DE_LITERAL" \
  | grep -vE '^[^:]+:[0-9]+:[[:space:]]*@media') || true
confere '·' 'literais no módulo da landing' 0 "$(printf '%s' "$literais" | grep -c . )"

# --- zero `z-index` -----------------------------------------------------------
# As camadas saem da ordem de árvore. O projeto não tem escala de z-index, e esta
# rota não abre uma.
camadas=$(css_da_landing | grep -cE '\bz-index\b')
confere '·' 'z-index no módulo da landing' 0 "$camadas"

echo
if [ "$falhas" -gt 0 ]; then
  echo "Portão 8 REPROVOU em $falhas linha(s)."
  echo
  echo "A lista é FECHADA. Se o efeito novo vale a pena, ele entra no lugar de"
  echo "um dos seis — e isso é revisão de design em docs/design/landing.md §7,"
  echo "não commit. Um sétimo item é extravagância por definição."
  exit 1
fi

echo "Portão 8 passou — os seis efeitos, e nenhum sétimo."
