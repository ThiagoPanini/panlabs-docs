# Componentes de conteúdo

O catálogo é **fechado, e são dezessete**. Componente de conteúdo é o que o autor
escreve dentro do MDX, por oposição ao [chrome](../chrome.md), que não se autora
— se entorta.

**Nenhum valor numérico aparece nesta pasta.** Cor, comprimento, tempo e curva
moram em [`tokens.md`](../tokens.md) e são citados por **nome de token**. Os
números que aparecem aqui são contagens e identificadores — quantos componentes,
quantas variantes, número de issue e de ADR.

Tudo é obrigatório, salvo bloco marcado `Livre`. Todo bloco `Livre` nomeia o dono.

> **Leia antes:** [ADR 1 — Doutrina de CSS](../../adr/0001-doutrina-de-css.md),
> [ADR 2 — Política de swizzle](../../adr/0002-politica-de-swizzle.md) e
> [ADR 3 — Reduced-motion na camada de token](../../adr/0003-reduced-motion-na-camada-de-token.md).

---

## As cinco regras que atravessam os dezessete

**1. Todos globais, nenhum importado.** Os dezessete estão registrados em
`src/theme/MDXComponents`. **Nenhum arquivo de conteúdo escreve um `import`** — a
medição das referências achou zero imports de snippet nos alvos, e catálogo que
exige import é catálogo que vira declaração inline no próprio arquivo.

**2. Não existe válvula de escape.** `className` solto no MDX é proibido, e não
há camada de classes utilitárias. Quando uma página precisa de um arranjo que os
dezessete não cobrem, **a página muda e não o catálogo**. Isso não é aperto
acidental: as duas referências que pareciam ter catálogo suficiente resolviam o
resto com mais de mil `className` de utilitário escritos à mão dentro do MDX, e o
Docusaurus vanilla não tem essa porta.

**3. Zero JS de interação, e é verificável por leitura.** Nenhum componente
implementa comportamento interativo. Ou o navegador entrega — `<details>`, `<a>`,
`<table>` — ou o Docusaurus entrega — `Tabs`, com `tabindex` roving e
`aria-selected` prontos. **Não há um `keydown` escrito neste projeto.** Ver
*substrato nativo* em [`domain.md`](../../agents/domain.md).

**4. O contrato de partes é estreito.** `data-sd-component`, `data-sd-variant` e
`data-sd-part` — este último **só onde o CSS não alcança** por tipo de elemento
ou por ARIA. **Estado nunca vira atributo**: `[open]`, `[aria-selected]` e
`:focus-visible` já carregam a informação.

> **A régua, escrita para não ser relitigada.** Uma parte ganha atributo quando
> **um seletor de tipo de elemento sobre os filhos diretos é ambíguo hoje** — dois
> `<span>` irmãos dentro do mesmo `<summary>`, ou um `<p>` de título no meio dos
> `<p>` que o autor escreve. Quando o tipo já separa — `> div` sendo o único
> `<div>`, `> svg`, `<summary>`, `<figcaption>`, `<code>`, `<table>` — **não
> ganha**. Publicar depois é aditivo; despublicar quebra quem já dependia, e é
> por isso que a dúvida se resolve para o lado de não publicar.
>
> Onze dos dezessete publicam **zero** partes. A única entrada que a régua não
> obrigaria e que fica assim mesmo é a meta de [`param-field`](param-field.md),
> porque a rota da referência gerada a nomeia verbatim no contrato dela.

**O contrato tem um consumidor que não é um dos dezessete, e ele vale registrado.**
A landing usa `data-sd-part="glow"` na camada decorativa do hero, e
`data-sd-component` para alcançar `card` e `card-group` dentro do JSX dela — ver
[`landing.md`](../landing.md) §7. Não é exceção à régua: é a régua aplicada fora
do MDX. O `glow` existe porque o bloco `reduce` de `tokens.css` precisa alcançar
um elemento cuja classe é de CSS Module e portanto **hasheada** — que é
literalmente *o CSS não alcança por tipo de elemento*. E os dois
`data-sd-component` já eram publicados: quem os lê de fora lê contrato, não
implementação.

**5. Nenhum componente conhece modo de cor.** As duas exceções declaradas são
[`code-block`](code-block.md) e [`frame`](frame.md), e só elas. Consequência
prática: o corporativo troca **quatro** cores de callout, não vinte.

