# panlabs-docs

Um projeto de documentação de referência construído com Docusaurus. O conteúdo é um acervo de aprendizado; o produto é a **estrutura** e a **customização visual**, feitas para serem transplantadas a um ambiente corporativo onde Docusaurus é obrigatório e o espaço de dependências é apertado.

## Language

### O acervo

**panlabs**:
O acervo que a documentação é — o registro de aprendizado de um desenvolvedor dentro de uma empresa, e o `title` do site. É **misto**: conteúdo mockado e conteúdo real convivem, e o mockado vai sendo substituído à medida que as coisas reais surgem.
_Avoid_: Trilho (o domínio fictício anterior, morto)

**Voz da casa**:
`você` mais imperativo, no site inteiro, com **zero primeira pessoa**. O acervo é pessoal pelo que escolhe documentar, não pela gramática.

**Tab**:
Um dos quatro eixos de navegação de topo — `Ferramentas`, `Jornadas`, `Procedimentos`, `Times`, nesta ordem. Cada uma é uma instância de `plugin-content-docs`, um-para-um, porque `routeBasePath` e versionamento são por instância.
_Avoid_: seção, área

**Tipo de página**:
Convenção de **conteúdo**, nunca de layout: nenhum tipo tem CSS, front matter ou componente próprio. Cada um tem um gabarito, e o gabarito pode exigir, limitar e proibir componente.

**Jornada**:
Uma categoria da aba `Jornadas`, e **um papel que o autor vestiu** — não um tópico. Papel tem começo, meio e aprendizado, e é o que evita a jornada virar uma categoria de `Procedimentos` com outro nome.

**Varredura**:
O ato de conferir a documentação do `overpower` publicada aqui **contra a ferramenta real** — o `--help`, o catálogo embutido, o `CHANGELOG.md`. Mora na skill `.claude/skills/panlabs-overpower-docs-update/`.

**Deriva**:
A divergência que a varredura acha: a página ou o contrato afirmando da ferramenta algo que deixou de ser verdade. **Não tem sintoma local** — nada no build a detecta.

**Veredito**:
O que uma varredura conclui, e o negativo vale tanto quanto o positivo: `varrido` diz que havia deriva e ela foi corrigida, `sem-deriva` diz que a varredura rodou e não havia o que mudar.

### O sistema visual

**Âncora**:
O **Mintlify**, no tema `mint`, com o **Devin** como referência única — o sistema que o panlabs-docs herda por padrão. Ela manda no que se vê; onde o projeto não a segue, é por restrição da plataforma, não por escolha.
_Avoid_: inspiração, referência

**Skin**:
A camada trocável do sistema de tokens. Trocar a skin re-marca a documentação inteira sem tocar em layout, motion ou componente.

**Superfície de troca**:
As dez linhas do bloco `/* SKIN */`, na camada de raiz, que o corporativo edita para re-marcar a documentação inteira. Editar fora dela é **redesenhar**, não re-marcar.

**Camada**:
Um dos três degraus do sistema de tokens: **raiz** (o único lugar com literal), **semântica** (só cor, onde o papel é nomeado e o modo é resolvido) e **componente** (declarada no escopo do próprio componente, nunca em `:root`). Cor sempre desce pela semântica; dimensão vem direto da raiz.

**Regra de derivação**:
Nenhum valor entra no sistema como literal, salvo na camada de raiz. Todo o resto sai de algo que já está lá por uma operação declarada — sintaxe relativa, `color-mix()` ou `calc()`.

**`pd`**:
O prefixo de tudo que o design system deste repo nomeia — `--pd-*` nas variáveis, `data-pd-*` no contrato de partes, e o mesmo `pd-` em keyframes e ids. Sai de `panlabs-docs`.

**Adaptador**:
O bloco que atribui `--ifm-*` a partir de `var(--pd-*)`. Mão única: o sistema **nunca lê** variável do Infima, só escreve. É a fronteira que mantém o Docusaurus como consumidor do sistema em vez de fundação dele.

