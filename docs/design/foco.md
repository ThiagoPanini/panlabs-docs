# Estado de entrada

Foco, press e alvo de toque — as três formas de um leitor tocar o site.

**Nenhum valor numérico aparece neste documento**, salvo os índices de contraste do §6, que são resultado de verificação e não valor de desenho. Espessura, afastamento e piso de alvo moram em [`tokens.md`](tokens.md), que é a sede única de valor.

Este documento é transversal, ao lado de [`motion.md`](motion.md), [`icones.md`](icones.md) e [`swizzle.md`](swizzle.md). Ele tem arquivo próprio por três razões: os valores não cabem em `tokens.md` (o que ele carrega é regra — qual seletor, quais exceções, qual portão); chrome, catálogo de conteúdo e painel de API consomem a mesma regra, e repeti-la na seção de a11y de dezoito gabaritos seria escrevê-la dezoito vezes; e enterrar acessibilidade num documento chamado *tokens* é o último lugar onde alguém procura por ela.

Tudo aqui é obrigatório. Não há bloco `Livre`.

> **Leia antes:** [ADR 4 — Contrato de estado de entrada](../adr/0004-contrato-de-estado-de-entrada.md).

---

## 1. O que o upstream entrega, medido

Na fonte de `@docusaurus/theme-classic@3.10.2`, `@docusaurus/theme-common@3.10.2` e `infima@0.2.0-alpha.45`:

| fato | valor |
| --- | --- |
| `:focus` no Infima | 2, ambos em `.close`, e ambos sobre opacidade |
| regras de foco no `theme-classic` | 5 |
| das quais usam `:focus-visible` | 1 |
| **declarações de `outline` na pilha inteira** | **zero** |
| variáveis de anel de foco | não existem |
| `-webkit-tap-highlight-color: transparent` em `html` | **sim** |
| `@media (hover: hover)` no Infima | **zero** ocorrências |

O zero de `outline` é a boa notícia: ninguém escreve `outline: none` em lugar nenhum, então nossa regra entra sem disputa de especificidade. Sem ela, o site publicado sai com o anel default do navegador e nada mais.

As duas últimas linhas são as que obrigam, e as duas são de toque. O Infima **já apagou o retorno nativo do tap**, e não gated hover em lugar nenhum.

---

## 2. A regra é universal; a lista fechada é de exceções

**Universal**, e o motivo é o modo de falhar:

| desenho | como falha | quem vê |
| --- | --- | --- |
| lista de alvos | elemento novo não ganha anel | **só quem navega por teclado** |
| regra universal | contêiner ganha anel indevido | qualquer um, na hora |

Prefira a falha que se enxerga. É o mesmo critério que o catálogo de conteúdo usou ao recusar disclosure escrito à mão.

### 2.1 As três exceções, e o defeito que as obriga

O `theme-common` tem um `programmaticFocus` que põe `tabindex="-1"`, foca e remove o atributo. Ele roda em dois lugares: no clique do skip link, e **a cada navegação client-side**, sobre o `<div role="region">` que envolve o próprio skip link.

Pela spec de CSS UI, elemento focado por programa casa `:focus-visible` quando o elemento anterior casava. Quem navega por teclado aciona um item de sidebar com Enter, e o item casava. Logo o div casa — e ele tem **altura zero**, porque o único filho é `position: fixed`.

Sem as exceções, o site desenharia **uma linha de acento atravessando o topo da página a cada clique de sidebar**.

As três são: o `<main>`, o elemento de reserva do skip link, e o `[role='region']` que tem o `<a>` do skip link como filho **direto**. Nenhuma é componente operável, então a SC 2.4.7 não se aplica a elas; o leitor recebe o retorno pelo anúncio da região e pela próxima parada de Tab.

Dois detalhes que não são acidente:

- o id do alvo de reserva é **constante exportada** pelo `theme-common`, não string descoberta lendo HTML;
- o `:has()` exige o `<a>` como filho **direto**, e é isso que impede a exceção de atingir o invólucro de rolagem de tabela larga, que também é `[role='region']` com `tabindex`.

