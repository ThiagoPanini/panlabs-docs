# ADR 11 — A varredura do overpower deixa de ser humana, e o pino é o que a cobra

**Status:** aceito · slice 11 · 2026-08-20 · **garantia de máquina suspensa** · 2026-08-28

> ### A metade que cobra saiu do ar, por decisão — 2026-08-28
>
> **A decisão não muda.** A divisão entre hook (automação) e pino (garantia) continua sendo a leitura certa do problema, e nada aqui diz o contrário. O que sai do ar é só uma das duas metades.
>
> **O que sobrevive:** a metade que trabalha. A skill (hoje [`panlabs-overpower-docs-update`](../../.claude/skills/panlabs-overpower-docs-update/SKILL.md), renomeada depois desta ADR) continua existindo com gatilho humano — pedida quando uma versão nova do `overpower` sai, ou quando alguém pedir a varredura.
>
> **O que morreu:** o pino. `scripts/pino.mjs`, `scripts/pino.test.mjs`, `scripts/pino-overpower.txt` e o passo homônimo do job `gate` saíram do repositório ([issue #149](https://github.com/ThiagoPanini/panlabs-docs/issues/149)). `npm run pino -- --verificar` deixou de existir.
>
> **Por que.** Medido em 80 runs de CI: 73 verdes, 6 vermelhas, 1 cancelada — e das seis reprovações, quatro foram o pino atrasado atrás de uma release do `overpower` que ninguém neste repositório publicou, sem relação nenhuma com o diff do PR em curso. No mesmo período, zero defeito não intencional foi pego por qualquer portão, pino incluído. A decisão é do dono do acervo, registrada na [issue #148](https://github.com/ThiagoPanini/panlabs-docs/issues/148).
>
> **A consequência, dita em voz alta.** Nada mais avisa, de máquina, que a documentação do `overpower` envelheceu. A deriva silenciosa que esta ADR existia para fechar — contrato correto e projeção fiel, ferramenta real já diferente — **volta a ser possível**, exatamente como estava antes desta ADR. Nenhuma substituição foi decidida; o dono declarou que vai pensar nela depois.

## Contexto

A [ADR 9](0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md), consequência 6, registrou uma lacuna e escolheu conviver com ela:

> O contrato passa a poder mentir sobre um programa real. [...] Agora há um binário que pode divergir dele, e **nenhuma máquina deste repositório confere isso** — o portão 5 confere que a página é a projeção do contrato, não que o contrato é a projeção da ferramenta. A varredura fica sendo humana.

A escolha era defensável quando foi feita: o `overpower` acabara de entrar, a #118 varreu tudo à mão, e uma varredura humana recém-feita não parece dívida. **A convivência durou dois dias.**

**A medição, feita em 2026-08-20 contra a `0.27.0` publicada no PyPI:**

A página [`publicacao/changelog.md`](../../conteudo/ferramentas/bibliotecas/overpower/publicacao/changelog.md) abre declarando *"uma entrada por versão publicada"* e a mais recente que ela carrega é a `0.25.1`. Faltavam três versões — `0.25.2`, `0.26.0` e `0.27.0` —, e a última é justamente a que tirou a documentação do repositório da ferramenta e a trouxe para cá. A página que devia registrar a mudança não registrou a própria mudança.

E o defeito que a ADR 9 previu em abstrato aconteceu em concreto. O contrato afirma, sobre a opção `--yes`:

> Num terminal ele tem um segundo efeito que **a ajuda da ferramenta não anuncia**.

Era verdade na `0.25.1`. Na `0.25.2` a ferramenta passou a anunciar exatamente esse efeito, e a frase virou falsa. **O portão 5 continuou verde o tempo todo**, porque ele confere projeção, e a projeção estava perfeita: a página é o espelho fiel de um contrato que mente.

**A varredura humana não falhou por falta de disciplina.** Ela falhou porque o ritmo da ferramenta é outro: o `overpower` publicou trinta e seis versões em vinte e dois dias — contadas nos títulos `## [` do `CHANGELOG.md` dele, entre o primeiro commit em 2026-07-30 e a `0.27.0` —, o que dá uma release a cada quinze horas. Nenhuma cadência humana de conferência acompanha isso, e a que existia era *lembrar*.

## Decisão

**A varredura passa a ser de máquina, em duas metades que não se confundem.**

**A metade que trabalha** é uma skill, [`.claude/skills/varredura-overpower/`](../../.claude/skills/varredura-overpower/SKILL.md). Ela lê a ferramenta, confere as páginas, corrige o que achar e abre PR. Ela é disparada pelo `post-merge` do repositório do `overpower`: quando uma release aterrissa na `main` local, um agente destacado varre daqui. O gatilho é local por escolha — os dois repositórios estão na mesma máquina, o agente empurra com a credencial do dev, e a CI deste repositório acorda normalmente. Um workflow não poderia: PR aberto com `GITHUB_TOKEN` não dispara outros workflows, então o `gate` nunca reportaria e o PR nunca seria mergeável. Esse fato já estava escrito no [`workflow.md`](../agents/workflow.md) § Modo de implementação autônoma antes desta decisão.

**A metade que cobra** é o pino: [`scripts/pino-overpower.txt`](../../scripts/pino-overpower.txt), conferido por `npm run pino -- --verificar` dentro do job `gate`. Ele compara a última versão varrida com a publicada no PyPI e reprova quando fica atrás.

**A divisão é o conteúdo desta decisão, e não um detalhe de implementação.** Hook é automação; ele roda quando a máquina é esta e o gatilho está armado. Pino é garantia; ele diz que nenhuma versão publicada passou sem ser olhada, independentemente de quem olhou e de onde. Sem o pino, a próxima falha silenciosa do hook é indistinguível de *"não havia nada a mudar"* — que é a forma exata da deriva medida acima.

**O que o pino não cobra, e o silêncio aqui é deliberado.** Ele não sabe se a varredura foi boa. Nenhuma máquina sabe: o veredito `sem-deriva` é auto-declarado, e a única rede contra ele é a onda adversarial que a skill obriga — um subagente independente que recebe o intervalo e as fontes, não o raciocínio, e cuja tarefa é refutar o negativo. **Contrato em dia e errado continua possível.** O que deixa de ser possível é ninguém ter olhado.

**O pino registra o negativo.** Uma varredura que não achou nada escreve `sem-deriva` com o motivo, e a linha fica. O histórico é o instrumento: uma sequência de `sem-deriva` seguida de um `varrido` grande é o sintoma de uma triagem cega, e apagar as linhas apagaria o sintoma.

## Consequências

**1. A ADR 9 continua de pé; a consequência 6 dela, não.** Superado não se apaga, e a 9 não muda: gerar a referência de contrato foi e continua sendo a decisão certa. O que cai é a frase *"a varredura fica sendo humana"*, e ela cai por medição, não por preferência.

**2. Este repositório passa a depender de um repositório de terceiro dentro de um portão.** Não é novidade de forma: o `paridade` dirige Chrome contra o site vivo da âncora dentro do mesmo job, e o `portao:6` bate nas rotas publicadas depois do deploy. É novidade de sujeito — a dependência agora é uma ferramenta que este acervo documenta, e não uma referência de desenho.

**3. Falha de rede não é pino atrasado, e a régua separa os dois.** Um portão que passa quando a rede cai é um portão que se silencia sozinho. O `pino.mjs` tenta três vezes, e depois reprova com mensagem própria, dizendo qual dos dois problemas o leitor tem nas mãos.

**4. A `main` deste repositório fica devendo enquanto a varredura não roda.** Se o `overpower` publicar e o hook não disparar, o próximo PR daqui — mesmo um que não tenha nada com o `overpower` — encontra o `gate` vermelho. É o preço da garantia, e ele é o preço certo: portão que não bloqueia é documentação.

**5. O pino é cursor, não contador.** A varredura cobre de pino a publicada numa passada, quantas versões forem. Isso resolve a concorrência sem lock: este repositório não aceita dois PRs abertos ao mesmo tempo — o portão 4 crava contagens de página, e dois PRs somando uma página cada passam sozinhos e quebram juntos depois do merge.

**6. Achado sobre a ferramenta não vira commit lá.** A fronteira é herdada da #118 e continua dura: vira issue no `ThiagoPanini/overpower`, com link recíproco. Documentar ferramenta real é o melhor detector de defeito que existe, e dois repositórios num PR só é como PR morre pela metade.

## Alternativas descartadas

**Um workflow neste repositório, disparado por `repository_dispatch`.** Custa dois segredos que não existem em nenhum dos dois repositórios — uma credencial de modelo e um PAT para atravessar a fronteira — e esbarra na parede do `GITHUB_TOKEN` descrita acima. O gatilho local custa zero segredo e empurra com a credencial de quem já tem acesso aos dois.

**Um portão que compare o contrato com o `--help` a cada CI, sem agente.** Ele pegaria o caso `--yes` e nenhum outro. O eixo determinístico é uma fatia estreita do problema: a deriva medida na `publicacao/changelog.md` não tem nada de determinístico, e um portão que só cobrisse o contrato ensinaria que o resto está conferido.

**Varrer sem triagem, em toda release.** A uma release a cada quinze horas, a varredura completa roda cerca de seiscentas vezes por ano para um sinal que é negativo na maioria. A triagem lê o fragmento do changelog, o diff dos caminhos de superfície e o índice das páginas, e decide. **Filtrar por caminho em vez de triar não serve**, e há medição: o PR #151 do `overpower` não tocou `src/` e mudou o que as páginas de `publicacao/` descrevem.

**Deixar o pino de fora e confiar no hook.** É automação sem garantia, que é metade do que o problema pede. A deriva medida no Contexto aconteceu num repositório onde tudo estava verde.

## Procedência

| Linha | Classe | Fonte |
| --- | --- | --- |
| A varredura deixa de ser humana | **origem própria (correção)** | a ADR 9 §consequência 6 escolheu o contrário, e a medição de 2026-08-20 mostra a escolha falhando em dois dias |
| A deriva medida: três versões faltando na página de changelog | **origem própria (medição)** | `publicacao/changelog.md` para na `0.25.1`; `pypi.org/pypi/overpower/json` devolve `0.27.0` |
| O contrato mente sobre `--yes` | **origem própria (verificação)** | o contrato afirma *"a ajuda da ferramenta não anuncia"*; `overpower install --help` na `0.27.0` anuncia, desde a `0.25.2` |
| Uma release a cada quinze horas | **origem própria (medição)** | trinta e seis títulos `## [` no `CHANGELOG.md` do `overpower`, do primeiro commit em 2026-07-30 à `0.27.0` em 2026-08-20 |
| Duas metades: hook automatiza, pino garante | **origem própria** | hook roda quando a máquina é esta; pino independe de quem olhou |
| O formato do pino | **mecanismo emprestado** | `scripts/paridade-abertas.txt` e `scripts/swizzle-list.txt` — estado congelado versionado ao lado do script que o confere |
| O veredito negativo é registro | **origem própria (consequência)** | sem linha para `sem-deriva`, "varri e não achei" fica indistinguível de "nunca varri" |
| A onda adversarial no negativo | **origem própria** | sem passo humano o negativo é auto-declarado, e não há outra rede |
| O gatilho é local, não workflow | **origem própria (implementação)** | `docs/agents/workflow.md` § Modo de implementação autônoma: PR aberto com `GITHUB_TOKEN` não dispara workflow, e o required check nunca reporta |
| Rede dentro do portão | **mecanismo emprestado** | o `paridade` dirige Chrome contra o site vivo da âncora no mesmo job; o `portao:6` bate nas rotas publicadas |
| Falha de rede separada de pino atrasado | **origem própria (consequência)** | portão que passa com a rede caída se silencia sozinho, e a lista de aceitas do `paridade` registra essa lição paga uma vez |
| O pino é cursor | **origem própria (consequência)** | um PR aberto por vez é regra do `workflow.md`, sustentada pelas contagens do portão 4 |
| A fronteira: issue lá, nunca commit | **herdado** | a #118 fixou a regra, e ela sobrevive inteira à automação |
