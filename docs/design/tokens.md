# Tokens

A sede única de valor do projeto. **Cor, comprimento, tempo e curva existem aqui e em nenhum outro documento** — os demais citam o nome do token e nunca o valor.

Tudo neste documento é obrigatório, salvo bloco marcado `Livre`. Todo bloco `Livre` nomeia o dono da liberdade.

> **Leia antes:** [ADR 1 — Doutrina de CSS](../adr/0001-doutrina-de-css.md) e [ADR 3 — Reduced-motion na camada de token](../adr/0003-reduced-motion-na-camada-de-token.md). O bloco abaixo não faz sentido sem o primeiro.

---

## 1. As três camadas, e a regra de referência

| Camada | O que é | Pode referenciar | Onde é declarada |
| --- | --- | --- | --- |
| **1 — raiz** | O **único** lugar do sistema com literal. Duas regiões: o bloco de troca (o que o corporativo edita) e a base (escalas e a forma da rampa). | nada | `:root` |
| **2 — semântica** | **Só cor.** Onde o papel é nomeado **e o modo é resolvido**. | camada 1 | `:root` (escuro) + `:root[data-theme='light']` (claro) |
| **3 — componente** | Token de uma parte de um componente. | camada 2 (cor) e camada 1 (dimensão) | **no escopo do próprio componente**, nunca em `:root` |

A regra, em duas frases:

- **Cor sempre desce pela camada 2.** Nenhum componente lê a rampa ou a marca direto.
- **Dimensão vem direto da camada 1.** Espaço, raio, duração, escala de texto e z-index não bifurcam por modo e não têm ambiguidade de papel — uma camada semântica de dimensão seria cerimônia sem carga, e triplicaria a contagem de tokens que quem implementa tem que achar.

A camada 3 copia um padrão medido, não inventado: o próprio Infima redeclara sete variáveis globais dentro do escopo de `.alert` para dar tema local a um componente sem CSS novo.

### Quando a camada semântica não tem o valor

A escada, e o degrau default nunca é um literal:

1. **Confira a lista de papéis.** Oito papéis com poucos qualificadores cabem numa tela — o caso comum é que o papel existe e não foi achado.
2. **Não mapeia? Declare um token de camada 3, no escopo do componente, derivado da camada 2.**
3. **A camada 2 não tem raiz para derivar? Aí abre-se qualificador ou papel novo na camada 2** — e isso é edição desta spec, com linha de procedência.

O que faz a escada funcionar é o degrau 2 custar o mesmo que errar. Você vai escrever uma declaração de qualquer jeito; a diferença entre o certo e o errado é `oklch(from …)` no lugar de `#hex`.

### As três operações legais de derivação

| Operação | Sintaxe | Quando |
| --- | --- | --- |
| Derivar de **uma** cor | `oklch(from var(--x) L C H)` · `rgb(from var(--x) r g b / n%)` | alfa, luminosidade, cromaticidade — a maioria dos casos |
| Misturar **duas** cores | `color-mix(in oklab, A n%, B)` | quando o valor é genuinamente a mistura de dois tokens |
| Dimensão | `calc()` sobre a base | raio, espaço, duração |

Hex novo, `px` avulso, `ms` avulso ou `cubic-bezier` solto é rejeitado — e tem um lugar preciso onde é legal: **a camada 1, e só ela.**

---

## 2. Os oito papéis da camada 2 — lista fechada

`surface` · `text` · `border` · `accent` · `shadow` · `focus` · `state` · `code`

**Fechada significa fechada:** abrir um nono é edição desta spec com linha de procedência, não decisão de quem implementa.

Dois deles existem por evidência, não por gosto:

- **`focus`** ganha papel próprio porque a dissecção mediu **duas ocorrências de `:focus` e zero de `:focus-visible`** no Infima inteiro, e nenhuma variável de anel. É o maior buraco funcional do framework.
- **`code`** foi o oitavo a entrar, e por motivo estrutural: a paleta de sintaxe **bifurca por modo**, e a camada 2 é o único lugar do sistema onde o modo diverge. Ela não cabe na camada 3 sem quebrar esse "exatamente um lugar".

---

## 3. O bloco

Este bloco é **espelho fiel de `src/css/tokens.css`** — o mesmo texto, não uma redação paralela. Ele existe para ser **copiado**, não redigitado. `scripts/espelho-tokens.mjs --verificar` reprova se os dois divergirem, e a CI o roda.

<!-- ESPELHO:INICIO — gerado de src/css/tokens.css por scripts/espelho-tokens.mjs -->

