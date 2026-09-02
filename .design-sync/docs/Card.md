---
category: Highlight
---

Uma superfície clicável que leva a outra página. É o encaminhamento do catálogo: o cartão diz para onde ir, nunca o que fazer aqui.

## Quando usar

Numa página de entrada, para abrir as rotas seguintes. Em `CardGroup`, nunca sozinho — um cartão solto no meio do texto lê como um `Callout` mal escolhido.

## Regras

- Com `href` o cartão inteiro vira o link, e é assim que ele deve nascer. Sem `href` ele é uma superfície inerte; use só quando o grupo tiver um item ainda sem destino.
- `title` é uma frase nominal curta. Não escreva verbo no infinitivo ("Configurar o ambiente") — o cartão é um lugar, não uma ação.
- `icon` é opcional e vem em `lg`, acima do título. Ou todos os cartões do grupo têm ícone, ou nenhum tem.
- O corpo é uma linha de apoio, no máximo duas. Cartão não é resumo.

## Uso

```jsx
<CardGroup>
  <Card title="Instalação" icon="download" href="/instalacao">
    O que instalar, e o que checar depois.
  </Card>
  <Card title="Conceitos" icon="book-open" href="/conceitos">
    O vocabulário que o resto da documentação assume.
  </Card>
</CardGroup>
```
