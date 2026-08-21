# Ícones

O manifesto, os dois renderizadores, a marca e o teto duro.

**Nenhum valor numérico de desenho aparece neste documento.** Os números que aparecem aqui são **contagens** — quantos arquivos, quantas tags, qual o teto — e a espessura de traço da tabela de compensação óptica, que é prop de componente e não token de CSS.

> **De onde sai o tamanho de um ícone, dito porque a primeira redação errou.** Ela mandava procurar em [`tokens.md`](tokens.md), e **não há token de tamanho de ícone lá** — nem `--pd-icon-*` nem equivalente. O ponteiro apontava para o vazio, e o teste de reconstrução ([`README.md`](README.md) §6) tropeçou exatamente aqui.
>
> A regra é: **ícone de chrome se dimensiona pela escala de espaço**, e o par em uso na sidebar é `--pd-space-4` para o quadrado e `--pd-space-2` para o afastamento do rótulo. Não é derivação falsa: um ícone de sidebar é um item de lista ao lado de texto, e o que o alinha ao ritmo da lista é a mesma escala que dá o `gap` dela.
>
> Ícone **dentro** de componente do catálogo é outra conta, e ela é prop — ver a tabela de compensação óptica do §4.

Documento transversal, ao lado de [`motion.md`](motion.md), [`foco.md`](foco.md) e [`swizzle.md`](swizzle.md): a sidebar é o consumidor principal, e o catálogo de conteúdo lê o mesmo manifesto. **A marca deixou de ser consumidora** — ver §3. **A landing era a terceira, e saiu inteira** — ver §5.

Tudo aqui é obrigatório. Não há bloco `Livre`: os **desenhos** são skin e se trocam inteiros, mas o manifesto é contrato e não tem latitude interna.

---

## 1. Origem — Lucide vendorizado

**60 arquivos `.svg` do Lucide (ISC), copiados para dentro do repositório.** Não é dependência, não é CDN, não é resolução em runtime.

O axioma 2 fecha a porta do **pacote**, não a do desenho: `npm install` de uma biblioteca de ícones está proibido, mas copiar arquivos de licença permissiva custa **zero dependência** e um arquivo de licença. A restrição sempre foi mais estreita do que parecia.

| Rejeitado | Motivo |
| --- | --- |
| Font Awesome | os ícones são CC BY 4.0, que exige atribuição **dentro da obra**. Em revisão jurídica corporativa isso é reunião, não checkbox — e o destino é justamente ambiente corporativo |
| Desenhar sob demanda | dezenas de ícones mutuamente coerentes é trabalho de semanas de ilustrador; sem ilustrador, o resultado provável é família incoerente, que é o oposto do objetivo |
| CDN | dependência de rede em runtime, atrás de firewall corporativo. Mata o transplante, que é a razão de o projeto existir |
| Emoji | refém da fonte do sistema, desenho muda por SO, impossível de tingir com a cor de marca |
| Não ter ícone | o cartão de conteúdo usa ícone na quase totalidade dos usos medidos |

**Reversibilidade registrada:** Tabler (MIT) é substituto drop-in — mesma geometria. Se o jurídico do corporativo implicar com ISC, trocam-se os arquivos sem redesenhar nem renomear nada.

### 1.1 A versão é fixada, e o vendorizador confere no ato de copiar

**O Lucide renomeia glifo entre versões.** O manifesto declara a versão de origem, e `scripts/vendorizar-icones.mjs` baixa contra ela — lendo o manifesto do fonte, nunca uma segunda lista.

Isto não é cerimônia. Na primeira execução, **três dos nomes então vigentes não existiam mais** na versão fixada. O mecanismo pegou os três alto, em vez de deixá-los virarem quadrado vazio na sidebar seis meses depois.

**A resolução importa mais que o achado: o nome do manifesto é NOSSO contrato e não se move por renomeação de terceiro.** Quem paga a divergência é um campo opcional na entrada, que registra o nome do upstream onde ele diverge — não o MDX do acervo, e não os componentes.

Este script **não é portão de CI**: ele precisa de rede, e rede é exatamente o que o ambiente corporativo alvo não tem.

---

## 2. Família — uma só, sem exceção por papel

**Contorno, 24×24, traço 2, caps redondos.** Uma família, e nenhum papel abre exceção.

A âncora **mistura** famílias — o ícone de card resolve para uma biblioteca e o caret de accordion para outra. Isso não é decisão de design dela; é **acidente de arquitetura**, porque o autor pode escrever nomes de três bibliotecas e o chrome interno calhou de usar uma delas. Replicar a mistura seria replicar um acidente, e duas famílias é exatamente o que faz uma documentação parecer montada em vez de desenhada.

### 2.1 A objeção real, e a compensação óptica que a responde

Traço fino em tamanho pequeno some sobre fundo escuro. **A resposta só existe porque a técnica é componente inline e não máscara**: com SVGR, a espessura de traço é prop.

| Tamanho renderizado | `stroke-width` |
| --- | --- |
| 24px | 1,75 |
| 20px | 2 |
| 16px | 2,25 |
| 12–14px | 2,5 |

Com `mask-image` isso seria impossível — máscara é estêncil, não se restiliza o interior. A alternativa seria um arquivo por tamanho, o que é absurdo.

O ícone da sidebar é o único que roda por máscara e não recebe compensação. Ele vive num tamanho só, então a tabela não teria o que compensar.

