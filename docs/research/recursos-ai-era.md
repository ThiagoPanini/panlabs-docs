# Recursos AI-era em Docusaurus vanilla

Pesquisa do ticket [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8). Responde: como se implementa, em Docusaurus vanilla, o conjunto de recursos que hoje faz uma documentação parecer de 2026 — `llms.txt`, "copiar página como Markdown", "abrir no ChatGPT/Claude".

Método: as afirmações abaixo saem de fontes primárias — a especificação da convenção, o código-fonte do Docusaurus, e os **artefatos efetivamente servidos** pelas referências (buscados por HTTP, não lidos em blog). Onde havia dúvida sobre custo, ela foi resolvida por medição: um Docusaurus 3.10.2 real foi montado, o plugin foi escrito, o build rodou. Os números marcados **[medido]** vêm dessa sonda.

---

## 1. Resumo executivo

Os três recursos não são um bloco: têm custos muito diferentes e devem ser decididos separadamente.

| Recurso | Custo vanilla | Veredito |
| --- | --- | --- |
| `.md` bruto por rota | ~60 linhas de plugin próprio, zero swizzle | **Barato. É a fundação — os outros dois dependem dele.** |
| `llms.txt` (índice) | ~15 linhas no mesmo plugin | **Quase de graça, uma vez que o `.md` existe.** |
| `llms-full.txt` (corpus) | ~5 linhas no mesmo plugin | **De graça. É concatenação.** |
| Controle "copiar/abrir" na página | Swizzle **Unsafe** de `DocItem/Layout` (`--danger`) + ~68 linhas de componente | **O caro. Único ponto que compra dívida de manutenção.** |

O achado que mais restringe a spec: **não existe ponto `Safe` no `theme-classic` para hospedar o controle numa página de doc**. Detalhado na seção 5.

O segundo achado que mais restringe: **`postBuild` não roda em `docusaurus start`**, então o `.md` não existe em desenvolvimento e o botão de copiar copiaria HTML. Há mitigação medida na seção 6.

---

## 2. O estado da arte

### 2.1 O que cada referência serve

Todos os artefatos abaixo foram buscados por HTTP em 2026-08-05.

| | FastMCP | Neon | Trigger.dev |
| --- | --- | --- | --- |
| Plataforma | Mintlify | própria (Next.js/Vercel) | Mintlify |
| `llms.txt` | 22.377 B, 194 linhas | 35.287 B, 374 linhas | 57.365 B, 322 linhas |
| entradas de link | 188 | 241 | 313 |
| seções `H2` | 1 (`## Docs`) | 22 (temáticas) | 2 (`## Docs`, `## OpenAPI Specs`) |
| links terminando em `.md` | 188/188 | 229/241 | 310/313 |
| `llms-full.txt` | 2.105.572 B (~2,1 MB) | 6.019.765 B (~6,0 MB) | 2.287.761 B (~2,3 MB) |
| `.md` por rota | sim | sim | sim |
| localização do `llms.txt` | raiz | raiz **e** `/docs/` | raiz **e** `/docs/` |

Notas de medição:

- O `llms-full.txt` do Neon é declarado em `content-length: 6019765`; os do Mintlify chegam em *chunked encoding* e foram medidos após download completo (2.105.572 e 2.287.761 bytes).
- FastMCP: 42.726 linhas no `llms-full.txt`, 189 documentos concatenados (contados pelas linhas `Source:`).
- Trigger.dev: 53.362 linhas no `llms-full.txt`.
- **Nenhuma das três usa a seção `## Optional`**, apesar de ela ter significado especial na spec (seção 3.1). A convenção prevê; a prática ignora.

### 2.2 Onde o controle aparece na página, e sua anatomia

**FastMCP e Trigger.dev (Mintlify)** — o controle é um *split button* alinhado à direita do `<h1>`, no mesmo eixo horizontal do título da página. Markup real, extraído do HTML servido de `https://gofastmcp.com/getting-started/welcome`:

```html
<h1 id="page-title" class="...">FastMCP: The Framework for MCP</h1>
<div id="page-context-menu" class="items-center shrink-0 min-w-[156px] justify-end ml-auto hidden @[520px]/page-header:flex">
  <button id="page-context-menu-button" class="rounded-l-xl px-3 ... border-r-0" aria-label="Copy page">
    <svg …/><span>Copy page</span>
  </button>
  <button type="button" aria-haspopup="menu" aria-label="More actions" …>
</div>
```

