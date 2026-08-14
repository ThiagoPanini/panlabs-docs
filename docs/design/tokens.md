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

   ---------------------------------------------------------------------------
   A TIPAGEM `<color>` DE --sd-brand É CARGA ESTRUTURAL, NÃO DECORAÇÃO.

   E o mecanismo é mais estreito do que a leitura fácil sugere. Medido em
   Chrome 148, arquivo a arquivo:

     · SEM o registro e com marca VÁLIDA, a cadeia
       `brand → on-dark → accent → text-inverse` resolve inteira e byte a byte
       igual. Custom property não registrada é token stream, e o texto
       `oklch(from … )` aninhado é CSS legal — a substituição atravessa;
     · SEM o registro e com marca INVÁLIDA, a cadeia inteira cai de uma vez:
       marca, as onze paradas da rampa, os dois acentos, TODA superfície e o
       rótulo do botão primário viram a cor herdada. Sem aviso, sem erro;
     · COM o registro e com marca inválida, tudo isso cai para o `initial-value`
       desta linha e o site continua de pé, numa skin de fábrica.

   Ou seja: o que a tipagem compra não é a cadeia funcionar — é ela **não
   evaporar inteira** na única edição que a superfície de troca convida a fazer.
   O raio de dano de uma linha errada é o site inteiro, e este registro é o que
   o contém.

   Consequência para quem edita: tirar esta linha não é aliviar tipagem. É
   trocar uma skin de fábrica por uma página sem cor nenhuma no dia em que
   alguém colar um valor torto.
   --------------------------------------------------------------------------- */

