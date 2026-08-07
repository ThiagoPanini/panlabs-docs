# `tabs`

## Papel

Alterna conteúdo irmão — a mesma explicação por SDK, por ambiente, por meio de
pagamento. É o único componente do catálogo que o Docusaurus entrega **inteiro**,
comportamento e ARIA incluídos.

## Anatomia

**Consumido como está. Zero swizzle.** O que o repagina é CSS sobre as classes do
Infima.

```html
<ul role="tablist">
  <li role="tab" aria-selected="true" tabindex="0">…</li>
  <li role="tab" aria-selected="false" tabindex="-1">…</li>
</ul>
<div>…painel…</div>
```

A anatomia visual: a lista ganha um fio embaixo, a aba ganha um sublinhado de
duas vezes o fio, e uma margem negativa de um fio **puxa o sublinhado por cima da
régua**. Aba inativa fica com o sublinhado transparente — é isso que impede o
texto de pular quando a seleção muda.

**Este componente é a exceção declarada do contrato de partes**, e é a única. Ele
não emite `data-sd-component`, porque o DOM não é nosso. O contrato de skin dele
são as classes do Infima e o ARIA que o Docusaurus já emite.

Consequência que vale escrita: para ele, a skin corporativa engancha nas **mesmas
classes** que o nosso CSS, então aqui não existe o degrau de especificidade que
separa as duas camadas no resto do catálogo. Onde a ordem de carga decidiria, o
nosso seletor soma o **tipo do elemento** — `li.tabs__item` em vez de
`.tabs__item` — para vencer sem depender de ordem e sem um único `!important`.

**Estado é lido do ARIA**, não da classe de modificador do framework:
`[aria-selected]` já carrega a informação, e o HTML acessível é obrigado a
carregá-la de qualquer jeito.

## Variantes

**Não há.** O componente vem do Docusaurus e as props que usamos são as que a
medição encontrou: `groupId`, `queryString` e, em cada aba, `label` e `value`.

A prop de abas esticadas do Infima **não é usada**: aba que preenche a largura
inteira lê como botão, e a régua deste desenho é uma régua.

## Autoria em MDX

```mdx
<Tabs groupId="sdk" queryString>
<TabItem value="node" label="Node">

Instalação por `npm`, tipos inclusos.

</TabItem>
<TabItem value="python" label="Python">

Instalação por `pip`, compatível com 3.10 em diante.

</TabItem>
</Tabs>
```

**`groupId` sincroniza a escolha entre páginas**; `queryString` põe a escolha na
URL, o que a torna **linkável**. Isso era um delta que a pesquisa marcou como
digno de importar de outro sistema, e ele entra sem componente novo e sem uma
linha de JavaScript nossa.

`groupId` é obrigatório quando `queryString` é declarado sem nome — o próprio
Docusaurus falha alto se faltar.

## Tokens consumidos

Camada 2: `--sd-accent`, `--sd-border-default`, `--sd-text-muted`,
`--sd-text-strong`.

Camada 1: `--sd-space-1`, `--sd-space-2`, `--sd-space-3`, `--sd-border-width`,
`--sd-type-sm`, `--sd-weight-ui`, `--sd-leading-ui`, `--sd-move-state`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

`--sd-move-state`, em cor de texto e cor do sublinhado. Herda o resto — inclusive
o que o próprio Docusaurus anima, porque o adaptador de mão única escreve as
variáveis de transição do Infima a partir da nossa escala.

Hover inteiro sob `(hover: hover)`. O hover do framework pinta um fundo; aqui ele
só revela a tinta do texto — fundo numa régua a engorda.

## A11y

**O Docusaurus entrega `role="tablist"`, `aria-selected` e `tabindex` roving, e
nós não escrevemos um `keydown`.** É o único componente do catálogo cujo
comportamento interativo vem pronto de terceiro em vez de vir do navegador, e é
por isso que ele é consumido em vez de reescrito: reimplementar tablist acessível
à mão é trocar dependência auditada por dívida própria.

O anel de foco é universal e mora em [`foco.md`](../foco.md); a aba é um
`[role="tab"]`, que aquele contrato já cobre.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Consumido sem swizzle | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — `Tabs` é `unsafe`, e a anatomia sai só de CSS |
| Sublinhado puxado sobre a régua | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — anatomia medida |
| `queryString` põe a escolha na URL | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — delta de outro sistema, aqui de graça |
| Exceção declarada do contrato de partes | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| Estado lido do ARIA | origem própria | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) §5 |
| Seletor com tipo de elemento | **origem própria (implementação)** | empate de especificidade com a skin e com o framework resolvido sem depender de ordem de carga |
| Sem abas esticadas | origem própria | este slice |
