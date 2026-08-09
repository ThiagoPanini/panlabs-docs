# Princípios

De onde os valores vêm, o que pode ser contestado, e por qual regra.

Este documento não decide um pixel. Ele decide **como se decide** — e é por isso que ele é o primeiro da ordem de leitura da [espinha](README.md). Sem ele, o resto da spec parece um conjunto de escolhas arbitrárias com muita convicção.

**Nenhum valor numérico de desenho nasce aqui.** Os dois que aparecem são **citação do valor de outro sistema** — o anel de um pixel da elevação, que é de [`tokens.md`](tokens.md), e os 1024px de limiar da âncora, que existem no §7 justamente para registrar que foram descartados.

---

## 1. A âncora é o Mintlify

O shinydoc herda o sistema visual do **Mintlify**, e a herança é o default: **fora das dimensões de delta do §3, o valor da âncora vale sem discussão.**

Isso não é gosto declarado depois do fato. A medição das sete referências em produção — FastMCP, Devin, Perplexity, Vapi, Neon, Clerk, Trigger.dev — produziu um achado que decidiu a âncora sozinho:

> **São sete sites, mas quatro sistemas.** FastMCP, Devin, Perplexity e Trigger.dev servem o mesmo CSS do Mintlify, byte a byte. Vapi é Fern. Neon e Clerk são Next.js próprio, cada um.

Tratar os sete como evidência independente **superestima a base em mais de 2×**. O que sobra depois de colapsar: um sistema com quatro instâncias em produção, e três sistemas com uma cada. A âncora não é o mais bonito — é o único com repetição medida.

**Os outros três não são âncora. Eles doam mecanismo, nunca valor.** Quando a spec toma a arquitetura de um componente do Vapi, do Neon ou do Clerk, ela reancora o valor na própria escala — a estrutura é fixa, o valor é skin. Essa é a classe `mecanismo emprestado` do §5.

### 1.1 O que a âncora **não** decide

**Coerência entre sistemas diferentes.** O axioma 5 diz *medição, não invenção*, e ele tem um limite escrito: medir quatro sistemas dá quatro respostas, e escolher entre elas é decisão explícita — não subproduto da medição. Toda vez que a spec escolhe, ela carimba `origem própria` e diz por quê.

---

## 2. O que se herda calado

Herança calada é herança que **não vira linha de spec**. Ela existe, ela decide pixel, e ela não é discutida — porque discuti-la produziria trinta parágrafos defendendo o consenso.

| Dimensão | Por que é calada |
| --- | --- |
| **Geometria de layout** | container, coluna, gutter e a proporção 75/25 são o grid do Infima sobre a medida do alvo. Não há divergência a registrar |
| **Densidade de UI** | o valor mais unânime da amostra inteira. Quatro sistemas, um número |
| **Tipografia** | não é delta: é **parâmetro que a própria âncora expõe**. Trocar a pilha de fonte é re-marcar, não redesenhar — por isso ela está na superfície de troca |
| **Escala de espaço** | base 4, múltiplos de 8. Consenso de indústria antes de ser consenso da amostra |
| **Forma da rampa de cinzas** | as onze paradas de luminosidade são a média das quatro rampas Mintlify medidas. A **forma** é herdada; o **matiz** é da marca |

**Herdado calado ainda é herdado**, e continua carimbado na tabela de procedência de cada documento. O que "calado" significa é que não há seção de justificativa — a fonte é a medição, e a medição está no ticket.

---

## 3. Os quatro deltas deliberados

**Quatro dimensões, e só quatro.** Fora delas não há divergência da âncora por escolha — o que houver é divergência **por restrição**, que é outra coisa e se registra como tal.

| # | Delta | O que o shinydoc faz de diferente | Onde |
| ---: | --- | --- | --- |
| 1 | **Motion** | vocabulário fechado de seis movimentos nomeados, resolvidos na camada de token, com reduced-motion alcançando todos de uma vez pela escala de duração. A âncora move menos e move ad hoc | [`motion.md`](motion.md) · [ADR 3](../adr/0003-reduced-motion-na-camada-de-token.md) |
| 2 | **Profundidade** | escada de elevação com anel `0 0 0 1px` embutido na sombra multi-camada, e a lacuna de sombra do escuro preenchida. A âncora lê plana | [`tokens.md`](tokens.md) |
| 3 | **Forma** | raio base como parâmetro único da superfície de troca, e uma escada derivada dele por `calc()`. Um número entra, o site inteiro re-forma | [`tokens.md`](tokens.md) |
| 4 | **Bloco de código** | superfície própria, medida de escape do cartão, e paleta de sintaxe que é papel da camada 2 em vez de tema literal | [`tokens.md`](tokens.md) · [`componentes/code-block.md`](componentes/code-block.md) |

