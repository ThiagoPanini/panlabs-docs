# Swizzle

O ledger vivo, as perdas nomeadas e a disciplina de registro.

**Este documento é para quem faz o upgrade do Docusaurus.** Ele não descreve aparência: descreve o que precisa ser reconciliado e por quê. É por isso que ele não mora em [`chrome.md`](chrome.md) — o ledger atravessa chrome, componentes de conteúdo e Referência da API, e quem o lê não deveria ter que abrir um documento de design para achar a lista.

A **política** — a escada de seis degraus, o orçamento `unsafe` zero, a escotilha por ADR novo — mora no [ADR 2](../adr/0002-politica-de-swizzle.md), porque sobrevive à troca de skin. Este documento **cita** e nunca repete.

**Documento reaberto** pela geometria `mint`, e ele fecha de novo quando o `swizzle --list` for recongelado no fim da reconstrução. O que a reabertura trouxe está em três linhas, e as três mudam o inventário e não a política:

- **a perda 4 sai** — a faixa de tabs de largura total **não** exigia reestruturar `Navbar/*`, e isso está medido. Ver §4 e a errata do [ADR 2](../adr/0002-politica-de-swizzle.md);
- **o registro de `MDXComponents` ganha superfície nova no mesmo degrau** — ele passa a redefinir um elemento de HTML para *acrescentar nó*. Ver §3;
- **uma entrada de degrau 3 é APOSENTADA, e é a primeira vez que isso acontece.** A marca ficou só com a palavra, e com ela morreram o componente de tema próprio que a desenhava e a chave que o registrava. Ver §3 e §3.1.

**O orçamento `unsafe` continua em zero, e o degrau 4 continua vazio.**

---

## 1. A escada, em uma tabela

Repetida aqui em forma mínima, porque o ledger a referencia em toda linha. A íntegra, com o motivo de cada degrau, está no [ADR 2](../adr/0002-politica-de-swizzle.md).

| # | Degrau | O que custa no upgrade |
| --- | --- | --- |
| 0 | Variável do Infima | nada |
| 1 | Classe estável | nada |
| 2 | Opção pública | nada |
| 3 | Registro `safe` escrito à mão | chave nova ou removida — **erro de build** |
| 4 | `swizzle --wrap` em componente `safe` | mudança de props — **erro de build** |
| 5 | `swizzle --eject` em componente `safe` | reconciliação manual; correção upstream **não chega, e nada avisa** |
| — | `unsafe` | **proibido** |

**Desce-se um degrau só quando o de cima comprovadamente não alcança**, e o motivo vai escrito na última coluna do ledger. É essa coluna que permite **promover** um item no upgrade: um degrau que passou a alcançar é um item que sobe.

---

## 2. Três coisas diferentes moram em `src/theme/`

Chamar todas de swizzle esconde a diferença, e a diferença é o acoplamento inteiro.

| Termo | O que é | Acoplamento |
| --- | --- | --- |
| **Swizzle** | envolve ou substitui um componente que o `theme-classic` **já tem** | à assinatura de props, ou à implementação inteira |
| **Componente de tema próprio** | um componente que o `theme-classic` **não tem**, registrado por opção pública | **nenhum** — o Docusaurus só conhece o nome que a config deu |
| **Registro** | um **objeto**, não um componente. Espalha-se o original e acrescentam-se chaves | **nenhum** para o que a gente acrescenta; erro de build se o upstream mudar as chaves |

Hoje `src/theme/` tem os três, e **um só é swizzle**:

```
src/theme/ApiDocItem/            componente de tema próprio  (degrau 2)
src/theme/NavbarItem/ComponentTypes.js   registro            (SEM customização — ver §3.1)
src/theme/MDXComponents/index.js         registro            (degrau 3)
src/theme/Admonition/Types.js            registro            (degrau 3)
src/theme/SearchBar/                     SWIZZLE, --eject    (degrau 5)
```

**São nove arquivos, e eram dez.** `NavbarItem/Marca.js` saiu inteiro.

O `SearchBar` entrou no slice 7 e é o **primeiro e único** swizzle do repositório. Ele tem uma propriedade que nenhum outro degrau 5 teria: ver §3.

Os componentes do catálogo de conteúdo **não moram em `src/theme/`** — moram em
`src/components/`, e o que os alcança são os dois registros acima. É a diferença
que a tabela nomeia: um registro é um objeto, e um objeto pode apontar para
qualquer componente, inclusive um que o Docusaurus nunca viu.

---

## 3. O ledger

Uma linha por customização, com o degrau e **por que o degrau acima não alcançou**.

