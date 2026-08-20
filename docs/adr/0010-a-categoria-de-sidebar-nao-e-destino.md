# ADR 10 — A categoria de sidebar não é destino, e o nível de topo é separador mudo

**Status:** aceito · slice 10 · 2026-08-19

## Contexto

[`informacao.md`](../design/informacao.md) §3.2 decidiu que **a categoria é
clicável e aponta para o índice**, e sustentou a decisão com *"três fatos
verificados na fonte"*. Lidos um a um, dois são mecânica do Docusaurus — o caret
é elemento separado do link; categoria sem link não é inerte no SSR — e o
terceiro é uma **opinião**, escrita como fato:

> Fazer o elemento mais proeminente da sidebar ser um **destino** em vez de um
> toggle é melhor.

Nenhum dos três mede a âncora. E o carimbo da linha diz isso: `origem própria`,
que a [`principios.md`](../design/principios.md) §5 define como *"a mais frágil,
e a primeira a ser contestada"*.

**A medição contesta.** Em `docs.devin.ai` — tema `mint`, a referência única da
âncora — o nó de topo é `<div class="sidebar-group-header"><h3
class="sidebar-title">`: sem link, sem `<button>`, sem `aria-expanded`, sem
seta. A documentação do Mintlify crava o comportamento em uma frase: *"Top-level
groups always expand and you cannot collapse them."* Do segundo nível para
baixo o nó é `<button aria-expanded>`, com ícone à esquerda, rótulo, e o chevron
**colado ao rótulo** — o botão não tem `justify-between`, e é por isso que a
seta não vai à borda.

**Uma segunda linha da spec cai junto, e essa é mais grave.** `collapsed: false`
está carimbado **`herdado`**, com a fonte *"a âncora mostra a árvore aberta"*.
A medição diz que a âncora mostra o **nível 1** aberto — e ele nem colapsa —,
enquanto grupo aninhado nasce **fechado** e abre sozinho no ramo da página
atual. `herdado` significa *não toca*; um `herdado` falso congela uma decisão que
ninguém tomou, e é o defeito mais caro que esta spec pode carregar.

**E o teto de profundidade não tinha lastro.** Ele é 3, carimbado `origem
própria (correção)`, e [`chrome.md`](../design/chrome.md) §4 registrava o
dissenso de que *"aprofundar mais reabre este número"* — o número sendo
`--sd-sidebar-width`, 288px. Medido: a sidebar do Devin e a do
`docs.windsurf.com` têm **`w-[18rem]`, os mesmos 288px**, e o windsurf — também
tema `mint`, mesma dona, mesma cor primária — segura **cinco níveis** dentro
deles. O Mintlify não declara teto numérico de aninhamento; a única regra é
homogeneidade de tipo entre irmãos. O 288 não reabre.

O gatilho de tudo isto é o
[`overpower`](0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md):
uma ferramenta real com seis seções entra em `Ferramentas › Bibliotecas`, e a
árvore precisa de um nível a mais. Mas nenhuma das três correções acima depende
dele — as três estavam erradas antes.

## Decisão

### a) O nível de topo é **separador**

Sem página, sem link, sem seta, sem ícone, e **sempre aberto**. Ele é um rótulo
em negrito cuja única função é agrupar. Em `sidebars-*.js` isso é
`collapsible: false` mais ausência de `link`.

O termo é **separador**, e ele entra no vocabulário do domínio. `categoria`
continua existindo e passa a significar só o que está do segundo nível para
baixo.

### b) Do segundo nível para baixo, o nó aponta para a própria abertura

Colapsável, clicável, com ícone, e ele **nasce fechado** — o Docusaurus abre o
ramo da página atual sozinho. É o único lugar do sistema onde a seta tem função,
e é por isso que ela só existe aí.

### c) A forma *índice de categoria* morre, e sete páginas saem com ela

`Bibliotecas`, `Módulos Terraform`, `Skills`, `Servidores MCP`, `Esteiras`,
`Infraestrutura` e `Acessos` perdem o índice. O conteúdo delas era *a lista do
que está logo abaixo*, e a sidebar já é essa lista — a redundância é o que a
âncora não tem.

### d) O que carrega tipo ou fixture sobrevive **como folha**

Quatro páginas não eram forma, eram conteúdo com dona, e ganham linha própria na
sidebar em vez de morrer:

| Página | Por que sobrevive |
| --- | --- |
| `Ambiente › Índice` | fixture `pagina-muito-curta` **e** a única exceção nomeada da regra de heading |
| `Diagnóstico › Índice de sintomas` | carrega `Troubleshooting` de verdade |
| `API Owner › Índice` | é o décimo tipo de página |
| `Security Champion › Índice` | é o décimo tipo **e** a fixture `prosa-pura` |

Matá-las custaria um tipo de página, duas das onze fixtures e a exceção de
heading — quatro invariantes derrubadas para poupar quatro arquivos.

**A assimetria que sobra é medida, não descuido:** no Devin, `Get Started` abre
com a folha `Introducing Devin` e outros grupos não têm folha de abertura
nenhuma.

