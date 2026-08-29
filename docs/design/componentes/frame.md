# `frame`

> **Nenhum valor numérico nasce neste documento.** Os comprimentos que o componente consome moram em [`../tokens.md`](../tokens.md) e são citados por nome de token. Os números do bloco *Alvo medido*, dentro de `## Anatomia`, são **evidência de medição da âncora** — dizem o que se quer atingir, não o que temos, e quem os edita está afirmando que a âncora mudou.

## Papel

Enquadra um **diagrama**.

A decisão de conteúdo vem antes da de anatomia, e ela é o que torna este
componente possível: **não entra mídia binária, nem vídeo nem screenshot.** O que
a moldura enquadra é fluxo, ciclo de vida, modelo de dados.

O argumento antigo era *"um produto fictício não tem interface para
fotografar"*, e ele **morreu junto com o produto fictício**. Os três que o
substituem não dependem de o assunto ser inventado:

- **sem CDN, o asset entra no repositório.** Binário versionado num repo de
  documentação é peso que não se revisa em diff;
- **captura de UI de terceiro apodrece sozinha.** A tela muda, a documentação
  não, e ninguém descobre pelo build;
- **raster não herda `currentColor`.** É a razão dura: um PNG correto no escuro
  está errado no claro, e a saída seria um asset por modo.

Isso **encolhe** o componente. O fundo quadriculado da âncora existe para
enquadrar imagem com transparência; enquadrando diagrama, essa camada perde a
razão de ser e sobra só o palco.

> **Divergência de fonte, e ela fica registrada como divergência.** O
> quadriculado aparece na medição de `mintlify.com/docs` e **não** aparece na do
> `mint` do Devin, e nenhum dos dois documentos explica a diferença. O palco
> tingido foi escolhido pelo segundo — o que é **escolher entre fontes que
> discordam**, não confirmar uma delas. Se o quadriculado existir no `mint`, a
> ausência dele aqui deixa de ser consequência e passa a ser divergência da
> âncora.

> **O contrato de vídeo fica medido e não exercido, e o registro é o ponto.** A
> âncora tem componente de vídeo, e ele foi medido. O panlabs-docs **não o
> implementa** — pelos mesmos três motivos acima, e o primeiro deles é o que
> pesa num arquivo de vídeo. Isto está escrito para ninguém remediar a ausência
> por intuição: reabrir exige derrubar os três, não notar que falta.

> **Mermaid é a outra rota de diagrama, e ela também fica medida e não
> exercida — por um motivo diferente e mais duro.** `research/paridade-devin`
> §11 mede a cerca ` ```mermaid ` da âncora: **sem moldura nenhuma**, SVG cru
> na largura da coluna. Este site não tem como reproduzir a medição — não
> existe `@docusaurus/theme-mermaid` instalado, nem `markdown.mermaid: true`
> na config, e os dois são pré-condição para a cerca renderizar. Instalar o
> plugin seria dependência npm nova — o **zero 2** de `scripts/cinco-zeros.sh`
> (*"zero dependência npm nova"*), e `npm run zeros` reprova isso por axioma.
> **`lacuna por restrição`, não omissão** — o alvo "sem moldura" seria trivial
> de cumprir (é o comportamento default de qualquer SVG cru); o que falta é o
> mecanismo que o entregaria. Reabre se o zero 2 se mover.

## Anatomia

```html
<figure data-pd-component="frame">
  <div>…o diagrama…</div>            <!-- único div filho de figure -->
