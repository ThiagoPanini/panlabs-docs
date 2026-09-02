---
category: Sequence
---

Uma lista ordenada com marcador circulado e um fio ligando um passo ao seguinte. É o procedimento do catálogo.

## Regras

- **A numeração é do `<ol>`.** Nenhum número é renderizado por JavaScript, e é isso que o leitor de tela anuncia. Não escreva "1." no título do passo.
- Só aceita `Step` como filho.
- Três a sete passos. Menos que três é um parágrafo; mais que sete quer virar duas listas ou uma página.
- Cada passo é uma ação completa, com o comando ou o clique dentro do corpo.

## Uso

```jsx
<Steps>
  <Step title="Instale o CLI">
    <p><code>uv tool install overpower</code></p>
  </Step>
  <Step title="Aponte para o alvo">
    <p>O namespace vem antes do nome, sempre.</p>
  </Step>
  <Step title="Confira a saída" icon="check">
    <p>Exit 0 e o catálogo impresso significam que passou.</p>
  </Step>
</Steps>
```
