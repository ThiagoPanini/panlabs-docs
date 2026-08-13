---
title: Bibliotecas
description: As três bibliotecas Python publicadas no índice interno, o que cada uma resolve, e qual delas tem referência gerada.
---

# Bibliotecas

Três pacotes, publicados no índice interno pela mesma esteira, com o mesmo
contrato de versão. Eles saíram daqui para outros times, e é isso que os coloca
em `Ferramentas` em vez de em `Procedimentos`.

## O que cada uma resolve

| Pacote | Resolve | Referência gerada |
| --- | --- | --- |
| [Biblioteca A](biblioteca-a) | cliente do catálogo interno | não |
| [Biblioteca B](biblioteca-b) | leitura de segredo com cache | não |
| [Biblioteca C](biblioteca-c/visao-geral) | esteira como código | sim |

## A regra de dependência entre elas

Nenhuma depende de outra. É restrição, e ela custou uma reescrita: quando a
Biblioteca A passou a importar a B para ler segredo, todo consumidor da A herdou
a política de cache da B — inclusive os que liam segredo de outro jeito.

O que ficou no lugar é injeção: quem chama passa o leitor de segredo, e a
biblioteca não escolhe por ele.

## Como instalar qualquer uma

```bash
pip install --index-url "$PANLABS_INDICE" "panlabs-catalogo>=2.4"
```

O índice interno exige o login corporativo propagado. Se `pip` pedir usuário e
senha, o login não chegou — ver
[Preparar a máquina local](/procedimentos/ambiente/preparar-a-maquina-local).
