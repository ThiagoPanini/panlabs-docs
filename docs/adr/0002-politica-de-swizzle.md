# ADR 2 — Política de swizzle

**Status:** aceito · slice 1 · 2026-08-07 · **com errata** · 2026-08-13

> ### Errata — a consequência 4 é fato errado
>
> **A decisão não muda.** A escada de seis degraus, o orçamento `unsafe` zero e a disciplina de registro ficam inteiros, e nada aqui é supersedido. O que esta errata corrige é **um fato afirmado nas «Consequências»**, e ele estava errado desde o slice 1.
>
> A consequência 4 diz que a **faixa de tabs de largura total abaixo do navbar** *"exigiria reestruturar `Navbar/*`"*. **Não exige.**
>
> Medido num Docusaurus 3.10.2 real pela [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) e montado em produção pela [#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78): a faixa sai de **degraus 0, 1 e 2** — dois tokens do Infima, quatro regras sobre classes estáveis e um item de `themeConfig.navbar.items`. `Navbar/Layout` e `Navbar/Content` continuam `unsafe` nas duas ações e continuam **intocados**, e o portão 7 passa **com a faixa montada**.
>
> Consequência para a política, e ela é a favor dela: o zero de `unsafe` custava uma peça de chrome a menos do que este documento cobrava. **Um item que a lista dava por perdido era alcançável o tempo todo** — que é exatamente o resultado que a última coluna do ledger existe para produzir, e o motivo de a escada mandar descer um degrau só quando o de cima *comprovadamente* não alcança.
>
> **Errata e não supersessão** é a forma certa aqui: os ADRs deste repositório são imutáveis, a decisão continua valendo verbatim, e o que se corrige é uma afirmação de fato. Reabrir o ADR inteiro para consertar uma linha de consequência transformaria o registro num documento vivo, que é o oposto do que um ADR é.
>
> As outras cinco consequências continuam de pé. O ledger correspondente está em [`docs/design/swizzle.md`](../design/swizzle.md) §4, e a anatomia da faixa em [`docs/design/chrome.md`](../design/chrome.md) §3.1.

## Contexto

Dos **220** componentes swizzláveis do `theme-classic`, **173 não têm nenhuma ação `safe`**. E não existe ponto `safe` dentro de uma página de documentação: `DocItem/Layout`, `DocItem/Content` e `DocBreadcrumbs` caem todos no default `unsafe`. Não é contornável por CSS — não se injeta nó no DOM por folha de estilo.

`unsafe` significa o que diz. É licença explícita para quebrar em release *minor*, e já foi exercida três vezes dentro do próprio v3: `CodeBlock` reestruturado na 3.8, `Tabs` e `DocCard` na 3.10, e o boilerplate de `--wrap` mudou na 3.7. Não é risco hipotético; é cadência observada.

Duas correções precederam qualquer política, e as duas valem mais que a lista que produzem.

**O eixo `--wrap` contra `--eject` é o eixo errado.** Nenhum dos dois pode ser o padrão, porque os itens mais baratos do inventário inteiro têm `wrap: forbidden` / `eject: safe` — `MDXComponents`, `Admonition/Types`, `NavbarItem/ComponentTypes`, `prism-include-languages`. Ejetar ali significa escrever um arquivo de cinco linhas à mão, sem copiar uma linha de implementação do Docusaurus. O comentário no próprio `getSwizzleConfig` diz *"Meant to be ejected"*. O `eject` mais barato do repositório é mais barato que qualquer `wrap`.

**Três coisas diferentes moram em `src/theme/`, e chamar todas de swizzle esconde a diferença.** A separação entra na linguagem ubíqua do repositório:

| Termo | O que é | Acoplamento ao upstream |
| --- | --- | --- |
| **Swizzle** | `src/theme/X` que envolve ou substitui um componente que o `theme-classic` **já tem** | à assinatura de props (`wrap`) ou à implementação inteira (`eject`) |
| **Componente de tema próprio** | `src/theme/X` que o `theme-classic` **não tem**, registrado por opção pública — `ApiDocItem` via `docItemComponent` | **nenhum**; o Docusaurus só conhece o nome que a config deu |
| **Registro** | `src/theme/X` que é **objeto**, não componente — `MDXComponents`, `Admonition/Types` | **nenhum**; espalha-se o original e acrescentam-se chaves |

Chamar o `ApiDocItem` de swizzle o faria parecer dívida, quando é a técnica de menor acoplamento do projeto inteiro.

## Decisão

### a) A escada de seis degraus

O eixo certo não é wrap-contra-eject. É **quanto código do Docusaurus entra no repositório** — porque é exatamente isso que se paga no upgrade.

| # | Degrau | O que custa no upgrade |
| --- | --- | --- |
| **0** | **Variável do Infima** — sobrescrita no nosso CSS | nada |
| **1** | **Classe estável** — `ThemeClassNames` (contrato explícito de não-quebra), as classes do Infima, `className` em `sidebars.js` / `_category_.json` / item de navbar | nada |
| **2** | **Opção pública** — `docItemComponent`, `themeConfig.*`, `admonitions.keywords`, `tableOfContents.{min,max}HeadingLevel`, `src/theme/Root` | nada |
| **3** | **Registro `safe` escrito à mão** — `MDXComponents`, `Admonition/Types`, `NavbarItem/ComponentTypes`, `prism-include-languages` | chave nova ou removida no objeto — **erro de build** |
| **4** | **`swizzle --wrap` em componente `safe`** | mudança de props — **erro de build**; componente renomeado também |
| **5** | **`swizzle --eject` em componente `safe`** | reconciliação manual; **correção de a11y/i18n/perf upstream não chega, e nada avisa** |
| — | **`unsafe`** | **proibido** — ver (b) |

**Desce-se um degrau só quando o de cima comprovadamente não alcança, e o motivo vai escrito no ledger.** Cada degrau abaixo do 2 troca *"o build me avisa"* por *"eu tenho que lembrar"*.

**Entre 4 e 5 o critério não é gravidade, é intenção: `wrap` para conservar, `eject` para substituir.** Ejetar um ícone de cinco linhas é mais seguro do que envolvê-lo, porque não há nada a conservar; envolver um componente cuja lógica se quer continuar recebendo é o inverso. A régua prática: **se você está copiando mais de ~20 linhas de lógica upstream, você está conservando alguma coisa — então ou envolve, ou não faz.**

**Antes de aprovar qualquer swizzle, verificar se existe opção pública que resolve.** O `docItemComponent` é opção pública do `plugin-content-docs` e vira literalmente o `component` da rota: substitui o layout inteiro da página com custo de upgrade zero.

### b) Orçamento `unsafe`: zero

**Zero, e é invariante verificável — não teto numérico.** *"No máximo dois"* convida a gastar dois; zero não tem gradiente para escorregar.

Por que se sustenta, e não é aspiração:

1. **Nada no mapa precisa.** Percorridos os vinte e sete tickets fechados, não sobra um item que exija `unsafe`.
2. **`unsafe` não é cautela, é licença de quebra em *minor***, e já foi exercida três vezes dentro do próprio v3.
3. **O alvo de replicação não tem quem pague.** Ambiente corporativo com orçamento de dependência apertado tem, pelo mesmo motivo, orçamento de manutenção apertado. Quem não pode adicionar um pacote não vai reconciliar `DocItem/Layout` à mão a cada minor.
4. **Generaliza uma regra que já existia** — *nenhum swizzle `unsafe` é comprado por estética; se um delta parece exigir swizzle, o delta está errado* — de estética para **recurso**, que é onde a pressão real estava.

**A escotilha:** reabrir o zero exige **ADR novo**, não decisão de ticket. Um ticket que descubra precisar de `unsafe` não decide sozinho: escreve o ADR.

### c) A disciplina de registro

Quatro peças, e a primeira detecta problema **antes de haver sintoma**:

1. **`swizzle --list` congelado como artefato no repositório, diffado a cada upgrade.** É o único mecanismo que enxerga a falha silenciosa que a doc do Docusaurus descreve: *"If a component is called `Sidebar` and it's later renamed to `DocSidebar`, your swizzled component will be **completely ignored**"* — sem erro, o arquivo vira código morto e a customização some.
2. **Cabeçalho de versão obrigatório no topo de todo arquivo ejetado.** O gerador do Docusaurus **remove o cabeçalho de licença** ao ejetar (`replace(/^\/\*.+?\*\/\s*/ms, '')`), então sem anotação não há contra o que diffar.
3. **`--typescript` sempre, mesmo em projeto JavaScript.** Sem a flag o eject ignora `.ts`/`.tsx` e copia o JavaScript transpilado de `lib/`. Com ela, `WrapperProps<typeof XType>` transforma mudança de props em **erro de build** em vez de bug de runtime.
4. **O ledger como tabela viva** em `docs/design/swizzle.md`, cada linha com degrau, o que muda, e **por que o degrau acima não alcançou**. Essa última coluna é o que permite promover itens no upgrade.

## Consequências

O zero cobra um preço, e cada linha é perda nomeada — não silêncio:

1. **Qualquer nó injetado dentro do corpo da página de documentação** — eyebrow acima do título, bloco de feedback no rodapé, CTA lateral. `DocItem/Layout` e `DocItem/Content` são `unsafe`, e não é contornável por CSS.
2. **Breadcrumb reestruturado.** `DocBreadcrumbs` é `unsafe`. Fica o breadcrumb nativo, re-marcado por variável e classe estável.
3. **A proporção ~56/44 do alvo.** Exigiria `max-width: 75% !important` em classe hasheada.
4. ~~**Faixa de tabs de largura total abaixo do navbar.** Exigiria reestruturar `Navbar/*`.~~ **Fato errado — ver a errata no topo.** A faixa custa degraus 0, 1 e 2; `Navbar/*` continua `unsafe` e intocado.
5. **TOC com anatomia nova** — barra de progresso, seções extras. `TOC` e `TOCItems` são `unsafe`; estilo e profundidade seguem alcançáveis.
6. **Ícone preso dentro de componente `unsafe`** mantém o desenho padrão do Docusaurus. A regra responde sem enumerar: **o que só é alcançável por `unsafe` não é trocado.**

E uma boa notícia que reduz o escopo: a assinatura visual mais reconhecível do alvo — **sidebar com ícones e agrupamento** — sai inteira de `className` mais `mask`/`currentColor`, **sem swizzle nenhum**. O que mais parece exigir ejeção não exige.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| `--wrap` como padrão, `--eject` como exceção | Os itens mais baratos do inventário têm `wrap: forbidden`; o eixo está errado |
| Teto numérico de `unsafe` ("no máximo dois") | Convida a gastar dois, e tem gradiente para escorregar |
| Reabrir o zero por decisão de ticket | A política sobrevive à troca de skin, logo é ADR — e ADR só se reabre com ADR |
| Chamar `ApiDocItem` de swizzle | Faria a técnica de menor acoplamento do projeto parecer dívida |
| `--typescript` só em projeto TypeScript | Sem a flag, o eject copia o JS transpilado de `lib/` e a mudança de props vira bug de runtime |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Escada de seis degraus | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §1, sobre os números medidos na [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) |
| Três significados de `src/theme/` | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §0 |
| Opção pública acima de `--wrap` | herdado | [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) — `docItemComponent` vira o `component` da rota |
| Orçamento `unsafe` zero | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §2, generalizando a regra de estética da [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) |
| `unsafe` como licença de quebra em minor | herdado | doc oficial do Docusaurus; três exercícios medidos dentro do v3 |
| `swizzle --list` congelado | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — a falha de componente renomeado é silenciosa |
| Cabeçalho de versão em arquivo ejetado | herdado | o gerador remove o cabeçalho de licença ao ejetar ([#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5)) |
| `--typescript` sempre | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) |
