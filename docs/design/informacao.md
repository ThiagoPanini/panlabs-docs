# Arquitetura de informação

O acervo, a topologia, a árvore, os tipos de página, os orçamentos, as onze fixtures, a regra de locale e os artefatos AI-era.

**Documento reescrito inteiro pela árvore do `panlabs`.** O produto anterior — uma API de pagamentos fictícia — morreu, e com ele a árvore de seis categorias, a tab de receitas e as trinta páginas geradas de OpenAPI. O que sobreviveu foi a **forma**: tab é instância, categoria é clicável, tipo é convenção de conteúdo, fixture tem dona nomeada, e contagem que só vive em prosa envelhece calada.

**Nenhum valor numérico de desenho aparece aqui.** Os números deste documento são **contagens** — quantas tabs, quantas categorias, quantas páginas.

---

## 1. O acervo — `panlabs`

O registro pessoal de aprendizado de **um desenvolvedor dentro de uma empresa**, publicado no próprio namespace. Minúsculo, sem nome de produto acima dele.

**O nome resolve a mesma restrição dura que batizou o produto anterior:** `title` e `tagline` **não são traduzíveis** no Docusaurus, e o workaround que existe é declaradamente temporário e fora da API pública. Um namespace atravessa os dois locales sem tradução.

### 1.1 As três regras, e elas valem em toda página

**A empresa existe e nunca é nomeada.** Em string ela é `<empresa>`. **Redação é a assinatura do gênero**, não fraqueza — é assim que se publica conhecimento interno no próprio namespace. E a consequência é uma régua: **a plausibilidade não vem do empregador; vem da ferramenta.**

**O desenvolvedor não tem nome**, e nunca se apresenta. Não há onde pôr: sem blog, sem `authors.yml`, front matter de **dois campos** (`title` e `description`). Onde um handle é estruturalmente obrigatório, usa-se o namespace.

**A voz da casa é `você` + imperativo, zero primeira pessoa, sem exceção** — inclusive no índice de jornada, que narra tendo **o trabalho como sujeito**. O **"pessoal" do acervo é o critério de seleção, não a gramática**: o que o torna pessoal é *o que foi escolhido para documentar*, e isso é mais forte que primeira pessoa porque não depende de o autor ser simpático.

### 1.2 O cenário fecha em três strings

**GitHub Actions** (workflows em `.github/workflows/`), **AWS** e **Python**. Terraform, índice de pacotes interno e IAM caem sozinhos delas somadas às categorias — não são uma quarta escolha, são consequência.

**Vocabulário técnico é contrato, não prosa.** Dentro do pt-BR, termo técnico fica em inglês quando a tradução fica estranha: `pull request`, `runner`, `commit`, `branch`, `webhook`, `semver`.

### 1.3 A dívida herdada, e ela é restrição de implementação

O produto anterior vinha com **convenção conhecida** — pagamentos é o domínio de documentação mais clonado do mundo, e por isso dezenas de páginas plausíveis saíam sem inventar domínio a cada arquivo. **O acervo pessoal não tem gênero público.**

A consequência é direta e está cobrada: **o custo de gabarito sobe.** Cada tipo precisa de gabarito mais apertado do que precisava antes, senão a variação entre páginas vira ruído — e ruído não estressa layout, que é o produto.

*Dissenso registrado:* um acervo pessoal corre o risco oposto ao do pastiche — o de o leitor não reconhecer o gênero e ler cada página como texto avulso. Aceito porque o que segura a coerência aqui não é a convenção externa; é o gabarito, e ele é conferido por máquina (§4.2).

---

## 2. Topologia — três tabs, três instâncias, um-para-um

| Tab | Rota | Instância | Layout |
| --- | --- | --- | --- |
| **Jornadas** | `/jornadas` | `default` | padrão |
| **Procedimentos** | `/procedimentos` | `procedimentos` | padrão |
| **Ferramentas** | `/ferramentas` | `ferramentas` | padrão, e declara `docItemComponent` |

Tabs no navbar como `docSidebar`, cada uma trocando a sidebar inteira. Ver [`chrome.md`](chrome.md) §2.

**Uma instância por tab, e não uma instância com várias sidebars.** Uma instância *pode* expor várias sidebars, o que economizaria config. Recusado por duas razões mecânicas:

1. **`routeBasePath` é por instância.** Compartilhar jogaria as ferramentas em `/jornadas/ferramentas/…` — a URL deixaria de ler o eixo, e o eixo é a decisão inteira da navegação;
2. **versionamento é por instância.** É o que permitiria versionar uma tab só. O §5 dispensa versionamento por completo, mas foi a granularidade que tornou a análise possível.

**O eixo é a natureza do conteúdo**, e ele é mais forte aqui do que era antes: `Jornadas` diz **o que aconteceu**, `Procedimentos` diz **como se faz**, `Ferramentas` diz **o que saiu daqui**. Os três respondem perguntas diferentes do mesmo leitor.

### 2.1 `Ferramentas` declara `docItemComponent`, e as folhas dela não mudam de layout

**Verificado no código, não deduzido:** o `ApiDocItem` comuta **por página** pelo front matter `api_exemplos` e delega para `@theme/DocItem` quando o campo falta. A instância inteira o declara sem que nenhuma folha autoral mude de layout — as **15 autorais** não carregam o campo, e quem acende a outra perna são as **6 geradas** de `Biblioteca C`, e só elas.

É a segunda instância do projeto a usar a opção, e ela continua **degrau 2**: opção pública, custo de upgrade zero, zero swizzle. Ver [ADR 2](../adr/0002-politica-de-swizzle.md).

### 2.2 A classe de instância existe, e continua não sendo usada

O `<html>` de uma página de doc carrega classe por **plugin** (`plugin-docs`), por **instância** (`plugin-id-default`, `plugin-id-procedimentos`, `plugin-id-ferramentas`), por **versão**, por **tipo de página** e por **documento**.

Nada em `src/css/` escopa por instância, e nada deveria:

> **Escopar por instância é escopar por *onde a página está*, quando o que importa é *o que a página é*.** As três tabs compartilham o mesmo layout de página; o que rompe layout é o ramo gerado, e ele rompe por `docItemComponent`, que é opção pública. Uma regra `plugin-id-ferramentas` seria a segunda fonte de verdade para uma decisão que o componente de rota já toma.

