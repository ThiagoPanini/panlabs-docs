# A referência gerada

**Nenhum valor numérico nasce aqui sem citar `tokens.md`.** Os comprimentos
moram lá; este documento faz contas com eles.

**Quatro páginas**, geradas de um contrato de **superfície de comando** — uma
aplicação e três comandos (a decisão de arquitetura é o
[ADR 9](../adr/0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md),
que supera o [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md);
este documento é o desenho) —, e um único degrau de interatividade num painel.

> **Correção de contagem, duas vezes, e a segunda esvazia a primeira.** Esta
> abertura dizia *"a primeira das duas rupturas de layout do site — a outra é a
> landing"*. A landing saiu em
> [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), e o par
> virou uma só. Depois **a que sobrava também saiu**: na
> [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) o
> `docItemComponent` foi removido e o painel desceu para o fluxo da prosa.
>
> **O site tem ZERO ruptura de layout.** As 26 folhas da aba `Ferramentas`
> passam pelo mesmo `@theme/DocItem`, e a exceção que
> [`informacao.md`](informacao.md) §6 autorizava por nome deixou de ser usada —
> ela continua autorizada, e ninguém a exerce. O que este documento descreve, de
> §4 em diante, é **conteúdo gerado**, não moldura: a ordem das seções, o
> contrato, o gerador e o painel.

O documento anterior descrevia trinta páginas de endpoint sobre um contrato
OpenAPI, e foi **renomeado e reescrito** quando o contrato deixou de falar HTTP.
O que sobreviveu à troca não foi herdado verbatim: cada seção abaixo é a conta
refeita contra a cadeia nova.

---

## 1. A página de comando mede o que qualquer página mede

> **Correção de fato — [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118), e ela derruba a seção inteira que estava aqui.**
> Este bloco publicava uma aritmética — `577 + 32 + 511 = 1120` — e o que ela
> justificava era a ausência do TOC nesta rota. A conta fechava; o produto que
> ela descrevia é que não se sustentou.
>
> Duas coisas o mediram. A prosa desta rota era **a mais estreita do site**
> (577 contra 720), e ela é justamente a rota com a linha de comando mais
> longa — a assinatura do `install` tem 137 caracteres e quebrava em três
> linhas dentro do painel. E o trilho era **grudado e curto**: ele acabava
> depois de três blocos, enquanto a prosa seguia por mais mil pixels de
> rolagem, deixando a metade direita da tela vazia pelo resto da página.
>
> O texto antigo fica registrado abaixo, pela mesma regra do resto da spec.

**Não há aritmética a publicar, e essa é a decisão.** A página de comando usa
`--sd-prose-width` (720) e a coluna do TOC (304), como toda página de doc deste
site. Não há grade própria, não há gutter próprio, não há coluna que precise ser
o resto de uma conta.

O painel desceu para o **fluxo da prosa** e virou `<PainelComando />`, um bloco
de MDX que o gerador emite no corpo — ver §5. Um bloco de fluxo herda a largura
do texto e não negocia com nada.

### 1.1 O que a conta antiga justificava, e o que fica dela

A conta teve três justificativas ao longo da vida, e as três caíram:

1. **A página de endpoint não tinha cartão** — porque a soma fechava o container
   e não sobrava pixel para a moldura. Caiu duas vezes: a geometria `mint` tirou
   o cartão de todas as páginas, e o endpoint deixou de existir.
2. **Não sobra coluna para o TOC** — a décima perda nomeada da rota, e ela era
   apresentada como aritmética, não gosto. Era verdade enquanto a grade era a
   premissa; a [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) derrubou a premissa, e o TOC voltou sem ninguém precisar
   arrumar espaço para ele.