---

## 3. Dois renderizadores, uma fonte de verdade

**Eram três.** O terceiro era a marca, e ela perdeu o glifo — ver abaixo. Os dois que sobram não são inconsistência: cada um é **forçado pelo contexto**, e os dois leem os mesmos 60 arquivos.

### (a) Componentes de conteúdo → SVGR inline

O `preset-classic` **já traz SVGR** — o plugin é dependência dele e é registrado por padrão, com `removeViewBox: false`, que é o override que impede o otimizador de quebrar o escalonamento. Um `import` de `.svg` devolve componente React, dentro do preset que o axioma 2 permite por nome.

Ganha `currentColor` de graça (o SVG do Lucide já nasce com `stroke="currentColor"` e `fill="none"`), espessura controlável, título acessível sem trabalho, e zero requisição HTTP extra.

### (b) Sidebar → `mask-image` mais `currentColor`

**Aqui não há escolha.** Não existe ponto de swizzle `safe` para injetar componente React num item de sidebar — a maioria esmagadora dos componentes swizzláveis não tem nenhuma ação `safe`. O caminho de `className` mais `::before` com máscara é o **único** zero-swizzle, e é literalmente o que produz a assinatura visual mais reconhecível do alvo.

A parte elegante: o estado ativo já pinta o texto, e a máscara é pintada com `currentColor` — **o ícone acompanha sem uma linha a mais e sem segundo asset para o modo escuro**.

### (c) A marca não é o terceiro caso — ela deixou de ter glifo

**A marca fica só com a palavra**, e nenhum desenho assume o lugar de `train-track`.

O argumento é o mesmo que matou a figura da landing, **com força maior**: a marca aparece em **toda página**, e a landing aparecia em uma. Ela fica **monocromática**, em `--pd-text-strong` — tingir uma palavra de acento no canto superior esquerdo é o enfeite que a régua recusa, e é o tipo de decisão que se justifica sozinha uma vez e se paga em todas as rotas. O argumento sobreviveu à página que o produziu: a landing saiu depois ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) e a marca continua sem glifo, porque o que decide aqui é *em quantas rotas o enfeite se paga*, e a resposta para a marca continua sendo *todas*.

**A tipografia da palavra não mudou**, e é isso que torna a decisão barata: `--pd-text-strong` já era a tinta dela. O que saiu foi o glifo, que era a única coisa aqui a consumir `--pd-accent`.

**A rota é `themeConfig.navbar.title` renderizando no `.navbar__brand` nativo** — degrau 2, opção pública. Sem `logo`, o upstream emite `<b class="navbar__title">` dentro do link, que é tipo puro: nenhum `<img>`, e portanto nenhum dos problemas de `currentColor` que empurraram a marca para o degrau 3 na primeira redação deste documento.

Quatro coisas ficam **sem assunto** de uma vez, e o parágrafo existe para que ninguém as procure:

- `src/theme/NavbarItem/Marca.js`, o componente de tema próprio que desenhava o par glifo+palavra;
- a chave `custom-marca` do registro de `NavbarItem/ComponentTypes` — e com ela **a entrada de degrau 3 daquele registro sai do ledger**, porque o objeto voltou a ser idêntico ao do upstream;
- a declaração `.navbar__brand:empty`, que escondia o link vazio que o upstream renderizava sem `title`. Ele não é mais vazio;
- o caso `mobile` de lista de menu, que existia porque a marca era item de navbar. Ela agora é a marca do próprio painel.

**Nenhum token de cor é consumido pela marca.** `--pd-accent` perdeu este consumidor.

**A rota foi medida, e é isso que a resolução deste ticket registrava como não medido.** Medida em Chrome headless, nas duas preferências de esquema de cor:

| | escuro | claro |
| --- | --- | --- |
| `.navbar__brand` contém | `<b class="navbar__title">panlabs</b>` | idem |
| `<svg>` dentro dele | **0** | **0** |
| `<img>` dentro dele | **0** | **0** |
| cor da palavra, em sRGB | `250,242,249` | `15,10,15` |
| `--pd-text-strong` resolvido | `250,242,249` | `15,10,15` |
| `--pd-accent` resolvido | `219,124,212` | `147,57,141` |

A palavra bate com `--pd-text-strong` no pixel, nos dois modos, e **não** bate com o acento em nenhum. O carimbo sobe de `origem própria` para **`origem própria (medição)`**.

---

## 4. Orçamento — três papéis, um registro, um teto

**O papel é uma tag na entrada, não uma pilha separada de desenhos.** É esta regra que faz a aritmética fechar, e ela não é economia: duplicar um desenho porque ele serve a dois papéis seria criar duas versões do mesmo arquivo.

| Papel | tags | arquivos que carregam a tag |
| --- | ---: | ---: |
| Sistema — o componente escolhe, o autor nunca | 19 | 19 |
| Navegação — um por nó de sidebar que carrega ícone | 37 | 37 |
| Autoria — o vocabulário escrito como string | 40 | 40 |
| **Total de tags** | **96** | — |
| **Total de arquivos** | — | **60** |

A coluna de arquivos **soma mais que 60 de propósito**: são **trinta e quatro** entradas com duas tags, e uma entrada com duas tags aparece nas duas linhas. 94 − 34 = 60, e é essa a aritmética inteira.

