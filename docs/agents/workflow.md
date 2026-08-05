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

Quais portões este repo adota — local e de CI — é decisão em aberto. Enquanto não sair, o repo não tem portão declarado, e isso é ausência conhecida, não omissão.

Enquanto o repo for só documentação, não há build a portar. O portão passa a existir quando o site Docusaurus nascer.
