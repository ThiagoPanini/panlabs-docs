#!/usr/bin/env bash
#
# Portão 5 — o gerador da Referência da API e o artefato commitado concordam.
#
# Cadência: commit.
#
# O contrato inteiro da #38 depende de uma coisa: `contratos/*.json` é a
# fonte, e as 24 páginas `.mdx` geradas mais `sidebars-api.js` são a
# PROJEÇÃO dela, commitada para que a instância `api` as leia como qualquer
# outra instância lê MDX. Se alguém editar uma página gerada à mão, ou editar
# o contrato sem rodar o gerador de novo, a fonte e a projeção divergem — e
# divergência silenciosa é a segunda fonte de verdade que o gerador existe
# para impedir.
#
# O mecanismo é o único do conjunto de portões que não é `grep`: roda o
# gerador de novo, e reprova se ele produzir qualquer diff contra o que já
# está commitado. Um gerador determinístico rodado duas vezes sobre o mesmo
# contrato produz bytes idênticos — se não produzir, ou o contrato mudou sem
# o gerador rodar, ou alguém editou a saída à mão.
#
# Procedência: docs/design/api-reference.md · issue #38.

set -uo pipefail

CAMINHOS_GERADOS=(
  'conteudo/api-reference/cobrancas'
  'conteudo/api-reference/clientes'
  'conteudo/api-reference/assinaturas'
  'conteudo/api-reference/reembolsos'
  'conteudo/api-reference/webhooks'
  'i18n/en/docusaurus-plugin-content-docs-api/current/cobrancas'
  'i18n/en/docusaurus-plugin-content-docs-api/current/clientes'
  'i18n/en/docusaurus-plugin-content-docs-api/current/assinaturas'
  'i18n/en/docusaurus-plugin-content-docs-api/current/reembolsos'
  'i18n/en/docusaurus-plugin-content-docs-api/current/webhooks'
  'sidebars-api.js'
)

echo "Portão 5 — o gerador da Referência da API"
echo

if ! node scripts/gerar-api.mjs; then
  echo
  echo "Portão 5 REPROVOU — o gerador não rodou até o fim."
  echo "O erro acima (validador, ou contrato malformado) é a causa."
  exit 1
fi
echo

if ! git diff --exit-code -- "${CAMINHOS_GERADOS[@]}"; then
  echo
  echo "Portão 5 REPROVOU — o gerador produziu um resultado diferente do que está commitado."
  echo
  echo "Ou uma página gerada foi editada à mão (a saída não é editável — cada"
  echo "arquivo diz isso no topo do front matter), ou contratos/*.json mudou sem"
  echo "rodar \`npm run gerar:api\` de novo antes do commit."
  exit 1
fi

echo "Portão 5 passou — o artefato commitado é exatamente o que o gerador produz."
