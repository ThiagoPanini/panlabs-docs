---
title: Comandos
description: A forma da linha, com os seletores que se misturam livremente e o plano que roda sempre na mesma ordem.
---

# Comandos

Antes de qualquer comando isolado, duas coisas valem para todos eles. Esta
página é o que vem antes das quatro páginas ao lado, que saem do contrato de
superfície e não desta prosa.

## Os seletores se compõem

`--ai-framework`, `--bundle`, `--skill` e `--mcp` são **seletores**, flags que
nomeiam do que a linha trata. Cada um aceita valor separado por vírgula, a flag
repetida, ou as duas coisas, e eles acumulam em vez de sobrescrever.

```bash
overpower install --skill uma-skill --skill outra-skill --bundle api-python,outro-bundle
```

Misturar seletores de tipos diferentes numa única linha de `install` é o caso
normal, não o caso de borda. `--ai-framework matt-pocock --skill outra-skill
--mcp cloudflare` é uma invocação comum, e não três comandos costurados.

:::note
O `list` é o único lugar onde isso não vale. Ele responde sobre um item só, então
mais de um seletor numa linha de `list` é uma pergunta com duas respostas, e o
comando recusa em vez de escolher uma calado.
:::

## O plano roda numa ordem fixa

Quando uma linha resolve para escritas em mais de uma unidade, um framework e uma
skill avulsa no mesmo `install`, por exemplo, as escritas acontecem sempre na
mesma ordem. Ela não é a ordem em que você digitou as flags.

| Ordem | Unidade | Por que aqui |
| --- | --- | --- |
| 1 | AI Framework | a unidade mais ampla, e a menos específica |
| 2 | Bundle | mais específico que um framework, menos que um artefato |
| 3 | Artefato avulso | você o nomeou diretamente, então ele vence |
| 4 | Servidor MCP | não é cópia, é enxerto, e cai em documento seu |

A ordem importa mais onde duas seleções aterrissariam no mesmo destino. Em vez de
levantar erro por essa sobreposição, a ordem fixa a decide: a unidade mais
específica é escrita por último, então o conteúdo dela é o que sobrevive em
disco.

```bash
overpower install --ai-framework matt-pocock --skill panlabs-python-standards --runtime claude-code
```

## As quatro páginas ao lado

`overpower`, `list`, `install` e `doctor` são geradas do contrato de superfície
de comando, e nenhuma delas é escrita à mão. O que você lê nelas é a projeção do
contrato: as opções, os códigos de saída e a linha de uso do painel saem todos do
mesmo JSON, e é por isso que elas não podem divergir da tabela acima sem que a
divergência apareça no diff de quem mexeu no contrato.

Esta página é a exceção da seção, e ela é a exceção de propósito: ela é a única
folha autoral aqui, e o painel direito não existe nela. As quatro irmãs pintam o
painel a partir de `api_exemplos`; esta passa pela perna do comutador que apenas
delega, e o contraste entre as duas fica na mesma seção, a um clique de
distância.
