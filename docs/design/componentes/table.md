# `table`

## Papel

A tabela — Markdown puro, mais o invólucro que a torna rolável **e** semântica.

O autor não escreve tag nenhuma: o componente entra pela chave `table` do
registro global, então **toda** tabela do site nasce embrulhada. É isso que faz a
correção alcançar a tabela que ninguém lembrou de embrulhar.

## Anatomia

```html
<div data-sd-component="table" role="region" tabindex="0" aria-label="Tabela">
  <table>…</table>
</div>
```

**Zero partes publicadas.** `<table>`, `<thead>`, `<th>` e `<td>` alcançam todos
por tipo de elemento — a tabela é o componente com a anatomia mais bem nomeada da
plataforma.

Números em `tabular-nums`: numeral de largura fixa é o que faz uma coluna de
valores ler como coluna em vez de como texto.

### O invólucro corrige um defeito do framework

O Infima declara `table { display: block; overflow: auto }`. Isso resolve o
transbordo e cobra dois preços calados:

- **`display: block` tira a semântica de tabela** da árvore de acessibilidade —
  linha, coluna e cabeçalho deixam de ser anunciados como tal;
- **o contêiner que rola não é focável**, então quem navega por teclado não
  consegue rolar uma tabela larga.

O invólucro devolve as duas coisas: a rolagem sai do `<table>` e vai para uma
região nomeada e alcançável por Tab, e o `<table>` volta a ser `display: table`.

## Variantes

**Não há.** A tabela é a de Markdown, e Markdown não tem variante de tabela.

Faixa alternada, alinhamento por coluna e cabeçalho fixo **não entram**: os três
são do framework ou do Markdown, e nenhum deles apareceu como necessidade na
medição.

## Autoria em MDX

```markdown
| Código | Meio | Significado |
| --- | --- | --- |
| `saldo_insuficiente` | Pix, cartão | O pagador não tem o valor disponível |
| `cartao_expirado` | cartão | A validade passou |
```

Nada além disso. Se a tabela for larga, ela rola sozinha.

## Tokens consumidos

Camada 2: `--sd-border-subtle`, `--sd-text-body`, `--sd-text-strong` — todos por
meio do adaptador, que já escreve as variáveis de tabela do framework.

Camada 1: `--sd-space-6`, `--sd-type-sm`, `--sd-leading-ui`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica — nada anima.** A tabela aparece com a página e não muda de
estado.

## A11y

**Este é o único componente do catálogo onde ARIA aparece**, e ele aparece porque
o HTML não tem elemento para o caso: não existe "contêiner rolável nomeado" nativo.

Três coisas juntas, e nenhuma funciona sozinha: `role="region"` para o leitor de
tela anunciar a fronteira, `tabindex` para o teclado alcançar a rolagem, e um
**nome acessível** — região sem nome é defeito, e o rótulo vem da camada de i18n.

Isso poderia disparar a exceção de foco que o contrato tem para o invólucro do
link de pular conteúdo. Não dispara: aquela exceção exige o link como filho
direto, e aqui o filho é um `<table>`. O resto do contrato de estado de entrada
mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Markdown puro, mais invólucro e `tabular-nums` | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — *"só estilo + invólucro de rolagem"* |
| O invólucro é o único ARIA construído do catálogo | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §6 |
| Registrado pela chave `table`, não por tag | **origem própria (implementação)** | o autor escreve Markdown; a correção precisa alcançar toda tabela |
| `display: block` do framework tira a semântica de tabela | **origem própria (medição)** | verificado no fonte do Infima ao implementar este slice |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