### e) O ícone: nenhum no separador, todos abaixo dele

A regra passa a ser **nenhum ícone no separador; ícone em tudo abaixo, em
qualquer nível, folha ou grupo**. Ela substitui a redação da
[#97](https://github.com/ThiagoPanini/panlabs-docs/issues/97) — *toda
folha, nenhum cabeçalho de grupo* —, que dava ícone à folha e negava ao nó
intermediário.

É a terceira redação desta regra, e é a primeira **agnóstica de profundidade**: o
teste é *"isto é o separador de topo?"*, e ele tem resposta em qualquer árvore.
As duas anteriores tinham teste que mudava de resultado com o nível, e foi isso —
não o teto — que travou o nível 3 por duas issues.

Bate com a medição: `<h3>` de topo sem ícone, botão de subgrupo **com** ícone.

### f) A rampa de recuo é a da âncora

**16 · 16 · 28 · 40 · 52** — separador e primeiro nível encostados, e +12px por
degrau daí em diante. Substitui os +16px por nível, que nunca foram medidos: a
#97 preservou *"o mesmo total que a soma antiga já dava"*, e essa soma é o default
do Infima. O `16px` publicado como alvo `exato` é o **base**, e ele bate com a
âncora; o passo por nível não tem sonda de paridade nenhuma.

Consequência que vale declarar: em `Jornadas` e `Procedimentos` as folhas descem
de 32px para 16px e ficam **alinhadas** com o separador. Quem separa passa a ser
o negrito do separador mais o ícone da folha.

### g) O teto de profundidade sobe para 4, e é confinado

Quatro, e o portão 4 deixa de cobrar *"usado uma vez"* — passa a cobrar
**confinado a um ramo**. O ramo será `Ferramentas › Bibliotecas › overpower`,
com 13 folhas no nível 4.

> **§g é prospectivo, e é o único desta ADR que é.** A [#114](https://github.com/ThiagoPanini/panlabs-docs/issues/114)
> implementou §a a §f e §h, e deixou o teto em **3**: teto de 4 sem nenhum uso é
> teto sem consumidor, que é o defeito que este próprio parágrafo nomeia dois
> parágrafos abaixo. A subida viaja com o port do `overpower`, e até lá o
> `sidebars-ferramentas.js` e a [`informacao.md`](../design/informacao.md) §3.1
> dizem 3.

Teto de 5 seria teto sem consumidor. Teto ausente seria pior: *"um teto que se
declara e não se confere é um teto que sobe sozinho"*, e sem número não há o que
conferir.

### h) A rota nua de cada aba resolve por `slug`

A primeira folha de cada instância recebe `slug: /`, e `/jornadas`,
`/procedimentos` e `/ferramentas` passam a ser páginas de verdade em vez de
redirecionamento ou 404. O portão 6 passa a conferir 200 nas três.

## Consequências

1. **O separador é inerte de verdade, e sem swizzle.** Lido no fonte
   (`theme-classic/lib/theme/DocSidebarItem/Category/index.js`):
   `useCategoryHrefWithSSRFallback` devolve `undefined` quando `!item.collapsible`,
   **nos dois lados** — SSR e navegador —, então o rótulo sai como `<a>` sem
   `href`, sem caret e sem `CollapseButton`. É o análogo exato do `<h3>` da
   âncora, e não custa `pointer-events` nem componente.
2. **A seta continua sendo `<button class="menu__caret">`, e o conflito com a
   pílula continua de pé.** O mesmo fonte condiciona as duas formas de DOM, e
   elas são mutuamente exclusivas: `'menu__link--sublist-caret': !href && collapsible`
   põe o caret num `::after` do próprio link **só quando a categoria não tem
   página**; `{href && collapsible && <CollapseButton …>}` emite o botão irmão
   **quando tem**. Como a decisão §b) mantém a página de abertura no nó de nível
   2 para baixo, é a segunda forma que vale. A migração da pílula para
   `.menu__list-item-collapsible` — para o link parar de crescer e a seta colar
   no texto — **continua sendo o trabalho**, e ela é `herdado`: na âncora a linha
   inteira é um `<button>` só. O seletor precisa excluir o separador, que também
   é embrulhado por `.menu__list-item-collapsible` e não deve ganhar realce de
   linha, por ser inerte.
3. **O manifesto de ícones para de mentir.** `src/icons/manifest.js` e
   [`icones.md`](../design/icones.md) §5 afirmam que `chevron-right` serve o
   *"caret de categoria de sidebar"*, e **nenhuma regra do repositório
   implementa isso** — hoje é o SVG embutido do Infima pintado por
   `filter: invert()`, sem `currentColor`. A afirmação passa a ser verdadeira.
4. **Três seções da spec são reescritas**, não emendadas: `informacao.md` §3.2,
   §3.3 e §6.3.
5. **O décimo tipo muda de definição.** *"O destino da categoria clicável — não é
   linha própria na sidebar"* deixa de valer nas duas metades: ele passa a ser a
   **folha de abertura** do separador, com linha própria.
6. **A raiz do site não muda de página, e muda de URL.** `src/pages/index.js`,
   constante `DESTINO`, apontava para `/jornadas/api-owner/indice`. A página é a
   mesma e continua existindo — como folha —, mas a decisão (h) lhe dá `slug: /`,
   e a URL dela passa a ser `/jornadas`. A constante segue a rota nua.

   O argumento que escolheu o destino encolheu junto: metade dele era *"é o
   destino do rótulo da categoria"*, e essa metade some. O que sobra é melhor —
   o alvo passa a ser a **instância**, não a página, e trocar qual folha abre a
   aba deixa de exigir edição em `src/pages/index.js`.
7. **`informacao.md` §3.4 continua valendo e fica sem sujeito.** *"Categoria sem
   filhos vira link"* descreve uma normalização do Docusaurus que nenhum nó do
   site exercita; era `cobertura sem fixture` antes e continua sendo.
8. **Nada disto custa swizzle.** O orçamento `unsafe` do
   [ADR 2](0002-politica-de-swizzle.md) continua em zero: separador é
   `collapsible: false` em `sidebars-*.js` (degrau 1), recuo e seta são classes
   do Infima e do `ThemeClassNames` (degraus 0 e 1), e `slug` é front matter.

## Alternativas descartadas

**Aplicar a regra só ao nível 1 e deixar o resto como está.** Produz uma regra
que muda de comportamento com a profundidade, que é exatamente o defeito da
redação *"obrigatório na categoria de topo, ausente na folha"* — ela travou o
nível 3 por duas issues porque não tinha leitura no nó do meio.

**Manter todas as onze páginas de índice, viradas em folha.** Não derruba nada e
não custa nada, e por isso mesmo não resolve: as sete que só listam o que está
abaixo continuariam ali, e elas são a redundância que motivou a decisão.

**Matar as onze.** Custaria o décimo tipo, duas fixtures e a exceção de heading.

**Manter `collapsed: false` em tudo e só embelezar a seta.** Deixa a seta como
enfeite numa linha que nunca colapsa. Com o `overpower` dentro, `Ferramentas`
renderizaria 31 linhas abertas contra as ~20 do modelo da âncora.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O nível de topo não é link, não colapsa e não tem seta | herdado | `docs.devin.ai` — `<h3 class="sidebar-title">` sem link nem `aria-expanded`; e `mintlify.com/docs/organize/navigation`, *"Top-level groups always expand and you cannot collapse them"* |
| Do segundo nível para baixo o nó é colapsável e aponta para a abertura | herdado | `docs.devin.ai` — `<button aria-expanded>`, e o ramo da página atual abre sozinho |
| Grupo aninhado nasce fechado | **herdado (correção)** | a linha anterior estava carimbada `herdado` com a fonte *"a âncora mostra a árvore aberta"*, verdadeira só do nível 1 |
| A categoria deixa de ser destino | **origem própria (correção)** | `informacao.md` §3.2 sustentava a decisão anterior num *"fato verificado"* que era opinião — *"ser destino é melhor"* |
| A forma *índice de categoria* morre | **origem própria (consequência)** | sem categoria clicável não há destino a que o índice sirva |
| Quatro índices sobrevivem como folha | **origem própria** | são as que carregam tipo ou fixture, e matá-las derrubaria quatro invariantes |
| Ícone: nenhum no separador, todos abaixo | herdado | `docs.devin.ai` — `<h3>` de topo sem ícone, botão de subgrupo com `mask-image` à esquerda |
| Rampa 16 · 16 · 28 · 40 · 52 | **herdado (medição)** | `docs.devin.ai` e `docs.windsurf.com`, `padding-left` inline por nível; o passo de +16px anterior era o default do Infima e não tinha sonda |
| O teto de profundidade sobe para 4 | **herdado (medição)** | o Mintlify não declara teto, e `docs.windsurf.com` — também tema `mint` — usa cinco níveis |
| O número 4, e não 5 nem nenhum | **origem própria (consequência)** | é a profundidade que a árvore usa; teto acima do uso é teto sem consumidor |
| `--sd-sidebar-width` não reabre | **herdado (medição)** | `w-[18rem]` = 288px nos dois sites medidos, e o windsurf segura cinco níveis dentro deles |
| A rota nua resolve por `slug: /` | **origem própria (implementação)** | o `docSidebar` já leva à primeira doc; o que não resolve sozinho é a rota digitada |
| A seta colada ao rótulo | herdado | `docs.devin.ai` — chevron depois do rótulo a `gap-x-3`, `currentColor`, traço 2, `rotate-90` ao abrir em 75ms, sem trilho vertical. **O `::after` do link é a forma errada**: ele só existe quando a categoria NÃO tem página (`menu__link--sublist-caret`), e a decisão (b) mantém a página de abertura — a forma que vale é o `<button class="menu__caret">` irmão, como a consequência 2 registra |