Anatomia a reter:

- **Dois botões colados**, não um: o primário executa a ação mais provável (`Copy page`); o secundário (`aria-haspopup="menu"`) abre o resto. O `rounded-l-xl` + `border-r-0` no primeiro é o que produz a costura visual de peça única.
- **`ml-auto` + `justify-end`** — o controle é empurrado para a direita do header da página.
- **`hidden @[520px]/page-header:flex`** — *container query*: o controle some quando o header é estreito. Ele é opcional por design, não essencial.
- `min-w-[156px]` reserva largura para o rótulo mudar (`Copy page` → `Copied`) sem deslocar o layout.

**Neon** — mesma anatomia de split button, com rótulo idêntico. Do HTML servido de `https://neon.com/docs/introduction/architecture-overview`:

```html
<span class="text-sm leading-none tracking-extra-tight whitespace-nowrap">Copy page</span></button>
<button class="flex h-8 items-center px-1 hover:bg-gray-new-98 dark:hover:bg-gray-new-8"><svg …>
```

O Neon **não** oferece "Open in ChatGPT/Claude" — nenhuma ocorrência de `chatgpt.com`, `chat.openai.com` ou `claude.ai` no HTML servido. Ele oferece `Copy page` e um `Ask AI` próprio (assistente embutido). Ou seja: **das três referências, duas oferecem deep-link para LLM externo, e as duas que oferecem são as que usam Mintlify.** O "abrir no ChatGPT/Claude" é um recurso de plataforma, não um consenso de mercado.

### 2.3 O que o menu faz — código real

Extraído do bundle JavaScript servido em `/mintlify-assets/_next/static/chunks/` (o handler literal, sem reformatação além de quebras de linha):

```js
let t = new URL(window.location.href);
t.hash = "";
let r = t.toString(),
    a = encodeURIComponent(`Read from ${r}.md so I can ask questions about it.`),
    o = encodeURIComponent(`Read from ${r} so I can ask questions about it.`);
switch (e) {
  case "chatgpt":    window.open(`https://chat.openai.com/?hints=search&q=${o}`, "_blank"); break;
  case "claude":     window.open(`https://claude.ai/new?q=${a}`, "_blank"); break;
  case "perplexity": window.open(`https://www.perplexity.ai/search?q=${a}`, "_blank"); break;
  case "grok":       window.open(`https://grok.com/?q=${a}`, "_blank"); break;
  case "aistudio":   window.open(`https://aistudio.google.com/prompts/new_chat?prompt=${a}`, "_blank"); break;
  case "devin":      window.open(`https://app.devin.ai/?prompt=${a}`, "_blank"); break;
