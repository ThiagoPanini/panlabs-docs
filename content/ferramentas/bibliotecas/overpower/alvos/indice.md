---
title: Alvos
description: Os 77 runtimes, os dois escopos, e onde cada artefato aterrissa em disco.
---

# Alvos

Onde uma skill aterrissa é função de três coisas: o tipo do artefato, o runtime
que você nomeou e o escopo em que você está escrevendo. Esta página cobre os
dois últimos.

## Os dois escopos

**Projeto** é o padrão, e ele só vale dentro de um repositório git. Fora de um,
uma linha de flags comum recusa, saída `2`, porque a regra que este produto segue
é que *o git é o manifesto*: nada mais numa máquina consegue auditar o que uma
escrita silenciosa deixou para trás. **Global**, com `--global` ou `-g`, escreve
sob o diretório do usuário, e não precisa de git nenhum.

Os dois escopos não são a mesma operação com raiz diferente. Eles escrevem de
formas diferentes.

| | Projeto | Global |
| --- | --- | --- |
| O que aterrissa | cópia real, sempre | cópia real no primeiro destino, link relativo nos demais |
| Precisa de git | sim, e recusa fora dele | não |
| Rede de segurança | `git status` revela e desfaz | nenhuma, e é por isso que `--force` existe |
| Destino ocupado | sobrescreve, porque o git mostra | pergunta num terminal; recusa com saída `3` sem terminal, sob `--yes` ou sob `--dry-run`; `--force` sobrescreve sem perguntar |

### Os dois escopos, vistos do disco

A tabela acima diz a regra; isto é o que ela produz. Uma skill instalada para
dois runtimes que compartilham a mesma pasta:

```
# escopo de projeto, dentro do repositório
.claude/skills/panlabs-python-standards/
├── SKILL.md
└── references/...

# escopo de máquina, sob o diretório do usuário
~/.claude/skills/panlabs-python-standards/     ← cópia real, o primeiro destino
~/.agents/skills/panlabs-python-standards  ->  ../../.claude/skills/panlabs-python-standards
```

O segundo destino em diante é **link relativo**, e relativo de propósito: um
diretório de usuário que muda de caminho, ou que é sincronizado entre máquinas,
continua resolvendo.

O `doctor` conhece a diferença e a lê dos dois lados. Um link que aponta para o
vazio é `dangling link`; um link que virou arquivo de texto, porque alguém
copiou a pasta sem preservar links, é `link virado texto`. Os dois são achado, e
achado reprova.

Em escopo de **projeto**, toda aterrissagem é cópia real, nunca link simbólico.
Isso é deliberado: sob `core.symlinks=false`, um valor de configuração do git que
um clone pode herdar calado, um link commitado é conferido como arquivo de texto
comum, e o equipamento estaria quebrado para quem clonou. Copiar contorna esse
modo de falha por inteiro.

Em escopo **global**, cada seleção sobe uma escadinha: o primeiro destino da
ordem da própria tabela recebe cópia real, e todo destino depois dele vira **link
relativo** apontando para essa primeira cópia. Relativo de propósito, para que o
link continue funcionando se o `$HOME` mudar de lugar. No Windows o mesmo papel é
cumprido por uma junção, que não precisa de privilégio elevado. Onde nem link nem
junção podem ser criados, a escrita degrada em silêncio para uma segunda cópia
real, imprime um aviso dizendo isso, e ainda sai `0`.

## O grupo universal

Vários runtimes leem exatamente o mesmo diretório. Em escopo de projeto, 19 dos
77, incluindo a chave sintética `universal`, leem `.agents/skills`, o que faz
dele o maior destino compartilhado. Apesar do nome, ele não é um caminho que
alcança todo runtime: medido contra o Claude Code 2.1.223, ele não descobre
skills ali, e o Codex também não lê `.claude/skills`.

Em escopo global o mesmo grupo encolhe para 6. O `cline`, o `dexto`, o
`kimi-code-cli`, o `loaf`, o `warp` e o `zed` leem `~/.agents/skills`, enquanto o
`amp` lê `~/.config/agents/skills` no caminho derivado do XDG dele, o `codex` lê
`~/.codex/skills` e o `cursor` lê `~/.cursor/skills`.

O plano sempre nomeia todo destino e quem o lê, então uma seleção que cai numa
pasta compartilhada aparece como uma escrita servindo vários runtimes, nunca como
promessa de uma instalação por runtime.

## A tabela de runtimes

São 77 linhas: 76 transcritas do mapa de runtimes do projeto `vercel-labs/skills`
lá de cima, atribuído em `NOTICE`, mais o `vscode`, que não tem destino de skill
em nenhum dos escopos e existe nesta tabela só para que o passo de enxerto de MCP
do assistente tenha um nome para ele.

