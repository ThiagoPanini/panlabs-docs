# Busca

O índice, o gatilho, o modal e a única superfície de interação que este projeto autora.

**Nenhum valor numérico aparece neste documento**, salvo dois lugares. Os pesos da escada de pontuação do §3 não são comprimento, cor, tempo nem curva, e sim a ordem de uma lista. E o §10 publica o **alvo medido na âncora** — ali os números são evidência de medição de outro sistema, não fonte deste: eles dizem o que se quer atingir, e quem os edita está afirmando que a âncora mudou. Todo comprimento que **temos** mora em [`tokens.md`](tokens.md) e é citado aqui por nome de token.

A **decisão** — índice local, sem serviço externo, com o motivo jurídico e de rede e a nota de migração — mora no [ADR 6](../adr/0006-busca-local-sem-servico-externo.md). Este documento **cita** e nunca repete.

Tudo aqui é obrigatório. Não há bloco `Livre`: a busca não tem latitude de skin própria — ela consome os papéis que já existem, e o único token que ela trouxe é um papel `surface`.

> **Leia antes:** [ADR 6 — A busca é índice local](../adr/0006-busca-local-sem-servico-externo.md), [ADR 2 — Política de swizzle](../adr/0002-politica-de-swizzle.md) e [ADR 4 — Contrato de estado de entrada](../adr/0004-contrato-de-estado-de-entrada.md).

---

## 1. As duas metades, e a fronteira entre elas

| Metade | Onde | O que faz |
| --- | --- | --- |
| O índice | `src/plugins/busca/` | plugin de caminho; roda no build, entrega dado global |
| A interface | `src/theme/SearchBar/` | `--eject` do `theme-classic`; roda no navegador |

A fronteira é `setGlobalData`, e ela é estreita de propósito: o plugin não sabe que existe um modal, e o modal não sabe de onde o índice veio. Tirar o plugin da config faz o modal desaparecer sem uma linha de condicional escrita a mais — ver §7.

**A porta de entrada do conteúdo é compartilhada com os artefatos AI-era**, em `src/plugins/paginas.js`. Os dois plugins precisam da árvore inteira, na ordem em que o leitor a vê, com o MDX de cada página à mão; escrever isso duas vezes produziria duas ordens que divergem no dia em que uma quarta tab entrar. A forma dos artefatos AI-era é de [`informacao.md`](informacao.md) §9.

---

## 2. O índice

### 2.1 O registro, com chaves curtas

| Chave | O que é |
| --- | --- |
| `u` | permalink |
| `t` | título |
| `d` | description |
| `s` | headings de nível 2 a 4 |
| `b` | o começo do corpo, em texto plano |
| `x` | índice da aba |
| `f` | presente só quando a página é fallback pt-BR sob o locale EN |

As chaves são curtas porque cada uma se repete cinquenta e quatro vezes por locale, e o teto do §2.3 é serializado. `f` é **omitida** quando falsa em vez de escrita como `0`: uma chave ausente não custa bytes.

### 2.2 A fonte é o MDX

Não o HTML renderizado — o que dispensa `cheerio` e é o que fez **as 4 páginas geradas de `overpower › Comandos` entrarem pelo mesmo caminho das 56 autorais, sem caso especial**. Uma página gerada é um arquivo em disco como qualquer outra, e foi por isso que o índice não precisou saber que o ramo gerado chegou — ele chegou, e a única linha que mudou foi a da medição. Valeu de novo no port do `overpower`: o ramo trocou de contrato, de dona e de tamanho, e nem o plugin nem esta seção precisaram de um caso a mais.

O que sai antes de indexar, e por quê:

- **front matter**, que carrega o `api_exemplos` das páginas geradas — um blob JSON com a assinatura, os argumentos editáveis e o snippet, que sozinho estouraria o teto;
- **`import`/`export` do topo**, e só do topo. Páginas de SDK e de biblioteca têm `import` e `from` na primeira coluna **dentro de bloco cercado**, porque é o que um exemplo de Python mostra; uma varredura global comeria o exemplo;
- **bloco cercado inteiro.** Uma consulta que casasse dentro de um `curl` devolveria a página com um trecho ilegível, e o realce cairia no meio de uma string JSON;
- **marcação** — tag JSX, marcador de admonition, linha de tabela, sintaxe de link. Sobra prosa.

Os headings viram `s`; o resto vira `b`, cortado no começo.

### 2.3 O teto de 64 KB, autoenforçado

**Teto, não meta, e ele não acrescenta portão de CI**: o plugin estoura o build ao ultrapassar, e a mensagem lista as cinco entradas mais pesadas.

