# ADRs

Decisões de arquitetura deste repo, numeradas e imutáveis. Formato: `NNNN-slug-em-ptbr.md`.

Um ADR nasce quando uma decisão do mapa de wayfinding tem consequência estrutural duradoura — algo que restringe o que se pode construir depois. Decisão que só responde uma pergunta e se esgota fica no ticket; não vira ADR.

O teste que classifica é um só: **a regra sobrevive à troca de skin?** Se ela continua valendo com a marca corporativa inteira por cima, não é design — é arquitetura, e sai da spec. A spec **cita** o ADR e nunca o repete.

## Os dez

São dez ao todo, e a numeração é a da spec — não a ordem em que os arquivos aparecem. **Os dez estão escritos**, e **dois estão superados**: o 5 pelo 8, e o 8 pelo 9. Os dois últimos nasceram juntos, no slice que trouxe o `overpower` para dentro do acervo — um decide o contrato que gera a referência dele, o outro decide a forma da sidebar que o hospeda.

| # | ADR | Estado |
| ---: | --- | --- |
| 1 | [Doutrina de CSS](0001-doutrina-de-css.md) — `:root[data-theme='light']` como override, `@layer` fora, adaptador de mão única | escrito |
| 2 | [Política de swizzle](0002-politica-de-swizzle.md) — escada de seis degraus, orçamento `unsafe` zero, disciplina de registro | escrito |
| 3 | [Reduced-motion é propriedade da camada de token](0003-reduced-motion-na-camada-de-token.md), não dos componentes | escrito |
| 4 | [Contrato de estado de entrada](0004-contrato-de-estado-de-entrada.md) — `outline` universal em `:focus-visible`, `:active`, piso de alvo no toque | escrito |
| 5 | [A Referência da API é gerada de contrato OpenAPI](0005-referencia-da-api-gerada-de-contrato.md) — dois contratos JSON, gerador fora do build, saída commitada | **superado pelo 8** |
| 6 | [A busca é índice local no repositório, sem serviço externo](0006-busca-local-sem-servico-externo.md) — o motivo jurídico e de rede, e a nota de migração de três edições | escrito |
| 7 | [`trailingSlash: false`](0007-trailingslash-false.md) — URLs sem barra final | escrito |
| 8 | [A referência de biblioteca é gerada de contrato de assinatura](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) — assinatura de função, tipo e módulo; fragmento de sidebar; doze recusas | **superado pelo 9** |
| 9 | [A referência de CLI é gerada de contrato de superfície de comando](0009-referencia-de-cli-gerada-de-contrato-de-superficie-de-comando.md) — espécies `aplicacao` e `comando`, quatro entradas, a máquina do 8 inteira | escrito, **consequência 6 superada pelo 11** |
| 10 | [A categoria de sidebar não é destino](0010-a-categoria-de-sidebar-nao-e-destino.md) — separador mudo no topo, nó colapsável abaixo, a forma *índice de categoria* morre, teto de profundidade 4 | escrito |
| 11 | [A varredura do overpower deixa de ser humana](0011-a-varredura-do-overpower-e-de-maquina.md) — o pino como garantia, a skill como trabalho, o gatilho no repositório da ferramenta | escrito |

**Os 1, 2, 3 e 7 nasceram juntos, e não por conveniência:** os quatro restringem tudo o que se escreve depois. Um agente que só descobre a política de swizzle no quinto slice já gastou degraus que não podia.

**Superado não é apagado, e é a imutabilidade quem decide isso.** O 5 continua no lugar, com o conteúdo intacto e um cabeçalho apontando para o 8; o 8 ganhou o mesmo cabeçalho apontando para o 9. O que sobreviveu nos dois casos foi a *decisão* — gerar de contrato, com saída versionada e portão. O que morreu foi diferente em cada um: no 5 foi a **premissa** (não há API HTTP), e no 8 foi o **sujeito** (`Biblioteca C` saiu do acervo). Editá-los apagaria o registro de *"decidimos OpenAPI uma vez, e por quê"* e de *"exercitamos um gerador de assinatura uma vez"* — que é exatamente o que um ADR existe para guardar, e é informação que a próxima biblioteca importável vai querer.

**O 10 não nasceu do `overpower`, e vale dizer.** As três correções que ele carrega — a categoria não é destino, grupo aninhado nasce fechado, o teto de profundidade tem lastro — estavam erradas antes de o `overpower` existir; duas delas contra medição da âncora, e uma contra um carimbo `herdado` falso. O `overpower` foi o gatilho, não a causa.

## Leitura obrigatória antes de escrever código

Os dez, nesta ordem, **e o 5 e o 8 leem-se pelo 9**: quem edita a referência gerada sem lê-lo edita a página em vez do contrato. O **10 vem antes de tocar em `sidebars-*.js` ou em qualquer regra de sidebar**: quem não o leu vai escrever categoria com `link`, que é a construção que ele proíbe. O ADR 1 primeiro: quem escreve CSS sem ele produz modo escuro que quebra em silêncio. O ADR 6 fecha a lista porque ele é o único que descreve uma superfície **removível**: tirar a busca é uma linha de config, e saber disso muda como se lê o resto.
