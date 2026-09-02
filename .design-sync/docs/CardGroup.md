---
category: Highlight
---

A grade que segura os `Card`. É o único jeito de colocar cartão na página.

## Regras

- **Não existe prop de coluna.** A contagem de cartões define o arranjo sozinha, com `--pd-card-min` como piso. Não há media query nem container query para ajustar: se a grade ficou errada, o número de cartões é que está errado.
- Dois a seis cartões. Um só não é grade; acima de seis vire uma lista ou uma tabela.
- Só aceita `Card` como filho.

## Uso

```jsx
<CardGroup>
  <Card title="Alvos" icon="terminal" href="/alvos">Para onde o comando aponta.</Card>
  <Card title="Comandos" icon="file-text" href="/comandos">O que cada um faz.</Card>
</CardGroup>
```