O motivo é mecânico: o índice viaja no bundle principal de **toda página do site**. Um índice que cresce sem limite vira lentidão difusa que ninguém atribui à busca — e o dia em que alguém atribuir, a causa já terá anos.

*Medido nesta implementação*, com a árvore fechada e o ramo gerado dentro:

| Locale | Registros | Bytes | Folga sob os 64 KB |
| --- | ---: | ---: | ---: |
| `pt-BR` | 59 | 30 824 | 53% |
| `en` | 59 | 31 167 | 52% |

Os dois locales têm a mesma contagem de registros e quase o mesmo peso: sob `/en/` as 31 páginas traduzidas ficam mais curtas em inglês, e as 28 de fallback entram em português com a marca `f`. **A inversão da [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133) se desfez**, e o EN voltou a ser o maior, por 343 bytes. O que a desfez foi a entrada das telas de terminal: elas são a MESMA saída literal nos dois locales, byte a byte, então elas não têm tradução mais curta a oferecer e o prefixo `/en/` volta a decidir sozinho.

> **A medição do EN só vale no build de TODOS os locales, e a armadilha custa 3 bytes por página.** Medir com `docusaurus build --locale en` sozinho encurta o índice, e o erro é sistemático: sem o pt-BR no mesmo passe, o EN vira o único locale, o `baseUrl` perde o segmento `/en/`, e **cada permalink encurta três caracteres**. Com 52 páginas o desconto era 156 bytes; com 59, são 177. O índice medido assim é de um site que não se publica.
>
> O pt-BR não denuncia a armadilha, e é isso que a torna cara: ele é o locale default, nunca carrega prefixo, e dá **o mesmo número pelos dois métodos**. Quem confere um locale só e vê o número bater conclui que o método está validado. **Meça sempre com `npm run build`**, e leia o `globalData.json` que ele deixa — ele é do último locale do passe, que é o EN.

> **A folga caiu de 64% para 51% e voltou para 53%, e foi conteúdo nas três vezes.** O port do `overpower` trocou 12 páginas por 21 e o acervo foi de 45 para 54, com o índice pt-BR subindo 5 616 bytes; a [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133) acrescentou seis páginas e o levou de 54 para 60, subindo outros 3 102, **517 bytes por página acrescentada**. Depois disso o índice CAIU 1 277 bytes, e a conta tem dois termos: a página do atalho `op` saiu inteira, e as telas de terminal que entraram no lugar não pesam nada. **Cerca de código não entra no índice** — `extrair()` alterna um estado em cada `` ``` `` e descarta tudo que está dentro —, então as cinco telas acrescentaram só a prosa em volta delas e um `##` novo. A série inteira é 35 612 bytes para as 73 páginas do Trilho, 24 894 para 46 páginas, 27 616 com o primeiro ramo gerado dentro (52), 23 383 depois que os sete índices de categoria saíram (45), 28 999 com o `overpower` (54), 32 101 com as seis da #133 (60), e 30 824 agora (59).
>
> **A régua para a próxima vez é o custo por página gerada: 499 bytes**, remedidos com o ramo do `overpower` no ar — eram 459 com o de `Biblioteca C`, e a diferença é a prosa mais longa das opções de CLI, não o formato. A folga atual comporta cerca de 73 páginas geradas a mais; comporta menos se elas forem maiores. Quem acrescentar um segundo ramo gerado mede antes, não depois — o teto não avisa, ele reprova o build.

**A varredura também confere a aritmética do locale de graça:** dos 54 registros do índice EN, **28 carregam a marca de fallback**, que é exatamente a contagem que [`informacao.md`](informacao.md) §8 declara. Duas superfícies independentes chegando ao mesmo número é a forma mais barata de conferência que este projeto tem.

### 2.4 O que fica de fora

`unlisted` e `draft`. O `draft` já sai de `docs` em produção pelo próprio plugin de docs, e o critério vai escrito mesmo assim: ele é do slice, não do upstream, e em `docusaurus start` o rascunho continua na lista.

### 2.5 As páginas de fallback entram, marcadas

As 28 páginas sem contraparte em inglês ([`informacao.md`](informacao.md) §8) são servidas em português sob `/en/`. Elas **entram no índice**, com `f`.

Escondê-las faria a busca em EN devolver menos do que o site tem, e o leitor chegaria nelas por link e não pela busca — que é pior que o português.

**A detecção não tem lista para manter:** se o `source` do documento não está sob a árvore localizada (`contentPathLocalized`), é fallback. No locale de origem não há fallback nenhum, e a árvore localizada dele sequer existe em disco — daí a guarda por locale.