A porta fica **aberta e não usada**, o que é diferente de fechada.

---

## 3. A árvore — 2 · 5 · 4, teto de profundidade 3

```
Jornadas              Procedimentos        Ferramentas
├ API Owner           ├ Ambiente           ├ Bibliotecas
└ Security Champion   ├ Esteiras           │ ├ Biblioteca A
                      ├ Infraestrutura     │ ├ Biblioteca B
                      ├ Acessos            │ └ Biblioteca C   ← nível 3
                      └ Diagnóstico        ├ Módulos Terraform
                                           ├ Skills
                                           └ Servidores MCP
```

| Aba | Categorias | Páginas pt-BR | EN |
| --- | ---: | ---: | ---: |
| `Jornadas` | 2 | **12** (2 índices + 10 capítulos) | — |
| `Procedimentos` | 5 | **19** (5 índices + 14 folhas) | — |
| `Ferramentas` | 4 | **21** (15 autorais + 6 geradas) | **21** |
| | **11** | **52** | **21** |

**A árvore está fechada: 46 autorais mais 6 geradas, e o EN em 21.** O ramo gerado de `Biblioteca C` chegou pelo contrato de assinatura, e com ele `Bibliotecas` fecha em 13, `Ferramentas` em 21 e o site em **52**. O portão 4 cobra os quatro números.

> **Correção de aritmética contra a resolução, e ela continua valendo lida ao contrário.** A resolução pedia *"46 páginas autorais em pt-BR e 21 em EN"*, e os dois números não podiam valer juntos: as 6 geradas estão **fora** do 46 e **dentro** do 21. Elas chegaram no mesmo commit nos dois locales, então hoje o pt-BR tem 52 e o EN tem 21 — e a diferença é exatamente as 31 páginas de `Jornadas` e `Procedimentos`, que não se traduzem.

**A contagem desigual das jornadas é de propósito** — `API Owner` com 6 capítulos e `Security Champion` com 4. Arco de papel não tem comprimento fixo, e duas jornadas com o mesmo número leem como formulário preenchido duas vezes.

**`Ferramentas` é a única aba com nível 3**, e ele existe onde uma ferramenta tem mais de uma página: `Bibliotecas › Biblioteca C`. As outras três famílias são categoria → folha.

### 3.1 O teto de profundidade sobe de 2 para 3, e o que destravou foi a redação

O teto anterior era 2, e o argumento forte dele não era medição — era a **regra de ícone**: *obrigatório na categoria de topo, ausente na folha*. Num terceiro nível o nó do meio não é nem uma coisa nem outra, e a regra não tinha leitura.

**A regra foi reescrita para *ícone só no nó de topo da sidebar*.** Ela decide o caso intermediário por construção, em vez de proibi-lo — e com isso o teto de 2 perdeu a razão de existir. Ver [`icones.md`](icones.md) §8.

**O nível 3 é usado uma vez, e o portão 4 cobra que seja uma.** Um teto que se declara e não se confere é um teto que sobe sozinho.

### 3.2 A categoria é clicável e aponta para o índice

| Jornadas | aponta para | Procedimentos | aponta para | Ferramentas | aponta para |
| --- | --- | --- | --- | --- | --- |
| API Owner | `Índice` | Ambiente | `Índice` | Bibliotecas | `Índice` |
| Security Champion | `Índice` | Esteiras | `Índice` | Biblioteca C | `Visão geral` |
| | | Infraestrutura | `Índice` | Módulos Terraform | `Índice` |
| | | Acessos | `Índice` | Skills | `Índice` |
| | | Diagnóstico | `Índice de sintomas` | Servidores MCP | `Índice` |

Três fatos verificados na fonte sustentam o modelo:

1. **Categoria com link não perde o colapso.** O botão de caret é elemento separado do link — o rótulo navega, o caret colapsa;
2. **Categoria sem link não é inerte de verdade.** O Docusaurus aponta para o primeiro filho quando não há navegador. O modelo *"não é página"* se comporta como página no SSR e muda de comportamento no cliente;
3. **O rótulo da categoria é quem carrega o ícone.** Fazer o elemento mais proeminente da sidebar ser um **destino** em vez de um toggle é melhor.

**Todas com `collapsed: false`** — a árvore inteira aberta, como a âncora.

**Duas categorias apontam para página que carrega tipo de verdade**, e não para uma forma de índice: `Diagnóstico › Índice de sintomas` é `Troubleshooting`, e `Biblioteca C › Visão geral` é `Quickstart`. Forma e tipo são eixos diferentes; quando discordam, quem manda no número do §6.2 é o tipo.

### 3.3 O que existe, e o que falta

| Estado | O quê | Dono |
| --- | --- | --- |
| escrito | `Jornadas` inteira — 2 índices e 10 capítulos | este ticket |
| escrito | `Procedimentos` inteira — 5 índices e 14 folhas | este ticket |
| escrito | as **15 folhas autorais** de `Ferramentas`, nos dois locales | este ticket |
| escrito | as **6 páginas geradas** de `Biblioteca C` e o fragmento de sidebar | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) |

**O ramo gerado não é escrito à mão.** Ele sai de um contrato de assinatura de função, tipo e módulo, e o gerador emite também o fragmento de sidebar que `sidebars-ferramentas.js` importa — escrevê-lo à mão seria exatamente a segunda fonte de verdade que o gerador existe para impedir. Ver [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md), que supera o [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md).

**Os onze pares seção→ícone estão inteiros no manifesto e no CSS**, e o vendorizador confere que os três lugares onde eles vivem — manifesto, `className` de sidebar e regra de máscara — concordam.

### 3.4 Categoria sem filhos vira link, e o CSS precisa saber disso

**Medido no artefato.** Uma categoria declarada com lista de itens vazia é **normalizada para link** pelo Docusaurus: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável. O caret some, e some com razão.

O CSS de sidebar cobre as duas formas. O marcador é o `className` do manifesto, não o nível — `.sidebar-icone` **é** a definição de *nó de topo* neste sistema. **Nenhuma das onze categorias está vazia hoje**, então a regra é **cobertura sem fixture**, escrita para não ser removida por parecer morta.

---

## 4. A regra de heading, que é decisão de layout disfarçada de conteúdo