```css
/* =============================================================================
   shinydoc — tokens

   Este é o ÚNICO arquivo do repositório com valor literal. Cor, comprimento,
   tempo e curva nascem aqui e em nenhum outro lugar; o portão 1 reprova qualquer
   um dos quatro fora daqui (`npm run portao:1`).

   Três camadas, e o nome diz de que camada é:

     1 — raiz         --sd-<coisa> · --sd-<escala>-<degrau>
                      o único lugar com literal. Duas regiões: o bloco de troca
                      delimitado por SKIN … /SKIN (o que o corporativo edita) e a
                      base (escalas e a forma da rampa).
     2 — semântica    --sd-<papel>-<qualificador>, papel de LISTA FECHADA de oito:
                      surface · text · border · accent · shadow · focus · state · code
                      Só cor. É o ÚNICO ponto do sistema onde os modos divergem.
     3 — componente   --sd-<componente>-<parte>, declarada no escopo do componente
                      e nunca em :root.

   Cor sempre desce pela camada 2. Dimensão vem direto da camada 1.

   O Infima fica do outro lado de um adaptador de MÃO ÚNICA (fim do arquivo):
   o adaptador escreve --ifm-*, e nenhuma regra do projeto lê --ifm-*.

   Procedência das decisões: docs/design/tokens.md.
   Doutrina de CSS (por que :root[data-theme='light'] e por que @layer está fora):
   docs/adr/0001-doutrina-de-css.md.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   @property — as três raízes registráveis do bloco de troca

   Propriedade registrada com valor inválido cai para o initial-value, não para
   `unset`. Colagem errada degrada para o valor entregue de fábrica em vez de
   apagar fundos em silêncio.

   Registra-se exatamente as linhas do bloco de troca cuja entrega é literal E
   computacionalmente independente — é o que `initial-value` sabe expressar.
   As outras sete entregam referência (`var()`, `oklch(from …)`) ou pilha de
   fonte, e `initial-value` não aceita nenhuma das duas.
   ----------------------------------------------------------------------------- */

@property --sd-brand      { syntax: '<color>';  inherits: true; initial-value: #CF38C9; }
@property --sd-brand-tint { syntax: '<number>'; inherits: true; initial-value: 0.05; }
@property --sd-radius     { syntax: '<length>'; inherits: true; initial-value: 16px; }

/* =============================================================================
   CAMADA 1 — raiz
   ============================================================================= */

:root {
  /* SKIN — o que o corporativo edita para re-marcar. Nada além disto.
     Tipadas com @property: --sd-brand, --sd-brand-tint, --sd-radius.
     São as três linhas cuja entrega é literal — colagem inválida nelas cai no valor
     de fábrica. As outras sete entregam referência ou pilha de fonte, que
     initial-value não sabe expressar: colagem inválida ali apaga o que a linha
     alimenta, à vista. */
  --sd-brand:          #CF38C9;
  --sd-brand-on-dark:  oklch(from var(--sd-brand) max(l, 0.72) c h);
  --sd-brand-on-light: oklch(from var(--sd-brand) min(l, 0.50) c h);
  --sd-brand-tint:     0.05;
  --sd-surface-dark:   var(--sd-gray-800);
  --sd-surface-light:  var(--sd-gray-50);
  --sd-font-body:      'Geist', ui-sans-serif, system-ui, sans-serif;
  --sd-font-heading:   var(--sd-font-body);
  --sd-font-mono:      'Geist Mono', ui-monospace, SFMono-Regular, monospace;
  --sd-radius:         16px;
  /* /SKIN */

  /* ---------------------------------------------------------------------------
     A rampa de onze cinzas — tingida pelo matiz da marca

     Uma cor entra, um sistema inteiro de superfícies sai. As onze paradas de
     luminosidade são a média das quatro rampas Mintlify medidas: a FORMA da
     rampa é geometria herdada, o MATIZ é da marca.

     Marca acromática produz rampa neutra sem regra especial: cromaticidade zero
     entra em `c`, cinza puro sai.
     --------------------------------------------------------------------------- */
  --sd-gray-50:  oklch(from var(--sd-brand) 97%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-100: oklch(from var(--sd-brand) 95.5% calc(c * var(--sd-brand-tint)) h);
  --sd-gray-200: oklch(from var(--sd-brand) 91%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-300: oklch(from var(--sd-brand) 86%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-400: oklch(from var(--sd-brand) 71%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-500: oklch(from var(--sd-brand) 55%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-600: oklch(from var(--sd-brand) 44%   calc(c * var(--sd-brand-tint)) h);
  --sd-gray-700: oklch(from var(--sd-brand) 37.5% calc(c * var(--sd-brand-tint)) h);
  --sd-gray-800: oklch(from var(--sd-brand) 27.5% calc(c * var(--sd-brand-tint)) h);
  --sd-gray-900: oklch(from var(--sd-brand) 21.5% calc(c * var(--sd-brand-tint)) h);
  --sd-gray-950: oklch(from var(--sd-brand) 15.5% calc(c * var(--sd-brand-tint)) h);

  /* ---------------------------------------------------------------------------
     Matizes de estado — camada 1, fora do bloco de troca.

     Livre — skin corporativa (redesenho): move-se o ÂNGULO, dentro da família.
     Azul continua azul, verde continua verde. Não se movem L, C, nem as fórmulas
     de alfa — são elas que garantem AA sobre as duas superfícies em qualquer
     ângulo. Editar aqui é redesenhar, não re-marcar.

     São literais porque não há raiz no sistema de onde derivar um verde a partir
     de uma marca fúcsia, e porque a medição das sete referências declarou lacuna
     em cor semântica de callout.
     --------------------------------------------------------------------------- */
  --sd-hue-info:    245;
  --sd-hue-success: 150;
  --sd-hue-warn:     80;
  --sd-hue-danger:   27;

  /* ---------------------------------------------------------------------------
     Tipografia — camada 1. Os degraus levam o nome do alvo (text-xs … text-5xl)
     para a procedência ficar legível no próprio token.

     O degrau `5xl` nasceu com a landing, e ele NÃO é escala nova: é o próximo
     nome da mesma escala do alvo, e tem exatamente um consumidor — o título do
     hero, e só de 997px. Abaixo disso o hero desce para `4xl`, porque a regra da
     dobra manda no valor: a 375 × 667, um título em 48px estoura o teto da faixa
     do hero. Ver docs/design/landing.md §4.
     --------------------------------------------------------------------------- */
  --sd-type-xs:    12px;
  --sd-type-sm:    14px;    /* densidade de UI — o número mais unânime da amostra */
  --sd-type-base:  16px;    /* prosa */
  --sd-type-lg:    18px;
  --sd-type-xl:    20px;
  --sd-type-2xl:   24px;
  --sd-type-3xl:   30px;    /* título de página, até 996px */
  --sd-type-4xl:   36px;    /* título de página, de 997px; título do hero até 996px */
  --sd-type-5xl:   48px;    /* título do hero da landing, de 997px */

  /* Peso — três, nomeados por intenção. Nome de intenção não colide com o
     `semibold: 500` do Infima, que é a mesma palavra sobre outro número. */
  --sd-weight-body:    400;
  --sd-weight-ui:      500;
  --sd-weight-heading: 600;

  /* Entrelinha. h4 repete o valor de ui e mantém nome próprio: mesmo número
     hoje, intenções diferentes. */
  --sd-leading-prose: 1.75;
  --sd-leading-ui:    1.5;
  --sd-leading-code:  1.7143;
  --sd-leading-h1:    1.111;
  --sd-leading-h2:    1.333;
  --sd-leading-h3:    1.4;
  --sd-leading-h4:    1.5;

  /* Letter-spacing — um só. O corpo usa o `normal` do navegador, que é keyword
     e não valor, então não precisa de token. */
  --sd-tracking-tight: -0.025em;

  /* Falso-negrito — o realce do item ativo da sidebar, e ele não é enfeite.
     Trocar `font-weight` reflui o texto e o item PULA de largura no instante em
     que o leitor navega; meio pixel de sombra engrossa sem mexer na métrica.
     `currentColor` resolve no elemento, então o realce acompanha o acento sem
     par declarado e sem segundo valor para o modo claro. */
  --sd-negrito-optico: 0 0 0.4px currentColor;

  /* ---------------------------------------------------------------------------
     Espaço — base 4px, escada por calc(). Um literal só.
     Toda dimensão que o projeto travou é múltiplo de 8; a base fica em 4 para o
     meio-passo que a densidade de 14px exige em chip, badge e ícone.
     --------------------------------------------------------------------------- */
  --sd-space-1:  4px;   /* único literal da escala */
  --sd-space-2:  calc(var(--sd-space-1) *  2);
  --sd-space-3:  calc(var(--sd-space-1) *  3);
  --sd-space-4:  calc(var(--sd-space-1) *  4);
  --sd-space-5:  calc(var(--sd-space-1) *  5);
  --sd-space-6:  calc(var(--sd-space-1) *  6);
  --sd-space-8:  calc(var(--sd-space-1) *  8);
  --sd-space-10: calc(var(--sd-space-1) * 10);
  --sd-space-12: calc(var(--sd-space-1) * 12);
  --sd-space-16: calc(var(--sd-space-1) * 16);

  /* ---------------------------------------------------------------------------
     Forma — base 16px (a linha dez do bloco de troca), escada por múltiplo.
     Um número entra, a escada sai: trocar --sd-radius re-forma o site inteiro
     sem incoerência possível.
     --------------------------------------------------------------------------- */
  --sd-radius-md:   calc(var(--sd-radius) * 0.75);  /* bloco de código, callout, imagem, frame */
  --sd-radius-sm:   calc(var(--sd-radius) * 0.5);   /* botão, campo, aba, chip */
  --sd-radius-xs:   calc(var(--sd-radius) * 0.25);  /* código inline, badge, pílula de verbo */
  --sd-radius-full: 999px;                          /* marcador de Step, avatar, pílula */

  /* O fio. Um só, e ele NÃO é a separação do cartão — essa é o anel
     `0 0 0 1px` embutido na sombra multi-camada. Este aqui é a régua de
     site: o fio do footer, e o que vier a precisar de um traço de verdade. */
  --sd-border-width: 1px;

  /* ---------------------------------------------------------------------------
     Motion — escala de duração e vocabulário de easing. Camada 1, fora do bloco
     de troca.

     Livre — skin corporativa (redesenho): nenhum manual de marca especifica
     duração. Quem edita aqui está redesenhando, não re-marcando.

     Os números são medidos, não escolhidos: 200ms é o valor mais aplicado de
     toda a amostra; 300ms é a banda de mudança grande; 500ms é a banda de
     entrada grande; 5s é o único loop ambiente medido em qualquer uma das sete.
     --------------------------------------------------------------------------- */
  --sd-dur-1: 200ms;
  --sd-dur-2: 300ms;
  --sd-dur-3: 500ms;
  --sd-dur-ambient: 5s;     /* período do loop; não é parada da escala — ver reduced-motion */

  /* Duas curvas, nomeadas por intenção. Não há `ease-in`: nada neste site sai da
     tela, e variável sem consumidor é o defeito do Infima que não se copia. */
  --sd-ease-settle: cubic-bezier(0, 0, 0.2, 1);   /* responde ao leitor e assenta */
  --sd-ease-inout:  cubic-bezier(0.4, 0, 0.2, 1); /* tem início e fim na tela */

  /* Os seis movimentos. Cada um é um token COMPLETO — <duração> <easing> — que
     compõe da escala em vez de cravar número. É isso que faz reduced-motion
     alcançar o Infima que não escrevemos: o adaptador escreve
     --ifm-transition-fast a partir de --sd-dur-1, e a redefinição atravessa.

     Os quatro primeiros terminam sozinhos e ENCURTAM sob reduced-motion.
     Os dois últimos não terminam sozinhos — `reveal` é dirigido por rolagem,
     `ambient` é infinito — e são REMOVIDOS, não encurtados; quem os consome
     acrescenta timeline / `infinite`, e o bloco `reduce` os desliga. */
  --sd-move-state:    var(--sd-dur-1) var(--sd-ease-settle);
  --sd-move-enter:    var(--sd-dur-1) var(--sd-ease-settle);
  --sd-move-expand:   var(--sd-dur-2) var(--sd-ease-inout);
  --sd-move-showcase: var(--sd-dur-3) var(--sd-ease-settle);
  --sd-move-reveal:   var(--sd-dur-3) var(--sd-ease-settle);
  --sd-move-ambient:  var(--sd-dur-ambient) var(--sd-ease-inout);

  /* Habilita <details> a transicionar para height: auto. Mora aqui, junto do
     vocabulário, e não dentro do componente que a consome. */
  interpolate-size: allow-keywords;

  /* ---------------------------------------------------------------------------
     Estado de entrada — camada 1, FORA do bloco de troca.

     Espessura de anel não é identidade de marca; a cor já é, e ela segue o
     acento pela camada 2 (`--sd-focus-ring`).

     Estes são o segundo e o terceiro literal do sistema, e não vão disfarçados.
     `calc(var(--sd-space-1) / 2)` daria 2px e passaria em qualquer varredura —
     seria derivação FALSA: espessura de anel não tem relação com escala de
     espaço, e a régua deste projeto existe justamente para impedir número que
     só parece derivado. A procedência honesta é origem própria com âncora em
     norma: 2px é o limiar de perímetro da SC 2.4.13, 44px é a SC 2.5.5.

     Contrato completo: docs/design/foco.md e ADR 4.
     --------------------------------------------------------------------------- */
  --sd-focus-width:  2px;
  --sd-focus-offset: 2px;
  --sd-target-min:   44px;

  /* ---------------------------------------------------------------------------
     Dimensões do chrome — camada 1.
     A anatomia completa é de docs/design/chrome.md; aqui ficam só os valores
     que o adaptador precisa escrever, porque ele não pode escrever de lugar
     nenhum.
     --------------------------------------------------------------------------- */
  --sd-container-width: 1152px;  /* as DUAS variáveis de container do Infima recebem este */
  --sd-sidebar-width:    264px;
  --sd-navbar-height:     56px;
  --sd-toc-width:        288px;
  --sd-prose-width:      672px;

  /* A coluna de conteúdo — e portanto o cartão, que a preenche. É `.col--9` do
     grid de doze, então ela DERIVA do container em vez de repetir um número:
     1152 × 0,75 = 864. A coluna do TOC é o quarto restante, e ela está acima
     como valor porque o Infima a escreve como classe, não como conta. */
  --sd-doc-width: calc(var(--sd-container-width) * 0.75);

  /* A medida do código — o interior do cartão de doc, que é onde o código
     respira no resto do site: 864 − 2 × 48 = 768. Dentro da página de doc ela
     não precisa de regra (quem não está na lista de prosa fica com o interior
     inteiro do cartão); a landing não tem cartão, então ela é o único lugar do
     projeto que precisa CITAR a medida.

     Ela deriva do cartão e continua não sendo largura nova: é a mesma medida,
     nomeada. E é por ser derivada do cartão que a GRADE da landing não a usa —
     lá a largura é o container, porque a grade não é conteúdo de cartão
     nenhum. Ver docs/design/landing.md §3. */
  --sd-code-width: calc(var(--sd-doc-width) - 2 * var(--sd-space-12));

  /* A folga lateral do shell, de cada lado. Ela dobra a partir de 997px — o
     mesmo limiar em que a sidebar aparece. O par 32/64 é herdado da âncora; o
     ponto onde ele troca, não. */
  --sd-gutter: var(--sd-space-8);

  /* A altura máxima do modal de busca — o SEGUNDO token novo do slice 7, e o
     único do projeto medido contra a viewport.

     Ele está aqui, e não inline no CSS Module, porque a alternativa seria
     escrever `60dvh` num arquivo que não é este. `dvh` não está no padrão do
     portão 1 — `px|rem|em|ms|s` —, então o literal PASSARIA, e passar por buraco
     de varredura é a única forma de literal que este projeto não admite: a
     saída correta seria fechar o buraco, e fechá-lo aqui custa uma linha em vez
     de uma perna nova de portão.

     A LARGURA não vira token: ela é `--sd-code-width`, citada por nome. O painel
     abre com a medida do interior do cartão — a mesma que o leitor já estava
     lendo quando apertou a tecla —, e nomeá-la de novo criaria uma segunda cópia
     do mesmo número. */
  --sd-busca-height: 60dvh;

  /* ---------------------------------------------------------------------------
     Grade de cartões — camada 1, e UMA declaração serve a landing e o MDX.

     O piso de faixa da grade de `card-group`, derivado do limiar da âncora A
     TRÊS COLUNAS: o `Columns` dela colapsa em 42rem, com gap de 16. Descontados
     os dois gaps e dividido por três, sai o menor cartão que a âncora admite
     numa fila de três.

     42rem é 672, que é `--sd-prose-width`. Não é coincidência aproveitada: as
     duas medidas são o MESMO `max-w-2xl` do framework de utilitários da âncora,
     aparecendo duas vezes. Citar o token é honesto; repetir o número seria a
     segunda cópia que este arquivo existe para não ter.

     Com este piso, a contagem de cartões faz o trabalho sozinha — zero media
     query, zero container query, zero prop de colunas.

     A LISTA DE FAIXAS mora aqui junto, e não só o piso. O motivo é que ela tem
     dois consumidores — a grade de `card-group` dentro do MDX e a grade da
     landing —, e "uma declaração serve as duas" só é verdade se a declaração
     existir num lugar que as duas citem por nome. A escada de elevação já abriu
     este precedente: `--sd-shadow-1` também é valor composto, e pelo mesmo
     motivo.
     --------------------------------------------------------------------------- */
  --sd-card-min: calc((var(--sd-prose-width) - 2 * var(--sd-space-4)) / 3);
  --sd-card-grid: repeat(auto-fit, minmax(min(var(--sd-card-min), 100%), 1fr));
}

/* O gutter dobra no limiar único do projeto, que é o literal compilado do
   Infima. Não são os 1024px da âncora: dois limiares brigando no mesmo eixo
   custam mais do que a fidelidade compra. */
@media (min-width: 997px) {
  :root {
    --sd-gutter: var(--sd-space-16);
  }
}

/* =============================================================================
   CAMADA 2 — semântica. Só cor, e o único ponto do sistema onde o modo diverge.

   Escuro mora em :root porque o modo canônico é o FALLBACK; claro é override.
   Consequência: nunca escrevemos um seletor de modo escuro, então a armadilha
   de especificidade do `[data-theme='dark']` (0,1,0) contra o
   `html[data-theme='dark']` (0,1,1) do Infima fica fora de alcance por
   construção, não por disciplina. Ver ADR 1.

   Os dois blocos declaram a MESMA lista de tokens, na mesma ordem: token que
   aparece num e não no outro é um buraco visível.
   ============================================================================= */

/* ESCURO — canônico. O segundo seletor é a ilha de espetáculo: ela carrega o
   próprio substrato porque glow é emissão, e emissão só é legível contra
   escuridão. É um seletor a mais no bloco que já existe, não um bloco novo —
   e é isso que faz a ilha ser inerte na troca de tema. */
:root,
[data-sd-showcase] {
  color-scheme: dark;

  /* surface — `scrim` é o véu do `::backdrop` do modal de busca, e ele é o
     ÚNICO papel semântico novo do slice 7. Ele deriva do extremo escuro da
     rampa, que é o mesmo nos dois modos; o que bifurca é a opacidade, e ela
     bifurca por um motivo mecânico: no escuro a página já está perto da 950, e
     um véu leve não se distinguiria dela. No claro, a mesma opacidade
     transformaria a página num buraco preto em vez de empurrá-la para trás. */
  --sd-surface-page:  var(--sd-gray-950);
  --sd-surface-card:  var(--sd-surface-dark);
  --sd-surface-code:  var(--sd-gray-950);
  --sd-surface-wash:  rgb(from var(--sd-accent) r g b / 12%);
  --sd-surface-scrim: rgb(from var(--sd-gray-950) r g b / 72%);

  /* text — `faint` é a parada 500, o meio matemático da rampa. É a única
     reprovação deliberada de AA do sistema (3,04:1 aqui) e é PROIBIDA para
     texto de leitura: serve separador, placeholder e controle desabilitado.
     Texto secundário legítimo usa `muted`. */
  --sd-text-strong:  var(--sd-gray-50);
  --sd-text-body:    var(--sd-gray-300);
  --sd-text-muted:   var(--sd-gray-400);
  --sd-text-faint:   var(--sd-gray-500);
  --sd-text-inverse: oklch(from var(--sd-accent) clamp(0, (0.62 - l) * 1000, 1) 0 h);

  /* border — a tinta a 7%. Uma fórmula, dois modos, e ela reproduz os DOIS
     valores medidos no alvo, que lá saem de dois mecanismos diferentes. */
  --sd-border-subtle:  rgb(from var(--sd-text-strong) r g b / 7%);
  --sd-border-default: rgb(from var(--sd-text-strong) r g b / 12%);
  --sd-border-strong:  rgb(from var(--sd-text-strong) r g b / 20%);

  /* accent */
  --sd-accent:          var(--sd-brand-on-dark);
  --sd-accent-hover:    oklch(from var(--sd-accent) calc(l + 0.06) c h);
  --sd-accent-contrast: var(--sd-text-inverse);

  /* shadow — `lip` não mora aqui: realce é sempre luz, e luz não bifurca.
     Ver o bloco de valor único mais abaixo. */
  --sd-shadow-ring: var(--sd-border-subtle);
  --sd-shadow-cast: rgb(from var(--sd-gray-950) r g b / 60%);

  /* focus */
  --sd-focus-ring: var(--sd-accent);

  /* state */
  --sd-state-info:    oklch(80% 0.14 var(--sd-hue-info));
  --sd-state-success: oklch(80% 0.14 var(--sd-hue-success));
  --sd-state-warn:    oklch(80% 0.14 var(--sd-hue-warn));
  --sd-state-danger:  oklch(80% 0.14 var(--sd-hue-danger));

  --sd-state-info-fill:    rgb(from var(--sd-state-info)    r g b / 18%);
  --sd-state-success-fill: rgb(from var(--sd-state-success) r g b / 18%);
  --sd-state-warn-fill:    rgb(from var(--sd-state-warn)    r g b / 18%);
  --sd-state-danger-fill:  rgb(from var(--sd-state-danger)  r g b / 18%);

  /* A aresta do preenchimento — o par do `-fill`, com o alfa mais alto que a
     medição do callout registrou. Ela mora aqui e não na camada 3 porque o alfa
     BIFURCA por modo, e a camada 2 é o único lugar do sistema onde modo diverge:
     escrito no escopo do componente, o callout passaria a saber em que modo
     está, que é exatamente o que o catálogo fechou.

     A família é declarada inteira, como a de `-fill`. `danger` não tem consumidor
     no catálogo — a pílula de verbo usa preenchimento e texto, não aresta —, e
     uma família de quatro com um buraco no meio é pior de ler do que a quarta
     linha. */
  --sd-state-info-edge:    rgb(from var(--sd-state-info)    r g b / 30%);
  --sd-state-success-edge: rgb(from var(--sd-state-success) r g b / 30%);
  --sd-state-warn-edge:    rgb(from var(--sd-state-warn)    r g b / 30%);
  --sd-state-danger-edge:  rgb(from var(--sd-state-danger)  r g b / 30%);

  /* code — o oitavo papel. Existe na camada 2 porque a paleta de sintaxe
     bifurca por modo, e a camada 2 é o único lugar onde modo diverge.
     Cinco dos sete caem no hex medido da semente sem uma correção. */
  --sd-code-fg:        var(--sd-text-body);
  --sd-code-keyword:   #34D59A;
  --sd-code-string:    #FFED9C;
  --sd-code-function:  #F7B983;
  --sd-code-constant:  #94B5F7;
  --sd-code-parameter: #FF990A;
  --sd-code-operator:  #C99A6C;
  --sd-code-comment:   #A0A5AE;
}

/* CLARO — legítimo. */
:root[data-theme='light'] {
  color-scheme: light;

  /* surface — a página desce para a parada 100 e o cartão sobe para a 50: se a
     página ficasse na 50, o cartão teria que ser branco puro para subir, e aí o
     tint da marca sumiria da maior superfície do modo claro. A pastilha de
     código toma o extremo do modo, que aqui é branco. */
  --sd-surface-page:  var(--sd-gray-100);
  --sd-surface-card:  var(--sd-surface-light);
  --sd-surface-code:  oklch(from var(--sd-gray-50) 100% 0 h);
  --sd-surface-wash:  rgb(from var(--sd-accent) r g b / 12%);
  --sd-surface-scrim: rgb(from var(--sd-gray-950) r g b / 40%);

  /* text */
  --sd-text-strong:  var(--sd-gray-950);
  --sd-text-body:    var(--sd-gray-700);
  --sd-text-muted:   var(--sd-gray-600);
  --sd-text-faint:   var(--sd-gray-500);
  --sd-text-inverse: oklch(from var(--sd-accent) clamp(0, (0.62 - l) * 1000, 1) 0 h);

  /* border */
  --sd-border-subtle:  rgb(from var(--sd-text-strong) r g b / 7%);
  --sd-border-default: rgb(from var(--sd-text-strong) r g b / 12%);
  --sd-border-strong:  rgb(from var(--sd-text-strong) r g b / 20%);

  /* accent */
  --sd-accent:          var(--sd-brand-on-light);
  --sd-accent-hover:    oklch(from var(--sd-accent) calc(l - 0.06) c h);
  --sd-accent-contrast: var(--sd-text-inverse);

  /* shadow */
  --sd-shadow-ring: var(--sd-border-subtle);
  --sd-shadow-cast: rgb(from var(--sd-gray-950) r g b / 8%);

  /* focus */
  --sd-focus-ring: var(--sd-accent);

  /* state */
  --sd-state-info:    oklch(45% 0.13 var(--sd-hue-info));
  --sd-state-success: oklch(45% 0.13 var(--sd-hue-success));
  --sd-state-warn:    oklch(45% 0.13 var(--sd-hue-warn));
  --sd-state-danger:  oklch(45% 0.13 var(--sd-hue-danger));

  --sd-state-info-fill:    rgb(from var(--sd-state-info)    r g b / 10%);
  --sd-state-success-fill: rgb(from var(--sd-state-success) r g b / 10%);
  --sd-state-warn-fill:    rgb(from var(--sd-state-warn)    r g b / 10%);
  --sd-state-danger-fill:  rgb(from var(--sd-state-danger)  r g b / 10%);

  --sd-state-info-edge:    rgb(from var(--sd-state-info)    r g b / 25%);
  --sd-state-success-edge: rgb(from var(--sd-state-success) r g b / 25%);
  --sd-state-warn-edge:    rgb(from var(--sd-state-warn)    r g b / 25%);
  --sd-state-danger-edge:  rgb(from var(--sd-state-danger)  r g b / 25%);

  /* code */
  --sd-code-fg:        var(--sd-text-body);
  --sd-code-keyword:   #007651;
  --sd-code-string:    #746302;
  --sd-code-function:  #8B541C;
  --sd-code-constant:  #45619D;
  --sd-code-parameter: #8F5300;
  --sd-code-operator:  #84592B;
  --sd-code-comment:   #5F636C;
}

/* -----------------------------------------------------------------------------
   Camada 2 que NÃO bifurca por modo — fora dos dois blocos, de propósito.

   A regra que decide: token que referencia camada 2 bifurca e mora nos dois
   blocos; token que referencia só camada 1 não bifurca e mora aqui.

   --sd-shadow-lip é o único papel nessa situação. Realce é luz, e luz é o topo
   da rampa — não "a tinta do modo". Ancorado no topo da rampa, ele some sozinho
   no claro por IDENTIDADE MATEMÁTICA (o cartão claro É --sd-gray-50, e gray-50 a
   6% sobre gray-50 é gray-50), e volta a ser visível dentro da ilha escura sem
   redeclarar nada.

   A escada de elevação também mora aqui: a composição é a mesma nos dois modos,
   e o modo entra por `ring` e `cast`, que são pares declarados. Os comprimentos
   inline são a única exceção declarada à regra de que a camada 2 é só cor —
   box-shadow é valor atômico, e separar geometria de cor exigiria doze tokens de
   comprimento para compor quatro sombras.
   ----------------------------------------------------------------------------- */

:root {
  --sd-shadow-lip: rgb(from var(--sd-gray-50) r g b / 6%);

  --sd-shadow-1: 0 0 0 1px var(--sd-shadow-ring),
                 inset 0 1px 0 0 var(--sd-shadow-lip),
                 0 1px 2px -1px var(--sd-shadow-cast);
  --sd-shadow-2: 0 0 0 1px var(--sd-shadow-ring),
                 inset 0 1px 0 0 var(--sd-shadow-lip),
                 0 6px 16px -4px var(--sd-shadow-cast);
  --sd-shadow-3: 0 0 0 1px var(--sd-shadow-ring),
                 inset 0 1px 0 0 var(--sd-shadow-lip),
                 0 20px 48px -12px var(--sd-shadow-cast);
  --sd-shadow-sunken: 0 0 0 1px var(--sd-shadow-ring),
                 inset 0 1px 3px 0 var(--sd-shadow-cast);
}

/* =============================================================================
   CAMADA 3 — escopo da ilha, e SÓ dela.

   Regra SEPARADA de propósito: entrar no bloco `:root, [data-sd-showcase]`
   acima poria --sd-glow em :root, e o glow vazaria para o site inteiro.

   Consequência: numa página de documentação `var(--sd-glow)` não resolve para
   nada. A confinação deixa de ser regra que alguém precisa lembrar e vira fato
   de escopo.
   ============================================================================= */

[data-sd-showcase] {
  --sd-glow: radial-gradient(circle, rgb(from var(--sd-accent) r g b / 12%), transparent 70%);

  /* A caixa do glow, e ela é QUADRADA: o gradiente é `circle`, e caixa não
     quadrada faz o raio da luz depender de qual lado é maior. Um lado só, e ele
     é a largura do site — a luz tem a medida do conteúdo. Dois lados exigiriam
     um segundo comprimento sem raiz, que é a derivação falsa que este arquivo
     recusa em voz alta mais acima. */
  --sd-glow-tamanho: var(--sd-container-width);

  /* A tinta da figura do trilho. Derivação de ALFA, então é a operação 1 —
     `rgb(from …)` sobre UMA cor —, e não `color-mix` com `transparent`, que
     seria a operação 2 fingida sobre uma coisa que não é token.

     Ela mora aqui e não no CSS Module da landing por consequência do portão 1:
     cor nasce neste arquivo e em nenhum outro. E ganha de graça a propriedade
     da ilha — fora dela não resolve. */
  --sd-trilho-tinta: rgb(from var(--sd-text-strong) r g b / 24%);

  /* A amplitude da respiração — PAR DECLARADO sobre o alfa do glow, e não um
     segundo gradiente com outro alfa. São fatores, não cores: a camada
     decorativa multiplica por `opacity` o alfa que o gradiente já entrega, e o
     vale é o único número que a respiração acrescenta ao sistema.

     Eles moram aqui, no escopo da ilha, pelo mesmo motivo que `--sd-glow`: fora
     dela não resolvem, e a respiração fica confinada por FATO DE ESCOPO em vez
     de por regra que alguém precisa lembrar.

     A crista é 1 — o glow como o token o entrega. Uma crista acima de 1 seria
     um alfa que o gradiente não declara, ou seja o segundo valor que este par
     existe para não ter. */
  --sd-glow-vale:   0.62;
  --sd-glow-crista: 1;
}

/* =============================================================================
   Reduced-motion — propriedade da CAMADA DE TOKEN, não dos componentes.

   Nenhum componente escreve `@media (prefers-reduced-motion)` próprio, para
   sempre. Ver ADR 3.

   1ms e não 0s: transição de duração zero é onde o `useCollapsible` do
   theme-common, que anima altura em JS, trava — `transitionend` precisa
   continuar disparando.

   Como o adaptador escreve --ifm-transition-fast a partir de --sd-dur-1, o
   Infima e o theme-classic ficam parados junto, sem martelo
   `* { animation: none !important }` e sem um único !important.
   ============================================================================= */

@media (prefers-reduced-motion: reduce) {
  :root {
    --sd-dur-1: 1ms;
    --sd-dur-2: 1ms;
    --sd-dur-3: 1ms;
  }

  /* Os dois que NÃO terminam sozinhos são removidos, não encurtados.

     A respiração do glow sai por aqui: encurtá-la para 1ms produziria
     estroboscópio, que é o oposto exato do que `reduce` pede.

     Esta é a única regra de ELEMENTO do arquivo fora do adaptador, e ela existe
     porque `animation: none` não tem como ser entregue por token. O nome do
     `@keyframes` precisa aparecer LITERALMENTE numa declaração `animation` para
     sobreviver ao minificador (ver a nota em `custom.css`), então a respiração
     não pode viajar dentro de uma custom property — e sem isso o bloco `reduce`
     não alcançaria uma classe de CSS Module hasheada.

     O gancho é `data-sd-part`, que é contrato publicado do projeto, e o par de
     seletores dá (0,2,0) contra a (0,1,0) da classe do módulo: vence sem
     `!important` e sem depender de ordem de carga.

     O reveal não aparece aqui porque ele some pelo outro lado: a regra dele
     mora dentro de `@media (prefers-reduced-motion: no-preference)`, no CSS
     Module da landing, e simplesmente não entra. Ver ADR 3. */
  [data-sd-showcase] [data-sd-part='glow'] {
    animation: none;
  }
}

/* =============================================================================
   O ADAPTADOR — mão única

   O sistema nunca lê --ifm-*. Só escreve.

   Seletor `:root, :root[data-theme]`: (0,2,0) quando o atributo existe, o que
   vence o `html[data-theme='dark']` (0,1,1) do Infima. O script inline do
   Docusaurus escreve data-theme antes da primeira pintura, então o seletor com
   atributo é o que vale sempre; o `:root` solto fecha o buraco de JavaScript
   desligado, onde o site degrada para o Infima cru — feio, mas legível.

   O adaptador NÃO bifurca por modo. Ele lê camada 2, que já bifurcou.

   Este é o maior bloco do arquivo e é encanamento inerte: uma atribuição por
   variável do Infima que o chrome de fato renderiza. Aceito porque é o único
   bloco puramente mecânico do sistema, e é exatamente o bloco que se pula na
   leitura.

   Cada linha aqui foi conferida contra a lista de --ifm-* efetivamente
   consumidas por `var()` no Infima e no theme-classic. Variável declarada e
   nunca consumida NÃO entra: o adaptador não pode conter linha morta que
   sugira funcionar.
   ============================================================================= */

:root,
:root[data-theme] {
  /* --- terceiro namespace: nem --ifm-*, nem --sd-*. O adaptador escreve nele
         como escreve nos --ifm-*. DocRoot/Layout/Main soma
         --ifm-container-width + --doc-sidebar-width, então os dois se propagam
         juntos de graça. -------------------------------------------------- */
  --doc-sidebar-width: var(--sd-sidebar-width);

  /* --- container: AS DUAS. O Infima troca para -xl acima de 1440px, e fixar só
         a primeira faz o cartão alargar sozinho em tela larga. ------------- */
  --ifm-container-width:    var(--sd-container-width);
  --ifm-container-width-xl: var(--sd-container-width);

  /* --- preenchimento e tinta ---------------------------------------------- */
  --ifm-background-color:         var(--sd-surface-page);
  --ifm-background-surface-color: var(--sd-surface-card);
  --ifm-hover-overlay:            var(--sd-border-subtle);
  --ifm-color-content:            var(--sd-text-body);
  --ifm-color-content-secondary:  var(--sd-text-muted);
  --ifm-color-content-inverse:    var(--sd-text-inverse);
  --ifm-font-color-base:          var(--sd-text-body);
  --ifm-font-color-base-inverse:  var(--sd-text-inverse);
  --ifm-font-color-secondary:     var(--sd-text-muted);
  --ifm-heading-color:            var(--sd-text-strong);
  --ifm-color-black:              var(--sd-gray-950);
  --ifm-color-white:              var(--sd-gray-50);

  /* --- marca e estados.
         Exceção 5 do adaptador: das seis shades por cor semântica, só as VIVAS
         são atribuídas — base, -dark, -darker, -contrast-background e
         -contrast-foreground. As quatro restantes (-light, -lighter, -lightest,
         -darkest) foram resolvidas em build time pelo color-mod() e não têm
         consumidor: atribuí-las seria linha morta sugerindo funcionar.
         Nosso acento tem um degrau de hover, não uma família de shades, então
         -dark e -darker recebem o mesmo token — e isso é o desenho, não
         descuido. -------------------------------------------------------- */
  --ifm-color-primary:                     var(--sd-accent);
  --ifm-color-primary-dark:                var(--sd-accent-hover);
  --ifm-color-primary-darker:              var(--sd-accent-hover);
  --ifm-color-primary-contrast-background: var(--sd-surface-wash);
  --ifm-color-primary-contrast-foreground: var(--sd-text-strong);

  /* As shades de `secondary` apontam para o papel `border` e não para o papel
     `text`: `--ifm-color-secondary-dark` é lido por `--ifm-alert-border-color`
     dentro de `.alert--secondary`, e a tinta do corpo ali desenharia um anel de
     contraste máximo em volta da caixa.

     Correção de premissa, do slice do catálogo: a redação original dizia que
     `secondary` é *"o que a admonition `note` consome"*. Deixou de ser. O
     callout tem DOM próprio desde que `Admonition/Types` passou a apontar para
     ele, e `note` é a variante AZUL — quem é neutro é `info`. As shades ficam
     porque o Infima as lê em `.alert--secondary`, `.badge--secondary` e
     `.button--secondary`, e a regra do adaptador é sobre o que o framework
     consome, não sobre o que a nossa página hoje renderiza. */
  --ifm-color-secondary:                     var(--sd-border-strong);
  --ifm-color-secondary-dark:                var(--sd-border-strong);
  --ifm-color-secondary-darker:              var(--sd-border-strong);
  --ifm-color-secondary-contrast-background: var(--sd-surface-card);
  --ifm-color-secondary-contrast-foreground: var(--sd-text-body);

  --ifm-color-success:                     var(--sd-state-success);
  --ifm-color-success-dark:                var(--sd-state-success);
  --ifm-color-success-darker:              var(--sd-state-success);
  --ifm-color-success-contrast-background: var(--sd-state-success-fill);
  --ifm-color-success-contrast-foreground: var(--sd-text-body);

  --ifm-color-info:                     var(--sd-state-info);
  --ifm-color-info-dark:                var(--sd-state-info);
  --ifm-color-info-darker:              var(--sd-state-info);
  --ifm-color-info-contrast-background: var(--sd-state-info-fill);
  --ifm-color-info-contrast-foreground: var(--sd-text-body);

  --ifm-color-warning:                     var(--sd-state-warn);
  --ifm-color-warning-dark:                var(--sd-state-warn);
  --ifm-color-warning-darker:              var(--sd-state-warn);
  --ifm-color-warning-contrast-background: var(--sd-state-warn-fill);
  --ifm-color-warning-contrast-foreground: var(--sd-text-body);

  --ifm-color-danger:                     var(--sd-state-danger);
  --ifm-color-danger-dark:                var(--sd-state-danger);
  --ifm-color-danger-darker:              var(--sd-state-danger);
  --ifm-color-danger-contrast-background: var(--sd-state-danger-fill);
  --ifm-color-danger-contrast-foreground: var(--sd-text-body);

  /* --- escala de ênfase. O Infima a inverte no bloco dark; nós não podemos,
         porque o adaptador é cego ao modo. A rota correta é apontar cada degrau
         para um papel da camada 2, que já bifurcou. A escala tem dez degraus
         consumidos e o nosso texto tem quatro paradas, então alguns degraus
         repetem — repetir é honesto, inventar parada não seria.
         (o degrau 600 não é consumido por ninguém e por isso não é atribuído) */
  --ifm-color-emphasis-0:    var(--sd-surface-page);
  --ifm-color-emphasis-100:  var(--sd-surface-card);
  --ifm-color-emphasis-200:  var(--sd-border-subtle);
  --ifm-color-emphasis-300:  var(--sd-border-default);
  --ifm-color-emphasis-400:  var(--sd-border-strong);
  --ifm-color-emphasis-500:  var(--sd-text-faint);
  --ifm-color-emphasis-700:  var(--sd-text-muted);
  --ifm-color-emphasis-800:  var(--sd-text-body);
  --ifm-color-emphasis-900:  var(--sd-text-body);
  --ifm-color-emphasis-1000: var(--sd-text-strong);

  /* --- tipografia --------------------------------------------------------- */
  --ifm-font-family-base:      var(--sd-font-body);
  --ifm-font-family-monospace: var(--sd-font-mono);
  --ifm-heading-font-family:   var(--sd-font-heading);
  --ifm-font-size-base:        var(--sd-type-base);
  --ifm-line-height-base:      var(--sd-leading-prose);
  --ifm-heading-line-height:   var(--sd-leading-h2);
  --ifm-heading-font-weight:   var(--sd-weight-heading);
  --ifm-font-weight-light:     var(--sd-weight-body);
  --ifm-font-weight-normal:    var(--sd-weight-body);
  --ifm-font-weight-semibold:  var(--sd-weight-ui);
  --ifm-font-weight-bold:      var(--sd-weight-heading);

  --ifm-h1-font-size: var(--sd-type-3xl);
  --ifm-h2-font-size: var(--sd-type-2xl);
  --ifm-h3-font-size: var(--sd-type-xl);
  --ifm-h4-font-size: var(--sd-type-lg);
  --ifm-h5-font-size: var(--sd-type-base);
  --ifm-h6-font-size: var(--sd-type-sm);

  /* --- espaço ------------------------------------------------------------- */
  --ifm-global-spacing:          var(--sd-space-4);
  --ifm-spacing-horizontal:      var(--sd-space-4);
  --ifm-spacing-vertical:        var(--sd-space-4);
  --ifm-paragraph-margin-bottom: var(--sd-space-4);
  --ifm-leading:                 var(--sd-space-6);
  --ifm-leading-desktop:         var(--sd-space-6);
  --ifm-list-margin:             var(--sd-space-4);
  --ifm-list-item-margin:        var(--sd-space-1);
  --ifm-list-left-padding:       var(--sd-space-6);
  --ifm-list-paragraph-margin:   var(--sd-space-2);
  --ifm-hr-margin-vertical:      var(--sd-space-6);

  /* --- forma -------------------------------------------------------------- */
  --ifm-global-radius:            var(--sd-radius-sm);
  --ifm-button-border-radius:     var(--sd-radius-sm);
  --ifm-badge-border-radius:      var(--sd-radius-xs);
  --ifm-code-border-radius:       var(--sd-radius-xs);
  --ifm-pre-border-radius:        var(--sd-radius-md);
  --ifm-alert-border-radius:      var(--sd-radius-md);
  --ifm-card-border-radius:       var(--sd-radius);
  --ifm-breadcrumb-border-radius: var(--sd-radius-xs);
  --ifm-pagination-border-radius: var(--sd-radius-sm);
  --ifm-pagination-nav-border-radius: var(--sd-radius-md);

  /* --- elevação. Preenche a lacuna que o Infima tem por desenho: ele não
         redefine sombra no escuro, e as dele somem sobre fundo escuro. ------ */
  --ifm-global-shadow-lw: var(--sd-shadow-1);
  --ifm-global-shadow-md: var(--sd-shadow-2);
  --ifm-global-shadow-tl: var(--sd-shadow-3);
  --ifm-alert-shadow:      var(--sd-shadow-1);
  --ifm-blockquote-shadow: none;
  --ifm-navbar-shadow:     none;

  /* --- link --------------------------------------------------------------- */
  --ifm-link-color:            var(--sd-accent);
  --ifm-link-hover-color:      var(--sd-accent-hover);
  --ifm-link-decoration:       none;
  --ifm-link-hover-decoration: underline;

  /* --- código. --ifm-pre-background é sobrescrita dentro do bloco de código
         por --prism-background-color; ver a exceção 4 no fim do arquivo. ---- */
  --ifm-code-background:  var(--sd-surface-code);
  --ifm-pre-background:   var(--sd-surface-code);
  --ifm-pre-color:        var(--sd-code-fg);
  --ifm-pre-line-height:  var(--sd-leading-code);
  --ifm-pre-padding:      var(--sd-space-4);
  --ifm-code-padding-horizontal: var(--sd-space-1);
  --ifm-code-padding-vertical:   var(--sd-space-1);

  /* --- régua, citação e tabela ------------------------------------------- */
  --ifm-hr-background-color:      var(--sd-border-default);
  --ifm-blockquote-color:         var(--sd-text-muted);
  --ifm-blockquote-border-color:  var(--sd-border-strong);
  --ifm-blockquote-font-size:     var(--sd-type-base);
  --ifm-table-border-color:       var(--sd-border-subtle);
  --ifm-table-background:         transparent;
  --ifm-table-head-background:    transparent;
  --ifm-table-stripe-background:  var(--sd-border-subtle);
  --ifm-table-cell-color:         var(--sd-text-body);
  --ifm-table-head-color:         var(--sd-text-strong);
  --ifm-table-head-font-weight:   var(--sd-weight-ui);
  --ifm-table-cell-padding:       var(--sd-space-3);

  /* --- navbar ------------------------------------------------------------- */
  --ifm-navbar-height:                 var(--sd-navbar-height);
  --ifm-navbar-background-color:       var(--sd-surface-page);
  --ifm-navbar-link-color:             var(--sd-text-muted);
  --ifm-navbar-link-hover-color:       var(--sd-text-strong);
  --ifm-navbar-padding-horizontal:     var(--sd-space-6);
  --ifm-navbar-padding-vertical:       var(--sd-space-2);
  --ifm-navbar-item-padding-horizontal: var(--sd-space-3);
  --ifm-navbar-item-padding-vertical:   var(--sd-space-2);
  --ifm-navbar-search-input-background-color:  var(--sd-surface-card);
  --ifm-navbar-search-input-color:             var(--sd-text-body);
  --ifm-navbar-search-input-placeholder-color: var(--sd-text-faint);

  /* --- sidebar ------------------------------------------------------------ */
  --ifm-menu-color:                   var(--sd-text-muted);
  --ifm-menu-color-active:            var(--sd-accent);
  --ifm-menu-color-background-active: var(--sd-surface-wash);
  --ifm-menu-color-background-hover:  var(--sd-border-subtle);
  /* 16 e não 12: somado ao preenchimento de 8 que o `DocSidebar/Desktop` põe na
     lista, o item da sidebar começa em 24 — que é exatamente o preenchimento
     horizontal do navbar. A marca e o primeiro ícone de seção ficam na mesma
     vertical, e o alinhamento deixa de depender de coincidência. */
  --ifm-menu-link-padding-horizontal: var(--sd-space-4);
  --ifm-menu-link-padding-vertical:   var(--sd-space-2);

  /* --- TOC ---------------------------------------------------------------- */
  --ifm-toc-border-color:      var(--sd-border-subtle);
  --ifm-toc-link-color:        var(--sd-text-muted);
  --ifm-toc-padding-horizontal: var(--sd-space-3);
  --ifm-toc-padding-vertical:   var(--sd-space-2);

  /* --- breadcrumb e paginação -------------------------------------------- */
  --ifm-breadcrumb-color-active:           var(--sd-accent);
  --ifm-breadcrumb-item-background-active: var(--sd-surface-wash);
  --ifm-breadcrumb-padding-horizontal:     var(--sd-space-2);
  --ifm-breadcrumb-padding-vertical:       var(--sd-space-1);
  --ifm-breadcrumb-spacing:                var(--sd-space-1);
  --ifm-pagination-color-active:           var(--sd-accent);
  --ifm-pagination-item-active-background: var(--sd-surface-wash);
  --ifm-pagination-nav-color-hover:        var(--sd-accent);

  /* --- cartão, dropdown, abas, badge -------------------------------------- */
  --ifm-card-background-color:        var(--sd-surface-card);
  --ifm-card-horizontal-spacing:      var(--sd-space-6);
  --ifm-card-vertical-spacing:        var(--sd-space-6);
  --ifm-dropdown-background-color:    var(--sd-surface-card);
  --ifm-dropdown-link-color:          var(--sd-text-body);
  --ifm-dropdown-hover-background-color: var(--sd-border-subtle);
  --ifm-dropdown-font-weight:         var(--sd-weight-body);
  --ifm-tabs-color:                   var(--sd-text-muted);
  --ifm-tabs-color-active:            var(--sd-accent);
  --ifm-tabs-color-active-border:     var(--sd-accent);
  --ifm-badge-background-color:       var(--sd-surface-wash);
  --ifm-badge-border-color:           var(--sd-border-default);
  --ifm-badge-color:                  var(--sd-text-strong);

  /* --- footer ------------------------------------------------------------- */
  --ifm-footer-background-color: var(--sd-surface-page);
  --ifm-footer-color:            var(--sd-text-muted);
  --ifm-footer-link-color:       var(--sd-text-muted);
  --ifm-footer-link-hover-color: var(--sd-accent);
  --ifm-footer-title-color:      var(--sd-text-strong);
  /* O horizontal é o gutter do shell, e o `.container` do footer perde o
     preenchimento dele em `chrome.css` — sem isso o conteúdo do rodapé erra por
     16px contra a borda do cartão. O vertical é o ar de cima; o de baixo é
     maior e mora na regra do footer. */
  --ifm-footer-padding-horizontal: var(--sd-gutter);
  --ifm-footer-padding-vertical:   var(--sd-space-10);

  /* --- barra de rolagem --------------------------------------------------- */
  --ifm-scrollbar-track-background-color:      var(--sd-surface-page);
  --ifm-scrollbar-thumb-background-color:      var(--sd-border-strong);
  --ifm-scrollbar-thumb-hover-background-color: var(--sd-text-faint);

  /* --- motion. É por aqui que reduced-motion alcança o framework que não
         escrevemos. --ifm-transition-slow NÃO entra: o Infima a declara e
         ninguém a consome — atribuí-la seria linha morta. ------------------- */
  --ifm-transition-fast:            var(--sd-dur-1);
  --ifm-transition-timing-default:  var(--sd-ease-settle);
  --ifm-button-transition-duration: var(--sd-dur-1);
}

/* O título de página cresce no mesmo instante em que a sidebar aparece — um
   evento visual em vez de dois. 997px é o literal compilado do Infima; o projeto
   inteiro tem um limiar só. O par 30/36 é herdado; o ponto onde ele troca, não.
   Perda nomeada: entre 640 e 996px o título fica em 30px onde o alvo dá 36. */
@media (min-width: 997px) {
  :root,
  :root[data-theme] {
    --ifm-h1-font-size: var(--sd-type-4xl);
  }
}

/* Hover — a outra metade do mecanismo de `(pointer: coarse)`, e ela atravessa
   pelo adaptador exatamente como o reduced-motion.

   A regra do projeto é que hover inteiro vive sob `@media (hover: hover)`.
   Medido nesta implementação: o Infima tem **zero** ocorrência de
   `(hover: hover)` em todo o framework, e o theme-classic tem uma. Ou seja, o
   hover que NÓS não escrevemos gruda depois do tap — o fundo do item de sidebar
   e a cor do link de navbar ficam marcados até o dedo tocar noutro lugar.

   Brigar seletor a seletor com o framework custaria uma lista de alvos, que é
   exatamente a forma que o contrato de foco recusou. Neutralizar os tokens de
   hover dele alcança de uma vez tudo que TEM token, sem um único `!important`. O
   fundo do item ATIVO vem de outra variável e não é tocado.

   Perda nomeada, e ela é o limite do mecanismo: o hover do link de TOC e o do
   breadcrumb não são alcançáveis por aqui. O Infima os escreve contra
   `--ifm-color-primary` e `--ifm-breadcrumb-item-background-active`, que são o
   acento e o realce do item ativo — neutralizá-los apagaria o estado ativo
   junto. Os dois continuam grudando depois do tap, e o `:active` do contrato de
   entrada é o que dá retorno neles. Ver `docs/design/foco.md` §8.3. */
@media (hover: none) {
  :root,
  :root[data-theme] {
    --ifm-menu-color-background-hover: transparent;
    --ifm-navbar-link-hover-color: var(--sd-text-muted);
    --ifm-footer-link-hover-color: var(--sd-text-muted);
    --ifm-pagination-nav-color-hover: var(--sd-border-default);
  }
}

/* =============================================================================
   ADAPTADOR — as exceções com escopo

   Cinco pontos do Docusaurus não são alcançáveis de :root. A lista é FECHADA.
   ============================================================================= */

/* --- Exceção 1 — --ifm-alert-background-color-highlight -----------------------
   No Infima ela é rgba() LITERAL por variante, dentro de `.alert--*`, e não
   derivada da primária. É o ponto exato onde a re-marcação por variável do
   Infima vaza: trocar --ifm-color-primary não move nenhuma delas. Só o seletor
   de cada variante alcança. */
.alert--primary   { --ifm-alert-background-color-highlight: var(--sd-surface-wash); }
.alert--secondary { --ifm-alert-background-color-highlight: var(--sd-surface-card); }
.alert--success   { --ifm-alert-background-color-highlight: var(--sd-state-success-fill); }
.alert--info      { --ifm-alert-background-color-highlight: var(--sd-state-info-fill); }
.alert--warning   { --ifm-alert-background-color-highlight: var(--sd-state-warn-fill); }
.alert--danger    { --ifm-alert-background-color-highlight: var(--sd-state-danger-fill); }

/* --- Exceção 2 — os três --docusaurus-details-* ------------------------------
   Declaradas dentro de classe de CSS Module (`.details` em theme-common e em
   theme-classic), nunca em :root. Um seletor de elemento (0,0,1) perderia para
   a classe hasheada (0,1,0); `details[class]` é (0,1,1) e vence sem depender do
   hash, que muda a cada build.

   A curva `ease` do upstream fica fora do alcance de qualquer variável — o
   valor dele é `transform var(--ifm-transition-fast) ease`. Aqui trocamos o
   valor inteiro pelo movimento nomeado, então a curva também passa a ser nossa. */
details[class] {
  --docusaurus-details-decoration-color: var(--sd-border-strong);
  --docusaurus-details-summary-arrow-size: var(--sd-space-2);
  --docusaurus-details-transition: transform var(--sd-move-expand);
}

/* --- Exceção 3 — --docusaurus-tag-list-border --------------------------------
   Mesma mecânica: declarada em `.tag` dentro de CSS Module. O elemento é um
   <a> (o Tag renderiza um <Link>), então `a[class*='tag_']` é (0,1,1) e vence a
   classe hasheada. O prefixo `tag_` é estável: o padrão de nome é
   `[local]_[contenthash:base64:4]`, e `local` é o nome escrito no módulo. */
a[class*='tag_'] {
  --docusaurus-tag-list-border: var(--sd-border-default);
}

/* --- Exceção 4 — --prism-background-color ------------------------------------
   Ela não vem de CSS nenhum: `CodeBlock/Container` a injeta no atributo `style`
   INLINE, a partir de `themeConfig.prism.theme.plain`, via
   `getPrismCssVariables`. Nenhum seletor de folha de estilo vence estilo inline.

   Correção registrada: a arquitetura previa alcançá-la "por seletor na classe
   do bloco de código". Não é alcançável assim — medido no fonte da 3.10.2. O
   ponto de escrita é o shim de `themeConfig.prism.theme` em
   `docusaurus.config.js`, que só referencia token e não carrega um único hex.
   Escrever aqui uma regra `.theme-code-block { --prism-background-color: … }`
   seria exatamente a linha morta que sugere funcionar. */

/* --- Exceção 5 — as shades de cor semântica ---------------------------------
   Não é seletor, é regra de conteúdo do adaptador: só as shades VIVAS são
   atribuídas. Escrita no bloco do adaptador, acima. */
```

