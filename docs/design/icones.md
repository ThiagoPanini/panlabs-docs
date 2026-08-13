# Ícones

O manifesto, os três renderizadores, a marca e o teto duro.

**Nenhum valor numérico de desenho aparece neste documento.** Os números que aparecem aqui são **contagens** — quantos arquivos, quantas tags, qual o teto — e a espessura de traço da tabela de compensação óptica, que é prop de componente e não token de CSS.

> **De onde sai o tamanho de um ícone, dito porque a primeira redação errou.** Ela mandava procurar em [`tokens.md`](tokens.md), e **não há token de tamanho de ícone lá** — nem `--sd-icon-*` nem equivalente. O ponteiro apontava para o vazio, e o teste de reconstrução ([`README.md`](README.md) §6) tropeçou exatamente aqui.
>
> A regra é: **ícone de chrome se dimensiona pela escala de espaço**, e o par em uso na sidebar é `--sd-space-4` para o quadrado e `--sd-space-2` para o afastamento do rótulo. Não é derivação falsa: um ícone de sidebar é um item de lista ao lado de texto, e o que o alinha ao ritmo da lista é a mesma escala que dá o `gap` dela.
>
> Ícone **dentro** de componente do catálogo é outra conta, e ela é prop — ver a tabela de compensação óptica do §4.

Documento transversal, ao lado de [`motion.md`](motion.md), [`foco.md`](foco.md) e [`swizzle.md`](swizzle.md): a sidebar é o consumidor principal, mas o catálogo de conteúdo, a marca e a Referência da API leem o mesmo manifesto.

Tudo aqui é obrigatório. Não há bloco `Livre`: os **desenhos** são skin e se trocam inteiros, mas o manifesto é contrato e não tem latitude interna.

---

## 1. Origem — Lucide vendorizado

**64 arquivos `.svg` do Lucide (ISC), copiados para dentro do repositório.** Não é dependência, não é CDN, não é resolução em runtime.

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

**A resolução importa mais que o achado: o nome do manifesto é NOSSO contrato e não se move por renomeação de terceiro.** Quem paga a divergência é um campo opcional na entrada, que registra o nome do upstream onde ele diverge — não o MDX de 73 páginas, e não os componentes.

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

## 3. Três renderizadores, uma fonte de verdade

Não é inconsistência: cada um é **forçado pelo contexto**, e os três leem os mesmos 64 arquivos.

### (a) Componentes de conteúdo → SVGR inline

O `preset-classic` **já traz SVGR** — o plugin é dependência dele e é registrado por padrão, com `removeViewBox: false`, que é o override que impede o otimizador de quebrar o escalonamento. Um `import` de `.svg` devolve componente React, dentro do preset que o axioma 2 permite por nome.

Ganha `currentColor` de graça (o SVG do Lucide já nasce com `stroke="currentColor"` e `fill="none"`), espessura controlável, título acessível sem trabalho, e zero requisição HTTP extra.

### (b) Sidebar → `mask-image` mais `currentColor`

**Aqui não há escolha.** Não existe ponto de swizzle `safe` para injetar componente React num item de sidebar — a maioria esmagadora dos componentes swizzláveis não tem nenhuma ação `safe`. O caminho de `className` mais `::before` com máscara é o **único** zero-swizzle, e é literalmente o que produz a assinatura visual mais reconhecível do alvo.

A parte elegante: o estado ativo já pinta o texto, e a máscara é pintada com `currentColor` — **o ícone acompanha sem uma linha a mais e sem segundo asset para o modo escuro**.

### (c) A marca → SVGR, e é o terceiro caso

`train-track` ao lado da palavra `Trilho`, no acento. **Tipo mais glifo, nunca arquivo de imagem.**

O caminho de configuração não alcança: o schema de logo exige um arquivo e o componente renderiza uma imagem temática, ou seja um `<img>` — e `<img>` **não herda `currentColor`**. `Logo` e `Navbar/Logo` não estão no `getSwizzleConfig`, logo caem no default `unsafe`, que o [ADR 2](../adr/0002-politica-de-swizzle.md) proíbe.

