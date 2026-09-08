---
title: O modelo de desenvolvimento com IA das skills do Matt Pocock
description: Como um conjunto de vinte e cinco skills transforma conversa em issue, issue em ticket e ticket em pull request, demonstrado no repositório deste site.
date: 2026-09-07
tags: [ai, claude-code, skills, panlabs-docs]
authors: thiago
---

Faz um tempo que eu parei de pedir para um agente "implementar" alguma coisa
a partir de uma conversa solta. O fluxo hoje é outro: eu converso até a
decisão ficar de pé, publico a decisão numa issue, fatio a issue em tickets e
só então solto um agente por ticket. O agente não decide nada grande, e eu
não escrevo quase nenhum código.

Esse fluxo não é invenção minha. Ele vem de um conjunto de skills escrito pelo
Matt Pocock, e este acervo inteiro é construído com ele. A demonstração deste
artigo é o próprio blog que você está lendo: ele nasceu por esse caminho, e a
spec, os tickets e os pull requests estão abertos no GitHub.

:::note
Tudo aqui foi lido do conjunto instalado na minha máquina, em
`~/.claude/skills/`. Nenhum `SKILL.md` dele escreve o endereço público de onde
o conjunto veio, então esse endereço não aparece neste artigo. Para reproduzir,
instale o conjunto e leia os arquivos, que foi o que eu fiz para escrever isto.
:::

## Uma skill é uma pasta com instruções

Mecanicamente, uma skill é uma pasta com um arquivo `SKILL.md` dentro. O front
matter carrega `name` e `description`, e o corpo é prosa que o agente passa a
seguir quando a skill entra em jogo. Algumas trazem arquivos irmãos que o corpo
aponta e o agente só abre quando precisa, como o `tests.md` e o `mocking.md` da
`tdd`.

Você invoca uma skill digitando `/nome`. E vale entender uma distinção que o
conjunto leva a sério: nem toda skill pode ser invocada pelo agente.

Onze das vinte e cinco não têm restrição, e o agente alcança sozinho quando a
situação pede. São as que funcionam como referência viva, como a `grilling`, a
`tdd` e a `code-review`.

As outras catorze carregam `disable-model-invocation: true` no front matter, e
só rodam se você digitar: `to-spec`, `to-tickets`, `implement`, `triage`,
`wayfinder` e `handoff` estão todas nessa lista. Não é detalhe de
configuração, é a arquitetura da coisa. Publicar uma spec, cortar tickets e
abrir um pull request têm consequência fora da conversa, e o conjunto decidiu
que começam por uma tecla sua.

## O que o agente apura, e o que você decide

A divisão de trabalho está escrita na `grilling`, e é a frase que mais mudou o
meu jeito de trabalhar:

> Finding facts is your job, never the user's. [...] The decisions are the
> user's.

Traduzindo: o agente nunca deve perguntar quantos registros o índice de busca
tem ou se o plugin aceita determinada opção. Ele vai lá e mede, despachando um
subagente quando o fato está longe. O que ele pergunta é o que só você pode
responder, e pergunta com uma recomendação em cima.

A segunda peça é onde a decisão fica guardada. Uma conversa some quando a
janela de contexto fecha. Uma issue não. Por isso quase toda skill lê ou
escreve no issue tracker, e é ele, não o histórico do chat, que funciona como
memória do trabalho.

## A instalação e o setup, uma vez por repositório

Instalar é pôr as pastas onde o agente procura por skill. Aqui elas estão em
`~/.claude/skills/`, a pasta do usuário, então valem em qualquer repositório
da máquina. A própria `setup-matt-pocock-skills` conta com isso: ela decide se
pula a pergunta dos labels checando se existe uma pasta `triage` ao lado da
dela.

O setup roda uma vez por repositório, e não é um script determinístico:
explora, apresenta o que achou, confirma com você e só então escreve.