<!-- ESPELHO:FIM -->

---

## 4. Troca de skin

**São dez linhas. Nada além disto.**

O corporativo apaga a identidade visual do shinydoc editando o bloco entre `SKIN` e `/SKIN`, e sobra a arquitetura. Isso é o desenho, não um efeito colateral: o produto é a arquitetura de tokens, e uma superfície de troca que protegesse a forma do shinydoc estaria protegendo a demonstração contra o produto.

| Linha | O que ela move |
| --- | --- |
| `--sd-brand` | **Tudo.** É o hex do manual de marca, colado direto — sem converter para canais decimais. Dele saem a rampa de onze cinzas inteira, os dois acentos, as duas superfícies e a cor de link. |
| `--sd-brand-on-dark` | O acento no escuro. Vem com a trava de luminosidade que garante AA; mexer aqui é assumir a verificação de contraste no lugar da arquitetura. |
| `--sd-brand-on-light` | O mesmo, no claro. |
| `--sd-brand-tint` | Quanto a marca tinge a rampa de cinzas. Zero produz rampa neutra. |
| `--sd-surface-dark` | O cartão no escuro. Vem apontando para uma parada da rampa, e aceita um hex colado por cima. |
| `--sd-surface-light` | O cartão no claro. |
| `--sd-font-body` | A pilha do corpo e de todo texto de UI. |
| `--sd-font-heading` | A pilha dos títulos. Vem igual à do corpo. |
| `--sd-font-mono` | A pilha do código, inline e em bloco. |
| `--sd-radius` | A base da escada de forma. **Um número entra, a escada sai:** os outros quatro raios são múltiplos dele, então os cantos do site inteiro se re-formam sem incoerência possível. |