### Degrau 0 — variável do Infima

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| O adaptador inteiro, em `tokens.css` | cor, tipografia, espaço, forma, elevação, motion, navbar, sidebar, TOC, breadcrumb, paginação, footer, barra de rolagem | — é o degrau mais alto |
| Neutralização dos tokens de hover sob `(hover: none)` | mata o hover grudado do framework no toque | — |

### Degrau 1 — classe estável

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| `main`, `.container`, `.row`, `.col`, `.col--3` | a cadeia de proporções: gutter, colunas sem preenchimento, separação do TOC, e a **caixa invisível** que segura a coluna sem TOC | não existe variável do Infima para nada disso |
| `article`, `.pagination-nav` | a medida de prosa. **Dois seletores no lugar de onze** — a lista de elementos de prosa morreu junto com o cartão, e com ela a superfície que produzia o defeito do `<header>` | idem |
| `.markdown > :is(h2…h6)` | o ritmo vertical assimétrico, 48 antes e 16 depois | as variáveis de ritmo do Infima são declaradas dentro de `.markdown`, e valor declarado no elemento vence valor herdado de `:root` — reescrevê-las fora do adaptador abriria uma sexta exceção com escopo contra o [ADR 1](../adr/0001-doutrina-de-css.md) |
| `.navbar`, `.navbar__inner`, `.navbar__items`, `.navbar__brand`, `.navbar__item` | **a faixa de tabs**: a quebra de linha, a altura determinada da linha 1 e o sangramento por gradiente | `Navbar/Layout` e `Navbar/Content` são `unsafe` nas duas ações, e o degrau 0 só entrega a ALTURA do topo — a anatomia de duas linhas não tem variável |
| `.breadcrumbs__item`, `.breadcrumbs__link` | **a eyebrow por subtração**: home, ativo e o separador que sobra saem, e resta o nome da categoria | `DocBreadcrumbs` é `unsafe`; as variáveis de breadcrumb do Infima alcançam tinta e preenchimento, não presença |
| `.pagination-nav__link`, `.pagination-nav__sublabel`, `.pagination-nav__label` | a paginação plana: sem borda, sem fundo, sem preenchimento | idem — não há variável que remova a borda sem apagar a cor dela |
| `.theme-doc-toc-mobile` | o TOC móvel sai no estreito | não há opção que desligue só o móvel; `hide_table_of_contents` desligaria os dois |
| `.sd-subtitulo` | o corpo e o recuo do subtítulo | a classe é **nossa**, publicada pelo registro do §3 — aqui o degrau 1 é consumidor, não alcance |
| `className` em `sidebars*.js` | ícone por categoria de topo, por máscara | `className` **é** o mecanismo público; não há variável |
| `theme-doc-sidebar-item-*-level-<n>` | hierarquia da sidebar | idem |
| `.menu__link--active` | falso-negrito no item ativo | não há variável de peso por estado |
| `.footer`, `.footer__links`, `.footer__link-item`, `.footer__link-separator`, `.container`, `.text--center` | a linha única, o fio, o alinhamento à coluna de doc, o comportamento no estreito | as sete variáveis de footer do Infima não alcançam anatomia |
| `.footer__link-item > svg` | esconde o ícone de link externo | `Icon/ExternalLink` é `unsafe` e vem de sprite — ver §4 |
| `.navbar__brand:empty` | esconde o link vazio que o upstream renderiza sem `navbar.title` | não há opção para não renderizar |
| `.theme-back-to-top-button`, `.theme-doc-card-container`, `.theme-code-block button` | corrige os três `transition: all` que animam o anel de foco | a variável de transição do Infima controla duração, não a lista de propriedades |
| `.hash-link`, `.theme-code-block button` sob `(pointer: coarse)` | torna visível o que o upstream esconde atrás de hover | idem |
| `a[href='#__docusaurus_skipToContent_fallback']` | dá ao skip link a forma do sistema | a classe do módulo é manglada; o `href` é estável porque o id é constante exportada |

