# ADR 12 — O painel monta a linha a partir do modelo, e a assinatura é derivada

**Status:** aceito · slice 11 · 2026-08-20 · estende o [ADR 9](0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md)

## Contexto

O [ADR 9](0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md) fez a página de comando ser projeção de um contrato. O que ele não decidiu é **o que o painel recebe** — e o que ele recebia era um template congelado no build, com `{{marcador}}` em cada argumento editável, que o cliente substituía por `String.replace` a cada tecla.

O template não tem modelo de flag, e a consequência é que ele não sabe dizer três coisas que a ferramenta diz:

| O que a ferramenta faz | O que o template produzia |
| --- | --- |
| a flag é opcional | apagar o campo dava `overpower list --skill ""`, e nenhuma linha da CLI tem essa forma |
| dois seletores em `list` se excluem | montava a linha que a CLI recusa em `TooManySelectorsError` |
| `--skill` acumula em `install` e não acumula em `list` | uma aridade só, para as duas |

A causa raiz estava no schema. `grep -c -E 'obrigatorio|opcional|required'` sobre `contratos/overpower.pt-BR.json` devolvia `0`, e o campo `exemplo` acumulava duas funções — decidir se a flag entra na linha e decidir se ela vira campo editável. É por isso que `list` declarava cinco opções e mostrava uma, e `install` declarava dez e mostrava duas.

E havia uma segunda fonte de verdade que ninguém tinha olhado: a `assinatura` era escrita à mão **ao lado** dos `parametros`, e nada obrigava as duas a concordarem. Medido: no contrato v1 elas já discordavam. A `assinatura` de `install` dizia `--runtime` primeiro e fechava em `--global --force --yes --dry-run`; a lista de `parametros` dizia `--skill` primeiro e fechava em `--dry-run --yes --force --global`. As duas estavam publicadas, as duas passavam em todos os portões, e nenhuma régua podia notar.

## Decisão

**O `api_exemplos` carrega o modelo, não o texto. A linha é montada dos dois lados por `src/theme/MDXComponents/linha.mjs`, e a `assinatura` é derivada pelo mesmo módulo.**

O contrato vai para a **versão 2**, com três listas novas por entrada:

- **`aridade` por parâmetro**, indexada por `(comando, flag)` porque a mesma flag muda de forma entre subcomandos. `--skill` em `install` acumula com separador `,`; em `list` a vírgula é caractere do nome.
- **`minimo` por contexto**, porque terminal e pipe são linhas diferentes. `overpower install` num terminal abre o assistente e é linha completa; o mesmo texto num pipe não tem assistente a abrir.
- **`restricoes`**, cada uma com `tipo`, `guarda`, `precedencia`, a `mensagem` literal, o `exit` e a `classe` do erro.

### As três coisas que o modelo acerta e um schema ingênuo erra

**a) A exclusividade tem escape hatch.** `--mcp` contra os outros seletores é exclusivo **a menos que** `--runtime` esteja presente (`cli.py:652`). É o campo `guarda`, e sem ele o painel marcaria como inválida uma linha que a ferramenta aceita.

**b) A exclusividade de `install` é partição, não todos-contra-todos.** Em `list` os quatro seletores se excluem dois a dois. Em `install` a fronteira é entre a classe MCP e as outras três, e `--skill` com `--ai-framework` na mesma linha é válido. Um `grupoExclusivo` plano erraria os dois comandos — é o campo `particao`.

**c) A precedência decide qual mensagem o leitor vê.** Duas regras podem bater na mesma linha, e a CLI avalia numa ordem. O painel copia a ordem dela em vez de escolher a sua.

### O que o painel NÃO modela, e vira prosa

Ele modela a **linha**, não a máquina. Ficam de fora, por decisão:

- **o estado de disco** — `--force` só é exigida quando o destino global já existe;
- **a alcançabilidade de um runtime por escopo** — o conjunto que `--runtime` aceita é função do escopo;
- **o pulo não monotônico**. Medido: `--runtime cursor --mcp github` sai em recusa, `--runtime cursor --skill X` sai em `0`, e `--runtime cursor --skill X --mcp github` sai em `0` com aviso. **Acrescentar uma flag transforma recusa em sucesso**, e um validador que confira subconjuntos marcaria a terceira linha como inválida.

Um montador estático que tentasse qualquer um dos três seria um interpretador da ferramenta dentro de um site estático.