Sobra o **degrau 3**: o registro de `NavbarItem/ComponentTypes`, que o próprio Docusaurus marca como *"meant to be ejected"* — espalha-se o objeto original e acrescenta-se uma chave, zero linha de lógica upstream copiada. A entrada está no ledger de [`swizzle.md`](swizzle.md) com a coluna *por que o degrau acima não alcançou*.

**O lockup é atômico:** glifo e palavra dentro do MESMO link. Marca partida em dois nós é marca em que metade não clica.

Duas consequências de implementação, e as duas são medidas:

- o upstream continua renderizando um `.navbar__brand` **vazio**, porque a marca não passa pela config. Um link sem nome acessível é defeito; ele é escondido por `:empty`, o que o tira do fluxo e da ordem de tabulação, no navbar e no painel estreito;
- no painel de tela estreita os itens da esquerda viram lista de menu, e a marca vira a primeira entrada dela. O cabeçalho do painel não é alcançável sem swizzle; uma entrada de lista é alcançável por Tab, que é o que importa.

**`--sd-accent` é o único token que a marca consome.**

---

## 4. Orçamento — três papéis, um registro, um teto

**O papel é uma tag na entrada, não uma pilha separada de desenhos.** É esta regra que faz a aritmética fechar, e ela não é economia: duplicar um desenho porque ele serve a dois papéis seria criar duas versões do mesmo arquivo.

| Papel | tags | arquivos |
| --- | ---: | ---: |
| Sistema — o componente escolhe, o autor nunca | 19 | 19 |
| Navegação — um por seção de topo de sidebar | 12 | **9** |
| Autoria — o vocabulário escrito como string | 37 | 36 |
| **Total** | **68** | **64** |

As **quatro** entradas que carregam duas tags — `package`, `users`, `webhook` e `book-open` — são o que separa 68 de 64. As três primeiras moram na lista de autoria; `book-open` carrega o par na direção contrária e mora na de navegação.

> **A tag de autoria deixou de significar *"o MDX do autor"* e passou a significar *"o nome escrito como string"*.** A landing escreve `<Card icon="book-open">`, que é a **mesma superfície** de autoria do MDX — mesmo componente, mesma prop, mesma falha alta se o nome não existir. Dizer *MDX* era descrever o único consumidor que existia, não a regra; a regra é a superfície.

**O teto é 64. Teto, não meta — e ele foi alcançado.** O slot que sobrava foi para **`wrench`**, e a folga agora é **zero**. Isso muda o que o teto cobra: o 65º ícone deixou de ser *revisão de design* e virou **troca** — ou entra no lugar de outro, ou não entra.

A razão de haver teto: conjunto que cresce sob demanda vira dívida. Ninguém audita trezentos ícones em busca de coerência de família, mas 64 cabem numa tela e a incoerência salta aos olhos.

**A aritmética é conferida por máquina**, não por leitura: o vendorizador reprova nome repetido no manifesto e estouro do teto, antes de baixar qualquer coisa.

### 4.1 `circle-check` não está no manifesto

Ela estava, atribuída a uma variante de callout que o inventário de componentes **matou**, por ser pixel a pixel idêntica a outra na medição. Ficou sem consumidor — o mesmo defeito que a arquitetura de tokens nomeou no Infima como *variável sem consumidor*.

Ela saiu, e `train-track` tomou o lugar dela na lista de sistema, que continua com 19.

**Condição de reabertura, registrada:** se um estado de sucesso precisar de glifo que não seja o `check` nu — a resposta de sucesso no painel da Referência da API é o candidato —, `circle-check` volta pelo slot livre, sem mexer em mais nada.

### 4.2 Os 19 ícones do `theme-classic` são passivo, não vantagem

O tema entrega 14 de chrome e 5 de admonition, e **eles são de outra família**. Ao lado dos nossos, a diferença de traço aparece. Eles **substituem**, não complementam — trabalho que nenhuma estimativa anterior contava.

O que é alcançável e o que não é sai da regra da política, sem enumerar caso a caso: **o que só é alcançável por `unsafe` não é trocado.** Os de admonition e cinco dos de chrome são `safe` nas duas ações; `Icon/ExternalLink` não está no `getSwizzleConfig` e vem de sprite, então ele fica com o desenho do Docusaurus — no rodapé ele é escondido, e no resto do site ele continua de pé.

