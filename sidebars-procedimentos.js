// @ts-check

/**
 * A sidebar da tab `Procedimentos` — instância `procedimentos`.
 *
 * **Uma folha, e ela é marcador de lugar.** A aba tinha cinco separadores e
 * dezesseis páginas de acervo mockado; saiu tudo. O que vai entrar aqui é
 * procedimento de verdade, escrito a partir do que o ambiente corporativo
 * exige, e a aba fica declaradamente vazia até lá em vez de guardar conteúdo
 * inventado que ninguém vai atualizar.
 *
 * **Não há separador, e a ausência é decisão.** O nível de topo desta aba era
 * separador — rótulo em negrito que agrupa —, e agrupar uma folha só é moldura
 * sem quadro. A folha entra no nível 1, que mede os mesmos 16px do separador
 * (`chrome.css`, a rampa de recuo), então a linha nasce alinhada com o que
 * havia antes.
 *
 * O `className` que carrega o ícone mora nela: a regra de
 * `docs/design/icones.md` §8 é *nenhum ícone no separador de topo; ícone em tudo
 * o mais*, e sem separador não há caso de exclusão a aplicar.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  procedimentos: [
    // A única folha da instância. Ela carrega `slug: /`, e é o que faz
    // `/procedimentos` responder 200 sem redirecionamento (ADR 10 §h).
    {type: 'doc', id: 'work-in-progress', className: 'sidebar-icone sidebar-icone--work-in-progress'},
  ],
};

export default sidebars;