> **Toda página carrega no mínimo três `##`.** Dois gabaritos abrem teto próprio, e **nenhum dos dois é exceção**: `Receita` fica em no máximo um, e o índice de jornada em exatamente dois — que são os dois headings literais obrigatórios dele.

Não é estilo. É a regra que produz as configurações de TOC que provam a medida constante da coluna.

**Correção de premissa, medida em 3.10.2 e mantida:** a classe de 75% é aplicada sempre que `hide_table_of_contents` não está no front matter, **independentemente de haver heading**. O que depende de heading é a coluna do TOC. A tabela completa está em [`chrome.md`](chrome.md) §1.5.

### 4.1 A exceção é uma só, e é nomeada

> **`Procedimentos › Ambiente › Índice` carrega ZERO `##`.** É a única página abaixo do próprio piso sem que um gabarito a autorize, e ela está lá de propósito.

**Ela trocou de dona nesta spec.** A fixture morava em `Comece aqui › Ambientes`, que é página do produto anterior e morreu com a árvore. Foi para o índice de `Ambiente`, e o custo em página é **zero** — a prova é a mesma, e ela nunca foi o cartão: é o `.col` travado no mesmo pixel com ou sem TOC, **confirmado ao vivo contra o próprio Devin**, que reserva a largura da coluna de TOC mesmo vazia.

**Exceção anônima é buraco; exceção nomeada é decisão.** É por isso que ela está escrita aqui, no `sidebars-procedimentos.js` e no portão — e é por isso que a segunda reprova.

**Teto que sai de gabarito não é exceção.** `Receita` em no máximo um `##` e o índice de jornada em exatamente dois são **orçamento do tipo**, e o portão os trata como tal. Exceção é a página que rompe a própria forma, e ela é uma.

### 4.2 O portão 4 — a régua de máquina das contagens

Os critérios desta seção, do §6, do §7 e do §8 são todos **contagens**, e contagem que só existe em prosa é contagem que envelhece calada. Uma página a mais em `Esteiras` não quebra build nenhum; ela só faz este documento passar a mentir.

`scripts/portao-4-conteudo.sh` cobra **doze** coisas, na cadência de commit:

| # | O que confere |
| ---: | --- |
| 1 | o volume por aba e por categoria — 12 · 19 · 21, e **52** no total |
| 2 | **o tipo de cada página, e o orçamento estrutural dele** — um `Guia` sem `<Steps>` reprova |
| 3 | a regra de heading, com a exceção nomeada acima como **única** |
| 4 | **`<Steps>` ausente em toda `Jornadas`** |
| 5 | **`<CardGroup>` ausente** nos dois índices de jornada, e os headings literais `## Como foi` e `## O que não funcionou` presentes |
| 6 | **prosa entre o `# h1` e o primeiro `##`** em todo capítulo |
| 7 | a lista ordenada de `## Como foi` com **exatamente N itens para N capítulos** |
| 8 | **exatamente uma palavra de estado** na abertura de cada índice de jornada |
| 9 | o marcador de tradução em **31** páginas, e em nenhuma tradução |
| 10 | **`description` presente em 100%** das páginas |
| 11 | **as onze fixtures existem**, por caminho nomeado |
| 12 | **os dez tipos têm instância** — e nenhum fica pendente |

As contagens ignoram bloco cercado, senão um `##` de comentário ou um `<Steps>` citado dentro de um trecho de código contariam.

**A cerca indentada conta, e isso é correção de fato contra a versão anterior do portão.** Ela casava `^``` ` enquanto a função que rastreia *"estou dentro de uma cerca?"* casava `^[[:space:]]*``` `. Uma cerca dentro de `<Steps>` abria e fechava o estado sem nunca ser contada como bloco. O desacordo era inofensivo enquanto o `<Steps>` carregava pouco código; na árvore nova ele carrega quase todo o código dos guias, e a contagem saía pela metade. Indentar cerca dentro de JSX é seguro: **o MDX desliga o bloco de código por indentação**, que é exatamente o que permite indentar Markdown dentro de um componente.

**Proibição por localização é classe de regra nova neste projeto.** Até aqui gabarito **exigia** e **limitava**; nenhum dizia *"aqui não entra"*. As linhas 4 e 5 são teto de zero, e existem onde a alternativa era confiar em bom senso.

**O tipo de cada página mora no portão, e não no conteúdo.** O §6 trava que tipo é convenção de conteúdo e **zero layout** — sem front matter `type:`, sem classe CSS por tipo. Um manifesto de build não é nenhum dos dois: ele não toca a página nem o CSS, e não existe no artefato publicado.

**A coluna de palavras não é cobrada, e a de estrutura é.** Palavra é proxy ruim, e cobrar por máquina um número que as páginas de código não têm por que bater só produziria prosa de enchimento.

**`onBrokenAnchors: 'throw'` continua na config**, e a consequência de contrato vale repetida: **toda âncora citada por um link é declarada com `{#id}` no próprio heading**, em vez de depender de como o slugger trata acento. A tabela de sintomas de `Diagnóstico › Índice de sintomas` é quem exercita isso.

---

## 5. Versionamento — nenhum

Não existe `versions.json`, `versioned_docs/`, `versioned_sidebars/` nem seletor de versão. Uma árvore por instância.

Isto **reverte** a leitura da pesquisa, que recomendava duas versões como demonstração de mecânica. A revisão foi feita contra a própria base de evidências dela: **seis das sete referências não têm seletor de versão nenhum**. E a doc oficial diz, verbatim, que *"most of the time, you don't need versioning as it will just increase your build time, and introduce complexity to your codebase"*.

**Mas os artefatos continuam versionados — as ferramentas, não a documentação.** Pacote e módulo carregam semver, a política está escrita em `Jornadas › API Owner › A política de versão`, e o `Changelog` de `Biblioteca C` é o único lugar onde a mudança se comunica. Custa uma página e zero build.

O que isso simplifica, em ordem de tamanho:

1. **A busca perde uma obrigação inteira.** Sem versão, o índice só precisa do locale — e locale sai de graça, um diretório de saída por locale;
2. a armadilha do snapshot assimétrico deixa de existir;
3. o navbar devolve o espaço do seletor;
4. três árvores de conteúdo em vez de sete.

