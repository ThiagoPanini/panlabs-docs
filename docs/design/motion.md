# Motion

O vocabulário de movimento, as duas listas fechadas e a regra de reduced-motion.

**Nenhum valor numérico aparece neste documento.** Duração, curva e período moram em [`tokens.md`](tokens.md), que é a sede única de valor. Os números que aparecem aqui são **identificadores** — número de ADR e número de issue —, não valores.

Motion tem documento próprio porque atravessa o chrome e os dezoito componentes de conteúdo. Regra que atravessa e mora dentro de um assunto ou vira órfã, ou vira repetição em dezoito arquivos. E há um motivo mais duro: enterrar `prefers-reduced-motion` num documento chamado *tokens* é o último lugar onde alguém procura por acessibilidade.

Tudo aqui é obrigatório, salvo bloco marcado `Livre`.

> **Leia antes:** [ADR 3 — Reduced-motion é propriedade da camada de token](../adr/0003-reduced-motion-na-camada-de-token.md).

---

## 1. O vocabulário são seis movimentos

**Nenhum CSS do projeto escreve duração ou curva fora deles.**

| Movimento | Papel | Termina sozinho? |
| --- | --- | --- |
| `--sd-move-state` | muda em lugar: cor, borda, sombra, opacidade | sim |
| `--sd-move-enter` | aparece: o modal de busca | sim |
| `--sd-move-expand` | muda de tamanho: `<details>`, sidebar em tela estreita | sim |
| `--sd-move-showcase` | entrada da ilha de espetáculo | sim |
| `--sd-move-reveal` | reveal por rolagem, só na landing | **não** — dirigido por rolagem |
| `--sd-move-ambient` | respiração do glow, só na ilha | **não** — infinito |

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
| `--sd-move-state` | link, item de sidebar, aba, cartão, botão de cópia, borda |
| `--sd-move-expand` | os componentes com `<details>`, e a sidebar em tela estreita |
| `--sd-move-enter` | **só** o modal de busca |
| `--sd-move-showcase` · `--sd-move-reveal` · `--sd-move-ambient` | **só** landing e ilha — ver §5 |

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

**As duas exceções são removidas, não encurtadas.** Encurtar uma animação infinita produz estroboscópio, que é o oposto exato do que `reduce` pede; e animação dirigida por rolagem não tem duração para encurtar. As duas somem inteiras — o reveal por não entrar no `@media (prefers-reduced-motion: no-preference)` que o envolve, a respiração por `animation: none` no bloco `reduce`.

**Nenhum componente escreve `@media (prefers-reduced-motion)` próprio, para sempre.** A seção `## Motion / reduced-motion` de um arquivo de componente **só nomeia o movimento**. Se um componente precisar dizer qualquer coisa além de *"herda"*, o desenho está errado.

---

## 4. O que nunca anima — lista fechada

**Troca de tema: instantânea.** Proibição explícita de `transition` em `background-color` ou `color` no `:root` e no `body`.

O argumento é do projeto, não genérico. A ilha de espetáculo é **inerte na troca de tema** — os tokens dela não mudam. Uma transição global de cor faria a faixa parecer **congelada** enquanto o site inteiro esmaece em volta, e a costura dela com o navbar já é a aresta mais visível do site no modo claro. Somado ao custo de repintar o documento inteiro no único momento em que a animação toca cada pixel da página.

*Verificado na implementação:* nem o Infima nem o `theme-classic` declaram transição de cor em `html`, `body` ou `:root`. A regra é **não introduzir uma**, e o portão do §6 não a pega — porque a violação seria uma transição legítima em token, no lugar errado. Esta linha é o que a torna revisável.

**Troca de rota: nada.** O leitor clicou para chegar; qualquer fade atrasa exatamente o conteúdo pedido — e envolver `Root`/`Layout` gastaria degrau da escada do [ADR 2](../adr/0002-politica-de-swizzle.md) para comprar atraso.

**Rolagem: salta, não desliza.** `scroll-behavior: auto` **declarado explicitamente**, não herdado. Âncora de TOC numa página longa com rolagem suave é a viagem mais desorientadora do site. Declarado em vez de herdado porque a medição mostrou que **nem o Infima nem o `theme-classic` declaram `scroll-behavior` em lugar nenhum** — não é que a âncora decidiu `auto`; ela não decide nada, e herdar uma ausência não é herdar (ver [`principios.md`](principios.md) §5.3).

