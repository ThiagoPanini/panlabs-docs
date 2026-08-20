# Motion

O vocabulário de movimento, as duas listas fechadas e a regra de reduced-motion.

**Nenhum valor numérico aparece neste documento.** Duração, curva e período moram em [`tokens.md`](tokens.md), que é a sede única de valor. Os números que aparecem aqui são **identificadores** — número de ADR e número de issue —, não valores.

Motion tem documento próprio porque atravessa o chrome e os dezoito componentes de conteúdo. Regra que atravessa e mora dentro de um assunto ou vira órfã, ou vira repetição em dezoito arquivos. E há um motivo mais duro: enterrar `prefers-reduced-motion` num documento chamado *tokens* é o último lugar onde alguém procura por acessibilidade.

Tudo aqui é obrigatório, salvo bloco marcado `Livre`.

> **Leia antes:** [ADR 3 — Reduced-motion é propriedade da camada de token](../adr/0003-reduced-motion-na-camada-de-token.md).

---

## 1. O vocabulário são sete movimentos

**Nenhum CSS do projeto escreve duração ou curva fora deles.**

| Movimento | Papel | Termina sozinho? |
| --- | --- | --- |
| `--sd-move-flip` | gira um glifo no próprio eixo: o caret de categoria de sidebar | sim |
| `--sd-move-state` | muda em lugar: cor, borda, sombra, opacidade | sim |
| `--sd-move-enter` | aparece: o modal de busca | sim |
| `--sd-move-expand` | muda de tamanho: `<details>`, sidebar em tela estreita | sim |
| `--sd-move-showcase` | entrada da ilha de espetáculo — **sem consumidor**, ver §5 | sim |
| `--sd-move-reveal` | reveal por rolagem — **sem consumidor**, ver §5 | **não** — dirigido por rolagem |
| `--sd-move-ambient` | respiração do glow — **sem consumidor**, ver §5 | **não** — infinito |

> **Três dos sete não têm consumidor hoje, e continuam declarados.** A ilha de espetáculo saiu com a landing ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)), levando os três `@keyframes` que os consumiam. **O vocabulário continua fechado**, e é o **portão 2** que o define assim: ele reprova toda duração ou curva cravada e manda usar um destes nomes. Um vocabulário de três deixaria a próxima faixa que precisasse de um movimento longo sem nome para pedir — e o que ela escreveria é o número cravado que o portão existe para impedir. **Órfão com motivo escrito é decisão registrada; órfão sem motivo é o defeito do Infima que este projeto nomeia para não copiar.** O motivo está escrito aqui, no §5 e ao lado das três linhas em `tokens.css`.

Cada um é um **token completo** — duração mais easing —, e o componente consome por nome:

```css
transition: background-color var(--sd-move-state);
```

Funciona porque custom property substitui **fluxo de tokens**, não valor. O **mesmo** token serve `animation: sd-abre var(--sd-move-enter)`, e é essa propriedade que torna a forma econômica.

**Cada movimento compõe da escala de duração em vez de cravar o número.** Isso não é higiene: é o mecanismo inteiro do §3.

### As duas curvas, nomeadas por intenção

- **`--sd-ease-settle`** — o que responde ao leitor e assenta.
- **`--sd-ease-inout`** — o que tem início e fim na tela.

**Não há `ease-in`.** Nada neste site sai da tela: tudo ou entra, ou muda em lugar. Um terceiro easing sem consumidor seria variável inerte, que é o defeito do Infima que este projeto nomeou para não copiar.

As curvas próprias de uma das referências medidas **não entram**: dela se toma o mecanismo — easing nomeado por intenção, animação como token completo —, não o valor.

---

## 2. O que anima — lista fechada

| Movimento | Onde |
| --- | --- |
| `--sd-move-flip` | **só** o caret de categoria de sidebar — o único nó colapsável do site |
| `--sd-move-state` | link, item de sidebar, aba, cartão, botão de cópia, borda |
| `--sd-move-expand` | os componentes com `<details>`, e a sidebar em tela estreita |
| `--sd-move-enter` | **só** o modal de busca |
| `--sd-move-showcase` · `--sd-move-reveal` · `--sd-move-ambient` | **nada** — a licença está suspensa; ver §5 |

**Tudo o mais é instantâneo por omissão, não por proibição escrita.** Silêncio é obrigação nesta spec; só a liberdade se marca.

**Hover inteiro vive sob `@media (hover: hover)`.** A feature já está em uso no Infima e no `theme-classic`; sem ela, o toque deixa estado de hover grudado depois do tap.