</figure>
```

**Zero partes publicadas.** `<figure>` e o único `<div>` filho alcançam por
tipo de elemento — é o componente que melhor exemplifica por que o contrato é
estreito. **Sem `<figcaption>`** — o alvo não renderiza legenda, e o
componente não tem mais prop para autor nenhuma.

O palco centra o desenho, **declara a tinta** que ele herda e é **tingido**: ele
consome `--pd-surface-raised`, com fio e sem sombra.

**O palco era a superfície de página, e isso é o mesmo defeito do bloco de
código.** Enquanto havia cartão, a moldura assentava sobre o cartão e a página
tingia por dentro dela; sem cartão, um palco da cor da página é **uma borda em
volta de nada**. A [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56)
achou o defeito no bloco de código e não olhou para cá — a causa é a mesma, o
tratamento é o mesmo, e a âncora confirma o resultado: o `Frame` dela tem fundo
tingido, não o fundo da página.

Medido: o palco contra a página dá **1,320:1** no escuro e **1,045:1** no claro.
Antes eram **1,000:1** nos dois modos — a mesma cor, duas vezes.

**Alvo medido**, do `docs.devin.ai` a 1512, em `research/paridade-devin` §11.
Sem espécime publicado no catálogo de conteúdo, `npm run paridade` ainda não
mede este componente.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Preenchimento do palco | `8px` | avaliação visual |
| Raio do palco | `16px` | avaliação visual |
| Raio da mídia interna | `12px` | avaliação visual |
| Camada de grade de pontos | presente, desvanecendo em gradiente vertical | avaliação visual |
| Botão de expandir | **não implementado** — ver nota abaixo | — |

**A grade de pontos é fato novo, e não é o quadriculado que a nota abaixo
descarta** — são duas camadas diferentes. O quadriculado indicaria
transparência de imagem; a grade de pontos é textura decorativa por trás do
diagrama, presente na âncora independente de haver ou não transparência.
Implementada com `radial-gradient` repetido mais `mask-image` em gradiente
vertical — mesmo resultado do SVG em data-URI da âncora, sem gastar um
arquivo.

**O botão de expandir fica de fora.** A rota convencional — `onClick` mais
`useState` para abrir um zoom — cai direto na régua ampla do **zero 4**
(*"zero JS de interação no catálogo"*, `scripts/cinco-zeros.sh`), que
proíbe exatamente esse par no código de `src/components/`. Uma rota nativa
por `<details>`, como accordion e expandable já fazem sem handler nenhum, não
esbarraria no zero 4 nem no zero 5 — mas "expandir" ali significa abrir
conteúdo **abaixo**, empurrando o layout, e não um zoom em camada por cima do
que já está na tela: são semânticas diferentes, e forçar uma na forma da
outra seria inventar um padrão de interação sem precedente no catálogo para
um botão que nenhuma sonda mede. Fica de fora por desproporção de escopo, não
porque o mecanismo nativo seja tecnicamente inalcançável — e o ticket dá esse
corte por nome (*"se o volume do trabalho exigir um corte em algum lugar, é
aqui que ele sai"*).

## Variantes

**Não há.** Zero props — a moldura não recebe nada do autor além do que
desenha dentro dela.

## Autoria em MDX

**Uma rota, e ela é o SVG inline.** Todo desenho entra dentro do `<Frame>`, e
entra inlinado: fora do palco o diagrama perde o fundo, e fora do documento da
página ele perde a tinta.

Desenho de origem própria, traçado à mão:

```mdx
<Frame>
<svg viewBox="0 0 520 88" role="img" aria-label="Fluxo em três estados">
  …traçado com stroke="currentColor"…
</svg>
</Frame>
```

Diagrama vindo do draw.io, importado como componente:

```mdx
import Fluxo from './fluxo-de-uma-invocacao.drawio.svg';

<Frame>
  <Fluxo role="img" aria-label="o cli.py parseia a linha e o wizard.py preenche as lacunas…" />
