# Busca, i18n e versionamento — e o que eles fazem com o chrome

> Pesquisa do ticket [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7). Fontes primárias: documentação oficial do Docusaurus, código-fonte do Docusaurus e do Infima, documentação oficial do Algolia DocSearch, e dissecção do HTML em produção das sete referências.
>
> Contexto que governa cada leitura: **vanilla-first, zero dependências novas**; alvo de replicação é **ambiente corporativo que plausivelmente bloqueia serviço externo**; cenário de i18n é **pt-BR default com EN como segundo locale parcial**.

---

## Resumo executivo

1. **A busca é o ponto apertado, e é o único dos três que depende de terceiro.** O preset `classic` já embute `@docusaurus/theme-search-algolia`, mas ele é um cliente: não há busca até existir uma conta Algolia, um índice e um crawler. Os hosts são hardcoded no client; não existe backend self-hosted. **Mas o tema é inerte sem `themeConfig.algolia`** — sem config, nenhum componente monta, nenhuma rota `/search` é criada e o modal (carregado por `import()` dinâmico) nem entra no bundle. Não configurar é uma decisão válida e barata, não uma omissão.
2. **Existe uma rota de busca local que não viola o axioma vanilla-first** — plugin local por caminho (`plugins: ['./src/plugins/...']`, documentado oficialmente) gerando o índice no `postBuild`, mais `SearchBar` swizzlado. Zero pacote npm novo. Todos os plugins de busca local do ecossistema cobram caro: o mais adotado arrasta um binário nativo de 15 MB obrigatório; o segundo está parado há 19 meses.
3. **i18n e versionamento são 100% locais e vanilla.** Ambos são mecânica de sistema de arquivos + config. Custo zero em dependência, custo alto em manutenção de conteúdo.
4. **O cenário "EN parcial" funciona sem 404 e sem quebrar o build** — e isso é mecânica confirmada no código-fonte, não suposição. A lista de docs sai da árvore original; o conteúdo de cada doc é resolvido preferindo a árvore traduzida.
5. **Versão × locale multiplica árvores de conteúdo e multiplica o índice de busca.** O `contextualSearch` do Docusaurus resolve a relevância, mas exige que o índice carregue as facetas certas — e um snapshot de versão novo só aparece na busca depois do próximo crawl.
6. **Nenhuma das sete referências tem seletor de idioma.** Cinco de sete usam Mintlify/Fern; nenhuma é Docusaurus. O arranjo dominante é: busca como **botão de ícone**, não campo; navbar direita enxuta; seletores contextuais empurrados para o topo da sidebar.
7. **O aperto real não é mobile.** Abaixo de 996px o Infima esconde todos os `.navbar__item` no hambúrguer e o problema desaparece sozinho. O aperto vive na faixa de ~997–1200px, e o pior ofensor é o label default do locale: **"Português (Brasil)"**.

---

## 1. Busca

### 1.1 O que o preset `classic` traz de fábrica