**Estado anima cor, borda, sombra e opacidade — nunca geometria.** Deslocar no hover é o gesto de elevação mais convencional que existe, e há um caso real medido na amostra. Fica fora porque a direção de arte já diz que *tudo sobe iluminado de cima*: subir é trabalho da sombra, e deslocar diria a mesma coisa duas vezes. Numa sidebar densa, vira tremor.

---

## 3. Reduced-motion

**A regra não é uma exceção mais uma lista. É uma classificação que cada movimento faz de si mesmo:**

> **Movimento que termina sozinho encurta** — a escala de duração vai ao menor valor perceptível.
> **Movimento que não termina sozinho é removido** — dirigido por rolagem, ou infinito.

A implementação inteira redefine as **três paradas de duração** dentro de `@media (prefers-reduced-motion: reduce)`. Como os movimentos compõem da escala, todos encurtam juntos.

**E o adaptador de mão única leva a redefinição para o framework que não escrevemos.** O Infima já respeita `prefers-reduced-motion`, zerando as próprias variáveis de transição; como o adaptador as escreve a partir da nossa escala, o Infima e o `theme-classic` param junto — sem martelo `* { animation: none !important }`, sem um único `!important`. Custom property resolve no momento do uso, então a redefinição atravessa o adaptador sozinha.

**A escala vai ao menor valor perceptível, e não a zero.** Transição de duração zero é onde código que espera `transitionend` trava, e o Docusaurus tem o dele: o `useCollapsible` do `theme-common` anima altura em JavaScript. Os dois valores — o normal e o reduzido — moram em [`tokens.md`](tokens.md).

**As duas exceções são removidas, não encurtadas.** Encurtar uma animação infinita produz estroboscópio, que é o oposto exato do que `reduce` pede; e animação dirigida por rolagem não tem duração para encurtar. **A classificação é do movimento, não da superfície**, e é por isso que ela sobrevive ao consumidor: os dois que se classificam assim são os do §5, e nenhum tem consumidor hoje.

> **As duas rotas de remoção estão descritas e nenhuma está montada.** Enquanto a ilha existiu, o reveal sumia por **não entrar** no `@media (prefers-reduced-motion: no-preference)` que o envolvia — a regra morava no CSS Module da página —, e a respiração saía por um `animation: none` no bloco `reduce` do arquivo de tokens. As duas caíram com a landing ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)), e **o arquivo de tokens voltou a ter zero declaração `animation:`**. Ficam escritas, aqui e no comentário do próprio bloco `reduce`, porque são as duas formas conhecidas de remover em vez de encurtar: **a de dentro da guarda positiva e a do `animation: none` com gancho `data-sd-part`.** Quem trouxer o próximo loop ambiente escolhe entre elas, não redescobre as duas.

**Nenhum componente escreve `@media (prefers-reduced-motion)` próprio, para sempre.** A seção `## Motion / reduced-motion` de um arquivo de componente **só nomeia o movimento**. Se um componente precisar dizer qualquer coisa além de *"herda"*, o desenho está errado.

---

## 4. O que nunca anima — lista fechada

**Troca de tema: a superfície não anima.** Proibição explícita de `transition` em `background-color` ou `color` no `:root` e no `body`. *Esta entrada dizia "instantânea", e a palavra saiu — ver a correção S9-1 no fim desta seção.*

O argumento é do projeto, não genérico, e ele tinha **duas metades**. A primeira era a ilha de espetáculo: **inerte na troca de tema** — os tokens dela não mudavam —, e uma transição global de cor a faria parecer **congelada** enquanto o site inteiro esmaecia em volta, sendo a costura dela com o navbar a aresta mais visível do site no modo claro. A segunda é o custo de repintar o documento inteiro no único momento em que a animação toca cada pixel da página.

> **Correção de fato: a primeira metade perdeu o sujeito, e a proibição fica de pé pela segunda.** A ilha saiu com a landing ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)), e não há mais faixa que possa parecer congelada. O custo de repinte não depende de ilha nenhuma e sustenta a regra sozinho — e quem a torna revisável é a linha verificada logo abaixo, não a faixa que já não existe. A metade morta fica escrita porque ela explica por que a regra nasceu **mais forte** do que a metade sobrevivente justificaria sozinha: quem for reabrir a proibição precisa saber que está reabrindo meia decisão, não a inteira.

*Verificado na implementação:* nem o Infima nem o `theme-classic` declaram transição de cor em `html`, `body` ou `:root`. A regra é **não introduzir uma**, e o portão do §7 não a pega — porque a violação seria uma transição legítima em token, no lugar errado.

