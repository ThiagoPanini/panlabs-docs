# panlabs-docs

Documentação de referência em Docusaurus. O produto é **estrutura e customização visual**, para transplante a um ambiente corporativo com Docusaurus obrigatório.

Vocabulário e axiomas: [`CONTEXT.md`](CONTEXT.md). O porquê de cada decisão: [`docs/adr/`](docs/adr/).

## O que a máquina cobra

**`npm run build`.** É o único passo da CI, e é o que o check `gate` reporta.

Ele é o que pega link quebrado — `onBrokenLinks: 'throw'` não roda em `docusaurus start`, que devolve 200 com o shell da SPA para qualquer rota. O `prebuild` regenera a referência a partir de `contracts/*.json`; editou contrato, o build reescreve a página, e a página gerada nunca se edita à mão.

Não há portão, régua de forma, cobrança de prosa nem hook de commit. Existiram e saíram. **As duas regras abaixo não têm cobrança automática, e é exatamente por isso que estão escritas.**

## As duas regras de escrita

**Cor e medida saem do arquivo de tokens.** `src/css/tokens.css` é a sede única de literal. Fora da camada de raiz, todo valor deriva de algo que já está lá por uma operação declarada — sintaxe relativa (`oklch(from …)`), `color-mix(in oklab, …)` ou `calc()` sobre a base de raio, espaço ou duração. Hex novo, px avulso ou `cubic-bezier` solto em CSS de componente é o defeito que esta regra existe para pegar. Cor desce pela camada semântica; dimensão vem direto da raiz.

**Zero travessão no conteúdo publicado.** `content/` e `contracts/` fecham em zero `—`, e a saída é vírgula, dois-pontos, parênteses ou a frase reescrita, escolhida uma a uma. O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um site que se olha. `docs/` e a raiz ficam de fora. A exceção é **citação de saída de ferramenta**: dentro de cerca de código ou num valor `"message"`, onde o travessão é o que a ferramenta imprimiu.

## Idioma e voz

Prosa deste repo — docs, ADR, issue, commit, PR — em **pt-BR**; inglês só no que a máquina casa (nome de branch, de check, de diretório, identificador de código).

A voz do conteúdo é **`você` mais imperativo**, no site inteiro, com **zero primeira pessoa**. O acervo é pessoal pelo que escolhe documentar, não pela gramática.

## Pegadinhas

- **A spec de design saiu da árvore** e está na tag `spec-v1` — `git show spec-v1:docs/design/tokens.md` a lê, `git checkout spec-v1 -- docs/design/` a traz de volta. Os carimbos `Procedência:` no CSS e os links `../design/` nos ADRs apontam para lá.
- **Os ADRs citam axioma pelo número, e três morreram.** O 2, o 5 e o 6 não valem mais; `CONTEXT.md` diz o que ficou. Decisão justificada "contra o axioma 2" continua de pé — caiu a proibição, não o resultado.
- **Dependência npm nova é aceita para capacidade nova**, e só. Nunca para reescrever o que já funciona.
- **Editou `contracts/*.json`?** Rode `npm run generate:reference`, ou deixe o `prebuild` fazer.

## Agent skills

### Issue tracker

Issues do GitHub em `ThiagoPanini/panlabs-docs`, pela CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Os cinco papéis canônicos, verbatim, sem alias nem namespace. Ver `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `CONTEXT.md` na raiz, mais `docs/adr/`. Ver `docs/agents/domain.md`.
