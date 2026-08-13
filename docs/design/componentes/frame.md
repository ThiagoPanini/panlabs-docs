# `frame`

## Papel

Enquadra um **diagrama** e o legenda.

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
razão de ser e sobra palco mais legenda.

> **Divergência de fonte, e ela fica registrada como divergência.** O
> quadriculado aparece na medição de `mintlify.com/docs` e **não** aparece na do
> `mint` do Devin, e nenhum dos dois documentos explica a diferença. O palco
> tingido foi escolhido pelo segundo — o que é **escolher entre fontes que
> discordam**, não confirmar uma delas. Se o quadriculado existir no `mint`, a
> ausência dele aqui deixa de ser consequência e passa a ser divergência da
> âncora.

> **O contrato de vídeo fica medido e não exercido, e o registro é o ponto.** A
> âncora tem componente de vídeo, e ele foi medido. O shinydoc **não o
> implementa** — pelos mesmos três motivos acima, e o primeiro deles é o que
> pesa num arquivo de vídeo. Isto está escrito para ninguém remediar a ausência
> por intuição: reabrir exige derrubar os três, não notar que falta.

## Anatomia

```html
<figure data-sd-component="frame">
  <div>…o diagrama…</div>            <!-- único div filho de figure -->
  <figcaption>…</figcaption>         <!-- alcançável por tipo -->
</figure>
```

**Zero partes publicadas.** `<figure>`, `<figcaption>` e o único `<div>` filho
alcançam todos por tipo de elemento — é o componente que melhor exemplifica por
que o contrato é estreito.

O palco centra o desenho, **declara a tinta** que ele herda e é **tingido**: ele
consome `--sd-surface-raised`, com fio e sem sombra.

**O palco era a superfície de página, e isso é o mesmo defeito do bloco de
código.** Enquanto havia cartão, a moldura assentava sobre o cartão e a página
tingia por dentro dela; sem cartão, um palco da cor da página é **uma borda em
volta de nada**. A [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56)
achou o defeito no bloco de código e não olhou para cá — a causa é a mesma, o
tratamento é o mesmo, e a âncora confirma o resultado: o `Frame` dela tem fundo
tingido, não o fundo da página.

Medido: o palco contra a página dá **1,320:1** no escuro e **1,045:1** no claro.
Antes eram **1,000:1** nos dois modos — a mesma cor, duas vezes.

## Variantes

**Não há.** Uma prop, `caption`, e ela é opcional — moldura sem legenda continua
sendo moldura.

## Autoria em MDX

```mdx
<Frame caption="O ciclo de vida de uma cobrança em Pix, do POST à liquidação.">
<svg viewBox="0 0 520 88" role="img" aria-label="Fluxo em três estados">
  …traçado com stroke="currentColor"…
</svg>
</Frame>
```

## Tokens consumidos

Camada 2: `--sd-border-default`, `--sd-surface-raised`, `--sd-text-body`,
`--sd-text-muted`.

Camada 1: `--sd-space-2`, `--sd-space-6`, `--sd-border-width`,
`--sd-radius-md`, `--sd-type-sm`.

## Light e dark

**Aqui se aplica, e é a segunda das duas exceções do catálogo.**

Ela não é sobre o componente: é sobre **o que ele enquadra**. Um diagrama é um
artefato, e artefato precisa funcionar nos dois modos.

> **A regra: diagrama é SVG usando `currentColor`, nunca cor assada. Um arquivo
> por diagrama, não um por modo.**

O que o componente faz para sustentar a regra é uma linha: o palco declara
`color`, e o desenho herda. É por isso que a exceção aparece aqui e não some — se
o palco não declarasse tinta, um diagrama correto ainda dependeria de o autor
lembrar de herdar de algum lugar.

**E a mesma regra fecha a rota de entrega, que estava em aberto:** o diagrama
chega ao MDX como **SVG inline, um arquivo por diagrama, nunca `<img>`**.
`<img src="…svg">` renderiza o SVG num documento separado, e `currentColor` ali
resolve contra o `color` daquele documento, não contra o do palco. A rota de
asset registrado é, portanto, **incompatível** com a regra que o próprio
componente carrega. A lacuna existia porque ninguém tinha ligado as duas pontas.

Fundo do palco é a superfície levantada, que já bifurcou na camada 2. O
componente continua não sabendo em que modo está.

## Motion / reduced-motion

**Não se aplica — nada anima.** A moldura aparece com a página e não muda de
estado.

## A11y

Sem foco próprio: não há elemento focável.

`<figure>` e `<figcaption>` são a associação semântica entre desenho e legenda, e
é por isso que o componente usa os dois em vez de dois `<div>`.

**O nome acessível do diagrama é responsabilidade do desenho, não da moldura.** A
legenda descreve; ela não substitui `role="img"` mais rótulo no SVG. O contrato
de estado de entrada mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A moldura entra no catálogo | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — o componente mais usado de uma das referências |
| Sem mídia binária — nem vídeo nem screenshot | origem própria | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — três razões que não dependem de o produto ser fictício; a de [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §3 dependia, e morreu com o Trilho |
| O contrato de vídeo da âncora fica **medido e não exercido** | origem própria | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — registrado para ninguém remediar a ausência por intuição |
| Sem fundo quadriculado | **origem própria (consequência)** | ele existe para imagem com transparência, que não é o caso. **As duas fontes discordam sobre ele e nenhuma explica a diferença:** está na medição de `mintlify.com/docs` e **não** na do `mint` do Devin. O palco tingido foi escolhido pelo segundo — escolha entre fontes, **não confirmação**. Se o quadriculado existir no `mint`, a ausência dele aqui passa a ser **divergência da âncora** |
| O palco é tingido — `--sd-surface-raised` | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — ele citava `--sd-surface-page`, e sem cartão isso é uma borda em volta de nada. Mesmo defeito do bloco de código, achado lá e não aqui |
| Diagrama é SVG com `currentColor`, um arquivo para os dois modos | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §7 — exceção criada pela decisão acima |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| **Como o diagrama chega ao MDX** — SVG inline, nunca `<img>` | **origem própria (consequência)** | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — `<img src="…svg">` não herda `currentColor`, então a rota de asset registrado é incompatível com a regra que o componente já carregava. A lacuna existia por ninguém ter ligado as duas pontas |