### Degrau 2 — opção pública

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| Três instâncias de `plugin-content-docs` | as três tabs, cada uma com `routeBasePath` e sidebar próprios | `routeBasePath` é por instância; classe não cria rota |
| `themeConfig.navbar.items` | as três tabs, o slot de busca, o locale, o GitHub | idem |
| `navbar.items[]` do tipo `html` | **o espaçador que abre a faixa de tabs** — base 100%, altura 0. Escolhido em vez de dar `flex-basis: 100%` à marca porque não acopla a faixa à existência de uma marca | não há classe estável num nó que o tema não renderiza; o item é o que cria o nó |
| `themeConfig.footer` | os links, o copyright, a forma plana | idem |
| `docItemComponent: '@theme/ApiDocItem'` | substitui o layout inteiro da página de API | classe não troca componente de rota |
| `themeConfig.prism.additionalLanguages: ['bash']` | registra `bash` para o snippet de cURL do painel da Referência da API | `bash` não está no bundle padrão do `prism-react-renderer`; sem o registro o bloco sai sem realce e ninguém avisa |
| `themeConfig.prism.theme` | paleta de sintaxe que só referencia token | `--prism-background-color` é injetada em estilo **inline**, e nenhum seletor vence estilo inline |
| `localeConfigs[*].label` | o rótulo curto do seletor de idioma | o default vem de `Intl.DisplayNames`, em código |

### Degrau 3 — registro escrito à mão

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| `MDXComponents` | registra os treze componentes com tag própria (catorze chaves — `steps` tem duas), mais `Tabs`/`TabItem`, mais **duas** chaves de elemento: `table` e `h1` | `.md` de conteúdo não deve importar nada, e não há opção pública que acrescente componente ao escopo do MDX. O próprio `getSwizzleConfig` diz *"meant to be ejected"* |
| `MDXComponents.h1` — **superfície nova** | **o subtítulo**, injetado abaixo do título a partir de `frontMatter.description` | injetar nó no corpo da página exige `DocItem/Layout` ou `DocItem/Content`, os dois `unsafe` — é a perda 1. Ancorar no `<h1>` alcança, e a condição está conferida: 73 de 73 páginas escrevem o próprio `# Título`, e nenhuma escreve dois |
| `Admonition/Types` | substitui a anatomia vertical do Infima pela horizontal medida, nas quatro variantes de callout | não há variável nem classe que reoriente o eixo da admonition. O degrau 5 (`Admonition/Layout`) alcançaria, mas o 3 alcança **antes**: o arquivo é um objeto, e nada obriga as entradas dele a apontarem para o layout do upstream |

### 3.1 A entrada aposentada — `NavbarItem/ComponentTypes`

**A primeira linha que este ledger perde por remoção de customização, e não por promoção de degrau.**

Ela dizia: *acrescenta o tipo `custom-marca`; a marca precisa de `currentColor`, e `navbar.logo` renderiza `<img>`*. Nada disso é falso — mas a marca **deixou de ter glifo**. Ela ficou só com a palavra, monocromática na cor de texto do navbar, e a rota passou a ser `themeConfig.navbar.title` renderizando no `.navbar__brand` nativo, que é **degrau 2**. Sem `<img>` no caminho, o argumento inteiro do degrau 3 perdeu o assunto. Ver [`icones.md`](icones.md) §3.

O que sai junto:

- `src/theme/NavbarItem/Marca.js` — **um arquivo a menos em `src/theme/`**, e o portão 7 passa com nove;
- a chave `custom-marca` do registro, que era a única nossa. O objeto voltou a ser idêntico ao do upstream;
- a declaração `.navbar__brand:empty` de `chrome.css`, que escondia o link vazio que o upstream renderizava sem `title`. Ele não é mais vazio.

**O arquivo do registro fica, e a entrada dele não.** A regra deste documento é *um item sai quando a customização é removida*, e aqui não há mais nenhuma: o objeto é espalhado sem acréscimo. Ele continua sendo o ponto de extensão já ejetado do navbar, e o portão 7 continua casando o nome dele com a lista congelada — mas ledger é inventário do que **existe**, não do que já foi.

> **A rota foi medida, contra a resolução que a declarava provável.** A resolução deste ticket registrava a rota como *"provável e não medida"*. Ela foi medida em Chrome headless, nas duas preferências de esquema de cor: o `.navbar__brand` renderiza `<b class="navbar__title">panlabs</b>`, com **zero `<svg>` e zero `<img>`** dentro, e a palavra resolve para `250,242,249` no escuro e `15,10,15` no claro — os dois iguais a `--sd-text-strong` no pixel, e nenhum igual ao acento. A tabela está em [`icones.md`](icones.md) §3. O carimbo sobe de *origem própria* para **origem própria (medição)** — que é a única forma honesta de fechar uma linha que a spec pediu para deixar aberta.

**Os dois do catálogo copiam zero linha de upstream**, e é isso que os mantém no
degrau 3: um espalha o objeto original e acrescenta chaves; o outro é escrito do
zero apontando para componentes nossos. O `Admonition` raiz — `unsafe` — continua
**intocado**.

