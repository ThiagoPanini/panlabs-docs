# A spec de design

> **Volta a descrever o site no ar, e volta a ser a verdade da decisão.** O [mapa do `mint`](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49) desmanchou a spec anterior — o cartão morreu, e o Trilho deu lugar ao acervo pessoal `panlabs` —, e a reescrita fechou slice a slice, cada superfície com o seu documento na mesma sentada. O aviso que ficava aqui dizia que a spec havia deixado de mandar; ele saiu porque deixou de ser verdade. Este preâmbulo é curto de propósito: a invariante 2 exige a declaração de literais nas 20 primeiras linhas, e ele não tem folga.

A espinha. Ela é escrita **por último** porque indexa o que existe — um índice redigido antes dos documentos indexa a intenção, e a intenção é a coisa que envelhece calada.

**Isto é o entregável.** O axioma 6 diz: *um agente que só tem a spec — sem a conversa, sem as referências — constrói o site e o resultado é reconhecivelmente o que foi decidido.* Tudo neste diretório existe para satisfazer essa frase, e o **§6** é onde ela foi cobrada de verdade — **duas vezes**, com o protocolo, os dois resultados lado a lado, e a lista de onde a spec precisou ser reinterpretada em cada um.

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

Os **oito ADRs**, em [`../adr/`](../adr/), nesta ordem. Eles não são leitura de referência: são restrição sobre o que se pode construir depois, e um agente que descobre a política de swizzle no quinto slice já gastou degraus que não podia.

**O 5 lê-se pelo 8.** Ele foi **superado**, e continua na lista porque a imutabilidade dos ADRs é o que preserva o registro de *"decidimos OpenAPI uma vez, e por quê"*. O que decide hoje é o 8.

| # | ADR | Por que ele vem antes |
| ---: | --- | --- |
| 1 | [Doutrina de CSS](../adr/0001-doutrina-de-css.md) | quem escreve CSS sem ele produz modo escuro que quebra em silêncio |
| 2 | [Política de swizzle](../adr/0002-politica-de-swizzle.md) | a escada de seis degraus e o orçamento `unsafe` zero |
| 3 | [Reduced-motion na camada de token](../adr/0003-reduced-motion-na-camada-de-token.md) | movimento novo entra no vocabulário antes de ter consumidor |
| 4 | [Contrato de estado de entrada](../adr/0004-contrato-de-estado-de-entrada.md) | foco, press e piso de alvo são um mecanismo só |
| 5 | [A Referência da API é gerada de contrato OpenAPI](../adr/0005-referencia-da-api-gerada-de-contrato.md) | **superado pelo 8** — fica pelo registro de por que OpenAPI foi escolhido uma vez |
| 6 | [A busca é índice local, sem serviço externo](../adr/0006-busca-local-sem-servico-externo.md) | é o único que descreve uma superfície **removível** |
| 7 | [`trailingSlash: false`](../adr/0007-trailingslash-false.md) | seis coisas derivam a URL dele; descobrir tarde custa caro |
| 8 | [A referência de biblioteca é gerada de contrato de assinatura](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) | quem edita a página gerada edita a saída em vez da fonte |

### 2.2 Depois, a spec

1. [`principios.md`](principios.md) — **a âncora, o carimbo de delta vazio, as cinco classes de procedência.** Ele diz de onde os valores vêm e o que pode ser contestado. Sem ele, o resto parece arbitrário.
2. [`tokens.md`](tokens.md) — **a sede única de valor.** Quem lê só um documento, lê este.
3. [`informacao.md`](informacao.md) — a árvore, os tipos de página, as fixtures, o locale, os artefatos AI-era.
4. [`chrome.md`](chrome.md) — o shell da página de doc.
5. Os transversais, em qualquer ordem: [`foco.md`](foco.md), [`motion.md`](motion.md), [`icones.md`](icones.md), [`swizzle.md`](swizzle.md).
6. [`componentes/`](componentes/) — o catálogo fechado de dezessete.
7. [`referencia.md`](referencia.md) — a ruptura de layout do site. **Era uma das duas**; a outra era a landing, e ela saiu.
8. [`busca.md`](busca.md) — a única superfície de interação que o projeto autora.

---

## 3. O índice — uma linha por documento

**Vinte e nove arquivos.**