**A proteção não é travar valor; é a troca ser segura por construção.** Quatro mecanismos, todos já na arquitetura:

- a rampa **deriva** da marca, então nenhuma superfície sai da família;
- o raio é base de escala, e os demais são múltiplos;
- as três raízes literais são **tipadas** com `@property`, e colagem inválida nelas cai no valor de fábrica;
- os dois acentos vêm derivados do canônico, então não se acaba com três cores de marca desconexas por acidente.

Diferente, sim. Quebrado, não.

### A perda das outras sete, escrita

`@property` registra exatamente as linhas cuja entrega é **literal e computacionalmente independente** — é o que `initial-value` sabe expressar. Hoje isso produz três: `--sd-brand`, `--sd-brand-tint`, `--sd-radius`.

As outras sete entregam referência (`var()`, `oklch(from …)`) ou pilha de fonte, e `initial-value` não aceita nenhuma das duas. **Consequência concreta:** colagem inválida em `--sd-surface-dark` torna `--sd-surface-card` inválida em tempo de valor computado, e `background-color` cai para `transparent` — **o cartão some**. Com registro, teria degradado para o valor de fábrica.

A perda é real, está contida em **uma** propriedade — texto, rampa, acento e borda sobrevivem porque nenhum deles deriva das superfícies — e ela falha **à vista**: quem colou vê o cartão sumir.