> **Correção de fato — S9-1: *"instantânea"* não é o que o leitor vê, e a palavra sai.** A proibição desta entrada sempre foi **sobre `:root` e `body`**, e o código a cumpre — medido em navegador, `getComputedStyle(document.documentElement).transition` e o mesmo no `<body>` devolvem `all 0s` nos dois. O documento **não** anima. Mas o parágrafo de abertura dizia *"Troca de tema: instantânea"*, que é uma afirmação sobre o **resultado**, e o resultado é outro.
>
> **O número, e como ele foi obtido.** Varrendo `document.querySelectorAll('*')` na rota de prosa a 1512 e contando o elemento cuja `transition-property` inclui uma propriedade que a troca de tema muda (`color`, `background-color`, `border-*-color`, `box-shadow`, `fill`) com duração maior que zero: **33 elementos**. E a interpolação foi provada, não inferida — trocando `data-theme` e amostrando a cor computada de um `.table-of-contents__link`, ela caminha por seis valores intermediários de `rgb(160,162,166)` a `rgb(81,83,87)` ao longo de 200ms, em vez de saltar.
>
> **De onde elas vêm importa mais que quantas são.** Quase todas são do **upstream**: `.navbar__link`, `.table-of-contents__link`, `.breadcrumbs__link`, `.menu__link`, `.footer__link-item`, `.pagination-nav__link` e os dez `<svg>` do chrome declaram `transition: color 0.2s` no Infima. O tempo e a curva são nossos só porque o adaptador escreve `--ifm-transition-fast: var(--sd-dur-1)` — o que o projeto controla é **quanto**, não **se**. Nossas próprias declarações de `--sd-move-state` são dez, e nenhuma delas está entre as que a troca de tema alcança na rota medida.
>
> **A decisão é reescrever a afirmação, não suprimir a transição.** Suprimir custaria uma de duas coisas, e as duas são piores que o que compram:
>
> - **JS**, uma classe no `<html>` durante a troca. É a rota que todo mundo usa, e ela está fechada aqui pelo quinto zero — *um único JS de interação no projeto inteiro*, conferido por `scripts/cinco-zeros.sh`;
> - **mover a `transition` para dentro do `:hover`**, que é a única rota CSS-only que existe. Ela funciona — em repouso não há transição declarada, então a troca de tema fica seca —, e o preço é hover assimétrico (entra suave, sai cortado) em **todo** link do chrome. Trocar um evento raro e deliberado por uma degradação constante é o negócio errado.
>
> **A segunda metade do argumento também encolheu, e é honesto dizer.** Ela era *"o custo de repintar o documento inteiro no único momento em que a animação toca cada pixel da página"*. Repintar o documento inteiro é exatamente o que `:root` e `body` fariam, e é o que continua proibido e continua zero. O que sobra medido são 33 elementos de texto e ícone esmaecendo — o oposto de *cada pixel*. A proibição fica de pé pelo que ela de fato protege: **a superfície não anima**. O que anima é estado de controle, que tem outro dono e outra entrada nesta spec (§2).
>
> **Dissenso.** Quem lê *"o que nunca anima"* espera uma lista de resultados, não de seletores; dizer *"o `:root` e o `body` não animam"* e deixar 33 elementos esmaeçando é cumprir a letra. A resposta é que a alternativa medida é pior, e que uma lista fechada que promete o que a plataforma não entrega é o defeito que este documento inteiro existe para não ter. **Reabre quando** o zero de JS de interação for gasto por outro motivo — nesse dia a classe de supressão custa três linhas —, ou quando alguém medir o esmaecimento como defeito na avaliação visual, que é o juiz declarado.

**A régua saiu desta linha e virou a segunda perna do portão 2 — §7.** Ela varre `src/` e reprova `transition` de cor declarada sobre `html`, `body` ou `:root`. Nasceu desta correção: a nota *"verificado na implementação"* estava aqui desde o slice 1 e ninguém a verificava desde então, o que é a definição de afirmação que envelhece calada. **A primeira perna não a pegaria** — `transition: color var(--sd-move-state)` no `:root` compõe do vocabulário certinho e passaria verde; o que a segunda cobra é o **seletor**, não o valor.

**Troca de rota: nada.** O leitor clicou para chegar; qualquer fade atrasa exatamente o conteúdo pedido — e envolver `Root`/`Layout` gastaria degrau da escada do [ADR 2](../adr/0002-politica-de-swizzle.md) para comprar atraso.

