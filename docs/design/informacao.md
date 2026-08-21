# Arquitetura de informação

O acervo, a topologia, a árvore, os tipos de página, os orçamentos, as doze fixtures, a regra de locale e os artefatos AI-era.

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

## 2. Topologia — quatro tabs, quatro instâncias, um-para-um

| Tab | Rota | Instância | Layout |
| --- | --- | --- | --- |
| **Ferramentas** | `/ferramentas` | `ferramentas` | padrão, e declara `docItemComponent` |
| **Procedimentos** | `/procedimentos` | `procedimentos` | padrão |
| **Jornadas** | `/jornadas` | `default` | padrão |
| **Times** | `/times` | `times` | padrão |

A ordem da tabela é a do navbar, e ela mudou: `Ferramentas` abre a faixa e `Jornadas` cai para terceira. O que a decidiu foi frequência de consulta, não hierarquia — o que saiu daqui é o que se procura mais. `ABAS`, em `docusaurus.config.js`, e a lista visual do navbar carregam a mesma ordem em duas cópias mantidas à mão; o comentário de lá já previa o dia em que uma quarta tab entrasse.

Tabs no navbar como `docSidebar`, cada uma trocando a sidebar inteira. Ver [`chrome.md`](chrome.md) §2.

**Uma instância por tab, e não uma instância com várias sidebars.** Uma instância *pode* expor várias sidebars, o que economizaria config. Recusado por duas razões mecânicas:

1. **`routeBasePath` é por instância.** Compartilhar jogaria as ferramentas em `/jornadas/ferramentas/…` — a URL deixaria de ler o eixo, e o eixo é a decisão inteira da navegação;
2. **versionamento é por instância.** É o que permitiria versionar uma tab só. O §5 dispensa versionamento por completo, mas foi a granularidade que tornou a análise possível.

**O eixo é a natureza do conteúdo**, e ele é mais forte aqui do que era antes: `Ferramentas` diz **o que saiu daqui**, `Procedimentos` diz **como se faz**, `Jornadas` diz **o que aconteceu**, `Times` diz **quem faz o quê**. Os quatro respondem perguntas diferentes do mesmo leitor.

### 2.1 `Ferramentas` não declara mais `docItemComponent`, e nenhuma folha muda de layout

