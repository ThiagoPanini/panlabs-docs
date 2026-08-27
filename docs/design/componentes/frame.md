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

**Duas rotas, e a seção Light e dark diz qual vale para qual desenho.** As duas
entram dentro do `<Frame>`, sempre: fora dele o diagrama perde o palco, e é o
palco que declara a tinta que a primeira rota herda.

Desenho de origem própria, traçado à mão, herdando a tinta do palco:

```mdx
<Frame>
<svg viewBox="0 0 520 88" role="img" aria-label="Fluxo em três estados">
  …traçado com stroke="currentColor"…
</svg>
</Frame>
```

Diagrama vindo do draw.io, que traz a própria adaptação de tema:

```mdx
<Frame>

![o cli.py parseia a linha e o wizard.py preenche as lacunas…](./fluxo-de-uma-invocacao.drawio.svg)

</Frame>
```

As linhas em branco dentro do `<Frame>` não são estilo: sem elas o MDX 3 lê o
`![…]()` como texto, e a imagem não vira imagem.

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
4. **`alt` obrigatório, descrevendo o mecanismo** — ver A11y, logo abaixo.
5. **Fundo transparente**, para o desenho se fundir ao palco nos dois modos.

**Nada rola horizontalmente, e nada custa CSS para isso.** O Infima já traz
`img { max-width: 100% }`, e o palco acrescenta `max-inline-size: 100%` sobre
`img` e `svg`; diagrama mais largo que a coluna **encolhe para caber**, e SVG
não perde nitidez ao reduzir. A regra que fecha o ponto é de conteúdo, não de
CSS: **se o desenho fica ilegível na largura da coluna, ele está complexo demais,
e a saída é fatiar em dois.**

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

> **A regra: um arquivo por diagrama, nunca um asset por modo. O que bifurca é o
> mecanismo, e quem o escolhe é a procedência do desenho.**

**Desenho traçado à mão, que herda a tinta do palco, entra inline.** O
componente declara `color`, o SVG usa `currentColor`, e o desenho fica do tom do
texto em volta sem saber em que modo está. É por isso que a exceção aparece aqui
e não some — se o palco não declarasse tinta, um diagrama correto ainda
dependeria de o autor lembrar de herdar de algum lugar. Para esse caso a
proibição de `<img>` continua de pé, e pela razão medida: `<img src="…svg">`
renderiza o SVG num documento separado, e `currentColor` ali resolve contra o
`color` daquele documento, não contra o do palco.

**Desenho que traz a própria adaptação de tema entra por `<img>`.** O critério é
o mecanismo, não de onde o arquivo veio. É o caso do diagrama do draw.io, que
não emite `currentColor` em lugar nenhum: ele emite `light-dark()`, que resolve contra o `color-scheme`, e o
`color-scheme` do documento hospedeiro **atravessa** a fronteira do `<img>` e
vence a preferência do sistema operacional. Um arquivo, dois modos, pela outra
ponta — e sem JavaScript, sem `ThemedImage`, sem dois assets. O invariante que a
regra protege é o mesmo, e é ele que sobrevive; o `currentColor` era o mecanismo
de um caso, não a regra.

**E inlinar esse SVG não é a alternativa mais segura: quebra as duas coisas.** O
`color-scheme: light dark` que o draw.io grava no `<svg>` raiz vence o herdado de
`:root`, e o diagrama passaria a seguir o sistema operacional enquanto o resto do
site segue o botão. O `<style>` que ele carrega vazaria do desenho para a página
inteira. A rota de asset registrado não é uma concessão aqui — é a correta.

Fundo do palco é a superfície levantada, que já bifurcou na camada 2. O
componente continua não sabendo em que modo está.

## Motion / reduced-motion

**Não se aplica — nada anima.** A moldura aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável.

