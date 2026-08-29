# panlabs-docs

Projeto de **documentação de referência** construído com Docusaurus.

O conteúdo documenta o `panlabs`, o acervo de aprendizado de um desenvolvedor dentro de uma empresa que nunca é nomeada. O produto é a **estrutura** e a **customização visual**: um boilerplate que mostra até onde dá para levar o Docusaurus sem sair do preset `classic`.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Estado

**Completo, e transplantado.** O [mapa de wayfinding](https://github.com/ThiagoPanini/panlabs-docs/issues/1) fechou, e o colapso dele numa [spec executável](https://github.com/ThiagoPanini/panlabs-docs/issues/30) partiu o trabalho em **sete slices verticais**. Cada slice entregou uma superfície funcionando *e* o documento de design que a especifica.

| Slice | O que entrega | Estado |
| ---: | --- | --- |
| 1 | [Bala traçante](https://github.com/ThiagoPanini/panlabs-docs/issues/34) — o site no ar com o sistema de tokens inteiro | feito |
| 2 | [A página de documentação](https://github.com/ThiagoPanini/panlabs-docs/issues/35) — chrome, ícones, árvore | feito |
| 3 | [O catálogo](https://github.com/ThiagoPanini/panlabs-docs/issues/36) — os componentes de conteúdo | feito |
| 4 | [O conteúdo](https://github.com/ThiagoPanini/panlabs-docs/issues/37) — as páginas autorais e o EN parcial | feito |
| 5 | [A referência gerada](https://github.com/ThiagoPanini/panlabs-docs/issues/38) — contrato, gerador e três colunas | feito |
| 6 | [A landing](https://github.com/ThiagoPanini/panlabs-docs/issues/39) — a ilha de espetáculo | feito, e a página **removida depois** ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) |
| 7 | [Busca e artefatos AI-era](https://github.com/ThiagoPanini/panlabs-docs/issues/40) — e o fechamento da spec | feito |

**33 páginas autorais mais 4 geradas em quatro abas** — 37 no total —, mais 31 traduções, busca, artefatos AI-era e dois locales. A rota `/` não é página: ela **redireciona** para `/ferramentas`, a rota nua da primeira aba do navbar.

> **A spec de design saiu da árvore** ([#152](https://github.com/ThiagoPanini/panlabs-docs/issues/152)). Os 29 arquivos de `docs/design/` deixaram de ser o entregável quando o transplante aconteceu, e continuavam agindo como contrato que já não vinculava. Eles estão inteiros na tag **`spec-v1`**: `git show spec-v1:docs/design/README.md` lê um, `git checkout spec-v1 -- docs/design/` traz todos de volta. Os ADRs ficaram, e são o registro que sobrevive com utilidade.

## Rodar

```bash
npm ci
npm start                        # dev — não testa link quebrado nem host
npm run build && npm run serve   # a CI inteira é o build
```

`npm run build` é o único passo da CI, e é o que o check `gate` reporta. Ele é também o único lugar onde link quebrado reprova: `onBrokenLinks: 'throw'` não roda em `docusaurus start`.

## Onde está o quê

| Caminho | Papel |
| --- | --- |
| [`CONTEXT.md`](CONTEXT.md) | **O glossário e os axiomas.** Comece por aqui. |
| [`docs/adr/`](docs/adr/) | Os doze ADRs. **Leitura obrigatória antes de escrever código.** |
| [`docs/agents/`](docs/agents/) | Como um agente trabalha neste repo — tracker, domínio, labels, fluxo. |
| [`docs/research/`](docs/research/) | Índice das pesquisas. O material mora em branches `research/*`. |
| `content/` | O acervo `panlabs`, o conteúdo publicado — `jornadas/`, `procedimentos/`, `ferramentas/`, `times/`. Fica fora de `docs/`, que é a documentação *deste* repositório. |
| `contracts/` | Os contratos de assinatura do `overpower`, nos dois locales. O `prebuild` os projeta na referência gerada. |
| `src/css/tokens.css` | **A sede única de valor.** O único arquivo do repo com literal. |
| `src/css/custom.css` | As regras de base. Zero literal, e nunca lê `--ifm-*`. |
| `src/css/chrome.css` | O shell da página de doc — proporções, navbar, sidebar, TOC, footer, estreito. |
| `src/css/focus.css` | O contrato de estado de entrada. **O único arquivo onde `outline` pode aparecer.** |
| `src/icons/manifest.js` | **O contrato de ícones** — os nomes são contrato, os desenhos são skin. |
| `src/theme/` | Componente de tema próprio, registro, e o **único swizzle** do projeto. O racional está no [ADR 2](docs/adr/0002-politica-de-swizzle.md). |
| `src/plugins/` | Os dois plugins de caminho: a busca e os artefatos AI-era. Nenhum é dependência npm. |
| `static/icons/` | Os 60 desenhos vendorizados do Lucide (ISC). Trocáveis. |
| `scripts/` | O gerador da referência e o vendorizador de ícones. |

## Restrições travadas

- **Docusaurus é inegociável** — restrição do ambiente alvo.
- **Skin trocável** — o produto é a arquitetura de tokens; a paleta é demonstração.
- **Light + dark**, com dark canônico.
- Conteúdo em **pt-BR**, com EN como segundo locale.
- **Dependência npm nova entra só para capacidade nova** — nunca para reescrever o que já funciona.

O porquê de cada uma está em [`CONTEXT.md`](CONTEXT.md) e nos ADRs.