**Rolagem: salta, não desliza.** `scroll-behavior: auto` **declarado explicitamente**, não herdado. Âncora de TOC numa página longa com rolagem suave é a viagem mais desorientadora do site. Declarado em vez de herdado porque a medição mostrou que **nem o Infima nem o `theme-classic` declaram `scroll-behavior` em lugar nenhum** — não é que a âncora decidiu `auto`; ela não decide nada, e herdar uma ausência não é herdar (ver [`principios.md`](principios.md) §5.3).

**Anel de foco: instantâneo.** Anel que esmaece é anel que não está lá quando a tecla é pressionada. Consequência que fecha uma porta para o contrato de foco: o anel **não** entra na sombra multi-camada como camada animada, porque a sombra do cartão transiciona em `--sd-move-state` e o anel não pode transicionar.

**Nada desloca texto que o leitor está lendo.** Vale nos dois lados — é o critério que sustenta o §5 também.

---

## 5. Landing e ilha — a licença suspensa

**A licença do *"wow"* existiu, foi exercida uma vez e hoje está suspensa.** A fronteira dela nunca foi a landing: era a **ilha** — a região marcada por `[data-sd-showcase]`, hero mais laje de código, uma no site inteiro. `--sd-move-showcase` e `--sd-move-ambient` só tinham consumidor dentro dela; `--sd-move-reveal` era o único que pertencia à *rota* landing em vez da ilha, por morar no CSS Module dela.

**A ilha saiu com a página, em [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94).** Saíram juntos os **cinco tokens de brilho** da camada 3 — os dois gradientes, a caixa da luz e o par de amplitude da respiração —, o `[data-sd-showcase]` que os escopava, a regra do bloco `reduce` que desligava a respiração, os três `@keyframes` da folha global e o CSS Module que os consumia.

**O que não saiu foram os três movimentos.** `--sd-move-showcase`, `--sd-move-reveal` e `--sd-move-ambient` continuam declarados na camada 1, sem consumidor e com o motivo escrito ao lado: **o vocabulário é fechado em seis, e quem o fecha é o portão 2** (§7). Ele reprova toda duração ou curva cravada e manda usar um destes nomes — cortar três deixaria o portão apontando para um vocabulário que não cobre movimento longo, movimento dirigido por rolagem nem loop infinito, e a próxima superfície que precisasse de um deles escreveria o número cravado que o portão existe para impedir. É a mesma leitura da rampa de cinza: **escala se declara inteira, e buraco no meio custa mais que a parada a mais.**

> **Suspensa não é revogada, e a diferença é conferível.** Nada aqui virou proibição: a lista do §4 é a do que **nunca** anima, e nenhum dos três entrou nela. O que a licença perdeu foi o único lugar onde podia ser exercida. Reabri-la é ter ilha outra vez — uma região marcada por atributo, que apareça em **uma** rota e não em toda página —, e as regras abaixo são o preço já pago dessa reabertura. Elas ficam escritas e sem sujeito, e é assim que devem ser lidas.

> **Correção de fato, medida ao implementar a landing, e ela sobrevive à página.** A redação original dizia que `--sd-move-showcase` e `--sd-move-ambient` eram *"camada 3, declarados dentro do escopo da ilha, exatamente como `--sd-glow`"*. **Não eram, e não podiam ser:** os seis movimentos são camada 1 e moram no bloco de vocabulário — é isso que faz reduced-motion alcançar todos de uma vez pela escala de duração, e é isso que o portão do §7 pressupõe. O que de fato era camada 3 no escopo da ilha eram `--sd-glow`, o **par de amplitude** da respiração e o **loop inteiro**. **É esta correção que explica por que os três movimentos sobreviveram à remoção e os `--sd-glow*` não:** o que estava confinado à ilha era o consumo, não o vocabulário, e a remoção levou exatamente o que era dela.

### A entrada da ilha

`--sd-move-showcase` era a **entrada da ilha**, e o consumidor dele era a camada decorativa do hero: a luz subia uma vez, no carregamento, e terminava. Nenhum texto, nenhuma borda e nenhuma caixa se mexia — a mesma regra da respiração, aplicada a um movimento que acaba.

Ele **encurta** sob reduced-motion em vez de sumir, e sem uma linha a mais: compõe da escala, como os outros três que terminam sozinhos. Isso continua valendo sem consumidor — é propriedade do token, não da regra que o consumia.

### Reveal por rolagem

**Por `animation-timeline: view()`, que é CSS nativo — não por `IntersectionObserver`.** Isso gastava menos: zero JavaScript, zero dependência.

