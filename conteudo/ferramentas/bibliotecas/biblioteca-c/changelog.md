---
title: Changelog
description: O que mudou em cada versão da Biblioteca C, em cronologia reversa, com o que quebrou contrato marcado.
---

# Changelog

Cronologia reversa, uma entrada por versão publicada. Quebra de contrato leva
major, e a lista do que conta como quebra é a mesma de todo pacote da casa —
está em [A política de versão](/jornadas/api-owner/a-politica-de-versao).

Os agrupamentos por major existem para a coluna de navegação: uma lista de vinte
entradas sem heading é uma lista que ninguém percorre.

## 4.x

<Update label="4.0.0" tag="quebra">
  **A geração passou a recusar ação de terceiro sem versão fixada.** Era aviso; virou
  recusa, e é por isso que a versão é major. Repositórios que referenciam por tag
  precisam trocar para o identificador do commit antes de subir.

  Junto vieram duas mudanças menores: o ponteiro do erro passou a nomear a
  posição do passo, e `panlabs.toml` ganhou a seção de permissões.
</Update>

## 3.x

<Update label="3.4.0">
  **Modo de conferência pura.** `--conferir` compara o YAML commitado com o que o
  Python produz e não escreve nada. É a porta de entrada para repositórios com
  processo de aprovação sobre `.github/`.
</Update>

<Update label="3.3.1">
  Correção: `padrao.python()` emitia o passo de varredura antes do de instalação
  quando a versão do Python era declarada explicitamente. A ordem passou a ser
  estável.
</Update>

<Update label="3.3.0">
  **Importação de workflows existentes.** `panlabs.esteira importar` lê
  `.github/workflows` e escreve o Python equivalente. Ela não apaga nada — a
  adoção continua sendo dois `pull requests`.
</Update>

<Update label="3.2.0">
  `padrao.python()` passou a aceitar `versao`, e o valor entra tanto no
  `setup-python` quanto na imagem dos alvos de container.
</Update>

<Update label="3.1.0">
  **Cabeçalho de arquivo gerado.** Todo YAML emitido abre dizendo que é gerado e
  apontando para o arquivo Python de origem. Sem ele, a primeira reação de quem
  encontra o arquivo é editá-lo.
</Update>

<Update label="3.0.0" tag="quebra">
  **`Esteira(em=...)` passou a exigir lista.** Aceitar string e lista fazia
  `em="pull_request"` e `em=["pull_request"]` produzirem YAML diferente em um
  caso de borda, e nenhum dos dois estava errado o suficiente para falhar.
</Update>

## 2.x

<Update label="2.7.0">
  Primeira versão publicada no índice interno. Antes disso a biblioteca vivia
  como diretório copiado, que é exatamente o problema que ela existe para
  resolver.
</Update>
