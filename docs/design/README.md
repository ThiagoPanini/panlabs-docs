# A spec de design

> **Descreve fielmente o site no ar, e deixa de ser a verdade da decisão a partir de agora.** O [mapa do `mint`](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49) já travou decisões que desmancham parte dela — a página de doc perde o cartão, e o Trilho dá lugar a um acervo pessoal de aprendizado. Por decisão do mapa, `docs/design/` e `docs/adr/` só são reescritos na fase de implementação, slice a slice. Este aviso é de uma linha de propósito: a invariante 2 exige a declaração de literais nas 20 primeiras linhas, e o preâmbulo não tem folga.

A espinha. Ela é escrita **por último** porque indexa o que existe — um índice redigido antes dos documentos indexa a intenção, e a intenção é a coisa que envelhece calada.

**Isto é o entregável.** O axioma 6 diz: *um agente que só tem a spec — sem a conversa, sem as referências — constrói o site e o resultado é reconhecivelmente o que foi decidido.* Tudo neste diretório existe para satisfazer essa frase, e o **§6** é onde ela foi cobrada de verdade — com o protocolo, o resultado, e os quatro erros de fato que ele encontrou.

---

## 1. A régua

> **Tudo é obrigatório, salvo bloco `Livre`.**

Não há "sugestão", não há "considere", não há faixa aceitável não declarada. Um valor escrito na spec é o valor a implementar; quando existe latitude, ela vem num bloco marcado `Livre` que **nomeia o dono** — quem pode mexer e dentro de qual restrição.

O que isso compra: quem implementa não precisa julgar. Uma régua de julgamento só funciona com o dono do projeto presente, que é exatamente o que a spec existe para dispensar.

**Corolário de forma:** nenhum documento além de [`tokens.md`](tokens.md) carrega valor numérico de desenho. Cor, comprimento, tempo e curva moram lá e se citam **por nome de token** em toda parte, inclusive em comentário de CSS. Os números que aparecem nos outros documentos são identificadores — ADR, issue, portão — ou resultado de verificação.

**Todo documento fecha com uma tabela `## Procedência`**, e toda linha dela carrega uma das cinco classes. Sem o carimbo, valor medido e valor inventado ficam graficamente idênticos na página, e o axioma 5 fica infiscalizável. As cinco classes estão definidas num lugar só: [`principios.md`](principios.md) §5.

---

## 2. Ordem de leitura

### 2.1 Antes de escrever qualquer código

Os **sete ADRs**, em [`../adr/`](../adr/), nesta ordem. Eles não são leitura de referência: são restrição sobre o que se pode construir depois, e um agente que descobre a política de swizzle no quinto slice já gastou degraus que não podia.

| # | ADR | Por que ele vem antes |
| ---: | --- | --- |
| 1 | [Doutrina de CSS](../adr/0001-doutrina-de-css.md) | quem escreve CSS sem ele produz modo escuro que quebra em silêncio |
| 2 | [Política de swizzle](../adr/0002-politica-de-swizzle.md) | a escada de seis degraus e o orçamento `unsafe` zero |
| 3 | [Reduced-motion na camada de token](../adr/0003-reduced-motion-na-camada-de-token.md) | movimento novo entra no vocabulário antes de ter consumidor |
| 4 | [Contrato de estado de entrada](../adr/0004-contrato-de-estado-de-entrada.md) | foco, press e piso de alvo são um mecanismo só |
| 5 | [A Referência da API é gerada de contrato](../adr/0005-referencia-da-api-gerada-de-contrato.md) | quem edita a página gerada edita a saída em vez da fonte |
| 6 | [A busca é índice local, sem serviço externo](../adr/0006-busca-local-sem-servico-externo.md) | é o único que descreve uma superfície **removível** |
| 7 | [`trailingSlash: false`](../adr/0007-trailingslash-false.md) | seis coisas derivam a URL dele; descobrir tarde custa caro |

### 2.2 Depois, a spec

