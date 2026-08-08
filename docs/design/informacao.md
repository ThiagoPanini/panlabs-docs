# Arquitetura de informação

O produto fictício, a topologia, a árvore, os tipos de página, os orçamentos, as treze fixtures, a regra de locale — e, no último slice, os artefatos AI-era.

**Uma seção continua aberta, e é a última.** O corpo está fechado: a topologia e a árvore vieram do slice 2, e o conteúdo do slice 4 fechou os **tipos de página (§6), as fixtures (§7) e o locale (§8)**. Falta o §9, dos artefatos AI-era, que é do slice 7. A seção aberta está marcada como tal, com o slice dono — ausência marcada é buraco visível; ausência não marcada é omissão.

**Nenhum valor numérico de desenho aparece aqui.** Os números deste documento são **contagens** — quantas tabs, quantas categorias, quantas páginas.

---

## 1. O produto — `Trilho`

Uma API de pagamentos brasileira: Pix, boleto, cartão, split e assinaturas, sob `api.trilho.dev/v1`.

**O domínio foi escolhido por cobertura de caso difícil, não por gosto.** É o único que enche todos os buracos de layout sem inventar nada:

| Caso que o layout precisa estressar | O que pagamentos entrega |
| --- | --- |
| Tabela larga | catálogo de códigos de recusa — dezenas de linhas por cinco colunas |
| Bloco de código longo | verificação de assinatura HMAC de webhook, em três linguagens |
| Aninhamento profundo | `cobranca.pagamento.cartao.verificacoes` — quatro níveis reais |
| Superfície de API gorda | seis recursos, não um endpoint só |

**O nome resolve uma restrição dura:** `title` e `tagline` **não são traduzíveis** no Docusaurus, e o workaround que existe é declaradamente temporário e fora da API pública. Substantivo próprio atravessa os dois locales sem tradução.

**E o argumento estrutural:** um produto de pagamentos *brasileiro* faz o *pt-BR nasce primeiro* deixar de ser excentricidade e virar consequência. Pix, boleto, split, conciliação e CPF/CNPJ não existem bem em inglês.

*Dissenso registrado:* pagamentos é o domínio de documentação mais clonado do mundo, e o conteúdo mockado corre risco de ler como pastiche — puxando a atenção de quem revisa para a plausibilidade do conteúdo em vez do layout, que é o produto. Aceito porque a convenção ser conhecida é o que permite escrever dezenas de páginas plausíveis sem inventar domínio a cada arquivo.

---

## 2. Topologia — três tabs, três instâncias, um-para-um

| Tab | Rota | Instância | Layout |
| --- | --- | --- | --- |
| **Documentação** | `/docs` | `default` | padrão — cartão, TOC, medida de prosa |
| **Referência da API** | `/api-reference` | `api` | componente de item de doc próprio |
| **Receitas** | `/receitas` | `receitas` | padrão |

Tabs no navbar como `docSidebar`, cada uma trocando a sidebar inteira. Ver [`chrome.md`](chrome.md) §2.

**Uma instância por tab, e não uma instância com várias sidebars.** Uma instância *pode* expor várias sidebars, o que economizaria config. Recusado por duas razões mecânicas:

1. **`routeBasePath` é por instância.** Compartilhar jogaria as receitas em `/docs/receitas/…` — a URL deixaria de ler o eixo, e o eixo é a decisão inteira da navegação;
2. **versionamento é por instância.** É o que permitiria versionar uma tab só. O §5 dispensa versionamento por completo, mas foi a granularidade que tornou a análise possível — e ela continua sendo a saída barata caso o alvo corporativo precise versionar uma tab.

**A tab é a instância.** O eixo deixa de ser coincidência de config e vira estrutura.

**O eixo é a natureza do conteúdo**, e não versão nem idioma. Versão e idioma não são eixos no Docusaurus — são dropdowns de graça, e gastar o eixo primário com eles é gastá-lo com o que já vem pronto ao lado. Contagem de versões e de locales são propriedades do conteúdo mockado; natureza do conteúdo é estrutural, e escolher errado aqui **não se conserta com CSS**.

*Dissenso registrado:* três instâncias são três árvores de i18n. O gerador de traduções cria; quem preenche é humano. Aceito porque a alternativa não elimina o trabalho — só o esconde numa árvore só.

### 2.1 A classe de instância existe — correção de um "fato verificado" que era falso