Tipar as duas superfícies com o hex resolvido protegeria de verdade, e foi recusado: seria a única forma de literal derivado entrar no arquivo de tokens, e ele sairia da família no instante em que o corporativo colasse outra marca — um hex ameixa congelado sob uma marca azul.

### Redesenhar não é re-marcar

A latitude tem **dois níveis nomeados**:

| Nível | Onde | Garantia | Precisa ler a spec? |
| --- | --- | --- | --- |
| **Re-marcar** | as dez linhas do bloco de troca | segura por construção | não |
| **Redesenhar** | token de camada 1 **fora** do bloco que carregue marcador `Livre` | a do marcador, que nomeia o que se move e o que não | sim |

> **Livre — skin corporativa (redesenho).** A **escala de duração e o vocabulário de easing**. Nenhum manual de marca corporativo especifica duração; quem edita ali está redesenhando.

> **Livre — skin corporativa (redesenho).** Os quatro **matizes de estado**. O que se move é o **ângulo**, dentro da família: azul continua azul, verde continua verde. **Não** se movem `L`, `C`, nem as fórmulas de alfa — são elas que garantem AA sobre as duas superfícies em qualquer ângulo. Repintar `--sd-hue-danger` com o roxo da marca não é re-marcar: é quebrar significado.

---

