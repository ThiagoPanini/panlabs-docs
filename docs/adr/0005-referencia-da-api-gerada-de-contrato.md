# ADR 5 — A Referência da API é gerada de contrato OpenAPI

**Status:** **superado** pelo [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) · aceito · slice 5 · 2026-08-07

> ### Superado — a decisão sobreviveu, a premissa não
>
> **Leia como registro histórico.** O que decide hoje é o
> [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md).
>
> **O que sobreviveu, e está no ar:** gerar a referência de um contrato, com dois
> arquivos monolíngues congruentes, JSON puro e zero dependência de parser;
> validador com lista fechada de recusas, cada uma apontando o JSON Pointer do nó
> ofensor; saída `.mdx` commitada e não editável à mão; o painel comutado por
> front matter; e o portão 5 como regeneração mais `git diff --exit-code`.
>
> **O que morreu:** a premissa inteira. Não há API de pagamentos, não há serviço
> HTTP, não há OpenAPI 3.1, não há `paths` nem `components`, não há
> `scripts/gerar-api.mjs` nem `sidebars-api.js`, e o `VerbBadge` saiu do catálogo
> por não ter sobrado verbo para pintar. O contrato passou a descrever
> **assinatura de função, tipo e módulo**.
>
> **Por que superado e não editado.** Os ADRs deste repo são numerados e
> **imutáveis** (`README.md`). Um documento cuja premissa e cujo **título** são
> falsos não é o mesmo documento — e a imutabilidade existe exatamente para
> preservar o registro de *"decidimos OpenAPI uma vez, e por quê"*. O conteúdo
> abaixo fica intacto.

## Contexto

A Referência da API tem trinta páginas — cinco objetos e dezenove endpoints,
nos dois locales — descrevendo uma superfície de seis recursos. Escrevê-las
à mão criaria exatamente a segunda fonte de verdade que o resto do projeto
recusa em toda parte: o campo `valor` de `Cobrança` já existe no domínio
(`conteudo/documentacao/meios-de-pagamento/cartao.md`), e escrever de novo o
tipo, a obrigatoriedade e a descrição dele numa página de referência é
convidar as duas cópias a divergirem no primeiro editor que mexer numa e
esquecer da outra.

O ecossistema Docusaurus tem plugins prontos para este problema —
`docusaurus-plugin-openapi-docs` é o mais usado. Nenhum foi adotado: são
dependência nova contra o axioma 2, e a régua deste repo é replicabilidade
num ambiente corporativo de espaço de dependência apertado — "spec sem
dependência é spec transplantável". A alternativa que sobra é escrever o
gerador.

## Decisão

### a) Dois contratos JSON, um por locale — nunca um bilíngue

`contratos/trilho.pt-BR.json` e `contratos/trilho.en.json`, OpenAPI 3.1,
estruturalmente congruentes — mesmos `paths`, mesmos `schemas`, mesmos
tipos, divergindo só em `description`/`summary`. Um contrato bilíngue (um
campo `pt`/`en` dentro de cada `description`, por exemplo) produziria JSON
que nenhuma ferramenta de OpenAPI padrão lê — e transplantabilidade do
contrato é tão parte do produto quanto transplantabilidade do site.

**JSON, nunca YAML.** O parser inteiro do gerador é `JSON.parse` — zero
dependência, contra o axioma 2. Aceitar YAML custaria uma dependência
(`js-yaml` ou equivalente) só para comprar um formato mais confortável de
editar à mão, e o contrato não é editado com essa frequência a ponto de a
troca compensar. O validador recusa YAML como consequência direta desta
escolha, não como regra em separado.

### b) O gerador é script fora do build, rodado à mão, saída commitada

`scripts/gerar-api.mjs` não entra no `docusaurus.config.js` — nenhum plugin,
nenhum hook de build. Ele lê os dois contratos, valida, e escreve `.mdx` em
`conteudo/api-reference/` e `i18n/en/docusaurus-plugin-content-docs-api/current/`,
mais `sidebars-api.js`. A saída é **commitada** e entra no diff, como
qualquer página autoral — a instância `api` a lê exatamente como lê MDX
escrito à mão, sem plugin próprio de content-loading.

Isso é mais vanilla que a rota vanilla: onde um plugin de terceiro
adicionaria uma dependência de build e uma etapa de geração invisível no
diff, este gerador produz texto revisável, e o build nunca falha por causa
dele — ele já rodou antes do commit.

**A saída não é editável à mão.** Cada arquivo gerado carrega um comentário
de front matter dizendo isso, e a extensão `.mdx` — diferente do `.md` de
toda página autoral do site — é o segundo sinal, greppável e visível na
árvore de arquivos sem abrir nenhum deles.

### c) O validador recusa alto, com JSON Pointer do nó ofensor

`scripts/lib/openapi.mjs` recusa: YAML (indiretamente, via `JSON.parse`),
`$ref` externo, schema circular (DFS sobre o grafo de `components.schemas`),
Swagger 2.0, `oneOf`/`anyOf` com `discriminator`, `callbacks` e `webhooks`,
`multipart/form-data` e upload, aninhamento acima de quatro níveis, mais de
quatro respostas por operação, `description` ausente em qualquer nó, e
linguagem de snippet fora de `themeConfig.prism.additionalLanguages`. Cada
recusa aponta o JSON Pointer (RFC 6901) do nó — nunca ignora em silêncio.

