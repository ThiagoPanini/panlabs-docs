---
title: Arquitetura
description: O fluxo de uma invocação pelos módulos, e duas raízes irmãs de conteúdo com invariantes opostas.
---

import Fluxo from './fluxo-de-uma-invocacao.drawio.svg?aba=fluxo-de-uma-invocacao';

# Arquitetura

Esta página mapeia a base de código para quem está prestes a mexer nela: o caminho
que uma invocação percorre pelos módulos, e as duas raízes irmãs de conteúdo. As
invariantes delas são opostas, e a maior parte das regras surpreendentes deste
repositório descende dessa divisão. Quem procura *que módulo responde por quê* vai
direto ao [mapa de módulos](mapa-de-modulos).

## O fluxo de uma invocação

O `cli.py` parseia a linha e, num terminal com uma linha que não fecha uma
requisição completa, entrega as lacunas ao `wizard.py`, na ordem artefatos,
escopo, runtimes, confirmação, porque um passo posterior pode depender da resposta
de um anterior. De um jeito ou de outro, o que sai é a mesma `Request`.

Para o catálogo embutido, o `discovery.py` e o `packaged.py` respondem o que
existe andando por `content/`. Para o `--from`, o `remote.py` responde a mesma
pergunta obtendo uma cópia de um repositório alheio. O `planning.py` transforma a
`Request` num `Plan`, e toda escrita passa pela fronteira única em `writing.py`.

<Frame>
  <Fluxo role="img" aria-label="O cli.py parseia a linha e, quando falta dado, o wizard.py preenche as lacunas; os dois produzem a mesma Request, que o planning.py transforma em Plan consultando o catálogo embutido por discovery.py e packaged.py ou o repositório alheio por remote.py, e toda escrita passa pela fronteira única do writing.py antes de virar arquivo no disco." />
</Frame>

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run
```

O `--dry-run` é a forma barata de ver esse caminho inteiro sem escrever nada: ele
para na fronteira e imprime o `Plan`.

## Duas raízes irmãs, invariantes opostas

Dentro do pacote ficam duas raízes de conteúdo, irmãs, e as invariantes delas são
opostas.

| Raiz | O que carrega | A invariante |
| --- | --- | --- |
| `src/overpower/content/` | as árvores vendorizadas, o pool de artefatos curados e os AI Frameworks | precisa aterrissar **100%**, byte a byte |
| `src/overpower/catalog/` | um arquivo só, `catalog.yaml` | carrega **apenas o que a árvore não tem como saber sozinha** |

A **`content/`** é conteúdo copiado, nunca gerado, e uma aterrissagem parcial é um
artefato corrompido que ninguém notaria no ponto em que aconteceu.

A **`catalog/`** guarda as definições de bundle, que por construção não têm
diretório próprio, e uma linha de descrição por AI Framework, que não tem
`SKILL.md` de onde ler descrição.

:::note
Nada que uma caminhada de diretório pudesse responder mora ali. Um campo que
duplicasse um caminho que o sistema de arquivos já conhece seria uma segunda fonte
de verdade para um fato que tem uma só.
:::

## Os três portões que guardam a primeira raiz

| Portão | O que ele confirma |
| --- | --- |
| P1 | nada sob `content/` está escondido do git, e um portão sem sujeito não passa por verde |
| P2 | a wheel carrega o mesmo conjunto que a árvore do git carrega |
| P3 | o sdist carrega exatamente o que declarou |

```bash
uv build
```

A segunda raiz não tem portão dedicado, porque perdê-la falha alto em vez de
calado: um bundle some do `list`, e o `install` responde que não conhece o nome. O
que falha alto não precisa de portão; o que falha calado é o que os três portões
existem para pegar.
