---
title: Servidores MCP
description: O enxerto, uma chave dentro de um arquivo que é seu, o slot que o escopo decide onde aterrissa, e alvos derivados em vez de declarados.
---

# Servidores MCP

Todo outro artefato que o `overpower` instala **copia**: aparece um arquivo ou um
diretório que não estava lá, e o `git status` o mostra como novo. Um servidor MCP
**enxerta**: aparece uma chave dentro de um documento de configuração que já é
seu e que você já edita, e o `git diff` mostra uma mudança num arquivo seu em vez
de um arquivo novo.

```bash
uvx overpower@latest install --mcp cloudflare --runtime claude-code
```

Como o destino é arquivo de outra pessoa, o seu e não o do `overpower`, três
coisas decorrem disso, e as três são garantias, não comportamento acidental.

| Garantia | O que ela significa |
| --- | --- |
| O plano nomeia a chave | a última linha antes da escrita lê `.mcp.json › mcpServers.cloudflare ← claude-code`, a chave exata dentro do documento exato |
| O resto do documento sobrevive byte a byte | comentários preservados, chaves de raiz desconhecidas preservadas, e um servidor que já estava lá não é reformatado |
| Servidor de mesmo nome é sobrescrito | sem perguntar e sem `--force`, a mesma regra que um caminho em colisão segue |

Escrever o arquivo inteiro de volta por um serializador genérico de JSON o
reflowaria independentemente de algo relevante ter mudado, e o `git diff`
deixaria de responder o que a ferramenta de fato fez contra o que por acaso
estava perto.

:::warning
Um arquivo de configuração que *já* está quebrado é **recusado, nunca
consertado**. Editar um arquivo que não é do `overpower`, por iniciativa própria
dele, não é coisa que uma instalação tenha permissão de fazer.
:::

Onde o próprio runtime segura um servidor recém-escrito antes de ele conectar, o
comando diz isso. No Claude Code, um servidor escrito em `.mcp.json` nasce
pendente de aprovação e fica inerte até você aprovar ali, então a instalação
imprime esse aviso nomeando o arquivo, ainda com saída `0`, porque a escrita
funcionou e o que resta é um passo que pertence a você.

:::warning
O `doctor` lê o mesmo fato de outro jeito. Servidor pendente de aprovação é um
dos cinco **achados** dele, e achado reprova: um `install` que saiu `0` seguido
de um `doctor` na mesma máquina sai `3` pelo mesmo servidor, até você aprovar.
Numa esteira que encadeia os dois, aprove antes ou separe os passos.
:::

## O `--global` escreve o seu arquivo pessoal

O `--global` escreve num arquivo pessoal por alvo em vez de num arquivo de
repositório, como `~/.claude.json` para o Claude Code, ou o perfil de usuário do
VS Code, que é um caminho diferente por sistema operacional. Esse arquivo é seu
num sentido mais forte que um arquivo de repositório: o `~/.claude.json`, por
exemplo, carrega também o seu identificador de usuário e o estado de onboarding.

Nada mais nele é tocado, e como um enxerto nunca substitui arquivo inteiro, só
acrescenta chave, também não há portão de aprovação: um servidor escrito no seu
próprio arquivo pessoal é um que você já aprovou implicitamente ao escrevê-lo.

## O slot é declarado como nome e papel, nunca como valor

Uma receita declara um segredo como **slot**, um nome e um papel, nunca um valor
e nunca uma grafia específica. O endereço é outra coisa: uma URL base não é
segredo, e tratá-la como se fosse só deixaria o servidor sem achar aquilo com que
ele deve conversar. Por isso `server.env` é escrito no arquivo e o slot não.

```json
{
  "coolify": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@masonator/coolify-mcp@2.12.0"],
    "env": {
      "COOLIFY_BASE_URL": "https://vps.panlabs.tech",
      "COOLIFY_ACCESS_TOKEN": "${COOLIFY_ACCESS_TOKEN}"
    }
  }
}
```

Existem três papéis de slot, `env`, `header` e `bearer`. Um slot `bearer` é
renderizado como `Authorization: Bearer ${VAR}` sem que a receita jamais precise
soletrar essa string. Nenhuma referência carrega valor padrão, porque a sintaxe
`${VAR:-fallback}` é entendida por exatamente um runtime, e em todos os outros
que leem o mesmo `.mcp.json` a expressão inteira é tratada como string literal.

## Onde o valor do slot aterrissa depende do escopo

**O escopo decide, e a régua é onde o `git` alcança.** No escopo de repositório o
que aterrissa é a referência acima e nada mais: o arquivo é versionado, e um
segredo literal ali viaja no primeiro `push`. No escopo de máquina o arquivo não é
versionado, e o `install` **pergunta o valor de cada slot e o escreve literal**,
para que uma execução deixe a configuração completa em vez de terminar avisando
que a variável é sua para exportar.

| Escopo | O que aterrissa | Quem preenche |
| --- | --- | --- |
| repositório | `${VAR}`, e nada mais | você, exportando a variável |
| máquina | o valor digitado, literal | a pergunta durante o `install` |
| VS Code | `inputs[]` com `password: true` | o próprio editor, que guarda sob proteção do sistema |

A pergunta é **mascarada**, e o valor nunca é ecoado, nem na tela nem em nenhuma
saída do produto. Uma variável já exportada é oferecida como padrão dentro do
mesmo campo mascarado, então quem já a exportou para testar o servidor à mão
confirma com uma tecla, sem que ela chegue a ser desenhada.

Quatro regras fecham o comportamento, e nenhuma delas é implícita:

- **sem terminal, ou com `--yes`, nada é perguntado**, e o que aterrissa é a
  referência, exatamente como antes;
- **valor já gravado é mantido e não é perguntado de novo**, e `--force` reabre a
  pergunta, porque valor gravado é o que ocupa o destino;
- **resposta vazia grava `${VAR}` de volta**, que é o gesto documentado para tirar
  o segredo do arquivo;
- **o `--dry-run` nunca pergunta**, e anuncia quantos slots a linha real pediria.

:::warning
O segredo escrito no escopo de máquina mora num arquivo que o `git` não alcança,
e é isso que autoriza a escrita. Não repita o gesto num arquivo versionado: no
escopo de repositório o `overpower` recusa escrever o valor, e colar um à mão
publica o segredo no primeiro `push`.
:::

## Os alvos são derivados, nunca declarados

O `list --mcp` imprime uma linha `targets` para toda receita, mas não existe
campo `targets` em lugar nenhum do arquivo de receita.

Quais pares de runtime e escopo uma dada receita consegue de fato servir é
calculado do transporte dela e dos papéis dos slots dela contra uma tabela em
código, e impresso fresco toda vez. Um campo declarado envelheceria em silêncio
no dia em que um runtime ganhasse a capacidade de receber aquele servidor; um
derivado não pode, porque é recalculado da tabela atual a cada leitura.

:::note
Cada alvo impresso é um **par**, um runtime e o escopo em que ele lê aquele
servidor. Uma receita que nenhum alvo consegue servir imprime `none` em vez de
uma linha vazia, porque a lista vazia e a resposta *nenhum* são coisas
diferentes.
:::