1. [`principios.md`](principios.md) — **a âncora, os quatro deltas, as cinco classes de procedência.** Ele diz de onde os valores vêm e o que pode ser contestado. Sem ele, o resto parece arbitrário.
2. [`tokens.md`](tokens.md) — **a sede única de valor.** Quem lê só um documento, lê este.
3. [`informacao.md`](informacao.md) — a árvore, os tipos de página, as fixtures, o locale, os artefatos AI-era.
4. [`chrome.md`](chrome.md) — o shell da página de doc.
5. Os transversais, em qualquer ordem: [`foco.md`](foco.md), [`motion.md`](motion.md), [`icones.md`](icones.md), [`swizzle.md`](swizzle.md).
6. [`componentes/`](componentes/) — o catálogo fechado de dezoito.
7. As duas rupturas de layout: [`api-reference.md`](api-reference.md) e [`landing.md`](landing.md).
8. [`busca.md`](busca.md) — a única superfície de interação que o projeto autora.

---

## 3. O índice — uma linha por documento

**Trinta e um arquivos.**

> *Correção de contagem, registrada:* a resolução do slice 7 dizia *"trinta arquivos"*. São trinta e um, e o trigésimo primeiro é [`busca.md`](busca.md). Ele ganhou arquivo próprio em vez de virar seção de [`chrome.md`](chrome.md) por um motivo estrutural, não por tamanho: `chrome.md` abre dizendo que **chrome não se autora, se entorta**, e que tudo nele é degrau 0 ou 1 da escada. A busca é degrau 5, com JS autorado e ARIA descrita em prosa — ela **contradiz a premissa do documento** que a hospedaria. Enfiá-la lá teria custado a frase de abertura de `chrome.md`, que é uma das mais úteis da spec.

### 3.1 Os transversais e as superfícies

| Documento | O que ele decide |
| --- | --- |
| [`principios.md`](principios.md) | a âncora Mintlify, o que se herda calado, os quatro deltas deliberados, a régua de coerência e as cinco classes de procedência |
| [`tokens.md`](tokens.md) | as três camadas, a superfície de troca, a rampa, a tipografia, o espaço, a elevação, o adaptador do Infima e as suas quatro exceções |
| [`informacao.md`](informacao.md) | o produto fictício, as três tabs, a árvore, os nove tipos de página, os orçamentos, as treze fixtures, a regra de locale e os artefatos AI-era |
| [`chrome.md`](chrome.md) | a cadeia de proporções, navbar, sidebar, TOC, breadcrumb, paginação, footer e o comportamento no estreito |
| [`foco.md`](foco.md) | `:focus-visible` universal, `:active`, o piso de alvo no toque, e o portão que impede `outline: none` |
| [`motion.md`](motion.md) | as duas durações, as duas curvas, os seis movimentos nomeados e o reduced-motion resolvido na camada de token |
| [`icones.md`](icones.md) | o manifesto de 64 nomes com teto de 64 e folga zero, os dois renderizadores, a marca e os doze pares seção→ícone |
| [`swizzle.md`](swizzle.md) | o ledger vivo, os três significados de `src/theme/`, as perdas nomeadas e a disciplina de registro |
| [`api-reference.md`](api-reference.md) | a primeira ruptura de layout — o contrato, o gerador e as três colunas |
| [`landing.md`](landing.md) | a segunda ruptura — quatro seções, a faixa de espetáculo de dois focos, as três camadas e a lista fechada de seis |
| [`busca.md`](busca.md) | o índice local, a escada de pontuação, o modal `<dialog>` e o ARIA por citação do APG |

### 3.2 O catálogo — dezenove arquivos

[`componentes/README.md`](componentes/README.md) é o índice e o contrato comum: o gabarito de **nove** seções, o contrato de partes, a regra de `className` proibido, e a razão de o catálogo ser **fechado**.

