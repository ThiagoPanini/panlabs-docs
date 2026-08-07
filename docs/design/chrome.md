# Chrome

O shell da página de documentação: proporções, navbar, sidebar, TOC, breadcrumb, paginação e footer.

**Nenhum valor numérico aparece neste documento.** Todos os comprimentos moram em [`tokens.md`](tokens.md) e são citados aqui **por nome de token**. Os números que aparecem são identificadores — número de ADR, de issue e de portão — ou o limiar de media query, que é o único comprimento que a linguagem não sabe ler de custom property.

Chrome não se autora: se **entorta**. Tudo neste documento é degrau 0 (variável do Infima) ou degrau 1 (classe estável) da escada do [ADR 2](../adr/0002-politica-de-swizzle.md), **com uma exceção de degrau 3** — a marca, que está em [`icones.md`](icones.md) e no ledger de [`swizzle.md`](swizzle.md). O orçamento `unsafe` continua em zero.

Tudo aqui é obrigatório. Não há bloco `Livre` — o chrome inteiro é geometria herdada ou consequência de restrição, e não sobra latitude para nomear dono.

> **Leia antes:** [ADR 1 — Doutrina de CSS](../adr/0001-doutrina-de-css.md) e [ADR 2 — Política de swizzle](../adr/0002-politica-de-swizzle.md).

---

## 1. A cadeia de proporções

Uma cadeia, e cada elo deriva do anterior. **Ou os números fecham na tela, ou não fecham** — não há meio-termo, e todo o resto do site assume que fecharam.

| Elo | Token | Como sai |
| --- | --- | --- |
| Container | `--sd-container-width` | medido |
| Coluna de conteúdo | `--sd-doc-width` | `calc()` sobre o container — é o `.col--9` do grid de doze |
| Coluna do TOC | `--sd-toc-width` | o quarto restante, `.col--3` |
| Cartão | `--sd-doc-width` | preenche a coluna, **constante** |
| Preenchimento do cartão | `--sd-space-12` | camada 3, declarado no escopo do cartão |
| Interior / breakout | `--sd-doc-width` menos duas vezes o preenchimento | não tem token: não há regra que o consuma, e token sem consumidor é o defeito do Infima que este projeto nomeou |
| Medida da prosa | `--sd-prose-width` | medido, centrada no interior |
| Sidebar | `--sd-sidebar-width` | medido |
| Navbar | `--sd-navbar-height` | medido |
| Gutter | `--sd-gutter` | dobra a partir de 997 |
| Shell total | container mais sidebar | derivado |

### 1.1 As DUAS variáveis de container recebem o mesmo valor

O Infima tem duas: uma normal e uma `-xl`, e **a segunda assume acima de 1440px**. Fixar só a primeira faz a coluna — e portanto o cartão — **alargar sozinha em tela larga**, que é exatamente a oscilação que a medida constante existe para eliminar.

É a armadilha mais barata de cair e a mais cara de perceber: o defeito só aparece num monitor que quem implementa pode não ter.

### 1.2 Três declarações fazem a cadeia fechar, e as três são mecânicas

Isto não estava previsto em nenhuma resolução do mapa. Saiu de medir o grid do Infima ao implementar, e sem as três a cadeia entrega números diferentes dos decididos.

**(a) O gutter mora no `<main>`, não no `.container`.** A margem negativa da `.row` é calibrada contra o preenchimento do container, e o `.col` de 75% mede a row. Trocar o preenchimento do container quebra os três de uma vez. O container fica com o que o Infima dá; o `<main>` completa o que falta para o gutter.

**(b) O `.col` perde o preenchimento horizontal.** Sem isso o cartão nasce com a coluna **menos** duas vezes o preenchimento de coluna do Infima — ele seria mais estreito que `--sd-doc-width`, e a conta não fecharia. Os dois lados são cobrados por dentro dos 75%.

**(c) A coluna do TOC recebe a separação de um lado só.** Com preenchimento nos dois, a borda direita do TOC não fecha com a borda direita do container e sobra uma faixa vazia. Com a separação só à esquerda, o TOC alinha com o container e a folga entre cartão e TOC é a que se quer.