O mapa registrou, com essas palavras, que *"não existe classe `plugin-id-<id>` no `<html>`, verificado em 3.10.2"*, e concluiu que CSS não podia escopar por tab.

**É falso, e foi medido no artefato deste slice.** O `<html>` de uma página de doc sai assim:

```
class="docs-wrapper plugin-docs plugin-id-default docs-version-current
       docs-doc-page docs-doc-id-comece-aqui/visao-geral"
```

Ou seja: há classe por **plugin** (`plugin-docs`), por **instância** (`plugin-id-default`, `plugin-id-api`, `plugin-id-receitas`), por **versão**, por **tipo de página** e por **documento**. A varredura que produziu o fato original procurou no fonte pelo nome errado — a classe é montada em runtime, não escrita como literal.

**A consequência prática, porém, não muda: nada em `src/css/` escopa por instância, e nada deveria.** O motivo agora é outro, e é melhor — não é impossibilidade, é decisão:

> **Escopar por instância é escopar por *onde a página está*, quando o que importa é *o que a página é*.** As três tabs compartilham o mesmo layout de página; o que rompe layout é a Referência da API, e ela rompe por `docItemComponent`, que é opção pública. Uma regra `plugin-id-api` seria a segunda fonte de verdade para uma decisão que o componente de rota já toma.

A porta fica **aberta e não usada**, o que é diferente de fechada. Quem precisar dela um dia tem `plugin-id-<id>` e `docs-doc-id-<id>` à disposição; quem estiver escrevendo CSS de layout hoje deve ancorar em `ThemeClassNames` de página.

---

## 3. A árvore — 6 · 0 · 6, teto de profundidade 2

```
Documentação            Referência da API       Receitas
├ Comece aqui           ├ Introdução            (plana — intro e receitas
├ Conceitos             ├ Cobranças              irmãs, sem categoria)
├ Meios de pagamento    ├ Clientes
├ Guias                 ├ Assinaturas
├ SDKs                  ├ Reembolsos
└ Operação              └ Webhooks
```

**`Receitas` é plana de propósito.** Receita não tem seção, tem caso de uso; agrupar nove páginas em três caixas de três é cerimônia. Sem categoria, logo **sem ícone** — e é por isso que ela não consome nenhum dos doze slots de navegação.

### 3.1 Teto de profundidade 2 — restrição estrutural, não gosto

Categoria → documento, nunca um terceiro nível. Dois motivos, e o segundo é o forte:

- **medido:** na âncora, o terceiro nível existe como exceção, não como padrão;
- **estrutural:** a regra de ícone é *obrigatório na categoria de topo, ausente na folha*. **Num terceiro nível o nó do meio não é nem uma coisa nem outra — a regra não tem leitura.** Teto 2 mantém a regra total.

Onde aperta: uma seção cujo tema quer virar três páginas as achata como irmãs, com o nome qualificado. Pior de ler no sistema de arquivos, melhor de ler na sidebar.

**Descartado:** caber em menos slots de ícone aninhando os recursos da API sob um guarda-chuva. Seria um nó que não carrega informação — *toda* folha viveria sob ele — e compraria o terceiro nível que este teto recusa.

### 3.2 A categoria é clicável e aponta para a visão geral

| Documentação | aponta para | Referência da API | aponta para |
| --- | --- | --- | --- |
| Comece aqui | `Visão geral` | Introdução | `Visão geral` |
| Conceitos | `Mapa dos conceitos` | Cobranças | `O objeto Cobrança` |
| Meios de pagamento | `Comparativo` | Clientes | `O objeto Cliente` |
| Guias | `Índice de guias` | Assinaturas | `O objeto Assinatura` |
| SDKs | `Visão geral` | Reembolsos | `O objeto Reembolso` |
| Operação | `Índice` | Webhooks | `O objeto Evento` |

Isto **reverte** uma primeira redação que dizia que categoria não é página. O argumento contra era *"doze páginas chatas de visão geral"* — e ele estava errado, porque **as páginas de visão geral existem nos dois modelos**; a diferença é só se aparecem como linha própria na sidebar ou se a categoria aponta para elas.

Três fatos verificados na fonte fecham a questão:

1. **Categoria com link não perde o colapso.** O botão de caret é elemento separado do link — o rótulo navega, o caret colapsa. E estando na própria página da categoria, clicar no rótulo colapsa em vez de recarregar;
2. **Categoria sem link não é inerte de verdade.** O Docusaurus aponta para o primeiro filho quando não há navegador. O modelo *"não é página"* se comporta como página no SSR e muda de comportamento no cliente — pior que qualquer um dos dois modelos puros;
3. **O rótulo da categoria é quem carrega o ícone.** Fazer o elemento mais proeminente da sidebar ser um **destino** em vez de um toggle é melhor.

**Todas com `collapsed: false`** — a árvore inteira aberta, como a âncora. O default do Docusaurus é colapsado; é uma linha por categoria.

**Descartado: índice gerado pelo Docusaurus como destino de categoria.** Ele renderiza os cartões do próprio Docusaurus, enquanto o inventário de conteúdo já traz cartão **autoral** — seriam duas anatomias de cartão para especificar e dois conjuntos de token que precisam parecer a mesma coisa. Pior: o cartão do Docusaurus é um dos componentes reestruturados dentro do próprio v3, ou seja território `unsafe`.

### 3.3 O que existe, e o que falta

As duas árvores autorais estão **cheias**: 33 páginas em `Documentação` e 10 em `Receitas`, **43 no total**. O que falta é a instância `api`, inteira.

| Estado | O quê | Slice dono |
| --- | --- | --- |
| escrito | as seis categorias de `Documentação`, clicáveis, com ícone, e as **27 folhas** | 2 e 4 |
| escrito | `Receitas`, plana: a intro e as **nove receitas irmãs** | 2 e 4 |
| escrito | `Referência da API › Introdução`, clicável, com ícone | 2 |
| **falta** | as cinco categorias de recurso da Referência da API, e as páginas geradas | 5 |

**As cinco categorias de recurso da Referência da API não são escritas à mão.** Elas apontam para páginas geradas do contrato OpenAPI, e o gerador passa a emitir também o arquivo de sidebar da instância. Escrevê-las agora criaria exatamente a segunda fonte de verdade que o gerador existe para impedir — e uma categoria clicável cujo destino não existe reprova no build. **A árvore está portanto em 6 · 0 · 1 no artefato, e 6 · 0 · 6 é o alvo**; a diferença é a instância `api`, e ela fecha no slice 5.

**Duas páginas nasceram fora do slice do conteúdo, e as duas continuam onde estavam.** `Operação › Changelog` foi escrita no slice 2 porque o footer a linka em **todas** as rotas e link de footer para rota inexistente reprova no verificador de links; o slice 4 só encheu o corpo dela com as oito entradas do gabarito. `Guias › Catálogo de componentes` foi escrita no slice do catálogo, é a fixture dele, e é folha de `Guias` como sempre foi.

**Os doze pares seção→ícone estão inteiros no manifesto e no CSS desde já**, inclusive os cinco que ainda não têm categoria. Eles não custam nada e não erram nada, e o vendorizador confere que os três lugares onde os pares vivem — manifesto, `className` de sidebar e regra de máscara — concordam.

### 3.4 Categoria sem filhos vira link, e o CSS precisa saber disso

**Medido no artefato deste slice.** Uma categoria declarada com lista de itens vazia é **normalizada para link** pelo Docusaurus: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável e passa a ser um link filho direto. O caret some — e ele some com razão, porque não há o que colapsar.

Isso tem duas consequências, e as duas foram tratadas:

- **o CSS de sidebar cobre as duas formas.** Com um seletor só, uma seção perderia o ícone no dia em que a última folha dela saísse, e a falha seria muda. O marcador é o `className` do manifesto, não o nível — `.sidebar-icone` **é** a definição de *seção de topo* neste sistema;
- **a forma de link deixou de estar no artefato, e a cobertura fica.** Enquanto quatro das seis seções estavam vazias, a forma de link era visível na tela. Com as 27 folhas entregues, **as seis são categoria** e nenhuma exercita mais o caso. A regra continua escrita e o seletor continua cobrindo os dois — é a diferença entre uma proteção que se prova hoje e uma que se prova no dia em que a última folha de uma seção sair. Registrado como **cobertura sem fixture**, para não ser removido por parecer morto.

---

## 4. A regra de heading, que é decisão de layout disfarçada de conteúdo

> **Toda página de `Documentação` carrega no mínimo três `##`. Toda `Receita` carrega no máximo um.**

Não é estilo. É a regra que produz as configurações de TOC que provam a medida constante do cartão.