**As duas continuam pelas mesmas razões de sempre** — o `code-block` pela paleta
de sintaxe, o `frame` pelo `currentColor` do diagrama. O que mudou nos dois foi a
**superfície**, e superfície é papel da camada 2, que já bifurcou: nenhum dos
dois passou a saber em que modo está.

> **Zero sombra no catálogo, e é conferível por varredura.** Nenhum dos dezessete
> escreve `box-shadow`, e `src/css/componentes.css` também não. A profundidade
> saiu do conteúdo por medição — a
> [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) achou zero
> componentes de conteúdo com sombra em seis páginas da âncora. A tabela de quem
> ainda carrega sombra está em [`tokens.md`](../tokens.md) §6.
>
> **Uma superfície do corpo sobrevive com sombra, e ela não é do catálogo:** o
> painel da referência gerada, que é componente de tema e tem dono próprio em
> [`referencia.md`](../referencia.md). O CSS dele o declara *"a única
> superfície elevada desta página, e agora a única do corpo de qualquer página"*
> — a afirmação daqui é sobre **os dezessete**, e é por isso que ela é varredura de
> duas pastas e não do repositório.

---

## A tabela-catálogo

| Componente | Papel | Onde vive | Rota de implementação |
| --- | --- | --- | --- |
| [`callout`](callout.md) | destaca o que o leitor não pediu mas precisa | global | **`Admonition/Types` — degrau 3** |
| [`card`](card.md) | um destino, com ícone e uma linha | global | do zero |
| [`card-group`](card-group.md) | a grade que os arruma sem contagem de colunas | global | do zero |
| [`steps`](steps.md) | sequência numerada com fio | global | do zero |
| [`accordion`](accordion.md) | dobra um trecho atrás de um título | global | `<details>` nativo |
| [`accordion-group`](accordion-group.md) | empilha sanfonas como um bloco só | global | do zero |
| [`tabs`](tabs.md) | alterna conteúdo irmão, com a escolha na URL | global | Docusaurus como está — **só CSS** |
| [`code-block`](code-block.md) | a cerca de Markdown, repaginada | — (é a cerca) | **CSS + `themeConfig.prism`** |
| [`code-group`](code-group.md) | o mesmo trecho em várias linguagens | global | compõe `Tabs` |
| [`frame`](frame.md) | enquadra um diagrama e o legenda | global | do zero |
| [`param-field`](param-field.md) | um parâmetro de requisição | global | do zero |
| [`response-field`](response-field.md) | um campo de resposta, recursivo | global | do zero |
| [`expandable`](expandable.md) | o aninhamento de um campo | global | `<details>` nativo |
| [`icon`](icon.md) | o vocabulário de ícone dentro da prosa | global | do zero |
| [`update`](update.md) | uma entrada de changelog | global | do zero |
| [`table`](table.md) | a tabela de Markdown, rolável e semântica | global (chave `table`) | do zero |
| [`untranslated`](untranslated.md) | sinaliza página sem tradução | global | do zero |

**Componente com inicial maiúscula na autoria.** Não é estilo: em MDX v3 a tag
minúscula é elemento HTML, e um `<card>` sairia como tag desconhecida em vez de
componente.

---

## Toda a superfície de swizzle são dois registros

| Registro | Degrau | O que ele faz |
| --- | ---: | --- |
| `src/theme/MDXComponents/index.js` | 3 | espalha o objeto original e acrescenta as chaves do catálogo |
| `src/theme/Admonition/Types.js` | 3 | troca o mapa `tipo → componente` da admonition pelas quatro variantes de callout |

Os dois são **objeto escrito à mão**, com **zero linha de upstream copiada**.
Nenhum `--eject`, nenhum `--wrap`, e o **orçamento `unsafe` continua em zero**. O
ledger completo, com a coluna *por que o degrau acima não alcançou*, está em
[`swizzle.md`](../swizzle.md).

Três entradas do catálogo não custam nem isso:
[`tabs`](tabs.md) é consumido do Docusaurus sem swizzle,
[`code-block`](code-block.md) é CSS sobre classe estável mais opção pública, e
[`code-group`](code-group.md) **compõe** o `Tabs` em vez de swizzlá-lo.

