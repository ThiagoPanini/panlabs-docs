# ADRs

Decisões de arquitetura deste repo, numeradas e imutáveis. Formato: `NNNN-slug-em-ptbr.md`.

Um ADR nasce quando uma decisão do mapa de wayfinding tem consequência estrutural duradoura — algo que restringe o que se pode construir depois. Decisão que só responde uma pergunta e se esgota fica no ticket; não vira ADR.

O teste que classifica é um só: **a regra sobrevive à troca de skin?** Se ela continua valendo com a marca corporativa inteira por cima, não é design — é arquitetura, e sai da spec. A spec **cita** o ADR e nunca o repete.

## Os oito

São oito ao todo, e a numeração é a da spec — não a ordem em que os arquivos aparecem. **Os oito estão escritos**: o último a nascer foi o 8, no slice que produziu a superfície que ele governa.

| # | ADR | Estado |
| ---: | --- | --- |
| 1 | [Doutrina de CSS](0001-doutrina-de-css.md) — `:root[data-theme='light']` como override, `@layer` fora, adaptador de mão única | escrito |
| 2 | [Política de swizzle](0002-politica-de-swizzle.md) — escada de seis degraus, orçamento `unsafe` zero, disciplina de registro | escrito |
| 3 | [Reduced-motion é propriedade da camada de token](0003-reduced-motion-na-camada-de-token.md), não dos componentes | escrito |
| 4 | [Contrato de estado de entrada](0004-contrato-de-estado-de-entrada.md) — `outline` universal em `:focus-visible`, `:active`, piso de alvo no toque | escrito |
| 5 | [A Referência da API é gerada de contrato OpenAPI](0005-referencia-da-api-gerada-de-contrato.md) — dois contratos JSON, gerador fora do build, saída commitada | **superado pelo 8** |
| 6 | [A busca é índice local no repositório, sem serviço externo](0006-busca-local-sem-servico-externo.md) — o motivo jurídico e de rede, e a nota de migração de três edições | escrito |
| 7 | [`trailingSlash: false`](0007-trailingslash-false.md) — URLs sem barra final | escrito |
| 8 | [A referência de biblioteca é gerada de contrato de assinatura](0008-referencia-de-biblioteca-gerada-de-contrato-de-assinatura.md) — assinatura de função, tipo e módulo; fragmento de sidebar; doze recusas | escrito |

**Os 1, 2, 3 e 7 nasceram juntos, e não por conveniência:** os quatro restringem tudo o que se escreve depois. Um agente que só descobre a política de swizzle no quinto slice já gastou degraus que não podia.

**Superado não é apagado, e é a imutabilidade quem decide isso.** O 5 continua no lugar, com o conteúdo intacto e um cabeçalho apontando para o 8. O que sobreviveu foi a *decisão* — gerar de contrato, com saída versionada e portão; o que morreu foi a premissa, incluindo o título dele. Editá-lo apagaria o registro de *"decidimos OpenAPI uma vez, e por quê"*, que é exatamente o que um ADR existe para guardar.

## Leitura obrigatória antes de escrever código

Os oito, nesta ordem, **e o 5 lê-se pelo 8**: quem edita a referência gerada sem lê-lo edita a página em vez do contrato. O ADR 1 primeiro: quem escreve CSS sem ele produz modo escuro que quebra em silêncio. O ADR 6 fecha a lista porque ele é o único que descreve uma superfície **removível**: tirar a busca é uma linha de config, e saber disso muda como se lê o resto.