**Correção de premissa, medida em 3.10.2.** A primeira redação desta regra dizia que *"sem TOC, a coluna de conteúdo vai a 100% da linha em vez de 75%"*. Não é o que o Docusaurus faz: a classe de 75% é aplicada sempre que `hide_table_of_contents` não está no front matter, **independentemente de haver heading**. O que depende de heading é a coluna do TOC.

Logo são **três** configurações, e não duas. A tabela completa está em [`chrome.md`](chrome.md) §1.5. A regra de heading continua valendo — ela é o que faz as três existirem no artefato em vez de existirem só no papel —, mas o argumento mudou: o cartão fica no mesmo pixel nas três **por causa do `max-width`**, não porque a coluna oscila.

### 4.1 A exceção é uma só, e é nomeada

> **`Comece aqui › Ambientes` carrega ZERO `##`.** É a única página de `Documentação` abaixo do mínimo, e ela está lá de propósito.

Isto **resolve a divergência** que a redação anterior deste documento deixou em aberto: *"ou a página encolhe, ou a fixture muda de dona"*. A página encolheu — de cinco `##` e ~700 palavras para nenhum e ~120 —, e o conteúdo que ela carregava foi para `Comece aqui › Autenticação`, que é uma página de tipo `Guia` e o lugar certo dele desde sempre.

A escolha entre as duas saídas não foi de gosto. **A fixture é a razão de a regra existir**: sem uma página de `Documentação` sem heading, a configuração *coluna de 75% sem TOC* não aparece no artefato, e a afirmação central sobre a medida constante fica sem prova. Mudar a dona só empurraria a exceção para outra página; encolher esta a põe onde a spec já a tinha prometido.

**Exceção anônima é buraco; exceção nomeada é decisão.** É por isso que ela está escrita aqui, no `sidebars.js` e no portão — e é por isso que a segunda reprova.

### 4.2 O portão 4 — a régua de máquina das contagens

Os critérios desta seção, do §6 e do §8 são todos **contagens**, e contagem que só existe em prosa é contagem que envelhece calada. Uma página a mais em `Guias` não quebra build nenhum; ela só faz este documento passar a mentir.

`scripts/portao-4-conteudo.sh` cobra quatro coisas, na cadência de commit:

| # | O que confere |
| --- | --- |
| 1 | o volume por seção — 4 · 6 · 7 · 6 · 4 · 6 em `Documentação`, 10 em `Receitas` |
| 2 | a regra de heading, com a exceção nomeada acima como **única** permitida |
| 3 | todo fonte pt-BR carrega `<Untranslated />`, e nenhum arquivo de tradução carrega |
| 4 | a cobertura de locale — 14 traduzidas, e as três seções sem EN continuam em zero |

A contagem de `##` ignora bloco cercado, senão um comentário dentro de um trecho de código contaria como heading.

**E um terceiro `throw` entra na config junto.** `onBrokenAnchors` era `warn` por default, e este slice traz os primeiros links de âncora intra-página do site — a tabela de sintomas de `Operação › Diagnóstico`. Âncora quebrada que só avisa é âncora quebrada que fica. A consequência de contrato é pequena e vale escrever: **toda âncora citada por um link é declarada com `{#id}` no próprio heading**, em vez de depender de como o slugger trata acento.

---

## 5. Versionamento — nenhum

Não existe `versions.json`, `versioned_docs/`, `versioned_sidebars/` nem seletor de versão. Uma árvore por instância.

Isto **reverte** a leitura da pesquisa, que recomendava duas versões como demonstração de mecânica. A revisão foi feita contra a própria base de evidências dela: **seis das sete referências não têm seletor de versão nenhum**. E a doc oficial diz, verbatim, que *"most of the time, you don't need versioning as it will just increase your build time, and introduce complexity to your codebase"*.

**Mas a API continua versionada — o produto, não a documentação.** Versão por cabeçalho, documentada em `Referência da API › Introdução`, e o `Changelog` em `Operação` como o único lugar onde a mudança se comunica. Custa uma página e zero build.

O que isso simplifica, em ordem de tamanho:

1. **A busca perde uma obrigação inteira.** Sem versão, o índice só precisa do locale — e locale sai de graça, um diretório de saída por locale. Era o item mais caro da lista dela;
2. a armadilha do snapshot assimétrico deixa de existir — o corte de versão congela só a árvore não localizada, e copiar a árvore traduzida seria trabalho manual a cada corte;
3. o navbar devolve o espaço do seletor;
4. três árvores de conteúdo em vez de sete.

