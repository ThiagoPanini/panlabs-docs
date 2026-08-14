# Ícones

O manifesto, os dois renderizadores, a marca e o teto duro.

**Nenhum valor numérico de desenho aparece neste documento.** Os números que aparecem aqui são **contagens** — quantos arquivos, quantas tags, qual o teto — e a espessura de traço da tabela de compensação óptica, que é prop de componente e não token de CSS.

> **De onde sai o tamanho de um ícone, dito porque a primeira redação errou.** Ela mandava procurar em [`tokens.md`](tokens.md), e **não há token de tamanho de ícone lá** — nem `--sd-icon-*` nem equivalente. O ponteiro apontava para o vazio, e o teste de reconstrução ([`README.md`](README.md) §6) tropeçou exatamente aqui.
>
> A regra é: **ícone de chrome se dimensiona pela escala de espaço**, e o par em uso na sidebar é `--sd-space-4` para o quadrado e `--sd-space-2` para o afastamento do rótulo. Não é derivação falsa: um ícone de sidebar é um item de lista ao lado de texto, e o que o alinha ao ritmo da lista é a mesma escala que dá o `gap` dela.
>
> Ícone **dentro** de componente do catálogo é outra conta, e ela é prop — ver a tabela de compensação óptica do §4.

Documento transversal, ao lado de [`motion.md`](motion.md), [`foco.md`](foco.md) e [`swizzle.md`](swizzle.md): a sidebar é o consumidor principal, e o catálogo de conteúdo e a landing leem o mesmo manifesto. **A marca deixou de ser consumidora** — ver §3.

Tudo aqui é obrigatório. Não há bloco `Livre`: os **desenhos** são skin e se trocam inteiros, mas o manifesto é contrato e não tem latitude interna.

---

## 1. Origem — Lucide vendorizado

**60 arquivos `.svg` do Lucide (ISC), copiados para dentro do repositório.** Não é dependência, não é CDN, não é resolução em runtime.

O axioma 2 fecha a porta do **pacote**, não a do desenho: `npm install` de uma biblioteca de ícones está proibido, mas copiar arquivos de licença permissiva custa **zero dependência** e um arquivo de licença. A restrição sempre foi mais estreita do que parecia.

| Rejeitado | Motivo |
| --- | --- |
| Font Awesome | os ícones são CC BY 4.0, que exige atribuição **dentro da obra**. Em revisão jurídica corporativa isso é reunião, não checkbox — e o destino é justamente ambiente corporativo |
| Desenhar sob demanda | dezenas de ícones mutuamente coerentes é trabalho de semanas de ilustrador; sem ilustrador, o resultado provável é família incoerente, que é o oposto do objetivo |
| CDN | dependência de rede em runtime, atrás de firewall corporativo. Mata o transplante, que é a razão de o projeto existir |
| Emoji | refém da fonte do sistema, desenho muda por SO, impossível de tingir com a cor de marca |
| Não ter ícone | o cartão de conteúdo usa ícone na quase totalidade dos usos medidos |

**Reversibilidade registrada:** Tabler (MIT) é substituto drop-in — mesma geometria. Se o jurídico do corporativo implicar com ISC, trocam-se os arquivos sem redesenhar nem renomear nada.

### 1.1 A versão é fixada, e o vendorizador confere no ato de copiar

**O Lucide renomeia glifo entre versões.** O manifesto declara a versão de origem, e `scripts/vendorizar-icones.mjs` baixa contra ela — lendo o manifesto do fonte, nunca uma segunda lista.

Isto não é cerimônia. Na primeira execução, **três dos nomes então vigentes não existiam mais** na versão fixada. O mecanismo pegou os três alto, em vez de deixá-los virarem quadrado vazio na sidebar seis meses depois.

**A resolução importa mais que o achado: o nome do manifesto é NOSSO contrato e não se move por renomeação de terceiro.** Quem paga a divergência é um campo opcional na entrada, que registra o nome do upstream onde ele diverge — não o MDX do acervo, e não os componentes.