**Contrato de partes**:
Os atributos que a skin engancha para repintar um componente por CSS — `data-pd-component`, `data-pd-variant` e `data-pd-part`. Não pode ser classe de CSS Module, porque o nome é hasheado no build. **Estado nunca vira atributo**.

### A moldura

**Chrome**:
A moldura de navegação que o Docusaurus já entrega — navbar, sidebar, TOC, paginação, breadcrumbs, modal de busca, footer. Não se autora; se **entorta**, via variável do Infima e swizzle.
_Avoid_: layout, tema

**Componente de conteúdo**:
O que o autor escreve dentro do MDX, por oposição ao chrome. É um **catálogo fechado de dezesseis**, todos registrados globalmente em `@theme/MDXComponents`: nenhum arquivo de conteúdo importa nada, e não há válvula de escape — quando uma página precisa de um arranjo que o catálogo não cobre, a página muda.
_Avoid_: widget, bloco

**Subtítulo**:
A linha abaixo do `h1`, em toda página. **Não é escrita pelo autor** — é o `description` do front matter, o mesmo campo que alimenta o `<meta>` e o índice de busca. É chrome, não componente, e `description` ausente quebra o build.
_Avoid_: lead, tagline

**Separador**:
O nó de **topo** da sidebar, e ele não é página: rótulo em negrito, sem link, sem seta, sem ícone e sempre aberto. A regra de ícone que sai dele é agnóstica de profundidade — nenhum ícone no separador, ícone em tudo abaixo, folha ou grupo, em qualquer nível.
_Avoid_: categoria de topo, grupo

**Substrato nativo**:
A regra de que nenhum componente do catálogo implementa comportamento interativo. Ou o elemento do navegador entrega (`<details>`, `<a>`, `<table>`), ou o Docusaurus entrega (`Tabs`). Zero `keydown` escrito no projeto.

**Manifesto de ícones**:
O registro único de nomes e papéis, em `src/icons/manifest.js`, que é **contrato**; os desenhos são skin e se trocam inteiros mantendo os nomes. Nome inexistente quebra o build, com sugestão do vizinho mais próximo — nunca placeholder, nunca degradação silenciosa.

## Axiomas

Posições travadas. Não se renegociam sem reabrir a decisão que as pôs de pé.

Os números são os originais, e a lista é de marcadores de propósito: numa lista ordenada o Markdown renumera de 1 a 3 ao renderizar, que é exatamente o estrago que o parágrafo abaixo descreve.

- **1 — Docusaurus é inegociável.** Restrição do ambiente corporativo alvo, não preferência.
- **3 — A skin é trocável.** O produto é a arquitetura de tokens; a skin de referência é demonstração. O corporativo tem marca própria — cravar cor obriga retrabalho.
- **4 — Dark é canônico, light é legítimo.** Os dois existem; o desenho nasce no escuro. O custo real não é CSS, é decidir o que acontece com glow e gradiente no claro.

**Eram seis, e os números que morreram não se reaproveitam.** Os ADRs citam axioma pelo número — o 2 aparece em cinco deles, o 4 no ADR 1 —, então renumerar os sobreviventes faria cada citação apontar para a posição errada. Ficam vagos:

- **2, vanilla-first.** Dependência nova passa a ser aceita, e só **para capacidade nova** — nunca para reescrever o que já funciona nem para ressuscitar régua apagada. As decisões que os ADRs 5, 6, 8, 9 e 12 justificam por ele continuam de pé; o que caiu foi a proibição, não o resultado.
- **5, medição, não invenção.** A pesquisa que servia de fonte não está neste repositório, e a régua que cobrava o carimbo de procedência foi apagada.
- **6, a spec é o entregável.** O transplante corporativo aconteceu. A spec de design que era o produto está na tag `spec-v1`, fora da árvore de trabalho.
