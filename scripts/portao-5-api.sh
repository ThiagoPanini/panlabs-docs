#!/usr/bin/env bash
#
# Portão 5 — a referência gerada de contrato.
#
# Cadência: commit.
#
# **Este portão está entre dois contratos, e o estado vai cobrado em vez de
# assumido.** O gerador de OpenAPI morreu junto com o Trilho: sem serviço HTTP
# fictício não há `paths`, não há verbo, e o `VerbBadge` que pintava o verbo saiu
# do catálogo. O gerador que entra no lugar descreve **assinatura de função,
# tipo e módulo**, e ele é o ticket seguinte — junto com o fragmento de sidebar
# que declara as seis páginas de `Ferramentas › Bibliotecas › Biblioteca C`.
#
# A disciplina do ADR 5 não morreu com a premissa dele, e é ela que este portão
# guarda enquanto o gerador não chega: **saída gerada é projeção de um contrato,
# nunca arquivo editado à mão.** O modo de essa disciplina apodrecer é alguém
# escrever à mão, no vão entre os dois tickets, uma página que o gerador vai
# reivindicar depois — e aí a fonte e a projeção nascem divergentes, que é
# exatamente o defeito que o gerador existe para impedir.
#
# São três cobranças, e as três descrevem uma AUSÊNCIA declarada:
#
#   1. nenhum contrato em `contratos/`      o par novo chega com o gerador
#   2. nenhum gerador em `scripts/`         `gerar-api` não sobrevive ao nome
#   3. nenhuma página gerada no acervo      nem `.mdx`, nem `api_exemplos`, nem
#                                           fragmento de sidebar importado
#
# **Quando o ticket seguinte chegar, este arquivo é reescrito inteiro** — ele
# volta a rodar o gerador e a diffar a saída commitada, que é a forma que a
# disciplina tem quando há o que gerar. O número continua sendo 5: o [ADR
# 5](../docs/adr/0005-referencia-da-api-gerada-de-contrato.md) cita o portão
# pelo número, e renumerar um portão citado por ADR, por script e por
# `package.json` é churn que quebra uma citação.
#
# Procedência: docs/design/informacao.md §3 · docs/adr/0005.

set -uo pipefail

falhas=0

reprova() {
  echo "  REPROVOU — $1"
  falhas=$((falhas + 1))
}

echo "Portão 5 — a referência gerada de contrato"
echo

# --- 1. o contrato ------------------------------------------------------------
echo "1  contrato"
if [ -d contratos ] && [ -n "$(find contratos -name '*.json' 2>/dev/null)" ]; then
  reprova "há contrato em contratos/ e nenhum gerador que o leia — um dos dois está adiantado"
else
  echo "   nenhum: o par monolíngue congruente chega com o gerador de assinatura"
fi
echo

# --- 2. o gerador -------------------------------------------------------------
echo "2  gerador"
if [ -f scripts/gerar-api.mjs ]; then
  reprova "scripts/gerar-api.mjs existe, e o nome mente: o contrato não é mais API HTTP"
else
  echo "   nenhum: \`gerar-api\` não sobrevive ao contrato que deixou de falar HTTP"
fi
echo

# --- 3. a projeção ------------------------------------------------------------
#
# As três formas que uma página gerada teria: a extensão que o gerador emite, o
# front matter que acende a perna do painel no `ApiDocItem`, e o fragmento de
# sidebar que `sidebars-ferramentas.js` importaria. Nenhuma existe ainda, e as
# três são conferidas porque cada uma sozinha bastaria para a projeção começar a
# viver fora do contrato.
echo "3  projeção"
mdx=$(find conteudo i18n -name '*.mdx' 2>/dev/null)
if [ -n "$mdx" ]; then
  reprova "\`.mdx\` no acervo, e a saída do gerador é a única coisa que usa a extensão:"
  echo "$mdx" | sed 's/^/    /'
fi

exemplos=$(grep -Rl '^api_exemplos:' --include='*.md' conteudo 2>/dev/null) || true
if [ -n "$exemplos" ]; then
  reprova "página declarando \`api_exemplos\` sem gerador que a produza:"
  echo "$exemplos" | sed 's/^/    /'
fi

if grep -q '^import ' sidebars-ferramentas.js; then
  reprova "sidebars-ferramentas.js importa um fragmento, e o ramo gerado é do ticket seguinte"
fi

[ "$falhas" = 0 ] &&
  echo "   nenhuma: as 6 páginas de Biblioteca C e o fragmento que as declara são do ticket seguinte"
echo

if [ "$falhas" -gt 0 ]; then
  echo "Portão 5 REPROVOU em ${falhas} verificação(ões)."
  echo "A régua está em docs/design/informacao.md — o ramo gerado entra INTEIRO, com contrato, gerador e portão."
  exit 1
fi

echo "Portão 5 passou — a referência gerada está declarada pendente, e nada a antecipou pela metade."
