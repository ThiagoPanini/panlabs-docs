# Fluxo de desenvolvimento

## Do problema à execução

```
/wayfinder  →  /to-spec  →  /to-tickets  →  implementação  →  worktree  →  PR  →  merge no verde
```

Uma decisão grande demais para uma sessão vira **mapa** de wayfinding, resolvido um ticket de decisão por vez. Um mapa fechado vira **spec**. Uma spec vira **tickets** com arestas de bloqueio declaradas.

## O mapa deste repo NÃO carrega execução

O mapa que originou este repo segue o **padrão do wayfinder**: ele decide, não constrói. O destino dele é a spec de documentação — `docs/design/` mais os ADRs — no nível em que um agente consegue implementar sem reinterpretar.

A construção do site Docusaurus é trabalho **posterior ao mapa**, disparado por `/to-tickets` sobre a spec fechada.

## Portões

São **seis**, todos de custo zero em dependência, e cada um nasce no slice que cria a superfície que ele protege — nenhum é bolado no fim. Os que já existem:

| # | Portão | Comando | Cadência |
| ---: | --- | --- | --- |
| 1 | literal de cor, comprimento, tempo ou curva fora do arquivo de tokens **e** limiar de media query fora do único do projeto | `npm run portao:1` | commit |
| 2 | `transition:`/`animation:` com duração ou curva cravada | `npm run portao:2` | commit |
| 3 | `outline` fora do arquivo de foco | `npm run portao:3` | commit |
| 6 | três `curl` contra a URL pública — rota, `.md` e forma com barra | `npm run portao:6` | implantação |

Os portões 4 (gerador da Referência da API) e 5 (`swizzle --list` congelado) nascem nos slices 5 e 7.

Duas verificações **não** são portão e rodam junto no CI: o espelho de `tokens.md` (`node scripts/espelho-tokens.mjs --verificar`) e a bijeção do manifesto de ícones (`npm run icones`). Elas não protegem uma regra de escrita — conferem que duas cópias da mesma verdade não divergiram.

**Os três de commit varrem declaração, não prosa:** comentário sai antes da varredura. Portão que reprova por causa de um comentário ensina a escrever comentário pobre.
