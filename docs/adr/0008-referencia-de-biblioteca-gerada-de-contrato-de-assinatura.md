# ADR 8 — A referência de biblioteca é gerada de contrato de assinatura

**Status:** aceito · slice 8 · 2026-08-13 · **supera o [ADR 5](0005-referencia-da-api-gerada-de-contrato.md)**

## Contexto

O [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) decidiu **gerar a
referência de um contrato**, e essa decisão sobreviveu inteira. O que não
sobreviveu foi a premissa: não há API de pagamentos, não há serviço HTTP, não há
`paths` nem `components`, e o OpenAPI 3.1 que o ADR 5 nomeia em cada seção não
descreve nada que este site publique.

O acervo tem uma biblioteca Python com página própria — `Ferramentas ›
Bibliotecas › Biblioteca C`, o `panlabs-esteira` —, e o que ela tem de
documentável é **a API pública dela**: assinatura de função, tipo e módulo.

**A decisão foi a mais cara do mapa, e o critério que a comprou é do dono:** *o
que valida mais superfície do sistema de documentação*. O conteúdo é
descartável, então o que se está comprando não é a página — é o exercício.

A opção rejeitada era a biblioteca **expor HTTP**. Ela custava menos e
**preservava um componente inteiro já especificado** (o `VerbBadge`), mas reusava
a mesma máquina que já gerou trinta páginas. Esta prova um gerador de referência
**não-HTTP**, que o projeto nunca exercitou.

## Decisão

### a) Dois contratos JSON, um por locale — nunca um bilíngue

`contratos/panlabs-esteira.pt-BR.json` e `contratos/panlabs-esteira.en.json`,
JSON puro, **estruturalmente congruentes**: mesmos ids, mesma ordem, mesmas
espécies, mesmos nomes de parâmetro, mesmos tipos, mesma obrigatoriedade e
**mesmos exemplos**.

A lista do que **pode** divergir é fechada e curta: `resumo`, `descricao`,
`quando`, e o bloco `rotulos`. Tudo o mais é contrato e não prosa — nome de
campo, tipo e valor de exemplo traduzidos produziriam um leitor de EN escrevendo
código que não roda.

**JSON, nunca YAML.** O parser inteiro do validador é `JSON.parse` — zero
dependência, contra o axioma 2. O validador recusa YAML como consequência direta
desta escolha, não como regra em separado.

### b) O gerador é script fora do build, rodado à mão, saída commitada

`scripts/gerar-referencia.mjs` não entra no `docusaurus.config.js` — nenhum
plugin, nenhum hook de build. Ele lê os dois contratos, valida, e escreve seis
`.mdx` por locale mais o fragmento de sidebar. A saída é **commitada** e entra no
diff, como qualquer página autoral.

**O nome `gerar-api` não sobrevive.** Um script chamado assim sobre um contrato
que não descreve API HTTP mente no nome do arquivo, e o portão reprova a
existência dele.

**A saída não é editável à mão.** Cada arquivo gerado abre com um comentário de
front matter dizendo isso, e a extensão `.mdx` — diferente do `.md` de toda
página autoral do site — é o segundo sinal, greppável e visível na árvore de
arquivos sem abrir nenhum deles.

### c) O gerador emite um FRAGMENTO de sidebar, não a árvore

O gerador anterior emitia `sidebars-api.js` inteira, porque a instância `api` era
inteiramente gerada. A instância nova é `ferramentas`: **quinze folhas autorais**
e seis geradas, e a árvore dela é escrita à mão.

`scripts/gerar-referencia.mjs` emite `sidebars-referencia.js` — **uma lista de
ids e nada além** —, e `sidebars-ferramentas.js` a importa e a espalha dentro de
`Biblioteca C`. É a única forma de as duas posses conviverem: emitir a árvore
inteira daria ao gerador a posse de quinze folhas que ele não conhece.

**Sem categoria própria para o ramo.** Um nó a mais ali seria o nível 4, e o teto
de profundidade é 3.

### d) O validador recusa alto, com JSON Pointer do nó ofensor

`scripts/lib/assinatura.mjs` tem **lista fechada de doze recusas**, e cada uma
aponta o JSON Pointer (RFC 6901) do nó — nunca ignora em silêncio:

| Recusa | O que a dispara |
| --- | --- |
| `nao-e-json` | `JSON.parse` falhou — é aqui que YAML cai |
| `contrato-desconhecido` | o par nome/versão não é `assinatura` 1 |
| `id-duplicado` | duas entradas escreveriam o mesmo arquivo |
| `especie-fora-da-lista` | espécie fora de `modulo` · `tipo` · `funcao` |
| `descricao-ausente` | prosa faltando em qualquer nó, inclusive o `quando` de um erro |
| `assinatura-ausente` | o cabeçalho do painel não tem de onde sair |
| `exemplo-ambiguo` | `exemplo` e `exemploCodigo` no mesmo nó |
| `aninhamento-acima-de-quatro` | o quinto nível de campo |
| `mais-de-quatro-erros` | mais de quatro erros documentados numa entrada |
| `referencia-morta` | id citado em `receptor`, `exporta`, `fluxo` ou `entrada` que não existe |
| `ciclo-de-receptor` | a cadeia do preâmbulo do snippet não fecha |
| `contratos-incongruentes` | divergência estrutural entre o par |

**O teto de aninhamento continua quatro, e ele continua calibrado.** A fixture
que o justifica trocou de dona: era `cobranca.pagamento.cartao.verificacoes` do
domínio anterior, e é `Procedimentos › Infraestrutura › O output de um módulo` —
escrita à mão no acervo, com exatamente quatro níveis.

**O reset de nível morreu com o `$ref`, e não deixou buraco.** No contrato
OpenAPI a contagem reiniciava ao alcançar um schema nomeado, senão o mesmo objeto
lia com orçamentos diferentes conforme onde fosse embutido. Aqui, um campo cujo
tipo é outra entrada **não aninha: ele linka** (o campo `entrada`), e
profundidade que não existe não precisa de reset.

**A recusa de linguagem de snippet saiu junto com as três linguagens.** Ela
conferia a lista contra `themeConfig.prism.additionalLanguages`; o painel tem
**uma** linguagem, `python`, e ela está no bundle padrão do
`prism-react-renderer`.

### e) O painel é front matter, não marcador em MDX

`api_exemplos` no front matter da página gerada — nunca um marcador solto no
corpo. Um marcador obrigaria o painel a nascer irmão de grid dos parágrafos, e
`position: sticky` precisa de um ancestral com contexto de rolagem previsível. O
valor do campo é o `JSON.stringify` do objeto — JSON é subconjunto de YAML de
fluxo, então nenhum emissor de YAML precisou ser escrito.

**O que o objeto carrega mudou, e o comutador não.** Ele carrega a assinatura, os
argumentos editáveis e **um** snippet Python — o verbo, as três linguagens e as
abas de resposta saíram com o contrato HTTP.

### f) Zero snippet escrito à mão

O texto do exemplo é **composto**: a linha de import sai dos símbolos que a
cadeia usa, o preâmbulo sai da entrada que liga o receptor, e a chamada sai da
assinatura com os exemplos dos parâmetros. Nenhuma das seis entradas tem snippet
próprio — é a mesma disciplina de zero-segunda-fonte que motivou o gerador
inteiro.

**Editável é argumento escalar com exemplo, e nada além.** É o porte direto da
regra anterior, onde caminho e consulta eram editáveis e o corpo era estático:
um `dict` dentro de um `<input type="text">` obrigaria o painel a parsear texto
de volta para estrutura, que é um interpretador dentro de um site estático.

## Consequências

1. **Editar uma função significa editar o contrato, nunca a página.** Um revisor
   de conteúdo lê `contratos/panlabs-esteira.pt-BR.json`, não MDX — é uma
   inversão real de onde a revisão acontece, e ela é o preço de ter uma fonte só.
2. **O portão 5 continua sendo regeneração mais diff**, e continua sendo um dos
   dois que não são varredura de texto (o outro é o 7). Um gerador determinístico
   rodado duas vezes sobre o mesmo contrato produz bytes idênticos; se não
   produzir, o contrato mudou sem o gerador rodar, ou alguém editou a saída à
   mão.
3. **O décimo tipo de página deixa de estar pendente.** `Referência de API` era o
   único dos dez sem instância, e a ausência estava declarada no portão 4. Ele
   passa a ter seis, e o portão passa a cobrar o número cheio: `Ferramentas`
   fecha em **21** folhas e o site em **52**.
4. **`data-sd-part="meta"` continua publicada, e a condição virou conferência.**
   Ela é a única entrada do catálogo que a régua estreita não obrigaria, e o que
   a segura é a rota gerada nomeá-la no contrato de partes dela. O portão 5 casa
   os dois elos da cadeia — a página gerada consome o campo, e o campo nomeia a
   parte — em vez de deixar a condição escrita em prosa.
5. **Adicionar uma entrada é adicionar um objeto em `entradas`.** O gerador não
   infere arquivo, título nem posição de sidebar de nada além do `id` e da ordem
   do array — inferir criaria uma segunda regra de nomenclatura implícita ao lado
   do contrato explícito.