---

## 3. A escada de pontuação

Determinística, e explicável em prosa. **Potências de dois, e isso é a decisão**: cada degrau vale mais do que a soma de todos abaixo dele (32 > 16+8+4+2+1), então a ordem é lexicográfica de verdade.

| Peso | Casa em | Como |
| ---: | --- | --- |
| 64 | título | começo de palavra |
| 32 | título | em qualquer posição |
| 16 | heading | começo de palavra |
| 8 | heading | em qualquer posição |
| 4 | description | em qualquer posição |
| 2 | corpo | em qualquer posição |
| 1 | permalink | em qualquer posição |

**Começo de palavra é em qualquer ponto do campo, não no começo do campo.** `webhook` cai no degrau 64 tanto em `Webhooks` quanto em `Sobre webhooks`, porque nos dois o leitor digitou o começo de uma palavra que está lá. O degrau abaixo é o que sobra: o termo aparece no **meio** de uma palavra.

**Todo termo da consulta precisa casar em algum degrau.** Um termo que não casa derruba o registro inteiro — senão uma consulta de duas palavras devolveria tudo o que casa com a mais comum das duas, que é o oposto de refinar.

**Desempate:** pontos, depois a ordem da aba, depois a ordem da sidebar. A segunda e a terceira já vêm prontas — o índice é construído nessa ordem.

**Sem teto de resultados.** Truncar em dez seria esconder acerto sem dizer que escondeu, e falha silenciosa é o que este projeto recusa em toda parte. A lista rola.

### 3.1 A normalização, nos dois lados

Minúsculas e `normalize('NFD')` sem diacrítico. São as poucas linhas que cobrem o erro mais comum do leitor brasileiro: *conciliacao* acha `Conciliação`, *idempotencia* acha `Idempotência`.

Ela roda **nos dois lados** — no índice, uma vez na montagem, e na consulta, a cada tecla. Normalizar só um lado é não normalizar.

### 3.2 A régua de máquina

Os **sete** portões cobrem CSS e conteúdo por **varredura**. Ordenação de resultado não é varrível: ou existe um caso que a exercita, ou *"escada determinística"* fica sendo afirmação de prosa.

> **Correção de contagem.** Esta linha dizia *"os oito portões cobrem CSS, conteúdo e a landing"*. **São sete**, e o terceiro assunto saiu junto com o oitavo: o portão 8 contava as seis unicidades da landing, e morreu com a página em [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94). O argumento não muda de forma — o que é varrível continua sendo varrido, e ordenação continua não sendo.

Por isso a lógica pura mora em `src/theme/SearchBar/escada.mjs`, separada do JSX, e `scripts/busca.test.mjs` a cobra com `node --test` — o runner do **próprio runtime**, zero dependência nova. Roda com `npm test`, cadência de commit.

O que ele trava: a propriedade de potências de dois, a ordem entre os sete degraus, o `E` entre os termos, os dois desempates, a ausência de teto, e o recorte do realce sobre texto acentuado.

> **Ele já se pagou.** A primeira redação deste documento afirmava que o degrau 64 era *"prefixo do título"*. O teste reprovou: o degrau casa começo de **palavra**, em qualquer posição. A tabela acima é o que o código faz, e não o que eu achei que ele fizesse.

### 3.3 O que o corpus novo expôs

Os 17 casos da régua passam sobre índices sintéticos. Sobre o corpus real eles não dizem nada — então a árvore fechada é exercitada com uma varredura de fora do teste: **buscar cada uma das 54 páginas pelo próprio título, e conferir se ela vem em primeiro**. Remedido com o `overpower` no ar, nos dois locales: **as 54 vêm**.

> **Os dois empates que esta seção registrava morreram com o sujeito, e não com uma correção da escada.** Eram `Biblioteca B`, que perdia para `Biblioteca A` com 128 pontos, e `Esteira`, que perdia para `Rodar a esteira localmente` com 64. Os dois nasciam da mesma cegueira, **a escada não distingue casar a palavra inteira de casar o começo dela**, e os dois vinham de duas propriedades daquele acervo: títulos que diferiam por um sufixo de uma letra (`Biblioteca A`/`B`/`C`) e o vocabulário repetitivo de um ramo gerado de biblioteca (`Esteira`, `Esteira.gerar`, `Esteira.trabalho`).
>
> **A cegueira continua lá.** O que sumiu foi o corpus que a expunha: os títulos do `overpower` não compartilham prefixo, e o ramo gerado agora é `overpower`, `overpower list`, `overpower install` e `overpower doctor`, onde a palavra repetida é a primeira e o que difere é o resto. Uma árvore futura com títulos irmãos por sufixo reabre o caso sem que uma linha de código mude.