**O que se perde, verificado e menor do que parecia:** a faixa e o selo de versão nunca aparecem no artefato. São, respectivamente, um alerta e um badge — **classes puras do Infima**, cobertas pelas regras de token que a spec precisa ter de qualquer jeito. Não viram ausência na spec; viram componente que herda. Registrado como **ausência conhecida**, não omissão.

---

## 6. Tipos de página — nove, todos convenção de conteúdo

São nove, todos **convenção de conteúdo e zero layout**: sem front matter de tipo, sem classe CSS por tipo, sem componente próprio.

Sai por consequência, não por escolha nova: na âncora, quickstart, guia, SDK e troubleshooting são a mesma página, e *"layout por tipo de página"* não está na lista fechada de deltas deliberados.

> **O site inteiro tem exatamente duas rupturas de layout, e as duas foram decididas fora deste documento:** a Referência da API e a landing. **Nenhuma terceira nasce de um tipo.**

### 6.1 Os nove gabaritos

| Tipo | Onde vive | Gabarito |
| --- | --- | --- |
| **Quickstart** | Comece aqui | intro curta → `<Steps>` com código em cada passo → `<CardGroup>` de próximos passos |
| **Conceitual** | Conceitos | definição → por que existe → como aparece na API → armadilhas em `<Callout>` |
| **Guia** | Guias, Meios de pagamento, Operação, Comece aqui | pré-requisitos → `<Steps>` → verificação → variações |
| **SDK** | SDKs | instalação em `<CodeGroup>` por gerenciador → configuração → uso → tratamento de erro → link para a referência HTTP |
| **Referência de API** | Referência da API | **gerada** do contrato OpenAPI — o gabarito é a saída do gerador |
| **Receita** | Receitas | o problema em uma frase → código completo copiável → 2-3 parágrafos só sobre o não óbvio |
| **Catálogo** | Meios de pagamento, Operação | intro curta → como ler a tabela → **a tabela larga** → notas |
| **Troubleshooting** | Operação | tabela de sintomas → uma seção por sintoma: causa, solução |
| **Changelog** | Operação | cronologia reversa, uma entrada por versão de API |

### 6.2 O orçamento é de estrutura, não de palavra

O que estressa layout é contagem de estrutura; palavra é proxy ruim. As duas colunas valem juntas — a de palavras diz o tamanho, a de estrutura diz o que precisa estar lá.

| Tipo | Palavras | Estrutura mínima | Quantas no artefato |
| --- | --- | --- | ---: |
| Quickstart | 500-700 | 1 `<Steps>` de 5 passos · 5 blocos · 2 `<Callout>` · 1 `<CardGroup>` | 1 |
| Conceitual | 700-1000 | 4-6 `##` · 2 blocos · 1-2 `<Callout>` · 1 tabela | 5 |
| Guia | 600-900 | 1 `<Steps>` · 3-4 blocos · 2 `<Callout>` | 14 |
| SDK | 400-600 | 1 `<CodeGroup>` de instalação · 4-5 blocos | 3 |
| Receita | 150-250 | 1-2 blocos **longos**, de 30 a 60 linhas · no máximo 1 `##` | 9 |
| Catálogo | 200-300 | 1 tabela de 20-40 linhas × 4-5 colunas | 2 |
| Troubleshooting | 800-1200 | 1 tabela de sintomas · 6-8 `##` | 1 |
| Changelog | — | 6-8 entradas em `<Update>` | 1 |
| Referência de API | — | a saída do gerador | 0 — slice 5 |
| *índice de categoria* | piso do tipo da seção | + um índice das folhas | 6 |
| *a fixture de página curta* | ~120 | nenhuma — ver §4.1 | 1 |
| | | **total** | **43** |

**Oito dos nove tipos têm instância no artefato.** O nono, `Referência de API`, é o único gerado, e ele chega no slice 5 com o gabarito que o gerador emitir.

### 6.3 O índice de categoria é uma forma, não um décimo tipo

**Sete páginas de entrada** — as seis visões gerais de categoria e a intro de `Receitas` — são **o tipo da seção no piso do orçamento, mais um índice das folhas**. Não ganham gabarito próprio, e é deliberado: um décimo tipo cujo único traço distintivo é *ser curto* seria um tipo que só existe para explicar por que os outros não se aplicam.

