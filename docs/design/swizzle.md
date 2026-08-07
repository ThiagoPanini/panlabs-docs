# Swizzle

O ledger vivo, as perdas nomeadas e a disciplina de registro.

**Este documento é para quem faz o upgrade do Docusaurus.** Ele não descreve aparência: descreve o que precisa ser reconciliado e por quê. É por isso que ele não mora em [`chrome.md`](chrome.md) — o ledger atravessa chrome, componentes de conteúdo e Referência da API, e quem o lê não deveria ter que abrir um documento de design para achar a lista.

A **política** — a escada de seis degraus, o orçamento `unsafe` zero, a escotilha por ADR novo — mora no [ADR 2](../adr/0002-politica-de-swizzle.md), porque sobrevive à troca de skin. Este documento **cita** e nunca repete.

**Documento aberto.** Ele fecha no slice 7, junto com o artefato de `swizzle --list` congelado.

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

Hoje `src/theme/` tem os três, e **nenhum é swizzle**:

```
src/theme/ApiDocItem/            componente de tema próprio  (degrau 2)
src/theme/NavbarItem/Marca.js    componente de tema próprio  (consumido pelo registro)
src/theme/NavbarItem/ComponentTypes.js   registro            (degrau 3)
src/theme/MDXComponents/index.js         registro            (degrau 3)
src/theme/Admonition/Types.js            registro            (degrau 3)
```

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
| `.theme-doc-markdown` | o cartão: largura constante, preenchimento, raio, superfície, sombra, medida de prosa e breakout | não existe variável do Infima para nada disso |
| `main`, `.container`, `.row`, `.col`, `.col--3` | a cadeia de proporções: gutter, colunas sem preenchimento, separação do TOC | idem |
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
| `themeConfig.footer` | os links, o copyright, a forma plana | idem |
| `docItemComponent: '@theme/ApiDocItem'` | substitui o layout inteiro da página de API | classe não troca componente de rota |
| `themeConfig.prism.theme` | paleta de sintaxe que só referencia token | `--prism-background-color` é injetada em estilo **inline**, e nenhum seletor vence estilo inline |
| `localeConfigs[*].label` | o rótulo curto do seletor de idioma | o default vem de `Intl.DisplayNames`, em código |

### Degrau 3 — registro escrito à mão

| Item | O que muda | Por que o degrau acima não alcança |
| --- | --- | --- |
| `NavbarItem/ComponentTypes` | acrescenta o tipo `custom-marca` | a marca precisa de `currentColor`, e `navbar.logo` renderiza `<img>`. `Logo` e `Navbar/Logo` **não estão no `getSwizzleConfig`** — caem no default `unsafe`, que o ADR 2 proíbe |
| `MDXComponents` | registra os catorze componentes com tag própria (quinze chaves — `steps` tem duas), mais `Tabs`/`TabItem`, mais a chave de elemento `table` | `.md` de conteúdo não deve importar nada, e não há opção pública que acrescente componente ao escopo do MDX. O próprio `getSwizzleConfig` diz *"meant to be ejected"* |
| `Admonition/Types` | substitui a anatomia vertical do Infima pela horizontal medida, nas quatro variantes de callout | não há variável nem classe que reoriente o eixo da admonition. O degrau 5 (`Admonition/Layout`) alcançaria, mas o 3 alcança **antes**: o arquivo é um objeto, e nada obriga as entradas dele a apontarem para o layout do upstream |

**Os dois do catálogo copiam zero linha de upstream**, e é isso que os mantém no
degrau 3: um espalha o objeto original e acrescenta chaves; o outro é escrito do
zero apontando para componentes nossos. O `Admonition` raiz — `unsafe` — continua
**intocado**.

**Pré-autorizados e ainda não exercidos:** `prism-include-languages`, se a
Referência da API precisar de linguagem fora do que `additionalLanguages` cobre.

### Degrau 4 — `--wrap`

**Vazio, e é resultado, não coincidência.**

Reservado, não gasto: a faixa de tabs de largura total abaixo do navbar sairia por envolver `DocSidebar` (`wrap: safe`). Ela é a perda 4 do §4 e não foi comprada.

### Degrau 5 — `--eject`

**Continua vazio depois do slice do catálogo, e o motivo vale registrado.**

Pré-autorizados: os ícones de chrome que são `safe` nas duas ações (`Icon/Arrow`, `Icon/DarkMode`, `Icon/LightMode`, `Icon/Edit`, `Icon/Menu`); `SearchBar`, no slice da busca.

**Os cinco `Admonition/Icon/*` saem da lista de pré-autorizados sem serem gastos.** [`icones.md`](icones.md) §4.2 mandava a troca dos ícones alcançáveis para o slice do catálogo, contando com `--eject` nos de admonition. Não foi preciso: o callout tem DOM próprio desde que `Admonition/Types` passou a apontar para ele, e ele desenha os glifos do manifesto direto. **Um degrau 5 pré-autorizado que se resolve no degrau 3 é o resultado que a escada existe para produzir.**

**Os cinco de chrome continuam pré-autorizados e não exercidos.** Eles são chrome, não catálogo, e o slice do catálogo fechou a superfície de swizzle dele em duas linhas de degrau 3. Trocá-los é `--eject` de cinco arquivos por estética de glifo, e a conta é de quem abrir o slice que os quiser.

### `unsafe`

**Zero, e é verificável por varredura:** nenhum arquivo em `src/theme/` corresponde a um componente `unsafe` do `getSwizzleConfig`.

O slice do catálogo era o que tinha mais chance de gastar o orçamento, e não gastou. Os dois `unsafe` que ele encostou continuam de pé: o `Admonition` raiz, que despacha por tipo para o registro sem saber que o destino é nosso, e o `Tabs`, que é consumido como está e repaginado só por CSS.