### 1.3 O cartão

Ele envolve **só `.theme-doc-markdown`**, que é `ThemeClassNames` estável e o único recorte alcançável sem swizzle. **Breadcrumb fica acima e paginação abaixo**, sobre o fundo da página: incluí-los exigiria `DocItem/Layout`, que é `unsafe`.

Efeito colateral bom, e não planejado: os cartões de paginação ficam com um passo de elevação só, sem cartão dentro de cartão.

**A separação é o anel `0 0 0 1px` embutido na sombra multi-camada — não uma borda.** Ele lê como borda sem *ser* borda, e é o que compra elevação sem abandonar a leitura limpa da âncora. Uma primeira redação do mapa dizia o contrário — *elevação por borda, e o buraco de sombra do Infima deixa de importar* — e foi corrigida: **a lacuna de sombra no escuro continua obrigatória de preencher**, e o adaptador a preenche.

O cartão é **nível de superfície de verdade**, não moldura decorativa: ele é o segundo dos dois preenchimentos do sistema, e não existe um terceiro.

### 1.4 A medida da prosa é constante, e o breakout resolve sozinho

`--sd-prose-width` **sempre**, tenha a página TOC ou não.

A âncora oscila — a coluna de texto encolhe quando o TOC existe —, e essa oscilação **não é desenho: é efeito colateral** de a largura do texto depender de a página ter subtítulos. Páginas vizinhas da mesma seção leem com larguras diferentes, sem motivo visível ao leitor. Nenhuma das sete referências corrige isso.

**O breakout não precisa de regra.** Quem não está na lista de elementos de prosa fica com o interior inteiro do cartão: código e tabela respiram, o texto não. Escrever a lista de quem escapa seria escrever a lista errada — ela cresce a cada componente novo do catálogo.

**Sem `!important`.** A medida vai para **dentro** dos 75%, nunca contra eles.

**O custo, declarado:** a medida dá mais caracteres por linha do que o teto clássico. Aceito porque documentação se varre mais do que se lê corrido, e porque heading, lista e bloco de código quebram a linha longa o tempo todo — **mas só se sustenta com a entrelinha generosa** que `tokens.md` trava. Baixar a entrelinha do corpo reabre esta decisão.

### 1.5 O cartão fica no mesmo pixel com e sem TOC — e o motivo medido não é o que o mapa supunha

**Correção de premissa, medida em 3.10.2.** O mapa escreveu que *"o Docusaurus só monta a coluna de TOC quando há heading; sem ela, a coluna de conteúdo vai a 100% da linha em vez de 75%"*. Não é o que o `DocItem/Layout` faz.

A classe de 75% é aplicada sempre que `hide_table_of_contents` **não** está no front matter — independentemente de haver heading. O que depende de heading é a coluna do TOC, que só é renderizada quando há um.

Logo existem **três** configurações, não duas:

| configuração | coluna de conteúdo | coluna do TOC | cartão |
| --- | --- | --- | --- |
| com heading | 75% | renderizada | `--sd-doc-width` |
| sem heading | 75% | ausente | `--sd-doc-width` |
| `hide_table_of_contents: true` | 100% | ausente | `--sd-doc-width` |

O `max-width` do cartão é o que cobre a terceira, e é ela que a Referência da API exercitaria se usasse o front matter — que a decisão de layout dela **descartou**, por ser segunda fonte para algo que o componente já decide.

Nas três, o cartão fica no mesmo pixel e **só muda o vazio à direita**. É `max-width` e não `width` porque a alternativa seria travar largura contra uma coluna que pode ser menor no estreito.

### 1.6 Um limiar só no projeto inteiro

As media queries se alinham aos **literais compilados do Infima**, 996 e 997, e não aos 1024 da âncora. É o mesmo limiar que mostra e esconde a sidebar, então o site tem **um** evento visual em vez de dois brigando.

O par de gutter é herdado; o ponto onde ele troca, **não**. Mesma forma da decisão do degrau de título de página, que também trocaria noutro limiar na âncora e foi trazida para cá.