**`[tabindex='-1']` não serve de seletor** — o `programmaticFocus` remove o atributo logo depois de focar. A exceção precisa nomear os elementos.

---

## 3. O mecanismo é `outline`

Não é camada da sombra multi-camada, e a decisão fecha uma porta que a decisão de motion já tinha entreaberto.

`box-shadow` **não se acrescenta: se redeclara inteiro.** A escada de elevação tem três camadas, então qualquer elemento elevado que ganhasse foco teria que repetir as três só para pendurar a quarta — cartão, callout, painel de aba, cartão de grade e moldura de código, todos.

`outline` compra quatro coisas de graça:

- **não afeta layout** — nada empurra nada quando o foco chega;
- **acompanha `border-radius` nativamente** — a escada de raio chega ao anel sem que ninguém a mencione, e não existe token de raio de foco;
- **é ortogonal ao anel de 1px da elevação** — os dois convivem no mesmo elemento como círculos concêntricos, separados pelo afastamento;
- **não participa da transição da sombra** — e este é o argumento decisivo. A sombra do cartão transiciona no movimento de estado; o anel, sendo `outline`, fica fora dela. *Anel instantâneo* deixa de ser regra a lembrar e vira consequência da escolha de propriedade.

### 3.1 O afastamento é o que fecha o contrato

Com afastamento, o anel é pintado inteiramente **fora** da caixa do elemento, e a faixa entre os dois mostra o que está atrás. Consequência:

> **O anel nunca pousa sobre o preenchimento do próprio elemento. Ele pousa sempre sobre a superfície que está atrás.**

Botão com preenchimento de acento, pílula de verbo, badge de estado, item ativo de sidebar com o wash do acento — nenhum consegue engolir o anel. Sem o afastamento, um botão de acento com anel de acento seria 1:1.

Isso troca *verificar por componente* por *verificado uma vez*: o conjunto de superfícies que podem estar atrás do anel é fechado, e é o do §6.

### 3.2 O anel muda de dono onde um ancestral corta

`outline` é cortado por ancestral com `overflow` diferente de `visible`. Varrendo os focáveis do site, isso acontece **uma vez**: o `<pre tabindex="0">` preenche a moldura do bloco de código, e a moldura corta.

O anel sai do `<pre>` e vai para a moldura, por `:has()`.

**A regra geral, para quem vier depois:** onde um focável encostar na borda de um ancestral que corta, o anel muda de dono. Hoje isso acontece uma vez.

**Menor aceito, sem regra:** um link exatamente na aresta de rolagem da sidebar tem uma fatia de anel cortada. O foco rola o elemento para dentro da vista, então o corte é parcial e passageiro.

---

## 4. `:focus-visible` sozinho, zero `:focus`

O inventário de focáveis do site é fechado:

| elemento | origem |
| --- | --- |
| `<a>` | prosa, sidebar, TOC, navbar, footer, paginação, breadcrumb, grade de cartões |
| `<button>` | cópia de código, alternância de tema, voltar ao topo, colapso de categoria |
| `<summary>` | os componentes de conteúdo com `<details>` |
| `[role='tab']` | as abas do Docusaurus — tabindex móvel, só a aba ativa é parada |
| `<pre tabindex='0'>` | região de rolagem do bloco de código |
| `[role='region'][tabindex='0']` | invólucro de tabela larga |
| `<input type='text'>` | painel da Referência da API e o campo da busca — os únicos campos do site |
| `<dialog>` | o modal de busca, e ele **não é parada de tabulação**: `showModal()` põe o elemento na camada superior e tranca o Tab dentro dele |

**O `[role='option']` da busca não entra nesta lista, e a ausência é a decisão.** A opção ativa é apontada por `aria-activedescendant`, então o foco **nunca sai do campo** — é o que o padrão *Combobox With List Autocomplete* do APG compra, e é por isso que o modal de busca não escreve uma linha de gestão de foco. Um `tabindex` na opção transformaria uma lista de setenta e três resultados em setenta e três paradas de Tab.