> *Correção de contagem, registrada três vezes.* A resolução do slice 7 dizia *"trinta arquivos"*; eram trinta e um, e o trigésimo primeiro é [`busca.md`](busca.md). **Voltaram a ser trinta** quando `componentes/verb-badge.md` saiu com o catálogo. **São vinte e nove** desde que `landing.md` saiu com a página que ele especificava ([#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94)) — onze na raiz e dezoito no catálogo, contados e não redigitados. E nenhuma das correções desfaz a anterior: o motivo de `busca.md` ter arquivo próprio continua de pé. Ele ganhou arquivo próprio em vez de virar seção de [`chrome.md`](chrome.md) por um motivo estrutural, não por tamanho: `chrome.md` abre dizendo que **chrome não se autora, se entorta**, e que tudo nele é degrau 0 ou 1 da escada. A busca é degrau 5, com JS autorado e ARIA descrita em prosa — ela **contradiz a premissa do documento** que a hospedaria. Enfiá-la lá teria custado a frase de abertura de `chrome.md`, que é uma das mais úteis da spec.

### 3.1 Os transversais e as superfícies

| Documento | O que ele decide |
| --- | --- |
| [`principios.md`](principios.md) | a âncora Mintlify, o que se herda calado, a varredura que esvaziou o carimbo de delta, a régua de coerência e as cinco classes de procedência |
| [`tokens.md`](tokens.md) | as três camadas, a superfície de troca, a rampa, a tipografia, o espaço, a elevação, o adaptador do Infima e as suas quatro exceções |
| [`informacao.md`](informacao.md) | o acervo, as três tabs, a árvore, os dez tipos de página, os orçamentos, as onze fixtures, a regra de locale e os artefatos AI-era |
| [`chrome.md`](chrome.md) | a cadeia de proporções, navbar, sidebar, TOC, breadcrumb, paginação, footer e o comportamento no estreito |
| [`foco.md`](foco.md) | `:focus-visible` universal, `:active`, o piso de alvo no toque, e o portão que impede `outline: none` |
| [`motion.md`](motion.md) | as duas durações, as duas curvas, os seis movimentos nomeados e o reduced-motion resolvido na camada de token |
| [`icones.md`](icones.md) | o manifesto de 60 nomes com teto de 64 e folga quatro, os dois renderizadores, a marca sem glifo e os onze pares seção→ícone |
| [`swizzle.md`](swizzle.md) | o ledger vivo, os três significados de `src/theme/`, as perdas nomeadas e a disciplina de registro |
| [`referencia.md`](referencia.md) | a ruptura de layout — o contrato de assinatura, o gerador de fragmento e as três colunas |
| [`busca.md`](busca.md) | o índice local, a escada de pontuação, o modal `<dialog>` e o ARIA por citação do APG |

### 3.2 O catálogo — dezoito arquivos

[`componentes/README.md`](componentes/README.md) é o índice e o contrato comum: o gabarito de **nove** seções, o contrato de partes, a regra de `className` proibido, e a razão de o catálogo ser **fechado**.

Os dezessete, com uma linha cada, estão no índice dele. Eles não se repetem aqui — dois índices da mesma lista é o defeito de duplicação que a própria spec nomeia no rodapé de [`chrome.md`](chrome.md).

---

## 4. As cinco invariantes

Quatro são de forma e se cobram por `grep`. A quinta é de conteúdo e é a única que enxerga o que as outras não veem.

| # | Invariante | Como se confere |
| ---: | --- | --- |
| 1 | **Gabarito sem seção vazia** — todo documento de componente tem as nove seções, na ordem, e nenhuma delas é só o título | varredura |
| 2 | **Zero número fora de `tokens.md`** — cor, comprimento, tempo e curva só existem lá | varredura, e o portão 1 no código |
| 3 | **`## Procedência` sem linha órfã** — toda tabela de procedência tem decisão, classe e fonte em toda linha | varredura |
| 4 | **Todo bloco `Livre` nomeia o dono** — latitude sem dono é buraco | varredura |
| 5 | **Completude** — todo item de *"O que este ticket entrega para quem vem depois"*, nas resoluções **de cada mapa que produziu esta spec**, tem endereço num arquivo | leitura cruzada |

**A quinta é a que importa mais, e é a mais cara.** As quatro de forma passariam com a tipografia inteiramente ausente: um documento que não existe não tem seção vazia, não tem número solto e não tem procedência órfã. Só a completude enxerga ausência.

`npm run invariantes` roda as quatro primeiras. A quinta é leitura, e o resultado dela está no §4.2.

### 4.1 Duas das quatro precisaram de régua mais fina que o mapa previa

**A invariante 2, escrita ao pé da letra, produziria trinta falsos positivos.** A varredura crua de literal encontra o limiar de media query, a citação de valor de terceiro (os 1024 da âncora, os 1440 do Infima), o resultado de verificação (*"folga de 62,5px"*) e a aritmética de derivação escrita por extenso. Reprovar tudo isso seria portão que reprova o que funciona.

O que a invariante de fato protege é outra coisa: **que nenhum documento vire segunda fonte de valor sem dizer que virou.** Então a régua é — *documento com literal de desenho precisa declarar, no próprio preâmbulo, o que ele admite e por quê.* Documento sem literal passa de graça. Hoje **todos os onze** que têm literal carregam a declaração.

**A invariante 4 separa marcador de menção por code span**, e a separação é do próprio vocabulário do repositório: quando a palavra é citada — *"salvo bloco `Livre`"* — ela vai entre crases, porque ali ela é o nome de uma coisa; quando ela **abre** um bloco, vai em negrito ou em comentário de CSS, sem crase. Tirar os code spans antes de olhar é o que faz a varredura enxergar marcador e ignorar prosa, **sem lista de exceção a manter**.

### 4.2 A quinta invariante, auditada

**Dezesseis resoluções, e cada uma tem endereço.** A tabela abaixo é a auditoria do mapa [#49](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49): onde a saída de cada uma aterrissou nesta spec.

> **A auditoria anterior está no §4.3, e ela não se apaga.** Ela cobria as vinte e sete resoluções do mapa [#30](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/30), que produziu a spec do Trilho. Aquele endereçamento continua verdadeiro para os arquivos que sobreviveram — o que mudou foi o mapa que manda, não o resultado do trabalho antigo.

**Três delas são de pesquisa, e o endereço delas é diferente** — a [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50), a [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) e a [#52](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/52) não carregam a seção *"O que este ticket entrega para quem vem depois"*, porque a convenção é de ticket de **decisão**. O que elas entregam é medição, e ela chega à spec **através** da resolução de decisão que a consumiu.

| Resolução | Onde ela aterrissou |
| --- | --- |
| [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) o Devin remedido, no tema `mint` *(pesquisa)* | [`tokens.md`](tokens.md), [`chrome.md`](chrome.md), [`componentes/README.md`](componentes/README.md) e [`componentes/card.md`](componentes/card.md), via #54 e #56 |
| [#51](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/51) a faixa de tabs de largura total, e o `unsafe` *(pesquisa)* | [`chrome.md`](chrome.md) §3, [`swizzle.md`](swizzle.md), [`foco.md`](foco.md), [ADR 2](../adr/0002-politica-de-swizzle.md) |
| [#52](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/52) o `<header>` fora da lista de prosa *(pesquisa)* | [`chrome.md`](chrome.md) §1.4 e [`swizzle.md`](swizzle.md) §3 — **aterrissou como morte**: a lista de onze elementos de prosa saiu, e o defeito que ela produzia saiu com ela |
| [#53](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/53) a narrativa: o dev, a empresa, o nome | [`informacao.md`](informacao.md) §1 — o acervo, e as três regras que valem em toda página |
| [#54](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/54) a geometria `mint`, elo por elo | [`chrome.md`](chrome.md) §1, e o limiar único em [`tokens.md`](tokens.md) |
| [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) ainda são quatro deltas? | [`principios.md`](principios.md) §3 — **zero**, e o recarimbo em [`tokens.md`](tokens.md), [`foco.md`](foco.md) e [`componentes/code-group.md`](componentes/code-group.md) |
| [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) o sistema de tokens quando o cartão sai | [`tokens.md`](tokens.md), [`chrome.md`](chrome.md) §2, [`componentes/code-block.md`](componentes/code-block.md), [`componentes/frame.md`](componentes/frame.md) |
| [#57](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/57) `Jornadas`, e o décimo tipo de página | [`informacao.md`](informacao.md) §6 — os dez tipos, com o gabarito de cada um |
| [#58](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/58) as folhas, e o contrato que substitui o OpenAPI | [`referencia.md`](referencia.md) e [`informacao.md`](informacao.md) §3, via #82 e #81 |
| [#59](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/59) as treze fixtures reatribuídas | [`informacao.md`](informacao.md) §7 — **onze**, e a correção está lá com o motivo |
| [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) o catálogo de dezoito sob o `mint` | os dezessete de [`componentes/`](componentes/), mais [`tokens.md`](tokens.md), [`chrome.md`](chrome.md), [`swizzle.md`](swizzle.md) e [`principios.md`](principios.md) |
| [#61](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/61) a landing: impactante sem destoar | **revertida** por [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — a página saiu, e com ela `landing.md` e o portão 8. O endereço da resolução hoje é esta linha: ela foi implementada, medida e removida por decisão de escopo, não por defeito |
| [#68](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/68) a cor de marca | [`tokens.md`](tokens.md) — a rampa e os sete papéis |
| [#70](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/70) o manifesto de ícones sob a árvore nova | [`icones.md`](icones.md), via #81 — o manifesto de 60 e os onze pares seção→ícone |
| [#72](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/72) a pilha de fonte | [`tokens.md`](tokens.md) §4 |
| [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) o segundo tom: onde o cyan mora | [`tokens.md`](tokens.md) e [`principios.md`](principios.md) §5.3 — o terceiro endereço era `landing.md`, e saiu com [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) |

**Quatro aterrissaram sem carimbo próprio, e isso é achado da auditoria, não defeito.** As [#52](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/52), [#53](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/53), [#58](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/58) e [#70](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/70) não aparecem citadas por número em nenhum arquivo de `docs/design/` — o que a tabela de procedência do documento cita é o **ticket de implementação** que as consumiu (#77 a #83). É a mesma mecânica que a nota acima descreve para os de pesquisa, um degrau adiante: a resolução chega à spec através de quem a implementou.

**A conferência foi por varredura, e vale registrar o método**, porque ele é reproduzível e a leitura não é: `grep -rl "issues/<n>)" docs/` para cada uma das dezesseis, e depois a leitura só das que voltaram vazias. Doze voltaram com endereço direto; quatro exigiram achar onde a decisão está escrita sem o número. **Nenhuma voltou sem lugar nenhum** — que é o resultado que esta invariante existe para produzir, e o único que ela não conseguiria fabricar.

**O que esta invariante enxerga e as outras quatro não:** ausência. Um documento que nunca foi escrito passa nas quatro de forma sem uma reclamação.

### 4.3 A auditoria anterior, do mapa que produziu a spec do Trilho

Ela fica. O mapa [#30](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/30) fechou vinte e sete resoluções, e o endereço de cada uma continua sendo o endereço delas nos arquivos que sobreviveram à reescrita. Apagá-la faria a spec parecer ter nascido do segundo mapa.

| Resolução | Onde ela aterrissou |
| --- | --- |
| [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) chrome e IA das referências *(pesquisa)* | [`chrome.md`](chrome.md), [`informacao.md`](informacao.md), via #20 e #16 |
| [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) sistema visual medido *(pesquisa)* | [`tokens.md`](tokens.md), via #11 e #12 |
| [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) inventário de componentes *(pesquisa)* | [`componentes/`](componentes/), via #15 |
| [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) tema, Infima e a fronteira do swizzle *(pesquisa)* | [ADR 2](../adr/0002-politica-de-swizzle.md), [`swizzle.md`](swizzle.md), via #14 |
| [#6](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/6) API Reference sem sair do vanilla *(pesquisa)* | [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md), [`referencia.md`](referencia.md), via #18 e #82 |
| [#7](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/7) busca, i18n e versionamento *(pesquisa)* | [`busca.md`](busca.md), [`informacao.md`](informacao.md) §5 e §8, via #19 e #16 |
| [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8) recursos AI-era *(pesquisa)* | [`informacao.md`](informacao.md) §9, [ADR 7](../adr/0007-trailingslash-false.md), via #33 |
| [#9](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/9) forma da própria spec | **este arquivo**, mais o gabarito de [`componentes/README.md`](componentes/README.md) |
| [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) âncora e deltas | [`principios.md`](principios.md) §1, §3 e §5 |
| [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) arquitetura de tokens | [`tokens.md`](tokens.md) §1 a §3, [ADR 1](../adr/0001-doutrina-de-css.md) |
| [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) direção de arte | [`tokens.md`](tokens.md) — a rampa, os sete papéis, os oito `--sd-code-*` |
| [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) glow e profundidade no claro | [`tokens.md`](tokens.md) §8 — a metade do glow saiu com a ilha em [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94); a profundidade no claro continua onde estava |
| [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) estratégia de swizzle | [ADR 2](../adr/0002-politica-de-swizzle.md) e [`swizzle.md`](swizzle.md) inteiro |
| [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) inventário de componentes | os dezessete de [`componentes/`](componentes/) |
| [#16](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/16) IA e o produto fictício | [`informacao.md`](informacao.md) §1 a §8 |
| [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) vocabulário de motion | [`motion.md`](motion.md), [ADR 3](../adr/0003-reduced-motion-na-camada-de-token.md) |
| [#18](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/18) rota do API Reference | [`referencia.md`](referencia.md), [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) — superado pelo [ADR 8](../adr/0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) |
| [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) rota da busca | [`busca.md`](busca.md), [ADR 6](../adr/0006-busca-local-sem-servico-externo.md) |
| [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) as três escolhas divergentes | [`chrome.md`](chrome.md) §1, e os dois deltas em [`principios.md`](principios.md) §3 |
| [#21](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/21) orçamento de ícones | [`icones.md`](icones.md) |
| [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) contrato de foco | [`foco.md`](foco.md), [ADR 4](../adr/0004-contrato-de-estado-de-entrada.md) |
| [#26](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/26) estrutura da landing | **revertida** por [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), junto com a #61 — a raiz virou um salto para a primeira doc, e a estrutura que esta resolução decidiu deixou de ter sujeito |
| [#27](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/27) anatomia do footer | [`chrome.md`](chrome.md) §6 |
| [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) tela pequena | [`chrome.md`](chrome.md) §7 e [`referencia.md`](referencia.md) — o terceiro endereço era `landing.md` §7, e saiu com [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) |
| [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) tipografia e `@property` | [`tokens.md`](tokens.md) §4 e §5 |
| [#32](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/32) os pares seção→ícone | [`icones.md`](icones.md) §3 e §5 — **onze** sob a árvore do `panlabs` |
| [#33](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/33) `trailingSlash` | [ADR 7](../adr/0007-trailingslash-false.md) |

**Sete daquelas eram de pesquisa** — as [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) a [#8](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/8) —, e o endereço delas seguia a mesma regra: a medição chega à spec através do ticket de decisão que a consumiu.

**E os itens de entrega cruzada foram conferidos um a um, não no atacado.** Vinte itens concretos e nomeáveis — `--sd-glow` pronto para a landing, o modal como único consumidor de `--sd-move-enter`, `circle-check` saindo do manifesto, `--sd-shadow-lip` a 0% no claro, `applyTrailingSlash` não importado, a entrelinha que não desce, `Icon/ExternalLink` como `unsafe` de sprite, o teto de um loop por página, a sidebar estreita sem armadilha de foco — **todos os vinte tinham endereço** na spec daquele mapa.

---

## 5. Os sete portões

Três cadências: **commit**, **upgrade** e **implantação**.

| # | Portão | Cadência | Como roda |
| ---: | --- | --- | --- |
| 1 | Literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | commit | `npm run portao:1` |
| 2 | `transition:`/`animation:` com tempo ou curva cravada | commit | `npm run portao:2` |
| 3 | `outline` fora de `src/css/foco.css` | commit | `npm run portao:3` |
| 4 | Volume, tipo de página, regra de heading e cobertura de locale do conteúdo | commit | `npm run portao:4` |
| 5 | A referência gerada é a projeção do contrato — regenera e diffa | commit | `npm run portao:5` |
| 6 | As três rotas contra o host real, nos dois locales | **implantação** | `npm run portao:6 -- <url-base> [rota]` |
| 7 | O `swizzle --list` congelado, e `src/theme/` conferido contra ele | **upgrade** | `npm run portao:7` |

Mais **quatro** verificações que **não são portão** e rodam junto:

- `node scripts/espelho-tokens.mjs --verificar` — o bloco `css` de `tokens.md` é `src/css/tokens.css` byte a byte;
- `npm run contraste` — as tabelas de contraste de [`tokens.md`](tokens.md) §10 e [`foco.md`](foco.md) §6, computadas do CSS e **comparadas célula a célula** com o que os dois documentos publicam;
- `npm run icones` — a bijeção manifesto ↔ `static/icons/`;
- `npm test` — as três réguas de `node --test`: o algoritmo da busca, o contrato de assinatura e a comparação de paridade. Os portões são varredura, e nenhum dos três é varrível.

E **um relatório**, que não é portão nem verificação:

- `npm run paridade` — mede o site construído contra as tabelas de alvo publicadas em [`tokens.md`](tokens.md) §12 e §13, [`chrome.md`](chrome.md) §11 e §12, [`busca.md`](busca.md) §10 e a `## Anatomia` de quatro componentes, e imprime o que não fecha.

> **Por que ele é uma terceira categoria.** A régua desta seção diz que portão protege uma **regra de escrita** e verificação confere que **duas cópias da mesma verdade não divergiram**. A paridade não é nenhum dos dois: o alvo e o site **não são duas cópias de uma verdade** — o alvo é onde se quer chegar, e a distância até ele é justamente o que se quer ler. Um portão aqui reprovaria o projeto por não ter terminado.
>
> É o único passo com `continue-on-error` de [`ci.yml`](../../.github/workflows/ci.yml). O juiz declarado da paridade é a avaliação visual humana sobre o produto final; o relatório existe para que a deriva fique **escrita** em vez de descoberta semanas depois, que foi exatamente como *"ficou aquém"* apareceu da primeira vez.

> **Eram três, e a quarta nasceu de um defeito que a leitura não pegava.** As duas tabelas de contraste mediam o **mesmo par** e discordavam em três das quatro células, e a divergência sobreviveu a uma auditoria inteira — porque conferi-la exigia refazer a conta à mão, e ninguém refaz. Ela entra como verificação e não como portão pela régua desta seção: ela não protege uma regra de escrita, ela confere que duas cópias da mesma verdade não divergiram.
>
> *Dissenso registrado:* é mais uma coisa rodando na CI de todo commit, num projeto que já cobra sete portões e três verificações. Aceito porque o custo é de milissegundos e porque a alternativa — deixar a spec afirmar números que ninguém consegue reproduzir — é o que produziu o defeito.

### 5.1 O oitavo saiu com a página que ele cobrava

**Havia um portão 8**, e a regra de escrita que ele protegia cabia numa frase: *a landing pode ter isto, e nada mais*. *"Impacto sem extravagância"* não sobrevive como adjetivo, porque adjetivo não passa por revisão — então virava **seis contagens exatas**: uma faixa `data-sd-showcase` no site, dois `radial-gradient` **dentro da regra da ilha** e não em qualquer lugar, um `infinite` em todo o CSS, uma declaração de `animation-timeline`, um consumidor de `--sd-type-6xl`, uma sombra de conteúdo na própria página. Mais a metade negativa, na mesma varredura: zero `@keyframes` novo, zero componente novo, zero literal no CSS Module dela, zero `z-index`. Um sétimo item era extravagância por definição.

**A página saiu em [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), e o portão saiu com ela.** Não foi o portão que envelheceu — foi o sujeito dele que deixou de existir. Um portão que conta efeitos numa rota removida passa verde todos os dias sem poder reprovar nada, e linha verde que não consegue ficar vermelha é a pior linha de uma CI: ela ensina a confiar no que não está sendo conferido. A raiz virou um salto para a primeira doc, e o que ela renderiza agora não tem efeito nenhum a licenciar.

> *Dissenso registrado, e ele sobrevive à remoção.* O portão 8 foi aceito sendo o oitavo num projeto que já tinha sete, e protegendo **uma página**. Essa objeção não é o que o matou — o que o matou foi o sujeito. Se a faixa de espetáculo voltar, o argumento que o criou volta inteiro, e o parágrafo acima é a especificação dele: seis contagens e quatro zeros, sem uma linha de prosa a reconstruir.

> **Uma correção de fato que a remoção promove a consequência.** A linha 6 do portão foi escrita como *"1 consumidor de `--sd-shadow-raised`"*, site inteiro; **eram dois** — o botão primário da landing e o painel da referência gerada —, e [`tokens.md`](tokens.md) §6 já dizia isso por escrito. Com a landing fora, **é um**: o painel. O token continua declarado porque continua consumido, e essa é a diferença entre ele e `--sd-type-6xl`, que saiu.

> **São sete de novo, e eram seis até o slice 7.** A resolução do slice 7 chamava o portão do `swizzle --list` de *portão 5*; o número já estava gasto pelo portão do gerador da API, citado pelo [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) **pelo número**. Renumerar um portão commitado para satisfazer um número escrito antes de ele existir quebraria a citação. Ele é o 7. Ver [`swizzle.md`](swizzle.md) §5. **O mesmo argumento governa a saída do 8: o número não é reaproveitado.** O próximo portão a nascer é o 9, não o 8 vago — a numeração é identidade, não posição numa fila, e é a citação por número que a torna assim.
>
> Consequência menor, dita para não envelhecer calada: a frase do [ADR 5](../adr/0005-referencia-da-api-gerada-de-contrato.md) que chama o portão 5 de *"o único do conjunto que não é `grep`"* passou a ter companhia — o portão 7 é da mesma família, regenera e diffa.

**Onde cada um roda.** Os de commit, mais as quatro verificações e o relatório de paridade, estão em `.github/workflows/ci.yml`. O 6 está em `.github/workflows/deploy.yml`, depois da publicação, porque ele é o único que depende de alguém fora do repositório. O 7 tem cadência de upgrade e roda na CI de todo commit mesmo assim: não existe gatilho barato para *"houve um upgrade"*, e um portão que depende de alguém lembrar de rodá-lo é um portão que não roda.

---

## 6. O axioma 6, exercido

**Rodou duas vezes.** Deixa de ser promessa nesta linha; o segundo resultado — contra a spec reescrita inteira, e com a faixa de tabs dentro do recorte — está no §6.4, e o primeiro fica ao lado dele no §6.6.

**A segunda rodada não é repetição.** A primeira mediu a spec do Trilho; esta mede uma spec **reescrita de cabo a rabo**, em que trinta arquivos mudaram e a superfície mais nova do projeto — a faixa de tabs — nunca tinha sido cobrada por ninguém que não a tivesse desenhado. Um teste que só roda uma vez mede a redação daquele dia.

### 6.1 Por que ele não pode ser rodado por quem escreveu a spec

O axioma 6 diz: *um agente que só tem a spec — sem a conversa, sem as referências — constrói o site e o resultado é reconhecivelmente o que foi decidido.*

**A sessão que escreveu a spec é a única que não pode cobrá-la.** Ela tem a conversa inteira, leu as sete pesquisas e escreveu o código; o que ela reconstruísse viria da memória e não do documento, e o teste devolveria um "passou" que não mede nada. Um teste que só o autor pode aplicar não é teste — é a promessa outra vez, com outra roupa.

Por isso ele custa uma **sessão de agente limpa**, e foi assim que rodou: um sandbox com `spec/design/` e `spec/adr/` e nada mais, sem acesso ao repositório.

### 6.2 O protocolo

| | |
| --- | --- |
| **O que o agente recebe** | `docs/design/` e `docs/adr/`, e nada mais |
| **O que ele não recebe** | as issues, os branches `research/*`, o `conteudo/`, e qualquer arquivo de `src/` |
| **O que ele constrói** | um Docusaurus vazio, e sobre ele a **camada de tokens inteira**, **a página de documentação** — chrome, sidebar, TOC, footer — e, desde a segunda rodada, **a faixa de tabs**, em pt-BR |
| **Quanto tempo** | uma sessão; se não couber, o recorte é a camada de tokens sozinha |

O recorte não é economia: `tokens.css` mais o chrome é o menor pedaço que atravessa **os três** — a sede única de valor, o adaptador do Infima e a escada de swizzle. Quem reconstrói isso lendo o documento provou o que interessa; quem tropeça mostra exatamente onde.

**O recorte cresceu de propósito na segunda rodada.** A faixa de tabs é a única superfície do projeto cujas peças **se destroem em silêncio se qualquer uma faltar**: sem o token de altura a segunda linha pinta sobre o conteúdo, sem o escopo de media query o drawer infla, sem o espaçador a linha não abre, sem o gradiente ela não sangra. Nenhum desses quatro modos de falhar produz erro de build. É o melhor teste de prosa que este esforço tem para oferecer, e o §6.5 é o que ele devolveu.

### 6.3 Como se julga

O critério é **reconhecível**, não idêntico. Três perguntas, e a terceira é a que vale:

1. os **portões 1, 2 e 3** passam sobre o que o agente escreveu?
2. o resultado é reconhecivelmente a mesma skin — a mesma rampa, a mesma cadeia de proporções, o mesmo contrato de foco?
3. **onde ele precisou reinterpretar?** Toda vez que o agente escolheu por conta própria, a spec tem um buraco — e o endereço do buraco é o produto deste teste.

A terceira é a única que gera trabalho. As duas primeiras dizem *passou* ou *não passou*; a terceira devolve a lista de linhas a escrever.

### 6.4 O resultado da segunda rodada

| | |
| --- | --- |
| **Commit da spec** | `f83b7b3` |
| **URL pública no ar naquele commit** | <https://panlabs-tech.github.io/shinydoc-docusaurus/> |
| **Recorte** | o do §6.2 com a faixa de tabs dentro — camada de tokens, página de documentação **e** a segunda linha do topo, em pt-BR |
| **O que o agente recebeu** | `docs/design/` e `docs/adr/`, 39 arquivos. Nada mais |

**O build passou nos dois locales**, com 32 páginas, sem link quebrado, e sem uma dependência npm além das que o preset escreve. Os portões 1, 2 e 3 passaram sobre o que ele escreveu.

#### O veredito, em três linhas

- **camada de tokens: sim, e sem decisão nenhuma.** O bloco de [`tokens.md`](tokens.md) §3 é o arquivo, não a descrição dele — 1248 linhas copiadas, zero escolhas;
- **chrome estrutural: sim, e desta vez com medição.** A cadeia de proporções reproduziu **os números da tabela de [`chrome.md`](chrome.md) §1.1 sem erro** — 1471 de viewport dando 1151 / 863,3 / 263,8 / 720, e 1472 e 1920 dando 1152 / 864 / 264 / 720. A faixa monta em `y=64`, o `<nav>` fecha em 112, o ritmo vertical mede 48/16, e a eyebrow por subtração devolve exatamente o nome da categoria;
- **acabamento: não, e o padrão é o mesmo da primeira rodada.** Dezoito pontos exigiram decisão, e em oito deles o próprio agente marcou a confiança como **baixa**.

#### O padrão não mudou, e é isso que o torna achado

**A spec é impecável onde descreve mecanismo de upstream e derivação declarada, e é muda onde precisa de um valor de acabamento que ninguém mediu.** A primeira rodada disse isso; a segunda, contra uma spec inteiramente reescrita, disse de novo. Duas amostras independentes com o mesmo resultado deixam de ser observação e viram propriedade do documento.

A saída continua **não sendo medir mais**. É que **valor não medido também precisa de endereço** — nem que seja um bloco `Livre` com dono e um default cravado. Silêncio é a terceira categoria que a régua do §1 diz não existir, e ela continua existindo.

#### As reinterpretações que mais custam, na segunda rodada

| # | O que a spec não respondeu | Onde | Consequência |
| ---: | --- | --- | --- |
| 1 | O mapeamento *token type* do Prism → os sete papéis `--sd-code-*` | [`tokens.md`](tokens.md) §7 | **é a mesma da primeira rodada, e continua aberta.** A spec dá a forma do shim e os sete papéis, e nunca diz qual tipo cai em qual — decide a cor de metade dos caracteres de todo bloco de código |
| 2 | As **duas cores** da parada dura do gradiente da faixa | [`chrome.md`](chrome.md) §3.1 | o mecanismo é inequívoco e nenhuma das duas cores é nomeada. Ele deduziu que precisam diferir pelo argumento inverso — se fossem iguais, `background-color` bastaria — e a segunda foi aposta |
| 3 | A tipografia dos dois degraus da sidebar | [`chrome.md`](chrome.md) §4.1 e §4.2 | a spec **afirma que existem dois degraus** e não diz quais valores os separam |
| 4 | Onde moram as folhas de CSS e em que ordem entram no build | — | **é a outra sobrevivente da primeira rodada.** Elas continuam aparecendo só por *basename*, dentro de comentários |
| 5 | O consumidor das sete entrelinhas e do `--sd-tracking-tight` | [`tokens.md`](tokens.md) §8 | declarados, e nenhum documento nomeia quem os lê. E *"título"*, no alcance do tracking, não é definido |
| 6 | A lista de superfícies do `:active` | [`foco.md`](foco.md) §7 | *"mesmos valores do hover, superfície por superfície"* sem a lista das superfícies |

Mais doze de menor alcance, entre elas o fio abaixo do navbar, o corpo do rótulo de paginação, a distância entre os links do rodapé e os três descritores da máscara de ícone — **os quatro marcados como chute pelo próprio agente**.

#### Seis contradições e becos, e quatro são acionáveis

| # | O que ele achou | Estado |
| ---: | --- | --- |
| 1 | **A caixa invisível não é escopada ao limiar, e o §9 diz que ela não vale lá.** Medido: a 950 de viewport a coluna trava em 864 e sobram **86px mortos à direita** | **aberto** — ou o bloco entra no `@media (min-width: 997px)`, ou o §9 diz que ele vale nos dois lados e por quê. Como está, [`chrome.md`](chrome.md) §2 e §9 não podem estar certos juntos |
| 2 | **O preenchimento horizontal do rodapé é incompatível com o alinhamento à coluna de doc.** O `<main>` recua `gutter − 16`; o rodapé recua `gutter`, e os dois nunca alinham | **aberto** — o comentário do adaptador nomeia o sintoma e o atribui ao `.container` não zerado; ele mediu com o container já zerado e os 16px continuam |
| 3 | **§8.3 diz *"uma declaração"* e são duas** — início e fim, porque o Infima aplica o preenchimento nos dois lados | **aberto**, e é de redação |
| 4 | **`.markdown > h1` não casa com nada**, porque o loader de MDX envolve o título num `<header>` | **aberto** — o repo não escreve essa regra (o subtítulo vem do override de `h1`), mas a spec cita *"o defeito do `<header>`"* em [`chrome.md`](chrome.md) §2 **sem dizer o que é**, e ele caiu nele. A explicação vale uma linha |
| 5 | **Ponteiro errado:** [`informacao.md`](informacao.md) §4 mandava ler a tabela das três configurações de coluna em `chrome.md` §1.5; ela está em §2.1 | **corrigido** neste commit |
| 6 | **O segundo zero afirma *"exatamente a que o `create-docusaurus classic` escreve"***, e o template de hoje escreveria uma a mais — `@docusaurus/faster` | **aberto** — conferido que o pacote existe na 3.10.2, a mesma versão daqui; o scaffold **não** foi reproduzido. O zero cobrado é *nenhuma dependência nova*, e esse continua de pé: o que envelheceu foi a justificativa, não a propriedade |

#### As duas ausências que são do sandbox, e não da spec

As faces Inter e Paper Mono exigem rede e não existiam ali — as pilhas caíram na fonte de sistema, que é o que a última parada delas prevê. E os 60 SVG do Lucide vêm de um vendorizador com rede; ele desenhou seis à mão. **Nenhuma das duas conta como buraco de spec**, e vão escritas para não parecerem fidelidade.

> **Um achado lateral que ele deixou de passagem, e que é buraco de verdade:** a spec não fixa `font-display` nem os descritores das faces variáveis.

### 6.5 A faixa de tabs, cobrada em separado — e a spec subestimava o próprio aviso

**As quatro peças montam a partir da prosa. E as quatro sozinhas não bastam.**

O que saiu sem uma decisão: a peça 1 inteira — ela já vem pronta no bloco espelhado de [`tokens.md`](tokens.md) §3, com a soma dentro do `@media` e o par de seletores que desarma a armadilha de especificidade — e a peça 3, com a altura mínima na marca e o alinhamento do cluster da direita.

**A mais difícil de inferir foi a do gradiente**, e não pelo mecanismo: *parada dura de `linear-gradient` no próprio `.navbar`* é inequívoco. É que **uma parada dura precisa de duas cores, e a spec não nomeia nenhuma.**

**E há uma quinta peça, que a spec não conta.** Num flex que quebra, o `align-content` default reparte a folga entre as duas linhas e a faixa deixa de cair em `y=64`. Ele precisou acrescentá-la — e ao escrevê-la sobre o seletor de item em vez do de link, atingiu **também o espaçador**: o espaçador foi de altura 0 para 48, a faixa desceu para `y=112` e passou a pintar sobre o conteúdo da página. **Sem erro de build, sem aviso.** A correção é uma letra de seletor, e o defeito só apareceu medindo em navegador.

Isso confirma a afirmação do §6.2 por experimento, e **num sentido pior do que ela escreve**: a quinta peça também destrói em silêncio, e a spec não a conta entre as que destroem. A peça 3 resolve o **encolhimento** da linha 1; ela não resolve a **distribuição das linhas** do flex que quebra. São dois defeitos com o mesmo sintoma, e a spec descreve um só.

**O que reproduziu a medição de [`chrome.md`](chrome.md) §3.3 verbatim:** três tabs numa linha, altura 48, começando em `y=64`; `<nav>` de 112; cinco pontos varridos na altura da faixa, os cinco dentro do `<nav>`; abaixo do limiar o `<nav>` volta a 64 com zero tabs visíveis; e o drawer a 390 com cabeçalho em 64 e lista em `viewport − 64`. **O escopo por media query da peça 1 segurou.**

### 6.6 A primeira rodada, no commit `fa5eec4`

**Ela não se apaga.** O que ela achou continua sendo o registro do que a spec do Trilho era, e as cinco reinterpretações que ela nomeou são o material de comparação que torna a segunda rodada legível.

| | |
| --- | --- |
| **Commit da spec** | `fa5eec4` |
| **URL pública no ar naquele commit** | <https://panlabs-tech.github.io/shinydoc-docusaurus/> |
| **Recorte** | o do §6.2 **sem a faixa de tabs**, que ainda não existia — camada de tokens e página de documentação, em pt-BR |
| **O que o agente recebeu** | `docs/design/` e `docs/adr/`. Nada mais |

**O build passou nos dois locales, sem link quebrado**, com as sete dependências de produção e as duas de desenvolvimento que o `create-docusaurus classic` escreve — o segundo dos cinco zeros se sustentou sem ser dito. Os portões 2 e 3 passaram sobre o que ele escreveu.

#### O veredito daquela rodada, em três linhas

- **camada de tokens: sim, sem ressalva.** Zero decisões — ver §6.7;
- **chrome estrutural: sim, com ressalvas nomeáveis** — a cadeia de proporções, o cartão, a medida de prosa, a hierarquia de sidebar e o footer saíram do documento;
- **acabamento: não.** Onze valores foram chute, e dois deles mudam a tela de forma imediatamente visível.

#### O padrão, dito ali pela primeira vez

**A spec é impecável onde descreve mecanismo de upstream e derivação declarada, e é muda onde precisa de um valor de acabamento que ninguém mediu.** Isso é o axioma 5 funcionando e cobrando o preço dele.

A saída **não é medir mais**. É que valor não medido também precisa de endereço — nem que seja um bloco `Livre` com dono e um default cravado. Hoje esses onze valores não são `Livre` nem obrigatórios: são a **terceira categoria que a régua do §1 diz não existir** — silêncio.

#### As cinco reinterpretações que ela nomeou

| # | O que a spec não respondeu | Onde | Consequência |
| ---: | --- | --- | --- |
| 1 | O mapeamento *token type* do Prism → os sete papéis `--sd-code-*` | `tokens.md` §7 | **decide a cor de metade dos caracteres de todo bloco de código.** Duas implementações razoáveis não se parecem |
| 2 | Qual degrau de elevação o cartão de doc usa | `chrome.md` §1.3 | os quatro degraus embutem o anel, então a frase não desambigua. `-1` contra `-2` é 1px contra 6px de projeção |
| 3 | A folga entre cartão e TOC | `chrome.md` §1.2c | *"a folga que se quer"* não nomeia token; move a largura útil do TOC em até 16px |
| 4 | A lista de elementos de prosa | `chrome.md` §1.4 | a lista de quem **escapa** está deliberadamente não escrita; a de quem **fica**, que é a que se implementa, também não estava |
| 5 | Onde moram `chrome.css` e `custom.css`, e como as folhas entram no build | — | os dois só apareciam por *basename*, dentro de comentários |

#### As cinco, conferidas uma a uma contra a spec reescrita

**Três mudaram de assunto, e não por terem sido respondidas.** Elas morreram com o cartão:

| # | O que era | Por que não é mais pergunta |
| ---: | --- | --- |
| 2 | qual degrau de elevação o cartão de doc usa | **não há cartão.** A página é plana, e os degraus que embutiam o anel deixaram de ter esse consumidor — ver [`chrome.md`](chrome.md) §2 |
| 3 | a folga entre cartão e TOC | **não há cartão**, e a separação do TOC passou a ser elo declarado da cadeia de proporções |
| 4 | a lista de elementos de prosa | **a lista morreu**, e com ela a superfície que produzia o defeito do `<header>`. Hoje são dois seletores no lugar de onze — [`swizzle.md`](swizzle.md) §3, degrau 1 |

**Pergunta que some porque o objeto sumiu não conta como pergunta respondida**, e a distinção importa: se o cartão voltasse, as três voltariam com ele, exatamente como estavam.

**Duas continuam valendo, e a segunda rodada as encontrou de novo sozinha** — sem ver esta tabela, sem ver o repositório, e contra documentos reescritos:

| # | O que era | Estado |
| ---: | --- | --- |
| 1 | o mapeamento do Prism para os sete papéis | **aberta, e agora com paleta nova.** A paleta trocou inteira entre as duas rodadas e a lacuna não se moveu, porque ela nunca foi sobre *quais cores* — é sobre **qual tipo de token recebe qual papel** |
| 5 | o endereço das folhas de CSS no build | **aberta.** Continuam aparecendo só por *basename*, dentro de comentários. Ele reconstruiu a lista e a ordem por dedução, e acertou a lista |

**Duas rodadas independentes achando as mesmas duas lacunas é o resultado mais forte deste teste inteiro.** Uma reinterpretação achada uma vez pode ser azar do leitor; achada duas vezes, por agentes diferentes, contra redações diferentes, é buraco no documento.

#### Os quatro erros de fato que ela achou

| Erro | Estado |
| --- | --- |
| [`icones.md`](icones.md) mandava procurar tamanho de ícone em [`tokens.md`](tokens.md), **e não há token de tamanho de ícone lá** | corrigido — a regra é a escala de espaço, e agora está escrita |
| [`tokens.md`](tokens.md) §11 dizia que o portão 1 passa *"enquanto o único limiar morar no arquivo de tokens"*; o limiar mora também em `chrome.css` e **o portão tem uma segunda perna** que a frase não mencionava | corrigido — a descrição subestimava o portão |
| [`tokens.md`](tokens.md) §8 mandava aplicar `text-wrap: balance` em *"título e **lead**"*, e **`lead` não é definido em nenhum documento da spec** | corrigido — termo sem definição |
| As tabelas de contraste de [`tokens.md`](tokens.md) §10 e [`foco.md`](foco.md) §6 **discordam** para o mesmo par em três das quatro células | **aberto** — adivinhar qual está certa seria inventar um número medido. Ver [`foco.md`](foco.md) §6 |

#### A que passou por engano, e vale registrada

O tamanho do ícone de sidebar o agente marcou como **chute** — e acertou o valor exato, `--sd-space-4` com `--sd-space-2` de afastamento. Ele raciocinou até a resposta certa **porque a spec o obrigou a apostar**, não porque ela respondeu. Um acerto obtido assim conta como buraco, não como cobertura: a próxima aposta cai do outro lado.

### 6.7 O que a spec acertou, e por que isso também é resultado

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
| **Zero JS de interação no catálogo** | o *substrato nativo* de [`../agents/domain.md`](../agents/domain.md) | 12 arquivos, zero handler e zero estado |
| **Um único autor de modelo de interação no projeto inteiro** | escuta de DOM e tecla | um: `src/theme/SearchBar/index.js` |

`npm run zeros` roda os cinco. A varredura **remove comentário antes de olhar**, pelo mesmo motivo dos portões 1, 2 e 3: ela cobra código, não prosa — e o comentário de `Accordion.js` que explica *"um `<div onClick>` seria pixel a pixel idêntico"* é a documentação do zero que ele reprovaria.

### 7.1 O quinto zero precisou de precisão, e a imprecisão era real

A resolução do slice 7 escreveu *"um único JS de interação no projeto inteiro"*. **Varrido ao pé da letra, isso é falso**, e a varredura o mostrou: além do `SearchBar`, dois arquivos casavam com uma régua ampla de comportamento —

- **`src/theme/ApiDocItem/Painel.js`**, que guarda estado e ouve `onChange`. É o *"único degrau de interatividade confinado a um painel"* que [`referencia.md`](referencia.md) §4.1 declara desde o slice 5;
- **`src/theme/NavbarItem/Marca.js`**, que **repassava** o `onClick` que o painel de tela estreita lhe entregava — ele não autorava handler nenhum.

A régua correta não é *"tem `useState`?"*, e o vocabulário de domínio já a tinha escrito: **zero `keydown` escrito no projeto**. O que obriga a spec a descrever tecla, foco, anúncio de leitor de tela e ARIA em prosa — que é o custo que o axioma 6 cobra — é **autorar modelo de interação**. Um campo controlado não obriga nada disso: quem trata digitação, foco e cursor é o navegador, e o React só espelha o valor.

Por isso o zero é **escuta de DOM e tecla**, e por isso o resultado da varredura **imprime as outras superfícies em vez de escondê-las**. Uma afirmação limpa que esconde um fato é pior que uma afirmação com nota de rodapé.

> **Hoje a régua ampla pega uma superfície, e não duas.** `Marca.js` saiu com a marca sem glifo ([`icones.md`](icones.md) §3), e a saída está no ledger ([`swizzle.md`](swizzle.md) §3): o componente de tema que desenhava o par glifo+palavra deixou de ter assunto, e o arquivo foi removido. Sobra `Painel.js`, e `npm run zeros` continua imprimindo-o sob *"com estado ou campo controlado, sem autorar modelo"*. **A precisão do quinto zero sobreviveu à morte do caso que a motivou** — o que mudou foi a contagem, não a régua, e é assim que se sabe que ela era régua e não desculpa.

---

## 8. A varredura de mortes

**A reescrita matou mais do que criou, e nenhuma das mortes quebra o build.** Um token sem consumidor não quebra nada. Um SVG não referenciado não quebra nada. Um documento de componente que sobreviveu ao componente não quebra nada, e uma linha de ledger sem assunto sobrevive a qualquer CI verde. Por isso a varredura é **parte do aceite**, e não cortesia de fim de esforço.

Cinco categorias, varridas no fecho:

| O que se procura | Como | Resultado |
| --- | --- | --- |
| **Token sem consumidor** | todo `--sd-*` de `tokens.css` contra `var(--sd-*)` em `src/`, `scripts/`, `conteudo/` e na raiz | **7 de 130**, os sete com o motivo escrito ao lado da definição |
| **Classe de procedência sem membro** | `delta deliberado` e `lacuna de medição`, varridas nas tabelas dos vinte e nove arquivos | delta: **zero membros**, e é resultado (§3 de [`principios.md`](principios.md)). Medição: **zero membros** — os oito foram medidos nesta reescrita (ver abaixo) |
| **SVG não referenciado** | `npm run icones` — bijeção manifesto ↔ `static/icons/` | zero: 60 desenhos, 69 tags, nenhum arquivo a mais |
| **Doc de componente sem componente** | os dezessete de [`componentes/`](componentes/) contra o registro de `MDXComponents` e `src/components/` | zero |
| **Entrada de ledger sem assunto** | cada linha de [`swizzle.md`](swizzle.md) §3 contra o que existe em `src/` | **uma achada e removida** |
| **Exceção de adaptador sem superfície** | as quatro de [`tokens.md`](tokens.md) §7 contra o HTML publicado | zero — a quinta já tinha saído, com dissenso registrado |

**O que a varredura procura é órfão SEM MOTIVO, e não órfão.** A diferença não é conveniência de redação: `--sd-state-danger-edge` já era órfão antes desta reescrita, e a justificativa dele — *família de quatro não tem buraco no meio* — está escrita no próprio bloco de [`tokens.md`](tokens.md) §3 desde o slice que o criou, e foi aceita ali. Uma varredura que reprovasse órfão puro reprovaria uma decisão que o projeto já tomou por escrito, e portão que reprova o que funciona é portão que alguém desliga.

**Os sete têm uma linha cada.** `--sd-gray-200` é parada de uma rampa declarada inteira, e rampa com buraco no meio é pior de ler do que a parada a mais — quem re-marca precisa da geometria completa para julgar o que a marca dele produz em cada degrau; `--sd-state-danger-edge` é o mesmo argumento, na família de quatro; `--sd-toc-width` **nomeia um elo da cadeia de proporções** de [`chrome.md`](chrome.md) §1 sem ser quem o pinta — quem o pinta é o grid 75/25 do upstream, numa classe hasheada que custaria `unsafe` para alcançar. Ele é o valor **contra o qual** se mede o que o grid entrega.

> **Eram três de 136, e a remoção da landing os levou a sete de 130.** Os quatro que entraram são todos consumidores que a página levou consigo, e nenhum deles é órfão sem motivo. `--sd-move-showcase`, `--sd-move-reveal` e `--sd-move-ambient` são metade do **vocabulário fechado** que o portão 2 cobra: ele reprova toda duração ou curva cravada e manda usar um dos seis nomes, e tirar três deixaria a próxima faixa sem nome para pedir — escrevendo o número que o portão existe para impedir. `--sd-accent-contrast` é papel semântico da camada 2, e a camada 2 declara a mesma lista nos dois modos: um papel que sai de um bloco e não do outro é o buraco visível que essa simetria existe para denunciar.
>
> E um token **saiu** em vez de ficar, na mesma varredura: `--sd-type-6xl`, o degrau de display. A diferença não é de tamanho, é de argumento — os sete que ficam são elo de família (rampa, escala de movimento, par de modo) ou medida de referência, e um degrau de display não é elo de nada: ele já saltava o `5xl` por não haver o que preencher no meio. Sem o hero não sobra motivo, e mantê-lo repetiria o defeito que matou o `5xl`. Ver [`tokens.md`](tokens.md) §8.

**A `lacuna de medição` tinha oito membros, e a #83 mediu os oito contra a âncora** — Chrome headless contra `mintlify.com/docs` e as sete referências, mais fonte primária (WHATWG, Chrome/Firefox/Safari) onde a pergunta era de plataforma e não de âncora. Os quatro matizes de estado ([`tokens.md`](tokens.md)) e a busca em `<details>` fechado ([`componentes/expandable.md`](componentes/expandable.md)) mediram para `herdado`. A base da escala de espaço ([`tokens.md`](tokens.md)), a espessura de foco ([`foco.md`](foco.md)), o registro do glifo de sidebar ([`icones.md`](icones.md)), o colapso da grade ([`componentes/card-group.md`](componentes/card-group.md); o segundo endereço era `landing.md`, e saiu com [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94)) e o `scroll-behavior` ([`motion.md`](motion.md)) mediram para `origem própria (medição)` — a âncora não decide o ponto, decide diferente do que sustentamos, ou não faz o que se supunha. **Esvaziar exigiu medir oito coisas, não reescrever oito linhas** — e o axioma 5 é exatamente a regra que proíbe fechar a classe sem medir. Ela era a única das cinco que só se esvaziava por trabalho de fora do documento; agora esvaziou, e [`principios.md`](principios.md) §5.3 registra o antes e o depois lado a lado, pelo mesmo motivo que o axioma 6 preserva o resultado da primeira rodada.

**A entrada de ledger sem assunto era `.navbar__brand:empty`.** Ela escondia o link vazio que o upstream renderiza quando não há `navbar.title` — e o `title` voltou com a marca sem glifo. O próprio `chrome.css` já dizia, em comentário, que a declaração não existia mais; o ledger é que não tinha sido lido contra o arquivo. **É a morte exata que esta varredura existe para pegar**: nenhum build reclamaria de uma linha de tabela descrevendo CSS que ninguém escreve.

> **A varredura também corrigiu um número que envelheceu calado.** O ledger justificava o override de `h1` dizendo *"61 de 61 páginas escrevem o próprio `# Título`"*. São **73** — 52 em pt-BR e 21 em EN —, e a condição continua valendo em todas. A contagem certa exige ignorar blocos cercados, porque comentário de shell abre com a mesma marca: contada crua, a varredura acusa 35 páginas com dois títulos e nenhuma delas tem.