**Guarda dupla, e as duas falhavam para o lado seguro:** `@supports (animation-timeline: view())` e `@media (prefers-reduced-motion: no-preference)`. Fora de qualquer uma das duas, o conteúdo ficava **visível e estático** — nunca invisível. É essa propriedade que elimina o modo de falha que existe de verdade na rota com observador: elemento em opacidade zero que nunca é revelado.

> **A ordem do aninhamento é obrigatória: `@media` por fora, `@supports` por dentro.** Achado de build, medido no CSS emitido do slice da landing. Invertido, o `postcss-sort-media-queries` — que o preset de minificação do Docusaurus roda antes de todo o resto — iça o `@media` para a raiz e **o `@supports` que estava em volta some**. A guarda de suporte desaparece só no build de produção, e o reveal degrada para um fade de carregamento em vez de ficar visível e parado. **O achado é do minificador, não da página:** ele vale para qualquer aninhamento dessas duas regras no projeto, e é por isso que fica depois de o reveal sair.

O `Ctrl+F` se resolvia sozinho, porque a linha do tempo é a posição de rolagem — o navegador rolar até o trecho *é* o que o revela.

**Confinamento por escopo físico:** a regra morava no CSS Module da própria rota. Página de documentação não tinha como alcançá-la. Era fato de escopo, não regra a lembrar — e é a forma que a reabertura deve repetir.

**Um gesto por elemento:** revela ao entrar e fica. Sem re-esconder ao rolar de volta, sem parallax, sem elemento que se mexe enquanto está sendo lido.

### A respiração do glow

Um elemento vivo num sistema imóvel lê como intenção; o mesmo elemento num site que já anima em toda parte some no ruído. **A imobilidade das listas dos §2 e §4 era o pré-requisito desta decisão, não um argumento contra ela** — e ela ficou mais imóvel ainda, porque hoje não há o elemento vivo.

*"Com parcimônia"* não sobrevive como advérbio, então virou regra conferível lendo o CSS. As cinco ficam como cláusula da licença suspensa:

- **Um por página, e só dentro da ilha.** Fora dela o token do glow não resolvia — fato de escopo outra vez.
- **O que respira é a luz, nunca a matéria.** A camada animada era decorativa, atrás do conteúdo, `pointer-events: none`. Nenhum texto, nenhuma borda e nenhuma caixa se mexia.
- **Só `opacity` e `transform`.** Nada de animar `filter` ou `blur`, que repintam em vez de compor.
- **Respiração, não pulso.** A amplitude era par declarado sobre o alfa do glow, não número novo.
- **O período é o único loop ambiente medido na amostra inteira**, e ele continua sendo o valor de `--sd-move-ambient` — a medição não expira com o consumidor.

> **O gancho da reabertura está escolhido, e é `data-sd-part`.** Enquanto a ilha existiu, a respiração era desligada por uma regra no bloco `reduce` que alcançava o elemento por esse atributo — a única regra de elemento do arquivo de tokens fora do adaptador. Ela existia porque `animation: none` **não tem como ser entregue por token** (ver a correção do §6): a classe do módulo é hasheada, a camada de token não a conhece, e o contrato de partes é o gancho que sobra. A regra saiu com a página; **o comentário no bloco `reduce` de `tokens.css` guarda o endereço**, e a promessa de *nenhum componente escreve a própria media query* segue literal — quem escreveria é a camada de token.

---

## 6. Onde os `@keyframes` moram

**Na folha global, nunca em `*.module.css`.**

CSS Modules manglam o nome do `@keyframes` que o módulo **define**; um keyframe definido num módulo é inalcançável de outro, e **a falha é silenciosa** — não anima e não avisa.

