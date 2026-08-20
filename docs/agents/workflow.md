# Fluxo de desenvolvimento

## Do problema à execução

```
/wayfinder  →  /to-spec  →  /to-tickets  →  implementação  →  worktree  →  PR  →  merge no verde
```

Uma decisão grande demais para uma sessão vira **mapa** de wayfinding, resolvido um ticket de decisão por vez. Um mapa fechado vira **spec**. Uma spec vira **tickets** com arestas de bloqueio declaradas.

## O mapa deste repo NÃO carrega execução

O mapa que originou este repo segue o **padrão do wayfinder**: ele decide, não constrói. O destino dele é a spec de documentação — `docs/design/` mais os ADRs — no nível em que um agente consegue implementar sem reinterpretar.

A construção do site Docusaurus é trabalho **posterior ao mapa**, disparado por `/to-tickets` sobre a spec fechada.

## Portões

São **sete**, todos de custo zero em dependência, e cada um nasce no slice que cria a superfície que ele protege — nenhum é bolado no fim. Os que já existem:

> **Correção de contagem, registrada duas vezes.** A redação original dizia **seis**, e já estava vencida quando o slice 6 fechou: viraram **oito** com o portão 8, o da landing. **São sete** desde que a landing saiu ([#94](https://github.com/ThiagoPanini/panlabs-docs/issues/94)) e levou o portão que só ela ativava. A segunda correção não desfaz a primeira — o seis nunca descreveu o repo com a landing dentro. E o número 8 **não se reaproveita**: os sete que ficam vão de 1 a 7, e nenhum é renumerado, porque o ADR 5 cita o portão 5 pelo número.

| # | Portão | Comando | Cadência |
| ---: | --- | --- | --- |
| 1 | literal de cor, comprimento, tempo ou curva fora do arquivo de tokens **e** limiar de media query fora do único do projeto | `npm run portao:1` | commit |
| 2 | `transition:`/`animation:` com duração ou curva cravada | `npm run portao:2` | commit |
| 3 | `outline` fora do arquivo de foco | `npm run portao:3` | commit |
| 6 | três `curl` contra a URL pública — rota, `.md` e forma com barra | `npm run portao:6` | implantação |

Os outros três nasceram depois e rodam na mesma CI: 4 (contagem de conteúdo), 5 (a referência gerada — regenera e diffa) e 7 (`swizzle --list` congelado). **Havia um quarto**, o 8 — a lista fechada de seis efeitos da landing —, e ele morreu com a página que cobrava.

Duas verificações **não** são portão e rodam junto no CI: o espelho de `tokens.md` (`node scripts/espelho-tokens.mjs --verificar`) e a bijeção do manifesto de ícones (`npm run icones`). Elas não protegem uma regra de escrita — conferem que duas cópias da mesma verdade não divergiram.

**Os três de commit varrem declaração, não prosa:** comentário sai antes da varredura. Portão que reprova por causa de um comentário ensina a escrever comentário pobre.

## Modo de implementação autônoma

A frase **`implementa as issues`** liga este modo. Reuse a string exata: o hook `~/.claude/hooks/context-economy-injector.py` casa `/implement`, `implementa as issues` e `implemente as issues`, e o marker `.claude/context-economy-protocol.md` existe neste repo — o protocolo de economia de contexto entra junto, de graça.

O modo fecha o ciclo inteiro sem passo humano no meio: branch, commit, push, PR, merge, site publicado. **O que o torna seguro não é a disciplina do agente, é o ruleset da `main`** — `bypass_actors` vazio, o check `gate` required e `strict` ligado. A `main` não aceita push direto de ninguém, inclusive do dono, porque em modo autônomo o agente empurra com a credencial do dev e bypass com o nome dele seria bypass para o agente.

1. **Colete as issues abertas, sem bloqueio pendente.** Issue com dependência aberta não entra na fila.
2. **Uma branch `feature/<slug-em-inglês>` por slice.** Inglês só no que a máquina casa — id de job, nome de check, branch, diretório; pt-BR em tudo que humano lê. **Worktree é para subagente**, aninhado em `.claude/worktrees/`, e **nunca um worktree por PR**: o portão 4 crava a contagem de página, e dois PRs somando uma página cada passam sozinhos e quebram juntos depois do merge. A `main` nunca mora em worktree.
3. **Antes do primeiro push, rode a lista da CI**, não `npm run portoes`. O bundle roda cinco dos sete portões e nenhuma das outras réguas. **Verde no bundle não é verde na CI**, e a lista não se transcreve para cá: a régua é `.github/workflows/ci.yml`, e uma segunda cópia dela seria mais uma verdade para divergir em silêncio.
4. **Commit em pt-BR, com o trailer `Closes #N` em inglês.** A convenção pt-BR do corpo não dispara o automatismo do GitHub; sem o trailer a issue fica aberta. `--no-verify` é permitido — **o hook local é o atalho, não o portão**.
5. **Push, e abra o PR `--draft` no primeiro push**, com a guarda `gh pr list --head "$BRANCH" --state open`. `gh pr create` **não é idempotente**: sem a guarda, vários pushes viram vários PRs.
6. **Ao terminar, escreva o corpo em pt-BR e rode `gh pr ready`.** O corpo é escrito **no fim, por quem tem o ticket na mão** — não no começo, por quem só tem o diff.
7. **`gh pr merge --auto --squash`, sem `--delete-branch`.** A flag troca o checkout para a `main`, e a `main` pode estar ocupada por um worktree de subagente — o dia em que estiver, o merge falha na etapa local depois de já ter acontecido no GitHub. Quem apaga a branch é o `delete_branch_on_merge` do repositório.
8. **Duas runs vermelhas pela mesma causa: pare e reporte.** Sem teto, o agente queima a sessão consertando em loop.

**O hook local é opt-in, por `git config core.hooksPath githooks`**, e os worktrees o herdam. Ele roda os três portões de commit e nada além (~2s). Que ele seja pulável não abre buraco nenhum: quem barra é o ruleset, e **ruleset não tem `--no-verify`**.

**O que este modo não faz, e por quê.** Nenhum workflow abre PR — PR criado com `GITHUB_TOKEN` **não dispara** outros workflows, então a CI não rodaria e o required check nunca reportaria. E não há PR paralelo: o custo é o portão 4 acima, mais a mesma classe de arquivo de contagem em `scripts/paridade-abertas.txt`, `scripts/swizzle-list.txt` e o espelho de tokens.