3. **`--sd-api-prosa-width` porta a proporção da âncora** (#99): §10 de
   `research/paridade-devin` mede a âncora com prosa estreita e trilho largo
   nesta rota. Esta é a única que não caiu por defeito de raciocínio — ela caiu
   por decisão, e a decisão está no §7.

**O que fica é o `calc()` como técnica, e o registro de que ele funcionou.** A
prosa subiu de 672 para 720 e o painel desceu de 448 para 400 sozinho quando a
geometria mudou, e depois a base virou 577 e o trilho virou 511 sozinho de novo
— nenhuma linha de ajuste, nas duas vezes. Um 448 cravado teria quebrado calado
nas duas. A conta saiu porque o layout saiu, não porque a técnica falhou.

## 2. Não há comutador, e nenhuma página desta instância muda de layout

> **Correção de fato — [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118).** Esta seção descrevia `ApiDocItem`, um
> `docItemComponent` que lia `frontMatter.api_exemplos` e trocava o layout da
> página inteira: a perna *ausente* delegava para `@theme/DocItem`, a perna
> *presente* montava uma grade de duas colunas sem TOC. As duas pernas viraram
> uma. O componente saiu de `src/theme/`, e `docusaurus.config.js` não declara
> mais `docItemComponent` nesta instância.

As **26 páginas** da aba `Ferramentas` — 22 autorais e 4 geradas — passam pelo
mesmo `@theme/DocItem`, com a mesma coluna e o mesmo TOC. O que distingue uma
página de comando de uma página autoral é **o que está escrito nela**, não a
moldura em volta.

`api_exemplos` **continua no front matter**, e continua sendo a fonte única dos
dados do painel — o que ele deixou de fazer é comutar layout. Quem o lê hoje é
o próprio `<PainelComando />`, por `useDoc()`, de dentro do fluxo do MDX. As
duas razões pelas quais ele é front matter e não atributo de tag sobrevivem
inteiras:

- **serializar o painel como prop** dentro do corpo do MDX daria uma segunda
  cópia dos mesmos dados, e o portão 5 não veria as duas divergirem — ele
  regenera e diffa a saída contra ela mesma;
- **`hide_table_of_contents` continua ausente de todas as páginas**, geradas
  inclusive. Ele era segunda fonte para uma decisão que o comutador tomava;
  agora não há nem comutador nem decisão a tomar — o TOC aparece quando a
  página tem heading, que é a regra do site inteiro.

> **A razão que caiu, e vale registrar por que ela era boa.** O texto antigo
> dizia que um marcador no corpo do MDX obrigaria o painel a ser irmão de grid
> dos parágrafos, e que `position: sticky` precisa de um ancestral com contexto
> de rolagem previsível. Estava certo — **enquanto o painel fosse grudado**. Ele
> não é mais, e um bloco de fluxo é exatamente o que o argumento proibia. A
> premissa saiu junto com o `sticky`; o argumento não foi refutado, ficou sem
> sujeito.

### 2.1 A fixture que provava a perna vazia

`Ferramentas › Bibliotecas › overpower › Comandos › Índice` era a fixture da
perna *ausente*: prosa autoral, zero `api_exemplos`, e o painel direito
**inalcançável, não vazio**. Ela continua onde estava — a folha que abre a
categoria das quatro geradas —, e o que ela prova mudou: hoje ela é a página
irmã que mostra que uma folha **sem** painel e uma **com** painel medem a mesma
coisa, lado a lado, a um clique de distância.

Uma implementação que deixasse coluna direita vazia ali estaria errada; hoje o
motivo é mais simples do que era, e é o mesmo de qualquer página do site: não
existe coluna direita além do TOC.

## 3. O `sticky` saiu, e com ele o erro nº 1

> **Correção de fato — [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118).** Esta seção era um aviso, e o aviso perdeu o
> assunto. Ela ficou porque o mecanismo que ela descreve é real e volta a
> morder quem montar qualquer trilho grudado neste projeto.

**O que ela dizia.** Dentro de um `display: flex` com `align-items: stretch` (o
default), um item de flex sem `align-self` próprio estica para a altura do irmão
mais alto — ali, a prosa. Um painel esticado para a altura da prosa **já
preenche toda a área de rolagem disponível**, então `position: sticky` não tem
para onde grudar: parece travado desde o topo, e o sintoma é sutil o bastante
para passar batido numa tela onde a prosa é curta. A saída era `align-self:
start`, que encolhe o painel para a altura do próprio conteúdo, e só depois
disso "sticky" tem distância a percorrer.

**Nada disso está no produto hoje.** Sem grade não há item de flex, sem item de
flex não há `align-self`, e o painel em fluxo não gruda em nada. As três
declarações saíram juntas, e com elas o limiar de 997px que virava a grade de
`column` para `row`.

**O que sobrevive é a regra geral, e ela vale para o TOC**, que é o único
elemento grudado que restou no corpo de uma página: quem gruda precisa de altura
própria menor que a do irmão, e o offset dele lê `--sd-topo-conteudo`. Ver
`chrome.md` §11.

## 4. A ordem das seções da página gerada

Fixa, e o gerador a produz sempre na mesma sequência:

1. `# Título` — o nome da entrada, como o leitor a digitaria no terminal
2. **a espécie e o nome qualificado, em prosa** — `**Comando** · `overpower install``. É o lugar onde a pílula de verbo ficava, e ele não ganhou substituto gráfico: sem verbo não há duas categorias para pintar, e um chip com uma palavra em três variações não é sinal, é enfeite
3. A `descricao` da entrada
4. `## Comandos` — **só na raiz**, e antes de ela descrever a si mesma: a tabela dos membros, com nome, espécie e resumo
5. `## Opções globais` (aplicação) ou `## Opções` (comando) — um `<ParamField>` por opção, na ordem da assinatura; ausente quando a entrada não tem nenhuma
6. `## Códigos de saída` — a árvore `<ResponseField>`. **Sempre na raiz**, que é a única dona da tabela, e no comando só quando ele tem um código que a raiz não cobre
7. `## Erros` — uma tabela Erro/Quando; ausente quando a entrada não levanta nada

O painel, à direita, não é uma seção da prosa — ele é a **outra** coluna, e a
ordem dele é interna e fixa: a assinatura, a fileira de argumentos editáveis (só
quando existem), e o snippet da linha de comando.

**No estreito, o painel completo vem depois de toda a prosa** — não
intercalado por seção. É consequência do §3: a grade tem exatamente dois
filhos, prosa e painel, e o empilhamento respeita essa fronteira.

### 4.1 O que o painel perdeu, e por quê

| O que saiu | Por quê |
| --- | --- |
| A pílula de verbo | Não há verbo. O `VerbBadge` saiu do catálogo no mesmo movimento, e sem carimbo de reabertura: não sobrou estado plausível que o peça de volta |
| Duas das três abas de linguagem | O cenário fixado tem **uma** linguagem de programação real. Três abas para uma linguagem é a moldura sem o quadro |
| As abas de resposta | Uma chamada de função tem **uma** forma de resultado, não um status por resultado. O que ela devolve e o que ela levanta são as seções `Retorno` e `Erros` da prosa, onde se leem inteiras em vez de espremidas numa aba de 400 |

**O que ficou é o degrau de interatividade, e ele é o mesmo:** editar um
argumento troca texto no snippet por substituição de string. Não há chamada de
rede, não há campo de token, e `<label>` mais `<input type="text">` nativos são a
superfície mais estreita que existe — o contrato de estado de entrada
([`foco.md`](foco.md)) cobre o resto de graça.

**Editável é argumento escalar com exemplo, e nada além.** É o porte direto da
regra anterior, onde parâmetro de caminho e de consulta eram editáveis e o corpo
da requisição era estático: um `dict` ou uma lista dentro de um campo de texto
obrigaria o painel a parsear texto de volta para estrutura, que é um
interpretador dentro de um site estático.

## 5. O gerador e o contrato

Resumo; a decisão de arquitetura completa está no
[ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md).

`contratos/overpower.pt-BR.json` e `contratos/overpower.en.json` —
JSON puro, monolíngues, estruturalmente congruentes. `scripts/gerar-referencia.mjs`
os lê, valida (`scripts/lib/assinatura.mjs`), e escreve **quatro** páginas `.mdx`
nos dois locales mais `sidebars-referencia.js`. Rodado à mão
(`npm run gerar:referencia`), fora do build; a saída é commitada, e
`npm run portao:5` reprova se regenerar produzir um diff contra o que está
commitado.

**O nome importa, e `gerar-api` não sobrevive.** Um script chamado assim sobre um
contrato que não descreve API HTTP mente no nome do arquivo — e o portão reprova
a existência dele, para que a mentira não volte por cópia.

### 5.1 Fragmento, não árvore

O gerador anterior emitia a sidebar **inteira** da instância dele, e precisava
conhecer as seis páginas autorais que a instância também tinha — elas entravam
num pequeno manifesto dentro do próprio gerador, não porque fossem geradas, mas
porque a posição delas na árvore era.

Isso não sobrevive à instância nova. `ferramentas` tem **vinte e duas** folhas
autorais em quatro famílias, e a árvore delas é escrita à mão. O gerador passa a
emitir um **fragmento** — `sidebars-referencia.js`, uma lista de itens de folha e
nada além —, e `sidebars-ferramentas.js` o importa e o espalha dentro da
categoria `Comandos`.

Três consequências, e as três são o motivo:

- **as duas posses não se misturam.** Editar uma folha autoral não passa pelo
  gerador; editar uma gerada não passa pela mão;
- **os dois tickets ficam verdes.** A sidebar sem o ramo gerado era válida, e a
  com o ramo é a mesma sidebar mais um `import`;
- **o ramo ganha categoria própria, e ela é autoral.** O ADR 8 §c) a recusava
  porque *"seria o nível 4, e o teto é 3"*; o teto subiu para 4
  ([ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) §g) e a razão
  caiu com ele. As quatro moram sob `Comandos`, que é nó de nível 3 escrito à
  mão: o rótulo dele e a folha que o abre são autorais, e o gerador não os
  conhece. O que o fragmento traz continua sendo só a lista de folhas.