**A medida de prosa constante e o breakout são consequência do delta 4**, não um quinto delta: a âncora oscila a largura do texto conforme a página tem ou não subtítulos, e essa oscilação é **efeito colateral**, não desenho. Corrigi-la é herdar a intenção em vez do artefato.

### 3.1 Divergência por restrição não é delta

Existe uma terceira categoria, e confundi-la com delta seria dar crédito de escolha a uma limitação:

> **Divergência por restrição** é onde o shinydoc não faz o que a âncora faz porque o Docusaurus não permite sem `unsafe`.

O breadcrumb reestruturado, o footer dentro da coluna de prosa, a proporção conteúdo/painel da Referência da API — os três são isso. Eles têm classe própria na tabela de procedência (`lacuna por restrição`, §5) e estão inventariados em [`chrome.md`](chrome.md) §8 e [`swizzle.md`](swizzle.md) §4.

**A diferença importa no upgrade.** Delta deliberado é decisão e não se reabre sem argumento; lacuna por restrição **reabre com a plataforma** — o dia em que o Docusaurus expuser o ponto, o item sobe de degrau sozinho.

---

## 4. A régua de coerência, e os três portões que a cobram

A régua é **mecânica de propósito**:

> **Nenhum valor entra no sistema como literal, salvo na camada de raiz.** Todo o resto sai de algo que já está lá, por uma operação declarada — derivar de **uma** cor por sintaxe relativa, misturar **duas** por `color-mix`, ou `calc()` sobre a base de raio, espaço ou duração — e se resolve nos dois modos como par declarado.

Uma régua de julgamento só funciona com o dono do projeto presente, que é exatamente o que a spec existe para dispensar. Por isso ela é conferida por três varreduras, todas em cadência de commit:

| Portão | O que ele impede | Por que ESTE e não outro |
| ---: | --- | --- |
| 1 | literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | é a régua inteira, virada em `grep`. A segunda perna dele exige **um limiar de media query só no projeto** |
| 2 | `transition:` ou `animation:` com tempo ou curva cravada | movimento novo precisa entrar no vocabulário **antes** de ter consumidor. Sem ele, reduced-motion vira lista de alvos |
| 3 | `outline` fora de `src/css/foco.css` | este contrato não morre por anel feio. Morre por `outline: none` escrito para "limpar" um botão — a linha de CSS mais comum do mundo, que apaga acessibilidade de teclado sem sintoma visível para quem a escreveu |

**Os três cobram declaração, não prosa:** a varredura remove comentário antes de olhar. Portão que reprova por explicação ensina a escrever comentário pobre.

Os outros quatro portões cobram outras coisas — conteúdo, gerador, host e superfície de swizzle. A lista completa está na [espinha](README.md) §5.

---

## 5. As cinco classes de procedência

**Definidas aqui, e num lugar só.** Toda tabela `## Procedência` da spec usa esta lista, e nada além dela.

Sem o carimbo, valor medido e valor inventado ficam **graficamente idênticos** na página — e o axioma 5 fica infiscalizável. A classe não é metadado: ela diz a quem implementa **o que pode mexer**.

| Classe | O que significa | O que quem implementa pode fazer |
| --- | --- | --- |
| **herdado** | medido na âncora, fora das dimensões de delta | **não toca** |
| **delta deliberado** | uma das quatro dimensões do §3 | ajusta **só pela regra de derivação** do §4 |
| **mecanismo emprestado** | arquitetura de Vapi, Neon ou Clerk, com o valor reancorado na nossa escala | estrutura fixa; **o valor é skin** |
| **origem própria** | nada na medição sustenta | **a mais frágil, e a primeira a ser contestada** |
| **lacuna de medição** | dimensão herdada que a pesquisa declarou **não medida** | reabre no dia em que alguém medir |

### 5.1 Os qualificadores estreitam a classe; eles não abrem uma sexta

As classes são cinco e continuam cinco. O que os documentos acrescentam é **qualificador**, e ele diz de onde a origem própria saiu:

| Qualificador | De onde o valor saiu |
| --- | --- |
| `origem própria (verificação)` | conferir o upstream — ler o fonte do Docusaurus e descobrir o que ele de fato faz |
| `origem própria (medição)` | medir o artefato que nós mesmos produzimos |
| `origem própria (correção)` | corrigir uma afirmação anterior do mapa que a implementação desmentiu |
| `origem própria (implementação)` | descobrir escrevendo o código — coisa que nenhuma resolução previu |
| `origem própria com âncora normativa` | não tem medição atrás, mas tem **norma** (uma SC do WCAG, um padrão do APG) |

**`lacuna por restrição` é a única que muda de leitura**, e por isso ela vale um parágrafo. Ela **não** é dimensão não medida: é dimensão **medida e não alcançável** — o Docusaurus não permite sem `unsafe`. Ela reabre com a **plataforma**, não com a régua, e é a classe de todas as divergências do §3.1.

