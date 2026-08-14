# Protocolo de economia de contexto — implementação

> Injetado pelo hook `UserPromptSubmit` quando uma implementação começa. É também o **marker** de opt-in: enquanto este arquivo existir, os hooks de economia de contexto ficam ativos neste repo. Sem ele são inertes, e calados.

Você está começando a produzir. A meta é chegar à primeira edição perto do baseline, não em 186k.

Medido em 33 sessões deste repo, no instante da primeira edição de arquivo do repositório: **mediana de 186.463 tokens**, 80 turnos. A repartição diz onde ela nasce — 42,8% raciocínio retido ao longo dos turnos, 16,5% resultado de `Read`, 13,7% resultado de `Bash`. E 24,8 das 29,3 chamadas de `Bash` eram **leitura**: 15,2 de `cat`/`sed`/`head` em arquivo, 9,6 de `gh` em issue. Ler é o que esta sessão faz antes de escrever, e cada leitura custa o arquivo **mais** o turno que decidiu lê-la.

## 1. A primeira ferramenta é `Agent`

Delegue o reconhecimento a um subagente `Explore` com escopo na área tocada. Até o digest chegar, o reconhecimento inteiro é dele — você não abre a árvore, não `cat`, não `grep`.

**Válvula explícita:** quando a issue nomeia o arquivo **e** a mudança cabe numa função ou num bloco, diga em uma linha que é o caso e siga direto. A válvula é para o caso pequeno de verdade, não para o caso que parece pequeno.

Medido: 0,12 subagente por sessão. O reconhecimento roda hoje na janela principal, e é de lá que sai a conta.

## 2. Peça digest de schema fixo, com teto declarado

Peça exatamente isto, e diga o teto em linhas:

1. **Arquivos relevantes** — path + uma linha de por que importa.
2. **O vizinho mais próximo, verbatim** — o arquivo que o código novo vai espelhar (o componente irmão, a regra CSS irmã, a página irmã, o teste irmão), embutido no digest. Ele carrega o código a copiar; assim não custa uma segunda leitura sua.
3. **O padrão a espelhar** — a convenção que o vizinho demonstra.
4. **Os portões e ADR que a área ativa** — quais dos oito reprovam esta mudança, e o que cada um cobra.
5. **Os seams de teste** — `scripts/busca.test.mjs` e `scripts/assinatura.test.mjs` são as duas únicas réguas de `node --test`; o resto do repo é cobrado por varredura.

## 3. O digest é o orçamento de leitura

O vizinho que veio embutido você **não relê** — clona dele. Dos demais, só os que o digest nomeia, e só a fatia que faltou, com `offset`/`limit`.

**Não leia arquivo com `cat`, `sed` ou `head`.** É a maior categoria de `Bash` deste repo (12,8k tokens por sessão) e passa por fora do orçamento — o digest não a vê e a trava de `Read` não a pega. Para localizar, `grep -n` e leia a fatia; para ler, `Read` com `offset`/`limit`.

`docs/design/tokens.md` tem 1829 linhas e `docs/design/landing.md` tem 666. Nenhum dos dois se lê inteiro. Vá pela seção que a tabela do `CLAUDE.md` aponta.

## 4. Issue enxuta

`gh` custa 10,9k por sessão em 9,6 chamadas. Só a issue-alvo, só `title`/`body`/`labels`:

```
gh issue view N --json title,body,labels
```

Sem `--comments` salvo necessidade real, sem issues irmãs, sem varrer o mapa. O mapa de wayfinding é grande, e lê-lo inteiro é meia janela.

## 5. Direto ao portão que reprova

O digest já é o plano — não redija plano em prosa antes de editar. Identifique qual dos oito portões cobra a mudança e rode **só ele** durante o trabalho (`npm run portao:N`, ~0,4s cada). A bateria inteira fica para o fim.

**`npm run portoes` não é a CI.** Ele roda os portões 1, 2, 3, 4, 5 e 8. A CI roda também o portão 7, `npm test`, `npm run icones`, `node scripts/espelho-tokens.mjs --verificar`, `npm run contraste`, `npm run invariantes`, `npm run build` e `npm run zeros`. Verde local no bundle não é verde na CI.

## 6. Narre comprimido

Sua prosa vira input de todos os turnos seguintes — 12,3k por sessão aqui, contra 6,5k no repo de referência. Acione `/caveman` no modo **ultra** para a narração desta implementação. Código, commits, corpo de PR e avisos de risco continuam em prosa normal; só a narração encolhe.

## 7. Nunca releia output cru

`.output` de subagente e dumps de resultado de MCP já viraram digest — não os releia (a trava de `Read` bloqueia). Precisa do conteúdo? Re-consulte a fonte com pergunta dirigida.
