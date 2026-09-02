---
category: Highlight
---

Um bloco tingido que tira uma frase do fluxo do texto. É o componente de aviso do catálogo, e a variante é o que ele comunica antes de qualquer palavra.

## Quando usar

Quando a informação muda a decisão de quem lê e perdê-la sai caro. Um `Callout` a cada duas telas já é ruído; um por página é o teto saudável.

## Regras

- `info` é o neutro e o padrão. `note` é azul. **A inversão é deliberada** — não troque uma pela outra achando que `note` é o neutro.
- `tip` é atalho, `warning` é perda de dado ou de tempo. Nunca use `warning` para ênfase.
- O ícone é fixo por variante e não é configurável. Um glifo por variante, sempre o mesmo.
- `title` é opcional. Sem ele o corpo começa direto, e para uma frase só isso lê melhor.
- O corpo aceita parágrafo, lista e código. Não aninhe outro `Callout` dentro.

## Uso

```jsx
<Callout variant="warning" title="A troca é destrutiva">
  <p>Regenerar o índice apaga o que estava lá. Não há desfazer.</p>
</Callout>
```
