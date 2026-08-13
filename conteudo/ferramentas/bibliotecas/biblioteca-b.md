---
title: Biblioteca B
description: A leitura de segredo com cache — instalação, a política de expiração, o uso, e o que acontece durante uma rotação.
---

# Biblioteca B

Leitura de segredo do gerenciador, com cache em memória e expiração explícita. O
que ela resolve não é a chamada — é o custo: o gerenciador cobra por chamada, e
um serviço que lê o segredo a cada requisição paga por isso duas vezes, em
dinheiro e em latência.

## Instalação

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-segredos>=1.6"
```

```bash title="uv"
uv add --index "$PANLABS_INDICE" "panlabs-segredos>=1.6"
```

```toml title="pyproject.toml"
[project]
dependencies = ["panlabs-segredos>=1.6,<2"]
```

</CodeGroup>

## Configuração

A expiração é obrigatória e não tem valor padrão. Um cache de segredo sem
expiração declarada é um cache que sobrevive à rotação, e é assim que um serviço
continua usando a chave revogada.

```python
from datetime import timedelta
from panlabs.segredos import LeitorDeSegredo

leitor = LeitorDeSegredo(
    perfil="prd",
    expiracao=timedelta(minutes=5),
)
```

## Uso

```python
chave = leitor.ler("prod/integracao/chave-externa")

# leitura em lote: uma chamada ao gerenciador, não N
chaves = leitor.ler_varios([
    "prod/integracao/chave-externa",
    "prod/webhook/parceiro",
])
```

## Durante uma rotação

A janela de aceitação dupla existe porque o cache existe. Enquanto ela está
aberta, o leitor sabe devolver as duas versões, e quem verifica assinatura tenta
a nova antes da antiga.

```python
for versao in leitor.versoes_aceitas("prod/webhook/parceiro"):
    try:
        verificar(corpo, cabecalho, versao)
        break
    except AssinaturaInvalida:
        continue
else:
    raise AssinaturaInvalida("nenhuma versão aceita confere")
```

O procedimento completo está em
[Rotacionar uma chave](/procedimentos/acessos/rotacionar-uma-chave).

## Tratamento de erro

```python
from panlabs.segredos import SegredoAusente, SemPermissao

try:
    chave = leitor.ler("prod/integracao/chave-externa")
except SegredoAusente:
    # o segredo não existe: erro de configuração, nunca transitório
    raise
except SemPermissao:
    # o papel não alcança este segredo — ver a matriz de permissões
    raise
```

A biblioteca **não** captura falha de rede: ela deixa passar. Retentar leitura de
segredo dentro da biblioteca esconderia uma indisponibilidade do gerenciador de
quem precisa decidir se degrada ou falha.
