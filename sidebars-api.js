// @ts-check

/**
 * A sidebar da tab `Referência da API` — instância `api`.
 *
 * **Este arquivo é gerado.** `scripts/gerar-api.mjs` o emite a partir dos
 * dois contratos em `contratos/` mais o pequeno manifesto de folhas
 * autorais que o próprio gerador conhece (Introdução e o catálogo de
 * eventos). Editar à mão é a segunda fonte de verdade que o gerador existe
 * para impedir — o portão 5 roda o gerador de novo em CI e reprova em
 * `git diff --exit-code`.
 *
 * A árvore fechada é **6 · 0 · 6**: seis categorias de topo, as mesmas seis
 * regras da tab `Documentação`, e os mesmos doze pares seção→ícone.
 *
 * Procedência: docs/design/informacao.md · docs/design/api-reference.md.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  api: [
    {
      "type": "category",
      "label": "Introdução",
      "className": "sidebar-icone sidebar-icone--introducao",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "introducao/visao-geral"
      },
      "items": [
        "introducao/autenticacao",
        "introducao/url-base-e-versao",
        "introducao/erros",
        "introducao/idempotencia"
      ]
    },
    {
      "type": "category",
      "label": "Cobranças",
      "className": "sidebar-icone sidebar-icone--cobrancas",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "cobrancas/objeto-cobranca"
      },
      "items": [
        "cobrancas/criar-cobranca",
        "cobrancas/listar-cobrancas",
        "cobrancas/obter-cobranca",
        "cobrancas/cancelar-cobranca",
        "cobrancas/capturar-cobranca"
      ]
    },
    {
      "type": "category",
      "label": "Clientes",
      "className": "sidebar-icone sidebar-icone--clientes",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "clientes/objeto-cliente"
      },
      "items": [
        "clientes/criar-cliente",
        "clientes/listar-clientes",
        "clientes/obter-cliente",
        "clientes/atualizar-cliente",
        "clientes/remover-cliente"
      ]
    },
    {
      "type": "category",
      "label": "Assinaturas",
      "className": "sidebar-icone sidebar-icone--assinaturas",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "assinaturas/objeto-assinatura"
      },
      "items": [
        "assinaturas/criar-assinatura",
        "assinaturas/listar-assinaturas",
        "assinaturas/obter-assinatura",
        "assinaturas/atualizar-assinatura",
        "assinaturas/cancelar-assinatura"
      ]
    },
    {
      "type": "category",
      "label": "Reembolsos",
      "className": "sidebar-icone sidebar-icone--reembolsos",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "reembolsos/objeto-reembolso"
      },
      "items": [
        "reembolsos/criar-reembolso",
        "reembolsos/listar-reembolsos",
        "reembolsos/obter-reembolso"
      ]
    },
    {
      "type": "category",
      "label": "Webhooks",
      "className": "sidebar-icone sidebar-icone--webhooks",
      "collapsed": false,
      "link": {
        "type": "doc",
        "id": "webhooks/objeto-evento"
      },
      "items": [
        "webhooks/catalogo-de-eventos",
        "webhooks/listar-eventos"
      ]
    }
  ],
};

export default sidebars;
