/**
 * O marcador de argumento editável do painel — **escrito por um lado, lido pelo
 * outro, e declarado num lugar só.**
 *
 * `scripts/gerar-referencia.mjs` ESCREVE o marcador dentro do snippet que vai no
 * front matter; `Painel.js` o LÊ a cada tecla para substituir pelo valor do
 * campo. São duas árvores diferentes — a de build e a do site —, e antes deste
 * arquivo cada uma carregava a própria cópia da sintaxe.
 *
 * **O portão 5 não pegaria a divergência**, e é isso que obriga o arquivo a
 * existir. Ele regenera e diffa: se o gerador passasse a escrever `${nome}` e o
 * painel continuasse casando `{{nome}}`, a saída seria byte a byte a mesma que o
 * gerador acabou de produzir, o diff ficaria limpo, e a página renderizaria o
 * marcador cru na tela. Duas cópias da mesma verdade divergem — é a régua do
 * espelho de tokens, aplicada a um par que ninguém tinha olhado.
 *
 * **Zero React, zero DOM**, para que o script de build possa importá-lo. O
 * precedente é `SearchBar/escada.mjs`, que `scripts/busca.test.mjs` importa pela
 * mesma razão: a régua e o consumidor leem o mesmo arquivo.
 *
 * O portão 7 continua passando — este é submódulo de um componente que já tem
 * endereço, a mesma linha em que `SearchBar/escada` e `ApiDocItem/estilos.module`
 * caem.
 *
 * Procedência: docs/design/referencia.md §5.2.
 */

/** O marcador, como o gerador o escreve. */
export const marcador = (nome) => `{{${nome}}}`;

/**
 * O mesmo marcador, como o painel o lê.
 *
 * **O traço entra no nome, e não é enfeite.** A chave do marcador É o nome do
 * argumento: o painel casa por `painel.parametros[].nome`, e o argumento de um
 * `comando` se chama `--from`. Presa a `\w+`, a sintaxe não casaria `{{--from}}`
 * em NENHUM dos dois lados — `marcadoresDe` não o veria, a conferência de órfão
 * do gerador passaria calada, e a página sairia com o marcador cru na tela.
 * É o buraco que o cabeçalho acima descreve, chegando pela outra ponta.
 *
 * **O traço, e mais nada.** A classe fica no menor conjunto que os dois lados
 * precisam combinar: alargá-la por precaução é superfície de sintaxe que
 * ninguém exercita, numa régua cujo valor inteiro é as duas árvores casarem.
 */
export const PLACEHOLDER = /\{\{([\w-]+)\}\}/g;

/**
 * Troca cada marcador pelo valor corrente. Marcador sem valor fica como está —
 * some da tela por substituição, nunca por apagar texto que ninguém pediu.
 *
 * @param {string} modelo
 * @param {Record<string, string>} valores
 */
export function substituir(modelo, valores) {
  return modelo.replace(PLACEHOLDER, (tudo, nome) => valores[nome] ?? tudo);
}

/** Os nomes que um snippet ainda espera receber. É o que a régua de máquina confere. */
export function marcadoresDe(modelo) {
  return [...modelo.matchAll(PLACEHOLDER)].map(([, nome]) => nome);
}