> **A medição também cobrou uma decisão de conteúdo.** A primeira redação das cinco seções do `overpower` levava `title: Índice`, seguindo o nome do arquivo, e a varredura reprovou cinco páginas de uma vez: cinco registros com o mesmo título, indistinguíveis no painel, com a própria página caindo entre a 2ª e a 6ª posição. O acervo já resolvia isso e a redação nova não tinha reparado — `jornadas/api-owner/indice.md` se chama `API Owner`, e `procedimentos/ambiente/indice.md` se chama `Ambiente`. **O arquivo se chama `indice`; a página se chama como a seção.** Com o título alinhado ao `h1`, as cinco falhas foram a zero.

**A perda nomeada fica escrita mesmo sem instância.** Um leitor que digita o título exato de uma página pode encontrá-la em segundo, quando o título dela é prefixo do título de outra ou aparece dentro dele. A saída de verdade não é degrau: é peso por especificidade — título curto valendo mais que título longo, ou casamento exato do título inteiro como critério. Nenhum dos dois cabe em *potências de dois com degraus fixos*, e comprar qualquer um deles é redesenhar a escada, não ajustá-la.

> **O argumento que recusava o oitavo degrau caducou na #114 e não é reescrito aqui.** Ele se apoiava em `Esteiras` ser *"o único título que casa `esteira` por prefixo"*, e esse título não existe mais. Reabrir o degrau exige medir de novo contra o corpus atual, não reciclar a conclusão anterior.

---

## 4. O gatilho — botão, não campo

Um `<input>` no navbar que não aceita digitação é um controle que mente sobre o que faz. O botão diz *isto abre outra coisa*, que é o que acontece.

**A [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) veste esse botão de campo — anel, raio maior, caixa do tamanho da âncora, atalho sem pílula — e não é uma segunda opinião sobre o parágrafo acima.** Honestidade aqui é sobre o contrato, não sobre a pele: um `<button>` continua anunciado "botão" por leitor de tela e continua ativando em Enter/Espaço, qualquer que seja a cor da borda. O que a #98 muda de fato é onde ele mora — centralizado na primeira linha do navbar, não mais à direita — e isso só pôde entrar depois que o chão do navbar assentou, na [#96](https://github.com/ThiagoPanini/panlabs-docs/issues/96).

| Faixa | O que o botão mostra |
| --- | --- |
| de 997px | ícone + rótulo + tecla |
| até 996px | ícone puro |

**Um limiar só, e é o do Infima** — o mesmo que mostra e esconde a sidebar ([`chrome.md`](chrome.md) §1.6). Abaixo dele o navbar já está no aperto máximo: é onde a sidebar virou gaveta e o hambúrguer apareceu.

**`⌘K` / `Ctrl K`, e nada mais.** O glifo é decidido depois da montagem — o servidor não sabe em que plataforma a página vai abrir, e renderizar `⌘` no HTML produziria divergência de hidratação. `Ctrl` é o estado inicial porque é o da maioria.

**`/` foi recusado**, e é a única tecla que este documento recusa em voz alta: ela exige uma guarda de *"estou dentro de um campo?"*, e o modo de falhar dessa guarda é invisível — o leitor digita uma barra num formulário e o modal abre por cima do que ele estava escrevendo.

---

## 5. O modal — `<dialog>` com `showModal()`

**Armadilha de foco, camada superior, `::backdrop`, `Escape` e restauração do foco vêm de graça.** Não escrevemos gestão de foco nenhuma, e é por isso que o modal é um `<dialog>` em vez de uma `<div>` com `position: fixed`.

Consequência que vale escrita: **zero `z-index` no arquivo**. O elemento entra na *top layer* do navegador, então não participa de empilhamento nenhum — não há número a escolher e não há briga com o navbar fixo.

| Dimensão | Valor | De onde sai |
| --- | --- | --- |
| Largura | `--pd-busca-panel-width` | a âncora, centralizada, `640px` — ver §10 |
| Altura máxima | `--pd-busca-height` | a única medida do projeto relativa à viewport |
| Deslocamento do topo | `--pd-busca-panel-top` | a âncora, `54px` — ver §10 |
| Ancoragem | topo, `margin-inline: auto` | um modal centrado verticalmente **pula** quando a lista cresce, e ela cresce a cada tecla |