**O que o slice do catálogo fez com isso, e é menos do que esta seção previa.** Os cinco de admonition **nunca precisaram ser trocados**: o callout ganhou DOM próprio pelo registro de `Admonition/Types`, e ele desenha os glifos do manifesto direto. Um `--eject` pré-autorizado que se resolve num registro é a escada funcionando.

Os cinco de chrome (`Icon/Arrow`, `Icon/DarkMode`, `Icon/LightMode`, `Icon/Edit`, `Icon/Menu`) **continuam com o desenho do Docusaurus.** Eles são chrome, não catálogo, e trocá-los é `--eject` de cinco arquivos por estética de glifo — conta que o slice do catálogo não abriu, porque a superfície de swizzle dele fechou em duas linhas de degrau 3. A pré-autorização segue de pé em [`swizzle.md`](swizzle.md), sem dono.

---

## 5. O manifesto

O manifesto vive em `src/icons/manifest.js`, e ele **é o contrato**:

```
static/icons/*.svg     ← 64 desenhos.  TROCÁVEL — é skin, axioma 3
src/icons/manifest.js  ← 64 nomes + papéis.  CONTRATO. Não troca.
```

Os nomes são **semânticos** (`rocket`, `database`, `shield-check`), nunca de marca. O corporativo com iconografia própria **substitui os arquivos e mantém os nomes**: nenhum componente e nenhum MDX é reescrito. Isso torna a troca de iconografia uma operação do mesmo tipo que a troca de paleta — mexer na skin, não no sistema.

### Sistema · 19

`info` · `lightbulb` · `triangle-alert` · `pencil-line` · `train-track` · `chevron-right` · `check` · `copy` · `wrap-text` · `external-link` · `search` · `x` · `menu` · `sun` · `moon` · `monitor` · `languages` · `link` · `arrow-right`

O ponto de consumo de cada um está na entrada do manifesto. `chevron-right` é **um desenho, dois estados** — caret de accordion e de categoria de sidebar, rotacionado por CSS quando aberto.

### Navegação · 12 tags sobre 9 arquivos

Os doze pares seção→ícone, **verbatim**:

| Documentação | ícone | Referência da API | ícone |
| --- | --- | --- | --- |
| Comece aqui | `rocket` | Introdução | `code-xml` |
| Conceitos | `shapes` | Cobranças | `receipt` |
| Meios de pagamento | `wallet` | Clientes | `users` * |
| Guias | `book-open` | Assinaturas | `repeat` |
| SDKs | `package` * | Reembolsos | `undo-2` |
| Operação | `activity` | Webhooks | `webhook` * |

\* reusa entrada de autoria e não consome arquivo.

**`Receitas` não recebe ícone** — sidebar plana, sem categoria, logo sem slot. **As três tabs de navbar também não**: a regra é *um slot por seção de topo da **sidebar***, e o navbar já carrega tabs, busca, locale e GitHub sem folga para enfeite.

#### As três portas da landing têm ícone, e não são navegação

A tab no navbar continua sem glifo. **O cartão de porta da landing tem**, e a distinção é de superfície, não de inconsistência: a porta é um `<Card icon="…">`, escrito como string, contado na tag de **autoria**. A tag de navegação é 1:1 com os doze pares seção→ícone, e o vendorizador cobra essa igualdade — abrir a lista de navegação para a landing quebraria o único lugar onde a aritmética de ícone é conferida por máquina.

As portas eram declaradas *"sem ícone, e é ritmo, não esquecimento"*. Elas ganham glifo por decisão, sob uma regra:

> **A porta não pode repetir o glifo de nenhuma das categorias que ela abre.**

Sem ela, o cartão e um quarto da aba leem a mesma hierarquia, e o leitor não sabe se o glifo nomeia o eixo ou uma seção dentro dele.

| Porta | Glifo | Origem |
| --- | --- | --- |
| Jornadas | `book-open` | reuso, retagueado |
| Procedimentos | `terminal` | reuso, retagueado |
| Ferramentas | **`wrench`** | **o único desenho novo** |