**O que se perde, verificado e menor do que parecia:** `DocVersionBanner` e `DocVersionBadge` nunca aparecem no artefato. Os dois nomes estão escritos aqui de propósito — uma ausência que só existe descrita não é greppável pelo próximo agente que vier procurar por ela.

São, respectivamente, `alert alert--warning` e `badge badge--secondary` — **classes puras do Infima**, cobertas pelas regras de token que a spec precisa ter de qualquer jeito. Registrado como **ausência conhecida**, não omissão.

---

## 6. Tipos de página — dez, todos convenção de conteúdo

São dez, todos **convenção de conteúdo e zero layout**: sem front matter de tipo, sem classe CSS por tipo, sem componente próprio.

> **O site inteiro tem exatamente duas rupturas de layout:** o ramo gerado de `Biblioteca C` e a landing. **Nenhuma terceira nasce de um tipo.**

### 6.1 Os dez gabaritos

| Tipo | Onde vive | Gabarito |
| --- | --- | --- |
| **Quickstart** | `Biblioteca C › Visão geral` | intro curta → `<Steps>` com código em cada passo → `<CardGroup>` de próximos passos |
| **Conceitual** | Infraestrutura, Diagnóstico, `Biblioteca C` | definição → por que existe → como aparece no artefato → armadilhas em `callout` |
| **Guia** | folhas de `Procedimentos` e `Ferramentas` | pré-requisitos → `<Steps>` → verificação → variações |
| **SDK** | `Biblioteca A` · `Biblioteca B` · `Servidor de catálogo MCP` | instalação em `<CodeGroup>` por gerenciador → configuração → uso → tratamento de erro |
| **Referência de API** | `Biblioteca C`, ramo gerado | **gerada** do contrato de assinatura — o gabarito é a saída do gerador |
| **Receita** | `Skills` | o problema em uma frase → código completo copiável → no máximo 1 `##` |
| **Catálogo** | `Ambiente`, `Acessos` | intro curta → como ler a tabela → **a tabela larga** → notas |
| **Troubleshooting** | `Diagnóstico` | tabela de sintomas → uma seção por sintoma: causa, comando que confirma |
| **Changelog** | `Biblioteca C › Changelog` | cronologia reversa, uma entrada por versão publicada |
| **Índice de jornada** | os 2 índices de `Jornadas` | ver §6.4 — o décimo tipo |

**Três retipos que esta spec adjudicou.** As três páginas autorais de `Biblioteca C` estavam tipadas como `Referência de API`, cujo gabarito é literalmente *"a saída do gerador"* — incoerente para página escrita à mão. `Visão geral` vira **Quickstart**, `Instalação e configuração` vira **Guia**, `Tratamento de erros` vira **Conceitual**. Isso **resgata o `Quickstart`**, que estava órfão desde que a aba `Comece aqui` morreu, e mantém os dez tipos com instância.

### 6.2 O orçamento é de estrutura, e a palavra é indicativa

**A coluna que obriga é a de estrutura.** O que estressa layout é contagem de estrutura, e *palavra é proxy ruim*. É a coluna de estrutura que o portão 4 confere, página por página.

**A coluna de palavras é indicativa**, e diz o tamanho que o tipo costuma ter. Ela não é cobrada por máquina, e por um motivo específico: as páginas cujo corpo é código — `SDK`, `Receita`, e a `Conceitual` que carrega a fixture de bloco longo — ficam abaixo da faixa **porque o código é o conteúdo**.

| Tipo | Palavras | Estrutura mínima | Quantas neste artefato |
| --- | --- | --- | ---: |
| Quickstart | 500-700 | 1 `<Steps>` de 5 passos · 5 blocos · 2 `:::` · 1 `<CardGroup>` | 1 |
| Conceitual | 700-1000 | 2 blocos · 1 `:::` · 1 tabela · 3-6 `##` | 3 |
| Guia | 600-900 | 1 `<Steps>` · 3 blocos · 2 `:::` | **11** |
| SDK | 400-600 | 1 `<CodeGroup>` de instalação · 4 blocos | 3 |
| Receita | 150-250 | 1 bloco **longo** · no máximo 1 `##` | 2 |
| Catálogo | 200-300 | 1 tabela de 20-40 linhas × 4-5 colunas | 2 |
| Troubleshooting | 800-1200 | 1 tabela de sintomas · 3-8 `##` | 3 |
| Changelog | — | 6-8 entradas em `<Update>` | 1 |
| Referência de API | — | a saída do gerador | **6 — geradas** |
| *índice de jornada* | 250-400 | ver §6.4 | 2 |
| *capítulo de jornada* | 180-1800 | 3-6 `##` · 2 blocos · 1 `:::` · prosa antes do 1º `##` · **sem `<Steps>`** | 10 |
| *índice de categoria* | piso do tipo da seção | + um índice das folhas | 8 |
| *a fixture de página curta* | ~120 | nenhuma — ver §4.1 | 1 |
| | | **total autoral** | **46** |

> **Correção de contagem contra a resolução.** Ela dizia *"Guia — doze folhas de `Procedimentos` e `Ferramentas`"*. Contado contra a árvore fechada: `Procedimentos` tem 14 folhas, das quais 2 são `Catálogo`, 2 `Conceitual` e 2 `Troubleshooting`, sobrando **8** guias; `Ferramentas` tem 11 folhas, das quais 3 SDK, 1 Quickstart, 1 Conceitual, 1 Changelog e 2 Receita, sobrando **3**. São **onze**, não doze.

**Os dez tipos têm instância neste artefato**, e o décimo é o único gerado. O portão 4 passou a cobrar a pendência **pelo avesso**: as seis existem, e nenhuma delas pode aparecer no manifesto de tipo — uma linha ali seria página escrita à mão sob o gabarito *a saída do gerador*, que é a incoerência que o §6.1 já adjudicou uma vez.

### 6.3 O índice de categoria é uma forma, não um tipo

**Oito páginas de entrada** — quatro em `Procedimentos` e quatro em `Ferramentas` — são **o tipo da seção no piso do orçamento, mais um índice das folhas**. Não ganham gabarito próprio, e é deliberado: um tipo cujo único traço distintivo é *ser curto* seria um tipo que só existe para explicar por que os outros não se aplicam.

