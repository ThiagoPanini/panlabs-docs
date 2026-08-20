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
   panlabs-docs — tokens

   Este é o ÚNICO arquivo do repositório com valor literal. Cor, comprimento,
   tempo e curva nascem aqui e em nenhum outro lugar; o portão 1 reprova qualquer
   um dos quatro fora daqui (`npm run portao:1`).

   Três camadas, e o nome diz de que camada é:

     1 — raiz         --pd-<coisa> · --pd-<escala>-<degrau>
                      o único lugar com literal. Duas regiões: o bloco de troca
                      delimitado por SKIN … /SKIN (o que o corporativo edita) e a
                      base (escalas e a forma da rampa).
     2 — semântica    --pd-<papel>-<qualificador>, papel de LISTA FECHADA de oito:
                      surface · text · border · accent · shadow · focus · state · code
                      Só cor. É o ÚNICO ponto do sistema onde os modos divergem.
     3 — componente   --pd-<componente>-<parte>, declarada no escopo do componente
                      e nunca em :root.

   Cor sempre desce pela camada 2. Dimensão vem direto da camada 1.

   O Infima fica do outro lado de um adaptador de MÃO ÚNICA (fim do arquivo):
   o adaptador escreve --ifm-*, e nenhuma regra do projeto lê --ifm-*.

   Procedência das decisões: docs/design/tokens.md.
   Doutrina de CSS (por que :root[data-theme='light'] e por que @layer está fora):
   docs/adr/0001-doutrina-de-css.md.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   @property — as duas raízes registráveis do bloco de troca

   Propriedade registrada com valor inválido cai para o initial-value, não para
   `unset`. Colagem errada degrada para o valor entregue de fábrica em vez de
   apagar fundos em silêncio.

   Registra-se exatamente as linhas do bloco de troca cuja entrega é literal E
   computacionalmente independente — é o que `initial-value` sabe expressar.
   As outras cinco entregam referência (`var()`, `oklch(from …)`) ou pilha de
   fonte, e `initial-value` não aceita nenhuma das duas.

   (As duas contagens acima diziam TRÊS e SETE, contra um bloco de troca de
   sete linhas com duas registradas. O comentário do bloco SKIN, no `:root`
   abaixo, sempre disse *"as duas linhas"* e *"as outras cinco"* — eram os
   números daqui que estavam soltos. Contagem em comentário não tem portão,
   e é por isso que ela vale a errata em vez da reescrita silenciosa.)

   ---------------------------------------------------------------------------
   A TIPAGEM `<color>` DE --pd-brand É CARGA ESTRUTURAL, NÃO DECORAÇÃO.

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