**Por isso a coluna *quantas* do §6.2 conta seis, e não sete.** `Meios de pagamento › Comparativo` toma a forma de índice e é contada em `Catálogo`, porque é a fixture dele. Forma e tipo são eixos diferentes, e quando discordam quem manda no número é o tipo.

Quatro indexam com `<CardGroup>` — `Conceitos`, `Guias`, `Operação` e a intro de `Receitas`. As três primeiras são a decisão original sobre *as categorias fracas*; a intro de `Receitas` entrou junto porque a tab é plana e a sidebar não agrupa nada, o que faz a página de entrada ser o único lugar do site onde as nove receitas aparecem juntas.

As outras três indexam **em prosa ou em tabela**, e não em cartão: `Comece aqui › Visão geral` já tinha um caminho numerado, `SDKs › Visão geral` já tinha a tabela de divergência entre os três, e `Comparativo` é a fixture de tabela com prosa quase nula — pôr cartão nela contaminaria justamente a página que existe para provar isso.

**E uma folha é de tipo `Guia` por ela mesma dizer que é.** `Guias › Catálogo de componentes` chama a si própria de *guia de autoria*, e é isso que ela é: um caminho inteiro sobre como escrever com os dezoito componentes. Ela não vira um tipo *fixture de catálogo* — o que ela tem de especial é o dono, que é o slice do catálogo, não a forma.

---

## 7. As treze fixtures — cada caso difícil com uma dona nomeada

**Cada caso difícil tem exatamente uma página dona, nomeada.** Não *"algumas páginas terão tabelas largas"* — *esta* página é a fixture da tabela larga. A spec aponta para um artefato em vez de descrever uma hipótese, e quem implementa sabe onde olhar para saber se acertou.

| Caso | Página dona | O que prova | Slice |
| --- | --- | --- | ---: |
| Tabela larga | `Operação › Códigos de recusa` — 40 linhas × 5 colunas | o breakout e o scroll horizontal **dentro** do cartão | 4 |
| Tabela como página inteira | `Meios de pagamento › Comparativo` — 24 linhas × 4 colunas | o tipo `Catálogo` com prosa quase nula | 4 |
| Bloco de código longo | `Conceitos › Webhooks` — HMAC em Node, Python e Go | altura, `<CodeGroup>` e o título nu | 4 |
| **Página muito curta** | `Comece aqui › Ambientes` — ~120 palavras, zero `##` | **o cartão no mesmo pixel sem coluna de TOC** | 4 |
| Prosa pura | `Conceitos › Conciliação` — nenhum componente | a medida de prosa sozinha, sem nada para escondê-la | 4 |
| Item de sidebar mais largo | `Meios de pagamento › Pix — QR dinâmico` | wrap ou truncamento no item, com ícone à esquerda | 4 |
| Sidebar longa | a sidebar de `Documentação` — 6 categorias + 27 folhas | 33 linhas: scroll, `sticky` e os seis ícones em contraste | 4 |
| Prosa mínima, código máximo | as 9 `Receitas` | o escape de medida repetido a cada dois parágrafos | 4 |
| Fallback silencioso de locale | `/en/docs/meios-de-pagamento/pix` | `<Untranslated />` e texto pt-BR sob rota EN | 4 |
| Navbar apertado | qualquer página entre 997 e 1200px | 3 tabs + busca + `PT` + GitHub | 4 |
| Aninhamento profundo | `Cobranças › O objeto Cobrança` | `<ParamField>` sobre `<details>`, quatro níveis | 5 |
| Página muito longa | `Webhooks › Catálogo de eventos` | TOC longo, `sticky` e scroll-spy | 5 |
| Painel direito vazio | `Referência da API › Introdução › Autenticação` | `ApiDocItem` com prosa autoral — o painel condicional | 5 |

**Dez das treze estão no artefato; as três últimas moram na Referência da API** e são cobradas no slice dela.

**Duas fixtures ganharam da regra, e as duas ganharam pelo mesmo motivo.** `Ambientes` fica abaixo do mínimo de heading (§4.1) e `Conciliação` fica abaixo do mínimo de estrutura do tipo `Conceitual` — sem tabela, sem bloco e sem `<Callout>`, porque *"prosa pura"* é literalmente o que ela existe para exercitar. **Quando a fixture e o orçamento discordam, ganha a fixture** — o orçamento existe para produzir páginas plausíveis, e a fixture existe para provar uma medida. São essas duas, e nenhuma terceira sem passar por aqui.