`:focus-visible` cobre todos, e não há caso para `:focus`:

- em campo de texto o navegador casa `:focus-visible` **mesmo no clique de mouse**. É a heurística padrão, e é a única situação onde `:focus` seria necessário;
- em `<pre>` e no invólucro de tabela, o clique de mouse **não** casa — e está certo: quem clicou não precisa de anel, quem chegou de Tab precisa;
- acrescentar `:focus` poria anel em todo botão e link clicado com o mouse. É o ruído que faz as pessoas desligarem foco no CSS, que é como este contrato morre.

**Não existe foco programático nosso.** Os dois que existem são do Docusaurus e estão isentos pelo §2.1.

---

## 5. Os três `transition: all` do upstream

`CopyButton`, `BackToTopButton` e `DocCard/Layout` declaram `transition: all` com a duração rápida do Infima. `outline` é animável, então os três entram na transição.

O efeito é **pior que um fade**: `outline-style` é propriedade discreta e vira aos 50% da transição. O anel fica **ausente por metade da duração depois da tecla**.

A correção não é remendo — é a regra de motion aplicada (*nenhum CSS do projeto escreve duração ou curva fora dos seis movimentos*) em três elementos que já eram consumidores declarados do movimento de estado. Os três ganchos são `ThemeClassNames`, e o custo é degrau 1.

**Nota que vale escrita:** o Infima encurta a transição sob `prefers-reduced-motion`. Ou seja, hoje o defeito **desaparece justamente para quem pediu menos movimento** e persiste para todo mundo.

---

## 6. Contraste — dezesseis combinações verificadas

O papel de foco aponta para o acento. O afastamento (§3.1) diz **quais** superfícies importam, e são mais que duas.

| preenchimento por trás do anel | escuro | claro |
| --- | ---: | ---: |
| página | 7,33 | 5,70 |
| superfície levantada | 5,55 | 5,96 |
| pastilha de código | 6,58 | 6,54 |
| fundo de callout `info` | 3,78 | 5,12 |
| fundo de callout `success` | **3,72** | 5,11 |
| fundo de callout `warn` | 3,78 | 5,12 |
| fundo de callout `danger` | 3,84 | 5,09 |
| wash do item ativo de sidebar | 6,30 | 4,78 |

**Pior caso 3,72:1 contra os 3:1 que a SC 1.4.11 pede. Folga de 1,24×.**

> **A folga encolheu, e o custo tem dono.** Ela era de 1,44× e é de 1,24×. A causa é a marca serenizada: o acento perdeu um terço de croma, e as quatro células mais apertadas desta tabela são justamente o anel sobre os preenchimentos de callout no escuro, que são as superfícies mais claras que o anel encontra no modo canônico.
>
> **Isso é conta, não descuido**, e continua passando com folga sobre a obrigação — mas é o par a vigiar se a marca esfriar mais. `npm run contraste` reprova abaixo de 3:1, então o dia em que alguém baixar o croma outra vez a CI avisa antes do leitor.

> **A divergência com [`tokens.md`](tokens.md) §10 está fechada, e fechou por medição.** As duas tabelas mediam o **mesmo par** — o anel contra a superfície levantada e contra a página — e discordavam em **três das quatro células**. O defeito foi achado pelo teste de reconstrução ([`README.md`](README.md) §6) e sobreviveu a uma auditoria inteira, porque adivinhar qual estava certa seria **inventar um número medido**.
>
> O desempate não escolheu um dos dois lados: **as duas superfícies foram reescritas por causa da marca nova, e as quatro células foram medidas de novo**. As duas tabelas passaram a ser conferidas pelo mesmo comando — `node scripts/contraste.mjs --verificar` —, que lê as dezesseis células daqui e as onze linhas de [`tokens.md`](tokens.md) §10 e compara cada uma com a medição. Elas concordam célula a célula porque divergir passou a reprovar a CI.
>
> **A lição de forma vale mais que os quatro números:** duas cópias de uma medição divergem caladas, e nenhuma auditoria de leitura pega. A que sobreviveu é a que tem comando atrás.

