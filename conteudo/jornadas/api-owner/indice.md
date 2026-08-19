---
title: API Owner
slug: /
description: O papel de dono de contrato interno, do primeiro consumidor não mapeado até a política de depreciação que a esteira passou a cobrar.
---

# API Owner

<Untranslated />

Em curso desde que o serviço de catálogo interno passou a ter mais de um
consumidor. O trabalho aqui não é escrever endpoint: é descobrir quem depende do
que já existe, e travar isso num contrato que a esteira consiga cobrar.

## Como foi

1. **Primeiro trimestre** — [O contrato que não existia](./o-contrato-que-nao-existia.md) —
   o serviço tinha seis meses de vida e nenhuma descrição do que ele prometia.
2. **Logo depois** — [O que o contrato não cobre](./o-que-o-contrato-nao-cobre.md) —
   escrever o contrato deixou à vista o que ele deliberadamente não diz.
3. **Segundo trimestre** — [A política de versão](./a-politica-de-versao.md) —
   versionar por data não respondia a única pergunta que importava.
4. **No mesmo trimestre** — [O schema que mudou sem aviso](./o-schema-que-mudou-sem-aviso.md) —
   um campo opcional virou obrigatório e o erro só apareceu no terminal de quem
   consumia.
5. **Terceiro trimestre** — [Depreciar em seis meses](./depreciar-em-seis-meses.md) —
   o aviso saiu do changelog e passou a viajar na própria resposta.
6. **Agora** — [O consumidor invisível](./o-consumidor-invisivel.md) —
   o inventário de quem chama o serviço deixou de sair de conversa e passou a
   sair de log.

## O que não funcionou

**Versionar o contrato por data.** `2024-03-14` não diz se quebra. Trocado por
semver no dia em que o terceiro consumidor apareceu sem aviso, e a pergunta
*"posso subir sem ler?"* passou a ter resposta no número.

**Depreciar avisando no changelog.** Ninguém lê changelog de serviço interno. O
aviso passou a sair no próprio response, com header e prazo, e a taxa de
migração dentro do prazo subiu de duas equipes para todas.

**Pedir que os times se cadastrassem como consumidores.** Um formulário de
cadastro registra quem se lembra de preencher. O inventário que funcionou saiu
do log de acesso, sem pedir nada a ninguém.

**Publicar o contrato só no repositório do serviço.** Quem consome não clona o
repositório de quem serve. O contrato passou a ser publicado como pacote
versionado, e a descoberta virou `pip install`.
