---
category: Disclosure
---

A revelação mínima: uma linha que abre, sem cartão em volta e sem ícone.

## Quando usar

Dentro de `ParamField` e `ResponseField`, para abrir as propriedades de um objeto aninhado. É para isso que ele existe — a moldura do `Accordion` ali dentro empilharia cartão dentro de cartão a cada nível, e o teto de aninhamento é quatro.

## Regras

- **Não use `Expandable` como `Accordion` mais leve fora de um campo.** Ele não tem a moldura porque está dentro de uma.
- Nível 1 abre por padrão; nível 2 e abaixo nascem fechados. Só o autor sabe em que nível está, então a escolha é dele, via `defaultOpen`.
- `title` costuma ser o nome do tipo aninhado, não uma frase.

## Uso

```jsx
<ResponseField name="alvo" type="object">
  <p>Para onde o comando aponta.</p>
  <Expandable title="propriedades de alvo" defaultOpen>
    <ResponseField name="namespace" type="string" required>
      O dono do recurso.
    </ResponseField>
    <ResponseField name="nome" type="string" required>
      O identificador dentro do namespace.
    </ResponseField>
  </Expandable>
</ResponseField>
```