> **A regra vale contra a árvore que a landing promete, e hoje ela está violada —
> por um ticket.** `book-open` é, neste commit, o glifo de `Documentação › Guias`,
> que é uma categoria dentro da tab que a porta `Jornadas` abre. A colisão é real
> e é temporária: a árvore do `panlabs` chega no ticket seguinte, e nos **onze
> pares** dela `book-open` não é o glifo de categoria nenhuma. Fica dita aqui pelo
> mesmo motivo que as contagens das portas ficam ditas em
> [`landing.md`](landing.md) §2 — é consequência da ordem escolhida, e ordem
> escolhida não vira surpresa.

**`wrench` é o único ponto de todo o esforço em que o teto compra alguma coisa.** Na porta `Ferramentas`, todo glifo adequado do acervo — `package`, `puzzle`, `bot`, `server` — já é uma das quatro famílias que aquela aba abre, e a regra acima os elimina um a um. Não havia reuso disponível; havia o slot livre.

**O registro é sóbrio, não ilustrativo.** O ícone marca posição; não narra a seção. É o registro que combina com um sistema onde tudo é imóvel e a assinatura mora no ritmo da página, não no enfeite.

Três pares merecem o motivo escrito:

- **`wallet` e não `credit-card`** para `Meios de pagamento`: cartão nomeia só um dos meios, e num produto de pagamentos brasileiro Pix e boleto pesam mais. A carteira é o continente, não um dos conteúdos;
- **`receipt` e não um cifrão** para `Cobranças`: todo glifo de cifrão do Lucide desenha `$`, o que estaria errado num produto que cobra em real. `receipt` é o artefato, e é neutro de moeda;
- **`package` para SDKs**: SDK é pacote que se instala. É a metáfora mais apertada disponível, e custa zero arquivo.

**As duas abas são duas barras laterais, vistas uma de cada vez.** Os doze nunca competem numa lista só; competem em duas listas de seis. A coerência é exigida **dentro** de cada aba, e o que segura as duas juntas é a família.

### Autoria · 37 tags sobre 36 arquivos

**Ações (8):** `play` · `download` · `upload` · `refresh-cw` · `send` · `trash-2` · `plus` · `filter`

**Objetos (15):** `file-text` · `folder` · `terminal` · **`wrench`** · `database` · `server` · `cloud` · `key` · `lock` · `mail` · `calendar` · `credit-card` · `users` · `globe` · `package`

**Mais `book-open`**, que mora na lista de navegação e carrega a segunda tag aqui.

> **`credit-card` ficou sem consumidor**, e fica. O único uso medido dele era a grade de cinco cartões da landing, que morreu com as quatro seções. O corte é do ticket da árvore — é lá que o manifesto é reescrito inteiro, e adiantar metade de uma decisão que lá é uma só custaria mais do que a linha que ele ocupa aqui.

**Estados e sinais (7):** `zap` · `clock` · `circle-alert` · `circle-help` · `sparkles` · `trending-up` · `gauge`

**Conceitos (6):** `layers` · `workflow` · `puzzle` · `bot` · `webhook` · `bell`

---

## 6. Superfície de autoria — string, e falha alto

```mdx
<Card title="Início rápido" icon="rocket" href="/docs/comece-aqui/visao-geral">
  Suba a API em cinco minutos.
</Card>
```

**Nome desconhecido lança, e o `throw` é falha de build.** Isso sai de graça: o Docusaurus prerenderiza toda página, então não há infraestrutura a montar. Em desenvolvimento vira overlay de erro do React, que é o retorno certo ali.

```
Ícone "rockett" não existe.
Você quis dizer "rocket"?
64 ícones disponíveis em src/icons/manifest.js.
```

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

**Nota de implementação medida, e ela custou um build:** `require.context` **não** funciona com SVGR. A regra do plugin casa por *issuer*, e num contexto o issuer de cada arquivo é o módulo de contexto — um diretório —, então a regra não casa e o SVG cai na regra de asset. O que volta é uma **data URI**, não um componente, e o sintoma é `Invalid tag: data:image/svg+xml;base64,…` no prerender. Por isso são 64 `import` à mão, e por isso a bijeção é conferida em vez de derivada.

---

## 7. Cor — onde mora o efeito visual

| Superfície | Cor |
| --- | --- |
| Ícone de `Card` | **cor de marca** — não cinza. A medição chama isto de *"o detalhe que mais define a aparência do card"* |
| Ícone de sidebar | `currentColor` — herda ativo, hover e modo **de graça** |
| Ícone de `Callout` | a cor da variante |
| A marca | `--sd-accent` |
| Ícones de sistema | a rampa de cinzas tingida com o matiz da marca |

