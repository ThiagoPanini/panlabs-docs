---
name: varredura-overpower
description: Confere a documentação do overpower publicada neste acervo contra a ferramenta real, corrige a deriva que achar, e move o pino. Use quando `npm run pino -- --verificar` reprovar, quando uma versão nova do overpower for publicada, ou quando pedirem para varrer a doc do overpower.
---

# A varredura do overpower

Você vai conferir a documentação do `overpower` **contra a ferramenta real**, corrigir a deriva que achar, e mover o pino. Ao fim existe um PR neste repositório, ou uma issue explicando por que não.

O que torna isto necessário está escrito na ADR 9, consequência 6: o portão 5 confere que a página é a projeção do **contrato**, e nada confere que o contrato é a projeção da **ferramenta**. Entre os dois cabe uma página bem formada que mente. A ADR 11 fechou essa lacuna com duas metades: o `npm run pino` cobra que a varredura aconteceu, e esta skill é a varredura.

## O que você tem de saber antes de abrir arquivo

**A ferramenta mora fora.** O `overpower` é `ThiagoPanini/overpower`, MIT, no PyPI. O checkout irmão está normalmente em `../overpower`. Se ele não existir, pare e diga isso: varrer contra o PyPI sem código-fonte devolve só a superfície.

**Delegue o reconhecimento.** Vale aqui a regra do `CLAUDE.md` deste repo: subagente `Explore`, digest como orçamento de leitura, `grep -n` para localizar e `Read` com `offset` para ler. As páginas do `overpower` somam ~12 mil palavras e os dois contratos somam ~24 KB; ler tudo cru é o modo caro de errar.

**A fronteira é dura, e ela é herdada da #118.** Achado sobre a **ferramenta** — bug, ajuda enganosa, comportamento não documentado, divergência entre o `--help` e o que o comando faz — vira **issue no `ThiagoPanini/overpower`**, com link recíproco. **Nunca um commit lá a partir daqui.** Documentar ferramenta real é o melhor detector de defeito que existe, e jogar o achado fora seria desperdício; mas dois repositórios num PR só é como PR morre pela metade.

## 1. Triagem — decida se vale varrer, antes de varrer

Leia o pino (`scripts/pino-overpower.txt`, última linha) e a versão publicada. O intervalo entre os dois é o seu escopo, **inteiro**: se três versões saíram, você varre as três numa passada, não três vezes. O pino é cursor, não contador.

Leia, e só isto:

- as entradas do `CHANGELOG.md` do `overpower` entre o pino e a publicada;
- o `git diff <tag-do-pino>..<tag-publicada>` restrito a `src/overpower/cli.py`, `src/overpower/errors.py`, `src/overpower/catalog/`, `src/overpower/runtimes.py`, `README.md` e `pyproject.toml`;
- `docs/agents/*.md` do `overpower` — é o resumo já curado do que mudou conceitualmente, e é sinal mais nítido que o diff cru. **Leia; nunca escreva.** Aquilo é memória de engenharia daquele repositório.
- o índice das páginas daqui: título e `description` de cada arquivo em `conteudo/ferramentas/bibliotecas/overpower/`.

Decida: **vale varredura completa?** Registre a decisão com o motivo, seja qual for.

