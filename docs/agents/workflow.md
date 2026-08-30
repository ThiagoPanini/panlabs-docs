# Fluxo de desenvolvimento

> **Extensão local.** Este arquivo não vem da skill que criou os outros de `docs/agents/` — ela escreve `domain.md`, `issue-tracker.md` e `triage-labels.md`, e mais nada. O que está aqui é convenção deste repo, e se contradiz uma skill, a skill ganha.

## Do problema à execução

```
/wayfinder  →  /to-spec  →  /to-tickets  →  implementação  →  PR  →  merge no verde
```

Uma decisão grande demais para uma sessão vira **mapa** de wayfinding, resolvido um ticket de decisão por vez. Um mapa fechado vira **spec**. Uma spec vira **tickets** com arestas de bloqueio declaradas.

## O que a máquina cobra

**Uma coisa: `npm run build`.** É o único passo da CI, e é o que o check `gate` reporta.

Não há portão, régua, varredura nem hook de commit — eles existiram, e saíram. O que sobrou de regra de escrita está em prosa no `AGENTS.md` e nas regras em `.claude/rules/`, sem cobrança automática, e é por isso que precisa estar escrito.

O build é o que pega link quebrado: `onBrokenLinks: 'throw'` não roda em `docusaurus start`, que devolve 200 com o shell da SPA para qualquer rota.

## Modo de implementação autônoma

A frase **`implementa as issues`** liga este modo, e o ciclo fecha sem passo humano no meio: branch, commit, push, PR, merge, site publicado.

**O que o torna seguro não é a disciplina do agente, é o ruleset da `main`** — `bypass_actors` vazio e o check `gate` obrigatório. A `main` não aceita push direto de ninguém, inclusive do dono, porque em modo autônomo o agente empurra com a credencial do dev e bypass com o nome dele seria bypass para o agente.

**Mais de uma sessão autônoma pode estar ativa ao mesmo tempo contra o mesmo clone** — issues `ready-for-agent` são pegas em paralelo, sem fila que serialize quem pega o quê. Sem isolamento, a segunda sessão a rodar `git checkout` ou `git stash` no diretório principal atropela o trabalho não commitado da primeira: `git stash` sem pathspec varre tudo que está sujo na árvore, não só o da sessão que o rodou, e carimba a entrada com a mensagem de quem rodou — escondendo de quem olha depois que ali tem arquivo de outra sessão. **Toda sessão entra em worktree antes da primeira edição de arquivo, e é lá que a branch dela mora** — isolamento não é exclusividade de subagente, é de qualquer sessão que compartilha o clone com outra. A pilha de `git stash`, porém, é do clone inteiro, não de um worktree: mesmo isolada, uma sessão não deve rodar `git stash` bruto — um commit de WIP é reversível do mesmo jeito e não depende de nenhuma outra sessão respeitar o isolamento.

1. **Colete as issues abertas, sem bloqueio pendente.** Issue com dependência aberta não entra na fila.
2. **Uma branch `feature/<slug-em-inglês>` por slice, dentro do worktree da sessão** (`.claude/worktrees/`). Inglês só no que a máquina casa — nome de branch, de check, de diretório; pt-BR em tudo que humano lê. A `main` nunca mora em worktree.
3. **Antes do primeiro push, rode `npm run build`.** É a CI inteira; se ele passa local, passa lá.
4. **Commit em pt-BR, com o trailer `Closes #N` em inglês.** A convenção pt-BR do corpo não dispara o automatismo do GitHub; sem o trailer a issue fica aberta.
5. **Push, e abra o PR `--draft` no primeiro push**, com a guarda `gh pr list --head "$BRANCH" --state open`. `gh pr create` **não é idempotente**: sem a guarda, vários pushes viram vários PRs.
6. **Ao terminar, escreva o corpo em pt-BR e rode `gh pr ready`.** O corpo se escreve **no fim, por quem tem o ticket na mão** — não no começo, por quem só tem o diff.
7. **`gh pr merge --auto --squash`, sem `--delete-branch`.** A flag troca o checkout para a `main`, e a `main` pode estar ocupada por outro worktree — o dia em que estiver, o merge falha na etapa local depois de já ter acontecido no GitHub. Quem apaga a branch é o `delete_branch_on_merge` do repositório.
8. **Duas runs vermelhas pela mesma causa: pare e reporte.** Sem teto, o agente queima a sessão consertando em loop.

**Nenhum workflow abre PR**, e o motivo é mecânico: PR criado com `GITHUB_TOKEN` **não dispara** outros workflows, então a CI não rodaria e o required check nunca reportaria.