## 5. A rampa, e por que ela deriva

Uma cor entra, um sistema inteiro de superfícies sai.

A rampa de onze cinzas é **tingida pelo matiz da marca** — comportamento medido nos quatro sites do alvo, onde um puxa violeta, outro azul, outro verde. E a prova de que é sistemático, não acaso: o quarto, cuja marca é acromática, recebe cinza **puro**. Aqui isso não é caso especial nem regra a mais: cromaticidade zero entra em `c`, rampa neutra sai.

**As onze paradas de luminosidade são a média das quatro rampas medidas, não a de uma delas.** Quatro medições do mesmo gerador estimam a intenção dele melhor que uma, e elas concordam entre si dentro de uma banda estreita — o que confirma que **a forma da rampa é geometria herdada, não escolha.**

**Correção que precisa carregar sem rastro da versão perdedora:** as paradas propostas na primeira redação da arquitetura de tokens erram monotonicamente em direção ao escuro, e chegam a seis pontos de luminosidade no degrau mais escuro. O fundo de página inteiro do modo canônico nasceria quase preto puro. **Valem as calibradas, que estão no bloco.**

### AA é propriedade da arquitetura, não verificação por skin

Duas travas de luminosidade — uma no escuro, uma no claro — aplicadas ao acento, aos quatro estados e à paleta de sintaxe garantem contraste **em qualquer marca que o corporativo cole**. Elas foram testadas nos vinte e quatro matizes do círculo com cromaticidade máxima.

Isso não era pedido. Caiu no colo quando a matemática mostrou que a alternativa — ajuste manual por skin — é infiscalizável numa spec cujo propósito é dispensar quem a escreveu.

Os dois acentos derivados saem como **expressão**, e não como hex repetido, porque **existe um vão de contraste em todos os vinte e quatro matizes**: o cartão escuro exige luminosidade alta, o claro exige baixa, e nenhum hex único fica nos dois lados. Não é *"ajuste só se o contraste pedir"* — pede sempre.

---

## 6. Onde os dois modos divergem, e onde não

**Escuro mora em `:root`; claro é `:root[data-theme='light']`.** É o **único** ponto do sistema onde os dois modos divergem. A camada 1 não bifurca (a rampa é a mesma; muda qual degrau cada papel usa), o adaptador não bifurca, e CSS de componente não bifurca.

Isso torna a auditoria uma leitura de bloco: **token que aparece no bloco escuro e não no claro é um buraco visível**, não uma omissão que passa batido. Os dois blocos declaram a mesma lista, na mesma ordem.

### O segundo seletor do bloco escuro

O bloco escuro tem **dois** seletores: `:root, [data-sd-showcase]`. O segundo é a **ilha de espetáculo**.

Glow é **emissão**, e emissão só é legível contra escuridão: o mesmo gradiente de acento **sobe** a luminância local no escuro e a **desce** no claro. Mesma operação, sinal invertido — traduzir produz mancha. Então o glow não traduz: a superfície de espetáculo **carrega o próprio substrato** e renderiza escura nos dois modos.

O custo arquitetural é **um seletor a mais no bloco que já existe**. Nenhum bloco novo, nenhuma briga de especificidade: custom property declarada no próprio elemento vence para a subárvore dele, e `:root[data-theme='light']` declara em `<html>`, que é outro elemento. E é isso que faz a ilha ser **inerte na troca de tema** — os tokens dela não mudam.