**Filtro por caminho não serve, e há medição.** O PR que tirou a documentação do repositório do `overpower` (#151, versão 0.27.0) não tocou `src/` e não mudou flag nenhuma — e mudou o que as páginas de `publicacao/` descrevem, porque tirou um job da CI. Um gatilho que só olhasse `src/` teria perdido exatamente essa.

**Se a triagem disser não**, vá para a etapa 5 com veredito `sem-deriva`. Antes, a onda adversarial.

## 2. O eixo de contrato — determinístico, sem juízo

Isto é comparação de listas. Não peça opinião a ninguém, inclusive a você.

Rode o `--help` real dos três comandos e da raiz, com `NO_COLOR=1` e `COLUMNS=200`, a partir do checkout irmão. Compare com `contratos/overpower.pt-BR.json` e `contratos/overpower.en.json`:

| o que conferir | onde, no contrato |
| --- | --- |
| os comandos que existem | `entradas[].qualificado`, e `fluxo` da entrada raiz |
| a assinatura de cada um | `entradas[].assinatura` |
| nome, forma curta e obrigatoriedade de cada opção | `entradas[].parametros[]` |
| os quatro códigos de saída | `retorno.campos` da entrada raiz |
| os erros nomeados | `entradas[].erros[]` |

E confira a **descrição** de cada opção contra o texto de ajuda real. Este é o achado que a máquina não pega e que aconteceu de verdade: na 0.25.2 a ajuda do `--yes` passou a anunciar o segundo efeito, e o contrato continuou afirmando que *"a ajuda da ferramenta não anuncia"*. O contrato estava bem formado, o portão 5 estava verde, e a frase era falsa.

**Corrigido o contrato, rode `npm run gerar:referencia`.** As oito páginas de `comandos/` — quatro por locale — são projeção. **Nunca as edite à mão**; o portão 5 regenera e reprova no `git diff`.

**Os dois contratos são um par.** Toda mudança em `pt-BR` tem a sua em `en`, com as mesmas chaves. O `npm test` confere a congruência do par.

## 3. O eixo de prosa — juízo, com prova

As dezessete páginas escritas à mão, mais uma que mora fora da subárvore e que uma varredura por caminho perderia:

    conteudo/ferramentas/skills/scaffold-de-esteira.md

As fontes de verdade, herdadas da #118:

| a página fala de | a verdade está em |
| --- | --- |
| comandos, seletores, exit codes, ajuda | `src/overpower/cli.py` |
| o catálogo embutido | `src/overpower/catalog/catalog.yaml` e `catalog/mcps/*.toml` |
| o que aterrissa | `git ls-files src/overpower/content/` |
| os runtimes, os escopos, o grupo universal | `src/overpower/runtimes.py` |
| o changelog publicado | `CHANGELOG.md` do `overpower` |
| versão, entry point, dependências, endereços | `pyproject.toml` e `README.md` |
| o fluxo de trabalho e o que trava merge | `docs/agents/workflow.md` do `overpower` |

### A regra de evidência

O modo de falha desta tarefa não é achar pouco. É **achar coisa que não existe**: a divergência plausível, bem escrita, que some quando alguém roda o comando. Um relatório com três achados reais vale mais que um com quinze dos quais seis são fantasmas, porque o segundo obriga o leitor a reauditar a auditoria.

**Um achado só existe com uma destas duas provas:**

- **prova executada** — o comando que você rodou e a saída que veio, mais `arquivo:linha` do código responsável;
- **prova textual de contradição** — a citação literal da página ao lado da citação literal da fonte que a contradiz, com `arquivo:linha` dos dois lados.

**Não é achado:** conteúdo mockado ser raso — o produto deste repositório é estrutura e customização visual, e invenção não é custo aqui, salvo quando quebra forma; preferência de estilo que os portões aceitam; discordar de uma ADR — implementá-la ao contrário é achado, achá-la errada não; suspeita que você não conseguiu executar, que vai para **Dúvidas abertas**.

**Endereço envelhece.** Os `arquivo:linha` que você leu na triagem podem ter andado. Antes de citar um num achado, reconfirme com `grep -n`. É mais barato que uma leitura, e um endereço errado mata o achado inteiro.

## 4. As armadilhas deste repositório — elas reprovam o PR

- **Zero travessão** em `conteudo/`, `i18n/` e `contratos/`. A cobrança 14 do portão 4 varre as três e aponta arquivo e linha, **inclusive dentro de bloco de código**. A prosa do `overpower` é cheia de travessão: todo texto copiado de lá precisa sair como vírgula, dois-pontos, parênteses ou frase reescrita, escolhido um a um. Este é o erro que você vai cometer.
- **Página gerada nunca se edita à mão.** `comandos/*.mdx` sai do contrato, e o portão 5 reprova o `git diff`.
- **Paridade de locale.** Só a aba `Ferramentas` é traduzida, e a cobertura é cobrada: toda página mexida é duas.
- **Contagem de página.** O portão 4 crava o volume por aba e o total. Acrescentar ou remover página exige acertar `scripts/portao-4-conteudo.sh` no mesmo PR. Acrescentar `<Update>` na página de changelog **não** exige: aquela cobrança é piso, não igualdade.
- **A voz é `você` + imperativo, zero primeira pessoa**, no site inteiro.
- **Nenhuma dependência npm nova.** É axioma, e `npm run zeros` reprova.
- **Verde no bundle não é verde na CI.** `npm run portoes` roda cinco dos sete portões e nenhuma das outras réguas. **A régua é `.github/workflows/ci.yml`**, e ela não se transcreve: leia o arquivo e rode a lista dele.
- **Link quebrado só aparece no `npm run build`.**

## 5. O pino, e o veredito

**Toda varredura termina movendo `scripts/pino-overpower.txt`, inclusive a que não achou nada.** Acrescente uma linha — versão publicada, data ISO, veredito, nota:

- `varrido` — achou deriva, e ela foi corrigida neste PR;
- `sem-deriva` — rodou, e não havia o que mudar. A nota diz **por que**, não "nada".

Não apague linhas antigas. Uma sequência de `sem-deriva` seguida de um `varrido` grande é o sintoma de uma triagem cega, e apagar o histórico apagaria o sintoma junto.

### A onda adversarial, obrigatória no negativo

Antes de escrever `sem-deriva`, dispare **um subagente independente** cuja tarefa é **refutar** o negativo: dado o intervalo de versões e as páginas, achar uma afirmação que mudou e você não viu. Ele recebe o intervalo e as fontes, **não** o seu raciocínio. Se ele achar com prova, o negativo cai e você volta à etapa 3.

Isto existe porque sem passo humano *"analisei e não achei"* é auto-declarado, e a deriva que originou esta skill era exatamente disso: a página de changelog parou na 0.25.1 e ninguém soube por dois dias.

## 6. Entregar

O caminho é o do `docs/agents/workflow.md` § Modo de implementação autônoma, e ele vale inteiro. O resumo do que muda aqui:

1. **Branch `feature/<slug-em-inglês>`.** Um PR por varredura. **Nunca dois PRs abertos neste repositório ao mesmo tempo** — o portão 4 crava contagens, e dois PRs que somam uma página cada passam sozinhos e quebram juntos depois do merge. Se já houver PR aberto, espere: `gh pr list --state open`.
2. **Rode a lista da CI antes do primeiro push**, do arquivo, não de memória.
3. **Commit em pt-BR**, com `Closes #N` em inglês para as issues que fechar.
4. **PR com a guarda de idempotência** — `gh pr list --head "$BRANCH" --state open` antes de `gh pr create`.
5. **Corpo escrito no fim**, por quem tem o trabalho na mão. Depois `gh pr ready` e `gh pr merge --auto --squash`, sem `--delete-branch`.
6. **Achado sobre a ferramenta vira issue no `ThiagoPanini/overpower`**, com link recíproco daqui para lá.

### O teto

**Duas execuções vermelhas pela mesma causa: pare.** Abra uma issue **neste repositório** com o que travou, a saída literal do portão e o que você tentou, e deixe o pino como está. O pino vermelho mais a issue é o relatório; sem teto, a varredura queima a sessão consertando em loop e ninguém fica sabendo.

Isto vale mais ainda quando ninguém está olhando: esta skill roda destacada, disparada pelo `post-merge` do `overpower`, e o único canal de volta é o que você escrever.
