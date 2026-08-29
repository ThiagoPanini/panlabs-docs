---
title: O release-ready
description: A conferência que recusa um pull request que muda a wheel sem mover a versão, e os dois remédios.
---

# O release-ready

O `release-ready` recusa um pull request que muda o que aterrissa na wheel sem
também mover a versão, e a mensagem de falha dele imprime o nível que calculou e
os dois comandos a rodar.

## O que cada um dos dois portões quer dizer

O `gate` e o `release-ready` são os dois obrigatórios em `main`, e ficam
deliberadamente separados em vez de fundidos num só. O `gate` quer dizer *o código
está são*; o `release-ready` quer dizer *mergear isto publica*. As duas falhas têm
correções diferentes, e um nome por remédio é o que permite a quem contribui,
pessoa ou agente trabalhando sozinho, agir certo na primeira leitura da conferência
vermelha.

:::warning
Nada que entra em `main` pula isso. Não há lista de exceção, nem para o dono do
repositório, porque um bot empurrando com as credenciais do próprio autor faria de
*passar por cima* e *empurrar como o agente* a mesma porta.
:::

## O nível que a conferência calcula

O nível sai do tipo do fragmento de changelog, e depende de o projeto já ter
passado do `1.0`:

| Tipo de fragmento | Nível em `0.x` | Nível em `≥ 1.0` |
| --- | --- | --- |
| `breaking` e `removed` | minor | major |
| `added`, `changed` e `deprecated` | minor | minor |
| `fixed` e `security` | patch | patch |

Enquanto o projeto está em `0.x`, uma quebra não promove o primeiro dígito. Isso é
o Versionamento Semântico §4 lido ao pé da letra: nada é estável ainda, então nada
pode quebrar estabilidade. Chegar em `1.0.0` continua sendo um ato deliberado
próprio, e um pull request que fixa `uv version 1.0.0` passa, porque a conferência
impõe um **piso**, nunca igualdade.

## Quando a conferência dispara

```bash
uv version --bump minor
```

:::note
O `release-ready` só dispara quando um pull request toca o gatilho da **wheel**,
que é `src/`, `README.md`, `NOTICE`, `LICENSE`, `licenses/` ou a tabela
`[project]` de `pyproject.toml`. Um pull request confinado a `docs/`, `tests/`,
`.github/` ou uma tabela `[tool.*]` mergeia sem publicar nada.
:::