Isto é cobrado por portão: a segunda perna do portão 1 reprova qualquer media query cujo limiar não seja o único do projeto.

---

## 2. Navbar

Altura `--sd-navbar-height`, fixa no topo, sem faixa de tabs de largura total.

| Posição | Item | Tipo |
| --- | --- | --- |
| esquerda | a marca | `custom-marca` — ver [`icones.md`](icones.md) |
| esquerda | `Documentação` · `Referência da API` · `Receitas` | `docSidebar`, uma por instância |
| direita | `Buscar` | `search` — slot reservado |
| direita | `PT` | `localeDropdown` |
| direita | `GitHub` | link |
| direita | alternância de tema | **não declarável** |

**A ordem à direita é declarada, menos a última.** O `Navbar/Content` renderiza a alternância de tema depois dos itens da direita, por construção — ela fecha a linha e não há como reordená-la sem swizzle.

**As tabs trocam a sidebar inteira.** Cada uma aponta para uma instância de `plugin-content-docs`, e é isso que faz a URL ler o eixo. Ver [`informacao.md`](informacao.md).

**`localeDropdown` com rótulo curto.** O default do Docusaurus vem de `Intl.DisplayNames` e produz o nome do locale por extenso, que é o item mais largo que a navbar carregaria. O rótulo curto é uma linha de config em `localeConfigs`, e a diferença é o que separa caber de não caber na **única faixa apertada do navbar** — a que começa no limiar e vai até a tela larga, porque abaixo dele o Infima manda tudo para dentro do hambúrguer.

**GitHub entra como palavra, não como glifo.** Não há marca de terceiro no manifesto de ícones, e gastar o único slot livre num logotipo de plataforma seria decidir por acidente o que o orçamento deixou reservado sem nome.

### 2.1 O que acontece quando a busca não existe

**Nada, e isso é medido.** O `Navbar/Search` do upstream tem `:empty { display: none }` no próprio módulo — enquanto o `SearchBar` do tema for o placeholder vazio, o contêiner some sozinho.

Consequência: declarar `type: 'search'` **reserva a posição a custo zero**. Sem a declaração, o `Navbar/Content` renderiza a busca depois da alternância de tema, e a ordem sairia errada no dia em que ela existisse. Com ela, o slice 7 preenche o slot e nada mais se move.

Um transplante corporativo que remova a busca não deixa buraco no navbar.

---

## 3. Sidebar

Largura `--sd-sidebar-width`, e **nada aqui custa swizzle**.

**O número é medido, não default.** O valor que o Docusaurus entrega de fábrica não é medido nem derivado; a largura adotada aparece em dois dos três layouts preferidos. *Dissenso registrado:* ela aperta aninhamento profundo, porque o Docusaurus indenta por nível e ainda há um ícone à esquerda. O teto de profundidade 2 é o que a segura — se a árvore ganhar um terceiro nível, este número reabre.

### 3.1 Ícone por categoria de topo

`className` no arquivo de sidebar, mais `::before` com `mask-image` e `currentColor`. O `className` é **contrato público do schema de item de sidebar**, e é ele que produz a assinatura visual mais reconhecível do alvo — sem uma linha de swizzle.

Duas propriedades caem de graça e valem escrita:

- a máscara é pintada com `currentColor`, então **o estado ativo pinta o ícone junto com o texto**, sem uma regra a mais;
- **não existe segundo desenho para o modo escuro.** O axioma 4 é satisfeito sem custo.

O `::before` mora no **link**, não no `<li>`, para herdar a cor dele. Isso importa porque a categoria é clicável: o rótulo é um `<a class="menu__link">` com um `<button class="menu__caret">` irmão, e o alvo do seletor é o link.

**A regra cobre duas formas, e a segunda foi medida no artefato.** O Docusaurus **normaliza categoria sem filhos para link**: o `<li>` conserva o `className`, mas o rótulo deixa de ser envolvido pelo bloco colapsável. Com um seletor só, uma seção perderia o ícone e a tipografia de topo no dia em que a última folha dela saísse — e a falha seria **muda**, que é o modo de falhar que este projeto recusa em toda parte.

