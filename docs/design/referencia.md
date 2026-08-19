# A referência gerada

A **única** ruptura de layout do site. **Seis
páginas**, geradas de um contrato de **assinatura de função, tipo e módulo** (ver
[ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md)
para a decisão de arquitetura; este documento é o desenho), um componente de
tema próprio (`ApiDocItem`, ver [`swizzle.md`](swizzle.md)), e um único degrau de
interatividade confinado a um painel.

> **Correção de contagem.** Esta abertura dizia *"a primeira das duas rupturas de
> layout do site — a outra é a landing"*. **É uma.** A landing saiu em
> [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), e esta
> deixou de ser a primeira de um par para ser a única. Nada do que vem abaixo
> muda: a ruptura continua saindo de `docItemComponent`, que é opção pública, e
> continua sendo a exceção que [`informacao.md`](informacao.md) §6 autoriza por
> nome.

**Nenhum valor numérico nasce aqui sem citar `tokens.md`.** Os comprimentos
moram lá; este documento faz contas com eles.

O documento anterior descrevia trinta páginas de endpoint sobre um contrato
OpenAPI, e foi **renomeado e reescrito** quando o contrato deixou de falar HTTP.
O que sobreviveu à troca não foi herdado verbatim: cada seção abaixo é a conta
refeita contra a cadeia nova.

---

## 1. A aritmética decide o layout, não o gosto

> **Correção de fato — #96.** Este bloco publicava `720 + 32 + 400 = 1152`, e
> o container mudou de dono sem esta página vir junto: a #96 derrubou
> `--sd-container-width` de 1152 para 1120 (`tokens.md` §1), e o resto da
> conta — o painel — dá **368**, não 400. O texto original fica pela mesma
> regra do resto da spec; a conta abaixo é a que fecha hoje.

> **Correção de fato — #99.** A prosa da página gerada **deixou de ser**
> `--sd-prose-width` (a mesma da página comum): §10 de
> `research/paridade-devin` mede a âncora com uma prosa mais estreita e um
> trilho bem mais largo do que o TOC nesta rota especificamente, e a #99
> porta essa proporção. `--sd-api-prosa-width` (577, medido, `origem
> própria`) substitui `--sd-prose-width` **só aqui**; o painel continua sendo
> o resto da conta, agora sobre a base nova.

```
577 (--sd-api-prosa-width) + 32 (--sd-space-8) + 511 = 1120 (--sd-container-width)
```

O painel não é uma largura escolhida — é o resto da conta:

```
511 = calc(var(--sd-container-width) - var(--sd-api-prosa-width) - var(--sd-space-8))
```

`--sd-space-8` aqui é o gutter **entre as duas colunas desta grade**, não o
`--sd-gutter` do shell do site (que seria o espaço entre a coluna de conteúdo e
a sidebar/TOC numa página comum) — os dois vêm da mesma escala por coincidência
de valor, não porque sejam o mesmo token.

### 1.1 O que esta conta justifica hoje, e o que ela justificava antes

**A justificativa foi reescrita, não herdada.** A conta antiga existia para
explicar por que a página de endpoint **não tinha cartão**: a soma já fechava o
container, e não sobrava pixel para o preenchimento da moldura. Esse argumento
morreu duas vezes — a geometria `mint` tirou o cartão de **todas** as páginas do
site, e depois o endpoint deixou de existir. Repeti-lo aqui seria transcrever de
um documento sobre HTTP uma conclusão cuja premissa caiu.

O que a conta justifica hoje é **uma coisa só, e ela é a décima perda**: não
sobra coluna para o TOC. As três medidas fecham o container no pixel, e a coluna
que o painel ocupa é exatamente a do TOC.

**É o `calc()` que faz esta seção sobreviver a troca de geometria.** A prosa
subiu de 672 para 720 e o painel desceu de 448 para 400 **sozinho**, sem uma
linha de ajuste — e a soma continua fechando o container. Um 448 cravado teria
quebrado calado.

## 2. O comutador, nas duas pernas

`ApiDocItem` decide pelo front matter `api_exemplos` — nunca por marcador
solto no corpo do MDX, e nunca por `hide_table_of_contents`. As duas razões
são mecânicas, não estéticas:

- um marcador em MDX obrigaria o painel a ser irmão de grid dos
  parágrafos, e `position: sticky` precisa de um ancestral com contexto de
  rolagem previsível — não de uma posição arbitrária que o fluxo do
  Markdown decidiu;
- `hide_table_of_contents` seria segunda fonte de verdade para uma decisão
  que o componente já toma sozinho ao ler o front matter — e é por isso que
  **nenhuma página desta instância carrega esse campo**, geradas inclusive.

