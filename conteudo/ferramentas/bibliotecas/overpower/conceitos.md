---
title: Conceitos
description: O vocabulário do overpower, das três unidades instaláveis ao slot, à precondição, ao runtime e ao escopo.
---

# Conceitos

O resto deste site usa estes termos sem parar para redefini-los. Esta página é
onde a definição mora.

## As três unidades instaláveis

O modelo do `overpower` tem exatamente três unidades que você pode pedir, e elas
não são níveis de uma hierarquia. Você escolhe entre elas, não sobe nem desce
uma escada.

| Unidade | O que é | Como instala |
| --- | --- | --- |
| **Artefato** | o átomo, uma skill, um comando, um agente ou um servidor MCP, curado sozinho | sozinho, pelo nome |
| **AI Framework** | um corpo autocontido de equipamento vindo de uma única origem | inteiro, nunca em fatia |
| **Bundle** | uma coleção nomeada de artefatos de pool, montada para um contexto de trabalho | expande no que o manifesto dele nomeia |

O artefato vive no **pool**, instala por si e é o único tipo de coisa que um
bundle pode nomear. O AI Framework instala inteiro, e os artefatos dele vivem
dentro do contexto do próprio framework, não no pool, e não podem ser pedidos
individualmente. O nome que você digita em `--ai-framework` é o nome que o
`overpower` dá ao framework, que nem sempre é o nome de onde ele veio, e essa
origem fica registrada em `NOTICE`, um arquivo que o produto nunca lê.

```bash
uvx overpower@latest list --ai-framework matt-pocock
```

O bundle não carrega conteúdo próprio. Ele é um manifesto que aponta para nomes
de artefato, e expande exatamente no que esse manifesto lista.

## De onde o conteúdo vem

**Pool** é o conjunto de artefatos curados individualmente, organizado por tipo.
É a fonte de onde bebem tanto um `--skill` direto quanto todo bundle.

**Catálogo** é tudo que o `overpower` sabe instalar, artefatos, frameworks e
bundles juntos. Ele é curado, não aberto, e não é registro no sentido usual: o
catálogo embutido **é** a árvore de artefatos dentro do pacote, descoberta
andando pelo sistema de arquivos em vez de lida de um arquivo de índice.

**Receita** é a declaração lógica de um servidor MCP, com o transporte, como
alcançá-lo, os slots dele e as precondições. Uma receita nunca aterrissa em
disco como arquivo. O que aterrissa é o fragmento renderizado a partir dela
dentro de um documento que já é seu.

**Procedência** é de onde um pedaço de conteúdo veio, a origem e a forma como
foi obtido. Ela descreve a história do próprio catálogo, nunca o alvo em que ele
aterrissa.

## O vocabulário do enxerto de MCP

**Enxerto** é o que o `overpower` escreve dentro de um documento que já é seu, em
vez de um arquivo próprio. Ele é inserção cirúrgica: o resto do documento fica
como estava, e o que entra é o fragmento renderizado a partir de uma receita. A
cópia e o enxerto são as duas formas de aterrissar, e a diferença entre elas é de
quem é o arquivo de destino.

**Slot** é onde um segredo pertence dentro de uma receita, declarado como **nome
e papel**, `env`, `header` ou `bearer`, e nunca como valor. Uma receita nunca
carrega segredo; quem decide o que aterrissa no lugar do slot é o **escopo**. No
escopo de repositório aterrissa a referência `${VAR}` e nada mais, porque o
arquivo é versionado. No escopo de máquina o `install` pergunta o valor atrás de
uma máscara e o escreve literal, porque ali o `git` não alcança. Todo o resto que
a receita declara, ele escreve nos dois escopos porque pode.

**Precondição** é uma conferência que uma receita pode nomear, de um vocabulário
fechado que o próprio `overpower` implementa: existe um dado comando, uma dada
variável está posta, um dado caminho existe.

:::warning
Uma receita só nomeia **o que** conferir. O código que executa a conferência é
sempre do próprio `overpower`, nunca algo buscado e executado de onde quer que a
receita tenha vindo.
:::

## O vocabulário do `doctor`

O `doctor` fecha em dois vocabulários, e a diferença entre eles é o código de
saída.

**Achado** é um defeito no que aterrissou. Achado **reprova**: um só faz o
`doctor` sair `3`. São cinco, e cada um está descrito em
[solução de problemas](referencia/solucao-de-problemas).

**Aviso** é uma observação sobre o ambiente, não sobre o que aterrissou. Aviso
**não reprova**: uma execução só com avisos sai `0`. São dois, e eles viajam numa
lista própria justamente para não somar ao veredito.

| Vocabulário | Sobre o quê | O que faz com o código de saída |
| --- | --- | --- |
| achado | o que aterrissou | leva o `doctor` a `3` |
| aviso | o ambiente em volta | nenhum; a saída continua `0` |

## O que decide onde as coisas caem

**Runtime** é a ferramenta que consome o que o `overpower` instala, como o Claude
Code, o Cursor, o Codex ou o Copilot. Cada runtime tem convenção de caminho
própria e, para enxertos, formato de configuração próprio.

**Escopo** é qual dos dois lugares o `overpower` escreve: o repositório atual, ou
a máquina atual, selecionada com `--global`. Os dois não são simétricos. Uma
escrita em repositório pode contar com o `git status` para revelar ou desfazer um
engano, uma escrita em máquina não pode, e as regras que cada comando segue
diferem em consequência disso.

```bash
uvx overpower@latest install --skill panlabs-python-standards --runtime cursor --global
```

A árvore do catálogo é o mapa que estes termos descrevem, e esta página é só a
legenda para lê-lo.