@property --pd-brand  { syntax: '<color>';  inherits: true; initial-value: #BC461D; }
@property --pd-radius { syntax: '<length>'; inherits: true; initial-value: 16px; }

/* =============================================================================
   CAMADA 1 — raiz
   ============================================================================= */

:root {
  /* SKIN — o que o corporativo edita para re-marcar. Nada além disto.
     Tipadas com @property: --pd-brand, --pd-radius.
     São as duas linhas cuja entrega é literal — colagem inválida nelas cai no valor
     de fábrica. As outras cinco entregam referência ou pilha de fonte, que
     initial-value não sabe expressar: colagem inválida ali apaga o que a linha
     alimenta, à vista. */
  --pd-brand:          #BC461D;
  --pd-brand-on-dark:  oklch(from var(--pd-brand) max(l, 0.72) c h);
  --pd-brand-on-light: oklch(from var(--pd-brand) min(l, 0.50) c h);
  --pd-font-body:      'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --pd-font-heading:   var(--pd-font-body);
  --pd-font-mono:      'Paper Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --pd-radius:         16px;
  /* /SKIN */

  /* O `L` do hex da marca é INERTE: as duas travas de acento reescrevem `L` e
     consomem só `c` e `h` (`max(l, 0.72)` e `min(l, 0.50)`). Dois hexes do
     mesmo matiz e cromaticidade produzem os dois acentos byte a byte
     idênticos — só o ÂNGULO do matiz importa.

     A rampa NÃO lê `--pd-brand` mais. Issue #95: a tinta que ela herdava da
     marca era mecanismo copiado de onde ele não se aplica — a âncora não
     pinta superfície com a rampa tingida, pinta com um cinza neutro à parte
     (ver o bloco `--pd-neutral-*`, abaixo). `--pd-brand-tint` e o pin
     `c × tint = 0,0120` que o mantinham não têm mais o que travar, e saíram
     do sistema. Ver docs/design/tokens.md §5. */

  /* ---------------------------------------------------------------------------
     Cinza neutro puro — o chão, fora da rampa

     A superfície de página, nos dois modos, e a elevada no claro não são
     parada de rampa nenhuma: são cinza neutro medido direto na âncora
     (issue #95). A elevada no escuro não tem literal próprio aqui — ela
     referencia a própria página, porque a âncora eleva cartão por borda, não
     por fundo (ver o bloco escuro, mais abaixo).
     --------------------------------------------------------------------------- */
  --pd-neutral-page-dark:    #141414;
  --pd-neutral-page-light:   #FCFCFC;
  --pd-neutral-raised-light: #FFFFFF;

  /* ---------------------------------------------------------------------------
     A rampa de onze cinzas — medida na âncora, fria, e não deriva de nada

     Até a issue #95, as onze paradas eram tingidas pelo matiz da marca. Agora
     valem os hex medidos na âncora, fixos qualquer que seja `--pd-brand`: a
     FORMA da rampa continua geometria herdada, só que por valor copiado em
     vez de fórmula reaplicada — trocar a marca não move mais nenhum neutro do
     sistema.

     A rampa é declarada INTEIRA, e hoje TRÊS paradas estão sem consumidor: a
     100, a 200 e a 800. Eram declaradas como "só a 200" aqui, e a contagem
     nasceu errada no próprio commit que a escreveu — a issue #95, que
     desacoplou a rampa da marca, é onde `git log -S` põe a perda dos
     consumidores da 100 e da 800. Nenhuma CI tinha como ver: órfão não quebra
     build.

     As três ficam pelo mesmo argumento que sustenta a família de `-edge` mais
     abaixo: uma rampa de onze com buraco no meio é pior de ler do que a parada
     a mais. Parada é geometria, não consumidor — e o argumento não muda com o
     número de buracos.
     --------------------------------------------------------------------------- */
  --pd-gray-50:  #F4F6FA;
  --pd-gray-100: #EFF1F5;
  --pd-gray-200: #DFE2E6;
  --pd-gray-300: #CFD1D5;
  --pd-gray-400: #A0A2A6;
  --pd-gray-500: #717377;
  --pd-gray-600: #515357;
  --pd-gray-700: #404246;
  --pd-gray-800: #26292D;
  --pd-gray-900: #181A1E;
  --pd-gray-950: #0B0D11;

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
  --pd-hue-info:    266;
  --pd-hue-success: 150;
  --pd-hue-warn:     62;
  --pd-hue-danger:   27;

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
     varredura: o que se remove é órfão SEM MOTIVO, não órfão. `--pd-gray-200`
     fica porque é parada de uma rampa declarada inteira, e rampa com buraco é
     pior de ler; `--pd-state-danger-edge` fica porque família de quatro não tem
     buraco no meio. (O exemplo daqui ERA `--pd-toc-width`, e ele deixou de
     servir: a #96 lhe deu três consumidores — ver o bloco de chrome abaixo.
     Órfão que ganha consumidor sai da lista.) Um degrau de display não é elo de
     nada — ele já saltava o `5xl`
     por não ter o que preencher no meio —, então sem o hero não sobra motivo, e
     manter o `6xl` repetiria exatamente o defeito que matou o `5xl`.

     Consequência declarada: o degrau de display do projeto foi decidido três
     vezes, com três respostas — 48, 60, e nenhum.
     --------------------------------------------------------------------------- */
  --pd-type-xs:    12px;
  --pd-type-sm:    14px;    /* densidade de UI — o número mais unânime da amostra */
  --pd-type-base:  16px;    /* prosa */
  --pd-type-lg:    18px;
  --pd-type-xl:    20px;
  --pd-type-2xl:   24px;
  --pd-type-3xl:   30px;    /* título de página, até 996px */
  --pd-type-4xl:   36px;    /* título de página, de 997px — o topo da escala */

  /* Peso — três, nomeados por intenção. Nome de intenção não colide com o
     `semibold: 500` do Infima, que é a mesma palavra sobre outro número. */
  --pd-weight-body:    400;
  --pd-weight-ui:      500;
  --pd-weight-heading: 600;

  /* Entrelinha. h4 repete o valor de ui e mantém nome próprio: mesmo número
     hoje, intenções diferentes. */
  --pd-leading-prose: 1.75;
  --pd-leading-ui:    1.5;
  --pd-leading-code:  1.7143;
  --pd-leading-h1:    1.111;
  --pd-leading-h2:    1.333;
  --pd-leading-h3:    1.4;
  --pd-leading-h4:    1.5;

  /* Letter-spacing — um só. O corpo usa o `normal` do navegador, que é keyword
     e não valor, então não precisa de token. */
  --pd-tracking-tight: -0.025em;

  /* Falso-negrito — o realce do item ativo da sidebar, e ele não é enfeite.
     Trocar `font-weight` reflui o texto e o item PULA de largura no instante em
     que o leitor navega; meio pixel de sombra engrossa sem mexer na métrica.
     `currentColor` resolve no elemento, então o realce acompanha o acento sem
     par declarado e sem segundo valor para o modo claro. */
  --pd-negrito-optico: 0 0 0.4px currentColor;

  /* ---------------------------------------------------------------------------
     Espaço — base 4px, escada por calc(). Um literal só.
     Toda dimensão que o projeto travou é múltiplo de 8; a base fica em 4 para o
     meio-passo que a densidade de 14px exige em chip, badge e ícone.
     --------------------------------------------------------------------------- */
  --pd-space-1:  4px;   /* único literal da escala */
  --pd-space-2:  calc(var(--pd-space-1) *  2);
  --pd-space-3:  calc(var(--pd-space-1) *  3);
  --pd-space-4:  calc(var(--pd-space-1) *  4);
  --pd-space-5:  calc(var(--pd-space-1) *  5);
  --pd-space-6:  calc(var(--pd-space-1) *  6);
  --pd-space-8:  calc(var(--pd-space-1) *  8);
  --pd-space-10: calc(var(--pd-space-1) * 10);
  --pd-space-12: calc(var(--pd-space-1) * 12);
  --pd-space-16: calc(var(--pd-space-1) * 16);

  /* ---------------------------------------------------------------------------
     Forma — base 16px (a sétima e última linha do bloco de troca), escada por
     múltiplo.
     Um número entra, a escada sai: trocar --pd-radius re-forma o site inteiro
     sem incoerência possível.
     --------------------------------------------------------------------------- */
  --pd-radius-lg:   calc(var(--pd-radius) * 1.25);  /* painel da busca */
  --pd-radius-md:   calc(var(--pd-radius) * 0.75);  /* bloco de código, callout, imagem, frame, controle e linha de resultado da busca */
  --pd-radius-sm:   calc(var(--pd-radius) * 0.5);   /* botão, campo, aba, chip */
  --pd-radius-xs:   calc(var(--pd-radius) * 0.25);  /* código inline, badge, pílula de verbo */
  --pd-radius-full: 999px;                          /* marcador de Step, avatar, pílula */

  /* O fio. Um só, e agora ele é a separação de TODA superfície levantada — o
     anel `0 0 0 1px` saiu da composição da sombra e virou borda de verdade.

     A troca é decisão de ALCANCE, não de estética: o Infima declara
     `--ifm-*-border-color` em todo componente, então o adaptador pinta o fio
     inteiro com o vocabulário que já existe. Anel dentro de `box-shadow`
     obrigaria a sobrescrever a sombra de cada componente para desenhar uma
     linha. */
  --pd-border-width: 1px;

  /* ---------------------------------------------------------------------------
     Motion — escala de duração e vocabulário de easing. Camada 1, fora do bloco
     de troca.

     Livre — skin corporativa (redesenho): nenhum manual de marca especifica
     duração. Quem edita aqui está redesenhando, não re-marcando.

     Os números são medidos, não escolhidos: 75ms é a banda do giro curto —
     medida no caret de sidebar da âncora, o único movimento do site que atravessa
     menos de um décimo de segundo; 200ms é o valor mais aplicado de toda a
     amostra; 300ms é a banda de mudança grande; 500ms é a banda de entrada
     grande; 5s é o único loop ambiente medido em qualquer uma das sete.

     `--pd-dur-0` entrou na issue #114, e a parada é da âncora, não da escala:
     75 não é 200 dividido por nada. Ela existe porque a rotação do caret é o
     único movimento cujo alvo publicado fica abaixo de `--pd-dur-1`, e
     arredondá-lo para 200ms trocaria uma medição por uma conveniência de
     vocabulário. Ver docs/adr/0010 — a linha da seta é `herdado`.
     --------------------------------------------------------------------------- */
  --pd-dur-0: 75ms;
  --pd-dur-1: 200ms;
  --pd-dur-2: 300ms;
  --pd-dur-3: 500ms;
  --pd-dur-ambient: 5s;     /* período do loop; não é parada da escala — ver reduced-motion */

  /* Duas curvas, nomeadas por intenção. Não há `ease-in`: nada neste site sai da
     tela, e variável sem consumidor é o defeito do Infima que não se copia. */
  --pd-ease-settle: cubic-bezier(0, 0, 0.2, 1);   /* responde ao leitor e assenta */
  --pd-ease-inout:  cubic-bezier(0.4, 0, 0.2, 1); /* tem início e fim na tela */

  /* Os sete movimentos. Cada um é um token COMPLETO — <duração> <easing> — que
     compõe da escala em vez de cravar número. É isso que faz reduced-motion
     alcançar o Infima que não escrevemos: o adaptador escreve
     --ifm-transition-fast a partir de --pd-dur-1, e a redefinição atravessa.

     Os cinco primeiros terminam sozinhos e ENCURTAM sob reduced-motion.
     Os dois últimos não terminam sozinhos — `reveal` é dirigido por rolagem,
     `ambient` é infinito — e são REMOVIDOS, não encurtados; quem os consome
     acrescenta timeline / `infinite`.

     OS TRÊS ÚLTIMOS ESTÃO SEM CONSUMIDOR desde que a landing saiu (issue #94), e
     ficam declarados de propósito. O motivo é o que a régua de órfãos pede — e
     não é o mesmo do `--pd-type-6xl`, que saiu no mesmo movimento. O vocabulário
     de motion é FECHADO por portão: `scripts/portao-2-motion.sh` reprova toda
     duração ou curva cravada e manda usar um destes sete nomes. Remover três
     deixaria o portão apontando para um vocabulário que não cobre `showcase`,
     `reveal` nem `ambient` — e a próxima faixa que precisasse de um deles
     escreveria o número cravado que o portão existe para impedir. É uma escala
     declarada inteira, como a rampa de cinza, e o buraco no meio custa mais do
     que a parada a mais.

     `flip` é o sétimo, e ele entrou na issue #114 com um consumidor só: a
     rotação do caret de categoria de sidebar. Ele não é `state` com outro nome —
     `state` é 200ms e cobre cor, fundo e sombra, que respondem ao ponteiro;
     `flip` é o giro de um glifo pequeno em torno do próprio eixo, e a âncora o
     mede em 75ms. Fundir os dois arredondaria a medição para caber no
     vocabulário, que é a troca que este arquivo não faz.

     A curva de `flip` é `settle`, não `inout`: o giro responde ao clique do
     leitor e assenta — não tem começo próprio na tela. É a mesma leitura que
     põe `state` e `enter` em `settle`. */
  --pd-move-flip:     var(--pd-dur-0) var(--pd-ease-settle);
  --pd-move-state:    var(--pd-dur-1) var(--pd-ease-settle);
  --pd-move-enter:    var(--pd-dur-1) var(--pd-ease-settle);
  --pd-move-expand:   var(--pd-dur-2) var(--pd-ease-inout);
  --pd-move-showcase: var(--pd-dur-3) var(--pd-ease-settle);
  --pd-move-reveal:   var(--pd-dur-3) var(--pd-ease-settle);
  --pd-move-ambient:  var(--pd-dur-ambient) var(--pd-ease-inout);

  /* Habilita <details> a transicionar para height: auto. Mora aqui, junto do
     vocabulário, e não dentro do componente que a consome. */
  interpolate-size: allow-keywords;

  /* ---------------------------------------------------------------------------
     Estado de entrada — camada 1, FORA do bloco de troca.

     Espessura de anel não é identidade de marca; a cor já é, e ela segue o
     acento pela camada 2 (`--pd-focus-ring`).

     Estes são o segundo e o terceiro literal do sistema, e não vão disfarçados.
     `calc(var(--pd-space-1) / 2)` daria 2px e passaria em qualquer varredura —
     seria derivação FALSA: espessura de anel não tem relação com escala de
     espaço, e a régua deste projeto existe justamente para impedir número que
     só parece derivado. A procedência honesta é origem própria com âncora em
     norma: 2px é o limiar de perímetro da SC 2.4.13, 44px é a SC 2.5.5.

     Contrato completo: docs/design/foco.md e ADR 4.
     --------------------------------------------------------------------------- */
  --pd-focus-width:  2px;
  --pd-focus-offset: 2px;
  --pd-target-min:   44px;

  /* ---------------------------------------------------------------------------
     Dimensões do chrome — camada 1.
     A anatomia completa é de docs/design/chrome.md; aqui ficam só os valores
     que o adaptador precisa escrever, porque ele não pode escrever de lugar
     nenhum.

     `--pd-tabs-height` é LITERAL, e não `var(--pd-space-12)`, ainda que os dois
     entreguem 48. Altura de chrome não tem relação com escala de espaço, e
     derivar por coincidência de número é a derivação FALSA que o bloco de foco
     recusa em voz alta trinta linhas acima. A procedência honesta é a mesma dos
     outros comprimentos deste bloco: medida na âncora.

     `--pd-toc-width` GANHOU consumidor na #96, e o valor mudou de 288 para
     304. A premissa que travava em 288 — *"a coluna é o quarto restante do
     grid 75/25 do upstream, alcançar 304 custaria `unsafe` em
     DocItem/Layout"* — era fato errado, não decisão: o grid de doze morreu
     nesta issue, substituído por `flex` com largura explícita em
     `chrome.css` §1, e uma largura explícita não tem 75/25 a quebrar. A
     correção está em docs/design/chrome.md §1.2, sem apagar o texto
     original — ver o bloco de errata lá.
     --------------------------------------------------------------------------- */
  --pd-container-width: 1120px;  /* as DUAS variáveis de container do Infima recebem este — era 1152, ver nota abaixo */
  --pd-sidebar-width:    288px;
  --pd-navbar-height:     64px;  /* a LINHA 1 do topo, não o topo inteiro */
  --pd-tabs-height:       48px;
  --pd-toc-width:        304px;  /* bate com a âncora — §11 de chrome.md */
  --pd-prose-width:      720px;

  /* O PISO DE UM CAMPO EDITÁVEL do painel de comando — a largura abaixo da
     qual a grade dele para de pôr dois campos lado a lado e empilha.

     **Ele ocupa o slot que era `--pd-api-prosa-width` (577), e a troca conta
     uma decisão.** Aquele token existia para uma página de referência com
     prosa mais estreita que a comum, porque a âncora trocava a coluna do TOC
     por um trilho de amostras — medido em `research/paridade-devin` §10
     (576,81), citado pela #99. O trilho desceu para o fluxo na #118: a página
     de comando passou a medir o que qualquer página de doc mede, a prosa
     voltou para `--pd-prose-width` e o TOC voltou a caber. Sem trilho não há
     prosa estreita a declarar, e o token ficaria inerte — que é a mesma classe
     de defeito das variáveis mortas do Infima. O delta contra a âncora está
     registrado em `scripts/paridade-abertas.txt` e em `referencia.md` §8.

     280 é `origem própria`: é onde `--skill` mais um valor de exemplo do
     catálogo (`panlabs-python-standards`, 24 caracteres em mono) deixam de
     caber na mesma linha. Medido nesta máquina, no Chromium 148.

     **Ele é medida de UM componente e mora em `:root`, e a tensão é real.** A
     regra das camadas manda camada 3 declarar no escopo do próprio componente;
     o portão 1 manda todo literal de comprimento morar aqui. As duas não podem
     valer ao mesmo tempo para um número que só um componente usa, e este bloco
     já resolveu isso duas vezes antes, do mesmo jeito: `--pd-copiar-height` e
     `--pd-copiar-menu-width` são medidas do par segmentado do cabeçalho, e
     estão logo abaixo. O portão é a régua que reprova, e é ele que decide o
     empate. */
  --pd-campo-min:        280px;

  /* O CORREDOR — a distância entre a borda direita da sidebar e o começo do
     texto, e até aqui ele existia por ACIDENTE.

     Medido na âncora a 1024 e a 1512, e o número é o mesmo nas duas: o
     conteúdo dela abre `pl-[5.7rem]` (91,2) sobre um `-ml-12` (−48), e o
     líquido é 43,2 em qualquer largura. Ela NÃO centraliza a prosa na coluna
     — ancora o texto a esta distância e deixa a sobra do lado do índice.

     Aqui a distância era o que sobrasse da centralização do `<article>`
     dentro da coluna: 47,6 a 1512, perto do número da âncora por coincidência
     aritmética, e ZERO em toda largura entre 997 e 1408 — que é onde um
     laptop vive. Ver `chrome.md` §1.7. */
  --pd-corredor: 43.2px;

  /* O PAR SEGMENTADO do cabeçalho — "Copiar página" e o menu ao lado.

     Os dois são medida da âncora e NÃO da escala: 34 não é múltiplo de 4 por
     acidente de arredondamento, é a altura que ela desenha, e 277 é a largura
     do menu dela (276,7 medido, arredondado ao inteiro como toda medida de
     âncora deste bloco). Derivar qualquer um dos dois de `--pd-space-*` seria
     coincidência de número, não parentesco. Ver `chrome.md` §6.4. */
  --pd-copiar-height:      34px;
  --pd-copiar-menu-width: 277px;

  /* A GOTEIRA DA BARRA FINA — o que `scrollbar-width: thin` reserva, medido
     no Chromium 148 desta máquina: 15px com `auto`, 10 com `thin`.

     Ele não desenha nada. Existe para a conta do respiro da lista da sidebar
     fechar nos 32 da âncora sem que ninguém tenha de medir de novo, e é o
     único número deste arquivo que outro navegador pode desmentir — por isso
     é citado uma vez só, em `chrome.css` §4. */
  --pd-scrollbar-fina: 10px;

  /* `--pd-container-width` MUDOU de 1152 para 1120 na #96, e não por conta
     própria — é consequência do congelamento abaixo perder o termo do
     gutter. As DUAS medições de margem simétrica da âncora (§11: 52px a
     1512, 256px a 1920) só fecham com `sidebar + container = 1408`; com
     container em 1152 sobravam 32px que nenhuma distribuição de padding
     resolve — provado por álgebra e conferido depois em navegador. A
     coluna de conteúdo (`--pd-doc-width`) cai de 848 para 816 como
     consequência direta; a prosa não muda, porque desde a #96 ela é
     `--pd-prose-width` fixo com TOC (ver `chrome.md` §1.5), não a coluna
     inteira.

     O CONGELAMENTO — a largura a partir da qual o grupo sidebar + conteúdo +
     TOC para de crescer e passa a centralizar, com a folga indo IGUAL para
     os dois lados. Até a #96 ele levava um termo de gutter —
     `sidebar + container + 2 × (gutter − 16)` —, porque o `<main>` precisava
     do próprio preenchimento horizontal para fechar a distância até a borda
     da viewport, que ele MESMO era. Com o wrapper centralizando o grupo
     (`chrome.css` §1), essa distância virou trabalho do `margin-inline: auto`
     do wrapper, e `<main>` perdeu o preenchimento horizontal que fazia esse
     papel — ele soma zero agora, só o `padding-top` fica. O termo do gutter
     sai da fórmula porque o gutter não tem mais nada a completar aqui:
     `sidebar + container`, e mais nada. */
  --pd-congelamento: calc(var(--pd-sidebar-width) + var(--pd-container-width));

  /* O recuo do subtítulo sob o título. LITERAL pelo mesmo motivo da altura da
     faixa: é medida de chrome, não parada da escala de espaço, e escrevê-lo como
     `--pd-space-2` mais meio passo daria o número sem comprar a derivação.

     Na âncora ele sai de um `mt-2` de 8 colapsando contra o `space-y-2.5` do
     contêiner. O que se copia é o RESULTADO medido, não a aritmética de um
     framework de utilitários que este projeto não tem. */
  --pd-subtitulo-recuo:   10px;

  /* A ENTRELINHA do subtítulo. Ela existe porque sem ela o subtítulo herdava
     `--pd-leading-prose` (1,75) sobre 18px = 31,5px, contra os 28 que
     `chrome.md` §12 publica com tolerância `exato`.

     COMPRIMENTO e não razão, de propósito: 28/18 é 1,5555…, que resolve para
     27,999… e nasceria vermelho permanente contra um alvo `exato` — é o mesmo
     defeito que a entrelinha subpixel do §13 de `tokens.md` já cataloga. Um
     comprimento entrega o número medido sem resíduo.

     LITERAL pelo mesmo motivo do recuo acima: é medida de chrome, e a escala de
     espaço não tem parada em 28 — ela pula de 24 (`--pd-space-6`) para 32
     (`--pd-space-8`). */
  --pd-subtitulo-entrelinha: 28px;

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
  --pd-topo-grudado: var(--pd-navbar-height);

  /* O TOPO DO CONTEÚDO — a linha em que o `<article>` abre, e o offset de tudo
     o que gruda ALINHADO com ele em vez de com a barra.

     Ele não é um número novo: `--pd-topo-grudado` mais `--pd-space-10` já era
     calculado à mão em três lugares — o `padding-top` do `<main>`
     (`chrome.css` §1), o `max-height` do painel da referência e o comentário
     que o justifica (*"a mesma respiração que o topo do conteúdo já usa"*).
     Nomeá-lo é o que faz os três pararem de repetir a soma.

     O NÚMERO É ALVO DA ÂNCORA, e ele fecha por duas medições publicadas
     independentemente: `chrome.md` §11 mede o navbar da âncora em 112, e §12
     mede o ritmo vertical dela em *"40 do navbar ao cabeçalho"*. 112 + 40 = 152,
     que é o que §11 e `referencia.md` §8 cobram na linha `grudado em`.

     Medido aqui, a 1512: `article.getBoundingClientRect().top` = 152. */
  --pd-topo-conteudo: calc(var(--pd-topo-grudado) + var(--pd-space-10));

  /* A coluna de conteúdo. Até a #96 ela era `.col--9` do grid de doze — 1152 ×
     0,75 = 864 —, e a #96 matou o grid: não há mais 75/25 a manter, só o
     container inteiro menos o que o TOC leva. A conta muda de forma
     (container − toc em vez de container × 0,75), e o número se move DUAS
     vezes na mesma issue: primeiro para 848 (`--pd-toc-width` foi a 304, com
     container ainda em 1152), depois para 816 (`--pd-container-width` foi a
     1120 — ver a nota dele, acima).

     Sem cartão, ela continua CAIXA INVISÍVEL na configuração sem TOC: o
     `max-width` da coluna segura a página no mesmo pixel quando `.col--3`
     não existe. Ver `chrome.css` §1. */
  --pd-doc-width: calc(var(--pd-container-width) - var(--pd-toc-width));

  /* A MEDIDA DO CÓDIGO morreu aqui, e vale a linha de lápide. A derivação dela
     era uma frase só — *"o interior do cartão de doc"* —, e o cartão está de
     saída. Cartão fora, derivação fora: sobraria o número 768 sem raiz, que é a
     derivação FALSA que este arquivo recusa em voz alta no bloco de foco.

     Os consumidores reais passam a citar `--pd-prose-width`, pelo MESMO
     argumento que já estava escrito: *a medida que o leitor estava lendo quando
     apertou a tecla*. O argumento não enfraquece; ele fica verdadeiro, porque
     hoje ele erra por 96px.

     Eram DOIS na redação original — a largura do modal de busca e a laje de
     código da landing. A segunda saiu com a página na issue #94; quem cita o
     token hoje é `chrome.css`, o `SearchBar` e o painel de comando. */

  /* A folga lateral do shell, de cada lado. Ela dobra a partir de 997px — o
     mesmo limiar em que a sidebar aparece. O par 16/32 é herdado da âncora; o
     ponto onde ele troca, não.

     O par ANTIGO era 32/64, e ele caiu junto com o cartão: a folga de lá era a
     do shell em volta de uma superfície levantada, e não há mais superfície
     levantada. O par novo é o do `mint`.

     ATÉ A #96 este token também fechava o congelamento — `sidebar + container
     + 2 × (gutter − 16)` — porque o `<main>` completava com ele a distância
     até a borda da viewport. Essa distância virou trabalho do
     `margin-inline: auto` do wrapper de `chrome.css` §1, o `<main>` perdeu o
     preenchimento horizontal, e o congelamento perdeu o termo do gutter — ver
     `--pd-congelamento` acima. O que sobra para este token: o preenchimento
     próprio do `<footer>`, o recuo do `.container` dele até a coluna de doc
     (`chrome.css`, alinhamento do rodapé), e o preenchimento do `.col` que
     volta no estreito. */
  --pd-gutter: var(--pd-space-4);

  /* A altura máxima do modal de busca — o SEGUNDO token novo do slice 7.

     Ele está aqui, e não inline no CSS Module, porque a alternativa seria
     escrever `60dvh` num arquivo que não é este. `dvh` não está no padrão do
     portão 1 — `px|rem|em|ms|s` —, então o literal PASSARIA, e passar por buraco
     de varredura é a única forma de literal que este projeto não admite: a
     saída correta seria fechar o buraco, e fechá-lo aqui custa uma linha em vez
     de uma perna nova de portão.

     **Correção — a nota abaixo sobre a largura morreu na #98.** Ela dizia que a
     largura não virava token porque era `--pd-prose-width`, citada por nome: o
     painel abria com a medida que o leitor já estava lendo. A #98 mede a âncora
     centralizada em `640px` — um número que não coincide com `--pd-prose-width`
     (720px), então citar por nome pararia de ser "o mesmo número" e viraria
     derivação falsa. Os quatro tokens abaixo saem daí: nenhum deriva da escala
     de espaço pelo mesmo motivo que `--pd-tabs-height` não deriva dela — a
     medida da âncora não tem relação com a escala, e coincidir por acidente é a
     derivação que este arquivo já recusa por escrito (ver a Forma, acima). Todos
     de consumidor único, como este. Procedência: docs/design/busca.md §10. */
  --pd-busca-height: 60dvh;
  --pd-busca-panel-width:      640px;
  --pd-busca-panel-top:        54px;
  --pd-busca-controle-width:   300.75px;
  --pd-busca-controle-height:  36px;

  /* O TERCEIRO token medido contra a viewport, não o único — a nota acima
     mentia por omissão assim que este entrou. Mesmo buraco de portão 1, mesma
     saída: `100vh` cravado num módulo de componente (#99, painel da
     referência) passaria a varredura calada, porque `vh` também não está no
     padrão `px|rem|em|ms|s`. `dvh`, e não `vh`, pela mesma razão do token
     acima: nunca pior, e a diferença só aparece em navegador móvel.

     **O consumidor que o trouxe já não existe, e ele fica.** Era o teto do
     trilho grudado da página de referência, que desceu para o fluxo na #118;
     quem o lê hoje é o teto do TOC em `chrome.css`, que tem a mesma conta e
     chegou depois. Um token com dois pedidos e um consumidor não é token
     inerte, é token com um consumidor. */
  --pd-viewport-altura: 100dvh;

  /* ---------------------------------------------------------------------------
     Grade de cartões — camada 1, e a declaração serve o MDX.

     A frase que justificava a posição era *"UMA declaração serve a landing e o
     MDX"*, e ela perdeu metade na issue #94: sobra o `card-group` do MDX. Ver a
     lápide da lista de faixas mais abaixo, e `componentes/card-group.md`.

     O piso de faixa da grade de `card-group`, derivado do limiar da âncora A
     TRÊS COLUNAS: o `Columns` dela colapsa em 42rem, com gap de 16. Descontados
     os dois gaps e dividido por três, sai o menor cartão que a âncora admite
     numa fila de três.

     A CITAÇÃO A `--pd-prose-width` MORREU AQUI, e a lápide vale a linha. Ela
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
     abriu o precedente: `--pd-shadow-raised` também é valor composto, e pelo
     mesmo motivo.

     A GRADE DA LANDING SAIU na issue #94, e a lista fica onde está. O argumento
     que a trouxe para cá perdeu metade, mas o que sobra basta: ela continua
     sendo valor composto, e valor composto citado por nome é o que impede a
     próxima grade de recompor a lista à mão. O mesmo vale para
     `--pd-shadow-raised`, que perdeu um dos dois consumidores no mesmo commit.
     --------------------------------------------------------------------------- */
  --pd-card-colapso: 672px;   /* o `max-w-2xl` em que o `Columns` da âncora colapsa */
  --pd-card-min: calc((var(--pd-card-colapso) - 2 * var(--pd-space-4)) / 3);
  --pd-card-grid: repeat(auto-fit, minmax(min(var(--pd-card-min), 100%), 1fr));
}

/* O gutter dobra no limiar único do projeto, que é o literal compilado do
   Infima. Não são os 1024px da âncora: dois limiares brigando no mesmo eixo
   custam mais do que a fidelidade compra.

   A SEGUNDA LINHA DO TOPO nasce no mesmo limiar, e pelo mesmo motivo: um evento
   visual em vez de dois. A faixa de tabs aparece exatamente quando a sidebar
   aparece, e some exatamente quando ela vira gaveta. */
@media (min-width: 997px) {
  :root {
    --pd-gutter: var(--pd-space-8);
    --pd-topo-grudado: calc(var(--pd-navbar-height) + var(--pd-tabs-height));
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

   O bloco teve um SEGUNDO seletor, `[data-pd-showcase]`, e ele saiu com a
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
  --pd-surface-page:   var(--pd-neutral-page-dark);
  --pd-surface-raised: var(--pd-surface-page);
  --pd-surface-code:   var(--pd-gray-900);
  --pd-surface-wash:   rgb(from var(--pd-accent) r g b / 12%);
  --pd-surface-scrim:  rgb(from var(--pd-gray-950) r g b / 72%);

  /* text — `faint` é a parada 500, o meio matemático da rampa. É a única
     reprovação deliberada de AA do sistema (3,04:1 aqui) e é PROIBIDA para
     texto de leitura: serve separador, placeholder e controle desabilitado.
     Texto secundário legítimo usa `muted`. */
  --pd-text-strong:  var(--pd-gray-50);
  --pd-text-body:    var(--pd-gray-300);
  --pd-text-muted:   var(--pd-gray-400);
  --pd-text-faint:   var(--pd-gray-500);
  --pd-text-inverse: oklch(from var(--pd-accent) clamp(0, (0.62 - l) * 1000, 1) 0 h);

  /* border — a tinta a 7%. Uma fórmula, dois modos, e ela reproduz os DOIS
     valores medidos no alvo, que lá saem de dois mecanismos diferentes. */
  --pd-border-subtle:  rgb(from var(--pd-text-strong) r g b / 7%);
  --pd-border-default: rgb(from var(--pd-text-strong) r g b / 12%);
  --pd-border-strong:  rgb(from var(--pd-text-strong) r g b / 20%);

  /* accent.

     `contrast` está SEM CONSUMIDOR desde que a landing saiu (issue #94) — o
     único era o texto do botão primário dela. Fica declarado, e o motivo é o
     mesmo que mantém `--pd-gray-200`: papel semântico é família declarada
     inteira. Os dois blocos de modo declaram a MESMA lista, na mesma ordem, e
     papel que aparece num e não no outro é buraco visível; tirar o par do
     accent deixaria a camada 2 sem resposta para *que cor vai o texto sobre o
     accent*, e o próximo botão a nascer escreveria a cor à mão. */
  --pd-accent:          var(--pd-brand-on-dark);
  --pd-accent-hover:    oklch(from var(--pd-accent) calc(l + 0.06) c h);
  --pd-accent-contrast: var(--pd-text-inverse);

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
  --pd-shadow-cast: rgb(from var(--pd-gray-950) r g b / 60%);

  /* focus */
  --pd-focus-ring: var(--pd-accent);

  /* state */
  --pd-state-info:    oklch(80% 0.14 var(--pd-hue-info));
  --pd-state-success: oklch(80% 0.14 var(--pd-hue-success));
  --pd-state-warn:    oklch(80% 0.14 var(--pd-hue-warn));
  --pd-state-danger:  oklch(80% 0.14 var(--pd-hue-danger));

  --pd-state-info-fill:    rgb(from var(--pd-state-info)    r g b / 18%);
  --pd-state-success-fill: rgb(from var(--pd-state-success) r g b / 18%);
  --pd-state-warn-fill:    rgb(from var(--pd-state-warn)    r g b / 18%);
  --pd-state-danger-fill:  rgb(from var(--pd-state-danger)  r g b / 18%);

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
  --pd-state-info-edge:    rgb(from var(--pd-state-info)    r g b / 30%);
  --pd-state-success-edge: rgb(from var(--pd-state-success) r g b / 30%);
  --pd-state-warn-edge:    rgb(from var(--pd-state-warn)    r g b / 30%);
  --pd-state-danger-edge:  rgb(from var(--pd-state-danger)  r g b / 30%);

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
     precedente dos quatro `--pd-hue-*`. O corporativo redesenha; não re-marca.

     Piso conferível por comando, e não só registrado:
     `node scripts/contraste.mjs --verificar`.
     --------------------------------------------------------------------- */
  --pd-code-fg:        var(--pd-text-body);
  --pd-code-parameter: #7FE4E9;   /* oklch(85.9% 0.095 200) — o cyan, o identificador */
  --pd-code-constant:  #7FD3E4;   /* oklch(81.9% 0.085 212) — o vizinho */
  --pd-code-keyword:   #95BCE4;   /* oklch(78.1% 0.071 249) */
  --pd-code-string:    #E9B999;   /* oklch(82.1% 0.070  55) — o contrapeso quente */
  --pd-code-function:  #DDDAAE;   /* oklch(88.0% 0.058 104) */
  --pd-code-operator:  #CBC9CF;   /* oklch(83.9% 0.009 301) */
  --pd-code-comment:   #B2B0B8;   /* oklch(76.0% 0.012 298) — reto p/ #181A1E (issue #95) */
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
  --pd-surface-page:   var(--pd-neutral-page-light);
  --pd-surface-raised: var(--pd-neutral-raised-light);
  --pd-surface-code:   oklch(from var(--pd-gray-50) 100% 0 h);
  --pd-surface-wash:   rgb(from var(--pd-accent) r g b / 12%);
  --pd-surface-scrim:  rgb(from var(--pd-gray-950) r g b / 40%);

  /* text */
  --pd-text-strong:  var(--pd-gray-950);
  --pd-text-body:    var(--pd-gray-700);
  --pd-text-muted:   var(--pd-gray-600);
  --pd-text-faint:   var(--pd-gray-500);
  --pd-text-inverse: oklch(from var(--pd-accent) clamp(0, (0.62 - l) * 1000, 1) 0 h);

  /* border */
  --pd-border-subtle:  rgb(from var(--pd-text-strong) r g b / 7%);
  --pd-border-default: rgb(from var(--pd-text-strong) r g b / 12%);
  --pd-border-strong:  rgb(from var(--pd-text-strong) r g b / 20%);

  /* accent */
  --pd-accent:          var(--pd-brand-on-light);
  --pd-accent-hover:    oklch(from var(--pd-accent) calc(l - 0.06) c h);
  --pd-accent-contrast: var(--pd-text-inverse);

  /* shadow */
  --pd-shadow-cast: rgb(from var(--pd-gray-950) r g b / 8%);

  /* focus */
  --pd-focus-ring: var(--pd-accent);

  /* state */
  --pd-state-info:    oklch(45% 0.13 var(--pd-hue-info));
  --pd-state-success: oklch(45% 0.13 var(--pd-hue-success));
  --pd-state-warn:    oklch(45% 0.13 var(--pd-hue-warn));
  --pd-state-danger:  oklch(45% 0.13 var(--pd-hue-danger));

  --pd-state-info-fill:    rgb(from var(--pd-state-info)    r g b / 10%);
  --pd-state-success-fill: rgb(from var(--pd-state-success) r g b / 10%);
  --pd-state-warn-fill:    rgb(from var(--pd-state-warn)    r g b / 10%);
  --pd-state-danger-fill:  rgb(from var(--pd-state-danger)  r g b / 10%);

  --pd-state-info-edge:    rgb(from var(--pd-state-info)    r g b / 25%);
  --pd-state-success-edge: rgb(from var(--pd-state-success) r g b / 25%);
  --pd-state-warn-edge:    rgb(from var(--pd-state-warn)    r g b / 25%);
  --pd-state-danger-edge:  rgb(from var(--pd-state-danger)  r g b / 25%);

  /* code — os CINCO papéis cromáticos do claro ficam na mesma luminosidade, L
     48%. É a propriedade que a paleta anterior tinha e o par medido na âncora
     não tem, e é ela que segura o piso em 6,29 sobre a pastilha branca. Os dois
     acromáticos saem da faixa de propósito: `operator` desce para não competir
     com o identificador, e `comment` sobe para recuar. */
  --pd-code-fg:        var(--pd-text-body);
  --pd-code-parameter: #006B70;   /* oklch(48.0% 0.082 200) — o cyan, o identificador */
  --pd-code-constant:  #1C6589;   /* oklch(48.0% 0.090 235) — o vizinho */
  --pd-code-keyword:   #475C8B;   /* oklch(47.9% 0.081 265) */
  --pd-code-string:    #82502B;   /* oklch(48.1% 0.085  56) — o contrapeso quente */
  --pd-code-function:  #60612C;   /* oklch(47.9% 0.074 110) */
  --pd-code-operator:  #535157;   /* oklch(43.9% 0.010 301) */
  --pd-code-comment:   #615F66;   /* oklch(49.0% 0.011 299) */
}

/* -----------------------------------------------------------------------------
   Camada 2 que NÃO bifurca por modo — fora dos dois blocos, de propósito.

   A regra que decide: token que referencia camada 2 bifurca e mora nos dois
   blocos; token que referencia só camada 1 não bifurca e mora aqui.

   --pd-shadow-lip é o único papel nessa situação. Realce é luz, e luz é o topo
   da rampa — não "a tinta do modo". Ancorado no topo da rampa, ele some sozinho
   no claro por IDENTIDADE MATEMÁTICA (o cartão claro É --pd-gray-50, e gray-50 a
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

   `--pd-shadow-sunken` MORREU aqui, e a morte vale a linha: ele era o
   contra-exemplo declarado da elevação — o único lugar do site que afundava —,
   e afundar era relativo ao cartão. Sem cartão, o contra-exemplo perde contra o
   quê ser exemplo, e o único consumidor dele era o berço do bloco de código,
   que morreu no mesmo commit.

   Sobraram DOIS papéis, e nenhum deles é consumido por conteúdo. `float` é o
   chrome flutuante — dropdown, gaveta, modal de busca, botão de voltar ao topo.
   `raised` NÃO flutua: o consumidor dele é o painel da Referência da API, que é
   superfície levantada. Eram DOIS — o segundo era o botão primário da landing,
   e saiu com a página na issue #94. O token fica porque continua consumido, e é
   essa a diferença entre ele e `--pd-type-6xl`, que saiu na mesma remoção.
   A profundidade saiu do CONTEÚDO, não do site — a #50 mediu zero componente de
   conteúdo com sombra em seis páginas da âncora, e o único portador de sombra
   medido lá é um chip de 24px no hover de heading.
   ----------------------------------------------------------------------------- */

:root {
  --pd-shadow-lip: rgb(from var(--pd-gray-50) r g b / 6%);

  --pd-shadow-raised: inset 0 1px 0 0 var(--pd-shadow-lip),
                      0 1px 2px -1px var(--pd-shadow-cast);
  --pd-shadow-float:  inset 0 1px 0 0 var(--pd-shadow-lip),
                      0 20px 48px -12px var(--pd-shadow-cast);
}

/* =============================================================================
   CAMADA 3 — VAZIA, e a ausência tem endereço.

   Havia aqui uma regra `[data-pd-showcase]` com os cinco tokens de brilho da
   ilha de espetáculo: os dois gradientes (`--pd-glow` e `--pd-glow-2`), a caixa
   quadrada da luz (`--pd-glow-tamanho`) e o par de amplitude da respiração
   (`--pd-glow-vale` e `--pd-glow-crista`). Ela era SEPARADA de propósito:
   entrar no bloco escuro acima poria --pd-glow em :root, e o glow vazaria para
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

   Como o adaptador escreve --ifm-transition-fast a partir de --pd-dur-1, o
   Infima e o theme-classic ficam parados junto, sem martelo
   `* { animation: none !important }` e sem um único !important.
   ============================================================================= */

@media (prefers-reduced-motion: reduce) {
  :root {
    --pd-dur-0: 1ms;
    --pd-dur-1: 1ms;
    --pd-dur-2: 1ms;
    --pd-dur-3: 1ms;
  }

  /* Os dois que NÃO terminam sozinhos seriam removidos aqui, não encurtados — e
     hoje não há nenhum dos dois no site.

     Havia uma regra `[data-pd-showcase] [data-pd-part='glow'] { animation:
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

     Se um loop ambiente voltar, ele volta por aqui, com `data-pd-part` como
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
  /* --- terceiro namespace: nem --ifm-*, nem --pd-*. O adaptador escreve nele
         como escreve nos --ifm-*. DocRoot/Layout/Main soma
         --ifm-container-width + --doc-sidebar-width, então os dois se propagam
         juntos de graça. -------------------------------------------------- */
  --doc-sidebar-width: var(--pd-sidebar-width);

  /* --- container: AS DUAS. O Infima troca para -xl acima de 1440px, e fixar só
         a primeira faz o cartão alargar sozinho em tela larga. ------------- */
  --ifm-container-width:    var(--pd-container-width);
  --ifm-container-width-xl: var(--pd-container-width);

  /* --- preenchimento e tinta ---------------------------------------------- */
  --ifm-background-color:         var(--pd-surface-page);
  --ifm-background-surface-color: var(--pd-surface-raised);
  --ifm-hover-overlay:            var(--pd-border-subtle);
  --ifm-color-content:            var(--pd-text-body);
  --ifm-color-content-secondary:  var(--pd-text-muted);
  --ifm-color-content-inverse:    var(--pd-text-inverse);
  --ifm-font-color-base:          var(--pd-text-body);
  --ifm-font-color-base-inverse:  var(--pd-text-inverse);
  --ifm-font-color-secondary:     var(--pd-text-muted);
  --ifm-heading-color:            var(--pd-text-strong);
  --ifm-color-black:              var(--pd-gray-950);
  --ifm-color-white:              var(--pd-gray-50);

  /* --- marca e estados.
         Exceção 4 do adaptador: das seis shades por cor semântica, só as VIVAS
         são atribuídas — base, -dark, -darker, -contrast-background e
         -contrast-foreground. As quatro restantes (-light, -lighter, -lightest,
         -darkest) foram resolvidas em build time pelo color-mod() e não têm
         consumidor: atribuí-las seria linha morta sugerindo funcionar.
         Nosso acento tem um degrau de hover, não uma família de shades, então
         -dark e -darker recebem o mesmo token — e isso é o desenho, não
         descuido. -------------------------------------------------------- */
  --ifm-color-primary:                     var(--pd-accent);
  --ifm-color-primary-dark:                var(--pd-accent-hover);
  --ifm-color-primary-darker:              var(--pd-accent-hover);
  --ifm-color-primary-contrast-background: var(--pd-surface-wash);
  --ifm-color-primary-contrast-foreground: var(--pd-text-strong);

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
  --ifm-color-secondary:                     var(--pd-border-strong);
  --ifm-color-secondary-dark:                var(--pd-border-strong);
  --ifm-color-secondary-darker:              var(--pd-border-strong);
  --ifm-color-secondary-contrast-background: var(--pd-surface-raised);
  --ifm-color-secondary-contrast-foreground: var(--pd-text-body);

  --ifm-color-success:                     var(--pd-state-success);
  --ifm-color-success-dark:                var(--pd-state-success);
  --ifm-color-success-darker:              var(--pd-state-success);
  --ifm-color-success-contrast-background: var(--pd-state-success-fill);
  --ifm-color-success-contrast-foreground: var(--pd-text-body);

  --ifm-color-info:                     var(--pd-state-info);
  --ifm-color-info-dark:                var(--pd-state-info);
  --ifm-color-info-darker:              var(--pd-state-info);
  --ifm-color-info-contrast-background: var(--pd-state-info-fill);
  --ifm-color-info-contrast-foreground: var(--pd-text-body);

  --ifm-color-warning:                     var(--pd-state-warn);
  --ifm-color-warning-dark:                var(--pd-state-warn);
  --ifm-color-warning-darker:              var(--pd-state-warn);
  --ifm-color-warning-contrast-background: var(--pd-state-warn-fill);
  --ifm-color-warning-contrast-foreground: var(--pd-text-body);

  --ifm-color-danger:                     var(--pd-state-danger);
  --ifm-color-danger-dark:                var(--pd-state-danger);
  --ifm-color-danger-darker:              var(--pd-state-danger);
  --ifm-color-danger-contrast-background: var(--pd-state-danger-fill);
  --ifm-color-danger-contrast-foreground: var(--pd-text-body);

  /* --- escala de ênfase. O Infima a inverte no bloco dark; nós não podemos,
         porque o adaptador é cego ao modo. A rota correta é apontar cada degrau
         para um papel da camada 2, que já bifurcou. A escala tem dez degraus
         consumidos e o nosso texto tem quatro paradas, então alguns degraus
         repetem — repetir é honesto, inventar parada não seria.
         (o degrau 600 não é consumido por ninguém e por isso não é atribuído) */
  --ifm-color-emphasis-0:    var(--pd-surface-page);
  --ifm-color-emphasis-100:  var(--pd-surface-raised);
  --ifm-color-emphasis-200:  var(--pd-border-subtle);
  --ifm-color-emphasis-300:  var(--pd-border-default);
  --ifm-color-emphasis-400:  var(--pd-border-strong);
  --ifm-color-emphasis-500:  var(--pd-text-faint);
  --ifm-color-emphasis-700:  var(--pd-text-muted);
  --ifm-color-emphasis-800:  var(--pd-text-body);
  --ifm-color-emphasis-900:  var(--pd-text-body);
  --ifm-color-emphasis-1000: var(--pd-text-strong);

  /* --- tipografia --------------------------------------------------------- */
  --ifm-font-family-base:      var(--pd-font-body);
  --ifm-font-family-monospace: var(--pd-font-mono);
  --ifm-heading-font-family:   var(--pd-font-heading);
  --ifm-font-size-base:        var(--pd-type-base);
  --ifm-line-height-base:      var(--pd-leading-prose);
  --ifm-heading-line-height:   var(--pd-leading-h2);
  --ifm-heading-font-weight:   var(--pd-weight-heading);
  --ifm-font-weight-light:     var(--pd-weight-body);
  --ifm-font-weight-normal:    var(--pd-weight-body);
  --ifm-font-weight-semibold:  var(--pd-weight-ui);
  --ifm-font-weight-bold:      var(--pd-weight-heading);

  --ifm-h1-font-size: var(--pd-type-3xl);
  --ifm-h2-font-size: var(--pd-type-2xl);
  --ifm-h3-font-size: var(--pd-type-xl);
  --ifm-h4-font-size: var(--pd-type-lg);
  --ifm-h5-font-size: var(--pd-type-base);
  --ifm-h6-font-size: var(--pd-type-sm);

  /* --- espaço ------------------------------------------------------------- */
  --ifm-global-spacing:          var(--pd-space-4);
  --ifm-spacing-horizontal:      var(--pd-space-4);
  --ifm-spacing-vertical:        var(--pd-space-4);
  --ifm-paragraph-margin-bottom: var(--pd-space-4);
  --ifm-leading:                 var(--pd-space-6);
  --ifm-leading-desktop:         var(--pd-space-6);
  --ifm-list-margin:             var(--pd-space-4);
  --ifm-list-item-margin:        var(--pd-space-1);
  --ifm-list-left-padding:       var(--pd-space-6);
  --ifm-list-paragraph-margin:   var(--pd-space-2);
  --ifm-hr-margin-vertical:      var(--pd-space-6);

  /* --- forma -------------------------------------------------------------- */
  --ifm-global-radius:            var(--pd-radius-sm);
  --ifm-button-border-radius:     var(--pd-radius-sm);
  --ifm-badge-border-radius:      var(--pd-radius-xs);
  --ifm-code-border-radius:       var(--pd-radius-xs);
  --ifm-pre-border-radius:        var(--pd-radius-md);
  --ifm-alert-border-radius:      var(--pd-radius-md);
  --ifm-card-border-radius:       var(--pd-radius);
  --ifm-breadcrumb-border-radius: var(--pd-radius-xs);
  --ifm-pagination-border-radius: var(--pd-radius-sm);
  --ifm-pagination-nav-border-radius: var(--pd-radius-md);

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
  --ifm-global-shadow-md: var(--pd-shadow-float);
  --ifm-global-shadow-tl: var(--pd-shadow-float);
  --ifm-alert-shadow:      none;
  --ifm-blockquote-shadow: none;
  --ifm-navbar-shadow:     none;

  /* --- link --------------------------------------------------------------- */
  --ifm-link-color:            var(--pd-accent);
  --ifm-link-hover-color:      var(--pd-accent-hover);
  --ifm-link-decoration:       none;
  --ifm-link-hover-decoration: underline;

  /* --- código. --ifm-pre-background é sobrescrita dentro do bloco de código
         por --prism-background-color; ver a exceção 3 no fim do arquivo. ---- */
  --ifm-code-background:  var(--pd-surface-code);
  --ifm-pre-background:   var(--pd-surface-code);
  --ifm-pre-color:        var(--pd-code-fg);
  --ifm-pre-line-height:  var(--pd-leading-code);
  --ifm-pre-padding:      var(--pd-space-4);
  --ifm-code-padding-horizontal: var(--pd-space-1);
  --ifm-code-padding-vertical:   var(--pd-space-1);

  /* --- régua, citação e tabela ------------------------------------------- */
  --ifm-hr-background-color:      var(--pd-border-default);
  --ifm-hr-margin-vertical:       var(--pd-space-12);
  --ifm-blockquote-color:         var(--pd-text-body);
  --ifm-blockquote-border-color:  var(--pd-border-strong);
  --ifm-blockquote-border-left-width: calc(var(--pd-border-width) * 4);
  --ifm-blockquote-padding-horizontal: var(--pd-space-6);
  --ifm-blockquote-font-size:     var(--pd-type-base);
  --ifm-table-border-color:       var(--pd-border-subtle);
  --ifm-table-background:         transparent;
  --ifm-table-head-background:    transparent;
  --ifm-table-stripe-background:  transparent;
  --ifm-table-cell-color:         var(--pd-text-body);
  --ifm-table-head-color:         var(--pd-text-strong);
  --ifm-table-head-font-weight:   var(--pd-weight-ui);
  --ifm-table-cell-padding:       var(--pd-space-3);

  /* --- navbar ------------------------------------------------------------- */
  /* O TOPO INTEIRO, não a linha 1: são os nove pontos do theme-classic que
     grudam abaixo do navbar — o `top` do TOC, o do próprio `<nav>`, o
     `scroll-margin` das âncoras — e todos se realinham de graça quando a
     segunda linha entra. Ver `--pd-topo-grudado`. */
  --ifm-navbar-height:                 var(--pd-topo-grudado);
  --ifm-navbar-background-color:       var(--pd-surface-page);
  --ifm-navbar-link-color:             var(--pd-text-muted);
  --ifm-navbar-link-hover-color:       var(--pd-text-strong);
  --ifm-navbar-padding-horizontal:     var(--pd-space-6);
  --ifm-navbar-padding-vertical:       var(--pd-space-2);
  --ifm-navbar-item-padding-horizontal: var(--pd-space-3);
  --ifm-navbar-item-padding-vertical:   var(--pd-space-2);
  --ifm-navbar-search-input-background-color:  var(--pd-surface-raised);
  --ifm-navbar-search-input-color:             var(--pd-text-body);
  --ifm-navbar-search-input-placeholder-color: var(--pd-text-faint);

  /* --- sidebar ------------------------------------------------------------ */
  --ifm-menu-color:                   var(--pd-text-muted);
  --ifm-menu-color-active:            var(--pd-accent);
  --ifm-menu-color-background-active: var(--pd-surface-wash);
  --ifm-menu-color-background-hover:  var(--pd-border-subtle);
  /* 16 e não 12: somado ao preenchimento de 8 que o `DocSidebar/Desktop` põe na
     lista, o item da sidebar começa em 24 — que é exatamente o preenchimento
     horizontal do navbar. A marca e o primeiro ícone de seção ficam na mesma
     vertical, e o alinhamento deixa de depender de coincidência. */
  --ifm-menu-link-padding-horizontal: var(--pd-space-4);
  /* Issue #97: altura de item alvo é 36px, e a entrelinha (24px, ver
     chrome.css) já ocupa a maior parte disso — sobra 12px para os dois
     paddings verticais, 6 cada. `--pd-space-1` é o único literal da escada, e
     a razão dela ser 4 (não 8) já é o meio-passo que a densidade de 14px pede
     em chip, badge e ícone — mas nenhum consumidor até aqui multiplicava por
     um fator fracionário. Este é o primeiro: `1,5×` de `--pd-space-1` chega
     nos 6px sem literal novo, reaproveitando a base fina que já existe, por
     uma técnica nova que a escada ainda não tinha precisado. */
  --ifm-menu-link-padding-vertical:   calc(var(--pd-space-1) * 1.5);

  /* --- TOC ---------------------------------------------------------------- */
  --ifm-toc-border-color:      var(--pd-border-subtle);
  --ifm-toc-link-color:        var(--pd-text-muted);
  --ifm-toc-padding-horizontal: var(--pd-space-3);
  --ifm-toc-padding-vertical:   var(--pd-space-2);

  /* --- breadcrumb e paginação -------------------------------------------- */
  --ifm-breadcrumb-color-active:           var(--pd-accent);
  --ifm-breadcrumb-item-background-active: var(--pd-surface-wash);
  --ifm-breadcrumb-padding-horizontal:     var(--pd-space-2);
  --ifm-breadcrumb-padding-vertical:       var(--pd-space-1);
  --ifm-breadcrumb-spacing:                var(--pd-space-1);
  --ifm-pagination-color-active:           var(--pd-accent);
  --ifm-pagination-item-active-background: var(--pd-surface-wash);
  --ifm-pagination-nav-color-hover:        var(--pd-accent);

  /* --- cartão, dropdown, abas, badge -------------------------------------- */
  --ifm-card-background-color:        var(--pd-surface-raised);
  --ifm-card-horizontal-spacing:      var(--pd-space-6);
  --ifm-card-vertical-spacing:        var(--pd-space-6);
  --ifm-dropdown-background-color:    var(--pd-surface-raised);
  --ifm-dropdown-link-color:          var(--pd-text-body);
  --ifm-dropdown-hover-background-color: var(--pd-border-subtle);
  --ifm-dropdown-font-weight:         var(--pd-weight-body);
  --ifm-tabs-color:                   var(--pd-text-muted);
  --ifm-tabs-color-active:            var(--pd-accent);
  --ifm-tabs-color-active-border:     var(--pd-accent);
  --ifm-badge-background-color:       var(--pd-surface-wash);
  --ifm-badge-border-color:           var(--pd-border-default);
  --ifm-badge-color:                  var(--pd-text-strong);

  /* --- footer ------------------------------------------------------------- */
  --ifm-footer-background-color: var(--pd-surface-page);
  --ifm-footer-color:            var(--pd-text-muted);
  --ifm-footer-link-color:       var(--pd-text-muted);
  --ifm-footer-link-hover-color: var(--pd-accent);
  --ifm-footer-title-color:      var(--pd-text-strong);
  /* O horizontal é o gutter do shell, e o `.container` do footer perde o
     preenchimento dele em `chrome.css` — sem isso o conteúdo do rodapé erra por
     16px contra a borda do cartão. O vertical é o ar de cima; o de baixo é
     maior e mora na regra do footer. */
  --ifm-footer-padding-horizontal: var(--pd-gutter);
  --ifm-footer-padding-vertical:   var(--pd-space-10);

  /* --- barra de rolagem --------------------------------------------------- */
  --ifm-scrollbar-track-background-color:      var(--pd-surface-page);
  --ifm-scrollbar-thumb-background-color:      var(--pd-border-strong);
  --ifm-scrollbar-thumb-hover-background-color: var(--pd-text-faint);

  /* --- motion. É por aqui que reduced-motion alcança o framework que não
         escrevemos. --ifm-transition-slow NÃO entra: o Infima a declara e
         ninguém a consome — atribuí-la seria linha morta. ------------------- */
  --ifm-transition-fast:            var(--pd-dur-1);
  --ifm-transition-timing-default:  var(--pd-ease-settle);
  --ifm-button-transition-duration: var(--pd-dur-1);
}

/* O título de página cresce no mesmo instante em que a sidebar aparece — um
   evento visual em vez de dois. 997px é o literal compilado do Infima; o projeto
   inteiro tem um limiar só. O par 30/36 é herdado; o ponto onde ele troca, não.
   Perda nomeada: entre 640 e 996px o título fica em 30px onde o alvo dá 36. */
@media (min-width: 997px) {
  :root,
  :root[data-theme] {
    --ifm-h1-font-size: var(--pd-type-4xl);

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
    --ifm-navbar-link-hover-color: var(--pd-text-muted);
    --ifm-footer-link-hover-color: var(--pd-text-muted);
    --ifm-pagination-nav-color-hover: var(--pd-border-default);
  }
}

/* =============================================================================
   ADAPTADOR — as exceções com escopo

   TRÊS pontos do Docusaurus não são alcançáveis de :root. A lista é FECHADA, e
   os números que sobram são 2, 3 e 4 — ver a lápide da 1, logo abaixo.

   Eram cinco, depois quatro. A do `--docusaurus-tag-list-border` saiu porque não tinha
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

/* --- Exceção 1 — --ifm-alert-background-color-highlight — REMOVIDA ------------
   Ela pintava as seis variantes de `.alert--*`, e `.alert` NÃO TEM SUPERFÍCIE
   neste site: `src/theme/Admonition/Types.js` mapeia `note`, `info`, `tip` e
   `warning` direto para o nosso `Callout`, que tem DOM próprio, e o `Admonition`
   raiz cai em `info` — isto é, no mesmo `Callout` — para qualquer tipo ausente.
   Não sobra caminho que renderize um `.alert`.

   Medido no build, e não deduzido: `alert--` aparece em ZERO dos 108 HTML
   publicados, e `class="… alert …"` também em zero.

   Sai pelo MESMO precedente que já matou a 5ª (a do
   `--docusaurus-tag-list-border`): o valor de uma lista fechada é ser conferível
   membro a membro, e linha permanentemente infalsificável é o oposto disso —
   ninguém consegue mostrar que ela funciona, porque não há página onde ela
   apareça. Aqui é ainda mais fechado que lá: a de tag dependia de o front matter
   nunca ganhar `tags:`, e esta depende de um mapa de swizzle que é nosso.

   Dissenso registrado, e é o mesmo: a exceção custava seis linhas e defendia
   contra o dia em que alguém desfizesse o mapa da admonition. Esse dia teria de
   passar por `Types.js`, que é arquivo versionado com o motivo escrito dentro.

   A NUMERAÇÃO NÃO É REMENDADA. `tokens.md` §7 cita a *exceção 3* pelo número, e
   é o mesmo precedente que congela a numeração dos portões (ADR 5). O 1 fica
   vago; as que ficam continuam 2, 3 e 4. */

/* --- Exceção 2 — os três --docusaurus-details-* ------------------------------
   Declaradas dentro de classe de CSS Module (`.details` em theme-common e em
   theme-classic), nunca em :root. Um seletor de elemento (0,0,1) perderia para
   a classe hasheada (0,1,0); `details[class]` é (0,1,1) e vence sem depender do
   hash, que muda a cada build.

   A curva `ease` do upstream fica fora do alcance de qualquer variável — o
   valor dele é `transform var(--ifm-transition-fast) ease`. Aqui trocamos o
   valor inteiro pelo movimento nomeado, então a curva também passa a ser nossa. */
details[class] {
  --docusaurus-details-decoration-color: var(--pd-border-strong);
  --docusaurus-details-summary-arrow-size: var(--pd-space-2);
  --docusaurus-details-transition: transform var(--pd-move-expand);
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

**São sete linhas. Nada além disto.**

O corporativo apaga a identidade visual do panlabs-docs editando o bloco entre `SKIN` e `/SKIN`, e sobra a arquitetura. Isso é o desenho, não um efeito colateral: o produto é a arquitetura de tokens, e uma superfície de troca que protegesse a forma do panlabs-docs estaria protegendo a demonstração contra o produto.

| Linha | O que ela move |
| --- | --- |
| `--pd-brand` | Os dois acentos **e tudo que desce deles** — são **seis** papéis de camada 2, não dois: a cor de link, o hover do acento (`--pd-accent-hover`), o texto-inverso que rotula preenchimento de acento (`--pd-text-inverse`, e com ele `--pd-accent-contrast`), o **wash do item ativo** (`--pd-surface-wash`, `rgb(from var(--pd-accent) …)`) e o **anel de foco** (`--pd-focus-ring`, que é `var(--pd-accent)` direto). É o hex do manual de marca, colado direto — sem converter para canais decimais. Desde a issue #95 ela **não** move mais a rampa nem as duas superfícies: essas saíram da família da marca. |
| `--pd-brand-on-dark` | O acento no escuro. Vem com a trava de luminosidade que garante AA; mexer aqui é assumir a verificação de contraste no lugar da arquitetura. |
| `--pd-brand-on-light` | O mesmo, no claro. |
| `--pd-font-body` | A pilha do corpo e de todo texto de UI. |
| `--pd-font-heading` | A pilha dos títulos. Vem igual à do corpo. |
| `--pd-font-mono` | A pilha do código, inline e em bloco. |
| `--pd-radius` | A base da escada de forma. **Um número entra, a escada sai:** os outros quatro raios são múltiplos dele, então os cantos do site inteiro se re-formam sem incoerência possível. |

**A proteção não é travar valor; é a troca ser segura por construção.** Três mecanismos, todos já na arquitetura:

- a rampa e as duas superfícies **não leem** a marca — nenhuma pode sair de uma família da qual não faz mais parte (issue #95);
- o raio é base de escala, e os demais são múltiplos;
- as duas raízes literais são **tipadas** com `@property`, e colagem inválida nelas cai no valor de fábrica;
- os dois acentos vêm derivados do canônico, então não se acaba com três cores de marca desconexas por acidente.

Diferente, sim. Quebrado, não.

> **A linha do `--pd-brand` dizia *"os dois acentos e a cor de link"*, e omitia dois papéis.** `--pd-surface-wash` e `--pd-focus-ring` descem do acento no bloco escuro **e** no claro, e o §10 já os media como superfície própria — *anel de foco vs levantada / página* e *`text-strong` sobre o wash do item ativo* são duas linhas da tabela de contraste dele. A omissão não era inofensiva: quem re-marca lendo só o §4 achava que o anel de foco e o realce do item ativo da sidebar ficavam onde estavam, e os dois trocam de cor junto com a marca. O critério do que entra nesta coluna é **o cone de dependência inteiro**, não os consumidores mais visíveis dele.

> **O terceiro mecanismo é o que carrega mais peso, e a leitura fácil dele está errada.** Medido em navegador, arquivo a arquivo: **sem** o registro de `--pd-brand` e com marca **válida**, a cadeia `brand → on-dark → accent → text-inverse` resolve inteira e byte a byte igual — custom property não registrada é token stream, e `oklch(from …)` aninhado é CSS legal. O que o registro compra não é a cadeia funcionar; é ela **não evaporar inteira** com uma colagem inválida. Sem ele, um valor torto na linha 1 apaga marca, os dois acentos, a cor de link, o rótulo do botão primário, **o anel de foco e o wash do item ativo** de uma vez, sem aviso e sem erro. Com ele, tudo isso cai no valor de fábrica e o site continua de pé. A rampa e as duas superfícies não estão nessa lista — não dependem da linha 1 para existir.
>
> O raio de dano de uma linha errada é o site inteiro, e é esse raio que o `@property` contém. Quem for tentado a tirar a linha por achá-la cerimônia está tirando a contenção, não a tipagem.

### A perda das outras cinco, escrita

`@property` registra exatamente as linhas cuja entrega é **literal e computacionalmente independente** — é o que `initial-value` sabe expressar. Hoje isso produz duas: `--pd-brand`, `--pd-radius`.

As outras cinco entregam referência (`var()`, `oklch(from …)`) ou pilha de fonte, e `initial-value` não aceita nenhuma das duas. **Consequência concreta:** colagem inválida em `--pd-brand-on-dark` torna `--pd-accent` inválido em tempo de valor computado no modo escuro — link, anel de foco, texto-inverso e todo consumidor de `--pd-accent` perdem cor ao mesmo tempo. Com registro, teria degradado para o valor de fábrica.

A perda é real, está contida em **uma** propriedade — rampa, texto, borda e as duas superfícies sobrevivem porque nenhuma delas deriva do acento — e ela falha **à vista**: quem colou vê link, anel de foco e botão primário perderem cor ao mesmo tempo.

Tipar os dois acentos com o hex resolvido protegeria de verdade, e foi recusado: seria a única forma de literal derivado entrar no arquivo de tokens, e ele sairia da família no instante em que o corporativo colasse outra marca — um roxo congelado sob uma marca azul. É o mesmo argumento que, até a issue #95, valia para as duas superfícies — e é exatamente por ele não valer mais para elas (a rampa não deriva da marca, então não há mais família da qual sair) que `--pd-surface-dark` e `--pd-surface-light` saíram do bloco de troca.

### Redesenhar não é re-marcar

A latitude tem **dois níveis nomeados**:

| Nível | Onde | Garantia | Precisa ler a spec? |
| --- | --- | --- | --- |
| **Re-marcar** | as sete linhas do bloco de troca | segura por construção | não |
| **Redesenhar** | token de camada 1 **fora** do bloco que carregue marcador `Livre` | a do marcador, que nomeia o que se move e o que não | sim |

> **Livre — skin corporativa (redesenho).** A **escala de duração e o vocabulário de easing**. Nenhum manual de marca corporativo especifica duração; quem edita ali está redesenhando.

> **Livre — skin corporativa (redesenho).** Os quatro **matizes de estado**. O que se move é o **ângulo**, dentro da família: azul continua azul, verde continua verde. **Não** se movem `L`, `C`, nem as fórmulas de alfa — são elas que garantem AA sobre as duas superfícies em qualquer ângulo. Repintar `--pd-hue-danger` com o roxo da marca não é re-marcar: é quebrar significado.

---

## 5. A rampa, e por que ela é medida — não mais derivada

Uma cor entra, um sistema inteiro de superfícies sai — essa frase valia até a issue #95, e ainda vale para o acento. Para a rampa e para as duas superfícies, ela parou de valer.

**O diagnóstico, registrado para não se repetir:** a rampa de onze cinzas nasceu **tingida pelo matiz da marca** — comportamento medido nos quatro sites do alvo à época (`research/devin-mint`, issue #50), onde um puxa violeta, outro azul, outro verde, e o quarto, de marca acromática, recebia cinza puro. O mecanismo estava certo. **O erro era de uma camada acima:** a âncora não pinta a *superfície de página* com essa rampa tingida — ela usa um cinza neutro puro, à parte, que não deriva de marca nenhuma (`--color-background-dark: rgb(20 20 20)` → `#141414`, medido direto). Herdamos o mecanismo certo e o aplicamos numa superfície em que a âncora não o aplica. Com marca magenta, o chão inteiro do site ficava magenta.

A issue #95 fecha os dois lados do erro:

1. **A rampa deixa de tingir.** As onze paradas passam a ser os hex medidos direto na âncora — frios, não neutros, e fixos qualquer que seja `--pd-brand`. `--pd-brand-tint` e o pin que travava `c × tint` em 0,0120 saíram do sistema: não há mais produto para travar.
2. **A superfície de página ganha token próprio.** `--pd-neutral-page-dark` / `--pd-neutral-page-light`, cinza neutro puro, fora da rampa — porque na âncora também está fora dela. A elevada no claro segue o mesmo caminho, um degrau acima (`--pd-neutral-raised-light`); a elevada no escuro não precisa de literal — ela referencia a própria página, porque a âncora eleva cartão por borda, não por fundo (§6, abaixo).

**A forma da rampa continua sendo geometria herdada — só que agora por valor copiado, não por fórmula reaplicada.** Trocar `--pd-brand` não move mais nenhum neutro do sistema: nem fundo, nem borda, nem superfície, nem texto — só os dois acentos e a cor de link.

### O `L` da marca é inerte

**As duas travas de acento reescrevem `L` e consomem só `c` e `h`** — `max(l, 0.72)` e `min(l, 0.50)`. Consequência que vale escrita porque contraria a intuição: **pedir uma marca "mais escura" não é uma operação que este sistema saiba fazer.** Dois hexes de mesmo matiz e mesma cromaticidade, separados por sete pontos de luminosidade, produzem os dois acentos byte a byte idênticos.

**A superfície do site inteiro não se mexe nunca; só o acento esfria ou esquenta.** É isso que torna a troca de marca cirúrgica em vez de arriscada — e, desde a issue #95, é verdade por construção: a rampa e as duas superfícies simplesmente não leem `--pd-brand`.

### AA é propriedade da arquitetura, não verificação por skin

Duas travas de luminosidade — uma no escuro, uma no claro — aplicadas ao acento, aos quatro estados e à paleta de sintaxe garantem contraste **em qualquer marca que o corporativo cole**. Elas foram testadas nos vinte e quatro matizes do círculo com cromaticidade máxima.

Isso não era pedido. Caiu no colo quando a matemática mostrou que a alternativa — ajuste manual por skin — é infiscalizável numa spec cujo propósito é dispensar quem a escreveu.

Os dois acentos derivados saem como **expressão**, e não como hex repetido, porque **existe um vão de contraste em todos os vinte e quatro matizes**: o cartão escuro exige luminosidade alta, o claro exige baixa, e nenhum hex único fica nos dois lados. Não é *"ajuste só se o contraste pedir"* — pede sempre.

---

## 6. Onde os dois modos divergem, e onde não

**Escuro mora em `:root`; claro é `:root[data-theme='light']`.** É o **único** ponto do sistema onde os dois modos divergem. A camada 1 não bifurca (a rampa é a mesma; muda qual degrau cada papel usa), o adaptador não bifurca, e CSS de componente não bifurca.

Isso torna a auditoria uma leitura de bloco: **token que aparece no bloco escuro e não no claro é um buraco visível**, não uma omissão que passa batido. Os dois blocos declaram a mesma lista, na mesma ordem.

### A superfície do código sobe um degrau, e a regra fica simétrica

`--pd-surface-code` era `--pd-gray-950` no escuro, que é **o mesmo valor de `--pd-surface-page`**. Dois nomes para uma cor, no modo canônico — e é literalmente o defeito do Infima que este projeto nomeou.

Aquilo se sustentava enquanto havia cartão: o bloco de código vivia sobre o cartão, e o que o destacava era o cartão em volta, não a tinta dele. Sem cartão, o bloco de código passou a ter **a cor exata da página**.

Ela sobe para `--pd-gray-900`, e a regra passa a ser: **a superfície do código é um passo acima da página nos dois modos.** No claro ela já era — a pastilha toma o extremo do modo, que é branco —, então a assimetria (igual à página no escuro, acima dela no claro) desaparece por o escuro vir ao encontro do claro.

Medido, contra a página: **1,057:1** no escuro e **1,026:1** no claro — recalculado na issue #95, quando a página deixou de ser parada de rampa e passou a ter token próprio. A célula do escuro era **1,000:1** antes de a [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) subir o código um degrau.

> **Dissenso registrado, herdado da [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56).** A parada 900 é o degrau imediatamente acima na rampa — a **única derivação honesta disponível**, e não uma medida. O que morre no lugar dela era anatomia medida da âncora. Se ao vivo o bloco ficar pesado no escuro, o ajuste é uma linha, e é o tipo de coisa que só se julga com a implementação montada.

O par do `Frame` levou a mesma correção pela mesma causa, e está em [`componentes/frame.md`](componentes/frame.md): o palco dele citava `--pd-surface-page` e passou a citar `--pd-surface-raised`. A [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) achou o defeito num componente e não olhou para o outro.

### O segundo seletor do bloco escuro, e a ilha que ele carregava

**O bloco escuro tem UM seletor hoje: `:root`.** Ele teve dois — `:root, [data-pd-showcase]` —, e o segundo era a **ilha de espetáculo**. Ela saiu com a landing na [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94), porque a página era a única região do site a hospedá-la.

O mecanismo fica registrado, e não como curiosidade: ele é o que precisaria voltar. Glow é **emissão**, e emissão só é legível contra escuridão — o mesmo gradiente de acento **sobe** a luminância local no escuro e a **desce** no claro. Mesma operação, sinal invertido, e traduzir produz mancha. Então o glow não traduzia: a superfície de espetáculo **carregava o próprio substrato** e renderizava escura nos dois modos.

O custo arquitetural era **um seletor a mais no bloco que já existe**. Nenhum bloco novo, nenhuma briga de especificidade: custom property declarada no próprio elemento vence para a subárvore dele, e `:root[data-theme='light']` declara em `<html>`, que é outro elemento. Era isso que fazia a ilha ser **inerte na troca de tema**. Quatro coisas caíam de graça dentro dela, sem uma linha de configuração: o acento era o do escuro, a projeção voltava à opacidade do escuro, o realce da aresta voltava a ser visível, e o anel de foco já estava verificado.

> **Uma armadilha de máquina que a remoção criou, e ela está fechada.** `scripts/contraste.mjs` recorta este bloco casando o seletor em início de linha. Enquanto ele era `:root,\n[data-pd-showcase]`, o par era único no arquivo. Sozinho, `:root {` abre **quatro** blocos — a camada 1, este, o da sombra e o adaptador —, e casar só o seletor recortaria o primeiro deles e passaria a medir a camada errada **em silêncio**, devolvendo número plausível em vez de exceção. O script ganhou uma segunda âncora: a primeira declaração do bloco, `color-scheme: dark`, que é o que define um bloco de modo. Voltar com a ilha exige acertar o casamento lá junto.

**Existe ilha escura, não existe ilha clara.** O critério é emissão, emissão precisa de escuridão, então o mecanismo tem uma direção só. Pendurar uma ilha clara "por simetria" criaria a licença que o critério existe para fechar: sem ele, qualquer componente difícil no claro pede dark-only, e o modo claro morre por mil concessões. **A regra continua verdadeira e continua sem sujeito** — hoje não há ilha de nenhum dos dois tipos.

### O que **não** bifurca, e por quê

A regra que decide: **token que referencia camada 2 bifurca e mora nos dois blocos; token que referencia só camada 1 não bifurca e mora fora deles.**

`--pd-shadow-lip` é o único papel nessa situação, e é uma correção com história: ele estava escrito como par declarado, com alfa zerado no claro. Zerar o alfa desligava uma fórmula que havia **invertido de sinal** — ancorada na tinta do modo, ela produziria uma linha **escura** na aresta superior do cartão claro, ou seja luz vindo de baixo.

**Realce é luz, e luz é o topo da rampa — não "a tinta do modo".** Corrigida a âncora, o par some inteiro, e a conta é de quantização e não de identidade: no claro o cartão é `--pd-neutral-raised-light`, **`#FFFFFF`**, que fica **acima** do topo da rampa (`--pd-gray-50`, `#F4F6FA`) e não é parada dela. Um véu de 6% de `#F4F6FA` sobre `#FFFFFF` resolve para `254,34 · 254,46 · 254,70` — **`#FEFEFF` arredondado**, menos de um passo de 8 bits em todo canal. **A aresta iluminada some no claro porque não há nada acima dela para iluminar, e o que sobra da fórmula não alcança um degrau de cor — não porque alguém a desligou.**

> **A redação anterior chamava isto de *"identidade matemática"*, e não é.** Ela dizia que no claro o cartão **é** o topo da rampa, e o topo sobre si mesmo se cancela. Os dois valores são diferentes — `#FFFFFF` contra `#F4F6FA` —, e a composição sobra em `#FEFEFF`, a um 255-avo do branco em `R` e `G`. A conclusão não muda e o argumento fica **mais** forte: some por ficar sob a resolução do canal, que é um fato medido, e não por um cancelamento algébrico que não acontece. Identidade que não fecha é o tipo de afirmação que este arquivo cobra dos outros.

As sombras moram junto, pelo mesmo motivo: a composição é a mesma nos dois modos, e o modo entra por `--pd-shadow-cast`, que **é** par declarado.

> **Exceção declarada, e é a única do sistema.** A camada 2 é só cor, e as sombras carregam comprimentos inline. `box-shadow` é valor atômico: separar geometria de cor exigiria seis tokens de comprimento para compor duas sombras. Elas moram no arquivo de tokens, cabem num bloco que se lê inteiro, e a exceção é **declarada** — não descuido.

### A sombra deixou de ser escada, e a profundidade saiu do conteúdo

Eram **quatro degraus numerados**, com um anel `0 0 0 1px` embutido em cada composição. São **dois papéis nomeados por intenção** — `raised` e `float` —, e o anel saiu.

**`--pd-shadow-sunken` morreu junto, e a morte vale a linha.** Ele era o contra-exemplo declarado da elevação — *"tudo sobe, só o código afunda"* —, tinha um consumidor só, o berço do bloco de código, e **afundar era relativo ao cartão**. Sem cartão, o contra-exemplo perde contra o quê ser exemplo.

**A profundidade sai do conteúdo — não do site, e a diferença importa.** A [#50](https://github.com/ThiagoPanini/panlabs-docs/issues/50) mediu **zero componentes de conteúdo com sombra em seis páginas** da âncora: `shadow-md` e maiores existem no CSS dela e **nunca são usados**. O único portador de sombra do site medido é um chip de 24px no hover de heading.

Os dois papéis que sobram continuam com consumidor, e **nenhum deles é conteúdo**:

| Papel | Quem o consome |
| --- | --- |
| `--pd-shadow-float` | o dropdown de idioma, a gaveta do estreito, o modal de busca e o botão de voltar ao topo — tudo `position: fixed` |
| `--pd-shadow-raised` | o painel da referência gerada — **não flutua**: é superfície levantada |

Então o adaptador escreve:

| Variável do Infima | Quem a lê de verdade | Recebe |
| --- | --- | --- |
| `--ifm-global-shadow-lw` | `CodeBlock/Container` (conteúdo) e `BackToTopButton` (chrome flutuante) | **`none`** |
| `--ifm-alert-shadow` | `.alert` do Infima — o nosso callout tem DOM próprio e não é um `.alert` | **`none`** |
| `--ifm-global-shadow-md` / `-tl` | `.dropdown__menu` e `.navbar-sidebar` — chrome flutuante | `--pd-shadow-float` |

**Correção medida contra o que o ticket afirmava.** A decisão nomeava `.card` como o leitor real de `lw`, *"o cartão do `card-group`, que é conteúdo"*. **Este site não renderiza `.card` nenhum:** o nosso cartão é classe de CSS Module, e a `.card` nua do Infima não a alcança. Os leitores vivos, medidos no fonte da 3.10.2 e no HTML publicado, são outros dois. A conclusão não muda para o bloco de código; o que muda é que **o botão de voltar ao topo perderia a sombra por tabela**, e ele é chrome flutuante pela mesma definição que põe o dropdown e a gaveta nessa classe. Ele a recupera por classe estável em `chrome.css` — sem exceção nova no adaptador, porque `.theme-back-to-top-button` é `ThemeClassNames`.

`md` e `tl` recebendo o mesmo valor **não é duplicação nossa**: o Infima tem três nomes para o que aqui tem dois papéis, e o adaptador existe para traduzir. O precedente está no próprio arquivo — `--ifm-container-width` e `-xl` recebem os dois o mesmo token.

**O anel virou borda de verdade, e a razão é alcance e não estética.** O Infima declara `--ifm-*-border-color` em todo componente, então o adaptador pinta o fio inteiro com o vocabulário que já existe. Anel dentro de `box-shadow` obrigaria a sobrescrever a sombra de cada componente, um por um, só para desenhar uma linha. O `box-sizing` global é `border-box`, então o fio entra no mesmo pixel em que o anel estava — a troca não move geometria.

**Por que nome e não número.** Uma escala de dois não é escala, e numeração com buraco — `1` e `3`, com o `2` morto — é pior de ler que nome. O resto do arquivo já nomeia por intenção; a sombra era o último lugar que numerava.

> **Dissenso registrado, e ele é sobre a defesa da seção inteira.** A profundidade era a demonstração mais visível do sistema, e agora ela levanta um botão e um modal. Quem abrir o arquivo de tokens sem contexto vai ler *over-engineering*, e merece a resposta curta: **a defesa deixou de ser "é um sistema" e passou a ser "são dois papéis medidos que compartilham dois ingredientes"** — `lip` e `cast`. É verdade, e é menos do que o arquivo prometia.
>
> **E `raised` perdeu um dos dois consumidores** com a [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94): o botão primário da landing. Sobra o painel da referência gerada. O token fica porque continua consumido — e é essa a diferença entre ele e `--pd-type-6xl`, que saiu na mesma remoção.

### A camada 3 esvaziou com a ilha, e voltou a ter membros

**Ela ficou vazia, e não está mais.** São hoje **cinco nomes em 24 declarações**, todos no escopo do próprio componente e nenhum em `:root` — que é exatamente a regra do §1:

| Token | Onde é declarado | Quantas declarações |
| --- | --- | ---: |
| `--pd-callout-fill` | `src/components/catalogo.module.css` | 4 |
| `--pd-callout-edge` | `src/components/catalogo.module.css` | 4 |
| `--pd-callout-ink` | `src/components/catalogo.module.css` | 4 |
| `--pd-step-marker` | `src/components/catalogo.module.css` | 1 |
| `--pd-sidebar-icone` | `src/css/chrome.css` | 11 |

**As duas formas de camada 3 estão as duas representadas aqui, e a diferença importa.** O trio do callout é **uma variável, quatro valores**: cada variante do componente redeclara os três no seu próprio seletor, e a regra que pinta é uma só — é a camada 3 usada como ponto de comutação. `--pd-sidebar-icone` é o mesmo padrão levado ao extremo, com uma declaração por seção e um `mask` só que as consome todas. Já `--pd-step-marker` é o caso simples: um valor nomeado no escopo onde ele significa alguma coisa, para que a régua do marcador e o fio que liga os passos não repitam o número.

**A camada continua sendo uma das três, e a regra de referência do §1 se lê pelas três.** Camada sem membro é diferente de camada que não existe — e essa frase valia enquanto ela estava vazia, que é o estado que o parágrafo abaixo registra.

O que morava lá **antes** eram `--pd-glow` e `--pd-glow-2`, mais a caixa quadrada da luz e o par de amplitude da respiração. Eles saíram com a ilha na [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94), e é isso que esvaziou a camada por um tempo. O registro fica porque é a especificação do que precisaria voltar:

`--pd-glow` e `--pd-glow-2` **não eram papel semântico** — são gradientes, não cores, e não cabiam na lista fechada de oito. Eram token de componente, e o componente era a própria ilha. **A regra deles era separada de propósito:** entrar no bloco escuro os poria em `:root`, e o glow vazaria para o site inteiro. Fora da ilha, `var(--pd-glow)` **não resolvia para nada** — a confinação não dependia de alguém lembrar dela, era fato de escopo. E custava **zero** na superfície de troca, que continua em sete linhas.

**Eram dois, e o segundo não afrouxava o critério de emissão.** O magenta a **30%** citava `--pd-accent`; o cyan a **24%** citava `--pd-code-parameter`, que é o tom do identificador na paleta de sintaxe — dentro da ilha a laje era o material, e a segunda luz era a cor do material. Nenhum hex novo: as duas eram a operação 1 sobre token que já existe. **Um respirava, o outro não** — o par de amplitude alcançava só o magenta, e era assim que o teto de *um loop por página* se lia ao pé da letra.

> **O primeiro subiu de 12% para 30%, e o registro anterior estava errado sobre a origem.** [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) escreveu o par `0,24 / 0,30` supondo que o `--pd-glow` publicado já fosse 0,30; ele era **12%, desde o primeiro commit**. O par estava certo sobre o destino. Quem pagou a diferença foi a **figura**: enquanto havia desenho embaixo, a luz era o brilho sobre ele; sem desenho ela carregava o hero sozinha, e 12% não carregava. O documento que detalhava isso era `landing.md`, e saiu junto.

---

## 7. O adaptador de mão única

**O sistema nunca lê `--ifm-*`. Só escreve.** A doutrina está no [ADR 1](../adr/0001-doutrina-de-css.md); aqui está o que ela produz na prática.

O adaptador é o maior bloco do arquivo — encanamento inerte, uma atribuição por variável do Infima que o chrome de fato renderiza. Aceito porque é o único bloco puramente mecânico do sistema, e é exatamente o bloco que se pula na leitura.

Três regras de conteúdo:

1. **Ele não bifurca por modo.** Lê camada 2, que já bifurcou.
2. **Ele não pode conter linha morta que sugira funcionar.** Cada linha foi conferida contra a lista de `--ifm-*` efetivamente lidas por `var()` no Infima e no `theme-classic`.
3. **Ele escreve num terceiro namespace também.** `--doc-sidebar-width` não é `--ifm-*` nem `--pd-*`, e o adaptador escreve nele como escreve nos outros.

Dois achados da implementação que a arquitetura não tinha:

- **`--ifm-transition-slow` não tem consumidor.** O Infima a declara e nada a lê. A arquitetura previa que o adaptador a escrevesse; ela sai, pela regra 2.
- **A escala de ênfase do Infima é invertida por ele no bloco escuro, e nós não podemos invertê-la** — o adaptador é cego ao modo. A rota correta é apontar cada degrau para um papel da camada 2, que já bifurcou. A escala tem dez degraus consumidos e o nosso texto tem quatro paradas, então alguns degraus repetem. **Repetir é honesto; inventar parada não seria.** O degrau 600 não é consumido por ninguém e por isso não é atribuído.

### As três exceções com escopo — lista fechada

Três pontos do Docusaurus não são alcançáveis de `:root`. **A numeração não é remendada** — os números que sobram são 2, 3 e 4, e o 1 fica vago; a *exceção 3* é citada pelo número mais abaixo, e renumerar quebraria a citação. É o mesmo precedente que congela a numeração dos portões (ADR 5).

| # | Ponto | Por que escapa | Como o adaptador alcança |
| ---: | --- | --- | --- |
| ~~1~~ | ~~`--ifm-alert-background-color-highlight`~~ | — | **removida** — `.alert` não tem superfície neste site; ver abaixo |
| 2 | `--docusaurus-details-decoration-color`, `-transition`, `-summary-arrow-size` | declaradas dentro de classe de CSS Module, nunca em `:root` | `details[class]`, que é (0,1,1) e vence a classe hasheada sem depender do hash |
| 3 | `--prism-background-color` | **não vem de CSS nenhum** | ver abaixo — a arquitetura previa um seletor, e ela estava errada |
| 4 | shades de cor semântica | quatro das seis são inertes | atribuir **só as vivas**: base, `-dark`, `-darker`, `-contrast-background`, `-contrast-foreground` |

**Eram cinco, e a que saiu é a do `--docusaurus-tag-list-border`.** Ela alcançava a borda do chip de tag por `a[class*='tag_']`, e **não tem superfície viva**: nenhuma página deste site declara `tags:`, e a medição fecha o caso — o front matter da âncora tem `title`, `description`, `icon`, `sidebarTitle`, `hidden`, `noindex`, `searchable`, `deprecated` e `groups`, e **não tem `tags`**. O carimbo dela é `herdado`, não defesa.

O valor de uma lista fechada é ser **conferível membro a membro**, e linha permanentemente infalsificável é o oposto disso: ninguém consegue mostrar que ela funciona, porque não há página onde ela apareça.

> **Dissenso registrado.** Isso remove uma defesa que custava uma linha, e o modo de falhar que a saída dela abre é exatamente o **silencioso** que a spec combate em toda parte: o dia em que uma página declarar `tags:`, o chip sai com a borda default do Infima e nada avisa. Se a arquitetura de informação criar tag, a exceção volta **no mesmo commit**, por uma linha.

**E a exceção 1 saiu depois, pela mesma régua e com evidência mais forte.** Ela pintava as seis variantes de `.alert--*`, e `.alert` **não tem superfície neste site**: [`swizzle.md`](swizzle.md) registra o mapa de `Admonition/Types.js`, que manda `note`, `info`, `tip` e `warning` direto para o nosso `Callout` — DOM próprio, zero Infima —, e o `Admonition` raiz **cai em `info`** para qualquer tipo ausente, isto é, no mesmo `Callout`. Não sobra caminho que renderize um `.alert`.

**Medido no build, não deduzido:** `alert--` aparece em **zero** dos **108** HTML publicados, e `class="… alert …"` também em zero.

A diferença para a exceção da tag é que esta é **mais** fechada, não menos: a de tag dependia de o front matter nunca ganhar `tags:`, e um autor podia criar essa superfície com uma linha; esta depende de um mapa de swizzle que é **nosso**, versionado, com o motivo escrito dentro do arquivo. O dissenso é o mesmo — a exceção custava seis linhas e defendia contra o dia em que alguém desfizesse o mapa —, e a resposta é que esse dia teria de passar por `Types.js`.

**Correção registrada na exceção 3.** A arquitetura previa alcançar `--prism-background-color` *"por seletor na classe do bloco de código"*. **Não é alcançável assim** — medido no fonte da versão em uso: `CodeBlock/Container` injeta a variável no atributo `style` **inline**, via `getPrismCssVariables`, e nenhum seletor de folha de estilo vence estilo inline. O ponto de escrita é o **shim** de `themeConfig.prism.theme`. Escrever a regra de seletor mesmo assim seria exatamente a linha morta que sugere funcionar.

### O shim do Prism

O tema Prism é objeto JavaScript em `docusaurus.config.js`, e a leitura ingênua é que a paleta de sintaxe teria que morar lá — quebrando a regra de que todo número vive num bloco só. **Não quebra:** um tema do `prism-react-renderer` é `{plain, styles:[{types, style}]}`, e o `style` aceita qualquer string CSS, inclusive `var(--pd-code-keyword)`.

O tema vira um shim que **só referencia token**, e **nenhum valor de cor entra no arquivo de config**. Verificado no HTML gerado: os `<span>` de token saem com `style="color:var(--pd-code-keyword)"`, e o container com `style="--prism-background-color:var(--pd-surface-code)"`.

Um shim serve os **dois** modos: o Docusaurus cai em `prism.theme` quando `prism.darkTheme` não existe, e os tokens já bifurcaram. Declarar um segundo criaria um lugar a mais onde o modo diverge.

---

## 8. Tipografia

Dezenove nomes, e **zero valor novo** em relação ao que a direção de arte travou. Eles existem porque a regra mais dura da spec é *zero valor fora deste documento*: um arquivo de componente que escreve "peso 600" já é violação — ele precisa de um nome para citar.

- **Tamanho:** `--pd-type-xs` … `--pd-type-4xl`, e a escala **termina aí** — não há degrau de display. Os degraus levam o nome do alvo, para a procedência ficar legível no próprio token e quem confere não precisar traduzir. Numerar de um a oito jogaria isso fora — e é o nome do alvo que deixa o **fim da escala ser legível** em vez de parecer truncamento.
- **Peso:** `--pd-weight-body`, `-ui`, `-heading` — nomeados por **intenção**, não por número. `--pd-weight-600: 600` é uma identidade que não ensina nada, e nome de intenção fecha uma armadilha: o Infima chama **500** de `semibold`, e o nosso `semibold` seria 600 — a mesma palavra sobre dois números dentro do mesmo repositório.
- **Entrelinha:** `--pd-leading-prose`, `-ui`, `-code`, `-h1` a `-h4`. `-h4` repete o valor de `-ui` e mantém nome próprio: mesmo número hoje, intenções diferentes; fundi-los faria uma mudança em h4 mexer em toda a rotulagem de UI.
- **Tracking:** `--pd-tracking-tight`, um só, e **só em título**. O corpo usa o `normal` do navegador, que é keyword e não valor.

Isto **não** abre camada semântica de dimensão: são tokens de camada 1, declarados uma vez, consumidos direto pela camada 3.

### O degrau do título de página

O título fica em `--pd-type-3xl` até 996px e em `--pd-type-4xl` a partir de 997px — e **não** nos 640px medidos no alvo.

O par 30/36 é herdado; **o ponto onde ele troca, não.** 640 seria um segundo limiar de media query no mesmo eixo, contra a regra de limiar único do projeto, que alinha as media queries aos literais compilados do Infima. E alinhado, o título cresce **no mesmo instante em que a sidebar aparece** — um evento visual em vez de dois.

**Perda nomeada:** entre 640 e 996px o título fica em 30px onde o alvo dá 36. É a única faixa em que a nossa maior tipografia é menor que a da âncora.

### Não há degrau de display, e a escala já terminou no `4xl` uma vez

**O topo da escala é `--pd-type-4xl`.** Houve um `--pd-type-6xl` de **60px** com **um** consumidor no site inteiro — o título do hero da landing, de 997px —, e ele saiu na [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94), junto com o consumidor.

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

Quatro paradas de duração mais um período de loop, duas curvas nomeadas por intenção, e **sete movimentos** que são tokens completos — `<duração> <easing>` — compostos da escala em vez de cravar número. É isso que faz reduced-motion alcançar o framework que não escrevemos.

Os números são medidos, não escolhidos: a parada curta é o valor mais aplicado de toda a amostra das sete referências; a média é a banda de mudança grande; a longa é a banda de entrada grande; e o período de loop é o único loop ambiente medido em qualquer uma das sete.

**Correção que precisa carregar sem rastro da versão perdedora:** `--pd-move-enter` compõe da parada **curta**, não da longa. O único consumidor dele no site inteiro é o modal de busca, e a mesma medição que produziu o token registra o modal na banda curta em três dos sites. A banda longa fica com `--pd-move-showcase`, cujo consumidor é entrada grande de verdade.

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
| `text-strong` sobre levantada / página | 17,03 / 17,03 | 19,45 / 18,95 |
| `text-body` sobre levantada / página | 12,05 / 12,05 | 10,07 / 9,81 |
| `text-muted` sobre levantada / página | 7,21 / 7,21 | 7,71 / 7,51 |
| acento como link, sobre levantada / página | 6,99 / 6,99 | 6,44 / 6,28 |
| `text-inverse` sobre preenchimento de acento | 7,97 | 6,44 |
| anel de foco vs levantada / página (SC 1.4.11 pede 3:1) | 6,99 / 6,99 | 6,44 / 6,28 |
| anel de foco vs pastilha de código | 6,61 | 6,44 |
| `text-strong` sobre o wash do item ativo | 14,44 | 15,68 |
| **sintaxe, pior token, sobre a pastilha** | **8,13** | **6,29** |
| ícone de estado sobre o próprio fundo, pior caso | 6,33 | 5,98 |
| corpo sobre fundo de callout, pior caso | 8,28 | 8,54 |

**No escuro, toda linha "levantada / página" sai com as duas células idênticas** — não é arredondamento nem duplicação por engano: desde a issue #95, `--pd-surface-raised` referencia `--pd-surface-page` no modo canônico, então as duas colunas medem a mesma superfície duas vezes. No claro elas divergem por um hex (`#FFFFFF` contra `#FCFCFC`), que é distância pequena demais para separar as duas casas decimais na maioria das linhas.

### A divergência com [`foco.md`](foco.md) §6 está fechada, por medição

**O defeito:** as duas tabelas mediam o **mesmo par** — o anel de foco contra a superfície levantada e contra a página — e discordavam em **três das quatro células**. Ele foi achado pelo teste do axioma 6 e ficou aberto desde então, porque adivinhar qual estava certa seria inventar um número medido, e é o axioma 5 que estava em jogo.

**O que fechou:** as duas superfícies foram reescritas de qualquer jeito por causa da marca nova, então as quatro células foram **medidas de novo**, pelo mesmo comando, e as duas tabelas passaram a sair da mesma fonte. As duas concordam célula a célula porque agora é **impossível** discordarem.

O método vale registro, porque ele é o que reproduz o número. Duas escolhas o fixam:

- **o contraste é medido sobre a cor de oito bits**, não sobre a aritmética contínua da conversão OKLCH→sRGB. É o que a tela recebe, e é o que faz `#FAF2F9 sobre #2B262A` dar o mesmo número aqui e em qualquer conferidor de contraste do mundo;
- **cada preenchimento translúcido é composto sobre o fundo em que ele de fato assenta.** Preenchimento com alfa não tem cor própria: tem a cor do que está atrás. O callout mora dentro do corpo do documento, sobre a superfície levantada; o wash do item ativo mora na sidebar, que fica fora dela, sobre a página. Medido antes da issue #95, quando levantada e página ainda eram cores diferentes nos dois modos: compor o callout sobre a página em vez da levantada movia o pior caso do corpo de 6,47 para 9,10 — a distância entre um par que passa raspando e um que passa com folga. Hoje, no escuro, as duas superfícies **são** a mesma cor — a composição errada deixou de ter como se distinguir ali —, e no claro a diferença encolheu para um hex quase idêntico. O pior caso atual é **8,28 / 8,54** (tabela acima).

**As células que não dependem do acento saem idênticas às da tabela anterior**, e é isso que confirma o método contra a medição antiga em vez de substituí-la sem prova. Uma exceção nomeada: a linha do ícone de estado não reproduz — o registro anterior dava 5,23 / 5,52 e a medição, na época, deu **4,96 / 5,45**. Não foi possível reconstruir com que par o número antigo saiu, então valeu o medido. Os dois números são de antes da issue #95; com a página nova, a medição atual dá **6,33 / 5,98** (tabela acima), e continua bem acima dos 3:1 que a SC 1.4.11 pede para conteúdo não textual.

### O piso da paleta de sintaxe é critério, não registro

**`node scripts/contraste.mjs --verificar` reprova se o pior token cair abaixo de 8,03 no escuro ou 6,29 no claro, ou se o croma máximo passar de 0,095.**

Hoje ele mede **8,13** no escuro, com **dez centésimos** de folga até o piso. A issue #95 trocou `--pd-gray-900`, que é a pastilha do escuro, e o token mais apertado dos sete — `comment` — foi remedido de `#B0AEB6` para `#B2B0B8` para não cruzar o piso; os outros seis toleraram a pastilha nova sem ajuste. Antes de #95 ele media **8,04**, e a distância até o piso era de **um centésimo**, que foi o mais apertado que este número já esteve.

**O piso do escuro desceu de 8,04 para 8,03, e a descida é aritmética, não afrouxamento.** O 8,04 foi escrito como **previsão**, quando a pastilha ainda era a cor da página e a medição dava 8,94: o número gravado era o da pastilha *"um degrau acima na rampa, que é onde ela vai parar quando o cartão sair"*. O cartão saiu, a pastilha subiu, e **a previsão acertou a segunda casa decimal** — a medição dá 8,0364, que se publica como 8,04 e é, no float, três milésimos menor que o piso previsto.

Um piso gravado **acima** do que a grandeza vale não é rigor: é um portão que nunca poderia passar. Vale o degrau honesto abaixo da medição, com o `>=` estrito e sem regra de comparação especial. **O acerto da previsão fica registrado onde importa** — na segunda casa, que é a precisão que esta spec publica.

*Consideração descartada, e vale escrita:* comparar os pisos de sintaxe **na precisão publicada**, em vez de mover o número. Isso resolveria o mesmo problema e compraria meio centésimo de folga **nos dois sentidos** — uma paleta futura em 8,035 passaria por um piso de 8,04. Mover o piso é mais estrito e não precisa de conceito novo no script. Os limiares de AA e da SC 1.4.11 nunca estiveram em jogo: eles são **normativos**, e ali 4,4951 falha de verdade.

Os três números que convertem *"não muito neon"* de gosto em régua:

| | croma médio | croma máx | pior contraste |
| --- | ---: | ---: | ---: |
| semeadura anterior | 0,104 / 0,089 | 0,173 / 0,113 | 7,77 / 5,66 |
| o par padrão da âncora | 0,075 / 0,115 | 0,112 / 0,207 | 5,87 / 4,55 |
| **esta paleta** | **0,057 / 0,062** | **0,095 / 0,090** | **8,13 / 6,29** |

*A coluna de contraste desta tabela deixou de ser comparável coluna a coluna no escuro, e isso fica dito em vez de escondido:* as duas primeiras linhas foram medidas sobre a pastilha **antiga**, que era a cor da página, e só a terceira foi remedida sobre a nova. A coluna do claro continua comparável, porque a pastilha clara não se mexeu. Remedir as outras duas exigiria as duas paletas inteiras, que não moram neste repositório — e a comparação que a tabela existe para fazer é de **croma**, onde as três linhas continuam saindo do mesmo método.

*As três linhas foram medidas pelo mesmo comando, e a primeira adjudica um número que estava em disputa:* a resolução que escolheu esta paleta registrou o piso da semeadura anterior como **7,02**, e a tabela deste documento registrava **7,77**. **7,77 é o certo** — quem tinha razão era o registro antigo, e é ele que fica.

Ela é a **menos saturada das três nos dois modos** e a única que bate os dois pisos. *Dissenso registrado:* baixar o croma médio para 0,057 é menos cor do que qualquer uma das duas alternativas — se ao vivo o bloco parecer apagado, o ajuste é subir croma dentro da mesma banda, e a spec já terá afirmado os números. E o teto de 0,095 é **derivado, não medido**: é o teto do par da âncora puxado para baixo por julgamento.

### A única reprovação, e ela é deliberada

**`--pd-text-faint` reprova: 3,88:1 no escuro — levantada e página empatam, porque são a mesma cor — e 4,63:1 no claro**, sobre a página, que é o pior caso ali. Antes da issue #95 o pior caso nos dois modos vinha da levantada; a levantada clara é hoje branco puro (`#FFFFFF`), mais clara que a página (`#FCFCFC`), e a ordem se inverteu.

É a parada 500 — o meio matemático da rampa —, então é o pior caso **por construção**, e nenhum ajuste salva.

> **Proibido para texto de leitura.** `--pd-text-faint` existe para separador, placeholder e controle desabilitado, que é isento pela SC 1.4.3. Texto secundário legítimo usa `--pd-text-muted`, que passa nos dois modos.

### A garantia é da arquitetura, não desta skin

**O contraste do TEXTO é propriedade das paradas, não da marca.** Desde a issue #95 isso não é mais um efeito medido — é garantia de construção: a rampa e as duas superfícies não leem `--pd-brand`, então **nenhuma célula que não cite o acento** se move numa troca de marca.

> **Correção de fato.** Esta frase dizia *"não existe troca de marca capaz de mover uma célula desta tabela"*, sem a ressalva, e a medição derruba a versão forte: trocar o violeta pelo laranja moveu **treze** células entre esta tabela e a de [`foco.md`](foco.md) §6 — todas as que citam o acento, e só elas. A razão de contraste é função da luminância relativa do WCAG, que **não** é o `L` do OKLCH: dois acentos de mesmo `L` e matizes diferentes têm luminâncias diferentes. O que a #95 comprou foi a metade certa da garantia, e o parágrafo abaixo já a enunciava corretamente — *"as linhas que não o citam não se mexeram"*. Nenhum piso caiu na troca, e a menor folga da tabela seguiu sendo a mesma linha. Antes de #95 a garantia era empírica, não estrutural, e o parágrafo abaixo registra essa medição — histórica, mas ainda o motivo de a garantia ter sido escrita como regra em vez de ficar como coincidência.

A troca de marca desta skin, medida à época em que a rampa ainda tingia, é a prova disso rodando ao vivo. O acento perdeu um terço de croma, e as linhas que não o citam **não se mexeram**: `text-strong`, `text-body` e o corpo sobre fundo de callout saíram idênticas nas duas colunas, e `text-muted` saiu idêntica no escuro.

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

E **um relatório**, que também roda na CI e não é nenhum dos dois:

| Comando | O que ele imprime |
| --- | --- |
| `npm run paridade` | a distância entre o site construído e as tabelas de alvo da §12 e da §13 |

**Ele não é verificação porque o alvo e o site não são duas cópias de uma verdade** — a §12 e a §13 dizem onde se quer chegar, e a distância até lá é o que se quer ler. Por isso ele imprime e **nunca reprova**: é o único passo com `continue-on-error` da CI.

**A segunda nasceu de um defeito real, não de zelo.** Duas tabelas desta spec mediam o mesmo par e discordavam em três das quatro células, e a divergência sobreviveu a uma auditoria inteira porque não havia como conferi-la sem refazer a conta à mão. Uma tabela transcrita diverge calada; uma tabela que sai de um comando não tem como.

**Limite conhecido do portão 1, escrito em voz alta:** media query não lê custom property, e o limiar dela é um comprimento — então o prelúdio de `@media` **não tem como** passar pela varredura de literal.

> *Correção do teste de reconstrução ([`README.md`](README.md) §6):* a redação anterior resolvia isso dizendo que *"enquanto o único limiar do projeto morar no arquivo de tokens, o portão passa sem exceção"*. **É falso, e subestima o portão.** O limiar mora também em `src/css/chrome.css`, que é onde o comportamento de tela estreita precisa dele; quem lesse a frase concluiria que uma media query fora do arquivo de tokens reprova, e ela não reprova.
>
> O que o portão 1 de fato faz são **duas pernas**: o prelúdio de `@media` sai da varredura de literal **e entra numa segunda perna**, que cobra que todo limiar seja o limiar único do projeto — 996/997px. Um `@media (min-width: 1024px)` novo reprova, que é exatamente onde ele precisa reprovar. A exceção não é buraco: é uma regra mais estreita, escrita noutro lugar.

**Segundo limite, e ele foi fechado em vez de explorado.** O padrão do portão 1 é `px|rem|em|ms|s`; `dvh` **não está nele**. A altura máxima do modal de busca é `60dvh`, e escrevê-la inline num CSS Module passaria pela varredura. **Passar por buraco de varredura é a única forma de literal que este projeto não admite** — a saída correta seria fechar o buraco, e fechá-lo custa uma linha aqui em vez de uma perna nova de portão. Por isso `--pd-busca-height` é token, e o portão 1 continua com o padrão que sempre teve.

**Achado da implementação:** o `postcss-calc`, que roda na minificação, **não entende sintaxe de cor relativa** e emite aviso ao encontrar `calc(l + 0.06)` e `calc(l - 0.06)`, os dois acentos-hover. Ele **não toca no valor** — verificado byte a byte no CSS emitido, os acentos saem intactos. O aviso é ruído, não defeito, e está registrado aqui para ninguém "consertar" o acento por causa dele. Até a issue #95 ele também disparava em `calc(c * var(--pd-brand-tint))`, na rampa; a rampa é hex fixo agora e não passa mais por `calc()` nenhum, então essa metade do aviso morreu junto.

---

## 12. Alvo medido — a paleta da âncora

Este documento é a sede do valor **que temos**. Esta seção e a próxima publicam o valor **que se quer**: os dois lados do mesmo número, e o comparador de `npm run paridade` mede a distância entre eles.

Os valores são medição de primeira mão do `docs.devin.ai`, registrada em `research/paridade-devin` §3. Eles são resolvidos em **sRGB**, porque é o que o navegador entrega quando se pede a cor computada de um elemento pintado — a folha autora em `oklch()`, e comparar a forma autoral com o hex da âncora nunca fecharia.

| Papel | Claro | Escuro | Tolerância |
| --- | --- | --- | --- |
| Fundo da página | `#fcfcfc` | `#141414` | exato |
| Fundo do navbar | `#fcfcfc` | `#141414` | exato |
| Texto forte | `#181a1e` | `#dfe2e6` | exato |
| Texto corpo | `#404246` | `#a0a2a6` | exato |

**O chão da página não vem da rampa, e ali estava o defeito de origem.** A âncora tinge a rampa de onze cinzas com o matiz da marca, mas **não pinta a página com ela** — o fundo é token separado, cinza neutro puro. Herdávamos o mecanismo certo e o aplicávamos numa superfície onde a âncora não o aplica; com marca magenta, o chão inteiro do site ficava magenta. A linha *Fundo da página* desta tabela foi a que cobrou a correção — fechada na issue #95: `--pd-surface-page` ganhou token próprio (`--pd-neutral-page-dark` / `-light`) e a rampa parou de tingir. Ver §5, acima.

**O acento não tem linha.** A cor de marca é divergência declarada da âncora — laranja, e não o azul dela. Publicar o azul como alvo mandaria copiar exatamente o que a decisão registrada recusa, e o comparador passaria a reprovar a decisão em vez da deriva.

---

## 13. Alvo medido — a escala de tipo da âncora

Medida na mesma sessão, em `research/paridade-devin` §5, a 1512. As famílias já batem dos dois lados — Inter variável e paperMono variável, auto-hospedadas —, então o que sobra é tamanho, entrelinha e peso.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| `h1` tamanho | `36px` | exato |
| `h1` entrelinha | `40px` | ±1 |
| `h1` peso | `600` | exato |
| `h2` tamanho | `24px` | exato |
| `h2` entrelinha | `32px` | ±1 |
| Prosa tamanho | `16px` | exato |
| Prosa entrelinha | `28px` | ±1 |
| Item de sidebar tamanho | `14px` | exato |
| Item de sidebar entrelinha | `24px` | ±1 |
| Item de sidebar peso | `400` | exato |
| Separador de sidebar peso | `600` | exato |
| Item de TOC tamanho | `14px` | exato |
| Aba do navbar tamanho | `14px` | exato |

**As quatro entrelinhas são `±1`, e as outras oito continuam `exato`.** A régua está publicada em [`chrome.md`](chrome.md) §11: *`exato` é para o que só tem dois estados — uma borda existe ou não existe, um raio é o que a folha diz; `±1` é para o que atravessa arredondamento de subpixel*. **Entrelinha é o caso central dessa segunda metade**, e não por acidente de implementação: ela é razão × tamanho, e razão decimal quase nunca fecha em binário. As quatro daqui estavam marcadas `exato`, contra a própria doutrina do projeto, e o preço eram vermelhos que ninguém podia fechar: `1,111 × 36 = 39,996` contra um alvo de 40, `1,333 × 24 = 31,992` contra 32, `calc(24 / 14) × 14 = 24,0001` contra 24. Um alvo que não fecha em nenhuma implementação correta não mede nada — ele treina quem lê o relatório a ignorar a linha, que é o oposto do que a tabela existe para fazer.

**Isto NÃO afrouxa o alvo:** `±1` continua reprovando qualquer coisa a um pixel inteiro de distância, que é a menor diferença que um leitor pode ver. O que ele para de reprovar é a quarta casa decimal.

> **As duas últimas linhas fecharam na S9-8, por mecanismos opostos do mesmo upstream.** `Item de TOC tamanho` media **12,8** e `Aba do navbar tamanho` media **16**, os dois contra `14px`.
>
> A aba **não tinha declaração nenhuma** no Infima e herdava os 16px do `<html>`; a lista do TOC tinha uma declaração cravada no filho — `.table-of-contents { font-size: 0.8rem }` —, que vence o `--pd-type-sm` que o slot em volta já declarava. O segundo é o padrão que os títulos de doc pagaram na #96: o elemento pai mede certo, o filho mede errado, e uma sonda no pai devolveria verde.
>
> **Ausência de declaração no upstream é tão invisível quanto declaração errada, e pior de achar:** não há o que procurar com `grep`. Nos dois casos foi `npm run paridade` que apontou, e é o argumento inteiro de por que a tabela existe. O CSS está em `chrome.css`, §3 e §4.

**O `h1` e o `h2` convergem com a escala que este documento já declara.** A escala de tokens diz 36 e 24; o que hoje renderiza 48 e 32 são as regras `.markdown` do Infima, que vencem os tokens por especificidade. A correção não briga com a âncora — ela faz o site passar a obedecer o próprio documento, e o alvo da âncora confirma o número.

---

## 14. Alvo medido — citação e régua

Medido em `research/paridade-devin` §11, junto dos componentes — citação (`<blockquote>`) e régua (`<hr>`) são elemento nativo de Markdown, não entram no catálogo de [`componentes/`](componentes/README.md), e por isso o alvo mora aqui.

| Sonda | Alvo | Tolerância |
| --- | --- | --- |
| Citação, borda esquerda | `4px` | avaliação visual |
| Citação, recuo (`padding-left`) | `24px` | avaliação visual |
| Citação, cor do texto | igual ao corpo, não esmaecida | avaliação visual |
| Régua, margem vertical | `48px` | avaliação visual |

**Três das quatro corrigidas; uma fica gap declarado.** A citação herdava o default do Infima — borda de `2px` sem recuo próprio, texto em `--pd-text-muted` — e a régua herdava a margem vertical do Infima, metade do alvo. As três fecham nesta mudança, por `--ifm-blockquote-border-left-width`, `--ifm-blockquote-padding-horizontal`, `--ifm-blockquote-color` e `--ifm-hr-margin-vertical`.

**A margem vertical da citação (medida em `25,6px`) fica de fora.** Não tem correspondente exato na escala de espaço deste projeto (base `4`), e o degrau mais próximo, `24px`, já é o valor do recuo horizontal — usar o mesmo número nos dois eixos empataria duas medidas que a âncora mede diferentes. Sem sonda automática para nenhum dos dois elementos ainda.

---

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| **A paleta-alvo do §12 e a escala-alvo do §13** | **medido em referência** | medição de primeira mão da âncora em `research/paridade-devin` §3 e §5 — [#93](https://github.com/ThiagoPanini/panlabs-docs/issues/93) |
| **O alvo de citação e régua do §14** | **medido em referência** | `research/paridade-devin` §11 — [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) |
| Margem vertical da citação fora do alvo publicado | **origem própria (consequência)** | [#100](https://github.com/ThiagoPanini/panlabs-docs/issues/100) — `25,6px` não tem correspondente na escala de espaço base 4; reabre se a escala ganhar um degrau que bata. **Recarimbada em S9-2:** era `lacuna de medição`, e o valor **foi** medido — o que falta não é a medição, é um degrau na escala. O nosso número cai da escala fechada que o §1 deste documento publica, que é `(consequência)` pela definição de [`principios.md`](principios.md) §5.1 |
| **O acento sem linha de alvo** | **delta deliberado** | a cor de marca diverge da âncora por decisão registrada; publicar o azul dela mandaria desfazer a decisão |
| **Alvo comparado em sRGB, não em OKLCH** | **origem própria (implementação)** | é a forma que o navegador entrega ao pedir cor computada; a folha autora em `oklch()` e as duas formas nunca fechariam por string |
| Indireção raiz → semântica | herdado | [#3](https://github.com/ThiagoPanini/panlabs-docs/issues/3) §1.1 — o token de papel apontando para a raiz injetada, no alvo |
| Token de componente no escopo do componente | mecanismo emprestado | [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) §1.4 — `.alert` do Infima redeclara sete tokens globais |
| Rampa de onze cinzas, hex fixo, fora da marca | herdado | `research/paridade-devin` §3.1 — [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95), medida direto na âncora (Devin), e escrita como hex — não mais como `oklch(from …)`, porque não deriva de nada em tempo de navegador. Substitui a rampa tingida pelo matiz da marca ([#2](https://github.com/ThiagoPanini/panlabs-docs/issues/2) §3.2, medida nos quatro sites do alvo anterior, expressa em `oklch(from …)` por [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §3) — o mecanismo de tingir estava certo, a camada em que ele pintava é que não: ver [`tokens.md`](tokens.md) §5 |
| `--pd-neutral-page-dark` / `-light` e `--pd-neutral-raised-light` | herdado | `research/paridade-devin` §3.1 — [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95): `#141414` / `#fcfcfc` / `#ffffff`, medidos direto na âncora. Papel novo — antes a página era a própria parada `gray-950` (escuro) / `gray-100` (claro) |
| `--pd-brand-tint` sai do sistema | **origem própria (consequência)** | [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95) — a rampa desacoplou da marca; não sobrou produto `c × tint` para travar. Substitui a procedência anterior (banda herdada de [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §1 + a conta que a travava em 0,0120) |
| Matiz da marca, laranja queimado (h≈38) | origem própria | **escolhido pelo dono do produto, e a eliminação da [#95](https://github.com/ThiagoPanini/panlabs-docs/issues/95) foi revista com o custo na mesa.** A #95 tinha eliminado esta banda por escrito — *"os quatro matizes de estado são intocáveis"* —, e o laranja mora entre `--pd-hue-danger` (27) e `--pd-hue-warn` (62). O custo foi MEDIDO antes de decidir: em ΔE OKLab, o acento saía a **0,120 / 0,103** do estado mais próximo com o violeta (era o `info`), e sai a **0,088 / 0,065** com o laranja (é o `danger`) — a distância cai pela metade, e **nenhum laranja escapa disso**, porque a banda é bracketada pelos dois estados. Mover `--pd-hue-danger` ou `--pd-hue-warn` para abrir espaço foi recusado: §5 desta seção diz que repintar matiz de estado *não é re-marcar, é quebrar significado*. O croma **0,161 se mantém** — como na troca anterior, só o ângulo mudou —, e h≈38 é o teto: acima dele o acento claro (L 0,50) sai do gamute sRGB e o navegador corta o croma que a spec publica |
| Travas de luminosidade do acento | origem própria | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §2a — verificadas em 24 matizes |
| Três acentos no bloco de troca | herdado | [#2](https://github.com/ThiagoPanini/panlabs-docs/issues/2) §3.1 |
| Tipografia dentro do contrato de troca | **herdado** | [#55](https://github.com/ThiagoPanini/panlabs-docs/issues/55) — o carimbo antigo contrariava o [`principios.md`](principios.md) §2, que já dizia que tipografia é parâmetro que a âncora expõe |
| `--pd-radius` no bloco de troca, e o valor | **herdado** | [#55](https://github.com/ThiagoPanini/panlabs-docs/issues/55) — `--pd-radius-md` já entrega 12px, o `rounded-xl` da âncora; a parametrização por `calc()` responde ao axioma 3, não ao §3 |
| Escada de raio por múltiplo | mecanismo emprestado | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §7 — raio paramétrico da Vapi, disciplina do Neon |
| Escuro em `:root`, claro como override | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §4 — Infima e alvo põem claro em `:root`; axioma 4 |
| Adaptador de mão única | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §2, derivado das armadilhas da [#5](https://github.com/ThiagoPanini/panlabs-docs/issues/5) |
| As exceções com escopo, como lista fechada | herdado | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §2 |
| **Elas caem de cinco para quatro** — `--docusaurus-tag-list-border` sai | **herdado** | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) — o front matter da âncora não tem `tags`, e nenhuma página deste site declara o campo. Linha permanentemente infalsificável é o oposto de lista conferível. *Dissenso: o modo de falhar que a saída abre é silencioso* |
| A exceção do Prism não é alcançável por seletor | **origem própria (correção)** | medido no fonte da 3.10.2 ao implementar o slice 1 — `style` inline vence folha de estilo |
| `--ifm-transition-slow` fora do adaptador | **origem própria (correção)** | varredura de `var(--ifm-*)` no Infima e no theme-classic — zero consumidores |
| Ênfase mapeada em papéis da camada 2 | origem própria | consequência de o adaptador ser cego ao modo |
| `@property` em três raízes | origem própria | [#31](https://github.com/ThiagoPanini/panlabs-docs/issues/31) §2, corrigindo a [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §2d |
| Oito papéis semânticos | origem própria | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §5.1 abre o oitavo sobre os sete da [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §6 |
| Camada semântica inteira nos dois modos | herdado + origem própria | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §5 |
| Página clara na parada 100 | origem própria | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §4 — preserva o tint na maior superfície do claro |
| O papel da superfície levantada troca de nome | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — o nome anterior citava o cartão, que está de saída, e já colidia com a grade de `card-group` e com o cartão-componente. `raised` nomeia o papel: *o que não é a página* |
| Pastilha de código no extremo do modo | herdado | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §4 — Clerk e a anatomia da Perplexity |
| **A pastilha do escuro sobe para a parada 900** | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — ela era o **mesmo valor** de `--pd-surface-page`, e sem cartão o bloco sumia contra a página. *Dissenso: a 900 é o degrau imediatamente acima na rampa, e não uma medida; o que morre no lugar era anatomia medida* |
| Borda = tinta a 7% | herdado | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §5 — reproduz os dois valores medidos com um mecanismo |
| `--pd-shadow-lip` como valor único, ancorado no topo da rampa | origem própria | [#13](https://github.com/ThiagoPanini/panlabs-docs/issues/13) §2, corrigindo a tinta da [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) |
| Dois papéis de sombra, nomeados por intenção | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — os consumidores de sombra em `src/`, com o cartão de saída. Uma escala de dois não é escala |
| O anel embutido vira borda de verdade | **origem própria (verificação)** | [#55](https://github.com/ThiagoPanini/panlabs-docs/issues/55) — o adaptador alcança `--ifm-*-border-color` em todo componente; anel em `box-shadow` exige sobrescrita por componente |
| `--ifm-global-shadow-md` e `-tl` ao papel flutuante | **origem própria (verificação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — no Infima, `md` é lida por `.dropdown__menu` e `.navbar-sidebar`; `tl` só por uma classe que ninguém usa |
| **`--pd-shadow-sunken` morre; zero sombra no conteúdo** | **herdado** | [#50](https://github.com/ThiagoPanini/panlabs-docs/issues/50) — zero componentes de conteúdo com sombra em seis páginas da âncora; `shadow-md` e maiores existem no CSS dela e nunca são usados. Afundar era relativo ao cartão |
| **`--ifm-global-shadow-lw` e `--ifm-alert-shadow` em `none`** | **origem própria (verificação)** | [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60), com uma **correção medida**: a decisão nomeava `.card` do Infima como leitor de `lw`, e este site não renderiza `.card` nenhum. Os leitores vivos são `CodeBlock/Container` e `BackToTopButton` |
| O botão de voltar ao topo recupera a sombra em `chrome.css` | **origem própria (consequência)** | ele é chrome flutuante pela mesma definição que classifica o dropdown e a gaveta, e o gancho é `ThemeClassNames` — nenhuma exceção nova no adaptador |
| `--pd-shadow-cast` como par declarado | herdado | [#13](https://github.com/ThiagoPanini/panlabs-docs/issues/13) §2 — derivá-lo sai ajuste de curva com literais mágicos |
| **O segundo seletor do bloco escuro saiu, e a camada 3 ficou vazia** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — a ilha era hospedada só pela landing; o mecanismo fica registrado em §6 como especificação do que precisaria voltar |
| **A segunda âncora de `contraste.mjs`** | **origem própria (implementação)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — sozinho, `:root {` abre quatro blocos, e casar só o seletor mediria a camada errada em silêncio |
| Paleta de sintaxe, 14 hex | **origem própria (medição)** | [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) — a âncora foi medida e revelou não-decisão; ver [`principios.md`](principios.md) §5.3. A semeadura anterior vinha do Neon, que não é âncora e não doa valor |
| O cyan no identificador, e `constant` como vizinho | **origem própria (medição)** | [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) — pintar o dominante de cyan mataria a distinção de tipo, que é a função da cor no código |
| O cyan é **skin fixa**, fora da superfície de troca | origem própria | [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) — precedente dos quatro `--pd-hue-*`: o corporativo redesenha, não re-marca |
| Teto de croma 0,095 | **origem própria** | [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) — é o teto do par da âncora puxado para baixo por julgamento, e não uma medida |
| Shim de config que só referencia token | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §2 |
| Quatro matizes de estado | **herdado** | [#83](https://github.com/ThiagoPanini/panlabs-docs/issues/83) — ícone dos callouts `Note`/`Warning`/`Tip`/`Danger` medido em mintlify.com/docs (Chrome headless, `getComputedStyle`), sRGB convertido para H de OKLCH. `success` e `danger` já batiam com o ângulo anterior a menos de 1,5°; `info` e `warn` divergiam ~20° e passaram a ser o ângulo medido |
| `Livre` dos matizes move ângulo, não tom | origem própria | [#31](https://github.com/ThiagoPanini/panlabs-docs/issues/31) §3, corrigindo a redação da [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) |
| Fórmula de preenchimento de callout | herdado | [#4](https://github.com/ThiagoPanini/panlabs-docs/issues/4) — medida na Perplexity |
| Fórmula de **aresta** de callout, e ela mora na camada 2 | herdado + origem própria (implementação) | [#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15) trava 30%/25%; o alfa bifurca por modo, e camada 2 é o único lugar onde modo diverge |
| `--pd-card-min` derivado da medida de prosa | herdado | [#28](https://github.com/ThiagoPanini/panlabs-docs/issues/28) §2 — o limiar `@2xl` da âncora a três colunas; 42rem e a medida de prosa são o mesmo `max-w-2xl` |
| `secondary` deixa de ser "o que a `note` consome" | **origem própria (correção)** | o callout ganhou DOM próprio no slice do catálogo, e `note` é a variante azul — quem é neutro é `info` ([#15](https://github.com/ThiagoPanini/panlabs-docs/issues/15)) |
| Escala de espaço base 4 | **origem própria (medição)** | [#83](https://github.com/ThiagoPanini/panlabs-docs/issues/83) — `--spacing: .25rem` medido idêntico nas sete, inclusive as três que não são Mintlify. Não é decisão da âncora: é o default do Tailwind CSS v4, que as sete rodam por baixo. Convergência de ferramenta, não de sistema de design — por isso não sobe a `herdado` |
| Nomes de tipografia | origem própria | [#31](https://github.com/ThiagoPanini/panlabs-docs/issues/31) §1 — nomear é nosso; a gramática de camada é da [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) |
| Degraus `xs…4xl` e os valores | herdado | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §6 — medido nos quatro |
| Degrau do título em 996/997 | **lacuna por restrição** | [#55](https://github.com/ThiagoPanini/panlabs-docs/issues/55) — o par 30/36 é medido; o ponto de troca é o limiar que o Docusaurus não deixa mover sem `unsafe` |
| Inter / Paper Mono auto-hospedadas, com versão fixada | herdado | [#72](https://github.com/ThiagoPanini/panlabs-docs/issues/72) — é a tipografia da âncora, e o `paperMono` dela é OFL 1.1 da Paper Design, não face própria |
| As quatro variantes de caractere da Inter | herdado | [#72](https://github.com/ThiagoPanini/panlabs-docs/issues/72) — verbatim no CSS servido pela âncora |
| Dois arquivos de fonte, não quinze | **origem própria (verificação)** | [#72](https://github.com/ThiagoPanini/panlabs-docs/issues/72) — a contagem da âncora é subconjunto por script para tráfego global |
| `hyphens: none`, `text-wrap: pretty` | origem própria | [#12](https://github.com/ThiagoPanini/panlabs-docs/issues/12) §6 — pt-BR; nenhuma referência medida nesse eixo |
| Escala de duração e as duas curvas | herdado | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §1 — medidas nas sete |
| `--pd-move-enter` na parada curta | herdado (correção) | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) corrigindo a [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) |
| Dois níveis de latitude | mecanismo emprestado | [#31](https://github.com/ThiagoPanini/panlabs-docs/issues/31) §3 — a distinção é da [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11), aqui vira regra |
| Dimensões do chrome no arquivo de tokens | herdado | [#14](https://github.com/ThiagoPanini/panlabs-docs/issues/14) §5 — a anatomia é de `chrome.md` |
| **`--pd-type-6xl` saiu, e a escala termina no `4xl`** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — o único consumidor era o título do hero; degrau de display não é elo de família, então não fica como órfão declarado. Terceira decisão sobre o mesmo degrau: 48, 60, nenhum |
| O `5xl` sai da escala | **origem própria (correção)** | [#80](https://github.com/ThiagoPanini/panlabs-docs/issues/80) — ele foi dimensionado para um hero de 672, e com o hero no container ficaria sem consumidor |
| `--pd-glow` a 30%, e `--pd-glow-2` cyan a 24% — **removidos** | **origem própria (correção)** + origem própria | [#73](https://github.com/ThiagoPanini/panlabs-docs/issues/73) escreveu o par supondo 0,30 na origem; o publicado era 12%, e sem a figura a luz carregava o hero sozinha. Os dois saíram na [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) |
| A medida do código morre; os dois consumidores citam a de prosa | **origem própria (implementação)** | [#56](https://github.com/ThiagoPanini/panlabs-docs/issues/56) — a derivação era o interior do cartão, e sem cartão sobraria um 768 sem raiz |
| Par de amplitude do glow, no escopo da ilha — **removido** | origem própria | [#17](https://github.com/ThiagoPanini/panlabs-docs/issues/17) §5b — amplitude era par declarado sobre o alfa, não número novo; saiu na [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) com a regra que a hospedava |
| **Os três movimentos da ilha ficam declarados sem consumidor** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — o vocabulário de motion é fechado pelo portão 2, e nome que sai é número cravado que volta |
| **`--pd-accent-contrast` fica declarado sem consumidor** | **origem própria (consequência)** | [#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94) — o único era o texto do botão primário da landing; papel semântico é família declarada nos dois modos |
| Regra de elemento no bloco `reduce`, com gancho `data-pd-part` | **origem própria (implementação)** | ADR 3 — de `tokens.css` não há seletor que alcance uma classe hasheada, e nome de `@keyframes` não sobrevive dentro de custom property ([`motion.md`](motion.md) §6) |
| Portão de `grep` de literal | origem própria | [#11](https://github.com/ThiagoPanini/panlabs-docs/issues/11) §7 |
| Espelho verificado por script | origem própria | consequência da regra de fonte única da [#9](https://github.com/ThiagoPanini/panlabs-docs/issues/9) |
| Aviso do `postcss-calc` sobre cor relativa | **origem própria (implementação)** | observado ao rodar o build do slice 1; valor emitido conferido byte a byte |
| `--pd-surface-scrim`, par declarado | **origem própria** | não há medição de véu nas referências. A opacidade bifurca por motivo mecânico: no escuro a página já está na parada 950, e no claro o mesmo alfa faria buraco em vez de profundidade ([`busca.md`](busca.md) §5.3) |
| `--pd-busca-height` como token de camada 1 | **origem própria (correção)** | `dvh` não está no padrão do portão 1, e o literal passaria pela varredura — fechar o buraco custa uma linha aqui |
| A largura do modal de busca **não** vira token | **origem própria (implementação)** | é `--pd-prose-width`, citada por nome; nomeá-la de novo criaria segunda cópia do mesmo número |
