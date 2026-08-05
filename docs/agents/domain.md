# Domain docs

Este repo é **single-context**. Os documentos de domínio moram em `docs/`.

## Onde está o quê

| Documento | Papel |
| --- | --- |
| `docs/agents/` | Como um agente trabalha **neste** repo. |
| `docs/adr/` | Decisões de arquitetura deste repo. |
| `docs/design/` | A spec de design — o entregável do mapa de wayfinding. |
| `docs/research/` | **Só o índice.** O material das pesquisas mora em branches `research/*`, nunca na `main`. |

## O que é o shinydoc

Um projeto de **documentação de referência** construído com Docusaurus. O conteúdo é mockado e descartável; o produto é a **estrutura** e a **customização visual**.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Vocabulário

Termos que aparecem em issues, specs e código, e que significam algo específico aqui. Este vocabulário é **preenchido conforme o mapa resolve tickets** — o que está abaixo é o que já foi travado na cartografia.

- **Chrome**: a moldura de navegação que o Docusaurus já entrega — navbar, sidebar, TOC, paginação, breadcrumbs, modal de busca, footer. Não se autora; se **entorta**, via variável do Infima e swizzle.
- **Componente de conteúdo**: o que se autora do zero e o autor de documentação usa dentro do MDX — Callout, CardGroup, Steps, Tabs, CodeGroup, ParamField, Accordion, seções de landing. Aqui existe anatomia própria.
- **Skin**: a camada trocável do sistema de tokens. Trocar a skin re-marca a documentação inteira sem tocar em layout, motion ou componente.
- **Referências**: os sete sites de documentação em produção cujos sistemas visuais são **medidos** (não copiados) para alimentar as decisões — FastMCP, Devin, Perplexity, Vapi, Neon, Clerk, Trigger.dev.

## Axiomas

Posições travadas na cartografia do mapa. Não se renegociam sem reabrir o mapa.

1. **Docusaurus é inegociável.** Restrição do ambiente corporativo alvo, não preferência.
2. **Vanilla-first.** Zero dependências novas: preset `classic`, CSS/CSS Modules, swizzle e MDX. Aprovação de dependência é onde projeto corporativo morre, e spec sem dependência é spec transplantável.
3. **A skin é trocável.** O produto é a arquitetura de tokens; a skin de referência é demonstração. O corporativo tem marca própria — cravar cor obriga retrabalho.
4. **Dark é canônico, light é legítimo.** Os dois existem; o desenho nasce no escuro. O custo real não é CSS — é decidir o que acontece com glow e gradiente no claro, onde eles não funcionam.
5. **Medição, não invenção.** Os valores visuais concretos saem da dissecção dos sites de referência em produção, não de protótipo nem de intuição. O que medição não garante é **coerência entre sistemas diferentes** — essa chamada é decisão explícita, não subproduto.
6. **A spec é o entregável.** O mapa decide; não constrói. O critério de pronto é: um agente que só tem a spec — sem a conversa, sem as referências — constrói o site e o resultado é reconhecivelmente o que foi decidido.

## Registro histórico

O raciocínio que produziu estas posições está no mapa de wayfinding deste repo e nos seus tickets de decisão. Quando uma posição parecer arbitrária, o porquê está num deles.