> **Correção medida no CSS emitido, e ela é mais dura que a regra original.** A redação dizia que *"um módulo pode referenciar keyframe global sem problema"*. **Não pode, não da forma óbvia.** Dois mecanismos se somam:
>
> 1. o `css-loader` localiza o nome de **toda** declaração `animation` de um módulo — inclusive nome que o módulo não define. A referência vira um nome hasheado que não existe;
> 2. o minificador do Docusaurus roda `postcss-discard-unused`, que apaga `@keyframes` sem referência. Com o consumidor manglado, o keyframe global vira órfão e **some do bundle**.
>
> O sintoma é o pior que este documento cataloga: **`docusaurus start` anima e o site publicado não**, sem erro em lugar nenhum. Foi assim que o defeito apareceu — lendo o CSS emitido, não rodando a página.
>
> A forma correta é `global(…)` dentro do valor, **sem dois-pontos**, que é outra sintaxe e não casa:
>
> ```css
> animation: global(sd-revela) var(--sd-move-reveal) both;
> ```
>
> Ela resolve os dois de uma vez: o nome chega inteiro ao CSS emitido, e o minificador passa a enxergar a referência.
>
> O exemplo é o que foi de fato medido, e `sd-revela` **não existe mais** — ele saiu com a landing em [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94). A linha fica verbatim porque a correção é sobre os **dois plugins**, não sobre o keyframe: o próximo módulo que referenciar um keyframe global cai nos mesmos dois mecanismos, e reescrever o exemplo com um nome vivo trocaria uma medição por uma paráfrase.
>
> **Consequência que fecha uma porta:** nome de `@keyframes` **não viaja dentro de custom property**. Nenhum dos dois plugins varre valor de custom property, então o keyframe volta a ser apagado; e se não fosse, `postcss-reduce-idents` renomearia o `@keyframes` sem renomear o token. É por isso que a respiração do glow é desligada por uma **regra** no bloco `reduce`, e não por um token que valha `none`.

Com `global(…)`, um CSS Module referencia os keyframes globais sem conflitar com o confinamento do §5 — era assim que a landing consumia os três dela.

Sobram pouquíssimos, porque o vocabulário é transição. **Hoje sobra um: a entrada do modal de busca.** Eram quatro — os outros três eram a entrada da ilha, o reveal e a respiração, e saíram com a landing ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) porque só o CSS Module dela os consumia. **Um deles não ficou apenas órfão, ficou quebrado:** a respiração lia o par de amplitude declarado no escopo da ilha, e esse par saiu junto — mantê-la seria um `@keyframes` animando para opacidade indefinida.

> **Terceiro mecanismo, medido no slice 7, e ele fecha a porta de `@starting-style`.** O minificador **descarta o bloco `@starting-style` inteiro** — o aviso de build é `Invalid property name`, e o CSS emitido não tem uma ocorrência da regra. Quem dependia dele para o estado de partida perde a transição de entrada **só no site publicado**.
>
> Foi assim que a entrada do modal de busca apareceu quebrada: `docusaurus start` animava, o publicado abria pronto. Mesmo sintoma dos dois mecanismos acima, terceira causa.
>
> **Consequência para o vocabulário: entrada a partir de `display: none` é `@keyframes`, não `@starting-style`.** A saída continua sendo transição — ela não precisa de estado de partida, e `allow-discrete` já a cobre.
>
> Nota de conferência: `sd-busca-abre` e `sd-acende` eram byte a byte iguais — `from { opacity: 0 }` —, e o `postcss-merge-idents` fundia as duas num `@keyframes` só no bundle. Isso era correto e não era colisão: o que separa dois movimentos é o **token**, que carrega duração e curva, e não o nome do keyframe. `sd-acende` saiu com a landing e a fusão deixou de acontecer; **a leitura fica porque ela é a que autoriza declarar dois keyframes idênticos sem chamar isso de duplicação** — e é a primeira coisa que alguém questiona ao ver o CSS emitido.

`interpolate-size: allow-keywords` é declaração de `:root` e mora junto do vocabulário, não dentro do componente que a consome — é ela que habilita `<details>` a transicionar para altura automática, e serve todos os componentes de `<details>` de uma vez.

---

## 7. O portão

| # | Portão | Cadência |
| ---: | --- | --- |
| 2 | **perna 1** — `transition:` ou `animation:` cujo valor contenha unidade de tempo ou curva literal | commit |
| 2 | **perna 2** — `transition` de cor declarada sobre `html`, `body` ou `:root` | commit |

`npm run portao:2`. A regra não depende de ninguém lembrar dela — depende de a varredura passar.

**A segunda perna entrou com a correção S9-1 do §4**, e ela cobra o oposto da primeira: a primeira olha o **valor** e ignora o seletor; a segunda olha o **seletor** e só então o valor. Uma transição de cor no `:root` composta do vocabulário passa pela primeira sem tocá-la — foi por isso que a lista fechada do §4 ficou nove meses com a nota *"verificado na implementação"* e nenhuma verificação.

*Limite escrito no próprio script:* a perna 2 cobra `background-color` e `color`, que é o que a linha do §4 proíbe. `border-color` no `:root` passa, e animaria a troca de tema igual — alargar a varredura seria alargar a regra, e portão não faz isso sozinho.