**O domínio entrega o aninhamento de quatro níveis antes de a Referência precisar dele.** `cobranca.pagamento.cartao.verificacoes` está escrito em `Meios de pagamento › Cartão`, com `<ResponseField>` sobre `<Expandable>` em três `<details>` encaixados. A fixture do caso continua sendo a página gerada do slice 5; o que este slice garante é que **o domínio já produz a borda que o validador de lá vai travar**, em vez de a borda ser descoberta pelo gerador.

---

## 8. Locale — 44 traduzidas, 29 buracos de propósito

A regra: **o EN cobre orientar-se e consultar; o pt-BR cobre também executar no mercado local.** Um desenvolvedor de fora integrando com uma API de pagamento brasileira precisa do quickstart, dos conceitos, do SDK e da referência; Pix, boleto, split e conciliação não têm leitor de EN.

| Traduzido para EN | Só pt-BR |
| --- | --- |
| `Comece aqui` 4 · `Conceitos` 6 · `SDKs` 4 | `Meios de pagamento` 7 · `Guias` 6 |
| **Referência da API** 30 — slice 5, do contrato bilíngue | `Operação` 6 · `Receitas` 10 |
| **44** | **29** |

**Deste slice saem 14 das 44.** As outras 30 são a Referência da API, e elas são o melhor negócio do projeto: o gerador emite os dois locales a partir de um contrato bilíngue, o que custa poucas linhas nele e entrega trinta páginas traduzidas.

*(Correção de aritmética, mantida: os números da resolução original somavam errado — as listas dela fecham em 44 e 29, não em 38 e 35.)*

### 8.1 A sinalização se resolve sozinha, e é isso que a torna barata

A página não traduzida é gerada **em silêncio**, com o texto em português, sem aviso e sem relatório. Uma spec que nunca exercita esse estado não decidiu nada sobre ele; só não esbarrou nele.

A sinalização é um componente de conteúdo que lê o locale corrente e devolve nada em pt-BR. A mecânica se resolve sozinha porque **a tradução substitui o arquivo inteiro**: o marcador escrito no fonte pt-BR aparece em `/en/` exatamente enquanto não houver contraparte, e some no instante em que houver.

A convenção de autoria que fecha o contrato é de uma linha, e ela vale para as 43:

> **Todo arquivo de conteúdo em pt-BR abre com `<Untranslated />` logo abaixo do `# h1`. Nenhum arquivo de tradução o carrega.**

**Sem lista para manter, sem flag, sem drift possível** — e agora sem confiar na memória de quem escreve, porque as duas metades da convenção são cobradas pelo portão 4 (§4.2). O custo é uma linha em cada fonte; o que ela compra é que traduzir uma seção nova não exige tocar em lugar nenhum além dos arquivos traduzidos.

### 8.2 O que é traduzível fora do conteúdo

| Superfície | Onde a tradução mora |
| --- | --- |
| Rótulos das três tabs | `i18n/en/docusaurus-theme-classic/navbar.json` |
| Links e copyright do footer | `i18n/en/docusaurus-theme-classic/footer.json` |
| Rótulos das seis categorias de sidebar | `i18n/en/docusaurus-plugin-content-docs/current.json` |
| Texto dentro dos componentes do catálogo | `i18n/en/code.json` |
| **`title` e `tagline`** | **não são traduzíveis** — e é por isso que o produto se chama `Trilho` |

A última linha é a restrição que escolheu o nome do produto, lá no §1. Substantivo próprio atravessa os dois locales sem tradução, e o *workaround* que existe para o resto é declaradamente temporário e fora da API pública.

**O gerador de traduções emite mais arquivos do que o site consome, e só os consumidos entram no repo.** Ele cria um `current.json` por instância de docs, e nas instâncias `api` e `receitas` esse arquivo sai com uma chave só — o rótulo da versão, que **nada renderiza**, porque o §5 dispensa versionamento. Arquivo de tradução sem string traduzível é a mesma classe de defeito das variáveis inertes do Infima, e ele fica de fora. A regra é *o que tem consumidor entra inteiro; o que não tem não entra* — e é por isso que o `current.json` da instância `default` fica com a chave de versão que ele também não usa: ele tem seis rótulos de categoria que são usados, e podar à mão um arquivo gerado é churn que o próximo `write-translations` desfaz.

