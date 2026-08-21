# panlabs-docs

Projeto de **documentação de referência** construído com Docusaurus.

O conteúdo é mockado e descartável — documenta o `panlabs`, o acervo de aprendizado fictício de um desenvolvedor dentro de uma empresa que nunca é nomeada. O produto é a **estrutura** e a **customização visual**: um boilerplate que mostra até onde dá para levar o Docusaurus sem sair do preset `classic`.

O alvo de replicação é um **ambiente corporativo** onde Docusaurus é obrigatório e o espaço de dependências é apertado. Tudo aqui existe para ser transplantado para lá.

## Estado

**Completo.** O [mapa de wayfinding](https://github.com/ThiagoPanini/panlabs-docs/issues/1) fechou — vinte e sete tickets, sete de pesquisa e vinte de decisão — e o colapso dele numa [spec executável](https://github.com/ThiagoPanini/panlabs-docs/issues/30) partiu o trabalho em **sete slices verticais**. Cada slice entregou uma superfície funcionando *e* o documento de design que a especifica, na mesma sentada.

| Slice | O que entrega | Estado |
| ---: | --- | --- |
| 1 | [Bala traçante](https://github.com/ThiagoPanini/panlabs-docs/issues/34) — o site no ar com o sistema de tokens inteiro | feito |
| 2 | [A página de documentação](https://github.com/ThiagoPanini/panlabs-docs/issues/35) — chrome, ícones, árvore | feito |
| 3 | [O catálogo](https://github.com/ThiagoPanini/panlabs-docs/issues/36) — os componentes de conteúdo | feito |
| 4 | [O conteúdo](https://github.com/ThiagoPanini/panlabs-docs/issues/37) — as páginas autorais e o EN parcial | feito |
| 5 | [A referência gerada](https://github.com/ThiagoPanini/panlabs-docs/issues/38) — contrato, gerador e três colunas | feito |
| 6 | [A landing](https://github.com/ThiagoPanini/panlabs-docs/issues/39) — a ilha de espetáculo | feito, e a página **removida depois** ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) |
| 7 | [Busca e artefatos AI-era](https://github.com/ThiagoPanini/panlabs-docs/issues/40) — e o fechamento da spec | feito |

**O [mapa do `mint`](https://github.com/ThiagoPanini/panlabs-docs/issues/49) está em curso**, e ele reconstrói o site sobre a mesma arquitetura: a skin trocou, a landing foi refeita — e depois removida —, e o Trilho — a API de pagamentos fictícia que ocupava o conteúdo — deu lugar ao `panlabs`. **A referência gerada está no ar**, sobre um contrato de assinatura de função, tipo e módulo: `Ferramentas` fecha em 21. Falta o fecho da spec.

**33 páginas autorais mais 4 geradas em quatro abas** — 37 no total —, mais 31 traduções, busca, artefatos AI-era e dois locales. **A árvore foi reconstruída para conteúdo real:** `Jornadas` deixou de ser narrativa e virou trilha de aprendizado, e `Procedimentos` e `Times` ficaram numa folha de marcador de lugar cada, à espera do conteúdo que sai do ambiente corporativo. O que a poda deixou pendente está declarado por nome em [`docs/design/informacao.md`](docs/design/informacao.md) §3, e o portão 4 cobra cada linha. A rota `/` não é página: ela **redireciona** para `/ferramentas`, a rota nua da primeira aba do navbar. A spec são vinte e nove arquivos mais oito ADRs, e a espinha dela é [`docs/design/README.md`](docs/design/README.md).

> **Correção de contagem.** A landing saiu ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) e levou junto o portão que só ela ativava: **eram oito portões, são sete**, e a spec caiu de **trinta arquivos para vinte e nove**. O número 8 **não se reaproveita** — o ADR 5 cita o portão 5 pelo número, e é esse precedente que congela a numeração dos sete que ficam.

**O axioma 6 foi cobrado, e não só declarado.** O [§6 da espinha](docs/design/README.md) registra o teste de reconstrução: uma sessão de agente limpa, com `docs/design/` e `docs/adr/` e nada mais, reconstruiu a camada de tokens e a página de documentação sobre um Docusaurus vazio. **O build passou nos dois locales.**

O veredito é de três níveis — *sim* na camada de tokens, *sim com ressalvas* no chrome estrutural, *não* no acabamento — e o teste devolveu **quatro erros de fato na spec**, três já corrigidos e um em aberto por precisar de medição. O padrão que ele expôs: a spec é impecável onde descreve mecanismo e derivação declarada, e é muda onde precisaria de um valor que ninguém mediu.

## Rodar

```bash
npm ci
npm start                    # dev — não testa link quebrado nem host
npm run build && npm run serve

npm run portoes              # portões 1 a 5, cadência de commit
npm run portao:7             # o swizzle --list congelado, cadência de upgrade
npm run portao:6 -- <url>    # as três rotas contra o host, cadência de implantação

npm test                     # a régua do algoritmo da busca
npm run invariantes          # as cinco invariantes de forma da spec — 1 a 4 e a 6
npm run zeros                # os cinco zeros, conferidos e não afirmados
npm run icones               # a bijeção manifesto ↔ static/icons/
npm run paridade             # a distância até a âncora, medida no build
npm run paridade -- --verificar   # a mesma, triada contra scripts/paridade-abertas.txt
```

## Onde está o quê

| Caminho | Papel |
| --- | --- |
| [`docs/adr/`](docs/adr/) | Os oito ADRs. **Leitura obrigatória antes de escrever código.** |
| [`docs/design/README.md`](docs/design/README.md) | **A espinha da spec** — ordem de leitura, a régua, o índice, as invariantes e os sete portões. Comece por aqui. |
| [`docs/design/principios.md`](docs/design/principios.md) | A âncora, o carimbo de delta deliberado vazio e as sete classes de procedência. |
| [`docs/agents/`](docs/agents/) | Como um agente trabalha neste repo — tracker, domínio, labels, fluxo. |
| [`docs/research/`](docs/research/) | Índice das sete pesquisas. O material mora em branches `research/*`. |
| `src/css/tokens.css` | **A sede única de valor.** O único arquivo do repo com literal. |
| `src/css/custom.css` | As regras de base. Zero literal, e nunca lê `--ifm-*`. |
| `src/css/chrome.css` | O shell da página de doc — proporções, navbar, sidebar, TOC, footer, estreito. |
| `src/css/foco.css` | O contrato de estado de entrada. **O único arquivo onde `outline` pode aparecer.** |
| `src/icons/manifest.js` | **O contrato de ícones** — 60 nomes, 69 tags, teto 64 e folga quatro. Os desenhos são skin; os nomes não. |
| `src/theme/` | Componente de tema próprio, registro, e o **único swizzle** do projeto — ver `docs/design/swizzle.md`. |
| `src/plugins/` | Os dois plugins de caminho: a busca e os artefatos AI-era. Nenhum é dependência npm. |
| `static/icons/` | Os 60 desenhos vendorizados do Lucide (ISC). Trocáveis. |
| `conteudo/` | O acervo `panlabs`, o conteúdo fictício — `jornadas/`, `procedimentos/`, `ferramentas/`. Fica fora de `docs/`, que é a documentação *deste* repositório. |
| `scripts/` | Os sete portões, o espelho de `tokens.md` e o vendorizador de ícones. |

## Restrições travadas

- **Docusaurus é inegociável** — restrição do ambiente alvo.
- **Vanilla-first** — zero dependências novas: preset `classic`, CSS/CSS Modules, swizzle, MDX.
- **Skin trocável** — o produto é a arquitetura de tokens; a paleta é demonstração.
- **Light + dark**, com dark canônico.
- Conteúdo em **pt-BR**, com EN como segundo locale.

O porquê de cada uma está em [`docs/agents/domain.md`](docs/agents/domain.md) e nos tickets do mapa.
