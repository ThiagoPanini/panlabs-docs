---
category: Reference
---

A linha de um parâmetro de entrada: nome, tipo, e o que ele faz. É metade do par de referência do catálogo — a outra é `ResponseField`.

## Regras

- **Só o obrigatório é marcado.** A ausência do chip é o sinal de opcional; marcar os dois cortaria pela metade a saliência do que importa.
- O chip de obrigatório é vermelho e escrito por extenso. `deprecated` risca o nome e apaga o texto, **sem cor** — o vermelho já é do chip.
- `type` é escrito como o leitor escreveria: `string`, `list[str]`, `Alvo | null`. Não é TypeScript, é o tipo da linguagem documentada.
- Cada campo ganha uma âncora própria no gutter esquerdo, derivada do `name`.
- Aninhamento é `Expandable` dentro do corpo, até quatro níveis.

## Uso

```jsx
<ParamField name="namespace" type="string" required>
  O dono do recurso. Vem antes do nome, sempre.
</ParamField>
<ParamField name="formato" type="'json' | 'texto'" default="texto">
  Como a saída é impressa.
</ParamField>
```
