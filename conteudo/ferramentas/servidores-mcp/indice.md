---
title: Servidores MCP
description: O que a casa expõe por MCP, para quem, e a regra que decide o que vira ferramenta e o que fica de fora.
---

# Servidores MCP

Um servidor publicado, e ele expõe o catálogo interno como ferramenta para
assistentes. O que ele resolve é a mesma pergunta que a Biblioteca A resolve
para código — *o que existe e de quem é* —, para um consumidor que não escreve
Python.

## A regra do que vira ferramenta

| Operação | Vira ferramenta | Por quê |
| --- | --- | --- |
| Consultar o catálogo | sim | leitura, idempotente, escopo claro |
| Listar donos de um recurso | sim | leitura |
| Registrar um recurso | não | escrita com efeito que ninguém revisa |
| Rotacionar segredo | não | irreversível |

**Leitura sim, escrita não**, e a linha é dura. Uma ferramenta de escrita
executada por um assistente é uma mudança sem `pull request`, e é o único ponto
do sistema onde a revisão desapareceria sem ninguém decidir isso.

## Autenticação

O servidor não tem credencial própria. Ele recebe o token do chamador e
repassa — então quem consulta pelo assistente vê exatamente o que veria pelo
terminal, com o mesmo papel.

```json
{
  "servidores": {
    "panlabs-catalogo": {
      "comando": "panlabs-mcp-catalogo",
      "ambiente": { "PANLABS_PERFIL": "dev" }
    }
  }
}
```

## O que existe

- [Servidor de catálogo MCP](servidor-de-catalogo-mcp) — instalação,
  configuração, as três ferramentas e o tratamento de erro.