As trinta e cinco carregam `navegacao` e `autoria` juntas, e moram na lista de autoria. Os dois pares restantes da navegação, `code-xml` e `activity`, são navegação pura.

> **A navegação foi de 16 para 37 sem um arquivo novo, e essa é a prova de que a regra do papel-como-tag paga.** O ramo do `overpower` passou a exigir um glifo por PÁGINA, e não por seção: são 27 páginas ali, e cada uma achou um desenho que o manifesto já carregava como vocabulário do autor. O que entrou em cada caso foi **uma tag**, nunca um arquivo. A [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133) promoveu as seis últimas — `send`, `package`, `users`, `bell`, `sparkles` e `file-text` — para as seis páginas que ela criou. O teto de 64 não se moveu, e a folga continua em três.

> **Correção de aritmética contra a resolução deste ticket.** Ela dizia *"sete reusam entrada de autoria com segunda tag, dois reempregam órfão de navegação"*, o que fecha em nove pares e não em onze. Contado contra a árvore: **oito** entradas de autoria ganham a segunda tag, **dois** órfãos de navegação são reempregados, e **um** — `package` — já carregava as duas. Oito mais dois mais um são os onze.

> **A tag de autoria deixou de significar *"o MDX do autor"* e passou a significar *"o nome escrito como string"*.** A landing escrevia `<Card icon="book-open">`, que é a **mesma superfície** de autoria do MDX — mesmo componente, mesma prop, mesma falha alta se o nome não existir. Dizer *MDX* era descrever o único consumidor que existia, não a regra; a regra é a superfície.
>
> **A landing saiu ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) e a definição fica.** Ela foi o caso que expôs a diferença entre *superfície* e *consumidor*, e é exatamente por isso que reverter a definição junto com a página seria o erro: voltar a dizer *MDX* recriaria a redação estreita que já se mostrou errada uma vez, e o próximo `<Card>` escrito fora de `.mdx` a quebraria de novo. **Hoje o MDX é o único consumidor outra vez, e a regra continua sendo a superfície.**

**O teto é 64. Teto, não meta — e a folga está em quatro.** Ele foi alcançado no mapa do `mint`, com `wrench` no último slot; a árvore do `panlabs` cortou **quatro** desenhos e a folga voltou a quatro. **Um foi gasto e devolvido**: `list`, o glifo do título do índice desta página, gastou o 61º slot, e o slot voltou quando a página do atalho `op` saiu do acervo e levou `send` com ela. O 65º ícone continua sendo troca; o 61º era revisão de design, e foi revisto — a decisão está no §8, e o argumento é que a superfície nova é chrome, onde a regra de glifo já existia e só não tinha alcançado o índice.

**O teto NÃO desce para 60.** Ele é o limite do que se consegue auditar de uma vez, não uma marca d'água do que já se gastou — descê-lo seria trocar uma régua por um registro do passado, e o número perderia o argumento que o justifica.

**Os quatro cortes, e a regra que os decidiu:** *sobrevive quem é neutro de domínio ou nomeia o cenário fixado*.

| Corte | Por quê |
| --- | --- |
| `train-track` | a marca ficou só com a palavra — ver §3 |
| `wallet` | nomeia pagamentos, e o domínio inteiro morreu |
| `receipt` | idem |
| `credit-card` | já estava **sem consumidor** desde que a grade de cinco cartões da landing morreu |

A razão de haver teto: conjunto que cresce sob demanda vira dívida. Ninguém audita trezentos ícones em busca de coerência de família, mas 64 cabem numa tela e a incoerência salta aos olhos.

**A aritmética é conferida por máquina**, não por leitura: o vendorizador reprova nome repetido no manifesto e estouro do teto, antes de baixar qualquer coisa.

### 4.1 `circle-check` não está no manifesto

Ela estava, atribuída a uma variante de callout que o inventário de componentes **matou**, por ser pixel a pixel idêntica a outra na medição. Ficou sem consumidor — o mesmo defeito que a arquitetura de tokens nomeou no Infima como *variável sem consumidor*.

Ela saiu, e `train-track` tomou o lugar dela na lista de sistema. Com `train-track` cortado, a lista de sistema fecha em **18**.

**A condição de reabertura perdeu o candidato nomeado, e é correção de fato.** Ela dizia que *"a resposta de sucesso no painel da Referência da API é o candidato"*. Não há mais resposta HTTP de sucesso: o contrato deixou de falar HTTP, o painel deixou de mostrar verbo e status, e o candidato evaporou junto. A condição continua válida na forma geral — se um estado de sucesso precisar de glifo que não seja o `check` nu, `circle-check` volta por um dos quatro slots livres —, e agora ela é **condição sem candidato**, que é diferente de condição com um.

### 4.2 Os 19 ícones do `theme-classic` são passivo, não vantagem

O tema entrega 14 de chrome e 5 de admonition, e **eles são de outra família**. Ao lado dos nossos, a diferença de traço aparece. Eles **substituem**, não complementam — trabalho que nenhuma estimativa anterior contava.

O que é alcançável e o que não é sai da regra da política, sem enumerar caso a caso: **o que só é alcançável por `unsafe` não é trocado.** Os de admonition e cinco dos de chrome são `safe` nas duas ações; `Icon/ExternalLink` não está no `getSwizzleConfig` e vem de sprite, então ele fica com o desenho do Docusaurus — no rodapé ele é escondido, e no resto do site ele continua de pé.

