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
- **Referências**: os sete sites de documentação em produção cujos sistemas visuais são **medidos** (não copiados) para alimentar as decisões — FastMCP, Devin, Perplexity, Vapi, Neon, Clerk, Trigger.dev. São sete sites, mas **quatro sistemas**: FastMCP, Devin, Perplexity e Trigger.dev servem o mesmo CSS do Mintlify byte a byte; Vapi é Fern; Neon e Clerk são Next.js próprio cada um. Tratar os sete como evidência independente superestima a base em mais de 2×.
- **Âncora**: o **Mintlify** — o sistema que o shinydoc herda por padrão, confirmado por medição e por preferência. Fora das dimensões de delta, o valor da âncora vale sem discussão. Os outros três sistemas não são âncora: doam **mecanismo**, nunca valor.
- **Skin profunda**: a faixa em que a identidade do shinydoc se expressa — mais funda que as 17 variáveis do Mintlify (que não bastam: os quatro sites as trocam inteiras e continuam lendo iguais), e mais rasa que geometria (que se herda calada). Alcança forma, densidade, tratamento de código e anatomia visual.
- **Delta deliberado**: uma das **quatro** dimensões em que o shinydoc diverge da âncora de propósito — motion, profundidade, forma, bloco de código. Fora dessas quatro não há divergência. Tipografia e densidade de UI **não** são delta: a primeira é parâmetro que a própria âncora expõe, a segunda é o valor mais unânime da medição.
- **Procedência**: o carimbo que todo valor da spec carrega, e que diz a quem implementa **o que pode mexer**. Cinco: **herdado** (medido na âncora, fora das dimensões de delta — não toca), **delta deliberado** (ajusta só pela regra de derivação), **mecanismo emprestado** (arquitetura de Vapi, Neon ou Clerk com valor reancorado — estrutura fixa, valor é skin), **origem própria** (nada na medição sustenta — a mais frágil, primeira a ser contestada), **lacuna de medição** (dimensão herdada que a pesquisa declarou não medida — reabre se alguém medir). Sem o carimbo, valor medido e valor inventado ficam graficamente idênticos na página, e o axioma 5 fica infiscalizável.
- **Regra de derivação**: nenhum valor entra no sistema como literal, salvo na **camada de raiz**. Todo o resto sai de algo que já está lá, por uma operação declarada — derivar de **uma** cor por sintaxe relativa (`oklch(from var(--x) L C H)`, `rgb(from var(--x) r g b / n%)`), misturar **duas** cores por `color-mix(in oklab, …)`, ou `calc()` sobre a base de raio, espaço ou duração — e se resolve nos dois modos como par declarado. Hex novo, px avulso ou `cubic-bezier` solto fora da raiz é rejeitado. É a régua de coerência do projeto, e é mecânica de propósito: uma régua de julgamento só funciona com o dono do projeto presente, que é exatamente o que a spec existe para dispensar.
- **Camada**: um dos três degraus do sistema de tokens, e a regra de referência entre eles é o que impede a skin de vazar. **Raiz** — o único lugar com literal; carrega o bloco de troca e as escalas. **Semântica** — só cor; é onde o papel é nomeado (lista fechada de sete: `surface`, `text`, `border`, `accent`, `shadow`, `focus`, `state`) **e onde o modo é resolvido**, o único ponto do sistema em que escuro e claro divergem. **Componente** — declarada no escopo do próprio componente, nunca em `:root`. Cor sempre desce pela semântica; dimensão vem direto da raiz, porque não bifurca por modo.
- **Adaptador**: o bloco que atribui `--ifm-*` a partir de `var(--sd-*)`. Mão única — o sistema **nunca lê** variável do Infima, só escreve. É a fronteira que mantém o Docusaurus como consumidor do sistema em vez de fundação dele. Tem uma lista fechada de exceções com escopo, para os cinco pontos que não são alcançáveis de `:root`.
- **Superfície de troca**: as dez linhas do bloco `/* SKIN */`, na camada de raiz, que o corporativo edita para re-marcar a documentação inteira — marca, tint da rampa, os dois fundos, as três pilhas de fonte e o raio base. Editar fora dela é **redesenhar**, não re-marcar, e a fronteira entre as duas coisas existe para ficar visível.

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
