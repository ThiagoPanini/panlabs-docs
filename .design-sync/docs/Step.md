---
category: Sequence
---

Um passo de `Steps`. Existe só lá dentro.

## Regras

- **Um `icon` SUBSTITUI o número, não senta ao lado dele.** A decisão é por passo, não pela lista: use ícone no passo terminal (`check`) e deixe os outros numerados.
- `title` é a ação, no imperativo e curta. O corpo carrega o comando, o caminho e a ressalva.
- Um passo sem `title` é legítimo quando o corpo é uma única frase que já se explica.

## Uso

```jsx
<Step title="Confira a saída" icon="check">
  <p>Exit 0 e o catálogo impresso significam que passou.</p>
</Step>
```
