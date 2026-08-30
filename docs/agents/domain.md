# Domain docs

Como as skills de engenharia devem **consumir** a documentação de domínio deste repo ao explorar o código.

Este repo é **single-context**: um `CONTEXT.md` na raiz, mais `DECISIONS.md`.

## Antes de explorar, leia

- **`CONTEXT.md`**, na raiz — o glossário.
- **`DECISIONS.md`** — as decisões que tocam a área em que você vai mexer.

Se algum desses arquivos não existir, **siga em silêncio**. Não sinalize a ausência nem sugira criá-los de antemão; a skill `/domain-modeling` os cria quando um termo ou uma decisão de fato se resolve.

## Estrutura de arquivo

```
/
├── AGENTS.md         ← as regras; o `CLAUDE.md` só aponta para cá
├── CONTEXT.md
├── DECISIONS.md
├── README.md
├── docs/agents/      ← estes arquivos: como um agente trabalha aqui
├── content/          ← o acervo publicado, que é o site
└── src/
```

`docs/` é a documentação **deste repositório** e não entra no build: o site sai de `content/`.

## Use o vocabulário do glossário

Quando a sua saída nomear um conceito de domínio — título de issue, proposta de refatoração, hipótese, nome de teste —, use o termo como `CONTEXT.md` o define. Não derive para os sinônimos que o glossário marca como `_Avoid_`.

Se o conceito de que você precisa ainda não está no glossário, isso é sinal: ou você está inventando linguagem que o projeto não usa (reconsidere), ou há uma lacuna real (registre para `/domain-modeling`).

## Sinalize conflito com decisão

Se a sua saída contradiz uma decisão existente, diga isso na cara em vez de sobrescrever em silêncio:

> _Contradiz a decisão do swizzle em `DECISIONS.md` — mas vale reabrir porque…_
