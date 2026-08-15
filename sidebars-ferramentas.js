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
 * `Bibliotecas › Biblioteca C`, que é a que carrega a referência gerada.
 *
 * **A regra de ícone é a da issue #97: toda folha, nenhum cabeçalho de grupo.**
 * `Biblioteca C` não recebe `className` — ela é cabeçalho, não folha, e a regra
 * não faz exceção por nível. As folhas dela — as três autorais e as seis
 * geradas — herdam `sidebar-icone--bibliotecas`, a família da categoria de
 * topo que as contém.
 *
 * **O ramo gerado chega por IMPORT, e a árvore continua escrita à mão aqui.** As
 * 6 páginas de referência de `Biblioteca C` saem do contrato de assinatura, e o
 * gerador emite um **fragmento** — uma lista de itens de folha, com o mesmo
 * `className` que as três autorais vizinhas — em vez da sidebar inteira da
 * instância. `Bibliotecas` fecha em 13 e a aba em 21. É a única forma de as
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
      collapsed: false,
      link: {type: 'doc', id: 'bibliotecas/indice'},
      items: [
        {type: 'doc', id: 'bibliotecas/biblioteca-a', className: 'sidebar-icone sidebar-icone--bibliotecas'},
        {type: 'doc', id: 'bibliotecas/biblioteca-b', className: 'sidebar-icone sidebar-icone--bibliotecas'},
        {
          // O NÍVEL 3, e o único do site. Sem ícone: é cabeçalho de grupo, não
          // folha — a mesma regra que já excluía o nó de topo antes da #97.
          type: 'category',
          label: 'Biblioteca C',
          collapsed: false,
          link: {type: 'doc', id: 'bibliotecas/biblioteca-c/visao-geral'},
          items: [
            // A fixture de painel direito vazio: a folha autoral desta
            // instância passa pela perna do comutador que delega, e a coluna do
            // painel nem chega a existir nela.
            {type: 'doc', id: 'bibliotecas/biblioteca-c/instalacao-e-configuracao', className: 'sidebar-icone sidebar-icone--bibliotecas'},
            {type: 'doc', id: 'bibliotecas/biblioteca-c/tratamento-de-erros', className: 'sidebar-icone sidebar-icone--bibliotecas'},
            {type: 'doc', id: 'bibliotecas/biblioteca-c/changelog', className: 'sidebar-icone sidebar-icone--bibliotecas'},
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
      collapsed: false,
      link: {type: 'doc', id: 'modulos-terraform/indice'},
      items: [
        {type: 'doc', id: 'modulos-terraform/modulo-de-bucket', className: 'sidebar-icone sidebar-icone--modulos-terraform'},
        {type: 'doc', id: 'modulos-terraform/modulo-de-papel-iam', className: 'sidebar-icone sidebar-icone--modulos-terraform'},
      ],
    },
    {
      type: 'category',
      label: 'Skills',
      collapsed: false,
      link: {type: 'doc', id: 'skills/indice'},
      items: [
        // A fixture de prosa mínima e código máximo — o tipo `Receita`, relocado
        // para cá quando a aba própria dele morreu.
        {type: 'doc', id: 'skills/scaffold-de-esteira', className: 'sidebar-icone sidebar-icone--skills'},
        {type: 'doc', id: 'skills/rotacao-de-segredo', className: 'sidebar-icone sidebar-icone--skills'},
      ],
    },
    {
      type: 'category',
      label: 'Servidores MCP',
      collapsed: false,
      link: {type: 'doc', id: 'servidores-mcp/indice'},
      items: [
        {type: 'doc', id: 'servidores-mcp/servidor-de-catalogo-mcp', className: 'sidebar-icone sidebar-icone--servidores-mcp'},
      ],
    },
  ],
};

export default sidebars;