---

## Os treze cortados, com a evidência

Cortar é tão importante quanto incluir, e aqui o corte tem base empírica em vez
de opinião: **metade do catálogo da âncora tem uso ZERO em 1.740 páginas
medidas.**

`Tooltip` · `Badge` · `Danger` · `Tile` · `Panel` · `Tree` · `View` ·
`Visibility` · `Prompt` · `Banner` · `Color` · `RequestExample` ·
`ResponseExample`

O `Tooltip` é o caso mais eloquente: está no catálogo da âncora, está no guia de
autoria interno de uma das casas medidas, e **nenhum autor o usou — nem inventou
substituto**.

Isto está escrito aqui para que ninguém reabra por intuição. Reabrir exige
medição nova, não gosto.

**Quatro outros ficaram de fora com motivo próprio:**

| Fora | Motivo |
| --- | --- |
| Layout de duas colunas pareadas | a medida de prosa não comporta duas colunas de texto; o layout de três colunas da referência gerada tem rota própria |
| Seletor de SDK por página | é rota e arquitetura de informação, não componente |
| Componente gerado de contrato | já é ADR pela rota da referência gerada |
| **Mídia binária** — vídeo e screenshot | três razões independentes, e nenhuma depende de o produto documentado ser inventado: sem CDN o asset entra no repositório, captura de UI de terceiro apodrece sozinha, e **raster não herda `currentColor`**. O contrato de vídeo da âncora fica **medido e não exercido** — ver [`frame.md`](frame.md) |

E **uma variante** morreu junto: `check` foi fundida em [`tip`](callout.md), por
serem pixel a pixel idênticas na medição.

---

## O gabarito, e por que ele é estrutura

Cada arquivo desta pasta segue **nove seções fixas**, na mesma ordem:

```markdown
## Papel
## Anatomia              (partes + os data-attributes que são contrato público)
## Variantes
## Autoria em MDX
## Tokens consumidos     (só nomes)
## Light e dark
## Motion / reduced-motion
## A11y
## Procedência
```

**Nenhuma seção fica vazia.** *"Não se aplica"* escrito por extenso é resposta;
silêncio não é. Um componente sem seção de a11y seria um buraco visível no
arquivo, e não uma omissão que passa batido num documento de mil e quinhentas
linhas.

Três seções são quase sempre curtas, e a brevidade delas é o resultado que se
queria:

- **`## Light e dark`** diz *não se aplica* em **quinze dos dezessete**. É isso
  que faz as duas exceções reais saltarem aos olhos.
- **`## Motion / reduced-motion`** só **nomeia o movimento**. Se um componente
  precisar dizer algo além de *herda*, o desenho está errado — e a regra de
  reduced-motion é propriedade da camada de token, nunca do componente.
- **`## A11y`** **cita [`foco.md`](../foco.md) e para** quanto ao contrato de
  estado de entrada, em vez de repetir a mesma regra dezessete vezes. O que cada
  arquivo acrescenta é o que é **próprio dele** — qual elemento nativo carrega o
  comportamento, o que é decorativo, o que cai de graça. **ARIA construído por
  nós existe em exatamente um componente**, a [`table`](table.md), e é o único
  lugar onde ele aparece porque o HTML não tem elemento para o caso.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O catálogo tem dezessete e é fechado | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — uso zero em 1.740 páginas; [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) fecha o inventário |
| **`verb-badge` sai, e sem carimbo vazio** | **origem própria (consequência)** | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — o contrato deixou de falar HTTP e os ~50 consumidores morreram com o Trilho; diferente de `circle-check`, não há estado plausível que o peça de volta |
| O décimo sétimo é `untranslated` | origem própria | [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16), aceito pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| Todos globais, nenhum importado | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — zero imports de snippet medidos |
| Sem válvula de escape | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §1 — veto do dono do projeto |
| Zero JS de interação | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Contrato de partes estreito | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| Nenhum componente conhece modo de cor | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §7 |
| Os treze cortados | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) |
| Toda a superfície de swizzle são dois registros de degrau 3 | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) pré-autorizou; [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) corrigiu a rota do callout e do `code-block` |
| O gabarito de nove seções | herdado | [#9](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/9) §4 |
| Inicial maiúscula na autoria | herdado | [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6), ratificado pela [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §1 |