</Frame>
```

**O `import` é o que inlina, e ele não custa configuração.** O
`@docusaurus/plugin-svgr` já vem no preset com `test: /\.svg$/i` e `issuer` de
`mdx`, então `.drawio.svg` importado de uma página vira componente React sem
nada novo em `docusaurus.config.js`. Sem `![…]()` também some a exigência de
linha em branco dentro do `<Frame>` que o MDX 3 impõe à sintaxe de imagem.

**O arquivo é um `.drawio.svg`, e ele é ao mesmo tempo o publicado e o fonte** —
o modelo do diagrama mora no atributo `content` do `<svg>` raiz, e o autor edita
esse arquivo, não um `.drawio` à parte. Não existe passo de exportação.

As cinco regras que o acompanham:

1. **Co-locado ao markdown que o usa**, nunca em `static/`. Asset ao lado da
   página é módulo do webpack e recarrega sozinho no dev server; `static/` não.
   Diagrama usado por mais de uma página sobe para a pasta ancestral comum mais
   próxima, nunca para um depósito global.
2. **Um desenho por locale.** Rótulo é conteúdo. O mesmo arquivo servindo pt-BR
   e EN publica rótulo não traduzido, e nenhuma varredura pega isso.
3. **Nome em minúscula com hífen**, dizendo o assunto, terminando em
   `.drawio.svg`.
4. **`aria-label` obrigatório, descrevendo o mecanismo** — ver A11y, logo abaixo.
5. **Fundo transparente**, para o desenho se fundir ao palco nos dois modos.

**Nada rola horizontalmente, e quem faz isso é o palco sozinho.** O
`max-inline-size: 100%` mais `block-size: auto` que o palco põe sobre `img` e
`svg` bastam: medido nesta página, um desenho de 582px intrínsecos renderizou
582px a 1400 de viewport, 510px a 640 e 290px a 420, com a altura acompanhando e
`scrollWidth` nunca passando de `clientWidth`. O `img { max-width: 100% }` do
Infima deixou de participar quando a rota deixou de emitir `<img>`. A regra que
fecha o ponto é de conteúdo, não de CSS: **se o desenho fica ilegível na largura
da coluna, ele está complexo demais, e a saída é fatiar em dois.**

## Tokens consumidos

Camada 2: `--pd-border-default`, `--pd-surface-raised`, `--pd-text-body`.

Camada 1: `--pd-space-2`, `--pd-space-4`, `--pd-space-6`, `--pd-border-width`,
`--pd-radius`, `--pd-radius-md`.

`--pd-radius` dá a moldura do palco; `--pd-radius-md`, um degrau abaixo, dá a
da mídia por dentro — o mesmo par que separa casca e código em
[`code-group`](code-group.md).

## Light e dark

**Aqui se aplica, e é a segunda das duas exceções do catálogo.**

Ela não é sobre o componente: é sobre **o que ele enquadra**. Um diagrama é um
artefato, e artefato precisa funcionar nos dois modos.

> **A regra: um arquivo por diagrama, nunca um asset por modo. E a tinta é da
> página, nunca do arquivo.**

**Desenho traçado à mão herda a tinta direto.** O componente declara `color`, o
SVG usa `currentColor`, e o desenho fica do tom do texto em volta sem saber em
que modo está. É por isso que a exceção aparece aqui e não some — se o palco não
declarasse tinta, um diagrama correto ainda dependeria de o autor lembrar de
herdar de algum lugar.

**Desenho do draw.io não emite `currentColor`, e por isso o palco vai buscá-lo.**
A ferramenta grava a cor em duas camadas. A primeira são os atributos `fill` e
`stroke`, e ela é **sempre a paleta clara**. A segunda é um `style=` com
`light-dark()`, que vence os atributos e adapta ao `color-scheme`. O palco casa a
primeira por seletor de atributo e manda a tinta ser `currentColor`, com
`!important` para vencer o `style` embutido — as regras moram em
`componentes.css`, sob o gancho `[data-pd-component='frame']`, e o portão 1 tem
uma perna fechada só para elas.

**A segunda camada não é confiável, e isso é medição, não suspeita.** Quem a
escreve é `mxUtils.getLightDarkColor`, e ela só existe quando
`mxUtils.lightDarkColorSupported` é verdadeiro. Esse valor não é configuração: é
detecção de recurso feita na carga, contra o motor CSS que roda o editor. Em
Chromium anterior ao 123 a detecção falha, o ternário cai no ramo
`preferDarkColor ? escuro : claro`, e `preferDarkColor` é `false` fora de um
export com tema explícito. **Salvar assa a paleta clara no arquivo**, e a raiz
continua declarando `color-scheme: light dark`, porque essa linha sai do
argumento de tema do export e não da detecção. O arquivo jura ser adaptativo e
não é. Pior: em modo claro o estragado renderiza idêntico ao pixel, então quem
salvou não vê nada.

A deriva não para aí. Entre editores que **suportam** a função, a codificação
ainda diverge: o mesmo desenho salvo pelo drawio Electron sai com um `<style>` de
`@supports` e uma variável `--ge-adaptive-bg`, e salvo por webview sai com
`light-dark()` direto na declaração. Duas gramáticas para a mesma adaptação, no
mesmo repositório.

**Marca não é tinta, e a distinção é o que mantém a lista fechada em dois
pares.** O desenho com formas da AWS mediu isto: o `getLightDarkColor` deriva um
par também para cor nomeada à mão, então `#DD344C` sai como
`fill: light-dark(rgb(221, 52, 76), …)` e é tão frágil quanto o resto. Só que
assar o verde do S3 no valor claro devolve **o próprio verde do S3**, e é isso
que se quer nos dois modos. Preto e branco não: ali a cor é tinta, e tinta é da
página. A exceção é o rótulo, e ela não passa por seletor de cor: o `fontColor`
da forma AWS é azul-marinho, ilegível no escuro, e quem o resgata é a regra de
`foreignObject div`.