**O que também não se traduz, por decisão e não por limitação:** nome de objeto, nome de campo e valor de status. `cobranca`, `referencia_externa` e `paga` são contrato da API, não prosa — traduzi-los na página produziria um leitor de EN escrevendo código que não compila. Só a prosa em volta muda de idioma, e a página de entrada em EN diz isso em voz alta em vez de deixar o leitor deduzir.

---

## 9. Artefatos AI-era — *aberto, slice 7*

`.md` por rota, `llms.txt` e `llms-full.txt`. **Este documento é o dono deles**, e o motivo é que os três são artefato de **conteúdo**, não de chrome: são a mesma árvore servida noutro formato, e é a arquitetura de informação quem sabe qual é a árvore.

[`chrome.md`](chrome.md) fica com **uma linha**, pelo link do rodapé, e nada mais.

A forma do `llms-full.txt`, o ponteiro de volta em cada `.md` e o aviso de `Content-Type` do host chegam no slice 7.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O produto e o domínio | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §1 — escolhido por cobertura de caso difícil |
| Nome próprio como título | **lacuna por restrição** | `title` e `tagline` não são traduzíveis no Docusaurus |
| Três tabs, três instâncias | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §2, sobre o eixo da [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) §3 |
| Eixo por natureza do conteúdo | origem própria | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) §3 — critério é durabilidade, não fidelidade |
| Árvore 6 · 0 · 6 | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §3 |
| Teto de profundidade 2 | herdado (medição) + **origem própria** (o argumento estrutural) | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §3, sobre a regra de ícone da [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) |
| Categoria clicável | origem própria (reversão) | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §3.1 — três fatos verificados na fonte |
| `collapsed: false` | herdado | a âncora mostra a árvore aberta |
| `Receitas` plana | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §3 |
| A classe de instância existe, e não se usa mesmo assim | **origem própria (correção)** | medido no artefato: `plugin-id-<id>` está no `<html>`, contra o "fato verificado" da [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) |
| Categoria sem filhos é normalizada para link | **origem própria (medição)** | medido no artefato; obriga o CSS de sidebar a cobrir as duas formas |
| Zero versionamento | origem própria (reversão) | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §7, contra a leitura da [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7) |
| Regra de heading | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §5 |
| As três configurações de coluna | **origem própria (correção)** | medido em `DocItem/Layout@3.10.2` |
| A aritmética do locale | **origem própria (correção)** | as listas da [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §6 fecham em 44 e 29 |
| A sidebar da API vem do gerador | origem própria | consequência de a Referência ser gerada ([#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18)) |
| `Changelog` escrita no slice 2 | **origem própria (implementação)** | o link de footer está em todas as rotas, e o verificador de links reprova rota ausente |
| `Catálogo de componentes` como folha de `Guias` | **origem própria (implementação)** | o slice do catálogo ([#36](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/36)) exige a fixture no site publicado |
| Os nove gabaritos e os orçamentos de estrutura | herdado | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §4 e §5 |
| As treze fixtures com dona nomeada | herdado | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §8 |
| A exceção de heading é `Ambientes`, e é uma só | **origem própria (resolução)** | a divergência que a redação do slice 2 deixou aberta; a fixture é a razão de a regra existir |
| Quando a fixture e o orçamento discordam, ganha a fixture | **origem própria** | `Ambientes` e `Conciliação` são as duas, e nenhuma terceira sem passar por aqui |
| O índice de categoria não é um décimo tipo | **origem própria** | consequência de tipo ser convenção de conteúdo: piso do tipo da seção mais um índice |
| `<CardGroup>` também na intro de `Receitas` | **origem própria** | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) deu cartão às três categorias fracas; a tab plana tem o mesmo problema e nenhuma sidebar que o resolva |
| Go tem página e não tem snippet gerado | herdado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) — a perda nº 3 da [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6), aterrissada à vista |
| A convenção de uma linha do `<Untranslated />` | **origem própria (implementação)** | o componente já resolvia o drift; a convenção resolve o esquecimento |
| Nome de objeto e de campo não se traduz | **origem própria** | contrato de API não é prosa — traduzi-lo produz código que não compila |
| O portão 4 e o `onBrokenAnchors: 'throw'` | **origem própria (implementação)** | os critérios desta seção são contagens, e este slice traz as primeiras âncoras intra-página do site |
| A forma de link de categoria virou cobertura sem fixture | **origem própria (implementação)** | as seis seções passaram a ter folha; a regra fica, e o motivo de ficar vai escrito |
| Este documento é dono dos artefatos AI-era | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16), fechando a lacuna de dono |
