// @ts-check

/**
 * A sidebar da tab `Times` — instância `times`.
 *
 * **Uma folha, e ela é marcador de lugar.** A aba trazia dois times fictícios
 * com duas páginas cada, e os quatro saíram. Documentação de time é escrita por
 * quem está dentro dele; até que haja um, a aba fica declaradamente vazia em vez
 * de sustentar dois nomes inventados.
 *
 * **Não há separador**, pelo mesmo motivo de `sidebars-procedimentos.js`:
 * agrupar uma folha só é moldura sem quadro, e o nível 1 mede o mesmo recuo que
 * o separador media.
 *
 * O `className` que carrega o ícone mora nela — regra de
 * `docs/design/icones.md` §8, e a chave é a mesma das duas abas de marcador de
 * lugar, porque as duas dizem a mesma coisa.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  teams: [
    // A única folha da instância. Ela carrega `slug: /`, e é o que faz `/times`
    // responder 200 sem redirecionamento (ADR 10 §h).
    {type: 'doc', id: 'work-in-progress', className: 'sidebar-icon sidebar-icon--work-in-progress'},
  ],
};

export default sidebars;
