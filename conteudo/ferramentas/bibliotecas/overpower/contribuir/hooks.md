---
title: Os dois hooks
description: O que o lefthook roda antes do commit e antes do push, e o que fazer quando um deles reprova.
---

# Os dois hooks

O `lefthook` instala dois ganchos no clone, e os dois rodam antes de o commit
existir. Eles não substituem os portões do pull request; encurtam o laço.

## O que cada hook confere

| Hook | Sobre o quê | O que ele rejeita |
| --- | --- | --- |
| `pre-commit` | o conjunto em stage, em paralelo | formatação fora do padrão nos `.py` em stage, lint nos mesmos arquivos, qualquer coisa sob `src/overpower/content/` escondida do git, e segredo detectado pelo `gitleaks` sobre o diff em stage |
| `commit-msg` | a mensagem | Conventional Commits com assunto em minúsculas, pelo `commitlint` |

:::warning
Uma execução sem sujeito, quando o diretório não existe ou o git não rastreia
nada sob ele, é tratada como falha, e não como aprovação vazia. Um portão que
passa por não ter o que conferir é um portão que some no dia em que o caminho
muda de nome.
:::

## Quando um hook rejeita

Leia a saída na hora. Quando um hook rejeita um commit, ele imprime a saída do
próprio comando que falhou, no momento da rejeição, então não há log separado
para ir procurar.

```bash
lefthook run pre-commit
```

Rodar o hook à mão, sem commitar, é o caminho para conferir a correção antes de
tentar de novo.

## Quando a máquina não tem o ferramental

O `lefthook`, o `gitleaks` e o ferramental de que o `commitlint` precisa são
equipamento da máquina, não do repositório. Um clone numa máquina sem eles perde
o atalho por desenho, e ainda encontra o mesmo portão no pull request.

```bash
lefthook install
```

:::note
Pular um hook é possível com `git commit --no-verify`, e não muda nada no
resultado: o pull request confere as mesmas coisas, e a rejeição só chega mais
tarde.
:::