O `@docusaurus/preset-classic` **já inclui** o tema de busca. A doc do tema é explícita: *"If you have installed `@docusaurus/preset-classic`, you don't need to install it as a dependency."* ([theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia)) e a página de busca confirma: *"Docusaurus' own `@docusaurus/preset-classic` supports Algolia DocSearch integration. If you use the classic preset, no additional installation is needed."* ([search](https://docusaurus.io/docs/search))

O que vem de fábrica é o **cliente**, não o serviço:

- O componente `SearchBar` (embrulho do `@docsearch/react`).
- Uma **página de busca dedicada** em `/search`, controlada por `themeConfig.algolia.searchPagePath` (default `'search'`, `false` desabilita). ([theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia))
- O CSS de integração — e ele é minúsculo. O arquivo inteiro em `packages/docusaurus-theme-search-algolia/src/theme/SearchBar/styles.css` tem quatro regras: mapeia `--docsearch-primary-color` para `--ifm-color-primary`, `--docsearch-text-color` para `--ifm-font-color-base`, dá transição ao `.DocSearch-Button` e ajusta o `z-index` do `.DocSearch-Container` para `calc(var(--ifm-z-index-fixed) + 1)`. Todo o resto do visual vem do `@docsearch/css`.

**Não há busca ativa por padrão, e é tudo-ou-nada.** No schema de validação do tema (`src/validateThemeConfig.ts` de `@docusaurus/theme-search-algolia@3.10.2`), `appId`, `apiKey` e `indexName` são todos `.required()`, e o objeto `algolia` inteiro é `.required()`. Sem `themeConfig.algolia` não há `SearchBar`, não há rota `/search`, e o modal — que é carregado por `import()` dinâmico em `SearchBar/index.tsx` — **nem entra no bundle**.

Isso é a boa notícia do transplante corporativo: **o preset `classic` sem `themeConfig.algolia` é inerte.** Zero requisição externa, zero bundle de busca, nada para desinstalar.

### 1.2 O programa gratuito: elegibilidade, contrapartida e a cláusula que derruba o caso corporativo

A doc do Docusaurus manda aplicar ao programa gratuito, e já antecipa a saída de emergência:

> *"If your website is not eligible for the free, hosted version of DocSearch, or if your website sits behind a firewall and is not public, then you can run your own DocSearch crawler."* ([search](https://docusaurus.io/docs/search))

**Elegibilidade.** A página oficial de critérios ([who-can-apply](https://docsearch.algolia.com/docs/who-can-apply), atualizada em 3/jun/2026) é literal:

> *"We built DocSearch from the ground up with the idea of improving search on large technical documentations. For this reason, we are offering a free hosting version **to all public online technical documentations and technical blogs**."*
>
> *"We usually turn down applications when they are **not production ready** or have **non-technical content** on the website."*
>
> *"You must **verify your domain ownership within 7 days of approval** to continue using the crawler."*

O `https://docsearch.algolia.com/apply/` deixou de ser formulário: hoje responde `301` para o signup do dashboard Algolia (`selected_plan=docsearch`) — a aplicação virou onboarding com validação automatizada de domínio. Prazo declarado quando a validação automática não resolve: *"may take 1-2 business days"*.

**Há divergência dentro da própria Algolia sobre open source.** O FAQ do programa ([docsearch-program](https://docsearch.algolia.com/docs/docsearch-program)) afirma: *"The free DocSearch we provide will **only crawl open-source projects documentation pages or technical blogs**."* Os T&C jurídicos ([DocSearch Plan Terms](https://www.algolia.com/policies/docsearch-plan-specific-terms), vigentes desde 24/jul/2026) falam apenas em *"developer documentation and technical blogs on publicly available websites"* — sem exigir open source. Os T&C prevalecem juridicamente, mas a divergência é um risco de aprovação.

**A contrapartida é o logo, e ela não é negociável:**

> *"All we ask in exchange is that you keep the "Search by Algolia" logo displayed next to the search results."* — e, sobre removê-lo: *"This would **disqualify you from the free DocSearch program**."* ([docsearch-program](https://docsearch.algolia.com/docs/docsearch-program))

Os T&C detalham a obrigação: colocar o logo *"either on the search box or in the autocomplete panel"*. **Isso é uma restrição de design, não só de licença** — a spec de skin precisa acomodar uma marca de terceiro dentro do modal.

**Cotas do plano gratuito**, verbatim dos T&C: até **5.000.000 de registros, 50.000.000 de search requests/mês e 5.000.000 de recursos crawleados/mês**, com máximo de 100KB por registro, 25GB por índice, 25GB por aplicação, **20 índices e 1 aplicação**. Contas inativas por mais de 30 dias podem ter os dados removidos. E: *"Algolia does not provide support for the DocSearch plan. Algolia may terminate the DocSearch plan at its sole discretion."*

**A cláusula que provavelmente encerra a discussão em ambiente corporativo** — T&C de 24/jul/2026:

> *"An Algolia DocSearch Plan includes **automatic enrollment in Algolia DocSearchMCP** (…) Subscriber hereby grants Algolia and its Affiliates a **worldwide, nonexclusive, revocable, transferable, sublicensable, royalty-free and limited license to crawl Subscriber's website(s), index Subscriber's developer documentation and technical blogs and use such data to provide the DocSearchMCP service."*

É *enrollment automático*, não opt-in, e a licença é **sublicenciável e transferível**. Conteúdo de documentação corporativa — mesmo público — raramente passa em revisão jurídica com essa cláusula.

### 1.3 Dá para rodar sem serviço externo? Não. E está no código.

O `@docusaurus/theme-search-algolia@3.10.2` depende de `@docsearch/react` (`^3.9.0 || ^4.3.2`) e `algoliasearch` (`^5.37.0`). O `DocSearchModal.tsx` chama `await searchClient.search<DocSearchHit>({...})`, e os hosts do client são **hardcoded** em `getDefaultHosts()` ([`algoliasearch-client-javascript`](https://github.com/algolia/algoliasearch-client-javascript/blob/main/packages/client-search/src/searchClient.ts)):

```
{appId}-dsn.algolia.net      // leitura
{appId}.algolia.net          // escrita
{appId}-1.algolianet.com     // fallback
{appId}-2.algolianet.com
{appId}-3.algolianet.com
```

A doc confirma em prosa: o conteúdo indexado *"is then queried directly from your front-end using the Algolia API"* ([what-is-docsearch](https://docsearch.algolia.com/docs/what-is-docsearch)). Não há backend Algolia self-hosted — não existe artefato on-premise publicado, e o artigo de suporte sobre on-premises está atrás de Cloudflare (não extraível; **registrado como não confirmado em fonte direta**).

**Rodar o próprio crawler não resolve o problema de rede.** O `docsearch-scraper` self-hospedado ([run-your-own legacy](https://docsearch.algolia.com/docs/legacy/run-your-own/)) indexa num app Algolia próprio usando uma admin key com ACLs `addObject`, `editSettings` e `deleteIndex` — mas o índice continua na Algolia e a consulta continua saindo pela internet. Pior: o repositório declara **DEPRECATED** no README (*"This repository is not maintained anymore"*), não recebe commit desde abril de 2024, e a **imagem Docker `algolia/docsearch-scraper:latest` está congelada em 21/jun/2021, rodando Python 3.6+**. Para um transplante corporativo com scan de vulnerabilidade de container, isso não passa.

Consequência prática: se a rede bloqueia `*.algolia.net` / `*.algolianet.com`, a busca do preset `classic` **falha na cara do usuário** — o modal abre e cai na `errorScreen`, cujo texto default em pt-BR é *"Talvez você deva verificar sua conexão de rede."*. Não é degradação graciosa; é um elemento de chrome morto. E a página `/search` também bate na API Algolia, então **não serve de fallback offline**.

### 1.4 Anatomia do modal e quanto dele é customizável sem swizzle

Três camadas de customização, em ordem crescente de custo:

**Camada 1 — `themeConfig.algolia` (config pura).** A lista completa documentada ([search](https://docusaurus.io/docs/search)):

| Opção | Papel |
| --- | --- |
| `appId` | Application ID da Algolia. |
| `apiKey` | Chave pública de busca — segura para commitar. |
| `indexName` | Nome do índice. |
| `contextualSearch` | Filtra resultados por versão e locale correntes. **Default: habilitado.** |
| `externalUrlRegex` | Domínios em que a navegação usa `window.location` em vez de `history.push`. |
| `replaceSearchResultPathname` | Reescreve o pathname dos resultados. *"Useful when using the same search index for multiple deployments using a different baseUrl."* |
| `searchParameters` | Parâmetros repassados ao DocSearch (antigo `algoliaOptions`). |
| `searchPagePath` | Caminho da página de busca dedicada. Default `'search'`; `false` desabilita. |
| `insights` | Feature de insights. Default `false`. |
| `askAi` | ID do assistente Ask AI, ou objeto com `assistantId`, `indexName`, `apiKey`, `appId`, `suggestedQuestions`. Default `undefined`. **Exige DocSearch v4** — com v3 o tema lança erro explícito. |

Três opções existem no type publicado (`src/theme-search-algolia.d.ts`) e **não estão na doc**: `placeholder`, `initialQuery` e `translations`. Passam porque o schema Joi termina em `.unknown()` e são repassadas ao DocSearch.

**Camada 2 — CSS custom properties.** O `@docsearch/css@4.7.0` expõe **44** custom properties `--docsearch-*` ([`packages/docsearch-css/src/_variables.css`](https://github.com/algolia/docsearch/blob/main/packages/docsearch-css/src/_variables.css)), com bloco de override em dark mode sob o seletor **`html[data-theme=dark]`** — que é exatamente o seletor que o Docusaurus já usa, então o dark do modal acompanha o dark do site sem cola nenhuma. Entre elas, as que interessam a uma spec de skin:

- Cor e superfície: `--docsearch-primary-color`, `--docsearch-text-color`, `--docsearch-secondary-text-color`, `--docsearch-muted-color`, `--docsearch-icon-color`, `--docsearch-highlight-color`, `--docsearch-focus-color`, `--docsearch-background-color`.
- Container e modal: `--docsearch-container-background`, `--docsearch-modal-width` (`800px`), `--docsearch-modal-height` (`600px`), `--docsearch-modal-variable-height` (`60dvh`), `--docsearch-modal-background`, `--docsearch-modal-shadow`, `--docsearch-border-radius` (`4px`), `--docsearch-spacing` (`12px`).
- Caixa de busca: `--docsearch-searchbox-height` (`56px`), `--docsearch-searchbox-initial-height`, `--docsearch-searchbox-background`, `--docsearch-searchbox-focus-background`.
- Resultado (hit): `--docsearch-hit-height` (`56px`), `--docsearch-hit-color`, `--docsearch-hit-highlight-color`, `--docsearch-hit-background`, `--docsearch-hit-shadow`.
- Teclas e rodapé: `--docsearch-key-background`, `--docsearch-key-color`, `--docsearch-key-pressed-shadow`, `--docsearch-footer-height` (`52px`), `--docsearch-footer-background`, `--docsearch-footer-shadow`, `--docsearch-logo-color`.
- Botão da navbar: `--docsearch-search-button-background`, `--docsearch-search-button-text-color`.
- Ações e dropdown: `--docsearch-actions-width` (`99px`), `--docsearch-actions-height` (`44px`), `--docsearch-dropdown-menu-background`, `--docsearch-dropdown-menu-item-hover-background`.
- Traço de ícone: `--docsearch-icon-stroke-width` (`1.4`).

**Esse é o achado central para a spec de skin:** o modal de busca inteiro — geometria, superfície, sombra, raio, cor de destaque, altura de hit, aparência das teclas — é reskinável **por variável CSS em `src/css/custom.css`, sem swizzle**. Como o Docusaurus só mapeia duas dessas variáveis por padrão, o modal *default* fica visivelmente desalinhado com qualquer skin autoral. Reskinar o DocSearch é obrigatório, não opcional — mas é barato.

> **Armadilha de versão.** O DocSearch v4 **removeu** quatro variáveis que existiam na v3: `--docsearch-hit-active-color`, `--docsearch-key-gradient`, `--docsearch-key-shadow` e `--docsearch-searchbox-shadow`. O exemplo de CSS publicado em [docusaurus.io/docs/search](https://docusaurus.io/docs/search) ainda usa duas delas. Como `@docusaurus/theme-search-algolia@3.10.2` declara `"@docsearch/react": "^3.9.0 || ^4.3.2"`, uma instalação nova resolve para a v4 — e as linhas copiadas da doc oficial ficam mortas. A spec deve escrever a lista de variáveis contra a v4, não contra o exemplo da doc.

**Camada 2b — traduções, sem swizzle.** O que o Docusaurus expõe **não** é o namespace `docsearch.*` do DocSearch puro; é `theme.SearchBar.*`, `theme.SearchModal.*` e `theme.SearchPage.*` (58 chaves em `@docusaurus/theme-translations@3.10.2`), montadas em `@theme/SearchTranslations`. Sobrescrevem-se em `i18n/<locale>/code.json`, sem tocar em componente.

**E o pt-BR já vem traduzido de fábrica** — 57 das 58 chaves têm valor em português no pacote de traduções (`theme.SearchBar.label` = "Procurar", `theme.SearchModal.searchBox.placeholderText` = "Procurar na documentação", `theme.SearchPage.inputPlaceholder` = "Digite sua pesquisa aqui", `theme.SearchModal.footer.searchByText` = "Esta pesquisa utiliza"). Para um site com `defaultLocale: 'pt-BR'`, o chrome de busca nasce em português sem trabalho nenhum. Só `removeRecentConversationButtonTitle` ficou em inglês.

Duas notas de precisão: `poweredByText`/`searchByText`, `resetButtonTitle`/`clearButtonTitle` e `cancelButtonText`/`closeButtonText` compartilham o mesmo id entre si (retrocompat v3↔v4), então **não dá para diferenciá-los via i18n**.

**Camada 3 — swizzle.** *"If you prefer to edit the Algolia search React component, swizzle the `SearchBar` component in `@docusaurus/theme-search-algolia`."* ([search](https://docusaurus.io/docs/search)). O tema expõe dois componentes swizzláveis: `SearchBar` e `SearchPage`. Só se recorre a isso para mudar **estrutura** — injetar seções no modal, mudar o que cada hit renderiza.

Há um segundo alvo de swizzle, e é ele que interessa ao caso corporativo: `swizzle @docusaurus/theme-classic SearchBar` cria `src/theme/SearchBar` e o Docusaurus passa a usar **o seu** componente de busca — é o ponto de extensão oficial para plugar qualquer motor, incluindo um índice local. *"Restart your dev server and edit the component, you will see that Docusaurus uses your own SearchBar component now."* ([search](https://docusaurus.io/docs/search))

**A página `/search`.** Verbatim: *"This theme also adds search page available at `/search` (as swizzlable `SearchPage` component) path with **OpenSearch support**. You can change this default path via `themeConfig.algolia.searchPagePath`. Use `false` to disable search page."* ([theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia)). A rota só é registrada em `contentLoaded()` se `searchPagePath` for truthy, e o `postBuild()` do tema gera o arquivo OpenSearch. O modal linka para ela pelo rodapé (`theme.SearchBar.seeAll` = "Ver todos os {count} resultados").

**Comportamento responsivo do botão.** O `@docsearch/css` define, em `button.css`, um `@media (max-width: 768px)` que aplica `display: none` a `.DocSearch-Button-Keys` e `.DocSearch-Button-Placeholder` ([`packages/docsearch-css/src/button.css`](https://github.com/algolia/docsearch/blob/main/packages/docsearch-css/src/button.css)). Ou seja: **abaixo de 768px a busca vira ícone puro**, sem placeholder e sem o hint de atalho — exatamente o arranjo que as referências adotam por default em toda largura (seção 4).

### 1.5 `contextualSearch` — a peça que amarra os três assuntos

É a opção que faz a busca saber que existem versões e locales:

> *"It ensures that search results are relevant to the current language and version."* — e é **habilitada por default**. ([search](https://docusaurus.io/docs/search))

O comportamento declarado, literal:

> *"on `/en/docs/v1/myDoc`, search results will only include **English** results for the **v1** docs (+ other unversioned pages); on `/fr/docs/v2/myDoc`, search results will only include **French** results for the **v2** docs (+ other unversioned pages)."*

Mecanicamente, isso é `facetFilters` montado em runtime sobre `language:<locale>` e `docusaurus_tag:<plugin>-<versão>` (ex.: `docs-default-current`, `docs-community-current`, `default` para páginas não versionadas). A doc é explícita sobre o que quebra: *"Seeing no search results is usually related to an index configuration problem"*, e a solução envolve conferir as facetas `docusaurus_tag`, `language`, `lang`, `version`, `type` no índice.

**A consequência operacional é dura: o `contextualSearch` só funciona se o índice tiver sido construído com essas facetas.** Um índice montado por um crawler mal configurado, ou por um motor alternativo que não emita `docusaurus_tag`, resulta em busca vazia — não em busca sem filtro.

### 1.6 O custo real quando o programa gratuito não serve

Preços correntes de [algolia.com/pricing](https://www.algolia.com/pricing):

| Plano | Search requests | Records | Crawls |
| --- | --- | --- | --- |
| **Build** (gratuito) | 10K/mês | 1M inclusos | 10K/mês |
| **Grow** | 10K/mês, depois **US$ 0,50 / 1K** | 100K, depois **US$ 0,40 / 1K** | 10K/mês, depois **US$ 0,80 / 1K** |
| **Grow Plus** | 10K/mês, depois **US$ 1,75 / 1K** | 100K, depois **US$ 0,40 / 1K** | 10K/mês, depois **US$ 0,80 / 1K** |
| **Elevate** (enterprise) | sob consulta | sob consulta | sob consulta |

**O Algolia Crawler não é add-on vendido à parte nos planos pagos** — é uma linha medida dentro de Grow/Grow Plus, na mesma grade.

**A armadilha do plano Build.** 10 mil search requests por mês parece muito até se ler o FAQ da própria página: *"In autocomplete and search-as-you-type implementations, a new search request is performed on every keystroke."* O DocSearch é search-as-you-type. Uma consulta de 12 caracteres consome ~12 requests. **10K/mês ≈ 800 buscas de usuário.** Para uma doc corporativa de porte médio isso estoura no primeiro mês.

Note o contraste com o plano DocSearch gratuito (§1.2): 50 milhões de search requests/mês contra 10 mil do Build. **A diferença entre ser elegível ao DocSearch e cair no Build é de três ordens de grandeza.** Não existe meio-termo barato.

Sobre autenticação: o Algolia Crawler suporta login por cookie, emulação de browser e OAuth 2.0 Client Credentials ([crawler login](https://www.algolia.com/doc/tools/crawler/apis/configuration/login)) — mas roda na infraestrutura da Algolia. **Autenticação resolve SSO; não resolve isolamento de rede.** Um host que só resolve dentro da VPN continua inalcançável, e o caminho passa a ser indexar por API client de dentro da rede — o que já não é o preset `classic`.

### 1.7 Alternativas locais e o que custam em dependência

A página oficial nomeia **quatro** rotas, nesta ordem: 🥇 **Algolia DocSearch**, 👥 **Typesense DocSearch**, 👥 **Local Search**, 👥 **Using your own search** ([search](https://docusaurus.io/docs/search)). O emoji 👥 marca as três últimas como comunidade — **busca local não é feature do framework**. A lista completa de plugins vive em [community/resources#search](https://docusaurus.io/community/resources#search), com 12 entradas.

O único critério de dimensionamento que a doc oficial dá é qualitativo: *"You can use a local search plugin for websites where the search index is **small** and can be downloaded to your users' browsers when they visit your website."* Nenhum dos plugins declara tamanho de índice.

**Medições de npm em 4/ago/2026, com custo incremental sobre um baseline `@docusaurus/core@3.10.2` + `preset-classic` já instalado** (o número bruto de "1000 pacotes" que o npm reporta num projeto vazio é enganoso — quase tudo já existe num site Docusaurus):

| Plugin | Versão / data | Licença | Custo incremental | Nota decisiva |
| --- | --- | --- | --- | --- |
| `@easyops-cn/docusaurus-search-local` | **0.55.3**, 29/jul/2026 | MIT | **+15 pacotes, +29 MB** | Arrasta `@node-rs/jieba`, **binário nativo Rust de 15 MB**, não-opcional |
| `docusaurus-lunr-search` | **3.6.0**, 10/jan/2025 | MIT | **+32 pacotes**, sem binário | **19 meses parado**; árvore com `gauge` deprecado e majors defasados |
| `@cmfcmf/docusaurus-search-local` | **2.0.1**, 25/out/2025 | MIT | não medido | `nodejieba` é **peer opcional** (melhor para pt-BR), mas traz `algoliasearch` no lockfile |
| `@orama/plugin-docusaurus-v3` | **3.1.18**, 19/dez/2025 | Apache-2.0 | não medido | Tem modo 100% client-side, mas injeta `@orama/react-components` no chrome |
| `docusaurus-theme-search-typesense` | **0.26.0**, 10/nov/2025 | MIT | — | Servidor **self-hostável**; troca dependência npm por serviço a provisionar |

**O que cada um custa, em detalhe:**

**`@easyops-cn/docusaurus-search-local`** — o mais adotado (283 mil downloads/semana) e o mais ativo. Distribui-se como **theme**, não plugin: implementa `getThemePath()` e substitui o `SearchBar` por theme-shadowing, registra rota `/search` própria e roda a busca em **Web Worker**. Indexa **por versão** (um índice por `outDir` de versão; o da última versão vai para a raiz e atende páginas fora de `/docs`) e **por locale automaticamente**, porque cada locale gera um `outDir` separado. Traduções de UI vêm em `en`/`de`/`vi`/`zh-CN` — **pt-BR não vem pronto**, precisa ser escrito no `code.json`.

Dois custos concretos: (a) o `@node-rs/jieba` é um `.node` de 15 MB, metade do peso total, **obrigatório mesmo sem chinês**, e resolve por plataforma via 14 optionalDependencies — o modo clássico de quebrar build em registry corporativo espelhado ou air-gapped; (b) **não há busca em `docusaurus start`** — o índice só nasce em build de produção.

Uma armadilha específica de pt-BR que vale registrar: o tokenizer custom do plugin usa `/\w+|\p{Unified_Ideograph}+/u`, e `\w` em JS **não casa acento** — "configuração" viraria "configura". Mas esse tokenizer só é instalado quando `zh` está no array `language`. Com `language: ['pt']` ou `['pt','en']` vale o trimmer do `lunr.pt`, cujo `wordCharacters` cobre acentos latinos. **Acento em pt-BR está seguro; misturar `pt` com `zh` destruiria a indexação em português.**

**`docusaurus-lunr-search`** — sem binário nativo, o que é vantagem real, mas a árvore é arqueologia: `gauge@3.0.2` (*"This package is no longer supported"*), `unified@9`, `rehype-parse@7`, `minimatch@^3`. Zero CVE conhecido, mas dívida de supply chain evidente. O README publicado documenta que a instalação falha (*"If npm install fails … run `npm i --legacy-peer-deps`"*), e o README do `master` no GitHub diverge do publicado — declara suporte a "Docusaurus v3.9.2+" e Node ≥20, enquanto o que se instala é de janeiro de 2025. Mesmo limite de dev server.

**Typesense** — é a única rota que **de fato resolve** o caso corporativo com busca real: servidor GPL-3.0 self-hospedável, binário único, clientes em Apache. Mas: *"In Typesense Cloud, we only host your Typesense cluster for you. **You are still responsible for running the scraper**"* ([typesense docsearch guide](https://typesense.org/docs/guide/docsearch.html)). Ou seja, troca-se "aprovar uma dependência npm" por "provisionar, manter, monitorar e fazer backup de um serviço, mais operar um scraper". **Num ambiente onde o gargalo é aprovação de dependência, provisionar servidor costuma ser mais caro, não menos.**

**Orama** — tem modo `oss` totalmente client-side (índice gzipado copiado para o `outDir` no `postBuild`, carregado por `fetch` e montado no browser). Mas o modo `oss` não tem documentação pública decente, e a UI é `@orama/react-components` — **um design system inteiro de terceiro entrando no chrome**, o que colide de frente com o axioma 3 deste repo (a skin é o produto).

#### A rota vanilla existe, e a doc oficial a nomeia

Esta é a saída que reconcilia o axioma 2 com a necessidade de busca, e as três peças estão todas documentadas:

**1. Plugin local por caminho, sem pacote npm.** *"Docusaurus can also load plugins from your local directory"* ([using-plugins](https://docusaurus.io/docs/using-plugins)):

```js
export default {
  plugins: ['./src/plugins/docusaurus-local-plugin'],
};
```

com a nota *"Paths should be absolute or relative to the config file"*. E a página é explícita de que npm é só o caso comum: *"A plugin is **usually** an npm package"*.

**2. `postBuild` entrega exatamente o que um índice precisa** ([lifecycle-apis](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis)):

```ts
interface Props {
  siteDir: string; generatedFilesDir: string; siteConfig: DocusaurusConfig;
  outDir: string; baseUrl: string;
  headTags: string; preBodyTags: string; postBodyTags: string;
  routesPaths: string[];
  routesBuildMetadata: {[location: string]: {noIndex: boolean}};
  plugins: Plugin<any>[];
  content: Content;
}
```

`outDir` e `routesPaths` sim — e de brinde `routesBuildMetadata[route].noIndex`, que respeita `noIndex` por versão (§3.2) sem reimplementar a regra. As actions de `contentLoaded` fecham o desenho: `addRoute` registra `/search` sem MDX, `createData` serializa o índice como JSON, `setGlobalData` — *"permits one to create some global plugin data that can be read from any page, including the pages created by other plugins, and your theme layout"* — é como o `SearchBar`, que vive no layout, alcança o índice.

**3. `SearchBar` swizzlado**, e o swizzle já está autorizado pelo axioma 2: *"To use your own search, swizzle the `SearchBar` component in `@docusaurus/theme-classic`"* ([search](https://docusaurus.io/docs/search)).

Como o build gera `build/` e `build/en/` separados, **o índice por locale sai de graça**.

**O que essa rota custa, sem maquiagem:**

- **Extração de texto.** Os plugins usam `cheerio` / `rehype-parse`. Vanilla, parsear HTML sem dependência é a parte concretamente chata. Mitigação: não parsear HTML — consumir o `content` do plugin de docs ou os próprios arquivos MD/MDX. Menos fiel ao renderizado, muito mais barato.
- **Relevância.** Sem lunr não há BM25, stemming nem stop words. Substring match sobre título + headings + primeiro parágrafo entrega a maior parte do valor percebido numa doc de tamanho médio. Não é lunr; é incomparavelmente melhor que nada.
- **Stemming pt-BR.** Perde-se "autenticar" casando "autenticação". O corretivo mais importante custa ~5 linhas: `String.prototype.normalize('NFD')` + strip de diacríticos, que cobre o erro mais comum do usuário brasileiro — digitar sem acento.
- **Payload.** Vanilla você **controla** o tamanho do índice (só título + headings + N caracteres), o que com plugin é só uma opção. Isso é vantagem.
- **Dev server.** Se implementado só em `postBuild`, herda a mesma limitação dos plugins. Mas com plugin local dá para emitir o índice também em `contentLoaded`/`createData`, que roda em dev — **busca em `docusaurus start`, que nenhum dos dois plugins principais oferece.**
- **Manutenção passa a ser sua.** Contrapeso honesto: o plugin mais bem mantido do grupo carrega 15 MB de binário que ninguém pediu, e o segundo mais usado está parado há 19 meses.

**Leitura da evidência:** a rota vanilla é a única que satisfaz simultaneamente o axioma 2 (zero dependências novas) e o axioma 3 (a skin é o produto — nada de design system de terceiro no chrome), tem respaldo explícito na doc oficial nas três peças que precisa, e mantém o entregável como **spec transplantável**. Se o mapa decidir comprar um plugin apesar do axioma, o candidato de melhor perfil para pt-BR **não é o easyops** — é o `@cmfcmf/docusaurus-search-local`, que deixa o binário chinês como peer opcional. Com a ressalva de que ele traz `algoliasearch` no lockfile, e "algoliasearch" no `package-lock.json` de um projeto que jurou não usar Algolia é uma conversa que alguém vai ter.

---

## 2. i18n

### 2.1 Filosofia declarada

O Docusaurus declara os objetivos do subsistema ([i18n/introduction](https://docusaurus.io/docs/i18n/introduction)):

- *"just put the translated files in the correct filesystem location"* — tradução é convenção de sistema de arquivos.
- Baixo overhead em runtime: *"documentation is mostly static and does not require heavy JS libraries"*.
- *"allow building and deploying localized sites independently"*.
- SEO: *"we set useful SEO headers like `hreflang` for you"*.
- **Sem SaaS obrigatório**: *"not forced to use any SaaS"* — o que alinha i18n com o axioma vanilla-first sem atrito nenhum.
- Suporte a RTL.

### 2.2 Configuração e roteamento

```js
i18n: {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en'],
  localeConfigs: {
    'pt-BR': { label: 'PT', htmlLang: 'pt-BR' },
    en:      { label: 'EN', htmlLang: 'en' },
  },
},
```

Regra de roteamento, literal: *"Docusaurus will automatically add a `/<locale>/` path segment to your site for locales except the default one."* ([i18n/tutorial](https://docusaurus.io/docs/i18n/tutorial))

No cenário alvo, isso significa:

| Conteúdo | URL |
| --- | --- |
| pt-BR (default) | `/docs/introducao` |
| EN (secundário) | `/en/docs/introducao` |

Note que **o slug não é traduzido pelo mecanismo de locale** — o caminho do arquivo é o mesmo nas duas árvores. Traduzir slug exige `slug:` no front matter do arquivo traduzido.

Os campos de `localeConfigs` derivados automaticamente são `label`, `direction`, `htmlLang`, `calendar` e `path`, todos calculáveis a partir do código do locale ([`packages/docusaurus/src/server/i18n.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/server/i18n.ts), `getDefaultLocaleConfig`).

### 2.3 Estrutura de pastas

```
i18n/
└── en/
    ├── code.json                                   # strings de código React
    ├── docusaurus-theme-classic/
    │   ├── navbar.json                             # labels da navbar
    │   └── footer.json                             # labels do footer
    ├── docusaurus-plugin-content-docs/
    │   ├── current/                                # espelho de docs/
    │   ├── current.json                            # labels de categoria da sidebar
    │   ├── version-1.0.0/                          # espelho de versioned_docs/version-1.0.0/
    │   └── version-1.0.0.json
    ├── docusaurus-plugin-content-blog/
    └── docusaurus-plugin-content-pages/
```

Padrão geral: `website/i18n/[locale]/[pluginName]/...`, e `website/i18n/[locale]/[pluginName]-[pluginId]/...` para plugins multi-instância ([i18n/introduction](https://docusaurus.io/docs/i18n/introduction), [i18n/crowdin](https://docusaurus.io/docs/i18n/crowdin)).

### 2.4 O que é traduzível e o que não é

**Traduzível — Markdown, arquivo a arquivo.** Docs, blog e páginas React são *"translated as a whole"*: copia-se o `.md`/`.mdx` para a pasta do locale e traduz-se o arquivo inteiro.

**Traduzível — JSON, chave a chave.** Formato Chrome i18n (`{ "chave": { "message": "...", "description": "..." } }`) para: código React em `src/pages` (via `<Translate>` / `translate()`), labels de layout do `themeConfig` (navbar, footer), e labels de plugin (categorias de sidebar, títulos de blog).

O comando que gera esses arquivos é `docusaurus write-translations --locale <locale>` ([CLI](https://docusaurus.io/docs/cli)):

> *"The `docusaurus write-translations` command will statically analyze all React code files used in your site, extract calls to these APIs, and aggregate them in the `code.json` file."*

Options relevantes: `--locale`, `--override` (*"Override existing translation messages"*) e `--messagePrefix` (*"Allows adding a prefix to each translation message, to help you highlight untranslated strings"*). **O `--messagePrefix` é a ferramenta de auditoria de tradução parcial** — marca visualmente o que ainda não foi traduzido, exatamente o que o cenário "EN parcial" precisa.

**NÃO traduzível — e isso é uma limitação aberta desde 2021.** A issue [facebook/docusaurus#4542](https://github.com/facebook/docusaurus/issues/4542) — *"[i18n] Making everything translatable (website title, description...)"* — segue **aberta** e lista o que fica de fora:

- `title` do site
- `tagline`
- announcement bar
- `alt` do logo
- copyright

O workaround conhecido é a variável de ambiente `DOCUSAURUS_CURRENT_LOCALE`, introduzida em [facebook/docusaurus#8677](https://github.com/facebook/docusaurus/pull/8677) — declaradamente *"a best effort awkward temporary workaround"*, **não documentada de propósito e fora da API pública**.

**Implicação para a spec:** o `title` e a `tagline` do site precisam ser escritos de um jeito que sobreviva aos dois locales — nome próprio, sigla, ou termo que não pede tradução. Escolher uma tagline em pt-BR bonita e depois descobrir que ela aparece igual no `/en/` é retrabalho evitável.

### 2.5 pt-BR default + EN parcial: o que REALMENTE acontece

Esta é a pergunta que a doc oficial não responde de forma direta, e o código responde sem ambiguidade.

O plugin de docs lista os arquivos com um glob sobre **um único diretório** — o não localizado ([`packages/docusaurus-plugin-content-docs/src/docs.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/docs.ts)):

```ts
export async function readVersionDocs(versionMetadata, options) {
  const sources = await Globby(options.include, {
    cwd: versionMetadata.contentPath,   // <- árvore ORIGINAL
    ignore: options.exclude,
  });
  return Promise.all(sources.map((source) => readDocFile(versionMetadata, source)));
}
```

Mas o **conteúdo** de cada arquivo é resolvido por uma lista de caminhos com precedência:

```ts
export async function readDocFile(versionMetadata, source) {
  const contentPath = await getFolderContainingFile(
    getContentPathList(versionMetadata),
    source,
  );
  const filePath = path.join(contentPath, source);
  const content = await fs.readFile(filePath, 'utf-8');
  return {source, content, contentPath, filePath};
}
```

E a ordem dessa lista está travada, com o comentário explícito ([`packages/docusaurus-utils/src/dataFileUtils.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/src/dataFileUtils.ts)):

```ts
/**
 * Takes the `contentPaths` data structure and returns an ordered path list
 * indicating their priorities. For all data, we look in the localized folder
 * in priority.
 */
export function getContentPathList(contentPaths: ContentPaths): string[] {
  return [contentPaths.contentPathLocalized, contentPaths.contentPath].filter(
    (p) => p !== undefined,
  );
}
```

**Três consequências, todas relevantes:**

1. **Tradução parcial é suportada de fato.** Uma página que existe em `docs/` mas não em `i18n/en/docusaurus-plugin-content-docs/current/` é gerada em `/en/...` **com o conteúdo em pt-BR**. Não há 404, não há falha de build. O locale EN parcial é uma configuração legítima, não uma gambiarra.
2. **O fallback é silencioso.** Não há aviso de build, não há badge de "não traduzido", não há relatório de cobertura. Se a spec quiser sinalizar ao leitor que aquela página não está em inglês, isso é trabalho autoral — front matter + swizzle ou componente de conteúdo.
3. **Um arquivo que existe SÓ na árvore traduzida é ignorado.** Como a lista de fontes sai da árvore original, não dá para publicar uma página exclusiva de um locale por esse caminho. A árvore pt-BR define o universo de páginas; a árvore EN só pode sobrescrever.

Fora do Markdown a história é diferente: as chaves JSON ausentes caem nos defaults do tema — *"Docusaurus provides default translations for generic theme labels, such as 'Next' and 'Previous'"* ([i18n/tutorial](https://docusaurus.io/docs/i18n/tutorial)) — mas rótulos autorais (navbar, categorias de sidebar) sem tradução aparecem no idioma em que foram escritos.

### 2.6 O seletor de idioma na navbar

```js
themeConfig: {
  navbar: {
    items: [{ type: 'localeDropdown', position: 'right' }],
  },
},
```

Props documentadas ([theme configuration](https://docusaurus.io/docs/api/themes/configuration)): `position` (`'left'` | `'right'`, default `'left'`), `dropdownItemsBefore`, `dropdownItemsAfter`, `queryString`.

**O detalhe que dói no chrome:** o label de cada item do dropdown vem de `localeConfigs[locale].label`, e o default é calculado com `Intl.DisplayNames` no próprio idioma, com a primeira letra capitalizada ([`i18n.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/server/i18n.ts)):

```ts
function getDefaultLocaleLabel(locale: string) {
  const languageName = inferLanguageDisplayName(locale);
  if (!languageName) return locale;
  return languageName.charAt(0).toLocaleUpperCase(locale) + languageName.substring(1);
}
```

Para `pt-BR` isso produz **"Português (Brasil)"** — 18 caracteres. É, com folga, o item mais largo que a navbar vai carregar. Overridar `localeConfigs['pt-BR'].label` para `'PT'` (ou `'Português'`) é decisão de chrome, não de i18n.

### 2.7 Custo de manter duas árvores

O fluxo git é copiar e traduzir à mão ([i18n/git](https://docusaurus.io/docs/i18n/git)):

```bash
mkdir -p i18n/en/docusaurus-plugin-content-docs/current
cp -r docs/. i18n/en/docusaurus-plugin-content-docs/current
```

As desvantagens que a própria doc lista, literais:

- *"Hard to maintain: you have to keep the translated files **in sync** with the untranslated files"*
- *"Keeping translated files **consistent** with the originals **can be challenging**, in particular for Markdown documents."*
- Difícil para não-desenvolvedores e para tradutores profissionais.

Vantagens declaradas: fácil de começar, familiar a desenvolvedores, gratuito, baixa fricção, histórico de contribuições em git.

**Custo de build.** Cada locale é *"a distinct standalone single-page application: it is not possible to start the Docusaurus sites in all locales at the same time"* ([i18n/tutorial](https://docusaurus.io/docs/i18n/tutorial)). Em desenvolvimento roda-se `docusaurus start --locale en`, um locale por vez. Em build, `docusaurus build` gera **todos** os locales (`build/` + `build/en/`); `--locale en` gera só um — e nesse caso *"Docusaurus will not add the `/en/` URL prefix automatically"* ([CLI](https://docusaurus.io/docs/cli): *"Build the site in the specified locale(s). If not specified, all known locales are built"*).

Em suma: **N locales = N builds completos**, com o tempo de build multiplicado por N.

---

## 3. Versionamento

### 3.1 Mecânica de snapshot

Um comando ([versioning](https://docusaurus.io/docs/versioning)):

```bash
npm run docusaurus docs:version 1.1.0
```

O que ele faz, exatamente:

1. Copia o conteúdo de `docs/` para `versioned_docs/version-1.1.0/`.
2. Gera `versioned_sidebars/version-1.1.0-sidebars.json` a partir do `sidebars.js` corrente.
3. Anexa `"1.1.0"` ao `versions.json`.

Terminologia que a spec precisa usar sem escorregar:

| Termo | Onde mora | URL default |
| --- | --- | --- |
| **current version** | `./docs` | `/docs/next/*` |
| **latest version** | último snapshot / `lastVersion` | `/docs` |
| **next version** | rótulo da current quando não lançada | — |
| **versioned** | `versioned_docs/version-X/` | `/docs/X/*` |

### 3.2 Config do plugin

Opções relevantes ([plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs)):

| Opção | Default | Papel |
| --- | --- | --- |
| `lastVersion` | primeira versão de `versions.json` | *"The version navigated to in priority and displayed by default for docs navbar items"* |
| `includeCurrentVersion` | `true` | *"Include the current version of your docs"* |
| `onlyIncludeVersions` | todas | Restringe as versões deployadas — a alavanca para não pagar build por versões antigas em previews. |
| `disableVersioning` | `false` | Desliga versionamento mesmo com `versions.json` presente. |
| `versions` | — | Metadados por versão. |

`VersionConfig` por versão:

```ts
type VersionConfig = {
  path?: string;
  label?: string;                                  // aparece no dropdown e no badge
  banner?: 'none' | 'unreleased' | 'unmaintained'; // faixa de aviso no topo da página
  badge?: boolean;                                 // badge de versão no doc
  noIndex?: boolean;                               // tira dos motores de busca
  className?: string;                              // classe no <html> — gancho de skin por versão
};
```

Três desses tocam o chrome diretamente: `banner` insere uma faixa acima do conteúdo, `badge` insere um selo na página, e `className` chega no `<html>`, permitindo skin diferenciada por versão sem swizzle.

### 3.3 O seletor na navbar e a sidebar

```js
{ type: 'docsVersionDropdown', position: 'right' }
```

Props ([theme configuration](https://docusaurus.io/docs/api/themes/configuration)): `position` (default `'left'`), `dropdownItemsBefore`, `dropdownItemsAfter`, `docsPluginId` (default `'default'`), `dropdownActiveClassDisabled` (default `false`), `versions` (filtra/reordena o que aparece). Existe também `type: 'docsVersion'`, que é um link simples para a versão ativa.

Ordem de resolução da versão exibida: versão ativa → versão preferida do usuário (persistida) → latest.

No mobile o componente troca de rótulo: `DocsVersionDropdownNavbarItem` usa a chave de tradução `theme.navbar.mobileVersionsDropdown.label` quando `mobile && items.length > 1` ([`DocsVersionDropdownNavbarItem.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/NavbarItem/DocsVersionDropdownNavbarItem.tsx)). Ou seja, dentro do hambúrguer ele vira um grupo rotulado "Versions", não o número da versão.

**Sidebar.** Cada versão congela a própria sidebar em `versioned_sidebars/version-X-sidebars.json`. Editar a sidebar da versão corrente não mexe nas antigas — o que é o ponto do snapshot, e também a armadilha: uma reorganização de IA precisa ser aplicada em cada arquivo de sidebar versionado, um a um, se se quiser retroatividade.

**Links entre versões.** A doc manda usar caminhos relativos com extensão `.md` para que o Docusaurus reescreva o link para a versão correspondente, e evitar imports relativos em favor do alias `@site` — porque o nível de aninhamento muda entre `docs/` e `versioned_docs/version-X/`.

### 3.4 O custo, na voz da própria doc

A página de versionamento é incomumente franca:

> *"Most of the time, you don't need versioning as it will just **increase your build time, and introduce complexity to your codebase**."*

> *"Think about it before starting to version your documentation - it can become **difficult for contributors to help improve it!**"*

> *"Versioning is **best suited for websites with high-traffic and rapid changes to documentation between versions**."*

> *"Try to keep the number of your versions below 10."*

E a recomendação: versionar só quando necessário, e arquivar versões obsoletas em URLs imutáveis externas.

**Leitura para este repo:** o produto aqui é uma doc de referência mockada cujo valor é a estrutura. Versionamento entra como **demonstração de mecânica**, não como necessidade de conteúdo. Duas versões (uma `current`/`next` + uma congelada) já provam o dropdown, o banner, o badge e a sidebar versionada. Três ou mais só multiplicam custo sem provar nada novo.

---

## 4. A interação entre os três

### 4.1 Versão × locale multiplica árvores

A multiplicação é literal no sistema de arquivos:

```
docs/                                          # pt-BR, current
versioned_docs/version-1.0.0/                  # pt-BR, congelada
i18n/en/docusaurus-plugin-content-docs/
  ├── current/                                 # EN, current
  ├── current.json
  ├── version-1.0.0/                           # EN, congelada
  └── version-1.0.0.json
```

**Árvores de conteúdo = versões × locales.** Com 2 versões e 2 locales já são 4 árvores de Markdown e 4 arquivos JSON de labels de sidebar. E o snapshot é assimétrico: `docs:version` congela **só a árvore não localizada**; a cópia da árvore traduzida para `i18n/en/.../version-X/` é trabalho manual a cada corte de versão.

A doc de Crowdin registra que essa multiplicação tem preço mesmo em fluxo gerenciado — sem esconder as versões antigas, tem-se *"uma muito maior quantidade de source strings"*, o que afeta a cota e o preço ([i18n/crowdin](https://docusaurus.io/docs/i18n/crowdin)).

O alívio: a precedência de `getContentPathList` (§2.5) vale igualmente para versões. Uma versão congelada sem tradução renderiza em `/en/docs/1.0.0/...` com o texto pt-BR. Nada quebra — mas nada avisa.

### 4.2 A busca precisa saber disso

O `contextualSearch` é a peça que impede o modal de misturar as quatro árvores. Ele exige que **cada registro do índice carregue as facetas `language` e `docusaurus_tag`**, e o Docusaurus monta o `facetFilters` a partir do contexto de navegação.

Três riscos operacionais que a spec deve registrar:

1. **Índice único para tudo.** As quatro árvores vivem no mesmo índice; a separação é por faceta, não por índice. Um crawler que não emita a faceta produz busca vazia, não busca ampla — a doc é explícita: *"Seeing no search results is usually related to an index configuration problem"*.
2. **Latência de snapshot.** Cortar uma versão nova não a torna buscável. Ela só aparece depois do próximo crawl. Entre o corte e o crawl, a versão nova existe no site e não existe na busca.
3. **Locale parcial polui o índice.** Como as páginas EN não traduzidas são geradas com texto pt-BR, o crawler as indexa com `language: en` e conteúdo em português. O resultado é uma busca em inglês que retorna títulos e trechos em português. Isso não é bug do Docusaurus nem do crawler — é o efeito direto do fallback silencioso. **É o custo escondido mais consequente do "EN parcial".** Mitigações vanilla: `noIndex` por versão, exclusão de rota na config do crawler, ou disciplina de traduzir ao menos títulos e descrições.

**Na rota de busca local (§1.7) a conta muda de lugar, não some.** A separação por locale sai de graça, porque `docusaurus build` produz um `outDir` por locale (`build/`, `build/en/`) e o índice nasce dentro de cada um. Já a separação por versão é trabalho explícito: as versões convivem dentro do mesmo `outDir`, então o índice precisa carregar a versão como campo e o `SearchBar` precisa filtrar por ela — que é exatamente o que o `contextualSearch` faz de graça no DocSearch. **Quem escolhe a rota vanilla herda a obrigação de reimplementar o `contextualSearch`.** O `routesBuildMetadata[route].noIndex` do `postBuild` ajuda: respeita `noIndex` por versão (§3.2) sem reimplementar a regra. E o problema do locale parcial poluindo o índice permanece idêntico — é do conteúdo, não do motor.

### 4.3 Multiplicação de build

- `docusaurus build` gera **todos** os locales — N builds completos.
- Cada build carrega **todas** as versões incluídas.
- Custo de build ≈ locales × versões × páginas.

As alavancas vanilla para conter: `onlyIncludeVersions` (limita versões deployadas), `includeCurrentVersion: false` (remove `/next`), e build por locale em jobs paralelos de CI.

---

## 5. O impacto somado no chrome

### 5.1 O orçamento real, em pixels

Números do Infima ([`packages/core/styles/components/navbar.pcss`](https://github.com/facebookincubator/infima/blob/main/packages/core/styles/components/navbar.pcss)):

| Token | Valor |
| --- | --- |
| `--ifm-navbar-height` | `3.75rem` (60px) |
| `--ifm-navbar-item-padding-horizontal` | `0.75rem` (12px por lado) |
| `--ifm-navbar-item-padding-vertical` | `0.25rem` |
| `--ifm-navbar-padding-horizontal` | `var(--ifm-spacing-horizontal)` |
| `.navbar__search-input` largura | `12.5rem` (200px), `9rem` (144px) em janela estreita |
| `--ifm-navbar-sidebar-width` | `83vw` |

E o breakpoint que governa tudo: `@custom-media --ifm-narrow-window (max-width: 996px)` ([`packages/core/styles/common/variables.pcss`](https://github.com/facebookincubator/infima/blob/main/packages/core/styles/common/variables.pcss)).

Dentro desse media query, `.navbar__item` recebe `display: none` e `.navbar__toggle` aparece. **Abaixo de 996px, os dois dropdowns e todos os links somem para dentro do hambúrguer** — e o `docsVersionDropdown` reaparece lá com o rótulo "Versions" (§3.3). O único elemento de chrome que sobrevive na navbar mobile é a busca, e ela vira ícone puro abaixo de 768px pelo CSS do DocSearch (§1.4).

**Conclusão contraintuitiva: o mobile não é o problema. O Infima já resolveu.** O aperto real vive na faixa de ~997px a ~1200px, onde todos os itens ainda estão visíveis e o espaço já acabou.

Estimativa de largura por item à direita (label + 24px de padding + caret do dropdown):

| Item | Label | Largura estimada |
| --- | --- | --- |
| `docsVersionDropdown` | `v1.0.0` | ~85px |
| `localeDropdown` (label default) | `Português (Brasil)` | **~165px** |
| `localeDropdown` (label curto) | `PT` | ~55px |
| `DocSearch-Button` | `Buscar` + `⌘K` | ~180–200px |
| toggle de tema | ícone | ~40px |
| link GitHub | ícone | ~40px |

Com o label default do locale, os itens à direita somam ~510px antes de qualquer link de navegação à esquerda. Com `label: 'PT'`, caem para ~400px. **Encurtar o label do locale é a economia mais barata disponível — ~110px por uma linha de config.**

### 5.2 Evidência direta: o próprio docusaurus.io

O site do Docusaurus é o único caso de referência que roda Docusaurus **e** carrega os três ao mesmo tempo. Seu [`website/docusaurus.config.ts`](https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts):

- **Esquerda** — `Docs`, `API`, `Blog`, `Showcase`, `Community` (5 links de navegação).
- **Direita** — `docsVersionDropdown`, `localeDropdown`, link do GitHub (ícone via `className: 'header-github-link'`), **mais a busca**, que o tema posiciona automaticamente.
- `i18n.locales`: `['en', 'fr', 'pt-BR', 'ko', 'zh-CN']` em produção — cinco locales.
- `algolia`: `appId`, `apiKey`, `indexName: 'docusaurus-2'`, `askAi` condicional à versão do `@docsearch/react`, e `replaceSearchResultPathname` mapeando `/docs/next` → `/docs` em dev e preview.

**Não há nenhuma estratégia anti-aperto no config.** Nenhum item escondido por breakpoint, nenhum agrupamento em overflow, nenhum comentário sobre navbar cheia. A estratégia do próprio Docusaurus é: **cinco links à esquerda, três itens + busca à direita, e aceitar o colapso do Infima a 996px**. É a prova de que o arranjo default aguenta os três — e também de que ele não foi otimizado.

Duas alavancas usadas ali que valem para a spec: **ícone em vez de label** para o GitHub (`className` + `aria-label`), e `dropdownActiveClassDisabled: true` no dropdown de versão.

### 5.3 O que as sete referências fazem

Primeiro achado, e é estrutural: **nenhuma das sete é Docusaurus.** Detecção por marcadores no HTML servido:

| Referência | Plataforma detectada | Evidência |
| --- | --- | --- |
| FastMCP | **Mintlify** | ~890 ocorrências de `mintlify` no HTML |
| Devin | **Mintlify** | ~885 ocorrências |
| Perplexity | **Mintlify** | ~942 ocorrências |
| Trigger.dev | **Mintlify** | ~58 ocorrências |
| Vapi | **Fern** | ~2438 ocorrências de `fern` |
| Neon | custom (Next.js) | sem marcador de gerador |
| Clerk | custom (Next.js) + Algolia | meta tags `algolia:*` |

Isso rebaixa o peso da evidência: elas mostram **padrão de arranjo**, não mecânica transplantável. O que se copia delas é a decisão de composição, não a implementação.

Chrome observado, por dissecção do HTML servido:

| Referência | Busca | Versão | Idioma | Outros itens à direita |
| --- | --- | --- | --- | --- |
| FastMCP | ícone — `aria-label="Open search"` | não observado | **não** | `Ask Assistant` (painel), toggle de tema (light/dark/system) |
| Devin | ícone — `aria-label="Open search"` | não observado | **não** | `Ask Assistant`, `Change theme preference` |
| Perplexity | ícone — `aria-label="Open search"` | não observado | **não** | `Ask Assistant` (13 gatilhos na página), toggle de tema |
| Trigger.dev | ícone — `aria-label="Open search"` | não observado | **não** | `Ask Assistant`, painel de assistente |
| Vapi (Fern) | `aria-label="Search"` na navbar | não observado | **não** | GitHub, Discord, Twitter, LinkedIn, Website, notificações |
| Neon | `Search` no header, seguido de `Open Neon AI` | não observado | **não** | Neon AI, notificações, `Open menu` |
| Clerk | Algolia; filtro `Search SDKs…` na sidebar | **sim** — `aria-label="Documentation version"`, valor `Core 3`, no header | **não** | toggle de tema (Light/Dark/System), `Show available SDKs` |

**Veredito:**

1. **Zero de sete têm seletor de idioma.** Todas são doc em inglês apenas. Não existe referência medida para o problema de conviver com um `localeDropdown` — o repo está inovando aqui, e o docusaurus.io (§5.2) é o único precedente disponível.
2. **Uma de sete tem seletor de versão** (Clerk, `Core 3`), e ele fica **no header**, à esquerda, perto do logo — não misturado com a busca.
3. **Busca é botão de ícone, não campo, em seis de sete.** O padrão dominante é `aria-label="Open search"` abrindo um modal/command palette. O campo largo de 200px do Infima é a exceção, não a regra.
4. **O slot mais disputado da navbar de 2026 não é a busca — é o "Ask AI".** Quatro das sete (as Mintlify) carregam um painel de assistente com placeholder `"Ask a question..."`, e Neon tem `Open Neon AI` **ao lado** da busca. Isso é território do ticket #8, mas colide com este: quem quiser Ask AI precisa reservar o slot agora.
5. **Clerk resolve o aperto empurrando o seletor contextual para fora da navbar.** O filtro de SDK (`Search SDKs…`, `Show available SDKs`) vive na sidebar, não no header. O header fica com logo + versão + tema. E o índice Algolia é dirigido por meta tags no HTML — `algolia:rank`, `algolia:available-sdks`, `algolia:canonical` — que é exatamente o mecanismo de faceta que o `contextualSearch` do Docusaurus usa com `docusaurus_tag` e `language`.

### 5.4 Arranjos possíveis, todos vanilla

1. **Busca como ícone, não como campo.** Já é o comportamento nativo do DocSearch abaixo de 768px; estendê-lo para toda largura é CSS puro sobre `.DocSearch-Button-Placeholder`. Recupera ~120px. É o padrão de seis das sete referências.
2. **Label curto de locale.** `localeConfigs['pt-BR'].label = 'PT'`. Recupera ~110px por uma linha de config.
3. **Ícones em vez de labels para links utilitários.** GitHub, Discord — `className` + `aria-label`, como o próprio docusaurus.io faz.
4. **Empurrar o seletor de versão para o topo da sidebar.** É o arranjo do Clerk. Em Docusaurus custa swizzle de `DocSidebar` — sai do vanilla puro e entra na conta do ticket #14 (estratégia de swizzle).
5. **Agrupar em um dropdown único.** `type: 'dropdown'` com `dropdownItemsBefore`/`After` pode consolidar utilitários. Não funciona para os dropdowns de versão e locale, que são componentes próprios.
6. **`onlyIncludeVersions` / poucas versões.** Menos versões, dropdown mais estreito e label mais curto.
7. **Aceitar o default do Infima.** É o que o docusaurus.io faz, com cinco locales e múltiplas versões. Funciona; só não é elegante entre 997 e 1200px.

---

## 6. O que isto trava e o que fica aberto

**Travado por evidência:**

- Busca do preset `classic` é cliente Algolia; sem conta e índice, não há busca. Sem rede externa, não há busca. Sem `themeConfig.algolia`, o tema é inerte e não custa nada.
- O DocSearch gratuito impõe **logo da Algolia no modal** e **enrollment automático no DocSearchMCP**, com licença sublicenciável sobre o conteúdo indexado. São restrições de design e jurídicas, não só operacionais.
- Reskin completo do modal DocSearch é possível **sem swizzle**, por 44 custom properties CSS — e o dark mode do DocSearch usa `html[data-theme=dark]`, o mesmo seletor do Docusaurus.
- O chrome de busca já nasce em pt-BR: 57 das 58 chaves `theme.Search*` vêm traduzidas em `@docusaurus/theme-translations`.
- `contextualSearch` é default e resolve versão × locale — desde que o índice tenha as facetas.
- Locale parcial não quebra: fallback silencioso arquivo a arquivo, com a árvore original definindo o universo de páginas.
- `title` e `tagline` do site não são traduzíveis (issue aberta desde 2021).
- Abaixo de 996px a navbar colapsa inteira no hambúrguer; a busca vira ícone abaixo de 768px.
- Nenhuma das sete referências enfrenta o problema do seletor de idioma.
- Existe rota de busca local **sem pacote npm novo**: plugin local por caminho (documentado oficialmente) + `postBuild` com `outDir`/`routesPaths`/`routesBuildMetadata.noIndex` + `SearchBar` swizzlado. Índice por locale sai de graça do build multi-locale.
- Todo plugin de busca local do ecossistema custa dependência relevante: `@node-rs/jieba` (binário nativo de 15 MB, obrigatório) no mais adotado; 19 meses de abandono no segundo; `algoliasearch` no lockfile do terceiro; design system de terceiro no chrome no quarto.

**Fica aberto para decisão (não é pesquisa, é chamada):**

- Qual das três rotas de busca a spec adota: **(a)** DocSearch real (aceita logo Algolia no modal + cláusula DocSearchMCP), **(b)** rota vanilla local (plugin próprio + swizzle), **(c)** sem busca (`themeConfig.algolia` ausente, tema inerte). A (b) é a única que satisfaz os axiomas 2 e 3 ao mesmo tempo e mantém o entregável transplantável.
- Quantas versões a demonstração corta. A recomendação desta pesquisa é **duas**.
- Se a página EN parcial ganha sinalização visual de "não traduzido" — e a que custo de swizzle.
- Se o slot de "Ask AI" é reservado na navbar agora (interação com o ticket #8).
- Se o seletor de versão fica na navbar (vanilla) ou no topo da sidebar (padrão Clerk, custa swizzle).

**Não confirmado em fonte primária** (registrado para honestidade, não usar como fato):

- Critérios de elegibilidade do DocSearch quanto a *paywall*, *conteúdo de marketing* e *ads* — nenhuma página oficial da Algolia usa esses termos. O que existe verbatim é "publicly available websites" e "non-technical content".
- Ausência de oferta on-premise da Algolia — os artigos de suporte pertinentes estão atrás de Cloudflare e não foram extraíveis. Sustentado por evidência indireta (hosts hardcoded, ausência de artefato self-hosted publicado).
- Quais planos pagos incluem "crawl password protected pages" — a linha existe na grade de comparação, mas a associação coluna↔plano não foi extraível.
- Comportamento de overage do plano Build acima da cota — a página não declara.
- Presença de seletor de versão nas referências renderizadas por SPA (Mintlify/Fern): a ausência no HTML servido **não prova ausência na interface**. O que está afirmado é o que foi observado no markup inicial.

---

## Fontes

**Documentação oficial do Docusaurus**

- [Search](https://docusaurus.io/docs/search)
- [theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia)
- [Theme configuration — navbar](https://docusaurus.io/docs/api/themes/configuration)
- [plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs)
- [i18n — Introduction](https://docusaurus.io/docs/i18n/introduction)
- [i18n — Tutorial](https://docusaurus.io/docs/i18n/tutorial)
- [i18n — Git strategy](https://docusaurus.io/docs/i18n/git)
- [i18n — Crowdin](https://docusaurus.io/docs/i18n/crowdin)
- [Versioning](https://docusaurus.io/docs/versioning)
- [CLI](https://docusaurus.io/docs/cli)
- [Using Plugins](https://docusaurus.io/docs/using-plugins) — plugin carregado de diretório local
- [Plugin Methods — Lifecycle APIs](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis) — `postBuild`, `contentLoaded`
- [Community resources — Search](https://docusaurus.io/community/resources#search) — lista dos 12 plugins de busca

**Plugins de busca local** (medições de npm em 4/ago/2026)

- [`@easyops-cn/docusaurus-search-local`](https://github.com/easyops-cn/docusaurus-search-local) — v0.55.3
- [`docusaurus-lunr-search`](https://github.com/lelouch77/docusaurus-lunr-search) — v3.6.0
- [`@cmfcmf/docusaurus-search-local`](https://github.com/cmfcmf/docusaurus-search-local) — v2.0.1
- [`@orama/plugin-docusaurus-v3`](https://github.com/oramasearch/orama) — v3.1.18
- [`docusaurus-theme-search-typesense`](https://github.com/typesense/docusaurus-theme-search-typesense) — v0.26.0 · [Typesense DocSearch guide](https://typesense.org/docs/guide/docsearch.html) · [typesense/typesense](https://github.com/typesense/typesense)

**Código-fonte (Docusaurus, Infima, DocSearch)**

- [`docusaurus-utils/src/dataFileUtils.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/src/dataFileUtils.ts) — `getContentPathList`
- [`docusaurus-plugin-content-docs/src/docs.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/docs.ts) — `readVersionDocs`, `readDocFile`
- [`docusaurus/src/server/i18n.ts`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/server/i18n.ts) — `getDefaultLocaleLabel`, `getDefaultLocaleConfig`
- [`docusaurus-theme-classic/src/theme/NavbarItem/DocsVersionDropdownNavbarItem.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/NavbarItem/DocsVersionDropdownNavbarItem.tsx)
- [`docusaurus-theme-search-algolia/src/theme/SearchBar/styles.css`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-search-algolia/src/theme/SearchBar/styles.css)
- [`website/docusaurus.config.ts`](https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts) — config do próprio docusaurus.io
- [Infima `navbar.pcss`](https://github.com/facebookincubator/infima/blob/main/packages/core/styles/components/navbar.pcss)
- [Infima `common/variables.pcss`](https://github.com/facebookincubator/infima/blob/main/packages/core/styles/common/variables.pcss) — `--ifm-narrow-window`
- [DocSearch `_variables.css`](https://github.com/algolia/docsearch/blob/main/packages/docsearch-css/src/_variables.css)
- [DocSearch `button.css`](https://github.com/algolia/docsearch/blob/main/packages/docsearch-css/src/button.css)

**Algolia / DocSearch**

- [DocSearch — Who can apply](https://docsearch.algolia.com/docs/who-can-apply) (atualizada em 3/jun/2026)
- [DocSearch — Program FAQ](https://docsearch.algolia.com/docs/docsearch-program) (atualizada em 18/mai/2026)
- [DocSearch — What is DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch)
- [DocSearch — Run your own (legacy)](https://docsearch.algolia.com/docs/legacy/run-your-own/)
- [Algolia — DocSearch Plan Terms and Conditions](https://www.algolia.com/policies/docsearch-plan-specific-terms) (vigentes desde 24/jul/2026)
- [Algolia — Pricing](https://www.algolia.com/pricing)
- [Algolia — Crawler login configuration](https://www.algolia.com/doc/tools/crawler/apis/configuration/login)
- [algolia/docsearch-scraper](https://github.com/algolia/docsearch-scraper) (README: DEPRECATED; sem commit desde abr/2024)
- [Docker Hub — algolia/docsearch-scraper](https://hub.docker.com/r/algolia/docsearch-scraper) (última imagem: 21/jun/2021)
- [algoliasearch-client-javascript — `getDefaultHosts()`](https://github.com/algolia/algoliasearch-client-javascript/blob/main/packages/client-search/src/searchClient.ts)
- Tarballs npm inspecionados: `@docusaurus/preset-classic@3.10.2`, `@docusaurus/theme-search-algolia@3.10.2`, `@docusaurus/theme-translations@3.10.2`, `@docsearch/css@4.7.0`, `@docsearch/css@3.9.0`, `@docsearch/react@4.7.0`

**Issues e PRs do Docusaurus**

- [#4542 — [i18n] Making everything translatable](https://github.com/facebook/docusaurus/issues/4542) (aberta)
- [#4723 — i18n no defaultLocale fallback handling](https://github.com/facebook/docusaurus/issues/4723) (fechada)
- [#8677 — `DOCUSAURUS_CURRENT_LOCALE` (temporary i18n workaround)](https://github.com/facebook/docusaurus/pull/8677)

**Dissecção das referências em produção** (HTML servido, agosto de 2026)

- [FastMCP](https://gofastmcp.com/getting-started/welcome) · [Devin](https://docs.devin.ai/get-started/devin-intro) · [Perplexity](https://docs.perplexity.ai/getting-started/quickstart) · [Vapi](https://docs.vapi.ai/assistants/examples/docs-agent) · [Neon](https://neon.com/docs/introduction) · [Clerk](https://clerk.com/docs/nextjs/getting-started/quickstart) · [Trigger.dev](https://trigger.dev/docs/realtime/overview)