**Anel de foco: instantâneo.** Anel que esmaece é anel que não está lá quando a tecla é pressionada. Consequência que fecha uma porta para o contrato de foco: o anel **não** entra na sombra multi-camada como camada animada, porque a sombra do cartão transiciona em `--sd-move-state` e o anel não pode transicionar.

**Nada desloca texto que o leitor está lendo.** Vale nos dois lados — é o critério que sustenta o §5 também.

---

## 5. Landing e ilha — onde o "wow" é licenciado

A fronteira da licença **não é a landing: é a ilha**. `--sd-move-showcase` e `--sd-move-ambient` só têm consumidor dentro dela; `--sd-move-reveal` é o único que pertence à *rota* landing em vez da ilha, por morar no CSS Module dela.

O desenho inteiro da rota está em [`landing.md`](landing.md) §7.

> **Correção de fato, medida ao implementar a landing.** A redação original dizia que `--sd-move-showcase` e `--sd-move-ambient` eram *"camada 3, declarados dentro do escopo da ilha, exatamente como `--sd-glow`"*. **Não são, e não podiam ser:** os seis movimentos são camada 1 e moram no bloco de vocabulário — é isso que faz reduced-motion alcançar todos de uma vez pela escala de duração, e é isso que o portão do §7 pressupõe. O que de fato é camada 3 no escopo da ilha são `--sd-glow`, o **par de amplitude** da respiração e o **loop inteiro**, que virou token pelo motivo do parágrafo seguinte. O confinamento continua sendo fato de escopo; só que o que está confinado é o consumo, não o vocabulário.

**A respiração é desligada por uma regra no bloco `reduce`, e o elemento é alcançado por `data-sd-part`.** É a única regra de elemento do arquivo de tokens fora do adaptador, e ela existe porque `animation: none` **não tem como ser entregue por token** — ver a correção do §6. A classe do módulo é hasheada e a camada de token não a conhece; o contrato de partes é o gancho que sobra. A promessa de *nenhum componente escreve a própria media query* continua literal: quem escreve é a camada de token.

### A entrada da ilha

`--sd-move-showcase` é a **entrada da ilha**, e o consumidor dele é a camada decorativa do hero: a luz sobe uma vez, no carregamento, e termina. Nenhum texto, nenhuma borda e nenhuma caixa se mexe — a mesma regra da respiração, aplicada a um movimento que acaba.

Ele **encurta** sob reduced-motion em vez de sumir, e sem uma linha a mais: compõe da escala, como os outros três que terminam sozinhos.

### Reveal por rolagem

**Por `animation-timeline: view()`, que é CSS nativo — não por `IntersectionObserver`.** Isso gasta menos: zero JavaScript, zero dependência.

**Guarda dupla, e as duas falham para o lado seguro:** `@supports (animation-timeline: view())` e `@media (prefers-reduced-motion: no-preference)`. Fora de qualquer uma das duas, o conteúdo é **visível e estático** — nunca invisível. É essa propriedade que elimina o modo de falha que existe de verdade na rota com observador: elemento em opacidade zero que nunca é revelado.

> **A ordem do aninhamento é obrigatória: `@media` por fora, `@supports` por dentro.** Achado de build, medido no CSS emitido do slice da landing. Invertido, o `postcss-sort-media-queries` — que o preset de minificação do Docusaurus roda antes de todo o resto — iça o `@media` para a raiz e **o `@supports` que estava em volta some**. A guarda de suporte desaparece só no build de produção, e o reveal degrada para um fade de carregamento em vez de ficar visível e parado.

O `Ctrl+F` se resolve sozinho, porque a linha do tempo é a posição de rolagem — o navegador rolar até o trecho *é* o que o revela.

**Confinamento por escopo físico:** a regra mora no CSS Module da própria landing. Página de documentação não tem como alcançá-la. É fato de escopo, não regra a lembrar.

**Um gesto por elemento:** revela ao entrar e fica. Sem re-esconder ao rolar de volta, sem parallax, sem elemento que se mexe enquanto está sendo lido.

### A respiração do glow

