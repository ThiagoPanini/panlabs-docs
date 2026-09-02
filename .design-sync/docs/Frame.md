---
category: Presentation
---

Um palco tingido para um diagrama, com botão de ampliar no canto e uma lightbox nativa por baixo.

## Quando usar

Para diagrama e só para diagrama: fluxo, ciclo de vida, modelo de dado. **Nunca para captura de tela** — captura apodrece sozinha, e raster não herda `currentColor`.

## Regras

- Um diagrama da casa entra como SVG inline usando `currentColor`: um arquivo para os dois modos de cor, nunca um arquivo por modo.
- Um diagrama vindo do draw.io entra como `<img>`: o draw.io emite `light-dark()`, que resolve contra o `color-scheme` do documento e atravessa a fronteira do `<img>`.
- **Zero comportamento no componente.** Ele declara o `<button>` e o `<dialog>`; abrir, ampliar, arrastar e fechar vivem num módulo de cliente separado. Não escreva `onClick` aqui.
- O botão de ampliar é visível o tempo todo, nunca revelado no hover.
- Não tem legenda. Se o desenho precisa de uma frase, ela vai no parágrafo antes dele.

## Uso

```jsx
<Frame>
  <img src="/diagramas/fluxo-de-uma-invocacao.svg" alt="As quatro etapas de uma invocação" />
</Frame>
```
