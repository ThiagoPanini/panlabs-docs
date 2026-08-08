# ADRs

Decisões de arquitetura deste repo, numeradas e imutáveis. Formato: `NNNN-slug-em-ptbr.md`.

Um ADR nasce quando uma decisão do mapa de wayfinding tem consequência estrutural duradoura — algo que restringe o que se pode construir depois. Decisão que só responde uma pergunta e se esgota fica no ticket; não vira ADR.

O teste que classifica é um só: **a regra sobrevive à troca de skin?** Se ela continua valendo com a marca corporativa inteira por cima, não é design — é arquitetura, e sai da spec. A spec **cita** o ADR e nunca o repete.

## Os sete

São sete ao todo, e a numeração é a da spec — não a ordem em que os arquivos aparecem. Os quatro do slice 1 e o do slice 2 estão escritos; os dois restantes nascem no slice que produz a superfície que eles governam, e por isso há buraco na sequência.

| # | ADR | Estado |
| ---: | --- | --- |
| 1 | [Doutrina de CSS](0001-doutrina-de-css.md) — `:root[data-theme='light']` como override, `@layer` fora, adaptador de mão única | escrito |
| 2 | [Política de swizzle](0002-politica-de-swizzle.md) — escada de seis degraus, orçamento `unsafe` zero, disciplina de registro | escrito |
| 3 | [Reduced-motion é propriedade da camada de token](0003-reduced-motion-na-camada-de-token.md), não dos componentes | escrito |
| 4 | [Contrato de estado de entrada](0004-contrato-de-estado-de-entrada.md) — `outline` universal em `:focus-visible`, `:active`, piso de alvo no toque | escrito |
| 5 | [A Referência da API é gerada de contrato OpenAPI](0005-referencia-da-api-gerada-de-contrato.md) — dois contratos JSON, gerador fora do build, saída commitada | escrito |
| 6 | A busca é índice local no repositório, sem serviço externo | slice 7 |
| 7 | [`trailingSlash: false`](0007-trailingslash-false.md) — URLs sem barra final | escrito |

**Os 1, 2, 3 e 7 nasceram juntos, e não por conveniência:** os quatro restringem tudo o que se escreve depois. Um agente que só descobre a política de swizzle no quinto slice já gastou degraus que não podia.

## Leitura obrigatória antes de escrever código

Os seis escritos, nesta ordem. O ADR 1 primeiro: quem escreve CSS sem ele produz modo escuro que quebra em silêncio. O ADR 5 fecha a lista porque ele governa a única rota gerada do site — quem edita a Referência da API sem lê-lo edita a página em vez do contrato.