Por isso o marcador do rótulo de seção é o **`className` do manifesto**, e não o número de nível: `.sidebar-icone` é a definição de *seção de topo* neste sistema, e ele sobrevive às duas formas. Os níveis continuam desenhando a hierarquia da folha, que é o que eles sabem fazer.

Isso obriga uma segunda regra, e ela é o par da primeira: a folha se estiliza por `theme-doc-sidebar-item-link-level-2` **e** por nível 1 sem o marcador de seção — que é a sidebar plana de `Receitas`, onde toda folha é de topo.

O alinhamento não é coincidência: o preenchimento horizontal do item de menu foi escolhido para que, somado ao preenchimento que o `DocSidebar` põe na lista, o ícone caia **na mesma vertical do preenchimento do navbar** — a marca e o primeiro ícone de seção ficam alinhados.

Os doze pares seção→ícone estão em [`icones.md`](icones.md), verbatim.

### 3.2 Hierarquia e item ativo

A hierarquia sai de `theme-doc-sidebar-item-category-level-<n>` e `theme-doc-sidebar-item-link-level-<n>`, que são `ThemeClassNames`. Como o teto de profundidade é 2, existem **exatamente dois degraus a desenhar** — e é isso que faz a regra de ícone (obrigatório no topo, ausente na folha) ter leitura em todos os nós que existem.

**O item ativo ganha falso-negrito por `text-shadow`, não por `font-weight`.** Trocar o peso reflui o texto e faz o item **pular de largura** no instante em que o leitor navega. Meio pixel de sombra engrossa sem mexer na métrica, e como o valor usa `currentColor` ele acompanha o acento sem par declarado e sem segundo valor para o modo claro.

---

## 4. TOC

A largura é **derivada do grid** — a coluna é o `.col--3`, um quarto do container. Não há número a escolher aqui, e é por isso que `--sd-toc-width` existe como valor: o Infima escreve a coluna como classe, não como conta.

O comportamento sticky vem do upstream e não se toca.

**Perda registrada:** a âncora usa um painel à direita bem mais largo. Alcançar isso exigiria quebrar o 75/25, que vive numa classe hasheada de CSS Module e custaria `unsafe` em `DocItem/Layout` — o que a política proíbe. A perda é visível e vai escrita como perda, não como escolha.

---

## 5. Breadcrumb e paginação

Os dois vivem **fora do cartão** — o breadcrumb acima, a paginação abaixo, sobre o fundo da página. Não é escolha estética: o único recorte alcançável é o corpo.

Os dois herdam do adaptador e não têm anatomia própria. **Perda nomeada:** o breadcrumb reestruturado como a eyebrow da âncora exigiria `DocBreadcrumbs`, que é `unsafe`. Fica o breadcrumb nativo, re-marcado por variável. A âncora não tem breadcrumb visual, então aqui o shinydoc **diverge por restrição** — e isso se registra como tal, não como delta deliberado.

---

## 6. Footer

**Uma linha.** Links à esquerda, copyright à direita, fio de ponta a ponta, sem preenchimento próprio, sem ícone, sem coluna, sem elevação — e **sem uma única linha no ledger de swizzle**. As oito peças de `Footer` são `safe` nas duas ações e nenhuma é exercida.

É o resultado que mais contraria a intuição do mapa inteiro: o footer parecia o candidato óbvio a swizzle do chrome, e é a única superfície que não custa nada.

### 6.1 Os links, e a regra que os escolheu

> **Entra no footer só o que não está em nenhum outro lugar do site.**

É a regra que impede o rodapé de virar segunda cópia da navegação — o *chrome inerte* que a arquitetura de tokens nomeou.

| Rótulo | Por que existe |
| --- | --- |
| `Status` | convenção dura de API de pagamentos; não tem página nem entrada de sidebar |
| `Changelog` | é o **único** canal de comunicação de versão da API, e está enterrado como folha de `Operação` |
| `Suporte` | fecha com o canal humano |
| `llms.txt` | **slice 7** — é o único artefato do site sem nenhuma entrada de navegação, logo indescobrível sem este link |