| `api_exemplos` | Layout | Largura da coluna de conteúdo | TOC |
| --- | --- | --- | --- |
| ausente | delega para `@theme/DocItem`, sem tocar em mais nada | `--sd-prose-width` (720, dentro da coluna de 864) | coluna de 288, se houver heading |
| presente | layout próprio, `LayoutComPainel` | `--sd-prose-width` (720) | ausente — o painel ocupa o espaço |

**A instância inteira declara `docItemComponent`, e as onze folhas autorais
dela não mudam de layout.** É a segunda instância do projeto a usar a opção, e
ela continua **degrau 2**: opção pública, custo de upgrade zero, zero swizzle.

A perna "ausente" é a que prova que o painel é **inalcançável, não vazio**:
`Ferramentas › Bibliotecas › Biblioteca C › Instalação e configuração` é a
fixture — prosa autoral, zero `api_exemplos`, coluna e TOC como qualquer página
de doc comum. Uma implementação que deixasse uma coluna direita vazia ali estaria
errada; o correto é essa coluna nem existir, porque a página passou pela **outra**
perna do comutador.

**A fixture é irmã das geradas, e isso é o que a torna forte.** Antes ela morava
numa seção autoral de uma instância inteiramente gerada; agora ela está **dentro
da mesma categoria de sidebar** que as seis páginas com painel, a um clique de
distância. Se o comutador algum dia decidir por instância em vez de por página, é
aqui que quebra, à vista.

A perna "presente" são as seis páginas geradas, e mais nenhuma.

## 3. `align-self: start`, junto com `position: sticky`

**O erro nº 1 de quem reconstrói este layout.** Dentro de um `display: flex`
com `align-items: stretch` (o default), um item de flex sem `align-self`
próprio estica para a altura do irmão mais alto — aqui, a prosa. Um painel
esticado para a altura da prosa **já preenche toda a área de rolagem
disponível**, então `position: sticky` não tem para onde grudar: parece
travado desde o topo, e o sintoma é sutil o bastante para passar batido
numa tela onde a prosa é curta.

```css
.colunaPainel {
  align-self: start;
  position: sticky;
  top: var(--sd-topo-conteudo); /* a linha em que a prosa ao lado abre — e é o topo INTEIRO por baixo: com a faixa de tabs montada, a linha 1 sozinha deixaria o painel deslizar por baixo dela */
}
```

`align-self: start` encolhe o painel para a altura do próprio conteúdo, e é
só depois disso que "sticky" tem alguma distância para percorrer.

**Zero `order`, zero duplicação de HTML por breakpoint.** O DOM é sempre
prosa-depois-painel; o que muda entre largo e estreito é só
`flex-direction` (`column` abaixo de 997px, `row` a partir dele — o mesmo
limiar único do projeto inteiro). No estreito, isso empilha o painel
**depois** da prosa, sem regra a escrever: é a mesma ordem do DOM, só que
lida de cima para baixo em vez de lado a lado. A largura fixa das duas
colunas só existe dentro da media query de 997px — declará-la fora
aplicaria a `flex-basis` no eixo errado (altura, não largura) quando
`flex-direction` é `column`.

## 4. A ordem das seções da página gerada

Fixa, e o gerador a produz sempre na mesma sequência:

1. `# Título` — o nome da entrada, como o leitor a escreveria em Python
2. **a espécie e o nome qualificado, em prosa** — `**Função** · `panlabs.esteira.Esteira.gerar``. É o lugar onde a pílula de verbo ficava, e ele não ganhou substituto gráfico: sem verbo não há duas categorias para pintar, e um chip com uma palavra em três variações não é sinal, é enfeite
3. A `descricao` da entrada
4. `## Parâmetros` — um `<ParamField>` por parâmetro, na ordem da assinatura; ausente quando a entrada não tem nenhum
5. `## Retorno` (função) ou `## Atributos` (tipo) — a árvore `<ResponseField>`; a frase *"não devolve valor"* nas funções que não devolvem
6. `## Exportações` — **só no módulo**, e no lugar dos dois anteriores: um módulo não tem parâmetro nem retorno, e o que ele tem é a lista do que se importa dele
7. `## Erros` — uma tabela Erro/Quando; ausente quando a entrada não levanta nada

O painel, à direita, não é uma seção da prosa — ele é a **outra** coluna, e a
ordem dele é interna e fixa: a assinatura, a fileira de argumentos editáveis (só
quando existem), e o snippet de uso em Python.

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