A exploração é conhecida: `git remote -v`, a existência de `AGENTS.md` e
`CLAUDE.md`, um `CONTEXT.md` na raiz, `docs/adr/`, e sinais de monorepo. Depois
vêm até três perguntas, cada uma já com a resposta recomendada na frente. A
skill pula a que a exploração já resolveu:

<Steps>
  <Step title="Onde as issues vivem" icon="inbox">
    GitHub pela CLI `gh`, GitLab pela `glab`, markdown local em `.scratch/`,
    ou um tracker descrito por você em um parágrafo.
  </Step>

  <Step title="O vocabulário de triagem" icon="list-checks">
    Os cinco papéis canônicos são `needs-triage`, `needs-info`,
    `ready-for-agent`, `ready-for-human` e `wontfix`. Você mantém os nomes ou
    mapeia para os labels do seu tracker.
  </Step>

  <Step title="Onde a documentação de domínio mora" icon="book-open">
    Contexto único, com um `CONTEXT.md` e `docs/adr/` na raiz, é o padrão.
    Multi-contexto só entra em jogo se a exploração achou monorepo.
  </Step>
</Steps>

No fim ela escreve `docs/agents/issue-tracker.md`, `docs/agents/domain.md` e
`docs/agents/triage-labels.md`, mais um bloco `## Agent skills` no `CLAUDE.md`
ou no `AGENTS.md`, o que já existir.

Aqui as respostas foram GitHub pela `gh`, vocabulário canônico sem apelido
nenhum, e contexto único. É por isso que um agente que chega neste repositório
sabe, sem perguntar, o que "publicar no issue tracker" quer dizer. O arquivo
sai do modelo que a própria skill carrega, um por tracker:

<CodeGroup>

```bash title="GitHub"
gh issue create --title "..." --body "..."
```

```bash title="GitLab"
glab issue create --title "..." --description "..."
```

</CodeGroup>

O arquivo é seu depois de escrito: aqui o corpo multi-linha passou a ir por
`--body-file`, no lugar do heredoc do modelo.

:::tip
Este repositório tem um quarto arquivo em `docs/agents/`, o `workflow.md`, que
a skill não escreve. Ele começa avisando isso, e diz que se contradisser uma
skill, a skill ganha.
:::

## O pipeline, etapa a etapa

O caminho que quase todo trabalho percorre tem seis paradas. A demonstração é
real: cada link abre o artefato correspondente deste repositório.