Três coisas que esta tabela resolve:

- a pastilha de código é a terceira superfície, e agora ela é mesmo a terceira. Até o cartão sair ela **reusava o preenchimento da página** no escuro, e as duas células eram o mesmo número por isso; hoje ela é um degrau acima da página nos dois modos, e a célula dela desceu de 7,33 para 6,58 no escuro — o anel encontra uma superfície mais clara, e continua com o dobro da obrigação;
- **a obrigação é satisfeita por construção, não por esta skin.** As travas de luminosidade do acento — piso no escuro, teto no claro — garantem a folga para qualquer marca que o corporativo cole. Não há verificação por skin a fazer, do mesmo jeito que não há para AA de texto;
- não existe token de cor de foco separado do acento. Abrir um seria abrir um nono papel semântico, que é edição de spec com linha de procedência.

---

## 7. Press — `:active`

**Hover não tem substituto no toque, porque hover não é estado: é prévia.** No toque não existe ponteiro para prever com, então a pergunta *"o que entra no lugar do hover"* pressupõe uma lacuna que não existe.

O que o toque precisa é confirmação de que o dedo chegou.

**Obrigatório, e não desejável.** O Infima declara `-webkit-tap-highlight-color: transparent` na regra de `html`: o upstream **já apagou o retorno nativo do toque**. Sem `:active` nosso, um tap em item de sidebar, link ou botão não produz reação nenhuma até a página trocar.

Três propriedades da regra:

- **mesmos valores do hover, superfície por superfície.** Zero token novo, zero valor novo — e *"os mesmos"* é literal, não aproximado: o Infima escreve o hover de cada superfície contra uma variável diferente, e o press repete o destino que o adaptador já deu a ela. Um press com tinta própria seria um terceiro estado se apresentando como confirmação do segundo;
- **instantâneo na entrada, suave na saída**, por uma declaração. A transição de entrada usa o `transition` do estado de destino, a de saída usa o da regra base. Escreve-se `none`, e não uma duração curta: duração é vocabulário de motion e não se crava, e aqui não há movimento a nomear;
- **não fica sob `(pointer: coarse)`.** Press com mouse também merece confirmação, e o highlight nativo foi apagado nos dois.

---

## 8. Toque — `(pointer: coarse)`

O espelho exato de `(hover: hover)`: mesmo eixo, lado oposto. As duas features já eram usadas pelo `theme-classic`, então nada novo entra.

### 8.1 Dois recursos do upstream morrem em silêncio no toque

| recurso | como morre | alcance |
| --- | --- | --- |
| âncora de heading | opacidade zero, volta em `*:hover > .hash-link` | `:global` no módulo de `Heading` — **classe estável** |
| botão de copiar | só visível em foco ou hover | classe de CSS Module hasheada; a âncora estável é a do bloco de código |

**Sob `(pointer: coarse)` os dois ficam visíveis sempre.** No telefone a âncora de heading é a única forma de copiar link de seção, e o botão de copiar é o recurso mais usado de um bloco de código. Os dois somem sem erro, sem aviso e **sem sintoma para quem testa no desktop**.

Achado de escopo: a âncora de heading ser `:global` faz este conserto custar uma declaração e nenhum swizzle. Se fosse classe hasheada, seria decisão cara e provavelmente perdida.

### 8.2 O piso de alvo

**Lista de exceções, não lista de alvos**, pelo mesmo critério do §2: lista de alvos falha em silêncio, e falha só para quem tem o dedo grande ou a mão trêmula.

**A exceção é uma só: link inline dentro da prosa.** A própria SC 2.5.8 o isenta, e alargá-lo quebraria o ritmo vertical da coluna de texto.

