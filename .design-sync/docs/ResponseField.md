---
category: Reference
---

A linha de um campo de resposta: nome, tipo, e o que vem dentro. Mesma anatomia do `ParamField`, outro lado da chamada.

## Regras

- Anatomia idêntica à do `ParamField`, de propósito: duplicar a anatomia para dois papéis é como componentes irmãos derivam visualmente.
- Use `ParamField` para o que entra e `ResponseField` para o que sai. Não misture os dois na mesma lista.
- Objeto aninhado abre em `Expandable`, e dentro dele vêm outros `ResponseField`. É assim que a recursão acontece — não existe prop de nível.

## Uso

```jsx
<ResponseField name="total" type="int" required>
  Quantos itens o catálogo tem, depois do filtro.
</ResponseField>
<ResponseField name="itens" type="list[object]">
  <p>Um por linha do catálogo.</p>
  <Expandable title="propriedades de item">
    <ResponseField name="nome" type="string" required>O identificador.</ResponseField>
  </Expandable>
</ResponseField>
```
