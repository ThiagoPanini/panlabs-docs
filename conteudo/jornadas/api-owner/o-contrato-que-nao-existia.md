---
title: O contrato que não existia
description: Como o serviço de catálogo ganhou uma descrição do que promete, seis meses depois de já estar em produção com três consumidores.
---

# O contrato que não existia

<Untranslated />

O serviço de catálogo interno subiu num sprint, respondeu bem, e ficou seis
meses sem que ninguém escrevesse o que ele promete. Não era descuido: enquanto o
único consumidor era o time que o escreveu, o contrato morava na cabeça de quem
o mantinha, e ler o código era mais rápido que ler qualquer documento. O
problema apareceu quando o terceiro consumidor entrou, um time de outra
diretoria, que não tinha acesso ao repositório e não tinha a quem perguntar. A
partir dali, cada mudança passou a ser uma aposta sobre quem ia quebrar.

## O que existia no lugar do contrato

Três coisas faziam o papel, e as três mentiam de formas diferentes.

O **código** era a fonte mais precisa e a menos útil. Ele descreve o que o
serviço faz hoje, não o que ele promete continuar fazendo, e a diferença entre
as duas é exatamente o contrato. Um campo que existe por acidente de
implementação lê igual a um campo que é promessa.

Os **testes** eram a segunda fonte, e cobriam bem o caminho feliz. Só que teste
descreve o que já quebrou uma vez; o que nunca quebrou não tem teste, e é
justamente o que um consumidor novo assume sem perguntar.

O **canal do time** era a terceira, e era a que os consumidores de fato usavam.
Funciona enquanto quem responde está online e lembra. Quando o time que
perguntava era de outra diretoria, o tempo de resposta virou dias, e a resposta
virou *"acho que sim"*.

:::warning
Nenhuma das três é errada por si. O defeito é a soma: **três fontes parciais e
nenhuma marcada como autoritativa** fazem cada consumidor construir uma quarta
versão, na própria cabeça, e nenhuma delas é conferível.
:::

## Por que a saída não foi gerar do código

A primeira tentativa foi extrair o contrato do próprio código, por introspecção
das assinaturas públicas. Ela dura mais ou menos uma tarde, e falha por um
motivo que só aparece depois de o arquivo estar gerado: **o gerador não sabe
distinguir promessa de acidente.**

Uma função pública que devolve um dicionário com sete chaves gera sete chaves no
contrato. Três delas são promessa; duas existem porque o dicionário interno
vazou; e duas são detalhe de implementação que o autor teria removido se
alguém tivesse perguntado. Publicado, o contrato passa a prometer as sete, e a
partir daí remover qualquer uma é mudança de contrato, mesmo as que nunca
deveriam ter entrado.

O que se aprendeu é que **a primeira escrita do contrato é a única chance barata
de decidir o que não é promessa.** Depois dela, tudo o que está escrito custa
uma depreciação para sair.

## A forma que ficou

O contrato virou um pacote Python versionado, publicado no índice interno, com
os tipos e nada mais. Sem cliente HTTP, sem lógica: só o vocabulário.

```python
# panlabs_catalogo_contrato/v1.py: o que o serviço promete, e só isso
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class Recurso:
    """Um item do catálogo. Os cinco campos são promessa."""
    identificador: str
    nome: str
    dono: str            # o time, nunca a pessoa
    criado_em: datetime
    ativo: bool

@dataclass(frozen=True)
class Pagina:
    """A resposta de listagem. `proximo` é `None` na última página."""
    itens: list[Recurso]
    proximo: str | None
```

Duas decisões vão escritas aqui porque elas custaram discussão.

**O dono é o time e nunca a pessoa.** Um campo com o nome de quem criou o
recurso envelhece em três meses e vira dívida de contato. O time sobrevive à
rotatividade, e é ele que responde quando o recurso quebra.

**`proximo` é o cursor opaco, não o número da página.** Página numerada obriga o
serviço a prometer estabilidade de ordenação entre chamadas, que é uma promessa
muito mais cara do que ela parece: qualquer escrita concorrente a quebra.

## Como o contrato passou a ser cobrado

Publicar não basta: um contrato que ninguém confere é um documento. A esteira
passou a rodar dois testes contra ele em todo `pull request` do serviço.

```yaml
# .github/workflows/contrato.yml
name: contrato
on: pull_request

jobs:
  conferir:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      # 1. a resposta real casa com os tipos publicados
      - name: Conferir a resposta contra o contrato
        run: |
          pip install "panlabs-catalogo-contrato==1.*"
          pytest testes/contrato -q

      # 2. o contrato não mudou sem trocar de versão
      - name: Conferir a versão
        run: python -m panlabs.contrato --diff-contra origem/main
```

O segundo passo é o que dá dente ao primeiro. Ele compara os tipos publicados
com os do `main` e reprova quando um campo muda de forma sem que a versão do
pacote suba junto, e a mensagem dele nomeia o campo, porque uma reprovação que
diz *"o contrato mudou"* não diz o que fazer.

## O que ficou

O contrato deixou de ser conhecimento tácito e virou artefato com versão,
consumidor declarado e uma esteira que reprova. Três efeitos que valem
registrados, e o terceiro foi o inesperado.

**A pergunta *"posso subir isso?"* passou a ter resposta mecânica.** Se o
`--diff-contra` passa, sobe. Se não passa, a mudança é de contrato, e aí a
conversa é sobre versão.

**O número de perguntas no canal caiu**, mas não a zero, e as que sobraram
mudaram de natureza. Deixaram de ser *"esse campo sempre vem?"* e viraram
*"vocês pretendem suportar X?"*, que é a pergunta que vale a pena responder.

**Escrever o contrato mudou o serviço.** Quatro campos foram removidos antes da
primeira publicação, porque olhar para eles escritos como promessa deixou óbvio
que ninguém queria prometê-los. Nenhuma revisão de código tinha pego isso em
seis meses.
