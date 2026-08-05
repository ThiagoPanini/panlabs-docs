# API Reference com cara de playground sem sair do vanilla

> Pesquisa do ticket [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) do mapa de wayfinding.
> Fontes primárias: código-fonte do `@docusaurus/theme-classic` e do `@docusaurus/plugin-content-docs`, documentação oficial do Docusaurus, código-fonte do `docusaurus-plugin-openapi-docs` (lido **para entender o que ele faz**, não para usá-lo), documentação de componentes do Mintlify e as próprias páginas de API reference em produção.
> Restrição vigente: **vanilla-first, zero dependências novas** (axioma 2 em [`docs/agents/domain.md`](../agents/domain.md#axiomas)).

---

## 1. Veredito

**O visual sai quase inteiro. A execução não sai.**

A página de API reference estilo playground é, na prática, três coisas empilhadas:

| Camada | O que é | Sai em vanilla? |
| --- | --- | --- |
| **A. Casca de layout** | três colunas, painel de código sticky, TOC substituído | **Sim** — o `theme-classic` já é duas colunas com coluna direita sticky; virar três é trocar o `docItemComponent`, sem swizzle e sem dependência |
| **B. Componentes de conteúdo** | badge de método, `ParamField`, `ResponseField`, propriedade aninhada, `CodeGroup`, seletor de status | **Sim, integralmente** — são componentes React autorais registrados em `MDXComponents`; nada aqui precisa de biblioteca |
| **C. Execução** | botão *Send*, request real, resposta ao vivo, credencial do usuário | **Não em pé de igualdade** — o request em si é `fetch()` e é barato; o que não sai é o **proxy**, e sem proxy o playground só funciona se a API alvo emitir CORS para a origem da doc |

A fronteira honesta não passa entre "bonito" e "funcional". Passa entre **o que roda no browser do leitor contra um servidor que a doc controla** (existe) e **o que roda contra um servidor que a doc não controla** (não existe). Mintlify resolve isso com infraestrutura própria; a Clerk resolve mandando a secret key do leitor por `proxy.scalar.com`, infra de terceiro (§2.7). Nenhuma das duas resolve com CSS.

E o dado que mais desarma a ansiedade em torno da camada C: **Perplexity e Trigger.dev rodam o mesmo Mintlify, servem o mesmo CSS byte a byte — e a Trigger desligou o playground** (`"playground": { "display": "simple" }`, §2.7). O que ela manteve — badge de método, campos de parâmetro, aninhamento, 8 linguagens de snippet, tabs de status code — é exatamente o recorte que cabe em vanilla.

**Sobre o custo de layout, o veredito é mais forte do que o esperado:** não existe ponto `safe` de swizzle para páginas de doc (`DocItem/Layout` e `DocItem/Content` são `unsafe`) — mas o layout de API reference **não precisa de swizzle nenhum**. `docItemComponent` é opção pública do `plugin-content-docs` e vira o componente da rota (§3.2, §3.3).

---

## 2. O alvo: anatomia da página de referência

Medido no HTML e no CSS servidos pelas próprias páginas, não em screenshot. Onde o dado veio de definição (CSS/JS) e não de DOM renderizado, está marcado.

### 2.1 O alvo é um sistema só: Mintlify

Das referências deste projeto, **FastMCP, Devin, Perplexity e Trigger.dev servem o mesmo CSS do Mintlify byte a byte** — e o dono do projeto confirmou FastMCP, Devin e Perplexity como os layouts a replicar. Logo o alvo desta pesquisa **não é a média de quatro sistemas: é a página de API reference do Mintlify.** A Clerk entra como contraponto, e só onde faz algo melhor.

| Página medida | Gerador | Renderização |
| --- | --- | --- |
| `docs.perplexity.ai/api-reference/chat-completions-post` | **Mintlify** (`<meta name="generator" content="Mintlify">`) | SSR completo, 663 KB de HTML |
| `trigger.dev/docs/management/runs/retrieve` | **Mintlify**, mesma versão | SSR completo |
| `clerk.com/docs/reference/backend-api` | **Scalar** (app Vue embutido em casca Next.js; componente RSC `BapiScalar`, tokens `--scalar-*`) | CSR total — o `<body>` servido tem ~45 linhas e um `<div>` vazio |

> **Nota de método.** Tudo abaixo saiu de `curl` sobre o HTML e o CSS servidos, não de screenshot. O Mintlify marca cada peça com **`data-component-part`** (`field-name`, `field-meta`, `field-info-pill`, `field-required-pill`, `expandable`, `expandable-button`, `code-group-tab-bar`, `icon-svg`) — um sistema de nomes estável, independente das classes utilitárias. **Isso é a melhor lição de arquitetura da dissecção**: o nome da peça e a sua aparência são camadas separadas. A spec deveria adotar a mesma disciplina — `data-component-part` (ou classe semântica) para identidade, CSS Module para aparência.
>
> Um detalhe de método adiante: o path `trigger.dev/docs/api-reference/runs/retrieve-run` devolve 404 — os endpoints vivem sob `/docs/management/…`.

### 2.2 Layout do Mintlify — as três colunas, medidas

A página de endpoint do Mintlify é **sidebar + conteúdo + painel de exemplos**, com o painel sticky e **sem TOC**. Os valores, lidos direto do markup da Perplexity:

| Peça | Valor medido | Classe de origem |
| --- | --- | --- |
| Sidebar | **304px** (`19rem`), sticky de altura total, some abaixo de `lg` | `sticky … h-[calc(100vh-var(--banner-height,0px))] max-lg:hidden` |
| Conteúdo | `max-w-xl` → `2xl:max-w-2xl` (**576 → 672px**) | — |
| **Painel de exemplos** | **448px** (`28rem`) | `max-w-[28rem]` / `xl:w-[28rem]` |
| Gap entre colunas | **32px** (`gap-x-8`) | — |
| Sticky do painel | `self-start sticky top-0`, altura `calc(100vh - 6.5rem)` = viewport menos **104px** | `hidden xl:flex self-start sticky xl:flex-col max-w-[28rem] z-21 h-[calc(100vh-6.5rem)] top-0` |
| Grade interna do painel | `grid-rows-[repeat(auto-fit,minmax(0,min-content))]`, `gap-6` (**24px**), `min-h-[18rem]` (288px), `max-h-[calc(100%-32px)]` | — |
| Breakpoint do painel | **`xl`** — abaixo disso o painel sticky some | `hidden xl:flex` |
| **TOC** | **ausente** na página de endpoint | — |

Três decisões embutidas nesses números, e todas valem para a spec:

1. **`self-start` junto com `sticky`.** Num container flex/grid, o item estica por padrão e o sticky nunca gruda. É o erro nº 1 de quem reconstrói esse layout.
2. **O painel tem altura própria (`h-[calc(100vh-6.5rem)]`) e rolagem interna**, em vez de crescer com o conteúdo. É isso que faz request e response conviverem sem um empurrar o outro para fora da tela.
3. **`min-h-[18rem]`** — o painel tem piso. Endpoint com um exemplo curto não colapsa a coluna.

**Em tela pequena, o Mintlify duplica o conteúdo no HTML.** Há uma cópia inline logo abaixo do cabeçalho (`mt-8 lg:mt-0 … [html:not([data-assistant-state=open])_&]:xl:hidden`) e a cópia sticky (`hidden xl:flex`). Custa peso e risco de divergência, mas resolve reordenação sem CSS acrobático — a doc deles descreve o efeito: *"On mobile devices, `<RequestExample>` and `<ResponseExample>` components display as regular code blocks that users can scroll past"* ([Examples](https://www.mintlify.com/docs/components/examples)).

**O painel substitui o TOC — regra declarada, não inferida:** *"The components in a `<Panel>` replace a page's table of contents"*, e os modos de página que suprimem o TOC também suprimem o `<Panel>` ([Panel](https://www.mintlify.com/docs/components/panel)).

**Contraponto Clerk (Scalar).** Mesma ideia, mas declarada em CSS grid nomeado — e a declaração é mais limpa que a do Mintlify:

| Dimensão | Clerk (Scalar) |
| --- | --- |
| Sidebar | **288px** (`--scalar-sidebar-width`), indent de nível 20px |
| Conteúdo / painel | grid `1fr 1fr`, gap **48px** |
| Sticky | `top: calc(var(--refs-viewport-offset) + 24px)` |
| TOC | ausente também |

```css
.operation-layout{
  grid-template: "heading badge" "description examples" "details examples" 1fr / 1fr 1fr;
  gap: 0 48px; display:grid;
}
.examples{ grid-area: examples; align-self: start; position: sticky;
           top: calc(var(--refs-viewport-offset) + 24px); }
.examples > *{ max-height: calc((var(--refs-viewport-height) - 60px) / 2) }
.examples > :first-of-type:last-of-type{ max-height: calc(var(--refs-viewport-height) - 60px) }
```

Duas coisas valem roubar daí: **`align-self: start`** (sem ele o sticky não gruda dentro de um grid) e a regra de que **dois cards no painel dividem a viewport pela metade, um card sozinho fica com ela inteira**.

**Colapso em tela pequena — e aqui as duas divergem.** A Trigger **duplica os blocos de código no HTML**: uma cópia inline logo abaixo do cabeçalho (visível abaixo de `xl`) e uma cópia no painel sticky (`hidden xl:flex`). O Scalar não duplica — reordena por `grid-area` num `@container narrow-references-container (max-width:900px)`, e a ordem vira `badge → heading → description → **examples** → details`, ou seja **o exemplo de código aparece antes da lista de parâmetros no mobile**. A Trigger mantém params antes de exemplos. É uma escolha de conteúdo disfarçada de CSS, e a spec precisa fazer a sua.

**O mesmo padrão está documentado do lado do gerador.** No Mintlify, `<RequestExample>` e `<ResponseExample>` renderizam *"in the right sidebar panel on desktop devices"* e *"On mobile devices … display as regular code blocks that users can scroll past"*; e o `<Panel>` — que customiza a coluna direita — traz a regra explícita: *"The components in a `<Panel>` replace a page's table of contents"* ([Examples](https://www.mintlify.com/docs/components/examples), [Panel](https://www.mintlify.com/docs/components/panel)).

**Conclusão de layout:** o painel de código **substitui** o TOC; não convive com ele. Isso valida `hide_table_of_contents: true` na seção de API e o reaproveitamento da coluna direita do Docusaurus (§3.1) — com uma correção de escala: `col--3` dá 25%, que em 1200px são ~300px, e o alvo é **448px**. **O painel precisa ser mais largo que o TOC padrão**, o que empurra a coluna direita para `col--4` (33%) ou para largura fixa fora do grid do Infima.

### 2.2.1 Cabeçalho do endpoint — o card, medido

O cabeçalho não é uma linha de texto: é um **card com moldura**, e dentro dele o path é um scroll-area horizontal com os segmentos como elementos separados.

```html
<div class="flex flex-col bg-background-light dark:bg-background-dark
            border-standard rounded-2xl p-1.5 w-full">          <!-- card: 16px de raio, padding 6px -->
  <div class="method-pill rounded-lg font-bold px-1.5 py-0.5
              text-sm leading-5 bg-blue-400/20 dark:bg-blue-400/20
              text-blue-700 dark:text-blue-400">POST</div>       <!-- badge -->
  <!-- scroll-area com os segmentos do path: "/", "v1", "/", "sonar" -->
  <button aria-label="Try it" data-testid="try-it-button"
          class="tryit-button … px-3 h-9 rounded-xl bg-[#3064E3] text-[#FFFFFF]">
    <span>Try it</span> <svg …play.svg… />
  </button>
</div>
```

Quatro detalhes que a reconstrução precisa ter:

- **O path é fatiado em segmentos** (`/` · `v1` · `/` · `sonar`), cada um em seu `<div>`, com os separadores em `text-gray-400` e os segmentos em `text-gray-800 dark:text-white`. É isso que permite destacar path param sem regex no CSS.
- O path vive num **scroll-area horizontal** com fade — endpoint longo não quebra o card.
- O botão de execução usa **a cor da marca**, não uma cor de sistema (`bg-[#3064E3]` na Perplexity). É o único elemento da página com cor sólida de marca.
- O container da página inteira tem `id="api-playground-2-operation-page"` e `flex flex-col gap-8` — **32px** entre blocos de nível de página.

### 2.3 Badge de método — a forma é do Mintlify, a cor é decisão

**Anatomia do Mintlify, medida:** `.method-pill` com `rounded-lg` (**8px**), `px-1.5 py-0.5` (**6px / 2px**), `font-bold`, `text-sm leading-5` (**14px / 20px**), fundo `bg-<cor>-400/20` **idêntico em light e dark** — só o texto troca (`text-blue-700` → `dark:text-blue-400`).

Essa é a peça mais barata de copiar da pesquisa inteira: um `<span>` e cinco declarações de CSS.

| Método | Mintlify (Perplexity / Trigger) | Clerk (Scalar) |
| --- | --- | --- |
| GET | **verde** — `bg-green-400/20`, texto `#15803d` / dark `#4ade80` | **azul** — `#0082d0` / dark `#4eb3ec` |
| POST | **azul** — `bg-blue-400/20`, `text-blue-700` / dark `text-blue-400` *(confirmado no markup da Perplexity)* | **verde** — `#069061` / dark `#00b648` |
| PUT | amarelo — `#a16207` / `#facc15` | laranja — `#ff5800` / `#ff8d4d` |
| PATCH | — | amarelo — `#edbe20` / `#ffc90d` |
| DELETE | vermelho — `#b91c1c` / `#f87171` | vermelho — `#ef0006` / `#dc1b19` |
| OPTIONS | — | roxo — `#5203d1` / `#b191f9` |
| Rótulo | `DELETE` por extenso | **abreviado**: `DEL`, `OPTS` |
| Forma | `rounded-lg` (8px), `px-1.5 py-0.5`, `font-bold`, 14px/20px | pílula `border-radius: 12px`, `padding: 2px 6px`, `--scalar-mini`, borda `0.5px` |
| Fundo | `bg-<cor>-400/20` — **igual em light e dark**, só o texto muda | `color-mix(in srgb, <cor>, transparent 90%)`, borda zerada nas variantes coloridas |

**A forma é reproduzível; a cor não é medível.** Mintlify usa GET verde / POST azul; Scalar usa GET azul / POST verde. Não há convenção universal — é o caso que o axioma 5 antecipou: medição não produz coerência entre sistemas diferentes, e a chamada é decisão explícita. Como o alvo confirmado é o Mintlify, o default sensato é **seguir o Mintlify** e registrar a divergência.

**O que os dois fazem igual, e vale como regra:** o fundo é **derivado** da cor do texto por transparência (`/20` no Tailwind, `color-mix(in srgb, <cor>, transparent 90%)` no Scalar), nunca um segundo valor independente. Isso resolve o problema do axioma 4 — bloco de cor saturada que precisa viver nos dois modos — com **um token por método**, não dois.

### 2.4 Campo de parâmetro — a anatomia do Mintlify, no osso

O markup real, com as classes utilitárias colapsadas e os `data-component-part` preservados:

```html
<div class="primitive-param-field border-gray-100 dark:border-gray-800
            border-b last:border-b-0">                 <!-- régua de 1px, some no último -->
  <div class="py-6">                                    <!-- 24px acima e abaixo -->
    <div class="flex font-mono text-sm … param-head" id="authorization-authorization">
      <a href="#authorization-authorization" class="-ml-10 opacity-0
         group-hover/param-head:opacity-100 …" aria-label="Navigate to header">…</a>
      <div class="font-semibold text-primary dark:text-primary-light"
           data-component-part="field-name">Authorization</div>
      <div data-component-part="field-meta">
        <div data-component-part="field-info-pill"
             class="rounded-md bg-stone-100/50 px-2 py-0.5 text-stone-600
                    dark:bg-white/5 dark:text-stone-200"><span>string</span></div>
        <div data-component-part="field-info-pill" …><span>header</span></div>
        <div data-component-part="field-required-pill"
             class="rounded-md bg-red-100/50 px-2 py-0.5 text-red-600
                    dark:bg-red-400/10 dark:text-red-300">required</div>
      </div>
    </div>
    <div class="mt-4"><div class="prose prose-sm …"> … descrição … </div></div>
  </div>
</div>
```

Lido item a item:

1. **Três variantes de classe raiz** — `primitive-param-field`, `object-param-field`, `array-param-field`. O tipo do campo é parte da identidade do bloco, não só do rótulo.
2. **Separação por régua**, `border-b` de 1px `gray-100`/`gray-800`, com `last:border-b-0`. Não é card.
3. **Ritmo interno `py-6`** (24px) e descrição a `mt-4` (16px) do cabeçalho.
4. **Cabeçalho inteiro em `font-mono text-sm`** — nome, tipo e localização são todos mono. Só a descrição é prosa.
5. **Nome na cor primária da marca** (`text-primary` / `dark:text-primary-light`), `font-semibold`.
6. **Tipo e localização são o mesmo chip** — cinza `rounded-md bg-stone-100/50 px-2 py-0.5`, 12px. `string` e `header` recebem tratamento idêntico. Valores literais vistos: `string`, `object[]`, `enum<string>`, `string<date-time>`.
7. **`required` é o mesmo chip em vermelho** — `bg-red-100/50 text-red-600` / dark `bg-red-400/10 text-red-300`. **Optional não existe**: a ausência do chip é o sinal.
8. **Âncora por campo** — `id="authorization-authorization"`, link `-ml-10` invisível que aparece no `group-hover/param-head`, com `aria-label="Navigate to header"`. Dentro de um expandable ela se desloca para `-ml-[2.1rem]`.
9. **Heading de seção** (`Authorizations`, `Body`, `Response`): `.api-section-heading-title` com `border-b pb-2.5` nas mesmas cores da régua.

**Contraponto Clerk / Scalar** — `.property`, `padding: 10px`, separador `0.5px` (`--scalar-border-width`, `#dfdfdf` / dark `#2d2d2d`):

1. **`.property-name`** — mono, peso 700, 13px
2. **`.property-required`** — **texto laranja** `#ff5800` / `#ff8d4d`, sem fundo
3. **`.property-optional`** — **existe**, em cinza `#757575` / `#a4a4a4`
4. **`.property-detail`** — tipo, default, enum, constraints, todos em `--scalar-mini` cinza e **separados por middot**: `.property-detail + .property-detail:before{ content:"·"; margin:0 .5ch }`
5. **`code.property-detail-value`** — o valor em chip mono 12px, `border-radius: 3px`, `padding: 0 4px`

**Onde divergem, e o que a spec precisa cravar:**

- **Densidade**: `py-6` (24px) + régua de 1px no Mintlify, contra `padding: 10px` + régua de 0,5px no Scalar. Um prioriza respiro; o outro, quantidade de propriedade na tela.
- **Marcar o opcional**: o Scalar rotula `optional`; o Mintlify deixa a ausência falar. Numa lista de 30 campos com 25 opcionais, 25 rótulos cinza é poluição — **o silêncio do Mintlify é a escolha melhor**, e é a do alvo.

Nenhum dos dois usa asterisco. **Ambos usam rótulo textual.**

### 2.5 Propriedade aninhada — `<details>` nativo, e é uma boa notícia

O Mintlify resolve aninhamento com `<details>` **nativo do HTML** — o mesmo elemento que o `@theme/Details` do Docusaurus embrulha. Markup real da Perplexity:

```html
<details class="expandable mt-4 rounded-xl border-standard"
         data-component-part="expandable"
         data-testid="body-messages-items-children">
  <summary aria-expanded="false" aria-controls="child-attributes-…-content"
           data-component-part="expandable-button"
           class="not-prose flex w-full cursor-pointer flex-row items-center text-sm
                  rounded-t-xl px-3.5 py-3 text-stone-600
                  hover:bg-stone-50/50 hover:text-stone-900
                  dark:text-stone-300 dark:hover:bg-white/5
                  list-none [&::-webkit-details-marker]:hidden rounded-b-xl">
    <svg data-component-part="icon-svg"
         class="icon inline size-2.5 bg-stone-400 transition-transform"
         style="mask-image:url(…/regular/angle-right.svg)"></svg>
    <p class="m-0">Show child attributes</p>
  </summary>
  <div class="expandable-content mx-3 border-stone-100 border-t px-2 dark:border-white/10"></div>
</details>
```

O que isso entrega de graça, e o que custa:

- **Card com borda completa**, `rounded-xl` (**12px**), summary `px-3.5 py-3` (**14px / 12px**), conteúdo separado por `border-t` e recuado `mx-3 px-2`. **Não é borda esquerda de indentação** — é card aninhado.
- **`list-none` + `[&::-webkit-details-marker]:hidden`** para matar o triângulo nativo, e um ícone `angle-right` de **10px** (`size-2.5`) com `transition-transform` girando no lugar dele. Duas linhas de CSS que a spec pode copiar literalmente.
- **`aria-expanded` + `aria-controls`** no `<summary>` — acessibilidade que o `<details>` puro não dá sozinho.
- **Rótulo textual: "Show child attributes"** — não um chevron mudo.
- **O conteúdo vem vazio no SSR** e é renderizado ao expandir. Leve, mas **quebra `Ctrl+F` e indexação de busca**. É o preço, e ele é real.

**Contraponto Clerk/Scalar** — `<button>` + card aninhado, sem `<details>`:

```css
.schema-properties{ border: var(--scalar-border-width) solid var(--scalar-border-color);
                    border-radius: var(--scalar-radius-lg); width: fit-content }
.schema-card-title{ height:var(--schema-title-height); padding:6px 8px; gap:4px;
                    font-size:var(--scalar-mini); border-bottom:… solid transparent }
.schema-properties-open > .schema-card-title{ border-bottom-color: var(--scalar-border-color);
                    border-bottom-right-radius:0; border-bottom-left-radius:0 }
.schema-card-title-icon--open{ transform: rotate(45deg) }
.schema-properties .schema-properties{ border-radius: 13.5px }
```

Ícone gira **45°** (um "+" virando "×"); ao abrir, o título ganha borda inferior e perde o raio de baixo — vira cabeçalho de card. Aninhamento de 2º nível fica **mais redondo** que o pai (13.5px vs 6px), o truque para "card dentro de card" ler como profundidade.

Ícone gira **45°** (um "+" virando "×"); ao abrir, o título ganha borda inferior e perde o raio de baixo — vira cabeçalho de card. E o truque de profundidade que vale roubar: **o card aninhado de 2º nível é mais redondo que o pai** (13,5px vs 6px), o que faz o encaixe ler sem indentação horizontal.

**Estado inicial — divergência:** o Mintlify **colapsa e faz lazy-render**; a Clerk **força tudo aberto** (`"expandAllSchemaProperties": true` no config do `BapiScalar`). Colapsado é mais leve e mais navegável; aberto é buscável. Em vanilla o `<details>` fechado já não é encontrado por `Ctrl+F` na maioria dos browsers, então **colapsar custa buscabilidade mesmo sem lazy-render**.

### 2.6 Barra do bloco de código, seletor de linguagem e de status

O painel do Mintlify tem **duas** formas de seleção convivendo no mesmo painel de 448px — e a diferença entre elas é a lição.

**Barra do bloco** (`data-component-part="code-group-tab-bar"`), `px-2.5`:

- à esquerda, o título truncado em `text-xs font-medium` (`title="Create Chat Completion"`);
- à direita, o **seletor de linguagem**: `<button aria-label="Select language" aria-haspopup="menu">` num pill `rounded-[10px]` com `pl-2.5 pr-1.5 py-[5px]`, borda transparente que vira `hover:bg-gray-200/50 dark:hover:bg-gray-700/70`, ícone de 14px (`w-3.5 h-3.5`);
- e o **botão de copiar**: `size-6.5` (**26px**), `rounded-md`, `data-testid="copy-code-button"`, `aria-label="Copy the contents from the code block"`, ícone de 16px em `text-gray-400` → `group-hover/copy-button:text-gray-500`.

**Seletor de status code** — abas de verdade, com semântica ARIA completa:

```html
<div role="tablist" aria-label="Code examples" class="text-xs leading-6 gap-1 flex">
  <button role="tab" aria-selected="true" data-active
          class="… text-primary dark:text-primary-light">200</button>
  <!-- inativas em text-gray-400 -->
</div>
```

com `px-1.5 rounded-lg`, hover `bg-gray-200/50 dark:bg-gray-700/70`, e a lista rolando dentro de um scroll-area horizontal com fade de 32px (`--scroll-area-fade-size:32px`), primeiro item com `first:ml-2.5`.

**A regra que sai daí:** no **mesmo painel**, o Mintlify usa **dropdown para as linguagens** (~8 na Trigger: TypeScript, cURL, Python, JavaScript, PHP, Go, Java, Ruby) e **tabs para os status codes** (4: 200/400/401/404). Tabs-vs-dropdown é **função da contagem**, não de gosto — e o Mintlify oferece isso como prop na autoria: `dropdown` em `<CodeGroup>` *"replaces the tabs with a dropdown menu"* ([Code groups](https://www.mintlify.com/docs/components/code-groups)).

**Contraponto Clerk/Scalar:** tabs de ícone (`.client-libraries`, ícone 14px, `padding: 8px 2px`) para ~17 targets, degradando por breakpoint — `@media (max-width:450px)` esconde os itens 4 e 5, e abaixo de 400px de container tudo vira `<select>`. Cor por faixa de status mapeada no JS (`100: yellow, 200: green, 202: green, 300: blue`).

### 2.7 Execução — dois sites, mesmo gerador, escolhas opostas

Este é o dado mais consequente da pesquisa, e ele aparece **dentro do Mintlify**, não entre geradores.

| | Perplexity (Mintlify) | Trigger.dev (Mintlify) | Clerk (Scalar) |
| --- | --- | --- | --- |
| Botão de execução | **existe** — `<button aria-label="Try it" data-testid="try-it-button" class="tryit-button … px-3 h-9 rounded-xl bg-[#3064E3] text-white">` com ícone `play.svg` | **não existe** — grep por `>Try it<`, `>Send<`, `Send Request` no HTML servido: **zero** | **existe** — `" Open API Client "`, `" Send Request "` |
| Por quê | playground ligado (default) | `"playground": { "display": "simple" }` no payload RSC — **desligado deliberadamente** | `hideClientButton` existe no schema e a Clerk não a ativa |
| Como executa | proxy do Mintlify (default `true`) | n/a | **proxy de terceiro** — `"proxyUrl": "https://proxy.scalar.com/"`, string confirmada no bundle JS |
| Forma | inline, no card do cabeçalho | — | **modal/overlay**, não inline |

Três fatos que juntos fecham a questão da camada C:

1. **Mesmo gerador, decisão oposta.** Perplexity e Trigger.dev rodam o **mesmo** Mintlify, servem o **mesmo CSS byte a byte** — e uma mantém o botão, a outra o desligou. Playground executável **não é requisito de excelência**: é um interruptor, e uma doc de referência séria escolheu deixá-lo desligado mantendo tudo o mais.
2. **Quem executa, executa por um servidor.** O Mintlify proxia por padrão — *"Whether to pass API requests through Mintlify's proxy server. Defaults to `true`"*; com `proxy: false`, *"the playground sends requests directly from the browser to your API"* e aí *"you will need to configure CORS on your server"* ([API playground overview](https://www.mintlify.com/docs/api-playground/overview)).
3. **A Clerk aceita proxy de terceiro para ter o botão.** O `Authorization` com a **secret key de Backend API do leitor** transita por `proxy.scalar.com`, porque `api.clerk.com` não emite CORS para `clerk.com`. Uma empresa cujo produto *é autenticação* fez essa troca conscientemente.

**O playground das referências é infraestrutura, não front-end.** E o que a Trigger.dev preservou ao desligá-lo — badge, campos, aninhamento, 8 linguagens de snippet, tabs de status — é exatamente o recorte que cabe em vanilla.

### 2.8 Valores medidos que servem de âncora

Não são para copiar; são para calibrar o que a spec cravar.

**Mintlify — a grade de espaçamento**, que é o esqueleto do sistema (Tailwind, base 4px):

| Onde | Valor |
| --- | --- |
| Entre blocos de nível de página | `gap-8` = **32px** |
| Entre seções | `mb-14` = **56px** |
| Dentro do campo de parâmetro | `py-6` = **24px** |
| Descrição ↔ cabeçalho do campo | `mt-4` = **16px** |
| `Available options:` / `Example:` | `mt-6` = **24px** |
| Blocos dentro do painel | `gap-6` = **24px** |
| Colunas | `gap-x-8` = **32px** |
| Raios | card do cabeçalho `rounded-2xl` **16px** · expandable `rounded-xl` **12px** · botão *Try it* `rounded-xl` **12px** · chip/badge `rounded-lg` **8px** · copiar `rounded-md` **6px** · pill de linguagem `rounded-[10px]` **10px** |

**Trigger.dev** (mesma engine, skin própria)
- sans `Inter`; mono `paperMono`
- code block: fundo `#0B0C0E`, `text-xs` com `leading-[1.35rem]` (12px/21.6px), `py-3.5 px-4`, container `rounded-2xl` (16px) com moldura `p-0.5`
- título da página `text-3xl sm:text-4xl font-semibold tracking-tight` (30→36px); eyebrow `text-sm font-semibold` na cor primária
- heading de seção (`Authorizations`, `Path Parameters`, `Response`): `border-b pb-2.5` em `gray-100`/`gray-800`
- ritmo vertical: campo `py-6` (24px), entre seções `mb-14` (56px), blocos do playground `gap-8` (32px)

**Clerk / Scalar**
- sans `Inter`; mono `JetBrains Mono`
- raios: `--scalar-radius: 3px`, `-lg: 6px`, `-xl: 8px`; badge 12px; schema aninhado nível 2 **13.5px**
- borda: **0.5px**, `#dfdfdf` / `#2d2d2d`
- escala: `22/16/14/13/12/12/10px` (`--scalar-font-size-1..7`), com aliases `paragraph:16`, `small:14`, `micro:12`, `mini` (badges e `required`)
- pesos: 700 bold, 600/500 semibold, 400 regular
- fundos light `#fff / #f6f6f6 / #e7e7e7`; dark `#0f0f0f / #1a1a1a / #272727`
- textos light `#1b1b1b / #757575 / #797979`; dark `#e7e7e7 / #a4a4a4 / #8e8e8e`
- acento `#09f` / `#00aeff`; sombra `0 1px 3px 0 #0000001a`

**Detalhe que só a Clerk tem:** versionamento do próprio spec — 6 versões datadas (`2026-05-12`, `2025-11-10`, `2025-04-10`, `2025-03-12`, `2024-10-01`, …), cada uma servida em `/docs/reference/spec/bapi/<data>`.

---

## 3. O que o Docusaurus vanilla já entrega

Tudo nesta seção foi lido no código-fonte, não inferido.

### 3.1 A página de doc já é duas colunas com a direita sticky

`DocItem/Layout` renderiza uma `row` do Infima com duas colunas — conteúdo e TOC de desktop:

```tsx
return (
  <div className="row">
    <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
      …
    </div>
    {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
  </div>
);
```

— [`packages/docusaurus-theme-classic/src/theme/DocItem/Layout/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/DocItem/Layout/index.tsx)

As proporções são explícitas e medíveis:

- coluna de conteúdo: `max-width: 75% !important` acima de `997px` — [`DocItem/Layout/styles.module.css`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/DocItem/Layout/styles.module.css);
- coluna direita: `col col--3` do grid de 12 colunas do Infima, ou seja **25%**;
- o sticky da coluna direita já existe, com valores prontos para copiar:

```css
.tableOfContents {
  max-height: calc(100vh - (var(--ifm-navbar-height) + 2rem));
  overflow-y: auto;
  position: sticky;
  top: calc(var(--ifm-navbar-height) + 1rem);
}
@media (width <= 996px) { .tableOfContents { display: none; } }
```

— [`packages/docusaurus-theme-classic/src/theme/TOC/styles.module.css`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/TOC/styles.module.css)

**Consequência.** O comportamento mais caro de imitar do Mintlify — painel direito grudado enquanto a coluna de parâmetros rola, e some no mobile — é comportamento nativo do tema, com breakpoint em `996px` e offset em `--ifm-navbar-height + 1rem`. Não é preciso inventar; é preciso reusar.

### 3.2 Dá para trocar o container da página inteira sem swizzle

`plugin-content-docs` aceita a opção `docItemComponent`, descrita na doc oficial como *"Main doc container, with TOC, pagination, etc"*, com default `'@theme/DocItem'` — [API do plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs). No código, essa opção vira literalmente o componente da rota:

```ts
const docRoute: RouteConfig = {
  path: doc.permalink,
  component: options.docItemComponent,
  …
```

— [`packages/docusaurus-plugin-content-docs/src/routes.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/routes.ts)

Isso é o mecanismo mais importante desta pesquisa, e é exatamente o que o plugin de OpenAPI usa: o demo dele configura `docItemComponent: "@theme/ApiItem"` no preset — [`demo/docusaurus.config.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/demo/docusaurus.config.ts).

Em vanilla o mesmo caminho está aberto: uma **segunda instância** de `plugin-content-docs` (ex.: `id: 'api'`, `routeBasePath: 'api-reference'`) com `docItemComponent: '@theme/ApiDocItem'`, e `src/theme/ApiDocItem/index.tsx` escrito à mão. Multi-instância é suportado oficialmente, com `path`, `routeBasePath` e `sidebarPath` próprios por instância — *"You can omit the `id` attribute (defaults to `default`) for one of the docs plugin instances"* ([Docs multi-instance](https://docusaurus.io/docs/docs-multi-instance)). O diretório `src/theme` do site tem a **maior precedência** na cadeia de aliases `@theme` — *"A user's `website/src/theme` directory, which is a special directory that has the higher precedence"* ([Client architecture](https://docusaurus.io/docs/advanced/client)) — então o componente é resolvido sem swizzle, sem `--danger`, e sem herdar dívida de upgrade.

Dentro dele, os dados da página vêm do hook público `useDoc()` de `@docusaurus/plugin-content-docs/client` — o mesmo que o `DocItem/Layout` oficial usa — dando acesso a `frontMatter`, `metadata` e `toc`.

### 3.3 O que o swizzle custa, e onde ele é seguro

A classificação de segurança é dado de código, não opinião — está em [`getSwizzleConfig.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/getSwizzleConfig.ts):

| Componente | eject | wrap | Nota |
| --- | --- | --- | --- |
| `MDXComponents` | **safe** | forbidden | *"Meant to be ejected"* |
| `CodeBlock` | **safe** | **safe** | |
| `CodeBlock/Content` | unsafe | unsafe | |
| `DocSidebar` | unsafe | **safe** | *"Too much technical code in sidebar"* |
| `DocItem/TOC` | forbidden | forbidden | pasta-pai; subcomponentes são swizzláveis |
| `DocItem/Layout` | — | — | **não listado** → `unsafe` |
| `DocItem/Content` | — | — | **não listado** → `unsafe` |

Componente não listado cai no fallback do CLI, que é `unsafe`:

```ts
const FallbackSwizzleActionStatus: SwizzleActionStatus = 'unsafe';
```

— [`packages/docusaurus/src/commands/swizzle/components.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/commands/swizzle/components.ts)

E `unsafe` tem significado preciso na doc: *"this component is a theme implementation detail, not safe to be swizzled, and breaking changes might happen within a theme **minor version**"* ([Swizzling](https://docusaurus.io/docs/swizzling)).

#### O custo do swizzle, por extenso

**Não existe ponto `safe` de swizzle para o layout de uma página de doc.** Nem `DocItem/Layout`, nem `DocItem/Content`, nem `DocItem/TOC` (este é `forbidden`). Quem quiser um layout de duas colunas próprio *pela via do swizzle* paga, nesta ordem:

1. **Um `--danger` no comando.** O CLI recusa componente unsafe sem confirmação explícita, e registra o aviso de que *"this component is an unsafe internal component"*.
2. **Uma cópia congelada de código de terceiro.** `--eject` copia o `DocItem/Layout` inteiro para `src/theme/` — com os oito imports de `@theme/*` que ele faz (`DocItemPaginator`, `DocVersionBanner`, `DocVersionBadge`, `DocItemFooter`, `DocItemTOCMobile`, `DocItemTOCDesktop`, `DocItemContent`, `DocBreadcrumbs`, `ContentVisibility`). Essa cópia **para no tempo**: correção de bug, melhoria de a11y e mudança de comportamento que o Docusaurus fizer no original **não chegam** ao site.
3. **Risco de quebra a cada minor**, não a cada major. É a diferença entre `3.10 → 3.11` poder quebrar o build e `3.x → 4.0` poder quebrar. Numa doc corporativa que recebe patch de segurança por bump automático, isso é fricção recorrente.
4. **Um upgrade manual por versão.** Toda subida do tema exige comparar a cópia com o novo original e reaplicar as mudanças à mão. É dívida com juros, não custo único.
5. **Superfície de revisão maior.** O diff do PR passa a conter código que ninguém do time escreveu, o que atrapalha revisão e mascara mudança real.

**E é por isso que a rota certa não é o swizzle.** `docItemComponent` é **opção pública e documentada** do `plugin-content-docs`, que vira o `component` da rota (§3.2): o layout de API reference é um **componente novo**, escrito do zero, que não copia nem herda nada do `DocItem` — e o `DocItem` padrão segue intacto para o resto da documentação. Custo de upgrade: **zero**. Risco de minor: **zero**. É o mesmo caminho que o `docusaurus-plugin-openapi-docs` escolheu.

O único swizzle unsafe que o inventário desta pesquisa pede é `DocSidebarItem/Link`, e só para o badge de método na sidebar (§4.1) — item opcional, com alternativa de custo zero via `sidebar_class_name`.

### 3.4 As peças de interação já existem no tema

| Necessidade da página de API | Peça vanilla | Fonte |
| --- | --- | --- |
| abas de linguagem que lembram a escolha | `@theme/Tabs` com `groupId` — sincroniza todos os grupos de mesmo `groupId` e **persiste em `localStorage`**; `queryString` espelha na URL | [Tabs](https://docusaurus.io/docs/markdown-features/tabs) |
| propriedade aninhada expansível | `@theme/Details` — `<details>` com colapso animado, descrito no próprio código como *"A mostly un-styled `<details>` element with smooth collapsing… you should bring your UI"* | [`theme-common/src/components/Details/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-common/src/components/Details/index.tsx) |
| botão de copiar código | nativo do `CodeBlock` (`CodeBlock/Buttons/CopyButton`), junto com o de word-wrap | [`theme-classic/src/theme/CodeBlock/Buttons/`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/CodeBlock/Buttons) |
| bloco de código programático | `@theme/CodeBlock` aceita `language`, `title`, `showLineNumbers` como props React — dá para renderizar de dentro de um componente autoral, não só de crase tripla | [`CodeBlock/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/CodeBlock/index.tsx) |
| componente global sem `import` em cada MDX | ejetar `MDXComponents` e espalhar o original | [React em MDX](https://docusaurus.io/docs/markdown-features/react) |

Registro global, verbatim da doc:

```js
// src/theme/MDXComponents.js
import MDXComponents from '@theme-original/MDXComponents';
import Highlight from '@site/src/components/Highlight';
export default { ...MDXComponents, Highlight };
```

> *"you can freely use `<Highlight>` in every page, without writing the import statement"*

Uma armadilha vale registro porque muda a convenção de nomes de toda a spec: *"From MDX v3+ onward, lower-case tag names are always rendered as native html elements"* — logo `ParamField`, `ResponseField`, `CodeGroup` **precisam** de inicial maiúscula.

### 3.5 Realce de sintaxe: o que já vem e o que falta

O `prism-react-renderer` empacota um subconjunto: `markup, jsx, tsx, swift, kotlin, objectivec, js-extras, reason, rust, graphql, yaml, go, cpp, markdown, python, json` mais as dependências transitivas de cada um — [`packages/generate-prism-languages/index.ts`](https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts).

**`bash` não está na lista** — e `bash` é a linguagem do snippet de `curl`, o primeiro que qualquer API reference mostra. A correção é configuração, não dependência: `themeConfig.prism.additionalLanguages: ['bash', …]` ([Code blocks](https://docusaurus.io/docs/markdown-features/code-blocks)), que resolve de `prismjs` — já **dependência direta declarada** do `@docusaurus/theme-classic` ([`theme-classic/package.json`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/package.json)). O próprio site do Docusaurus faz isso ([`website/docusaurus.config.ts`](https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts)).

O mesmo `package.json` mostra o que mais dá para consumir sem instalar nada: `clsx`, `copy-text-to-clipboard`, `infima`, `@mdx-js/react`, `prismjs`.

---

## 4. Camada A + B — o que é puramente visual

Esta é a parte que a spec pode cravar sem reserva. Cada componente abaixo é React + CSS Module, registrado em `src/theme/MDXComponents.js`, consumindo tokens da skin. **Nenhum precisa de biblioteca.**

A nomenclatura segue o vocabulário que as referências consolidaram — o contrato do Mintlify serve de baliza porque é o que o autor de documentação já espera ([Fields](https://www.mintlify.com/docs/components/fields), [Code groups](https://www.mintlify.com/docs/components/code-groups)).

### 4.1 `MethodBadge` — badge de método HTTP

**Anatomia.** Um `<span>` com o verbo em caixa alta, tipografia mono, tracking apertado, radius pequeno, e cor derivada de um mapa `método → token`. Sem estado, sem interação.

**Props.** `method: 'get'|'post'|'put'|'patch'|'delete'|'head'|'options'`, `size?: 'sm'|'md'`.

**Tokens consumidos.** **Um** token de cor por verbo, com o fundo **derivado** dele por transparência — é o que as duas referências fazem (`bg-green-400/20` na Trigger, `color-mix(in srgb, <cor>, transparent 90%)` no Scalar; §2.3). Derivar em vez de manter dois valores independentes resolve o problema do axioma 4 com metade dos tokens: no dark inverte-se só o valor do texto, e o fundo acompanha.

**A cor de cada verbo é decisão, não medição.** Trigger usa GET verde / POST azul; Scalar usa GET azul / POST verde. As referências se contradizem (§2.3) — o axioma 5 previu exatamente este caso.

**Onde aparece.** Três lugares, e a spec precisa dizer que é o mesmo componente nos três: cabeçalho do endpoint, item de sidebar, e link inline no corpo do texto.

**Variante de sidebar.** É possível em vanilla, e o caminho é `sidebar_custom_props` no front matter — *"Assign custom props to the sidebar item referencing this doc"* ([plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs)) — consumido por um `DocSidebarItem/Link` swizzlado. **Atenção:** esse componente é `unsafe` (não listado, cai no fallback), então o badge na sidebar é a única peça do inventário visual que compra dívida de upgrade. Alternativa sem dívida: `sidebar_class_name` + CSS com `::before` — menos flexível, custo zero.

### 4.2 `EndpointHeader` — cabeçalho do endpoint

**Anatomia.** Uma linha: `MethodBadge` + path em mono, com os path params (`{id}`) destacados em cor diferente do resto do path + botão de copiar a URL completa. Abaixo, a descrição.

O plugin de OpenAPI trata isso como componente próprio e nada mais que isso: `createMethodEndpoint(method, path)` emite `<MethodEndpoint method={…} path={…} context="endpoint" />` — [`markdown/createMethodEndpoint.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-plugin-openapi-docs/src/markdown/createMethodEndpoint.ts). Ou seja: a peça é tão simples que até a solução com plugin a trata como um `<span>` com dois dados.

**Custo em vanilla:** trivial. O destaque de path param é um `split` por `/` e um `map`; o botão de copiar é `copy-text-to-clipboard`, já presente.

### 4.3 `ParamField` — campo de parâmetro

O componente central. O contrato do Mintlify é o alvo de compatibilidade mental:

| Prop | Papel |
| --- | --- |
| `query` / `path` / `body` / `header` | o nome do parâmetro **e** sua localização, na mesma prop |
| `type` | `number`, `string`, `boolean`, `object`, arrays com sufixo `[]` |
| `required` / `deprecated` | booleanos |
| `default` | valor exibido |
| `placeholder` | só existe por causa do playground |
| `children` | descrição, em Markdown |

— [Fields](https://www.mintlify.com/docs/components/fields)

O que o plugin de OpenAPI renderiza para o mesmo papel dá a ordem exata dos elementos, e é uma lista mais longa que a do Mintlify — [`theme/ParamsItem/index.tsx`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-theme-openapi-docs/src/theme/ParamsItem/index.tsx):

```
[nome em negrito (riscado se deprecated)] [tipo] [divisor] [required] [deprecated]
[qualifier: min/max/pattern/multipleOf]
[Constant value: …]
[descrição em Markdown]
[tabela de descrições de enum]
[Default value: …]
[exemplo / exemplos]
```

**Anatomia recomendada para a spec** (a fusão dos dois, sem o que só serve a playground):

1. **Linha 1 — assinatura.** `nome` (mono, peso alto) · `tipo` (mono, cor secundária) · separador · `required` (rótulo textual, não asterisco) · `deprecated` (rótulo + `line-through` no nome).
2. **Linha 2 — restrições.** `default`, `enum`, `min`/`max`, `pattern`, `format`. Cor terciária, tamanho menor. Só rende linha se existir.
3. **Bloco 3 — descrição.** Prosa em Markdown, largura total.
4. **Bloco 4 — filhos.** Ver 4.4.
5. **Moldura.** Separador entre itens por borda horizontal, **não** por card — confirmado nas duas referências medidas: `border-b` de 1px `gray-100`/`gray-800` na Trigger, `border-bottom` de **0,5px** `#dfdfdf`/`#2d2d2d` no Scalar (§2.4). Card empilhado dobra a densidade vertical e a página de endpoint fica longa demais.

**Medições que ancoram as decisões (§2.4), sem tomá-las:**

- **Required é rótulo textual nas duas** — nenhuma usa asterisco. Divergem no tratamento: chip com fundo vermelho (Trigger) vs. texto laranja sem fundo (Scalar).
- **Marcar o opcional é a divergência real:** o Scalar tem `.property-optional` explícito; a Mintlify deixa a ausência do chip falar. Numa lista com 25 opcionais em 30 campos, rotular todos é ruído.
- **Densidade:** `py-6` (24px) com borda 1px contra `padding: 10px` com borda 0,5px. É a mesma anatomia em duas velocidades.
- **Tipo é sempre chip mono**, nunca texto corrido — `rounded-md px-2 py-0.5 text-xs` (Trigger) / `border-radius: 3px; padding: 0 4px`, 12px (Scalar).
- **Restrições em linha, separadas por middot:** o Scalar resolve com `.property-detail + .property-detail:before { content:"·"; margin: 0 .5ch }` — uma linha de CSS que substitui markup de separador.
- **Âncora por campo:** a Trigger dá deep-link a cada parâmetro (`#parameter-run-id`, `#response-status`), revelado no hover. É barato e é a diferença entre "a doc tem a informação" e "dá para mandar o link dela no Slack".

### 4.4 Propriedade aninhada — `Expandable`

O problema real: um campo `body` do tipo `object` tem filhos, que têm filhos.

**Mecanismo do Mintlify:** `<Expandable title="properties">` dentro de um `<ResponseField>`, aninhável, com `defaultOpen` — [Expandables](https://mintlify.com/docs/content/components/expandables).

**Mecanismo em vanilla:** `@theme/Details`, que é `<details>` nativo com colapso animado e é declarado no código como "traga sua própria UI". Ou seja, a mecânica de expansão é grátis; só o desenho é nosso.

**Anatomia — corrigida pela medição (§2.5).** Nenhuma das duas referências usa borda esquerda de indentação. **Ambas usam card aninhado com borda completa**, e o `<details>` da Trigger é literalmente o elemento que o `@theme/Details` embrulha:

- disclosure com rótulo textual — a Trigger usa **"Show child attributes"**;
- moldura `border-radius` ~12px + borda 1px (ou 0.5px), summary com padding ~`14px/12px`, conteúdo separado do summary por `border-top`;
- o truque de profundidade do Scalar vale roubar: **o card aninhado de 2º nível é mais redondo que o pai** (13.5px vs 6px), o que faz o encaixe ler sem precisar de indentação horizontal;
- estado do ícone: rotação de 45° (Scalar) ou seta (Mintlify) — decisão de skin, não de estrutura.

**Estado inicial é decisão, e as referências divergem.** Trigger colapsa e renderiza os filhos **só ao expandir** (leve, mas quebra `Ctrl+F` e indexação); Clerk força tudo aberto (`"expandAllSchemaProperties": true`). Em vanilla, `<details>` fechado já não é encontrado por `Ctrl+F` na maioria dos browsers — então "colapsado" custa buscabilidade mesmo sem lazy-render. **Recomendação: colapsado por padrão a partir do nível 2, aberto no nível 1.**

**Limite honesto:** profundidade útil é 3 níveis. Além disso, qualquer sistema — inclusive os medidos — vira ilegível, e a saída é linkar para uma página de schema em vez de aninhar.

### 4.5 `ResponseField` — campo de resposta

Difere de `ParamField` em três pontos, e só neles: não tem `placeholder` (não alimenta playground), tem `name` explícito em vez de `query|path|body|header`, e ganha `pre` / `post` — arrays de rótulos antes e depois do nome ([Fields](https://www.mintlify.com/docs/components/fields)).

**Recomendação:** um único componente interno com uma prop `kind: 'param' | 'response'`, dois nomes exportados. Duplicar a anatomia inteira para ganhar duas props é como se acumula divergência visual entre blocos que deveriam ser irmãos.

### 4.6 `CodeGroup` — bloco multi-linguagem

**Contrato do Mintlify:** cada bloco dentro do grupo **precisa** de título, e o título vira o rótulo da aba; a prop `dropdown` troca abas por menu; blocos com rótulos iguais sincronizam entre si na página ([Code groups](https://www.mintlify.com/docs/components/code-groups)).

**Em vanilla:** `@theme/Tabs` com `groupId="api-lang"` faz o mesmo — e faz **mais**: a escolha persiste em `localStorage` e vale **entre páginas**, não só dentro da página, e `queryString` permite compartilhar link já na linguagem certa ([Tabs](https://docusaurus.io/docs/markdown-features/tabs)). Isso não é paridade; é superioridade funcional sobre a referência.

**Anatomia.** Barra de abas rente ao topo do bloco, sem gap; nome do arquivo/linguagem à esquerda; copiar à direita, na mesma barra; corpo com `overflow-x: auto` e altura máxima.

**Tabs vs. dropdown é função da contagem, e a medição fecha isso (§2.6).** A Trigger, no mesmo painel de 448px, usa **dropdown para as 8 linguagens do request** e **`role="tablist"` para os 4 status codes da resposta**. O Scalar usa tabs de ícone de 14px para ~17 linguagens e as degrada por breakpoint — `@media (max-width:450px)` esconde os itens 4 e 5, e abaixo de 400px de container tudo vira `<select>`. Ou seja: **abas até caber uma linha; dropdown a partir daí** — e como este projeto crava três linguagens (§6.5), a variante `tabs` é a default e o `dropdown` fica como escape.

**Trabalho real:** um wrapper que recebe `children` de blocos de código, extrai `language` e `title` de cada um e monta `<Tabs>`/`<TabItem>` — cerca de 40 linhas. O parsing dos filhos MDX é a única parte chata, e o código do tema diz exatamente como fazer: `MDXComponents/Pre` traz o comentário *"With MDX 2, this element is only used for fenced code blocks. It always receives a MDXComponents/Code as children"*, e `MDXComponents/Code` repassa as props direto ao `CodeBlock` — [`Pre.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/Pre.tsx), [`Code.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/Code.tsx). Ou seja: cada filho é um `<pre>` cujo único filho carrega `className="language-xxx"` e `metastring`. É daí que saem o rótulo da aba e a linguagem.

### 4.7 `ResponsePanel` — o painel direito

**Anatomia.** Dois blocos empilhados na coluna sticky de 25%:

1. **Request de exemplo** — `CodeGroup` com as linguagens.
2. **Response de exemplo** — bloco com seletor de status code em abas (a Trigger usa `role="tablist" aria-label="Code examples"` com `200 / 400 / 401 / 404`), cada status com sua cor por faixa (o Scalar mapeia `100: yellow, 200: green, 202: green, 300: blue`) e seu corpo JSON.

Em vanilla, os dois são composição do que já existe. Três regras de layout, todas medidas no Scalar (§2.2), evitam o erro clássico:

```css
.apiExamples {
  grid-area: examples;
  align-self: start;              /* sem isso o sticky não gruda dentro de grid/flex */
  position: sticky;
  top: calc(var(--ifm-navbar-height) + 1.5rem);
}
.apiExamples > *          { max-height: calc((100vh - 60px) / 2); }
.apiExamples > :only-child{ max-height: calc(100vh - 60px); }
```

A terceira regra é a que quase ninguém escreve: **dois cards dividem a viewport ao meio; um card sozinho fica com ela inteira**. Sem ela, um response de 200 linhas empurra o request para fora da tela.

**Largura.** As referências usam **448px** (Trigger) ou metade do conteúdo (Scalar). A coluna `col--3` do Docusaurus dá ~25%, que em 1200px são ~300px — apertado para um bloco de código com `curl` multi-linha. **O painel precisa de `col--4` (33%) ou de largura fixa fora do grid do Infima**; isso é decisão de layout que a spec tem de cravar, não detalhe.

### 4.8 `ApiDocItem` — o container de três colunas

Composição, não swizzle (ver 3.2). O componente:

1. lê `frontMatter` via `useDoc()`;
2. renderiza sidebar (do próprio tema, intocada) + conteúdo + coluna direita;
3. define `hide_table_of_contents: true` como convenção do front matter da seção de API — o painel **substitui** o TOC, e isso não é escolha nossa: nenhuma das referências medidas tem TOC na página de endpoint (§2.2), e o Mintlify declara a regra explicitamente — *"The components in a `<Panel>` replace a page's table of contents"* ([Panel](https://www.mintlify.com/docs/components/panel));
4. move o conteúdo do painel para a direita a partir de um componente MDX marcador no corpo (ex.: `<ApiExample>…</ApiExample>`, espelhando `<RequestExample>`/`<ResponseExample>` do Mintlify) **ou** a partir do front matter.

**A escolha entre marcador MDX e front matter é uma decisão de arquitetura, não de estilo.** Marcador dá liberdade ao autor e obriga portal/context; front matter é mais simples e mais rígido. Ticket de decisão [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) precisa fechar isso.

**Comportamento em tela pequena também é decisão, e as referências divergem (§2.2).** A Trigger **duplica os blocos no HTML** — cópia inline abaixo do cabeçalho para `< xl`, cópia sticky para `≥ xl`; o Scalar **reordena por `grid-area`** e coloca os exemplos **antes** dos parâmetros. Duplicar custa peso e risco de divergência; reordenar exige que o painel seja parte do mesmo grid. Em Docusaurus, reordenar é o caminho natural, porque o conteúdo já é um só fluxo de MDX.

---

## 5. Camada C — o que exige execução de verdade

### 5.1 O que "executar" significa

Fazer o request é a parte barata. `fetch()` é nativo do browser. O plugin de OpenAPI, com 29 dependências de runtime, executa assim — sem biblioteca de HTTP:

```ts
const response = await fetchWithtimeout(finalUrl, requestOptions, timeout);
```

— [`theme/ApiExplorer/Request/makeRequest.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Request/makeRequest.ts)

O que é caro está em volta: formulário por parâmetro com validação por tipo, montagem do body (`raw`, `urlencoded`, `formdata`, `file`), seletor de servidor, seletor de content-type, gestão de credencial por esquema de segurança, estado da resposta, download de binário, e a **geração do snippet refletindo o que o usuário digitou**.

Medida do custo dessas peças, contada no repositório do plugin: **211 arquivos** em `packages/docusaurus-theme-openapi-docs/src` contra 71 em `packages/docusaurus-plugin-openapi-docs/src`. A execução é a maior parte do plugin, não a menor.

### 5.2 O muro é CORS, e ele não se resolve com CSS

Um site Docusaurus buildado é estático. Não existe servidor nosso para intermediar. Então o `fetch()` sai do browser do leitor, da origem da documentação, para a origem da API — request cross-origin, sujeito a preflight e a `Access-Control-Allow-Origin`.

Duas evidências primárias de que este é **o** problema, e não um detalhe:

1. **O plugin tem um tipo de erro dedicado a isso.** `makeRequest.ts` define `RequestErrorType = "timeout" | "network" | "cors" | "abort" | "unknown"` e devolve a mensagem *"The request was blocked, possibly due to CORS restrictions. Ensure the server allows requests from this origin, or try using a proxy."* Além disso, ele aceita um `proxy` opcional que é **prefixado na URL**, vindo do front matter ou de `themeConfig.api.proxy` — [`ApiExplorer/Request/index.tsx`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Request/index.tsx). O botão de enviar só aparece se `(item.servers || proxy) && !hide_send_button`.

2. **O Mintlify proxia por padrão.** Na configuração `api.playground.proxy`, a doc deles afirma: *"Whether to pass API requests through Mintlify's proxy server. Defaults to `true`"*. Com `proxy: false`, *"the playground sends requests directly from the browser to your API"* e aí *"you will need to configure CORS on your server"* — [API playground overview](https://www.mintlify.com/docs/api-playground/overview).

3. **A Clerk, em produção, manda a secret key do leitor por um proxy de terceiro.** O config do componente `BapiScalar` em `clerk.com/docs/reference/backend-api` traz `"proxyUrl": "https://proxy.scalar.com/"`, e a string está confirmada dentro do bundle JS servido (§2.7). O motivo é o de sempre: `api.clerk.com` não emite CORS para `clerk.com`. Uma empresa cujo produto **é autenticação** aceitou que o header `Authorization` do leitor transitasse por infraestrutura de terceiro para o botão *Send* existir.

**Conclusão dura:** o playground das referências não é uma proeza de front-end. É um **serviço**. A diferença entre o playground delas e um `fetch()` nosso não é código React — é um servidor que elas operam (ou contratam) e nós não temos.

### 5.2.1 E uma referência do alvo simplesmente desligou

Perplexity e Trigger.dev rodam **o mesmo Mintlify**, servem **o mesmo CSS byte a byte** — e fizeram escolhas opostas (§2.7):

- **Perplexity mantém**: `<button aria-label="Try it" data-testid="try-it-button">`, inline no card do cabeçalho, na cor da marca.
- **Trigger.dev desligou**: `"playground": { "display": "simple" }`. O container ainda se chama `id="api-playground-2-operation-page"`, mas renderiza só cabeçalho, parâmetros e exemplos estáticos; grep por `>Try it<`, `>Send<`, `Send Request` devolve **zero**.

Isso desarma o argumento de que playground executável é requisito de excelência. **Uma referência do alvo confirmado tinha o botão de graça e escolheu não usar** — e o que ela manteve é tudo da camada B: badge, campos, aninhamento, 8 linguagens de snippet, tabs de status code. Exatamente o recorte que o vanilla alcança.

### 5.3 O que custa, concretamente, cada nível de execução

| Nível | O que o leitor pode fazer | Custo em vanilla | Dependência nova? |
| --- | --- | --- | --- |
| **0 — Estático** | ler request e response de exemplo, copiar o `curl` | ~0 além do visual | não |
| **1 — Snippet vivo** | editar valores dos parâmetros e ver o `curl`/Python/JS **se atualizar**, copiar e rodar no próprio terminal | estado local + template string por linguagem. Real, mas contido: uma função `(endpoint, params) => string` por linguagem | não |
| **2 — Execução direta** | clicar *Send* e ver a resposta real | nível 1 + `fetch` + render da resposta + guarda de credencial. **Só funciona se a API alvo emitir CORS para a origem da doc** | não, mas exige controle da API |
| **3 — Execução proxiada** | igual ao nível 2 contra qualquer API | nível 2 + **um servidor** (function, worker, reverse proxy) | não é dependência npm; é **infraestrutura**, com autenticação, rate limit e responsabilidade sobre credencial de terceiro trafegando |

**O nível 1 é o ponto de melhor retorno em vanilla,** e é subestimado: ele entrega quase toda a sensação de playground — o leitor mexe e a página responde — sem nenhum problema de rede, de CORS, de segredo ou de infra. É o que a spec deveria cravar como alvo.

### 5.4 Credencial do usuário: risco que se herda junto com o botão

O plugin persiste a autenticação digitada, com default em `sessionStorage`:

```ts
const storage = createStorage(opts?.authPersistence ?? "sessionStorage");
```

— [`ApiExplorer/Authorization/slice.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Authorization/slice.ts)

Ter caixa de API key na documentação significa: chave de produção colada em campo de texto de um site estático, guardada em storage do browser, e — no nível 3 — trafegando por um proxy. A Clerk mostra o desfecho desse caminho em produção: secret key de Backend API passando por `proxy.scalar.com`, infraestrutura de terceiro (§2.7).

Em ambiente corporativo isso não é decisão de design; é conversa com segurança, e a resposta previsível é "não". **É um argumento independente, e provavelmente mais forte que o técnico, para parar no nível 1.**

---

## 6. Geração a partir de OpenAPI sem plugin

### 6.1 A resposta curta

**Dá, e o mecanismo é oficial e sem dependência.** O que não dá barato é a *semântica de OpenAPI*, não o encanamento do Docusaurus.

### 6.2 O encanamento existe e é vanilla

Um plugin do Docusaurus é *"a function that takes two parameters: `context` and `options`. It returns a plugin instance object (or a promise)"*, e o array `plugins` do config aceita **função inline**, caminho local (`'./my-plugin'`) e tupla com opções ([Plugins](https://docusaurus.io/docs/advanced/plugins), [Using plugins](https://docusaurus.io/docs/using-plugins)). Nenhum pacote npm envolvido.

Os hooks relevantes, todos documentados ([Lifecycle APIs](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis), [Extending infrastructure](https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure)):

- **`loadContent()`** — ler e normalizar o spec.
- **`contentLoaded({content, actions})`** — `createData()` para gravar JSON estático e `addRoute()` para criar as páginas.
- **`extendCli(cli)`** — registrar um comando próprio (`cli` é um objeto **commander v5**; a doc avisa *"The commander version matters!"*).
- **`getPathsToWatch()`** — *"The paths are watched by the dev server so that the plugin lifecycles are reloaded when contents in the watched paths change"* — é isso que faz editar o spec recarregar a doc em dev.

Há duas formas, e a escolha importa:

| Forma | Como | Prós | Contras |
| --- | --- | --- | --- |
| **Emitir `.mdx` em disco** | script Node + `extendCli`, escreve arquivos que o `plugin-content-docs` depois consome | arquivo inspecionável, diff no PR, o autor pode editar à mão depois, funciona igual em dev e build | arquivo gerado versionado (ou passo obrigatório antes do build) |
| **Rotas em memória** | `loadContent` + `createData` + `addRoute` | nada gerado no repo, sempre em sincronia | não passa pelo pipeline de MDX; sem TOC/anchors automáticos; nada para o autor editar |

É a primeira que o plugin de OpenAPI escolheu: `extendCli` registra `gen-api-docs`, `gen-api-docs:version`, `clean-api-docs`, `clean-api-docs:version`, e a geração escreve `{id}.api.mdx`, `{id}.info.mdx`, `{id}.tag.mdx`, `schemas/{id}.schema.mdx` e um `sidebar.ts` — [`plugin-openapi-docs/src/index.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-plugin-openapi-docs/src/index.ts).

### 6.3 O MDX que o plugin gera é uma casca — e isso é a boa notícia

```js
createApiPageMD({...}) → [
  'import MethodEndpoint from "@theme/ApiExplorer/MethodEndpoint";',
  'import ParamsDetails from "@theme/ParamsDetails";',
  'import RequestSchema from "@theme/RequestSchema";',
  'import StatusCodes from "@theme/StatusCodes";',
  …
  createHeading(title),
  createMethodEndpoint(method, path),
  createParamsDetails({ parameters }),   // → <ParamsDetails parameters={…} />
  createStatusCodes({ responses }),      // → <StatusCodes responses={…} />
]
```

— [`plugin-openapi-docs/src/markdown/index.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-plugin-openapi-docs/src/markdown/index.ts)

O `.api.mdx` gerado **não é documentação legível**: é um punhado de imports mais três componentes recebendo o objeto OpenAPI inteiro serializado como prop. Toda a inteligência mora nos componentes de tema, em runtime.

**Consequência arquitetural direta.** Um gerador vanilla pode escolher o oposto — **achatar no build**: emitir `<ParamField>`, `<ResponseField>` e `<CodeGroup>` explícitos, com valores literais, um por parâmetro. O MDX gerado fica legível, revisável em diff, editável à mão, e os componentes de runtime ficam burros (só apresentação). Isso é melhor para este projeto por três razões: casa com o axioma "a spec é o entregável", elimina a necessidade de um renderer de schema em runtime, e deixa o conteúdo mockado plausível mesmo sem gerador rodando.

### 6.4 Onde a fragilidade mora de verdade

Cada item abaixo é trabalho que o plugin faz com biblioteca e que um gerador vanilla teria de fazer sozinho — as bibliotecas usadas estão declaradas em [`plugin-openapi-docs/package.json`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-plugin-openapi-docs/package.json):

| Problema | Como o plugin resolve | Sem dependência |
| --- | --- | --- |
| Spec em **YAML** | `@redocly/openapi-core` | **Node não tem parser de YAML embutido.** Ou o spec vive em JSON no repo, ou se depende de `js-yaml` — que é dependência direta de `@docusaurus/utils` ([package.json](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/package.json)) e portanto está no `node_modules`… por hoisting. Com pnpm em modo estrito, quebra. **Fragilidade real.** |
| `$ref` (locais e externos) | `@apidevtools/json-schema-ref-parser` + `bundle()` do Redocly | Resolver `#/components/...` local é ~50 linhas. `$ref` para **outro arquivo** ou URL já é outro projeto. |
| `allOf` / `oneOf` / `anyOf` | `allof-merge` | `allOf` exige merge com regra de precedência e conflito de tipo. `oneOf`/`anyOf` não têm forma canônica — viram abas, e a escolha de UI é decisão de spec. |
| **Schemas circulares** | serializador com `cycleReplacer` que substitui o ciclo por `circular()` / `circular(Título)` — [`openapi/utils/loadAndResolveSpec.ts`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/packages/docusaurus-plugin-openapi-docs/src/openapi/utils/loadAndResolveSpec.ts) | É recursão infinita esperando acontecer. Sem guarda de ciclo, o gerador **trava o build**. |
| `discriminator` com `mapping` | `OpenAPIParser` vendorizado do Redoc | Resolver ponteiro por ponteiro; nível de esforço médio. |
| Swagger 2.0 | `swagger2openapi` | Fora de cogitação. Restringir a OpenAPI 3.x é a saída — e é aceitável. |
| **Snippet por linguagem** | `openapi-to-postmanv2` + `postman-collection` no build, `postman-code-generators` no runtime | **O maior item.** Gerar `curl` é template string. Gerar Python/Node/Go idiomáticos, com auth, body e query corretos, é um gerador por linguagem. Ver 6.5. |
| Sidebar automática | `slugify` + template Mustache que escreve `sidebar.ts` | Gerar um array de items é fácil; o difícil é a **estratégia** (uma categoria por tag? ordem? label?) — decisão, não código. |

### 6.5 O item mais subestimado: snippets multi-linguagem

Vale isolar porque é onde a intuição erra. O plugin não gera snippets à mão: converte o spec em uma **Postman Collection** e delega ao `postman-code-generators`. Isso existe porque cada linguagem tem convenções próprias — como o `requests` do Python monta query params, como o `fetch` do Node trata headers, como Go monta o `http.NewRequest`.

Em vanilla, a escala honesta:

- **curl** — template string. ~30 linhas. Faça.
- **Python (`requests`) e JS (`fetch`)** — ~80 linhas cada, e ficam bons se o escopo for JSON body + bearer auth + query params.
- **Go, Java, C#, PHP, Ruby** — cada um é um mini-gerador com sua própria noção de erro e de tipo. **Não faça.** E note que `bash`, `java`, `php`, `csharp` e `ruby` também não estão no bundle do Prism (3.5), então cada linguagem custa também uma entrada em `additionalLanguages`.

**Recomendação:** três linguagens (curl, Python, JavaScript), cravadas na spec, com a regra de que uma quarta só entra com justificativa. Mintlify e Fern mostram 5-7 porque geram; nós escrevemos.

### 6.6 O custo real do gerador vanilla, somado

Para um spec OpenAPI 3.x **em JSON**, **sem `$ref` externo**, **sem `oneOf` profundo** e **sem ciclos**: um script Node de 300-500 linhas, sem dependência, emitindo MDX achatado. Isso é uma tarde de trabalho e é sólido.

Cada premissa que cair multiplica o custo, e a primeira a cair na vida real é o YAML. **A mitigação certa não é escrever um parser: é travar o contrato** — "o spec entra neste repo como JSON, OpenAPI 3.1, sem `$ref` externo" vira requisito de entrada do gerador, verificado por um validador de 20 linhas que falha o build com mensagem clara. Restrição declarada é barata; restrição descoberta em produção é cara.

---

## 7. O que se perde conscientemente

Dito de forma que a decisão possa ser tomada de olho aberto. Nada aqui é "impossível"; tudo aqui é "custa mais do que vale sob o axioma 2".

1. **O botão *Send*.** Sem proxy, só funciona contra API que emita CORS para a origem da doc. Para o produto fictício deste repo isso é irrelevante (podemos declarar que a API fictícia permite). Para o **transplante corporativo**, é a perda mais concreta — e o substituto é o nível 1 (snippet vivo). Atenuante medido: a Trigger.dev, rodando o mesmo Mintlify da Perplexity, **desligou o playground por escolha** (§5.2.1); e a Clerk só o tem porque aceita proxy de terceiro. Esta perda é menos singular do que parece.
2. **Formulário completo de request.** Upload de arquivo, `multipart/form-data`, seletor de content-type, seletor de servidor, esquemas de auth múltiplos. O plugin gasta dezenas de arquivos nisso; em vanilla é escopo que não fecha.
3. **Snippets em mais de três linguagens.** Ver 6.5.
4. **Página de schema autônoma com navegação cruzada.** O plugin gera `schemas/{id}.schema.mdx` e liga endpoint→schema. Em vanilla, ou os schemas são inlined em cada endpoint (duplicação) ou vira uma página escrita à mão.
5. **`oneOf`/`anyOf` com discriminador em abas.** O plugin tem `DiscriminatorTabs` e `SchemaTabs`. Em vanilla: renderizar a primeira variante e listar as outras em prosa. É perda de fidelidade, e é visível para quem conhece a API.
6. **Suporte a Swagger 2.0 e a specs "selvagens".** Assumido fora.
7. **Callbacks e webhooks do OpenAPI.** O plugin tem `createCallbacks`/`createCallbackMethodEndpoint`. Fora.
8. **Sincronização automática spec↔doc.** Com plugin, mudar o spec e rodar `gen-api-docs` reflete tudo. Com gerador próprio, reflete **o subconjunto que o gerador entende** — e o que ele não entende some silenciosamente. **Mitigação obrigatória: o gerador precisa falhar alto** em construção que não sabe tratar, nunca ignorar.

### O que **não** se perde, e vale dizer em voz alta

- O layout de três colunas com painel sticky — o tema já é duas colunas com a direita sticky (§3.1), e a terceira sai **sem swizzle**, por `docItemComponent` (§3.2–3.3).
- Todos os componentes visuais da seção 4 — nenhum precisa de biblioteca.
- Persistência da linguagem escolhida **entre páginas** — o `groupId` do `Tabs` faz **mais** que o Mintlify aqui, que sincroniza só dentro da página (§4.6).
- Badge de método, required, aninhamento por `<details>`, seletor de status — 100%, e o Mintlify usa `<details>` nativo para o aninhamento, o mesmo elemento que o `@theme/Details` embrulha (§2.5).
- Geração a partir do spec — sim, com contrato de entrada travado (§6.6).
- Copiar código, word wrap, realce de sintaxe, dark/light — nativos.

---

## 8. O que isso implica para a spec

Não são decisões — são as chamadas que ficaram maduras e que o ticket de decisão [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) deveria fechar:

1. **Segunda instância de `plugin-content-docs` com `docItemComponent` próprio** é a rota estrutural — **não swizzle**. Não existe ponto `safe` de swizzle para layout de página de doc (§3.3); `docItemComponent` é opção pública, custo de upgrade zero, e é o mesmo caminho que o plugin de OpenAPI usa.
2. **Alvo de execução = nível 1 (snippet vivo).** Cravar isso mata a discussão de proxy, de CORS e de credencial de uma vez.
3. **MDX achatado**, não MDX de props serializadas. O gerador emite o que um humano escreveria.
4. **Contrato de entrada do gerador travado**: OpenAPI 3.x, JSON, sem `$ref` externo, sem ciclo — validado, com falha alta.
5. **Três linguagens de snippet**, com `additionalLanguages: ['bash']` no config.
6. **`hide_table_of_contents: true`** como convenção da seção de API; o painel direito substitui o TOC.
7. **Componentes com inicial maiúscula** — restrição de MDX v3, não estilo.

8. **Painel direito de 448px**, mais largo que o TOC padrão — `col--4` ou largura fixa fora do grid do Infima. `col--3` dá ~300px em 1200px, e o alvo medido é 448px (§2.2, §4.7).
9. **Identidade separada da aparência**, à la `data-component-part` do Mintlify: cada peça ganha um nome estável no DOM, e o CSS Module cuida só do visual (§2.1). É o que torna a skin trocável de verdade (axioma 3).

### Perguntas abertas

Estas ficaram maduras **porque a medição encontrou divergência entre as referências** — ou seja, não há resposta a descobrir, só decisão a tomar (axioma 5).

- **Cor por verbo HTTP:** GET verde/POST azul (Mintlify) ou GET azul/POST verde (Scalar)? E `DELETE` por extenso ou `DEL`? (§2.3)
- **Opcional se marca?** Scalar tem `.property-optional`; Mintlify marca só o `required`. (§2.4)
- **Aninhado nasce aberto ou fechado?** Clerk força tudo aberto; Trigger colapsa e faz lazy-render. Fechado custa `Ctrl+F`. (§2.5, §4.4)
- **Em tela pequena, exemplos antes ou depois dos parâmetros?** Scalar põe antes; Trigger põe depois. (§2.2, §4.8)
- Painel direito alimentado por **marcador MDX** (`<ApiExample>` com portal) ou por **front matter**? (§4.8)
- Badge de método na sidebar vale um swizzle `unsafe` de `DocSidebarItem/Link`, ou fica em `sidebar_class_name` + CSS? (§4.1)
- `ParamField` e `ResponseField` são um componente com `kind` ou dois? (§4.5)
- O gerador roda em CI (artefato versionado) ou é passo local do autor? (§6.2)

---

## 9. Fontes

**Docusaurus — código**
- [`theme-classic/src/theme/DocItem/Layout/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/DocItem/Layout/index.tsx) e `styles.module.css`
- [`theme-classic/src/theme/TOC/styles.module.css`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/TOC/styles.module.css)
- [`theme-classic/src/theme/CodeBlock/`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/CodeBlock)
- [`theme-classic/src/getSwizzleConfig.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/getSwizzleConfig.ts)
- [`theme-classic/package.json`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/package.json)
- [`theme-common/src/components/Details/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-common/src/components/Details/index.tsx)
- [`plugin-content-docs/src/routes.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/routes.ts)
- [`docusaurus/src/commands/swizzle/components.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/commands/swizzle/components.ts) e `config.ts`
- [`docusaurus-utils/package.json`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/package.json)
- [`website/docusaurus.config.ts`](https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts)
- [`prism-react-renderer/packages/generate-prism-languages/index.ts`](https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts)

**Docusaurus — documentação**
- [React em MDX](https://docusaurus.io/docs/markdown-features/react) · [Tabs](https://docusaurus.io/docs/markdown-features/tabs) · [Code blocks](https://docusaurus.io/docs/markdown-features/code-blocks)
- [Swizzling](https://docusaurus.io/docs/swizzling) · [Client architecture](https://docusaurus.io/docs/advanced/client) · [Plugins](https://docusaurus.io/docs/advanced/plugins) · [Using plugins](https://docusaurus.io/docs/using-plugins)
- [Lifecycle APIs](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis) · [Extending infrastructure](https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure) · [plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs)

**`docusaurus-plugin-openapi-docs` v5.1.3** — [repositório](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs)
- `packages/docusaurus-plugin-openapi-docs/`: `package.json`, `src/index.ts`, `src/markdown/index.ts`, `src/markdown/createMethodEndpoint.ts`, `src/markdown/createParamsDetails.ts`, `src/markdown/createStatusCodes.ts`, `src/openapi/utils/loadAndResolveSpec.ts`
- `packages/docusaurus-theme-openapi-docs/`: `package.json`, `src/theme/ParamsItem/index.tsx`, `src/theme/ApiExplorer/Request/index.tsx`, `src/theme/ApiExplorer/Request/makeRequest.ts`, `src/theme/ApiExplorer/Authorization/slice.ts`
- `demo/docusaurus.config.ts`

**Mintlify — documentação de componentes**
- [Fields (ParamField / ResponseField)](https://www.mintlify.com/docs/components/fields) · [Code groups](https://www.mintlify.com/docs/components/code-groups) · [Expandables](https://mintlify.com/docs/content/components/expandables) · [API playground overview](https://www.mintlify.com/docs/api-playground/overview)

**Páginas de referência em produção** — HTML e CSS servidos, medidos via `curl` (§2)
- `https://docs.perplexity.ai/api-reference/chat-completions-post` — Mintlify, 663 KB de HTML SSR; fonte da anatomia de `param-field`, `expandable`, `method-pill`, `code-group-tab-bar`, `tryit-button`
- `https://trigger.dev/docs/management/runs/retrieve` — Mintlify, mesma engine e mesmo CSS; fonte do playground desligado (`"playground": { "display": "simple" }`)
- `https://clerk.com/docs/reference/backend-api` — Scalar; contraponto (grid nomeado, `proxy.scalar.com`, `expandAllSchemaProperties`)
