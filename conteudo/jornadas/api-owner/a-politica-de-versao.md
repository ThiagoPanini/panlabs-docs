---
title: A política de versão
description: Por que versionar o contrato por data não respondia à única pergunta que o consumidor faz, e o que semver mudou na prática.
---

# A política de versão

<Untranslated />

A primeira versão do contrato saiu marcada com a data da publicação, porque a
data é óbvia, não exige acordo e nunca colide. Ela sobreviveu dois trimestres e
caiu no dia em que o terceiro consumidor perguntou, sobre um pacote novo, se
podia subir sem ler o diff. A data não responde isso, e nenhuma convenção em
cima dela responde.

## A pergunta que o número precisa responder

O consumidor faz uma pergunta só, e ela é binária: **isso quebra quem já usa?**

Data não responde. `2026-03-14` é posterior a `2026-02-02` e isso é tudo o que
se sabe — a mudança pode ter sido um campo novo opcional ou a remoção do campo
que o consumidor usa como chave primária. Para descobrir, é preciso ler o diff,
e o objetivo do número é justamente dispensar essa leitura.

Semver responde. O major é a resposta.

## O que ficou travado como quebra

O acordo caro não foi adotar semver — foi listar o que conta como quebra. A
lista é fechada, e mora no próprio pacote.

```python
# panlabs_catalogo_contrato/politica.py
QUEBRAS = (
    "remover um campo",
    "renomear um campo",
    "trocar o tipo de um campo",
    "tornar obrigatório um campo que era opcional",
    "estreitar o conjunto de valores aceitos",
)

NAO_QUEBRAS = (
    "acrescentar um campo opcional",
    "acrescentar um valor novo a um conjunto de saída",
    "relaxar uma validação de entrada",
)
```

:::warning
`acrescentar um valor novo a um conjunto de saída` é a linha que gera discussão
toda vez. Ela não quebra o contrato e **quebra consumidor** que escreve `match`
sem caso padrão. A política mantém a linha e a documenta: quem consome enum de
saída trata o desconhecido.
:::

## Como a esteira cobra

O passo que já existia comparando o contrato com o `main` passou a exigir também
que a versão suba na direção certa.

```bash
# reprova quando o diff é de quebra e o major não subiu
python -m panlabs.contrato --diff-contra origem/main --politica semver

# saída de uma reprovação real
# QUEBRA  Recurso.dono  campo removido
#         versão atual 1.4.0, exigida >= 2.0.0
```

## O que ficou

A data não foi apagada. Ela continua no metadado do pacote, onde responde
*"quando"* — que é uma pergunta legítima e diferente. O que mudou é que ela
parou de ser o identificador, e com isso parou de ser lida como resposta para
uma pergunta que ela nunca soube responder.