**O nono índice carrega tipo de verdade.** `Diagnóstico › Índice de sintomas` é a tabela de sintomas do gabarito de `Troubleshooting`, e é contado lá. Forma e tipo são eixos diferentes; quando discordam, quem manda no número é o tipo. O mesmo vale para `Biblioteca C › Visão geral`, que é destino de categoria **e** `Quickstart`.

**`capítulo` também é forma, e não um décimo primeiro tipo.** Ele tem gabarito próprio — e um gabarito apertado, porque é a folha mais numerosa do acervo —, mas o que ele descreve é *como uma folha de `Jornadas` se escreve*, não uma classe de conteúdo que exista noutra aba. A distinção é a mesma do índice de categoria: gabarito sem tipo.

### 6.4 O décimo tipo — o índice de jornada

```
# <Nome da jornada>
<Untranslated />

<abertura: o período e o estado — uma ou duas frases>

## Como foi
1. <marco temporal> — <link do capítulo> — <uma linha>
2. …

## O que não funcionou
<2 a 4 entradas: o que foi tentado, e por que caiu>
```

**Duas seções obrigatórias que nenhum outro tipo tem**, e os dois headings são **literais** — o portão os casa palavra por palavra, porque um sinônimo aqui apaga o traço sem mudar nada visível.

**`<CardGroup>` é proibido, e este é o nó.** Grade não tem ordem: o leitor não sabe se lê na horizontal ou na vertical. O traço que justifica o tipo é **ordenar por tempo**, e uma página que ordenasse por tempo e renderizasse em grade **não mostraria o traço**. Tempo precisa de linha, e lista ordenada é a linha.

**A contradição aparente com o §6.3 não existe, e vale escrita com as palavras que o mapa exigiu:** a regra do §6.3 continua valendo e o índice de jornada **não a viola**, porque o traço dele não é ser curto nem ter voz — é carregar **duas seções obrigatórias que nenhum outro tipo tem**, e ele é **mais longo** que o piso do índice de categoria, não mais curto.

**Estado é conteúdo, e o vocabulário fecha em dois:** `Em curso` · `Encerrada`, **uma palavra** na abertura, cobrada pelo portão. `Abandonada` foi escrita e removida: com duas jornadas ela não teria instância, e **vocabulário sem consumidor é o defeito que este projeto mata por nome**.

É a única página do site sem nenhum componente do catálogo além do `<Untranslated />`.

### 6.5 O capítulo, e a fronteira entre duas abas

**Gabarito:** parágrafo de contexto **antes do primeiro heading**, espinha de **3 a 6 `##`**, 2 blocos, 1 `:::`. **`<Steps>` proibido.**

A proibição é a **fronteira entre duas abas**, escrita como regra conferível:

> **`Procedimentos` diz como se faz. `Jornadas` diz o que aconteceu e o que ficou.**

Se um capítulo pode carregar `<Steps>`, o leitor abre a página e não consegue dizer por que ela não está na outra aba.

**O capítulo não registra fracasso** — ele ensina o que funciona. Beco sem saída é do índice, e é essa divisão que mantém o traço do décimo tipo exclusivo: se o capítulo também listasse o que não funcionou, `## O que não funcionou` deixaria de ser um traço e viraria um hábito.

---

## 7. As onze fixtures — cada caso difícil com uma dona nomeada

**Cada caso difícil tem exatamente uma página dona, nomeada.** Não *"algumas páginas terão tabelas largas"* — *esta* página é a fixture da tabela larga. A spec aponta para o artefato em vez de descrever a hipótese, e quem implementa sabe onde olhar para saber se acertou.

**Eram treze. São onze, e nenhuma morreu pelo cartão.**

| Caso | Página dona | O que prova |
| --- | --- | --- |
| Tabela larga | `Acessos › Permissões por papel` — 40 × 5 | scroll horizontal dentro da coluna de prosa |
| Tabela como página inteira | `Ambiente › Comparativo dev/staging/prod` | o tipo `Catálogo` com prosa quase nula |
| Bloco de código longo | `Esteiras › Verificar a assinatura HMAC` | altura, `<CodeGroup>` e o título nu |
| **Página muito curta** | **`Ambiente › Índice`** — ~120 palavras, zero `##` | **a coluna no mesmo pixel sem coluna de TOC** |
| Prosa pura | `Jornadas › Security Champion › Índice` | a medida de prosa sozinha, sem nada para escondê-la |
| Item de sidebar mais largo | `Security Champion › A varredura que reprovava tudo` — 30 caracteres | wrap ou truncamento no item, com ícone à esquerda |
| Prosa mínima, código máximo | `Skills › Scaffold de esteira` | o escape de medida com um bloco só, muito longo |
| Fallback silencioso de locale | `/en/jornadas/api-owner/a-politica-de-versao` | `<Untranslated />` e texto pt-BR sob rota EN |
| Aninhamento profundo | `Infraestrutura › O output de um módulo` — quatro níveis | `<ResponseField>` sobre `<Expandable>` |
| Página muito longa | `API Owner › O contrato que não existia` — ~1800 palavras | TOC longo, `sticky` e scroll-spy |
| Painel direito vazio | `Biblioteca C › Instalação e configuração` | `ApiDocItem` na perna que **delega** — o painel é inalcançável, não vazio |

**Duas fixtures morrem, e nenhuma pelo cartão.** `Sidebar longa` — nenhuma aba nova chega perto das 33 linhas da árvore anterior, e este artefato **não inventa página para forçar o número**. `Navbar apertado` — a faixa de tabs saiu da navbar e levou o aperto junto.

**Nenhuma fixture nova nasce.** Tabela sem moldura e código sem breakout se absorvem nas donas já nomeadas, e o limiar do TOC é chrome genérico, não conteúdo.

### 7.1 Os quatro casos que o domínio novo cobre, e que não são fixture

O domínio anterior cobria quatro buracos de layout; o acervo cobre os mesmos e mais quatro. **Eles têm dona nomeada e são cobrados pelo portão, e ainda assim não entram na contagem de fixtures** — uma fixture nasce de um teto de layout que precisa de prova; estes nascem de o domínio ter mais textura.

