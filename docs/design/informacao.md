# Arquitetura de informação

O produto fictício, a topologia, a árvore — e, conforme os slices fecham, os tipos de página, os orçamentos, as fixtures, o locale e os artefatos AI-era.

**Documento aberto.** Este slice escreve a **topologia e a árvore**; os tipos de página, os orçamentos por tipo e as treze fixtures chegam com o conteúdo, a Referência da API fecha a aba dela, e os artefatos AI-era entram no slice 7. As seções abertas estão marcadas como tal, com o slice dono — ausência marcada é buraco visível; ausência não marcada é omissão.

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

### 3.3 O que existe hoje, e o que falta

Este slice escreve **oito páginas de visão geral** — as seis de `Documentação`, a intro de `Receitas` e `Referência da API › Introdução › Visão geral` — mais uma nona página que não é visão geral e tem motivo próprio.

| Estado | O quê | Slice dono |
| --- | --- | --- |
| escrito | as seis categorias de `Documentação`, clicáveis, com ícone | 2 |
| escrito | `Receitas`, plana, com a intro | 2 |
| escrito | `Referência da API › Introdução`, clicável, com ícone | 2 |
| escrito | `Operação › Changelog` | 2 — ver abaixo |
| **falta** | as cinco categorias de recurso da Referência da API, e as páginas `O objeto X` | 5 |
| **falta** | as folhas de `Documentação` e as nove receitas | 4 |

**`Operação › Changelog` é escrita neste slice e não é visão geral.** O footer a linka em **todas** as rotas do site, e link de footer para rota inexistente reprova no verificador de links do build. A página existe com a URL definitiva e o corpo mínimo; o gabarito de changelog é do slice 4.

**As cinco categorias de recurso da Referência da API não são escritas à mão.** Elas apontam para páginas geradas do contrato OpenAPI, e o gerador passa a emitir também o arquivo de sidebar da instância. Escrevê-las agora criaria exatamente a segunda fonte de verdade que o gerador existe para impedir — e uma categoria clicável cujo destino não existe reprova no build. **A árvore está portanto em 6 · 0 · 1 no artefato deste slice, e 6 · 0 · 6 é o alvo**; a diferença é a instância `api`, e ela fecha no slice 5.

**Os doze pares seção→ícone estão inteiros no manifesto e no CSS desde já**, inclusive os cinco que ainda não têm categoria. Eles não custam nada e não erram nada, e o vendorizador confere que os três lugares onde os pares vivem — manifesto, `className` de sidebar e regra de máscara — concordam.

### 3.4 Categoria sem filhos vira link, e o CSS precisa saber disso

**Medido no artefato deste slice.** Uma categoria declarada com lista de itens vazia é **normalizada para link** pelo Docusaurus: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável e passa a ser um link filho direto. O caret some — e ele some com razão, porque não há o que colapsar.

Isso tem duas consequências, e as duas foram tratadas:

- **o CSS de sidebar cobre as duas formas.** Com um seletor só, uma seção perderia o ícone no dia em que a última folha dela saísse, e a falha seria muda. O marcador é o `className` do manifesto, não o nível — `.sidebar-icone` **é** a definição de *seção de topo* neste sistema;
- **o estado atual é honesto e visível:** as duas seções que já têm folha (`Comece aqui` e `Operação`) provam a forma de categoria — ícone, caret, aberta por padrão. As demais provam a forma de link, com o mesmo ícone e a mesma tipografia. Nenhuma perde a assinatura visual, e o slice 4 as promove a categoria ao entregar as folhas.

---

## 4. A regra de heading, que é decisão de layout disfarçada de conteúdo

> **Toda página de `Documentação` carrega no mínimo três `##`. Toda `Receita` carrega no máximo um.**

Não é estilo. É a regra que produz as configurações de TOC que provam a medida constante do cartão.

**Correção de premissa, medida em 3.10.2.** A primeira redação desta regra dizia que *"sem TOC, a coluna de conteúdo vai a 100% da linha em vez de 75%"*. Não é o que o Docusaurus faz: a classe de 75% é aplicada sempre que `hide_table_of_contents` não está no front matter, **independentemente de haver heading**. O que depende de heading é a coluna do TOC.

Logo são **três** configurações, e não duas. A tabela completa está em [`chrome.md`](chrome.md) §1.5. A regra de heading continua valendo — ela é o que faz as três existirem no artefato em vez de existirem só no papel —, mas o argumento mudou: o cartão fica no mesmo pixel nas três **por causa do `max-width`**, não porque a coluna oscila.

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

## 6. Tipos de página — *aberto, slice 4*

São nove, todos **convenção de conteúdo e zero layout**: sem front matter de tipo, sem classe CSS por tipo, sem componente próprio.

Sai por consequência, não por escolha nova: na âncora, quickstart, guia, SDK e troubleshooting são a mesma página, e *"layout por tipo de página"* não está na lista fechada de deltas deliberados.

> **O site inteiro tem exatamente duas rupturas de layout, e as duas foram decididas fora deste documento:** a Referência da API e a landing. **Nenhuma terceira nasce de um tipo.**

Os nove gabaritos e os orçamentos de estrutura de cada um chegam no slice 4.

---

## 7. Fixtures — *aberto, slice 4*

**Cada caso difícil tem exatamente uma página dona, nomeada.** Não *"algumas páginas terão tabelas largas"* — *esta* página é a fixture da tabela larga. A spec aponta para um artefato em vez de descrever uma hipótese, e quem implementa sabe onde olhar para saber se acertou. São treze.

**Uma divergência já existe e vai registrada em vez de descoberta depois.** A fixture de *página muito curta, sem TOC* é `Comece aqui › Ambientes`, especificada como ~120 palavras e zero `##`. A página escrita no slice 1 tem cinco `##` e é longa — ela nasceu como *"uma página de documentação real"* antes de a fixture existir. O slice 4 resolve: ou a página encolhe, ou a fixture muda de dona. **Enquanto isso, a configuração sem TOC é exercitada pela intro de `Receitas`**, que tem zero `##` por ser receita.

---

## 8. Locale — *aberto, slice 4*

A regra: **o EN cobre orientar-se e consultar; o pt-BR cobre também executar no mercado local.** Um desenvolvedor de fora integrando com uma API de pagamento brasileira precisa do quickstart, dos conceitos, do SDK e da referência; Pix, boleto, split e conciliação não têm leitor de EN.

**EN cobre 44 das 73 páginas; 29 são buraco de propósito.** *(Correção de aritmética: os números da resolução original somavam errado — as listas dela fecham em 44 e 29, não em 38 e 35.)*

A página não traduzida é gerada **em silêncio**, com o texto em português, sem aviso e sem relatório. Uma spec que nunca exercita esse estado não decidiu nada sobre ele; só não esbarrou nele. A sinalização é um componente de conteúdo que lê o locale corrente e devolve nada em pt-BR — e a mecânica se resolve sozinha, porque a tradução substitui o arquivo inteiro: o marcador aparece em `/en/` exatamente enquanto não houver contraparte, e some no instante em que houver. Sem lista para manter, sem flag, sem drift possível.

O detalhe fica no slice 4, com o conteúdo.

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
| A divergência da fixture de página curta | **origem própria (implementação)** | a página do slice 1 antecede a fixture |
| Este documento é dono dos artefatos AI-era | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16), fechando a lacuna de dono |
