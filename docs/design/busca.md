# Busca

O índice, o gatilho, o modal e a única superfície de interação que este projeto autora.

**Nenhum valor numérico aparece neste documento**, salvo os pesos da escada de pontuação do §3 — que não são comprimento, cor, tempo nem curva, e sim a ordem de uma lista. Todo comprimento mora em [`tokens.md`](tokens.md) e é citado aqui por nome de token.

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

As chaves são curtas porque cada uma se repete cinquenta e duas vezes por locale, e o teto do §2.3 é serializado. `f` é **omitida** quando falsa em vez de escrita como `0`: uma chave ausente não custa bytes.

### 2.2 A fonte é o MDX

Não o HTML renderizado — o que dispensa `cheerio` e é o que fará **as 6 páginas geradas de `Biblioteca C` entrarem pelo mesmo caminho das 46 autorais, sem caso especial**. Uma página gerada é um arquivo em disco como qualquer outra, e foi por isso que o índice não precisou saber que o ramo gerado chegou — ele chegou, e a única linha que mudou foi a da medição.

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
| `pt-BR` | 52 | 27 616 | 58% |
| `en` | 52 | 27 645 | 58% |

Os dois locales têm a mesma contagem de registros e quase o mesmo peso: sob `/en/` as 21 páginas traduzidas ficam mais curtas em inglês, e as 31 de fallback entram em português com a marca `f` — os 29 bytes de diferença são o que sobra dessa troca.

> **A folga encolheu de 62% para 58%, e o motivo é o previsto.** A medição anterior era 24 894 bytes para 46 páginas, e o parágrafo que a registrava dizia que *"o ramo gerado de `Biblioteca C` volta a consumi-la"*. Ele voltou: 46 + 6 = 52 páginas, +2 751 bytes, **459 bytes por página gerada** — quase o dobro da média de uma página autoral, porque corpo de referência é denso e repetitivo. A medição antes daquela era 35 612 bytes para as 73 páginas do Trilho.
>
> **A régua para a próxima vez está nesses 459 bytes.** A folga atual comporta cerca de 82 páginas geradas a mais; comporta menos se elas forem maiores. Quem acrescentar um segundo ramo gerado mede antes, não depois — o teto não avisa, ele reprova o build.

**A varredura também confere a aritmética do locale de graça:** dos 52 registros do índice EN, **31 carregam a marca de fallback**, que é exatamente a contagem que [`informacao.md`](informacao.md) §8 declara. Duas superfícies independentes chegando ao mesmo número é a forma mais barata de conferência que este projeto tem.

### 2.4 O que fica de fora

`unlisted` e `draft`. O `draft` já sai de `docs` em produção pelo próprio plugin de docs, e o critério vai escrito mesmo assim: ele é do slice, não do upstream, e em `docusaurus start` o rascunho continua na lista.

### 2.5 As páginas de fallback entram, marcadas

As 31 páginas sem contraparte em inglês ([`informacao.md`](informacao.md) §8) são servidas em português sob `/en/`. Elas **entram no índice**, com `f`.

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

Os oito portões cobrem CSS, conteúdo e a landing por **varredura**. Ordenação de resultado não é varrível: ou existe um caso que a exercita, ou *"escada determinística"* fica sendo afirmação de prosa.

Por isso a lógica pura mora em `src/theme/SearchBar/escada.mjs`, separada do JSX, e `scripts/busca.test.mjs` a cobra com `node --test` — o runner do **próprio runtime**, zero dependência nova. Roda com `npm test`, cadência de commit.

O que ele trava: a propriedade de potências de dois, a ordem entre os sete degraus, o `E` entre os termos, os dois desempates, a ausência de teto, e o recorte do realce sobre texto acentuado.

> **Ele já se pagou.** A primeira redação deste documento afirmava que o degrau 64 era *"prefixo do título"*. O teste reprovou: o degrau casa começo de **palavra**, em qualquer posição. A tabela acima é o que o código faz, e não o que eu achei que ele fizesse.

### 3.3 O que o corpus novo expôs

Os 17 casos da régua passam sobre índices sintéticos. Sobre o corpus real eles não dizem nada — então a árvore fechada foi exercitada com uma varredura de fora do teste: **buscar cada uma das 52 páginas pelo próprio título, e conferir se ela vem em primeiro**. Duas não vêm.

| Consulta | O que vem em 1º | Onde a própria página cai |
| --- | --- | --- |
| `Biblioteca B` | `Bibliotecas`, 128 pontos | 3ª, também com 128 |
| `Esteira` | `Esteiras`, 64 pontos | 3ª, também com 64 |

**Os dois são empate, não erro de ordem** — a escada põe as candidatas no mesmo degrau e o desempate de sidebar decide. E os dois nascem da mesma cegueira: **a escada não distingue casar a palavra inteira de casar o começo dela.** `esteira` casa `Esteiras` e `Esteira` no mesmo degrau 64; `b` casa `Bibliotecas`, `Biblioteca A` e `Biblioteca B` no mesmo 64.

