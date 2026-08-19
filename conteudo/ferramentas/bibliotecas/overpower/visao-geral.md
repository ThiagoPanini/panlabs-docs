---
title: Visão geral
slug: /
description: O que o overpower é, as três perguntas que os três comandos respondem, e por que a versão que você fixa é o catálogo que você recebe.
---

# Visão geral

O `overpower` é uma CLI que instala equipamento de agente já curado, skills,
servidores MCP e frameworks inteiros deles, dentro de um repositório ou numa
máquina. Ele não faz scaffold, não gera nada e não pergunta nada a um LLM. Ele
copia arquivos que alguém já decidiu que valem a pena, e enxerta configuração
que um runtime já sabe ler.

## Instalar em cinco passos

<Steps>
  <Step title="Rodar sem instalar">
    O `uvx` baixa o pacote num ambiente efêmero, roda e joga o ambiente fora.
    Nada sobra na máquina além do que o próprio `overpower` escreveu.

    ```bash
    uvx overpower@latest --version
    ```
  </Step>

  <Step title="Ver o que existe">
    O catálogo sai em quatro blocos, cada entrada com o tamanho, a contagem de
    arquivos e a descrição por inteiro.

    ```bash
    uvx overpower@latest list
    ```
  </Step>

  <Step title="Ler o plano antes de escrever">
    O `--dry-run` resolve tudo, imprime todo destino e quem o lê, espelha o
    código de saída real e não encosta em disco.

    ```bash
    uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code --dry-run
    ```
  </Step>

  <Step title="Escrever">
    Num terminal, o comando pergunta antes de escrever. Fora de um terminal ele
    nunca pergunta, então a mesma linha se comporta igual dentro de um script.

    ```bash
    uvx overpower@latest install --skill panlabs-python-standards --runtime claude-code
    ```
  </Step>

  <Step title="Conferir que continua de pé">
    O `doctor` responde se o que foi escrito continua sendo o que foi escrito, e
    sai `3` quando acha problema.

    ```bash
    uvx overpower@latest doctor
    ```
  </Step>
</Steps>

## Três comandos, três perguntas

Toda invocação do `overpower` responde a uma de exatamente três perguntas.

| Comando | Pergunta | Resposta |
| --- | --- | --- |
| `list` | O que existe? | O catálogo, ou o conteúdo inteiro de um item dele. |
| `install` | Escreva. | Um plano, impresso antes de qualquer escrita, e depois a escrita. |
| `doctor` | Continua sendo o que era? | Um relatório sobre o terminal e sobre a integridade do que foi instalado. |

Digitado nu, o `overpower` imprime a marca e a ajuda de topo, e sai `0`. Sob um
cano a marca cai e só a ajuda passa, então um `grep` ou um redirecionamento
recebe algo que vale a leitura.

:::info
`--version` lê a versão dos metadados do pacote instalado, e não de uma
constante fixada no código. É por isso que ele serve de prova de que o pacote
chegou inteiro, em vez de ser só um texto que estava lá dentro.
:::

## Sempre `@latest`

O catálogo não é buscado pela rede nem na instalação nem na execução. Ele vem
**embutido no pacote**, e o `list` o lê andando pelo sistema de arquivos. Disso
sai uma consequência fácil de perder de vista: a versão do `overpower` é a
versão do catálogo que ele carrega. Não existe versão de catálogo separada para
acompanhar, e não existe jeito de receber catálogo novo sem receber `overpower`
novo.

O `uvx` complica isso de um jeito específico. Rodado como `uvx overpower`, sem
fixar versão, ele resolve o último lançamento na primeira invocação e guarda
essa resolução sem prazo de validade. Um `uvx overpower` hoje e o mesmo `uvx
overpower` daqui a seis meses podem rodar exatamente o mesmo build, e servir
exatamente o mesmo catálogo. Catálogo que nunca envelhece seria curiosidade;
catálogo cujo envelhecimento é invisível é defeito.

```bash
uvx overpower@latest list
```

:::warning
Fixar `@latest` é o que quebra esse cache a cada invocação. Toda linha deste site
o traz, e não por estilo de casa copiado de outro README, e sim porque é a única
grafia que mantém *o catálogo que você recebe* igual a *o catálogo que existe*.
:::

## Por onde seguir

<CardGroup>
  <Card title="Instalação" icon="download" href="/ferramentas/bibliotecas/overpower/instalacao">
    Como pôr o `overpower` numa máquina, e o atalho que ele deliberadamente não
    cria para você.
  </Card>
  <Card title="Conceitos" icon="book-open" href="/ferramentas/bibliotecas/overpower/conceitos">
    O vocabulário em que o resto deste site se apoia sem reexplicar.
  </Card>
  <Card title="Comandos" icon="terminal" href="/ferramentas/bibliotecas/overpower/comandos/indice">
    O que vale para toda invocação, antes de você chegar a qualquer comando
    isolado.
  </Card>
</CardGroup>