### 5.2 O snippet é composto, nunca escrito

Nenhuma das quatro entradas tem snippet próprio. O gerador o compõe em três
pedaços, e os três saem do contrato:

1. **o preâmbulo de alcance** — **na espécie de CLI ele não existe**: não há o
   que importar antes de digitar um comando, e uma linha em branco no topo do
   bloco seria enfeite que o leitor copiaria junto (§5.5). Ele existia na espécie
   de biblioteca, como a linha de `import` com os símbolos da cadeia, e saiu com
   ela;
2. **o preâmbulo** — a chamada da entrada que liga o receptor, com os exemplos
   dela **congelados**. É recursivo, e o validador recusa ciclo;
3. **a chamada** — a assinatura com os exemplos dos parâmetros, e um
   `{{placeholder}}` em cada argumento editável.

**O marcador `{{argumento}}` é declarado num lugar só, e os dois lados o leem de
lá.** `src/theme/MDXComponents/placeholder.mjs` é submódulo do registro que
hospeda o painel — ele mudou de casa junto com `PainelComando.js` na [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) — e
o gerador o importa — o mesmo caminho que a régua da busca já usa sobre
`SearchBar/escada.mjs`. **O portão 5 não pegaria a divergência**, e é por isso que
ela precisa de arquivo: ele regenera e diffa, então um gerador que passasse a
escrever `${argumento}` contra um painel que ainda casasse `{{argumento}}`
produziria diff limpo e marcador cru na tela. O que fecha o par é o `npm test`,
que confere os doze `.mdx` emitidos: nenhum marcador sem argumento que o
substitua.