**A superfície nova, nomeada.** Até a geometria `mint`, este registro só
*acrescentava chave de componente* e trocava um elemento por outro (`table`).
O `h1` é a primeira vez que ele **redefine um elemento de HTML para acrescentar
nó**: o override envolve o `h1` do upstream e devolve um irmão junto.

Não é degrau novo — continua sendo objeto espalhado, e o que o upgrade cobra
continua sendo *chave removida vira erro de build*. Mas é **uso novo do mesmo
degrau**, e por isso tem linha própria: quem ler a tabela procurando o que
mudou na tela precisa achar o subtítulo aqui, não deduzi-lo da palavra
*"registro"*.

**O portão 7 continua passando porque nenhum arquivo novo entra em
`src/theme/`** — o componente do subtítulo mora dentro do próprio registro.
Fatorá-lo para um arquivo ao lado seria trocar quinze linhas por uma linha nova
na perna 2 do portão. **E ele passa com um arquivo a MENOS**, pela §3.1.

**Pré-autorizados e ainda não exercidos:** `prism-include-languages`, se a
Referência da API precisar de linguagem fora do que `additionalLanguages` cobre.

### Degrau 4 — `--wrap`

**Vazio, e é resultado, não coincidência.**

**A reserva que ele carregava foi cancelada, e não gasta.** Este parágrafo dizia que a faixa de tabs de largura total *"sairia por envolver `DocSidebar` (`wrap: safe`)"*. Duas coisas estavam erradas nessa frase, e as duas foram medidas na [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51):

- **`DocSidebar` não alcançaria.** Ele é a sidebar de docs, e não tem como emitir uma faixa dentro do `<nav>`. A rota reservada nunca teria funcionado;
- **a faixa não precisa de degrau 4 nenhum.** Ela sai de degraus 0, 1 e 2, e está montada.

O degrau 4 continua vazio, e agora por um motivo mais forte que antes: não é que a faixa não foi comprada — é que **ela não custa isto**.

**Continua vazio depois do slice da landing, e ali ele teve a segunda chance de ser gasto.** Um footer com variante para a landing — outra tinta, outra anatomia, ou a faixa escura descendo até o fim da página — sairia por envolver `Footer`, que é `safe` nas duas ações. Não foi comprado: **o footer da landing é o mesmo da doc, sem variante**, e o motivo está em [`landing.md`](landing.md) §5 — ilha que aparece em toda página deixa de ser ilha.

### Degrau 5 — `--eject`

**Uma linha, e ela é o único swizzle do repositório.**

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| `SearchBar` | a busca inteira — o gatilho do navbar e o modal | o `theme-classic` **não tem** busca. O componente dele é `export {default} from '@docusaurus/Noop'`, e não há variável, classe, opção pública nem registro que faça um `Noop` virar um modal |

**Ele copia zero linha de upstream, e isso é fato e não disciplina.** O degrau 5 costuma carregar a dívida de reconciliar uma implementação de terceiro a cada upgrade; aqui não há implementação a reconciliar. O `theme-classic` não tem busca — ele tem o **ponto de extensão**, e o que ejetamos é uma linha que devolve `null`.

Consequência para o upgrade: a correção upstream que *"não chega e nada avisa"* — a dívida que define o degrau 5 — **não existe neste caso**, porque não há upstream. O que pode mudar é o **nome** do componente, e quem pega isso é o portão 7 (§5).

Pré-autorizados e ainda não exercidos: os ícones de chrome que são `safe` nas duas ações (`Icon/Arrow`, `Icon/DarkMode`, `Icon/LightMode`, `Icon/Edit`, `Icon/Menu`).

**Os cinco `Admonition/Icon/*` saem da lista de pré-autorizados sem serem gastos.** [`icones.md`](icones.md) §4.2 mandava a troca dos ícones alcançáveis para o slice do catálogo, contando com `--eject` nos de admonition. Não foi preciso: o callout tem DOM próprio desde que `Admonition/Types` passou a apontar para ele, e ele desenha os glifos do manifesto direto. **Um degrau 5 pré-autorizado que se resolve no degrau 3 é o resultado que a escada existe para produzir.**

**Os cinco de chrome continuam pré-autorizados e não exercidos.** Eles são chrome, não catálogo, e o slice do catálogo fechou a superfície de swizzle dele em duas linhas de degrau 3. Trocá-los é `--eject` de cinco arquivos por estética de glifo, e a conta é de quem abrir o slice que os quiser.

### `unsafe`

**Zero, e desde o slice 7 isso deixou de ser afirmação: é saída de portão.** O portão 7 (§5) percorre `src/theme/`, casa cada arquivo com o `swizzle --list` congelado, e reprova se algum deles cair sobre um componente cuja ação de `eject` não seja `Safe`. A varredura de hoje: **220 componentes no artefato, 9 arquivos em `src/theme/` com endereço, zero `unsafe`.**