Os dezoito, com uma linha cada, estão no índice dele. Eles não se repetem aqui — dois índices da mesma lista é o defeito de duplicação que a própria spec nomeia no rodapé de [`chrome.md`](chrome.md).

---

## 4. As cinco invariantes

Quatro são de forma e se cobram por `grep`. A quinta é de conteúdo e é a única que enxerga o que as outras não veem.

| # | Invariante | Como se confere |
| ---: | --- | --- |
| 1 | **Gabarito sem seção vazia** — todo documento de componente tem as nove seções, na ordem, e nenhuma delas é só o título | varredura |
| 2 | **Zero número fora de `tokens.md`** — cor, comprimento, tempo e curva só existem lá | varredura, e o portão 1 no código |
| 3 | **`## Procedência` sem linha órfã** — toda tabela de procedência tem decisão, classe e fonte em toda linha | varredura |
| 4 | **Todo bloco `Livre` nomeia o dono** — latitude sem dono é buraco | varredura |
| 5 | **Completude** — todo item de *"O que este ticket entrega para quem vem depois"* das 27 resoluções tem endereço num arquivo | leitura cruzada |

**A quinta é a que importa mais, e é a mais cara.** As quatro de forma passariam com a tipografia inteiramente ausente: um documento que não existe não tem seção vazia, não tem número solto e não tem procedência órfã. Só a completude enxerga ausência.

`npm run invariantes` roda as quatro primeiras. A quinta é leitura, e o resultado dela está no §4.2.

### 4.1 Duas das quatro precisaram de régua mais fina que o mapa previa

**A invariante 2, escrita ao pé da letra, produziria trinta falsos positivos.** A varredura crua de literal encontra o limiar de media query, a citação de valor de terceiro (os 1024 da âncora, os 1440 do Infima), o resultado de verificação (*"folga de 62,5px"*) e a aritmética de derivação escrita por extenso. Reprovar tudo isso seria portão que reprova o que funciona.

O que a invariante de fato protege é outra coisa: **que nenhum documento vire segunda fonte de valor sem dizer que virou.** Então a régua é — *documento com literal de desenho precisa declarar, no próprio preâmbulo, o que ele admite e por quê.* Documento sem literal passa de graça. Hoje **todos os onze** que têm literal carregam a declaração.

**A invariante 4 separa marcador de menção por code span**, e a separação é do próprio vocabulário do repositório: quando a palavra é citada — *"salvo bloco `Livre`"* — ela vai entre crases, porque ali ela é o nome de uma coisa; quando ela **abre** um bloco, vai em negrito ou em comentário de CSS, sem crase. Tirar os code spans antes de olhar é o que faz a varredura enxergar marcador e ignorar prosa, **sem lista de exceção a manter**.

### 4.2 A quinta invariante, auditada

**Vinte e sete tickets, e cada um tem endereço.** A tabela abaixo é a auditoria: onde a saída de cada resolução do mapa aterrissou.

**Sete deles são de pesquisa, e o endereço deles é diferente** — os [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) a [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8) não carregam a seção *"O que este ticket entrega para quem vem depois"*, porque a convenção é de ticket de **decisão**. O que eles entregam é medição, e ela chega à spec **através** do ticket de decisão que a consumiu.