Quatro coisas caem de graça dentro da ilha, sem uma linha de configuração: o acento é o do escuro, a projeção volta à opacidade do escuro, o realce da aresta volta a ser visível, e o anel de foco já está verificado.

**Existe ilha escura, não existe ilha clara.** O critério é emissão, emissão precisa de escuridão, então o mecanismo tem uma direção só. Pendurar uma ilha clara "por simetria" criaria a licença que o critério existe para fechar: sem ele, qualquer componente difícil no claro pede dark-only, e o modo claro morre por mil concessões.

### O que **não** bifurca, e por quê

A regra que decide: **token que referencia camada 2 bifurca e mora nos dois blocos; token que referencia só camada 1 não bifurca e mora fora deles.**

`--sd-shadow-lip` é o único papel nessa situação, e é uma correção com história: ele estava escrito como par declarado, com alfa zerado no claro. Zerar o alfa desligava uma fórmula que havia **invertido de sinal** — ancorada na tinta do modo, ela produziria uma linha **escura** na aresta superior do cartão claro, ou seja luz vindo de baixo.

**Realce é luz, e luz é o topo da rampa — não "a tinta do modo".** Corrigida a âncora, o par some inteiro: no claro o cartão **é** o topo da rampa, e o topo da rampa sobre si mesmo é identidade matemática. **A aresta iluminada some no claro porque não há nada acima dela na rampa — não porque alguém a desligou.**

A escada de elevação mora junto, pelo mesmo motivo: a composição é a mesma nos dois modos, e o modo entra por `--sd-shadow-ring` e `--sd-shadow-cast`, que **são** pares declarados.

> **Exceção declarada, e é a única do sistema.** A camada 2 é só cor, e as quatro sombras carregam comprimentos inline. `box-shadow` é valor atômico: separar geometria de cor exigiria doze tokens de comprimento para compor quatro sombras. Elas moram no arquivo de tokens, cabem num bloco que se lê inteiro, e a exceção é **declarada** — não descuido.

### O glow mora na camada 3, em regra própria

`--sd-glow` **não é papel semântico** — é um gradiente, não uma cor, e não cabe na lista fechada de oito. Ele é token de componente, e o componente é a própria ilha.

**A regra dele é separada de propósito.** Entrar no bloco `:root, [data-sd-showcase]` o poria em `:root`, e o glow vazaria para o site inteiro. Fora da ilha, `var(--sd-glow)` **não resolve para nada** — a confinação deixa de depender de alguém lembrar dela e vira fato de escopo.

---

## 7. O adaptador de mão única

**O sistema nunca lê `--ifm-*`. Só escreve.** A doutrina está no [ADR 1](../adr/0001-doutrina-de-css.md); aqui está o que ela produz na prática.

O adaptador é o maior bloco do arquivo — encanamento inerte, uma atribuição por variável do Infima que o chrome de fato renderiza. Aceito porque é o único bloco puramente mecânico do sistema, e é exatamente o bloco que se pula na leitura.

Três regras de conteúdo:

1. **Ele não bifurca por modo.** Lê camada 2, que já bifurcou.
2. **Ele não pode conter linha morta que sugira funcionar.** Cada linha foi conferida contra a lista de `--ifm-*` efetivamente lidas por `var()` no Infima e no `theme-classic`.
3. **Ele escreve num terceiro namespace também.** `--doc-sidebar-width` não é `--ifm-*` nem `--sd-*`, e o adaptador escreve nele como escreve nos outros.

Dois achados da implementação que a arquitetura não tinha:

- **`--ifm-transition-slow` não tem consumidor.** O Infima a declara e nada a lê. A arquitetura previa que o adaptador a escrevesse; ela sai, pela regra 2.
- **A escala de ênfase do Infima é invertida por ele no bloco escuro, e nós não podemos invertê-la** — o adaptador é cego ao modo. A rota correta é apontar cada degrau para um papel da camada 2, que já bifurcou. A escala tem dez degraus consumidos e o nosso texto tem quatro paradas, então alguns degraus repetem. **Repetir é honesto; inventar parada não seria.** O degrau 600 não é consumido por ninguém e por isso não é atribuído.

### As cinco exceções com escopo — lista fechada

Cinco pontos do Docusaurus não são alcançáveis de `:root`.

| # | Ponto | Por que escapa | Como o adaptador alcança |
| ---: | --- | --- | --- |
| 1 | `--ifm-alert-background-color-highlight` | `rgba()` **literal por variante** dentro de `.alert--*`, não derivado da primária — é o ponto onde a re-marcação por variável do Infima **vaza** | uma declaração no seletor de cada variante |
| 2 | `--docusaurus-details-decoration-color`, `-transition`, `-summary-arrow-size` | declaradas dentro de classe de CSS Module, nunca em `:root` | `details[class]`, que é (0,1,1) e vence a classe hasheada sem depender do hash |
| 3 | `--docusaurus-tag-list-border` | idem, em `.tag` | `a[class*='tag_']`, mesma mecânica. O prefixo é estável porque o padrão de nome é `[local]_[hash]` |
| 4 | `--prism-background-color` | **não vem de CSS nenhum** | ver abaixo — a arquitetura previa um seletor, e ela estava errada |
| 5 | shades de cor semântica | quatro das seis são inertes | atribuir **só as vivas**: base, `-dark`, `-darker`, `-contrast-background`, `-contrast-foreground` |

**Correção registrada na exceção 4.** A arquitetura previa alcançar `--prism-background-color` *"por seletor na classe do bloco de código"*. **Não é alcançável assim** — medido no fonte da versão em uso: `CodeBlock/Container` injeta a variável no atributo `style` **inline**, via `getPrismCssVariables`, e nenhum seletor de folha de estilo vence estilo inline. O ponto de escrita é o **shim** de `themeConfig.prism.theme`. Escrever a regra de seletor mesmo assim seria exatamente a linha morta que sugere funcionar.

### O shim do Prism

O tema Prism é objeto JavaScript em `docusaurus.config.js`, e a leitura ingênua é que a paleta de sintaxe teria que morar lá — quebrando a regra de que todo número vive num bloco só. **Não quebra:** um tema do `prism-react-renderer` é `{plain, styles:[{types, style}]}`, e o `style` aceita qualquer string CSS, inclusive `var(--sd-code-keyword)`.

O tema vira um shim que **só referencia token**, e **nenhum valor de cor entra no arquivo de config**. Verificado no HTML gerado: os `<span>` de token saem com `style="color:var(--sd-code-keyword)"`, e o container com `style="--prism-background-color:var(--sd-surface-code)"`.

Um shim serve os **dois** modos: o Docusaurus cai em `prism.theme` quando `prism.darkTheme` não existe, e os tokens já bifurcaram. Declarar um segundo criaria um lugar a mais onde o modo diverge.

---

## 8. Tipografia

Dezenove nomes, e **zero valor novo** em relação ao que a direção de arte travou. Eles existem porque a regra mais dura da spec é *zero valor fora deste documento*: um arquivo de componente que escreve "peso 600" já é violação — ele precisa de um nome para citar.

- **Tamanho:** `--sd-type-xs` … `--sd-type-4xl`. Os degraus levam o nome do alvo, para a procedência ficar legível no próprio token e quem confere não precisar traduzir. Numerar de um a oito jogaria isso fora.
- **Peso:** `--sd-weight-body`, `-ui`, `-heading` — nomeados por **intenção**, não por número. `--sd-weight-600: 600` é uma identidade que não ensina nada, e nome de intenção fecha uma armadilha: o Infima chama **500** de `semibold`, e o nosso `semibold` seria 600 — a mesma palavra sobre dois números dentro do mesmo repositório.
- **Entrelinha:** `--sd-leading-prose`, `-ui`, `-code`, `-h1` a `-h4`. `-h4` repete o valor de `-ui` e mantém nome próprio: mesmo número hoje, intenções diferentes; fundi-los faria uma mudança em h4 mexer em toda a rotulagem de UI.
- **Tracking:** `--sd-tracking-tight`, um só, e **só em título**. O corpo usa o `normal` do navegador, que é keyword e não valor.

Isto **não** abre camada semântica de dimensão: são tokens de camada 1, declarados uma vez, consumidos direto pela camada 3.

### O degrau do título de página

O título fica em `--sd-type-3xl` até 996px e em `--sd-type-4xl` a partir de 997px — e **não** nos 640px medidos no alvo.

O par 30/36 é herdado; **o ponto onde ele troca, não.** 640 seria um segundo limiar de media query no mesmo eixo, contra a regra de limiar único do projeto, que alinha as media queries aos literais compilados do Infima. E alinhado, o título cresce **no mesmo instante em que a sidebar aparece** — um evento visual em vez de dois.

**Perda nomeada:** entre 640 e 996px o título fica em 30px onde o alvo dá 36. É a única faixa em que a nossa maior tipografia é menor que a da âncora.

### As fontes

**Geist e Geist Mono, variáveis, OFL, auto-hospedadas em `static/fonts/`, com os `@font-face` no nosso CSS. Zero CDN.** Requisição externa esbarra na CSP do ambiente corporativo alvo, e auto-hospedar custa o mesmo — zero dependência npm —, então não há troca a fazer.

O `src` começa em `/` e mesmo assim sobrevive ao `baseUrl` em subcaminho: o webpack do Docusaurus registra os diretórios estáticos em `resolve.roots`, resolve o arquivo em build e reemite a URL já prefixada. Não é link absoluto escrito à mão — é resolução de módulo.

**Custo nomeado:** o arquivo é emitido duas vezes — uma pela cópia literal de `static/`, outra pelo webpack com hash de conteúdo. São dois arquivos pequenos, e a alternativa seria cravar o `baseUrl` na folha de estilo.

### Renderização de prosa

`hyphens: none` porque a hifenização de português é inconsistente entre motores, e na medida de prosa deste projeto o alinhamento à esquerda não precisa dela. `text-wrap: pretty` no corpo e `balance` em título e lead, que matam órfã sem custar nada.

> **Livre — ninguém.** Nada aqui é opcional. A linha existe porque estas três regras não tinham endereço e viravam folclore.

---

## 9. Motion

Os valores moram aqui; a doutrina mora em [`motion.md`](motion.md) e no [ADR 3](../adr/0003-reduced-motion-na-camada-de-token.md).

Três paradas de duração mais um período de loop, duas curvas nomeadas por intenção, e **seis movimentos** que são tokens completos — `<duração> <easing>` — compostos da escala em vez de cravar número. É isso que faz reduced-motion alcançar o framework que não escrevemos.

Os números são medidos, não escolhidos: a parada curta é o valor mais aplicado de toda a amostra das sete referências; a média é a banda de mudança grande; a longa é a banda de entrada grande; e o período de loop é o único loop ambiente medido em qualquer uma das sete.

**Correção que precisa carregar sem rastro da versão perdedora:** `--sd-move-enter` compõe da parada **curta**, não da longa. O único consumidor dele no site inteiro é o modal de busca, e a mesma medição que produziu o token registra o modal na banda curta em três dos sites. A banda longa fica com `--sd-move-showcase`, cujo consumidor é entrada grande de verdade.

O default do framework de utilitários do alvo **não entra**: é *default* herdado por cinco dos sete sites sem que ninguém o escolhesse, e a única aplicação medida dele é residual contra centenas da parada curta. Medição prefere o aplicado ao herdado.