## O preço, e ele é real

**O contrato ficou maior, e a mão que o edita ficou mais cara.** Cada entrada carrega agora até três listas que antes não existiam, e uma restrição escrita ao contrário produz um painel que ensina a regra errada com o portão 5 verde — ele regenera e diffa, e um modelo internamente coerente mas falso sobre a ferramenta sai byte a byte igual ao que o gerador acabou de emitir.

O que compra parte disso de volta são as **quatro recusas novas** do validador — `grupo-exclusivo-de-um`, `modelo-nomeia-flag-inexistente`, `exclusiva-obrigatoria` e `aridade-incoerente` —, e elas cobram o modelo **contra si mesmo**, nunca contra a ferramenta. O que confere o modelo contra a ferramenta é a varredura do [ADR 11](0011-a-varredura-do-overpower-e-de-maquina.md), que é trabalho de agente, não de portão.

## O que a decisão trouxe junto

> **Correção de fato: a recusa é da REGRA, e a implementação a tratava como sendo da flag.** A decisão dizia *desabilitar com a mensagem ao lado*, e *ao lado* foi lido como *dentro da célula da flag*. Uma regra de exclusividade recusa todos os outros membros de uma vez, então a mensagem era impressa uma vez por membro. Medido no navegador, a 683px: em `install`, marcar `--mcp` fazia a MESMA frase de 105 caracteres aparecer **três vezes** e empurrava a grade de argumentos **186px** para baixo; em `list`, marcar `--skill` produzia **três** frases que só diferiam no nome da flag, e **88px**. As três nasciam embaixo de controles que o leitor não tinha tocado, que é o que as fazia parecer surgidas do nada.
>
> **Uma regra, uma frase, num lugar fixo.** `recusasDaLinha()` agrupa por restrição e devolve uma entrada por regra que morde; o painel a escreve **entre a grade e a linha**, e as caixas desabilitadas daquela regra apontam todas para o mesmo `aria-describedby` — três controles com uma descrição, que é mais barato para quem ouve do que três frases idênticas. A grade passou a **não se mexer**: 0px de delta nos três casos medidos.
>
> **`{flags}` é reescrito sobre o conjunto inteiro.** A avaliação por flag produzia o par *(ligada, candidata)*, e uma frase de grupo que herdasse um desses pares escolheria um arbitrário entre os três. A CLI nomeia toda flag que recebeu — `" and ".join(self.flags)`, e o docstring de `TooManySelectorsError` diz por quê: *"names every flag it was given, so the line can be cut in one edit"* —, então a frase do grupo é a que ela imprimiria para essa linha.

**O `placeholder.mjs` saiu.** Ele existia para uma coisa só: manter a sintaxe do marcador igual entre quem o escrevia (o gerador) e quem o lia (o painel). Sem template não há marcador, e um módulo cuja justificativa inteira deixou de valer é código morto. `src/theme/` continua em dez arquivos porque `linha.mjs` entrou no mesmo movimento.

**A cobrança 14 do portão 4 ganhou exceção.** Três mensagens do `overpower` carregam travessão literal, entre elas a que o painel de `install` mostra, e o contrato passou a carregá-las. Duas regras deste repositório colidiam de frente: `solucao-de-problemas.md` promete citar a mensagem como a ferramenta a imprime, e a cobrança 14 fecha `contratos/` em zero travessão. A saída reusa o padrão da invariante 2 — **quem carrega o literal declara no próprio preâmbulo** —, e o travessão passa só dentro de região de citação: cerca de código, a linha `api_exemplos:` da página gerada, ou um valor `"mensagem"` do contrato.

**O marcador é `{/* cita-saida-de-ferramenta */}`, e não `<!-- ... -->`.** Medido nesta máquina: sob MDX 3 o comentário HTML não compila (*Unexpected character `!` (U+0021) before name*), e toda página deste site passa pelo compilador MDX — `.md` inclusive, porque a config não declara `markdown.format`.

## Dissenso registrado

