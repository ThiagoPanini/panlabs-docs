#!/usr/bin/env bash
#
# Portão 7 — a superfície de swizzle congelada, e `src/theme/` conferido contra ela.
#
# Cadência: UPGRADE. É o único portão da segunda cadência do repositório, e é por
# isso que ele não entra em `npm run portoes` — rodá-lo a cada commit custaria
# dez segundos de `swizzle --list` para conferir uma coisa que só muda quando o
# `@docusaurus/theme-classic` muda de versão.
#
# ---------------------------------------------------------------------------
# Por que ele é 7 e não 5
#
# A resolução do slice o chamava de *portão 5*. O número 5 já estava gasto: o
# slice da Referência da API o deu ao portão do gerador, e o ADR 5 o cita pelo
# número. Renumerar um portão commitado, citado por ADR, por script e por
# `package.json`, para satisfazer um número escrito antes de ele existir, é
# churn — e churn que quebra uma citação de ADR.
#
# Consequência de aritmética, escrita em voz alta: **o projeto tem SETE
# portões**, não seis. A contagem de seis vale até este slice.
# ---------------------------------------------------------------------------
#
# O mecanismo, e o que só ele enxerga: a doc do Docusaurus diz que um componente
# renomeado no upstream faz o arquivo swizzlado ser **completamente ignorado**,
# sem erro. Nenhum build reprova, porque não há nada errado a reprovar — a
# customização simplesmente para de existir. Congelar a lista e diffá-la é o
# único jeito de ver isso acontecer.
#
# Procedência: docs/design/swizzle.md §5 · ADR 2.

set -uo pipefail

echo "Portão 7 — a superfície de swizzle"
echo

if ! node scripts/swizzle-list.mjs --verificar; then
  echo
  echo "Portão 7 REPROVOU."
  exit 1
fi
