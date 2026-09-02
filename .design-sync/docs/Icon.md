---
category: Presentation
---

Um desenho do Lucide, em três tamanhos, com compensação óptica de traço por tamanho.

## Regras

- **O registro é fechado e gerado.** Ele contém exatamente os ícones que o conteúdo deste projeto usa; um nome fora da lista **quebra a build**, com sugestão do vizinho mais próximo. Os nomes válidos estão no tipo de `name`.
- O `strokeWidth` muda com o tamanho — `sm` recebe 2.25, `md` recebe 2, `lg` recebe 1.75 — porque um traço fixo engorda no pequeno e some no grande. É prop, nunca token CSS: o valor precisa reestilizar o interior do desenho.
- **O ícone é sempre decorativo** e sai da árvore de acessibilidade. O significado vive no texto ao lado. Não existe prop de rótulo, e não existe ícone sozinho carregando sentido.
- Na prática o ícone chega pela prop `icon` de `Card`, `Callout`, `Accordion` e `Step`. Escrever `<Icon>` solto no meio do texto é a exceção.

## Uso

```jsx
<Icon name="terminal" size="md" />
```
