# Domain docs

Como as skills de engenharia devem **consumir** a documentação de domínio deste repo ao explorar o código.

Este repo é **single-context**: um `CONTEXT.md` na raiz, mais `docs/adr/`.

## Antes de explorar, leia

- **`CONTEXT.md`**, na raiz — o glossário e os axiomas.
- **`docs/adr/`** — os ADRs que tocam a área em que você vai mexer. São doze mais o índice, e o índice diz o que cada um decide.

Se algum desses arquivos não existir, **siga em silêncio**. Não sinalize a ausência nem sugira criá-los de antemão; a skill `/domain-modeling` os cria quando um termo ou uma decisão de fato se resolve.

## Estrutura de arquivo

```
/
├── CONTEXT.md
├── docs/
│   ├── adr/          ← as decisões, uma por arquivo, mais o README de índice
│   ├── agents/       ← estes arquivos: como um agente trabalha aqui
│   └── research/     ← só o índice; o material mora em branches `research/*`
├── content/          ← o acervo publicado, que é o site
└── src/
```

`docs/` é a documentação **deste repositório** e não entra no build: o site sai de `content/`.

## Use o vocabulário do glossário

Quando a sua saída nomear um conceito de domínio — título de issue, proposta de refatoração, hipótese, nome de teste —, use o termo como `CONTEXT.md` o define. Não derive para os sinônimos que o glossário marca como `_Avoid_`.

Se o conceito de que você precisa ainda não está no glossário, isso é sinal: ou você está inventando linguagem que o projeto não usa (reconsidere), ou há uma lacuna real (registre para `/domain-modeling`).

## Sinalize conflito com ADR

Se a sua saída contradiz um ADR existente, diga isso na cara em vez de sobrescrever em silêncio:

> _Contradiz o ADR 2 (política de swizzle) — mas vale reabrir porque…_

Dois avisos sobre ler ADR aqui:

- **Eles citam axioma pelo número, e três desses números morreram.** O 2, o 5 e o 6 não valem mais; `CONTEXT.md` diz o que cada um era e o que ficou de pé. Um ADR que recusa alternativa "contra o axioma 2" registra a decisão da época — a decisão continua válida, a proibição não.
- **Eles nomeiam script e comando que já não existem**, e apontam para `docs/design/`, que saiu da árvore. É história congelada, não instrução: o que a máquina cobra hoje está no `CLAUDE.md`, e a spec removida está na tag `spec-v1`.
