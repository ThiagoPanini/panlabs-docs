---
category: Presentation
---

Uma tabela dentro de uma região rolável e nomeada. **Toda** tabela da documentação nasce assim: o componente está registrado na chave `table`, então a marcação de tabela em Markdown já sai embrulhada, sem o autor escolher.

## Regras

- É o único lugar do catálogo onde ARIA aparece, porque o HTML não tem elemento para isto: sem `role="region"` mais `tabindex`, quem usa teclado não consegue rolar uma tabela larga.
- Corrige um defeito do Infima: o framework declara `table { display: block; overflow: auto }`, o que resolve o transbordo e destrói a semântica de tabela na árvore de acessibilidade. Aqui a rolagem sai do `<table>` e vai para a região, e o `<table>` volta a ser `display: table`.
- Toda prop além de `children` desce para o `<table>`.
- Cabeçalho de coluna é obrigatório. Uma tabela sem `<thead>` é uma lista mal escolhida.

## Uso

```jsx
<Table>
  <thead>
    <tr><th>Alvo</th><th>Quando usar</th></tr>
  </thead>
  <tbody>
    <tr><td><code>from</code></td><td>Quando a origem já é um catálogo.</td></tr>
    <tr><td><code>bundle</code></td><td>Quando os alvos vêm federados.</td></tr>
  </tbody>
</Table>
```
