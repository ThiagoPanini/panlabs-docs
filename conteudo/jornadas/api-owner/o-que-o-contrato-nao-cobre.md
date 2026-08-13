---
title: O que o contrato não cobre
description: As três promessas que o contrato do catálogo deliberadamente não faz, e por que dizê-las em voz alta vale mais que garanti-las.
---

# O que o contrato não cobre

<Untranslated />

Escrever o contrato deixou à vista o que ele não diz. Estas três ausências são
decisão, e estão escritas no próprio pacote para não virarem suposição.

## Latência

Não há promessa de tempo de resposta. O serviço roda em infraestrutura
compartilhada, e prometer percentil obrigaria a reservá-la.

## Ordenação estável

Duas listagens seguidas podem trazer a mesma página em ordem diferente. É o que
o cursor opaco compra.

```python
# a única ordem prometida é a de dentro de uma página
pagina = catalogo.listar(limite=50)
assert pagina.itens == sorted(pagina.itens, key=lambda r: r.identificador)
```

## Retrocompatibilidade de campo desconhecido

Campo novo pode aparecer a qualquer momento. Quem usa `dataclass` estrita quebra.

```python
Recurso(**resposta)          # quebra quando um campo novo chega
Recurso(**{k: resposta[k] for k in CAMPOS_CONHECIDOS})
```

:::note
Ausência escrita é decisão; ausência calada é suposição de quem consome.
:::
