# Reconstrução a partir da spec — relatório

O que este documento é: o resultado do protocolo do `design/README.md` §6.2, rodado
por uma sessão que recebeu **só** `spec/design/` e `spec/adr/`, sobre um Docusaurus
3.10.2 vazio. Nenhum arquivo fora do sandbox foi lido.

O recorte construído é o que o protocolo pede: **a camada de tokens inteira** e **a
página de documentação** — chrome, sidebar, TOC, breadcrumb, paginação, footer e o
comportamento em tela estreita — em pt-BR.

---

## 1. O que foi construído

> **Nota de execução.** O `node_modules` do sandbox era um symlink para um alvo
> inexistente, então rodei `npm install` a partir do `package.json` que veio no
> recorte — sem acrescentar uma linha a ele. As dependências continuam sendo as
> sete de produção e as duas de desenvolvimento que o `create-docusaurus classic`
> escreve, e o segundo dos cinco zeros continua de pé.

**O build passa**, nos dois locales, sem link quebrado e sem aviso de deprecação.
68 páginas HTML. Os únicos avisos são os do `postcss-calc` sobre sintaxe de cor
relativa — exatamente os que `tokens.md` §11 registra como ruído, e o CSS emitido
foi conferido: a rampa e os acentos saem intactos.

| Arquivo | O que é |
| --- | --- |
| `src/css/tokens.css` | 1015 linhas — **o bloco espelhado de `tokens.md` §3, byte a byte** |
| `src/css/foco.css` | o contrato de estado de entrada: anel universal, as três exceções, o `:has()` do bloco de código, os três `transition: all`, `:active`, `(pointer: coarse)`, o piso de alvo e o raio do skip link |
| `src/css/chrome.css` | a cadeia de proporções (as três declarações do §1.2), o cartão, a medida de prosa, a marca, os ícones de sidebar, hierarquia, item ativo, footer e o estreito |
| `src/css/custom.css` | `scroll-behavior: auto` declarado, prosa (`hyphens`, `text-wrap`), entrelinha e tracking de título, e a nota sobre `@keyframes` |
| `docusaurus.config.js` | `trailingSlash: false`, `future.v4` desligado, `onBrokenAnchors: 'throw'`, três instâncias de docs, navbar, footer, shim do Prism, locale com rótulo curto |
| `sidebars.js` · `sidebars-api.js` · `sidebars-receitas.js` | seis categorias clicáveis com `className` de ícone e `collapsed: false`; a de receitas plana |
| `src/theme/NavbarItem/ComponentTypes.js` + `Marca.js` | o registro de degrau 3 e a marca (tipo mais glifo, lockup atômico, `onClick` repassado) |
| `src/theme/MDXComponents/index.js` + `src/components/Untranslated/` | o segundo registro, com o único componente do catálogo que a convenção de conteúdo obriga |
| `src/icons/manifest.js` + `static/icons/*.svg` | recorte de 10 entradas do manifesto e nove desenhos |
| `conteudo/**` | 32 páginas mockadas em pt-BR, nas três instâncias |
| `src/pages/index.js` | a rota `/` mínima — só para o site ter raiz e para a landing renderizar `<main>` (foco.md §9) |

**Autoverificação dos portões 1, 2 e 3**, rodada sobre `src/` com remoção de
comentário antes de olhar, como a spec manda:

- **portão 2** (tempo ou curva cravada em `transition`/`animation`): **0 achados**;
- **portão 3** (`outline` fora de `src/css/foco.css`): **0 achados**;
- **portão 1** (literal de cor, comprimento, tempo ou curva fora de `tokens.css`):
  **1 achado — o limiar `996` da media query de `chrome.css`**. Ver §3.1: essa
  ocorrência é obrigatória pela própria spec, e as duas frases que a governam se
  contradizem.

Confirmações medidas no artefato, que fecham afirmações da spec:

- 1240 atribuições `--ifm-*` no adaptador, mais `--doc-sidebar-width` no terceiro
  namespace;
