---
title: O diff que resolveu
description: Três incidentes cuja correção coube em poucas linhas, com o diff exato e o que cada um deixou de regra.
---

# O diff que resolveu

<Untranslated />

Nem toda correção é pequena, e as que são valem registradas com o diff exato. O
valor não está na linha que mudou; está na regra que sobrou depois dela, porque
é ela que impede o mesmo incidente de voltar com outra roupa.

## O health check que media a coisa errada

O serviço subia, respondia, e o orquestrador o derrubava. O health check batia
numa rota que consultava o banco, e o banco levava mais de dois segundos para
aceitar a primeira conexão do processo.

```diff
--- a/catalogo/saude.py
+++ b/catalogo/saude.py
@@ -4,9 +4,13 @@
 @app.get("/saude")
 def saude():
-    # o processo está vivo E o banco responde
-    with banco.conexao() as c:
-        c.executar("SELECT 1")
-    return {"ok": True}
+    """Vivacidade: o processo responde. Nada além disso."""
+    return {"ok": True}
+
+
+@app.get("/pronto")
+def pronto():
+    """Prontidão: o processo responde E as dependências dele respondem."""
+    with banco.conexao() as c:
+        c.executar("SELECT 1")
+    return {"ok": True}
```

**A regra que ficou:** vivacidade e prontidão são perguntas diferentes.
Vivacidade decide se o processo é reiniciado; prontidão decide se ele recebe
tráfego. Misturar as duas faz uma dependência lenta virar um laço de reinício.

## A tabela de sintomas

| Incidente | Tempo até a causa | Tamanho do diff | Regra que ficou |
| --- | --- | ---: | --- |
| Health check | 3 h | 13 linhas | vivacidade ≠ prontidão |
| Retentativa | 40 min | 4 linhas | espera exponencial com ruído |
| Paginação | 2 dias | 6 linhas | cursor opaco, nunca deslocamento |

## A retentativa que sincronizou

Todos os consumidores tentavam de novo no mesmo instante depois de uma falha, e
a segunda onda derrubava o serviço que tinha acabado de voltar.

```diff
--- a/panlabs/cliente/retentativa.py
+++ b/panlabs/cliente/retentativa.py
@@ -11,4 +11,4 @@ def espera(tentativa: int) -> float:
-    return BASE_S * (2 ** tentativa)
+    # ruído proporcional: sem ele, N clientes que falharam juntos voltam juntos
+    return random.uniform(0, BASE_S * (2 ** tentativa))
```

**A regra que ficou:** espera exponencial sem ruído não distribui carga, apenas
adia o pico. O ruído é o mecanismo; o expoente sozinho não é.

## A paginação que pulava registro

Um relatório noturno vinha com menos linhas do que devia, e nunca as mesmas. A
listagem paginava por deslocamento, e qualquer escrita concorrente deslocava as
páginas seguintes.

```diff
--- a/catalogo/listagem.py
+++ b/catalogo/listagem.py
@@ -7,6 +7,6 @@ def listar(limite: int, cursor: str | None = None):
-    deslocamento = int(cursor or 0)
-    itens = repo.pagina(limite=limite, deslocamento=deslocamento)
-    return Pagina(itens=itens, proximo=str(deslocamento + limite))
+    depois = decodificar(cursor) if cursor else None
+    itens = repo.apos(limite=limite, identificador=depois)
+    return Pagina(itens=itens, proximo=codificar(itens[-1].identificador) if itens else None)
```

**A regra que ficou:** deslocamento promete ordenação estável entre chamadas, e
essa promessa é cara demais para um catálogo que aceita escrita. Cursor opaco
não promete, e é por isso que ele está no contrato desde a
[primeira versão](/jornadas/api-owner/o-contrato-que-nao-existia).
