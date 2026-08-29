# ADR 9 — A referência de CLI é gerada de contrato de superfície de comando

**Status:** aceito · slice 10 · 2026-08-19 · **supera o [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md)**

## Contexto

O [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md)
decidiu **gerar a referência de um contrato de assinatura** — módulo, tipo e
função —, e essa decisão sobreviveu inteira. O que não sobreviveu foi o
**sujeito**: `Biblioteca C`, o `panlabs-esteira`, era conteúdo mockado, e ela sai
do acervo junto com `Biblioteca A` e `Biblioteca B`.

No lugar entra o **`overpower`**, e ele muda a natureza do problema por ser
**real**: `panlabs-tech/overpower`, MIT, publicado no PyPI, uma CLI escrita em
Typer com três comandos — `list`, `install` e `doctor` — que instala equipamento
de agente curado num repositório ou numa máquina. Ninguém o importa. A superfície
pública dele é a **linha de comando**, e documentar assinatura de função ali
seria descrever uma API que não tem chamador.

**O que comprou a decisão é um defeito medido, não uma preferência.** As três
páginas de comando da documentação de origem são referência **escrita à mão**, e
a própria documentação admite que ela apodrece: `reference/index.md` diz, com
todas as letras, *"Run `list` for the live version of this page"*. Uma página que
manda o leitor conferi-la contra o programa é a definição de segunda fonte de
verdade — que é exatamente o defeito que o gerador do ADR 8 existe para impedir.

**O critério do dono continua sendo o do ADR 8:** *o que valida mais superfície
do sistema de documentação*. Alimentar o contrato de assinatura com os módulos
Python do `overpower` custaria um quinto disto e preservaria o ADR 8 intacto —
mas reusaria a mesma máquina para produzir o mesmo exercício, e documentaria uma
superfície de importação que não existe na prática. Trocar a espécie prova um
gerador de referência de **CLI**, que o projeto nunca exercitou, sobre um
artefato que o leitor pode executar.

**A troca é barata por um acidente feliz do ADR 8:** o contrato já carrega um
bloco `rotulos` com **todos** os rótulos como dado. Trocar *"Parâmetros"* por
*"Opções"* e *"Retorno"* por *"Códigos de saída"* não toca uma linha de código.
O que muda de verdade é a lista fechada de espécies e os ramos de renderização
que ela governa.

## Decisão

### a) O contrato troca de espécie, e a lista continua fechada

`ESPECIES` deixa de ser `['modulo', 'tipo', 'funcao']` e passa a ser
`['aplicacao', 'comando']`. A lista continua **fechada e validada**, com a mesma
recusa nomeada (`especie-fora-da-lista`) e o mesmo JSON Pointer do nó ofensor.

**Duas espécies, e não uma.** Uma espécie só transformaria o gerador num laço
sobre uma lista, e metade do que o gerador do ADR 8 provava era **hierarquia** —
raiz que aponta para membros, membro que aponta de volta. `aplicacao` guarda essa
perna: ela é o `overpower` nu, com as opções globais e a tabela dos quatro
códigos de saída que valem para os três comandos.

### b) Quatro entradas — uma raiz e três comandos

`overpower`, `list`, `install`, `doctor`. O ramo gerado cai de seis páginas para
quatro, e o número não é meta: ele é o que a superfície da ferramenta tem.
Promover `--from` ou `Códigos de saída` a gerados encheria a contagem com prosa
que tem decisão editorial dentro, e prosa não sai de contrato.

### c) `ParamField` é opção; `ResponseField` é código de saída

Os dois componentes **não** mudam, e é a leitura deles que muda. Eles nunca foram
HTTP-específicos — foi por isso que sobreviveram à morte do `VerbBadge` — e
também nunca foram Python-específicos. `ParamField` descreve *um parâmetro
nomeado com tipo, obrigatoriedade e padrão*, o que uma opção de CLI é; e
`ResponseField` descreve *o que a chamada devolve*, o que um código de saída é.
Zero mudança no catálogo, que continua fechado em dezessete.

### d) O ramo gerado ganha categoria própria

O ADR 8 §c) decidiu emitir o fragmento **sem categoria própria**, e a razão
estava escrita: *"seria o nível 4, e o teto é 3"*. O teto subiu para 4
([ADR 10](0010-a-categoria-de-sidebar-nao-e-destino.md)), então a razão caiu. As
quatro páginas moram sob `Comandos`, que é nó de nível 3 com página de abertura
autoral — e é essa página, `Comandos › Índice`, que passa a ser a dona da fixture
`painel-direito-vazio`: ela é irmã direta das quatro geradas, então o contraste
entre a perna que delega e a que pinta o painel fica na mesma seção.

### e) Tudo o mais do ADR 8 fica de pé, e fica citado

Não se reabre nada disto, e o motivo é o mesmo do ADR 8 sobre o ADR 5 — a
decisão sobreviveu à troca de premissa:

- **dois contratos monolíngues congruentes**, um por locale, nunca um bilíngue;
- **JSON puro**, zero dependência de parser, consequência direta do axioma 2;
- **gerador fora do build**, rodado à mão, saída commitada;
- **portão 5** regenerando e reprovando em `git diff`;
- **fragmento de sidebar** emitido pelo gerador, importado por
  `sidebars-ferramentas.js`;
- **validador que recusa alto**, com JSON Pointer do nó ofensor;
- **zero snippet escrito à mão**;
- **o painel é front matter** (`api_exemplos`), não prop de tag.

> **Correção — #118.** Esta linha dizia *"e é ele que comuta o `ApiDocItem` por
> página"*. O comutador saiu: o painel desceu para o fluxo do MDX, o
> `ApiDocItem` foi removido, e a página de comando passou a usar o mesmo
> `@theme/DocItem` de qualquer outra. O front matter continua sendo a fonte dos
> dados do painel — o que ele deixou de fazer é escolher layout. Ver
> [`referencia.md`](../design/referencia.md) §2.

