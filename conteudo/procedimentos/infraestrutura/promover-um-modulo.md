---
title: Promover um módulo
description: Como um trecho de composição repetido em três repositórios vira módulo publicado, sem quebrar quem já o copiou.
---

# Promover um módulo

<Untranslated />

Todo módulo da casa começou como um trecho copiado. A promoção acontece quando o
mesmo trecho aparece pela terceira vez: antes disso o custo de generalizar é
maior que o de copiar, e depois disso as três cópias já divergiram o suficiente
para que unificá-las seja uma migração.

## Antes de começar

Os três consumidores identificados e as diferenças entre eles listadas. A lista
de diferenças é o que decide quais variáveis o módulo terá; qualquer coisa que
não esteja nela vira decisão do módulo.

## Os passos

<Steps>
  <Step title="Extrair mantendo o comportamento">
    A primeira versão do módulo reproduz o trecho mais completo dos três, sem
    generalizar. Ela existe para que exista um `plan` vazio contra o consumidor
    de origem.

    ```bash
    panlabs infra extrair-modulo \
      --de repositorios/alfa/infra/fila.tf \
      --para modulos/fila
    ```
  </Step>

  <Step title="Provar o plano vazio">
    O teste da promoção é este: trocar o trecho pela chamada do módulo e o
    `plan` não propor nenhuma mudança. Se ele propõe, o módulo não é
    equivalente, e aplicar aí recria recurso em produção.

    ```bash
    terraform plan -detailed-exitcode
    # exit 0 = sem mudança. É o único resultado aceito nesta etapa.
    ```
  </Step>

  <Step title="Publicar com versão 0.x">
    A primeira versão publicada é `0.1.0` de propósito: em semver, `0.x` anuncia
    que o contrato ainda vai mudar, e é honesto enquanto os outros dois
    consumidores não migraram.

    ```bash
    git tag -a v0.1.0 -m "fila, extraída de alfa"
    git push origin v0.1.0
    ```
  </Step>
</Steps>

## Verificação

Os três consumidores usando o módulo, e os três com `plan` vazio. Só então a
versão sobe para `1.0.0`, e a subida é o que declara o contrato estável.

```bash
panlabs infra consumidores modulos/fila
# alfa    v0.1.0  plan vazio
# beta    v0.1.0  plan vazio
# gama    v0.1.0  plan vazio
```

:::tip
Migrar os três antes de publicar `1.0.0` é o que evita a dívida clássica: um
módulo em `1.0.0` com um consumidor real e dois que "vão migrar depois" nunca
mais pode mudar de contrato, porque os dois que faltam nunca chegam.
:::

## Variações

**Recurso que não pode ser recriado.** Use `moved` para dizer ao Terraform que o
endereço mudou sem que o recurso tenha mudado. Sem ele, a extração destrói e
recria, que é o modo de falhar mais caro deste procedimento.

```hcl
moved {
  from = aws_sqs_queue.fila
  to   = module.fila.aws_sqs_queue.este
}
```

**Diferença que não vira variável.** Quando uma das três cópias diverge por
motivo que não vale generalizar, ela fica fora da promoção. Duas cópias unificadas
e uma isolada é melhor que um módulo com uma variável que só um consumidor usa.

:::warning
Não promova durante uma janela de mudança. `moved` é seguro e o `plan` vazio é
prova, mas o procedimento troca o endereço de todo recurso envolvido no estado,
e um conflito de estado no meio disso é a reconciliação mais desagradável que
este repositório já produziu.
:::
