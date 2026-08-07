# `verb-badge`

## Papel

A pílula de verbo HTTP — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Ela aparece no
cabeçalho de cada página de endpoint e ao lado do item de endpoint na sidebar, e
é o sinal mais rápido de "o que esta operação faz com os seus dados".

## Anatomia

```html
<span data-sd-component="verb-badge" data-sd-variant="post">POST</span>
```

**Zero partes publicadas.** Não há anatomia interna: a pílula é o texto.

**Sem ícone.** O verbo já é o significado, e um glifo ali compete com o texto.

O texto é o identificador HTTP em maiúscula, e ele **não é traduzível** — é
protocolo, não prosa.

## Variantes

Cinco, e a cor sai de uma **escada de dano** em vez de convenção copiada.

| Variante | Cor-base | Posição na escada |
| --- | --- | --- |
| `get` | `--sd-state-info` | ler |
| `post` | `--sd-state-success` | criar |
| `put` · `patch` | `--sd-state-warn` | substituir · alterar |
| `delete` | `--sd-state-danger` | destruir |

A medição **divergiu** aqui: um sistema pinta leitura de verde e criação de azul,
outro inverte. Onde a medição diverge não há valor a herdar, e a régua do projeto
é derivar.

**`delete` não foi escolhido: já estava escrito.** A direção de arte havia
travado o matiz de perigo *"para pílula de verbo `DELETE`"*. Fixado esse ponto, a
escada é a única ordenação monotônica que os outros quatro admitem — e ela é
**derivável em vez de memorizável**, que é o teste do axioma 6.

**Custo zero em token novo.** A lista fechada de quatro matizes de estado
continua fechada, e o corporativo continua trocando quatro cores.

**Verbo fora da escada lança.** Degradar em silêncio produziria uma pílula sem
cor numa página de referência — o mesmo modo de falhar que o registro de ícones
fecha.

## Autoria em MDX

```mdx
<VerbBadge verb="GET" /> <VerbBadge verb="POST" /> <VerbBadge verb="DELETE" />
```

Na Referência da API, quem escreve a pílula é o gerador, não a mão — mas o
componente é global e o autor pode usá-lo em prosa, que é onde a medição
encontrou o uso inline.

## Tokens consumidos

Camada 2: `--sd-state-info`, `--sd-state-success`, `--sd-state-warn`,
`--sd-state-danger`, e os quatro `*-fill` correspondentes.

Camada 1: `--sd-space-2`, `--sd-radius-xs`, `--sd-type-xs`, `--sd-font-mono`,
`--sd-weight-heading`, `--sd-leading-ui`.

Camada 3, declarados no escopo do componente: `--sd-verb-fill` e
`--sd-verb-ink`. É a variante que os move.

## Light e dark

**Não se aplica.** Preenchimento e texto saem da **fórmula do sistema** — a mesma
dos quatro estados —, e não do alfa único que a medição achou na âncora. A
divergência é deliberada: uma segunda fórmula de alfa faria o componente saber em
que modo está.

## Motion / reduced-motion

**Não se aplica — nada anima.** A pílula é rótulo, não estado.

## A11y

Sem foco próprio: a pílula é texto dentro de um cabeçalho ou de um link. A cor
**não é o único portador de significado** — o verbo está escrito por extenso, o
que satisfaz o critério de não depender de cor. O contrato de estado de entrada
mora em [`foco.md`](../foco.md).

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Escada de dano nos verbos | delta deliberado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.1 — a medição diverge entre dois sistemas |
| `delete` no matiz de perigo | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12), verbatim |
| Fórmula de alfa do sistema, não a da âncora | delta deliberado | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.1 — componente cego ao modo ([#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §7) |
| Peso do topo da escala, não um peso novo | origem própria | [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) §7.1 |
| Raio da escada de forma | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §7 — já nomeava *"pílula de verbo"* |
| Sem ícone | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §8 |
| Verbo desconhecido lança | **origem própria (implementação)** | mesma doutrina do registro de ícones da [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §6 |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
