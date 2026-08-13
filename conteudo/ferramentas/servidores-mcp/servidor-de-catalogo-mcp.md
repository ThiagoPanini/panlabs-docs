---
title: Servidor de catálogo MCP
description: Instalação, configuração, as três ferramentas de leitura que ele expõe, e o que ele faz quando o papel do chamador não alcança.
---

# Servidor de catálogo MCP

Expõe o catálogo interno como ferramentas MCP, sobre a Biblioteca A. Ele não tem
credencial própria: repassa o papel do chamador, e é isso que faz a resposta ser
a mesma que o terminal daria.

## Instalação

<CodeGroup>

```bash title="pip"
pip install --index-url "$PANLABS_INDICE" "panlabs-mcp-catalogo>=1.2"
```

```bash title="uv"
uv tool install --index "$PANLABS_INDICE" "panlabs-mcp-catalogo>=1.2"
```

```json title="cliente MCP"
{
  "servidores": {
    "panlabs-catalogo": {
      "comando": "panlabs-mcp-catalogo",
      "ambiente": { "PANLABS_PERFIL": "dev" }
    }
  }
}
```

</CodeGroup>

## Configuração

Duas variáveis, e nenhuma delas é segredo. O perfil escolhe o papel que já está
na máquina; a base escolhe o ambiente do catálogo.

```bash
export PANLABS_PERFIL=dev
export PANLABS_CATALOGO_BASE=https://catalogo.interno/v2
panlabs-mcp-catalogo --conferir
# perfil dev · papel-<equipe>-leitura-dev · 3 ferramentas registradas
```

## As três ferramentas

Todas de leitura. A regra que as escolheu está em
[Servidores MCP](indice).

```python
# panlabs_mcp_catalogo/ferramentas.py
@servidor.ferramenta()
def buscar_recurso(termo: str, limite: int = 20) -> list[Recurso]:
    """Busca no catálogo por nome ou identificador parcial."""

@servidor.ferramenta()
def obter_recurso(identificador: str) -> Recurso:
    """Devolve um recurso pelo identificador exato."""

@servidor.ferramenta()
def listar_por_dono(equipe: str, limite: int = 50) -> list[Recurso]:
    """Todos os recursos de uma equipe."""
```

## Tratamento de erro

O servidor traduz as exceções da Biblioteca A para mensagens que fazem sentido
para quem lê a resposta do assistente — e a tradução mantém a causa, que é o
defeito descrito em
[O mesmo erro em três formas](/procedimentos/diagnostico/o-mesmo-erro-em-tres-formas).

```python
try:
    return catalogo.obter(identificador)
except ErroDeAcesso as erro:
    # a causa vai na mensagem, não só a categoria
    return Erro(f"sessão de {perfil} expirada ou papel sem acesso: {erro}")
except RecursoAusente:
    return Erro(f"{identificador!r} não existe no catálogo de {perfil}")
```

## O que ele não faz

Ele não escreve, não rotaciona e não implanta. A tabela de decisão está no
índice da seção, e a linha que a resume é uma: **uma ferramenta de escrita
executada por um assistente é uma mudança sem revisão.**