| Caso | Página dona |
| --- | --- |
| Saída literal de terminal | `API Owner › O schema que mudou sem aviso` |
| Várias linguagens na mesma página | `Diagnóstico › O mesmo erro em três formas` |
| Diff | `Diagnóstico › O diff que resolveu` |
| Comprimento muito desigual entre irmãos | o par `O contrato que não existia` (~1800) e `O que o contrato não cobre` (~180) |

O último compartilha dona com a fixture de página muito longa, e é por isso que ele é **caso** e não fixture: o lado longo do par prova *página muito longa* sozinho — TOC longo, `sticky`, scroll-spy —, e o que o par prova junto é a desigualdade. Contá-lo como fixture faria a lista fechar em doze, e são onze; o portão 4 cobra os dois números separados, onze e quatro.

### 7.2 A regra de desempate, com UMA exceção

> **Quando a fixture e o orçamento discordam, ganha a fixture.**

O orçamento existe para produzir páginas plausíveis; a fixture existe para provar uma medida.

**A exceção é uma só, e é a mesma da regra de heading:** `Ambiente › Índice`, que fica em zero `##` contra o piso de três.

**Eram duas.** A segunda era `Conceitos › Conciliação`, que ficava abaixo do orçamento de `Conceitual` para exercitar prosa pura. Ela **não tem sucessora**, e não por esquecimento: a fixture de prosa pura foi para o **índice de jornada**, que é um tipo que já nasce sem nenhum componente do catálogo. O conflito deixou de existir em vez de ser transferido.

---

## 8. Locale — só `Ferramentas`

A regra: **traduz-se o que é consumido por outros times.**

A fronteira é **audiência do artefato**, e não infra pública contra corporativa: biblioteca, módulo, skill e servidor MCP nascem na mesma esteira que tudo, mas são **consumidos fora da equipe que os escreveu**, e é isso que lhes dá leitor de inglês. Jornada é registro pessoal; procedimento é da casa. Nenhum dos dois tem leitor fora.

| Traduzido para EN | Só pt-BR |
| --- | --- |
| `Ferramentas` — **21**: 15 autorais e 6 geradas | `Jornadas` 12 · `Procedimentos` 19 |
| **21** | **31** |

**31 páginas carregam o marcador de fallback.** *(Correção de aritmética: a contagem anterior dizia 36 porque somava os cinco índices de `Procedimentos` duas vezes.)*

### 8.1 A sinalização se resolve sozinha, e é isso que a torna barata

A página não traduzida é gerada **em silêncio**, com o texto em português, sem aviso e sem relatório. Uma spec que nunca exercita esse estado não decidiu nada sobre ele; só não esbarrou nele.

A sinalização é um componente de conteúdo que lê o locale corrente e devolve nada em pt-BR. A mecânica se resolve sozinha porque **a tradução substitui o arquivo inteiro**: o marcador escrito no fonte pt-BR aparece em `/en/` exatamente enquanto não houver contraparte, e some no instante em que houver.

A convenção de autoria que fecha o contrato é de uma linha:

> **Todo arquivo sem contraparte em EN abre com `<Untranslated />` logo abaixo do `# h1`. Nenhum arquivo de tradução o carrega, e nenhum arquivo de `Ferramentas` o carrega.**

**A convenção apertou, e a mudança é consequência de o locale ter fronteira.** A redação anterior era *"todo fonte pt-BR"*, e ela valia quando a fronteira do locale cortava seções dentro de uma mesma aba. Agora ela corta abas inteiras: as 15 de `Ferramentas` nascem traduzidas, e marcá-las carimbaria um estado que elas nunca terão. As duas metades — quem marca e quem não marca — são cobradas pelo portão 4.

### 8.2 O que é traduzível fora do conteúdo

| Superfície | Onde a tradução mora |
| --- | --- |
| Rótulos das três tabs, e **a marca** | `i18n/en/docusaurus-theme-classic/navbar.json` |
| Links e copyright do footer | `i18n/en/docusaurus-theme-classic/footer.json` |
| Rótulos das categorias de sidebar | `i18n/en/docusaurus-plugin-content-docs-<id>/current.json` |
| Texto dentro dos componentes do catálogo | `i18n/en/code.json` |
| **`title` e `tagline`** | **não são traduzíveis** — e é por isso que o acervo se chama `panlabs` |

**A marca entrou na lista, e ela é o wrinkle deste ticket.** `navbar.title` **é** string traduzível, e entra em `navbar.json` como qualquer rótulo. `panlabs` tem de ficar **idêntica nos dois locales** — é a razão de o nome ter sido escolhido, e traduzi-la desfaria a decisão do §1 por acidente de gerador.

**O gerador de traduções emite mais arquivos do que o site consome, e só os consumidos entram no repo.** A instância `default` (`Jornadas`) não tem `current.json`: os dois rótulos de categoria dela — `API Owner` e `Security Champion` — são idênticos nos dois locales, e o único outro conteúdo do arquivo seria o rótulo de versão, que **nada renderiza**. Arquivo de tradução sem string traduzível é a mesma classe de defeito das variáveis inertes do Infima. A regra é *o que tem consumidor entra inteiro; o que não tem não entra*.

**A sidebar de uma aba não traduzida ainda é traduzida.** `Procedimentos` não tem uma página em EN e tem `current.json`: o rótulo de categoria é **chrome**, e chrome não cai no fallback junto com o conteúdo. Uma sidebar em inglês levando a páginas em português é exatamente o estado que o `<Untranslated />` anuncia.

**O que também não se traduz, por decisão e não por limitação:** nome de pacote, nome de comando, nome de campo e identificador de papel. `panlabs-catalogo`, `papel-<equipe>-leitura-dev` e `AWSPREVIOUS` são contrato, não prosa — traduzi-los produziria um leitor de EN escrevendo comando que não roda.

---

## 9. Artefatos AI-era

`.md` por rota, `llms.txt` e `llms-full.txt`. **Este documento é o dono deles**, e o motivo é que os três são artefato de **conteúdo**, não de chrome: são a mesma árvore servida noutro formato, e é a arquitetura de informação quem sabe qual é a árvore.

[`chrome.md`](chrome.md) fica com **uma linha**, pelo link do rodapé, e nada mais.

Os três saem de um plugin de caminho, `src/plugins/ai-era/` — **zero swizzle, zero dependência, zero serviço**. Ele lê a mesma porta que a busca (`src/plugins/paginas.js`, ver [`busca.md`](busca.md) §1) e escreve no `postBuild`.

