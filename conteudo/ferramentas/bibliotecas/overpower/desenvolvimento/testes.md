---
title: Testes
description: A doutrina, com disco real, uma suíte só rodando inteira nas nove células, e a rede nunca dentro de um portão.
---

# Testes

Esta página cobre como o `overpower` é testado e por que essa forma foi
escolhida: o disco é real em vez de mockado, há uma suíte só em vez de uma camada
rápida e uma lenta, e ela roda inteira nas nove células da matriz.

## A doutrina em uma tabela

| Pergunta | Resposta |
| --- | --- |
| dublê de sistema de arquivos | **não existe**, e sim `tmp_path`, sempre |
| o `git` atrás do `--from` | **subprocesso real**, contra um remoto local |
| o GitHub de verdade | **fora de todo portão**, ato de curadoria, com `OVERPOWER_NETWORK_TESTS=1` |
| plano contra tela contra disco | uma asserção, a **identidade de três pontas**, nas 9 células |
| saída visual | **estrutura no portão**, um snapshot **por tela**, sem cor, a 80 e a 60 colunas |
| seleção interativa | a costura é um **stub**, e um teste de PTY prova a fiação |
| cobertura | diagnóstico efêmero, **nada** em `pyproject.toml` |

## O disco é real

`tmp_path`, sempre. Sem `FakeFileSystem`, sem port, sem `mock_open`, sem
condicionar teste de escrita a variável de ambiente. Um dublê que não implementa
link simbólico real nem junção real fica verde exatamente onde o produto quebra,
e todo caminho de escrita precisa exercitar três armadilhas concretas: remover um
destino que é link sem escrever através dele, remover uma junção com o predicado
que de fato a reconhece, e instalar por cima de uma versão anterior sem deixar
arquivo velho para trás.

```bash
uv run pytest
```

:::warning
`os.path.islink()` devolve `False` para uma junção, e o `shutil.rmtree()` a recusa
de qualquer forma. Isso é só Windows, e a exclusão é chaveada por `sys.platform`,
nunca por variável de ambiente, para que ela não possa ser esquecida em silêncio
dentro de um arquivo de workflow.
:::

## Uma suíte, rodando inteira nas nove células

Não há categoria de *roda numa plataforma só*, e não há marcador `slow`. Dividir
a suíte não compra tempo, porque, medido, o custo fixo de subir um job é
comparável à bateria inteira. E o que se testa aqui é comportamento de disco, que
é precisamente o que diverge entre as nove células, três sistemas operacionais
vezes três versões de Python.

Três ausências ficam registradas como **conhecidas**, e não como cobertura: o caso
de falta de privilégio para link no Windows não é reproduzível na CI hospedada,
porque a imagem do runner liga o Modo de Desenvolvedor; o PyPy não tem
`CreateJunction` e não está na matriz; e construir um prompt do `questionary` não
roda nas células Windows, porque a construção levanta `NoConsoleScreenBufferError`
num processo sem buffer de tela de console.

## A rede nunca entra num portão

O que depende de terceiro é verificado à mão, na curadoria, nunca por automação
num pull request ou num lançamento. O teste ponta a ponta contra o repositório
real lá de cima existe, está documentado, e roda em nenhum job de CI.

```bash
OVERPOWER_NETWORK_TESTS=1 uv run pytest -m network
```

Com a variável posta, a condição de skip não pode mais ser satisfeita, então um
teste de rede que for renomeado ou perdido fica vermelho em vez de sumir calado.
O portão é o marcador próprio e nomeado, nunca a variável `CI` genérica que todo
runner põe.

## A identidade de três pontas

Um `--dry-run` precisa espelhar não só o código de saída de uma execução real,
mas o conteúdo dela: o conjunto de caminhos que a execução seca anuncia, o
conjunto que a real anuncia, e o conjunto de fato encontrado em disco depois da
real têm de ser o *mesmo* conjunto.

Essa asserção única prova três propriedades de uma vez, e roda nas nove células,
porque a propriedade com mais chance de quebrar por plataforma, separador de
caminho, `Path` contra `PurePosixPath`, sistema de arquivos que ignora caixa, é
exatamente o tipo de defeito que passa verde numa célula só.

:::note
A identidade também guia o desenho, e não apenas o teste: quem escreve consome o
plano e nada além dele. Um escritor que recalculasse um caminho poderia divergir
do que a tela prometeu, e nenhum teste posterior fecharia essa brecha.
:::