**Nenhum abre em nova aba, e isso precisa ser declarado.** Correção de premissa medida nesta implementação: o `<Link>` do Docusaurus injeta `target="_blank"` **sozinho** em todo `href` externo. A decisão do rodapé é que nenhum link abre em nova aba, e sem declarar o contrário ela não valeria.

Isso é pré-requisito do parágrafo seguinte, não detalhe: o ícone de link externo é escondido, e escondê-lo só é honesto se o anúncio dele for falso.

**O ícone de link externo sai, e o motivo não é estética.** `Icon/ExternalLink` não está no `getSwizzleConfig` — cai no default `unsafe` — e nem é componente normal: vem de um sprite injetado. Ele ficaria com o desenho do Docusaurus, de outra família, em dois dos três links. A regra da política responde sem enumerar: **o que só é alcançável por `unsafe` não é trocado**; aqui ele é escondido por classe estável.

**Sem logotipo e sem wordmark estilizado no copyright.** O schema de logo exige um arquivo de imagem, e a marca deste sistema é tipo mais glifo. Repetir a lockup no rodapé de todas as páginas seria uma **segunda** lockup de marca — o mesmo defeito de duplicação que matou as colunas. Consequência limpa: o footer consome **zero** dos 63 ícones.

### 6.2 As três divergências obrigatórias contra o Infima

Nenhuma é gosto. As três são defeitos contra o que o sistema já travou.

| Ponto | O Infima entrega | Por que não serve |
| --- | --- | --- |
| Preenchimento | um degrau da escala de ênfase | seria um **terceiro** preenchimento, contra os dois níveis e mais nenhum |
| Peso do título de coluna | 700 | esse peso **não existe** na escala de três pesos do sistema |
| Entrelinha de link | 2 | contra a entrelinha de UI |

O terceiro caso tem uma nota: a porta fica **fechada na spec**, porque `links` é lista plana e o schema do tema recusa misturar plana com coluna — escrever CSS preventivo para um componente que não renderiza seria a variável sem consumidor que este projeto nomeou.

**Sem sombra, e é decisão.** A escada de elevação é para superfície que sobe. O footer não sobe — ele **é** a página. A separação é o fio.

### 6.3 O alinhamento à coluna de doc

O `<Footer/>` é **irmão do `main-wrapper`**, não filho da página de doc. Então o `.container` dele centra na **viewport**, enquanto o da doc centra dentro do que sobra depois da sidebar. Em tela larga isso são mais de cem pixels de desalinhamento entre o fio do rodapé e a borda do cartão — exatamente a oscilação que a medida constante existe para eliminar.

A correção é uma declaração, e ela **soma o gutter**: sem isso erra pela largura dele. E há uma segunda metade que só aparece implementando: o `.container` do rodapé perde o preenchimento próprio, que sobe para o `<footer>`. Sem isso o cartão fica rente à borda do container e o texto do rodapé começaria uma unidade de gutter depois dela.

**O fio, porém, é de ponta a ponta** — ele mora no `<footer>`, fora do preenchimento. Assim o separador lê como régua de site (o que ele é) e o conteúdo lê alinhado com o que está acima dele.

A classe de página de doc vem do `DocRoot`, então isto vale para as **três** instâncias. Na landing a classe não existe, o preenchimento não aplica, e o footer centra na viewport junto com o conteúdo de lá — **alinhado com o que está acima nos dois tipos de página, por construção**.

**Perda nomeada:** com a sidebar recolhida pelo leitor, o layout troca para a largura escondida e o footer não acompanha. O estado mora em classe de CSS Module hasheada; alcançá-la por `:has()` é precisamente o que se recusou ao desistir da proporção da âncora.

**Este documento fica com uma linha sobre `llms.txt`, e nada mais.** A forma do artefato é de [`informacao.md`](informacao.md).

---

## 7. Tela estreita

Abaixo de 997px — o mesmo limiar em que a sidebar vira gaveta.

