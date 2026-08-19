---
title: Verificar a assinatura HMAC
description: Como conferir que um evento chegou de quem diz tê-lo enviado, em Python e no passo de esteira, sem abrir janela de repetição.
---

# Verificar a assinatura HMAC

<Untranslated />

Todo evento entregue por webhook chega com um cabeçalho de assinatura, e ele é a
única prova de origem que existe: o endereço de quem envia não é estável, o
corpo é público, e o TLS prova o canal e não o remetente. Conferir a assinatura
é obrigatório, e conferir errado é pior que não conferir: uma verificação que
sempre passa dá a impressão de segurança sem entregá-la.

## Antes de começar

O segredo compartilhado está no gerenciador, sob `prod/webhook/<origem>`. Ele
é o mesmo dos dois lados, e nunca vai para o repositório nem para o log.

## Os passos

<Steps>
  <Step title="Ler o corpo cru, antes de qualquer parse">
    A assinatura é sobre os bytes recebidos. Serializar de volta um dicionário
    já parseado muda espaço em branco e ordem de chave, e a conferência falha
    sem que ninguém entenda por quê.

    ```python
    corpo_cru = await requisicao.body()          # bytes, nunca str
    cabecalho = requisicao.headers["X-Panlabs-Assinatura"]
    ```
  </Step>

  <Step title="Recompor a mensagem assinada">
    A mensagem não é só o corpo: é o instante mais o corpo, separados por
    ponto. É o instante que impede repetição.

    ```python
    versao, instante, recebida = analisar_cabecalho(cabecalho)
    mensagem = f"{instante}.".encode() + corpo_cru
    ```
  </Step>

  <Step title="Comparar em tempo constante">
    `==` sobre a string de assinatura vaza o tamanho do prefixo correto por
    tempo de execução. `compare_digest` não.

    ```python
    esperada = hmac.new(segredo, mensagem, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(esperada, recebida):
        raise AssinaturaInvalida()
    ```
  </Step>

  <Step title="Recusar o que é velho demais">
    Sem janela, uma requisição capturada uma vez vale para sempre.

    ```python
    if abs(time.time() - int(instante)) > TOLERANCIA_S:
        raise AssinaturaExpirada()
    ```
  </Step>
</Steps>

## A verificação inteira

Os quatro passos num arquivo só, na forma em que ele é copiado.

```python
"""Verificação de assinatura de webhook (panlabs).

Copiar inteiro. As quatro decisões que importam estão comentadas; mudar
qualquer uma delas muda a garantia, e nenhuma é de estilo.
"""
import hashlib
import hmac
import time

TOLERANCIA_S = 300
VERSAO_SUPORTADA = "v1"


class AssinaturaInvalida(Exception):
    """A assinatura não bate com o segredo compartilhado."""


class AssinaturaExpirada(Exception):
    """A assinatura é válida e velha demais para ser aceita."""


def analisar_cabecalho(cabecalho: str) -> tuple[str, str, str]:
    """`v1,t=1767225600,s=ab12…` → ("v1", "1767225600", "ab12…").

    O cabeçalho é posicional de propósito: um formato livre convidaria cada
    consumidor a tolerar uma variação diferente, e tolerância divergente entre
    consumidores é como uma verificação vira decorativa.
    """
    partes = dict(
        pedaco.split("=", 1)
        for pedaco in cabecalho.split(",")
        if "=" in pedaco
    )
    versao = cabecalho.split(",", 1)[0].strip()
    if versao != VERSAO_SUPORTADA:
        raise AssinaturaInvalida(f"versão {versao!r} não suportada")
    try:
        return versao, partes["t"], partes["s"]
    except KeyError as erro:
        raise AssinaturaInvalida(f"cabeçalho sem {erro.args[0]!r}") from erro


def verificar(corpo_cru: bytes, cabecalho: str, segredo: bytes) -> None:
    """Levanta se o evento não veio de quem diz ter vindo.

    Devolve `None` em caso de sucesso, e é deliberado: uma função de
    verificação que devolve `True`/`False` convida a `if verificar(...)`, e um
    `if` esquecido é silencioso. Uma exceção não é esquecível.
    """
    versao, instante, recebida = analisar_cabecalho(cabecalho)

    # 1. a mensagem é instante + corpo CRU. Reserializar o JSON quebra aqui.
    mensagem = f"{instante}.".encode() + corpo_cru

    # 2. o dígito é hexadecimal minúsculo, como o emissor escreve.
    esperada = hmac.new(segredo, mensagem, hashlib.sha256).hexdigest()

    # 3. tempo constante: `==` vaza o tamanho do prefixo correto.
    if not hmac.compare_digest(esperada, recebida):
        raise AssinaturaInvalida("assinatura não confere")

    # 4. a janela vem DEPOIS da comparação. Antes, ela viraria um oráculo
    #    barato sobre a validade do instante para quem não tem o segredo.
    try:
        idade = abs(time.time() - int(instante))
    except ValueError as erro:
        raise AssinaturaInvalida("instante não numérico") from erro

    if idade > TOLERANCIA_S:
        raise AssinaturaExpirada(f"{idade:.0f}s de idade, tolerância {TOLERANCIA_S}s")
```

:::warning
A ordem dos passos 3 e 4 é a parte que mais se erra. Conferir a janela **antes**
da assinatura transforma o endpoint num oráculo: quem não tem o segredo aprende,
pelo código de erro, se o instante que ele mandou seria aceito.
:::

## O passo de esteira

A mesma verificação roda contra um evento de exemplo em todo `pull request`, com
o segredo vindo do gerenciador e nunca do repositório.

```yaml
# .github/workflows/verificar.yml (trecho)
- name: Conferir a verificação de assinatura
  env:
    SEGREDO_WEBHOOK: ${{ secrets.SEGREDO_WEBHOOK_TESTE }}
  run: pytest testes/webhook -q
```

:::note
O segredo do teste é um segredo próprio, e não o de produção. A verificação que
está sendo testada é a do código, não a do valor; usar o segredo real aqui
compraria zero cobertura e um caminho a mais por onde ele vaza.
:::

## Variações

**Rotação de segredo sem janela de indisponibilidade.** Durante a rotação, os
dois segredos são aceitos: tente o novo, e em caso de falha tente o antigo. A
janela de aceitação dupla tem prazo e está descrita em
[Rotacionar uma chave](/procedimentos/acessos/rotacionar-uma-chave).

**Mais de um emissor.** O segredo é por origem, e a origem vem do próprio
caminho da rota, nunca de um campo do corpo, que é escrito por quem envia.