*Nove casos exercitam a perna 2 antes de ela entrar* — cinco que devem reprovar (`:root`, `body`, `html`, `html, body`, e a lista de duas propriedades) e quatro que não podem (`.menu__link`, `transition: opacity` no `body`, `border-color` no `:root`, e o reset `*` do bloco `reduce`). A varredura falhou nos três primeiros na primeira escrita: `css-sem-comentario.awk` emite `arquivo:linha:código`, e um `^` no regex de seletor nunca casa contra `src/css/tokens.css:12::root`. **Portão que passa verde com a violação escrita é pior que portão nenhum**, e é por isso que o caso negativo entrou junto.

A varredura cobre `src/` inteiro, **inclusive o arquivo de tokens**, e isso não é mais estrito por acaso: o bloco de vocabulário sobrevive porque ele declara **tokens**, não declarações `transition:` ou `animation:`. *"Fora do bloco de vocabulário"* e *"em toda parte"* coincidem por construção.

> **Emenda, do slice da landing — e a contra-emenda que a [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) trouxe.** O arquivo de tokens passou a ter **uma** declaração `animation:`, o `animation: none` que removia a respiração do glow no bloco `reduce` (§3), e ela passava no portão porque `none` não é duração nem curva. **Com a landing fora, o arquivo voltou a ter zero declarações `animation:`** — e a frase estreita voltaria a coincidir com a regra por acidente. Os dois estados ficam registrados porque o que a emenda estabeleceu não foi um número: **o que o portão cobra é valor cravado, e o arquivo de tokens não crava nenhum fora dos tokens**. No dia em que o loop ambiente voltar, a declaração volta com ele e o portão continua verde, sem emenda nova.

---

## 8. Perdas nomeadas

**Os `ease-in-out` literais do `navbar.pcss`.** O Infima crava a curva em três lugares do navbar, e ele não tem escala de easing nenhuma. O adaptador alcança as variáveis de transição do Infima, mas não esses três. Ficam com a curva dele. Some da lista se um dia o navbar for reescrito por CSS próprio, o que não está previsto.