**Três dos quatro comportamentos se resolvem por construção, e só um custa declaração.**

**O cartão fica, e o preenchimento cai pela metade.** É o mecanismo do `almond`, que alterna o preenchimento dele por metade — toma-se o mecanismo, nunca o valor. Uma declaração é a história inteira do cartão no estreito.

O cartão **não dissolve**, e o motivo é estrutural: ele é nível de superfície, não moldura decorativa. Derrubá-lo aqui seria derrubar um dos dois níveis de preenchimento do sistema no aparelho em que a documentação é mais lida — e deixaria a rota de doc com cara de Docusaurus cru justamente ali. *Dissenso registrado:* o preenchimento ainda custa tela, e a prosa fica mais estreita do que ficaria sem cartão nenhum.

**O breakout resolve para zero sozinho.** Os `max-width` do cartão e da prosa ficam inertes quando a coluna é menor, e código e tabela deixam de escapar **porque não há medida de prosa da qual escapar**. O escape sempre foi relativo, e no estreito os dois lados da relação são o mesmo número. Nenhuma regra a escrever.

**O gutter se preserva sozinho**, porque o token só dobra a partir do limiar.

**A linha do footer quebra e não empilha**, revertendo deliberadamente o Infima. Ele transforma cada link em bloco, o que faz *uma linha* virar cinco — e "uma linha" é a decisão inteira do rodapé. Os rótulos com separador cabem numa linha nos aparelhos de referência e quebram para duas nos mais estreitos.

Duas notas de implementação que a decisão original não previa:

- o Infima **zera** o preenchimento horizontal do footer no estreito, e a declaração dele mora no próprio `.footer` — mais perto do elemento que o `:root` do adaptador, logo ela vence. A restauração declara a **propriedade**, não a variável: reescrever a variável do Infima fora do adaptador abriria uma sexta exceção com escopo contra a lista fechada do [ADR 1](../adr/0001-doutrina-de-css.md), e a regra de mão única vale nos dois sentidos;
- o link do rodapé vira `inline-flex` em vez de `inline`, porque **elemento `inline` ignora altura mínima em silêncio** e o piso de alvo de toque do [ADR 4](../adr/0004-contrato-de-estado-de-entrada.md) não alcançaria justamente a superfície mais estreita do site.

---

## 8. As sete perdas nomeadas

Consequência direta do orçamento `unsafe` zero. Cada linha é perda escrita, não silêncio.