**O que o slice do catálogo fez com isso, e é menos do que esta seção previa.** Os cinco de admonition **nunca precisaram ser trocados**: o callout ganhou DOM próprio pelo registro de `Admonition/Types`, e ele desenha os glifos do manifesto direto. Um `--eject` pré-autorizado que se resolve num registro é a escada funcionando.

Os cinco de chrome (`Icon/Arrow`, `Icon/DarkMode`, `Icon/LightMode`, `Icon/Edit`, `Icon/Menu`) **continuam com o desenho do Docusaurus.** Eles são chrome, não catálogo, e trocá-los é `--eject` de cinco arquivos por estética de glifo — conta que o slice do catálogo não abriu, porque a superfície de swizzle dele fechou em duas linhas de degrau 3. A pré-autorização segue de pé em [`swizzle.md`](swizzle.md), sem dono.

---

## 5. O manifesto

O manifesto vive em `src/icons/manifest.js`, e ele **é o contrato**:

```
static/icons/*.svg     ← 60 desenhos.  TROCÁVEL — é skin, axioma 3
src/icons/manifest.js  ← 60 nomes + papéis.  CONTRATO. Não troca.
```

Os nomes são **semânticos** (`rocket`, `database`, `terminal`), nunca de marca.

> **Correção de fato:** esta linha citava `shield-check` como exemplo, e ele **nunca esteve no manifesto**. Um exemplo que não existe é pior que nenhum exemplo — quem for conferir a lista procura por ele e conclui que a lista está errada. O corporativo com iconografia própria **substitui os arquivos e mantém os nomes**: nenhum componente e nenhum MDX é reescrito. Isso torna a troca de iconografia uma operação do mesmo tipo que a troca de paleta — mexer na skin, não no sistema.

### Sistema · 19

`info` · `lightbulb` · `triangle-alert` · `pencil-line` · `chevron-right` · `check` · `copy` · `wrap-text` · `external-link` · `search` · `x` · `menu` · `sun` · `moon` · `monitor` · `languages` · `link` · `list` · `arrow-right`

O ponto de consumo de cada um está na entrada do manifesto. `chevron-right` é **um desenho, dois estados** — caret de accordion e de categoria de sidebar, rotacionado por CSS quando aberto.

### Navegação · 33 tags sobre 33 arquivos

Os sete pares **de seção**, verbatim. São as árvores em que a folha ainda herda a chave do ramo que a contém:

| Jornadas › API Owner | ícone | Ferramentas | ícone |
| --- | --- | --- | --- |
| Visão Geral | `layers` * | Módulos Terraform | `puzzle` * |
| Conteúdo Teórico | `code-xml` | Skills | `bot` * |
| Conteúdo Prático | `workflow` * | Servidores MCP | `server` * |

E o par de **marcador de lugar**, que é UM para as duas abas esvaziadas — `Procedimentos › Work in Progress` e `Times › Work in Progress` dizem a mesma coisa na mesma folha, e dois glifos para a mesma frase seriam distinção sem diferença:

| Folha | ícone |
| --- | --- |
| Work in Progress | `activity` |

Os **26 restantes** são o ramo do `overpower`, **um por página** e nenhum repetido, desde a [#118](https://github.com/ThiagoPanini/panlabs-docs/issues/118). Eles moram em `src/icons/manifest.js`, na ordem da árvore, e não são transcritos aqui: uma segunda cópia de 26 linhas que a máquina já confere nos três lados é a definição de fonte que diverge em silêncio.

\* reusa entrada de autoria e não consome arquivo.

> **Correção de contagem — a reconstrução da árvore.** Eram doze pares de seção, e cinco saíram com o conteúdo que nomeavam: as duas jornadas narrativas e as cinco categorias de `Procedimentos` e os dois times. **Nenhum desenho saiu do manifesto.** `lock`, `cloud`, `key`, `calendar` e `trending-up` continuam no vocabulário do autor e só perderam a segunda tag, que é a leitura literal do orçamento — tag é papel, e o papel de navegação acabou quando a seção acabou. Os arquivos seguem em 60, e o teto de 64 não se move.

**A chave deixou de ser sempre a do separador de topo.** Até o `overpower`, toda folha herdava a família do separador que a continha, porque nenhuma árvore tinha seção intermediária com identidade própria. As cinco linhas acima são seções de nível 3, e as folhas de nível 4 herdam a família **delas** — o nó `overpower` e as três folhas de abertura dele ficam com `--bibliotecas`. O ícone é da seção; onde não há seção, é do separador.

**Todo nó colapsável recebe ícone desde a #114.** A regra em vigor não abre exceção por nível: **nenhum ícone no separador de topo; ícone em tudo abaixo dele**. As duas redações anteriores negavam o ícone ao nó do meio por motivos opostos, e as duas precisavam ser reescritas a cada nível novo; ver §8. O `overpower` (#117) foi o primeiro teste real disso, com seis nós colapsáveis e um quarto nível, e a regra não precisou de uma quarta redação.

> **Correção de fato — #97.** A regra acima é a de antes da #97. A âncora marca a **folha**, não o topo, e a #97 reescreveu de novo: **ícone em toda folha, nenhum em cabeçalho de grupo** — ver §8. `Biblioteca C` continua sem ícone, mas por outro motivo agora: ela é cabeçalho de grupo, não porque more no nível 2. As folhas dela — as três autorais e as seis geradas de `docs/design/referencia.md` §5 — ganham ícone pela primeira vez, herdando `--bibliotecas`, a família da categoria de topo que as contém.

**As quatro tabs de navbar continuam sem ícone**: a regra é *um slot por nó de topo da **sidebar***, e o navbar já carrega tabs, busca, locale e GitHub sem folga para enfeite.

#### As três portas da landing tinham ícone, e a régua que elas produziram fica

A tab no navbar continua sem glifo. **O cartão de porta da landing tinha**, e a distinção era de superfície, não de inconsistência: a porta era um `<Card icon="…">`, escrito como string, contado na tag de **autoria**. A tag de navegação é 1:1 com os pares seção→ícone, e o vendorizador cobra essa igualdade — abrir a lista de navegação para a landing teria quebrado o único lugar onde a aritmética de ícone é conferida por máquina.

As portas eram declaradas *"sem ícone, e é ritmo, não esquecimento"*. Elas ganharam glifo por decisão, sob uma regra:

> **A porta não pode repetir o glifo de nenhuma das categorias que ela abre.**

Sem ela, o cartão e um quarto da aba leem a mesma hierarquia, e o leitor não sabe se o glifo nomeia o eixo ou uma seção dentro dele.

| Porta | Glifo | Origem |
| --- | --- | --- |
| Jornadas | `book-open` | reuso, retagueado |
| Procedimentos | `terminal` | reuso, retagueado |
| Ferramentas | **`wrench`** | **o único desenho novo** |

> **A violação registrada no commit anterior morreu com a árvore, como estava previsto.** `book-open` era o glifo de `Documentação › Guias`, uma categoria dentro da tab que a porta `Jornadas` abre. A regra que a colisão violava era a **da porta**, e ela ficou sem sujeito quando a landing saiu ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) — é por isso que `book-open` pôde virar glifo de `Referência` na #117 sem reabrir nada: não há porta que o contenha.

