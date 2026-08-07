# shinydoc-docusaurus

Projeto de **documentação de referência** construído com Docusaurus.

O conteúdo é mockado e descartável — documenta uma plataforma developer-facing fictícia com API. O produto é a **estrutura** e a **customização visual**: um boilerplate que mostra até onde dá para levar o Docusaurus sem sair do preset `classic`.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Estado

Em **construção**. O [mapa de wayfinding](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/1) fechou — vinte e sete tickets, sete de pesquisa e vinte de decisão — e o colapso dele numa [spec executável](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/30) partiu o trabalho em **sete slices verticais**. Cada slice entrega uma superfície funcionando *e* o documento de design que a especifica, na mesma sentada.

| Slice | O que entrega | Estado |
| ---: | --- | --- |
| 1 | [Bala traçante](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/34) — o site no ar com o sistema de tokens inteiro | feito |
| 2 | [A página de documentação](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/35) — chrome, ícones, árvore | aberto |
| 3 | [O catálogo](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/36) — os dezoito componentes de conteúdo | aberto |
| 4 | [O conteúdo do Trilho](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/37) — 43 páginas autorais e o EN parcial | aberto |
| 5 | [A Referência da API](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/38) — contrato, gerador e três colunas | aberto |
| 6 | [A landing](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/39) — cinco seções e a ilha de espetáculo | aberto |
| 7 | [Busca e artefatos AI-era](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/40) — e o fechamento da spec | aberto |

## Rodar

```bash
npm ci
npm start                    # dev — não testa link quebrado nem host
npm run build && npm run serve
npm run portoes              # portões 1 e 2, cadência de commit
```

## Onde está o quê

| Caminho | Papel |
| --- | --- |
| [`docs/adr/`](docs/adr/) | Decisões de arquitetura. **Leitura obrigatória antes de escrever código.** |
| `docs/design/` | A spec de design. Nasce um documento por slice. |
| [`docs/agents/`](docs/agents/) | Como um agente trabalha neste repo — tracker, domínio, labels, fluxo. |
| [`docs/research/`](docs/research/) | Índice das sete pesquisas. O material mora em branches `research/*`. |
| `src/css/tokens.css` | **A sede única de valor.** O único arquivo do repo com literal. |
| `src/css/custom.css` | As regras de base. Zero literal, e nunca lê `--ifm-*`. |
| `conteudo/` | O conteúdo do Trilho, o produto fictício. Fica fora de `docs/`, que é a documentação *deste* repositório. |
| `scripts/` | Os portões, e a verificação de espelho de `tokens.md`. |

## Restrições travadas

- **Docusaurus é inegociável** — restrição do ambiente alvo.
- **Vanilla-first** — zero dependências novas: preset `classic`, CSS/CSS Modules, swizzle, MDX.
- **Skin trocável** — o produto é a arquitetura de tokens; a paleta é demonstração.
- **Light + dark**, com dark canônico.
- Conteúdo em **pt-BR**, com EN como segundo locale.

O porquê de cada uma está em [`docs/agents/domain.md`](docs/agents/domain.md) e nos tickets do mapa.
