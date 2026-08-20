# `response-field`

## Papel

Um **campo de retorno** — o que a chamada devolve. Mesma informação que
[`param-field`](param-field.md) vista do outro lado da chamada, e por isso mesma
anatomia. Nas páginas de **tipo** ele descreve os atributos da instância, que é o
mesmo papel visto de outro ângulo: o que se lê de volta.

Ele é **recursivo**: um campo de objeto contém outros campos, que contêm outros.
O teto do sistema é **quatro níveis**, e a dona dele é
`Procedimentos › Infraestrutura › O output de um módulo` — escrita à mão no
acervo, com exatamente quatro.

**Um campo cujo tipo é outra entrada do contrato não aninha — ele linka.** É o
que dispensou o reset de profundidade que a contagem precisava quando o contrato
tinha `$ref`: não existe expansão embutida cujo orçamento dependa de onde ela foi
referenciada. Ver [`referencia.md`](../referencia.md) §5.3.

## Anatomia

Idêntica à de [`param-field`](param-field.md), com uma diferença: o valor de
`data-sd-component`.

```html
<div id="campo-response-field-…">
  <p>
    <a href="#campo-response-field-…" data-sd-part="ancora">#</a>
    <code>…</code>
    <span data-sd-part="meta">…</span>
  </p>
  <div>…descrição, e a recursão…</div>
</div>
```

**Uma parte publicada, e a âncora de linha que não é**, a mesma distinção e
pelo mesmo motivo de [`param-field`](param-field.md) § Anatomia.

**A recursão não custa JavaScript.** Ela é o autor escrevendo um campo dentro de
um [`expandable`](expandable.md) dentro de outro campo, e o `<details>` nativo é
quem dobra cada nível.

Os dois compartilham a implementação com uma prop de espécie. Duas anatomias
paralelas para a mesma informação é como se acumula divergência visual entre
irmãos.

## Variantes

As mesmas de [`param-field`](param-field.md): o default e `deprecated`.

**Nada de obrigatoriedade tem leitura aqui.** Um campo de retorno não é
obrigatório nem opcional — ou a chamada o devolve, ou não. O componente aceita a
prop porque a implementação é compartilhada, e o gerador nunca a emite nesta
espécie.

## Autoria em MDX

```mdx
<ResponseField name="caminho" type="Path">
O arquivo escrito, ou o que teria sido escrito sob `diff=True`.
</ResponseField>

<ResponseField name="recusas" type="list[dict]">
As recusas encontradas. Vazia quando a esteira passa.

<Expandable title="list[dict]">

<ResponseField name="ponteiro" type="str">
O nó ofensor, em caminho pontilhado.
</ResponseField>

</Expandable>
</ResponseField>
```

## Tokens consumidos

Os mesmos de [`param-field`](param-field.md) — camada 2: `--sd-border-subtle`,
`--sd-text-body`, `--sd-text-muted`, `--sd-text-strong`, `--sd-accent`; camada 1:
`--sd-space-1`, `--sd-space-2`, `--sd-space-4`, `--sd-space-6`, `--sd-space-10`,
`--sd-border-width`, `--sd-radius-xs`, `--sd-radius-sm`, `--sd-type-xs`,
`--sd-type-sm`, `--sd-font-mono`, `--sd-weight-ui`.

## Light e dark

**Não se aplica.** Consome token semântico e não conhece modo.

## Motion / reduced-motion

**Não se aplica ao campo — nada anima nele.** O que anima é a recursão, e está em
[`expandable.md`](expandable.md).

## A11y

Sem foco próprio: o campo é texto. O contrato de estado de entrada mora em
[`foco.md`](../foco.md).

**Ele nunca alimentou playground, e isso deixou de ser assimetria**: a edição de
valores da referência gerada mora no painel da rota, então nem este nem
[`param-field`](param-field.md) carregam estado.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Componente do zero, recursivo | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — *"`ResponseField` é recursivo"* |
| **`ResponseField` descreve campo de retorno** | herdado | ele nunca foi HTTP: as cinco informações valem para o que uma chamada devolve e para o atributo de um tipo |
| **Teto de quatro níveis, com dona nova** | **origem própria (correção)** | a dona era `cobranca.pagamento.cartao.verificacoes`, do domínio morto; é `Infraestrutura › O output de um módulo`. O carimbo era `delta deliberado` **até esta linha** — a varredura que zerou a lista de deltas em [`principios.md`](../principios.md) §3 não o alcançou, e o documento afirmava lista vazia enquanto esta linha ainda a carregava |
| **Tipo que é outra entrada linka, não aninha** | **origem própria (consequência)** | o reset de profundidade do `$ref` saiu sem deixar buraco — ver [`referencia.md`](../referencia.md) §5.3 |
| Recursão sem JavaScript | herdado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) e [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §6 |
| Implementação compartilhada com `param-field` | herdado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §8, nota de implementação |
| Sem campo editável | herdado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §4 |
| Uma parte publicada | herdado | [#18](https://github.com/ThiagoPanini/panlabs-docs/issues/18) §8, sobre a régua da [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) §5 |
| **Divisor, acento no nome, chip neutro e âncora de linha** | herdado + origem própria | as quatro linhas de [`param-field`](param-field.md) § Procedência valem aqui verbatim — implementação compartilhada, mesma decisão |