**Parâmetro sem exemplo não entra na chamada**, e é essa regra que mantém o
snippet **válido** em vez de só completo. `Passo` tem `roda` e `usa` mutuamente
exclusivos — declarar os dois é a chamada que a própria biblioteca recusa —,
então só um dos dois carrega exemplo no contrato. Os dois continuam documentados
em `## Parâmetros`; o que o exemplo decide é o snippet, não a ficha.

A página do módulo é a mesma máquina com outra entrada: o `fluxo` do contrato
nomeia as entradas que compõem a sequência inteira, e o preâmbulo de cada uma é
emitido **uma vez só**.

**A linha 1 da página do módulo é a assinatura dele.** O que se escreve para
alcançar um módulo é o `import`, e ter duas fontes para a mesma linha — uma no
campo `assinatura` e outra derivada — era o convite a elas divergirem.

### 5.3 O validador, e o teto que trocou de dona

**Lista fechada de doze recusas**, cada uma apontando o JSON Pointer (RFC 6901)
do nó ofensor. A lista inteira está na seção d) do
[ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md);
aqui ficam as duas que este documento decide.

**O teto de aninhamento é quatro, e ele é calibrado, não redondo.** A dona é
`Procedimentos › Infraestrutura › O output de um módulo` — escrita à mão no
acervo, com exatamente quatro níveis. Um quinto reprova antes de virar página
ilegível.

**O reset de nível saiu, e não deixou buraco.** No contrato anterior a contagem
reiniciava ao alcançar um schema nomeado por `$ref`; sem isso, o mesmo objeto
lia com orçamentos de profundidade diferentes conforme onde fosse embutido. Aqui
um campo cujo tipo é outra entrada **não aninha — ele linka**, e profundidade que
não existe não precisa de reset. O link vai em caminho de arquivo (`./passo.mdx`),
que é a forma que `onBrokenMarkdownLinks: 'throw'` confere no build.

### 5.4 A parte `data-sd-part="meta"` continua publicada, e a condição virou conferência

`meta` é a única entrada do contrato de partes do catálogo que a régua estreita
**não obrigaria** — ela é o único `<span>` do cabeçalho do campo, e uma skin a
alcançaria por `> span`. O que a segura é a rota gerada nomeá-la no contrato de
partes dela, e despublicar depois quebra quem já dependeu.

