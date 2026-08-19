---
title: Publicação
description: A arquitetura, com os módulos, o fluxo entre eles, e duas raízes irmãs de invariantes opostas.
---

# Publicação

Esta página mapeia a base de código para quem está prestes a mexer nela: os
módulos, do que cada um é responsável, e o caminho que uma invocação percorre por
eles. Ela cobre também as duas raízes irmãs de conteúdo e por que as invariantes
delas são opostas, porque a maior parte das regras surpreendentes deste
repositório descende dessa divisão.

## O mapa de módulos

Tudo vive sob `src/overpower/`, plano. Não há pacote dentro de pacote, porque o
projeto é de contexto único.

```bash
ls src/overpower/*.py | wc -l
```

| Módulo | Responsabilidade |
| --- | --- |
| `cli.py` | a linha de comando, o parse, o portão de `isatty()`, os códigos de saída |
| `discovery.py` | a árvore **é** o catálogo, e o `list` descobre artefatos andando por ela |
| `packaged.py` | onde as duas raízes irmãs vivem dentro do pacote |
| `scope.py` | se o `cwd` está dentro de um repositório git |
| `wizard.py` | o assistente interativo, e uma `Request` só na saída |
| `remote.py` | o `--from`, com qualquer repositório do GitHub como raiz de busca |
| `planning.py` | `Request → Plan`, o único lugar onde um destino é decidido |
| `writing.py` | a única fronteira de escrita, que executa o plano e não lê mais nada |
| `written.py` | o único arquivo que o `overpower` escreve sobre o próprio conteúdo |
| `inspection.py` | o que está no disco do alvo, e o que há de errado com ele |
| `screens.py` | o que o produto desenha no terminal |
| `recipes.py` | TOML na entrada, uma `Recipe` na saída |
| `rendering.py` | `(Recipe, documento) → os enxertos a fazer`, função pura sobre valores |
| `grafting.py` | inserção cirúrgica num documento que não é do `overpower` |
| `runtimes.py` | a tabela de caminhos de runtime |
| `jsonio.py` | a forma sancionada de alcançar o leitor de JSON da biblioteca padrão |
| `yamlio.py` | a forma sancionada de alcançar o leitor de YAML, e a porta do catálogo |
| `errors.py` | a raiz de exceção do produto, com as duas subclasses que separam `2` de `3` |

## O fluxo de uma invocação

O `cli.py` parseia a linha e, num terminal com uma linha que não fecha uma
requisição completa, entrega as lacunas ao `wizard.py`, na ordem artefatos,
escopo, runtimes, confirmação, porque um passo posterior pode depender da resposta
de um anterior. De um jeito ou de outro, o que sai é a mesma `Request`.

Para o catálogo embutido, o `discovery.py` e o `packaged.py` respondem o que
existe andando por `content/`. Para o `--from`, o `remote.py` responde a mesma
pergunta obtendo uma cópia de um repositório alheio. O `planning.py` transforma a
`Request` num `Plan`, e toda escrita passa pela fronteira única em `writing.py`.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run
```

## Duas raízes irmãs, invariantes opostas

Dentro do pacote ficam duas raízes de conteúdo, irmãs, e as invariantes delas são
opostas.

A **`src/overpower/content/`** carrega as árvores vendorizadas, o pool de
artefatos curados individualmente e os AI Frameworks. Ela **precisa aterrissar
100%**: todo arquivo rastreado aqui tem de chegar à wheel byte a byte idêntico,
porque isto é conteúdo copiado, nunca gerado, e uma aterrissagem parcial é um
artefato corrompido que ninguém notaria no ponto em que aconteceu.

A **`src/overpower/catalog/`** é o oposto: um arquivo só, `catalog.yaml`, que
carrega **apenas o que a árvore não tem como saber sozinha**, as definições de
bundle, que por construção não têm diretório próprio, e uma linha de descrição por
AI Framework, que não tem `SKILL.md` de onde ler descrição.

:::note
Nada que uma caminhada de diretório pudesse responder mora ali. Um campo que
duplicasse um caminho que o sistema de arquivos já conhece seria uma segunda fonte
de verdade para um fato que tem uma só.
:::

Três portões na CI guardam exatamente a primeira. O **P1** confirma que nada sob
`content/` está escondido do git, e recusa até o caso em que o git não rastreia
nada ali, para que um portão sem sujeito não passe por verde. O **P2** confirma
que a wheel carrega o mesmo conjunto que a árvore do git carrega. O **P3**
confirma que o sdist carrega exatamente o que declarou. A segunda raiz não tem
portão dedicado,
porque perdê-la falha alto em vez de calado: um bundle some do `list`, e o
`install` responde que não conhece o nome. O que falha alto não precisa de portão;
o que falha calado é o que os dois portões existem para pegar.