`contratos/panlabs-esteira.pt-BR.json` e `contratos/panlabs-esteira.en.json` —
JSON puro, monolíngues, estruturalmente congruentes. `scripts/gerar-referencia.mjs`
os lê, valida (`scripts/lib/assinatura.mjs`), e escreve **seis** páginas `.mdx`
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

Isso não sobrevive à instância nova. `ferramentas` tem **quinze** folhas autorais
em quatro famílias, e a árvore delas é escrita à mão. O gerador passa a emitir um
**fragmento** — `sidebars-referencia.js`, uma lista de ids e nada além —, e
`sidebars-ferramentas.js` o importa e o espalha dentro de `Biblioteca C`.

Três consequências, e as três são o motivo:

- **as duas posses não se misturam.** Editar uma folha autoral não passa pelo
  gerador; editar uma gerada não passa pela mão;
- **os dois tickets ficam verdes.** A sidebar sem o ramo gerado era válida, e a
  com o ramo é a mesma sidebar mais um `import`;
- **o ramo não ganha categoria própria.** Um nó a mais ali seria o nível 4, e o
  teto de profundidade é 3 (ver [`informacao.md`](informacao.md) §3.1). As seis
  entram como irmãs das três folhas autorais de `Biblioteca C`.

### 5.2 O snippet é composto, nunca escrito

Nenhuma das seis entradas tem snippet próprio. O gerador o compõe em três
pedaços, e os três saem do contrato:

1. **a linha de `import`** — os símbolos que a cadeia usa, deduplicados e
   ordenados. Uma entrada com receptor não contribui a raiz da própria chamada:
   `esteira.gerar` abre com a variável que o preâmbulo ligou, não com um nome
   importado;
2. **o preâmbulo** — a chamada da entrada que liga o receptor, com os exemplos
   dela **congelados**. É recursivo, e o validador recusa ciclo;
3. **a chamada** — a assinatura com os exemplos dos parâmetros, e um
   `{{placeholder}}` em cada argumento editável.

**O marcador `{{argumento}}` é declarado num lugar só, e os dois lados o leem de
lá.** `src/theme/ApiDocItem/placeholder.mjs` é submódulo do componente de rota, e
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

## 6. As oito perdas nomeadas da rota vanilla, e a décima desta rota

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

A décima é desta rota, e diferente das nove: não é preço do orçamento
`unsafe` zero — `ApiDocItem` não esbarrou em nenhum limite de swizzle para
chegar nela. É consequência pura da aritmética do §1.

| # | Perda | Por quê |
| ---: | --- | --- |
| 10 | A página gerada não tem TOC | a soma das três medidas já fecha o container, e a coluna do TOC é justamente o que o painel ocupa; ver §1 |

**A perda 10 encolheu duas vezes, e vale registrado onde ela parou.** Ela nasceu
dizendo *"a página de endpoint não tem cartão nem breakout"*; a geometria `mint`
tirou os dois de todas as páginas, e o que era perda desta rota virou fato do
site. Depois a página de endpoint deixou de existir. O que sobrou é o TOC, e ele
é perda de verdade: o leitor navega a página pela lista de entradas da sidebar em
vez de pela dos headings.

**Na prática isso aperta menos do que antes, e a razão mudou.** O argumento
anterior era que o gerador emitia só duas seções por página. O gerador novo emite
**até quatro** — parâmetros, retorno, exportações, erros —, e o que segura a perda
é outra coisa: as seis páginas são curtas por construção, porque cada uma
documenta **uma** entrada. Uma referência que crescesse a ponto de precisar de TOC
seria uma entrada que precisa virar duas.

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
| Coluna de texto | `576,81px` | ±1 |
| Trilho | `448px` | ±1 |
| Trilho grudado em | `152px` | ±1 |
| Painel raio | `16px` | exato |

**As duas larguras não fecham no pixel, e é esperado.** A âncora mede
576,81 + 448; este projeto publica `--sd-api-prosa-width` (577, arredondado)
e deriva o trilho do que sobra do próprio container (511, §1) — a mesma
lógica que já divergia em 720/400 contra a prosa comum antes desta issue.
`±1` cobre o arredondamento; a diferença de dezenas entre 448 e 511 é
divergência **deliberada**, não erro de medição — publicada aqui para não
esconder a distância atrás de uma tolerância larga demais para significar
algo.

**`Trilho grudado em` reusa o número da `TOC grudado em`** de
[`chrome.md`](chrome.md) §11: os dois grudam sob o mesmo topo fixo, e é o
mesmo fato medido na âncora, não uma coincidência tratada como derivação.

