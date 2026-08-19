---
title: Servidores MCP
description: O enxerto, uma chave dentro de um arquivo que é seu, segredo nunca escrito, e alvos derivados em vez de declarados.
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

## O `--global` escreve o seu arquivo pessoal

O `--global` escreve num arquivo pessoal por alvo em vez de num arquivo de
repositório, como `~/.claude.json` para o Claude Code, ou o perfil de usuário do
VS Code, que é um caminho diferente por sistema operacional. Esse arquivo é seu
num sentido mais forte que um arquivo de repositório: o `~/.claude.json`, por
exemplo, carrega também o seu identificador de usuário e o estado de onboarding.

Nada mais nele é tocado, e como um enxerto nunca substitui arquivo inteiro, só
acrescenta chave, também não há portão de aprovação: um servidor escrito no seu
próprio arquivo pessoal é um que você já aprovou implicitamente ao escrevê-lo.

## O segredo nunca é escrito, o endereço é

Uma receita declara um segredo como **slot**, um nome e um papel, nunca um valor
e nunca uma grafia específica. O que aterrissa no arquivo de configuração é a
referência que o próprio runtime expande na hora de conectar, e não o segredo.

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

Essas duas últimas linhas são a distinção inteira. O slot é o que o `overpower`
se recusa a escrever, e todo o resto de `env` é o que ele escreve porque pode. Um
endereço como uma URL base não é segredo, e tratá-lo como se fosse só deixaria o
servidor sem achar aquilo com que ele deve conversar.

Existem três papéis de slot, `env`, `header` e `bearer`. Um slot `bearer` é
renderizado como `Authorization: Bearer ${VAR}` sem que a receita jamais precise
soletrar essa string. Nenhuma referência carrega valor padrão, porque a sintaxe
`${VAR:-fallback}` é entendida por exatamente um runtime, e em todos os outros
que leem o mesmo `.mcp.json` a expressão inteira é tratada como string literal.

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
