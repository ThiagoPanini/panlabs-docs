---
title: URL base e versão
description: Uma base para os dois ambientes, e como o cabeçalho Trilho-Version substitui versão na URL.
---

# URL base e versão

## Uma base só

```
https://api.trilho.dev/v1
```

Não existe uma segunda base para o sandbox. O ambiente é decidido pela
chave, não pela URL — ver [Autenticação](autenticacao#o-ambiente-mora-na-chave).
Isso significa que uma integração pode trocar de sandbox para produção
mudando **uma linha de configuração**, sem tocar em nenhuma outra parte do
código que monta requisição.

O `v1` no caminho não é o mesmo mecanismo de versão descrito abaixo. Ele
existe para o dia — não previsto — em que uma mudança seja larga demais
para caber num cabeçalho, e é por isso que ele é parte da URL e não do
cabeçalho: uma mudança de caminho é sempre um evento deliberado e raro, ao
contrário da versão por cabeçalho, que muda a cada lançamento.

## Versão por cabeçalho, não na URL

```http
Trilho-Version: 2026-01-15
```

Toda conta é criada com uma versão fixa — a mais recente no dia da criação
da chave — e permanece nela **até que alguém peça o contrário**. Mandar o
cabeçalho numa requisição específica sobrepõe a versão da conta só para
aquela chamada; não mandar usa a versão fixa da conta.

Isso é o oposto do que a maioria das APIs REST faz, e é deliberado: uma
integração que sobe de versão sozinha, a cada lançamento, é uma integração
que pode quebrar num deploy que ninguém do seu time fez. O Trilho prefere
que a atualização de versão seja um ato consciente — ler o
[Changelog](/docs/operacao/changelog), decidir se a mudança importa
para a sua integração, e só então declarar o cabeçalho com a versão nova.

### Como migrar de versão

<Steps>
<Step title="Leia o changelog da versão alvo">

Cada entrada do [Changelog](/docs/operacao/changelog) lista o que
mudou e, quando aplicável, o que quebra contrato — campo removido, enum
estreitado, status novo que sua integração não reconhece.

</Step>
<Step title="Teste no sandbox com o cabeçalho fixo">

Mande `Trilho-Version` explicitamente em todas as chamadas do seu ambiente
de teste, com o valor da versão alvo, antes de tocar em produção.

</Step>
<Step title="Suba a versão da conta" icon="check">

Uma chamada a `PATCH /conta` — fora do escopo desta referência — declara a
nova versão como padrão. A partir daí, chamadas sem o cabeçalho usam a
versão nova.

</Step>
</Steps>

### O que uma versão nunca faz

:::note[Mudança que quebra contrato sempre é versão nova]

Um campo que muda de tipo, um enum que perde um valor, um recurso que muda
de forma — nenhuma dessas mudanças chega a uma versão existente. Elas
esperam a próxima data de versão, documentada com antecedência no
changelog. Campo novo, endpoint novo e valor novo de enum **aditivo**
chegam a qualquer momento, em qualquer versão — são as únicas mudanças que
o Trilho considera compatíveis.

:::

Isso é o que torna seguro fixar uma versão e nunca mais tocar nela: o pior
que pode acontecer é a integração deixar de ver um recurso novo, nunca
parar de funcionar.

## Formato da versão

A versão é uma data, no formato `AAAA-MM-DD` — o dia em que o conjunto de
mudanças daquele lançamento entrou em vigor. Datas não são comparáveis por
ordem alfabética arbitrária como um número de versão semântico seria; elas
já vêm ordenadas, e é por isso que o formato foi escolhido: `2026-01-15` é
visivelmente anterior a `2026-03-01`, sem uma tabela de conversão para
consultar.