**`wrench` foi o único ponto de todo o esforço em que o teto comprou alguma coisa.** Na porta `Ferramentas`, todo glifo adequado do acervo — `package`, `puzzle`, `bot`, `server` — é uma das quatro famílias que aquela aba abre, e a regra acima os eliminava um a um. Não havia reuso disponível; havia o slot livre.

> **Correção de fato: as três portas não existem mais, e nenhum dos três desenhos sai do manifesto.** A landing foi removida em [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94), e com ela os três `<Card icon="…">` que davam consumidor nomeado a `book-open`, `terminal` e `wrench`. **A aritmética não se move:** os três já eram contados na tag de **autoria** — `terminal` e `wrench` em *Objetos*, `book-open` em *Conceitos* —, e autoria é *vocabulário do autor*, não *uso hoje*. **69 tags sobre 60 arquivos continuava sendo o número** até o `list` do §5.1 de [`chrome.md`](chrome.md) gastar o 61º slot, e a bijeção que o vendorizador cobra continua fechada nos três lados.
>
> **O que se perdeu era mais estreito, e era `wrench`.** Ele foi o único desenho do acervo comprado **por causa de um consumidor concreto** — a porta `Ferramentas` —, e esse consumidor deixou de existir. Ele não virou órfão de manifesto; virou **vocabulário de autoria como os outros 39**, e ficou por um ticket como o primeiro nome a olhar num corte de teto.
>
> **A #117 lhe devolveu consumidor concreto**, e não por resgate: as cinco seções do `overpower` precisavam de glifo, `Desenvolvimento` é a que `wrench` nomeia sem forçar, e ele ganhou a segunda tag `navegacao` pelo mesmo mecanismo dos outros quatro. A régua que o punha em primeiro na fila — *sobrevive quem é neutro de domínio ou nomeia o cenário fixado* — continua valendo; o que mudou é que ele passou a nomear uma seção, e seção é cenário.
>
> **A regra da porta fica escrita e sem sujeito.** *A porta não pode repetir o glifo de nenhuma das categorias que ela abre* não tem hoje a que se aplicar. Fica porque ela não é regra de landing: é a regra de qualquer cartão que abra uma aba inteira, e o dia em que um índice de nível alto quiser esse cartão é o dia em que reescrevê-la do zero custaria o mesmo raciocínio outra vez — inclusive a colisão de `book-open`, que já foi paga uma vez.

**O registro é sóbrio, não ilustrativo.** O ícone marca posição; não narra a seção. É o registro que combina com um sistema onde tudo é imóvel e a assinatura mora no ritmo da página, não no enfeite.

Três pares merecem o motivo escrito:

- **`code-xml` para `Conteúdo Teórico`**: o papel é dono de **contrato**, e o contrato é o artefato escrito. É o mesmo glifo que nomeava a Referência da API duas árvores atrás e `API Owner` na anterior — ele desceu um nível dentro da mesma jornada, sem mudar de significado;
- **`activity` para `Work in Progress`**: linha de pulso é *algo acontecendo*, que é exatamente o que uma aba esvaziada à espera de conteúdo real declara. Ele nomeava `Diagnóstico`, e é o segundo órfão de navegação reempregado do manifesto;
- **`package` para `Bibliotecas`**: biblioteca é pacote que se instala. É a metáfora mais apertada disponível, e custa zero arquivo — a mesma que já servia `SDKs`.