```

Três coisas importantes, todas invisíveis a quem só olha a UI:

1. **Não há API, nem integração, nem chave.** É `window.open` com um prompt em querystring. O custo de implementar isto é uma tag `<a>`.
2. **O prompt é uma instrução para o modelo ir buscar a URL** — `Read from <url> so I can ask questions about it.` Nada do conteúdo da página trafega na URL. É por isso que funciona para páginas de qualquer tamanho.
3. **ChatGPT recebe a URL SEM `.md`; os demais recebem COM `.md`.** Note as variáveis distintas: `o` (sem) só é usada no `case "chatgpt"`, junto de `hints=search`. Os outros usam `a` (com `.md`). A leitura razoável é que o ChatGPT é roteado para sua busca web sobre a página canônica, enquanto os demais recebem o Markdown direto.

E o "Copy page" — a função que o botão primário chama:

```js
async function p(e, a = o) {
  let t = optionallyRemoveLeadingSlash(e),
      r = t ? `/${t}` : "",
      l = "" === r || r.endsWith("/") ? `${r}index.md` : `${r}.md`,
      c = `${BASE_PATH}${l}`,
      d = new AbortController,
      u = setTimeout(() => d.abort(), a);
  try {
    let e = await fetch(c, {signal: d.signal});
    if (clearTimeout(u), !e.ok) throw Error(`Failed to fetch markdown: ${e…`)
```

Ou seja: **o "Copy page" faz `fetch` da própria rota + `.md` e joga no clipboard.** Não há cópia de DOM, não há conversão HTML→Markdown no cliente. O botão é uma consequência trivial de o `.md` existir — e é inútil sem ele. Note também a regra de rota (`índice → index.md`), que importa diretamente para `trailingSlash` no Docusaurus.

E o "View as Markdown" é apenas `window.open(`${BASE_PATH}${c}.md`, "_blank")`.

### 2.4 Como as referências servem o `.md`

Duas estratégias distintas, e a diferença importa:

**Mintlify (FastMCP, Trigger.dev)** — sufixo `.md` explícito na rota. `https://gofastmcp.com/getting-started/welcome.md` responde:

```
content-type: text/markdown; charset=utf-8
content-disposition: inline
```

**Neon** — sufixo `.md` **e** negociação de conteúdo. O `llms.txt` deles anuncia: *"Neon docs are available as markdown. Append `.md` to any doc URL or set `Accept: text/markdown`."* Medido: `curl -H "Accept: text/markdown" https://neon.com/docs/introduction/architecture-overview` devolve Markdown. E mais — `curl` **sem header nenhum** também devolve Markdown, enquanto a mesma URL com User-Agent de Chrome devolve 378 KB de HTML. O Neon negocia por cliente: agente recebe Markdown, browser recebe HTML.

Isso é elegante mas **fora de alcance em Docusaurus vanilla**: exige um servidor que decida por request. Um site estático não negocia. A rota do sufixo `.md` é a única compatível com o alvo.

O `content-disposition: inline` do Mintlify não é decorativo: sem ele, vários browsers **baixam** o `.md` em vez de exibi-lo, e o "View as Markdown" vira um download. Ver seção 6.

### 2.5 Anatomia do `llms-full.txt`

Duas convenções incompatíveis entre si:

**Mintlify** — sem preâmbulo global. Nenhum `H1` de site, nenhum blockquote. O arquivo começa direto no primeiro documento, e cada documento é:

```
# Architecture
Source: https://gofastmcp.com/apps/architecture

How FastMCP apps work under the hood — from Python to pixels.

<VersionBadge />
…
```

Sem separador explícito entre documentos — a fronteira é o par `# Título` + `Source: URL`.

**Neon** — preâmbulo global, separador explícito e resumo por documento:

```
# Neon Postgres Documentation

> Neon is the backend for apps and agents. …
> This file contains the full Neon documentation. For a table of contents, see https://neon.com/docs/llms.txt

--- [Document source](https://neon.com/docs/ai-gateway/authentication.md) ---

> Summary: AI Gateway uses Neon bearer credentials with the ai_gateway:invoke scope. …

# AI Gateway authentication
```

A versão do Neon é estritamente melhor para consumo por máquina: o separador `--- [Document source](…) ---` é inequívoco, e o `> Summary:` por documento permite que um agente decida se lê o resto. Recomendo esta forma.

### 2.6 O preâmbulo injetado no `.md` por página

Nenhuma das três serve o Markdown "puro". Todas injetam um cabeçalho de orientação para o agente.

**Mintlify** (idêntico em FastMCP e Trigger.dev), antes de qualquer conteúdo:

```
> ## Documentation Index
> Fetch the complete documentation index at: https://gofastmcp.com/llms.txt
> Use this file to discover all available pages before exploring further.
```

**Neon**, com breadcrumb e resumo:

```
> This page location: Resilience & architecture > Architecture > Architecture overview
> Full Neon documentation index: https://neon.com/docs/llms.txt

> Summary: The lakebase architecture splits Postgres into …
```

O padrão: **cada `.md` aponta de volta para o `llms.txt`**. É um grafo navegável, não arquivos soltos. Custo de implementar: três linhas de template string.

### 2.7 O que sobra de MDX no `.md` servido

As referências servem o **fonte MDX quase cru**, com JSX dentro. Do `.md` do FastMCP:

```
<video autoPlay muted loop playsInline className="rounded-2xl block dark:hidden" src="https://mintcdn.com/…" />
```

Do Trigger.dev:

```
<CardGroup cols={2}>
  <Card title="Quick start" img="https://mintcdn.com/…" href="/docs/quick-start" …>
```

E blocos de código carregam metadados de tema: ` ```ts theme={"theme":"css-variables"} `.

Conclusão para a spec: **o estado da arte não resolve MDX→Markdown limpo. Ele aceita o vazamento.** Isso rebaixa muito a régua — não é preciso escrever um transformador de AST para estar no nível das referências.

---

## 3. `llms.txt` e `llms-full.txt`: o que a convenção realmente especifica

### 3.1 A especificação

Fonte: [llmstxt.org](https://llmstxt.org/), a proposta de Jeremy Howard.

Localização: `/llms.txt` na raiz do site, "ou, opcionalmente, em um subcaminho".

Estrutura, em ordem:

1. **Um `H1` com o nome do projeto.** É a **única seção obrigatória** — a spec diz literalmente que esta é a única parte requerida.
2. **Um blockquote** com resumo curto do projeto. Altamente recomendado, não obrigatório.
3. Zero ou mais seções delimitadas por `H2`, cada uma contendo uma "lista de arquivos".
4. Cada item da lista: "um hiperlink markdown obrigatório `[name](url)`, então opcionalmente um `:` e notas sobre o arquivo."

Duas cláusulas que quase todo resumo secundário erra:

- **A seção `## Optional` tem significado especial.** A spec: "Se incluída, as URLs fornecidas ali podem ser puladas se um contexto mais curto for necessário. Use-a para informações secundárias." É o único mecanismo de priorização da convenção — e, como medido em 2.1, **nenhuma das três referências o usa**.
- **A spec recomenda o `.md` por página como parte da própria proposta**, não como extra: páginas com informação útil para LLMs devem "fornecer uma versão markdown limpa dessas páginas na mesma URL, mas com `.md` anexado". Isto é, `llms.txt` e `.md`-por-rota são a mesma proposta, não dois recursos.

**`llms-full.txt` não está na especificação.** A spec não o define nem o prescreve. No exemplo FastHTML, arquivos derivados (`llms-ctx.txt`) foram produzidos por uma ferramenta separada (`llms_txt2ctx`). O `llms-full.txt` é uma convenção *de facto* consolidada pela prática das plataformas — as três referências servem um, e todas o chamam assim. Consequência prática: **não há autoridade para dizer que um `llms-full.txt` está "errado"**; escolha a forma mais útil (a do Neon, seção 2.5).

### 3.2 Como gerar a partir do MDX num passo de build

Não há nada nativo. O issue [facebook/docusaurus#10899](https://github.com/facebook/docusaurus/issues/10899), aberto em fevereiro de 2025 pedindo um plugin oficial de `llms.txt`, segue **aberto, sem branch nem PR**, marcado como `feature`. Docusaurus 3.10 não traz suporte embutido. Existem plugins de terceiros (`docusaurus-plugin-llms`, `docusaurus-plugin-llms-txt` e outros) — **vedados pelo axioma 2**.

O caminho vanilla tem dois hooks e uma sutileza.

**A sutileza:** um plugin só recebe, em `contentLoaded`, o conteúdo que **ele mesmo** carregou. Para ver os documentos carregados pelo `plugin-content-docs`, é preciso `allContentLoaded` — que **existe na interface `Plugin<Content>`** do Docusaurus mas está sub-documentado na página pública de Lifecycle APIs. Do `packages/docusaurus-types/src/plugin.d.ts`:

```ts
allContentLoaded?: (args: {
  allContent: AllContent;
  actions: PluginContentLoadedActions;
}) => Promise<void> | void;

type AllContent = {
  [pluginName: string]: {
    [pluginID: string]: unknown;
  };
};
```

O conteúdo do plugin de docs é `allContent['docusaurus-plugin-content-docs']['default']`, tipado como `LoadedContent = {loadedVersions: LoadedVersion[]}`, e cada `LoadedVersion` tem `docs: DocMetadata[]`. Cada doc carrega (de `plugin-content-docs.d.ts`): `id`, `title`, `description`, `source` (caminho com alias `@site`), `sourceDirName`, `slug`, `permalink`, `frontMatter`, `draft`, `unlisted`, `tags`, `sidebarPosition`, `editUrl`.

Isso é exatamente o que o `llms.txt` precisa: `title` para o nome do link, `description` para a nota depois dos dois-pontos, `permalink` para a URL, `source` para achar o arquivo.

**A escrita:** `postBuild(props)`. De `docusaurus-types`:

```ts
postBuild?: (props: Props & {
  content: Content;
  routesBuildMetadata: {[location: string]: RouteBuildMetadata};
}) => Promise<void> | void;
```

com `Props = LoadContext & {headTags, preBodyTags, postBodyTags, siteMetadata, routes, routesPaths, plugins}` e `LoadContext` trazendo `siteDir`, `siteConfig`, `outDir`, `baseUrl`, `i18n`, entre outros. `outDir` e `siteDir` são o que importa.

**O plugin inteiro** — registro em `docusaurus.config.js` é uma string de caminho, sem `npm install`:

```js
plugins: ['./src/plugins/ai-era'],
```

e o módulo exporta uma função `(context, options) => ({name, …hooks})`. O esqueleto medido:

```js
module.exports = function aiEraPlugin(context, options) {
  let harvested = [];
  return {
    name: 'ai-era',
    allContentLoaded({allContent}) {
      const docsPlugin = allContent['docusaurus-plugin-content-docs'];
      for (const [pluginId, content] of Object.entries(docsPlugin ?? {})) {
        for (const version of content?.loadedVersions ?? []) {
          for (const doc of version.docs ?? []) {
            harvested.push({title: doc.title, description: doc.description,
                            permalink: doc.permalink, source: doc.source});
          }
        }
      }
    },
    async postBuild({outDir, siteDir, siteConfig}) {
      // doc.source vem como '@site/docs/intro.md' — resolver o alias:
      const abs = doc.source.replace(/^@site\//, `${siteDir}/`);
      // ler, remover front matter, escrever outDir/<permalink>.md,
      // e concatenar índice + corpus.
    },
  };
};
```

**[medido]** Este plugin, escrito por inteiro, tem **93 linhas** e produziu, num Docusaurus 3.10.2 com o conteúdo de scaffold (10 docs): 10 arquivos `.md`, `llms.txt` de 1.556 B e `llms-full.txt` de 13.087 B, em um `npm run build` que concluiu com `[SUCCESS]`. O `llms.txt` gerado saiu conforme a spec:

```
# My Site

> Dinosaurs are cool

## Docs

- [Tutorial Intro](https://…/docs/intro.md): Let's discover Docusaurus in less than 5 minutes.
```

Duas armadilhas que a medição revelou:

- **`H1` duplicado.** Se o preâmbulo emite `# ${doc.title}` e o MDX já começa com um `H1` próprio, o `.md` sai com dois. No conteúdo de scaffold isso aconteceu. Correção: emitir o `H1` de preâmbulo só quando o corpo não tem um — o Docusaurus já expõe esse sinal (`contentTitle` é `undefined` quando o MDX não tem `H1`; ver `useSyntheticTitle` em `DocItem/Content`).
- **`permalink` com barra final.** O mapeamento `permalink → arquivo` precisa decidir entre `/docs/intro` → `docs/intro.md` e `/docs/` → `docs/index.md`. É a mesma regra que o Mintlify aplica no cliente (seção 2.3), e ela depende de `trailingSlash` no `docusaurus.config.js`. Se `trailingSlash` mudar, as URLs do `llms.txt` e o `fetch` do botão precisam mudar junto.

---

## 4. Markdown bruto por página

Já coberto em 3.2 quanto à geração. O que resta é a decisão de forma.

**O que escrever no `.md`.** **[medido]** Com o fonte MDX levado cru para o `.md`, uma página de sonda contendo `import Tabs from '@theme/Tabs'`, um `export const` com JSX, `<Tabs>/<TabItem>` e uma admonition `:::tip` produziu exatamente isto no `.md` servido:

```
# Sonda MDX
Source: https://…/docs/mdx-probe

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const Destaque = ({children}) => <mark>{children}</mark>;

Texto normal antes do componente.

<Tabs>
  <TabItem value="py" label="Python">
…
:::tip
Admonition sobrevive como sintaxe Docusaurus, não Markdown padrão.
:::
```

Isto é **o mesmo nível de vazamento que FastMCP e Trigger.dev servem em produção** (seção 2.7). A opção "servir o fonte, aceitar o JSX" é defensável por precedente. Uma limpeza barata e sem dependência — remover linhas `import`/`export` no topo com regex — cobre o caso mais feio (linhas que não significam nada para um leitor) e custa ~3 linhas. Converter `<Tabs>` em Markdown equivalente exigiria percorrer AST e **não** é feito por nenhuma referência; fica fora de escopo.

**Alternativa descartada:** renderizar o HTML de saída de volta para Markdown. Exigiria uma biblioteca de conversão (dependência nova, vedada) e perderia a fidelidade que o fonte já tem de graça.

---

## 5. O controle na interface: qual componente swizzlar

### 5.1 A estrutura real

Do `@docusaurus/theme-classic@3.10.2` instalado, `lib/theme/DocItem/Layout/index.js` — o corpo inteiro do componente que renderiza uma página de doc:

```jsx
export default function DocItemLayout({children}) {
  const docTOC = useDocTOC();
  const {metadata} = useDoc();
  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}
```

É o **único** ponto do tema que vê a página de doc inteira e onde cabe inserir um irmão de `<DocBreadcrumbs />`, que é a posição equivalente à das referências (topo do artigo, acima do título).

### 5.2 Nenhum host é Safe

**[medido]** `getSwizzleConfig.js` do `theme-classic@3.10.2` declara nível de segurança para apenas ~30 componentes. Entre os relacionados a docs, existem exatamente quatro entradas:

| Componente | eject | wrap |
| --- | --- | --- |
| `DocBreadcrumbs/Items` | Safe | Forbidden (é pasta) |
| `DocCardList` | Safe | Safe |
| `DocItem/TOC` | Forbidden | Forbidden |
| `DocSidebar` | Unsafe | Safe |

`DocItem/Layout`, `DocItem/Content`, `DocItem/Footer`, `DocBreadcrumbs`, `DocItem/TOC/Desktop` — **nenhum está declarado**, e o default é `unsafe`. Confirmado empiricamente pelo CLI:

```
[WARNING]
Swizzle action wrap is unsafe to perform on DocItem/Layout.
It is more likely to be affected by breaking changes in the future
If you want to swizzle it, use the `--danger` flag, or confirm that you understand the risks.
```

**Portanto: hospedar o controle numa página de doc custa obrigatoriamente um swizzle Unsafe com `--danger`.** Não há caminho Safe. A spec precisa aceitar isso ou não ter o recurso.

### 5.3 Por que a alternativa "Safe" não funciona

`MDXComponents/Heading` **é** Safe (eject e wrap), e ancorar o controle no `h1` parece contornar o problema. Não contorna, e a razão está em `DocItem/Content/index.js`:

```jsx
function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender = !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) return null;
  return metadata.title;
}
// …
{syntheticTitle && (<header><Heading as="h1">{syntheticTitle}</Heading></header>)}
```

O `H1` tem **duas origens**: quando o MDX traz o próprio `H1`, ele passa por `MDXComponents/Heading` (Safe); quando o título vem do front matter, ele é renderizado por `@theme/Heading` diretamente (não declarado → Unsafe). Um controle ancorado no heading apareceria em umas páginas e não em outras, conforme o autor tenha escrito `# Título` ou não. **Inaceitável.** `DocItem/Layout` continua sendo o host.

### 5.4 Eject ou wrap

**Eject.** Com `wrap`, o componente próprio renderiza *ao redor* de `<DocItemLayout>`, isto é, fora do `<div className="row">` e fora do `<article>` — impossível colocar o controle ao lado do breadcrumb sem CSS de posicionamento absoluto por cima de um layout que não se controla.

**[medido]** `npx docusaurus swizzle @docusaurus/theme-classic DocItem/Layout --eject --javascript --danger` produz **2 arquivos**: `src/theme/DocItem/Layout/index.js` (**56 linhas**) e `src/theme/DocItem/Layout/styles.module.css`. É toda a dívida: 56 linhas copiadas do upstream, que precisam ser reconciliadas a cada major do Docusaurus.

### 5.5 O componente do controle

**[medido]** O controle foi escrito (**68 linhas**), inserido como `<AiActions />` logo após `<DocBreadcrumbs />`, e o build passou. O HTML estático gerado contém:

```html
aiActions><button type=button>Copiar página</button><button type=button aria-haspopup=menu>▾</button></div>
```

O ponto técnico que o torna barato: **`useDoc()` dá o permalink sem prop drilling.** De `plugin-content-docs/lib/client/doc.d.ts`:

```ts
export type DocContextValue = Pick<PropDocContent, 'metadata' | 'frontMatter' | 'toc' | 'assets' | 'contentTitle'>;
export declare function useDoc(): DocContextValue;
```

com a própria documentação do arquivo dizendo: *"When swizzling a low-level component (e.g. the 'Edit this page' link) and you need some extra metadata, you don't have to drill the props all the way through the component tree: simply use this hook instead."*

O componente é, em essência:

```jsx
const {metadata} = useDoc();
const {siteConfig} = useDocusaurusContext();
const mdUrl = `${siteConfig.url}${metadata.permalink}.md`;

// copiar: fetch da própria rota + .md
const text = await (await fetch(`${metadata.permalink}.md`)).text();
await navigator.clipboard.writeText(text);

// abrir: window.open com prompt em querystring (mesmos templates da seção 2.3)
```

Sem estado global, sem contexto novo, sem dependência. `navigator.clipboard` e `fetch` são API de plataforma.

---

## 6. Custo real, item a item

Todos os números medidos em Docusaurus **3.10.2** (`@docusaurus/preset-classic`, React 19), scaffold `create-docusaurus classic --javascript`.

| Item | Código próprio | Swizzle | Dependência nova | Riscos |
| --- | --- | --- | --- | --- |
| `.md` por rota | 93 linhas (plugin, compartilhado) | nenhum | nenhuma | dev-server; Content-Type no host |
| `llms.txt` | ~15 linhas do mesmo plugin | nenhum | nenhuma | nenhum |
| `llms-full.txt` | ~5 linhas do mesmo plugin | nenhum | nenhuma | tamanho do artefato |
| Controle na página | 68 linhas (componente) | **`DocItem/Layout` eject Unsafe `--danger`** (56 linhas + 1 CSS) | nenhuma | reconciliação a cada major |

Total do conjunto completo: **219 linhas** de código no repo, das quais 56 são cópia de upstream.

### 6.1 Os quatro riscos concretos

**(a) `postBuild` não roda em `docusaurus start`.** **[medido]** Com o dev server no ar, `GET /docs/intro.md` devolve **HTTP 200 com `content-type: text/html`** — o shell da SPA (contém `__docusaurus`), não o Markdown. O botão "Copiar página" copiaria HTML em desenvolvimento, e "Ver como Markdown" abriria a própria página. É o risco mais provável de passar despercebido, porque não falha: responde 200.

Mitigação **[medida]**: escrever os `.md` em `static/` em vez de (ou além de) `outDir`. Com o dev server já rodando, um arquivo criado em `static/docs/sonda.md` respondeu imediatamente em `/docs/sonda.md` com **`http=200 type=text/markdown; charset=utf-8`**. `static/` é servido em dev e copiado para o build, então resolve os dois modos de uma vez — ao custo de o build escrever artefatos gerados dentro da árvore de trabalho (exigindo `.gitignore`). A alternativa é aceitar que o recurso só existe em produção e esconder o controle em dev.

**(b) Content-Type e download no host.** **[medido]** `docusaurus serve` responde `Content-Type: text/markdown; charset=utf-8` **e** `Content-Disposition: inline; filename="intro.md"` — comportamento idêntico ao do Mintlify em produção, e o `inline` é justamente o que impede o browser de baixar o arquivo. Mas isso é do `serve` local; **o host de produção decide**. Num ambiente corporativo com servidor próprio, isto precisa ser verificado antes de prometer "Ver como Markdown": se o servidor mandar `application/octet-stream` ou omitir o `inline`, o link vira download. `llms.txt` sai como `text/plain; charset=utf-8`, que é o correto e é o que as três referências servem.

**(c) `trailingSlash`.** O mapeamento permalink→arquivo e a URL usada no `fetch` do botão dependem dele. Mudá-lo depois quebra os dois em silêncio. Deve ser travado na spec.

**(d) Swizzle Unsafe.** `DocItem/Layout` não tem contrato de estabilidade; o próprio CLI avisa que "é mais provável de ser afetado por breaking changes". São 56 linhas para reconciliar num upgrade de major — pequeno, mas real, e recorrente.

### 6.2 Uma nota de escala

O corpus cresce rápido: as referências servem `llms-full.txt` de 2,1 MB a 6,0 MB. Para um site de demonstração isso é irrelevante, mas o artefato é servido inteiro numa requisição e é regenerado a cada build. Se o conteúdo mockado crescer, vale seguir o Neon, que **fragmenta o índice**: além do `/llms.txt` raiz, ele publica 7 sub-índices por seção (`/docs/introduction/llms.txt`, `/docs/manage/llms.txt`, `/docs/guides/llms.txt`, `/docs/import/llms.txt`, `/docs/postgresql/llms.txt`, `/docs/extensions/llms.txt`, `/docs/community/llms.txt`), com o índice raiz linkando para eles — *"Sections with many pages show key pages and link to full sub-indexes."* Custo marginal no plugin: um agrupamento por `sourceDirName`.

---

## 7. O que recomendo à spec

1. **Adotar `.md` por rota + `llms.txt` + `llms-full.txt` como um único plugin próprio.** É um arquivo, ~110 linhas, zero swizzle, zero dependência, e entrega três dos quatro recursos. A relação impacto/custo é a melhor do repo.
2. **Seguir a forma do Neon no `llms-full.txt`** (preâmbulo global, separador `--- [Document source](url) ---`, `> Summary:` por documento). É a mais legível por máquina, e a spec não proíbe.
3. **Injetar em cada `.md` o ponteiro de volta para o `llms.txt`.** Três linhas; é o que transforma arquivos soltos em grafo navegável.
4. **Decidir o controle na página como item separado**, ciente de que ele é o único que custa swizzle Unsafe. Se entrar: eject de `DocItem/Layout`, `<AiActions />` como irmão de `<DocBreadcrumbs />`, split button com `Copiar página` primário.
5. **Não copiar cegamente o "Open in ChatGPT/Claude".** Das três referências, só as duas em Mintlify o oferecem — é recurso de plataforma. Se entrar, use os templates literais da seção 2.3, incluindo a assimetria do ChatGPT (URL sem `.md` + `hints=search`).
6. **Travar `trailingSlash` na spec** antes de implementar qualquer coisa acima.
7. **Verificar o Content-Type do host alvo** antes de prometer "Ver como Markdown".

---

## 8. Fontes

Todas consultadas em 2026-08-05.

**Especificação**
- [llmstxt.org](https://llmstxt.org/) — a convenção `llms.txt`.

**Docusaurus (código-fonte e documentação oficial)**
- [`docusaurus-types/src/plugin.d.ts`](https://raw.githubusercontent.com/facebook/docusaurus/main/packages/docusaurus-types/src/plugin.d.ts) — `Plugin<Content>`, `allContentLoaded`, `postBuild`.
- [`docusaurus-types/src/context.d.ts`](https://raw.githubusercontent.com/facebook/docusaurus/main/packages/docusaurus-types/src/context.d.ts) — `Props`, `LoadContext`.
- [`plugin-content-docs/src/plugin-content-docs.d.ts`](https://raw.githubusercontent.com/facebook/docusaurus/main/packages/docusaurus-plugin-content-docs/src/plugin-content-docs.d.ts) — `DocMetadata`, `LoadedVersion`, `LoadedContent`.
- [Lifecycle APIs](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis) e [Plugin Methods](https://docusaurus.io/docs/api/plugin-methods).
- [Using Plugins](https://docusaurus.io/docs/using-plugins) — registro de plugin local por caminho.
- [Swizzling](https://docusaurus.io/docs/swizzling) — Safe/Unsafe/Forbidden, eject vs wrap.
- [facebook/docusaurus#10899](https://github.com/facebook/docusaurus/issues/10899) — pedido de plugin oficial de `llms.txt`; aberto, sem implementação.
- Pacotes instalados localmente (3.10.2): `theme-classic/lib/getSwizzleConfig.js`, `theme-classic/lib/theme/DocItem/Layout/index.js`, `theme-classic/lib/theme/DocItem/Content/index.js`, `plugin-content-docs/lib/client/doc.d.ts`, `core/lib/commands/swizzle/common.js`.

**Artefatos servidos pelas referências**
- FastMCP: [`/llms.txt`](https://gofastmcp.com/llms.txt), [`/llms-full.txt`](https://gofastmcp.com/llms-full.txt), [`/getting-started/welcome.md`](https://gofastmcp.com/getting-started/welcome.md), HTML de `/getting-started/welcome` e os chunks em `/mintlify-assets/_next/static/chunks/`.
- Neon: [`/llms.txt`](https://neon.com/llms.txt), [`/llms-full.txt`](https://neon.com/llms-full.txt), [`/docs/llms.txt`](https://neon.com/docs/llms.txt), `/docs/introduction/architecture-overview` em HTML e em Markdown.
- Trigger.dev: [`/docs/llms.txt`](https://trigger.dev/docs/llms.txt), [`/docs/llms-full.txt`](https://trigger.dev/docs/llms-full.txt), [`/docs/introduction.md`](https://trigger.dev/docs/introduction.md), HTML de `/docs/introduction`.
- [Mintlify — contextual menu](https://mintlify.com/docs/ai/contextual-menu) — inventário das opções do menu.

**Medições próprias**
- Docusaurus 3.10.2 (`create-docusaurus classic --javascript`), com plugin `ai-era` e swizzle de `DocItem/Layout` escritos para esta pesquisa; `npm run build`, `npm run serve` e `npm run start` executados. Sonda descartável, fora do repo.
