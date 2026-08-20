---
title: Mapa de módulos
description: Que módulo do overpower responde por quê, e o que cada fronteira interna garante.
---

# O mapa de módulos

Tudo vive sob `src/overpower/`, plano. Não há pacote dentro de pacote, porque o
projeto é de contexto único.

## A tabela

Procure aqui antes de abrir arquivo. A coluna da direita é o que o módulo
responde, e o que ele não responde é de outro.

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

## Conferir o mapa contra o disco

O mapa envelhece se um módulo nascer sem entrar nele. Conte os arquivos e compare
com as linhas da tabela:

```bash
ls src/overpower/*.py | wc -l
```

```bash
ls src/overpower/*.py | xargs -n1 basename
```

:::note
Um módulo a mais no disco do que na tabela é deriva de documentação, não defeito
da ferramenta. Acrescente a linha, com a responsabilidade escrita do ponto de
vista de quem procura onde mexer.
:::

## As fronteiras que o mapa desenha

Três nomes da tabela são fronteira, e não só arquivo. `planning.py` é o único
lugar onde um destino é decidido, então uma pergunta sobre *onde isto vai cair*
começa nele. `writing.py` é a única fronteira de escrita, e ele executa o plano
sem ler mais nada, o que é o que torna o `--dry-run` barato de confiar.
`errors.py` guarda as duas subclasses que separam a saída `2` da `3`, e é por
isso que mudar o código de saída de uma recusa é mudar a classe dela, nunca um
número solto no meio do fluxo.
