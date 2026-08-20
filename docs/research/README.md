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

Sete pesquisas alimentam o [mapa de wayfinding](https://github.com/ThiagoPanini/panlabs-docs/issues/1). Todas mediram fonte primária — CSS servido, tarball publicado no npm, Docusaurus real de pé — e declaram explicitamente o que **não** conseguiram medir.

| Branch | Issue | Tamanho | O que mediu |
| --- | --- | --- | --- |
| `research/chrome-referencias` | [#2](https://github.com/ThiagoPanini/panlabs-docs/issues/2) | 501 linhas | Chrome e arquitetura de informação das referências. Achou as **17 variáveis** que são toda a superfície de customização do Mintlify, e que a rampa de onze cinzas é tingida com o matiz da marca. |
| `research/sistema-visual-medido` | [#3](https://github.com/ThiagoPanini/panlabs-docs/issues/3) | 721 linhas | Paleta, tipografia, espaçamento, forma, motion e breakpoints, **site a site**. Provou a identidade byte a byte do CSS Mintlify (MD5 idêntico em quatro hosts). |
| `research/componentes-conteudo` | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) | 1.198 linhas | Anatomia de reconstrução do conjunto de componentes. Mediu **uso zero** de metade do catálogo em 1.740 páginas, e identificou Vapi como **Fern**, não Mintlify. |
| `research/docusaurus-infima-swizzle` | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) | 1.214 linhas | Fronteiras reais de customização do Docusaurus v3, lidas dos **tarballs publicados no npm**. A armadilha de especificidade do `html[data-theme='dark']` sai daqui. |
| `research/api-reference-vanilla` | [#6](https://github.com/ThiagoPanini/panlabs-docs/issues/6) | 849 linhas | Quanto do playground sobra em vanilla. Achou que `docItemComponent` entrega o layout de três colunas **sem swizzle**. |
| `research/busca-i18n-versionamento` | [#7](https://github.com/ThiagoPanini/panlabs-docs/issues/7) | 750 linhas | Mecânica dos três e o impacto no chrome. Levantou os bloqueadores **jurídicos** do Algolia DocSearch, e a rota local que não viola o vanilla-first. |
| `research/recursos-ai-era` | [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) | 543 linhas | `llms.txt`, Markdown por rota e o controle de copiar/abrir — medido num **Docusaurus 3.10.2 real**, com o plugin escrito e o build rodado. |

## As pesquisas do mapa do `mint`

Duas alimentam o [segundo mapa](https://github.com/ThiagoPanini/panlabs-docs/issues/49), que troca o tema de `almond` para `mint` e substitui o Trilho por um acervo pessoal de aprendizado. Mesma convenção: material no branch, síntese na issue.

| Branch | Issue | Tamanho | O que mediu |
| --- | --- | --- | --- |
| `research/devin-mint` | [#50](https://github.com/ThiagoPanini/panlabs-docs/issues/50) | 1.251 linhas | O Devin remedido no tema `mint`, agora como **referência única**. Achou que **o CSS do Mintlify mudou embaixo** — MD5 novo, o antigo dá 404 —, que a página é **plana** (zero elevação em seis páginas) e que o `mint` precisa de **dois limiares**, não cinco. **Desmentiu quatro valores da medição anterior**, entre eles o trilho do TOC, que é 304 e não 448. |
| `research/faixa-de-tabs` | [#51](https://github.com/ThiagoPanini/panlabs-docs/issues/51) | — | Se a faixa de tabs de largura total custa um swizzle `unsafe`. **Não custa:** degraus 0+1+2, portão 7 verde com ela montada, e o fundo sangra porque quem pinta é o próprio `<nav>`. Corrigiu a **perda 4**, que está errada em três documentos. |
| `research/paridade-devin` | [#92](https://github.com/ThiagoPanini/panlabs-docs/issues/92) | 521 linhas | Quanto o site está longe da âncora, em número. Três medições de primeira mão — a âncora em cinco larguras nos dois temas, o site atual pela mesma régua, e a varredura da página de API com o catálogo. Achou o **defeito de origem da cor**: a âncora tinge a rampa com o matiz da marca mas **não pinta a página com ela**, e nós pintamos — daí o chão magenta. É de onde saem as **tabelas de alvo** publicadas na spec pela [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93), e a **seção 3 (Paleta) fechou nos dois temas** com a [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95): rampa desacoplada da marca, chão neutro com token próprio, acento violeta — **hoje laranja queimado**, h≈38, com o croma 0,161 que a #95 fixou intacto. |

**A primeira mediu com Chrome headless dirigido por CDP, e sem dependência nova** — o Node 24 tem `WebSocket` nativo. O axioma 2 vale também para o instrumento de medição, e é por isso que nem puppeteer nem playwright entraram. **A última fez o mesmo, e virou ferramenta:** o `npm run paridade` da [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) é esse instrumento apontado para as tabelas de alvo, e roda na CI como relatório.

## O teste de reconstrução

Não é pesquisa — é o **contrário** dela. As sete acima alimentaram as decisões; esta cobra o resultado. Mesma convenção de branch, pelo mesmo motivo: o material é longo e a síntese mora onde a decisão se lê.

| Branch | Onde a síntese mora | Tamanho | O que mediu |
| --- | --- | --- | --- |
| `research/reconstrucao-axioma-6` | [`docs/design/README.md`](../design/README.md) §6 | 522 linhas | O **axioma 6**, cobrado: uma sessão de agente que só recebeu `docs/design/` e `docs/adr/` reconstruiu a camada de tokens e a página de documentação sobre um Docusaurus vazio. Build verde nos dois locales; **vinte e cinco reinterpretações e quatro erros de fato** na spec. |

## Por que os branches não são mergeados

Pesquisa é insumo datado, não contrato. Ela alimenta decisões e depois envelhece — o Docusaurus sobe de versão, o Mintlify muda o CSS, o Algolia muda os termos. Manter o material na `main` daria a ele um status de verdade corrente que ele não tem.

O que vira verdade corrente atravessa a decisão: sai da pesquisa, passa por um ticket do mapa, e aterrissa em `docs/design/` ou em `docs/adr/` já filtrado. **O branch preserva a medição; a spec carrega a conclusão.**