- o shim do Prism funciona como descrito: os `<span>` saem com
  `style="color:var(--sd-code-*)"` e o container com
  `--prism-background-color:var(--sd-surface-code)`;
- as máscaras de ícone da sidebar são embutidas como data URI pelo empacotador,
  sem requisição (icones.md §9);
- o `<html>` sai com `docs-wrapper plugin-docs plugin-id-default …`, como
  `informacao.md` §2.1 corrigiu.

---

## 2. Onde tive que reinterpretar

Vinte e cinco itens. Ordenados por quanto a escolha muda o resultado na tela.

### 2.1 Tamanho do ícone de sidebar — a spec afirma que o token existe, e ele não existe

- **o quê:** que largura, altura e afastamento dar ao `::before` de máscara da
  sidebar.
- **onde:** `icones.md`, preâmbulo — *"Tamanho e espaçamento de ícone moram em
  [`tokens.md`](tokens.md)"*. Varri o bloco espelhado inteiro: **não existe nenhum
  token de tamanho de ícone**, nem `--sd-icon-*` nem equivalente.
- **o que fiz:** `width`/`height: var(--sd-space-4)` e `gap: var(--sd-space-2)`.
- **confiança: chute.** E é o buraco mais estrutural que achei: as três saídas
  possíveis são todas ruins pela régua do próprio projeto — literal reprova no
  portão 1; derivar de `--sd-space-*` é a **derivação falsa** que `tokens.md`
  denuncia em voz alta no bloco de estado de entrada (*"espessura de anel não tem
  relação com escala de espaço"*, e tamanho de ícone tampouco tem); e abrir token
  novo é editar a spec. Escolhi a segunda, que é a que a varredura não pega — ou
  seja, exatamente a categoria que `tokens.md` §11 chama de *"a única forma de
  literal que este projeto não admite"*.

### 2.2 O mapeamento tipo-do-Prism → papel de sintaxe

- **o quê:** quais *token types* do `prism-react-renderer` recebem cada um dos sete
  papéis `--sd-code-*`.
- **onde:** `tokens.md` §7 *"O shim do Prism"* e `componentes/code-block.md`
  *"Variantes"*. Os dois dão os sete papéis e provam que o shim só referencia
  token; nenhum diz o mapeamento.
- **o que fiz:** inventei sete grupos — `punctuation` junto de `operator`,
  `attr-name`/`property` junto de `parameter`, `class-name` junto de `function`,
  `number`/`boolean` junto de `constant`, e assim por diante.
- **confiança: chute**, e é a reinterpretação **mais visível de todas**: ela decide
  a cor de metade dos caracteres de todo bloco de código do site. Duas
  implementações razoáveis desta spec produzem blocos de código que não se parecem.

### 2.3 A folga entre o cartão e o TOC

- **o quê:** o valor do `padding-left` que a coluna do TOC recebe.
- **onde:** `chrome.md` §1.2(c) — *"Com a separação só à esquerda, o TOC alinha com
  o container e a folga entre cartão e TOC é a que se quer."* A frase inteira não
  nomeia token.
- **o que fiz:** `--sd-space-8`.
- **confiança: chute.** As candidatas plausíveis eram `--sd-space-4` (o que o Infima
  já dá, e a regra seria "zera só a direita", que é mais barata de escrever),
  `--sd-space-6` e `--sd-space-8`. A escolha move a largura útil do TOC em até 16px.

### 2.4 Qual degrau de elevação o cartão de doc usa

- **o quê:** `--sd-shadow-1`, `-2` ou `-3` no `.theme-doc-markdown`.
- **onde:** `chrome.md` §1.3 — *"A separação é o anel `0 0 0 1px` embutido na sombra
  multi-camada"*. Os quatro degraus de `tokens.css` embutem esse anel, então a frase
  não desambigua.
- **o que fiz:** `--sd-shadow-1`.
- **confiança: média.** O argumento é que o cartão é a superfície base do sistema e
  os degraus maiores existem para o que sobe mais (modal, dropdown). Mas
  `principios.md` §6 chama a assinatura de *"cartão escuro **elevado** por anel de
  sombra"*, o que empurra para o `-2`. Se o autor escolheu `-2`, a diferença é
  imediatamente visível: 6px/16px de projeção contra 1px/2px.

### 2.5 A lista de elementos de prosa

- **o quê:** quais elementos recebem `max-width: var(--sd-prose-width)`.
- **onde:** `chrome.md` §1.4 — *"Quem não está na lista de elementos de prosa fica
  com o interior inteiro do cartão"*. A lista de quem escapa está deliberadamente
  não escrita (e o argumento é bom); a **lista de prosa**, que é a que se implementa,
  também não está.
- **o que fiz:** `> p, ul, ol, dl, blockquote, h1..h6, hr` e `> header > h1`.
- **confiança: média.** Riscos concretos: se o autor incluiu `figure`/`figcaption`
  ou excluiu `hr`, o ritmo da página muda; e qualquer componente do catálogo que
  renderize um `<p>` no topo do cartão ficaria preso na medida sem que a lista o
  nomeie.

### 2.6 Onde moram `chrome.css` e `custom.css`, e como as folhas entram no build

- **o quê:** o caminho dos dois arquivos e o mecanismo de carga.
- **onde:** a spec nomeia `src/css/tokens.css` (oito vezes) e `src/css/foco.css`
  (três), mas cita `chrome.css` e `custom.css` **só pelo basename**, dentro de
  comentários (`tokens.md` linhas 678 e 966). Nenhum documento diz como as folhas
  chegam ao site.
- **o que fiz:** `src/css/chrome.css` e `src/css/custom.css`, e os quatro na lista
  `presets.theme.customCss`, na ordem tokens → foco → chrome → custom.
- **confiança: média** no caminho, **chute** no mecanismo. A alternativa comum é um
  `custom.css` único que `@import`a os outros. Aqui não muda pixel (não há disputa
  de especificidade entre eles), mas muda a forma do arquivo de config.

### 2.7 A forma exata do `className` de sidebar

- **o quê:** o segundo token da classe de seção de topo.
- **onde:** `chrome.md` §3.1 e `informacao.md` §3.4 citam `.sidebar-icone`
  **verbatim** como o marcador, e `informacao.md` §3.3 diz que os pares vivem em
  três lugares — manifesto, `className` e regra de máscara. O nome do segundo token
  não aparece em lugar nenhum.
- **o que fiz:** `sidebar-icone sidebar-icone--rocket` — o nome do **ícone**, não o
  da seção.
- **confiança: média.** A favor: `users`, `package` e `webhook` servem duas seções
  cada, e nomear pelo ícone faz a regra de máscara ser uma só por desenho, que é
  literalmente a aritmética "12 tags sobre 9 arquivos" do orçamento. Contra: o par é
  *seção→ícone*, e nomear pela seção leria melhor no `sidebars.js`.

### 2.8 A tipografia do rótulo de seção e da folha

- **o quê:** tamanho, peso e cor do rótulo de categoria de topo, e o par dele na
  folha.
- **onde:** `chrome.md` §3.1 fala em *"o ícone e a tipografia de topo"* e §3.2 em
  *"hierarquia"*, sem dar nenhum dos três. `tokens.md` tem os tokens; nada os liga.
- **o que fiz:** topo = `--sd-type-sm` + `--sd-weight-ui` + `--sd-text-strong`;
  folha = `--sd-type-sm` + `--sd-weight-body` + `--sd-text-muted`.
- **confiança: chute.** É a diferença entre uma sidebar que lê como duas camadas e
  uma que lê como uma lista só — e a sidebar é, pela própria spec, a assinatura
  visual mais reconhecível do alvo.

### 2.9 `colorMode`

- **o quê:** `defaultMode` e `respectPrefersColorScheme`.
- **onde:** o axioma 4 diz *"dark é canônico, light é legítimo"*, e o ADR 1 usa
  "canônico" num sentido puramente estrutural (qual bloco CSS é o fallback).
  Nenhum documento decide o comportamento de primeira visita.
- **o que fiz:** `defaultMode: 'dark'`, `respectPrefersColorScheme: false`.
- **confiança: chute.** Se o autor deixou `respectPrefersColorScheme: true`, metade
  dos leitores abre o site no modo legítimo — uma diferença de primeira impressão
  que nenhuma outra decisão da spec compensa.

### 2.10 O ar de baixo do footer

- **o quê:** o valor de `padding-bottom` do `<footer>`.
- **onde:** `tokens.md`, comentário do adaptador — *"O vertical é o ar de cima; o de
  baixo é maior e mora na regra do footer"* —, e `chrome.md` procedência — *"Ar de
  baixo menor que o medido"*. Nenhum dos dois dá o degrau.
- **o que fiz:** `--sd-space-16` contra o `--sd-space-10` de cima.
- **confiança: chute.** Qualquer degrau acima de `--sd-space-10` satisfaz as duas
  frases.

### 2.11 A cor do fio do footer

- **o quê:** qual papel de `border` pinta a régua de site.
- **onde:** `tokens.md` nomeia `--sd-border-width` como *"a régua de site: o fio do
  footer"*, e `chrome.md` §6 chama o fio de separação. A **cor** não é citada.
- **o que fiz:** `--sd-border-default`.
- **confiança: chute** entre `subtle`, `default` e `strong`.

### 2.12 O piso de alvo: qual propriedade

- **o quê:** se `--sd-target-min` vira `min-height`, `min-width` ou os dois.
- **onde:** `foco.md` §8.2 e o comentário de `tokens.css` citam a SC 2.5.5, que fala
  em **área**. A propriedade CSS não é escolhida em lugar nenhum.
- **o que fiz:** só `min-height`.
- **confiança: chute**, ainda que informado — `min-width` estouraria links curtos de
  navbar e o item de sidebar, e a spec diz que *"a 24px nada no site mudaria"*, o
  que sugere que o eixo que importa é o vertical.

### 2.13 A exceção do piso de alvo — inclui o breadcrumb, e a spec não autoriza

- **o quê:** quais seletores ficam de fora do piso.
- **onde:** `foco.md` §8.2 — *"A exceção é uma só: link inline dentro da prosa."*
- **o que fiz:** escrevi `.markdown a`, `.theme-doc-markdown p a`,
  `.theme-doc-markdown li a` **e `.breadcrumbs__link`**. O último é invenção minha:
  44px de altura no breadcrumb destrói a linha acima do cartão.
- **confiança: chute, e é uma divergência declarada.** Se o autor manteve a lista em
  um item, o breadcrumb do site de referência é alto e o meu não é.

### 2.14 A lista de superfícies que recebem `:active`

- **o quê:** quais seletores ganham press.
- **onde:** `foco.md` §7 diz *"mesmos valores do hover, **superfície por
  superfície**"* e §8.3 nomeia seis: as quatro alcançadas pela neutralização
  (sidebar, navbar, footer, paginação) e as duas que não (TOC, breadcrumb).
- **o que fiz:** as seis, com o token que o adaptador escreveu na variável de hover
  de cada uma.
- **confiança: média.** Faltou o **link de prosa**: o Infima o pinta com
  `--ifm-link-hover-color`, ele é uma superfície como as outras, e "superfície por
  superfície" sugere que ele deveria ter press. Não escrevi, porque a lista de seis
  do §8.3 é sobre *neutralização de hover*, não sobre press — e nada me diz que as
  duas listas coincidem.

### 2.15 Os quatro tokens de camada 3 que precisei nomear

- **o quê:** o nome de `--sd-cartao-preenchimento`.
- **onde:** `chrome.md` §1.1 diz que o preenchimento do cartão é *"camada 3,
  declarado no escopo do cartão"*; `tokens.css` dá a gramática
  `--sd-<componente>-<parte>`. O nome do componente e o da parte não estão escritos.
- **o que fiz:** `--sd-cartao-preenchimento`, declarado no `.theme-doc-markdown`.
- **confiança: chute.** Não muda pixel; muda se o código é *reconhecivelmente o
  mesmo*. Note que a spec mistura pt-BR (`--sd-busca-height`, `--sd-trilho-tinta`,
  `--sd-glow-vale`) e inglês (`--sd-code-berco` é híbrido) nos nomes de camada 3, o
  que torna o palpite pior do que precisaria ser.

### 2.16 Onde as regras de tipografia de título moram

- **o quê:** o arquivo e os seletores que consomem `--sd-leading-h1..h4` e
  `--sd-tracking-tight`.
- **onde:** `tokens.md` §8 declara os cinco tokens e diz que o tracking é *"só em
  título"*. Nenhum documento diz onde as regras vivem — o adaptador só sabe entregar
  **uma** entrelinha de título (`--ifm-heading-line-height`), que é a de h2.
- **o que fiz:** `custom.css`, seletores de elemento `h1`…`h6`.
- **confiança: chute** no endereço; alta no conteúdo.

### 2.17 O escopo das regras de chrome

- **o quê:** como escopar `main`, `.col`, `.col--3` e o footer à página de doc sem
  atingir a landing.
- **onde:** `chrome.md` §6.3 diz *"A classe de página de doc vem do `DocRoot`"* sem
  nomeá-la. `informacao.md` §2.1 nomeia as classes do `<html>` no artefato.
- **o que fiz:** `.docs-wrapper` como prefixo.
- **confiança: média-alta** — é a única classe do artefato que satisfaz *"vale para
  as três instâncias"* e *"na landing a classe não existe"*.

### 2.18 A lista de propriedades que substitui os três `transition: all`

- **o quê:** quais propriedades entram na transição corrigida.
- **onde:** `foco.md` §5 manda aplicar *"a regra de motion"* e para.
- **o que fiz:** `color, background-color, border-color, box-shadow, opacity` — que é
  literalmente a lista de `motion.md` §2 (*"estado anima cor, borda, sombra e
  opacidade — nunca geometria"*).
- **confiança: alta.** Foi a única vez em que dois documentos transversais se
  completaram sem que eu precisasse escolher.

### 2.19 Em que arquivo moram as regras que não têm `outline`

- **o quê:** os três `transition: all` e o raio do skip link ficam em `foco.css` ou
  em `chrome.css`?
- **onde:** o portão 3 só governa `outline`; nenhum documento reparte o resto.
- **o que fiz:** os dois em `foco.css`, porque `foco.md` é o dono do texto.
- **confiança: baixa, impacto nulo.**

### 2.20 `text-wrap: balance` em "lead"

- **o quê:** o que é um *lead*.
- **onde:** `tokens.md` §8, *Renderização de prosa* — *"`text-wrap: pretty` no corpo
  e `balance` em título e lead"*.
- **o que fiz:** apliquei só em `h1`…`h6`. Ver §3.4: *lead* não existe em nenhum
  outro ponto da spec.
- **confiança: chute por omissão.**

### 2.21 A tagline, a URL pública, os destinos de `Status` e `Suporte`, o copyright

- **o quê:** o texto de cada um.
- **onde:** `informacao.md` §1 dá o nome do produto e explica por que ele é
  intraduzível; `chrome.md` §6.1 dá os quatro rótulos do footer e por que cada um
  existe. Nenhum texto de tagline, host ou copyright é escrito.
- **o que fiz:** inventei os quatro. A URL saiu do ADR 7
  (`panlabs-tech.github.io/shinydoc-docusaurus`), que é a única pista real.
- **confiança: chute, e sem consequência de desenho.**

### 2.22 O locale EN

- **o quê:** o que entregar em `i18n/en/`.
- **onde:** `informacao.md` §8 dá a matriz 44/29 e os quatro arquivos de tradução.
- **o que fiz:** **nada**. O build do EN sai inteiro em pt-BR, com o
  `<Untranslated />` visível em toda página — que é exatamente o estado que a spec
  descreve para as 29 não traduzidas, aplicado às 32.
- **confiança: alta de que é o comportamento certo; é recorte, não erro.**

### 2.23 As fontes — a maior divergência visual do resultado

- **o quê:** os `@font-face` de Geist e Geist Mono.
- **onde:** `tokens.md` §8, *As fontes*, que é preciso ao ponto de explicar por que o
  `src` começa em `/` e sobrevive ao `baseUrl`.
- **o que fiz:** deixei as duas declarações **comentadas** em `custom.css`, com a
  razão escrita. Os binários não vieram no recorte e não há rede para baixá-los.
- **consequência:** o site reconstruído **não tem a tipografia decidida** — cai no
  `ui-sans-serif` do sistema. Não é buraco da spec; é do transporte do exercício.

### 2.24 Os desenhos de ícone

- **o quê:** os SVGs.
- **onde:** `icones.md` §1 e §5 — Lucide vendorizado, versão fixada, conferido pelo
  `vendorizar-icones.mjs`, que *"precisa de rede"*.
- **o que fiz:** desenhei nove à mão no formato do manifesto (24×24, contorno, traço
  2, caps redondos), incluindo `train-track` para a marca.
- **confiança:** os *nomes* são contrato e estão certos; os *desenhos* são skin e
  são meus. É a troca que a própria spec autoriza no axioma 3.

### 2.25 O que ficou fora por recorte, sem eu ter que decidir nada

Registrado para separar *lacuna da spec* de *lacuna do exercício*: catálogo de 18
componentes, landing, Referência da API gerada, busca, os artefatos AI-era, os sete
portões, os scripts, o `package.json` de verdade e a CI. Tudo isso tem documento
próprio e está fora do §6.2.

---

### 2.26 Onde a spec foi excepcionalmente precisa

Vale tanto quanto a lista acima, e a primeira linha sozinha salva o exercício.

1. **O bloco espelhado de `tokens.md` §3 é o entregável.** Não tomei **uma única**
   decisão na camada de tokens: extraí 1015 linhas e escrevi o arquivo. A spec até
   nomeia o script que confere a igualdade byte a byte. Qualquer outra forma de
   escrever esse documento — descrever a rampa em prosa, dar uma tabela de valores —
   teria produzido dezenas de reinterpretações no lugar de zero.
2. **O adaptador vem pronto, com a regra de conteúdo junto.** 1240 atribuições,
   mais o *porquê* de cada exclusão (`--ifm-transition-slow` sem consumidor, as
   quatro shades mortas, o degrau 600 de ênfase). Reconstruí isso sem julgar nada.
3. **As três declarações que fecham a cadeia** (`chrome.md` §1.2). São a coisa mais
   fácil de errar do exercício inteiro, e a spec dá as três com o mecanismo de cada
   uma. Escrevi, e a conta fechou na primeira tentativa: 1152 × 0,75 = 864, e o
   cartão nasce em `--sd-doc-width` exato porque o `.col` perdeu o preenchimento.
4. **O alinhamento do footer.** *"A correção é uma declaração, e ela soma o
   gutter"* — escrevi exatamente uma declaração, e ela soma o gutter. Curta o
   bastante para caber numa linha e específica o bastante para não ter margem.
5. **As três exceções de foco.** O `programmaticFocus`, o `<div role="region">` de
   altura zero, o `:has()` exigindo filho **direto**, e por que `[tabindex='-1']`
   não serve de seletor. Quatro fatos de upstream que eu jamais descobriria sem
   medir, entregues com o motivo.
6. **A regra de sidebar cobrir as duas formas** — categoria com filhos e categoria
   normalizada para link —, inclusive os dois seletores exatos e a razão (a falha
   seria **muda**).
7. **`pathname://` no `llms.txt` e `target` declarado nos links externos.** Duas
   armadilhas em que eu teria caído nas duas; a segunda eu nem saberia que existia.
8. **O comportamento no estreito**: a spec diz quais três dos quatro se resolvem
   sozinhos e **por quê**, e o quarto é uma declaração.
9. **`:empty` no `.navbar__brand`** e o slot de busca vazio que custa zero.

O padrão: a spec é impecável onde descreve **mecanismo de upstream** e **derivação
declarada**, e é fraca onde precisa dar um **valor de acabamento que ninguém mediu**
— a folga do TOC, o ar de baixo do rodapé, o tamanho do ícone, o peso do rótulo.
Isso é coerente com o axioma 5, e é o preço dele: o que não foi medido não foi
escrito, e o que não foi escrito eu inventei.

---

## 3. Contradições e erros

### 3.1 Onde o limiar de media query mora — duas frases incompatíveis

`tokens.md` §11: *"Enquanto o único limiar do projeto morar no arquivo de tokens, o
portão passa sem exceção."*

`chrome.md` §7 exige media query em `chrome.css` (o preenchimento do cartão pela
metade, a restauração do padding do footer, a linha que quebra), e o preâmbulo do
próprio `chrome.md` §0 admite *"o limiar de media query"* entre os números que
aparecem naquele documento.

Os dois não podem ser verdade ao mesmo tempo: o limiar **não** mora só no arquivo
de tokens, e a perna literal do portão 1 reprovaria `chrome.css` — foi o único
achado da minha autoverificação. A leitura que salva é a segunda perna do portão
(`principios.md` §4: *"A segunda perna dele exige um limiar de media query só no
projeto"*), mas ela não é o que a frase de `tokens.md` diz.

### 3.2 `icones.md` cita um token que não existe

Preâmbulo: *"Tamanho e espaçamento de ícone moram em `tokens.md`."* Não moram. O
bloco espelhado não tem nenhum token de tamanho de ícone, e a regra de máscara da
sidebar precisa de dois. Ver §2.1 — é a citação a algo inexistente que mais custou.

### 3.3 As duas tabelas de contraste do anel de foco divergem

Para o mesmo par, nos mesmos dois modos:

| par | `tokens.md` §10 | `foco.md` §6 |
| --- | --- | --- |
| anel vs cartão, escuro | 5,34 | 5,33 |
| anel vs página, escuro | 7,04 | 7,04 |
| anel vs cartão, claro | **6,26** | **6,08** |
| anel vs página, claro | **5,99** | **5,82** |

O escuro bate (5,34/5,33 é arredondamento). O claro não: duas décimas de diferença
em dois pares. São resultados de verificação e não valores de desenho, então nada
na implementação muda — mas é exatamente a classe de defeito que a tabela de
procedência existe para tornar visível, e ela não a tornou.

### 3.4 *Lead* não existe

`tokens.md` §8 manda aplicar `text-wrap: balance` em *"título e lead"*. Não há
componente, classe, parte publicada ou convenção de conteúdo chamada *lead* em
nenhum dos 31 arquivos. A instrução é inimplementável como escrita.

### 3.5 `--sd-type-5xl` é declarado e, no recorte, não tem consumidor

O comentário no bloco de tokens diz que ele *"tem exatamente um consumidor — o
título do hero"*, que vive na landing. Para quem recebe só `design/` e `adr/` e
constrói o recorte do §6.2, ele é uma variável sem consumidor — o defeito que o
próprio projeto nomeia no Infima e recusa em toda parte. Some assim que a landing
existir; menciono porque o protocolo do §6.2 **é** esse recorte.

### 3.6 A tabela de navbar mistura rótulo declarável com rótulo que não existe

`chrome.md` §2 lista `Buscar` como o item da posição de busca, e a linha da
alternância de tema traz a nota *"não declarável"*. A de busca não traz — mas
`type: 'search'` também não aceita rótulo nenhum. Escrevi o item sem label.

---

## 4. O que a spec não cobre para terminar o site

Separando o que ela **decidiu não cobrir** (correto) do que ela **precisaria cobrir
e não cobre**.

**Precisaria cobrir:**

1. **Como as folhas de estilo entram no build.** Nenhum documento diz que existe uma
   lista `theme.customCss`, quantos arquivos ela tem, nem em que ordem. É a primeira
   linha de config que qualquer implementador escreve.
2. **Os tokens que a spec afirma existir e não existem** — tamanho de ícone (§3.2), a
   folga do TOC (§2.3), o degrau de sombra do cartão (§2.4), o ar de baixo do rodapé
   (§2.10), a cor do fio (§2.11).
3. **A gramática dos nomes de camada 3.** A regra `--sd-<componente>-<parte>` existe;
   o idioma dos nomes oscila entre pt-BR e inglês nos exemplos, o que faz cada token
   novo ser um palpite.
4. **A lista de elementos de prosa** (§2.5), que é a única coisa que faz a medida
   constante ser implementável.
5. **O mapeamento do shim do Prism** (§2.2).
6. **O comportamento de primeira visita** (`colorMode`, §2.9).

**Decidiu não cobrir, e está certa:**

7. **O texto das 43 páginas.** A spec dá tipos, gabaritos, orçamentos de estrutura,
   fixtures com dona nomeada e contagens por seção — que é o contrato certo para
   conteúdo mockado. Consequência prática: o portão 4 não passa num rebuild sem que
   alguém escreva o conteúdo, e isso é esperado.
8. **Os binários** — fontes e SVGs. A spec diz de onde vêm e como conferir; o
   transporte é rede.
9. **Os sete portões, os scripts, o `package.json` e a CI.** Descritos com precisão
   suficiente para escrevê-los, e nenhum está no recorte do §6.2.
10. **Contrato OpenAPI, `ApiDocItem`, busca, landing, artefatos AI-era e os 18
    componentes.** Todos têm documento próprio, e nenhum entra no recorte.

---

## 5. Veredito

> **Um agente que só tem esta spec constrói algo reconhecivelmente igual ao que foi
> decidido — na camada de tokens, sem ressalva; no chrome, com ressalvas nomeáveis;
> no acabamento, não.**

Em três níveis, porque a resposta é diferente em cada um:

**A camada de tokens: sim, e trivialmente.** O espelho de `tokens.md` §3 não é uma
descrição do arquivo — é o arquivo. Reconstruí 1015 linhas com zero decisões e o
build confirmou que a rampa, os acentos e o adaptador saem intactos. Esse único
recurso de forma vale mais para o axioma 6 do que todo o resto da spec junto, e ele
deveria ser o padrão para qualquer outro artefato que caiba num bloco de código —
começando pelos sidebars e pelo shim do Prism.

**O chrome: sim na estrutura, com ressalvas.** A cadeia de proporções, o cartão, o
alinhamento do footer, a regra de sidebar, o contrato de foco e o estreito saíram do
documento quase sem julgamento, e as partes difíceis — as três declarações do §1.2,
a declaração única do footer, as três exceções de foco — são justamente as que a spec
acerta melhor. Um revisor que abrisse o meu resultado ao lado do original
reconheceria o mesmo layout.

**O acabamento: não.** Onze valores de superfície ficaram por minha conta, e cinco
deles são visíveis a olho nu na primeira tela: o mapeamento de cor de sintaxe, o
peso e a cor do rótulo de sidebar, o degrau de sombra do cartão, a folga do TOC e o
tamanho do ícone. Some a isso a tipografia, que o exercício não conseguiu
transportar. O resultado **lê como o mesmo sistema**; ele **não passaria por um diff
visual**.

A causa não é descuido de redação. É a régua funcionando como escrita: *medição, não
invenção* significa que o que ninguém mediu não virou linha de spec — e o que não
virou linha de spec, quem implementa inventa. A saída não é medir mais; é que
**valor de acabamento não medido também precisa de endereço**, mesmo que o endereço
seja um bloco `Livre` com dono e uma escolha default cravada. Hoje esses onze valores
não são `Livre` (não há dono, não há latitude declarada) nem obrigatórios (não há
valor). Eles são a terceira categoria que a spec diz não ter: **silêncio**.

E é o §1 do próprio `README.md` da spec que dá a régua para julgar isso — *"Tudo é
obrigatório, salvo bloco `Livre`"*. Cada item da minha §2 é um lugar onde essa frase
não tinha o que reger.