---

## 8. Onde é obrigatório, opcional e proibido

| Superfície | Regra |
| --- | --- |
| **Sidebar** | **obrigatório** na categoria de topo, **ausente** na folha. Ícone em toda folha vira ruído e destrói a hierarquia que o ícone de seção constrói |
| **`Card`** | opcional, mas ícone **XOR** imagem — nunca os dois |
| **`Callout` tipado** | **fixo por variante; o autor não sobrescreve.** Os tipados da âncora não aceitam prop nenhuma |
| **`Steps`** | opcional; o default é o número do passo. Ícone **substitui** o número, não o acompanha |
| **Pílula de verbo HTTP** | **sem ícone.** O verbo já é o significado; ícone ali compete com o texto |
| **`Tab`** | opcional — uso medido baixo |
| **`Accordion`** | ícone opcional; o **caret é sistema**, não opcional |
| **Tab de navbar** | **sem ícone** |
| **Footer** | **sem ícone** — consome zero slots |

A regra da sidebar é a que sustenta o teto de profundidade da árvore: num terceiro nível o nó do meio não é nem topo nem folha, e **a regra não tem leitura**. Ver [`informacao.md`](informacao.md).

---

## 9. Custo de bundle, aceito conscientemente

Registro estático coloca os 64 no bundle principal. É o preço de `icon="rocket"` funcionar sem import dinâmico, e é barato — dezenas de kilobytes crus, poucos gzipados.

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
| A marca por registro de navbar | **origem própria (implementação)** | `Logo` e `Navbar/Logo` são `unsafe`, e o schema de logo exige arquivo de imagem |
| A marca é `train-track` | origem própria | [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) §3, respondendo ao pedido da [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| O papel é tag na entrada | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §4 |
| 68 tags sobre 64 arquivos, folga zero | **origem própria (correção)** | [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) §1 — só a aritmética é nova; a regra já estava escrita |
| A tag de autoria é *nome escrito como string*, não *MDX* | **origem própria (correção)** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — a landing usa `<Card icon="…">`, a mesma superfície; a redação antiga descrevia o único consumidor, não a regra |
| Ícone nas três portas da landing, sob a regra de não repetir glifo de categoria | **origem própria** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — nada medido; a regra existe para o cartão não ler como a aba |
| `wrench` como o único desenho novo | **origem própria (implementação)** | descoberto aplicando a regra da porta: em `Ferramentas` todo reuso adequado já é uma das quatro famílias que a aba abre |
| `circle-check` fora | **delta deliberado** | consequência da variante morta na [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15), pela regra de *sem consumidor* |
| `rocket`, `book-open`, `activity`, `code-xml` | origem própria | lista-exemplo da [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21), que se declarou não travada |
| Os outros oito pares | origem própria | [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) §2 |
| **O registro sóbrio em vez do ilustrativo** | **lacuna de medição** | a pesquisa mediu *que* as referências têm ícone de sidebar e que é a assinatura mais reconhecível do alvo — **nunca mediu quais glifos, nem em que registro**. Reabre se alguém medir |
| Nome inexistente quebra o build | origem própria | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §6 |
| Regra de cor por superfície | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) e [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) |
| Obrigatório no topo, ausente na folha | herdado | [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) §8 |
| A versão do Lucide é fixada e conferida no ato de copiar | herdado | [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) §2, nota final |
| O nome do manifesto não se move por renomeação de terceiro | **origem própria (implementação)** | três dos 63 nomes já não existiam na versão fixada; o campo de nome upstream resolve numa linha |
| `require.context` não funciona com SVGR | **origem própria (medição)** | a regra do plugin casa por *issuer*, e o issuer de um contexto é um diretório |
| GitHub como palavra, não como glifo | origem própria | consequência do teto: não há marca de terceiro no manifesto, e o slot livre não tem nome cravado |
| Os cinco ícones de admonition não são trocados por `--eject` | **origem própria (implementação)** | o callout tem DOM próprio pelo registro de `Admonition/Types` ([#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15)); o degrau 5 se resolveu no 3 |