### 5.2 A classe mais útil é a mais frágil

`origem própria` é a que um revisor deve atacar primeiro, e a spec a carimba de propósito para facilitar o ataque. Uma spec que escondesse a fragilidade sob prosa confiante seria mais agradável de ler e impossível de auditar.

---

## 6. A assinatura visual, numa frase

> **Cartão escuro elevado por anel de sombra sobre página mais escura, tipografia sóbria em coluna de medida constante, e uma única faixa de espetáculo onde a luz é emitida em vez de ocluída.**

Tudo o mais é consequência. A raridade da faixa é o que a torna assinatura em vez de enfeite: ela é **uma** região do site inteiro — hero mais laje de código, na landing —, marcada por `[data-sd-showcase]`, e o critério que autoriza um elemento a entrar nela é **emissão**. Como tudo mais no sistema é oclusão, o critério admite ela e mais nada.

Não existe ilha clara: emissão precisa de escuridão, então o mecanismo tem uma direção só.

---

## 7. O que foi medido e descartado

Cada linha aqui é uma coisa que a medição entregou e que a spec **não** usou. Elas ficam escritas porque descarte anônimo é indistinguível de descuido — e porque um revisor que só vê o que entrou não consegue julgar o que ficou de fora.

| O que foi medido | Por que não entrou |
| --- | --- |
| **Duas versões de doc, como demonstração de mecânica** | a revisão foi feita contra a base de evidências da própria recomendação: **seis das sete referências não têm seletor de versão nenhum**, e a doc oficial diz que versionamento *"só aumenta o tempo de build e a complexidade"* |
| **A oscilação da largura de texto da âncora** | não é desenho, é efeito colateral de a coluna depender de a página ter subtítulos. Páginas vizinhas leem com larguras diferentes sem motivo visível ao leitor |
| **O painel largo à direita da âncora**, na proporção dela | vive numa classe hasheada de CSS Module; alcançá-la custaria `unsafe` em `DocItem/Layout`. Vira `lacuna por restrição`, não descarte |
| **Os 1024px de limiar da âncora** | brigam com os 996/997 compilados do Infima, que é quem mostra e esconde a sidebar. Dois limiares no mesmo eixo custam mais que a fidelidade compra |
| **A mistura de famílias de ícone da âncora** | é acidente dela, não desenho. O manifesto é de família única, contorno e geometria consistentes |
| **As seis partes por componente que o Mintlify publica** | ele é multi-tenant e o cliente **não pode tocar no React dele**. O transplante corporativo é dono do arquivo — copiar aquela superfície seria herdar uma restrição de arquitetura que não é a nossa |
| **Alternância de faixas escuro/claro na landing** | exige a **ilha clara**, descartada por escrito. E a alternância sumiria inteira no modo escuro, que é o canônico: o ritmo existiria só no modo secundário |
| **`Content-Disposition: inline` como exigência literal do portão 6** | as referências mandam o cabeçalho; o GitHub Pages não manda nenhum. Ausente **não é** `attachment` — pela RFC 6266 a disposição default é inline. Exigir o literal reprovaria um host onde o recurso funciona, e portão que reprova o que funciona é portão que alguém desliga |
| **DocSearch, do próprio ecossistema Docusaurus** | três conversas corporativas — dependência, egresso de rede e conteúdo indexado fora do perímetro. A terceira não tem argumento técnico que a mova. Ver [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| **Ranqueamento estatístico na busca** (TF-IDF, BM25) | a escada de degraus é **explicável em prosa e conferível por teste**; um score estatístico não é nenhum dos dois. Numa base de dois mil documentos essa recusa se inverte |

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| A âncora é o Mintlify | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) — sete sites, quatro sistemas; a repetição decidiu |
| Os quatro sistemas, e o colapso dos sete | **origem própria (medição)** | o CSS servido é byte a byte o mesmo em quatro dos sete |
| O que se herda calado | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2), [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| Os quatro deltas, e só quatro | origem própria | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) — tipografia e densidade não são delta |
| Divergência por restrição é categoria própria | **origem própria** | dar crédito de escolha a uma limitação seria mentir na tabela |
| A regra de derivação | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §3 — mecânica de propósito |
| Os três portões da régua | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §7, [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2, [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) §11 |
| As cinco classes de procedência | herdado | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) — consolidadas aqui, num lugar só |
| Os qualificadores estreitam em vez de abrir uma sexta | **origem própria (implementação)** | os quatro nasceram do uso, nos slices 1 a 6 |
| A assinatura numa frase | origem própria | síntese; não medida |
| A tabela do que foi medido e descartado | **origem própria** | descarte anônimo é indistinguível de descuido |
