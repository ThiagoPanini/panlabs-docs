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
4. **Os ADR que a área ativa** — quais das doze decisões governam esta mudança, e o que cada uma trava.
5. **A regra de escrita que a área ativa** — qual arquivo de `.claude/rules/` casa o path tocado (`content/` e `i18n/`, `src/css/`, `src/theme/`), e o que ele pede. Nenhuma delas é cobrada por máquina, então ninguém te avisa se você a quebrar.

## 3. O digest é o orçamento de leitura

O vizinho que veio embutido você **não relê** — clona dele. Dos demais, só os que o digest nomeia, e só a fatia que faltou, com `offset`/`limit`.

**Não leia arquivo com `cat`, `sed` ou `head`.** É a maior categoria de `Bash` deste repo (12,8k tokens por sessão) e passa por fora do orçamento — o digest não a vê e a trava de `Read` não a pega. Para localizar, `grep -n` e leia a fatia; para ler, `Read` com `offset`/`limit`.

Os arquivos longos que sobraram são os ADRs — `docs/adr/0008` passa de 230 linhas, o `0010` de 220. Vá pela seção, não pelo arquivo: `grep -n '^## ' <arquivo>` devolve o sumário por menos que uma leitura.

## 4. Issue enxuta

`gh` custa 10,9k por sessão em 9,6 chamadas. Só a issue-alvo, só `title`/`body`/`labels`:

```
gh issue view N --json title,body,labels
```

Sem `--comments` salvo necessidade real, sem issues irmãs, sem varrer o mapa. O mapa de wayfinding é grande, e lê-lo inteiro é meia janela.

## 5. Não redija plano; rode o build

O digest já é o plano — não redija plano em prosa antes de editar.

**A CI é uma coisa só: `npm run build`.** Não há portão, régua nem varredura para escolher; rode o build antes do push e é isso. Ele leva ~40s, então rode-o **no fim**, não a cada edição.

> **Os portões morreram** ([#154](https://github.com/ThiagoPanini/panlabs-docs/issues/154)), com os 26 scripts que os rodavam e o hook de commit. Se um documento deste repo mandar você rodar `npm run portoes`, `npm run portao:N`, `npm test`, `npm run invariantes`, `npm run zeros`, `npm run icones`, `npm run paridade`, `npm run contraste` ou `espelho-tokens.mjs`, o documento está vencido — nenhum existe. O que sobrou de regra de escrita está em prosa no `CLAUDE.md`, sem cobrança automática.

## 6. Narre comprimido

Sua prosa vira input de todos os turnos seguintes — 12,3k por sessão aqui, contra 6,5k no repo de referência. Acione `/caveman` no modo **ultra** para a narração desta implementação. Código, commits, corpo de PR e avisos de risco continuam em prosa normal; só a narração encolhe.

## 7. Nunca releia output cru

`.output` de subagente e dumps de resultado de MCP já viraram digest — não os releia (a trava de `Read` bloqueia). Precisa do conteúdo? Re-consulte a fonte com pergunta dirigida.
