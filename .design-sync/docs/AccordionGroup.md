---
category: Disclosure
---

Empilha `Accordion` numa peça só, com uma borda em volta e divisórias entre os itens.

## Regras

- Só aceita `Accordion` como filho.
- Dois itens ou mais. Um `AccordionGroup` de um item é um `Accordion`.
- Não fecha um item quando outro abre. É uma escolha registrada, não um esquecimento.

## Uso

```jsx
<AccordionGroup>
  <Accordion title="Linux">…</Accordion>
  <Accordion title="macOS">…</Accordion>
  <Accordion title="Windows">…</Accordion>
</AccordionGroup>
```