> **Correção — a largura parou de citar `--pd-prose-width` por nome, na [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98).** Até ali o painel abria com a medida que o leitor estava lendo, e citar a largura de prosa por nome evitava uma segunda cópia do mesmo número — coincidência de propósito, tratada como parentesco. A âncora mede o painel fixo em 640px, e 640 não é 720: continuar citando `--pd-prose-width` teria virado a derivação falsa que este projeto recusa por escrito. `--pd-busca-panel-width` é o número, sozinho, em `tokens.css`. A propriedade antiga — um transplante que mudasse a coluna de prosa também movia o painel de busca de graça — morreu junto, e vale registrado para quem for portar a régua adiante.

A entrada usa `--pd-move-enter`, cujo único consumidor no projeto é este modal ([`motion.md`](motion.md) §2).

**Entrada e saída saem por mecanismos diferentes, e a assimetria foi medida — não escolhida.**

| | Mecanismo | Por quê |
| --- | --- | --- |
| entrada | `@keyframes pd-busca-abre`, referenciado por `global(…)` | `@starting-style` **não sobrevive ao minificador** |
| saída | `transition` com `allow-discrete` sobre `display` e `overlay` | quando `[open]` sai, a animação sai com ele e a opacidade cai pelo caminho de sempre |

A primeira redação deste documento descrevia as duas pontas como uma transição só, com `@starting-style` dando o estado de partida. **Ela abria pronto no site publicado.** O minificador do Docusaurus descarta o bloco `@starting-style` inteiro — o aviso de build é `Invalid property name` —, e o sintoma é o que [`motion.md`](motion.md) §6 cataloga como o pior do projeto: `docusaurus start` anima e o publicado não, sem erro em lugar nenhum. Foi encontrado lendo o CSS emitido.

`allow-discrete` continua sendo o que faz a **saída** rodar sobre `display`, que o `<dialog>` alterna.

### 5.1 O realce — peso e acento, e o que resolveu a briga

Até a [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) o `<mark>` mudava só o peso. A linha ativa já era uma superfície de estado — `--pd-surface-wash`, o acento a 12% — e um `<mark>` tingido poria **acento sobre acento no mesmo pixel**: duas ênfases brigando, e a de baixo perdendo. Era por isso que esta seção recusava cor.

**A âncora colore o termo em acento além de engrossar, e a #98 adota — mudando o outro lado da equação, não este.** A linha ativa deixou de ser `--pd-surface-wash` e passou a `--pd-border-default`, o texto forte a 12%: mesma força de mancha, cor neutra em vez de acento. As duas ênfases não brigam mais porque só uma continua sendo acento — a troca em `.opcao[aria-selected]`, não no `<mark>`, é o que compra a cor nova sem repetir o problema que a versão anterior evitava calando-a.

O elemento continua sendo `<mark>`, porque é ele que carrega o significado. O que o CSS troca agora é a tinta e o peso, os dois.

**O recorte é sobre o texto original, com as faixas mapeadas do normalizado.** `normalize('NFD')` decompõe acento em dois pontos de código; cortar pelo índice normalizado devolveria letra sem acento na tela, e o realce apagaria o til de `informação` na frente do leitor. Quando a conta de deslocamento não fecha, a função devolve zero faixas — perde-se ênfase, nunca uma letra.

### 5.2 Zero ícone novo

`search` e `x` já estão no manifesto ([`icones.md`](icones.md)), com o papel `sistema`. O teto de 64 não se move.

**As teclas do rodapé são caracteres soltos** — `↑`, `↓`, `↵`, `esc` — e desde a [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) nem dentro de `<kbd>`: a pílula de teclado saiu, e sobrou o glifo puro, herdando cor e tamanho do próprio rodapé. Três setas desenhadas custariam três slots e estourariam o teto; `↑` já é a seta. O rodapé some abaixo do limiar: quem está no toque não tem tecla, e a linha viraria ruído ocupando a altura que a lista quer.

### 5.3 O token novo

`--pd-surface-scrim` é o **único papel semântico novo** do slice — par declarado, entrando no papel `surface` que já existe, com um consumidor só: o `::backdrop`.

Ele deriva do extremo escuro da rampa, que é o mesmo nos dois modos; **o que bifurca é a opacidade**, e ela bifurca por motivo mecânico. No escuro a página já está perto da parada 950, e um véu leve não se distinguiria dela; no claro, a mesma opacidade transformaria a página num buraco preto em vez de empurrá-la para trás.