> **Correção de fato — S3-3.** A frase acima estava certa e o produto a
> desmentia. Este documento publicava `152` como alvo e, 245 linhas antes,
> `top: var(--sd-topo-grudado)` como mecanismo — que resolve em **112**. Do
> outro lado, o TOC herdava `calc(var(--ifm-navbar-height) + 1rem)` do
> `theme-classic` e dava **128**. Ou seja: *"o mesmo topo fixo"* eram **dois**
> números, e nenhum era o alvo. `npm run paridade` acusava `Δ −40` aqui e
> `Δ −24` lá.
>
> Os dois passaram a ler `--sd-topo-conteudo` (`tokens.css`), que é
> `--sd-topo-grudado` mais `--sd-space-10` — a respiração que o `<main>` já dá
> ao `<article>`, e que o comentário do `max-height` deste painel já citava por
> nome. **O número não foi movido para fechar:** ele é `112 + 40`, e os dois
> parcelamentos são medição publicada da âncora — o navbar em `chrome.md` §11 e
> o ritmo vertical em §12.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A aritmética 720 + 32 + 400 = 1152 | origem própria | issue #38 — a medida de prosa, o gutter e o painel somam o container; o `calc()` absorveu a troca de medida sem ajuste |
| **A conta justifica o TOC ausente, e não mais o cartão** | **origem própria (correção)** | a premissa antiga caiu duas vezes: nenhuma página tem cartão desde a [#78](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/78), e a página de endpoint deixou de existir |
| O painel é objeto, e o único do corpo | origem própria (correção) | era *"o painel é o cartão"*; ele sobrevive por ser bloco de dados ao lado do texto, não moldura de prosa |
| Front matter em vez de marcador em MDX | origem própria | `position: sticky` exige ancestral com contexto de rolagem previsível |
| Nenhuma página da instância carrega `hide_table_of_contents` | origem própria | seria segunda fonte para uma decisão que o componente já toma |
| **A fixture do painel inalcançável trocou de dona** | **origem própria** | `Biblioteca C › Instalação e configuração` é irmã de sidebar das geradas, o que torna a prova mais forte que a anterior |
| `align-self: start` com `position: sticky` | origem própria (implementação) | o erro nº 1 medido ao implementar o layout — sem ele o item estica e sticky não tem onde grudar |
| Offset do sticky em `--sd-topo-conteudo` | **origem própria (correção)** | duas correções na mesma linha: era `--sd-navbar-height`, que passou a medir só a linha 1 quando a faixa de tabs entrou, e virou `--sd-topo-grudado`; **S3-3** mostrou que `--sd-topo-grudado` (112) contradizia o alvo de 152 publicado no §8 deste mesmo documento. Medido por `npm run paridade`, `Δ −40` |
| Zero `order`, DOM fixo prosa-depois-painel | origem própria | issue #38 — a mesma ordem em `row` largo e `column` estreito |
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
| A décima perda, desta rota | origem própria | issue #38 — consequência aritmética do §1, não do orçamento `unsafe` |
| **O que segura a décima perda mudou de argumento** | **origem própria (correção)** | não é o gerador emitir duas seções — ele emite até quatro; é cada página documentar uma entrada |
| **O dissenso da opção rejeitada** | origem própria | [#82](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/82) — ela custava menos e preservava o `VerbBadge` inteiro |
| **A aritmética do §1 corrigida para o container de 1120** | **origem própria (correção)** | a #96 derrubou `--sd-container-width` de 1152 para 1120 e este documento não veio junto; o painel real já dava 368, não 400 |
| **`--sd-api-prosa-width` (577) substitui `--sd-prose-width` só na página gerada** | **origem própria** | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — medido em `research/paridade-devin` §10: a âncora usa prosa mais estreita e trilho mais largo nesta rota especificamente |
| O trilho continua sendo o resto da conta, nunca um segundo literal | herdado | mesmo argumento do §1 original — um `448` cravado quebraria calado no dia em que o container mudasse de novo |
| **O painel ganha altura declarada e rolagem própria** | **origem própria** | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — sem teto o trilho cresce com o conteúdo e "sticky" vira decoração; `max-height` reusa `--sd-topo-grudado` e `--sd-space-10`, mais `--sd-viewport-altura` (100dvh) — o terceiro token do projeto medido contra a viewport, mesmo buraco do portão 1 que `--sd-busca-height` já fechou (`tokens.css`) |
| **O fio sob o cabeçalho do painel** | **herdado + origem própria** | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — a chrome de cabeçalho da âncora portada sem o segundo nível de preenchimento que ela tem, pela mesma simplificação já registrada em `estilos.module.css` |
| A seção "Alvo medido" (§8) | origem própria | [#99](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/99) — mesmo padrão de [`chrome.md`](chrome.md) §11; números de `research/paridade-devin` §10 |
