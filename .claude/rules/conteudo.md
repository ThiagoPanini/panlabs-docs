---
paths:
  - "conteudo/**/*.md"
  - "conteudo/**/*.mdx"
  - "i18n/**/*.md"
  - "i18n/**/*.mdx"
  - "i18n/**/*.json"
  - "contratos/**/*.json"
---

# Conteúdo — o que é contado, e por quem

O portão 4 (`npm run portao:4`) transforma em varredura os critérios da arquitetura de informação, porque são todos **contagens**, e contagem escrita em documento é contagem que envelhece calada. Uma página a mais não quebra build nenhum; só faz a spec passar a mentir.

## As contagens travadas

| Aba | Páginas autorais |
| --- | --- |
| `conteudo/jornadas/` | 12 |
| `conteudo/procedimentos/` | 16 |
| `conteudo/ferramentas/` | 28 |

Mais o ramo gerado, somado por fora — **60 no site**, 56 autorais mais 4 geradas. Acrescentar ou remover página **exige acertar o portão 4 junto**. São quinze cobranças ao todo; a lista está no cabeçalho de `scripts/portao-4-conteudo.sh`.

## Proibição por localização

O portão 4 tem uma classe de cobrança que não é só teto — é *"aqui não entra"*. `<Steps>` fora de `Jornadas` e `<CardGroup>` fora dos dois índices têm teto **zero**. Antes de usar um componente de autoria, confira o tipo de página em `docs/design/informacao.md` § 6. Tipos de página.

## O teto de profundidade

É **4**, e ele é **confinado** a `conteudo/ferramentas/bibliotecas/overpower/`. Fora desse ramo nada passa do nível 2. O portão 4 cobra as duas metades, e a régua está em `docs/design/informacao.md` § 3.1.

## A regra de heading

É decisão de layout disfarçada de conteúdo, e o portão a cobra: `docs/design/informacao.md` § 4. A regra de heading.

## Locale

**Só `Ferramentas` é traduzida** — 32 folhas, cobertura cobrada pelo portão 4. As outras duas abas existem só em pt-BR, e isso é decisão, não pendência: `docs/design/informacao.md` § 8. Locale.

Tradução mora em `i18n/en/docusaurus-plugin-content-docs-ferramentas/current/`, espelhando a árvore de `conteudo/ferramentas/`. Rótulo de UI vai em `i18n/en/docusaurus-theme-classic/`.

## Voz

**`você` + imperativo. Zero primeira pessoa, sem exceção** — no site inteiro, nos dois locales. O acervo é pessoal pelo que escolhe documentar, não pela gramática.

## Travessão

**Zero `—` em `conteudo/`, `i18n/` e `contratos/`.** O em-dash é a marca de texto escrito por máquina, e o produto deste repo é um site que se olha. A saída é vírgula, dois-pontos, parênteses ou a frase reescrita, **escolhida uma a uma**: travessão é pontuação legítima do português, e trocar o caractere por outro fixo produz frase truncada ou pontuação dobrada.

A cobrança 14 do portão 4 varre as três superfícies e reprova apontando arquivo e linha. `docs/` fica de fora, e por decisão: a spec não é produto, e `scripts/invariantes.sh` exige o literal `Livre — <dono>` lá dentro.

**A única exceção é citação de saída de ferramenta.** Um arquivo que declara `{/* cita-saida-de-ferramenta */}` (ou `"citaSaidaDeFerramenta": true`, em `contratos/`) nas 20 primeiras linhas pode carregar `—` **dentro de cerca de código**, na linha `api_exemplos:` de página gerada, ou num valor `"mensagem"`. Fora dessas regiões o portão reprova igual. O marcador é `{/* */}` porque o comentário HTML não compila sob MDX 3.

## Link quebrado

`onBrokenLinks: 'throw'` só dispara em `npm run build`. `docusaurus start` devolve 200 com o shell da SPA para qualquer rota — ele nunca vai te avisar.
