---
title: Biblioteca A
slug: /
description: O cliente Python do catálogo interno — instalação, configuração, uso e o tratamento de erro que ela espera de quem a consome.
---

# Biblioteca A

O cliente do catálogo interno. Ela embrulha as chamadas, aplica retentativa com
espera exponencial e ruído, e devolve os tipos do contrato publicado — nunca
dicionários crus.

## Instalação

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

```bash title="uv"
uv add --index "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

```toml title="pyproject.toml"
[project]
dependencies = ["panlabs-catalogo>=2.4,<3"]

[[tool.uv.index]]
name = "panlabs"
url = "$PANLABS_INDICE"
```

</CodeGroup>

## Configuração

A biblioteca não descobre credencial sozinha e não lê variável de ambiente por
conta própria. Quem constrói o cliente passa o que ele precisa — é o que permite
usá-la em teste sem tocar em rede.

```python
from panlabs.catalogo import Catalogo
from panlabs.segredos import LeitorDeSegredo

catalogo = Catalogo(
    base="https://catalogo.interno/v2",
    leitor_de_segredo=LeitorDeSegredo(perfil="dev"),
    tempo_limite_s=5,
)
```

`leitor_de_segredo` é injetado de propósito: a biblioteca não escolhe política
de cache por quem a usa. Quem chama traz o leitor, e a dependência aponta para
fora.

## Uso

Listagem paginada por cursor opaco, e o iterador cuida do laço.

```python
for recurso in catalogo.iterar(limite=100):
    print(recurso.identificador, recurso.dono)

# ou uma página por vez, quando o laço é seu
pagina = catalogo.listar(limite=50)
while pagina.proximo:
    pagina = catalogo.listar(limite=50, cursor=pagina.proximo)
```

## Tratamento de erro

Três exceções, e a distinção entre elas decide se vale tentar de novo.

```python
from panlabs.catalogo import ErroDeAcesso, ErroDeValidacao, ErroTemporario

try:
    catalogo.registrar(recurso)
except ErroDeValidacao as erro:
    # nunca vale retentar: o corpo nomeia o campo e a versão do contrato
    log.error("campo %s recusado (contrato %s)", erro.campo, erro.contrato)
except ErroDeAcesso:
    # sessão expirada ou papel errado — ver o índice de sintomas
    raise
except ErroTemporario:
    # a biblioteca já retentou; chegar aqui significa que o teto foi atingido
    raise
```

`ErroTemporario` só chega ao chamador depois de a retentativa interna esgotar,
e é por isso que capturá-la para tentar de novo é quase sempre errado.

## A referência completa

Esta biblioteca não tem referência gerada. As assinaturas públicas estão nos
tipos do pacote, e o `help()` do Python é a fonte:

```bash
python -c "from panlabs.catalogo import Catalogo; help(Catalogo)"
```

Quem tem referência gerada é a [Biblioteca C](./biblioteca-c/visao-geral.md).