Este script **não é portão de CI**: ele precisa de rede, e rede é exatamente o que o ambiente corporativo alvo não tem.

---

## 2. Família — uma só, sem exceção por papel

**Contorno, 24×24, traço 2, caps redondos.** Uma família, e nenhum papel abre exceção.

A âncora **mistura** famílias — o ícone de card resolve para uma biblioteca e o caret de accordion para outra. Isso não é decisão de design dela; é **acidente de arquitetura**, porque o autor pode escrever nomes de três bibliotecas e o chrome interno calhou de usar uma delas. Replicar a mistura seria replicar um acidente, e duas famílias é exatamente o que faz uma documentação parecer montada em vez de desenhada.

### 2.1 A objeção real, e a compensação óptica que a responde

Traço fino em tamanho pequeno some sobre fundo escuro. **A resposta só existe porque a técnica é componente inline e não máscara**: com SVGR, a espessura de traço é prop.

| Tamanho renderizado | `stroke-width` |
| --- | --- |
| 24px | 1,75 |
| 20px | 2 |
| 16px | 2,25 |
| 12–14px | 2,5 |

Com `mask-image` isso seria impossível — máscara é estêncil, não se restiliza o interior. A alternativa seria um arquivo por tamanho, o que é absurdo.

O ícone da sidebar é o único que roda por máscara e não recebe compensação. Ele vive num tamanho só, então a tabela não teria o que compensar.

---

## 3. Dois renderizadores, uma fonte de verdade

**Eram três.** O terceiro era a marca, e ela perdeu o glifo — ver abaixo. Os dois que sobram não são inconsistência: cada um é **forçado pelo contexto**, e os dois leem os mesmos 60 arquivos.

### (a) Componentes de conteúdo → SVGR inline

O `preset-classic` **já traz SVGR** — o plugin é dependência dele e é registrado por padrão, com `removeViewBox: false`, que é o override que impede o otimizador de quebrar o escalonamento. Um `import` de `.svg` devolve componente React, dentro do preset que o axioma 2 permite por nome.

Ganha `currentColor` de graça (o SVG do Lucide já nasce com `stroke="currentColor"` e `fill="none"`), espessura controlável, título acessível sem trabalho, e zero requisição HTTP extra.

### (b) Sidebar → `mask-image` mais `currentColor`

**Aqui não há escolha.** Não existe ponto de swizzle `safe` para injetar componente React num item de sidebar — a maioria esmagadora dos componentes swizzláveis não tem nenhuma ação `safe`. O caminho de `className` mais `::before` com máscara é o **único** zero-swizzle, e é literalmente o que produz a assinatura visual mais reconhecível do alvo.

A parte elegante: o estado ativo já pinta o texto, e a máscara é pintada com `currentColor` — **o ícone acompanha sem uma linha a mais e sem segundo asset para o modo escuro**.

### (c) A marca não é o terceiro caso — ela deixou de ter glifo

**A marca fica só com a palavra**, e nenhum desenho assume o lugar de `train-track`.

O argumento é o mesmo que matou a figura da landing, **com força maior**: a marca aparece em **toda página** e a landing em uma. Ela fica **monocromática**, em `--sd-text-strong` — tingir uma palavra de acento no canto superior esquerdo é o enfeite que a régua recusa, e é o tipo de decisão que se justifica sozinha uma vez e se paga em todas as rotas.

**A tipografia da palavra não mudou**, e é isso que torna a decisão barata: `--sd-text-strong` já era a tinta dela. O que saiu foi o glifo, que era a única coisa aqui a consumir `--sd-accent`.

**A rota é `themeConfig.navbar.title` renderizando no `.navbar__brand` nativo** — degrau 2, opção pública. Sem `logo`, o upstream emite `<b class="navbar__title">` dentro do link, que é tipo puro: nenhum `<img>`, e portanto nenhum dos problemas de `currentColor` que empurraram a marca para o degrau 3 na primeira redação deste documento.

Quatro coisas ficam **sem assunto** de uma vez, e o parágrafo existe para que ninguém as procure:

- `src/theme/NavbarItem/Marca.js`, o componente de tema próprio que desenhava o par glifo+palavra;
- a chave `custom-marca` do registro de `NavbarItem/ComponentTypes` — e com ela **a entrada de degrau 3 daquele registro sai do ledger**, porque o objeto voltou a ser idêntico ao do upstream;
- a declaração `.navbar__brand:empty`, que escondia o link vazio que o upstream renderizava sem `title`. Ele não é mais vazio;
- o caso `mobile` de lista de menu, que existia porque a marca era item de navbar. Ela agora é a marca do próprio painel.

**Nenhum token de cor é consumido pela marca.** `--sd-accent` perdeu este consumidor.

**A rota foi medida, e é isso que a resolução deste ticket registrava como não medido.** Medida em Chrome headless, nas duas preferências de esquema de cor:

| | escuro | claro |
| --- | --- | --- |
| `.navbar__brand` contém | `<b class="navbar__title">panlabs</b>` | idem |
| `<svg>` dentro dele | **0** | **0** |
| `<img>` dentro dele | **0** | **0** |
| cor da palavra, em sRGB | `250,242,249` | `15,10,15` |
| `--sd-text-strong` resolvido | `250,242,249` | `15,10,15` |
| `--sd-accent` resolvido | `219,124,212` | `147,57,141` |

A palavra bate com `--sd-text-strong` no pixel, nos dois modos, e **não** bate com o acento em nenhum. O carimbo sobe de `origem própria` para **`origem própria (medição)`**.

---

## 4. Orçamento — três papéis, um registro, um teto

**O papel é uma tag na entrada, não uma pilha separada de desenhos.** É esta regra que faz a aritmética fechar, e ela não é economia: duplicar um desenho porque ele serve a dois papéis seria criar duas versões do mesmo arquivo.

| Papel | tags | arquivos que carregam a tag |
| --- | ---: | ---: |
| Sistema — o componente escolhe, o autor nunca | 18 | 18 |
| Navegação — um por nó de topo de sidebar | 11 | 11 |
| Autoria — o vocabulário escrito como string | 40 | 40 |
| **Total de tags** | **69** | — |
| **Total de arquivos** | — | **60** |

A coluna de arquivos **soma mais que 60 de propósito**: são **nove** entradas com duas tags, e uma entrada com duas tags aparece nas duas linhas. 69 − 9 = 60, e é essa a aritmética inteira.

As nove são `package`, `puzzle`, `bot`, `server`, `layers`, `workflow`, `cloud`, `key` e `lock`: todas moram na lista de **autoria** e carregam a segunda tag ali. Os dois pares restantes — `code-xml` e `activity` — são navegação pura e moram na lista de navegação.

> **Correção de aritmética contra a resolução deste ticket.** Ela dizia *"sete reusam entrada de autoria com segunda tag, dois reempregam órfão de navegação"*, o que fecha em nove pares e não em onze. Contado contra a árvore: **oito** entradas de autoria ganham a segunda tag, **dois** órfãos de navegação são reempregados, e **um** — `package` — já carregava as duas. Oito mais dois mais um são os onze.

> **A tag de autoria deixou de significar *"o MDX do autor"* e passou a significar *"o nome escrito como string"*.** A landing escreve `<Card icon="book-open">`, que é a **mesma superfície** de autoria do MDX — mesmo componente, mesma prop, mesma falha alta se o nome não existir. Dizer *MDX* era descrever o único consumidor que existia, não a regra; a regra é a superfície.

**O teto é 64. Teto, não meta — e a folga voltou a quatro.** Ele foi alcançado no mapa do `mint`, com `wrench` no último slot; a árvore do `panlabs` cortou **quatro** desenhos e a folga voltou. O 65º ícone continua sendo troca; o 61º voltou a ser revisão de design.

**O teto NÃO desce para 60.** Ele é o limite do que se consegue auditar de uma vez, não uma marca d'água do que já se gastou — descê-lo seria trocar uma régua por um registro do passado, e o número perderia o argumento que o justifica.