É caso que o Trilho não produzia. Ele veio de duas coisas desta árvore: títulos que diferem por um sufixo de uma letra (`Biblioteca A`/`B`/`C`) e o vocabulário repetitivo do ramo gerado (`Esteira`, `Esteira.gerar`, `Esteira.trabalho`).

**A correção óbvia foi medida e recusada.** Um oitavo degrau no topo — *título, palavra inteira*, valendo 128 — resolve `Biblioteca B` com folga: 256 contra os 192 de `Biblioteca A` e os 128 de `Bibliotecas`. Mas ele quebra `Esteira` de um jeito pior. `Esteiras` é o único título que casa `esteira` **por prefixo**; os outros **cinco** casam a palavra inteira, e o índice cairia de primeiro para **sexto** — atrás de duas folhas de procedimento e de três da referência gerada. Quem digita `esteira` deixaria de achar o índice de esteiras para achar uma classe. E `Esteira` continuaria não vindo em primeiro, porque o empate entre os cinco volta a ser desfeito pela aba. **O degrau custa o caso comum e não compra o caso raro** — é trocar um resultado ruim por dois.

**Fica como perda nomeada, e a nomeação é o produto.** Um leitor que digita o título exato de uma página pode encontrá-la em terceiro, quando o título dela é um prefixo do título de outra. A saída de verdade não é degrau: é peso por especificidade — título curto valendo mais que título longo, ou casamento exato do título inteiro como critério. Nenhum dos dois cabe em *potências de dois com degraus fixos*, e comprar qualquer um deles é redesenhar a escada, não ajustá-la.

---

## 4. O gatilho — botão, não campo

Um `<input>` no navbar que não aceita digitação é um controle que mente sobre o que faz. O botão diz *isto abre outra coisa*, que é o que acontece.

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
| Largura | `--sd-prose-width` | é **a medida que o leitor estava lendo** quando apertou a tecla |
| Altura máxima | `--sd-busca-height` | a única medida do projeto relativa à viewport |
| Ancoragem | topo, `margin-inline: auto` | um modal centrado verticalmente **pula** quando a lista cresce, e ela cresce a cada tecla |

A entrada usa `--sd-move-enter`, cujo único consumidor no projeto é este modal ([`motion.md`](motion.md) §2).

**Entrada e saída saem por mecanismos diferentes, e a assimetria foi medida — não escolhida.**

| | Mecanismo | Por quê |
| --- | --- | --- |
| entrada | `@keyframes sd-busca-abre`, referenciado por `global(…)` | `@starting-style` **não sobrevive ao minificador** |
| saída | `transition` com `allow-discrete` sobre `display` e `overlay` | quando `[open]` sai, a animação sai com ele e a opacidade cai pelo caminho de sempre |

A primeira redação deste documento descrevia as duas pontas como uma transição só, com `@starting-style` dando o estado de partida. **Ela abria pronto no site publicado.** O minificador do Docusaurus descarta o bloco `@starting-style` inteiro — o aviso de build é `Invalid property name` —, e o sintoma é o que [`motion.md`](motion.md) §6 cataloga como o pior do projeto: `docusaurus start` anima e o publicado não, sem erro em lugar nenhum. Foi encontrado lendo o CSS emitido.

`allow-discrete` continua sendo o que faz a **saída** rodar sobre `display`, que o `<dialog>` alterna.

### 5.1 O realce, por peso e não por fundo

A linha ativa já é uma superfície de estado — `--sd-surface-wash`, que é o acento a 12%. Um `<mark>` tingido poria **acento sobre acento no mesmo pixel**: duas ênfases brigando, e a de baixo perdendo.

O elemento continua sendo `<mark>`, porque é ele que carrega o significado. O que o CSS troca é a tinta pelo peso.

**O recorte é sobre o texto original, com as faixas mapeadas do normalizado.** `normalize('NFD')` decompõe acento em dois pontos de código; cortar pelo índice normalizado devolveria letra sem acento na tela, e o realce apagaria o til de `informação` na frente do leitor. Quando a conta de deslocamento não fecha, a função devolve zero faixas — perde-se ênfase, nunca uma letra.

### 5.2 Zero ícone novo

`search` e `x` já estão no manifesto ([`icones.md`](icones.md)), com o papel `sistema`. O teto de 64 não se move.

**As teclas do rodapé são caracteres dentro de `<kbd>`** — `↑`, `↓`, `↵`, `esc`. Três setas desenhadas custariam três slots e estourariam o teto; `↑` já é a seta. O rodapé some abaixo do limiar: quem está no toque não tem tecla, e a linha viraria ruído ocupando a altura que a lista quer.

### 5.3 O token novo

`--sd-surface-scrim` é o **único papel semântico novo** do slice — par declarado, entrando no papel `surface` que já existe, com um consumidor só: o `::backdrop`.