O slice do catálogo era o que tinha mais chance de gastar o orçamento, e não gastou. Os dois `unsafe` que ele encostou continuam de pé: o `Admonition` raiz, que despacha por tipo para o registro sem saber que o destino é nosso, e o `Tabs`, que é consumido como está e repaginado só por CSS.

**O slice da busca gastou o degrau 5 sem encostar no orçamento**, e é o resultado que a escada existe para produzir: o degrau mais fundo foi para o único lugar onde os degraus acima comprovadamente não alcançam, e o `unsafe` continua intacto.

**O slice da árvore REMOVEU uma linha e não acrescentou nenhuma**, o que é o resultado mais raro que este ledger já produziu: 46 páginas autorais, três instâncias novas, um manifesto de ícones reescrito e uma marca trocada saíram sem custar um degrau. A árvore é config e conteúdo; a marca desceu de degrau em vez de subir; e o `docItemComponent` da segunda instância é a mesma opção pública que a primeira já usava.

**O slice da landing não acrescentou uma linha a este ledger, e isso é o resultado esperado.** Uma landing inteira — quatro seções, faixa de espetáculo de dois focos, três camadas de profundidade, um loop ambiente e um reveal por rolagem — sai de uma rota em `src/pages/`, um CSS Module e três `@keyframes` na folha global. Nada disso é customização de componente do tema: `plugin-content-pages` já vem no preset, e uma rota própria não envolve, não substitui e não ejeta nada. O único gancho que a landing usa fora do CSS dela é `data-sd-component`, que é **contrato nosso**, publicado pelo catálogo.

---

## 4. As perdas nomeadas

O zero cobra um preço, e cada linha é perda escrita — não silêncio.

**Eram dez. São nove, e a numeração não foi remendada** — os sobreviventes ficam com o número que já tinham. Renumerar uma lista citada por outro documento para fechar um buraco é o mesmo churn que este arquivo recusou ao decidir que o portão do `swizzle --list` é o 7 e não o 5.

| # | Perda | Componente que a obriga | Onde ela aparece |
| ---: | --- | --- | --- |
| 1 | Qualquer nó injetado **dentro** do corpo da página de doc — bloco de feedback, CTA lateral | `DocItem/Layout`, `DocItem/Content` | [`chrome.md`](chrome.md) §10 |
| 2 | Breadcrumb reestruturado — eyebrow em página **sem** categoria, ordem trocada, texto novo | `DocBreadcrumbs` | [`chrome.md`](chrome.md) §7.1 |
| 3 | A proporção da âncora entre conteúdo e painel | classe hasheada de CSS Module | [`chrome.md`](chrome.md) §5 |
| ~~4~~ | ~~Faixa de tabs de largura total abaixo do navbar~~ | — | **removida** — ver abaixo |
| 5 | TOC com anatomia nova — barra de progresso, seções extras | `TOC`, `TOCItems` | [`chrome.md`](chrome.md) §5 |
| 6 | Ícone preso dentro de componente `unsafe` mantém o desenho do Docusaurus | vários; `Icon/ExternalLink` é o caso concreto | [`icones.md`](icones.md) §4.2 |
| 7 | Footer dentro da coluna de prosa, como a âncora faz | `<Footer/>` é irmão do `main-wrapper` | [`chrome.md`](chrome.md) §8.3 |
| 8 | Armadilha de foco na sidebar de tela estreita | `Navbar/MobileSidebar/*` | [`foco.md`](foco.md) §12 |
| 9 | Posição do botão de voltar ao topo na ordem de tabulação | `DocRoot/Layout` | [`foco.md`](foco.md) §10 |
| 10 | O controle de página AI-era — *Copiar página* e deep-link para assistente | `DocItem/Layout` | fora **por produto**, não por preço |

### A perda 4 sai, e não por ter sido comprada

Ela era **fato errado**. O ledger dizia que a faixa de tabs de largura total exigia reestruturar `Navbar/*`; a [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) mediu num Docusaurus 3.10.2 real e a faixa sai de **degraus 0, 1 e 2** — dois tokens do Infima, quatro regras sobre classes estáveis e um item de config.

`Navbar/Layout` e `Navbar/Content` **continuam `unsafe` nas duas ações**, e continuam **intocados**. O detalhe que muda como se lê o rótulo: o `getSwizzleConfig` do `theme-classic` não tem entrada nenhuma para eles — caem no default `unsafe` do CLI. É **ausência de declaração**, não aviso deliberado, e é o que explica a vizinhança inteira do navbar ser `Unsafe` em bloco.