**Dissenso registrado.** O piso é a SC 2.5.5, que é AAA. O piso AA é a SC 2.5.8, e nele **nada no site mudaria** — o item de sidebar do Infima já passa. Escolher o piso AA seria escrever uma regra que não faz nada. O piso AAA muda a densidade da gaveta de sidebar no estreito, e esse é o custo, aceito porque a gaveta rola e é operada com o polegar.

**Nota de implementação medida:** elemento `inline` ignora altura mínima em silêncio. É por isso que o link do rodapé vira `inline-flex` no estreito, em [`chrome.md`](chrome.md) — sem isso o piso não alcançaria justamente a superfície mais estreita do site, e a falha seria invisível na leitura do CSS.

**`[role='option']` entrou no seletor com a busca, e entrou pelo mesmo motivo de `[role='tab']`.** Os dois são `<li>` com papel de controle: o piso escrito só para `a, button, summary` não os alcançaria, e o resultado de busca é operado com o polegar tanto quanto qualquer item de sidebar. Não é lista de alvos crescendo — é a mesma lista de **tipos de controle**, e ela cresce quando um tipo novo aparece no site, não quando um elemento novo aparece.

### 8.3 O hover que não escrevemos

A regra do projeto é que hover inteiro vive sob `@media (hover: hover)`. Ela governa o CSS que **nós** escrevemos.

**Correção medida nesta implementação:** o Infima tem **zero** ocorrências de `(hover: hover)` em todo o framework, e o `theme-classic` tem uma. A decisão de motion supunha que a feature já estava em uso nos dois. Não está — e a consequência é que o hover do framework **gruda depois do tap**: fundo de item de sidebar e cor de link de navbar ficam marcados até o dedo tocar noutro lugar.

A correção usa o mesmo mecanismo do reduced-motion: em vez de brigar seletor a seletor com código de terceiro — que seria a lista de alvos recusada no §2 —, **o adaptador neutraliza os tokens de hover do framework** sob `(hover: none)`. Nenhum `!important`, e o fundo do item **ativo** não é tocado porque vem de outra variável.

**O mecanismo tem limite, e ele vai nomeado.** Só alcança hover que o Infima escreve contra uma variável **própria de hover**. Quatro alcançam: fundo de item de sidebar, cor de link de navbar, cor de link de rodapé e borda de paginação. **Dois não alcançam:** o link do TOC e o breadcrumb são escritos contra o acento e contra o realce do item ativo, e neutralizá-los apagaria o estado ativo junto. Nos dois, o hover continua grudando depois do tap, e quem dá retorno é o `:active` do §7.

Reabre no dia em que o Infima abrir variável de hover para eles — e é o tipo de item que sobe de degrau sozinho no upgrade.

---

## 9. Skip link

O Docusaurus entrega mais do que se supunha: ele é o **primeiro filho** do layout, antes da barra de anúncio e do navbar; a marcação é `<div role="region" aria-label>` envolvendo um `<a>`; o rótulo é traduzido por chave; o alvo é `<main>` com elemento de reserva; e funciona **sem JavaScript**, pelo `href` de reserva.

**O que muda é uma linha:** o raio do sistema. Cor e sombra já vêm do adaptador. A classe do módulo é manglada e inalcançável; o atributo `href` é estável porque o id é constante exportada.

O `:focus` do upstream **fica**. Ele controla posição, não indicador, e o link só é alcançável por Tab — `:focus` e `:focus-visible` coincidem nele.

**Uma regra de conteúdo sai daqui:** a landing renderiza `<main>`. O alvo preferido é `main:first-of-type`; página de doc tem um pelo layout, página em `src/pages/` só tem se alguém escrever. Sem ele o skip link cai na reserva, que é o invólucro inteiro do layout — funciona, mas o marco de página fica errado.

**Um segundo skip link não entra.** *"Pular para a navegação"* só serve quando a navegação vem depois do conteúdo; aqui ela vem antes. Um link a mais no topo custa uma parada de Tab a todo mundo e não resolve nada.

---

## 10. Ordem de tabulação