Um elemento vivo num sistema imóvel lê como intenção; o mesmo elemento num site que já anima em toda parte some no ruído. **A imobilidade das listas dos §2 e §4 é o pré-requisito desta decisão, não um argumento contra ela.**

*"Com parcimônia"* não sobrevive como advérbio, então vira regra conferível lendo o CSS:

- **Um por página, e só dentro da ilha.** Fora dela o token do glow não resolve — fato de escopo outra vez.
- **O que respira é a luz, nunca a matéria.** A camada animada é decorativa, atrás do conteúdo, `pointer-events: none`. Nenhum texto, nenhuma borda e nenhuma caixa se mexe.
- **Só `opacity` e `transform`.** Nada de animar `filter` ou `blur`, que repintam em vez de compor.
- **Respiração, não pulso.** A amplitude é par declarado sobre o alfa do glow, não número novo.
- **O período é o único loop ambiente medido na amostra inteira.**

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
> **Consequência que fecha uma porta:** nome de `@keyframes` **não viaja dentro de custom property**. Nenhum dos dois plugins varre valor de custom property, então o keyframe volta a ser apagado; e se não fosse, `postcss-reduce-idents` renomearia o `@keyframes` sem renomear o token. É por isso que a respiração do glow é desligada por uma **regra** no bloco `reduce`, e não por um token que valha `none`.

Com `global(…)`, a landing usa os keyframes globais e a regra não conflita com o confinamento do §5.

Sobram pouquíssimos, porque o vocabulário é transição: o modal de busca, a entrada da ilha, o reveal e a respiração.

> **Terceiro mecanismo, medido no slice 7, e ele fecha a porta de `@starting-style`.** O minificador **descarta o bloco `@starting-style` inteiro** — o aviso de build é `Invalid property name`, e o CSS emitido não tem uma ocorrência da regra. Quem dependia dele para o estado de partida perde a transição de entrada **só no site publicado**.
>
> Foi assim que a entrada do modal de busca apareceu quebrada: `docusaurus start` animava, o publicado abria pronto. Mesmo sintoma dos dois mecanismos acima, terceira causa.
>
> **Consequência para o vocabulário: entrada a partir de `display: none` é `@keyframes`, não `@starting-style`.** A saída continua sendo transição — ela não precisa de estado de partida, e `allow-discrete` já a cobre.
>
> Nota de conferência: `sd-busca-abre` e `sd-acende` são byte a byte iguais — `from { opacity: 0 }` —, e o `postcss-merge-idents` funde as duas num `@keyframes` só no bundle. Isso é correto e não é colisão: o que separa os dois movimentos é o **token**, que carrega duração e curva, e não o nome do keyframe.

`interpolate-size: allow-keywords` é declaração de `:root` e mora junto do vocabulário, não dentro do componente que a consome — é ela que habilita `<details>` a transicionar para altura automática, e serve todos os componentes de `<details>` de uma vez.

---

## 7. O portão

| # | Portão | Cadência |
| ---: | --- | --- |
| 2 | `transition:` ou `animation:` cujo valor contenha unidade de tempo ou curva literal | commit |

`npm run portao:2`. A regra não depende de ninguém lembrar dela — depende de a varredura passar.

A varredura cobre `src/` inteiro, **inclusive o arquivo de tokens**, e isso não é mais estrito por acaso: o bloco de vocabulário sobrevive porque ele declara **tokens**, não declarações `transition:` ou `animation:`. *"Fora do bloco de vocabulário"* e *"em toda parte"* coincidem por construção.

> **Emenda, do slice da landing.** O arquivo de tokens passou a ter **uma** declaração `animation:` — o `animation: none` que remove a respiração do glow no bloco `reduce` (§3). Ela passa no portão porque `none` não é duração nem curva, e a coincidência acima continua valendo pelo que ela de fato afirma: **o que o portão cobra é valor cravado, e o arquivo de tokens não crava nenhum fora dos tokens**. A regra não afrouxou; a frase é que era mais estreita que a regra.

---

## 8. Perdas nomeadas

**Os `ease-in-out` literais do `navbar.pcss`.** O Infima crava a curva em três lugares do navbar, e ele não tem escala de easing nenhuma. O adaptador alcança as variáveis de transição do Infima, mas não esses três. Ficam com a curva dele. Some da lista se um dia o navbar for reescrito por CSS próprio, o que não está previsto.