> **Correção — #158.** O primeiro item desta lista dizia *"dois contratos
> monolíngues congruentes, um por locale, nunca um bilíngue"*. O site virou
> locale único, e não há mais `pt-BR`/`en` a distinguir: o par virou um
> `contracts/overpower.json` só. O que a linha original protegia continua de
> pé, o contrato nunca é bilíngue, só que a pergunta *quantos contratos por
> locale* parou de fazer sentido. `validatePair` e a congruência que ela
> cobrava saíram de `scripts/lib/signature.mjs` junto.

### f) O arquivo do gerador não troca de nome

`scripts/gerar-referencia.mjs` continua. O ADR 8 §f) recusou `gerar-api` porque
*"o nome do arquivo mentiria"*; `gerar-referencia` não mente sobre CLI nem sobre
assinatura, e renomeá-lo agora custaria citação em oito lugares para dizer a
mesma coisa.

## Consequências

1. **O ADR 8 vira registro histórico**, com o conteúdo intacto e um cabeçalho
   apontando para cá — a mesma disciplina que ele aplicou ao ADR 5. O que se
   apagaria ao editá-lo é o registro de *"decidimos assinatura uma vez, e por
   quê"*, que é o que um ADR existe para guardar.
2. **`scripts/lib/assinatura.mjs`, `scripts/gerar-referencia.mjs` e
   `scripts/assinatura.test.mjs` mudam juntos** — cerca de 1.300 linhas de
   máquina no total, com a mudança concentrada na lista de espécies e nos ramos
   de renderização por espécie.
3. **`contratos/panlabs-esteira.{pt-BR,en}.json` saem; `contratos/overpower.{pt-BR,en}.json` entram.**
4. **O tipo `Referência de API` mantém instância** — quatro, contra as seis de
   antes —, e o portão 4 continua cobrando pelo avesso: elas existem, são `.mdx`
   gerado, e nenhuma pode aparecer no manifesto de tipo.
5. **A doc do `overpower` fica com uma fonte de verdade a menos.** As três
   páginas de comando escritas à mão deixam de existir como fonte; o que o leitor
   lê é a projeção do contrato.
6. **O contrato passa a poder mentir sobre um programa real.** É o custo novo, e
   ele não existia com conteúdo mockado: `panlabs-esteira` não tinha código atrás,
   então o contrato era a verdade por definição. Agora há um binário que pode
   divergir dele, e **nenhuma máquina deste repositório confere isso** — o portão
   5 confere que a página é a projeção do contrato, não que o contrato é a
   projeção da ferramenta. A varredura fica sendo humana, e ela é o assunto da
   issue de aprimoramento.

## Por que supersessão e não errata do ADR 8

Uma errata corrige um **fato afirmado**; o ADR 8 não afirmou nada de errado. Ele
decidiu para um sujeito que deixou de existir, e a espécie do contrato está no
título dele, em cada seção da decisão e na lista fechada do validador. Editar
tudo isso produziria um documento que ninguém escreveu — e apagaria o único
registro de que o projeto exercitou um gerador de assinatura, que é informação
que a próxima biblioteca importável vai querer.

## Alternativas descartadas

**Alimentar o contrato de assinatura com os módulos Python do `overpower`.**
Custava quase nada — trocar o JSON e nada mais — e preservava o ADR 8 inteiro.
Recusada porque documenta uma superfície de importação que ninguém usa, e porque
não valida superfície nova do sistema de documentação, que é o critério que
comprou o ADR 8.

**Manter as três páginas de comando escritas à mão.** Recusada pela frase da
própria documentação de origem: uma página que manda conferi-la contra o programa
já declarou que é a segunda fonte de verdade.

**Gerar também `--from` e `Códigos de saída`.** Recusada porque as duas têm
decisão editorial dentro — `--from` é um guia com escolha de exemplo, e a tabela
de códigos é a leitura transversal que a raiz já publica.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Gerar de contrato, saída commitada, portão de diff | herdado | [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) — a decisão sobreviveu à troca de sujeito |
| JSON puro, contrato único desde o #158 | herdado | [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) a) |
| Fragmento de sidebar em vez da árvore | herdado | [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) c) |
| Validador com lista fechada e JSON Pointer | herdado | [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) d) |
| O contrato descreve superfície de CLI, não assinatura | **origem própria** | o `overpower` é executado, não importado — a superfície pública dele é a linha de comando |
| Duas espécies, `aplicacao` e `comando` | **origem própria (implementação)** | uma espécie só apaga a perna de hierarquia que o gerador do ADR 8 provava |
| Quatro entradas | **origem própria (consequência)** | é o que a ferramenta tem: uma raiz e três comandos |
| `ParamField` é opção e `ResponseField` é código de saída | herdado | [`componentes/param-field.md`](../design/componentes/param-field.md) — nunca foram específicos de protocolo nem de linguagem |
| O ramo gerado ganha categoria própria | **origem própria (consequência)** | o teto subiu para 4 no [ADR 10](0010-a-categoria-de-sidebar-nao-e-destino.md), e era o teto que proibia |
| `Comandos › Índice` herda a fixture `painel-direito-vazio` | **origem própria (consequência)** | a dona anterior sai com `Biblioteca C`, e a sucessora precisa ser irmã das geradas |
| O gerador não troca de nome | herdado | [ADR 8](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) f) — o critério é o nome mentir, e este não mente |
| Nenhuma máquina confere contrato contra ferramenta | **lacuna por restrição** | conferir exigiria executar o `overpower` na CI, e ele mora em outro repositório |
