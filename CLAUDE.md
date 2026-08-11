# shinydoc-docusaurus

Documentação de referência em Docusaurus. Conteúdo mockado; o produto é **estrutura e customização visual**. Alvo de replicação: ambiente corporativo com Docusaurus obrigatório e espaço de dependências apertado.

> **Mapa aberto.** O [mapa do `mint`](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/49) troca o tema de `almond` para `mint` (sem cartão) e substitui o Trilho por **`panlabs`**, o acervo pessoal de aprendizado de um dev dentro de uma empresa que nunca é nomeada. Os **seis axiomas continuam inteiros**; o vocabulário e a spec, não. Leia o aviso no topo de [docs/agents/domain.md](docs/agents/domain.md) antes de agir sobre eles.

Orientação de domínio antes de qualquer trabalho substantivo:

- [docs/agents/domain.md](docs/agents/domain.md) — o que é, vocabulário, **axiomas** (posições travadas na cartografia).
- [docs/adr/](docs/adr/) — decisões de arquitetura.
- `docs/design/` — a spec de design, conforme o mapa fecha.

## Agent skills

### Issue tracker

Issues vivem no GitHub (`panlabs-tech/shinydoc-docusaurus`), via `gh` CLI. PRs externos **não** são superfície de triagem. Operações de wayfinding usam **sub-issues e dependências nativas** do GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulário canônico verbatim: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context; os docs de domínio moram em `docs/` (não na raiz). See `docs/agents/domain.md`.

### Workflow

O mapa deste repo **decide, não constrói** — padrão do wayfinder, sem override. See `docs/agents/workflow.md`.

## Axiomas (resumo)

Não se renegociam sem reabrir o mapa. Íntegra em `docs/agents/domain.md`.

1. Docusaurus é inegociável.
2. Vanilla-first — zero dependências novas.
3. A skin é trocável; o produto é a arquitetura de tokens.
4. Dark é canônico, light é legítimo.
5. Medição, não invenção — valores saem da dissecção das referências em produção.
6. A spec é o entregável; o critério de pronto é implementabilidade sem reinterpretação.

## Idioma e voz

Prosa deste repo — docs, ADR, issue, commit — em **pt-BR**. O conteúdo mockado da documentação também nasce em pt-BR, com EN como segundo locale.

A voz do conteúdo é **`você` + imperativo**, no site inteiro. **Zero primeira pessoa, sem exceção.** O acervo é pessoal pelo que escolhe documentar, não pela gramática. Ver **Voz da casa** em `docs/agents/domain.md`.
