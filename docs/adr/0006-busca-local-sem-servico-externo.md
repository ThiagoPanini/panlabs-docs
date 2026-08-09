# ADR 6 — A busca é índice local no repositório, sem serviço externo

**Status:** aceito · slice 7 · 2026-08-08

## Contexto

Documentação sem busca é documentação que só serve a quem já sabe onde a coisa está. E busca é a superfície onde a resposta óbvia do ecossistema Docusaurus — `@docusaurus/theme-search-algolia`, com DocSearch — colide de frente com os dois axiomas mais duros deste projeto.

**O alvo de replicação é um ambiente corporativo onde o espaço de dependências é apertado e a rede é fechada.** Não é hipótese confortável: é a premissa que escolheu o Docusaurus, escolheu `vanilla-first` e escolheu o preset `classic`. Uma busca que exige um serviço de terceiro obriga, no transplante, três conversas que este projeto existe para não ter:

| Conversa | Com quem | Por quê |
| --- | --- | --- |
| Dependência npm nova | comitê de arquitetura | `@docusaurus/theme-search-algolia` mais o `@docsearch/react` que ele traz |
| Egresso de rede para um terceiro | segurança de rede | o cliente faz requisição ao índice hospedado, em toda tecla |
| Conteúdo indexado fora do perímetro | jurídico | o crawler lê a documentação e a hospeda num índice de terceiro |

A terceira é a que mata. Documentação interna de produto financeiro não sai do perímetro para ser indexada por ninguém, e nenhuma quantidade de argumento técnico move essa linha.

## Decisão

**A busca é um índice local, construído no build, servido como dado global do próprio bundle. Zero dependência npm, zero serviço externo, zero requisição de rede em tempo de leitura.**

O índice é um plugin de caminho — `src/plugins/busca/` — e a interface é o `SearchBar` ejetado, degrau 5 da escada do [ADR 2](0002-politica-de-swizzle.md).

### As três consequências que a decisão pina

**a) O índice viaja como dado global, não como JSON no `outDir`.** A alternativa — `postBuild` gravando um arquivo e o cliente buscando com `fetch()` — tem um modo de falhar invisível: sob SPA, uma rota ausente devolve **200 com o shell do site**, então o `fetch().json()` estoura em erro de *parse*, não em 404. Ninguém liga um erro de parse a um arquivo que não foi escrito.

Dado global também é o que faz a busca funcionar em `docusaurus start` — o bundle existe no servidor de desenvolvimento. **Nenhum plugin de busca do ecossistema oferece isso**, e é consequência direta da escolha, não um recurso a mais.

**b) A fonte é o MDX, não o HTML renderizado.** Isso dispensa `cheerio` — que seria a dependência que a decisão existe para não ter — e faz as 24 páginas geradas da Referência da API entrarem pelo mesmo caminho das 43 autorais: uma página gerada é um `.mdx` em disco como qualquer outra.

**c) Teto de 64 KB serializados, autoenforçado pelo plugin.** É **teto, não meta**, e ele **não acrescenta portão de CI**: o próprio build reprova ao ultrapassar. O motivo é mecânico — o índice viaja no bundle principal de toda página do site, e um índice que cresce sem limite vira lentidão difusa que ninguém atribui à busca.

*Medido nesta implementação:* 35,6 KB para 73 páginas. A folga é de 45%.

## O preço, e ele é real

**A busca é por substring normalizada, não por relevância estatística.** Não há stemming, não há tolerância a erro de digitação, não há sinônimo, não há ranqueamento por clique. Um leitor que digita `webhoook` não acha nada, e um que digita `pagamento` não acha a página que só fala em `cobrança`.

O que compra parte disso de volta, e é a parte que importa aqui: **normalização de caixa e de diacrítico nos dois lados**. `conciliacao` acha `Conciliação` e `idempotencia` acha `Idempotência` — que é o erro mais comum do leitor brasileiro, e o único que uma busca de substring consegue perdoar de graça.

**Setenta e três páginas é a escala em que essa troca é boa.** Numa documentação de dois mil documentos ela deixa de ser: o índice estoura o teto muito antes, e busca por substring sobre dois mil títulos devolve ruído. Este ADR vale para a ordem de grandeza deste site, e a nota de migração abaixo é o que ele deixa escrito para quem chegar na outra.