**Os quatro cortes, e a regra que os decidiu:** *sobrevive quem é neutro de domínio ou nomeia o cenário fixado*.

| Corte | Por quê |
| --- | --- |
| `train-track` | a marca ficou só com a palavra — ver §3 |
| `wallet` | nomeia pagamentos, e o domínio inteiro morreu |
| `receipt` | idem |
| `credit-card` | já estava **sem consumidor** desde que a grade de cinco cartões da landing morreu |

A razão de haver teto: conjunto que cresce sob demanda vira dívida. Ninguém audita trezentos ícones em busca de coerência de família, mas 64 cabem numa tela e a incoerência salta aos olhos.

**A aritmética é conferida por máquina**, não por leitura: o vendorizador reprova nome repetido no manifesto e estouro do teto, antes de baixar qualquer coisa.

### 4.1 `circle-check` não está no manifesto

Ela estava, atribuída a uma variante de callout que o inventário de componentes **matou**, por ser pixel a pixel idêntica a outra na medição. Ficou sem consumidor — o mesmo defeito que a arquitetura de tokens nomeou no Infima como *variável sem consumidor*.

Ela saiu, e `train-track` tomou o lugar dela na lista de sistema. Com `train-track` cortado, a lista de sistema fecha em **18**.

**A condição de reabertura perdeu o candidato nomeado, e é correção de fato.** Ela dizia que *"a resposta de sucesso no painel da Referência da API é o candidato"*. Não há mais resposta HTTP de sucesso: o contrato deixou de falar HTTP, o painel deixou de mostrar verbo e status, e o candidato evaporou junto. A condição continua válida na forma geral — se um estado de sucesso precisar de glifo que não seja o `check` nu, `circle-check` volta por um dos quatro slots livres —, e agora ela é **condição sem candidato**, que é diferente de condição com um.

### 4.2 Os 19 ícones do `theme-classic` são passivo, não vantagem

O tema entrega 14 de chrome e 5 de admonition, e **eles são de outra família**. Ao lado dos nossos, a diferença de traço aparece. Eles **substituem**, não complementam — trabalho que nenhuma estimativa anterior contava.

O que é alcançável e o que não é sai da regra da política, sem enumerar caso a caso: **o que só é alcançável por `unsafe` não é trocado.** Os de admonition e cinco dos de chrome são `safe` nas duas ações; `Icon/ExternalLink` não está no `getSwizzleConfig` e vem de sprite, então ele fica com o desenho do Docusaurus — no rodapé ele é escondido, e no resto do site ele continua de pé.

**O que o slice do catálogo fez com isso, e é menos do que esta seção previa.** Os cinco de admonition **nunca precisaram ser trocados**: o callout ganhou DOM próprio pelo registro de `Admonition/Types`, e ele desenha os glifos do manifesto direto. Um `--eject` pré-autorizado que se resolve num registro é a escada funcionando.

Os cinco de chrome (`Icon/Arrow`, `Icon/DarkMode`, `Icon/LightMode`, `Icon/Edit`, `Icon/Menu`) **continuam com o desenho do Docusaurus.** Eles são chrome, não catálogo, e trocá-los é `--eject` de cinco arquivos por estética de glifo — conta que o slice do catálogo não abriu, porque a superfície de swizzle dele fechou em duas linhas de degrau 3. A pré-autorização segue de pé em [`swizzle.md`](swizzle.md), sem dono.

---

## 5. O manifesto

O manifesto vive em `src/icons/manifest.js`, e ele **é o contrato**:

```
static/icons/*.svg     ← 60 desenhos.  TROCÁVEL — é skin, axioma 3
src/icons/manifest.js  ← 60 nomes + papéis.  CONTRATO. Não troca.
```

Os nomes são **semânticos** (`rocket`, `database`, `terminal`), nunca de marca.