**A curva da seta do `summary`.** `--docusaurus-details-transition` é declarada dentro de classe de CSS Module. Ela é alcançada por seletor estrutural com escopo — a exceção 2 do adaptador —, então nem a duração nem a curva ficam de fora. *Correção sobre a redação original da decisão de motion, que a dava como perda: ela não é, porque a exceção do adaptador substitui o valor inteiro em vez de só a duração.*

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Escala de duração e o período do loop | herdado | [#3](https://github.com/ThiagoPanini/panlabs-docs/issues/3) — medidos nas sete referências |
| **A parada `--sd-dur-0`, 75ms, e o movimento `--sd-move-flip`** | **herdado (medição)** | `docs.devin.ai` — o caret de categoria gira em 75ms ao abrir; é o único alvo publicado abaixo de `--sd-dur-1`, e arredondá-lo para 200ms trocaria a medição por conveniência de vocabulário. Ver [ADR 10](../adr/0010-a-categoria-de-sidebar-nao-e-destino.md) |
| A curva de `flip` é `settle`, e não `inout` | **origem própria (consequência)** | o giro responde ao clique e assenta; não tem começo próprio na tela — a mesma leitura que põe `state` e `enter` em `settle` |
| Duas curvas de easing | herdado | [#3](https://github.com/ThiagoPanini/panlabs-docs/issues/3) §1.5 — base dos quatro sites do alvo |
| Descarte do default do framework de utilitários | herdado | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §1 — default herdado, não aplicado |
| Easing nomeado por intenção, animação como token completo | mecanismo emprestado | [#10](https://github.com/ThiagoPanini/panlabs-docs/issues/10) §3 |
| Movimento composto da escala, não com número cravado | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §1 |
| Reduced-motion na camada de token, alcançando o Infima | herdado + origem própria (implementação) | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5); [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §2 |
| Menor valor perceptível em vez de zero | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §2 — `useCollapsible` anima altura em JS |
| Remover, não encurtar, o que não termina sozinho | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §2 |
| `--sd-move-enter` na parada curta | herdado (correção) | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) corrigindo a [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) |
| Hover sob `@media (hover: hover)` | herdado | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) — feature já em uso no Infima |
| Estado nunca anima geometria | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §3, sobre a assinatura da [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) |
| Troca de tema: a superfície não anima | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §4 — consequência da ilha inerte da [#13](https://github.com/ThiagoPanini/panlabs-docs/issues/13). **A ilha saiu com [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**; a decisão fica pela outra metade do argumento, o custo de repintar o documento inteiro |
| **A palavra *"instantânea"* sai da entrada** | **origem própria (medição)** | **S9-1** — medido em navegador na rota de prosa a 1512: `html` e `body` devolvem `transition: all 0s` (a proibição é cumprida), e **33 elementos** do chrome animam cor por 200ms na troca, quase todos com a transição declarada pelo Infima. A interpolação foi provada amostrando a cor computada de um `.table-of-contents__link` durante a troca. Ver §4 |
| **Suprimir a transição na troca não é comprado** | **origem própria (consequência)** | **S9-1** — as duas rotas são JS (fechado pelo quinto zero de `cinco-zeros.sh`) ou `transition` dentro do `:hover`, que deixa todo hover do chrome assimétrico. Cai da regra que a spec já carregava, não de medição nova |
| Nenhuma transição de cor no upstream | **origem própria (verificação)** | varredura de `html`, `body` e `:root` no Infima e no theme-classic, ao implementar o slice 1. **Virou régua de máquina com a S9-1**: perna 2 do portão 2, §7 |
| `scroll-behavior: auto` declarado | **origem própria (medição)** | [#83](https://github.com/ThiagoPanini/panlabs-docs/issues/83) — `grep` contra o CSS do Infima e do `theme-classic`: zero declarações de `scroll-behavior`. A âncora não decide o ponto; herdar uma ausência não é herdar |
| Anel de foco instantâneo | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §4, entregue ao contrato de foco da [#23](https://github.com/ThiagoPanini/panlabs-docs/issues/23) |
| Reveal por `animation-timeline: view()` | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §5a — decisão do dono do projeto; não medido em nenhuma das sete. **Sem consumidor desde [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**: a regra morava no CSS Module da landing |
| Guarda dupla que falha para visível e parado | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §5a — **sem consumidor desde [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**; a forma fica descrita como cláusula da licença suspensa |
| Respiração do glow, e as regras de parcimônia | herdado + origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §5b — **o uso saiu com [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**; o período medido continua sendo o valor de `--sd-move-ambient`, porque medição não expira com o consumidor |
| `@keyframes` na folha global | herdado | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) — CSS Modules manglam o nome |
| Portão de varredura de motion | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §2 |
| Os seis movimentos são camada 1, e o que é camada 3 é o consumo | **origem própria (correção)** | a redação do §5 dava dois deles como camada 3; medido ao implementar a landing |
| `global(…)` para referenciar keyframe global de dentro de módulo | **origem própria (correção)** | medido no CSS emitido do slice da landing; a regra original dava a referência como livre |
| `@media` por fora, `@supports` por dentro na guarda dupla | **origem própria (implementação)** | o `postcss-sort-media-queries` do preset de minificação destrói o aninhamento inverso |
| Respiração desligada por regra no bloco `reduce`, com gancho `data-sd-part` | **origem própria (implementação)** | nome de keyframe não sobrevive dentro de custom property, e a classe do módulo é hasheada. **A regra saiu com [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**; o gancho continua escolhido, e o comentário do bloco `reduce` guarda o endereço |
| Entrada da ilha como consumidor de `--sd-move-showcase` | **origem própria (implementação)** | o movimento estava licenciado e sem consumidor, e a entrada da ilha o gastou. **Revertida por [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)**: o consumidor saiu e o movimento voltou a ser órfão — desta vez com motivo escrito, que é a linha abaixo |
| **Os três movimentos ficam declarados sem consumidor** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — o vocabulário é fechado em seis e é o **portão 2** que o define assim; cortar três deixaria sem nome o movimento longo, o dirigido por rolagem e o loop, e a próxima superfície escreveria o valor cravado que o portão existe para impedir. Órfão **com** motivo escrito é o que a régua do projeto admite; sem motivo é o defeito do Infima |
| Os três `ease-in-out` do `navbar.pcss` como perda | **lacuna por restrição** | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) |
| A curva da seta do `summary` deixa de ser perda | **origem própria (correção)** | a exceção 2 do adaptador substitui o valor inteiro, não só a duração |
| `@starting-style` não sobrevive ao minificador | **origem própria (medição)** | o bloco é descartado com `Invalid property name`; zero ocorrências no CSS emitido, nos dois locales |
| Entrada a partir de `display: none` é `@keyframes` | **origem própria (correção)** | consequência da linha acima, encontrada na entrada do modal de busca do slice 7 |
| Keyframes idênticos fundidos num só no bundle | **origem própria (verificação)** | `postcss-merge-idents`; o que separa os movimentos é o token, não o nome |