**O portão 7 passa com a faixa montada**, não depois de desmontá-la. A anatomia está em [`chrome.md`](chrome.md) §3.1, e a perda que ela **de fato** cobra — a ordem de foco divergindo da leitura visual — está em [`foco.md`](foco.md) §10, não aqui: ela não é perda de swizzle.

A mesma errata está no [ADR 2](../adr/0002-politica-de-swizzle.md), «Consequências» item 4.

### Duas perdas encolheram sem sair

**A perda 1 perdeu o subtítulo.** Ela dizia *"qualquer nó injetado dentro do corpo da página — eyebrow, bloco de feedback, CTA lateral"*, e o subtítulo é exatamente um nó injetado dentro do corpo. Ele foi comprado sem encostar em `DocItem/Layout`: a rota é o override de `h1` do §3, ancorado num nó que a página já escreve. **O que a perda 1 de fato cobre é nó injetado numa posição que o MDX não alcança** — antes do breadcrumb, depois da paginação, ao lado da coluna.

**A perda 2 perdeu a eyebrow visível.** Escondendo três coisas com classe do Infima, o breadcrumb *lê* como eyebrow. O que fica de perda é o **mecanismo**: página sem categoria não ganha eyebrow, a ordem não muda, e texto novo não entra.

**A perda 6 é a que a regra resolve sem enumerar:** *o que só é alcançável por `unsafe` não é trocado.* Não há lista a manter.

**A perda 10 tem nota própria, e ela importa para o orçamento.** O recurso saiu por decisão de produto, e a rota `safe` fica registrada: ancorar o controle no `<h1>` via `MDXComponents` (degrau 3) alcança, desde que toda página escreva o próprio `# Título`. **O zero de `unsafe` não é comprado com o sacrifício desse recurso** — mesmo que ele voltasse, caberia no degrau 3.

**E a rota agora tem precedente exercido, não só registrado.** O subtítulo é essa mesma rota, montada e medida. Quem reabrir a perda 10 não precisa mais confiar na frase: pode ler o `h1` do §3.

**Perdas fora do alcance do adaptador**, que não são de swizzle mas envelhecem junto: as curvas de easing cravadas no CSS do navbar e a curva da transição de largura da sidebar. Elas estão em [`motion.md`](motion.md).

---

## 5. A disciplina de registro

Quatro peças, e a primeira detecta problema **antes de haver sintoma**.

**1. `swizzle --list` congelado como artefato no repositório, diffado a cada upgrade.** É o único mecanismo que enxerga a falha silenciosa que a doc do Docusaurus descreve: componente renomeado faz o arquivo swizzlado ser **completamente ignorado**, sem erro. A customização some e nada avisa.

**O artefato existe** — `scripts/swizzle-list.txt`, 220 componentes — e quem o cobra é o **portão 7**, `npm run portao:7`. Ele tem duas pernas, e a segunda é a que dá sentido à primeira:

| perna | o que confere |
| ---: | --- |
| 1 | o artefato congelado bate com o `swizzle --list` de agora — nome novo, nome removido, ou componente que trocou de nível de segurança |
| 2 | **todo arquivo de `src/theme/` tem endereço**: ou o nome está na lista (e a ação que usamos é `Safe`), ou é componente de tema próprio declarado, ou é arquivo interno de um dos dois |

A perna 2 é o que fecha o laço. Um arquivo sem endereço **é** o código morto que a perna 1 acabou de detectar — o nome saiu do upstream, o arquivo ficou, e nada mais aponta para ele.

O artefato é **normalizado** — `nome<TAB>wrap<TAB>eject`, sem a coluna de descrição. Descrição é prosa: uma vírgula nova nela reflui a tabela inteira e produziria um diff de trinta linhas sem uma mudança de contrato. O que o portão cobra é contrato.

#### O portão nasceu com a falha que ele existe para pegar

Vale escrito porque é o achado mais caro deste slice, e porque a forma dele se repete.

A primeira versão lia a saída do CLI por **pipe**. Medido: por pipe a saída volta **truncada no meio da tabela** — 80.173 bytes contra 115.270, cortada em `Icon/Socials/Mastodon`, sem a borda que fecha a tabela. O Node escreve em pipe de forma assíncrona e o CLI termina antes de o pipe drenar; em **descritor de arquivo** a escrita é síncrona e a saída sai inteira.

O efeito não foi o portão reprovar. Foi ele **passar**:

- o artefato foi congelado a partir de uma leitura truncada — **157 dos 220 componentes**, cortado em `Icon/Socials/GitHub`;
- a verificação lia por pipe também, e comparava um pedaço contra outro pedaço;
- os 63 componentes ausentes dos dois lados nunca apareceram no diff. Entre eles, `Navbar/Search`, `NavbarItem/SearchNavbarItem` e todo o `Navbar/*` — exatamente a vizinhança do único swizzle do repositório.

**Um portão que confere a saída de um comando precisa conferir que a saída chegou inteira.** A guarda agora é a borda que fecha a tabela: sem ela o script **estoura**, e não congela. Congelar leitura parcial é pior que não congelar — o artefato passa a atestar o que ninguém leu.

Dois efeitos colaterais da correção, ambos consequência de a saída completa aparecer pela primeira vez:

- o CLI imprime **três** tabelas, não uma — a de componentes e duas de legenda (as ações e os níveis de segurança). A truncagem escondia as duas, e sem filtro as sete linhas de legenda entrariam no artefato como se fossem componentes. O parser agora para na primeira borda de fechamento;
- a explicação que a primeira versão registrava — *"duas execuções concorrentes por `npx` disputam o cache"* — **estava errada**, e foi substituída pela causa medida. `npx` mudava o ponto do corte, não a existência dele.

> **Por que o portão é 7 e não 5.** A resolução do slice o chamava de *portão 5*, e o número já estava gasto: o slice da Referência da API o deu ao portão do gerador, e o [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) o cita pelo número. Renumerar um portão commitado, citado por ADR, por script e por `package.json`, para satisfazer um número escrito antes de ele existir, é churn que quebra uma citação.
>
> **Consequência de aritmética, dita em voz alta: o projeto tem SETE portões, não seis.** E a frase do ADR 5 que chama o portão 5 de *"o único do conjunto que não é `grep`"* passa a ter uma companhia — o portão 7 é da mesma família: regenera e diffa.

**2. Cabeçalho de versão obrigatório no topo de todo arquivo ejetado.** O gerador **remove o cabeçalho de licença** ao ejetar, então sem anotação não há contra o que diffar. Exercido nos dois arquivos que existem: `NavbarItem/ComponentTypes.js` e `SearchBar/index.js` declaram de qual versão foram ejetados.

**3. `--typescript` sempre, mesmo em projeto JavaScript.** Sem a flag o eject ignora `.ts`/`.tsx` e copia o JavaScript transpilado de `lib/`. Com ela, mudança de props vira **erro de build** em vez de bug de runtime.

> **Desvio 1 — `NavbarItem/ComponentTypes`, em JavaScript.** A regra do [ADR 2](../adr/0002-politica-de-swizzle.md) diz *sempre*, e ela é escrita para o que a flag protege — **assinatura de props**. Este arquivo não tem props: é um objeto de mapeamento, e a garantia que interessa nele é outra — **chave removida no upstream vira falha de resolução de `@theme/…` no build**, que acontece igual em JavaScript. Ligar TypeScript aqui custaria uma dependência nova de toolchain, contra o axioma 2, para comprar uma verificação que este arquivo já tem por outro caminho.
>
> O desvio valia **para registro, não para componente** — e a redação original dizia: *"o primeiro `--eject` de componente que este repositório fizer reabre a conta, e aí a flag não é opcional."* O slice 7 é esse dia, e a conta foi reaberta.
>
> **Desvio 2 — `SearchBar`, também em JavaScript, e a conta foi refeita com medição.** Dois fatos, verificados no 3.10.2 e não deduzidos:
>
> - **os dois consumidores montam `<SearchBar />`, sem uma prop.** `Navbar/Content` e `NavbarItem/SearchNavbarItem`, os dois. A superfície de props deste componente é **zero**, então a mudança que a flag pegaria não existe;
> - **este repositório não tem `typescript` instalado.** O que compilaria um `.tsx` aqui é o `@babel/preset-typescript` do `@docusaurus/babel`, que **apaga** os tipos sem conferir nenhum. A flag entregaria a *forma* da garantia sem a garantia, e cobraria a dependência de toolchain que o desvio 1 recusou.
>
> **O que fica no lugar dela é o portão 7.** Ele cobre a única mudança de upstream que este arquivo pode sofrer — o nome sumir da lista —, e cobre por varredura em vez de por confiança.
>
> **O que reabre a conta de novo:** um `--eject` de componente **com props**. Aí a flag compra algo real, e comprá-la significa trazer `typescript` — o que é decisão de axioma 2 e vai num ADR, não neste parágrafo.

**4. Este ledger como tabela viva**, com a coluna *por que o degrau acima não alcançou*.