> **Correção de fato:** esta linha citava `shield-check` como exemplo, e ele **nunca esteve no manifesto**. Um exemplo que não existe é pior que nenhum exemplo — quem for conferir a lista procura por ele e conclui que a lista está errada. O corporativo com iconografia própria **substitui os arquivos e mantém os nomes**: nenhum componente e nenhum MDX é reescrito. Isso torna a troca de iconografia uma operação do mesmo tipo que a troca de paleta — mexer na skin, não no sistema.

### Sistema · 18

`info` · `lightbulb` · `triangle-alert` · `pencil-line` · `chevron-right` · `check` · `copy` · `wrap-text` · `external-link` · `search` · `x` · `menu` · `sun` · `moon` · `monitor` · `languages` · `link` · `arrow-right`

O ponto de consumo de cada um está na entrada do manifesto. `chevron-right` é **um desenho, dois estados** — caret de accordion e de categoria de sidebar, rotacionado por CSS quando aberto.

### Navegação · 11 tags sobre 11 arquivos

Os onze pares seção→ícone, **verbatim**:

| Jornadas | ícone | Procedimentos | ícone | Ferramentas | ícone |
| --- | --- | --- | --- | --- | --- |
| API Owner | `code-xml` | Ambiente | `layers` * | Bibliotecas | `package` * |
| Security Champion | `lock` * | Esteiras | `workflow` * | Módulos Terraform | `puzzle` * |
| | | Infraestrutura | `cloud` * | Skills | `bot` * |
| | | Acessos | `key` * | Servidores MCP | `server` * |
| | | Diagnóstico | `activity` | | |

\* reusa entrada de autoria e não consome arquivo.

**`Biblioteca C` não recebe ícone.** Ela é o único nó de segundo nível do site, e a regra foi reescrita para caber nele: **ícone só no nó de topo da sidebar**. A formulação antiga — *obrigatório na categoria de topo, ausente na folha* — é que não tinha leitura no nível 3, não o teto de profundidade; ver §8.

**As três tabs de navbar continuam sem ícone**: a regra é *um slot por nó de topo da **sidebar***, e o navbar já carrega tabs, busca, locale e GitHub sem folga para enfeite.

#### As três portas da landing têm ícone, e não são navegação

A tab no navbar continua sem glifo. **O cartão de porta da landing tem**, e a distinção é de superfície, não de inconsistência: a porta é um `<Card icon="…">`, escrito como string, contado na tag de **autoria**. A tag de navegação é 1:1 com os onze pares seção→ícone, e o vendorizador cobra essa igualdade — abrir a lista de navegação para a landing quebraria o único lugar onde a aritmética de ícone é conferida por máquina.

As portas eram declaradas *"sem ícone, e é ritmo, não esquecimento"*. Elas ganham glifo por decisão, sob uma regra:

> **A porta não pode repetir o glifo de nenhuma das categorias que ela abre.**

Sem ela, o cartão e um quarto da aba leem a mesma hierarquia, e o leitor não sabe se o glifo nomeia o eixo ou uma seção dentro dele.

| Porta | Glifo | Origem |
| --- | --- | --- |
| Jornadas | `book-open` | reuso, retagueado |
| Procedimentos | `terminal` | reuso, retagueado |
| Ferramentas | **`wrench`** | **o único desenho novo** |

> **A violação registrada no commit anterior morreu com a árvore, como estava previsto.** `book-open` era o glifo de `Documentação › Guias`, uma categoria dentro da tab que a porta `Jornadas` abre. Nos **onze pares** acima ele não é glifo de categoria nenhuma, e a regra volta a valer sem exceção. A colisão foi consequência da ordem escolhida, ficou dita antes de acontecer, e fechou no ticket que a spec disse que fecharia.

**`wrench` é o único ponto de todo o esforço em que o teto compra alguma coisa.** Na porta `Ferramentas`, todo glifo adequado do acervo — `package`, `puzzle`, `bot`, `server` — é uma das quatro famílias que aquela aba abre, e a regra acima os elimina um a um. Não havia reuso disponível; havia o slot livre.

**O registro é sóbrio, não ilustrativo.** O ícone marca posição; não narra a seção. É o registro que combina com um sistema onde tudo é imóvel e a assinatura mora no ritmo da página, não no enfeite.