---

## 4. As perdas nomeadas

O zero cobra um preço, e cada linha é perda escrita — não silêncio.

| # | Perda | Componente que a obriga | Onde ela aparece |
| ---: | --- | --- | --- |
| 1 | Qualquer nó injetado **dentro** do corpo da página de doc — eyebrow, bloco de feedback, CTA lateral | `DocItem/Layout`, `DocItem/Content` | [`chrome.md`](chrome.md) §8 |
| 2 | Breadcrumb reestruturado como a eyebrow da âncora | `DocBreadcrumbs` | [`chrome.md`](chrome.md) §5 |
| 3 | A proporção da âncora entre conteúdo e painel | classe hasheada de CSS Module | [`chrome.md`](chrome.md) §8 |
| 4 | Faixa de tabs de largura total abaixo do navbar | `Navbar/*` | [`chrome.md`](chrome.md) §8 |
| 5 | TOC com anatomia nova — barra de progresso, seções extras | `TOC`, `TOCItems` | [`chrome.md`](chrome.md) §4 |
| 6 | Ícone preso dentro de componente `unsafe` mantém o desenho do Docusaurus | vários; `Icon/ExternalLink` é o caso concreto | [`icones.md`](icones.md) §4.2 |
| 7 | Footer dentro da coluna de prosa, como a âncora faz | `<Footer/>` é irmão do `main-wrapper` | [`chrome.md`](chrome.md) §6.3 |
| 8 | Armadilha de foco na sidebar de tela estreita | `Navbar/MobileSidebar/*` | [`foco.md`](foco.md) §12 |
| 9 | Posição do botão de voltar ao topo na ordem de tabulação | `DocRoot/Layout` | [`foco.md`](foco.md) §10 |
| 10 | O controle de página AI-era — *Copiar página* e deep-link para assistente | `DocItem/Layout` | fora **por produto**, não por preço |

**A perda 6 é a que a regra resolve sem enumerar:** *o que só é alcançável por `unsafe` não é trocado.* Não há lista a manter.

**A perda 10 tem nota própria, e ela importa para o orçamento.** O recurso saiu por decisão de produto, e a rota `safe` fica registrada: ancorar o controle no `<h1>` via `MDXComponents` (degrau 3) alcança, desde que toda página escreva o próprio `# Título`. **O zero de `unsafe` não é comprado com o sacrifício desse recurso** — mesmo que ele voltasse, caberia no degrau 3.

**Perdas fora do alcance do adaptador**, que não são de swizzle mas envelhecem junto: as curvas de easing cravadas no CSS do navbar e a curva da transição de largura da sidebar. Elas estão em [`motion.md`](motion.md).

---

## 5. A disciplina de registro

Quatro peças, e a primeira detecta problema **antes de haver sintoma**.

**1. `swizzle --list` congelado como artefato no repositório, diffado a cada upgrade.** É o único mecanismo que enxerga a falha silenciosa que a doc do Docusaurus descreve: componente renomeado faz o arquivo swizzlado ser **completamente ignorado**, sem erro. A customização some e nada avisa. *Este artefato nasce no slice 7.*

**2. Cabeçalho de versão obrigatório no topo de todo arquivo ejetado.** O gerador **remove o cabeçalho de licença** ao ejetar, então sem anotação não há contra o que diffar. Já exercido: `src/theme/NavbarItem/ComponentTypes.js` declara de qual versão foi ejetado.

**3. `--typescript` sempre, mesmo em projeto JavaScript.** Sem a flag o eject ignora `.ts`/`.tsx` e copia o JavaScript transpilado de `lib/`. Com ela, mudança de props vira **erro de build** em vez de bug de runtime.

> **Desvio registrado, e ele é o primeiro:** `NavbarItem/ComponentTypes` está em JavaScript. A regra do [ADR 2](../adr/0002-politica-de-swizzle.md) diz *sempre*, e ela é escrita para o que a flag protege — **assinatura de props**. Este arquivo não tem props: é um objeto de mapeamento, e a garantia que interessa nele é outra — **chave removida no upstream vira falha de resolução de `@theme/…` no build**, que acontece igual em JavaScript. Ligar TypeScript aqui custaria uma dependência nova de toolchain, contra o axioma 2, para comprar uma verificação que este arquivo já tem por outro caminho.
>
> O desvio vale **para registro, não para componente**. O primeiro `--eject` de componente que este repositório fizer reabre a conta, e aí a flag não é opcional.

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
| As sete perdas de chrome | **lacuna por restrição** | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §4 |
| As perdas 8 e 9 | **lacuna por restrição** | [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §8 e §15 |
| A perda 10, e a rota `safe` registrada | **decisão de produto** | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §2.1 |
| A disciplina de registro | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5), consolidado em [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §6 |
| A marca no degrau 3 | **origem própria (implementação)** | `Logo` e `Navbar/Logo` fora do `getSwizzleConfig`; o schema de logo exige arquivo de imagem |
| Degrau 4 vazio | origem própria | resultado da política, não meta |
| `MDXComponents` no degrau 3 | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §3 pré-autorizou; exercido pela [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §4 |
| `Admonition/Types` no degrau 3, sem tocar em `Layout` | **origem própria (correção)** | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15), reconciliando a resolução original com a escada da [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) — o degrau 3 alcança, então o 5 não se compra |
| `code-block` fora da coluna de swizzle | **origem própria (correção)** | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) — a aparência que falta é CSS sobre classe estável mais opção pública |
| Os cinco `Admonition/Icon/*` saem sem serem gastos | **origem própria (implementação)** | o callout desenha os glifos do manifesto no DOM próprio; o degrau 5 pré-autorizado se resolveu no 3 |
