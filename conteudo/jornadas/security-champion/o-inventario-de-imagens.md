---
title: O inventário de imagens
description: A pergunta "onde essa imagem roda?" não tinha dono, e passou a ter, com a resposta construída a partir do que a esteira já publicava.
---

# O inventário de imagens

<Untranslated />

O último trimestre do programa começou com uma pergunta simples de um time de
resposta a incidente: uma imagem base tinha uma falha crítica, e eles queriam
saber onde ela rodava. A resposta levou dois dias e saiu incompleta. Não porque
a informação não existisse, mas porque ela estava em três lugares que ninguém
cruzava: o registro de imagens, os manifestos de deploy, e a memória de quem
mantinha cada serviço.

## Por que a pergunta é difícil sendo óbvia

Uma imagem não é usada por um serviço; ela é usada por uma **camada** de outra
imagem, que é usada por um serviço. A pergunta *"onde `python:3.12-slim` roda?"*
não se responde olhando quem a referencia; se responde olhando quem referencia
quem a referencia, recursivamente.

E a segunda dificuldade é temporal: o manifesto diz o que **deveria** estar
rodando; só o cluster diz o que **está**.

## O grafo, montado do que já existia

A esteira já empurrava toda imagem com o mesmo passo, e o passo já sabia o pai.
Faltava gravar.

```yaml
# .github/workflows/publicar-imagem.yml
- name: Registrar a procedência da imagem
  run: |
    PAI=$(grep -m1 '^FROM ' Dockerfile | awk '{print $2}')
    panlabs-inventario registrar \
      --imagem "${{ env.IMAGEM }}:${{ github.sha }}" \
      --pai "$PAI" \
      --repositorio "${{ github.repository }}" \
      --equipe "${{ vars.EQUIPE }}"
```

Quatro campos por publicação, escritos por quem já tinha todos eles à mão. O
grafo se monta sozinho a partir daí.

```python
def onde_roda(imagem, arestas, implantadas):
    """Todo serviço implantado que descende de `imagem`, em qualquer nível."""
    fila, vistos = [imagem], set()
    while fila:
        atual = fila.pop()
        for filha in arestas.get(atual, ()):
            if filha not in vistos:
                vistos.add(filha)
                fila.append(filha)
    return [s for s in implantadas if s.imagem in vistos]
```

:::note
`implantadas` é lido do cluster, e não do manifesto. É a diferença entre
responder *"onde isso deveria rodar"* e *"onde isso roda"*, e num incidente só a
segunda serve.
:::

## O que ficou, e por que ele sobreviveu ao papel

O programa de champion por equipe acabou no trimestre seguinte. O inventário
continuou, e a razão é a que valeu a jornada inteira: **ele não depende de
ninguém lembrar de alimentá-lo.** O passo que registra a procedência está na
esteira que todo serviço já usa para publicar, e um serviço que não publica não
tem imagem para inventariar.

A mesma pergunta, feita um ano depois num incidente real, levou onze minutos,
e o tempo foi de leitura, não de investigação.
