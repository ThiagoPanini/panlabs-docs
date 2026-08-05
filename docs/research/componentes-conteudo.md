# Componentes de conteúdo: o conjunto Mintlify, medido para reconstrução

> Pesquisa da issue [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4). Medições de 2026-08-04 e 2026-08-05.
> Escopo: **o que o autor de documentação escreve dentro do MDX**. O chrome (navbar, sidebar, TOC, busca, footer) é outro ticket e está fora daqui.

## Por que este documento tem o Mintlify como espinha

A pergunta original era comparativa — o que as sete referências oferecem ao autor. Duas descobertas colapsaram a comparação num alvo único, e o documento foi reescrito em torno dele:

1. **Quatro das sete referências são o mesmo site, esteticamente.** FastMCP, Devin, Perplexity e Trigger.dev são Mintlify, e outra pesquisa deste mapa mediu que os quatro hosts **servem o mesmo CSS byte a byte — MD5 idêntico**. Não é "parecido": é o mesmo arquivo. O que distingue os quatro não é o sistema visual, é a marca (`--primary`) e quais componentes cada equipe usa.
2. **O dono do projeto escolheu.** FastMCP, Devin e Perplexity são os layouts que mais lhe agradaram. O alvo estético do shinydoc é o conjunto de componentes do Mintlify, confirmado por preferência humana — não por dedução da pesquisa.

Então este documento não pesa alternativas. Ele mede **a anatomia dos componentes do Mintlify com precisão suficiente para reimplementá-los em Docusaurus vanilla**: estrutura de DOM, classes emitidas, slots e props, sintaxe de autoria em MDX, variantes, e o comportamento em claro e escuro com valores medidos.

Vapi, Neon e Clerk sobrevivem numa seção curta no fim, restrita a **componentes que eles têm e o Mintlify não** — o que vale considerar, não o inventário deles.

## Método e força das fontes

Ordem de força usada, da mais forte para a mais fraca:

1. **O HTML e o CSS servidos em produção.** Dá o DOM real, as classes emitidas e o valor medido — raio, cor, espaçamento, alfa. É o que atende o axioma 5 (*medição, não invenção*) e é a fonte primária dominante deste documento.
2. **O MDX fonte no repositório público.** Mostra literalmente o que o autor digita, e permite contar frequência de uso.
3. **O código do componente** (React/TSX) no repo do site ou da plataforma. Dá props exatas, obrigatoriedade e defaults.
4. **A documentação oficial da plataforma** sobre o componente.

Cada afirmação carrega a fonte. O que não foi confirmado está marcado como tal, em vez de preenchido por inferência.

Nota sobre as classes citadas: o Mintlify emite Tailwind. Reproduzir as classes **não** é a entrega — reproduzir os **valores** que elas representam é. Onde a classe esconde um número que importa, o número está escrito por extenso.

## As sete referências e suas plataformas

Impressão digital tirada do HTML servido (`curl` direto, contando marcadores de plataforma):

| Referência | Plataforma | Evidência no HTML servido | Papel nesta pesquisa |
| --- | --- | --- | --- |
| **FastMCP** | Mintlify | `mintcdn`, `data-component-part="callout-icon\|card-title\|code-block-root"` | **alvo estético** |
| **Devin** | Mintlify | `mintcdn`, `data-component-part="callout-icon\|card-title\|frame-caption"` | **alvo estético** |
| **Perplexity** | Mintlify | `mintcdn`, `data-component-part="accordion-*\|step-*\|code-group-tab-bar\|card-cta"` | **alvo estético** |
| **Trigger.dev** | Mintlify | `mintcdn`, `data-component-part="scroll-area\|pagination-*"` | mesmo sistema; fonte de uso real |
| **Vapi** | **Fern** | **710** ocorrências de classes `fern-*` (`fern-callout`, `fern-card`, `fern-steps`, `fern-code-block`) | só o delta |
| **Neon** | Next.js próprio | `_next/static`; **zero** marcadores de Mintlify, Fern ou Docusaurus | só o delta |
| **Clerk** | Next.js próprio | `_next/static`; **zero** marcadores de Mintlify, Fern ou Docusaurus | só o delta |

Sobre o Vapi: a página contém oito menções à palavra "mintlify", mas todas são **links de saída** num trecho sobre ingestão por IA — não são marcadores de plataforma. Contra 710 classes `fern-*`, o veredito é inequívoco. Vale a atenção porque é exatamente o tipo de falso positivo que uma busca por palavra-chave produziria.

Um achado lateral que não estava na pergunta mas importa: **a Neon serve Markdown puro para user agents que não são navegador**. `curl` sem `User-Agent` de browser devolve 5 KB de Markdown com um cabeçalho apontando para `neon.com/docs/llms.txt`; com `User-Agent` de Chrome, devolve 398 KB de HTML. É negociação de conteúdo deliberada para agentes.

O mesmo mecanismo, aliás, é o que torna o Mintlify barato de auditar: **qualquer página Mintlify devolve o MDX fonte se você acrescentar `.md` à URL**. É por isso que a contagem de uso adiante é confiável mesmo em sites sem repositório público.



## Uso real: o que os três alvos estéticos realmente escrevem

Catálogo disponível e catálogo usado são coisas diferentes, e a diferença aqui é brutal — **metade do catálogo do Mintlify tem uso zero**. Como o alvo do projeto são as páginas que agradaram, e não o catálogo teórico, esta seção pesa mais que a lista de componentes.

Método: todo site Mintlify publica `llms.txt` com o índice de páginas, e toda URL devolve o **MDX fonte** quando se acrescenta `.md`. Devin e Perplexity foram varridos **integralmente** — 100% do índice publicado. FastMCP e Trigger.dev foram lidos do repositório. Em todas as contagens, cercas de código e código inline foram removidos antes de contar, então nada aqui vem de exemplo dentro de bloco.

| Site | Páginas no índice | Amostradas | Geradas de OpenAPI | MDX autorais |
| --- | ---: | ---: | ---: | ---: |
| Devin | 553 | 552 | 269 | 284 |
| Perplexity | 187 | 187 | 21 | 166 |
| FastMCP (repo) | 419 | 419 | 51 | 147 na v4 corrente |
| Trigger.dev (repo) | 371 | 371 | — | 371 |

### Devin — 553 páginas

| Componente | Arquivos | Usos |
| --- | ---: | ---: |
| `Frame` | 92 | 419 |
| `Note` | 182 | 356 |
| `Card` | 56 | 281 |
| `Accordion` | 45 | 473 |
| `Update` | 12 | 797 |
| `Step` | 18 | 147 |
| `Warning` | 73 | 112 |
| `Tip` | 71 | 110 |
| `Tab` | 32 | 110 |
| `CardGroup` | 40 | 73 |
| `ParamField` | 10 | 65 |
| `AccordionGroup` | 39 | 61 |
| `Info` | 37 | 56 |
| `ResponseField` | 7 | 51 |
| `Steps` | 18 | 37 |
| `Tabs` | 32 | 37 |
| `Icon` | 7 | 25 |
| `Expandable` | 4 | 11 |
| `Check` | 2 | 8 |
| `CodeGroup` | 1 | 5 |

Os números de `Update` e `Accordion` são inflados por changelogs gerados: 77% dos usos de `Update` estão em 4 arquivos, 52% dos de `Accordion` em 2. Descontando-os, a ordem real por volume é `Frame` 419 · `Note` 355 · `Card` 280 · `Accordion` 225 · `Update` 185 · `Step` 147.

### Perplexity — 187 páginas

| Componente | Arquivos | Usos |
| --- | ---: | ---: |
| `Card` | 98 | 432 |
| `CodeGroup` | 76 | 303 |
| `Accordion` | 55 | 235 |
| `Step` | 34 | 177 |
| `Tab` | 28 | 143 |
| `Info` | 86 | 133 |
| `CardGroup` | 93 | 108 |
| `Warning` | 67 | 96 |
| `Tip` | 65 | 91 |
| `Note` | 40 | 63 |
| `Tabs` | 28 | 58 |
| `Steps` | 34 | 51 |
| `Update` | 1 | 41 |
| `AccordionGroup` | 20 | 36 |
| `Frame` | 5 | 17 |
| `Icon` | 1 | 14 |
| `Check` | 7 | 10 |
| `Columns` | 2 | 7 |

Ao contrário do Devin, aqui o uso é uniformemente distribuído — nenhuma página domina a contagem.

### FastMCP — `PrefectHQ/fastmcp`, `docs/`, 419 arquivos `.mdx`

O repo `jlowin/fastmcp` redireciona para `PrefectHQ/fastmcp`. `docs/docs.json` declara `"$schema": "https://mintlify.com/docs.json"` e `"theme": "almond"`.

A pasta contém arquivo morto versionado (81 mdx em `v2/`, 140 em `v3/`, 51 auto-gerados em `python-sdk/` — este último declarado como auto-gerado em `fastmcp/tests/docs/test_doc_examples.py`). **Filtrando para a doc v4 corrente (147 arquivos)**, o ranking por número de arquivos que usam o componente:

| Componente | Arquivos (v4) | Observação |
| --- | ---: | --- |
| `VersionBadge` **(próprio)** | 110 | wrapper de `Badge`; ver adiante |
| `Note` | 62 | |
| `Tip` | 53 | |
| `Warning` | 52 | |
| `Card` | 18 | |
| `Steps`/`Step` | 16 | |
| `Info` | 13 | |
| `CodeGroup` | 13 | |
| `ParamField` | 9 | mas **173 usos** — densidade altíssima por página |
| `Frame` | 7 | |
| `Prompt` | 6 | |
| `ResponseField` | 5 | |
| `Expandable` | 4 | |
| `Update` | 2 | **149 usos** — changelog |
| `CardGroup`, `Tile`, `Columns`, `Tabs`, `Badge` | 1 cada | |

### Trigger.dev — `triggerdotdev/trigger.dev`, `docs/`, 371 arquivos `.mdx`

`docs/docs.json` declara o mesmo schema Mintlify, `"theme": "maple"`.

| Componente | Arquivos | Usos |
| --- | ---: | ---: |
| `Note` | 110 | 237 |
| `Card` | 61 | 190 |
| `CodeGroup` | 49 | 68 |
| `Warning` | 47 | 72 |
| `Steps`/`Step` | 43 | 65 / 211 |
| `CardGroup` | 31 | 41 |
| `Tip` | 25 | 40 |
| `ParamField` | 23 | 197 |
| `Info` | 19 | 36 |
| `Accordion` | 13 | 27 |
| `Tabs`/`Tab` | 10 | 10 / 40 |
| `Icon` | 6 | 51 |
| `Expandable` | 6 | 28 |
| `ResponseField` | 4 | 87 |
| `AccordionGroup` | 3 | 5 |
| `Frame` | 1 | 5 |
| `Update`, `RequestExample`, `Callout` | 1 cada | |
| ~40 snippets próprios | 1–9 cada | |

### O que a frequência ensina

**O núcleo cabe em 17 componentes.** A interseção dos quatro sites é: `Note`, `Tip`, `Warning`, `Info`, `Check`, `Card`, `CardGroup`, `Steps`, `Step`, `Tabs`, `Tab`, `CodeGroup`, `Accordion`, `AccordionGroup`, `Frame`, `Update`, `Icon`. A união com a cauda longa chega a 21. **Isso é o escopo de trabalho.**

**Metade do catálogo do Mintlify tem uso zero.** Em 1.740 páginas somadas dos quatro sites, nenhuma ocorrência de: `Tooltip`, `Badge`, `Callout` (o genérico), `Danger`, `Tile`, `Panel`, `Tree`, `View`, `Visibility`, `Prompt`, `Banner`, `Color`, `RequestExample`, `ResponseExample`, `Mermaid` como componente. O `Tooltip` é o caso mais eloquente: está no catálogo, está no guia de autoria interno do FastMCP, **e nenhum autor o usou**. Nem inventaram substituto. Para o shinydoc, isso é escopo cortado com evidência, não com palpite.

**Callout ganha em alcance; Card e Frame ganham em volume.** `Note` aparece em 182 dos 553 arquivos do Devin — nenhum outro componente chega perto de tanta *dispersão*. Mas o maior número de *usos* é `Frame` (419) no Devin e `Card` (432) na Perplexity. São dois papéis distintos: o callout é o tempero que aparece em toda página, o card é o bloco que constrói páginas inteiras de hub.

**Dos seis tipos de callout, cinco existem e um não.** `Note`, `Tip`, `Warning`, `Info` e `Check` cobrem tudo; **`Danger` tem uso zero nos quatro sites**. E `Check` é marginal (2 arquivos no Devin, 7 na Perplexity). Cinco variantes bastam, e uma delas quase não é usada.

**A densidade importa mais que o alcance.** `ParamField` aparece em poucos arquivos e é usado dezenas ou centenas de vezes; `Update` idem — 12 arquivos e 797 usos no Devin. São componentes de página de referência, não de guia. A exigência deles é consistência tipográfica sob repetição, não versatilidade.

**Duas casas, duas soluções para o mesmo problema.** Perplexity usa `CodeGroup` em 76 páginas / 303 vezes; Devin usa em **1 página / 5 vezes**, e resolve multi-linguagem com `Tabs`+`Tab`. Ou seja, `CodeGroup` e `Tabs` competem pelo mesmo caso de uso — vale saber disso antes de construir os dois.

### As props que realmente são usadas

Isto define a superfície mínima da API. Percentuais sobre o total de usos de cada componente.