Três pares merecem o motivo escrito:

- **`lock` e não `shield`** para `Security Champion`: escudo é a metáfora genérica de segurança e não nomeia nada; cadeado é o objeto que a jornada de fato mexeu — segredo, chave, rotação;
- **`code-xml` para `API Owner`**: o papel é dono de **contrato**, e o contrato é o artefato escrito. É o mesmo glifo que nomeava a Referência da API na árvore anterior, reempregado sem mudar de significado;
- **`package` para `Bibliotecas`**: biblioteca é pacote que se instala. É a metáfora mais apertada disponível, e custa zero arquivo — a mesma que já servia `SDKs`.

**As três abas são três barras laterais, vistas uma de cada vez.** Os onze nunca competem numa lista só; competem em listas de dois, cinco e quatro. A coerência é exigida **dentro** de cada aba, e o que segura as três juntas é a família.

### Autoria · 40 tags sobre 40 arquivos

**Ações (8):** `play` · `download` · `upload` · `refresh-cw` · `send` · `trash-2` · `plus` · `filter`

**Objetos (16):** `file-text` · `folder` · `terminal` · `wrench` · `database` · `server` * · `cloud` * · `key` * · `lock` * · `mail` · `calendar` · `users` · `globe` · `package` * · `rocket` · `shapes`

**Estados e sinais (7):** `zap` · `clock` · `circle-alert` · `circle-help` · `sparkles` · `trending-up` · `gauge`

**Conceitos (9):** `layers` * · `workflow` * · `puzzle` * · `bot` * · `webhook` · `bell` · `book-open` · `repeat` · `undo-2`

\* carrega também a tag de navegação — são as nove que fazem 69 tags caberem em 60 arquivos.

**Quatro nomes entraram nesta lista sem desenho novo**: `rocket`, `shapes`, `repeat` e `undo-2` perderam o papel de navegação quando a árvore anterior morreu, e teriam ficado sem tag nenhuma. Entrada sem tag é entrada sem papel, e o vendorizador a trataria como órfã.

---

## 6. Superfície de autoria — string, e falha alto

```mdx
<Card title="Instalação e configuração" icon="download" href="instalacao-e-configuracao">
  As opções, o arquivo de configuração e a adoção em projeto existente.
</Card>
```

> **Correção de fato:** este exemplo escrevia `icon="rocket"` num desenho que, à época, estava tagueado **só como navegação** — ou seja, ele mostrava o autor usando um nome que a superfície de autoria não cobria. O exemplo passa a usar `download`, que sempre foi autoria; e `rocket` ganhou a tag de autoria de qualquer forma, ao perder o papel de navegação. Os dois lados da incoerência fecharam no mesmo commit.

**Nome desconhecido lança, e o `throw` é falha de build.** Isso sai de graça: o Docusaurus prerenderiza toda página, então não há infraestrutura a montar. Em desenvolvimento vira overlay de erro do React, que é o retorno certo ali.

```
Ícone "rockett" não existe.
Você quis dizer "rocket"?
60 ícones disponíveis em src/icons/manifest.js.
```

O número desta mensagem **não é escrito à mão**: ele é `NOMES.length`, lido do manifesto. Um número redigitado aqui seria a segunda cópia da contagem, e ela mentiria no primeiro corte.

A distância de edição são oito linhas próprias. `leven` é dependência transitiva do core, mas amarrar em dependência transitiva é dívida — as oito linhas são mais baratas que o risco. A sugestão só aparece quando é plausível: acima de um terço do comprimento do nome ela vira ruído, e mandar alguém para o glifo errado é pior que não sugerir.

**Degradar em silêncio está descartado.** Ícone faltando é erro de **conteúdo**, e conteúdo é o que mais muda. Placeholder discreto significa que o erro chega em produção — e num transplante, falha silenciosa vira documentação publicada com buracos.

**Escape:** o componente aceita nó React cru, para o caso genuinamente não coberto. Explícito e visível em revisão, ao contrário de um nome que silenciosamente não resolve.