| # | Perda | Por quê |
| ---: | --- | --- |
| 1 | **Qualquer nó injetado dentro do corpo da página** — eyebrow acima do título, bloco de feedback no rodapé, CTA lateral | `DocItem/Layout` e `DocItem/Content` são `unsafe`, e **não é contornável por CSS**: não se injeta nó no DOM por folha de estilo |
| 2 | **Breadcrumb reestruturado** como a eyebrow da âncora | `DocBreadcrumbs` é `unsafe`. Divergência **visível**, e por restrição |
| 3 | **A proporção da âncora entre conteúdo e painel** | vive numa classe hasheada de CSS Module |
| 4 | **Faixa de tabs de largura total abaixo do navbar** | exigiria reestruturar `Navbar/*`. A rota barata, se um dia for desejada, é envolver `DocSidebar` — degrau 4, e o ledger está vazio nele |
| 5 | **TOC com anatomia nova** — barra de progresso, seções extras | `TOC` e `TOCItems` são `unsafe`. Estilo e profundidade seguem alcançáveis |
| 6 | **Ícone preso dentro de componente `unsafe`** mantém o desenho do Docusaurus | a regra responde sem enumerar; ver [`icones.md`](icones.md) |
| 7 | **Footer dentro da coluna de prosa**, como a âncora faz | `<Footer/>` é irmão do `main-wrapper`. Irmã da perda 2: divergência por restrição |

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Container, coluna, TOC, cartão, interior, prosa | herdado + derivado | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) e [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 |
| As **duas** variáveis de container | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 — armadilha fechada antes de virar sintoma |
| Largura da sidebar | herdado | medido em dois dos três layouts preferidos; os 300 do Docusaurus são default |
| Altura do navbar | herdado | medido |
| Gutter, e o ponto onde ele troca | herdado (par) + origem própria (limiar) | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 |
| Largura do TOC | derivado | é o `.col--3` do grid |
| Shell total | derivado (correção) | container mais sidebar; a estimativa antiga usava a sidebar default |
| Medida de prosa constante | **delta deliberado** | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) §1 — a âncora oscila, e a oscilação é efeito colateral |
| Breakout de código e tabela | **delta deliberado** | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) §1 — a âncora não tem |
| Conteúdo dentro de cartão | herdado | o `almond` da âncora |
| A separação é o anel da sombra, não borda | **delta deliberado (correção)** | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) corrigindo a primeira redação da [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| O cartão envolve só o corpo | **lacuna por restrição** | `DocItem/Layout` é `unsafe` |
| Gutter no `<main>`, `.col` sem preenchimento, TOC com separação de um lado | **origem própria (implementação)** | medido no grid do Infima ao fechar a cadeia; nenhuma resolução previa |
| As três configurações de coluna | **origem própria (correção)** | medido em `DocItem/Layout@3.10.2`: a classe de 75% não depende de heading |
| Limiar único 996/997 | **delta deliberado** | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 — o Infima vence os 1024 da âncora |
| Três tabs no navbar, uma por instância | herdado | [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) §3 e [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) §2 |
| Rótulo curto de locale | herdado | [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7) §5 — medido contra o default |
| GitHub como palavra | **origem própria** | consequência do teto de ícones: não há marca de terceiro no manifesto |
| O slot de busca vazio custa zero | **origem própria (verificação)** | `Navbar/Search` tem `:empty { display: none }` no próprio módulo |
| Ícone de sidebar por `className` mais máscara | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14), [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) — única rota zero-swizzle |
| Alinhamento do ícone com o preenchimento do navbar | **origem própria (implementação)** | escolhido ao somar o preenchimento que o `DocSidebar` põe na lista |
| O rótulo de seção é marcado por `className`, não por nível | **origem própria (medição)** | categoria sem filhos é normalizada para link; com seletor de nível a falha seria muda |
| O `.container` do footer perde o preenchimento próprio | **origem própria (implementação)** | sem isso a compensação erra pela largura do preenchimento, e reescrever a variável do Infima abriria uma sexta exceção com escopo contra o ADR 1 |
| Falso-negrito por `text-shadow` | herdado | [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) — medido nas referências |
| Footer em uma linha, fio superior, muito ar | herdado | [#27](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/27) §11 — a única medição que existe do rodapé da âncora |
| Ar de baixo menor que o medido | **delta deliberado** | a âncora rola dentro da coluna; aqui é banda de site com a viewport logo abaixo |
| A linha quebra e não empilha no estreito | **delta deliberado** | contra o comportamento entregue pelo Infima |
| Conteúdo do footer alinhado à coluna de doc | **origem própria** | não medido; deriva da medida constante |
| Fio de ponta a ponta | origem própria | não medido |
| Os links do footer, e a regra que os escolheu | **origem própria** | regra é *só o que não está em outro lugar* |
| `target` declarado nos links externos | **origem própria (correção)** | medido: o `<Link>` injeta `target="_blank"` sozinho, contra o que a [#27](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/27) §5 supunha |
| Ícone de link externo escondido | origem própria | consequência de `Icon/ExternalLink` ser `unsafe` e vir de sprite |
| Preenchimento do cartão no estreito | **mecanismo emprestado** | o `almond` alterna por metade — toma-se o mecanismo, não o valor |
| Cartão sobrevive no estreito | **delta deliberado** | a âncora não foi medida neste eixo |
| Link do rodapé em `inline-flex` no estreito | **origem própria (implementação)** | `inline` ignora altura mínima, e o piso de alvo do ADR 4 não alcançaria |
| Footer dentro da coluna de prosa | **lacuna por restrição** | é o que a âncora faz e o Docusaurus não permite sem `unsafe` |