**As quatro abas são quatro barras laterais, vistas uma de cada vez.** Os pares de navegação nunca competem numa lista só; competem em listas de quatro, três, um e um, mais as seções e folhas que só aparecem com o `overpower` aberto. A coerência é exigida **dentro** de cada aba, e o que segura as quatro juntas é a família.

### Autoria · 39 tags sobre 39 arquivos

**Ações (7):** `play` · `download` · `upload` · `refresh-cw` · `trash-2` · `plus` · `filter`

**Objetos (16):** `file-text` · `folder` · `terminal` · `wrench` · `database` · `server` * · `cloud` · `key` · `lock` · `mail` · `calendar` · `users` · `globe` · `package` · `rocket` · `shapes`

**Estados e sinais (7):** `zap` · `clock` · `circle-alert` · `circle-help` · `sparkles` · `trending-up` · `gauge`

**Conceitos (9):** `layers` * · `workflow` * · `puzzle` * · `bot` * · `webhook` · `bell` · `book-open` · `repeat` · `undo-2`

\* carrega também a tag de navegação — são as nove que fazem 70 tags caberem em 61 arquivos.

**Quatro nomes entraram nesta lista sem desenho novo**: `rocket`, `shapes`, `repeat` e `undo-2` perderam o papel de navegação quando a árvore anterior morreu, e teriam ficado sem tag nenhuma. Entrada sem tag é entrada sem papel, e o vendorizador a trataria como órfã.

---

## 6. Superfície de autoria — string, e falha alto

```mdx
<Card title="Instalação e configuração" icon="download" href="instalacao-e-configuracao">
  As opções, o arquivo de configuração e a adoção em projeto existente.
</Card>
```

> **Correção de fato:** este exemplo escrevia `icon="rocket"` num desenho que, à época, estava tagueado **só como navegação** — ou seja, ele mostrava o autor usando um nome que a superfície de autoria não cobria. O exemplo passa a usar `download`, que sempre foi autoria; e `rocket` ganhou a tag de autoria de qualquer forma, ao perder o papel de navegação. Os dois lados da incoerência fecharam no mesmo commit.

**Nome desconhecido lança, e o `throw` é falha de build.** Isso sai de graça: o Docusaurus prerenderiza toda página, então não há infraestrutura a montar. Em desenvolvimento vira overlay de erro do React, que é o retorno certo ali.

```
Ícone "rockett" não existe.
Você quis dizer "rocket"?
60 ícones disponíveis em src/icons/manifest.js.
```

O número desta mensagem **não é escrito à mão**: ele é `NOMES.length`, lido do manifesto. Um número redigitado aqui seria a segunda cópia da contagem, e ela mentiria no primeiro corte.

A distância de edição são oito linhas próprias. `leven` é dependência transitiva do core, mas amarrar em dependência transitiva é dívida — as oito linhas são mais baratas que o risco. A sugestão só aparece quando é plausível: acima de um terço do comprimento do nome ela vira ruído, e mandar alguém para o glifo errado é pior que não sugerir.

**Degradar em silêncio está descartado.** Ícone faltando é erro de **conteúdo**, e conteúdo é o que mais muda. Placeholder discreto significa que o erro chega em produção — e num transplante, falha silenciosa vira documentação publicada com buracos.

**Escape:** o componente aceita nó React cru, para o caso genuinamente não coberto. Explícito e visível em revisão, ao contrário de um nome que silenciosamente não resolve.

### 6.1 A bijeção é conferida nos três lados

O manifesto, o registro React e o diretório de desenhos são três listas da mesma coisa, e cada par tem quem o confira:

| divergência | quem pega | quando |
| --- | --- | --- |
| desenho sem arquivo | o próprio `import` | build |
| entrada de manifesto sem desenho no registro | o registro, na inicialização | build (prerender) |
| desenho no registro sem entrada no manifesto | o registro, na inicialização | build (prerender) |
| arquivo em `static/icons/` que ninguém declarou | o vendorizador, em `--conferir` | CI |

O último é o único que viaja calado sem essa conferência: arquivo órfão não é importado por ninguém e não quebra nada — só engorda o artefato.

**Nota de implementação medida, e ela custou um build:** `require.context` **não** funciona com SVGR. A regra do plugin casa por *issuer*, e num contexto o issuer de cada arquivo é o módulo de contexto — um diretório —, então a regra não casa e o SVG cai na regra de asset. O que volta é uma **data URI**, não um componente, e o sintoma é `Invalid tag: data:image/svg+xml;base64,…` no prerender. Por isso são 60 `import` à mão, e por isso a bijeção é conferida em vez de derivada.

---

## 7. Cor — onde mora o efeito visual

| Superfície | Cor |
| --- | --- |
| Ícone de `Card` | **cor de marca** — não cinza. A medição chama isto de *"o detalhe que mais define a aparência do card"* |
| Ícone de sidebar | `currentColor` — herda ativo, hover e modo **de graça** |
| Ícone de `Callout` | a cor da variante |
| Ícones de sistema | a rampa de cinzas, **sem tingimento** |
| Ícone do título do TOC | `--pd-text-body`, o mesmo do rótulo — pintado por `background-color` sob `mask`, porque não há elemento a herdar `currentColor` de |

> **Correção de fato.** A linha dos ícones de sistema dizia *"a rampa de cinzas **tingida com o matiz da marca**"*, e isso deixou de ser verdade na [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95): a rampa parou de ler `--pd-brand` e passou a valer os hex medidos direto na âncora, fixos qualquer que seja a marca colada. Ver [`tokens.md`](tokens.md) §5 e [`principios.md`](principios.md) §2. A afirmação sobreviveu duas trocas de matiz sem ser conferida.

