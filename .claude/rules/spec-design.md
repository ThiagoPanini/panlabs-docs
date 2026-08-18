---
paths:
  - "docs/design/*.md"
  - "docs/design/**/*.md"
---

# A spec de design — forma cobrada por máquina

Área tocada por 16 das 33 sessões que editaram o repo — a mais editada depois de `docs/agents/`. A spec **é** o entregável (axioma 6), e por isso tem régua: `npm run invariantes` cobra a forma do documento do mesmo jeito que os portões cobram o código.

## As cinco invariantes de forma

`./scripts/invariantes.sh` reprova seção vazia, número solto, procedência órfã e **carimbo fora da gramática** (invariante 6, desde a S9-3). A de **completude** não está entre elas: é leitura cruzada entre as resoluções do mapa e os arquivos da spec, não existe varredura que a faça, e o resultado dela mora em `docs/design/README.md` § 6. O axioma 6, exercido.

Consequência prática: **não abra seção que você não vai preencher**, e **todo número afirmado precisa de procedência**.

## Procedência — a regra que mais reprova

Todo valor concreto carrega de onde veio. As sete classes estão em `docs/design/principios.md` § 5. As sete classes de procedência, com a gramática do carimbo no § 5.0, e cada documento fecha com uma seção `## Procedência`. Valor medido em referência de produção é uma classe; valor decidido é outra; e a diferença é o que o axioma 5 protege — medição, não invenção.

## Onde a spec espelha código

Dois documentos não são livres — eles são projeção de um arquivo, e divergir reprova na CI:

- `docs/design/tokens.md` § 3. O bloco, que é espelho byte a byte de `src/css/tokens.css`. Nunca edite o bloco `css` à mão; rode `node scripts/espelho-tokens.mjs --sincronizar`.
- As tabelas de contraste — computadas de `tokens.css` por `npm run contraste`, não transcritas.

## Antes de propor

`npm run invariantes` e, se tocou tokens ou contraste, os dois verificadores acima. Nenhum dos três está em `npm run portoes` — a lista real é a de `.github/workflows/ci.yml`.

## O índice

`docs/design/README.md` § 3. O índice, tem uma linha por documento, e § 5. Os sete portões, diz qual portão cobra o quê. As seções são numeradas: `grep -n '^## ' <arquivo>` devolve o sumário por menos que uma leitura — `tokens.md` passa de 1800 linhas e não se lê inteiro.

> **Correção de contagem.** **Eram oito portões, são sete** — o 8 morreu com a landing ([#94](https://github.com/panlabs-tech/shinydoc-docusaurus/issues/94)), e o número **não se reaproveita**: o ADR 5 cita o portão 5 pelo número, e é esse precedente que congela a numeração. A spec caiu de trinta arquivos para **vinte e nove** na mesma remoção.