- **Manter a `assinatura` escrita à mão**, deixando a derivação só para o painel. Recusado: era exatamente a segunda fonte que já tinha divergido em silêncio. O validador agora **recusa** o campo, e a régua congela as quatro assinaturas do v1 para provar que derivar não mudou o que o leitor vê.
- **Reordenar `parametros` para a ordem em que o Typer os declara**, que é a autoridade sobre a ferramenta. Recusado: ordem de assinatura é decisão de apresentação, não fato sobre a CLI, e a ordem publicada é a que o leitor já conhece. O que se fez foi o contrário — alinhar `parametros` à assinatura publicada, fechando a divergência sem mexer na página.
- **Os 77 runtimes como widget de seleção.** Recusado pelo **zero 5** de `cinco-zeros.sh`, que proíbe autor novo de modelo de interação. O domínio entra no contrato como cardinalidade e procedência; a tabela já existe em `alvos/indice.md`, e duplicá-la criaria a segunda fonte de verdade que este trabalho existe para matar.
- **Um botão-alternador próprio no lugar da caixa de seleção.** Recusado pela mesma razão: acrescentar uma flag é ligar e desligar, e `<input type="checkbox">` é o controle que o HTML já tem para isso — com foco, tecla e ARIA de graça.
- **Esconder a flag recusada em vez de desabilitá-la.** Recusado: uma flag que some quando outra é ligada faz o leitor procurar o que acabou de ver. Desabilitada, com a mensagem que a ferramenta imprime, ela **ensina a regra** — que é a diferença entre um painel que impede o erro e um que o explica.
- **Testar o painel renderizado**, com biblioteca de teste de componente. Recusado pelo **axioma 2**: não há infraestrutura de teste de React no repositório e criá-la custaria dependência npm nova. A saída é a mesma que `SearchBar/escada.mjs` já tomou — a lógica sai do componente para um módulo puro, e é o módulo que a régua exercita.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| O `api_exemplos` carrega modelo, não template | origem própria | [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133); o template congelado não sabe dizer *opcional* |
| Contrato na versão 2, com `aridade`, `minimo` e `restricoes` | origem própria | [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133) |
| A aridade é indexada por `(comando, flag)` | **origem própria (verificação)** | medido em `overpower 0.27.0` por `typer.main.get_command(app)`: `--skill` tem `multiple=True` em `install` e `multiple=False` em `list` |
| `--skill`, `--bundle`, `--mcp`, `--ai-framework` e `--runtime` acumulam em `install` | **origem própria (verificação)** | `_accumulated`, `src/overpower/cli.py:1195-1204`, chamada em `:625-628` e `:640` — e em `list`, nunca |
| A guarda `--runtime` suspende a exclusividade de classes | **origem própria (verificação)** | `src/overpower/cli.py:652-653`, `if mcps and (frameworks or bundles or skills) and not asked.runtimes` |
| Nenhum parâmetro é obrigatório no parser | **origem própria (verificação)** | os quatro grupos saem `required=False`; a obrigatoriedade é sempre condicional a terminal, `cwd` ou estado de disco |
| O domínio de `--runtime` tem cardinalidade 77 | **origem própria (verificação)** | `known_runtimes()`, `src/overpower/runtimes.py:1015`, sobre a tupla `RUNTIMES` de `:608`; a prosa de `planning.py:384` diz 76 e está velha |
| As mensagens de recusa são citação byte a byte | **origem própria (verificação)** | as quatro conferidas contra `str(Erro(...))` da própria ferramenta |
| A `assinatura` é derivada, e escrevê-la é recusa | origem própria | a divergência de ordem entre `assinatura` e `parametros` no contrato v1 |
| A ordem de `parametros` alinha-se à assinatura publicada | origem própria | ordem de apresentação é decisão, e a publicada é a que o leitor conhece |
| Quatro recusas de coerência do modelo | origem própria | [#133](https://github.com/ThiagoPanini/panlabs-docs/issues/133); elas cobram o modelo contra si mesmo, nunca contra a ferramenta |
| Exceção de travessão por declaração de preâmbulo | herdado | o padrão é o da invariante 2 de `invariantes.sh`, que já exige declaração para literal de desenho |
| O marcador é `{/* */}` e não `<!-- -->` | **origem própria (verificação)** | medido: `@mdx-js/mdx` recusa o comentário HTML com *Unexpected character `!` (U+0021) before name* |
| `linha.mjs` é módulo puro compartilhado | herdado | o precedente é `SearchBar/escada.mjs`, importado pela régua e pelo cliente pela mesma razão |
| A caixa de seleção é `<input type="checkbox">` nativa | herdado | o contrato de estado de entrada, [ADR 4](0004-contrato-de-estado-de-entrada.md), cobre foco e press de graça |
