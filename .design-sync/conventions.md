# panlabs-docs — como construir com este sistema

Catálogo **fechado** de 14 componentes de documentação. Não há botão, input, select
nem modal: o que não está na lista abaixo você monta com HTML seu, pintado com os
tokens deste sistema.

## 1. Envolva a página em `ThemeRoot`

```jsx
const {ThemeRoot, Callout} = window.PanlabsDocs;

<ThemeRoot>              {/* escuro, o padrão */}
  <main>…</main>
</ThemeRoot>

<ThemeRoot mode="light">  {/* o claro é completo, e legítimo */}
  <main>…</main>
</ThemeRoot>
```

**Sem ele o texto some.** A paleta ESCURA mora em `:root` — é a canônica e o
fallback — e a clara vem em `:root[data-theme='light']`. `ThemeRoot` escreve esse
atributo em `<html>`, que é o único elemento que o seletor alcança. Sem o atributo
você recebe ink de modo escuro sobre o fundo que o hospedeiro pintar, e o defeito é
contraste, não erro.

**O escuro é o padrão porque é o canônico** — `docusaurus.config.js` diz, na
própria linha que o fixa: "Dark is canonical, it's where the design was born". O
claro está inteiro e é legítimo; ele só não é o ponto de partida.

## 2. O idioma: `var(--pd-*)`, sempre

**Não existe classe utilitária e não existe prop de estilo.** Componente vem pronto;
o layout e todo elemento seu você escreve em CSS, e todo valor sai de um token. Não
escreva hex, px, `cubic-bezier` nem `ms` — o sistema tem uma única fonte de literais.

| Família | Nomes |
| --- | --- |
| Fundo | `--pd-surface-page` `-raised` `-code` `-wash` `-scrim` |
| Ink | `--pd-text-strong` `-body` `-muted` `-faint` `-inverse` |
| Marca | `--pd-accent` `--pd-accent-hover` `--pd-accent-contrast` |
| Borda | `--pd-border-subtle` `-default` `-strong` `--pd-border-width` |
| Estado | `--pd-state-{info,success,warn,danger}` + `-fill` e `-edge` |
| Espaço | `--pd-space-1 2 3 4 5 6 8 10 12 16` |
| Tipo | `--pd-type-xs sm base lg xl 2xl 3xl 4xl` |
| Entrelinha | `--pd-leading-prose` `-ui` `-code` `-h1..-h4` `-screen` |
| Peso | `--pd-weight-body` `-ui` `-heading` |
| Fonte | `--pd-font-body` `--pd-font-heading` `--pd-font-mono` |
| Raio | `--pd-radius` `--pd-radius-xs sm md lg full` |
| Sombra | `--pd-shadow-lip` `-raised` `-cast` `-float` |
| Movimento | `--pd-move-state` `-enter` `-reveal` `-expand` `-flip` `-ambient` `-showcase` |
| Código | `--pd-code-fg` `-keyword` `-string` `-function` `-comment` `-constant` `-operator` `-parameter` |

Um valor novo **deriva** de um que já existe, por `color-mix()`, `oklch(from …)` ou
`calc()`. Nunca por número solto.

**`code` inline só herda `font-family` daqui.** O fundo e o respiro eram do Infima,
que não embarca. Declare você: `background: var(--pd-surface-code); color:
var(--pd-code-fg); padding: var(--pd-space-1); border-radius: var(--pd-radius-xs)`.

## 3. Onde está a verdade

`styles.css` e os arquivos que ele importa: os tokens inteiros, o CSS de componente,
as fontes. Leia antes de estilizar — a tabela acima é resumo, o arquivo é o contrato.
Cada componente tem seu `.prompt.md`, com quando usar e a regra que torna um uso
errado errado.

## 4. Um exemplo idiomático

```jsx
const {ThemeRoot, Steps, Step, Callout, CardGroup, Card} = window.PanlabsDocs;

<ThemeRoot>
  <main style={{
    maxWidth: 'var(--pd-container-width)',
    margin: '0 auto',
    padding: 'var(--pd-space-8)',
    display: 'grid',
    gap: 'var(--pd-space-6)',
  }}>
    <h1 style={{fontSize: 'var(--pd-type-3xl)', lineHeight: 'var(--pd-leading-h1)'}}>
      Instalação
    </h1>

    <Callout variant="warning" title="A troca é destrutiva">
      <p>Conserte o arquivo à mão primeiro, e só então rode a instalação de novo.</p>
    </Callout>

    <Steps>
      <Step title="Instale o CLI"><p>Nada sobra na máquina depois.</p></Step>
      <Step title="Confira" icon="check"><p>Saída 0 significa que passou.</p></Step>
    </Steps>

    <CardGroup>
      <Card title="Conceitos" icon="book-open" href="/conceitos">
        <p>O vocabulário que o resto assume.</p>
      </Card>
    </CardGroup>
  </main>
</ThemeRoot>
```

Prosa dentro de um componente vai **em `<p>`**. Vários componentes são `flex`/`grid`,
e um nó de texto solto vira uma linha própria.

`icon` aceita só os 15 slugs do registro gerado — a lista está no `.d.ts` de `Icon`,
e um nome fora dela não desenha nada.
