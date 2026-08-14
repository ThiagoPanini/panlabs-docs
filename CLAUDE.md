# shinydoc-docusaurus

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
| issue, sub-issue, dependência, label | `docs/agents/issue-tracker.md` § Convenções, § Wayfinding operations |
| índice da spec, os sete portões, as invariantes | `docs/design/README.md` § 3. O índice, § 5. Os sete portões |
| árvore, abas, tipo de página, heading, locale | `docs/design/informacao.md` § 3. A árvore, § 6. Tipos de página, § 8. Locale |
| cor, medida, tempo, curva, rampa, contraste | `docs/design/tokens.md` § 1. As três camadas, § 10. Contraste verificado |
| navbar, sidebar, TOC, footer, tela estreita | `docs/design/chrome.md` § 3. Navbar, § 4. Sidebar, § 9. Tela estreita |
| ícone — manifesto, orçamento, onde é obrigatório | `docs/design/icones.md` § 5. O manifesto, § 8. Onde é obrigatório |
| swizzle — a escada, o ledger, o que o muda | `docs/design/swizzle.md` § 3. O ledger, § 6. O que muda o ledger |
| foco, `outline`, skip link | `docs/design/foco.md` § 3. O mecanismo é `outline` |
| o que anima, o que nunca anima, reduced-motion | `docs/design/motion.md` § 2. O que anima, § 4. O que nunca anima |
| busca — índice, pontuação, modal | `docs/design/busca.md` § 2. O índice, § 3. A escada de pontuação |
| referência gerada, contrato de assinatura | `docs/design/referencia.md` § 5. O gerador e o contrato |
| âncora visual, classes de procedência | `docs/design/principios.md` § 5. As cinco classes de procedência |
| por que uma decisão é o que é | `docs/adr/` — um arquivo por decisão, índice em `docs/adr/README.md` |

O método de achar dentro de um arquivo: as seções são numeradas e o título diz o assunto — `grep -n '^## ' <arquivo>` devolve o sumário por menos que uma leitura.

## Pegadinhas — verificadas nesta máquina

- **`npm run portoes` não é a CI.** Ele roda os portões 1, 2, 3, 4 e 5 (~2,5s medidos aqui). A CI roda também o **portão 7**, `npm test`, `npm run icones`, `node scripts/espelho-tokens.mjs --verificar`, `npm run contraste`, `npm run invariantes`, `npm run build` e `npm run zeros`. Verde no bundle não é verde na CI — antes de propor merge, rode a lista da CI, em `.github/workflows/ci.yml`.
- **Eram oito portões; são sete.** O portão 8 morreu com a landing (#94), e o **número não se reaproveita**: o ADR 5 cita o portão 5 pelo número, e é esse precedente que congela a numeração. `ls scripts/portao-*.sh` devolve 7, de 1 a 7, e o 8 fica vago.
- **`npm run portao:6` falha sozinho, e não é quebra.** Ele exige `<url-base>`: confere as três rotas contra o site publicado, e só roda no `deploy.yml`, depois do deploy.
- **Editou `src/css/tokens.css`? Rode `node scripts/espelho-tokens.mjs --sincronizar`.** O bloco `css` de `docs/design/tokens.md` é espelho byte a byte do arquivo, e a CI reprova a divergência.
- **Editou `contratos/*.json`? Rode `npm run gerar:referencia`.** O portão 5 regenera e reprova em `git diff`. A página gerada nunca se edita à mão.
- **Swizzlou algo novo? Rode `npm run swizzle:congelar`.** O portão 7 confere `src/theme/` contra `scripts/swizzle-list.txt`.
- **Link quebrado só aparece no `build`.** `onBrokenLinks: 'throw'` não roda em `docusaurus start`, que devolve 200 com o shell da SPA para qualquer rota.
- **Nenhuma dependência npm nova.** `npm run zeros` reprova, e é axioma. O `package-lock.json` versionado é a régua.
- **Contagem de página é cobrada.** O portão 4 crava 12 · 19 · 21 nas três abas de `conteudo/`, mais o ramo gerado. Acrescentar página sem acertar o portão reprova.

## Idioma e voz

Prosa deste repo — docs, ADR, issue, commit, PR — em **pt-BR**. O conteúdo mockado também nasce em pt-BR, com EN como segundo locale.

A voz do conteúdo é **`você` + imperativo**, no site inteiro. **Zero primeira pessoa, sem exceção** — o acervo é pessoal pelo que escolhe documentar, não pela gramática. Detalhe em `docs/agents/domain.md` § Vocabulário.