**A condição é conferida, e não afirmada.** O portão 5 casa os dois elos da
cadeia: `src/components/Campo.js` escreve o atributo, e as cinco páginas geradas
de tipo e função consomem o campo. A página do módulo fica fora da conta porque
um módulo não tem parâmetro nem retorno — e a exclusão sai do próprio contrato,
não de uma lista de exceção a manter.

**Por que a cobrança não é um `grep` no `.mdx`.** A instrução herdada diz *"o
gerador nomeia `data-sd-part="meta"`"*, e o literal **não pode** aparecer na saída
do gerador: quem escreve o atributo é o componente, e a página escreve a **tag**.
Grepar a string no MDX conferiria uma coisa que nenhum renderizador lê.

### 5.5 As espécies, e a forma que cada uma emite

A lista de espécies é **fechada e validada**, com recusa nomeada
(`especie-fora-da-lista`) e o JSON Pointer do nó ofensor. Ela está em **duas**,
`aplicacao` e `comando`, decididas pelo
[ADR 9](../adr/0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md) §a).
As três de biblioteca do
[ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md)
saíram com o contrato mockado que as pedia.

> **O expand–contract fechou, e o meio dele foi um estado real.** A máquina
> aprendeu `aplicacao` e `comando` num commit em que o sujeito no ar ainda era
> `Biblioteca C`, e a lista ficou em cinco por um ticket. O que a fatia contract
> devolveu não foi só o tamanho: com as três espécies saiu o **dialeto Python** do
> gerador, que ficaria inalcançável se ficasse. A tabela de dialetos ficou com uma
> linha e a tabela fica — o que ela prova, que a espécie escolhe o dialeto em vez
> de o contrato declarar um, é o que dispensa um campo novo no JSON no dia em que
> a segunda linha voltar.

Quem escolhe as seções é uma tabela de forma no gerador, não uma cascata de
`if`, e quem escreve os títulos é o bloco `rotulos` do contrato:

| Espécie | Membros | `<ParamField>` | `<ResponseField>` | Snippet |
| --- | --- | --- | --- | --- |
| `aplicacao` | `## Comandos` | `## Opções globais` | `## Códigos de saída` | shell |
| `comando` | — | `## Opções` | `## Códigos de saída`, só se tiver | shell |

**Os dois componentes não mudam, e é a leitura deles que muda.** `ParamField`
descreve *um parâmetro nomeado com tipo, obrigatoriedade e padrão*, que é o que
uma opção de CLI é; `ResponseField` descreve *o que a chamada devolve*, que é o
que um código de saída é. O catálogo continua fechado em dezessete — foi por
nunca terem sido específicos de protocolo que os dois sobreviveram à morte do
`VerbBadge`.

**A raiz é a única dona da tabela de códigos de saída.** Os comandos apontam
para ela em vez de repeti-la, e uma `aplicacao` sem `retorno` **para o gerador**:
sem a parada, a página que devia trazer os códigos sairia dizendo que não
devolve valor, com o diff do portão 5 limpo.

**Rótulo ausente também para o gerador**, nomeando a chave. Sem isso a seção
sairia `## undefined` dos dois lados do diff, que é o mesmo buraco do marcador
órfão do §5.2. E as **chaves** de `rotulos` entram na congruência do par, ainda
que os **valores** divirjam por definição: uma chave que existisse num locale só
seria uma seção sem título na metade do site.

## 6. As oito perdas nomeadas da rota vanilla, e a décima — que foi paga

O ledger completo, com o motivo de cada uma, mora em
[`swizzle.md`](swizzle.md) §4. Aqui elas entram numa linha cada, porque um
leitor desta página precisa saber o que a rota comum **já** não tem, antes
de entender o que esta rota acrescenta.

| # | Perda |
| ---: | --- |
| 1 | Nó injetado dentro do corpo da página — eyebrow, bloco de feedback, CTA lateral |
| 2 | Breadcrumb reestruturado como a eyebrow da âncora |
| 3 | A proporção da âncora entre conteúdo e painel |
| ~~4~~ | ~~Faixa de tabs de largura total abaixo do navbar~~ — **removida**; era fato errado, e a [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) mediu a faixa saindo de degraus 0, 1 e 2. A numeração não é remendada: ver [`swizzle.md`](swizzle.md) §4 |
| 5 | TOC com anatomia nova — barra de progresso, seções extras |
| 6 | Ícone preso dentro de componente `unsafe` mantém o desenho do Docusaurus |
| 7 | Footer dentro da coluna de prosa, como a âncora faz |
| 8 | Armadilha de foco na sidebar de tela estreita |
| 9 | Posição do botão de voltar ao topo na ordem de tabulação |