**Verificado no código, não deduzido:** nenhuma página desta instância muda de layout, e desde a [#118](https://github.com/ThiagoPanini/panlabs-docs/issues/118) não há o que comutar. `docusaurus.config.js` não declara `docItemComponent`, e as **31 folhas** — 27 autorais e 4 geradas — passam pelo mesmo `@theme/DocItem`, com a mesma coluna e o mesmo TOC. O `api_exemplos` continua no front matter das 4 geradas, e quem o lê é o `<PainelComando />` de dentro do fluxo do MDX. Ver [`design/referencia.md`](../design/referencia.md) §2.

É a segunda instância do projeto a usar a opção, e ela continua **degrau 2**: opção pública, custo de upgrade zero, zero swizzle. Ver [ADR 2](../adr/0002-politica-de-swizzle.md).

### 2.2 A classe de instância existe, e continua não sendo usada

O `<html>` de uma página de doc carrega classe por **plugin** (`plugin-docs`), por **instância** (`plugin-id-default`, `plugin-id-procedimentos`, `plugin-id-ferramentas`), por **versão**, por **tipo de página** e por **documento**.

Nada em `src/css/` escopa por instância, e nada deveria:

> **Escopar por instância é escopar por *onde a página está*, quando o que importa é *o que a página é*.** As quatro tabs compartilham o mesmo layout de página; o que rompe layout é o ramo gerado, e ele rompe por `docItemComponent`, que é opção pública. Uma regra `plugin-id-ferramentas` seria a segunda fonte de verdade para uma decisão que o componente de rota já toma.

A porta fica **aberta e não usada**, o que é diferente de fechada.

---

## 3. A árvore — 4 · 5 · 2 · 2, teto de profundidade 4

```
Ferramentas            Procedimentos        Jornadas              Times
├ Bibliotecas          ├ Ambiente           ├ API Owner           ├ Time A
│ └ overpower          ├ Esteiras           └ Security Champion   └ Time B   ← nível 2
│   ├ Comandos         ├ Infraestrutura                                      ← nível 3
│   │ └ overpower list ├ Acessos                                             ← nível 4
│   ├ Alvos            └ Diagnóstico
│   ├ Referência
│   └ Contribuir
├ Módulos Terraform
├ Skills
└ Servidores MCP
```

O marcador de nível aponta a linha do ramo de `Ferramentas`, a única que desce abaixo do teto de 2.

**Treze separadores no topo, e cinco nós que colapsam — todos no mesmo ramo.** O nível de topo não é categoria: é **separador** — rótulo em negrito, sem página, sem seta e sem ícone, sempre aberto (§3.2). Os únicos nós do site que colapsam de verdade são `overpower`, no nível 2, e as quatro seções dele, no nível 3; é por isso que a seta só ganha desenho ali. `Times` segue a mesma forma de `Procedimentos` e `Jornadas`: separador → folha, e nada abaixo.

| Aba | Separadores | Páginas pt-BR | EN |
| --- | ---: | ---: | ---: |
| `Ferramentas` | 4 | **31** (27 autorais + 4 geradas) | **31** |
| `Procedimentos` | 5 | **16** (2 folhas de abertura + 14 folhas) | — |
| `Jornadas` | 2 | **12** (2 folhas de abertura + 10 capítulos) | — |
| `Times` | 2 | **4** (2 folhas por time) | — |
| | **13** | **63** | **31** |

**A árvore está fechada: 59 autorais mais 4 geradas, e o EN em 31.** O ramo gerado de `overpower › Comandos` chega pelo contrato de superfície de comando, e com ele `Bibliotecas` fecha em 26, `Ferramentas` em 31 e o site em **63**. O portão 4 cobra os quatro números.

> **Correção de contagem — #133.** As seções do `overpower` eram **seis** e são **cinco**: `Desenvolvimento` e `Publicação` serviam ao mesmo leitor, quem contribui com a ferramenta, misturadas na sidebar com as que servem quem a instala, e nada ali dizia qual era qual. As duas fundiram em `Contribuir`, e o `changelog` mudou de lado junto, para `Referência`, porque *o que mudou na versão que eu tenho* é pergunta de quem usa. Seis páginas nasceram de recorte no mesmo movimento, e os números foram de 12 · 16 · 26 para 12 · 16 · 32.

> **Correção de contagem — a poda do atalho `op`.** A página `O atalho op` saiu do acervo, e com ela o desenho `send`. Ela ensinava a escrever um alias de shell e a não colidir com a CLI do 1Password: conhecimento de shell, não da ferramenta, e nada no `overpower` muda se ele não existir. Os números foram de 12 · 16 · 32 para 12 · 16 · 31, e o manifesto de ícones de 96 tags sobre 61 arquivos para 94 sobre 60.

> **Correção de contagem — #117.** Os números anteriores eram 12 · 16 · 17, com 39 autorais, 45 no site e 17 em EN. `Biblioteca A`, `B` e `C` saíram inteiras, com o ramo gerado de assinatura junto, e no lugar entrou o `overpower`, com 17 páginas autorais e 4 geradas por locale. Demolição e construção foram o mesmo commit por obrigação de portão: `Biblioteca C` era a única instância de três dos dez tipos de página, e não havia corte que deixasse a cobrança 12 verde no meio do caminho.

> **Correção de contagem — #114.** Os números anteriores eram 12 · 19 · 21, com 46 autorais, 52 no site e 21 em EN. Sete páginas de índice saíram com a forma *índice de categoria* (§6.3), e as quatro que carregavam tipo ou fixture viraram folha. A queda é de sete em pt-BR e de quatro em EN — as três de `Procedimentos` nunca tiveram contraparte traduzida.

> **Correção de aritmética contra a resolução, e ela continua valendo lida ao contrário.** A resolução pedia *"46 páginas autorais em pt-BR e 21 em EN"*, e os dois números não podiam valer juntos: as geradas estão **fora** do primeiro e **dentro** do segundo. Elas chegam no mesmo commit nos dois locales. Com a #117 os números são 50 e 26, e a relação é a mesma — a diferença é exatamente as 28 páginas de `Jornadas` e `Procedimentos`, que não se traduzem.

**A contagem desigual das jornadas é de propósito** — `API Owner` com 6 capítulos e `Security Champion` com 4. Arco de papel não tem comprimento fixo, e duas jornadas com o mesmo número leem como formulário preenchido duas vezes.

**`Ferramentas` é a única aba que passa do nível 1**, e a profundidade existe onde uma ferramenta tem seções: `Bibliotecas › overpower`. As outras três famílias da aba são separador → folha, e as outras três abas inteiras também.

### 3.1 O teto de profundidade sobe para 4, e ele é confinado a um ramo

O teto anterior era 2, e o argumento forte dele não era medição — era a **regra de ícone**: *obrigatório na categoria de topo, ausente na folha*. Num terceiro nível o nó do meio não é nem uma coisa nem outra, e a regra não tinha leitura.

**A regra foi reescrita duas vezes desde então**, e a terceira redação é a que fecha o assunto: **nenhum ícone no separador; ícone em tudo abaixo dele, folha ou grupo, em qualquer nível** (ver [`icones.md`](icones.md) §8). Ela é a primeira **agnóstica de profundidade** — o teste é *"isto é o separador de topo?"*, e ele tem resposta em qualquer árvore. As duas anteriores tinham teste que mudava de resultado com o nível, e foi isso, não o teto, que travou o nível 3 por duas issues.

> **Correção de fato — #97, e ela ficou obsoleta na #114.** A redação intermediária era *ícone em toda folha, nenhum em cabeçalho de grupo*, e ela negava ícone a um grupo de nível 2. A redação em vigor dá ícone a ele: o grupo está abaixo do separador, e o nível dele não entra no teste. As três redações resolvem o nível 3, e só a terceira resolveu também o nível 4 sem que ninguém tivesse de decidir de novo — o que ficou provado quando o `overpower` chegou e a regra não precisou de uma quarta redação.

**A cobrança mudou de forma, e são duas.** Ela era *"o nível 3 é usado ao menos uma vez"*, que é teto com consumidor e sem fronteira: nada impedia um terceiro nível aparecer em `Jornadas` no dia seguinte. O portão 4 passa a cobrar que **nada passe de 4 em lugar nenhum** e que **nada passe de 2 fora de `ferramentas/bibliotecas/overpower`**. Um teto que se declara e não se confere é um teto que sobe sozinho; um teto que se confere sem fronteira é um teto que vaza.

**O ramo tem 19 folhas no nível 4**, contra as 13 que o [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) §g escreveu antes de o conteúdo existir: 4 páginas geradas em `Comandos`, 3 em `Alvos`, 9 em `Contribuir` e 3 em `Referência`. O ADR contava `Desenvolvimento` e `Publicação`, que fundiram em `Contribuir`, e a fusão trouxe seis páginas de recorte junto. As cinco folhas de abertura das seções não entram na conta porque não ocupam linha própria — elas são o `link` da categoria, no nível 3.

> **O teto de 288px não reabre, e a medição é anterior a este trabalho.** A sidebar do Devin e a do `docs.windsurf.com` têm os mesmos 288px, e o windsurf segura cinco níveis dentro deles. A fixture `aninhamento-de-sidebar-maximo` (§7) é a instância que prova o quarto nível aqui: 40px de recuo mais ícone mais o rótulo mais longo dessa profundidade.

### 3.2 O nível de topo é separador, e a categoria não é destino

**O separador não é página.** Sem `link`, sem seta, sem ícone, e sempre aberto — em `sidebars-*.js` isso é `collapsible: false` mais ausência de `link`. Ele é um rótulo em negrito cuja única função é agrupar, e é o análogo exato do `<h3 class="sidebar-title">` da âncora.

**Do segundo nível para baixo o nó aponta para a própria página de abertura.** Colapsável, clicável, com ícone, e ele **nasce fechado** — o Docusaurus abre sozinho o ramo da página atual.

| Nível | O que é | Tem página | Colapsa | Ícone | Seta |
| --- | --- | :---: | :---: | :---: | :---: |
| 1 | separador | não | não (sempre aberto) | não | não |
| 2+ | categoria | sim, a de abertura | sim, nasce fechada | sim | sim |
| folha | folha | sim | — | sim | não |

Hoje o único nó de nível 2 é `Bibliotecas › overpower`, que aponta para `Visão geral`; os cinco de nível 3 são as seções dele, e cada uma aponta para a própria folha de abertura.

**A folha de abertura tem linha própria.** Quatro páginas de entrada sobreviveram à morte da forma *índice de categoria* (§6.3), e as quatro abrem o grupo delas como primeira folha:

| Aba | Separador | Folha de abertura |
| --- | --- | --- |
| `Jornadas` | API Owner | `Índice` |
| `Jornadas` | Security Champion | `Índice` |
| `Procedimentos` | Ambiente | `Índice` |
| `Procedimentos` | Diagnóstico | `Índice de sintomas` |

**A assimetria que sobra é medida, não descuido:** os outros nove separadores não têm folha de abertura nenhuma, e na âncora é assim — `Get Started` abre com a folha `Introducing Devin`, e outros grupos abrem direto no primeiro item.

**A rota nua de cada aba resolve por `slug: /`.** A primeira folha de cada instância carrega `slug: /` no front matter, e `/ferramentas`, `/procedimentos`, `/jornadas` e `/times` passam a ser páginas de verdade em vez de 404 ou redirecionamento. O portão 6 confere as quatro contra o host publicado.

> **Correção de fato — #114.** Esta seção dizia *"a categoria é clicável e aponta para o índice"*, e sustentava a decisão em *"três fatos verificados na fonte"*. Lidos um a um, dois eram mecânica do Docusaurus — o caret é elemento separado do link; categoria sem link não é inerte no SSR — e o terceiro era uma **opinião** escrita como fato: *"fazer o elemento mais proeminente da sidebar ser um destino em vez de um toggle é melhor"*. Nenhum dos três media a âncora, e o carimbo da linha dizia isso: `origem própria`, que a [`principios.md`](principios.md) §5 define como *"a mais frágil, e a primeira a ser contestada"*. A medição contestou. O detalhe está no [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md).

> **Correção de carimbo — #114.** `collapsed: false` estava carimbado **`herdado`**, com a fonte *"a âncora mostra a árvore aberta"*. A medição diz que a âncora mostra o **nível 1** aberto — e ele nem colapsa —, enquanto grupo aninhado nasce **fechado**. `herdado` significa *não toca*; um `herdado` falso congela uma decisão que ninguém tomou. A chave saiu do repositório inteiro: onde não há colapso ela não tem sujeito, e onde há, o default do Docusaurus já é o alvo.

**Duas páginas de abertura carregam tipo de verdade**, e não uma forma: `Diagnóstico › Índice de sintomas` é `Troubleshooting`, e `overpower › Visão geral` é `Quickstart`. `Alvos › Índice` é a terceira, e é `Catálogo`. Forma e tipo são eixos diferentes; quando discordam, quem manda no número do §6.2 é o tipo.

### 3.3 O que existe, e o que falta

| Estado | O quê | Dono |
| --- | --- | --- |
| escrito | `Jornadas` inteira — 2 folhas de abertura e 10 capítulos | este ticket |
| escrito | `Procedimentos` inteira — 2 folhas de abertura e 14 folhas | este ticket |
| escrito | as **11 folhas autorais** de `Ferramentas`, nos dois locales | este ticket |
| escrito | as **4 páginas geradas** de `overpower › Comandos` e o fragmento de sidebar | [#82](https://github.com/ThiagoPanini/panlabs-docs/issues/82) |
| removido | as **7 páginas de índice de categoria**, e a forma com elas | [#114](https://github.com/ThiagoPanini/panlabs-docs/issues/114) |

**O ramo gerado não é escrito à mão.** Ele sai de um contrato de superfície de comando — uma aplicação e três comandos —, e o gerador emite também o fragmento de sidebar que `sidebars-ferramentas.js` importa; escrevê-lo à mão seria exatamente a segunda fonte de verdade que o gerador existe para impedir. Ver [ADR 9](../adr/0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md), que supera o [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md), que superou o [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md).

**Os onze pares seção→ícone estão inteiros no manifesto e no CSS**, e o vendorizador confere que os três lugares onde eles vivem — manifesto, `className` de sidebar e regra de máscara — concordam.

### 3.4 Categoria sem filhos vira link, e o CSS precisa saber disso

**Medido no artefato.** Uma categoria declarada com lista de itens vazia é **normalizada para link** pelo Docusaurus: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável. O caret some, e some com razão.

O CSS de sidebar cobre as duas formas — a folha, e o nó embrulhado por `.menu__list-item-collapsible`. **Nenhum dos treze separadores está vazio hoje**, então a regra é **cobertura sem fixture**, escrita para não ser removida por parecer morta.

---

## 4. A regra de heading, que é decisão de layout disfarçada de conteúdo

> **Toda página carrega no mínimo três `##`.** Dois gabaritos abrem teto próprio, e **nenhum dos dois é exceção**: `Receita` fica em no máximo um, e o índice de jornada em exatamente dois — que são os dois headings literais obrigatórios dele.

Não é estilo. É a regra que produz as configurações de TOC que provam a medida constante da coluna.

**Correção de premissa, medida em 3.10.2 e mantida:** a classe de 75% é aplicada sempre que `hide_table_of_contents` não está no front matter, **independentemente de haver heading**. O que depende de heading é a coluna do TOC. A tabela completa está em [`chrome.md`](chrome.md) §2.1.

### 4.1 A exceção é uma só, e é nomeada

> **`Procedimentos › Ambiente › Índice` carrega ZERO `##`.** É a única página abaixo do próprio piso sem que um gabarito a autorize, e ela está lá de propósito.

**Ela trocou de dona nesta spec.** A fixture morava em `Comece aqui › Ambientes`, que é página do produto anterior e morreu com a árvore. Foi para o índice de `Ambiente`, e o custo em página é **zero** — ela nunca foi o cartão.

**O que ela prova mudou, e a redação anterior ficou para trás.** Dizia ser *"o `.col` travado no mesmo pixel com ou sem TOC, confirmado ao vivo contra o próprio Devin, que reserva a largura da coluna de TOC mesmo vazia"*. A #96 **reverteu o mesmo-pixel** — [`chrome.md`](chrome.md) §1 registra que a caixa invisível passou a segurar dois pixels, um por configuração —, então a fixture deixou de provar aquilo no instante em que a decisão caiu. Ela continua sendo fixture, e por um motivo mais estreito: é uma das **3** páginas do acervo sem um `##`, e portanto a única forma de exercitar a perna *sem heading* — TOC fora do DOM e teto de 840 a partir de 1408. A medição contra o Devin não é apagada: ela sustentava a decisão que a #96 reverteu, e vive no registro dessa reversão.

**Exceção anônima é buraco; exceção nomeada é decisão.** É por isso que ela está escrita aqui, no `sidebars-procedimentos.js` e no portão — e é por isso que a segunda reprova.

**Teto que sai de gabarito não é exceção.** `Receita` em no máximo um `##` e o índice de jornada em exatamente dois são **orçamento do tipo**, e o portão os trata como tal. Exceção é a página que rompe a própria forma, e ela é uma.

### 4.2 O portão 4 — a régua de máquina das contagens

Os critérios desta seção, do §6, do §7 e do §8 são todos **contagens**, e contagem que só existe em prosa é contagem que envelhece calada. Uma página a mais em `Esteiras` não quebra build nenhum; ela só faz este documento passar a mentir.

`scripts/portao-4-conteudo.sh` cobra **dezessete** coisas, na cadência de commit:

| # | O que confere |
| ---: | --- |
| 1 | o volume por aba e por categoria — 31 · 16 · 12 · 4, e **63** no total |
| 2 | **o tipo de cada página, e o orçamento estrutural dele** — um `Guia` sem `<Steps>` reprova |
| 3 | a regra de heading, com a exceção nomeada acima como **única** |
| 4 | **`<Steps>` ausente em toda `Jornadas`** |
| 5 | **`<CardGroup>` ausente** nos dois índices de jornada, e os headings literais `## Como foi` e `## O que não funcionou` presentes |
| 6 | **prosa entre o `# h1` e o primeiro `##`** em todo capítulo |
| 7 | a lista ordenada de `## Como foi` com **exatamente N itens para N capítulos** |
| 8 | **exatamente uma palavra de estado** na abertura de cada índice de jornada |
| 9 | o marcador de tradução em **31** páginas, e em nenhuma tradução |
| 10 | **`description` presente em 100%** das páginas |
| 11 | **as doze fixtures existem**, por caminho nomeado |
| 12 | **os onze tipos têm instância** — e nenhum fica pendente |
| 13 | **a cobertura de locale** — 32 páginas em EN, e só `Ferramentas` |
| 14 | **zero travessão** em `conteudo/`, `i18n/` e `contratos/` — a mensagem aponta arquivo e linha, e a exceção de citação abaixo é a única |
| 15 | **o teto de profundidade** — 4, alcançado, e confinado a um ramo |
| 16 | **a `Verificação` verifica** — página typed `guia` cuja seção existe e não tem bloco cercado, **nos dois locales** |
| 17 | **o vocabulário do ramo está definido** — termo de `scripts/termos-overpower.txt` sem entrada em `conceitos.md`, **só em pt-BR** |

As contagens ignoram bloco cercado, senão um `##` de comentário ou um `<Steps>` citado dentro de um trecho de código contariam.

**A cerca indentada conta, e isso é correção de fato contra a versão anterior do portão.** Ela casava `^``` ` enquanto a função que rastreia *"estou dentro de uma cerca?"* casava `^[[:space:]]*``` `. Uma cerca dentro de `<Steps>` abria e fechava o estado sem nunca ser contada como bloco. O desacordo era inofensivo enquanto o `<Steps>` carregava pouco código; na árvore nova ele carrega quase todo o código dos guias, e a contagem saía pela metade. Indentar cerca dentro de JSX é seguro: **o MDX desliga o bloco de código por indentação**, que é exatamente o que permite indentar Markdown dentro de um componente.

**As cobranças 16 e 17 nasceram na [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133), e as duas cobram uma promessa, não uma contagem.** A 16 mede o que uma seção chamada `Verificação` de fato contém: nas cinco páginas typed `guia` do ramo `overpower` ela não trazia comando nenhum, e sim justificativa de desenho. A 17 mede a declaração de abertura de `conceitos.md`, que diz ser onde a definição mora: `achado` e `enxerto` eram usados em três páginas como se conhecidos, e definidos em zero.

**A 16 não cobra a AUSÊNCIA da seção, e o limite é deliberado.** Exigi-la alcançaria `procedimentos/esteiras/verificar-a-assinatura-hmac.md`, que é de outra aba e estava fora do escopo do ticket. O buraco fica nomeado no comentário do portão, para o ticket que o fechar.

**A 16 varre os dois locales; a 17, só o pt-BR.** A assimetria tem razão: o heading da 16 é fixo por locale (`## Verificação` e `## Checking it`) e não há o que traduzir na régua, enquanto a lista de termos da 17 carrega palavras em português e cobrir o EN exigiria uma segunda lista para uma página que é tradução da primeira.

**A 17 cobra uma direção só, e a outra é da skill.** Termo listado e não definido é varredura; termo usado na prosa e não listado é juízo, porque nenhuma varredura distingue vocabulário de produto de palavra comum. A segunda metade mora na `varredura-overpower`, e sem as duas a lista vira carimbo.

**Proibição por localização é classe de regra nova neste projeto.** Até aqui gabarito **exigia** e **limitava**; nenhum dizia *"aqui não entra"*. As linhas 4 e 5 são teto de zero, e existem onde a alternativa era confiar em bom senso.

**O tipo de cada página mora no portão, e não no conteúdo.** O §6 trava que tipo é convenção de conteúdo e **zero layout** — sem front matter `type:`, sem classe CSS por tipo. Um manifesto de build não é nenhum dos dois: ele não toca a página nem o CSS, e não existe no artefato publicado.

**O travessão sai do conteúdo publicado, e `docs/` fica de fora.** O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um site que se olha; o português tem vírgula, dois-pontos, parênteses e ponto final para tudo o que ele faz. A cobrança 14 cobra a **ausência**, nunca a substituição: cada ocorrência cai numa saída diferente, e algumas exigem reescrever a frase — é por isso que o portão aponta arquivo e linha e para por aí, e é por isso que ela não vira `sed`. A spec não é varrida porque não é produto, ninguém a navega como página, e `scripts/invariantes.sh` **exige** o literal `Livre — <dono>` dentro de `docs/`: varrê-la seria uma régua de máquina reprovando o que a outra obriga.

**A exceção é citação de saída de ferramenta, e ela nasceu de duas regras que colidiam ([#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133)).** `referencia/solucao-de-problemas.md` promete citar a mensagem de recusa **como a ferramenta a imprime**, e três das mensagens do `overpower` carregam travessão literal. Reescrever a frase falsificaria a citação: o leitor procuraria no terminal um texto que não existe. A saída reusa o padrão da invariante 2 — **quem carrega o literal declara no próprio preâmbulo que carrega** — e o travessão passa só dentro de região de citação:

| Superfície | A declaração, nas 20 primeiras linhas | Onde o travessão passa |
| --- | --- | --- |
| `.md` e `.mdx` | `{/* cita-saida-de-ferramenta */}` | dentro de cerca de código, ou na linha `api_exemplos:` da página gerada |
| `.json` de `contratos/` | `"citaSaidaDeFerramenta": true` | dentro de um valor `"mensagem"` |

**O marcador é `{/* */}` e não `<!-- -->`, e isso é medição, não gosto.** Sob MDX 3 o comentário HTML não compila — *Unexpected character `!` (U+0021) before name* —, e toda página deste site passa pelo compilador MDX, `.md` inclusive, porque a config não declara `markdown.format`.

**A linha 13 estava faltando nesta tabela, e a contagem dizia doze.** A cobertura de locale é cobrada pelo portão desde que ele foi reescrito com a árvore do `panlabs`, e a tabela nunca a listou. A #115 acertou os dois lados de uma vez, ao acrescentar a 14.

**A coluna de palavras não é cobrada, e a de estrutura é.** Palavra é proxy ruim, e cobrar por máquina um número que as páginas de código não têm por que bater só produziria prosa de enchimento.

**`onBrokenAnchors: 'throw'` continua na config**, e a consequência de contrato vale repetida: **toda âncora citada por um link é declarada com `{#id}` no próprio heading**, em vez de depender de como o slugger trata acento. A tabela de sintomas de `Diagnóstico › Índice de sintomas` é quem exercita isso.

---

## 5. Versionamento — nenhum

Não existe `versions.json`, `versioned_docs/`, `versioned_sidebars/` nem seletor de versão. Uma árvore por instância.

Isto **reverte** a leitura da pesquisa, que recomendava duas versões como demonstração de mecânica. A revisão foi feita contra a própria base de evidências dela: **seis das sete referências não têm seletor de versão nenhum**. E a doc oficial diz, verbatim, que *"most of the time, you don't need versioning as it will just increase your build time, and introduce complexity to your codebase"*.

**Mas os artefatos continuam versionados — as ferramentas, não a documentação.** Pacote e módulo carregam semver, a política está escrita em `Jornadas › API Owner › A política de versão`, e o `Changelog` de `overpower › Publicação` é o único lugar onde a mudança se comunica. Custa uma página e zero build.

O que isso simplifica, em ordem de tamanho:

1. **A busca perde uma obrigação inteira.** Sem versão, o índice só precisa do locale — e locale sai de graça, um diretório de saída por locale;
2. a armadilha do snapshot assimétrico deixa de existir;
3. o navbar devolve o espaço do seletor;
4. três árvores de conteúdo em vez de sete.

**O que se perde, verificado e menor do que parecia:** `DocVersionBanner` e `DocVersionBadge` nunca aparecem no artefato. Os dois nomes estão escritos aqui de propósito — uma ausência que só existe descrita não é greppável pelo próximo agente que vier procurar por ela.

São, respectivamente, `alert alert--warning` e `badge badge--secondary` — **classes puras do Infima**, cobertas pelas regras de token que a spec precisa ter de qualquer jeito. Registrado como **ausência conhecida**, não omissão.

---

## 6. Tipos de página — onze, todos convenção de conteúdo

São onze, todos **convenção de conteúdo e zero layout**: sem front matter de tipo, sem classe CSS por tipo, sem componente próprio.

> **O site inteiro tem exatamente uma ruptura de layout:** o ramo gerado de `overpower › Comandos`. **Nenhuma segunda nasce de um tipo.**
>
> *Correção de contagem.* **Eram duas**; a outra era a landing, e ela saiu em [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94). O número caiu por subtração de página, e não por afrouxamento: o que a frase proíbe continua sendo que um **tipo** produza layout próprio, e nenhum dos onze produz. A raiz não recompõe o par — ela é um salto para a rota nua da primeira aba, e salto não tem layout a romper.

### 6.1 Os onze gabaritos

| Tipo | Onde vive | Gabarito |
| --- | --- | --- |
| **Quickstart** | `overpower › Visão geral` | intro curta → `<Steps>` com código em cada passo → `<CardGroup>` de próximos passos |
| **Conceitual** | Infraestrutura, Diagnóstico, `overpower` | definição → por que existe → como aparece no artefato → armadilhas em `callout` |
| **Guia** | folhas de `Procedimentos` e `Ferramentas` | pré-requisitos → `<Steps>` → verificação → variações |
| **SDK** | `overpower › Instalação` · `Servidor de catálogo MCP` | instalação em `<CodeGroup>` por gerenciador → configuração → uso → tratamento de erro |
| **Referência** | `overpower › Comandos › Índice` · `overpower › Referência › Índice` | o que é → **a tabela ou a lista que se consulta** → as notas de uso |
| **Referência de API** | `overpower › Comandos`, ramo gerado | **gerada** do contrato de superfície de comando — o gabarito é a saída do gerador |
| **Receita** | `Skills` | o problema em uma frase → código completo copiável → no máximo 1 `##` |
| **Catálogo** | `Ambiente`, `Acessos`, `overpower › Alvos` | intro curta → como ler a tabela → **a tabela larga** → notas |
| **Troubleshooting** | `Diagnóstico`, `overpower › Referência` | tabela de sintomas → uma seção por sintoma: causa, comando que confirma |
| **Changelog** | `overpower › Referência › Changelog` | cronologia reversa, uma entrada por versão publicada |
| **Índice de jornada** | os 2 índices de `Jornadas` | ver §6.4 — o décimo tipo |

**O décimo primeiro tipo nasceu na [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133), e ele fecha um buraco medido.** `comandos/indice.md` mede 83,3% Referência e `referencia/indice.md` mede 72,3%, e as duas estavam arquivadas como `Conceitual`. Não era acidente: a taxonomia não tinha slot para **referência autoral**, então toda página assim era empurrada para `Conceitual`, e passava a ser cobrada por um gabarito que pede *definição → por que existe → armadilhas* onde o corpo é uma tabela que se consulta. O tipo novo separa a tabela que se lê do argumento que se segue, e o que a máquina cobra dele é a tabela, porque é ela que faz a diferença.

**`Referência` não é `Referência de API`, e a distância entre as duas é quem escreve.** A segunda é **gerada** e o gabarito dela é a saída do gerador; a primeira é autoral, e o gabarito é o desta linha. Um nome não abrevia o outro.

**`Instalação` é SDK e não Guia, e a atribuição é de propósito.** O gabarito de SDK pede *instalação em `<CodeGroup>` por gerenciador*, e `uvx` contra `uv tool` contra `pipx` é exatamente isso. Sem ela o tipo cairia de três instâncias para uma, porque `Biblioteca A` e `B` eram duas delas. `Alvos › Índice` carrega tipo de verdade pelo mesmo mecanismo que `Diagnóstico › Índice de sintomas` já abriu (§6.3): a página de abertura de uma seção pode ser um tipo, e aqui ela é `Catálogo`, com os 77 runtimes.

### 6.2 O orçamento é de estrutura, e a palavra é indicativa

**A coluna que obriga é a de estrutura.** O que estressa layout é contagem de estrutura, e *palavra é proxy ruim*. É a coluna de estrutura que o portão 4 confere, página por página.

**A coluna de palavras é indicativa**, e diz o tamanho que o tipo costuma ter. Ela não é cobrada por máquina, e por um motivo específico: as páginas cujo corpo é código — `SDK`, `Receita`, e a `Conceitual` que carrega a fixture de bloco longo — ficam abaixo da faixa **porque o código é o conteúdo**.

| Tipo | Palavras | Estrutura mínima | Quantas neste artefato |
| --- | --- | --- | ---: |
| Quickstart | 500-700 | 1 `<Steps>` de 5 passos · 5 blocos · 2 `:::` · 1 `<CardGroup>` | 1 |
| Conceitual | 700-1000 | 2 blocos · 1 `:::` · 1 tabela · 3-6 `##` | **11** |
| Guia | 600-900 | 1 `<Steps>` · 3 blocos · 2 `:::` | **15** |
| SDK | 400-600 | 1 `<CodeGroup>` de instalação · 4 blocos | 2 |
| Receita | 150-250 | 1 bloco **longo** · no máximo 1 `##` | 2 |
| Catálogo | 200-300 | 1 tabela de 20-40 linhas × 4-5 colunas | **7** |
| Referência | 300-600 | 1 tabela · 3-6 `##` | **3** |
| Troubleshooting | 800-1200 | 1 tabela de sintomas · 3-8 `##` | 4 |
| Changelog | — | 6-8 entradas em `<Update>` | 1 |
| Referência de API | — | a saída do gerador | **4 — geradas** |
| *índice de jornada* | 250-400 | ver §6.4 | 2 |
| *capítulo de jornada* | 180-1800 | 3-6 `##` · 2 blocos · 1 `:::` · prosa antes do 1º `##` · **sem `<Steps>`** | 10 |
| *a fixture de página curta* | ~120 | nenhuma — ver §4.1 | 1 |
| | | **total autoral** | **59** |

> **A linha *índice de categoria* saiu, e a da fixture curta passou a somar.** Eram **oito** índices de categoria, e a fixture de página curta — `Procedimentos › Ambiente › Índice` — era uma delas: a linha dela existia para nomear o **papel**, e contá-la de novo fazia a coluna somar 47 contra um total de 46. Com a #114 a forma morreu (§6.3): sete das oito páginas saíram, e a oitava é justamente a fixture, que agora tem linha própria na sidebar e conta uma vez, na linha dela.

> **A coluna foi remedida com o `overpower` dentro, e nenhum número dela é escolha de redação:** os doze são a contagem do manifesto de `scripts/portao-4-conteudo.sh`, que é o que crava e reprova. As 17 páginas novas caem em sete dos onze tipos, e a distribuição não foi desenhada para encher a coluna — ela é o que a doc de origem já tinha, mapeada gabarito a gabarito. O `Guia` passou de 11 para 15 porque cinco das seis seções do `overpower` têm uma folha de procedimento, e o `Conceitual` de 3 para 9 pelo mesmo motivo, do outro lado.

> **A coluna se moveu duas vezes desde a remedição.** `O atalho op` saiu do acervo, e `Códigos de saída` deixou de ser `Conceitual` para ser `Referência`: ela é uma tabela que se consulta mais as notas de uso dela, que é o gabarito do tipo, e estava carimbada `Conceitual` só porque o tipo `Referência` não existia quando ela foi escrita. `Conceitual` foi de 11 para 9, `Referência` de 2 para 3, e o total autoral de 56 para 55.

> **Correção de contagem — a chegada de `Times`.** A quarta aba trouxe dois times fictícios, mesma estrutura entre os dois: uma folha `Conceitual` (`Visão geral`) e uma folha `Catálogo` (`Desenvolvimento`) por time. `Conceitual` foi de 9 para 11, `Catálogo` de 5 para 7, e o total autoral de 55 para 59 — 63 no site, com as 4 geradas somadas por fora.

### 6.6 A cerca ```` ```text ```` é tela de ferramenta, e só

Toda cerca ```` ```text ```` do acervo é **saída literal do `overpower`**, gravada da ferramenta em 60 colunas por um terminal de verdade. Ela tem entrelinha própria em `src/css/componentes.css`, `--pd-leading-tela`, porque o que ela desenha é painel de caixa e a parede `│` de uma linha precisa encostar na da linha seguinte. Com a entrelinha de código a parede vira tracejado.

**A consequência é uma reserva.** Cerca de código que não é tela declara a linguagem dela, que é o que toda outra cerca do acervo já faz. Uma cerca `text` escrita para prosa qualquer herdaria a entrelinha de terminal e sairia apertada, sem nada na página explicando por quê. A largura de 60 colunas também não é gosto: em 80 a arte estoura a coluna de prosa e o leitor recebe metade de um painel com barra de rolagem.

**Os onze tipos têm instância neste artefato**, e `Referência de API` é o único gerado. O portão 4 cobra a pendência **pelo avesso**: as quatro existem, e nenhuma delas pode aparecer no manifesto de tipo — uma linha ali seria página escrita à mão sob o gabarito *a saída do gerador*, que é a incoerência que o §6.1 já adjudicou uma vez.

### 6.3 O índice de categoria era uma forma, e a forma morreu

**Sete páginas saíram, e a forma saiu com elas.** `Bibliotecas`, `Módulos Terraform`, `Skills`, `Servidores MCP`, `Esteiras`, `Infraestrutura` e `Acessos` tinham por conteúdo *a lista do que está logo abaixo* — e a sidebar já é essa lista. A redundância é o que a âncora não tem, e sem categoria clicável (§3.2) não sobra destino a que o índice sirva.

**Quatro sobreviveram como folha, e nenhuma delas era forma.** Eram conteúdo com dona, e matá-las derrubaria quatro invariantes de uma vez:

| Página | Por que sobrevive |
| --- | --- |
| `Ambiente › Índice` | fixture `pagina-muito-curta` **e** a única exceção nomeada da regra de heading (§4.1) |
| `Diagnóstico › Índice de sintomas` | carrega `Troubleshooting` de verdade |
| `API Owner › Índice` | é o décimo tipo de página |
| `Security Champion › Índice` | é o décimo tipo **e** a fixture `prosa-pura` |

Custo de matar as quatro: um tipo de página, duas das doze fixtures e a exceção de heading — quatro invariantes derrubadas para poupar quatro arquivos.

**`fixture-curta` é o que resta da forma, e continua não sendo tipo.** É o gabarito de `Ambiente › Índice`: ~120 palavras e zero `##`. Ele descreve *como aquela página se escreve*, não uma classe de conteúdo — a mesma distinção de sempre, gabarito sem tipo.

**Duas folhas de abertura carregam tipo de verdade.** `Diagnóstico › Índice de sintomas` é a tabela de sintomas do gabarito de `Troubleshooting`, e é contado lá. Forma e tipo são eixos diferentes; quando discordam, quem manda no número é o tipo. O mesmo vale para `overpower › Visão geral`, que é página de abertura de categoria **e** `Quickstart`, e para `overpower › Alvos › Índice`, que é abertura de seção **e** `Catálogo`.

**`capítulo` também é forma, e não um décimo primeiro tipo.** Ele tem gabarito próprio — e um gabarito apertado, porque é a folha mais numerosa do acervo —, mas o que ele descreve é *como uma folha de `Jornadas` se escreve*, não uma classe de conteúdo que exista noutra aba. A distinção é a mesma do índice de categoria: gabarito sem tipo.

### 6.4 O décimo tipo — o índice de jornada

```
# <Nome da jornada>
<Untranslated />

<abertura: o período e o estado — uma ou duas frases>

## Como foi
1. <marco temporal>, <link do capítulo>: <uma linha>
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

## 7. As doze fixtures — cada caso difícil com uma dona nomeada

**Cada caso difícil tem exatamente uma página dona, nomeada.** Não *"algumas páginas terão tabelas largas"* — *esta* página é a fixture da tabela larga. A spec aponta para o artefato em vez de descrever a hipótese, e quem implementa sabe onde olhar para saber se acertou.

**Eram treze, foram a onze, e são doze.** Nenhuma morreu pelo cartão, e a décima segunda chegou com o quarto nível de sidebar.

| Caso | Página dona | O que prova |
| --- | --- | --- |
| Tabela larga | `Acessos › Permissões por papel` — 40 × 5 | scroll horizontal dentro da coluna de prosa |
| Tabela como página inteira | `Ambiente › Comparativo dev/staging/prod` | o tipo `Catálogo` com prosa quase nula |
| Bloco de código longo | `Esteiras › Verificar a assinatura HMAC` | **altura** — bloco de 70 linhas. Só isso: a página não tem `<CodeGroup>` nem cerca titulada (ver nota) |
| **Página muito curta** | **`Ambiente › Índice`** — ~120 palavras, zero `##` | **a perna sem heading**: nenhuma coluna de TOC no DOM, e o teto de 840 mordendo a partir de 1408 (ver nota) |
| Prosa pura | `Jornadas › Security Champion › Índice` | a medida de prosa sozinha, sem nada para escondê-la |
| Item de sidebar mais largo | `Security Champion › A varredura que reprovava tudo` — 30 caracteres | wrap ou truncamento no item, com ícone à esquerda |
| Prosa mínima, código máximo | `Skills › Scaffold de esteira` | o escape de medida com um bloco só, muito longo |
| Fallback silencioso de locale | `/en/jornadas/api-owner/a-politica-de-versao` | `<Untranslated />` e texto pt-BR sob rota EN |
| Aninhamento profundo | `Infraestrutura › O output de um módulo` — quatro níveis | `<ResponseField>` sobre `<Expandable>` |
| Página muito longa | `API Owner › O contrato que não existia` — ~1800 palavras | TOC longo, `sticky` e scroll-spy |
| Sem painel, mesma moldura | `overpower › Comandos › Índice` | a folha autoral que abre a categoria das quatro geradas: **sem** `api_exemplos`, e medindo o mesmo que as **com** — era a fixture da perna que delegava, e virou a prova de que não há duas pernas |
| **Aninhamento de sidebar máximo** | **`overpower › Referência › Solução de problemas`** — nível 4 | os 40px de recuo mais o ícone mais 20 caracteres de rótulo, dentro dos 288px |

> **Duas linhas desta tabela prometiam mais do que a dona entrega, e as duas foram medidas.**
>
> **`Página muito curta`** dizia provar *"a coluna no mesmo pixel sem coluna de TOC"*. Esse alvo **não existe mais**: a #96 reverteu o mesmo-pixel, e [`chrome.md`](chrome.md) §1 já registra que a caixa invisível hoje segura **dois** pixels, um por configuração. A prova que a página de fato entrega é outra, e continua valendo a fixture: ela é uma das **3** páginas do acervo sem um `##`, e é por isso a única forma de exercitar a perna *sem heading* da tabela de §1 — TOC ausente do DOM e teto de 840 mordendo a partir de 1408.
>
> **`Bloco de código longo`** prometia *"altura, `<CodeGroup>` e o título nu"*, e a dona não tem os dois últimos: `verificar-a-assinatura-hmac.md` tem **zero** `<CodeGroup>` e nenhuma cerca titulada — as duas cercas dela são ```` ```python ```` e ```` ```yaml ````, nuas. O que ela prova é a **altura**, com um bloco de 70 linhas, e isso ela prova sozinha. `<CodeGroup>` e cerca titulada têm dona em outro lugar: `Bibliotecas › overpower › Instalação` e `Servidores MCP › Servidor de catálogo MCP`. Fixture que promete três coisas e entrega uma não é fixture fraca — é **afirmação não conferida**, que é o defeito que esta seção existe para não ter.

**Duas fixtures morreram, e nenhuma pelo cartão.** `Sidebar longa` — nenhuma aba nova chega perto das 33 linhas da árvore anterior, e este artefato **não inventa página para forçar o número**. `Navbar apertado` — a faixa de tabs saiu da navbar e levou o aperto junto.

**A décima segunda nasceu de um teto que subiu, que é a única coisa que faz uma fixture nascer.** `Aninhamento de sidebar máximo` existe porque o teto de profundidade foi de 3 para 4 (§3.1), e um nível novo é um recuo novo: 40px, mais o ícone da seção, mais o rótulo, dentro dos 288px da coluna. `Solução de problemas` é a dona porque tem o rótulo mais longo dessa profundidade, 20 caracteres.

> **`Item de sidebar mais largo` NÃO trocou de dona, e a conta é por que não.** Ela continua sendo `A varredura que reprovava tudo`, com 30 caracteres no nível 2, onde sobram cerca de 216px; no nível 4 sobram cerca de 192px para os 20 caracteres do rótulo novo. As duas provam coisas diferentes — largura de rótulo contra recuo de profundidade — e é por isso que são duas linhas e não uma disputa.

> **`Aninhamento profundo` também não se mexeu, e o nome engana.** Ela é `<ResponseField>` sobre `<Expandable>`, aninhamento de componente **dentro da página**, e continua em `Infraestrutura › O output de um módulo`. A fixture nova é aninhamento **de árvore**, na coluna da esquerda. Nomes parecidos, eixos diferentes.

### 7.1 Os quatro casos que o domínio novo cobre, e que não são fixture

O domínio anterior cobria quatro buracos de layout; o acervo cobre os mesmos e mais quatro. **Eles têm dona nomeada e são cobrados pelo portão, e ainda assim não entram na contagem de fixtures** — uma fixture nasce de um teto de layout que precisa de prova; estes nascem de o domínio ter mais textura.

| Caso | Página dona |
| --- | --- |
| Saída literal de terminal | `API Owner › O schema que mudou sem aviso` |
| Várias linguagens na mesma página | `Diagnóstico › O mesmo erro em três formas` |
| Diff | `Diagnóstico › O diff que resolveu` |
| Comprimento muito desigual entre irmãos | o par `O contrato que não existia` (~1800) e `O que o contrato não cobre` (~180) |

O último compartilha dona com a fixture de página muito longa, e é por isso que ele é **caso** e não fixture: o lado longo do par prova *página muito longa* sozinho — TOC longo, `sticky`, scroll-spy —, e o que o par prova junto é a desigualdade. Contá-lo como fixture faria a lista fechar em treze, e são doze; o portão 4 cobra os dois números separados, doze e quatro.

### 7.2 A regra de desempate, com UMA exceção

> **Quando a fixture e o orçamento discordam, ganha a fixture.**

O orçamento existe para produzir páginas plausíveis; a fixture existe para provar uma medida.

**A exceção é uma só, e é a mesma da regra de heading:** `Ambiente › Índice`, que fica em zero `##` contra o piso de três.

**Eram duas.** A segunda era `Conceitos › Conciliação`, que ficava abaixo do orçamento de `Conceitual` para exercitar prosa pura. Ela **não tem sucessora**, e não por esquecimento: a fixture de prosa pura foi para o **índice de jornada**, que é um tipo que já nasce sem nenhum componente do catálogo. O conflito deixou de existir em vez de ser transferido.

---

## 8. Locale — só `Ferramentas`

A regra: **traduz-se o que é consumido por outros times.**

A fronteira é **audiência do artefato**, e não infra pública contra corporativa: biblioteca, módulo, skill e servidor MCP nascem na mesma esteira que tudo, mas são **consumidos fora da equipe que os escreveu**, e é isso que lhes dá leitor de inglês. Jornada é registro pessoal; procedimento é da casa; time também é da casa, documentado para quem já está dentro dela. Nenhum dos três tem leitor fora.

| Traduzido para EN | Só pt-BR |
| --- | --- |
| `Ferramentas` — **31**: 27 autorais e 4 geradas | `Jornadas` 12 · `Procedimentos` 16 · `Times` 4 |
| **31** | **32** |

**32 páginas carregam o marcador de fallback.** `Times` entrou com as 4 dele; `Jornadas` e `Procedimentos` continuam nas mesmas 12 e 16 de sempre — o número anterior, 28, não se mexeu com o `overpower`, porque o port trocou o conteúdo de `Ferramentas`, que é a aba traduzida. *(Correção de aritmética anterior: a contagem dizia 36 porque somava os cinco índices de `Procedimentos` duas vezes, e depois 31; a #114 tirou três índices de `Procedimentos` do acervo.)*

**O EN do `overpower` saiu barato, e vale registrar por quê.** A doc de origem já é inglesa, e o registro do site é declarativo em terceira pessoa — que é o registro em que ela já estava. O port foi reescrita nos dois locales, não cópia: **6 das 19 páginas de origem não passavam no piso de três `##`**, e **19 de 19 falhavam a estrutura mínima do gabarito do tipo**, porque a origem é Markdown puro, sem `<Steps>`, sem `<CodeGroup>`, sem `<CardGroup>` e sem `:::`. O que veio de graça foi o idioma, não a forma.

### 8.1 A sinalização se resolve sozinha, e é isso que a torna barata

A página não traduzida é gerada **em silêncio**, com o texto em português, sem aviso e sem relatório. Uma spec que nunca exercita esse estado não decidiu nada sobre ele; só não esbarrou nele.

A sinalização é um componente de conteúdo que lê o locale corrente e devolve nada em pt-BR. A mecânica se resolve sozinha porque **a tradução substitui o arquivo inteiro**: o marcador escrito no fonte pt-BR aparece em `/en/` exatamente enquanto não houver contraparte, e some no instante em que houver.

A convenção de autoria que fecha o contrato é de uma linha:

> **Todo arquivo sem contraparte em EN abre com `<Untranslated />` logo abaixo do `# h1`. Nenhum arquivo de tradução o carrega, e nenhum arquivo de `Ferramentas` o carrega.**

**A convenção apertou, e a mudança é consequência de o locale ter fronteira.** A redação anterior era *"todo fonte pt-BR"*, e ela valia quando a fronteira do locale cortava seções dentro de uma mesma aba. Agora ela corta abas inteiras: as 15 de `Ferramentas` nascem traduzidas, e marcá-las carimbaria um estado que elas nunca terão. As duas metades — quem marca e quem não marca — são cobradas pelo portão 4.

### 8.2 O que é traduzível fora do conteúdo

| Superfície | Onde a tradução mora |
| --- | --- |
| Rótulos das quatro tabs, e **a marca** | `i18n/en/docusaurus-theme-classic/navbar.json` |
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

> **A perda ganhou uma segunda cara, e uma guarda junto.** O `.md` deixou de ser artefato só para máquina: o par "Copiar página" ([`chrome.md`](chrome.md) §6.4) o **busca** para copiar, e é a única chamada de rede do projeto — declarada na lista do terceiro zero ([`README.md`](README.md) §7.2). Em `docusaurus start`, onde a rota devolve o shell da SPA, o leitor copiaria HTML achando que copiou Markdown: o pior modo de falhar que uma ação de copiar tem, porque o erro só aparece do outro lado, colado. O botão olha o corpo antes de escrever na área de transferência, e documento HTML no lugar do Markdown vira estado de erro **visível no próprio botão**.

**O `.md` deixou de ser beco sem saída também no site.** O §9.3 diz que o ponteiro de volta é o que transforma arquivos soltos em grafo navegável para quem chega neles; o caminho contrário — de quem está lendo a página para o `.md` dela — não existia fora do link do rodapé. O par do cabeçalho é esse caminho, e ele é o primeiro consumidor de `permalink + '.md'` dentro do próprio site.

O corpo servido é o MDX **quase cru**: front matter fora, `import`/`export` do topo fora por regex, o subtítulo de volta, e nada mais. **Não é preciso transformador de AST** — o estado da arte serve MDX quase cru, e a tag `<ParamField>` que sobra diz à máquina exatamente o que ela é.

> *Do topo* não é detalhe de redação. Uma varredura global comeria um `import` de exemplo dentro de bloco cercado, o `.md` sairia com o código mutilado, e o build passaria. Hoje nenhum arquivo de `conteudo/` importa nada — a remoção é o que mantém a promessa verdadeira quando alguém esquecer.

### 9.2 O subtítulo, como citação abaixo do `h1`

**Tirar o front matter tira o subtítulo junto**, e é a única informação que o corte perde. Na tela ele está lá — o override de `h1` o pinta a partir do `description` ([`chrome.md`](chrome.md) §6). No `llms.txt` ele está lá, em cada linha de listagem. Sem uma decisão, ele existiria em todo lugar menos no formato feito para máquina, que é o avesso do que estes três artefatos existem para fazer.

A forma é a do export do Devin, a única das três referências medidas que resolve o caso: **citação imediatamente abaixo do `h1`**, na mesma posição em que a tela a mostra.

```
> [Índice para máquinas](https://…/llms.txt) · [Página](https://…/procedimentos/acessos/rotacionar-uma-chave)

# Rotacionar uma chave

> Trocar uma chave em uso sem derrubar quem a lê, com janela…

O primeiro parágrafo da página…
```

**A âncora é o `h1`, e a falta dele estoura o build.** Uma citação no topo do arquivo já significa outra coisa aqui — é o ponteiro de volta do §9.3. Sem `h1` entre os dois, os blocos se fundiriam num só e o subtítulo viraria segunda linha do ponteiro, calado. A guarda não é hipotética por sorte: as 73 páginas dos dois locales abrem com `# `, e é a mensagem de erro que mantém isso verdadeiro no dia em que uma não abrir.

**E a âncora é a primeira linha com texto, não a primeira que casa `# `.** A diferença só aparece num caso, e ele é silencioso: uma página que abrisse com bloco cercado teria um `# comentário` de shell casando a mesma marca, e a citação entraria no meio do código — sem erro, sem aviso, e visível apenas para quem abrisse o `.md` servido. É o mesmo modo de falhar que a remoção de `import` *do topo* evita no §9.1, pela mesma razão: marca de Markdown dentro de cerca não é marca de Markdown.

**O `llms-full.txt` não recebe a citação**, porque lá a description já entra como `> Summary:` acima do separador (§9.5). Duas cópias do mesmo campo no mesmo documento seriam ruído para o parser — e é a mesma regra de fonte única que faz o rótulo da seção sair do navbar em vez de uma opção do plugin.

### 9.3 O ponteiro de volta

**Cada `.md` abre com uma linha apontando para o `llms.txt` e para a própria página.** É o que transforma arquivos soltos em grafo navegável: quem chega num `.md` por link direto descobre que existe uma lista, e a máquina que o lê acha o resto do site.

Sem ele, os arquivos são becos sem saída.

### 9.4 `llms.txt` — a lista de links

Título, tagline, preâmbulo global, e uma seção `##` por tab com um item por página: rótulo, URL do `.md`, e a description.

**O rótulo da seção é o do navbar**, lido de `themeConfig` e não declarado numa opção do plugin. São a mesma decisão — e o rótulo do navbar já chega **traduzido**, porque o core aplica `translateThemeConfig` antes de `allContentLoaded` rodar.

**`## Optional` não é usada.** Ela tem significado especial na spec do llms.txt — *pode ser pulada se o contexto for curto* — e nenhuma das três referências medidas a usa.

### 9.5 `llms-full.txt` — na forma do Neon

A mesma abertura, e depois o conteúdo inteiro, documento a documento:

```
--- [Document source](https://…/procedimentos/acessos/rotacionar-uma-chave) ---

> Summary: Trocar uma chave em uso sem derrubar quem a lê, com janela…

# Rotacionar uma chave

…
```

**É a única das três formas medidas que é inequívoca para máquina.** O separador carrega a URL de origem, então o parser não precisa inferir onde um documento termina nem de onde ele veio.

### 9.6 O preâmbulo global sai em pt-BR nos dois locales

Ele diz o que a máquina tem em mãos: quantas páginas, por qual eixo estão divididas, que toda página é servida como Markdown, e **o que dentro delas é ficção**. A última linha não é modéstia — sem ela, um assistente responde sobre as ferramentas do acervo como se todas existissem. Ela também diz que **a empresa nunca é nomeada**, porque um leitor de máquina que tentasse deduzi-la produziria exatamente a atribuição falsa que o §1.1 existe para evitar.

> **A última linha deixou de dizer *nada existe* e passou a nomear a exceção**, e a mudança veio com o `overpower`. O acervo é **misto** desde que ele entrou: a ferramenta é real, MIT, publicada no PyPI, e a documentação dela descreve o que ela faz de verdade. Uma linha que a declarasse fictícia mandaria a máquina desmentir algo que existe, que é o oposto do que o preâmbulo compra. A regra não mudou — *o que não é nomeado aqui não existe* —, e o custo de mantê-la é uma linha por ferramenta real que entrar.

**Ele não é traduzido, e é a mesma regra do §8.** As 28 páginas sem contraparte em inglês também saem em português sob `/en/`; o preâmbulo é a mesma classe de fallback, num artefato cujo leitor é máquina. O que **tem** tradução chega traduzido: título, description e rótulo de seção.

A rota para mudar isso fica registrada e não foi comprada: `getTranslationFiles` + `translateContent` no plugin põem a prosa em `i18n/<locale>/pd-ai-era/`.

### 9.7 O `Content-Type` do host, e o segundo link do footer

**O portão 6 rota 2 vive aqui:** `GET <base>/<qualquer>.md` precisa devolver `200 text/markdown` com disposição diferente de `attachment`. As três rotas rodam nos **dois locales** — o `.md` é escrito por locale, num `outDir` diferente, e o baseUrl do EN carrega o prefixo. É exatamente onde a concatenação erraria sem ninguém ver.

**Armadilha registrada, e ela vale repetida:** `docusaurus serve` **não testa isso.** Ele aplica `applyTrailingSlash` ao `req.url` e passa `cleanUrls: true` ao `serve-handler` — valida a config, não o host.

**O footer caiu de quatro links para dois**, e os dois que saíram saíram com o produto: `Status` apontava para um host e `Suporte` para uma caixa de e-mail que o acervo não tem — a empresa **nunca é nomeada**, então não há domínio a citar, e o desenvolvedor **não tem nome**, então não há para quem escrever. Sobram `Changelog` e `llms.txt`, e a regra que os escolheu fica **mais** satisfeita do que antes: `llms.txt` é o único artefato do site sem nenhuma entrada de navegação.

`pathname://` continua sendo a escotilha **pública** do Docusaurus para apontar a um arquivo que não é rota — degrau 2 da escada. Ela faz três coisas de uma vez: o `<Link>` usa `<a>` em vez de `history.push()`, o verificador de links não cobra uma rota que nunca existiu, e o baseUrl continua sendo acrescentado, **inclusive o do locale**.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O acervo e as três regras | origem própria | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) — o `panlabs` substitui o produto anterior, e a empresa nunca é nomeada |
| Nome próprio como título | **lacuna por restrição** | `title` e `tagline` não são traduzíveis no Docusaurus |
| O cenário fecha em três strings | origem própria | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) — GitHub Actions, AWS e Python; o resto cai delas somadas às categorias |
| O custo de gabarito sobe sem convenção conhecida | **origem própria (consequência)** | o gênero público do domínio anterior era o que segurava a coerência; sem ele, quem segura é o gabarito |
| Quatro tabs, quatro instâncias | origem própria | `routeBasePath` e versionamento são por instância |
| `Ferramentas` **não** declara `docItemComponent` | **origem própria (correção)** | conferido no código: a linha saiu na [#118](https://github.com/ThiagoPanini/panlabs-docs/issues/118) junto com o `ApiDocItem`; as 31 folhas da instância usam o `@theme/DocItem` do upstream |
| Árvore 2 · 5 · 4 | origem própria | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) §árvore |
| **A quarta aba, e a ordem do navbar invertida** | **origem própria** | `Times` simula documentar time de dentro de uma empresa, que é o cenário do acervo, e a ordem passa a ser `Ferramentas` · `Procedimentos` · `Jornadas` · `Times`, por frequência de consulta. A árvore vai de 2 · 5 · 4 para 4 · 5 · 2 · 2 |
| **`Times` é separador → folha, e `Desenvolvimento` é uma folha só** | **origem própria (consequência)** | o §3.1 confina o teto de 4 ao ramo `Ferramentas › Bibliotecas › overpower`; fora dele o teto é 2, e `Siglas`, `Repositórios` e `Ofertas` viram três `##` de uma página, não três páginas |
| **Teto de profundidade 3** | **origem própria (correção)** | o que impedia o nível 3 era a redação da regra de ícone, não o teto — ver [`icones.md`](icones.md) §8 |
| Contagem desigual das jornadas | origem própria | arco de papel não tem comprimento fixo |
| Categoria clicável | origem própria | três fatos verificados na fonte — **superada na #114**; dois dos três eram mecânica do Docusaurus e o terceiro era opinião escrita como fato |
| `collapsed: false` | herdado | a âncora mostra a árvore aberta — **superada na #114**: verdadeira só do nível 1, que nem colapsa |
| O nível de topo é separador — sem link, sem colapso, sem seta | herdado | `docs.devin.ai` — `<h3 class="sidebar-title">` sem link nem `aria-expanded`; e `mintlify.com/docs/organize/navigation`, *"Top-level groups always expand and you cannot collapse them"* |
| **A categoria deixa de ser destino** | **origem própria (correção)** | a linha anterior — *"categoria clicável"* — se sustentava num *"fato verificado"* que era opinião; ver [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) |
| Do segundo nível para baixo o nó é colapsável e aponta para a abertura | herdado | `docs.devin.ai` — `<button aria-expanded>`, e o ramo da página atual abre sozinho |
| **Grupo aninhado nasce fechado** | **herdado (correção)** | a linha `collapsed: false` estava carimbada `herdado` com a fonte *"a âncora mostra a árvore aberta"*, verdadeira só do nível 1 |
| **A forma *índice de categoria* morre** | **origem própria (consequência)** | sem categoria clicável não há destino a que o índice sirva |
| Quatro índices sobrevivem como folha | **origem própria** | são as que carregam tipo ou fixture, e matá-las derrubaria quatro invariantes |
| A rota nua resolve por `slug: /` | **origem própria (implementação)** | o `docSidebar` já leva à primeira doc; o que não resolve sozinho é a rota digitada |
| **56 autorais mais 4 geradas, e 32 em EN** | **origem própria (correção)** | a resolução contava as geradas fora do pt-BR e dentro do EN; com o `overpower` no ar (#117) o pt-BR fecha em 54 e o EN em 26 |
| **Quinze guias** | **origem própria (medição)** | contado contra o manifesto do portão 4: 8 em `Procedimentos` e 7 em `Ferramentas`, cinco delas do `overpower` |
| `Instalação` é SDK, e `Alvos › Índice` é Catálogo | **origem própria** | o gabarito de SDK é *instalação em `<CodeGroup>` por gerenciador*, e é o que `uvx`/`uv tool`/`pipx` é; a abertura de seção pode carregar tipo, no precedente do §6.3 |
| O décimo tipo, e o gabarito dele | herdado | [#57](https://github.com/ThiagoPanini/panlabs-docs/issues/57) — o gabarito encoda a condição que salva o tipo com mais precisão que prosa |
| `<CardGroup>` proibido no índice de jornada | **origem própria** | grade não tem ordem, e o traço do tipo é ordenar por tempo |
| `<Steps>` proibido em `Jornadas` | **origem própria** | a fronteira entre duas abas, escrita como regra conferível |
| Proibição por localização como classe de regra | **origem própria** | é a primeira; até aqui gabarito exigia e limitava |
| Estado em duas palavras, e `Abandonada` fora | **origem própria** | vocabulário sem consumidor é o defeito que este projeto mata por nome |
| `capítulo` é forma e não tipo | **origem própria** | mesma distinção do índice de categoria: gabarito sem classe de conteúdo própria |
| Teto de gabarito não é exceção de heading | **origem própria (implementação)** | descoberto escrevendo o portão: contar páginas sem TOC conflava orçamento com exceção |
| A cerca indentada conta | **origem própria (correção)** | as duas regras de cerca do portão discordavam, e o `<Steps>` da árvore nova expôs a diferença |
| A exceção de heading é o índice de `Ambiente` | **origem própria** | a fixture trocou de dona porque a antiga morreu com a árvore; custo zero em página |
| Quando a fixture e o orçamento discordam, ganha a fixture | **origem própria** | e a segunda exceção não tem sucessora, porque o conflito deixou de existir |
| As doze fixtures com dona nomeada | herdado | [#59](https://github.com/ThiagoPanini/panlabs-docs/issues/59), reatribuídas contra a árvore nova |
| **O teto de profundidade é 4 e é confinado** | **origem própria (implementação)** | o [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) §g decidiu o número e a condição; o portão 4 passa a cobrar as duas, e `usado uma vez` sai |
| **`Aninhamento de sidebar máximo` é a décima segunda fixture** | **origem própria** | teto que sobe é a única coisa que faz fixture nascer, e o recuo de 40px não tinha prova |
| Os quatro casos do domínio novo não são fixture | **origem própria** | fixture nasce de teto de layout; estes nascem de o domínio ter mais textura |
| O locale corta por audiência do artefato | **origem própria** | biblioteca, módulo, skill e servidor são consumidos fora da equipe; jornada e procedimento não |
| **28 páginas com o marcador** | **origem própria (correção)** | a contagem somava os cinco índices de `Procedimentos` duas vezes; depois disso a #114 tirou três deles do acervo |
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
| O subtítulo como citação abaixo do `h1` | **mecanismo emprestado** | o Devin; é a única das três medidas que resolve o campo que o corte de front matter perde |
| `## Optional` fora | herdado | significado especial na spec, e nenhuma referência a usa |
| Ponteiro de volta em cada `.md` | herdado | é o que faz grafo em vez de arquivo solto |
| O rótulo da seção vem do navbar | **origem própria (correção)** | `translateThemeConfig` roda antes de `allContentLoaded` |
| O preâmbulo em pt-BR nos dois locales | **origem própria** | a mesma regra do §8; a rota de tradução do plugin fica registrada e não comprada |
| `pathname://` no link do footer | herdado | escotilha pública do Docusaurus para arquivo que não é rota — degrau 2 |
| **Uma ruptura de layout, e não duas** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — a landing saiu; sobra o ramo gerado de `overpower › Comandos`, e a proibição de o tipo romper layout não muda |
| **A raiz é um salto, não uma página** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — sem landing, a raiz leva ao índice da primeira jornada, que é o primeiro destino declarado em `sidebars-jornadas.js`. *Dissenso registrado, e ele é sobre uma palavra.* O critério do ticket dizia *"a primeira **folha** declarada na primeira sidebar"*, e **`folha` é termo definido deste projeto: ele exclui índice.** O §3 conta `Procedimentos` como *"5 índices + 14 folhas"*, e o verbete de `docs/agents/domain.md` diz *"Capítulo: a folha"*. Lido ao pé da letra, o destino seria `api-owner/o-contrato-que-nao-existia`, o primeiro item de `items`. **Vence o índice mesmo assim, por três razões e com o custo da troca declarado.** Primeira: o corpo do mesmo ticket diz *"a raiz dela redireciona para a primeira **doc**"*, e o índice é doc — é `{type: 'doc'}` no `link` da categoria. Segunda: o comportamento que o ticket manda copiar é o da âncora, e o que a raiz dela serve é a página de abertura, cujo análogo aqui é o índice, não o capítulo 1. Terceira: o índice é o décimo tipo de página e é o destino do rótulo da categoria — mandar a raiz ao capítulo 1 pularia a abertura da jornada, que é a página escrita para ser lida primeiro, e a deixaria alcançável só por quem clicar no rótulo. **Trocar é uma linha** — a constante `DESTINO` de `src/pages/index.js` |
| **A raiz segue a primeira aba, e ela deixou de ser `Jornadas`** | **origem própria (consequência)** | a reordenação do navbar para `Ferramentas` · `Procedimentos` · `Jornadas` · `Times` levou a raiz junto: `DESTINO` passa de `/jornadas` para `/ferramentas`. O dissenso da linha acima **fica sem sujeito** — ele era sobre índice contra capítulo dentro de `Jornadas`, e o alvo hoje é a rota nua de outra instância. O acoplamento que sobra é com a POSIÇÃO, não com a aba, e nenhum portão casa as duas |
| **`<Redirect>` recebe a rota resolvida, não a crua** | **origem própria (correção)** | conferido no código: `<BrowserRouter>` sobe **sem** `basename` e toda rota registrada já traz o `baseUrl` no `path`. `<Link>` compensa por dentro; o `Redirect` do `react-router-dom` não. `<Redirect to={DESTINO}>` navegava para rota sem prefixo, caía no catch-all e piscava `NotFound` até o `meta refresh` corrigir — o docblock de `src/pages/index.js` afirmava o contrário e foi reescrito |
| **O redirecionamento da raiz é `meta refresh` mais `<Redirect>`, não 308** | **lacuna por restrição** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — a âncora responde **308** na raiz; o host é o GitHub Pages, que não emite redirecionamento de servidor configurável. A divergência é de host, não de desenho |
