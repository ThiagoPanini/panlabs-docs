# panlabs-docs

Documentação de referência em Docusaurus. Conteúdo mockado; o produto é **estrutura e customização visual**, para transplante a um ambiente corporativo com Docusaurus obrigatório e espaço de dependências apertado.

## Reconhecimento — leia antes de abrir arquivo

Medido em 33 sessões, no instante da primeira edição: **mediana de 186k tokens**, 80 turnos. Das 29,3 chamadas de `Bash` até lá, **24,8 eram leitura** — 15,2 de `cat`/`sed`/`head`, 9,6 de `gh`. Cada leitura custa o arquivo **mais** o turno que decidiu lê-la.

- **Delegue o reconhecimento a um subagente `Explore`** e trate o digest como orçamento de leitura. Exceção: a tarefa nomeia o arquivo **e** cabe numa função — diga que é o caso e siga.
- **Não leia arquivo com `cat`/`sed`/`head`.** Passa por fora do orçamento. Localize com `grep -n`, leia com `Read` + `offset`/`limit`.
- **Vá pela seção**, não pelo arquivo. `docs/design/tokens.md` passa de 1800 linhas; `informacao.md`, de 550; `docs/design/README.md`, de 450. Nenhum se lê inteiro — a tabela abaixo existe para isso.
- **Issue enxuta:** `gh issue view N --json title,body,labels`. Sem `--comments` salvo necessidade, sem varrer o mapa.

Numa implementação, `.claude/context-economy-protocol.md` entra no contexto com o detalhe.

## Onde está a resposta

| Pergunta | Onde |
| --- | --- |
| vocabulário, axiomas, o que é o projeto | `docs/agents/domain.md` § Vocabulário, § Axiomas |
| como o trabalho anda aqui; o que é portão | `docs/agents/workflow.md` § Do problema à execução, § Portões |
| entregar sozinho: branch, PR, merge; o que a `main` aceita | `docs/agents/workflow.md` § Modo de implementação autônoma |
| issue, sub-issue, dependência, label | `docs/agents/issue-tracker.md` § Convenções, § Wayfinding operations |
| índice da spec, os sete portões, as invariantes | `docs/design/README.md` § 3. O índice, § 5. Os sete portões |
| árvore, abas, tipo de página, heading, locale | `docs/design/informacao.md` § 3. A árvore, § 6. Tipos de página, § 8. Locale |
| o que está pendente e por quê | `docs/design/informacao.md` § 3 (a nota de correção), § 6.4, § 7 |
| cor, medida, tempo, curva, rampa, contraste | `docs/design/tokens.md` § 1. As três camadas, § 10. Contraste verificado |
| navbar, sidebar, TOC, footer, tela estreita | `docs/design/chrome.md` § 3. Navbar, § 4. Sidebar, § 9. Tela estreita |
| ícone — manifesto, orçamento, onde é obrigatório | `docs/design/icones.md` § 5. O manifesto, § 8. Onde é obrigatório |
| diagrama na página — o `import`, a tinta e o nome acessível | `docs/design/componentes/frame.md` § Autoria em MDX, § Light e dark, § A11y |
| swizzle — a escada, o ledger, o que o muda | `docs/design/swizzle.md` § 3. O ledger, § 6. O que muda o ledger |
| foco, `outline`, skip link | `docs/design/foco.md` § 3. O mecanismo é `outline` |
| o que anima, o que nunca anima, reduced-motion | `docs/design/motion.md` § 2. O que anima, § 4. O que nunca anima |
| busca — índice, pontuação, modal | `docs/design/busca.md` § 2. O índice, § 3. A escada de pontuação |
| referência gerada, contrato de assinatura | `docs/design/referencia.md` § 5. O gerador e o contrato |
| âncora visual, classes de procedência | `docs/design/principios.md` § 5. As sete classes de procedência |
| por que uma decisão é o que é | `docs/adr/` — um arquivo por decisão, índice em `docs/adr/README.md` |