> **Correção de contagem, e ela vale registrada.** A resolução do slice dizia *"o único token novo"*. São **dois**. O segundo é `--pd-busca-height`, e ele é de outra camada — dimensão de chrome, camada 1, que não bifurca por modo. A afirmação continua verdadeira do jeito que ela de fato importa: **o slice não abriu papel semântico novo além do scrim.**
>
> Por que ele é token e não literal no CSS Module: `60dvh` **passaria** pelo portão 1, cujo padrão é `px|rem|em|ms|s`. Passar por buraco de varredura é a única forma de literal que este projeto não admite — a saída correta seria fechar o buraco, e fechá-lo aqui custa uma linha em vez de uma perna nova de portão.

---

## 6. ARIA, por citação

A busca é o **único lugar do projeto onde a spec descreve ARIA em prosa**, e ela aponta para um padrão publicado em vez de inventar um: *Combobox With List Autocomplete*, do WAI-ARIA Authoring Practices Guide.

O que a citação obriga:

| Atributo | Onde | Papel |
| --- | --- | --- |
| `role="combobox"` | no **próprio campo** | ARIA 1.2, não o invólucro do 1.0 |
| `aria-controls` | campo → listbox | diz qual lista o campo comanda |
| `aria-autocomplete="list"` | campo | a lista filtra, o campo não completa sozinho |
| `aria-activedescendant` | campo | **é o que mantém o foco no campo** enquanto a seleção anda |
| `role="listbox"` / `role="option"` | lista e itens | com `aria-selected` no ativo |
| `role="status"` | fora da tela | a contagem de resultados, anunciada |

`aria-activedescendant` é o pino que sustenta o §5: **o foco nunca sai do campo**, então não há foco a gerir. É também por isso que a opção não é parada de tabulação — um `tabindex` nela transformaria cinquenta e dois resultados em cinquenta e duas paradas de Tab. Ver [`foco.md`](foco.md) §4.

**Desvio nomeado do padrão:** o APG descreve `Escape` limpando o campo antes de fechar. Aqui `Escape` **fecha o modal**, porque é o `<dialog>` quem o trata e reescrever esse comportamento seria escrever de novo o que o navegador já faz — em troca de uma diferença que o leitor não pediu.

---

## 7. Quando a busca não existe

**O navbar não muda, e isso é medido.**

Tirar `['./src/plugins/busca', …]` da config faz `usePluginData('pd-busca')` devolver `undefined`; o `SearchBar` devolve `null`; e o `Navbar/Search` do upstream esconde o contêiner vazio pelo próprio `:empty` ([`chrome.md`](chrome.md) §2.1). Sem botão, sem atalho, sem modal — e o navbar reflui sozinho.

É a mesma propriedade que fez o slot de busca ser declarado vazio desde o slice 1: **reservar a posição custa zero pixel**, e preenchê-la não move nada.

---

## 8. O único JS de interação do projeto

Este é ele, e ele mora no **chrome**.

O catálogo de conteúdo continua em zero — o *substrato nativo* de [`docs/agents/domain.md`](../agents/domain.md) sai verbatim: nenhum componente de conteúdo implementa comportamento interativo, ou o elemento do navegador entrega ou o Docusaurus entrega.

A regra não afrouxou aqui. Ela diz que **comportamento à mão obriga a spec a descrever tecla, foco, anúncio de leitor de tela e ARIA em prosa** — e é exatamente o que os §5 e §6 fazem, uma vez, num documento, para uma superfície. O preço foi pago à vista e está escrito; o que a regra impede é pagá-lo dezoito vezes sem perceber.

---

## 9. Perdas nomeadas