**O teto de aninhamento é quatro, e ele é calibrado, não redondo.**
`cobranca.pagamento.cartao.verificacoes` — já escrito à mão no domínio,
antes deste slice — tem exatamente quatro; um quinto nível reprova antes de
virar página ilegível. A contagem reseta para 1 quando um `$ref` alcança um
schema nomeado, mesmo que o `$ref` esteja embutido mais fundo (dentro do
envelope de uma listagem paginada, por exemplo) — o teto é sobre a forma
interna de **um** objeto documentado, não sobre a profundidade acidental de
onde ele foi referenciado. Sem esse reset, o mesmo `Cobrança` teria um
orçamento de aninhamento diferente em `GET /cobrancas/{id}` e dentro do
`dados` de `GET /cobrancas` — o mesmo defeito que motivou a correção
registrada no ledger do próprio gerador.

### d) O painel é front matter, não marcador em MDX

`api_exemplos` no front matter da página de endpoint — nunca um marcador
solto no corpo. Um marcador obrigaria o painel a nascer irmão de grid dos
parágrafos, e `position: sticky` precisa de um ancestral com contexto de
rolagem previsível, não de uma posição arbitrária que o fluxo do MDX
decidiu. O valor do campo é o `JSON.stringify` do objeto — JSON é
subconjunto de YAML de fluxo, então nenhum emissor de YAML precisou ser
escrito para produzir front matter válido.

## Consequências

1. **Editar um endpoint significa editar o contrato, nunca a página.** Um
   revisor de conteúdo lê `contratos/trilho.pt-BR.json`, não MDX — é uma
   inversão real de onde a revisão acontece, e ela é o preço de ter uma
   fonte só.
2. **O portão 5 é o único do conjunto que não é `grep`.** Ele roda o
   gerador de novo e reprova em `git diff --exit-code` — um gerador
   determinístico rodado duas vezes sobre o mesmo contrato produz bytes
   idênticos; se não produzir, o contrato mudou sem o gerador rodar, ou
   alguém editou a saída à mão.
3. **Snippet de código nunca aparece no corpo da página de endpoint.** Todo
   bloco vive no painel — é consequência de (d), e é a décima perda nomeada
   da rota (docs/design/api-reference.md): a página de endpoint é a única
   do site sem cartão nem breakout, por aritmética de grid, não por gosto.
4. **Adicionar um recurso novo ao contrato é adicionar `RECURSOS` no
   gerador.** A ponte entre a tag do contrato e a pasta/ícone/sidebar é uma
   tabela de cinco linhas — o gerador não infere pasta ou ícone do nome da
   tag, porque inferir criaria uma segunda regra de nomenclatura implícita
   ao lado do manifesto de ícones explícito que o resto do site já usa.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| Contrato bilíngue num arquivo só | Produz JSON que nenhuma ferramenta de OpenAPI lê; quebra a transplantabilidade do contrato |
| YAML em vez de JSON | Custaria uma dependência de parser contra o axioma 2, por conforto de edição que não paga o preço |
| Plugin de terceiro (`docusaurus-plugin-openapi-docs` e afins) | Dependência nova; a rota vanilla deste projeto é mais vanilla que a rota vanilla do ecossistema |
| Gerar em build time, sem commitar a saída | O build nunca deveria falhar por bug do gerador; saída commitada é revisável no diff como qualquer página |
| Marcador de painel solto no corpo do MDX | Obrigaria o painel a ser irmão de grid dos parágrafos, o que quebra `position: sticky` |
| Contagem de aninhamento que não reseta em `$ref` | O mesmo schema nomeado teria orçamento de profundidade diferente dependendo de onde foi embutido — sinal de acidente, não de estrutura |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Dois contratos, nunca bilíngue | origem própria | issue #38, critério de aceite |
| JSON em vez de YAML | origem própria (implementação) | consequência direta do axioma 2 — zero dependência de parser |
| Gerador fora do build, saída commitada | origem própria | issue #38 — "mais vanilla que a rota vanilla" |
| `.mdx` como sinal de "gerado, não editar" | origem própria (implementação) | mesma doutrina do marcador `<Untranslated />` — convenção de uma linha, greppável |
| O validador e a lista de recusas | origem própria | issue #38, critério de aceite |
| O teto de quatro níveis, calibrado em `cobranca.pagamento.cartao.verificacoes` | delta deliberado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §5 — três é o limite medido; a fixture do domínio precisa de quatro |
| O reset de nível em `$ref` para schema nomeado | origem própria (correção) | medido implementando o gerador: sem o reset, o mesmo objeto lia com orçamentos de aninhamento diferentes em duas páginas |
| `api_exemplos` em front matter, não marcador em MDX | origem própria | `position: sticky` exige ancestral com contexto de rolagem previsível |
| Portão 5 como regeneração mais diff | origem própria | é o único portão que não é varredura de texto — o gerador é determinístico, e diff é a checagem que essa propriedade compra |