## A nota de migração — três edições

Para quem **tem** internet e **pode** indexar fora do perímetro, o caminho de volta ao DocSearch é curto de propósito. A arquitetura não amarrou ninguém:

1. `npm i @docusaurus/theme-search-algolia` e o tema na lista de `themes` da config;
2. `themeConfig.algolia` com `appId`, `apiKey` e `indexName`;
3. **remover `['./src/plugins/busca', …]` de `plugins` e apagar `src/theme/SearchBar/`.**

A terceira é a única que exige entender o projeto, e ela é uma linha e um diretório. O `SearchBar` do tema Algolia assume o nome `@theme/SearchBar` que o nosso ocupa — tirar o nosso do caminho é literalmente tudo.

**E há o caminho do meio, que fica registrado sem ser recomendado:** o DocSearch tem modo *self-hosted*, com o crawler e o Meilisearch (ou o Typesense) dentro do perímetro. Ele resolve a conversa jurídica e a de rede, e não resolve a de dependência — troca uma dependência npm por um serviço a operar. Para setenta e três páginas isso é caro; para dois mil, é o desenho certo.

## O que a decisão NÃO comprou

**Ela não é uma posição contra o Algolia.** O DocSearch é gratuito para documentação aberta, é bom, e é o que este site usaria se o alvo de replicação fosse outro. O que a decisão diz é que **a spec precisa ser transplantável para um ambiente onde ele não pode entrar** — e uma spec que só funciona com rede aberta não é a spec deste projeto.

## Dissenso registrado

- **Um plugin de busca local de terceiro** — há vários no ecossistema, e o mais usado indexa o HTML construído com `cheerio` e serve um índice `lunr`. Ele resolveria isto com menos código nosso. Recusado pelo **axioma 2**, e a recusa não é dogmática: os dois plugins deste slice somam menos de 300 linhas, e a alternativa traz uma árvore de dependências que o comitê de arquitetura corporativo audita. Trezentas linhas nossas, auditáveis num café, ganham.
- **Indexar o HTML em vez do MDX** daria um texto mais fiel ao que o leitor vê — inclusive o conteúdo que os componentes do catálogo geram. Recusado porque custaria `cheerio` e porque perderia `docusaurus start`, onde não há HTML construído. O que se perde é pequeno: o catálogo renderiza o texto que já está no MDX, não texto novo.
- **Busca com ranqueamento de verdade** — TF-IDF, BM25 — cabe em cem linhas e melhoraria o resultado em consultas de várias palavras. Recusada porque a escada de degraus é **explicável em prosa e conferível por teste**, e um score estatístico não é nenhum dos dois. Numa base de dois mil documentos essa recusa se inverte.
- **`/` como segundo atalho**, que é convenção forte. Recusado: exige uma guarda de *"estou dentro de um campo?"*, e o modo de falhar dessa guarda é invisível — o leitor digita uma barra num formulário e o modal abre por cima do que ele estava escrevendo.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Índice local, sem serviço externo | origem própria | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19); o motivo jurídico e de rede é do alvo de replicação |
| Dado global em vez de JSON no `outDir` | **origem própria (verificação)** | rota ausente devolve 200 com o shell da SPA, e `fetch().json()` estoura em parse |
| `allContentLoaded` em vez de `contentLoaded` | **origem própria (correção)** | medido em `server/plugins/actions.js@3.10.2`: os dois ganchos recebem o mesmo objeto de ações, e só `allContentLoaded` enxerga o conteúdo das outras instâncias |
| A fonte é o MDX | origem própria | consequência do axioma 2 — indexar HTML custaria `cheerio` |
| Teto de 64 KB autoenforçado | origem própria | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) — teto, não meta, e sem portão novo |
| Normalização NFD nos dois lados | origem própria | o erro mais comum do leitor brasileiro |
| Nota de migração de três edições | origem própria | a arquitetura não amarra; o custo de sair vai escrito |
| `⌘K` / `Ctrl K` e nada mais | herdado | as quatro referências medidas usam o mesmo atalho |