### 6.1 A bijeção é conferida nos três lados

O manifesto, o registro React e o diretório de desenhos são três listas da mesma coisa, e cada par tem quem o confira:

| divergência | quem pega | quando |
| --- | --- | --- |
| desenho sem arquivo | o próprio `import` | build |
| entrada de manifesto sem desenho no registro | o registro, na inicialização | build (prerender) |
| desenho no registro sem entrada no manifesto | o registro, na inicialização | build (prerender) |
| arquivo em `static/icons/` que ninguém declarou | o vendorizador, em `--conferir` | CI |

O último é o único que viaja calado sem essa conferência: arquivo órfão não é importado por ninguém e não quebra nada — só engorda o artefato.

**Nota de implementação medida, e ela custou um build:** `require.context` **não** funciona com SVGR. A regra do plugin casa por *issuer*, e num contexto o issuer de cada arquivo é o módulo de contexto — um diretório —, então a regra não casa e o SVG cai na regra de asset. O que volta é uma **data URI**, não um componente, e o sintoma é `Invalid tag: data:image/svg+xml;base64,…` no prerender. Por isso são 60 `import` à mão, e por isso a bijeção é conferida em vez de derivada.

---

## 7. Cor — onde mora o efeito visual

| Superfície | Cor |
| --- | --- |
| Ícone de `Card` | **cor de marca** — não cinza. A medição chama isto de *"o detalhe que mais define a aparência do card"* |
| Ícone de sidebar | `currentColor` — herda ativo, hover e modo **de graça** |
| Ícone de `Callout` | a cor da variante |
| Ícones de sistema | a rampa de cinzas tingida com o matiz da marca |

---

## 8. Onde é obrigatório, opcional e proibido

| Superfície | Regra |
| --- | --- |
| **Sidebar** | **obrigatório** no nó de topo, **ausente** em todo o resto — folha e nó intermediário. Ícone em toda folha vira ruído e destrói a hierarquia que o ícone de seção constrói |
| **`Card`** | opcional, mas ícone **XOR** imagem — nunca os dois |
| **`Callout` tipado** | **fixo por variante; o autor não sobrescreve.** Os tipados da âncora não aceitam prop nenhuma |
| **`Steps`** | opcional; o default é o número do passo. Ícone **substitui** o número, não o acompanha |
| **`Tab`** | opcional — uso medido baixo |
| **`Accordion`** | ícone opcional; o **caret é sistema**, não opcional |
| **Tab de navbar** | **sem ícone** |
| **Footer** | **sem ícone** — consome zero slots |

**A regra da sidebar foi reescrita, e é ela que destravou o nível 3.** A formulação antiga — *obrigatório na categoria de topo, ausente na folha* — não tinha leitura num terceiro nível: o nó do meio não é nem topo nem folha. A nova é *só no nó de topo*, e ela **decide o caso intermediário por construção**, em vez de proibi-lo. O teto de profundidade não era o problema; a redação era. Ver [`informacao.md`](informacao.md).

---

## 9. Custo de bundle, aceito conscientemente

Registro estático coloca os 60 no bundle principal. É o preço de `icon="rocket"` funcionar sem import dinâmico, e é barato — dezenas de kilobytes crus, poucos gzipados.

O caminho da sidebar não paga isso duas vezes: as máscaras entram no CSS, e como os arquivos são pequenos o empacotador as embute como dado em vez de gerar requisição. Um desenho, dois consumidores, zero divergência possível.

---

## 10. Uma tensão deliberadamente não resolvida

O mapa registra o risco de o resultado sair **indistinguível de qualquer documentação feita na âncora**. Adotar a mesma biblioteca de ícones que ela serve **reforça** essa semelhança.