---

## 8. Onde é obrigatório, opcional e proibido

| Superfície | Regra |
| --- | --- |
| **Sidebar** | **ausente** no separador de topo; **obrigatório** em tudo abaixo dele — folha ou grupo, em qualquer nível. É a terceira redação (issue #114) e a primeira agnóstica de profundidade |
| **`Card`** | opcional, mas ícone **XOR** imagem — nunca os dois |
| **`Callout` tipado** | **fixo por variante; o autor não sobrescreve.** Os tipados da âncora não aceitam prop nenhuma |
| **`Steps`** | opcional; o default é o número do passo. Ícone **substitui** o número, não o acompanha |
| **`Tab`** | opcional — uso medido baixo |
| **`Accordion`** | ícone opcional; o **caret é sistema**, não opcional |
| **Tab de navbar** | **sem ícone** |
| **Footer** | **sem ícone** — consome zero slots |
| **Título do TOC** | **obrigatório** — um glifo, `list`, no rótulo *Nesta página*. É a única superfície de chrome fora da sidebar que carrega ícone, e é assim na âncora. Ver [`chrome.md`](chrome.md) §5.1 |

**A regra da sidebar foi reescrita três vezes, e só a terceira fecha o assunto.** As duas primeiras — *obrigatório na categoria de topo, ausente na folha*, depois *toda folha tem ícone, nenhum cabeçalho de grupo tem* — tinham um teste que **mudava de resultado com o nível**: a primeira não sabia ler o nó do meio, a segunda o lia negando, e cada árvore mais funda exigia decidir de novo. Foi isso, e não o teto de profundidade, que travou o nível 3 por duas issues.

**A redação em vigor pergunta uma coisa só: *isto é o separador de topo?*** Tem resposta em qualquer árvore, em qualquer profundidade, sem que ninguém precise voltar aqui. Bate com a medição: no `docs.devin.ai` o `<h3>` de topo não tem ícone, e o botão de subgrupo tem. Ver [`informacao.md`](informacao.md) §3.1 e [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) §e.

> **Correção de fato — #97, obsoleta desde a #114.** A redação da #97 negava ícone a `Biblioteca C`, por ela ser cabeçalho de grupo. A regra em vigor dá ícone a ela: `Biblioteca C` está abaixo do separador, e o nível dela não entra no teste.

---

## 9. Custo de bundle, aceito conscientemente

Registro estático coloca os 60 no bundle principal. É o preço de `icon="rocket"` funcionar sem import dinâmico, e é barato — dezenas de kilobytes crus, poucos gzipados.

O caminho da sidebar não paga isso duas vezes: as máscaras entram no CSS, e como os arquivos são pequenos o empacotador as embute como dado em vez de gerar requisição. Um desenho, dois consumidores, zero divergência possível.

---

## 10. Uma tensão deliberadamente não resolvida

O mapa registra o risco de o resultado sair **indistinguível de qualquer documentação feita na âncora**. Adotar a mesma biblioteca de ícones que ela serve **reforça** essa semelhança.

Posição registrada: **ícone é vocabulário, não é onde a identidade deve morar.** Trocar por família exótica custa legibilidade e não compra diferenciação; a identidade vem de cor, motion e layout.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Lucide vendorizado, licença ISC | origem própria | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §1 — licenças verificadas na fonte |
| SVGR já vem no `preset-classic` | herdado (verificação) | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §0b |
| Família única, contorno, geometria | **delta deliberado** | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §2 — a âncora mistura famílias, e a mistura é acidente dela |
| Compensação óptica por tamanho | origem própria | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §2 — habilitada pela escolha de SVGR |
| Máscara na sidebar | **lacuna por restrição** | não há ponto `safe` para injetar componente em item de sidebar |
| O papel é tag na entrada | herdado | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §4 |
| 75 tags sobre 61 arquivos, folga três | **origem própria (correção)** | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) — quatro cortes contra a árvore nova; a resolução dizia *sete mais dois* e a contagem fecha em *oito mais dois mais um*. **Um slot gasto depois**: `list`, para o título do TOC — o 61º arquivo, dentro do teto de 64 |
| O glifo do título do TOC | **herdado** | a âncora abre o índice com rótulo e glifo de lista; medido em navegador — `viewBox` 18, três traços, e o vão de 8px entre glifo e palavra. O nome é nosso (`list`) e o arquivo upstream é `text-align-start`, pelo mapa de uma linha que o manifesto já prevê |
| **A marca fica só com a palavra** | **origem própria** | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) — o argumento da figura da landing, aplicado a uma superfície que aparece em toda página |
| **A rota da marca é `navbar.title` no `.navbar__brand` nativo** | **origem própria (medição)** | a resolução a declarava *provável e não medida*; medida no artefato publicado, nos dois modos |
| **Os três renderizadores viram dois** | **origem própria (consequência)** | o §3(c) perdeu o assunto quando a marca perdeu o glifo |
| **A regra de ícone vira *só no nó de topo da sidebar*** | **origem própria (correção)** | a formulação antiga não tinha leitura no nível 3, e era ela — não o teto de profundidade — que impedia `Biblioteca C` |
| **Nenhum ícone no separador, ícone em tudo abaixo** | herdado | `docs.devin.ai` — `<h3>` de topo sem ícone, botão de subgrupo com `mask-image` à esquerda |
| **A regra passa a ser agnóstica de profundidade** | **origem própria (correção)** | as duas redações anteriores tinham teste que mudava de resultado com o nível, e travaram o nível 3 por duas issues |
| `chevron-right` serve o caret de sidebar **de fato** | **origem própria (correção)** | o manifesto afirmava isso desde que existe, e nenhuma regra do repositório implementava — era o SVG do Infima com `filter: invert()` |
| **A regra de ícone vira *toda folha, nenhum cabeçalho de grupo*** | **origem própria (correção)** | [#97](https://github.com/ThiagoPanini/panlabs-docs/issues/97) — a linha acima marcava o nó de topo e divergia da âncora; fechada contra `docs.devin.ai` |
| `shield-check` citado e nunca existente | **origem própria (correção)** | varrido contra o manifesto: o nome nunca esteve lá |
| O exemplo de autoria usava um nome tagueado só como navegação | **origem própria (correção)** | `icon="rocket"` no §6 contra a tag dele à época |
| O candidato de reabertura de `circle-check` evaporou | **origem própria (consequência)** | o painel deixou de ter resposta HTTP de sucesso quando o contrato deixou de falar HTTP |
| A tag de autoria é *nome escrito como string*, não *MDX* | **origem própria (correção)** | [#80](https://github.com/ThiagoPanini/panlabs-docs/issues/80) — a landing usava `<Card icon="…">`, a mesma superfície; a redação antiga descrevia o único consumidor, não a regra. A definição **não volta atrás** com [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94): reverter para *MDX* recriaria a redação que já se mostrou estreita uma vez |
| Ícone nas três portas da landing, sob a regra de não repetir glifo de categoria | **origem própria (consequência)** | [#80](https://github.com/ThiagoPanini/panlabs-docs/issues/80) decidiu, [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) **removeu o sujeito** — as portas saíram com a página. A regra fica escrita e sem consumidor: ela vale para qualquer cartão que abra uma aba inteira, e o raciocínio já foi pago, inclusive a colisão de `book-open` |
| `wrench` como o único desenho novo | **origem própria (implementação)** | descoberto aplicando a regra da porta: em `Ferramentas` todo reuso adequado já é uma das quatro famílias que a aba abre |
| **`wrench` perdeu o consumidor que o comprou, e ganhou outro** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — a porta `Ferramentas` era o único uso concreto dele, e por um ticket ele foi *o primeiro nome a olhar no próximo corte de teto*. A [#117](https://github.com/ThiagoPanini/panlabs-docs/issues/117) lhe deu a segunda tag `navegacao`, em `overpower › Desenvolvimento`: ele volta a ter consumidor concreto e sai do topo da fila de corte |
| `circle-check` fora | **delta deliberado** | consequência da variante morta na [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15), pela regra de *sem consumidor* |
| Os dezesseis pares seção→ícone | origem própria | [#81](https://github.com/ThiagoPanini/panlabs-docs/issues/81) — `code-xml` e `activity` reempregados, os outros nove reusando entrada de autoria; as cinco de #117 reusam pelo mesmo mecanismo |
| **Os pares caem para 33, e nenhum desenho sai** | **origem própria (consequência)** | cinco pares de seção saíram com o conteúdo que nomeavam, e os desenhos deles perderam só a tag `navegacao`; a bijeção que `npm run icones` cobra fecha nos três lados, com 60 arquivos |
| **A família é da seção, e não só do separador** | **origem própria (correção)** | a árvore ganhou seção de nível 3 com identidade própria, e herdar a família do topo faria cinco seções lerem como uma |
| **O registro sóbrio em vez do ilustrativo** | **origem própria (medição)** | [#83](https://github.com/ThiagoPanini/panlabs-docs/issues/83) — as quatro Mintlify (mesmo CSS) não convergem: três renderizam glifo preenchido (Font Awesome `regular`/`solid` v7.2.0), uma usa contorno (Tabler `outline`). A âncora mistura registro do mesmo jeito que mistura família (§2) — a mistura é acidente dela, não assinatura a herdar |
| Nome inexistente quebra o build | origem própria | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §6 |
| Regra de cor por superfície | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) e [#2](https://github.com/ThiagoPanini/panlabs-docs/issues/2) |
| Obrigatório no topo, ausente na folha | herdado | [#21](https://github.com/ThiagoPanini/panlabs-docs/issues/21) §8 |
| A versão do Lucide é fixada e conferida no ato de copiar | herdado | [#32](https://github.com/ThiagoPanini/panlabs-docs/issues/32) §2, nota final |
| O nome do manifesto não se move por renomeação de terceiro | **origem própria (implementação)** | três dos nomes então vigentes já não existiam na versão fixada; o campo de nome upstream resolve numa linha |
| `require.context` não funciona com SVGR | **origem própria (medição)** | a regra do plugin casa por *issuer*, e o issuer de um contexto é um diretório |
| GitHub como palavra, não como glifo | origem própria | consequência do teto: não há marca de terceiro no manifesto, e o slot livre não tem nome cravado |
| Os cinco ícones de admonition não são trocados por `--eject` | **origem própria (implementação)** | o callout tem DOM próprio pelo registro de `Admonition/Types` ([#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15)); o degrau 5 se resolveu no 3 |