74 dos 77 têm destino de skill em escopo global. O `eve` e o `promptscript` não
têm, então pedir um dos dois sob `--global` é uma linha válida com resposta
negativa, saída `3`, e não uma linha inválida.

O `vscode` é o terceiro, e ele recusa por outro eixo: ele não tem destino de
skill em **escopo nenhum**, e a recusa não muda com `--global`. A mensagem
também é outra, e diz o que ele aceita no lugar:

```
`vscode` takes MCP servers and has no skills destination of its own;
```

`--runtime vscode --mcp <nome>` instala; `--runtime vscode --skill <nome>` sai
`3` nos dois escopos.

:::note
Os caminhos globais abaixo usam `~` para o diretório do usuário. Vários são de
fato resolvidos por uma variável de ambiente primeiro, caindo no caminho mostrado
só quando ela não está posta. São três mecanismos, e a tabela não os distingue:

- **seis honram uma variável da própria ferramenta**: `autohand-code`
  (`AUTOHAND_HOME`), `claude-code` (`CLAUDE_CONFIG_DIR`), `codex`
  (`CODEX_HOME`), `grok` (`GROK_HOME`), `hermes-agent` (`HERMES_HOME`) e
  `mistral-vibe` (`VIBE_HOME`);
- **seis resolvem por `XDG_CONFIG_HOME`** antes de cair em `~/.config`, e são
  `amp`, `devin`, `goose`, `opencode`, `replit` e `universal`;
- **um usa o primeiro diretório que existir**: o `openclaw` procura
  `~/.openclaw`, `~/.clawdbot` e `~/.moltbot` nessa ordem, e cai no primeiro
  quando nenhum existe.

Os demais caminhos de `~/.config` na tabela são literais, não XDG: o `crush` e o
`kimchi` moram lá por escrita direta, e não mudam com a variável.

Valor em branco conta como não posto. **Valor relativo é ignorado de propósito**,
e a ferramenta declara essa divergência contra o upstream.
:::

