# shinydoc-docusaurus

Projeto de **documentação de referência** construído com Docusaurus.

O conteúdo é mockado e descartável — documenta uma plataforma developer-facing fictícia com API. O produto é a **estrutura** e a **customização visual**: um boilerplate que mostra até onde dá para levar o Docusaurus sem sair do preset `classic`.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Estado

Em **cartografia**. O repo está na fase de decisão: as escolhas de arquitetura visual e de conteúdo estão sendo resolvidas uma a uma no [mapa de wayfinding](https://github.com/panlabs-tech/shinydoc-docusaurus/issues). Ainda não há site.

## Onde está o quê

| Caminho | Papel |
| --- | --- |
| [`docs/agents/`](docs/agents/) | Como um agente trabalha neste repo — tracker, domínio, labels, fluxo. |
| [`docs/adr/`](docs/adr/) | Decisões de arquitetura. |
| `docs/design/` | A spec de design. Nasce conforme o mapa fecha. |

## Restrições travadas

- **Docusaurus é inegociável** — restrição do ambiente alvo.
- **Vanilla-first** — zero dependências novas: preset `classic`, CSS/CSS Modules, swizzle, MDX.
- **Skin trocável** — o produto é a arquitetura de tokens; a paleta é demonstração.
- **Light + dark**, com dark canônico.
- Conteúdo em **pt-BR**, com EN como segundo locale.

O porquê de cada uma está em [`docs/agents/domain.md`](docs/agents/domain.md) e nos tickets do mapa.
