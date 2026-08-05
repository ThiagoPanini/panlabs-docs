# Pesquisas

As pesquisas deste repo **não moram na `main`**. Cada uma vive num branch `research/<nome>`, e o achado sintetizado está no comentário de resolução da issue correspondente — a convenção que `docs/agents/issue-tracker.md` declara.

Este arquivo existe porque a convenção tem um custo: a partir da `main`, a base de evidências é invisível. Aqui está o índice.

## Como ler uma pesquisa

Para a síntese, abra a issue — ela é autossuficiente para decidir. Para o material medido completo:

```bash
git show origin/research/<nome>:docs/research/<nome>.md
# ou, para navegar:
git checkout research/<nome>
```

## Índice

Sete pesquisas alimentam o [mapa de wayfinding](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/1). Todas mediram fonte primária — CSS servido, tarball publicado no npm, Docusaurus real de pé — e declaram explicitamente o que **não** conseguiram medir.

| Branch | Issue | Tamanho | O que mediu |
| --- | --- | --- | --- |
| `research/chrome-referencias` | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) | 501 linhas | Chrome e arquitetura de informação das referências. Achou as **17 variáveis** que são toda a superfície de customização do Mintlify, e que a rampa de onze cinzas é tingida com o matiz da marca. |
| `research/sistema-visual-medido` | [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) | 721 linhas | Paleta, tipografia, espaçamento, forma, motion e breakpoints, **site a site**. Provou a identidade byte a byte do CSS Mintlify (MD5 idêntico em quatro hosts). |
| `research/componentes-conteudo` | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) | 1.198 linhas | Anatomia de reconstrução do conjunto de componentes. Mediu **uso zero** de metade do catálogo em 1.740 páginas, e identificou Vapi como **Fern**, não Mintlify. |
| `research/docusaurus-infima-swizzle` | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) | 1.214 linhas | Fronteiras reais de customização do Docusaurus v3, lidas dos **tarballs publicados no npm**. A armadilha de especificidade do `html[data-theme='dark']` sai daqui. |
| `research/api-reference-vanilla` | [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) | 849 linhas | Quanto do playground sobra em vanilla. Achou que `docItemComponent` entrega o layout de três colunas **sem swizzle**. |
| `research/busca-i18n-versionamento` | [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7) | 750 linhas | Mecânica dos três e o impacto no chrome. Levantou os bloqueadores **jurídicos** do Algolia DocSearch, e a rota local que não viola o vanilla-first. |
| `research/recursos-ai-era` | [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8) | 543 linhas | `llms.txt`, Markdown por rota e o controle de copiar/abrir — medido num **Docusaurus 3.10.2 real**, com o plugin escrito e o build rodado. |

## Por que os branches não são mergeados

Pesquisa é insumo datado, não contrato. Ela alimenta decisões e depois envelhece — o Docusaurus sobe de versão, o Mintlify muda o CSS, o Algolia muda os termos. Manter o material na `main` daria a ele um status de verdade corrente que ele não tem.

O que vira verdade corrente atravessa a decisão: sai da pesquisa, passa por um ticket do mapa, e aterrissa em `docs/design/` ou em `docs/adr/` já filtrado. **O branch preserva a medição; a spec carrega a conclusão.**