**A curva da seta do `summary`.** `--docusaurus-details-transition` é declarada dentro de classe de CSS Module. Ela é alcançada por seletor estrutural com escopo — a exceção 2 do adaptador —, então nem a duração nem a curva ficam de fora. *Correção sobre a redação original da decisão de motion, que a dava como perda: ela não é, porque a exceção do adaptador substitui o valor inteiro em vez de só a duração.*

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Escala de duração e o período do loop | herdado | [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) — medidos nas sete referências |
| Duas curvas de easing | herdado | [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) §1.5 — base dos quatro sites do alvo |
| Descarte do default do framework de utilitários | herdado | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §1 — default herdado, não aplicado |
| Easing nomeado por intenção, animação como token completo | mecanismo emprestado | [#10](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/10) §3 |
| Movimento composto da escala, não com número cravado | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §1 |
| Reduced-motion na camada de token, alcançando o Infima | herdado + adaptador | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5); [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 |
| Menor valor perceptível em vez de zero | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 — `useCollapsible` anima altura em JS |
| Remover, não encurtar, o que não termina sozinho | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 |
| `--sd-move-enter` na parada curta | herdado (correção) | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) corrigindo a [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) |
| Hover sob `@media (hover: hover)` | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — feature já em uso no Infima |
| Estado nunca anima geometria | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §3, sobre a assinatura da [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| Troca de tema instantânea | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §4 — consequência da ilha inerte da [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) |
| Nenhuma transição de cor no upstream | **origem própria (verificação)** | varredura de `html`, `body` e `:root` no Infima e no theme-classic, ao implementar o slice 1 |
| `scroll-behavior: auto` declarado | **origem própria (medição)** | [#83](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/83) — `grep` contra o CSS do Infima e do `theme-classic`: zero declarações de `scroll-behavior`. A âncora não decide o ponto; herdar uma ausência não é herdar |
| Anel de foco instantâneo | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §4, entregue ao contrato de foco da [#23](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/23) |
| Reveal por `animation-timeline: view()` | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5a — decisão do dono do projeto; não medido em nenhuma das sete |
| Guarda dupla que falha para visível e parado | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5a |
| Respiração do glow, e as regras de parcimônia | herdado (período) + origem própria (uso) | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b |
| `@keyframes` na folha global | herdado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) — CSS Modules manglam o nome |
| Portão de varredura de motion | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §2 |
| Os seis movimentos são camada 1, e o que é camada 3 é o consumo | **origem própria (correção)** | a redação do §5 dava dois deles como camada 3; medido ao implementar a landing |
| `global(…)` para referenciar keyframe global de dentro de módulo | **origem própria (correção)** | medido no CSS emitido do slice da landing; a regra original dava a referência como livre |
| `@media` por fora, `@supports` por dentro na guarda dupla | **origem própria (implementação)** | o `postcss-sort-media-queries` do preset de minificação destrói o aninhamento inverso |
| Respiração desligada por regra no bloco `reduce`, com gancho `data-sd-part` | **origem própria (implementação)** | nome de keyframe não sobrevive dentro de custom property, e a classe do módulo é hasheada |
| Entrada da ilha como consumidor de `--sd-move-showcase` | **origem própria (implementação)** | o movimento estava licenciado e sem consumidor; variável inerte é o defeito do Infima que não se copia |
| Os três `ease-in-out` do `navbar.pcss` como perda | **lacuna de alcance** | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) |
| A curva da seta do `summary` deixa de ser perda | **origem própria (correção)** | a exceção 2 do adaptador substitui o valor inteiro, não só a duração |
| `@starting-style` não sobrevive ao minificador | **origem própria (medição)** | o bloco é descartado com `Invalid property name`; zero ocorrências no CSS emitido, nos dois locales |
| Entrada a partir de `display: none` é `@keyframes` | **origem própria (correção)** | consequência da linha acima, encontrada na entrada do modal de busca do slice 7 |
| Keyframes idênticos fundidos num só no bundle | **origem própria (verificação)** | `postcss-merge-idents`; o que separa os movimentos é o token, não o nome |
