---
title: Instalar de um repositório
description: Qualquer repositório do GitHub como raiz de busca, e como um caminho tree fixa um branch, uma tag ou um commit.
---

# Instalar de um repositório

O catálogo embutido no `overpower` envelhece por construção: ele é fixo na versão
que você tem instalada, e renová-lo significa esperar uma nova passada de
curadoria. O `--from` é a saída que não espera. Ele aponta para **qualquer
repositório do GitHub, sem passo de registro**, e lê de lá em vez do catálogo
embutido.

## Antes de começar

Um `git` local funcionando, com as credenciais que você já usa. O `overpower`
reaproveita as suas, então um repositório privado que você já consegue clonar
funciona aqui também. Se o `git` não estiver disponível, ele cai para buscar um
tarball anônimo usando só a biblioteca padrão do Python.

## Os passos

<Steps>
  <Step title="Perguntar o que o repositório oferece">
    Nu, sem seletor nenhum, o `--from` imprime a **vitrine** daquele repositório:
    as skills sob `skills/`, as receitas sob `.overpower/mcp/` e os bundles
    declarados em `.overpower/catalog.yaml`.

    ```bash
    uvx overpower@latest list --from https://github.com/owner/repo
    ```
  </Step>

  <Step title="Ler um item inteiro antes de instalar">
    Cada um dos três também aceita seletor, então um item pode ser lido por
    inteiro antes de qualquer escrita. Todo comando que a vitrine imprime carrega
    o `--from` de volta, porque um item lido assim não está no catálogo embutido
    e a linha sem ele seria respondida por outro catálogo.

    ```bash
    uvx overpower@latest list --skill alguma-skill --from https://github.com/owner/repo
    ```
  </Step>

  <Step title="Fixar a referência e instalar">
    Acrescentar `tree/<ref>/<path>` à URL fixa um branch, uma tag **ou um SHA de
    commit inteiro**. Fixar um SHA é o que torna uma instalação por `--from`
    inteiramente reprodutível.

    ```bash
    uvx overpower@latest install --from https://github.com/owner/repo/tree/main/subpasta --skill alguma-skill --runtime codex
    ```
  </Step>
</Steps>

## Verificação

O `--from` é **exclusivo**. Uma vez na linha, só o repositório remoto é
consultado: o catálogo embutido não é procurado, e também não é fundido com o
remoto. Isso resolve a questão de precedência entre os dois removendo-a, em vez
de respondendo-a.

:::warning
A única flag que o `--from` recusa é `--ai-framework`, e a recusa é uma afirmação
sobre o modelo, não uma posição de fila. Um framework é uma pasta da wheel do
próprio `overpower`, então não há nada no repositório de outra pessoa para a flag
nomear. Essa linha sai `2` antes de qualquer busca.
:::

Os três seletores não leem a URL do mesmo jeito. O `--skill` e o `--mcp` a tratam
como **raiz de busca**, e o repositório, uma subpasta ou a pasta do próprio
artefato chegam todos ao mesmo resultado. O `--bundle` e a vitrine nua estão
**ancorados** na raiz do repositório, então a subpasta da URL não estreita nada:
o que um repositório oferece, e o que ele compõe, são propriedades do repositório
e não do caminho que você por acaso colou.

## O bundle federado

Um **bundle** é uma composição nomeada, e um repositório federa uma escrevendo
`.overpower/catalog.yaml` na raiz dele.

```yaml
bundles:
  api-python:
    description: Tudo que é preciso para trabalhar na API em Python.
    items:
      - fastapi-conventions
      - pytest-fixtures
```

Esse arquivo é lido pelo **mesmo leitor** que lê o catálogo que o `overpower`
publica, então um manifesto malformado é recusado nomeando o mesmo campo dos dois
lados, e não existe um segundo validador em lugar nenhum para discordar do
primeiro. Os `items` são **nomes**, nunca caminhos, resolvidos contra as skills
que aquele mesmo repositório oferece sob `skills/`. Eles não alcançam nem o
catálogo embutido nem um terceiro repositório, e um nome que não resolve sai `3`
dizendo qual nome.

:::note
Não há cache. Todo `--from` busca fresco, por decisão. Conteúdo remoto muda no
calendário de outra pessoa, e uma cópia guardada localmente derrotaria em
silêncio a razão inteira de o `--from` existir.
:::

O que muda no plano é só a [procedência](../conceitos). A confirmação, o
`--dry-run` e a mecânica de escrita são as mesmas do conteúdo que vem do catálogo
embutido.