```
skip link
  → botão de fechar da barra de anúncio
  → navbar (marca → tabs → busca → locale → GitHub → alternância de tema)
  → voltar ao topo (só quando visível)
  → sidebar
  → conteúdo
  → TOC
  → footer
```

**A ordem do DOM está correta como entregue.** O que deixou de estar correto é a relação dela com a tela — ver §10.1.

Duas observações registradas:

- o botão de voltar ao topo é `visibility: hidden` quando escondido, então não existe parada fantasma. Quando aparece, é parada **antes** da sidebar, o que é cedo para um botão que flutua embaixo à direita. Corrigir exigiria `unsafe`;
- o TOC é o último do DOM, depois do artigo e da paginação. Visualmente ele está à direita, e ordem de leitura à direita depois do conteúdo é o esperado.

### 10.1 A faixa de tabs desalinha o `Tab` da leitura visual

**É a perda que a faixa de tabs cobra, e ela não é contornável nesta rota.**

Medido em 1440 de viewport, com a faixa montada:

```
marca      @ y=0     ← linha 1
Documentação      @ y=64   ┐
Referência da API @ y=64   ├ a faixa
Receitas          @ y=64   ┘
Buscar     @ y=16    ← volta para a linha 1
PT         @ y=22
GitHub     @ y=10
tema       @ y=16
```

O `Tab` **desce para a faixa e volta a subir**. A causa é estrutural: o `Navbar/Content` emite **dois blocos** — a esquerda inteira, depois a direita inteira —, e a faixa distribui a esquerda em duas linhas. A ordem do DOM continua sendo *esquerda → direita*; o que mudou é que a esquerda agora ocupa duas alturas.

**Não é contornável por CSS.** `order` e `flex-direction` mexem na ordem *visual* e nunca na de tabulação — em teclado, o efeito seria o inverso do desejado. `tabindex` positivo é anti-padrão declarado e quebraria a ordem do documento inteiro. E os dois componentes que emitem os blocos, `Navbar/Layout` e `Navbar/Content`, são `unsafe` nas duas ações.

**Este é o único ponto do projeto onde a conta do `unsafe` voltaria à mesa**, e ele fica registrado com esse peso. Quem quiser a faixa *e* a ordem de foco alinhada precisa escrever o ADR que reabre o zero — não decidir num ticket. É o que a escotilha do [ADR 2](../adr/0002-politica-de-swizzle.md) manda.

**O que sobrevive intacto**, e é o que impede isto de ser um defeito de acessibilidade em vez de uma divergência: todo item continua alcançável por `Tab`, na ordem do documento, com anel visível e sem parada fantasma. A ordem de leitura para um leitor de tela — que segue o DOM — continua sendo a mesma de antes da faixa. **Quem paga é o leitor com visão que navega por teclado**, e paga em previsibilidade, não em alcance.

---

## 11. O portão

| # | Portão | Cadência |
| ---: | --- | --- |
| 3 | `outline` fora de `src/css/foco.css` | commit |

`npm run portao:3`. A regra não depende de ninguém lembrar dela — depende de a varredura passar.

O motivo é específico. **Este contrato não morre por alguém desenhar um anel ruim. Morre por alguém escrever `outline: none` num botão para "limpar" o visual** — a linha de CSS mais comum do mundo, que apaga acessibilidade de teclado sem sintoma visível para quem a escreveu.

A varredura cobre `src/` inteiro, inclusive CSS Module de componente: a regra universal alcança todo focável do site, e um componente que precise dizer qualquer coisa sobre foco além de *"herda"* está com o desenho errado.

**Limite conhecido, escrito em voz alta:** `grep` é orientado a linha, então uma declaração de `outline` quebrada em várias linhas escapa. Hoje não há nenhuma. O dia em que houver é o dia de normalizar espaço em branco na varredura — não de ignorar o achado.

**Uma decisão de forma que o portão obrigou:** a varredura remove **comentário** antes de olhar. Portão cobra declaração, não prosa, e um comentário que explica *"morre por alguém escrever `outline: none`"* é a documentação da regra. Sem isso, a saída correta seria apagar a explicação — que é o oposto do que este repositório quer. Vale igual para os portões 1 e 2.