**Não há `ease-in`.** Nada neste site sai da tela: tudo ou entra, ou muda em lugar. Um terceiro easing sem consumidor seria variável inerte — o defeito do Infima que este sistema existe para não copiar.

---

## 10. Contraste verificado

Todos os pares onde AA é obrigatório, nos dois modos, sobre **as duas** superfícies.

| Par | Escuro | Claro |
| --- | ---: | ---: |
| `text-strong` sobre cartão / página | 13,54 / 17,87 | 17,87 / 17,10 |
| `text-body` sobre cartão / página | 9,66 / 12,75 | 9,34 / 8,94 |
| `text-muted` sobre cartão / página | 5,75 / 7,59 | 7,15 / 6,84 |
| acento como link, sobre cartão / página | 5,34 / 7,04 | 6,26 / 5,99 |
| `text-inverse` sobre preenchimento de acento | 7,54 | 6,87 |
| anel de foco vs cartão / página (SC 1.4.11 pede 3:1) | 5,34 / 7,04 | 6,26 / 5,99 |
| `text-strong` sobre o wash do item ativo | 15,55 | 13,86 |
| sintaxe, pior token, sobre a pastilha | 7,77 | 5,66 |
| ícone de estado sobre o próprio fundo, pior caso | 5,23 | 5,52 |
| corpo sobre fundo de callout, pior caso | 6,47 | 7,98 |

### A única reprovação, e ela é deliberada

**`--sd-text-faint` reprova: 3,04:1 no escuro e 4,45:1 no claro.**

É a parada 500 — o meio matemático da rampa —, então é o pior caso **por construção**, e nenhum ajuste salva.

> **Proibido para texto de leitura.** `--sd-text-faint` existe para separador, placeholder e controle desabilitado, que é isento pela SC 1.4.3. Texto secundário legítimo usa `--sd-text-muted`, que passa nos dois modos.

### A garantia é da arquitetura, não desta skin

**O contraste é propriedade das paradas, não da marca.** A tabela foi rodada com marca violeta e com marca âmbar: idêntica até a segunda casa decimal. A cromaticidade da rampa é pequena demais para mover luminância relativa.

E as travas de luminosidade foram testadas nos vinte e quatro matizes do círculo com cromaticidade máxima: **pior caso 5,17:1** nos dois modos. **Qualquer hex que o corporativo cole herda esta tabela**, com folga sobre 4,5:1, sem que ninguém verifique nada.

Consequência que vale dita: mover o ângulo de um matiz de estado **não consegue** quebrar contraste. A única coisa que ele quebra é significado — e é por isso que o marcador `Livre` restringe a *família* e não escreve banda numérica. Cravar um "±20°" seria invenção.

---

## 11. Os portões que este documento cobra

| # | Portão | Cadência | Como roda |
| ---: | --- | --- | --- |
| 1 | Literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | commit | `npm run portao:1` |
| 2 | `transition:`/`animation:` com `ms`, `s` ou `cubic-bezier` cravado | commit | `npm run portao:2` |
| 6 | As três rotas contra o host real, nos dois locales | implantação | `npm run portao:6 -- <url-base> [rota]` |

Mais a verificação de espelho: `node scripts/espelho-tokens.mjs --verificar`.

**Limite conhecido do portão 1, escrito em voz alta:** media query não lê custom property, e o limiar dela é um comprimento. Enquanto o único limiar do projeto morar no arquivo de tokens, o portão passa sem exceção. O dia em que um CSS Module precisar do limiar é o dia de reabrir esta linha — e não de afrouxar o portão em silêncio.

**Segundo limite, e ele foi fechado em vez de explorado.** O padrão do portão 1 é `px|rem|em|ms|s`; `dvh` **não está nele**. A altura máxima do modal de busca é `60dvh`, e escrevê-la inline num CSS Module passaria pela varredura. **Passar por buraco de varredura é a única forma de literal que este projeto não admite** — a saída correta seria fechar o buraco, e fechá-lo custa uma linha aqui em vez de uma perna nova de portão. Por isso `--sd-busca-height` é token, e o portão 1 continua com o padrão que sempre teve.

**Achado da implementação:** o `postcss-calc`, que roda na minificação, **não entende sintaxe de cor relativa** e emite aviso ao encontrar `calc(c * var(--sd-brand-tint))` e `calc(l + 0.06)`. Ele **não toca no valor** — verificado byte a byte no CSS emitido, a rampa e os acentos saem intactos. O aviso é ruído, não defeito, e está registrado aqui para ninguém "consertar" a rampa por causa dele.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| Indireção raiz → semântica | herdado | [#3](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/3) §1.1 — o token de papel apontando para a raiz injetada, no alvo |
| Token de componente no escopo do componente | mecanismo emprestado | [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) §1.4 — `.alert` do Infima redeclara sete tokens globais |
| Rampa de onze cinzas tingida pelo matiz da marca | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) §3.2 — medido nos quatro sites |
| Expressá-la em `oklch(from …)` | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §3 — o alvo calcula fora do CSS; sem build, é a única rota |
| As onze paradas de luminosidade | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §1 — média das quatro rampas medidas |
| `--sd-brand-tint` | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §1 — reproduz a banda de cromaticidade medida |
| Matiz da marca, fúcsia | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §11 — nenhuma medição sustenta matiz de marca |
| Travas de luminosidade do acento | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §2a — verificadas em 24 matizes |
| Três acentos no bloco de troca | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) §3.1 |
| Tipografia dentro do contrato de troca | delta deliberado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) §3.3 — no alvo é *escape*, não contrato |
| `--sd-radius` no bloco de troca, e o valor | delta deliberado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §2c, derivado do grid da [#20](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/20) |
| Escada de raio por múltiplo | mecanismo emprestado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §7 — raio paramétrico da Vapi, disciplina do Neon |
| Escuro em `:root`, claro como override | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §4 — Infima e alvo põem claro em `:root`; axioma 4 |
| Adaptador de mão única | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2, derivado das armadilhas da [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) |
| As cinco exceções com escopo | herdado | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| A exceção 4 não é alcançável por seletor | **origem própria (correção)** | medido no fonte da 3.10.2 ao implementar o slice 1 — `style` inline vence folha de estilo |
| `--ifm-transition-slow` fora do adaptador | **origem própria (correção)** | varredura de `var(--ifm-*)` no Infima e no theme-classic — zero consumidores |
| Ênfase mapeada em papéis da camada 2 | origem própria | consequência de o adaptador ser cego ao modo |
| `@property` em três raízes | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §2, corrigindo a [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §2d |
| Oito papéis semânticos | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5.1 abre o oitavo sobre os sete da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §6 |
| Camada semântica inteira nos dois modos | herdado + origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5 |
| Página clara na parada 100 | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §4 — preserva o tint na maior superfície do claro |
| Pastilha de código no extremo do modo | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §4 — Clerk e a anatomia da Perplexity |
| Borda = tinta a 7% | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5 — reproduz os dois valores medidos com um mecanismo |
| `--sd-shadow-lip` como valor único, ancorado no topo da rampa | origem própria | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §2, corrigindo a tinta da [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| Escada de elevação em quatro degraus, com o anel embutido | mecanismo emprestado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §8 — sombra multi-camada do Clerk |
| `--sd-shadow-cast` como par declarado | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §2 — derivá-lo sai ajuste de curva com literais mágicos |
| Segundo seletor do bloco escuro, e a ilha | origem própria | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3 — glow não existe em nenhuma das sete |
| `--sd-glow` na camada 3, em regra própria | origem própria | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §3a |
| Paleta de sintaxe | herdado (semeadura autorizada) | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §9 — 13 hex Shiki do Neon; 5 de 7 intactos |
| `comment` deixa de ser idêntico nos dois modos | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §9a — o valor do Neon reprova sobre branco |
| Shim de config que só referencia token | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| Quatro matizes de estado | **lacuna de medição** | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §10 — não medidos em nenhuma das sete |
| `Livre` dos matizes move ângulo, não tom | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §3, corrigindo a redação da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| Fórmula de preenchimento de callout | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — medida na Perplexity |
| Fórmula de **aresta** de callout, e ela mora na camada 2 | herdado (fórmula) + **origem própria (implementação)** (a casa) | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) trava 30%/25%; o alfa bifurca por modo, e camada 2 é o único lugar onde modo diverge |
| `--sd-card-min` derivado da medida de prosa | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — o limiar `@2xl` da âncora a três colunas; 42rem e a medida de prosa são o mesmo `max-w-2xl` |
| `secondary` deixa de ser "o que a `note` consome" | **origem própria (correção)** | o callout ganhou DOM próprio no slice do catálogo, e `note` é a variante azul — quem é neutro é `info` ([#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15)) |
| Escala de espaço base 4 | **lacuna de medição** | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §7 — não medida em nenhuma das sete |
| Nomes de tipografia | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §1 — nomear é nosso; a gramática de camada é da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) |
| Degraus `xs…4xl` e os valores | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §6 — medido nos quatro |
| Degrau do título em 996/997 | delta deliberado | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §4 — par medido, ponto de troca movido pela regra da [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) |
| Geist / Geist Mono auto-hospedadas | delta deliberado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §6 |
| `hyphens: none`, `text-wrap: pretty` | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §6 — pt-BR; nenhuma referência medida nesse eixo |
| Escala de duração e as duas curvas | herdado | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §1 — medidas nas sete |
| `--sd-move-enter` na parada curta | herdado (correção) | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) corrigindo a [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) |
| Dois níveis de latitude | mecanismo emprestado | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §3 — a distinção é da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11), aqui vira regra |
| Dimensões do chrome no arquivo de tokens | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 — a anatomia é de `chrome.md` |
| `--sd-type-5xl`, com um consumidor só | herdado (nome) + origem própria (uso) | o nome continua a série `text-xs … text-4xl` do alvo; o consumidor é o título do hero — [`landing.md`](landing.md) §4 |
| `--sd-code-width` derivada do cartão | **origem própria (implementação)** | a medida já existia como interior do cartão; a landing é o primeiro consumidor que precisa citá-la por nome |
| Par de amplitude do glow, no escopo da ilha | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b — amplitude é par declarado sobre o alfa, não número novo |
| Regra de elemento no bloco `reduce`, com gancho `data-sd-part` | **origem própria (implementação)** | ADR 3 — de `tokens.css` não há seletor que alcance uma classe hasheada, e nome de `@keyframes` não sobrevive dentro de custom property ([`motion.md`](motion.md) §6) |
| Portão de `grep` de literal | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §7 |
| Espelho verificado por script | origem própria | consequência da regra de fonte única da [#9](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/9) |
| Aviso do `postcss-calc` sobre cor relativa | **origem própria (achado)** | observado ao rodar o build do slice 1; valor emitido conferido byte a byte |
| `--sd-surface-scrim`, par declarado | **origem própria** | não há medição de véu nas referências. A opacidade bifurca por motivo mecânico: no escuro a página já está na parada 950, e no claro o mesmo alfa faria buraco em vez de profundidade ([`busca.md`](busca.md) §5.3) |
| `--sd-busca-height` como token de camada 1 | **origem própria (correção)** | `dvh` não está no padrão do portão 1, e o literal passaria pela varredura — fechar o buraco custa uma linha aqui |
| A largura do modal de busca **não** vira token | **origem própria (implementação)** | é `--sd-code-width`, o interior do cartão, citado por nome; nomeá-la de novo criaria segunda cópia do mesmo número |