**O branco só vira vazado quando vem pareado com o traço preto.** Esse par é a
caixa da paleta padrão. Branco sozinho é glifo: a forma da AWS desenha o símbolo
com `fill="#ffffff" stroke="none"` por cima do quadrado de marca, e vazar isso
apaga o desenho e deixa o quadrado liso. Medido, e visto na primeira tentativa.

**Ancorar na primeira camada resolve as duas coisas de uma vez**, porque ela é a
única que existe em todo salvamento de todo editor. Medido: a página renderiza o
arquivo sadio e o arquivo assado em capturas **idênticas ao byte**, nos dois
temas. O editor deixou de importar.

**Duas otimizações do SVGO ficam desligadas em `docusaurus.config.js`, e as duas
são pré-condição desta seção.** `moveElemsAttrsToGroup` sobe atributo comum da
folha para o `<g>` pai, e sobe **mais** num arquivo assado, porque ali as cores
ficam uniformes: o seletor deixava de casar, e a seta voltava a ser preta no
escuro só nos arquivos vindos daquele editor. Medido: três grupos hasteados no
assado, zero no sadio. `convertColors` encurta `#000000` para `#000`, e seletor
de atributo casa string, não cor; desligado, existe uma forma só.

**E é por isso que `<img>` está fora.** Não por doutrina: `<img src="…svg">`
renderiza o SVG num documento separado, e nenhuma regra da página alcança o
conteúdo dele. Foi a rota escolhida enquanto se acreditava que o arquivo trazia a
própria adaptação; a premissa caiu, e a rota caiu junto. O `color-scheme` do
hospedeiro de fato atravessa a fronteira do `<img>`, e isso continua verdadeiro —
só não serve para nada quando o arquivo do outro lado não tem mais o que adaptar.

**Inlinar não vaza nada, e isso também foi conferido.** O `<style>` que o draw.io
carrega tem seletor de id (`#ge-svg-<hash>`), então ele não alcança a página; e o
`color-scheme: light dark` do `<svg>` raiz deixou de ter efeito sobre a cor,
porque as regras do palco vencem por `!important` antes dele.

Fundo do palco é a superfície levantada, que já bifurcou na camada 2. O
componente continua não sabendo em que modo está.

## Motion / reduced-motion

**Não se aplica — nada anima.** A moldura aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável.

**O nome acessível do diagrama é responsabilidade inteira do desenho**, e agora
há uma rota só: `role="img"` mais `aria-label`, no `<svg>` inline ou no
componente importado. Sem `<figcaption>`, não existe rota principal com legenda
de reforço — essa é a única.

Ela carrega duas funções somadas. O draw.io exporta **zero `<title>` e zero
`<desc>`**, então nada dentro do arquivo nomeia o desenho; e a busca do site
indexa o markdown fonte, então o rótulo é também a única coisa que torna o
diagrama encontrável, porque texto de dentro do desenho não entra no índice por
rota nenhuma. Escrever *"Diagrama de arquitetura"* desperdiça as duas.

**A segunda função precisou de uma linha no indexador, e ela é a lição da
migração.** `src/plugins/busca/index.js` descartava toda tag JSX antes de
extrair prosa, e preservava o rótulo de `![…]()`. Trocar a sintaxe de imagem por
um componente teria tirado o diagrama do índice em silêncio, e o teste que existe
não pegaria — nenhum caso cobria o rótulo dentro de tag. A regra que salva o
`aria-label` roda **antes** do descarte, e vale para qualquer componente do
catálogo que traga nome acessível, não só para diagrama.

O contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A moldura entra no catálogo | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — o componente mais usado de uma das referências |
| Sem mídia binária — nem vídeo nem screenshot | origem própria | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — três razões que não dependem de o produto ser fictício; a de [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §3 dependia, e morreu com o Trilho |
| O contrato de vídeo da âncora fica **medido e não exercido** | origem própria | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — registrado para ninguém remediar a ausência por intuição |
| Sem fundo quadriculado | **origem própria (consequência)** | ele existe para imagem com transparência, que não é o caso. **As duas fontes discordam sobre ele e nenhuma explica a diferença:** está na medição de `mintlify.com/docs` e **não** na do `mint` do Devin. O palco tingido foi escolhido pelo segundo — escolha entre fontes, **não confirmação**. Se o quadriculado existir no `mint`, a ausência dele aqui passa a ser **divergência da âncora** |
| O palco é tingido — `--pd-surface-raised` | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — ele citava `--pd-surface-page`, e sem cartão isso é uma borda em volta de nada. Mesmo defeito do bloco de código, achado lá e não aqui |
| Diagrama é um arquivo para os dois modos, nunca um asset por modo | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §7 — exceção criada pela decisão acima. A linha nascia dizendo *SVG com `currentColor`*, a [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) a estreitou a *um dos dois mecanismos*, e a correção dela devolveu o texto original: o invariante de um arquivo só nunca se mexeu, e o `currentColor` voltou a ser o mecanismo único, agora alcançado pelo palco em vez de pelo arquivo |
| Zero partes publicadas | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| **Como o diagrama chega ao MDX** — sempre inline, por `import` que o SVGR resolve | **origem própria (medição)** | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) fechou a rota em SVG inline porque `<img src="…svg">` isola o desenho num documento que nenhuma regra da página alcança. A [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) abriu uma segunda rota para o draw.io, apostando que o arquivo trazia a própria adaptação; a aposta caiu na medição do editor, e com ela a segunda rota. O `@docusaurus/plugin-svgr` já vem no preset e casa `.drawio.svg` sem configuração nova |
| Diagrama de draw.io entra como `.drawio.svg`, um arquivo que é ao mesmo tempo o publicado e o fonte | **origem própria (medição)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — o XML do diagrama mora no atributo `content` do próprio `<svg>`, e reabrir o arquivo exportado devolveu 21 de 21 células. Sem artefato derivado não existe sincronia a vigiar, e o ambiente-alvo não aceita o passo de CI que a vigiaria |
| O `.drawio.svg` co-loca ao markdown que o usa, nunca em `static/` | **origem própria (implementação)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — asset co-locado é módulo do webpack e recarrega por HMR; o mesmo arquivo em `static/` não recarrega, porque o Docusaurus grava `liveReload: false`. É a co-locação que compra o loop de salvar e ver |
| Um desenho por locale, co-locado nas duas árvores | **origem própria (consequência)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — rótulo de diagrama é conteúdo, e a cobrança 13 do portão 4 cobra cobertura de locale. O mesmo desenho com rótulo em pt-BR numa página EN é conteúdo não traduzido, e nenhuma varredura o pegaria |
| Inlinar o SVG do draw.io é a rota, e as duas objeções contra ela não se sustentaram | **origem própria (medição)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) as levantou sem medir. Conferido: o `<style>` que o draw.io carrega tem seletor de id (`#ge-svg-<hash>`) e não alcança a página; e o `color-scheme: light dark` do `<svg>` raiz deixou de decidir cor nenhuma, porque as regras do palco vencem por `!important` antes dele |
| Nada rola horizontalmente, e quem faz isso é o palco sozinho | **origem própria (medição)** | o `img { max-width: 100%% }` do Infima deixou de participar quando a rota parou de emitir `<img>`; sobrou o `max-inline-size: 100%%` mais `block-size: auto` do palco, e ele basta. Medido nesta página: 582px intrínsecos renderizaram 582px a 1400 de viewport, 510px a 640 e 290px a 420, com `scrollWidth` nunca passando de `clientWidth`. A regra que sobra é de conteúdo: ilegível na largura da coluna quer dizer complexo demais |
| **A adaptação de tema do `.drawio.svg` não é confiável, e a página deixou de depender dela** | **origem própria (medição)** | quem a escreve é `mxUtils.getLightDarkColor`, sob a guarda de `mxUtils.lightDarkColorSupported`, que é **detecção de recurso na carga** contra o motor CSS do editor, não configuração. Em Chromium anterior ao 123 a detecção falha e o salvamento assa a paleta clara, enquanto a raiz segue declarando `color-scheme: light dark` porque essa linha sai do argumento de tema do export. Reproduzido: em modo escuro o arquivo estragado dá bloco branco e seta invisível; em modo claro ele é idêntico ao pixel, e é por isso que quem salva não vê |
| O palco casa a camada de **atributo**, e é ela que sobrevive a qualquer editor | **origem própria (medição)** | os atributos `fill` e `stroke` do draw.io são sempre a paleta clara e existem em todo salvamento; o `style=` com `light-dark()` é o que some. Ancorar na primeira e vencer a segunda por `!important` fez a página renderizar o arquivo sadio e o assado em capturas **idênticas ao byte**, nos dois temas |
| Duas codificações da mesma adaptação convivem no repositório | **origem própria (medição)** | o mesmo desenho salvo pelo drawio Electron sai com `<style>` de `@supports` mais a variável `--ge-adaptive-bg`; salvo por webview sai com `light-dark()` direto na declaração. Nenhuma das duas é errada, e é justamente por isso que nenhuma serve de âncora |
| Hex dentro de seletor de atributo tem perna própria no portão 1 | **origem própria (consequência)** | ali o literal não é valor de desenho, é dado alheio sendo reconhecido. A doutrina do portão proíbe exceção e manda trocar regra por regra mais forte, então a perna nova tem lista fechada: só a paleta padrão do draw.io, `#000`/`#000000` e `#fff`/`#ffffff`, porque só ela a ferramenta gera sozinha |
| O `aria-label` entra no índice de busca | **origem própria (consequência)** | `src/plugins/busca/index.js` descartava toda tag JSX e preservava o rótulo de `![…]()`. Trocar a sintaxe de imagem por componente tiraria o diagrama do índice em silêncio, e nenhum teste cobria o caso. A extração do rótulo acessível roda antes do descarte, e vale para todo componente do catálogo |
| **Marca não é tinta**, e é isso que mantém a lista de cores fechada em dois pares | **origem própria (medição)** | o desenho com formas da AWS mostrou que o `getLightDarkColor` deriva par também para cor nomeada à mão (`#DD344C` sai como `fill: light-dark(rgb(221, 52, 76), …)`). A estabilidade não vem daí: vem de assar o valor claro devolver a própria cor da marca. Preto e branco são tinta, e tinta segue a página |
| O branco só vaza pareado com o traço preto | **origem própria (medição)** | sem o par, a regra apagou o glifo dos ícones da AWS, que é `fill="#ffffff" stroke="none"` por cima do quadrado de marca, e o desenho virou quadrado liso |
| `moveElemsAttrsToGroup` e `convertColors` do SVGO ficam desligados | **origem própria (medição)** | o primeiro sobe atributo da folha para o `<g>` pai, e sobe mais no arquivo assado porque as cores ficam uniformes: três grupos hasteados no assado contra zero no sadio, e o seletor deixava de casar exatamente nos arquivos que precisam do resgate. O segundo encurta `#000000` para `#000`, e seletor de atributo casa string |
| Preenchimento 8, raio 16 no palco, raio 12 na mídia interna | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; a versão anterior cravava `--pd-space-6` e `--pd-radius-md` nos dois níveis, sem distinguir |
| Grade de pontos, desvanecida em gradiente vertical | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11. Camada nova, independente da linha "sem fundo quadriculado" acima: quadriculado indicaria transparência de imagem, a grade é textura decorativa por trás do diagrama |
| `radial-gradient` mais `mask-image` no lugar do SVG em data-URI da âncora | **origem própria (implementação)** | mesmo resultado visual, zero asset novo — o axioma 2 vale para decoração tanto quanto para dependência |
| Sem `<figcaption>`, e a prop `caption` saiu do componente | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; zero uso em `conteudo/` no momento da remoção, então nenhuma página perdeu texto |
| Botão de expandir | **lacuna por restrição** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 mede um botão de zoom; implementá-lo pede JS de interação, e os zeros 4 e 5 de `cinco-zeros.sh` travam essa superfície ([`principios.md`](../principios.md) §5.1 define a classe) |
| Mermaid sem moldura, medido e não exercido | **lacuna por restrição** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; o site não tem `@docusaurus/theme-mermaid` nem `markdown.mermaid`, e instalar o plugin é dependência nova, zero 2 de `cinco-zeros.sh` |