## Por que supersessão e não edição do ADR 5

`docs/adr/README.md` diz que os ADRs são **numerados e imutáveis**, e isso decide
a forma.

O que sobrevive do ADR 5 é a **decisão** — gerar de contrato, com saída
versionada e portão. O que morre é a **premissa inteira**: OpenAPI 3.1 válido, o
validador com ponteiro JSON para nó de schema HTTP, o par de arquivos descrito em
termos de `paths` e `components`, e o **título do próprio ADR**.

Um documento cuja premissa e cujo título são falsos não é o mesmo documento — e a
imutabilidade existe exatamente para preservar o registro de *"decidimos OpenAPI
uma vez, e por quê"*. O ADR 5 fica no lugar, com cabeçalho de supersessão
apontando para cá e o conteúdo intacto.

## Alternativas descartadas

| Descartado | Motivo |
| --- | --- |
| A biblioteca expor HTTP | Custava menos e preservava o `VerbBadge` inteiro, mas reusava a máquina que já gerou trinta páginas; esta prova um gerador não-HTTP que o projeto nunca exercitou |
| Editar o ADR 5 no lugar | Os ADRs são imutáveis, e a premissa e o título dele ficaram falsos — editar apagaria o registro de por que OpenAPI foi escolhido uma vez |
| Contrato bilíngue num arquivo só | O par monolíngue é o que mantém cada arquivo legível por ferramenta de terceiro; um campo `pt`/`en` dentro de cada descrição quebra isso |
| YAML em vez de JSON | Custaria uma dependência de parser contra o axioma 2, por conforto de edição que não paga o preço |
| Gerar a árvore de sidebar inteira | Daria ao gerador a posse das quinze folhas autorais de `Ferramentas`, que ele não conhece |
| Categoria própria para o ramo gerado | Seria o nível 4, e o teto de profundidade é 3 |
| Gerar em build time, sem commitar a saída | O build nunca deveria falhar por bug do gerador; saída commitada é revisável no diff como qualquer página |
| Abas de resultado no painel | Uma chamada de função tem uma forma de resultado, não um status por resultado; o que ela devolve e levanta são seções de prosa, onde se leem |

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Gerar de contrato, saída commitada, portão de diff | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) — a decisão sobreviveu à troca de premissa |
| O contrato descreve assinatura de função, tipo e módulo | origem própria | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) — o critério do dono é o que valida mais superfície |
| Dois contratos, nunca bilíngue | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) a) |
| A lista fechada do que pode divergir entre o par | **origem própria (implementação)** | descoberto escrevendo a congruência: sem a lista, "congruente" não é conferível |
| JSON em vez de YAML | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) a) — consequência direta do axioma 2 |
| `gerar-api` não sobrevive ao nome | origem própria | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) — o nome do arquivo mentiria |
| Fragmento de sidebar em vez da árvore | origem própria | a instância tem quinze folhas autorais que o gerador não conhece |
| Sem categoria própria para o ramo | **origem própria (consequência)** | seria o nível 4, e o teto é 3 — ver `docs/design/informacao.md` §3.1 |
| A lista fechada de doze recusas, com JSON Pointer | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) c) — a régua sobreviveu, os membros não |
| O teto de quatro níveis | **origem própria** | a dona é `Infraestrutura › O output de um módulo`, escrita à mão com quatro níveis |
| O reset de nível sai sem deixar buraco | **origem própria (consequência)** | um campo cujo tipo é outra entrada linka em vez de aninhar |
| A recusa de linguagem de snippet sai | **origem própria (consequência)** | o painel tem uma linguagem, e `python` está no bundle padrão do `prism-react-renderer` |
| `api_exemplos` em front matter, não marcador em MDX | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) d) — `position: sticky` exige ancestral com contexto de rolagem previsível |
| Zero snippet escrito à mão | herdado | [ADR 5](0005-referencia-da-api-gerada-de-contrato.md) — os três snippets de lá também eram templados |
| Editável é argumento escalar com exemplo | **origem própria (implementação)** | porte da regra de caminho/consulta; estrutura num campo de texto exigiria um parser |
| A condição de `data-sd-part="meta"` vira conferência | **origem própria (implementação)** | o literal não pode aparecer no MDX — quem escreve o atributo é o componente, e a página escreve a tag; o portão casa a cadeia |
| Supersessão em vez de edição | origem própria | `docs/adr/README.md` — os ADRs são numerados e imutáveis |
| O dissenso da opção rejeitada | origem própria | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) — ela custava menos e preservava um componente inteiro já especificado |