@property --sd-brand      { syntax: '<color>';  inherits: true; initial-value: #A3489D; }
@property --sd-brand-tint { syntax: '<number>'; inherits: true; initial-value: 0.075; }
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
  --sd-brand:          #A3489D;
  --sd-brand-on-dark:  oklch(from var(--sd-brand) max(l, 0.72) c h);
  --sd-brand-on-light: oklch(from var(--sd-brand) min(l, 0.50) c h);
  --sd-brand-tint:     0.075;
  --sd-surface-dark:   var(--sd-gray-800);
  --sd-surface-light:  var(--sd-gray-50);
  --sd-font-body:      'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --sd-font-heading:   var(--sd-font-body);
  --sd-font-mono:      'Paper Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --sd-radius:         16px;
  /* /SKIN */

  /* O `L` do hex da marca é INERTE, e é isso que faz a troca ser cirúrgica: a
     rampa reescreve `L` em toda parada e consome só `c` e `h`, e as duas travas
     de acento fazem o mesmo (`max(l, 0.72)` e `min(l, 0.50)`). Quem serena a
     marca é o CROMA — 0,160 no lugar dos 0,240 de antes.

     A linha 4 existe para segurar o produto `c × tint` em 0,0120, que é a banda
     de cromaticidade que a medição das quatro rampas pôs na rampa: 0,160 × 0,075
     é o mesmo 0,0120 de 0,240 × 0,05. Com ela, DEZ das onze paradas saem byte a
     byte idênticas às da skin anterior e a décima primeira (`gray-600`) difere
     em 1/255 num canal. A superfície do site inteiro não se mexe; só o acento
     esfria. Ver docs/design/tokens.md §5. */

  /* ---------------------------------------------------------------------------
     A rampa de onze cinzas — tingida pelo matiz da marca

     Uma cor entra, um sistema inteiro de superfícies sai. As onze paradas de
     luminosidade são a média das quatro rampas Mintlify medidas: a FORMA da
     rampa é geometria herdada, o MATIZ é da marca.

     Marca acromática produz rampa neutra sem regra especial: cromaticidade zero
     entra em `c`, cinza puro sai.

     A rampa é declarada INTEIRA, e hoje a 200 é a única parada sem consumidor.
     Isso vai escrito pelo mesmo argumento que sustenta a família de `-edge` mais
     abaixo: uma rampa de onze com um buraco no meio é pior de ler do que a
     parada a mais, e quem re-marca precisa da geometria completa para julgar o
     que a marca dele produz em cada degrau. Parada é geometria, não consumidor.
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
     de uma marca fúcsia.

     Medidos contra a âncora (issue #83): ícone dos callouts `Note`/`Warning`/
     `Tip`/`Danger` em mintlify.com/docs, convertido de sRGB para o H de OKLCH.
     `success` (151,3°) e `danger` (26,9°) já batiam com o ângulo anterior a
     menos de 1,5° — ficaram como estavam. `info` (265,6°) e `warn` (61,9°)
     divergiam ~20°; os dois passam a ser o ângulo medido.
     --------------------------------------------------------------------------- */
  --sd-hue-info:    266;
  --sd-hue-success: 150;
  --sd-hue-warn:     62;
  --sd-hue-danger:   27;

  /* ---------------------------------------------------------------------------
     Tipografia — camada 1. Os degraus levam o nome do alvo (text-xs … text-4xl)
     para a procedência ficar legível no próprio token.

     NÃO HÁ DEGRAU DE DISPLAY, e a escala termina no `4xl`. Ela já terminou no
     `4xl` uma vez: o `5xl` saiu quando o título do hero passou a caber numa
     linha em 60, e a lápide dele dizia que deixá-lo declarado seria variável sem
     consumidor — o defeito do Infima que este arquivo nomeia para não copiar.

     O `6xl` SAIU AGORA, pela mesma régua e pelo motivo inverso: ele tinha um
     consumidor no site inteiro — o título do hero da landing, de 997px —, e a
     landing saiu. Ver docs/design/README.md §5.1 e a issue #94.

     A régua que decide isto está em docs/design/README.md, no fecho da
     varredura: o que se remove é órfão SEM MOTIVO, não órfão. `--sd-gray-200`
     fica porque é parada de uma rampa declarada inteira, e rampa com buraco é
     pior de ler; `--sd-toc-width` fica porque nomeia um elo da cadeia de
     proporções. Um degrau de display não é elo de nada — ele já saltava o `5xl`
     por não ter o que preencher no meio —, então sem o hero não sobra motivo, e
     manter o `6xl` repetiria exatamente o defeito que matou o `5xl`.

     Consequência declarada: o degrau de display do projeto foi decidido três
     vezes, com três respostas — 48, 60, e nenhum.
     --------------------------------------------------------------------------- */
  --sd-type-xs:    12px;
  --sd-type-sm:    14px;    /* densidade de UI — o número mais unânime da amostra */
  --sd-type-base:  16px;    /* prosa */
  --sd-type-lg:    18px;
  --sd-type-xl:    20px;
  --sd-type-2xl:   24px;
  --sd-type-3xl:   30px;    /* título de página, até 996px */
  --sd-type-4xl:   36px;    /* título de página, de 997px — o topo da escala */

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

  /* O fio. Um só, e agora ele é a separação de TODA superfície levantada — o
     anel `0 0 0 1px` saiu da composição da sombra e virou borda de verdade.

     A troca é decisão de ALCANCE, não de estética: o Infima declara
     `--ifm-*-border-color` em todo componente, então o adaptador pinta o fio
     inteiro com o vocabulário que já existe. Anel dentro de `box-shadow`
     obrigaria a sobrescrever a sombra de cada componente para desenhar uma
     linha. */
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
     acrescenta timeline / `infinite`.

     OS TRÊS ÚLTIMOS ESTÃO SEM CONSUMIDOR desde que a landing saiu (issue #94), e
     ficam declarados de propósito. O motivo é o que a régua de órfãos pede — e
     não é o mesmo do `--sd-type-6xl`, que saiu no mesmo movimento. O vocabulário
     de motion é FECHADO por portão: `scripts/portao-2-motion.sh` reprova toda
     duração ou curva cravada e manda usar um destes seis nomes. Remover três
     deixaria o portão apontando para um vocabulário que não cobre `showcase`,
     `reveal` nem `ambient` — e a próxima faixa que precisasse de um deles
     escreveria o número cravado que o portão existe para impedir. É uma escala
     declarada inteira, como a rampa de cinza, e o buraco no meio custa mais do
     que a parada a mais. */
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

     `--sd-tabs-height` é LITERAL, e não `var(--sd-space-12)`, ainda que os dois
     entreguem 48. Altura de chrome não tem relação com escala de espaço, e
     derivar por coincidência de número é a derivação FALSA que o bloco de foco
     recusa em voz alta trinta linhas acima. A procedência honesta é a mesma dos
     outros comprimentos deste bloco: medida na âncora.

     `--sd-toc-width` não tem consumidor, e o motivo vai escrito em vez de ficar
     por conta de quem varrer. A coluna do TOC recebe o quarto restante do grid
     75/25 do upstream, que vive numa classe hasheada de CSS Module — alcançá-la
     custaria `unsafe` em DocItem/Layout, e a perda está registrada em
     chrome.css §4. O token existe porque a cadeia de proporções de
     docs/design/chrome.md §1 cita este elo pelo nome, e um elo sem nome é elo
     que ninguém confere: ele é o valor CONTRA o qual se mede o que o grid
     entrega, não o valor que o grid lê. Removê-lo quebraria a cadeia; ligá-lo
     custaria o zero de `unsafe`.
     --------------------------------------------------------------------------- */
  --sd-container-width: 1152px;  /* as DUAS variáveis de container do Infima recebem este */
  --sd-sidebar-width:    288px;
  --sd-navbar-height:     64px;  /* a LINHA 1 do topo, não o topo inteiro */
  --sd-tabs-height:       48px;
  --sd-toc-width:        288px;  /* nomeia o elo; quem o pinta é o grid do upstream */
  --sd-prose-width:      720px;

  /* O recuo do subtítulo sob o título. LITERAL pelo mesmo motivo da altura da
     faixa: é medida de chrome, não parada da escala de espaço, e escrevê-lo como
     `--sd-space-2` mais meio passo daria o número sem comprar a derivação.

     Na âncora ele sai de um `mt-2` de 8 colapsando contra o `space-y-2.5` do
     contêiner. O que se copia é o RESULTADO medido, não a aritmética de um
     framework de utilitários que este projeto não tem. */
  --sd-subtitulo-recuo:   10px;

  /* O TOPO GRUDADO — a altura que o navbar de fato ocupa, e o offset de tudo o
     que gruda abaixo dele. Uma linha no estreito; duas de 997 para cima.

     Ele é o único ponto onde a faixa de tabs vira número, e mora aqui porque
     tem DOIS consumidores fora do adaptador — o `--ifm-navbar-height`, que
     propaga para os nove pontos do theme-classic que grudam, e o painel da
     referência gerada, que gruda por conta própria num CSS Module.

     O escopo por media query é OBRIGATÓRIO, e é a armadilha mais cara desta
     faixa: `.navbar-sidebar__brand` e `.navbar-sidebar__items` leem o mesmo
     `--ifm-navbar-height`. Sem o escopo, o cabeçalho do drawer do estreito
     infla para a altura de duas linhas que ali não existem. */
  --sd-topo-grudado: var(--sd-navbar-height);

  /* A coluna de conteúdo. É `.col--9` do grid de doze, então ela DERIVA do
     container em vez de repetir um número: 1152 × 0,75 = 864. A coluna do TOC é
     o quarto restante, e ela está acima como valor porque o Infima a escreve
     como classe, não como conta.

     Sem cartão, ela deixou de ter quem a preencha e passou a ser CAIXA
     INVISÍVEL: o único consumidor é o `max-width` da coluna, que segura a página
     no mesmo pixel na configuração sem TOC. Ver `chrome.css`. */
  --sd-doc-width: calc(var(--sd-container-width) * 0.75);

  /* A MEDIDA DO CÓDIGO morreu aqui, e vale a linha de lápide. A derivação dela
     era uma frase só — *"o interior do cartão de doc"* —, e o cartão está de
     saída. Cartão fora, derivação fora: sobraria o número 768 sem raiz, que é a
     derivação FALSA que este arquivo recusa em voz alta no bloco de foco.

     Os consumidores reais passam a citar `--sd-prose-width`, pelo MESMO
     argumento que já estava escrito: *a medida que o leitor estava lendo quando
     apertou a tecla*. O argumento não enfraquece; ele fica verdadeiro, porque
     hoje ele erra por 96px.

     Eram DOIS na redação original — a largura do modal de busca e a laje de
     código da landing. A segunda saiu com a página na issue #94; quem cita o
     token hoje é `chrome.css`, o `SearchBar` e o `ApiDocItem`. */

  /* A folga lateral do shell, de cada lado. Ela dobra a partir de 997px — o
     mesmo limiar em que a sidebar aparece. O par 16/32 é herdado da âncora; o
     ponto onde ele troca, não.

     O par ANTIGO era 32/64, e ele caiu junto com o cartão: a folga de lá era a
     do shell em volta de uma superfície levantada, e não há mais superfície
     levantada. O par novo é o do `mint`, e é ele que faz o congelamento fechar
     em 1472 — `sidebar + container + 2 × (gutter − 16)`, com os 16 do
     preenchimento que o Infima já põe no `.container`. */
  --sd-gutter: var(--sd-space-4);

  /* A altura máxima do modal de busca — o SEGUNDO token novo do slice 7, e o
     único do projeto medido contra a viewport.

     Ele está aqui, e não inline no CSS Module, porque a alternativa seria
     escrever `60dvh` num arquivo que não é este. `dvh` não está no padrão do
     portão 1 — `px|rem|em|ms|s` —, então o literal PASSARIA, e passar por buraco
     de varredura é a única forma de literal que este projeto não admite: a
     saída correta seria fechar o buraco, e fechá-lo aqui custa uma linha em vez
     de uma perna nova de portão.

     A LARGURA não vira token: ela é `--sd-prose-width`, citada por nome. O painel
     abre com a medida que o leitor já estava lendo quando apertou a tecla, e
     nomeá-la de novo criaria uma segunda cópia do mesmo número. */
  --sd-busca-height: 60dvh;

  /* ---------------------------------------------------------------------------
     Grade de cartões — camada 1, e a declaração serve o MDX.

     A frase que justificava a posição era *"UMA declaração serve a landing e o
     MDX"*, e ela perdeu metade na issue #94: sobra o `card-group` do MDX. Ver a
     lápide da lista de faixas mais abaixo, e `componentes/card-group.md`.

     O piso de faixa da grade de `card-group`, derivado do limiar da âncora A
     TRÊS COLUNAS: o `Columns` dela colapsa em 42rem, com gap de 16. Descontados
     os dois gaps e dividido por três, sai o menor cartão que a âncora admite
     numa fila de três.

     A CITAÇÃO A `--sd-prose-width` MORREU AQUI, e a lápide vale a linha. Ela
     valia enquanto a prosa media 672: os dois eram o MESMO `max-w-2xl` do
     framework de utilitários da âncora, aparecendo duas vezes, e citar o token
     era honesto. Sob o `mint` a prosa é 720 e o limiar de colapso continua 672
     — continuar citando faria o piso derivar de um número que deixou de ser o
     medido, que é a derivação FALSA que este arquivo recusa em voz alta no
     bloco de foco. O limiar volta a ser o que sempre foi: um literal medido,
     com nome próprio.

     Com este piso, a contagem de cartões faz o trabalho sozinha — zero media
     query, zero container query, zero prop de colunas.

     A LISTA DE FAIXAS mora aqui junto, e não só o piso. O motivo tinha dois
     consumidores — a grade de `card-group` dentro do MDX e a grade da landing
     —, e "uma declaração serve as duas" só era verdade se a declaração
     existisse num lugar que as duas citassem por nome. A escada de elevação
     abriu o precedente: `--sd-shadow-raised` também é valor composto, e pelo
     mesmo motivo.

     A GRADE DA LANDING SAIU na issue #94, e a lista fica onde está. O argumento
     que a trouxe para cá perdeu metade, mas o que sobra basta: ela continua
     sendo valor composto, e valor composto citado por nome é o que impede a
     próxima grade de recompor a lista à mão. O mesmo vale para
     `--sd-shadow-raised`, que perdeu um dos dois consumidores no mesmo commit.
     --------------------------------------------------------------------------- */
  --sd-card-colapso: 672px;   /* o `max-w-2xl` em que o `Columns` da âncora colapsa */
  --sd-card-min: calc((var(--sd-card-colapso) - 2 * var(--sd-space-4)) / 3);
  --sd-card-grid: repeat(auto-fit, minmax(min(var(--sd-card-min), 100%), 1fr));
}

/* O gutter dobra no limiar único do projeto, que é o literal compilado do
   Infima. Não são os 1024px da âncora: dois limiares brigando no mesmo eixo
   custam mais do que a fidelidade compra.

   A SEGUNDA LINHA DO TOPO nasce no mesmo limiar, e pelo mesmo motivo: um evento
   visual em vez de dois. A faixa de tabs aparece exatamente quando a sidebar
   aparece, e some exatamente quando ela vira gaveta. */
@media (min-width: 997px) {
  :root {
    --sd-gutter: var(--sd-space-8);
    --sd-topo-grudado: calc(var(--sd-navbar-height) + var(--sd-tabs-height));
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

/* ESCURO — canônico.

   O bloco teve um SEGUNDO seletor, `[data-sd-showcase]`, e ele saiu com a
   landing (issue #94). A ilha de espetáculo carregava o próprio substrato
   porque glow é emissão, e emissão só é legível contra escuridão; ela era um
   seletor a mais neste bloco, e não um bloco novo, e é isso que a fazia inerte
   na troca de tema. Sem a faixa não há o que manter escuro fora do modo.

   Se ela voltar, o seletor volta AQUI e não num bloco próprio — e
   `scripts/contraste.mjs` casa este seletor em início de linha, então voltar
   com ele exige acertar o casamento lá junto. */
:root {
  color-scheme: dark;

  /* surface — `scrim` é o véu do `::backdrop` do modal de busca, e ele é o
     ÚNICO papel semântico novo do slice 7. Ele deriva do extremo escuro da
     rampa, que é o mesmo nos dois modos; o que bifurca é a opacidade, e ela
     bifurca por um motivo mecânico: no escuro a página já está perto da 950, e
     um véu leve não se distinguiria dela. No claro, a mesma opacidade
     transformaria a página num buraco preto em vez de empurrá-la para trás.

     `code` SUBIU para a 900, e a regra passou a ser simétrica: a superfície do
     código é um passo acima da página nos DOIS modos. Ela era a 950 aqui — o
     mesmo valor de `page`, dois nomes para uma cor —, e isso só se sustentava
     com o cartão no meio, que dava ao bloco um fundo contra o qual se destacar.
     Sem o cartão, o bloco de código tinha a cor exata da página no modo
     canônico: é literalmente o defeito do Infima que este projeto nomeou.

     Dissenso registrado: a 900 é o degrau imediatamente acima na rampa, e é a
     única derivação honesta disponível — NÃO é uma medida. O berço que morreu
     era anatomia medida da âncora. */
  --sd-surface-page:   var(--sd-gray-950);
  --sd-surface-raised: var(--sd-surface-dark);
  --sd-surface-code:   var(--sd-gray-900);
  --sd-surface-wash:   rgb(from var(--sd-accent) r g b / 12%);
  --sd-surface-scrim:  rgb(from var(--sd-gray-950) r g b / 72%);

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

  /* accent.

     `contrast` está SEM CONSUMIDOR desde que a landing saiu (issue #94) — o
     único era o texto do botão primário dela. Fica declarado, e o motivo é o
     mesmo que mantém `--sd-gray-200`: papel semântico é família declarada
     inteira. Os dois blocos de modo declaram a MESMA lista, na mesma ordem, e
     papel que aparece num e não no outro é buraco visível; tirar o par do
     accent deixaria a camada 2 sem resposta para *que cor vai o texto sobre o
     accent*, e o próximo botão a nascer escreveria a cor à mão. */
  --sd-accent:          var(--sd-brand-on-dark);
  --sd-accent-hover:    oklch(from var(--sd-accent) calc(l + 0.06) c h);
  --sd-accent-contrast: var(--sd-text-inverse);

  /* shadow — `lip` não mora aqui: realce é sempre luz, e luz não bifurca.
     Ver o bloco de valor único mais abaixo.

     Sobrou UM papel. O anel `0 0 0 1px` saiu da composição e virou borda de
     verdade, então o papel que o pintava deixou de existir — a família `border`
     logo acima é quem pinta o fio agora.

     O ALCANCE, dito com precisão, porque a versão curta engana: onde o Infima
     declara um `--ifm-*-border-color`, o adaptador pinta o fio de `:root`, sem
     regra nova. Onde ele NÃO declara, o fio é escrito no componente — uma
     declaração de uma linha. O que a troca compra é que a alternativa custava
     mais nos dois casos: anel dentro de `box-shadow` obrigaria a REDECLARAR a
     sombra inteira de cada componente, porque `box-shadow` não se acrescenta.
     Uma linha de `border` contra três camadas de sombra repetidas. */
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

     A família é declarada inteira, como a de `-fill`. `danger-edge` não tem
     consumidor — o chip de obrigatório do campo usa preenchimento e texto, não
     aresta —, e uma família de quatro com um buraco no meio é pior de ler do que
     a quarta linha.

     A justificativa trocou de dono junto com o vermelho: ela nomeava a pílula de
     verbo, que morreu com o contrato HTTP. O consumidor de `danger` no catálogo
     hoje é o chip, e ele usa as mesmas duas linhas de sempre. */
  --sd-state-info-edge:    rgb(from var(--sd-state-info)    r g b / 30%);
  --sd-state-success-edge: rgb(from var(--sd-state-success) r g b / 30%);
  --sd-state-warn-edge:    rgb(from var(--sd-state-warn)    r g b / 30%);
  --sd-state-danger-edge:  rgb(from var(--sd-state-danger)  r g b / 30%);

  /* code — o oitavo papel. Existe na camada 2 porque a paleta de sintaxe
     bifurca por modo, e a camada 2 é o único lugar onde modo diverge.

     ---------------------------------------------------------------------
     O CYAN MORA NO IDENTIFICADOR, e a paleta é `origem própria (medição)`.

     A âncora foi medida e NÃO seguida — a primeira vez no mapa. O
     `"codeblocks":"system"` do Devin resolve para `github-light-default` +
     `dark-plus`, e o que a medição revela é que a âncora DECLINA de tematizar
     código: ela entrega o par padrão da plataforma. Herdar isso seria herdar
     uma ausência, e herdar uma ausência não é herdar. É a posição mais frágil
     do projeto, e está escrita como tal em docs/design/principios.md §3.

     As duas razões medidas cortam contra adotá-lo: ele regride os pisos de
     contraste deste projeto (para 5,87 escuro e 4,55 claro, que encosta em AA)
     e fica MAIS berrante no claro (croma máx 0,207 contra 0,113).

     A paleta anterior caiu por doutrina, não por gosto: ela era semeada do
     Neon, e o Neon não é âncora — os três não-âncora doam mecanismo e nunca
     valor.

     `parameter` é o identificador e leva o cyan; `constant` é o vizinho. Os
     outros cinco ficam sob teto de croma 0,095, e `string` fica QUENTE de
     propósito: ela leva a maior fatia dos tokens de qualquer bloco, e sem o
     contrapeso o código vira monocromático.

     O cyan é SKIN FIXA — camada 2 aqui, e fora da superfície de troca, no
     precedente dos quatro `--sd-hue-*`. O corporativo redesenha; não re-marca.

     Piso conferível por comando, e não só registrado:
     `node scripts/contraste.mjs --verificar`.
     --------------------------------------------------------------------- */
  --sd-code-fg:        var(--sd-text-body);
  --sd-code-parameter: #7FE4E9;   /* oklch(85.9% 0.095 200) — o cyan, o identificador */
  --sd-code-constant:  #7FD3E4;   /* oklch(81.9% 0.085 212) — o vizinho */
  --sd-code-keyword:   #95BCE4;   /* oklch(78.1% 0.071 249) */
  --sd-code-string:    #E9B999;   /* oklch(82.1% 0.070  55) — o contrapeso quente */
  --sd-code-function:  #DDDAAE;   /* oklch(88.0% 0.058 104) */
  --sd-code-operator:  #CBC9CF;   /* oklch(83.9% 0.009 301) */
  --sd-code-comment:   #B0AEB6;   /* oklch(75.5% 0.012 298) */
}

/* CLARO — legítimo. */
:root[data-theme='light'] {
  color-scheme: light;

  /* surface — a página desce para a parada 100 e a levantada sobe para a 50: se
     a página ficasse na 50, a levantada teria que ser branco puro para subir, e
     aí o tint da marca sumiria da maior superfície do modo claro. A pastilha de
     código toma o extremo do modo, que aqui é branco.

     Aqui a superfície do código JÁ estava acima da página, e é o escuro que veio
     ao encontro dela. A assimetria — igual à página no escuro, acima dela no
     claro — era o que o cartão escondia. */
  --sd-surface-page:   var(--sd-gray-100);
  --sd-surface-raised: var(--sd-surface-light);
  --sd-surface-code:   oklch(from var(--sd-gray-50) 100% 0 h);
  --sd-surface-wash:   rgb(from var(--sd-accent) r g b / 12%);
  --sd-surface-scrim:  rgb(from var(--sd-gray-950) r g b / 40%);

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

  /* code — os CINCO papéis cromáticos do claro ficam na mesma luminosidade, L
     48%. É a propriedade que a paleta anterior tinha e o par medido na âncora
     não tem, e é ela que segura o piso em 6,29 sobre a pastilha branca. Os dois
     acromáticos saem da faixa de propósito: `operator` desce para não competir
     com o identificador, e `comment` sobe para recuar. */
  --sd-code-fg:        var(--sd-text-body);
  --sd-code-parameter: #006B70;   /* oklch(48.0% 0.082 200) — o cyan, o identificador */
  --sd-code-constant:  #1C6589;   /* oklch(48.0% 0.090 235) — o vizinho */
  --sd-code-keyword:   #475C8B;   /* oklch(47.9% 0.081 265) */
  --sd-code-string:    #82502B;   /* oklch(48.1% 0.085  56) — o contrapeso quente */
  --sd-code-function:  #60612C;   /* oklch(47.9% 0.074 110) */
  --sd-code-operator:  #535157;   /* oklch(43.9% 0.010 301) */
  --sd-code-comment:   #615F66;   /* oklch(49.0% 0.011 299) */
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

   A SOMBRA DEIXOU DE SER ESCADA, e os dois que sobraram moram aqui pelo mesmo
   motivo: a composição é a mesma nos dois modos, e o modo entra por `cast`, que
   é par declarado. Os comprimentos inline são a única exceção declarada à regra
   de que a camada 2 é só cor — box-shadow é valor atômico, e separar geometria
   de cor exigiria seis tokens de comprimento para compor duas sombras.

   Eram quatro degraus numerados com o anel embutido. Sobraram DOIS papéis,
   nomeados por intenção, porque uma escala de dois não é escala e numeração com
   buraco é pior que nome — e porque o resto do arquivo já nomeia por intenção.

   A defesa não é mais *"é um sistema"*. É **dois papéis medidos que compartilham
   dois ingredientes** — `lip` e `cast` —, e isso é menos do que o arquivo
   prometia. Está escrito porque quem abrir sem contexto vai ler over-engineering
   e merece a resposta curta.

   `--sd-shadow-sunken` MORREU aqui, e a morte vale a linha: ele era o
   contra-exemplo declarado da elevação — o único lugar do site que afundava —,
   e afundar era relativo ao cartão. Sem cartão, o contra-exemplo perde contra o
   quê ser exemplo, e o único consumidor dele era o berço do bloco de código,
   que morreu no mesmo commit.

   Sobraram DOIS papéis, e nenhum deles é consumido por conteúdo. `float` é o
   chrome flutuante — dropdown, gaveta, modal de busca, botão de voltar ao topo.
   `raised` NÃO flutua: o consumidor dele é o painel da Referência da API, que é
   superfície levantada. Eram DOIS — o segundo era o botão primário da landing,
   e saiu com a página na issue #94. O token fica porque continua consumido, e é
   essa a diferença entre ele e `--sd-type-6xl`, que saiu na mesma remoção.
   A profundidade saiu do CONTEÚDO, não do site — a #50 mediu zero componente de
   conteúdo com sombra em seis páginas da âncora, e o único portador de sombra
   medido lá é um chip de 24px no hover de heading.
   ----------------------------------------------------------------------------- */

:root {
  --sd-shadow-lip: rgb(from var(--sd-gray-50) r g b / 6%);

  --sd-shadow-raised: inset 0 1px 0 0 var(--sd-shadow-lip),
                      0 1px 2px -1px var(--sd-shadow-cast);
  --sd-shadow-float:  inset 0 1px 0 0 var(--sd-shadow-lip),
                      0 20px 48px -12px var(--sd-shadow-cast);
}

/* =============================================================================
   CAMADA 3 — VAZIA, e a ausência tem endereço.

   Havia aqui uma regra `[data-sd-showcase]` com os cinco tokens de brilho da
   ilha de espetáculo: os dois gradientes (`--sd-glow` e `--sd-glow-2`), a caixa
   quadrada da luz (`--sd-glow-tamanho`) e o par de amplitude da respiração
   (`--sd-glow-vale` e `--sd-glow-crista`). Ela era SEPARADA de propósito:
   entrar no bloco escuro acima poria --sd-glow em :root, e o glow vazaria para
   o site inteiro. A confinação não era regra que alguém precisava lembrar — era
   fato de escopo.

   Saiu inteira com a landing, na issue #94. A camada 3 é declarada no escopo do
   próprio componente e nunca em :root, e hoje nenhum componente do projeto
   declara token próprio: a única ilha que havia era esta.

   Este cabeçalho fica porque a camada é uma das três, e a regra de referência
   do §1 de docs/design/tokens.md se lê pelas três. Camada sem membro é
   diferente de camada que não existe.
   ============================================================================= */

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

  /* Os dois que NÃO terminam sozinhos seriam removidos aqui, não encurtados — e
     hoje não há nenhum dos dois no site.

     Havia uma regra `[data-sd-showcase] [data-sd-part='glow'] { animation:
     none; }`, e ela saiu com a landing (issue #94). A respiração do glow saía
     por aqui porque encurtá-la para 1ms produziria estroboscópio, que é o oposto
     exato do que `reduce` pede. Era a única regra de ELEMENTO do arquivo fora do
     adaptador, e existia porque `animation: none` não tem como ser entregue por
     token: o nome do `@keyframes` precisa aparecer LITERALMENTE numa declaração
     `animation` para sobreviver ao minificador (ver a nota em `custom.css`).

     O reveal nunca apareceu aqui, e por outro motivo: a regra dele morava dentro
     de `@media (prefers-reduced-motion: no-preference)`, no CSS Module da
     própria página, e simplesmente não entrava. Ver ADR 3 — a errata dele
     registra que os dois exemplos vivos da regra (d) saíram juntos.

     Se um loop ambiente voltar, ele volta por aqui, com `data-sd-part` como
     gancho: é contrato publicado do projeto, e o par de seletores dá (0,2,0)
     contra a (0,1,0) da classe do módulo — vence sem `!important` e sem depender
     de ordem de carga. */
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
  --ifm-background-surface-color: var(--sd-surface-raised);
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
         Exceção 4 do adaptador: das seis shades por cor semântica, só as VIVAS
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
  --ifm-color-secondary-contrast-background: var(--sd-surface-raised);
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
  --ifm-color-emphasis-100:  var(--sd-surface-raised);
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
         redefine sombra no escuro, e as dele somem sobre fundo escuro.

         A PROFUNDIDADE SAI DO CONTEÚDO, e é medição: a #50 achou zero
         componente de conteúdo com sombra em seis páginas da âncora — `shadow-md`
         e maiores existem no CSS dela e nunca são usados. Então `lw` e a sombra
         de alerta valem `none`, e sobra sombra só onde algo de fato flutua.

         Quem lê `lw` de verdade, medido no fonte da 3.10.2 — e o ticket errava:
         ele nomeava `.card` do Infima, que ESTE site não renderiza (o nosso
         cartão é classe de CSS Module, e `.card` nua não a alcança). Os leitores
         vivos são `CodeBlock/Container`, que é conteúdo, e `BackToTopButton`,
         que é chrome flutuante. A conclusão não muda para o bloco de código; o
         botão recupera a sombra por classe estável em `chrome.css`.

         `--ifm-alert-shadow` fica em `none` pela mesma regra, e ela é a linha
         que o Infima lê em `.alert` — o nosso callout tem DOM próprio e não é um
         `.alert`. O adaptador escreve o que o FRAMEWORK consome, não o que a
         nossa página hoje renderiza.

         `md` e `tl` recebem o MESMO token, e isso não é duplicação nossa: o
         Infima tem três nomes para o que aqui tem dois papéis, e o adaptador
         existe para traduzir. O precedente está neste arquivo —
         --ifm-container-width e -xl recebem os dois o mesmo token.
         Verificado no Infima: `md` é lida por `.dropdown__menu` e
         `.navbar-sidebar`, que são chrome flutuante; `tl` só por `.shadow--tl`,
         que ninguém usa. ---------------------------------------------------- */
  --ifm-global-shadow-lw: none;
  --ifm-global-shadow-md: var(--sd-shadow-float);
  --ifm-global-shadow-tl: var(--sd-shadow-float);
  --ifm-alert-shadow:      none;
  --ifm-blockquote-shadow: none;
  --ifm-navbar-shadow:     none;

  /* --- link --------------------------------------------------------------- */
  --ifm-link-color:            var(--sd-accent);
  --ifm-link-hover-color:      var(--sd-accent-hover);
  --ifm-link-decoration:       none;
  --ifm-link-hover-decoration: underline;

  /* --- código. --ifm-pre-background é sobrescrita dentro do bloco de código
         por --prism-background-color; ver a exceção 3 no fim do arquivo. ---- */
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
  /* O TOPO INTEIRO, não a linha 1: são os nove pontos do theme-classic que
     grudam abaixo do navbar — o `top` do TOC, o do próprio `<nav>`, o
     `scroll-margin` das âncoras — e todos se realinham de graça quando a
     segunda linha entra. Ver `--sd-topo-grudado`. */
  --ifm-navbar-height:                 var(--sd-topo-grudado);
  --ifm-navbar-background-color:       var(--sd-surface-page);
  --ifm-navbar-link-color:             var(--sd-text-muted);
  --ifm-navbar-link-hover-color:       var(--sd-text-strong);
  --ifm-navbar-padding-horizontal:     var(--sd-space-6);
  --ifm-navbar-padding-vertical:       var(--sd-space-2);
  --ifm-navbar-item-padding-horizontal: var(--sd-space-3);
  --ifm-navbar-item-padding-vertical:   var(--sd-space-2);
  --ifm-navbar-search-input-background-color:  var(--sd-surface-raised);
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
  --ifm-card-background-color:        var(--sd-surface-raised);
  --ifm-card-horizontal-spacing:      var(--sd-space-6);
  --ifm-card-vertical-spacing:        var(--sd-space-6);
  --ifm-dropdown-background-color:    var(--sd-surface-raised);
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

    /* O preenchimento vertical do navbar vai a ZERO no dia em que ele carrega
       duas linhas, e é peça da faixa, não afinação. Com ele, as duas linhas
       ficam dentro de uma caixa de conteúdo mais curta que o `<nav>` e
       desalinham da faixa PINTADA, que é desenhada contra a borda do elemento.
       Zerado, quem manda na altura são as duas linhas.

       Abaixo de 997 ele não é tocado: lá o navbar tem uma linha só, e o mesmo
       token preenche o cabeçalho do drawer.

       O par de seletores repete o do adaptador de propósito — `:root` sozinho
       é (0,1,0) e PERDE para o `:root[data-theme]` (0,2,0) que escreveu o
       valor de base. É a armadilha de especificidade do ADR 1, reencontrada em
       campo ao montar a faixa. */
    --ifm-navbar-padding-vertical: 0;
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

   Quatro pontos do Docusaurus não são alcançáveis de :root. A lista é FECHADA.

   Eram cinco. A do `--docusaurus-tag-list-border` saiu porque ela não tinha
   superfície viva: nenhuma página deste site declara `tags:`, e o front matter
   da âncora — `title`, `description`, `icon`, `sidebarTitle`, `hidden`,
   `noindex`, `searchable`, `deprecated`, `groups` — não tem o campo. O valor
   de uma lista fechada é ser conferível membro a membro, e linha
   permanentemente infalsificável é o oposto disso.

   Dissenso registrado: a exceção custava uma linha e defendia contra um
   descuido; o modo de falhar que a saída dela abre é o SILENCIOSO que a spec
   combate em toda parte. Se a arquitetura de informação criar tag um dia, ela
   volta no mesmo commit, por uma linha.
   ============================================================================= */

/* --- Exceção 1 — --ifm-alert-background-color-highlight -----------------------
   No Infima ela é rgba() LITERAL por variante, dentro de `.alert--*`, e não
   derivada da primária. É o ponto exato onde a re-marcação por variável do
   Infima vaza: trocar --ifm-color-primary não move nenhuma delas. Só o seletor
   de cada variante alcança. */
.alert--primary   { --ifm-alert-background-color-highlight: var(--sd-surface-wash); }
.alert--secondary { --ifm-alert-background-color-highlight: var(--sd-surface-raised); }
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

/* --- Exceção 3 — --prism-background-color ------------------------------------
   Ela não vem de CSS nenhum: `CodeBlock/Container` a injeta no atributo `style`
   INLINE, a partir de `themeConfig.prism.theme.plain`, via
   `getPrismCssVariables`. Nenhum seletor de folha de estilo vence estilo inline.

   Correção registrada: a arquitetura previa alcançá-la "por seletor na classe
   do bloco de código". Não é alcançável assim — medido no fonte da 3.10.2. O
   ponto de escrita é o shim de `themeConfig.prism.theme` em
   `docusaurus.config.js`, que só referencia token e não carrega um único hex.
   Escrever aqui uma regra `.theme-code-block { --prism-background-color: … }`
   seria exatamente a linha morta que sugere funcionar. */

/* --- Exceção 4 — as shades de cor semântica ---------------------------------
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

> **O terceiro mecanismo é o que carrega mais peso, e a leitura fácil dele está errada.** Medido em navegador, arquivo a arquivo: **sem** o registro de `--sd-brand` e com marca **válida**, a cadeia `brand → on-dark → accent → text-inverse` resolve inteira e byte a byte igual — custom property não registrada é token stream, e `oklch(from …)` aninhado é CSS legal. O que o registro compra não é a cadeia funcionar; é ela **não evaporar inteira** com uma colagem inválida. Sem ele, um valor torto na linha 1 apaga marca, as onze paradas da rampa, os dois acentos, toda superfície e o rótulo do botão primário de uma vez, sem aviso e sem erro. Com ele, tudo isso cai no valor de fábrica e o site continua de pé.
>
> O raio de dano de uma linha errada é o site inteiro, e é esse raio que o `@property` contém. Quem for tentado a tirar a linha por achá-la cerimônia está tirando a contenção, não a tipagem.

### A perda das outras sete, escrita

`@property` registra exatamente as linhas cuja entrega é **literal e computacionalmente independente** — é o que `initial-value` sabe expressar. Hoje isso produz três: `--sd-brand`, `--sd-brand-tint`, `--sd-radius`.

As outras sete entregam referência (`var()`, `oklch(from …)`) ou pilha de fonte, e `initial-value` não aceita nenhuma das duas. **Consequência concreta:** colagem inválida em `--sd-surface-dark` torna `--sd-surface-raised` inválida em tempo de valor computado, e `background-color` cai para `transparent` — **a superfície levantada some**. Com registro, teria degradado para o valor de fábrica.

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

### O `L` da marca é inerte, e o tint é uma conta

**A rampa reescreve `L` em toda parada e consome só `c` e `h`.** As duas travas de acento fazem o mesmo — `max(l, 0.72)` e `min(l, 0.50)`. Consequência que vale escrita porque contraria a intuição: **pedir uma marca "mais escura" não é uma operação que este sistema saiba fazer.** Dois hexes de mesmo matiz e mesma cromaticidade, separados por sete pontos de luminosidade, produzem rampa e acentos byte a byte idênticos.

**Quem serena a marca é o croma.** E é por isso que `--sd-brand-tint` é a quarta linha do bloco de troca em vez de uma preferência: a rampa é tingida por `c × tint`, então baixar o croma sem compensar apagaria parte do tint — e o tint é `herdado`, medido nos quatro sites. O produto fica travado em **0,0120**, que é a banda de cromaticidade que a medição pôs na rampa.

O efeito é conferível, e foi conferido em navegador contra a skin anterior:

> **Dez das onze paradas saem byte a byte idênticas. A décima primeira, `gray-600`, difere em 1/255 num único canal.**

**A superfície do site inteiro não se mexe; só o acento esfria.** É isso que torna a troca de marca cirúrgica em vez de arriscada — e é a razão de a linha do tint não ser negociável junto com a do hex: mexer numa sem a outra move todas as superfícies do site.

### AA é propriedade da arquitetura, não verificação por skin

Duas travas de luminosidade — uma no escuro, uma no claro — aplicadas ao acento, aos quatro estados e à paleta de sintaxe garantem contraste **em qualquer marca que o corporativo cole**. Elas foram testadas nos vinte e quatro matizes do círculo com cromaticidade máxima.

Isso não era pedido. Caiu no colo quando a matemática mostrou que a alternativa — ajuste manual por skin — é infiscalizável numa spec cujo propósito é dispensar quem a escreveu.

Os dois acentos derivados saem como **expressão**, e não como hex repetido, porque **existe um vão de contraste em todos os vinte e quatro matizes**: o cartão escuro exige luminosidade alta, o claro exige baixa, e nenhum hex único fica nos dois lados. Não é *"ajuste só se o contraste pedir"* — pede sempre.

---

## 6. Onde os dois modos divergem, e onde não

**Escuro mora em `:root`; claro é `:root[data-theme='light']`.** É o **único** ponto do sistema onde os dois modos divergem. A camada 1 não bifurca (a rampa é a mesma; muda qual degrau cada papel usa), o adaptador não bifurca, e CSS de componente não bifurca.

Isso torna a auditoria uma leitura de bloco: **token que aparece no bloco escuro e não no claro é um buraco visível**, não uma omissão que passa batido. Os dois blocos declaram a mesma lista, na mesma ordem.

### A superfície do código sobe um degrau, e a regra fica simétrica

`--sd-surface-code` era `--sd-gray-950` no escuro, que é **o mesmo valor de `--sd-surface-page`**. Dois nomes para uma cor, no modo canônico — e é literalmente o defeito do Infima que este projeto nomeou.

Aquilo se sustentava enquanto havia cartão: o bloco de código vivia sobre o cartão, e o que o destacava era o cartão em volta, não a tinta dele. Sem cartão, o bloco de código passou a ter **a cor exata da página**.

Ela sobe para `--sd-gray-900`, e a regra passa a ser: **a superfície do código é um passo acima da página nos dois modos.** No claro ela já era — a pastilha toma o extremo do modo, que é branco —, então a assimetria (igual à página no escuro, acima dela no claro) desaparece por o escuro vir ao encontro do claro.

Medido, contra a página: **1,113:1** no escuro e **1,147:1** no claro. A célula do escuro era **1,000:1**.

> **Dissenso registrado, herdado da [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56).** A parada 900 é o degrau imediatamente acima na rampa — a **única derivação honesta disponível**, e não uma medida. O que morre no lugar dela era anatomia medida da âncora. Se ao vivo o bloco ficar pesado no escuro, o ajuste é uma linha, e é o tipo de coisa que só se julga com a implementação montada.

O par do `Frame` levou a mesma correção pela mesma causa, e está em [`componentes/frame.md`](componentes/frame.md): o palco dele citava `--sd-surface-page` e passou a citar `--sd-surface-raised`. A [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) achou o defeito num componente e não olhou para o outro.

### O segundo seletor do bloco escuro, e a ilha que ele carregava

**O bloco escuro tem UM seletor hoje: `:root`.** Ele teve dois — `:root, [data-sd-showcase]` —, e o segundo era a **ilha de espetáculo**. Ela saiu com a landing na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), porque a página era a única região do site a hospedá-la.

O mecanismo fica registrado, e não como curiosidade: ele é o que precisaria voltar. Glow é **emissão**, e emissão só é legível contra escuridão — o mesmo gradiente de acento **sobe** a luminância local no escuro e a **desce** no claro. Mesma operação, sinal invertido, e traduzir produz mancha. Então o glow não traduzia: a superfície de espetáculo **carregava o próprio substrato** e renderizava escura nos dois modos.

O custo arquitetural era **um seletor a mais no bloco que já existe**. Nenhum bloco novo, nenhuma briga de especificidade: custom property declarada no próprio elemento vence para a subárvore dele, e `:root[data-theme='light']` declara em `<html>`, que é outro elemento. Era isso que fazia a ilha ser **inerte na troca de tema**. Quatro coisas caíam de graça dentro dela, sem uma linha de configuração: o acento era o do escuro, a projeção voltava à opacidade do escuro, o realce da aresta voltava a ser visível, e o anel de foco já estava verificado.

> **Uma armadilha de máquina que a remoção criou, e ela está fechada.** `scripts/contraste.mjs` recorta este bloco casando o seletor em início de linha. Enquanto ele era `:root,\n[data-sd-showcase]`, o par era único no arquivo. Sozinho, `:root {` abre **quatro** blocos — a camada 1, este, o da sombra e o adaptador —, e casar só o seletor recortaria o primeiro deles e passaria a medir a camada errada **em silêncio**, devolvendo número plausível em vez de exceção. O script ganhou uma segunda âncora: a primeira declaração do bloco, `color-scheme: dark`, que é o que define um bloco de modo. Voltar com a ilha exige acertar o casamento lá junto.

**Existe ilha escura, não existe ilha clara.** O critério é emissão, emissão precisa de escuridão, então o mecanismo tem uma direção só. Pendurar uma ilha clara "por simetria" criaria a licença que o critério existe para fechar: sem ele, qualquer componente difícil no claro pede dark-only, e o modo claro morre por mil concessões. **A regra continua verdadeira e continua sem sujeito** — hoje não há ilha de nenhum dos dois tipos.

### O que **não** bifurca, e por quê

A regra que decide: **token que referencia camada 2 bifurca e mora nos dois blocos; token que referencia só camada 1 não bifurca e mora fora deles.**

`--sd-shadow-lip` é o único papel nessa situação, e é uma correção com história: ele estava escrito como par declarado, com alfa zerado no claro. Zerar o alfa desligava uma fórmula que havia **invertido de sinal** — ancorada na tinta do modo, ela produziria uma linha **escura** na aresta superior do cartão claro, ou seja luz vindo de baixo.

**Realce é luz, e luz é o topo da rampa — não "a tinta do modo".** Corrigida a âncora, o par some inteiro: no claro o cartão **é** o topo da rampa, e o topo da rampa sobre si mesmo é identidade matemática. **A aresta iluminada some no claro porque não há nada acima dela na rampa — não porque alguém a desligou.**

As sombras moram junto, pelo mesmo motivo: a composição é a mesma nos dois modos, e o modo entra por `--sd-shadow-cast`, que **é** par declarado.

> **Exceção declarada, e é a única do sistema.** A camada 2 é só cor, e as sombras carregam comprimentos inline. `box-shadow` é valor atômico: separar geometria de cor exigiria seis tokens de comprimento para compor duas sombras. Elas moram no arquivo de tokens, cabem num bloco que se lê inteiro, e a exceção é **declarada** — não descuido.

### A sombra deixou de ser escada, e a profundidade saiu do conteúdo

Eram **quatro degraus numerados**, com um anel `0 0 0 1px` embutido em cada composição. São **dois papéis nomeados por intenção** — `raised` e `float` —, e o anel saiu.

**`--sd-shadow-sunken` morreu junto, e a morte vale a linha.** Ele era o contra-exemplo declarado da elevação — *"tudo sobe, só o código afunda"* —, tinha um consumidor só, o berço do bloco de código, e **afundar era relativo ao cartão**. Sem cartão, o contra-exemplo perde contra o quê ser exemplo.

**A profundidade sai do conteúdo — não do site, e a diferença importa.** A [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) mediu **zero componentes de conteúdo com sombra em seis páginas** da âncora: `shadow-md` e maiores existem no CSS dela e **nunca são usados**. O único portador de sombra do site medido é um chip de 24px no hover de heading.

Os dois papéis que sobram continuam com consumidor, e **nenhum deles é conteúdo**:

| Papel | Quem o consome |
| --- | --- |
| `--sd-shadow-float` | o dropdown de idioma, a gaveta do estreito, o modal de busca e o botão de voltar ao topo — tudo `position: fixed` |
| `--sd-shadow-raised` | o painel da referência gerada — **não flutua**: é superfície levantada |

Então o adaptador escreve:

| Variável do Infima | Quem a lê de verdade | Recebe |
| --- | --- | --- |
| `--ifm-global-shadow-lw` | `CodeBlock/Container` (conteúdo) e `BackToTopButton` (chrome flutuante) | **`none`** |
| `--ifm-alert-shadow` | `.alert` do Infima — o nosso callout tem DOM próprio e não é um `.alert` | **`none`** |
| `--ifm-global-shadow-md` / `-tl` | `.dropdown__menu` e `.navbar-sidebar` — chrome flutuante | `--sd-shadow-float` |

**Correção medida contra o que o ticket afirmava.** A decisão nomeava `.card` como o leitor real de `lw`, *"o cartão do `card-group`, que é conteúdo"*. **Este site não renderiza `.card` nenhum:** o nosso cartão é classe de CSS Module, e a `.card` nua do Infima não a alcança. Os leitores vivos, medidos no fonte da 3.10.2 e no HTML publicado, são outros dois. A conclusão não muda para o bloco de código; o que muda é que **o botão de voltar ao topo perderia a sombra por tabela**, e ele é chrome flutuante pela mesma definição que põe o dropdown e a gaveta nessa classe. Ele a recupera por classe estável em `chrome.css` — sem exceção nova no adaptador, porque `.theme-back-to-top-button` é `ThemeClassNames`.

`md` e `tl` recebendo o mesmo valor **não é duplicação nossa**: o Infima tem três nomes para o que aqui tem dois papéis, e o adaptador existe para traduzir. O precedente está no próprio arquivo — `--ifm-container-width` e `-xl` recebem os dois o mesmo token.

**O anel virou borda de verdade, e a razão é alcance e não estética.** O Infima declara `--ifm-*-border-color` em todo componente, então o adaptador pinta o fio inteiro com o vocabulário que já existe. Anel dentro de `box-shadow` obrigaria a sobrescrever a sombra de cada componente, um por um, só para desenhar uma linha. O `box-sizing` global é `border-box`, então o fio entra no mesmo pixel em que o anel estava — a troca não move geometria.

**Por que nome e não número.** Uma escala de dois não é escala, e numeração com buraco — `1` e `3`, com o `2` morto — é pior de ler que nome. O resto do arquivo já nomeia por intenção; a sombra era o último lugar que numerava.

> **Dissenso registrado, e ele é sobre a defesa da seção inteira.** A profundidade era a demonstração mais visível do sistema, e agora ela levanta um botão e um modal. Quem abrir o arquivo de tokens sem contexto vai ler *over-engineering*, e merece a resposta curta: **a defesa deixou de ser "é um sistema" e passou a ser "são dois papéis medidos que compartilham dois ingredientes"** — `lip` e `cast`. É verdade, e é menos do que o arquivo prometia.
>
> **E `raised` perdeu um dos dois consumidores** com a [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94): o botão primário da landing. Sobra o painel da referência gerada. O token fica porque continua consumido — e é essa a diferença entre ele e `--sd-type-6xl`, que saiu na mesma remoção.

### A camada 3 ficou vazia, e os dois glows são o que morava nela

**Não há token de componente declarado no projeto hoje.** A camada 3 continua sendo uma das três, e a regra de referência do §1 se lê pelas três — camada sem membro é diferente de camada que não existe.

O que morava lá eram `--sd-glow` e `--sd-glow-2`, mais a caixa quadrada da luz e o par de amplitude da respiração. Eles saíram com a ilha na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94). O registro fica porque é a especificação do que precisaria voltar:

`--sd-glow` e `--sd-glow-2` **não eram papel semântico** — são gradientes, não cores, e não cabiam na lista fechada de oito. Eram token de componente, e o componente era a própria ilha. **A regra deles era separada de propósito:** entrar no bloco escuro os poria em `:root`, e o glow vazaria para o site inteiro. Fora da ilha, `var(--sd-glow)` **não resolvia para nada** — a confinação não dependia de alguém lembrar dela, era fato de escopo. E custava **zero** na superfície de troca, que continua em dez linhas.

**Eram dois, e o segundo não afrouxava o critério de emissão.** O magenta a **30%** citava `--sd-accent`; o cyan a **24%** citava `--sd-code-parameter`, que é o tom do identificador na paleta de sintaxe — dentro da ilha a laje era o material, e a segunda luz era a cor do material. Nenhum hex novo: as duas eram a operação 1 sobre token que já existe. **Um respirava, o outro não** — o par de amplitude alcançava só o magenta, e era assim que o teto de *um loop por página* se lia ao pé da letra.

> **O primeiro subiu de 12% para 30%, e o registro anterior estava errado sobre a origem.** [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) escreveu o par `0,24 / 0,30` supondo que o `--sd-glow` publicado já fosse 0,30; ele era **12%, desde o primeiro commit**. O par estava certo sobre o destino. Quem pagou a diferença foi a **figura**: enquanto havia desenho embaixo, a luz era o brilho sobre ele; sem desenho ela carregava o hero sozinha, e 12% não carregava. O documento que detalhava isso era `landing.md`, e saiu junto.

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

### As quatro exceções com escopo — lista fechada

Quatro pontos do Docusaurus não são alcançáveis de `:root`.

| # | Ponto | Por que escapa | Como o adaptador alcança |
| ---: | --- | --- | --- |
| 1 | `--ifm-alert-background-color-highlight` | `rgba()` **literal por variante** dentro de `.alert--*`, não derivado da primária — é o ponto onde a re-marcação por variável do Infima **vaza** | uma declaração no seletor de cada variante |
| 2 | `--docusaurus-details-decoration-color`, `-transition`, `-summary-arrow-size` | declaradas dentro de classe de CSS Module, nunca em `:root` | `details[class]`, que é (0,1,1) e vence a classe hasheada sem depender do hash |
| 3 | `--prism-background-color` | **não vem de CSS nenhum** | ver abaixo — a arquitetura previa um seletor, e ela estava errada |
| 4 | shades de cor semântica | quatro das seis são inertes | atribuir **só as vivas**: base, `-dark`, `-darker`, `-contrast-background`, `-contrast-foreground` |

**Eram cinco, e a que saiu é a do `--docusaurus-tag-list-border`.** Ela alcançava a borda do chip de tag por `a[class*='tag_']`, e **não tem superfície viva**: nenhuma página deste site declara `tags:`, e a medição fecha o caso — o front matter da âncora tem `title`, `description`, `icon`, `sidebarTitle`, `hidden`, `noindex`, `searchable`, `deprecated` e `groups`, e **não tem `tags`**. O carimbo dela é `herdado`, não defesa.

O valor de uma lista fechada é ser **conferível membro a membro**, e linha permanentemente infalsificável é o oposto disso: ninguém consegue mostrar que ela funciona, porque não há página onde ela apareça.

> **Dissenso registrado.** Isso remove uma defesa que custava uma linha, e o modo de falhar que a saída dela abre é exatamente o **silencioso** que a spec combate em toda parte: o dia em que uma página declarar `tags:`, o chip sai com a borda default do Infima e nada avisa. Se a arquitetura de informação criar tag, a exceção volta **no mesmo commit**, por uma linha.

**Correção registrada na exceção 3.** A arquitetura previa alcançar `--prism-background-color` *"por seletor na classe do bloco de código"*. **Não é alcançável assim** — medido no fonte da versão em uso: `CodeBlock/Container` injeta a variável no atributo `style` **inline**, via `getPrismCssVariables`, e nenhum seletor de folha de estilo vence estilo inline. O ponto de escrita é o **shim** de `themeConfig.prism.theme`. Escrever a regra de seletor mesmo assim seria exatamente a linha morta que sugere funcionar.

### O shim do Prism

O tema Prism é objeto JavaScript em `docusaurus.config.js`, e a leitura ingênua é que a paleta de sintaxe teria que morar lá — quebrando a regra de que todo número vive num bloco só. **Não quebra:** um tema do `prism-react-renderer` é `{plain, styles:[{types, style}]}`, e o `style` aceita qualquer string CSS, inclusive `var(--sd-code-keyword)`.

O tema vira um shim que **só referencia token**, e **nenhum valor de cor entra no arquivo de config**. Verificado no HTML gerado: os `<span>` de token saem com `style="color:var(--sd-code-keyword)"`, e o container com `style="--prism-background-color:var(--sd-surface-code)"`.

Um shim serve os **dois** modos: o Docusaurus cai em `prism.theme` quando `prism.darkTheme` não existe, e os tokens já bifurcaram. Declarar um segundo criaria um lugar a mais onde o modo diverge.

---

## 8. Tipografia

Dezenove nomes, e **zero valor novo** em relação ao que a direção de arte travou. Eles existem porque a regra mais dura da spec é *zero valor fora deste documento*: um arquivo de componente que escreve "peso 600" já é violação — ele precisa de um nome para citar.

- **Tamanho:** `--sd-type-xs` … `--sd-type-4xl`, e a escala **termina aí** — não há degrau de display. Os degraus levam o nome do alvo, para a procedência ficar legível no próprio token e quem confere não precisar traduzir. Numerar de um a oito jogaria isso fora — e é o nome do alvo que deixa o **fim da escala ser legível** em vez de parecer truncamento.
- **Peso:** `--sd-weight-body`, `-ui`, `-heading` — nomeados por **intenção**, não por número. `--sd-weight-600: 600` é uma identidade que não ensina nada, e nome de intenção fecha uma armadilha: o Infima chama **500** de `semibold`, e o nosso `semibold` seria 600 — a mesma palavra sobre dois números dentro do mesmo repositório.
- **Entrelinha:** `--sd-leading-prose`, `-ui`, `-code`, `-h1` a `-h4`. `-h4` repete o valor de `-ui` e mantém nome próprio: mesmo número hoje, intenções diferentes; fundi-los faria uma mudança em h4 mexer em toda a rotulagem de UI.
- **Tracking:** `--sd-tracking-tight`, um só, e **só em título**. O corpo usa o `normal` do navegador, que é keyword e não valor.

Isto **não** abre camada semântica de dimensão: são tokens de camada 1, declarados uma vez, consumidos direto pela camada 3.

### O degrau do título de página

O título fica em `--sd-type-3xl` até 996px e em `--sd-type-4xl` a partir de 997px — e **não** nos 640px medidos no alvo.

O par 30/36 é herdado; **o ponto onde ele troca, não.** 640 seria um segundo limiar de media query no mesmo eixo, contra a regra de limiar único do projeto, que alinha as media queries aos literais compilados do Infima. E alinhado, o título cresce **no mesmo instante em que a sidebar aparece** — um evento visual em vez de dois.

**Perda nomeada:** entre 640 e 996px o título fica em 30px onde o alvo dá 36. É a única faixa em que a nossa maior tipografia é menor que a da âncora.

### Não há degrau de display, e a escala já terminou no `4xl` uma vez

**O topo da escala é `--sd-type-4xl`.** Houve um `--sd-type-6xl` de **60px** com **um** consumidor no site inteiro — o título do hero da landing, de 997px —, e ele saiu na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94), junto com o consumidor.

**Antes dele o `5xl` já tinha saído**, e a lápide vale a linha porque as duas mortes são a mesma régua aplicada de dois lados. O `5xl` foi escolhido quando o hero era um bloco de prosa de 672: naquela largura, 48px era o maior degrau que o orçamento da dobra tolerava. Com o bloco do hero tomando o container, o título passou a caber numa linha em 60, e o `5xl` ficaria **sem consumidor** — o defeito do Infima que este documento nomeia para não copiar. O `6xl` sai agora pelo motivo inverso: ele tinha o consumidor, e o consumidor é que saiu.

**Por que ele não fica como órfão declarado, se outros ficam.** A régua está no fecho da varredura de [`README.md`](README.md) §7: o que se remove é órfão **sem motivo**, não órfão. Os sete que ficam são elo de família — parada de rampa, papel de modo declarado nos dois blocos, nome do vocabulário fechado de motion — ou medida de referência contra a qual se confere outra coisa. **Um degrau de display não é elo de nada:** ele já saltava o `5xl` por não haver o que preencher no meio, e uma escala que termina no `4xl` não tem buraco — tem fim. Mantê-lo repetiria exatamente o defeito que matou o `5xl`.

> *Dissenso registrado, e a contagem subiu.* O degrau de display do projeto foi decidido **três vezes**, com três respostas — 48, 60, e nenhum. Fica escrito porque o que mudou nas duas primeiras não foi o gosto, foi a largura de onde o título morava; na terceira não foi nem isso — foi o título deixar de existir. É a leitura que impede a próxima faixa de espetáculo de reabrir o número em silêncio: quem a trouxer de volta decide o degrau pela quarta vez, e deve ao arquivo o motivo.

### As fontes

**Inter e Paper Mono, variáveis, OFL, auto-hospedadas em `static/fonts/`, com os `@font-face` no nosso CSS. Zero CDN.** Requisição externa esbarra na CSP do ambiente corporativo alvo, e auto-hospedar custa o mesmo — zero dependência npm —, então não há troca a fazer.

**É a tipografia da própria âncora**, e isso é `herdado` e não escolha nossa: as três pilhas são parâmetro que ela expõe, e o §2 do [`principios.md`](principios.md) já registrava que tipografia não é delta.

**A versão é fixada, não só o nome.** A Paper Mono está abaixo de 1.0 — OFL não expira, mas a face ainda pode mudar de desenho entre versões, e um nome sem número não diz qual desenho a spec descreve.

| Família | Arquivo | Versão | Licença |
| --- | --- | --- | --- |
| Inter · Inter Display | `Inter-Variable.woff2` | **4.001** | OFL 1.1 — The Inter Project Authors |
| Paper Mono | `PaperMono-Variable.woff2` | **0.310** | OFL 1.1 — The Paper Mono Project Authors, da Paper Design |

**São dois arquivos, e o `OFL.txt` cobre três famílias.** A face da Inter cobre duas: o eixo `opsz` de 14 a 32 é o que o upstream publica separadamente como Inter e Inter Display. A da Inter é **subconjunto** de latin + latin-ext do arquivo publicado, com `cv02` `cv03` `cv04` `cv11` preservadas; a da Paper Mono é cópia byte a byte. As duas modificações estão declaradas no cabeçalho do `OFL.txt`.

> **Dois arquivos, não quinze.** A âncora serve 14 faces de Inter, e essa contagem é subconjunto por script para tráfego global — cirílico, grego, vietnamita. É decisão de multi-tenant; o ambiente corporativo alvo não tem esse problema, e copiar a contagem seria **herdar uma restrição de arquitetura que não é nossa** — o mesmo argumento já escrito para o contrato de partes.

**A escala e a medida de prosa não se mexem junto.** Medido nos arquivos de fonte, a largura média das minúsculas difere em **0,5%** no corpo e **0,8%** no mono contra as famílias anteriores. E a medida de prosa não é alvo de caracteres por linha: é o `max-w-2xl` medido na âncora. Adotar a Inter torna a medida **mais fiel, não menos** — antes o projeto renderizava a medida da âncora com uma fonte que ela não usa.

O `src` começa em `/` e mesmo assim sobrevive ao `baseUrl` em subcaminho: o webpack do Docusaurus registra os diretórios estáticos em `resolve.roots`, resolve o arquivo em build e reemite a URL já prefixada. Não é link absoluto escrito à mão — é resolução de módulo.

**Custo nomeado:** o arquivo é emitido duas vezes — uma pela cópia literal de `static/`, outra pelo webpack com hash de conteúdo. São dois arquivos pequenos, e a alternativa seria cravar o `baseUrl` na folha de estilo.

**Dissenso registrado.** O x-height da Paper Mono é 4% menor que o da mono anterior, então no mesmo `font-size` o código lê um pouco menor; não foi compensado, porque compensar exigiria um degrau de escala só para o mono e a âncora não tem um. E a Inter é a fonte mais usada da web: o projeto acabou de escolher marca própria para **não** parecer a âncora, e aqui escolhe o contrário. A coerência é seguir a âncora; o resultado é menos distintivo.

### As quatro variantes de caractere

```css
html { font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; }
```

**`herdado` por medição direta** — está verbatim no CSS que a âncora serve, e é boa parte do porquê de o texto dela não parecer Inter default.

Ela é a única linha da tipografia que **não é token**, e mora em `src/css/custom.css` junto dos `@font-face`. O motivo é que ela não é valor: é um interruptor de fonte, e não há nada nela que a camada de raiz saiba expressar. Com uma pilha que não seja a Inter o navegador a ignora em silêncio — é por isso que ela só faz sentido depois da troca de família.

**Perda nomeada:** `cv02`, `cv03` e `cv04` mexem em `a`, `g` e `l` minúsculos, e ninguém avaliou o efeito delas em **pt-BR**. O corpus da âncora é inglês.

### Renderização de prosa

`hyphens: none` porque a hifenização de português é inconsistente entre motores, e na medida de prosa deste projeto o alinhamento à esquerda não precisa dela. `text-wrap: pretty` no corpo e `balance` em título, que matam órfã sem custar nada.

> *Correção de vocabulário, do teste de reconstrução ([`README.md`](README.md) §6):* a redação anterior dizia *"em título **e lead**"*. **Não existe elemento `lead` nesta spec** — nenhum dos trinta e um documentos o define, e o CSS aplica `balance` só a `h1`–`h6`. Termo sem definição é o tipo de palavra que quem implementa tenta honrar inventando o elemento.

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

Todos os pares onde AA é obrigatório, nos dois modos, sobre **as duas** superfícies — a levantada e a página.

> **Esta tabela não é transcrita; ela é conferida.** `node scripts/contraste.mjs` a computa a partir de `src/css/tokens.css`, e `--verificar` lê estas linhas de volta e **compara célula a célula** — reprova se um número divergir, se um piso cair, ou se uma linha for renomeada para escapar da conferência. É o que fecha o defeito descrito logo abaixo, e é o motivo de os números aqui terem duas casas e nenhuma margem de arredondamento negociável.
>
> **Nenhum valor de desenho mora no script**: marca, rampa, superfícies, alfas e travas saem do CSS por um avaliador das três operações de derivação, e forma que ele não reconhece o faz morrer em vez de cair num valor velho. Trocar a superfície levantada no bloco de troca move estas células, e a conferência avisa.

| Par | Escuro | Claro |
| --- | ---: | ---: |
| `text-strong` sobre levantada / página | 13,54 / 17,87 | 17,87 / 17,10 |
| `text-body` sobre levantada / página | 9,66 / 12,75 | 9,34 / 8,94 |
| `text-muted` sobre levantada / página | 5,75 / 7,59 | 7,12 / 6,81 |
| acento como link, sobre levantada / página | 5,55 / 7,33 | 5,96 / 5,70 |
| `text-inverse` sobre preenchimento de acento | 7,85 | 6,54 |
| anel de foco vs levantada / página (SC 1.4.11 pede 3:1) | 5,55 / 7,33 | 5,96 / 5,70 |
| anel de foco vs pastilha de código | 6,58 | 6,54 |
| `text-strong` sobre o wash do item ativo | 15,35 | 14,34 |
| **sintaxe, pior token, sobre a pastilha** | **8,04** | **6,29** |
| ícone de estado sobre o próprio fundo, pior caso | 4,96 | 5,45 |
| corpo sobre fundo de callout, pior caso | 6,47 | 7,98 |

### A divergência com [`foco.md`](foco.md) §6 está fechada, por medição

**O defeito:** as duas tabelas mediam o **mesmo par** — o anel de foco contra a superfície levantada e contra a página — e discordavam em **três das quatro células**. Ele foi achado pelo teste do axioma 6 e ficou aberto desde então, porque adivinhar qual estava certa seria inventar um número medido, e é o axioma 5 que estava em jogo.

**O que fechou:** as duas superfícies foram reescritas de qualquer jeito por causa da marca nova, então as quatro células foram **medidas de novo**, pelo mesmo comando, e as duas tabelas passaram a sair da mesma fonte. As duas concordam célula a célula porque agora é **impossível** discordarem.

O método vale registro, porque ele é o que reproduz o número. Duas escolhas o fixam:

- **o contraste é medido sobre a cor de oito bits**, não sobre a aritmética contínua da conversão OKLCH→sRGB. É o que a tela recebe, e é o que faz `#FAF2F9 sobre #2B262A` dar o mesmo número aqui e em qualquer conferidor de contraste do mundo;
- **cada preenchimento translúcido é composto sobre o fundo em que ele de fato assenta.** Preenchimento com alfa não tem cor própria: tem a cor do que está atrás. O callout mora dentro do corpo do documento, sobre a superfície levantada; o wash do item ativo mora na sidebar, que fica fora dela, sobre a página. Compor o callout sobre a página em vez da levantada move o pior caso do corpo de 6,47 para 9,10 — a distância entre um par que passa raspando e um que passa com folga.

**As células que não dependem do acento saem idênticas às da tabela anterior**, e é isso que confirma o método contra a medição antiga em vez de substituí-la sem prova. Uma exceção nomeada: a linha do ícone de estado não reproduz — o registro anterior dava 5,23 / 5,52 e a medição dá **4,96 / 5,45**. Não foi possível reconstruir com que par o número antigo saiu, então vale o medido, e ele continua bem acima dos 3:1 que a SC 1.4.11 pede para conteúdo não textual.

### O piso da paleta de sintaxe é critério, não registro

**`node scripts/contraste.mjs --verificar` reprova se o pior token cair abaixo de 8,03 no escuro ou 6,29 no claro, ou se o croma máximo passar de 0,095.**

Hoje ele mede **8,04** no escuro — e a distância até o piso é de **um centésimo**, que é o mais apertado que este número já esteve.

**O piso do escuro desceu de 8,04 para 8,03, e a descida é aritmética, não afrouxamento.** O 8,04 foi escrito como **previsão**, quando a pastilha ainda era a cor da página e a medição dava 8,94: o número gravado era o da pastilha *"um degrau acima na rampa, que é onde ela vai parar quando o cartão sair"*. O cartão saiu, a pastilha subiu, e **a previsão acertou a segunda casa decimal** — a medição dá 8,0364, que se publica como 8,04 e é, no float, três milésimos menor que o piso previsto.

Um piso gravado **acima** do que a grandeza vale não é rigor: é um portão que nunca poderia passar. Vale o degrau honesto abaixo da medição, com o `>=` estrito e sem regra de comparação especial. **O acerto da previsão fica registrado onde importa** — na segunda casa, que é a precisão que esta spec publica.

*Consideração descartada, e vale escrita:* comparar os pisos de sintaxe **na precisão publicada**, em vez de mover o número. Isso resolveria o mesmo problema e compraria meio centésimo de folga **nos dois sentidos** — uma paleta futura em 8,035 passaria por um piso de 8,04. Mover o piso é mais estrito e não precisa de conceito novo no script. Os limiares de AA e da SC 1.4.11 nunca estiveram em jogo: eles são **normativos**, e ali 4,4951 falha de verdade.

Os três números que convertem *"não muito neon"* de gosto em régua:

| | croma médio | croma máx | pior contraste |
| --- | ---: | ---: | ---: |
| semeadura anterior | 0,104 / 0,089 | 0,173 / 0,113 | 7,77 / 5,66 |
| o par padrão da âncora | 0,075 / 0,115 | 0,112 / 0,207 | 5,87 / 4,55 |
| **esta paleta** | **0,057 / 0,062** | **0,095 / 0,090** | **8,04 / 6,29** |

*A coluna de contraste desta tabela deixou de ser comparável coluna a coluna no escuro, e isso fica dito em vez de escondido:* as duas primeiras linhas foram medidas sobre a pastilha **antiga**, que era a cor da página, e só a terceira foi remedida sobre a nova. A coluna do claro continua comparável, porque a pastilha clara não se mexeu. Remedir as outras duas exigiria as duas paletas inteiras, que não moram neste repositório — e a comparação que a tabela existe para fazer é de **croma**, onde as três linhas continuam saindo do mesmo método.

*As três linhas foram medidas pelo mesmo comando, e a primeira adjudica um número que estava em disputa:* a resolução que escolheu esta paleta registrou o piso da semeadura anterior como **7,02**, e a tabela deste documento registrava **7,77**. **7,77 é o certo** — quem tinha razão era o registro antigo, e é ele que fica.

Ela é a **menos saturada das três nos dois modos** e a única que bate os dois pisos. *Dissenso registrado:* baixar o croma médio para 0,057 é menos cor do que qualquer uma das duas alternativas — se ao vivo o bloco parecer apagado, o ajuste é subir croma dentro da mesma banda, e a spec já terá afirmado os números. E o teto de 0,095 é **derivado, não medido**: é o teto do par da âncora puxado para baixo por julgamento.

### A única reprovação, e ela é deliberada

**`--sd-text-faint` reprova: 3,04:1 no escuro e 4,45:1 no claro** — sobre a superfície levantada, que é o pior caso dele.

É a parada 500 — o meio matemático da rampa —, então é o pior caso **por construção**, e nenhum ajuste salva.

> **Proibido para texto de leitura.** `--sd-text-faint` existe para separador, placeholder e controle desabilitado, que é isento pela SC 1.4.3. Texto secundário legítimo usa `--sd-text-muted`, que passa nos dois modos.

### A garantia é da arquitetura, não desta skin

**O contraste é propriedade das paradas, não da marca.** A tabela foi rodada com marca violeta e com marca âmbar: idêntica até a segunda casa decimal. A cromaticidade da rampa é pequena demais para mover luminância relativa.

A troca de marca desta skin é a prova disso rodando ao vivo. O acento perdeu um terço de croma, e as linhas que não o citam **não se mexeram**: `text-strong`, `text-body` e o corpo sobre fundo de callout saíram idênticas nas duas colunas, e `text-muted` saiu idêntica no escuro.

**A única exceção é um pixel, e ela mostra a mecânica funcionando em vez de contradizê-la:** `text-muted` no claro caiu de 7,15 / 6,84 para 7,12 / 6,81. Aquele papel é a parada `gray-600` — a **única** das onze que não saiu byte a byte idêntica na troca, e ela difere em 1/255 num canal. Três centésimos de razão de contraste é o tamanho de um pixel de diferença, e é o tamanho certo.

Mexeu, além disso, só o que depende do acento — link, anel de foco, `text-inverse` e o wash —, que é exatamente o conjunto que a arquitetura diz que depende da marca.

E as travas de luminosidade foram testadas nos vinte e quatro matizes do círculo com cromaticidade máxima: **pior caso 5,17:1** nos dois modos. **Qualquer hex que o corporativo cole herda esta tabela**, com folga sobre 4,5:1, sem que ninguém verifique nada.

Consequência que vale dita: mover o ângulo de um matiz de estado **não consegue** quebrar contraste. A única coisa que ele quebra é significado — e é por isso que o marcador `Livre` restringe a *família* e não escreve banda numérica. Cravar um "±20°" seria invenção.

---

## 11. Os portões que este documento cobra

| # | Portão | Cadência | Como roda |
| ---: | --- | --- | --- |
| 1 | Literal de cor, comprimento, tempo ou curva fora de `src/css/tokens.css` | commit | `npm run portao:1` |
| 2 | `transition:`/`animation:` com `ms`, `s` ou `cubic-bezier` cravado | commit | `npm run portao:2` |
| 6 | As três rotas contra o host real, nos dois locales | implantação | `npm run portao:6 -- <url-base> [rota]` |

Mais **duas** verificações que não são portão, e rodam junto na CI:

| Comando | O que ele confere |
| --- | --- |
| `node scripts/espelho-tokens.mjs --verificar` | o bloco `css` da §3 é `src/css/tokens.css` byte a byte |
| `npm run contraste` | os pisos da §10, computados do CSS em vez de transcritos |

**As duas são verificação e não portão pela mesma régua**, que é a da [espinha](README.md) §5: portão protege uma **regra de escrita**; verificação confere que **duas cópias da mesma verdade não divergiram**. Aqui as cópias são o número escrito na spec e a cor que o CSS entrega.

**A segunda nasceu de um defeito real, não de zelo.** Duas tabelas desta spec mediam o mesmo par e discordavam em três das quatro células, e a divergência sobreviveu a uma auditoria inteira porque não havia como conferi-la sem refazer a conta à mão. Uma tabela transcrita diverge calada; uma tabela que sai de um comando não tem como.

**Limite conhecido do portão 1, escrito em voz alta:** media query não lê custom property, e o limiar dela é um comprimento — então o prelúdio de `@media` **não tem como** passar pela varredura de literal.

> *Correção do teste de reconstrução ([`README.md`](README.md) §6):* a redação anterior resolvia isso dizendo que *"enquanto o único limiar do projeto morar no arquivo de tokens, o portão passa sem exceção"*. **É falso, e subestima o portão.** O limiar mora também em `src/css/chrome.css`, que é onde o comportamento de tela estreita precisa dele; quem lesse a frase concluiria que uma media query fora do arquivo de tokens reprova, e ela não reprova.
>
> O que o portão 1 de fato faz são **duas pernas**: o prelúdio de `@media` sai da varredura de literal **e entra numa segunda perna**, que cobra que todo limiar seja o limiar único do projeto — 996/997px. Um `@media (min-width: 1024px)` novo reprova, que é exatamente onde ele precisa reprovar. A exceção não é buraco: é uma regra mais estreita, escrita noutro lugar.

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
| `--sd-brand-tint` | herdado (banda) + **origem própria (conta)** | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §1 fixa a banda; o 0,075 é o que segura `c × tint` em 0,0120 quando o croma cai. Ninguém mediu que a banda *deva* ser constante — a conta é defensável e não é medição |
| Matiz da marca, magenta serenizado | origem própria | [#68](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/68) — nenhuma medição sustenta matiz de marca; o croma caiu de 0,240 para 0,160 |
| Travas de luminosidade do acento | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §2a — verificadas em 24 matizes |
| Três acentos no bloco de troca | herdado | [#2](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/2) §3.1 |
| Tipografia dentro do contrato de troca | **herdado** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — o carimbo antigo contrariava o [`principios.md`](principios.md) §2, que já dizia que tipografia é parâmetro que a âncora expõe |
| `--sd-radius` no bloco de troca, e o valor | **herdado** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — `--sd-radius-md` já entrega 12px, o `rounded-xl` da âncora; a parametrização por `calc()` responde ao axioma 3, não ao §3 |
| Escada de raio por múltiplo | mecanismo emprestado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §7 — raio paramétrico da Vapi, disciplina do Neon |
| Escuro em `:root`, claro como override | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §4 — Infima e alvo põem claro em `:root`; axioma 4 |
| Adaptador de mão única | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2, derivado das armadilhas da [#5](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/5) |
| As exceções com escopo, como lista fechada | herdado | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| **Elas caem de cinco para quatro** — `--docusaurus-tag-list-border` sai | **herdado** | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60) — o front matter da âncora não tem `tags`, e nenhuma página deste site declara o campo. Linha permanentemente infalsificável é o oposto de lista conferível. *Dissenso: o modo de falhar que a saída abre é silencioso* |
| A exceção do Prism não é alcançável por seletor | **origem própria (correção)** | medido no fonte da 3.10.2 ao implementar o slice 1 — `style` inline vence folha de estilo |
| `--ifm-transition-slow` fora do adaptador | **origem própria (correção)** | varredura de `var(--ifm-*)` no Infima e no theme-classic — zero consumidores |
| Ênfase mapeada em papéis da camada 2 | origem própria | consequência de o adaptador ser cego ao modo |
| `@property` em três raízes | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §2, corrigindo a [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §2d |
| Oito papéis semânticos | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5.1 abre o oitavo sobre os sete da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §6 |
| Camada semântica inteira nos dois modos | herdado + origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5 |
| Página clara na parada 100 | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §4 — preserva o tint na maior superfície do claro |
| O papel da superfície levantada troca de nome | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — o nome anterior citava o cartão, que está de saída, e já colidia com a grade de `card-group` e com o cartão-componente. `raised` nomeia o papel: *o que não é a página* |
| Pastilha de código no extremo do modo | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §4 — Clerk e a anatomia da Perplexity |
| **A pastilha do escuro sobe para a parada 900** | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — ela era o **mesmo valor** de `--sd-surface-page`, e sem cartão o bloco sumia contra a página. *Dissenso: a 900 é o degrau imediatamente acima na rampa, e não uma medida; o que morre no lugar era anatomia medida* |
| Borda = tinta a 7% | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §5 — reproduz os dois valores medidos com um mecanismo |
| `--sd-shadow-lip` como valor único, ancorado no topo da rampa | origem própria | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §2, corrigindo a tinta da [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) |
| Dois papéis de sombra, nomeados por intenção | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — os consumidores de sombra em `src/`, com o cartão de saída. Uma escala de dois não é escala |
| O anel embutido vira borda de verdade | **origem própria (verificação)** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — o adaptador alcança `--ifm-*-border-color` em todo componente; anel em `box-shadow` exige sobrescrita por componente |
| `--ifm-global-shadow-md` e `-tl` ao papel flutuante | **origem própria (verificação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — no Infima, `md` é lida por `.dropdown__menu` e `.navbar-sidebar`; `tl` só por uma classe que ninguém usa |
| **`--sd-shadow-sunken` morre; zero sombra no conteúdo** | **herdado** | [#50](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/50) — zero componentes de conteúdo com sombra em seis páginas da âncora; `shadow-md` e maiores existem no CSS dela e nunca são usados. Afundar era relativo ao cartão |
| **`--ifm-global-shadow-lw` e `--ifm-alert-shadow` em `none`** | **origem própria (verificação)** | [#60](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/60), com uma **correção medida**: a decisão nomeava `.card` do Infima como leitor de `lw`, e este site não renderiza `.card` nenhum. Os leitores vivos são `CodeBlock/Container` e `BackToTopButton` |
| O botão de voltar ao topo recupera a sombra em `chrome.css` | **origem própria (consequência)** | ele é chrome flutuante pela mesma definição que classifica o dropdown e a gaveta, e o gancho é `ThemeClassNames` — nenhuma exceção nova no adaptador |
| `--sd-shadow-cast` como par declarado | herdado | [#13](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/13) §2 — derivá-lo sai ajuste de curva com literais mágicos |
| **O segundo seletor do bloco escuro saiu, e a camada 3 ficou vazia** | **origem própria (consequência)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — a ilha era hospedada só pela landing; o mecanismo fica registrado em §6 como especificação do que precisaria voltar |
| **A segunda âncora de `contraste.mjs`** | **origem própria (implementação)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — sozinho, `:root {` abre quatro blocos, e casar só o seletor mediria a camada errada em silêncio |
| Paleta de sintaxe, 14 hex | **origem própria (medição)** | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — a âncora foi medida e revelou não-decisão; ver [`principios.md`](principios.md) §5.3. A semeadura anterior vinha do Neon, que não é âncora e não doa valor |
| O cyan no identificador, e `constant` como vizinho | **origem própria (medição)** | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — pintar o dominante de cyan mataria a distinção de tipo, que é a função da cor no código |
| O cyan é **skin fixa**, fora da superfície de troca | origem própria | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — precedente dos quatro `--sd-hue-*`: o corporativo redesenha, não re-marca |
| Teto de croma 0,095 | **origem própria** | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) — é o teto do par da âncora puxado para baixo por julgamento, e não uma medida |
| Shim de config que só referencia token | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §2 |
| Quatro matizes de estado | **herdado** | [#83](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/83) — ícone dos callouts `Note`/`Warning`/`Tip`/`Danger` medido em mintlify.com/docs (Chrome headless, `getComputedStyle`), sRGB convertido para H de OKLCH. `success` e `danger` já batiam com o ângulo anterior a menos de 1,5°; `info` e `warn` divergiam ~20° e passaram a ser o ângulo medido |
| `Livre` dos matizes move ângulo, não tom | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §3, corrigindo a redação da [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) |
| Fórmula de preenchimento de callout | herdado | [#4](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/4) — medida na Perplexity |
| Fórmula de **aresta** de callout, e ela mora na camada 2 | herdado (fórmula) + **origem própria (implementação)** (a casa) | [#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15) trava 30%/25%; o alfa bifurca por modo, e camada 2 é o único lugar onde modo diverge |
| `--sd-card-min` derivado da medida de prosa | herdado | [#28](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/28) §2 — o limiar `@2xl` da âncora a três colunas; 42rem e a medida de prosa são o mesmo `max-w-2xl` |
| `secondary` deixa de ser "o que a `note` consome" | **origem própria (correção)** | o callout ganhou DOM próprio no slice do catálogo, e `note` é a variante azul — quem é neutro é `info` ([#15](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/15)) |
| Escala de espaço base 4 | **origem própria (medição)** | [#83](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/83) — `--spacing: .25rem` medido idêntico nas sete, inclusive as três que não são Mintlify. Não é decisão da âncora: é o default do Tailwind CSS v4, que as sete rodam por baixo. Convergência de ferramenta, não de sistema de design — por isso não sobe a `herdado` |
| Nomes de tipografia | origem própria | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §1 — nomear é nosso; a gramática de camada é da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) |
| Degraus `xs…4xl` e os valores | herdado | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §6 — medido nos quatro |
| Degrau do título em 996/997 | **lacuna por restrição** | [#55](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/55) — o par 30/36 é medido; o ponto de troca é o limiar que o Docusaurus não deixa mover sem `unsafe` |
| Inter / Paper Mono auto-hospedadas, com versão fixada | herdado | [#72](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/72) — é a tipografia da âncora, e o `paperMono` dela é OFL 1.1 da Paper Design, não face própria |
| As quatro variantes de caractere da Inter | herdado | [#72](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/72) — verbatim no CSS servido pela âncora |
| Dois arquivos de fonte, não quinze | **origem própria (verificação)** | [#72](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/72) — a contagem da âncora é subconjunto por script para tráfego global |
| `hyphens: none`, `text-wrap: pretty` | origem própria | [#12](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/12) §6 — pt-BR; nenhuma referência medida nesse eixo |
| Escala de duração e as duas curvas | herdado | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §1 — medidas nas sete |
| `--sd-move-enter` na parada curta | herdado (correção) | [#19](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/19) corrigindo a [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) |
| Dois níveis de latitude | mecanismo emprestado | [#31](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/31) §3 — a distinção é da [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11), aqui vira regra |
| Dimensões do chrome no arquivo de tokens | herdado | [#14](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/14) §5 — a anatomia é de `chrome.md` |
| **`--sd-type-6xl` saiu, e a escala termina no `4xl`** | **origem própria (consequência)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — o único consumidor era o título do hero; degrau de display não é elo de família, então não fica como órfão declarado. Terceira decisão sobre o mesmo degrau: 48, 60, nenhum |
| O `5xl` sai da escala | **origem própria (correção)** | [#80](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/80) — ele foi dimensionado para um hero de 672, e com o hero no container ficaria sem consumidor |
| `--sd-glow` a 30%, e `--sd-glow-2` cyan a 24% — **removidos** | **origem própria (correção)** + origem própria | [#73](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/73) escreveu o par supondo 0,30 na origem; o publicado era 12%, e sem a figura a luz carregava o hero sozinha. Os dois saíram na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) |
| A medida do código morre; os dois consumidores citam a de prosa | **origem própria (implementação)** | [#56](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/56) — a derivação era o interior do cartão, e sem cartão sobraria um 768 sem raiz |
| Par de amplitude do glow, no escopo da ilha — **removido** | origem própria | [#17](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/17) §5b — amplitude era par declarado sobre o alfa, não número novo; saiu na [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) com a regra que a hospedava |
| **Os três movimentos da ilha ficam declarados sem consumidor** | **origem própria (consequência)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — o vocabulário de motion é fechado pelo portão 2, e nome que sai é número cravado que volta |
| **`--sd-accent-contrast` fica declarado sem consumidor** | **origem própria (consequência)** | [#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94) — o único era o texto do botão primário da landing; papel semântico é família declarada nos dois modos |
| Regra de elemento no bloco `reduce`, com gancho `data-sd-part` | **origem própria (implementação)** | ADR 3 — de `tokens.css` não há seletor que alcance uma classe hasheada, e nome de `@keyframes` não sobrevive dentro de custom property ([`motion.md`](motion.md) §6) |
| Portão de `grep` de literal | origem própria | [#11](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/11) §7 |
| Espelho verificado por script | origem própria | consequência da regra de fonte única da [#9](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/9) |
| Aviso do `postcss-calc` sobre cor relativa | **origem própria (achado)** | observado ao rodar o build do slice 1; valor emitido conferido byte a byte |
| `--sd-surface-scrim`, par declarado | **origem própria** | não há medição de véu nas referências. A opacidade bifurca por motivo mecânico: no escuro a página já está na parada 950, e no claro o mesmo alfa faria buraco em vez de profundidade ([`busca.md`](busca.md) §5.3) |
| `--sd-busca-height` como token de camada 1 | **origem própria (correção)** | `dvh` não está no padrão do portão 1, e o literal passaria pela varredura — fechar o buraco custa uma linha aqui |
| A largura do modal de busca **não** vira token | **origem própria (implementação)** | é `--sd-prose-width`, citada por nome; nomeá-la de novo criaria segunda cópia do mesmo número |