| Resolução | Onde ela aterrissou |
| --- | --- |
| [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) chrome e IA das referências *(pesquisa)* | [`chrome.md`](chrome.md), [`informacao.md`](informacao.md), via #20 e #16 |
| [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) sistema visual medido *(pesquisa)* | [`tokens.md`](tokens.md), via #11 e #12 |
| [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) inventário de componentes *(pesquisa)* | [`componentes/`](componentes/), via #15 |
| [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) tema, Infima e a fronteira do swizzle *(pesquisa)* | [ADR 2](../adr/0002-politica-de-swizzle.md), [`swizzle.md`](swizzle.md), via #14 |
| [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) API Reference sem sair do vanilla *(pesquisa)* | [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md), [`api-reference.md`](api-reference.md), via #18 |
| [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7) busca, i18n e versionamento *(pesquisa)* | [`busca.md`](busca.md), [`informacao.md`](informacao.md) §5 e §8, via #19 e #16 |
| [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8) recursos AI-era *(pesquisa)* | [`informacao.md`](informacao.md) §9, [ADR 7](../adr/0007-trailingslash-false.md), via #33 |
| [#9](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/9) forma da própria spec | **este arquivo**, mais o gabarito de [`componentes/README.md`](componentes/README.md) |
| [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) âncora e deltas | [`principios.md`](principios.md) §1, §3 e §5 |
| [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) arquitetura de tokens | [`tokens.md`](tokens.md) §1 a §3, [ADR 1](../adr/0001-doutrina-de-css.md) |
| [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) direção de arte | [`tokens.md`](tokens.md) — a rampa, os sete papéis, os oito `--sd-code-*` |
| [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) glow e profundidade no claro | [`tokens.md`](tokens.md) §8, [`landing.md`](landing.md) §6 |
| [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) estratégia de swizzle | [ADR 2](../adr/0002-politica-de-swizzle.md) e [`swizzle.md`](swizzle.md) inteiro |
| [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) inventário de componentes | os dezenove de [`componentes/`](componentes/) |
| [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) IA e o produto fictício | [`informacao.md`](informacao.md) §1 a §8 |
| [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) vocabulário de motion | [`motion.md`](motion.md), [ADR 3](../adr/0003-reduced-motion-na-camada-de-token.md) |
| [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) rota do API Reference | [`api-reference.md`](api-reference.md), [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) |
| [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) rota da busca | [`busca.md`](busca.md), [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) as três escolhas divergentes | [`chrome.md`](chrome.md) §1, e os dois deltas em [`principios.md`](principios.md) §3 |
| [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) orçamento de ícones | [`icones.md`](icones.md) |
| [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) contrato de foco | [`foco.md`](foco.md), [ADR 4](../adr/0004-contrato-de-estado-de-entrada.md) |
| [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) estrutura da landing | [`landing.md`](landing.md) |
| [#27](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/27) anatomia do footer | [`chrome.md`](chrome.md) §6 |
| [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) tela pequena | [`chrome.md`](chrome.md) §7, [`landing.md`](landing.md) §7, [`api-reference.md`](api-reference.md) |
| [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) tipografia e `@property` | [`tokens.md`](tokens.md) §4 e §5 |
| [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) os doze pares seção→ícone | [`icones.md`](icones.md) §3 e §5 |
| [#33](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/33) `trailingSlash` | [ADR 7](../adr/0007-trailingslash-false.md) |

**E os itens de entrega cruzada foram conferidos um a um, não no atacado.** Vinte itens concretos e nomeáveis — `--sd-glow` pronto para a landing, o modal como único consumidor de `--sd-move-enter`, `circle-check` saindo do manifesto, `--sd-shadow-lip` a 0% no claro, `applyTrailingSlash` não importado, a entrelinha que não desce, `Icon/ExternalLink` como `unsafe` de sprite, o teto de um loop por página, a sidebar estreita sem armadilha de foco — **todos os vinte têm endereço**.

**O que esta invariante enxerga e as outras quatro não:** ausência. Um documento que nunca foi escrito passa nas quatro de forma sem uma reclamação.

---

## 5. Os oito portões

Três cadências: **commit**, **upgrade** e **implantação**.

| # | Portão | Cadência | Como roda |
| ---: | --- | --- | --- |
| 1 | Literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | commit | `npm run portao:1` |
| 2 | `transition:`/`animation:` com tempo ou curva cravada | commit | `npm run portao:2` |
| 3 | `outline` fora de `src/css/foco.css` | commit | `npm run portao:3` |
| 4 | Volume, tipo de página, regra de heading e cobertura de locale do conteúdo | commit | `npm run portao:4` |
| 5 | O gerador da Referência da API e o artefato commitado concordam | commit | `npm run portao:5` |
| 6 | As três rotas contra o host real, nos dois locales | **implantação** | `npm run portao:6 -- <url-base> [rota]` |
| 7 | O `swizzle --list` congelado, e `src/theme/` conferido contra ele | **upgrade** | `npm run portao:7` |
| 8 | Os seis efeitos da landing, em contagem exata, mais a metade negativa | commit | `npm run portao:8` |

Mais **quatro** verificações que **não são portão** e rodam junto:

- `node scripts/espelho-tokens.mjs --verificar` — o bloco `css` de `tokens.md` é `src/css/tokens.css` byte a byte;
- `npm run contraste` — as tabelas de contraste de [`tokens.md`](tokens.md) §10 e [`foco.md`](foco.md) §6, computadas do CSS e **comparadas célula a célula** com o que os dois documentos publicam;
- `npm run icones` — a bijeção manifesto ↔ `static/icons/`;
- `npm test` — a régua do algoritmo da busca, em `node --test`. Os portões são varredura, e ordenação de resultado não é varrível.

> **Eram três, e a quarta nasceu de um defeito que a leitura não pegava.** As duas tabelas de contraste mediam o **mesmo par** e discordavam em três das quatro células, e a divergência sobreviveu a uma auditoria inteira — porque conferi-la exigia refazer a conta à mão, e ninguém refaz. Ela entra como verificação e não como portão pela régua desta seção: ela não protege uma regra de escrita, ela confere que duas cópias da mesma verdade não divergiram.
>
> *Dissenso registrado:* é mais uma coisa rodando na CI de todo commit, num projeto que já cobra sete portões e três verificações. Aceito porque o custo é de milissegundos e porque a alternativa — deixar a spec afirmar números que ninguém consegue reproduzir — é o que produziu o defeito.

### 5.1 O oitavo, e o que ele protege que nenhum dos sete protegia

**Ele é irmão do portão 1** — mesma forma de script, mesma remoção de comentário antes da varredura, mesma saída de contagem. E é a régua desta seção que o classifica como portão e não como verificação: **ele protege uma regra de escrita**, e ela cabe numa frase — *a landing pode ter isto, e nada mais*.

*"Impacto sem extravagância"* não sobrevive como adjetivo, porque adjetivo não passa por revisão. Ele vira **seis contagens**:

| # | O que a landing pode ter de único | Contagem |
| ---: | --- | ---: |
| 1 | a faixa escura sangrada | **1** `data-sd-showcase` no site |
| 2 | dois focos de luz | **2** `radial-gradient`, os dois na regra da ilha |
| 3 | um loop ambiente | **1** `infinite` em todo o CSS |
| 4 | um reveal por rolagem | **1** declaração de `animation-timeline` |
| 5 | um degrau de tipo acima do site | **1** consumidor de `--sd-type-6xl` |
| 6 | uma sombra de conteúdo | **1** consumidor de `--sd-shadow-raised` **na landing** |

Mais a metade negativa, na mesma varredura: **zero `@keyframes` novo** (quatro no projeto, e a landing consome três sem definir nenhum), **zero componente novo**, **zero literal** no CSS Module dela, **zero `z-index`**. **Um sétimo item é extravagância por definição.**

**A linha 2 não é contagem cega, e a diferença importa.** Contar dois `radial-gradient` em algum lugar deixaria passar um gradiente idêntico declarado em `:root`, que acenderia o site inteiro. O portão lê o **seletor do bloco** em que cada gradiente cai, e reprova qualquer um fora de `[data-sd-showcase]`.

> **Correção de fato contra a resolução que pediu este portão.** A linha 6 foi escrita como *"1 consumidor de `--sd-shadow-raised`"*, site inteiro. **São dois** — o botão primário da landing e o painel da Referência da API —, e [`tokens.md`](tokens.md) §6 já dizia isso por escrito. A contagem que se sustenta é a da landing, e é a que o portão cobra. A régua não afrouxou: ela passou a dizer o que mede.

> *Dissenso registrado:* é o oitavo portão num projeto que já tinha sete, e ele protege **uma página**. A alternativa — deixar a lista como prosa em [`landing.md`](landing.md) — foi recusada porque uma lista de contagens que ninguém conta é adjetivo com tabela.

> **São sete, e eram seis até o slice 7.** A resolução do slice 7 chamava o portão do `swizzle --list` de *portão 5*; o número já estava gasto pelo portão do gerador da API, citado pelo [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) **pelo número**. Renumerar um portão commitado para satisfazer um número escrito antes de ele existir quebraria a citação. Ele é o 7. Ver [`swizzle.md`](swizzle.md) §5. **Hoje são oito**, e o mesmo argumento vale ao contrário: o 8 é o próximo número livre, e não o número que a lista *pareceria* querer.
>
> Consequência menor, dita para não envelhecer calada: a frase do [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) que chama o portão 5 de *"o único do conjunto que não é `grep`"* passou a ter companhia — o portão 7 é da mesma família, regenera e diffa.

**Onde cada um roda.** Os de commit, mais as quatro verificações, estão em `.github/workflows/ci.yml`. O 6 está em `.github/workflows/deploy.yml`, depois da publicação, porque ele é o único que depende de alguém fora do repositório. O 7 tem cadência de upgrade e roda na CI de todo commit mesmo assim: não existe gatilho barato para *"houve um upgrade"*, e um portão que depende de alguém lembrar de rodá-lo é um portão que não roda.

---

## 6. O axioma 6, exercido

**Rodou.** Deixa de ser promessa nesta linha, e o resultado — inclusive o que ele desmentiu — está no §6.4.

### 6.1 Por que ele não pode ser rodado por quem escreveu a spec

O axioma 6 diz: *um agente que só tem a spec — sem a conversa, sem as referências — constrói o site e o resultado é reconhecivelmente o que foi decidido.*

**A sessão que escreveu a spec é a única que não pode cobrá-la.** Ela tem a conversa inteira, leu as sete pesquisas e escreveu o código; o que ela reconstruísse viria da memória e não do documento, e o teste devolveria um "passou" que não mede nada. Um teste que só o autor pode aplicar não é teste — é a promessa outra vez, com outra roupa.

Por isso ele custa uma **sessão de agente limpa**, e foi assim que rodou: um sandbox com `spec/design/` e `spec/adr/` e nada mais, sem acesso ao repositório.

### 6.2 O protocolo

| | |
| --- | --- |
| **O que o agente recebe** | `docs/design/` e `docs/adr/`, e nada mais |
| **O que ele não recebe** | as issues, os branches `research/*`, o `conteudo/`, e qualquer arquivo de `src/` |
| **O que ele constrói** | um Docusaurus vazio, e sobre ele a **camada de tokens inteira** mais **a página de documentação** — chrome, sidebar, TOC, footer — em pt-BR |
| **Quanto tempo** | uma sessão; se não couber, o recorte é a camada de tokens sozinha |

O recorte não é economia: `tokens.css` mais o chrome é o menor pedaço que atravessa **os três** — a sede única de valor, o adaptador do Infima e a escada de swizzle. Quem reconstrói isso lendo o documento provou o que interessa; quem tropeça mostra exatamente onde.

### 6.3 Como se julga

O critério é **reconhecível**, não idêntico. Três perguntas, e a terceira é a que vale:

1. os **portões 1, 2 e 3** passam sobre o que o agente escreveu?
2. o resultado é reconhecivelmente a mesma skin — a mesma rampa, a mesma cadeia de proporções, o mesmo contrato de foco?
3. **onde ele precisou reinterpretar?** Toda vez que o agente escolheu por conta própria, a spec tem um buraco — e o endereço do buraco é o produto deste teste.

A terceira é a única que gera trabalho. As duas primeiras dizem *passou* ou *não passou*; a terceira devolve a lista de linhas a escrever.

### 6.4 O resultado

| | |
| --- | --- |
| **Commit da spec** | `fa5eec4` |
| **URL pública no ar naquele commit** | <https://panlabs-tech.github.io/shinydoc-docusaurus/> |
| **Recorte** | o do §6.2, inteiro — camada de tokens **e** página de documentação, em pt-BR |
| **O que o agente recebeu** | `docs/design/` e `docs/adr/`. Nada mais |

**O build passou nos dois locales, sem link quebrado**, com as sete dependências de produção e as duas de desenvolvimento que o `create-docusaurus classic` escreve — o segundo dos cinco zeros se sustentou sem ser dito. Os portões 2 e 3 passaram sobre o que ele escreveu.

#### O veredito, em três linhas

- **camada de tokens: sim, sem ressalva.** Zero decisões — ver §6.5;
- **chrome estrutural: sim, com ressalvas nomeáveis** — a cadeia de proporções, o cartão, a medida de prosa, a hierarquia de sidebar e o footer saíram do documento;
- **acabamento: não.** Onze valores foram chute, e dois deles mudam a tela de forma imediatamente visível.

#### O padrão, que é o achado de verdade

**A spec é impecável onde descreve mecanismo de upstream e derivação declarada, e é muda onde precisa de um valor de acabamento que ninguém mediu.** Isso é o axioma 5 funcionando e cobrando o preço dele.

A saída **não é medir mais**. É que valor não medido também precisa de endereço — nem que seja um bloco `Livre` com dono e um default cravado. Hoje esses onze valores não são `Livre` nem obrigatórios: são a **terceira categoria que a régua do §1 diz não existir** — silêncio.

#### As reinterpretações que mais custam

| # | O que a spec não respondeu | Onde | Consequência |
| ---: | --- | --- | --- |
| 1 | O mapeamento *token type* do Prism → os sete papéis `--sd-code-*` | `tokens.md` §7 | **decide a cor de metade dos caracteres de todo bloco de código.** Duas implementações razoáveis não se parecem |
| 2 | Qual degrau de elevação o cartão de doc usa | `chrome.md` §1.3 | os quatro degraus embutem o anel, então a frase não desambigua. `-1` contra `-2` é 1px contra 6px de projeção |
| 3 | A folga entre cartão e TOC | `chrome.md` §1.2c | *"a folga que se quer"* não nomeia token; move a largura útil do TOC em até 16px |
| 4 | A lista de elementos de prosa | `chrome.md` §1.4 | a lista de quem **escapa** está deliberadamente não escrita; a de quem **fica**, que é a que se implementa, também não estava |
| 5 | Onde moram `chrome.css` e `custom.css`, e como as folhas entram no build | — | os dois só apareciam por *basename*, dentro de comentários |

#### Quatro erros de fato, e os três primeiros já corrigidos

| Erro | Estado |
| --- | --- |
| [`icones.md`](icones.md) mandava procurar tamanho de ícone em [`tokens.md`](tokens.md), **e não há token de tamanho de ícone lá** | corrigido — a regra é a escala de espaço, e agora está escrita |
| [`tokens.md`](tokens.md) §11 dizia que o portão 1 passa *"enquanto o único limiar morar no arquivo de tokens"*; o limiar mora também em `chrome.css` e **o portão tem uma segunda perna** que a frase não mencionava | corrigido — a descrição subestimava o portão |
| [`tokens.md`](tokens.md) §8 mandava aplicar `text-wrap: balance` em *"título e **lead**"*, e **`lead` não é definido em nenhum dos trinta e um documentos** | corrigido — termo sem definição |
| As tabelas de contraste de [`tokens.md`](tokens.md) §10 e [`foco.md`](foco.md) §6 **discordam** para o mesmo par em três das quatro células | **aberto** — adivinhar qual está certa seria inventar um número medido. Ver [`foco.md`](foco.md) §6 |

#### A que passou por engano, e vale registrada

O tamanho do ícone de sidebar o agente marcou como **chute** — e acertou o valor exato, `--sd-space-4` com `--sd-space-2` de afastamento. Ele raciocinou até a resposta certa **porque a spec o obrigou a apostar**, não porque ela respondeu. Um acerto obtido assim conta como buraco, não como cobertura: a próxima aposta cai do outro lado.

### 6.5 O que a spec acertou, e por que isso também é resultado

O **bloco espelhado de [`tokens.md`](tokens.md) §3 é o arquivo, não uma descrição dele.** A camada de tokens inteira foi reconstruída com **zero decisões**, e o espelho confere byte a byte.

Vale dito em voz alta que isso torna metade do recorte uma **cópia**, e não uma reconstrução — o teste do §6.2 é forte no chrome e fraco nos tokens, por construção. O que ele mede de verdade é a prosa.

Idem, sem uma decisão: o adaptador do Infima com o porquê de cada exclusão, as três declarações que fecham a cadeia de proporções, a declaração única do footer, as três exceções de foco e as duas formas do seletor de sidebar.

---

## 7. Os cinco zeros

Não são metas: são propriedades que o repositório mantém, e cada uma é conferível por varredura em vez de afirmada.

| Zero | Como se confere | Resultado de hoje |
| --- | --- | --- |
| **Zero swizzle `unsafe`** | portão 7, perna 2 — todo arquivo de `src/theme/` casa com um componente `Safe` do `swizzle --list` | 220 componentes no artefato, 10 arquivos com endereço |
| **Zero dependência npm nova** | a lista de `package.json` é exatamente a que o `create-docusaurus classic` escreve | 7 de produção, 2 de desenvolvimento |
| **Zero serviço externo** | nada em `src/` chama a rede, e nada no HTML publicado carrega recurso de outra origem | zero e zero |
| **Zero JS de interação no catálogo** | o *substrato nativo* de [`../agents/domain.md`](../agents/domain.md) | 13 arquivos, zero handler e zero estado |
| **Um único autor de modelo de interação no projeto inteiro** | escuta de DOM e tecla | um: `src/theme/SearchBar/index.js` |

`npm run zeros` roda os cinco. A varredura **remove comentário antes de olhar**, pelo mesmo motivo dos portões 1, 2 e 3: ela cobra código, não prosa — e o comentário de `Accordion.js` que explica *"um `<div onClick>` seria pixel a pixel idêntico"* é a documentação do zero que ele reprovaria.

### 7.1 O quinto zero precisou de precisão, e a imprecisão era real

A resolução do slice 7 escreveu *"um único JS de interação no projeto inteiro"*. **Varrido ao pé da letra, isso é falso**, e a varredura o mostrou: além do `SearchBar`, dois arquivos casam com uma régua ampla de comportamento —

- **`src/theme/ApiDocItem/Painel.js`**, que guarda estado e ouve `onChange`. É o *"único degrau de interatividade confinado a um painel"* que [`api-reference.md`](api-reference.md) §1 declara desde o slice 5;
- **`src/theme/NavbarItem/Marca.js`**, que **repassa** o `onClick` que o painel de tela estreita lhe entrega — ele não autora handler nenhum.

A régua correta não é *"tem `useState`?"*, e o vocabulário de domínio já a tinha escrito: **zero `keydown` escrito no projeto**. O que obriga a spec a descrever tecla, foco, anúncio de leitor de tela e ARIA em prosa — que é o custo que o axioma 6 cobra — é **autorar modelo de interação**. Um campo controlado não obriga nada disso: quem trata digitação, foco e cursor é o navegador, e o React só espelha o valor.

Por isso o zero é **escuta de DOM e tecla**, e por isso o resultado da varredura **imprime as duas outras superfícies em vez de escondê-las**. Uma afirmação limpa que esconde um fato é pior que uma afirmação com nota de rodapé.
