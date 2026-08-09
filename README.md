# shinydoc-docusaurus

Projeto de **documentação de referência** construído com Docusaurus.

O conteúdo é mockado e descartável — documenta uma plataforma developer-facing fictícia com API. O produto é a **estrutura** e a **customização visual**: um boilerplate que mostra até onde dá para levar o Docusaurus sem sair do preset `classic`.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Estado

**Completo.** O [mapa de wayfinding](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/1) fechou — vinte e sete tickets, sete de pesquisa e vinte de decisão — e o colapso dele numa [spec executável](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/30) partiu o trabalho em **sete slices verticais**. Cada slice entregou uma superfície funcionando *e* o documento de design que a especifica, na mesma sentada.

| Slice | O que entrega | Estado |
| ---: | --- | --- |
| 1 | [Bala traçante](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/34) — o site no ar com o sistema de tokens inteiro | feito |
| 2 | [A página de documentação](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/35) — chrome, ícones, árvore | feito |
| 3 | [O catálogo](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/36) — os dezoito componentes de conteúdo | feito |
| 4 | [O conteúdo do Trilho](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/37) — 43 páginas autorais e o EN parcial | feito |
| 5 | [A Referência da API](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/38) — contrato, gerador e três colunas | feito |
| 6 | [A landing](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/39) — cinco seções e a ilha de espetáculo | feito |
| 7 | [Busca e artefatos AI-era](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/40) — e o fechamento da spec | feito |

**73 páginas em três abas**, landing, busca, artefatos AI-era e dois locales. A spec são trinta e um arquivos mais sete ADRs, e a espinha dela é [`docs/design/README.md`](docs/design/README.md).

**O axioma 6 foi cobrado, e não só declarado.** O [§6 da espinha](docs/design/README.md) registra o teste de reconstrução: uma sessão de agente limpa, com `docs/design/` e `docs/adr/` e nada mais, reconstruiu a camada de tokens e a página de documentação sobre um Docusaurus vazio. **O build passou nos dois locales.**

O veredito é de três níveis — *sim* na camada de tokens, *sim com ressalvas* no chrome estrutural, *não* no acabamento — e o teste devolveu **quatro erros de fato na spec**, três já corrigidos e um em aberto por precisar de medição. O padrão que ele expôs: a spec é impecável onde descreve mecanismo e derivação declarada, e é muda onde precisaria de um valor que ninguém mediu.

## Rodar

```bash
npm ci
npm start                    # dev — não testa link quebrado nem host
npm run build && npm run serve

npm run portoes              # portões 1 a 5, cadência de commit
npm run portao:7             # o swizzle --list congelado, cadência de upgrade
npm run portao:6 -- <url>    # as três rotas contra o host, cadência de implantação

npm test                     # a régua do algoritmo da busca
npm run invariantes          # as quatro invariantes de forma da spec
npm run zeros                # os cinco zeros, conferidos e não afirmados
npm run icones               # a bijeção manifesto ↔ static/icons/
```

## Onde está o quê

| Caminho | Papel |
| --- | --- |
| [`docs/adr/`](docs/adr/) | Os sete ADRs. **Leitura obrigatória antes de escrever código.** |
| [`docs/design/README.md`](docs/design/README.md) | **A espinha da spec** — ordem de leitura, a régua, o índice, as invariantes e os sete portões. Comece por aqui. |
| [`docs/design/principios.md`](docs/design/principios.md) | A âncora, os quatro deltas deliberados e as cinco classes de procedência. |
| [`docs/agents/`](docs/agents/) | Como um agente trabalha neste repo — tracker, domínio, labels, fluxo. |
| [`docs/research/`](docs/research/) | Índice das sete pesquisas. O material mora em branches `research/*`. |
| `src/css/tokens.css` | **A sede única de valor.** O único arquivo do repo com literal. |
| `src/css/custom.css` | As regras de base. Zero literal, e nunca lê `--ifm-*`. |
| `src/css/chrome.css` | O shell da página de doc — proporções, navbar, sidebar, TOC, footer, estreito. |
| `src/css/foco.css` | O contrato de estado de entrada. **O único arquivo onde `outline` pode aparecer.** |
| `src/icons/manifest.js` | **O contrato de ícones** — 63 nomes, 66 tags, teto 64. Os desenhos são skin; os nomes não. |
| `src/theme/` | Componente de tema próprio, registro, e o **único swizzle** do projeto — ver `docs/design/swizzle.md`. |
| `src/plugins/` | Os dois plugins de caminho: a busca e os artefatos AI-era. Nenhum é dependência npm. |
| `static/icons/` | Os 63 desenhos vendorizados do Lucide (ISC). Trocáveis. |
| `conteudo/` | O conteúdo do Trilho, o produto fictício. Fica fora de `docs/`, que é a documentação *deste* repositório. |
| `scripts/` | Os portões, o espelho de `tokens.md` e o vendorizador de ícones. |

## Restrições travadas

- **Docusaurus é inegociável** — restrição do ambiente alvo.
- **Vanilla-first** — zero dependências novas: preset `classic`, CSS/CSS Modules, swizzle, MDX.
- **Skin trocável** — o produto é a arquitetura de tokens; a paleta é demonstração.
- **Light + dark**, com dark canônico.
- Conteúdo em **pt-BR**, com EN como segundo locale.

O porquê de cada uma está em [`docs/agents/domain.md`](docs/agents/domain.md) e nos tickets do mapa.
