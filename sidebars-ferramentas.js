// @ts-check

// O ramo gerado de `Biblioteca C`, emitido por `scripts/gerar-referencia.mjs`.
// É o ÚNICO import de um arquivo de sidebar deste projeto, e ele existe para que
// as duas posses não se misturem — ver o bloco abaixo.
import referencia from './sidebars-referencia.js';

/**
 * A sidebar da tab `Ferramentas` — instância `ferramentas`.
 *
 * **Quatro famílias, e é a única aba traduzida.** A fronteira do locale é
 * **audiência do artefato**, não infra pública contra corporativa: biblioteca,
 * módulo, skill e servidor MCP nascem na mesma esteira que tudo, mas são
 * **consumidos por outros times**, e é isso que lhes dá leitor de inglês.
 *
 * **O único lugar do site que usa o nível 3.** O teto de profundidade subiu de 2
 * para 3, e ele é usado onde uma ferramenta tem mais de uma página —
 * `Bibliotecas › Biblioteca C`, que é a que carrega a referência gerada. A regra
 * de ícone foi reescrita junto, e é ela que torna o nível 3 legível: **ícone só
 * no nó de topo da sidebar**. A formulação antiga (*obrigatório na categoria de
 * topo, ausente na folha*) é que não tinha leitura num terceiro nível — não o
 * teto.
 *
 * **O ramo gerado chega por IMPORT, e a árvore continua escrita à mão aqui.** As
 * 6 páginas de referência de `Biblioteca C` saem do contrato de assinatura, e o
 * gerador emite um **fragmento** — uma lista de ids — em vez da sidebar inteira
 * da instância. `Bibliotecas` fecha em 13 e a aba em 21. É a única forma de as
 * duas posses conviverem: as quinze folhas autorais são nossas e o gerador não as
 * conhece; as seis geradas são dele e editá-las à mão seria a segunda fonte de
 * verdade que o gerador existe para impedir.
 *
 * **A instância declara `docItemComponent` e as folhas autorais não mudam de
 * layout.** O `ApiDocItem` comuta por página pelo front matter `api_exemplos`, e
 * delega para `@theme/DocItem` quando o campo falta — as seis geradas o declaram,
 * as quinze autorais não.
 *
 * Procedência: docs/design/informacao.md · docs/design/icones.md · docs/adr/0008.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  ferramentas: [
    {
      type: 'category',
      label: 'Bibliotecas',
      className: 'sidebar-icone sidebar-icone--bibliotecas',
      collapsed: false,
      link: {type: 'doc', id: 'bibliotecas/indice'},
      items: [
        'bibliotecas/biblioteca-a',
        'bibliotecas/biblioteca-b',
        {
          // O NÍVEL 3, e o único do site. Sem ícone: a regra é *só no nó de topo
          // da sidebar*, e este nó é de segundo nível.
          type: 'category',
          label: 'Biblioteca C',
          collapsed: false,
          link: {type: 'doc', id: 'bibliotecas/biblioteca-c/visao-geral'},
          items: [
            // A fixture de painel direito vazio: a folha autoral desta
            // instância passa pela perna do comutador que delega, e a coluna do
            // painel nem chega a existir nela.
            'bibliotecas/biblioteca-c/instalacao-e-configuracao',
            'bibliotecas/biblioteca-c/tratamento-de-erros',
            'bibliotecas/biblioteca-c/changelog',
            // O ramo gerado, espalhado como irmão das autorais. Sem categoria
            // própria: um nó a mais aqui seria o nível 4, e o teto é 3.
            ...referencia,
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Módulos Terraform',
      className: 'sidebar-icone sidebar-icone--modulos-terraform',
      collapsed: false,
      link: {type: 'doc', id: 'modulos-terraform/indice'},
      items: ['modulos-terraform/modulo-de-bucket', 'modulos-terraform/modulo-de-papel-iam'],
    },
    {
      type: 'category',
      label: 'Skills',
      className: 'sidebar-icone sidebar-icone--skills',
      collapsed: false,
      link: {type: 'doc', id: 'skills/indice'},
      items: [
        // A fixture de prosa mínima e código máximo — o tipo `Receita`, relocado
        // para cá quando a aba própria dele morreu.
        'skills/scaffold-de-esteira',
        'skills/rotacao-de-segredo',
      ],
    },
    {
      type: 'category',
      label: 'Servidores MCP',
      className: 'sidebar-icone sidebar-icone--servidores-mcp',
      collapsed: false,
      link: {type: 'doc', id: 'servidores-mcp/indice'},
      items: ['servidores-mcp/servidor-de-catalogo-mcp'],
    },
  ],
};

export default sidebars;