| Chave de `--runtime` | Runtime | Escopo de projeto | Escopo global |
| --- | --- | --- | --- |
| `aider-desk` | AiderDesk | `.aider-desk/skills` | `~/.aider-desk/skills` |
| `amp` | Amp | `.agents/skills` | `~/.config/agents/skills` |
| `antigravity` | Antigravity | `.agents/skills` | `~/.gemini/antigravity/skills` |
| `antigravity-cli` | Antigravity CLI | `.agents/skills` | `~/.gemini/antigravity-cli/skills` |
| `astrbot` | AstrBot | `data/skills` | `~/.astrbot/data/skills` |
| `autohand-code` | Autohand Code CLI | `.autohand/skills` | `~/.autohand/skills` |
| `augment` | Augment | `.augment/skills` | `~/.augment/skills` |
| `bob` | IBM Bob | `.bob/skills` | `~/.bob/skills` |
| `claude-code` | Claude Code | `.claude/skills` | `~/.claude/skills` |
| `openclaw` | OpenClaw | `skills` | `~/.openclaw/skills` |
| `cline` | Cline | `.agents/skills` | `~/.agents/skills` |
| `codearts-agent` | CodeArts Agent | `.codeartsdoer/skills` | `~/.codeartsdoer/skills` |
| `codebuddy` | CodeBuddy | `.codebuddy/skills` | `~/.codebuddy/skills` |
| `codemaker` | Codemaker | `.codemaker/skills` | `~/.codemaker/skills` |
| `codestudio` | Code Studio | `.codestudio/skills` | `~/.codestudio/skills` |
| `codex` | Codex | `.agents/skills` | `~/.codex/skills` |
| `command-code` | Command Code | `.commandcode/skills` | `~/.commandcode/skills` |
| `continue` | Continue | `.continue/skills` | `~/.continue/skills` |
| `cortex` | Cortex Code | `.cortex/skills` | `~/.snowflake/cortex/skills` |
| `crush` | Crush | `.crush/skills` | `~/.config/crush/skills` |
| `cursor` | Cursor | `.agents/skills` | `~/.cursor/skills` |
| `deepagents` | Deep Agents | `.agents/skills` | `~/.deepagents/agent/skills` |
| `devin` | Devin for Terminal | `.devin/skills` | `~/.config/devin/skills` |
| `dexto` | Dexto | `.agents/skills` | `~/.agents/skills` |
| `droid` | Droid | `.factory/skills` | `~/.factory/skills` |
| `eve` | Eve | `agent/skills` | nenhum |
| `firebender` | Firebender | `.agents/skills` | `~/.firebender/skills` |
| `forgecode` | ForgeCode | `.forge/skills` | `~/.forge/skills` |
| `gemini-cli` | Gemini CLI | `.agents/skills` | `~/.gemini/skills` |
| `github-copilot` | GitHub Copilot | `.agents/skills` | `~/.copilot/skills` |
| `goose` | Goose | `.goose/skills` | `~/.config/goose/skills` |
| `grok` | Grok Build | `.grok/skills` | `~/.grok/skills` |
| `hermes-agent` | Hermes Agent | `.hermes/skills` | `~/.hermes/skills` |
| `inference-sh` | inference.sh | `.inferencesh/skills` | `~/.inferencesh/skills` |
| `jazz` | Jazz | `.jazz/skills` | `~/.jazz/skills` |
| `junie` | Junie | `.junie/skills` | `~/.junie/skills` |
| `iflow-cli` | iFlow CLI | `.iflow/skills` | `~/.iflow/skills` |
| `kilo` | Kilo Code | `.kilocode/skills` | `~/.kilocode/skills` |
| `kimchi` | Kimchi | `.kimchi/skills` | `~/.config/kimchi/harness/skills` |
| `kimi-code-cli` | Kimi Code CLI | `.agents/skills` | `~/.agents/skills` |
| `kiro-cli` | Kiro CLI | `.kiro/skills` | `~/.kiro/skills` |
| `kode` | Kode | `.kode/skills` | `~/.kode/skills` |
| `lingma` | Lingma | `.lingma/skills` | `~/.lingma/skills` |
| `loaf` | Loaf | `.agents/skills` | `~/.agents/skills` |
| `mcpjam` | MCPJam | `.mcpjam/skills` | `~/.mcpjam/skills` |
| `minimax-code` | MiniMax Code | `.minimax/skills` | `~/.minimax/skills` |
| `mistral-vibe` | Mistral Vibe | `.vibe/skills` | `~/.vibe/skills` |
| `moxby` | Moxby | `.moxby/skills` | `~/.moxby/skills` |
| `mux` | Mux | `.mux/skills` | `~/.mux/skills` |
| `opencode` | OpenCode | `.agents/skills` | `~/.config/opencode/skills` |
| `openhands` | OpenHands | `.openhands/skills` | `~/.openhands/skills` |
| `ona` | Ona | `.ona/skills` | `~/.ona/skills` |
| `pi` | Pi | `.pi/skills` | `~/.pi/agent/skills` |
| `qoder` | Qoder | `.qoder/skills` | `~/.qoder/skills` |
| `qoder-cn` | Qoder CN | `.qoder/skills` | `~/.qoder-cn/skills` |
| `qwen-code` | Qwen Code | `.qwen/skills` | `~/.qwen/skills` |
| `replit` | Replit | `.agents/skills` | `~/.config/agents/skills` |
| `reasonix` | Reasonix | `.reasonix/skills` | `~/.reasonix/skills` |
| `rovodev` | Rovo Dev | `.rovodev/skills` | `~/.rovodev/skills` |
| `roo` | Roo Code | `.roo/skills` | `~/.roo/skills` |
| `tabnine-cli` | Tabnine CLI | `.tabnine/agent/skills` | `~/.tabnine/agent/skills` |
| `terramind` | Terramind | `.terramind/skills` | `~/.terramind/skills` |
| `tinycloud` | Tinycloud | `.tinycloud/skills` | `~/.tinycloud/skills` |
| `trae` | Trae | `.trae/skills` | `~/.trae/skills` |
| `trae-cn` | Trae CN | `.trae/skills` | `~/.trae-cn/skills` |
| `warp` | Warp | `.agents/skills` | `~/.agents/skills` |
| `windsurf` | Windsurf | `.windsurf/skills` | `~/.codeium/windsurf/skills` |
| `zed` | Zed | `.agents/skills` | `~/.agents/skills` |
| `zcode` | ZCode | `.zcode/skills` | `~/.zcode/skills` |
| `zencoder` | Zencoder | `.zencoder/skills` | `~/.zencoder/skills` |
| `zenflow` | Zenflow | `.zencoder/skills` | `~/.zencoder/skills` |
| `neovate` | Neovate | `.neovate/skills` | `~/.neovate/skills` |
| `pochi` | Pochi | `.pochi/skills` | `~/.pochi/skills` |
| `promptscript` | PromptScript | `.agents/skills` | nenhum |
| `adal` | AdaL | `.adal/skills` | `~/.adal/skills` |
| `vscode` | VS Code | nenhum | nenhum |
| `universal` | Universal | `.agents/skills` | `~/.config/agents/skills` |

O `vscode` não tem linha em nenhuma das duas colunas porque ele não é destino de
skill. Ele existe na tabela só para o enxerto de MCP, que lê e escreve
`.vscode/mcp.json` e nada sob `skills/`. O `universal` não é ferramenta de
verdade: é chave sintética nomeando diretamente o destino compartilhado
`.agents/skills`, para quando você quiser equipar essa pasta sem nomear cada
runtime que por acaso a lê.