| # | Perda | Por quê |
| ---: | --- | --- |
| 1 | **Sem stemming, sem tolerância a erro de digitação, sem sinônimo** | busca por substring; `webhoook` não acha nada. Ver o preço no [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| 2 | **Sem ranqueamento estatístico** | a escada é explicável e conferível; TF-IDF não é nenhum dos dois |
| 3 | **O índice não vê o texto que os componentes geram** | a fonte é o MDX; o que o catálogo renderiza a partir de props não está lá |
| 4 | **Clique no `::backdrop` não fecha** | o `<dialog>` não faz sozinho, e a detecção por alvo de clique conta o preenchimento do painel como o painel. `Escape` e o × cobrem |
| 5 | **A escala não escala** | dezenas de páginas é onde a troca é boa; a nota de migração do ADR 6 é o que fica escrito para a outra ordem de grandeza |
| 6 | **Sem assistente de IA — nem no navbar, nem no campo, nem na lista** | a âncora o oferece nos três lugares; perguntado se o quinto zero deveria abrir para acomodá-lo, o dono respondeu **"não entram"** — [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98). O cabeçalho de grupo que rotulava a linha de IA sai junto, sem custo à parte: sem a linha, não sobra o que rotular |

---

## 10. Alvo medido — o controle e o painel da âncora

A queixa do dono foi que *"a busca não segue o modelo"*. Esta tabela transforma isso em números conferíveis: os valores medidos no `docs.devin.ai`, em `research/paridade-devin` §7, a 1512.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Caixa do controle largura | `300,75px` | ±1 |
| Caixa do controle altura | `36px` | ±1 |
| Raio do controle | `12px` | exato |
| Painel largura | `640px` | ±1 |
| Painel topo | `54px` | ±1 |
| Painel raio | `20px` | exato |

**Três coisas ficavam fora da tabela, e a [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) fechou duas.** A âncora põe o controle **centralizado** na primeira linha do navbar — a #98 fez o mesmo, mas o comparador **continua** sem enxergar isso: ele mede a caixa, não o eixo, e posição não é comprimento. A dica de tecla da âncora era **texto puro** contra a nossa pílula `<kbd>`, e a #98 fechou a diferença — **mas ela é de pele, não de elemento**, e a redação anterior dizia *"presença de elemento"* e que a #98 o matou. Não matou, e é decisão: o que morreu foi a **pílula** — fundo, borda, raio, padding e sombra saíram, sobraram cor e peso. O `<kbd>` continua no DOM de propósito, porque é a **semântica de tecla**, e trocá-lo por um `<span>` pagaria semântica por uma aparência que o CSS já entrega inteira. `src/theme/SearchBar/estilos.module.css` registra isso ao lado da regra, e a linha de procedência abaixo sempre disse o certo: *"a pílula `<kbd>` do atalho do gatilho vira texto puro"*. **As teclas do rodapé são o outro caso**, e lá o elemento saiu mesmo — o §desta página que as descreve já diz `nem dentro de <kbd>`, e é a diferença entre os dois que esta frase confundia. Fica de fora ainda a linha de resultado: ela só pode ser sondada com o painel aberto **e com consulta digitada**, um cenário a mais do que este instrumento monta hoje. A #98 compactou a linha mesmo sem sonda — altura por padding reduzido, raio em `--pd-radius-md` (12px, contra os 14 que a âncora mede — ver Procedência, `origem própria (implementação)`) — avaliada visualmente, não por régua.

O painel é sondado com o modal **aberto**: o comparador clica no gatilho antes de medir, porque `<dialog>` fechado não tem caixa.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **O alvo medido do §10** | **medido em referência** | medição de primeira mão da âncora em `research/paridade-devin` §7 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| **O painel sondado com o modal aberto** | **origem própria (implementação)** | `<dialog>` fechado não tem caixa; sem abrir, a sonda devolveria ausência e não medida |
| Índice local, sem serviço externo | origem própria | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) — vive no [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| Dado global em vez de JSON no `outDir` | **origem própria (verificação)** | rota ausente devolve 200 com o shell da SPA; o `fetch().json()` estoura em parse |
| `allContentLoaded` em vez de `contentLoaded` | **origem própria (correção)** | medido em `server/plugins/actions.js@3.10.2` — os dois ganchos recebem o mesmo objeto de ações, e só um enxerga as outras instâncias |
| A porta compartilhada com o ai-era | **origem própria (implementação)** | duas ordens escritas duas vezes divergem na quarta tab |
| A fonte é o MDX | origem própria | consequência do axioma 2 |
| As chaves curtas do registro | herdado | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) §3 |
| Teto de 64 KB, sem portão novo | herdado | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) §4 |
| Normalização NFD nos dois lados | herdado | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) §5 |
| A escada em potências de dois | **origem própria** | a propriedade lexicográfica é o que torna a ordem explicável |
| O degrau alto é começo de PALAVRA, não do campo | **origem própria (correção)** | a régua de máquina reprovou a primeira redação deste documento |
| Sem teto de resultados | herdado | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) — teto seria truncamento silencioso |
| A régua de máquina em `node --test` | **origem própria (implementação)** | os portões são varredura, e ordenação não é varrível |
| A folga de 58% sob o teto | **origem própria (medição)** | 27 616 B em pt-BR e 27 645 B em EN, no `globalData` do build de **todos** os locales — o build de um locale só encurta o permalink do EN em 156 B |
| O empate entre títulos que se prefixam fica como perda nomeada | **origem própria (medição)** | as 45 páginas buscadas pelo próprio título; duas vêm em segundo. Remedido na #114 — a perda sobreviveu à morte das páginas de índice, o que mostra que a causa é a escada e não o corpus |
| A geometria do §10, implementada — `--pd-busca-panel-width`, `--pd-busca-panel-top`, `--pd-radius-lg`, e o raio do controle reancorado em `--pd-radius-md` | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.1/§7.2 |
| O fundo do painel troca `--pd-surface-raised` por `--pd-surface-page` | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.2, "fundo igual à página"; sem efeito no escuro (os dois papéis já coincidem, `tokens.css`), visível no claro |
| O controle centralizado na linha 1 do navbar | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.1; dependia do chão do navbar assentado, [#96](https://github.com/ThiagoPanini/panlabs-docs/issues/96) |
| A pílula `<kbd>` do atalho do gatilho vira texto puro | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.1, resolve a lacuna que este documento já registrava no §10 |
| As teclas do rodapé perdem o `<kbd>` e viram glifo solto | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.2 |
| O `<mark>` ganha cor de acento, além do peso | herdado | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.2 |
| A linha selecionada troca `--pd-surface-wash` por `--pd-border-default` (neutro) | **origem própria (implementação)** | descoberto ao implementar [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98): sem a troca, o acento do `<mark>` cai sobre acento na linha ativa — ver §5.1 |
| O raio da linha de resultado fica em `--pd-radius-md` (12px), não nos 14px que a âncora mede | **origem própria (implementação)** | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §7.2 mede 14px, mas nada na medição sustenta abrir um quinto degrau de raio só por 2px não sondados (§10); a decisão de reusar `--pd-radius-md` saiu de escrever o CSS, não de régua. **Não é `delta deliberado`** — `principios.md` §3 fecha essa classe em zero membros, sem novos tickets que a reabram |
| Sem assistente de IA — navbar, campo e lista | **lacuna por restrição** | [#98](https://github.com/ThiagoPanini/panlabs-docs/issues/98) — `research/paridade-devin` §13; a restrição é o quinto zero (uma única JS de interação). Se ela ainda cabe nesta classe ou pede qualificador próprio segue **aberto** — o §13 da pesquisa já registrava a mesma dúvida, e `principios.md` §5.1 é onde ela se resolve, se resolver |
| O cabeçalho de grupo da linha de IA some | **origem própria (consequência)** | cai da linha acima: sem a linha de IA, não sobra o que o cabeçalho rotule |
| Fallback entra marcado, detectado por caminho | herdado | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) §6 |
| Botão e não campo | herdado | medido nas quatro referências |
| Um limiar só, o do Infima | herdado | [`chrome.md`](chrome.md) §1.6 |
| `⌘K` / `Ctrl K`, e `/` recusado | herdado + origem própria | o atalho é das referências; a recusa é do modo de falhar invisível da guarda |
| O glifo da tecla decidido depois da montagem | **origem própria (implementação)** | o servidor não sabe a plataforma, e o HTML divergiria na hidratação |
| `<dialog>` com `showModal()` | **mecanismo emprestado** | do navegador; a armadilha de foco e a camada superior são dele |
| Largura igual ao interior do cartão | **origem própria** | derivada, não medida — a medida que o leitor já estava lendo |
| Ancorado no topo | origem própria | modal centrado pula quando a lista cresce |
| `--pd-surface-scrim`, par declarado | **origem própria** | não há medição de véu nas referências; a bifurcação de opacidade é mecânica |
| `--pd-busca-height` como token | **origem própria (correção)** | a resolução dizia *um* token novo; são dois, e o segundo é de outra camada |
| ARIA por citação do APG | herdado | *Combobox With List Autocomplete*, WAI-ARIA APG |
| `Escape` fecha em vez de limpar | **origem própria (implementação)** | é o `<dialog>` quem trata; reescrever seria refazer o que o navegador faz |
| A entrada é `@keyframes`, não `@starting-style` | **origem própria (correção)** | medido no CSS emitido: o minificador descarta o bloco inteiro, e o modal publicado abria sem transição |
| Entrada e saída por mecanismos diferentes | **origem própria (implementação)** | consequência da linha acima; a saída não depende de estado de partida e continua na transição |
| Realce por peso, não por fundo | **origem própria** | a linha ativa já é superfície de acento |
| Teclas em caractere, não em ícone | herdado | [`icones.md`](icones.md) — o teto de 64 não se move por legenda de rodapé |
| Zero JS de interação no catálogo, um no projeto | herdado | o substrato nativo de [`domain.md`](../agents/domain.md) |