### 9.1 O `.md` por rota

**O caminho é `permalink + '.md'`, concatenação pura.** Nenhuma transformação, e é o [ADR 7](../adr/0007-trailingslash-false.md) que a torna possível: sob `trailingSlash: false` o permalink já vem sem barra.

Três decisões mecânicas, e as três estão no ADR 7:

- **os permalinks saem de `allContentLoaded`**, não de `postBuild({routesPaths})` — `routesPaths[0]` é sempre `/404.html`, e a API carrega TODO de depreciação para a v4;
- **`applyTrailingSlash` não é importado.** Ele existe e é exportado, mas não tem página de doc oficial nem semver documentada — e sob `false` seria no-op de qualquer forma;
- **os arquivos são escritos no `outDir`, não em `static/`.** Commita-se artefato que muda por **decisão**; um `.md` que muda toda vez que a prosa muda seriam dezenas de arquivos de ruído em todo diff de conteúdo.

**Perda aceita e nomeada:** em `docusaurus start` as rotas `.md` não existem e devolvem **200 com o shell da SPA** — não 404. É recurso de build, e quem o verifica é o portão 6 rota 2, contra o host real.

O corpo servido é o MDX **quase cru**: front matter fora, `import`/`export` do topo fora por regex, e nada mais. **Não é preciso transformador de AST** — o estado da arte serve MDX quase cru, e a tag `<ParamField>` que sobra diz à máquina exatamente o que ela é.

> *Do topo* não é detalhe de redação. Uma varredura global comeria um `import` de exemplo dentro de bloco cercado, o `.md` sairia com o código mutilado, e o build passaria. Hoje nenhum arquivo de `conteudo/` importa nada — a remoção é o que mantém a promessa verdadeira quando alguém esquecer.

### 9.2 O ponteiro de volta

**Cada `.md` abre com uma linha apontando para o `llms.txt` e para a própria página.** É o que transforma arquivos soltos em grafo navegável: quem chega num `.md` por link direto descobre que existe uma lista, e a máquina que o lê acha o resto do site.

Sem ele, os arquivos são becos sem saída.

### 9.3 `llms.txt` — a lista de links

Título, tagline, preâmbulo global, e uma seção `##` por tab com um item por página: rótulo, URL do `.md`, e a description.

**O rótulo da seção é o do navbar**, lido de `themeConfig` e não declarado numa opção do plugin. São a mesma decisão — e o rótulo do navbar já chega **traduzido**, porque o core aplica `translateThemeConfig` antes de `allContentLoaded` rodar.

**`## Optional` não é usada.** Ela tem significado especial na spec do llms.txt — *pode ser pulada se o contexto for curto* — e nenhuma das três referências medidas a usa.

### 9.4 `llms-full.txt` — na forma do Neon

A mesma abertura, e depois o conteúdo inteiro, documento a documento:

```
--- [Document source](https://…/procedimentos/acessos/rotacionar-uma-chave) ---

> Summary: Trocar uma chave em uso sem derrubar quem a lê, com janela…

# Rotacionar uma chave

…
```

**É a única das três formas medidas que é inequívoca para máquina.** O separador carrega a URL de origem, então o parser não precisa inferir onde um documento termina nem de onde ele veio.

### 9.5 O preâmbulo global sai em pt-BR nos dois locales

Ele diz o que a máquina tem em mãos: quantas páginas, por qual eixo estão divididas, que toda página é servida como Markdown, e que **o `panlabs` é ficção**. A última linha não é modéstia — sem ela, um assistente responde sobre as bibliotecas do acervo como se elas existissem. Ela também diz que **a empresa nunca é nomeada**, porque um leitor de máquina que tentasse deduzi-la produziria exatamente a atribuição falsa que o §1.1 existe para evitar.

**Ele não é traduzido, e é a mesma regra do §8.** As 31 páginas sem contraparte em inglês também saem em português sob `/en/`; o preâmbulo é a mesma classe de fallback, num artefato cujo leitor é máquina. O que **tem** tradução chega traduzido: título, description e rótulo de seção.

A rota para mudar isso fica registrada e não foi comprada: `getTranslationFiles` + `translateContent` no plugin põem a prosa em `i18n/<locale>/sd-ai-era/`.

### 9.6 O `Content-Type` do host, e o segundo link do footer

**O portão 6 rota 2 vive aqui:** `GET <base>/<qualquer>.md` precisa devolver `200 text/markdown` com disposição diferente de `attachment`. As três rotas rodam nos **dois locales** — o `.md` é escrito por locale, num `outDir` diferente, e o baseUrl do EN carrega o prefixo. É exatamente onde a concatenação erraria sem ninguém ver.

**Armadilha registrada, e ela vale repetida:** `docusaurus serve` **não testa isso.** Ele aplica `applyTrailingSlash` ao `req.url` e passa `cleanUrls: true` ao `serve-handler` — valida a config, não o host.

**O footer caiu de quatro links para dois**, e os dois que saíram saíram com o produto: `Status` apontava para um host e `Suporte` para uma caixa de e-mail que o acervo não tem — a empresa **nunca é nomeada**, então não há domínio a citar, e o desenvolvedor **não tem nome**, então não há para quem escrever. Sobram `Changelog` e `llms.txt`, e a regra que os escolheu fica **mais** satisfeita do que antes: `llms.txt` é o único artefato do site sem nenhuma entrada de navegação.