| Componente | Devin | Perplexity |
| --- | --- | --- |
| `Card` | `title` 100%, `icon` 95%, `href` 65%, `horizontal` 13% | `title` 100%, `icon` 96%, `href` 92%, `cta` 7%, `iconType` 7%, `horizontal` 6%, `arrow` 6% |
| `CardGroup` | `cols` **100%** | `cols` **100%** |
| `Accordion` | `title` 100%, `icon` 10%, `description` 3%, `defaultOpen` 1% | `title` 100%, `description` 6%, `icon` 2% |
| `Step` | `title` **100% e nada mais** | `title` **100% e nada mais** |
| `Tab` | `title` **100% e nada mais** | `title` **100% e nada mais** |
| `Update` | `label` 100%, `description` 81% | `label` 100%, `tags` 100% |
| `Frame` | majoritariamente **sem props**; `caption` 6% | `caption` 18% |
| `ParamField` | `body`+`type` 100%, `required` 37% | — (API vem de OpenAPI) |
| `Steps`, `Tabs`, `CodeGroup`, `AccordionGroup` | **sempre sem props** | **sempre sem props** |
| `Note`/`Tip`/`Warning`/`Info`/`Check` | **sempre sem props** (1 exceção) | **sempre sem props** |

Cinco leituras que economizam trabalho:

1. **Os wrappers não têm props.** `Steps`, `Tabs`, `CodeGroup` e `AccordionGroup` nunca recebem nada. `titleSize` em `Steps` — a prop que a documentação do Mintlify destaca — tem **zero ocorrências nos dois sites**.
2. **`Step` e `Tab` só precisam de `title`.** Nada mais foi usado, nunca.
3. **`CardGroup` sempre declara `cols`.** Nenhum autor confiou no default.
4. **Os callouts são só filhos.** Um componente de admonition com cinco variantes e nenhuma prop resolve 100% do uso real — o que torna o `title` opcional (discutido adiante) uma adição deliberada, não uma paridade.
5. **`ParamField` do Devin usa `body=`, nunca `query`/`path`/`header`.** A posição do parâmetro, que o Mintlify trata como eixo central da API, na prática colapsa num só valor.

### Como os componentes se aninham de verdade

Composições observadas, com contagem — define o que precisa funcionar dentro do quê:

- **Devin**: `CardGroup > Card` 238 · `AccordionGroup > Accordion` 215 · `Steps > Step` 147 · `Tabs > Tab` 105 · `Tab > Frame` 52 · `Step > Frame` 47 · `Expandable > ParamField` 21 · `Expandable > ResponseField` 20 · **`ResponseField > ResponseField` 16 (recursivo)** · `Card > Check` 7 · `Card > Warning` 5.
- **Perplexity**: `CardGroup > Card` 371 · `Steps > Step` 177 · `Tabs > Tab` 143 · `AccordionGroup > Accordion` 118 · `Step > CodeGroup` 18 · `Columns > CodeGroup` 14 · `Tab > CodeGroup` 11 · `Step > Tabs` 11 · `Accordion > Steps` 4.

Profundidade máxima observada: **4 níveis** — `Steps > Step > Tabs > Tab > cerca de código`, e `ParamField > Expandable > ParamField > Expandable`.

Duas consequências de projeto. **O `Card` não é só um link — é um container de conteúdo**: o Devin embute `Check` e `Warning` dentro dele. E **`ResponseField` precisa ser recursivo**, porque um objeto de resposta contém objetos de resposta.

### O bloco de código: quase nenhum recurso é usado

Contagem de opções de metastring nas cercas, sobre 1.036 cercas no Devin e 1.517 na Perplexity:

| Opção | Devin | Perplexity |
| --- | ---: | ---: |
| título nu (` ```python Python `) | 300 cercas / 279 arq. | 766 / 99 |
| `wrap` | **0** | 18 / 7 arq. |
| `expandable` | **0** | 5 / 4 arq. |
| `title="…"` | **0** | 1 |
| `lines` · `highlight=` · `focus=` · `icon=` · diff | **0** | **0** |

O que o autor escreve é **linguagem + um título nu**. Nada mais, praticamente. Numeração de linha, realce, foco e diff — os recursos que mais dão trabalho de implementar — têm **uso zero nos dois alvos estéticos**. Isso reordena a prioridade do bloco de código de forma drástica.

Linguagens mais frequentes — Devin: `yaml` 320, `bash` 221, `json` 211. Perplexity: `bash` 456, `python` 439, `typescript` 294, `json` 206.

**Armadilha a não copiar**: o sufixo `theme={null}` aparece em 606 de 606 cercas do Devin e 1.461 de 1.517 da Perplexity. **É artefato do exportador `.md` do Mintlify, não algo que o autor digitou.** Quem ler o MDX exportado sem saber disso replicará ruído.

**O guia de autoria não prevê o uso real.** O FastMCP mantém um guia (`docs/.cursor/rules/mintlify.mdc`, 364 linhas) que prescreve `Accordion`, `Tabs`, `RequestExample`/`ResponseExample` e `Tooltip` — usados 0, 4, 0 e 0 vezes na doc corrente. O Trigger.dev mantém um `docs/CLAUDE.md` que autoriza **8 componentes** (`Note`, `Warning`, `Info`, `Tip`, `CodeGroup`, `Expandable`, `Steps`/`Step`, `Card`/`CardGroup`) — e a lista bate quase perfeitamente com a realidade, com duas exceções em uso não previsto (`Accordion` em 13 arquivos, `ParamField`/`ResponseField` em 27). Lista curta e imposta funciona; lista longa e aspiracional não.

### Erros de autoria — o que quebra na prática

Achados que valem para desenhar a API dos componentes do shinydoc, porque mostram onde o autor **espera** algo que não existe:

| Erro | Onde | O que acontece |
| --- | --- | --- |
| `title` em callout tipado | `triggerdev/docs/guides/example-projects/vercel-ai-sdk-deep-research.mdx:9`, `snippets/step-cli-init.mdx:26` | Prop ignorada. O autor **repetiu a palavra no corpo** (`Acknowledgements: …`) para compensar |
| `<Callout type="warning">` | `triggerdev/docs/mcp-tools.mdx:218,271` | `Callout` genérico não tem `type`. Renderiza **cinza neutro sem ícone** — o autor queria amarelo de aviso |
| `<Warn>` | `triggerdev/docs/deploy-environment-variables.mdx:60` | Componente não existe |
| `optional` em `ParamField`/`ResponseField` | Trigger.dev, ~30 usos | O schema só tem `required`. Prop ignorada |
| `date` em `<Update>` | `fastmcp/docs/changelog.mdx`, 3 usos | Prop não existe |

O padrão é claro: **o autor quer título no callout**. Duas equipes independentes tentaram, das duas formas possíveis, e nenhuma funcionou. O Fern acertou nisso e o Mintlify não. Se o shinydoc autora seu próprio callout, `title` opcional é a decisão de menor arrependimento.

### Duas invenções que valem registro

**`test="skip"` na cerca do bloco de código (FastMCP).** 49 usos. Não é Mintlify — é uma chave lida pela **suíte de testes da própria documentação**: `fastmcp/tests/docs/test_doc_examples.py` executa os blocos Python da doc em CI, e `test="skip"` desliga a verificação caso a caso. O Mintlify ignora a chave desconhecida. É a demonstração de que a metastring da cerca é um **canal de extensão barato** — cabe metadado que o renderizador ignora e outra ferramenta consome.

**`<Step>` importado de snippet (Trigger.dev).** Um passo de tutorial é uma unidade reutilizável:

```mdx
import CliInitStep from "/snippets/step-cli-init.mdx";

<Steps titleSize="h3">
  <Step title="Create a Trigger.dev account">…</Step>
  <CliInitStep />
  <CliDevStep />
</Steps>
```

E `step-cli-init.mdx` é literalmente um `<Step>` completo, com `<CodeGroup>` e `<Tip>` dentro, reusado em 8 páginas. Isso só funciona porque `Steps` aceita qualquer children, não uma lista tipada de `Step`. É uma restrição de design a copiar: **não validar o tipo dos filhos**.



## O vocabulário padrão do Mintlify

Este é o gabarito contra o qual se mede o que é "de fábrica" e o que é invenção da casa. Lista completa da seção Components da documentação oficial ([mintlify.com/docs/components](https://mintlify.com/docs/components)):

| Componente | Papel declarado |
| --- | --- |
| `Tabs` / `Tab` | Alternar entre visões de conteúdo relacionado |
| `CodeGroup` | Exemplos de código em várias linguagens |
| `Steps` / `Step` | Instruções sequenciais numeradas |
| `Columns` / `Column` | Conteúdo lado a lado, responsivo |
| `Panel` | Painel lateral direito para conteúdo suplementar |
| `Note` `Warning` `Info` `Tip` `Check` `Danger` `Callout` | Destaque de informação |
| `Banner` | Anúncio fixo no topo da página |
| `Badge` | Rótulo inline / indicador de status |
| `Update` | Entrada de changelog com timeline e RSS |
| `Frame` | Moldura e legenda para imagem/vídeo |
| `Tooltip` | Informação adicional no hover |
| `Prompt` | Prompt de IA copiável |
| `Accordion` / `AccordionGroup` | Divulgação progressiva de conteúdo |
| `Expandable` | Revelar campos filhos de um objeto |
| `View` | Conteúdo condicional por seleção do leitor |
| `Visibility` | Conteúdo para humano vs. para agente de IA |
| `ParamField` / `ResponseField` | Definição de parâmetro e de campo de resposta |
| `Responses` / `RequestExample` / `ResponseExample` | Estrutura e exemplos de resposta de API |
| `Card` | Container destacado com ícone e link |
| `Tile` | Grade de blocos clicáveis com preview visual |
| `Icon` | Ícone inline (biblioteca Lucide) |
| Mermaid | Diagramas |
| `Color` | Amostra de cor com hex |
| `Tree` | Árvore de arquivos e pastas |

Duas ausências que importam: **não existe componente de tabela** — tabela é Markdown puro, com alinhamento por dois-pontos na linha separadora ([mintlify.com/docs/list-table.md](https://mintlify.com/docs/list-table.md)). E `CardGroup` está **deprecado em favor de `Columns`**, mantido só por compatibilidade; a migração é trocar o nome da tag, porque a prop `cols` é idêntica ([mintlify.com/docs/components/columns](https://www.mintlify.com/docs/components/columns)).

## Anatomia medida do canon Mintlify

O que segue não é leitura de documentação: é o DOM e as classes servidas em produção em `mintlify.com/docs` (o próprio site é Mintlify), extraídos em 2026-08-04. Atende o axioma 5. O Mintlify marca cada parte interna com `data-component-part`, o que entrega a anatomia sem ambiguidade — é o mapa de slots que o shinydoc precisa reproduzir.

### Callout

**Partes**: `callout-icon`, `callout-content`.
**Anatomia**: container `flex gap-3`, ícone à esquerda em coluna fixa, conteúdo à direita.
**Geometria medida**: `my-4 px-5 py-4 rounded-2xl border` — raio de 16px, padding 20px/16px. Ícone `mt-0.5 w-4` (16px, deslocado meio passo para baixo, para alinhar com a primeira linha de texto).
**Sinalização semântica** — a variante é comunicada por **borda + fundo tingido + ícone próprio**, nunca por barra lateral:

| Variante | Borda (claro) | Fundo (claro) | Borda (escuro) | Fundo (escuro) |
| --- | --- | --- | --- | --- |
| `Note` | `blue-200` | `blue-50` | `blue-900` | `blue-600/20` |
| `Warning` | `yellow-200` | `yellow-50` | `yellow-900` | `yellow-600/20` |
| `Info` | `neutral-200` | `neutral-50` | `neutral-700` | `white/10` |
| `Tip` | `green-200` | `green-50` | `green-900` | `green-600/20` |
| `Check` | `green-200` | `green-50` | `green-900` | `green-600/20` |
| `Danger` | `red-200` | `red-50` | `red-900` | `red-600/20` |
| `Callout` (custom) | `var(--callout-light-border-color, #71717a33)` | `var(--callout-light-bg-color, #7171711a)` | `var(--callout-border-color, #71717a4d)` | `var(--callout-bg-color, #7171711a)` |

Correlação verificada por casamento entre o texto renderizado de cada exemplo e a classe do seu container em [mintlify.com/docs/components/callouts](https://mintlify.com/docs/components/callouts). Note dois pontos: **`Tip` e `Check` são visualmente idênticos** (mesma paleta, ícones diferentes) — a distinção é só semântica; e **`Info` é neutro, não azul** — quem é azul é o `Note`, invertendo a convenção comum.

**Sintaxe de autoria**: os seis tipados aceitam **só `children`** — nenhuma prop. Só o `Callout` genérico aceita `icon`, `iconType` e `color` (hex, que pinta borda, fundo e texto de uma vez).

```mdx
<Note>This adds a note in the content</Note>
<Callout icon="key" color="#FFC107" iconType="regular">This is a custom callout</Callout>
```

### Card e grade de cards

**Partes**: `card-icon`, `card-title`, `card-content`, `card-image`, `card-cta`, `card-content-container`.

**DOM medido:**

```html
<div class="card block font-normal group relative my-2 ring-2 ring-transparent rounded-2xl
            bg-white dark:bg-background-dark border border-gray-950/10 dark:border-white/10
            overflow-hidden w-full cursor-pointer
            hover:border-primary! dark:hover:border-primary-light!"
     role="link" tabindex="0" aria-labelledby="…">
  <div data-component-part="card-content-container" class="px-6 py-5 relative">
    <!-- seta de link: escondida por padrão, acende na cor de marca no hover do card -->
    <div class="absolute top-5 right-5 hidden text-gray-400 dark:text-gray-500
                group-hover:text-primary dark:group-hover:text-primary-light">
      <svg class="m-0.5 size-3 shrink-0"><!-- seta diagonal --></svg></div>
    <div data-component-part="card-icon" aria-hidden="true"
         class="size-6 fill-gray-800 dark:fill-gray-100 text-gray-800 dark:text-gray-100 [&>svg]:size-6">
      <svg class="size-6 m-0! shrink-0 bg-primary dark:bg-primary-light"
           style="mask-image:url('…/lucide/v1.16.0/text-align-start.svg');mask-size:100%"></svg></div>
    <div class="w-full">
      <h2 data-component-part="card-title"
          class="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4">…</h2>
      <div data-component-part="card-content"
           class="prose mt-1 font-normal text-base leading-6 text-gray-600 dark:text-gray-400">…</div>
```

**Como sinaliza semântica**, medido:

- **O ícone é da cor de marca**, não cinza: o `<svg>` interno é `bg-primary dark:bg-primary-light` com `mask-image`. As classes cinza no wrapper (`fill-gray-800 dark:fill-gray-100`) são o fallback para quando o autor passa SVG cru. Esse é o detalhe que mais define a aparência do card nas referências.
- **O hover é a borda virando cor de marca** (`hover:border-primary!`), não sombra e não elevação. Nada se move.
- **A seta de link existe sempre e nasce `hidden`** — a prop `arrow` só a revela. Fica em `top-5 right-5` (20px), mede 12px, é cinza em repouso e acende na cor de marca no hover do card (`group-hover:`).
- `ring-2 ring-transparent` reservado na raiz é o espaço do anel de foco, pré-alocado para não deslocar layout quando o foco chega.
- Padding do conteúdo: **24px lateral, 20px vertical** (`px-6 py-5`). Título `font-semibold text-base`, corpo `text-base leading-6 text-gray-600 dark:text-gray-400`, com `mt-1` entre eles e `mt-4` entre ícone e título.
- Acessibilidade: a raiz é um `<div role="link" tabindex="0" aria-labelledby>`, **não um `<a>`**. É uma escolha discutível do Mintlify — um `<a>` real daria navegação e menu de contexto de graça. Ao reimplementar, vale divergir aqui.
**Variante tipada**: `type="info|warning|note|tip|check|danger"` faz o card **emprestar a paleta do callout** — mesmas classes de borda e fundo, e ainda re-tinge título e conteúdo (`[&_[data-component-part=card-title]]:text-blue-900`). É o mesmo sistema de cor servindo dois componentes.
**Props** ([mintlify.com/docs/components/cards](https://www.mintlify.com/docs/components/cards)): `title`, `icon`, `href`, `type`, `horizontal` (bool), `img`, `cta`, `arrow` (bool), `color`, `iconType`. Nenhuma é obrigatória.

**Grade** — `Columns`, prop única `cols` (número, default `2`, faixa 1–4). Classe medida: `columns grid gap-4 @2xl/columns-container:grid-cols-[repeat(var(--cols),minmax(0,1fr))] @[0px]/columns-container:grid-cols-1` — a contagem de colunas viaja por **CSS custom property** `--cols`, e o responsivo é **container query**, não media query, colapsando para uma coluna. A classe legada `card-group` continua no DOM.

```mdx
<Columns cols={2}>
  <Card title="Título" icon="lightbulb" href="/destino">Descrição</Card>
</Columns>
```

### Steps

**Partes**: `step-line`, `step-number`, `step-title`, `step-content`.
**Anatomia medida**, do DOM servido:

```html
<div role="list" class="steps ml-3.5 mt-10 mb-6">
  <div role="listitem" class="step group/step step-container relative flex items-start pb-5">
    <div data-component-part="step-line"
         class="absolute w-px h-[calc(100%-2.75rem)] top-11 bg-gray-200/70 dark:bg-white/10"></div>
    <div class="absolute ml-[-13px] py-2" data-component-part="step-number">
      <div class="group/step-indicator relative size-7 shrink-0 rounded-full bg-gray-50
                  dark:bg-white/10 text-xs text-gray-900 dark:text-gray-50 font-semibold
                  flex items-center justify-center">1</div>
    </div>
    …
  </div>
</div>
```

Os números que importam: a linha é de **1px** (`w-px`), começa em `top-11` (44px, exatamente abaixo do marcador) e tem altura `calc(100% - 2.75rem)` — ou seja, **conecta o fim de um marcador ao início do próximo, sem passar por trás dele**. O marcador é um círculo de **28px** (`size-7`) com numeral de 12px semibold e fundo sutil (`bg-gray-50` / `dark:bg-white/10`), puxado 13px para fora da coluna de conteúdo (`ml-[-13px]`) — metade do círculo cobre a linha. Semântica de acessibilidade explícita: `role="list"` no container e `role="listitem"` em cada passo. Título `mt-2 font-semibold text-gray-900 dark:text-gray-200`.
**Props** ([mintlify.com/docs/components/steps](https://mintlify.com/docs/components/steps)): `Steps` aceita `children` (obrigatório) e `titleSize` (`p`|`h2`|`h3`|`h4`, default `p`). `Step` aceita `title` (**obrigatório**), `children`, `icon`, `iconType`, `stepNumber` (numeração manual), `titleSize`, `id`, `noAnchor` (default `false`).
**Detalhe que importa**: cada Step é **ancorável** por padrão — gera link de âncora a partir do título, com `id` sobrescrevível.

```mdx
<Steps>
  <Step title="Primeiro passo">Conteúdo, incluindo blocos de código.</Step>
</Steps>
```

### Tabs

**Partes**: `tabs-list`, `tab-button`, `tab-content`.
**Props** ([mintlify.com/docs/components/tabs](https://mintlify.com/docs/components/tabs)): `Tabs` aceita `defaultTabIndex` (número, default 0), `sync` (bool, default `true`), `borderBottom` (bool). `Tab` aceita `title` (**obrigatório**), `id`, `icon`, `iconType`.
**Comportamento**: abas com o mesmo `title` **sincronizam entre grupos na página** — e a sincronização vale também com `CodeGroup` de rótulo igual. Casamento por **título**, não por identificador declarado.

**DOM medido:**

```html
<div class="tabs tab-container">
  <ul role="tablist" data-component-part="tabs-list"
      class="not-prose mb-6 pb-[1px] flex-none min-w-full overflow-auto
             border-b border-gray-200 dark:border-gray-200/10 gap-x-6 flex">
    <li id="first-tab" role="tab" aria-selected="true" aria-controls="panel-first-tab-0" tabindex="0">
      <div data-component-part="tab-button" data-active="true"
           class="flex text-sm items-center gap-1.5 leading-6 font-semibold whitespace-nowrap
                  pt-3 pb-2.5 -mb-px max-w-max border-b
                  text-primary dark:text-primary-light border-current">First tab</div>
    </li>
    <li id="second-tab" role="tab" aria-selected="false" tabindex="-1">
      <div data-component-part="tab-button" data-active="false"
           class="… border-b text-gray-900 border-transparent hover:border-gray-300
                  dark:text-gray-200 dark:hover:border-gray-700">
        <svg class="h-4 w-4 shrink-0 bg-gray-900 dark:bg-gray-200 tab-icon"
             style="mask-image:url('…/lucide/v1.16.0/leaf.svg');mask-size:100%"></svg>Second tab</div>
    </li>
```

Como sinaliza a seleção, medido: a aba ativa tem **texto e sublinhado na cor de marca** (`text-primary` + `border-current`, então o sublinhado herda a cor do texto); a inativa tem texto cinza e borda transparente, e o hover só revela um sublinhado cinza (`gray-300` claro / `gray-700` escuro). A lista tem borda inferior de 1px e cada botão tem `-mb-px`, que **puxa o sublinhado do botão exatamente sobre a linha da lista** — é o truque que faz a aba ativa parecer recortar a régua. Espaçamento: `gap-x-6` (24px) entre abas, `pt-3 pb-2.5` (12px/10px), rótulo `text-sm font-semibold`.

Acessibilidade completa e explícita: `role="tablist"` / `role="tab"`, `aria-selected`, `aria-controls` apontando para o painel, e **tabindex roving** (`0` na ativa, `-1` nas demais). Ícone opcional de 16px pela técnica de máscara, colorido por `bg-gray-900 dark:bg-gray-200`.

### Bloco de código e CodeGroup

**Partes**: `code-block-root`, `code-block-header`, `code-block-header-filename`; no grupo, `code-group-tab-bar`, `code-group-tab-content`.
**DOM medido, com título:**

```html
<div class="code-block mt-5 mb-8 not-prose rounded-2xl relative group min-w-0
            text-gray-950 bg-gray-50 dark:bg-white/5 dark:text-gray-50
            border border-gray-950/10 dark:border-white/10 p-0.5"
     numberOfLines="9" language="json">
  <div data-component-part="code-block-header"
       class="flex text-gray-400 text-xs rounded-t-[14px] leading-6 font-medium pl-4 pr-2.5 py-1">
    <div data-component-part="code-block-header-filename"
         class="grow-0 flex items-center gap-1.5 text-gray-700 dark:text-gray-300 min-w-0">
      <span class="truncate min-w-0" title="docs.json">docs.json</span>
    </div>
    <div class="flex-1 flex items-center justify-end gap-1.5 print:hidden">…botões size-6.5 rounded-md…</div>
  </div>
  <div data-component-part="code-block-root" class="… dark:bg-codeblock text-sm leading-6
       transition-[height] duration-300 ease-in-out code-block-background"
       style="background-color:#ffffff;--shiki-dark-bg:#0B0C0E">…</div>
</div>
```

**A construção do raio, medida — vale copiar.** A raiz tem `rounded-2xl` (16px, de `--rounded-2xl: 1rem`), borda de 1px, e **`p-0.5` (2px) de padding**. O header interno tem `rounded-t-[14px]`. Os 14 não são arbitrários: são 16 − 2, o raio interno que deixa o conteúdo aninhado concêntrico com a borda externa. O Mintlify até nomeia isso — existe uma utilitária `.rounded-xt { border-radius: var(--rounded-xl, 14px) }`.

Demais valores medidos: nome do arquivo em 12px (`text-xs`), cinza `gray-700`/`gray-300`, com `truncate` e `title=` para nome longo; padding do header assimétrico (`pl-4 pr-2.5`) porque a direita abriga botões de 26px (`size-6.5`, `rounded-md`); corpo `font-mono whitespace-pre text-sm leading-6` com viewport `py-3.5 px-4`; fundo claro `#ffffff`, **fundo escuro `#0B0C0E`**; `transition-[height] duration-300 ease-in-out` é o que anima o `expandable`.

**A reserva para os botões flutuantes é uma variável CSS.** Medido no CSS servido:

```css
.code-block { --fade-width: 0px; --code-padding-right: 48px }
.code-block:has([data-component-part=code-block-header]) { --code-padding-right: 48px }
.code-block:has([data-floating-buttons]>:first-child:last-child) { --fade-width: 99px; --code-padding-right: 99px }
```

Ou seja: quando não há header e os botões flutuam sobre o código, a área de conteúdo reserva **99px** à direita e aplica um esmaecimento da mesma largura, para o código não passar por baixo do botão de cópia. Quando há header, os botões moram nele e a reserva cai para 48px. Os botões flutuantes ficam em `absolute top-3 right-4` e são `print:hidden`.

**Realce de linha, medido no CSS** — e este é o achado mais transplantável do componente:

```css
[data-component-part=code-block-root]:not(.has-line-numbers) .line-highlight {
  z-index: 0; width: 100%; display: inline-block; position: relative;
  background: rgb(var(--primary-light)/.2) !important;
}
[data-component-part=code-block-root]:not(.has-line-numbers) .line-highlight:before,
[data-component-part=code-block-root]:not(.has-line-numbers) .line-highlight:after {
  content: ""; width: 1rem; position: absolute; top: 0; bottom: 0;
  background: rgb(var(--primary-light)/.2) !important;
}
```

Três leituras. **A cor do realce é a cor de marca a 20% de alfa** (`--primary-light`), não um amarelo fixo — o realce re-marca junto com a skin, o que serve exatamente o axioma 3. **Os pseudoelementos `:before`/`:after` de 1rem cada existem para sangrar a faixa 16px além da caixa de conteúdo**, cobrindo o padding lateral, já que a linha é `inline-block` e pararia no texto. E o seletor é condicionado a `:not(.has-line-numbers)` — com numeração ligada a geometria muda, porque a calha de números já ocupa a esquerda. O marcador de diff usa a mesma calha: `.line-diff:before { width: 1rem; display:flex; justify-content:center; align-items:center; position:absolute }`.

A marcação por linha é simplesmente `<span class="line line-highlight">` dentro do `<code>`.

**Tema duplo do realce de sintaxe, medido**: o Mintlify usa Shiki em modo dois-temas — `github-light-default` e `dark-plus` — e **cada token carrega as duas cores ao mesmo tempo**, a clara em `color:` e a escura numa custom property `--shiki-dark`:

```html
<pre class="shiki shiki-themes github-light-default dark-plus"
     style="background-color:#ffffff;--shiki-dark-bg:#0B0C0E;color:#1f2328;--shiki-dark:#D4D4D4">
  <span style="color:#116329;--shiki-dark:#4EC9B0">Frame</span>
```

Isso importa para o shinydoc porque é uma arquitetura diferente da do Docusaurus: o Prism do `classic` carrega **dois objetos de tema separados** (`prism.theme` e `prism.darkTheme` no config) e troca por classe no `<html>`. O modelo do Shiki não tem troca — o CSS resolve. Se o alvo é paridade visual entre temas sem flash, essa diferença é estrutural, não cosmética.
**Meta options do bloco isolado** ([mintlify.com/docs/create/code](https://www.mintlify.com/docs/create/code)) — tudo declarado na cerca, depois da linguagem:

| Opção | Sintaxe | Efeito |
| --- | --- | --- |
| título | ` ```js Meu título ` ou ` ```js title="utils/hello.js" ` | nome no header |
| ícone | `icon="nome"` | ícone no header |
| numeração | `lines` | números à esquerda |
| quebra de linha | `wrap` | sem scroll horizontal |
| colapsável | `expandable` | expandir/recolher blocos longos |
| realce | `highlight={1-2,5}` | linhas realçadas em cor |
| foco | `focus={2,4-5}` | escurece o que **não** está em foco |
| tipos TS | `twoslash` | tipos no hover |
| diff | `// [!code ++]` / `// [!code --]` no comentário, com `:3` para faixa | linhas de adição/remoção |

Realce (`highlight`) e foco (`focus`) são **dois mecanismos distintos**: um pinta o alvo, o outro apaga o resto. Syntax highlighting é Shiki. Cópia é de fábrica: *"Code blocks are copyable"*.

**CodeGroup** ([mintlify.com/docs/components/code-groups](https://mintlify.com/docs/components/code-groups)): envolve blocos de código; **o título de cada bloco é obrigatório** e vira o rótulo da aba. Props: `dropdown` (troca abas por menu suspenso — importa quando há muitas linguagens) e `theme`. Sincroniza com outros CodeGroups e Tabs de rótulo igual na página.

```mdx
<CodeGroup>
```js helloWorld.js
console.log("olá");
```
```py hello_world.py
print("olá")
```
</CodeGroup>
```

### Accordion, AccordionGroup e Expandable

**Partes do Accordion**: `accordion-button`, `accordion-caret-right`, `accordion-title-container`, `accordion-icon`, `accordion-title`, `accordion-content`.
**Anatomia medida** — e aqui está a surpresa mais útil da dissecção: **o Accordion do Mintlify é um `<details>`/`<summary>` nativo**, não um componente com estado em JavaScript.

```html
<details class="accordion border-standard rounded-2xl mb-3 overflow-hidden
                bg-background-light dark:bg-codeblock cursor-default">
  <summary data-component-part="accordion-button"
           class="relative not-prose flex flex-row items-center w-full cursor-pointer
                  list-none [&::-webkit-details-marker]:hidden py-4 px-5
                  hover:bg-gray-100 hover:dark:bg-gray-800 rounded-t-xl"
           aria-controls="…-accordion-children" aria-expanded="false">
    <div id="i-am-an-accordion" class="absolute top-[-8rem]"></div>
    <div class="mr-0.5" data-component-part="accordion-caret-right">
      <svg class="h-3 w-3 transition bg-gray-700 dark:bg-gray-400 duration-75"
           style="mask-image:url('…/fontawesome/v7.2.0/solid/caret-right.svg');
                  mask-repeat:no-repeat; mask-position:center"></svg>
    </div>
    <div data-component-part="accordion-title-container" class="leading-tight text-left w-full">
      <p class="m-0 font-medium text-gray-900 dark:text-…">…</p>
```

Quatro técnicas concretas que valem mais que a lista de props:

1. **`<details>` nativo com marcador escondido** (`list-none` + `[&::-webkit-details-marker]:hidden`). É exatamente a primitiva que o Docusaurus já usa no `Details`. Este é o **único componente do catálogo em que o Docusaurus e as referências partem do mesmo lugar**.
2. **Ícone por `mask-image` + `background-color`.** O caret é um SVG monocromático aplicado como máscara CSS, com a cor vindo de `bg-gray-700 dark:bg-gray-400`. O ícone herda cor do tema sem componente React e sem `fill` inline. É o caminho barato para o problema do orçamento de ícones descrito adiante.
3. **Âncora deslocada**: um `<div id="…" class="absolute top-[-8rem]">` dentro do summary, 128px acima do alvo real, para que o link de âncora não pare atrás do cabeçalho fixo.
4. **ARIA explícito**: `aria-controls` e `aria-expanded` no `<summary>`.

Geometria: container `rounded-2xl mb-3 overflow-hidden` com fundo `bg-background-light dark:bg-codeblock` (no escuro o accordion usa a **cor de fundo do bloco de código**, não a da página); cabeçalho `py-4 px-5`, hover em `gray-100`/`gray-800`; caret de 12px com `transition duration-75`; título `font-medium`, não `semibold` — mais leve que o título do card.
**Props do `Accordion`** ([mintlify.com/docs/components/accordions](https://mintlify.com/docs/components/accordions)): `title` (**obrigatório**), `description`, `defaultOpen` (default `false`), `id` (âncora, default = título), `icon`, `iconType`. `AccordionGroup` só agrupa.
**Detalhe**: accordions **atualizam o hash da URL** ao abrir, o que os torna linkáveis.

**`Expandable`** é outro componente, com outro propósito ([mintlify.com/docs/components/expandables](https://mintlify.com/docs/components/expandables)): props `title` (**obrigatório**) e `defaultOpen`. Serve especificamente para **aninhar campos filhos dentro de um `ResponseField`/`ParamField`** — objeto que se abre para revelar suas propriedades. Accordion é de propósito geral; Expandable é da referência de API. São dois componentes porque são dois problemas.

### Campo de parâmetro e de resposta

**Partes**: `field-name`, `field-meta`, `field-info-pill`, `field-required-pill`, `field-content`.

**DOM medido** (`ParamField path="param" type="string" required`):

```html
<div class="… group/param-head" id="param-param">
  <div class="flex-1 flex flex-col content-start py-0.5 mr-5">
    <div class="flex items-center flex-wrap gap-2">
      <div class="absolute -top-1.5">
        <a href="#param-param" aria-label="Navigate to header: param"
           class="-ml-10 flex items-center opacity-0 border-0
                  group-hover/param-head:opacity-100 focus:opacity-100
                  py-2 [.expandable-content_&]:ml-[-2.1rem] group/link">
          <div class="size-6 rounded-md flex items-center justify-center shadow-xs
                      text-gray-400 dark:text-white/50 bg-white ring-1 ring-gray-400/30
                      dark:bg-background-dark dark:brightness-[1.35] dark:ring-1 dark:ring-gray-700/25
                      hover:ring-gray-400/60 dark:hover:ring-white/20
                      group-focus/link:border-2 group-focus/link:border-primary">
            <svg class="size-3 shrink-0"><!-- elo de corrente --></svg>
          </div></a>
      </div>
      <button type="button" data-component-part="field-name"
              class="font-semibold text-primary dark:text-primary-light cursor-pointer
                     overflow-wrap-anywhere text-left">param</button>
      <div data-component-part="field-meta"
           class="inline items-center gap-2 text-xs font-medium
                  [&_div]:inline [&_div]:mr-2 [&_div]:leading-5">
        <div data-component-part="field-info-pill"
             class="flex items-center gap-1 rounded-md bg-stone-100/50 px-2 py-0.5
                    font-medium text-stone-600 dark:bg-white/5 dark:text-stone-200 break-all">
          <span>string</span></div>
        <div data-component-part="field-required-pill"
             class="px-2 py-0.5 rounded-md bg-red-100/50 dark:bg-red-400/10
                    text-red-600 dark:text-red-300 font-medium whitespace-nowrap">required</div>
      </div>
    </div>
  </div>
  <div data-component-part="field-content"
       class="mt-4 prose-sm prose-gray dark:prose-invert
              [&_.prose>p:first-child]:mt-0 [&_.prose>p:last-child]:mb-0">…</div>
</div>
```

**Como sinaliza semântica**, medido:

- **O nome é a cor de marca e é um `<button>`**, não um span — `font-semibold text-primary dark:text-primary-light`. Isso o distingue de código inline e o torna acionável.
- **O tipo é pílula neutra**: `rounded-md bg-stone-100/50 px-2 py-0.5 text-stone-600`, no escuro `bg-white/5 text-stone-200`. Fundo a 50% de alfa no claro e 5% no escuro — o escuro é bem mais discreto.
- **Obrigatoriedade é pílula vermelha** com a palavra `required` escrita: `bg-red-100/50 text-red-600`, escuro `bg-red-400/10 text-red-300`. Não é asterisco. E note a assimetria de alfa entre temas — 50% claro, 10% escuro.
- **Âncora que aparece no hover**: um link de elo de corrente de 24px (`size-6`), 12px de ícone, posicionado 40px à esquerda (`-ml-10`), `opacity-0` até `group-hover` ou `focus`. Dentro de conteúdo expandido, desloca para `-2.1rem`. O `id` do campo é `param-<nome>`.
- **A descrição é `prose-sm`** — texto menor que o corpo da página, com primeiro e último parágrafo sem margem.
- Todas as pílulas são `text-xs` (12px) `font-medium`, exibidas `inline` com `mr-2` entre si.

**`ParamField`** ([mintlify.com/docs/components/fields](https://mintlify.com/docs/components/fields)): o **primeiro atributo declara a posição** — `path`, `query`, `body` ou `header` — e seu valor é o nome do parâmetro. Demais props: `type` (`string`, `number`, `boolean`, `object`, `string[]`…), `required`, `deprecated`, `default`, `placeholder`; `children` é a descrição em Markdown. Efeito colateral relevante: declarar `ParamField` **habilita o playground de API**.

**`ResponseField`**: `name` e `type` obrigatórios; `required`, `deprecated`, `default`, e `pre`/`post` (arrays de rótulos antes/depois do nome).

```mdx
<ParamField path="user_id" type="string" required>
  Identificador do usuário.
</ParamField>

<ResponseField name="user" type="User Object">
  <Expandable title="properties">
    <ResponseField name="full_name" type="string">Nome completo.</ResponseField>
  </Expandable>
</ResponseField>
```

**A página de API é duas colunas, e isso é componente, não layout.** `RequestExample` e `ResponseExample` envolvem blocos de código e os **fixam na coluna direita**, no lugar do sumário, mantendo o exemplo visível enquanto o leitor rola a descrição ([mintlify.com/docs/components/examples](https://mintlify.com/docs/components/examples)). No mobile, degradam para blocos de código normais no fluxo. Cada bloco dentro precisa de título; a prop `dropdown` troca abas por menu. `Panel` é o caso geral do mesmo mecanismo — substitui o TOC por conteúdo arbitrário, e `RequestExample`/`ResponseExample` precisam ficar **dentro** dele quando a página usa `Panel`.

Isso é o achado mais caro de transplantar: no Docusaurus, a coluna direita é o `TOC`, componente de chrome, e não existe caminho de autoria que mande conteúdo do MDX para lá. Se a documentação do shinydoc quiser a página de API em duas colunas, isso atravessa a fronteira conteúdo/chrome e precisa ser tratado nos dois tickets.

### Tooltip

**Props** ([mintlify.com/docs/components/tooltips](https://mintlify.com/docs/components/tooltips)): `tip` (**obrigatório**), `headline`, `cta`, `href`. Regra de integridade: **`href` é obrigatório se `cta` for usado** — não existe chamada para ação sem destino. O texto envolvido é o `children`, inline no parágrafo.

```mdx
<Tooltip tip="Application Programming Interface">API</Tooltip>
```

### Badge

**Props** ([mintlify.com/docs/components/badge](https://mintlify.com/docs/components/badge)): `color` (11 valores — `gray` default, `blue`, `green`, `yellow`, `orange`, `red`, `purple`, `white`, `surface`, `white-destructive`, `surface-destructive`), `size` (`xs`|`sm`|`md`|`lg`, default `md`), `shape` (`rounded`|`pill`, default `rounded`), `icon`, `iconType`, `stroke` (bool — vira contorno em vez de preenchido), `disabled` (bool — opacidade reduzida), `className`. É o componente com o maior espaço de variação do catálogo: 11 × 4 × 2, mais preenchido/contornado.

### Frame

**Parte**: `frame-caption`. Raiz semântica: `<figure>` / `<figcaption>`.
**Props** ([mintlify.com/docs/components/frames](https://mintlify.com/docs/components/frames)): `caption` (aceita Markdown, centralizada abaixo) e `hint` (texto antes da moldura). Ambas opcionais; o conteúdo vai como `children`.

**DOM medido — são quatro camadas empilhadas, não uma:**

```html
<figure>
  <!-- 1. fundo de papel quadriculado, esmaecido por máscara em gradiente -->
  <div class="absolute inset-0 bg-grid-neutral-200/20 dark:bg-grid-white/5
              [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]
              dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"
       style="background-position:10px 10px"></div>
  <!-- 2. o conteúdo, recortado a 12px -->
  <div class="relative rounded-xl overflow-hidden flex justify-center">
    <span data-rmiz aria-owns="rmiz-modal-"><img src="…" alt="…"></span>
  </div>
  <!-- 3. anel de borda por cima, sem captura de ponteiro, recortado a 16px -->
  <div class="absolute inset-0 pointer-events-none border border-black/5
              dark:border-white/5 rounded-2xl"></div>
  <!-- 4. legenda -->
  <figcaption data-component-part="frame-caption"
      class="relative rounded-2xl text-center mt-3 pt-0 px-8 pb-2 text-sm
             text-gray-700 dark:text-gray-400 [&_p]:m-0
             [&_a]:font-semibold [&_a]:no-underline [&_a]:border-b [&_a]:border-primary
             [&_a:hover]:border-b-2 dark:[&_a]:text-white dark:[&_a]:border-primary-light"></figcaption>
</figure>
```

O que a medição revela e a documentação não conta:

- **O fundo quadriculado** (`bg-grid-*`, deslocado 10px) é o que dá ao Frame a aparência de "prancheta". É apagado por uma **máscara em gradiente vertical** cujas rampas diferem por tema — no claro vai de opaco a 60%, no escuro de 10% a 50%. É exatamente o tipo de decisão que o axioma 4 chama de custo real: no escuro o padrão precisa quase sumir para não sujar.
- **A borda é uma camada separada, `pointer-events-none`**, com raio de 16px, enquanto o conteúdo é recortado a 12px. Desenhar a borda por cima em vez de no contêiner evita o serrilhado que aparece quando uma imagem encosta num `border-radius`.
- **A imagem amplia ao clique** (`data-rmiz` — a biblioteca `react-medium-image-zoom`). É comportamento de biblioteca, não do Mintlify; o axioma 2 fecha essa porta, mas o comportamento em si é barato de refazer.
- **Links na legenda são sublinhados por borda na cor de marca** (`border-b border-primary`, engrossando para 2px no hover), nunca por `text-decoration`. No escuro o texto do link vira branco e a borda vira `--primary-light`.

**Comportamento de vídeo**: se o `<video>` filho tem `autoPlay`, o Frame injeta `playsInline`, `loop` e `muted` automaticamente.

### Tabela

Não existe componente. É Markdown estendido puro, com alinhamento por dois-pontos (`:---`, `:---:`, `---:`) na linha separadora ([mintlify.com/docs/list-table.md](https://mintlify.com/docs/list-table.md)). Mas **o que envolve a tabela é componente**, e isso é o que vale copiar. DOM medido:

```html
<div data-component-part="scroll-area-viewport" aria-label="Scrollable table"
     class="size-full rounded-[inherit] [--scroll-area-fade-size:32px] overflow-y-hidden!"
     style="overflow:scroll">
  <div data-component-part="scroll-area-content" class="flex" style="min-width:fit-content">
    <div class="px-(--page-padding) grow max-w-none table">
      <table class="m-0 min-w-full w-full max-w-none table
                    [&_td]:min-w-[150px] [&_th]:text-left [&_td[data-numeric]]:tabular-nums">
```

Quatro decisões embutidas: a tabela rola **sozinha, dentro do seu próprio contêiner**, com esmaecimento de 32px nas bordas e `aria-label="Scrollable table"` para quem navega por leitor de tela; toda célula tem `min-width: 150px`, o que impede coluna esmagada; cabeçalho alinhado à esquerda; e células marcadas `data-numeric` recebem **`tabular-nums`** — o renderizador detecta coluna numérica e aplica algarismos de largura fixa, para os números alinharem na vertical.

O visual da tabela em si vem do Tailwind Typography, não de CSS próprio: `thead` com borda inferior de 1px (`--tw-prose-th-borders`) e cada `tbody tr` com borda inferior de 1px (`--tw-prose-td-borders`). **Só separadores horizontais** — sem régua vertical, sem zebra, sem borda externa.

O Fern discorda do Mintlify e tem um componente `Table` com cabeçalho fixo opcional ([buildwithfern.com — components overview](https://buildwithfern.com/learn/docs/writing-content/components/overview)); é a única divergência frontal entre os dois catálogos sobre um mesmo elemento.

### Reuso: snippets

Arquivo `.mdx`/`.md`/`.jsx` em qualquer lugar do projeto; tudo em `/snippets/` é snippet e não vira página ([mintlify.com/docs/reusable-snippets](https://www.mintlify.com/docs/reusable-snippets)). Import padrão de ESM, e o nome JSX **precisa começar com maiúscula**. Aceita props, que interpolam inclusive dentro de blocos de código. Imports declarados numa página **não** valem para os snippets que ela importa.

```mdx
import MySnippet from "/snippets/my-snippet.mdx";

<MySnippet word="bananas" />
```

### Landing page

Não há componente de seção de landing. O caminho oficial é frontmatter `mode` — cinco valores: `default`, `wide` (sem TOC), `custom` (tela em branco, sem sidebar/TOC/footer), `frame` (sidebar sim, TOC não), `center` — mais **HTML com classes Tailwind escritas à mão dentro do MDX** ([mintlify.com/docs/guides/custom-layouts](https://www.mintlify.com/docs/guides/custom-layouts)). A própria documentação desaconselha `style` inline por causa de layout shift. Consequência para o shinydoc: onde o Mintlify tem Tailwind no MDX, o Docusaurus vanilla não tem — as seções de landing precisam nascer como componentes com CSS Modules.

### Claro e escuro: como o sistema inteiro comuta

Medido no CSS servido. São **três mecanismos diferentes**, e confundi-los é como se erra a implementação.

**1. Componentes de conteúdo — variante `dark:` por classe.** Callout, card, step, accordion, tab, pílula de campo: cada um declara o par claro/escuro no próprio elemento (`border-blue-200 … dark:border-blue-900`). Não há troca de token; há duas declarações e um seletor `.dark` ancestral que escolhe. Padrão observado, e relevante para o axioma 4: **o escuro quase nunca é o claro invertido**. O claro usa tinta clara sólida da paleta (`blue-50`, `red-100/50`); o escuro usa **a cor a baixo alfa sobre o fundo escuro** (`blue-600/20`, `red-400/10`, `white/5`, `white/10`). O claro pinta, o escuro véla.

**2. Marca — variáveis CSS globais.** `--primary`, `--primary-light`, `--primary-dark`, consumidas como `rgb(var(--primary-light)/.2)`. São o que troca quando a skin troca. Aparecem no realce de linha do código, no hover do card, no nome do `ParamField`, no sublinhado da aba ativa e no sublinhado dos links de legenda do `Frame`. **Cinco componentes distintos leem a mesma variável de marca** — é isso que faz os quatro sites parecerem quatro produtos servindo o mesmo CSS.

**3. Realce de sintaxe — dupla cor por token, resolvida no CSS.** Não há re-render nem troca de tema:

```css
html.dark .shiki, html.dark .shiki span { color: var(--shiki-dark) !important }
html.dark .code-block-background { background-color: var(--shiki-dark-bg) !important }
```

Cada token do código carrega `style="color:#1F2328;--shiki-dark:#4EC9B0"` — a cor clara na propriedade e a escura numa variável. O CSS do tema escuro só promove a variável a valor. Zero flash, zero JavaScript.

**Tokens nomeados que a medição expôs**: `--rounded-2xl` (default `1rem`), `--rounded-xl` (default `14px`, usado por `.rounded-xt`), `--code-padding-right` (48px ou 99px), `--fade-width`, `--scroll-area-fade-size` (32px), `--cols` (grade de colunas), `--callout-border-color` / `--callout-bg-color` / `--callout-text-color` com pares `--callout-light-*` e `--dark-callout-text-color`, e `--gray-200` consumido por `.border-standard`:

```css
.border-standard { border-width:1px; border-color: color-mix(in oklab, rgb(var(--gray-200)) 70%, transparent) }
.border-standard:is(.dark *) { border-color: #ffffff1a }
```

Isto é a régua de borda do sistema: **1px, cinza a 70% de alfa no claro, branco a ~10% no escuro**. Card, accordion e bloco de código usam a mesma. Para o axioma 3, o padrão a copiar é exatamente esse: marca global em variável, geometria em variável nomeada, e a cor de superfície derivada por alfa em vez de hex cravado por tema.



## A Perplexity é a prova de que a skin é trocável

Este é o achado mais consequente da pesquisa para o shinydoc, e ele caiu no colo: **a Perplexity — um dos três layouts que agradaram — não usa a paleta do Mintlify. Ela repinta o sistema inteiro por CSS.**

O Mintlify injeta CSS do projeto como `<style data-custom-css-path="styles.css">`. O da Perplexity tem **52.835 bytes e 269 seletores**, contra 308 bytes de um segundo arquivo. E ele reescreve os componentes de conteúdo enganchando exatamente nos dois atributos que a anatomia acima documentou: `data-callout-type` na raiz do callout e `data-component-part` nas partes internas.

Isto vale por si: **os mesmos componentes, o mesmo CSS base byte a byte que FastMCP e Devin servem, e mesmo assim um resultado que lê como outro produto.** É o axioma 3 demonstrado em produção, não em teoria.

### A paleta de callout da Perplexity, medida

Valores extraídos do CSS servido. É uma paleta de referência aprovada por gosto humano — matéria-prima direta para a spec:

| Tipo | Claro: fundo / borda | Claro: texto e ícone | Escuro: fundo / borda | Escuro: texto e ícone |
| --- | --- | --- | --- | --- |
| `note` | `rgba(66,145,210,.10)` / `.14` | `#135B8C` | `rgba(66,145,210,.18)` / `.18` | `#63AEF2` |
| `info` | `rgba(18,21,22,.06)` / `.10` | `#545658` | `rgba(247,247,248,.10)` / `.14` | `#ABB0B3` |
| `tip` | `rgba(75,158,79,.10)` / `.14` | `#136A22` | `rgba(75,158,79,.18)` / `.22` | `#88BB8C` |
| `warning` | `rgba(203,134,6,.10)` / `.14` | `#7B571E` | `rgba(203,134,6,.16)` / `.20` | `#BCA482` |
| `check` | `rgba(75,158,79,.10)` / `.14` | `#136A22` | `rgba(75,158,79,.18)` / `.22` | `#88BB8C` |

A fórmula por trás é regular e reproduzível, e é ela que interessa mais que os hexadecimais:

1. **Uma cor-base por variante.** Fundo é a base a ~10% de alfa no claro e ~18% no escuro; borda é a mesma base a ~14% no claro e ~18–22% no escuro. Fundo e borda nunca são cores diferentes — são a mesma cor em alfas diferentes.
2. **Texto e ícone compartilham uma cor sólida**, e essa cor **inverte de luminosidade entre os temas**: escura sobre véu claro (`#135B8C`), clara sobre véu escuro (`#63AEF2`). A base do véu não muda de matiz; só o texto atravessa.
3. **`tip` e `check` são idênticos** aqui também — a Perplexity manteve a colisão do Mintlify em vez de resolvê-la.
4. **`info` é neutro cinza**, confirmando a inversão de convenção do Mintlify: quem carrega o azul é `note`.
5. Links dentro do callout: `color: inherit` e `text-decoration: underline` — o link **não** quebra a cor da variante.

### O resto do repinte

- **Card**: `#F7F7F8` no claro, `#121516` no escuro — no claro, o card tem exatamente a cor de fundo da página, então quem separa o card do texto é só a borda.
- **Bloco de código, dois níveis de cor**: a moldura (`.code-block`, `.code-group`) é `#F7F7F8` / `#121516`, e a **área de código** (`.code-block-background`, `pre.shiki`) é `#FFFFFF` / `#0b0c0d`. Aquele `p-0.5` de 2px medido na anatomia é o que revela essa moldura — é o que faz o bloco parecer uma pastilha dentro de um berço, e não um retângulo chapado.
- **Tabela**: `tbody tr:last-child td { border-bottom: none }` — remove o traço órfão do fim da tabela. Detalhe pequeno, e é justamente o tipo de coisa que separa uma tabela cuidada de uma tabela padrão.
- **Tipografia própria**: GT Standard e GT Standard Mono, auto-hospedadas em `.woff2` por `@font-face`, com 33 referências no arquivo. A camada de token declara `--color-primary`, `--color-foreground`, `--color-muted-foreground`, `--color-card`, `--color-border`, mais um conjunto `--cb-*` de cores de chip para uma galeria de cookbook própria.

### O que isso decide para o shinydoc

**A superfície de re-skin precisa ser projetada, não descoberta.** A Perplexity só conseguiu repintar porque o Mintlify emite `data-callout-type` e `data-component-part` em cada parte interna. Sem esses ganchos, o repinte exigiria sobrescrever classes utilitárias — frágil e dependente do build.

Então o shinydoc deve emitir os seus próprios atributos estáveis nas partes internas de cada componente, e tratá-los como **contrato público** da skin. É a diferença entre uma skin trocável e uma skin teoricamente trocável. E o nome do atributo importa menos que a estabilidade: quem consome é CSS, não JavaScript.

Vale registrar a ressalva: a Perplexity conseguiu isso à base de `!important` em quase todo seletor, porque está lutando contra utilitárias Tailwind de especificidade equivalente. No shinydoc, com CSS Modules e variáveis, a mesma troca sai sem essa arma.

## Padrão da plataforma vs. construído por conta

A leitura transversal que o ticket pede. A resposta se divide em duas famílias, e a divisão parece acompanhar quem versiona a doc junto do código: **nos repos abertos quase nada é construído por conta; nos dois alvos estéticos, bastante — e sempre inline no próprio arquivo MDX.** Em nenhum dos quatro existe componente React compilado à parte.

### FastMCP e Trigger.dev: Mintlify de prateleira

Nem `docs/` do FastMCP nem `docs/` do Trigger.dev contém um único arquivo `.jsx` ou `.tsx`. **Não existe componente React compilado próprio em nenhum dos dois.** Tudo que parece componente próprio é uma de duas coisas:

1. Um `export const X = () => (…)` **dentro de um `.mdx`** em `/snippets` — JSX interpretado pelo MDX, não build separado.
2. Um `.mdx` de snippet que é só conteúdo composto de componentes padrão.

**FastMCP — 5 snippets em `docs/snippets/`:**

| Snippet | Tipo | Alcance | O que é |
| --- | --- | ---: | --- |
| `version-badge.mdx` | `export const` JSX | 110 arquivos (v4) | wrapper de `<Badge>` + CSS próprio |
| `local-focus.mdx` | `export const` JSX | 14 | um `<Tip>` de texto fixo, sem props |
| `prefab-pin-warning.mdx` | MDX puro | 6 | um `<Tip>` de 3 linhas |
| `youtube-embed.mdx` | `export const` JSX | 3 | `<iframe className="w-full aspect-video rounded-md" …>` |
| `prefab-demo-frame.mdx` | `export const` JSX **com hooks** | 8 | demo interativo em iframe |

O `VersionBadge` é o componente mais usado do site inteiro, e cabe em sete linhas:

```jsx
export const VersionBadge = ({ version }) => {
    return (
        <Badge stroke size="lg" icon='gift' iconType='regular' className="version-badge">
            New in version <code>{version}</code>
        </Badge>
    );
};
```

Autoria: `import { VersionBadge } from '/snippets/version-badge.mdx'` e `<VersionBadge version="3.2.0" />`. Aparece inclusive **aninhado dentro de `ParamField`**, para marcar quando um argumento surgiu. O visual vem de CSS próprio em `docs/css/version-badge.css`, injetado pelo Mintlify como `<style data-custom-css-path="css/version-badge.css">`: laranja `#ff5400` sobre `#fef2f2`, borda vermelha a 30%, e um micro-hover que sobe 1px e escala 3% com sombra roxa. No escuro vira ardósia `#334155`.

O `PrefabDemoFrame` é o **único componente com estado dos dois repos**: usa `React.useState`/`useEffect`, carrega sob demanda um `/prefab-demo-payloads.js` de 82 KB, monta o HTML num `Blob` + `URL.createObjectURL` e renderiza num `<iframe sandbox="allow-scripts allow-same-origin">`, revogando o object URL no cleanup. São demos de UI ao vivo dentro da página de doc, sem servidor.

**Trigger.dev — 52 snippets em `docs/snippets/`, todos MDX puro.** Zero `export const`, zero JSX, zero React. São blocos de conteúdo composto de componentes padrão, importados como default:

| Categoria | Exemplos | Reuso |
| --- | --- | --- |
| Passos de tutorial (um `<Step>` inteiro) | `step-cli-init`, `step-cli-dev`, `step-run-test`, `step-view-run` | 8–9 páginas cada |
| Flags de CLI (árvores de `<ParamField>`) | `cli-options-common` e 9 irmãos | 8 páginas |
| Grades de cards | `use-cases-cards`, `supabase-docs-cards`, `vercel-docs-cards` | 4–6 páginas |
| "Próximos passos" | `realtime-learn-more`, `useful-next-steps` | 7–8 páginas |
| Avisos reusáveis | `web-scraping-warning`, `corepack-error`, `coming-soon-*` | 1–3 páginas |
| Pré-requisitos | `framework-prerequisites` | 9 páginas |

Há composição em dois níveis: `cli-options-common.mdx` importa outros quatro snippets.

**CSS custom que toca conteúdo — o total dos dois sites:**

- FastMCP, `docs/css/style.css`: `#content-area { max-width: 44rem }`, e **recolore todo código inline** (`p code:not(pre code)`, `li code`, `h1..h6 code`, `table code`) para magenta `#f72585` sobre `rgba(247,37,133,0.09)`. Mais `version-badge.css`.
- Trigger.dev, `docs/style.css`, 31 linhas: só as variáveis de token do tema de código (`--mint-color-background:#121317`, `--mint-token-string:#afec73`, `--mint-token-keyword:#e888f8`, `--mint-token-function:#d9f07c`, `--mint-token-comment:#5f6570`), porque o `docs.json` declara `styling.codeblocks.theme: "css-variables"`. **Nenhum componente de conteúdo tem estilo próprio.**

Comparação relevante: o FastMCP declara `styling.codeblocks.theme: {dark: "dark-plus", light: "snazzy-light"}` — tema Shiki pronto. O Trigger.dev escolhe `"css-variables"` e define a paleta à mão. Duas estratégias legítimas; a segunda é a que se parece com o que o shinydoc precisa (tema de código derivado dos tokens da skin, não um tema de terceiro).

**HTML cru no MDX.** Ambos usam, com parcimônia: `<iframe>` de YouTube colado direto (Trigger.dev, 5 arquivos, sem `<Frame>`), `<video controls>` cru. O FastMCP faz a troca de mídia por tema com duas tags sobrepostas — `className="rounded-2xl block dark:hidden"` e `className="rounded-2xl hidden dark:block"` — que é o mesmo truque que o Mintlify recomenda para `Tile`. **Nenhum `<style>` inline autoral em nenhum dos dois**, e apenas um `<div style={{…}}>` em 790 arquivos.

### Devin e Perplexity: a escapada é `export const` no próprio arquivo

Aqui o padrão inverte. **Nenhum dos dois usa `/snippets`. Zero imports.** Quando o Mintlify não cobre, os autores escrevem React **inline dentro do `.mdx`**, com `export const` — 24 declarações no Devin, 37 na Perplexity.

| Site | Componente próprio | Usos / arquivos | O que é |
| --- | --- | ---: | --- |
| Devin | `Release` | 496 / 4 | changelog gerado (`desktop/changelog`, `desktop/releases`) |
| Devin | `Image` | 123 / 4 | auxiliar dentro do JSX de changelog |
| Devin | `PromptBlock` | 19 / 7 | `({children, type, agent, intent, playbookId})` — botão "abrir no Devin" ao redor de uma cerca |
| Devin | `HeroCard` | 6 / 1 | `({imageSrc, title, description, href})` na landing de casos de uso |
| Devin | `ModelCosts` / `ModelsTable` | 6 / 2 | tabela de preços a partir de `export const modelCostData = [...]`, com mais de 4.300 linhas de dados dentro do MDX |
| Perplexity | `SonarDeprecationNotice` | 21 / 21 | aviso de depreciação nas páginas de referência |
| Perplexity | `PricingCalculator`, `CookbookGallery`, `UseCaseTabs`, `ApiStatus`, `ModelOverviewCards`, `MigrationBenchmarkChart` | 1–2 cada | componentes de produto |

E o uso de HTML/JSX cru é muito maior que nos dois repos abertos:

| | Devin | Perplexity |
| --- | ---: | ---: |
| `className=` | 544 usos / 49 arq. | **920 / 34** |
| `<div>` | 120 / 26 | **512 / 15** |
| `<img>` | **476 / 100** | 79 / 16 |
| `<video>` | **75 / 38** | 1 / 1 |
| `style=` | 198 / 42 | 196 / 13 |
| `<iframe>` | 22 / 11 | 18 / 18 |

Três achados que mudam decisões:

**Imagem nunca é Markdown.** Em nenhum dos dois sites aparece `![]()`. É sempre `<img>` cru com `src` no CDN, `width` e `height` explícitos e um atributo `data-path`. No Devin, 367 dos 476 `<img>` (77%) estão dentro de `<Frame>`; na Perplexity, só 18 de 79 (23%) — ela usa `Frame` quase nada e deixa a imagem solta. Dimensões explícitas em toda imagem é o que impede layout shift, e é um requisito de autoria, não de componente.

**O vídeo é do Devin.** 60 ocorrências com o mesmo conjunto exato de flags: `<video className="…" src="https://mintcdn.com/…" autoPlay muted loop playsInline controls />`. Se o shinydoc quiser vídeo, esse é o contrato observado.

**A classe utilitária vaza para o conteúdo.** As 920 ocorrências de `className=` na Perplexity são classes Tailwind escritas à mão dentro do MDX. Isso funciona porque o Mintlify serve Tailwind. **No Docusaurus vanilla não existe esse escape** — o que lá é `className="flex gap-4"` aqui precisa ser um componente. É a diferença de plataforma com maior consequência prática para a autoria, e vale mais que qualquer componente individual do catálogo.



## O bloco de código nos três sistemas

Merece uma comparação própria: é o componente mais usado da documentação técnica, e é o único onde o Docusaurus chega perto do estado da arte de fábrica.

> **Leia esta tabela junto com a medição de uso.** Ela mostra o que cada plataforma *oferece*. O que os alvos estéticos *usam* é muito menos: só linguagem e título nu, com `wrap` e `expandable` raros e **zero** ocorrências de numeração, realce, foco, diff ou ícone. A tabela serve para saber o que existe, não para dimensionar trabalho.

| Recurso | Mintlify | Fern | Docusaurus classic |
| --- | --- | --- | --- |
| Título | ` ```js Título ` ou `title="x.js"` | após a linguagem, ou `title=` / `filename=` | `title="x.js"` |
| Numeração de linha | `lines` — **desligada** por default | **ligada por default**; `showLineNumbers={false}` desliga | `showLineNumbers`, com `showLineNumbers=3` para começar em 3 |
| Início da numeração | não documentado | `startLine={6}` | `showLineNumbers=3` |
| Realce de linha | `highlight={1-2,5}` | `{2-4, 6}` direto na cerca | `{1,4-6}` na cerca **ou** comentário mágico `// highlight-next-line` / `highlight-start`+`highlight-end` |
| Foco (escurece o resto) | `focus={2,4-5}` | `focus={2-4}` | **ausente** |
| Quebra de linha | `wrap` | `wordWrap` | botão `WordWrapButton` no chrome do bloco |
| Colapso / altura máxima | `expandable` | `maxLines=10` (**default 20**, `0` desliga) | **ausente** |
| Diff | `// [!code ++]` / `[!code --]`, com `:3` para faixa | não documentado | **ausente** |
| Tipos TS no hover | `twoslash` | não documentado | via plugin externo |
| Ícone no header | `icon="nome"` | não documentado | **ausente** |
| Cópia | de fábrica | de fábrica (`fern-code-actions`) | `CopyButton` de fábrica |
| Embutir arquivo externo | não documentado | `<Code src="..." lines="...">` | **ausente** |
| Deep link dentro do código | **ausente** | prop `links` (string exata ou regex) | **ausente** |
| Grupo multi-linguagem | `<CodeGroup>`, título obrigatório em cada bloco, sincroniza por rótulo | `<CodeBlocks>` (auto) e `<CodeGroup for="id">` (grupo nomeado) | `<Tabs>` + `<TabItem>`, sincroniza por `groupId` |
| Realce de sintaxe | Shiki | não confirmado | Prism (`prism-react-renderer`) |

Três leituras. **Primeira**: o default de numeração de linha é uma decisão de produto, não um detalhe — Fern liga, Mintlify desliga. **Segunda**: `maxLines=20` por default no Fern significa que blocos longos ficam recortados sem o autor pedir; é a única das três que trunca por padrão. **Terceira**: o que falta ao Docusaurus no bloco de código é exatamente `focus`, `expandable`/`maxLines`, diff e ícone no header. Os quatro operam sobre a mesma superfície — a *metastring* da cerca e o markup de linha —, e o `classic` já compartimenta isso em `CodeBlock/Line`, `CodeBlock/Title` e `CodeBlock/Buttons`. Se cabem em swizzle sem dependência nova é hipótese de implementação, não achado desta pesquisa; fica registrada como o ponto onde vale investigar antes de decidir construir do zero.

Fontes: [mintlify.com/docs/create/code](https://www.mintlify.com/docs/create/code); [buildwithfern.com — code blocks](https://buildwithfern.com/learn/docs/writing-content/components/code-blocks); [docusaurus.io/docs/markdown-features/code-blocks](https://docusaurus.io/docs/markdown-features/code-blocks).

## O que o Docusaurus classic já entrega

A leitura que converte esta pesquisa em trabalho. Medido contra o Docusaurus **v3.10.2** (release de 2026-07-10, [facebook/docusaurus releases](https://github.com/facebook/docusaurus/releases/latest)), preset `classic`, sem dependência nova — o que o axioma 2 permite.

Listagem completa do diretório de temas em [`packages/docusaurus-theme-classic/src/theme`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme) e dos componentes globais de MDX em [`src/theme/MDXComponents`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/MDXComponents).

### Já vem pronto

| Recurso | Como o autor invoca | Fonte |
| --- | --- | --- |
| **Admonition** — 5 tipos: `note`, `tip`, `info`, `warning`, `danger`, mais 4 **aliases legados não documentados** (`secondary`→Note, `important`→Info, `success`→Tip, `caution`→Caution) | `:::note[Título]` … `:::`, com atributos opcionais `{.classe #id}`; aninhamento com mais dois-pontos | [markdown-features/admonitions](https://docusaurus.io/docs/markdown-features/admonitions); aliases em [`Admonition/Types.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/Admonition/Types.tsx) |
| **Tabs** | `import Tabs from '@theme/Tabs'` + `<Tabs><TabItem value label default>`; sincroniza por `groupId` via localStorage, e por `queryString` na URL | [markdown-features/tabs](https://docusaurus.io/docs/markdown-features/tabs) |
| **Bloco de código** — título, realce de linha, numeração, cópia, quebra de linha | ` ```jsx title="x.js" {1,4-6} showLineNumbers=3 `; realce também por comentário mágico `// highlight-next-line` | [markdown-features/code-blocks](https://docusaurus.io/docs/markdown-features/code-blocks); botões em [`CodeBlock/Buttons`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/CodeBlock/Buttons) — `CopyButton` e `WordWrapButton` existem de fábrica |
| **Details** (accordion de um item) | `<details>` HTML — mapeado automaticamente no `MDXComponents`; props: `summary` (string ou elemento, default `'Details'`) mais tudo de `<details>` nativo, incluindo `open` | [`MDXComponents/Details.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/Details.tsx) e [`theme-common/Details`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-common/src/components/Details/index.tsx) |
| **Mermaid** | Bloco ` ```mermaid ` (requer `@docusaurus/theme-mermaid`) | [`theme/Mermaid.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/Mermaid.tsx) |
| **Tabela** | Markdown puro | — |
| **TOCInline**, **ThemedImage**, **Tag**, **DocVersionBadge**, **Icon** | `import` de `@theme/...` | listagem do diretório de temas |

### Não existe — precisa nascer

Ausentes da listagem de temas do `classic`, portanto **autorados do zero** no shinydoc:

`Card` de forma livre · grade de cards (`Columns`/`CardGroup`) · `Steps`/`Step` · `CodeGroup` como componente próprio · `ParamField`/`ResponseField` · `Expandable` · `AccordionGroup` · `Tooltip` · `Badge` de conteúdo · `Frame` com legenda · `Update` · `Panel` · `Tile` · `View`/`If`.

### O orçamento de ícones — a restrição que ninguém vê chegando

Todo componente de conteúdo do Mintlify e do Fern aceita `icon`, e resolve o nome contra **Font Awesome, Lucide ou Tabler** ([mintlify.com/docs/components/icons](https://mintlify.com/docs/components/icons)). Card, Step, Accordion, Callout customizado, Badge, Tab — todos.

O Docusaurus classic não tem nada disso. Seu conjunto inteiro de ícones é:

- **Chrome, 14 ícones**: `Arrow`, `Close`, `Copy`, `DarkMode`, `Edit`, `ExternalLink`, `Home`, `Language`, `LightMode`, `Menu`, `Socials`, `Success`, `SystemColorMode`, `WordWrap` ([`theme/Icon`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/Icon)).
- **Conteúdo, 5 ícones**: os das admonitions — `Danger`, `Info`, `Note`, `Tip`, `Warning` ([`theme/Admonition/Icon`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/Admonition/Icon)). Os tipos são `Note`, `Tip`, `Info`, `Warning`, `Danger`, mais o alias legado `Caution` ([`theme/Admonition/Type`](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-classic/src/theme/Admonition/Type)).

O axioma 2 (zero dependências novas) fecha a porta de instalar Lucide ou Font Awesome. Então **a prop `icon` das referências não é transplantável como está**. As saídas, e a escolha é decisão de spec, não detalhe de implementação:

- **(a) Sprite SVG curado no repo**, com um vocabulário fechado de nomes. Custo fixo de curadoria, zero dependência.
- **(b) `mask-image` + `background-color`** — a técnica que o próprio Mintlify usa no caret do accordion. O SVG monocromático entra como máscara CSS e a cor vem de propriedade CSS, então o ícone **herda o token de cor** em vez de carregar `fill` próprio. Combina com (a) e é a única que serve bem os dois temas sem duplicar asset.
- **(c) O componente aceitar SVG cru** como prop ou children, empurrando o custo para o autor. É o escape que o Mintlify oferece (`icon={<svg…/>}` após conversão por SVGR).
- **(d) Não ter ícone**, e a semântica ser carregada só por cor e borda.
- **(e) Emoji**, que é como o `DocCard` do Docusaurus resolve. Mais barata, visualmente mais fraca, e refém da fonte do sistema.

### A sintaxe de autoria é recuperável

A ergonomia que distingue o Mintlify não é só o catálogo — é que **o autor escreve `<Card>` sem importar nada**. No Docusaurus, `Tabs` exige `import Tabs from '@theme/Tabs'` no topo de cada arquivo, e isso é atrito real espalhado por todo o conteúdo.

O mecanismo para eliminar esse atrito já existe e é vanilla. `@theme/MDXComponents` é um **objeto de registro** — mapeia nomes de tag para componentes, e é ele que faz `<details>`, `admonition` e `mermaid` funcionarem sem import ([`MDXComponents/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/index.tsx)):

```tsx
const MDXComponents: MDXComponentsObject = {
  Head, details: MDXDetails, Details: MDXDetails, code: MDXCode, a: MDXA,
  pre: MDXPre, ul: MDXUl, li: MDXLi, img: MDXImg,
  h1: …, h2: …, h3: …, h4: …, h5: …, h6: …,
  admonition: Admonition, mermaid: Mermaid,
};
```

Swizzlar esse arquivo e acrescentar as entradas do shinydoc torna `<Card>`, `<Steps>`, `<ParamField>` globais em todo MDX, sem import e sem dependência. Repare também no padrão que o próprio Docusaurus usa: `Details` está registrado **duas vezes**, em minúscula (para o HTML `<details>` em modo Markdown puro) e em maiúscula (para uso JSX). É o gancho que permite dar ao autor duas sintaxes para o mesmo componente.

### Duas armadilhas no que "já existe"

**A admonition do Docusaurus não tem a mesma anatomia do callout das referências.** Lendo o componente ([`Admonition/Layout/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/Admonition/Layout/index.tsx) e seu [`styles.module.css`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/Admonition/Layout/styles.module.css)):

- A estrutura é **vertical**: `.admonition` contém `.admonitionHeading` (span `.admonitionIcon` + título) e, abaixo, `.admonitionContent`. O callout do Mintlify é **horizontal** — `flex gap-3`, ícone numa coluna à esquerda ao lado do texto. Isso é diferença de estrutura, não de estilo.
- A linha de título tem `text-transform: uppercase` e usa `--ifm-h5-font-size`. Os tipos embutidos sempre fornecem título e ícone, e o heading só é omitido quando **ambos** faltam (`{title || icon ? … : null}`) — ou seja, na prática a faixa de título maiúscula sempre aparece. Nas referências Mintlify o callout tipado **não tem título nenhum**: os seis tipados aceitam só `children`.
- O ícone é `1.6em` preenchido com `--ifm-alert-foreground-color`, herdando o sistema de alertas do Infima.

Consequência: alinhar o shinydoc ao visual das referências não é trocar cores da admonition — é **suprimir a faixa de título e reorientar o eixo**, o que é swizzle de layout. E se um callout com título for desejado (o Fern permite, o Mintlify não), isso é uma decisão de produto a tomar, não um default a herdar.

**O `DocCard` não é um componente de autoria.** O `DocCard` recebe um *item de sidebar* (`PropSidebarItemLink | PropSidebarItemCategory`), deriva título e descrição dos metadados do doc e usa emoji como ícone de fallback (`🗃️` para categoria, `📄️` para doc interno, `🔗` para externo) — não aceita `title`/`icon`/`href` livres do MDX ([`DocCard/index.tsx`](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/DocCard/index.tsx)). Para a grade de cards de uma landing page, ele não serve.

## O conjunto a reimplementar, em ordem

Cruzando três coisas — o que o Mintlify oferece, o que as referências que agradaram **efetivamente usam**, e o que o Docusaurus `classic` já entrega — sai a lista de trabalho. A coluna "Docusaurus" diz de onde se parte, não quanto custa.

| # | Componente | Uso medido nos alvos | Docusaurus classic | Trabalho |
| ---: | --- | --- | --- | --- |
| 1 | **Callout** — `Note` `Tip` `Warning` `Info` `Check` | Maior alcance: `Note` em 182/553 arquivos do Devin. **Sempre sem props** | Admonition existe, mas **eixo vertical e faixa de título maiúscula** | Reorientar para horizontal, suprimir a faixa, repaginar cor por variante. 5 variantes, não 6 |
| 2 | **Card + `CardGroup`** | Maior volume: 432 usos na Perplexity, 281 no Devin. `cols` sempre explícito | `DocCard` existe mas é **dirigido por metadado de sidebar** | Nascer do zero. `title`+`icon`+`href`, ícone na cor de marca, hover na borda. Precisa aceitar conteúdo dentro |
| 3 | **`Steps` / `Step`** | 177 usos na Perplexity, 147 no Devin. `Step` só usa `title` | **Ausente** | Nascer do zero. Marcador de 28px sobre linha de 1px |
| 4 | **`Accordion` / `AccordionGroup`** | 473 usos no Devin, 235 na Perplexity | `Details` existe e é **a mesma primitiva** (`<details>`) | O único que parte do mesmo lugar. Falta grupo, ícone, descrição, âncora de URL |
| 5 | **Bloco de código** | Onipresente — mas **só linguagem + título nu** | Quase tudo existe: título, realce, numeração, cópia, quebra | Muito menos do que parecia. Ver decisão 3 |
| 6 | **`Tabs` / `Tab`** | 143 usos na Perplexity, 110 no Devin. `Tab` só usa `title` | Existe, sincroniza por `groupId` | Repaginar. A sincronização do Docusaurus é **melhor** que a do Mintlify (id explícito vs. casamento por título) |
| 7 | **`CodeGroup`** | Assimétrico: 303 usos na Perplexity, **5 no Devin** | `Tabs` + blocos aproxima | Avaliar se não é `Tabs` com outra pele |
| 8 | **`Frame`** | 419 usos no Devin (o mais usado lá), 17 na Perplexity | **Ausente** | Quatro camadas: fundo quadriculado, conteúdo, anel de borda, legenda |
| 9 | **`ParamField` / `ResponseField` / `Expandable`** | Poucos arquivos, dezenas de usos. **`ResponseField` é recursivo** | **Ausente** | Nascer do zero. Densidade exige rigor tipográfico |
| 10 | **`Update`** | 797 usos no Devin, 41 na Perplexity — changelog | **Ausente** | Nascer do zero se houver changelog no escopo |
| 11 | **Tabela** | Presente em toda parte (2.148 linhas no Devin) | Markdown puro | Só estilo, mais o invólucro de rolagem e `tabular-nums` |
| 12 | **`Icon` inline** | 25 usos no Devin, 14 na Perplexity — inclusive **dentro de célula de tabela** | **Ausente** | Depende da decisão 2 |
| — | **`Tooltip` `Badge` `Danger` `Tile` `Panel` `Tree` `View` `Visibility` `Prompt` `Banner` `Color` `RequestExample` `ResponseExample`** | **Zero usos em 1.740 páginas** | Ausente | **Fora de escopo** |

### Quatro decisões que a medição força

**1. O callout precisa de `title` opcional — e de cinco variantes, não seis.** `Danger` tem uso zero nos quatro sites. Já o `title`: duas equipes independentes tentaram dar título a um callout tipado — o Trigger.dev com `<Note title="…">` (prop ignorada, e o autor repetiu a palavra no corpo para compensar) e com `<Callout type="warning">` (renderiza cinza neutro sem ícone, quando queriam amarelo). O Fern permite `title`; o Mintlify não. Copiar a limitação do Mintlify é copiar um bug conhecido.

**2. O orçamento de ícones é a decisão que trava as outras.** `Card` usa `icon` em 95–96% dos usos nos dois alvos. Não é opcional na prática — é o que define a aparência do componente mais visível do sistema. E todo `icon` das referências é um nome de string resolvido contra Font Awesome ou Lucide, que o axioma 2 proíbe instalar. A saída mais alinhada é a que o próprio Mintlify usa no caret do accordion, no ícone da aba e no ícone do card: **SVG monocromático como `mask-image` colorido por `background-color`**, porque o ícone herda o token de cor em vez de carregar `fill` próprio, e serve os dois temas sem duplicar asset. Isso precisa ser decidido antes do primeiro componente, não durante.

**3. O bloco de código é muito menos trabalho do que a documentação do Mintlify sugere.** Numeração de linha, realce, foco, diff e ícone somam **zero usos** nos dois alvos estéticos. O que os autores escrevem é linguagem e um título nu; `wrap` e `expandable` aparecem em punhados. O Docusaurus já entrega título, cópia e quebra de linha. **A lacuna real é quase nula** — e o esforço economizado aqui paga o `Card` e o `Steps`.

**4. A borda é uma régua única, não uma escolha por componente.** `1px`, cinza a 70% de alfa no claro, branco a ~10% no escuro. Card, accordion e bloco de código compartilham. Definir isso como token antes de escrever o primeiro componente evita a deriva que aparece quando cada um escolhe sua borda.

### A diferença de plataforma que nenhum componente resolve

Na Perplexity há **920 usos de `className=` com classes Tailwind escritas à mão dentro do MDX**; no Devin, 544. É assim que as duas casas resolvem tudo que o catálogo não cobre — mais `export const` inline no próprio arquivo para componentes de produto (24 declarações no Devin, 37 na Perplexity), e **zero imports de `/snippets`**.

O Docusaurus vanilla não tem esse escape. O que lá é `className="flex gap-4"` aqui precisa ser um componente ou uma classe de CSS Module. Isso significa que **o catálogo do shinydoc precisa cobrir mais que o do Mintlify**, não menos — porque a válvula de escape que torna o catálogo do Mintlify suficiente não existe do lado de cá. É o risco de escopo mais subestimado desta pesquisa.

### Cinco padrões de fora do Mintlify que merecem entrar no escopo

Detalhados na seção do delta, listados aqui porque competem por prioridade com os componentes da tabela acima:

1. **Variante de página inteira por framework** (Clerk). O único mecanismo que faz URL, sidebar e links de entrada acompanharem a escolha do leitor. `Tabs` não resolve isso, e doc de produto sempre acaba precisando.
2. **Seleção que mora na URL** (Fern, `<Versions paramName>`). Diferença conceitual mínima em relação a `Tabs`, e muda o que se pode compartilhar por link.
3. **Componentes gerados de contrato, com build que quebra** (Neon). Não exige plataforma — exige um `schema.json` no repo. E o mesmo renderizador alimentando HTML e espelho Markdown garante que os dois não divirjam.
4. **Duas colunas pareadas por passo** (Neon, `<TwoColumnLayout>`). Resolve em CSS grid o mesmo problema que no Mintlify custa atravessar a fronteira conteúdo/chrome.
5. **Prettier formatando as cercas no CI** (Clerk). Não é componente, é higiene — e é a melhor relação custo/benefício de tudo que foi levantado.

E um contraponto que economiza trabalho: com cerca de 30 frameworks suportados, o Neon **não construiu seletor nenhum** — fez uma página por framework mais um índice.

### O que o `VersionBadge` do FastMCP ensina

O componente mais usado do site inteiro do FastMCP — 110 de 147 arquivos da doc corrente — não é do Mintlify. É sete linhas de JSX dentro de um `.mdx` de snippet, envolvendo um `<Badge>` padrão, com um arquivo CSS de marca própria. Aparece inclusive aninhado dentro de `ParamField`, para marcar em que versão um argumento surgiu.

A lição não é "faça um VersionBadge". É que **o componente mais valioso de uma documentação pode ser trivial e específico do produto**, e que a plataforma precisa deixar isso ser barato. No shinydoc, o equivalente é o registro em `@theme/MDXComponents`: quem autora ganha uma tag nova sem import e sem build separado.

Vale registrar o contraste entre as duas famílias observadas. Nos repos abertos (FastMCP, Trigger.dev) a invenção da casa é mínima: um único componente com estado em React em 790 arquivos, nenhum `<style>` autoral, e o reuso feito por snippets MDX puros. Nos dois alvos estéticos (Devin, Perplexity) a invenção é bem maior e mora inline no MDX. A diferença provável é acesso ao repositório — quem versiona a doc junto do código usa snippets; quem edita pela web escreve tudo no arquivo.

## Vapi, Neon e Clerk: só o que o Mintlify não tem

As três referências fora do conjunto Mintlify entram aqui restritas ao **delta** — o que oferecem ao autor que o Mintlify não oferece, e que valha considerar. Não é inventário delas.

### Fern (Vapi) — o catálogo paralelo

Fern declara **27 componentes embutidos** ([buildwithfern.com — components overview](https://buildwithfern.com/learn/docs/writing-content/components/overview)). O grosso é equivalente ao Mintlify com outro nome.

**Ressalva que enquadra a seção**: o Vapi **não usa quase nada do que o Fern tem de mais interessante**. Grep no clone de `VapiAI/docs` (440 arquivos `.mdx`) devolve zero ocorrências de `If`, `Versions`, `Aside`, `RunnableEndpoint`, `Schema`, `Indent`, `Copy` e `Anchor`. O que o Vapi de fato usa do delta é `Button` (31), `Download` (30), `Files` (7) e `EndpointRequestSnippet` (6). Então o que segue é **potencial da plataforma**, não prática observada.

O que é genuinamente diferente:

| Componente Fern | O que faz | Vale considerar? |
| --- | --- | --- |
| **`If`** | Mostra ou esconde conteúdo por instância, produto, versão ou **papel do usuário** | O único condicional por permissão que a pesquisa encontrou. Fora do escopo de doc pública, mas é a resposta certa para doc corporativa com conteúdo restrito |
| **`Schema`, `Endpoint request/response/schema snippet`, `Runnable endpoint`** | **Puxam do contrato da API Reference** em vez de o autor redigitar | A diferença conceitual mais forte entre as duas plataformas. Mintlify pede `ParamField` escrito à mão; Fern gera do contrato. Só importa se houver API reference no escopo |
| **`Versions`** | Conteúdo por versão selecionada | Docusaurus tem versionamento de docs nativo, em outra camada — não é o mesmo problema |
| **`Table`** | Tabela com cabeçalho fixo | Única divergência frontal com o Mintlify sobre um mesmo elemento |
| **`Indent`** | Hierarquia visual com linha-guia para conteúdo aninhado | Barato e sem equivalente |
| **`Copy`** | Torna qualquer texto copiável com um clique | Barato; resolve o caso "copie este comando" fora de bloco de código |
| **`Anchor`** | Âncora linkável em parágrafo ou tabela | O Mintlify só ancora cabeçalho, `Step`, `Accordion` e campo de API |

Duas diferenças de API que valem como precedente, mesmo sem adotar o Fern:

- **O callout do Fern aceita `title`** — e tem 8 intents, separando `success` de `check` e inventando `launch`. É a evidência externa de que o `title` opcional (decisão 1) não é invenção.
- **O `Step` do Fern não exige `title`, e `##`/`###` dentro de `<Steps>` viram passos automaticamente**, com `toc` e `tocDepth` para alimentar o sumário. Deixar o passo ser Markdown em vez de exigir JSX é uma ergonomia melhor que a do Mintlify.

E um antipadrão a evitar: o `Card` do Fern tem `darkModeColor` e `lightModeColor` ([buildwithfern.com — cards](https://buildwithfern.com/learn/docs/writing-content/components/cards)), deixando o **autor** resolver cor por tema no ponto de uso. É o oposto de resolver por token no tema, e briga com o axioma 3.

Um item que **parecia** delta e não é: o `<Markdown src>` do Fern com `{{param}}` — partial parametrizado. O Mintlify tem o mesmo por snippet com props (`<MySnippet word="bananas" />`). Não conte como lacuna.

### Clerk — o guia de autoria mais completo dos três

Fonte primária: [`clerk/clerk-docs`, `contributing/CONTRIBUTING.md`](https://github.com/clerk/clerk-docs/blob/main/contributing/CONTRIBUTING.md), 1.725 linhas, sobre 1.082 arquivos `.mdx`.

**A variante de página inteira por SDK é o achado mais forte do levantamento** — e é exatamente o que `Tabs` não resolve. Duas peças complementares:

```diff
  ---
  title: '<ClerkProvider>'
+ sdk: nextjs, react
  ---
```

O frontmatter `sdk:` (em **380 das 1.082 páginas**) gera **uma URL por SDK** — `/docs/nextjs/clerk-provider` e `/docs/react/clerk-provider` —, faz a página aparecer na sidenav só quando o SDK ativo está na lista, e torna **os links de entrada inteligentes**: um link para essa página resolve para a variante certa conforme o SDK ativo. A URL base mostra uma grade das variantes disponíveis.

Quando o condicional come a página inteira, a escada de escape é **convenção de nome de arquivo**: `quickstart.mdx` é a base e `quickstart.react.mdx` é a variante, na mesma rota (51 arquivos). O guia é explícito sobre o porquê — *"Instead of using a bunch of `<Tabs />` or `<If />` components, which would bloat the doc and make it harder to maintain, you can create a doc variant."*

O condicional inline é `<If>`, com **1.711 usos — o componente mais usado do repositório**:

```mdx
<If sdk={['nextjs', 'react']}>
  Conteúdo para Next.js ou React.
  <If sdk="nextjs">Só para Next.js.</If>
</If>
<If notSdk="nextjs">Tudo menos Next.js.</If>
```

O detalhe de engenharia que vale mais que o componente: **o build valida que os SDKs citados no `<If>` estão no escopo declarado no frontmatter da página**. Um `<If sdk="vue">` numa página `sdk: nextjs, react` **quebra o build**; `ignoreSdkWarning` é o escape explícito. Condicional sem checagem de escopo apodrece em silêncio.

Outros deltas do Clerk que valem, em ordem de retorno sobre custo:

| Item | O que é | Por que vale |
| --- | --- | --- |
| **Prettier nas cercas, no CI** | O código dentro dos blocos é formatado e validado no CI; sintaxe inválida quebra o PR. Escape: `{{ prettier: false }}` | Melhor relação custo/benefício do levantamento inteiro. Pega erro que revisão humana não pega |
| **Callouts de ciclo de vida com corpo obrigatório** | `> [!DEPRECATED]` e `> [!REMOVED]` **falham o build sem corpo**, e o corpo tem que nomear o substituto. `EXPERIMENTAL`/`BETA`/`LEGACY` com corpo vazio renderizam mensagem canônica | Regra editorial codificada no compilador, com default centralizado e override por exceção |
| **Tooltip por sintaxe de link** | `[Active Organization](!active-organization)` resolve de `_tooltips/` | Glossário sem poluir o MDX com JSX. Resolve o caso que fez o `Tooltip` do Mintlify ter uso zero |
| **Status em dois eixos ortogonais** | `tag` (`experimental`→`beta`→`new`→`legacy`→`deprecated`→`removed`) e `maintainer` (`community` ou ausente). Compõem em vez de multiplicar rótulos. Mais tags inline por seção: `<BetaTag />`, `<RemovedTag />`… | O guia define **três portões** para admitir um valor novo no eixo — é doutrina no formato de axioma |
| **`fold` e `mark` por string no bloco de código** | `{{ mark: [2, [5,7]] }}`, `{{ fold: [[2,4,'setup']] }}`, `{{ collapsible: true }}`; `mark` também aceita **texto** em vez de número de linha | Realçar por conteúdo em vez de por número sobrevive à edição do exemplo |
| **Atributos em heading e imagem** | `## Título {{ toc: 'Curto' }}` / `{{ toc: false }}` / `{{ id: 'slug' }}`; `![alt](/img.png){{ dark: '/img-dark.png' }}` | O `dark:` em imagem é **obrigatório** dado o axioma 4 |
| **` ```npm ` auto-expandindo** | Uma cerca `npm` vira abas `npm`/`pnpm`/`yarn`/`bun` | Elimina a classe inteira de "esqueci de atualizar a aba do yarn" |
| **`<CompareYes/No/Partial/NotApplicable>`** | 85 usos, dentro de célula de tabela | Tabela de comparação é conteúdo obrigatório, e emoji não é acessível |
| **`<TutorialHero>`** | 91 usos. `beforeYouStart` (`{title, link, icon}[]`) e `exampleRepo` | Pré-requisitos e repo de exemplo como **contrato de dados**, não prosa solta |
| **`<Typedoc src>`** | 443 usos. Injeta MDX gerado do JSDoc de `clerk/javascript` | Fronteira editorial explícita: 443 blocos que ninguém edita à mão |
| **`search:` no frontmatter** | `exclude`, `rank`, `keywords[]` — palavras invisíveis ao leitor, com peso menor que título e corpo | Controle de indexação por página |

Duas notas de forma: o `<Include src>` do Clerk (951 usos, 201 partials) **não aceita parâmetros** — a parametrização vem do `<If sdk>` dentro do próprio partial. E tanto `<Cards>` quanto `<Properties>` (320 usos) são escritos como **lista Markdown separada por `---`**, não JSX aninhado — diff legível, sem prop escapando.

### Neon — geração a partir de contrato, e duas colunas por passo

Fonte primária: [`neondatabase/website`, `content/docs/README.md`](https://github.com/neondatabase/website/blob/main/content/docs/README.md), 878 linhas, sobre 627 arquivos `.md`.

**`<TwoColumnLayout>` é a melhor versão do layout prosa-mais-código dos três sites.** 10 blocos raiz, 410 tags da família:

```mdx
<TwoColumnLayout>
  <TwoColumnLayout.Step title="Install dependencies">
    <TwoColumnLayout.Block>
      Instale os pacotes necessários.
    </TwoColumnLayout.Block>
    <TwoColumnLayout.Block label="Terminal">
      ```bash
      npm install @neondatabase/neon-js
      ```
    </TwoColumnLayout.Block>
  </TwoColumnLayout.Step>

  <TwoColumnLayout.Footer>
    <Admonition type="note">Vale para as duas colunas.</Admonition>
  </TwoColumnLayout.Footer>
</TwoColumnLayout>
```

`.Step` é passo numerado; `.Item` é item não numerado com `title`, `method` e `id` (para referência de API); `.Block` é uma coluna, com `label` opcional que vira o cabeçalho do painel de código; `.Footer` ocupa a largura toda. Exige `layout: wide` no frontmatter.

Por que é melhor que o `Aside` do Fern e que o `Panel` do Mintlify: **o pareamento é por passo**, não um rail solto grudado na página. Cada passo tem seu par prosa|código, e o `.Footer` resolve o "isto vale para as duas colunas". Composição por namespace (`Componente.Sub`) mantém o MDX legível. É CSS grid — cabe no vanilla-first.

**`<CliUsage>` / `<CliOptions>` / `<CliSubcommands>` (113 / 111 / 33 usos) é o padrão de acoplamento a contrato mais bem resolvido da pesquisa.** O autor escreve `<CliOptions command="branches list" />` e o conteúdo sai de um `schema.json` versionado no repo. Duas propriedades que nem Fern nem Clerk expõem, lidas em [`src/components/pages/doc/cli-reference/renderers.js`](https://github.com/neondatabase/website/blob/main/src/components/pages/doc/cli-reference/renderers.js):

1. **Comando inexistente quebra o build** — *"Throws at build time so a typo in a doc page fails the build loudly instead of rendering an empty section."*
2. **O mesmo renderer alimenta o HTML e o espelho Markdown para agentes** — *"so the HTML page and the agent-facing markdown can never disagree."*

Não exige plataforma. Exige um `schema.json` no repo. Para qualquer superfície com contrato legível por máquina — CLI, schema de config, JSON Schema —, este é o padrão a copiar.

Demais deltas do Neon:

| Item | Usos | Por que vale |
| --- | ---: | --- |
| **`redirectFrom` no frontmatter** | 154 páginas | Redirect declarado **na página que o herda**, não num arquivo central. Reorganizar sem link quebrado, e o redirect morre junto com a página |
| **`<CheckList>` / `<CheckItem>`** | 9 | Único componente com **estado de progresso do leitor**: localStorage, e checklists de mesmo `title` **compartilham estado entre páginas** — vira trilha multi-página. Sem dependência |
| **`<InfoBlock>` + `<DocsList>`** | 49 / 101 | "O que você vai aprender / leitura relacionada / docs externos" como estrutura em vez de prosa |
| **Componentes compartilhados com props** | `<NeedHelp/>` sozinho tem 321 usos | Partial registrado como **componente nomeado**, não endereçado por caminho. `<NeedHelp/>` é superfície de autoria menor que `<Include src="…"/>` |
| **`<DefinitionList>`** | 5 | Preenche o degrau entre bullet e heading. `<dl>/<dt>/<dd>` semântico, WCAG H40, custo zero. Nenhum dos outros seis sites tem |
| **`<StickyTable>`** | 3 | O design é o certo: a tabela **continua Markdown**, o componente só adiciona cabeçalho flutuante. Wrapper de comportamento, não substituto de sintaxe |
| **Imagem sem borda por título de Markdown** | — | `![alt](/img.png 'no-border')` usa o atributo *title* como flag, mantendo a imagem renderizável no preview do GitHub |

**A ausência mais instrutiva do Neon**: com cerca de 30 frameworks e ORMs suportados, ele **não tem seletor de framework**. A escolha foi **uma página por framework** (`/docs/guides/nextjs`, `/docs/guides/django`, …) mais um bom índice. É o oposto exato da estratégia do Clerk, e vale como contraponto — a solução mais barata para "N frameworks" pode ser N páginas.

### Três coisas que nenhuma das sete referências tem

- **Condicional por plano ou por licença.** As três plataformas param em SDK, produto e versão; só o Fern chega a papel de usuário (`<If roles>`, exigindo RBAC e autenticação no site). O padrão observado para plano é **texto**: o Clerk manda declarar o add-on necessário no corpo de um callout.
- **Componente de changelog fora do Mintlify.** O Fern trata changelog como tipo de navegação; o Neon escreve `changelog.md` à mão. O `Update` do Mintlify é, dos três catálogos, o único componente de changelog — e tem 797 usos no Devin.
- **Qualquer forma de tabela que não seja Markdown na origem.** Sete sites, três plataformas, e todos mantêm a sintaxe de tabela do Markdown, envolvendo-a em componente quando precisam de comportamento. É consenso raro o bastante para tratar como restrição.



## O que esta pesquisa não fecha

Registrado como lacuna, não preenchido por inferência:

- **Motion e estado.** Este inventário mede estrutura, slots e cor. Transição de abertura do accordion, hover do card, foco de teclado e o comportamento em `prefers-reduced-motion` não foram medidos — são superfície de outro ticket.
- **Responsivo abaixo do breakpoint.** Sabe-se que `Columns` colapsa para uma coluna por container query, mas os pontos de quebra concretos não foram extraídos.
- **Densidade tipográfica.** Tamanhos foram lidos como classes utilitárias (`text-sm`, `text-base`) e traduzidos para o valor padrão do Tailwind. Para a spec, isso precisa virar medição de valor computado no navegador.
- **Os ícones de cada variante de callout.** Sabe-se que são SVG inline, um por variante, e que o `Callout` genérico e o caret do accordion usam `mask-image` de CDN. Os desenhos concretos dos seis ícones tipados não foram identificados.
- **Se o swizzle basta.** A afirmação de que os recursos ausentes do bloco de código cabem em swizzle do `classic` é hipótese, não achado.
- **A escolha do orçamento de ícones.** A pesquisa expõe as saídas e o custo de cada uma; não decide entre elas. Isso é decisão de mapa.
- **A implementação do seletor de SDK do Clerk.** `SDKSelector.tsx` e `SDK.tsx` moram em `clerk/clerk`, que não é público. O comportamento descrito vem do `CONTRIBUTING.md`, não do código.
- **`<If roles>` do Fern.** Documentado, sem uso observado em produção em nenhum repositório inspecionado.

