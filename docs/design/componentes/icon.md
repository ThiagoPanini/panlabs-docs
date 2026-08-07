# `icon`

## Papel

O veículo do vocabulário de ícone dentro da prosa — inclusive dentro de célula de
tabela, que é onde a medição o encontrou. É o **único** ponto em que o autor
escolhe um desenho; nos outros componentes quem escolhe é o componente.

## Anatomia

Um `<svg>` inline, vindo do registro de ícones. Não há invólucro: o elemento
renderizado **é** o desenho.

```html
<svg data-sd-component="icon" data-sd-variant="sm" aria-hidden="true" …>
```

**Zero partes publicadas.** Não há anatomia interna a publicar — o interior do
desenho é skin, e trocá-lo é trocar o arquivo.

**A técnica é SVGR inline, e ela é o que torna a compensação óptica possível**:
com o desenho inline, a espessura de traço é prop. Com máscara não seria —
máscara é estêncil, não se restiliza o interior —, e a alternativa seria um
arquivo por tamanho.

A tabela de compensação — traço mais grosso nos tamanhos menores — está em
[`icones.md`](../icones.md), porque ela é prop de componente e não token de CSS.

## Variantes

Três tamanhos, e eles são três paradas da escala de espaço.

| Variante | Onde |
| --- | --- |
| `sm` | o default; inline na prosa, no callout, no passo, na sanfona |
| `md` | quando o ícone precisa competir com texto maior |
| `lg` | o ícone de [`card`](card.md) |

**A cor não é variante: é contexto.** O ícone herda `currentColor` do que está em
volta, e é isso que faz o ícone de cartão sair na cor de marca, o de callout na
cor da variante e o de sidebar acompanhar o estado ativo — sem uma linha a mais e
sem segundo desenho para o modo escuro.

## Autoria em MDX

```mdx
O <Icon name="database" /> é o vocabulário do autor dentro da prosa,
em três tamanhos: <Icon name="database" size="md" /> e
<Icon name="database" size="lg" />.
```

`name` é um nome do manifesto — **nosso** nome, semântico, e ele não se move
quando o upstream renomeia um glifo.

**Nome inexistente lança, e o `throw` é falha de build**, porque toda página é
prerenderizada. A mensagem traz o vizinho mais próximo quando ele é plausível:

```
Ícone "rockett" não existe.
Você quis dizer "rocket"?
```

**Degradar em silêncio está descartado.** Ícone faltando é erro de conteúdo, e
conteúdo é o que mais muda; um placeholder discreto significa que o erro chega em
produção — e num transplante, falha silenciosa vira documentação publicada com
buracos.

## Tokens consumidos

Camada 1: `--sd-space-4`, `--sd-space-5`, `--sd-space-6` — os três tamanhos.

Nenhum token de cor: a tinta vem de `currentColor`.

## Light e dark

**Não se aplica.** O ícone herda a cor do contexto, e o contexto consome token
semântico.

## Motion / reduced-motion

**Não se aplica — nada anima.** Onde o desenho se move, quem move é o componente
que o contém: a rotação do caret está em [`accordion.md`](accordion.md), e o
caret não é este componente.

## A11y

**Decorativo por default**, e sai da árvore de acessibilidade. Isso está certo em
toda a autoria medida: o significado está no texto ao lado, e anunciá-lo seria
repetição.

Com rótulo explícito ele vira imagem nomeada. O contrato de estado de entrada
mora em [`foco.md`](../foco.md); o ícone não é focável em lugar nenhum.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O componente existe, e a técnica é SVGR inline | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §3a |
| Compensação óptica por tamanho | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §2 — habilitada pela escolha de SVGR |
| Nome inexistente quebra o build, com sugestão | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §6 |
| Cor por contexto, via `currentColor` | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) e [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §7 |
| Decorativo por default | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §6 |
| Três tamanhos, sobre a escala de espaço | **origem própria (implementação)** | a tabela de compensação da [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §2.1 tem quatro faixas; três paradas da escala as cobrem sem abrir token de tamanho |
| Zero partes publicadas | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
