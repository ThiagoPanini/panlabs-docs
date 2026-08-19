// @ts-check

/**
 * A sidebar da tab `Jornadas` — instância `default`.
 *
 * **Duas jornadas, 6 e 4 capítulos, e a contagem desigual é de propósito:** arco
 * de papel não tem comprimento fixo, e duas jornadas com o mesmo número leem
 * como formulário preenchido duas vezes.
 *
 * Uma jornada é **um papel que o autor vestiu**, não um tópico. É a forma que
 * vale, não os dois nomes: papel tem começo, meio e aprendizado, e é isso que
 * evita a jornada virar uma categoria de `Procedimentos` com outro nome.
 *
 * Três coisas travadas aqui, e nenhuma custa swizzle:
 *
 * 1. **O nível de topo é SEPARADOR — mudo, e sempre aberto.** `collapsible:
 *    false` mais ausência de `link`, e é só isso: no fonte do `theme-classic`,
 *    `useCategoryHrefWithSSRFallback` devolve `undefined` quando
 *    `!item.collapsible`, nos dois lados, então o rótulo sai como `<a>` sem
 *    `href`, sem caret e sem `CollapseButton`. É o análogo exato do
 *    `<h3 class="sidebar-title">` da âncora, e não custa `pointer-events` nem
 *    componente. ADR 10 §a.
 * 2. **O índice de jornada é FOLHA, e a primeira delas.** Ele era o destino da
 *    categoria clicável e não tinha linha própria; agora tem, e abre o grupo.
 *    A assimetria é medida: no Devin, `Get Started` abre com a folha
 *    `Introducing Devin`, e outros grupos não têm folha de abertura nenhuma.
 *    ADR 10 §d.
 * 3. **Teto de profundidade 4, e esta aba usa 2.** Separador → folha, e nada
 *    abaixo. O teto é confinado a `Ferramentas › Bibliotecas › overpower`, que
 *    é também o único lugar do site que colapsa de verdade.
 *
 * **`collapsed: false` saiu, e não foi troca de gosto.** A linha estava
 * carimbada `herdado` com a fonte *"a âncora mostra a árvore aberta"* — verdade
 * só do nível 1, que nem colapsa. Um `herdado` falso congela decisão que
 * ninguém tomou; ADR 10 registra a correção. Aqui não sobra nó colapsável para
 * a chave governar.
 *
 * **A ordem é declarada aqui e em lugar nenhum mais.** Com lista explícita de
 * itens, `sidebar_position` no front matter é ignorado — e mantê-lo seria uma
 * segunda fonte de verdade que só mente. A ordem dos capítulos é **temporal**, e
 * é a mesma da lista ordenada de `## Como foi` no índice: o portão 4 cobra que a
 * lista tenha um item por capítulo, e é essa lista que carrega o traço do tipo.
 *
 * O `className` é o degrau 1 da escada do ADR 2 — `className` em `sidebars*.js`
 * é contrato público do schema de item de sidebar. **A regra de ícone é a de
 * `docs/design/icones.md` §8**, e aqui ela só tem um caso: o separador não leva
 * `className`, e todas as folhas levam. As regras de máscara estão em
 * `src/css/chrome.css` e os onze pares em `src/icons/manifest.js`.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0010.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  jornadas: [
    {
      type: 'category',
      label: 'API Owner',
      collapsible: false,
      items: [
        // A folha de abertura — o décimo tipo de página, `indice-de-jornada`.
        // Ela carrega `slug: /`, e é por isso que `/jornadas` é página de
        // verdade em vez de 404 (ADR 10 §h).
        {type: 'doc', id: 'api-owner/indice', className: 'sidebar-icone sidebar-icone--api-owner'},
        // A fixture de página muito longa, e o lado comprido do par que prova
        // comprimento desigual entre irmãos.
        {type: 'doc', id: 'api-owner/o-contrato-que-nao-existia', className: 'sidebar-icone sidebar-icone--api-owner'},
        // O lado curto do mesmo par — ~180 palavras contra ~1800.
        {type: 'doc', id: 'api-owner/o-que-o-contrato-nao-cobre', className: 'sidebar-icone sidebar-icone--api-owner'},
        // A fixture de fallback silencioso de locale:
        // `/en/jornadas/api-owner/a-politica-de-versao` serve o texto em pt-BR.
        {type: 'doc', id: 'api-owner/a-politica-de-versao', className: 'sidebar-icone sidebar-icone--api-owner'},
        // A fixture de saída literal de terminal.
        {type: 'doc', id: 'api-owner/o-schema-que-mudou-sem-aviso', className: 'sidebar-icone sidebar-icone--api-owner'},
        {type: 'doc', id: 'api-owner/depreciar-em-seis-meses', className: 'sidebar-icone sidebar-icone--api-owner'},
        {type: 'doc', id: 'api-owner/o-consumidor-invisivel', className: 'sidebar-icone sidebar-icone--api-owner'},
      ],
    },
    {
      type: 'category',
      label: 'Security Champion',
      collapsible: false,
      items: [
        // A folha de abertura desta jornada é a fixture de prosa pura: nenhum
        // componente do catálogo além do `<Untranslated />`, que é o que o
        // décimo tipo é por definição.
        {type: 'doc', id: 'security-champion/indice', className: 'sidebar-icone sidebar-icone--security-champion'},
        // O item de sidebar mais largo do site — 30 caracteres.
        {type: 'doc', id: 'security-champion/a-varredura-que-reprovava-tudo', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/o-segredo-no-commit', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/a-excecao-que-virou-regra', className: 'sidebar-icone sidebar-icone--security-champion'},
        {type: 'doc', id: 'security-champion/o-inventario-de-imagens', className: 'sidebar-icone sidebar-icone--security-champion'},
      ],
    },
  ],
};

export default sidebars;
