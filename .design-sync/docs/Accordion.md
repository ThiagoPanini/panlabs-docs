---
category: Disclosure
---

Um `<details>` com cabeçalho de duas linhas, para conteúdo que a maioria dos leitores não precisa abrir.

## Quando usar

Quando a resposta é longa e a pergunta é curta — um caso de borda, uma variação de plataforma, um erro específico. Se todo leitor precisa do conteúdo, ele não vai aqui dentro: vai no corpo da página.

## Regras

- **Nada de JavaScript.** É `<details>`/`<summary>` nativo: o teclado, o anúncio do leitor de tela e o `aria-expanded` são do navegador. Uma âncora de URL abre o `<details>` ancestral sozinha, e a busca da página alcança o conteúdo fechado.
- `title` é uma pergunta ou um rótulo curto. `description` qualifica, e é opcional — use quando o título sozinho não separa este item do vizinho.
- Exclusividade mútua está deliberadamente desligada: quem compara dois itens não deve ter o primeiro fechado na cara.
- Em `AccordionGroup` quando houver mais de um. Solto, só quando for realmente único na página.

## Uso

```jsx
<AccordionGroup>
  <Accordion title="O comando falha com exit 2" icon="triangle-alert">
    <p>O alvo não resolveu. Confira o namespace antes do nome.</p>
  </Accordion>
  <Accordion title="Dá para rodar sem instalar?" description="uvx, sem ambiente virtual">
    <p>Dá. O <code>uvx</code> baixa e executa numa sandbox descartável.</p>
  </Accordion>
</AccordionGroup>
```