**O nome acessível do diagrama é responsabilidade inteira do desenho**, e a rota
depende de como ele chega. Sem `<figcaption>`, o SVG inline depende de
`role="img"` mais rótulo no `<svg>` — não uma rota principal com a legenda como
reforço, e sim a única que existe. O SVG que entra por `<img>` depende do `alt`,
com a mesma força e por dois motivos somados: o draw.io exporta **zero `<title>`
e zero `<desc>`**, então nada dentro do arquivo nomeia o desenho; e a busca do
site indexa o markdown fonte, então o `alt` é também a única coisa que torna o
diagrama encontrável, porque rótulo de dentro do desenho não entra no índice por
rota nenhuma. Escrever *"Diagrama de arquitetura"* desperdiça as duas funções.
O contrato de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A moldura entra no catálogo | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — o componente mais usado de uma das referências |
| Sem mídia binária — nem vídeo nem screenshot | origem própria | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — três razões que não dependem de o produto ser fictício; a de [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §3 dependia, e morreu com o Trilho |
| O contrato de vídeo da âncora fica **medido e não exercido** | origem própria | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — registrado para ninguém remediar a ausência por intuição |
| Sem fundo quadriculado | **origem própria (consequência)** | ele existe para imagem com transparência, que não é o caso. **As duas fontes discordam sobre ele e nenhuma explica a diferença:** está na medição de `mintlify.com/docs` e **não** na do `mint` do Devin. O palco tingido foi escolhido pelo segundo — escolha entre fontes, **não confirmação**. Se o quadriculado existir no `mint`, a ausência dele aqui passa a ser **divergência da âncora** |
| O palco é tingido — `--pd-surface-raised` | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — ele citava `--pd-surface-page`, e sem cartão isso é uma borda em volta de nada. Mesmo defeito do bloco de código, achado lá e não aqui |
| Diagrama é um arquivo para os dois modos, nunca um asset por modo | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §7 — exceção criada pela decisão acima. A linha nascia dizendo *SVG com `currentColor`*, e a [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) a estreitou: o invariante de um arquivo só ficou de pé, e o `currentColor` desceu a mecanismo de uma das duas rotas |
| Zero partes publicadas | origem própria | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| **Como o diagrama chega ao MDX** — inline quando herda a tinta do palco, `<img>` quando traz a própria adaptação | **origem própria (consequência)** | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) fechou a rota em SVG inline porque `<img src="…svg">` não herda `currentColor`, e a razão foi conferida por medição: dentro do `<img>` o `currentColor` vira preto mesmo com o palco declarando outra tinta. Ela continua verdadeira, e apenas não alcança desenho que nunca usa `currentColor`. [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) mede o outro caso e o **delimita**, em vez de abrir exceção genérica |
| Diagrama de draw.io entra como `.drawio.svg`, um arquivo que é ao mesmo tempo o publicado e o fonte | **origem própria (medição)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — o XML do diagrama mora no atributo `content` do próprio `<svg>`, e reabrir o arquivo exportado devolveu 21 de 21 células. Sem artefato derivado não existe sincronia a vigiar, e o ambiente-alvo não aceita o passo de CI que a vigiaria |
| O `.drawio.svg` co-loca ao markdown que o usa, nunca em `static/` | **origem própria (implementação)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — asset co-locado é módulo do webpack e recarrega por HMR; o mesmo arquivo em `static/` não recarrega, porque o Docusaurus grava `liveReload: false`. É a co-locação que compra o loop de salvar e ver |
| Um desenho por locale, co-locado nas duas árvores | **origem própria (consequência)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — rótulo de diagrama é conteúdo, e a cobrança 13 do portão 4 cobra cobertura de locale. O mesmo desenho com rótulo em pt-BR numa página EN é conteúdo não traduzido, e nenhuma varredura o pegaria |
| Inlinar o SVG do draw.io fica fora | **origem própria (medição)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — o `color-scheme` que ele grava no `<svg>` raiz vence o herdado de `:root`, e o `<style>` que ele carrega vazaria do desenho para a página inteira |
| Nada rola horizontalmente, e não custa CSS | **origem própria (medição)** | [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145) — o Infima já traz `img { max-width: 100% }` e o palco acrescenta `max-inline-size: 100%`; medido, um desenho de 662px exibiu 622px na coluna. A regra que sobra é de conteúdo: ilegível na largura da coluna quer dizer complexo demais |
| Preenchimento 8, raio 16 no palco, raio 12 na mídia interna | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; a versão anterior cravava `--pd-space-6` e `--pd-radius-md` nos dois níveis, sem distinguir |
| Grade de pontos, desvanecida em gradiente vertical | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11. Camada nova, independente da linha "sem fundo quadriculado" acima: quadriculado indicaria transparência de imagem, a grade é textura decorativa por trás do diagrama |
| `radial-gradient` mais `mask-image` no lugar do SVG em data-URI da âncora | **origem própria (implementação)** | mesmo resultado visual, zero asset novo — o axioma 2 vale para decoração tanto quanto para dependência |
| Sem `<figcaption>`, e a prop `caption` saiu do componente | herdado | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; zero uso em `conteudo/` no momento da remoção, então nenhuma página perdeu texto |
| Botão de expandir | **lacuna por restrição** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11 mede um botão de zoom; implementá-lo pede JS de interação, e os zeros 4 e 5 de `cinco-zeros.sh` travam essa superfície ([`principios.md`](../principios.md) §5.1 define a classe) |
| Mermaid sem moldura, medido e não exercido | **lacuna por restrição** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `research/paridade-devin` §11; o site não tem `@docusaurus/theme-mermaid` nem `markdown.mermaid`, e instalar o plugin é dependência nova, zero 2 de `cinco-zeros.sh` |