Ele deriva do extremo escuro da rampa, que é o mesmo nos dois modos; **o que bifurca é a opacidade**, e ela bifurca por motivo mecânico. No escuro a página já está perto da parada 950, e um véu leve não se distinguiria dela; no claro, a mesma opacidade transformaria a página num buraco preto em vez de empurrá-la para trás.

> **Correção de contagem, e ela vale registrada.** A resolução do slice dizia *"o único token novo"*. São **dois**. O segundo é `--sd-busca-height`, e ele é de outra camada — dimensão de chrome, camada 1, que não bifurca por modo. A afirmação continua verdadeira do jeito que ela de fato importa: **o slice não abriu papel semântico novo além do scrim.**
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

Tirar `['./src/plugins/busca', …]` da config faz `usePluginData('sd-busca')` devolver `undefined`; o `SearchBar` devolve `null`; e o `Navbar/Search` do upstream esconde o contêiner vazio pelo próprio `:empty` ([`chrome.md`](chrome.md) §2.1). Sem botão, sem atalho, sem modal — e o navbar reflui sozinho.

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

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Índice local, sem serviço externo | origem própria | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) — vive no [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| Dado global em vez de JSON no `outDir` | **origem própria (verificação)** | rota ausente devolve 200 com o shell da SPA; o `fetch().json()` estoura em parse |
| `allContentLoaded` em vez de `contentLoaded` | **origem própria (correção)** | medido em `server/plugins/actions.js@3.10.2` — os dois ganchos recebem o mesmo objeto de ações, e só um enxerga as outras instâncias |
| A porta compartilhada com o ai-era | **origem própria (implementação)** | duas ordens escritas duas vezes divergem na quarta tab |
| A fonte é o MDX | origem própria | consequência do axioma 2 |
| As chaves curtas do registro | herdado | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) §3 |
| Teto de 64 KB, sem portão novo | herdado | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) §4 |
| Normalização NFD nos dois lados | herdado | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) §5 |
| A escada em potências de dois | **origem própria** | a propriedade lexicográfica é o que torna a ordem explicável |
| O degrau alto é começo de PALAVRA, não do campo | **origem própria (correção)** | a régua de máquina reprovou a primeira redação deste documento |
| Sem teto de resultados | herdado | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) — teto seria truncamento silencioso |
| A régua de máquina em `node --test` | **origem própria (implementação)** | os portões são varredura, e ordenação não é varrível |
| A folga de 58% sob o teto | **origem própria (medição)** | 27 616 B em pt-BR e 27 645 B em EN, medidos no `globalData` do build de cada locale |
| O empate entre índice e folha fica como perda nomeada | **origem própria (medição)** | as 52 páginas buscadas pelo próprio título; duas não vêm em primeiro, e o oitavo degrau que resolveria uma delas quebra a outra |
| Fallback entra marcado, detectado por caminho | herdado | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) §6 |
| Botão e não campo | herdado | medido nas quatro referências |
| Um limiar só, o do Infima | herdado | [`chrome.md`](chrome.md) §1.6 |
| `⌘K` / `Ctrl K`, e `/` recusado | herdado + **origem própria** (a recusa) | o atalho é das referências; a recusa é do modo de falhar invisível da guarda |
| O glifo da tecla decidido depois da montagem | **origem própria (implementação)** | o servidor não sabe a plataforma, e o HTML divergiria na hidratação |
| `<dialog>` com `showModal()` | **mecanismo emprestado** | do navegador; a armadilha de foco e a camada superior são dele |
| Largura igual ao interior do cartão | **origem própria** | derivada, não medida — a medida que o leitor já estava lendo |
| Ancorado no topo | origem própria | modal centrado pula quando a lista cresce |
| `--sd-surface-scrim`, par declarado | **origem própria** | não há medição de véu nas referências; a bifurcação de opacidade é mecânica |
| `--sd-busca-height` como token | **origem própria (correção)** | a resolução dizia *um* token novo; são dois, e o segundo é de outra camada |
| ARIA por citação do APG | herdado | *Combobox With List Autocomplete*, WAI-ARIA APG |
| `Escape` fecha em vez de limpar | **origem própria (implementação)** | é o `<dialog>` quem trata; reescrever seria refazer o que o navegador faz |
| A entrada é `@keyframes`, não `@starting-style` | **origem própria (correção)** | medido no CSS emitido: o minificador descarta o bloco inteiro, e o modal publicado abria sem transição |
| Entrada e saída por mecanismos diferentes | **origem própria (implementação)** | consequência da linha acima; a saída não depende de estado de partida e continua na transição |
| Realce por peso, não por fundo | **origem própria** | a linha ativa já é superfície de acento |
| Teclas em caractere, não em ícone | herdado | [`icones.md`](icones.md) — o teto de 64 não se move por legenda de rodapé |
| Zero JS de interação no catálogo, um no projeto | herdado | o substrato nativo de [`domain.md`](../agents/domain.md) |