<Steps>
  <Step title="Grilling: a conversa que fecha as decisões" icon="messages-square">
    Duas portas levam ao mesmo lugar. `/grill-with-docs` roda junto com a
    `domain-modeling` e deixa rastro no glossário e nos ADRs; `/grill-me` é a
    mesma entrevista sem rastro.

    Ela acontece em **rodadas**. O agente monta uma árvore de decisões e
    pergunta de uma vez toda a **fronteira**, as decisões cujos pré-requisitos
    já estão resolvidos. Cada pergunta sai numerada, com a recomendação do
    agente logo abaixo:

    ```
    ❓ **Q1** - **<título da pergunta>**: <corpo da pergunta>

    ➡️ <a resposta que o agente recomenda>
    ```

    Isso muda a sua participação: você não escreve a decisão, ratifica ou
    veta. Dá para responder uma rodada inteira com "sigo as recomendações,
    exceto a 3 e a 15". A sessão termina quando a fronteira esvazia, e o agente
    não age até você confirmar.
  </Step>

  <Step title="/to-spec: a conversa vira uma issue" icon="file-text">
    A `to-spec` não entrevista ninguém: ela sintetiza o que já está na
    conversa. Antes de escrever, esboça as **costuras** onde a feature vai ser
    testada, prefere costura existente a costura nova, e confere com você.

    A spec sai num formato fixo, de Problem Statement a Further Notes, e é
    publicada como issue com o label `ready-for-agent`. As decisões de
    implementação não citam caminho de arquivo nem trecho de código, porque
    esses envelhecem rápido.

    A spec deste blog é a issue [O Blog nasce como quinta aba, e não é uma
    instância de docs](https://github.com/ThiagoPanini/panlabs-docs/issues/194),
    com dezessete subdecisões numeradas, uma por pergunta que a rodada de
    grilling fechou. A da landing deste site, já encerrada, é a issue [A landing
    volta, e a raiz deixa de ser um
    salto](https://github.com/ThiagoPanini/panlabs-docs/issues/191).
  </Step>

  <Step title="/to-tickets: a spec vira fatias verticais" icon="scissors">
    Uma spec inteira não cabe numa sessão. A `to-tickets` corta em **tracer
    bullets**: cada fatia atravessa todas as camadas, é demonstrável sozinha, e
    cabe numa janela de contexto nova. Fatia horizontal, de uma camada só, é o
    que ela evita.

    Cada ticket declara as arestas de bloqueio. A skill mostra a proposta
    numerada, pergunta se a granularidade e as arestas estão certas, e itera
    até você aprovar. Só então publica, em ordem de dependência. Aqui a
    fronteira aparece na interface do GitHub sem convenção de texto nenhuma.

    Foi assim que a spec do blog virou quatro tickets: [o blog
    nasce](https://github.com/ThiagoPanini/panlabs-docs/issues/195), sem
    bloqueio, e depois [as páginas
    próprias](https://github.com/ThiagoPanini/panlabs-docs/issues/196), [busca
    e `llms.txt`](https://github.com/ThiagoPanini/panlabs-docs/issues/197) e
    [este artigo que você está
    lendo](https://github.com/ThiagoPanini/panlabs-docs/issues/198), os três
    bloqueados apenas pelo primeiro.

    Ligar as arestas é um segundo passe, por um motivo mecânico: uma issue
    precisa existir para ser referenciada. A `to-tickets` só manda usar a
    relação nativa do tracker; quem carrega o comando é o arquivo que o setup
    escreveu, e ele pede o `id` interno da issue, nunca o número:

    ```bash
    gh api --method POST \
      repos/<owner>/<repo>/issues/<filho>/dependencies/blocked_by \
      -F issue_id=<id-do-bloqueador>
    ```
  </Step>

  <Step title="/implement: o ticket vira código" icon="hammer">
    O arquivo da `implement` tem quinze linhas, e cabe nelas o ciclo inteiro.
    Implemente o que o ticket descreve, use `/tdd` nas costuras já combinadas,
    rode a checagem de tipos com frequência e a suíte inteira no fim, chame
    `/code-review` e faça o commit.

    A `tdd` que ela dirige tem três regras de laço: vermelho antes de verde,
    uma fatia por vez, e refatoração pertence à revisão. E uma que vale ler
    devagar: **nenhum teste é escrito numa costura que você não combinou
    antes**. É o que faz o esforço cair no caminho crítico em vez de cair em
    toda borda.

    O resto é convenção deste repositório, não da skill: worktree antes da
    primeira edição, `npm run build` antes do primeiro push, pull request em
    rascunho e merge automático no verde.
  </Step>

  <Step title="/code-review: dois eixos que não se contaminam" icon="search-check">
    A revisão roda contra um ponto fixo que você escolhe e dispara **dois
    subagentes em paralelo**.

    O eixo **Standards** pergunta se o código segue os padrões documentados do
    repositório, mais uma linha de base de doze cheiros do Fowler, tratados
    como julgamento e nunca como violação dura.

    O eixo **Spec** pergunta outra coisa: o diff faz o que a issue de origem
    pediu? Ele procura requisito faltando, comportamento que ninguém pediu, e
    requisito que parece implementado mas está errado.

    Os dois relatórios aparecem lado a lado e **não são fundidos nem
    reordenados**: código que segue todo padrão e implementa a coisa errada
    passa num eixo e falha no outro.

    O ticket das páginas próprias deste blog rendeu o exemplo: no celular, o
    sumário tinha virado ausente em vez de recolhido. O build estava verde e o
    código seguia todo padrão da casa, então nada em Standards teria como
    apontar aquilo. O que a issue pedia era recolhido, e essa é a única
    pergunta que o eixo Spec faz.
  </Step>

  <Step title="/triage e /handoff: as duas saídas" icon="flag">
    A `triage` move issues por uma máquina de estados de dois papéis de
    categoria e cinco de estado. Ela vale para o que chega de fora, e só para
    isso: ticket que a `to-tickets` produziu já nasce pronto para agente.

    A `handoff` é para quando a sessão acaba antes do trabalho. Ela compacta a
    conversa num markdown fora do repositório, com uma seção de skills
    sugeridas. A instrução mais importante dela é o que não fazer: não duplicar
    o que já está numa spec, numa issue ou num commit.
  </Step>
</Steps>

## Quando a ideia não cabe numa sessão

<Tabs>
  <TabItem value="grilling" label="/grill-with-docs">

A porta de toda ideia que cabe inteira numa sessão, e a que eu uso em quase
tudo. O que ela cobra é higiene de contexto: grilling, spec e tickets numa
janela só, sem compactar nem limpar no meio, para que os três construam sobre o
mesmo raciocínio. Cada `/implement` depois começa do zero, lendo só o ticket.

  </TabItem>
  <TabItem value="wayfinder" label="/wayfinder">

Para o esforço grande demais, em que o caminho até o destino ainda não é
visível. Ela carta um **mapa** no issue tracker e pendura nele **tickets de
decisão**, um por pergunta que precisa fechar antes de alguém construir.

O que ainda não dá para especificar fica numa seção de névoa de guerra, e
gradua em ticket conforme as decisões anteriores fecham. Quando a névoa acaba,
o mapa não constrói: ele entrega em `/to-spec`.

  </TabItem>
</Tabs>

## As skills de apoio, e quando usar cada uma

O pipeline acima não usa o conjunto inteiro. As que sobram existem para
situações específicas, e a `ask-matt` é o roteador que diz qual delas serve.

| Skill | Quando usar | O que sai |
| --- | --- | --- |
| `/ask-matt` | Você não lembra qual skill serve | O caminho pelas skills, com os desvios |
| `/wayfinder` | Esforço grande demais para uma sessão | Um mapa de tickets de decisão no tracker |
| `/prototype` | A pergunta de desenho não fecha no papel | Código descartável, num branch fora da main |
| `/research` | Falta um fato de fora do diretório | Um markdown com fonte primária citada |
| `/domain-modeling` | Um termo do domínio está frouxo | Glossário afiado, e ADR quando merece |
| `/codebase-design` | A forma do módulo está em jogo | Vocabulário de módulo, costura e profundidade |
| `/diagnosing-bugs` | O bug resiste ao primeiro olhar | Um laço de feedback vermelho, depois a causa |
| `/improve-codebase-architecture` | Sobrou tempo para cuidar da casa | Relatório visual de oportunidades |
| `/resolving-merge-conflicts` | Você já está no meio do conflito | Cada pedaço resolvido por intenção |
| `/to-questionnaire` | O que falta está na cabeça de outra pessoa | Um questionário para ela preencher |
| `/wizard` | O passo só um humano pode dar | Um script bash interativo, estágio a estágio |
| `/writing-for-agents` | Você vai escrever para um agente ler | Regras de ponteiro, hierarquia e poda |
| `/teach` | Você quer aprender um assunto ao longo do tempo | Um workspace de lições e registros |
| `/wait-what` | A última mensagem não desceu | A mesma ideia, redita em inglês técnico simples |

Duas delas mudam mais o resultado do que o nome sugere.

A `diagnosing-bugs` recusa hipótese antes do laço. A fase 1 dela é construir um
comando que já **fica vermelho neste bug**. Se você se pegar lendo código para
montar teoria antes desse comando existir, pare.

A `writing-for-agents` trata da **palavra-guia**, um termo que o modelo já traz
do pré-treino e que ancora um comportamento inteiro em um token só. É por isso
que a `diagnosing-bugs` fala em laço vermelho em vez de "um laço em que você
confia": troca um portão vago por um estado observável.

## O que muda no dia a dia

As rodadas ficam curtas. Eu respondo cinco a quinze perguntas numeradas, quase
sempre ratificando, e a sessão anda sozinha por horas.

A decisão fica escrita. Quando eu esqueço por que o blog não tem página de
autor, a resposta não está na minha memória nem no chat: está numa subdecisão
numerada da issue da spec.

O paralelismo é de verdade. Como cada ticket cabe numa sessão nova e as arestas
de bloqueio são explícitas, mais de uma sessão pega tickets diferentes ao mesmo
tempo. A condição para não quebrar é isolamento: cada sessão entra num worktree
próprio antes da primeira edição.

:::warning
Isolamento não é exclusividade de subagente. Duas sessões de topo no mesmo
clone se atropelam do mesmo jeito, e `git stash` sem pathspec varre tudo que
está sujo na árvore, inclusive o que não é seu.
:::

O portão fica claro. A CI aqui tem um passo só, `npm run build`, e é ele que
decide se o pull request entra. Não existe régua, varredura nem hook de commit,
e o que sobrou de regra de escrita está em prosa no `AGENTS.md` e nos arquivos
de regra ao lado dele.

E o mais desconfortável: você lê muito mais do que escreve. Julgar uma
recomendação, conferir uma medição e vetar uma decisão ruim é trabalho de
leitura, e quem espera pensar menos vai se frustrar.

## Lições deste acervo

Nada aqui vem da skill. São coisas que este repositório aprendeu apanhando, e
que ficaram escritas para não serem aprendidas de novo.

<Steps>
  <Step title="A convenção em português não fecha a issue" icon="milestone">
    O corpo do commit é escrito em português, e uma frase como "Fecha #198" não
    dispara automatismo nenhum do GitHub. Sem o trailer `Closes #198` em
    inglês, a issue continua aberta depois do merge.
  </Step>

  <Step title="Merge sem apagar a branch" icon="split">
    `gh pr merge --auto --squash`, e nunca com `--delete-branch`. A flag troca
    o checkout local para a `main`, que pode estar ocupada por outro worktree.
    No dia em que estiver, o comando falha na etapa local **depois** de o merge
    já ter acontecido no GitHub.
  </Step>

  <Step title="Duas runs vermelhas pela mesma causa, e para" icon="shield-check">
    Sem teto, um agente queima a sessão inteira consertando em laço. Duas
    falhas pelo mesmo motivo dizem que a premissa está errada, não que falta
    mais uma tentativa.
  </Step>

  <Step title="O servidor de desenvolvimento mente sobre link quebrado" icon="microscope">
    `onBrokenLinks: 'throw'` não roda em `docusaurus start`, que devolve 200
    para qualquer rota. Link quebrado só aparece no build, e é por isso que o
    build vem antes do primeiro push.
  </Step>
</Steps>

## Por onde começar

O menor caminho completo é este: instale o conjunto, rode
`/setup-matt-pocock-skills` uma vez, e leve uma ideia pequena por
`/grill-with-docs`, `/to-spec`, `/to-tickets` e `/implement`, sem pular a
revisão no fim. A ideia pequena importa: a mecânica se aprende mais rápido num
assunto cuja spec cabe numa tela.

<CardGroup>
  <Card title="Por que este acervo ganhou um blog" icon="newspaper" href="/blog/por-que-este-acervo-ganhou-um-blog">
    A nota curta que abriu a quinta aba, escrita no ticket anterior a este.
  </Card>

  <Card title="Smart zone" icon="compass" href="https://www.aihero.dev/ai-coding-dictionary/smart-zone">
    O verbete que a `ask-matt` linka para nomear até onde uma sessão ainda
    raciocina com nitidez, e que a higiene de contexto respeita.
  </Card>
</CardGroup>