Posição registrada: **ícone é vocabulário, não é onde a identidade deve morar.** Trocar por família exótica custa legibilidade e não compra diferenciação; a identidade vem de cor, motion e layout.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Lucide vendorizado, licença ISC | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §1 — licenças verificadas na fonte |
| SVGR já vem no `preset-classic` | herdado (verificação) | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §0b |
| Família única, contorno, geometria | **delta deliberado** | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §2 — a âncora mistura famílias, e a mistura é acidente dela |
| Compensação óptica por tamanho | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §2 — habilitada pela escolha de SVGR |
| Máscara na sidebar | **lacuna por restrição** | não há ponto `safe` para injetar componente em item de sidebar |
| O papel é tag na entrada | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §4 |
| 69 tags sobre 60 arquivos, folga quatro | **origem própria (correção)** | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — quatro cortes contra a árvore nova; a resolução dizia *sete mais dois* e a contagem fecha em *oito mais dois mais um* |
| **A marca fica só com a palavra** | **origem própria** | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — o argumento da figura da landing, aplicado a uma superfície que aparece em toda página |
| **A rota da marca é `navbar.title` no `.navbar__brand` nativo** | **origem própria (medição)** | a resolução a declarava *provável e não medida*; medida no artefato publicado, nos dois modos |
| **Os três renderizadores viram dois** | **origem própria (consequência)** | o §3(c) perdeu o assunto quando a marca perdeu o glifo |
| **A regra de ícone vira *só no nó de topo da sidebar*** | **origem própria (correção)** | a formulação antiga não tinha leitura no nível 3, e era ela — não o teto de profundidade — que impedia `Biblioteca C` |
| `shield-check` citado e nunca existente | **origem própria (correção)** | varrido contra o manifesto: o nome nunca esteve lá |
| O exemplo de autoria usava um nome tagueado só como navegação | **origem própria (correção)** | `icon="rocket"` no §6 contra a tag dele à época |
| O candidato de reabertura de `circle-check` evaporou | **origem própria (consequência)** | o painel deixou de ter resposta HTTP de sucesso quando o contrato deixou de falar HTTP |
| A tag de autoria é *nome escrito como string*, não *MDX* | **origem própria (correção)** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — a landing usa `<Card icon="…">`, a mesma superfície; a redação antiga descrevia o único consumidor, não a regra |
| Ícone nas três portas da landing, sob a regra de não repetir glifo de categoria | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — nada medido; a regra existe para o cartão não ler como a aba |
| `wrench` como o único desenho novo | **origem própria (implementação)** | descoberto aplicando a regra da porta: em `Ferramentas` todo reuso adequado já é uma das quatro famílias que a aba abre |
| `circle-check` fora | **delta deliberado** | consequência da variante morta na [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15), pela regra de *sem consumidor* |
| Os onze pares seção→ícone | origem própria | [#81](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/81) — `code-xml` e `activity` reempregados, os outros nove reusando entrada de autoria |
| **O registro sóbrio em vez do ilustrativo** | **origem própria (medição)** | [#83](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/83) — as quatro Mintlify (mesmo CSS) não convergem: três renderizam glifo preenchido (Font Awesome `regular`/`solid` v7.2.0), uma usa contorno (Tabler `outline`). A âncora mistura registro do mesmo jeito que mistura família (§2) — a mistura é acidente dela, não assinatura a herdar |
| Nome inexistente quebra o build | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §6 |
| Regra de cor por superfície | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) e [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) |
| Obrigatório no topo, ausente na folha | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §8 |
| A versão do Lucide é fixada e conferida no ato de copiar | herdado | [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) §2, nota final |
| O nome do manifesto não se move por renomeação de terceiro | **origem própria (implementação)** | três dos nomes então vigentes já não existiam na versão fixada; o campo de nome upstream resolve numa linha |
| `require.context` não funciona com SVGR | **origem própria (medição)** | a regra do plugin casa por *issuer*, e o issuer de um contexto é um diretório |
| GitHub como palavra, não como glifo | origem própria | consequência do teto: não há marca de terceiro no manifesto, e o slot livre não tem nome cravado |
| Os cinco ícones de admonition não são trocados por `--eject` | **origem própria (implementação)** | o callout tem DOM próprio pelo registro de `Admonition/Types` ([#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15)); o degrau 5 se resolveu no 3 |