---

## 12. Perdas nomeadas

**A sidebar de tela estreita não tem armadilha de foco.** O Docusaurus usa `inert` apenas entre os dois painéis internos, mais trava de rolagem do corpo. Com a gaveta aberta, o Tab escapa para a página atrás. O comentário no fonte diz `TODO Docusaurus v4: remove temporary inert workaround`, então o ponto pode mudar no upgrade — e corrigir hoje exigiria `unsafe`.

**A posição do botão de voltar ao topo na ordem de tabulação** (§10).

**A divergência entre ordem de foco e leitura visual no navbar** (§10.1) — consequência da faixa de tabs, e **o único ponto do projeto onde a conta do `unsafe` voltaria à mesa**. Não é contornável nesta rota: `order` mexe no visual e não no `Tab`, `tabindex` positivo é anti-padrão, e os dois componentes que emitem os blocos são `unsafe`.

**O hover do framework fora de `(hover: hover)`** — neutralizado por token no adaptador (§8.3), não por reescrita. **O link do TOC e o breadcrumb ficam de fora**, porque o Infima os escreve contra o acento e contra o realce do item ativo, e neutralizá-los apagaria o estado ativo junto. Nos dois, o hover gruda depois do tap e quem dá retorno é o `:active`.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `outline` em vez de camada de sombra | origem própria | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §2 — argumento de composição, não de estética |
| Regra universal com lista fechada de exceções | origem própria | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §3.2, herdando o critério de modo de falhar da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| As três exceções, e o `:has()` do bloco de código | medição de upstream | fonte de `theme-common@3.10.2` e `theme-classic@3.10.2` |
| Espessura do anel | **origem própria com âncora normativa** | SC 2.4.13 — limiar de perímetro |
| Afastamento do anel | **origem própria** | derivado do requisito do §3.1, não de medição |
| Cor do anel = acento | **origem própria com âncora normativa** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — o carimbo antigo media distância até o **Infima**, e divergir do Infima não é divergir da âncora; o piso é a SC 1.4.11 |
| Anel instantâneo | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §4 |
| Tabela de dezesseis combinações | origem própria (verificação) | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §6, reproduzindo o modelo da [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| As dezesseis células saem de um comando | **origem própria (implementação)** | `node scripts/contraste.mjs` — a divergência com [`tokens.md`](tokens.md) §10 sobreviveu a uma auditoria porque as duas cópias eram transcritas |
| `:active` com os tokens do hover | mecanismo emprestado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.1, sobre o argumento do anel |
| `(pointer: coarse)` como espelho de `(hover: hover)` | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §4.3 — o par já é usado pelo `theme-classic` |
| Piso de alvo | **origem própria com âncora normativa** | SC 2.5.5 |
| `inline` ignora altura mínima, e o rodapé vira `inline-flex` | **origem própria (implementação)** | medido ao escrever o CSS do estreito |
| Neutralizar o hover do framework pelo adaptador | **origem própria (correção)** | varredura desta implementação: o Infima tem zero `(hover: hover)`, contra o que a [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) supunha |
| Ordem de tabulação | herdado | correta como o Docusaurus entrega |
| **A divergência entre ordem de foco e leitura visual** | **lacuna por restrição** | [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) — medida com a faixa montada; o `Navbar/Content` emite dois blocos e a faixa distribui um deles em duas linhas |
| Skip link | herdado, mais uma linha de forma | WCAG G1 já implementado pelo upstream |
| Comentário fora da varredura dos portões | **origem própria (implementação)** | o portão cobra declaração, e reprovar por prosa ensinaria a escrever comentário pobre |
| Sidebar de tela estreita sem armadilha de foco | **lacuna por restrição** | `unsafe`; o fonte marca o ponto como workaround temporário |
| Espessura e afastamento das referências | **lacuna de medição** | as sete não foram medidas em foco; reabre se alguém medir |