O método de achar dentro de um arquivo: as seções são numeradas e o título diz o assunto — `grep -n '^## ' <arquivo>` devolve o sumário por menos que uma leitura.

## Pegadinhas — verificadas nesta máquina

- **`npm run portoes` não é a CI.** Ele roda os portões 1, 2, 3, 4 e 5 (~2,5s medidos aqui). A CI roda também o **portão 7**, `npm test`, `npm run icones`, `node scripts/espelho-tokens.mjs --verificar`, `npm run contraste`, `npm run invariantes`, `npm run build`, `npm run zeros` e `npm run paridade -- --verificar`. Verde no bundle não é verde na CI — antes de propor merge, rode a lista da CI, em `.github/workflows/ci.yml`.
- **Eram oito portões; são sete.** O portão 8 morreu com a landing (#94), e o **número não se reaproveita**: o ADR 5 cita o portão 5 pelo número, e é esse precedente que congela a numeração. `ls scripts/portao-*.sh` devolve 7, de 1 a 7, e o 8 fica vago.
- **`npm run portao:6` falha sozinho, e não é quebra.** Ele exige `<url-base>`: confere as três rotas contra o site publicado, e só roda no `deploy.yml`, depois do deploy.
- **Editou `src/css/tokens.css`? Rode `node scripts/espelho-tokens.mjs --sincronizar`.** O bloco `css` de `docs/design/tokens.md` é espelho byte a byte do arquivo, e a CI reprova a divergência.
- **Editou `contratos/*.json`? Rode `npm run gerar:referencia`.** O portão 5 regenera e reprova em `git diff`. A página gerada nunca se edita à mão.
- **Swizzlou algo novo? Rode `npm run swizzle:congelar`.** O portão 7 confere `src/theme/` contra `scripts/swizzle-list.txt`.
- **Link quebrado só aparece no `build`.** `onBrokenLinks: 'throw'` não roda em `docusaurus start`, que devolve 200 com o shell da SPA para qualquer rota.
- **Nenhuma dependência npm nova.** `npm run zeros` reprova, e é axioma. O `package-lock.json` versionado é a régua.
- **A paridade trava desde a S9-8.** `npm run paridade -- --verificar` reprova quando aparece divergência fora de `scripts/paridade-abertas.txt` **ou** quando uma linha de lá passa a fechar. Mexeu num alvo ou num número medido? Acerte a lista, com o número e o gatilho — o passo já não é `continue-on-error`.
- **Contagem de página é cobrada.** O portão 4 imprime `31 · 4 · 1 · 1 = 37` nas quatro abas de `conteudo/`, na ordem do navbar, e são 33 autorais mais 4 geradas, com Bibliotecas fechando em 26. **O literal que ele confere para `Ferramentas` é 27**, a contagem AUTORAL: a função conta `.md` e o ramo gerado é `.mdx`, somado por fora. Acrescentar página sem acertar os dois números reprova.
- **Diagrama entra como `.drawio.svg` co-locado, entra INLINE, e a varredura de travessão alcança o desenho.** O híbrido é um SVG que carrega o próprio fonte no atributo `content` — o autor edita **ele**, não um `.drawio` à parte, e não existe passo de export. Copie `conteudo/_modelo.drawio.svg` para a pasta da página, desenhe, e chame por `import` mais componente dentro de `<Frame>`, nunca por `![…]()`: `import Fluxo from './x.drawio.svg'` e `<Fluxo role="img" aria-label="<mecanismo>" />`. O `@docusaurus/plugin-svgr` já casa `.svg` com issuer de `mdx`, então o `import` inlina sem configuração nova. A co-locação é o que compra o recarregamento: asset ao lado do markdown é módulo do webpack e a página se atualiza sozinha, enquanto `static/` não recarrega. **A cobrança 14 varre `conteudo/` com `find -type f`, sem filtro de extensão**, então rótulo de diagrama não leva `—`, e cada rótulo é varrido duas vezes, no `<text>` renderizado e no XML embutido. Um desenho por locale: a árvore de `i18n/` também.
- **A cor do `.drawio.svg` NÃO vem do arquivo, vem da página, e isso não é preferência.** O draw.io grava cor em duas camadas: os atributos `fill`/`stroke`, sempre a paleta clara, e um `style=` com `light-dark()`. A segunda só é escrita quando `mxUtils.lightDarkColorSupported` é verdadeiro, e isso é **detecção de recurso na carga** contra o motor CSS do editor — em Chromium anterior ao 123 o salvamento assa a paleta clara e a página escura quebra, sem aviso e sem sintoma no modo claro. Por isso o `componentes.css` casa a camada de **atributo** por seletor e força `currentColor` com `!important`. Mexeu nessas regras? O **portão 1 tem uma perna própria** para elas, com lista fechada na paleta padrão do draw.io; cor fora da lista reprova. **A lista fecha em dois pares porque marca não é tinta**, e não porque cor nomeada saia estável: o `getLightDarkColor` deriva par para ela também (o `#DD344C` do KMS vira `light-dark(rgb(221, 52, 76), …)`). Assar o verde do S3 devolve o verde do S3, e isso basta; preto e branco são tinta e seguem a página. **E o branco só vaza pareado com o traço preto** — branco sozinho é glifo de ícone AWS (`fill="#ffffff" stroke="none"`), e vazar apaga o desenho. Duas otimizações do SVGO ficam **desligadas** no `docusaurus.config.js` por causa disso: `moveElemsAttrsToGroup` (sobe atributo da folha para o `<g>`, e sobe mais no arquivo assado) e `convertColors` (encurta `#000000` para `#000`, e seletor casa string).
- **Rótulo dentro de tag JSX só entra na busca por causa de uma linha.** `src/plugins/busca/index.js` descarta toda tag antes de extrair prosa. A regra que salva o `aria-label` roda **antes** desse descarte. Trocar `![alt](…)` por componente sem ela tira o conteúdo do índice em silêncio, e nenhum teste pega.
- **A árvore foi reconstruída, e a dívida está declarada.** `Jornadas` virou trilha (`Visão Geral` · `Conteúdo Teórico` · `Conteúdo Prático`, sob `API Owner`), e `Procedimentos` e `Times` ficaram numa folha `Work in Progress` cada. Cinco cobranças do portão 4 contam **zero** de propósito: o tipo `Índice de jornada` está pendente, o gabarito `capítulo` está sem sujeito, e o caso `diff` está sem dona. Escrever qualquer um de volta sem tirar o nome da lista de pendentes **reprova**.

## Idioma e voz

Prosa deste repo — docs, ADR, issue, commit, PR — em **pt-BR**. O conteúdo mockado também nasce em pt-BR, com EN como segundo locale.

A voz do conteúdo é **`você` + imperativo**, no site inteiro. **Zero primeira pessoa, sem exceção** — o acervo é pessoal pelo que escolhe documentar, não pela gramática. Detalhe em `docs/agents/domain.md` § Vocabulário.

**Zero travessão no conteúdo publicado.** `conteudo/`, `i18n/` e `contratos/` fecham em zero `—`, e a saída é vírgula, dois-pontos, parênteses ou a frase reescrita, escolhida uma a uma. A cobrança 14 do portão 4 varre as três e reprova apontando arquivo e linha. `docs/` fica de fora, e por decisão: `invariantes.sh` exige o literal `Livre — <dono>` lá dentro.

**A exceção é citação de saída de ferramenta.** Arquivo que declara `{/* cita-saida-de-ferramenta */}` (ou `"citaSaidaDeFerramenta": true`, em `contratos/`) nas 20 primeiras linhas pode ter `—` dentro de cerca de código, na linha `api_exemplos:` de página gerada, ou num valor `"mensagem"`. Fora dessas regiões reprova igual.