**A décima era desta rota, e ela foi PAGA na [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118).** Ela dizia *a página gerada
não tem TOC*, e o motivo era a aritmética do §1: a soma das três medidas fechava
o container, e a coluna que o painel ocupava era justamente a do TOC. O painel
desceu para o fluxo, a coluna vagou, e o TOC voltou — nas quatro páginas, sem
ninguém precisar abrir espaço para ele.

| # | Perda | Estado |
| ---: | --- | --- |
| ~~10~~ | ~~A página gerada não tem TOC~~ | **paga** — o painel saiu da coluna do TOC na [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) |

**Ela encolheu três vezes, e a terceira zerou.** Nasceu dizendo *"a página de
endpoint não tem cartão nem breakout"*; a geometria `mint` tirou os dois de
todas as páginas, e o que era perda desta rota virou fato do site. Depois a
página de endpoint deixou de existir. Sobrou o TOC — e ele era perda de verdade,
porque obrigava o leitor a navegar a página pela lista de entradas da sidebar em
vez de pela dos headings.

**O argumento que a segurava era bom, e não foi ele que a resolveu.** Ele dizia
que as quatro páginas são curtas por construção, porque cada uma documenta *uma*
entrada, e que uma referência grande a ponto de precisar de TOC seria uma
entrada que precisa virar duas. Continua verdade. O que mudou é que a página
não precisa mais desse argumento: ela tem TOC como qualquer outra, e a
brevidade dela virou qualidade em vez de defesa.

**A conta das perdas fica em nove**, e o número não se reaproveita — a décima
não vira a décima primeira de outra coisa, pelo mesmo precedente que congela a
numeração dos portões. Ver [`swizzle.md`](swizzle.md) §4.

## 7. O dissenso, registrado

**A opção rejeitada custava menos e preservava um componente inteiro já
especificado.** A biblioteca podia expor HTTP: o contrato continuaria OpenAPI, o
`VerbBadge` continuaria no catálogo com a ficha dele escrita, e o ADR 5 não
precisaria ser superado.

Ela foi recusada por reusar a mesma máquina que já gerou trinta páginas. O
critério do dono é *o que valida mais superfície do sistema de documentação* — o
conteúdo é descartável, e o que se compra é o exercício, não a página. Um gerador
de referência **não-HTTP** é a superfície que o projeto nunca tinha exercitado.

O preço está pago à vista, e é este: um componente especificado morreu, um ADR foi
superado, e um documento inteiro da spec foi reescrito.

### 7.1 O trilho lateral, e por que ele saiu — [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118)

**A opção rejeitada é a que estava no produto**, e ela tinha uma medição
sustentando: §10 de `research/paridade-devin` mede a âncora com prosa estreita e
trilho largo **nesta rota especificamente**, e a #99 portou essa proporção. Manter
o trilho seria manter o carimbo `herdado` numa decisão de layout — a classe que o
§5 de [`principios.md`](principios.md) manda não tocar.

Ela foi recusada por dois fatos medidos aqui, não na âncora:

1. **A prosa mais estreita do site caiu na rota de linha mais longa.** 577px
   contra os 720 de todas as outras páginas, e a assinatura do `install` tem 137
   caracteres. Ela quebrava em três linhas dentro do painel, e o snippet ao lado
   rolava na horizontal. A âncora documenta HTTP, onde o caminho é curto; a
   proporção dela foi medida sobre um conteúdo que esta rota não tem.
2. **O trilho grudado esvaziava a tela.** Ele acabava depois de três blocos, e a
   prosa seguia por mais de mil pixels de rolagem com metade da largura da
   janela em branco ao lado.

**O que se pagou:** um `docItemComponent` foi apagado, três linhas de alvo
medido saíram do §8, uma linha de `paridade-abertas.txt` saiu pelo próprio
gatilho, e a proporção da âncora nesta rota deixou de ser perseguida — o que é
uma decisão de produto contra uma medição, e está escrita aqui para poder ser
contestada.

**O que se comprou:** a décima perda paga, uma superfície a menos em
`src/theme/`, e uma página de comando que mede o que qualquer página mede.