---

## 6. O que muda o ledger

Um item entra no ledger quando **é escrito**, não quando é autorizado. Pré-autorização mora em prosa; ledger é inventário do que existe.

Um item **sobe de degrau** quando o upgrade traz uma opção pública que antes não havia — e é a última coluna que torna isso conferível sem reler o código.

Um item **sai** quando a customização é removida. Sair do ledger sem sair do código é como o ledger morre.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A escada de seis degraus | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §1 — vive no ADR 2 |
| Os três significados de `src/theme/` | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §0 |
| Orçamento `unsafe` zero | origem própria | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §2 |
| As perdas de chrome | **lacuna por restrição** | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §4 |
| **A perda 4 sai, e a numeração não é remendada** | **origem própria (correção)** | [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) — medido num 3.10.2 real, com o portão 7 verde e a faixa montada; renumerar quebraria citação |
| **O subtítulo por override de `h1`** | **origem própria (verificação)** | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) §2 — a rota já estava registrada na nota da perda 10; 73/73 confere a condição |
| **A eyebrow por subtração encolhe a perda 2** | **origem própria (implementação)** | três `display: none` sobre classes do Infima; o mecanismo continua fora de alcance |
| As perdas 8 e 9 | **lacuna por restrição** | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §8 e §15 |
| A perda 10, e a rota `safe` registrada | **decisão de produto** | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §2.1 |
| A disciplina de registro | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5), consolidado em [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §6 |
| **A marca desce para o degrau 2, e a entrada de degrau 3 é aposentada** | **origem própria (medição)** | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — sem glifo não há `<img>` no caminho, e `navbar.title` alcança; medida no artefato publicado, contra a resolução que a declarava não medida |
| **A primeira linha removida deste ledger** | **origem própria (implementação)** | a regra §6 já dizia *um item sai quando a customização é removida*; esta é a primeira vez que ela é exercida |
| Degrau 4 vazio | origem própria | resultado da política, não meta |
| `verb-badge` fora do registro de `MDXComponents` | **origem própria (consequência)** | o catálogo caiu para dezessete quando o contrato deixou de falar HTTP |
| `MDXComponents` no degrau 3 | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §3 pré-autorizou; exercido pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §4 |
| `Admonition/Types` no degrau 3, sem tocar em `Layout` | **origem própria (correção)** | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15), reconciliando a resolução original com a escada da [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) — o degrau 3 alcança, então o 5 não se compra |
| `code-block` fora da coluna de swizzle | **origem própria (correção)** | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) — a aparência que falta é CSS sobre classe estável mais opção pública |
| Os cinco `Admonition/Icon/*` saem sem serem gastos | **origem própria (implementação)** | o callout desenha os glifos do manifesto no DOM próprio; o degrau 5 pré-autorizado se resolveu no 3 |
| `SearchBar` no degrau 5 | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) pré-autorizou; exercido pela [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) |
| O degrau 5 sem dívida de reconciliação | **origem própria (verificação)** | o `SearchBar` do `theme-classic` é `export {default} from '@docusaurus/Noop'` — não há upstream a reconciliar |
| O portão 7, com as duas pernas | **origem própria** | a perna 1 é a [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §6; a perna 2 é o que a torna útil — arquivo sem endereço **é** o código morto que a perna 1 detecta |
| O portão do `swizzle --list` é o 7 e não o 5 | **origem própria (correção)** | o número 5 foi gasto pelo portão do gerador da API, citado pelo [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) |
| O artefato normalizado, sem a coluna de descrição | **origem própria (implementação)** | descrição é prosa; uma vírgula nova reflui a tabela e produz diff sem mudança de contrato |
| Desvio 2 de `--typescript`, no `SearchBar` | **origem própria (medição)** | os dois consumidores montam `<SearchBar />` sem props, e o repositório não tem `typescript` — a flag entregaria a forma da garantia sem a garantia |
| A saída do CLI lida por descritor de arquivo, não por pipe | **origem própria (medição)** | por pipe volta truncada — 80.173 bytes contra 115.270, sem a borda de fechamento; o CLI termina antes de o pipe drenar |
| A borda de fechamento como guarda de saída inteira | **origem própria (correção)** | sem ela o artefato congelou 157 dos 220 componentes e passou a diffar pedaço contra pedaço |
| O parser para na primeira tabela | **origem própria (implementação)** | o CLI imprime três tabelas; as duas legendas entrariam no artefato como componentes |
| A causa registrada antes — cache do `npx` — estava errada | **origem própria (correção)** | `npx` mudava o ponto do corte, não a existência dele; a causa é o pipe assíncrono |