`pathname://` continua sendo a escotilha **pública** do Docusaurus para apontar a um arquivo que não é rota — degrau 2 da escada. Ela faz três coisas de uma vez: o `<Link>` usa `<a>` em vez de `history.push()`, o verificador de links não cobra uma rota que nunca existiu, e o baseUrl continua sendo acrescentado, **inclusive o do locale**.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O acervo e as três regras | origem própria | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — o `panlabs` substitui o produto anterior, e a empresa nunca é nomeada |
| Nome próprio como título | **lacuna por restrição** | `title` e `tagline` não são traduzíveis no Docusaurus |
| O cenário fecha em três strings | origem própria | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — GitHub Actions, AWS e Python; o resto cai delas somadas às categorias |
| O custo de gabarito sobe sem convenção conhecida | **origem própria (consequência)** | o gênero público do domínio anterior era o que segurava a coerência; sem ele, quem segura é o gabarito |
| Três tabs, três instâncias | origem própria | `routeBasePath` e versionamento são por instância |
| `Ferramentas` declara `docItemComponent` | **origem própria (verificação)** | conferido no código: o `ApiDocItem` comuta por página e delega quando `api_exemplos` falta; só as 6 geradas o declaram |
| Árvore 2 · 5 · 4 | origem própria | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) §árvore |
| **Teto de profundidade 3** | **origem própria (correção)** | o que impedia o nível 3 era a redação da regra de ícone, não o teto — ver [`icones.md`](icones.md) §8 |
| Contagem desigual das jornadas | origem própria | arco de papel não tem comprimento fixo |
| Categoria clicável | origem própria | três fatos verificados na fonte |
| `collapsed: false` | herdado | a âncora mostra a árvore aberta |
| **46 autorais mais 6 geradas, e 21 em EN** | **origem própria (correção)** | a resolução contava as 6 geradas fora do pt-BR e dentro do EN; com o ramo no ar o pt-BR fecha em 52 e o EN em 21 |
| **Onze guias, e não doze** | **origem própria (correção)** | contado contra a árvore fechada: 8 em `Procedimentos` e 3 em `Ferramentas` |
| Os três retipos de `Biblioteca C` | **origem própria (correção)** | `Referência de API` tem por gabarito *a saída do gerador*, e as três são escritas à mão |
| O décimo tipo, e o gabarito dele | herdado | [#57](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/57) — o gabarito encoda a condição que salva o tipo com mais precisão que prosa |
| `<CardGroup>` proibido no índice de jornada | **origem própria** | grade não tem ordem, e o traço do tipo é ordenar por tempo |
| `<Steps>` proibido em `Jornadas` | **origem própria** | a fronteira entre duas abas, escrita como regra conferível |
| Proibição por localização como classe de regra | **origem própria** | é a primeira; até aqui gabarito exigia e limitava |
| Estado em duas palavras, e `Abandonada` fora | **origem própria** | vocabulário sem consumidor é o defeito que este projeto mata por nome |
| `capítulo` é forma e não tipo | **origem própria** | mesma distinção do índice de categoria: gabarito sem classe de conteúdo própria |
| Teto de gabarito não é exceção de heading | **origem própria (implementação)** | descoberto escrevendo o portão: contar páginas sem TOC conflava orçamento com exceção |
| A cerca indentada conta | **origem própria (correção)** | as duas regras de cerca do portão discordavam, e o `<Steps>` da árvore nova expôs a diferença |
| A exceção de heading é o índice de `Ambiente` | **origem própria** | a fixture trocou de dona porque a antiga morreu com a árvore; custo zero em página |
| Quando a fixture e o orçamento discordam, ganha a fixture | **origem própria** | e a segunda exceção não tem sucessora, porque o conflito deixou de existir |
| As onze fixtures com dona nomeada | herdado | [#59](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/59), reatribuídas contra a árvore nova |
| Os quatro casos do domínio novo não são fixture | **origem própria** | fixture nasce de teto de layout; estes nascem de o domínio ter mais textura |
| O locale corta por audiência do artefato | **origem própria** | biblioteca, módulo, skill e servidor são consumidos fora da equipe; jornada e procedimento não |
| **31 páginas com o marcador** | **origem própria (correção)** | a contagem anterior somava os cinco índices de `Procedimentos` duas vezes |
| A convenção do marcador aperta para *quem não tem contraparte* | **origem própria (consequência)** | a fronteira do locale passou a cortar abas inteiras |
| A marca é string traduzível e fica idêntica | **origem própria (implementação)** | `navbar.title` entra em `navbar.json`; traduzi-la desfaria a decisão do §1 |
| `current.json` da instância `default` fica de fora | **origem própria (implementação)** | os dois rótulos dela são idênticos nos dois locales, e o rótulo de versão nada renderiza |
| Sidebar traduzida em aba não traduzida | **origem própria** | rótulo de categoria é chrome, e chrome não cai no fallback com o conteúdo |
| Zero versionamento | origem própria | seis das sete referências não têm seletor |
| Os dois nomes de componente de versão, verbatim | **origem própria (implementação)** | ausência descrita e não nomeada não é greppável |
| O portão 4 e o `onBrokenAnchors: 'throw'` | **origem própria (implementação)** | os critérios deste documento são contagens, e a tabela de sintomas traz âncoras intra-página |
| O manifesto de tipo mora no portão, não no conteúdo | **origem própria (implementação)** | o §6 proíbe `type:` no front matter; um manifesto de build não toca página nem CSS |
| A coluna de estrutura obriga, a de palavras é indicativa | **origem própria** | *palavra é proxy ruim*, e este documento leva a frase a sério |
| `Referência de API` cobrada pelo avesso no portão | **origem própria (implementação)** | a pendência fechou; o que resta cobrar é que as seis existam e que nenhuma entre no manifesto de tipo |
| O footer cai para dois links | **origem própria (consequência)** | `Status` e `Suporte` exigiriam nomear a empresa ou o desenvolvedor |
| Este documento é dono dos artefatos AI-era | origem própria | os três são artefato de conteúdo, e é a arquitetura de informação quem sabe qual é a árvore |
| `permalink + '.md'`, `allContentLoaded`, `outDir` | herdado | [ADR 7](../adr/0007-trailingslash-false.md) — os três verificados no fonte da 3.10.2 |
| `import`/`export` removidos só do TOPO | **origem própria (implementação)** | uma varredura global comeria exemplo dentro de bloco cercado |
| A forma do `llms-full.txt` | **mecanismo emprestado** | o Neon; é a única das três medidas inequívoca para máquina |
| `## Optional` fora | herdado | significado especial na spec, e nenhuma referência a usa |
| Ponteiro de volta em cada `.md` | herdado | é o que faz grafo em vez de arquivo solto |
| O rótulo da seção vem do navbar | **origem própria (correção)** | `translateThemeConfig` roda antes de `allContentLoaded` |
| O preâmbulo em pt-BR nos dois locales | **origem própria** | a mesma regra do §8; a rota de tradução do plugin fica registrada e não comprada |
| `pathname://` no link do footer | herdado | escotilha pública do Docusaurus para arquivo que não é rota — degrau 2 |