> **Dissenso.** Nada disso refuta a medição da âncora: ela mede o que mede, e
> uma prosa estreita ao lado de um trilho largo é uma escolha defensável para
> quem tem conteúdo que a comporte. **Reabre quando** o contrato de assinatura
> passar a carregar exemplo longo o bastante para o painel valer uma coluna
> própria — hoje ele carrega uma linha de comando e dois campos.

---

## 8. Alvo medido — a moldura e o painel, contra a âncora

A âncora deste projeto é o `docs.devin.ai`, e a spec declara **zero delta
deliberado** contra ela — o mesmo padrão de [`chrome.md`](chrome.md) §11.
`npm run paridade` mede o site **construído** contra esta tabela e imprime a
lista do que não fecha; é relatório, não portão (`continue-on-error` na CI).

Os números **não nascem aqui**: são medição de primeira mão da âncora,
registrada em `research/paridade-devin` §10. Editá-los é afirmar que a âncora
mudou, não que este projeto mudou. A largura de referência é **1512**, a
mesma dos demais alvos do site.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Painel raio | `16px` | exato |

**A tabela tinha quatro linhas e tem uma, e as três que saíram não fecharam:
elas perderam o objeto.** `Trilho`, `Trilho grudado em` e `Coluna de texto`
mediam o layout de duas colunas desta rota — prosa de 577 ao lado de um trilho
grudado de 511. O trilho desceu para o fluxo na
[#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) e virou
um bloco de MDX, e não existe mais elemento a medir: as duas sondas de trilho
passariam a imprimir `sem-medida` em toda execução.

**A régua para isso é a que este projeto já aplica**, e ela está escrita em
`scripts/paridade.mjs`: `Accordion`, `Tabs`, `Frame` e `Mermaid` não têm sonda
porque não são renderizados em página nenhuma, e a nota de lá diz por quê — *um
alvo que não confere nada é pior que alvo nenhum: parece cobertura*. Alvo que
sobrevive ao elemento é o mesmo defeito visto do outro lado.

**`Coluna de texto` saiu por outro motivo, e é o que interessa:** esta rota
deixou de ter largura de prosa própria. Ela mede o que qualquer página de doc
mede, e quem a cobre é `Coluna de texto` de [`chrome.md`](chrome.md) §11 —
alvo `720,81px`, que **fecha**. Republicar o número aqui daria duas linhas de
alvo para um mecanismo só, que é a segunda fonte que a §1 deste documento
existe para não ter.

**O que se perdeu de cobertura, e o que não.** A prosa desta rota continua
medida — pela sonda da prosa comum, que é o mecanismo que ela passou a usar.
O que deixa de ser medido é a distância entre este projeto e o trilho da
âncora, e ela deixa de ser medida porque deixou de ser perseguida. Não é
tolerância alargada para esconder distância: é uma linha de alvo retirada
junto com o alvo.

> **O que a tabela dizia sobre o topo grudado, e por que fica registrado.**
> `Trilho grudado em` publicava `152` reusando o número da `TOC grudado em` de
> [`chrome.md`](chrome.md) §11 — os dois grudavam sob o mesmo topo fixo, e era
> o mesmo fato medido na âncora, não coincidência tratada como derivação.
>
> A correção S3-3 nasceu daí: este documento publicava `152` como alvo e, 245
> linhas antes, `top: var(--sd-topo-grudado)` como mecanismo, que resolve em
> **112**; do outro lado, o TOC herdava `calc(var(--ifm-navbar-height) + 1rem)`
> do `theme-classic` e dava **128**. *"O mesmo topo fixo"* eram **dois**
> números, e nenhum era o alvo. Os dois passaram a ler `--sd-topo-conteudo`
> (`tokens.css`), que é `--sd-topo-grudado` mais `--sd-space-10`.
>
> **O TOC continua lendo esse token**, e é por isso que a correção sobrevive à
> saída do trilho: ela nunca foi sobre o painel, foi sobre haver um número só
> para *sob o topo fixo*. O que sai é a segunda leitura dele, não a decisão.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O painel é objeto, e o único do corpo | origem própria (correção) | era *"o painel é o cartão"*; ele sobrevive por ser bloco de dados ao lado do texto, não moldura de prosa |
| **Front matter em vez de prop na tag** | **origem própria (correção)** | a razão era `position: sticky` exigir ancestral com contexto de rolagem previsível, e ela saiu com o `sticky`. A decisão fica com razão nova, mais forte: prop seria segunda cópia do `api_exemplos`, e o portão 5 não veria as duas divergirem — ele diffa a saída contra ela mesma |
| Nenhuma página da instância carrega `hide_table_of_contents` | origem própria (correção) | era segunda fonte para uma decisão do comutador; sem comutador, o TOC segue a regra do site — aparece quando há heading |
| **A fixture do painel inalcançável trocou de dona** | **origem própria** | `overpower › Comandos › Índice` é irmã de sidebar das geradas **e** a folha que abre a categoria delas, o que torna a prova mais forte que a anterior |
| Offset do sticky em `--sd-topo-conteudo` | **origem própria (correção)** | duas correções na mesma linha: era `--sd-navbar-height`, que passou a medir só a linha 1 quando a faixa de tabs entrou, e virou `--sd-topo-grudado`; **S3-3** mostrou que `--sd-topo-grudado` (112) contradizia o alvo de 152 publicado no §8 deste mesmo documento. Medido por `npm run paridade`, `Δ −40` |
| A ordem das seções da página gerada | origem própria (implementação) | decidida ao escrever `scripts/gerar-referencia.mjs` |
| **A espécie e o nome qualificado no lugar da pílula** | **origem própria** | sem verbo não há duas categorias para pintar, e um chip de três variações é enfeite |
| **O painel perde as abas de linguagem e de resposta** | **origem própria (consequência)** | uma linguagem real no cenário fixado, e uma forma de resultado por chamada de função |
| Editável é argumento escalar com exemplo | origem própria (implementação) | porte da regra de caminho/consulta; estrutura num campo de texto exigiria um parser |
| O gerador e o contrato | origem própria | [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) |
| **Fragmento de sidebar em vez de árvore** | **origem própria** | a instância tem folhas autorais que o gerador não conhece — quinze quando a decisão foi tomada, onze desde a #114 |
| **O teto de quatro níveis trocou de dona** | **origem própria** | era `cobranca.pagamento.cartao.verificacoes`, do domínio morto; é `Infraestrutura › O output de um módulo` |
| **O reset de nível sai sem deixar buraco** | **origem própria (consequência)** | um campo cujo tipo é outra entrada linka em vez de aninhar |
| **A condição de `meta` vira conferência de cadeia** | **origem própria (implementação)** | o literal não pode aparecer no MDX; quem escreve o atributo é o componente |
| As nove perdas nomeadas, restatadas | herdado | [`swizzle.md`](swizzle.md) §4 |
| **A décima perda foi paga** | **origem própria** | [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) — o painel saiu da coluna do TOC e o TOC voltou; o número não se reaproveita |
| **O que segura a décima perda mudou de argumento** | **origem própria (correção)** | não é o gerador emitir duas seções — ele emite até quatro; é cada página documentar uma entrada |
| **O dissenso da opção rejeitada** | origem própria | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) — ela custava menos e preservava o `VerbBadge` inteiro |
| **A aritmética do §1 corrigida para o container de 1120** | **origem própria (correção)** | a #96 derrubou `--sd-container-width` de 1152 para 1120 e este documento não veio junto; o painel real já dava 368, não 400 |
| **O fio sob o cabeçalho do painel** | **herdado + origem própria** | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — a chrome de cabeçalho da âncora portada sem o segundo nível de preenchimento que ela tem, pela mesma simplificação já registrada em `estilos.module.css` |
| A seção "Alvo medido" (§8) | origem própria | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — mesmo padrão de [`chrome.md`](chrome.md) §11; números de `research/paridade-devin` §10 |
| **O painel desce para o fluxo, logo depois da linha do comando** | **origem própria** | [#118](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/118) — a linha diz *como isto se chama*, e a pergunta seguinte numa página de CLI é *como isto se digita*; prosa entre as duas obrigaria a rolar para achar a linha copiável |
| **`ApiDocItem` sai de `src/theme/`** | **origem própria (consequência)** | sem layout a comutar, o componente da rota era `@theme/DocItem` chamando `@theme/DocItem`; segunda entrada removida do ledger de [`swizzle.md`](swizzle.md) §2 |
| **Três linhas de alvo saem do §8** | **origem própria** | o objeto medido deixou de existir; a régua é a que `paridade.mjs` já aplica a `Accordion` e `Tabs` — *alvo que não confere nada parece cobertura* |
| **A assinatura deixa de sair escapada** | **origem própria (correção)** | o contrato guardava `&lt;key&gt;`, e quem renderiza é `<code>{assinatura}</code>`, que já escapa sozinho — a tela mostrava a entidade crua |
