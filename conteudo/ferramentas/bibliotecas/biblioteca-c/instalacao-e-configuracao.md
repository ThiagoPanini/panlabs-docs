---
title: Instalação e configuração
description: As opções de instalação, o arquivo de configuração do repositório, e como adotar a biblioteca num projeto que já tem workflows escritos à mão.
---

# Instalação e configuração

Instalar é uma linha; adotar num repositório que já tem workflows é o
procedimento que vale escrito, porque a ordem errada apaga a esteira que estava
funcionando.

## Antes de começar

Python 3.12, acesso ao índice interno, e permissão de escrita no repositório. Se
o repositório usa proteção de branch, o primeiro `pull request` precisa passar
com os workflows antigos ainda ativos.

## Os passos

<Steps>
  <Step title="Instalar como dependência de desenvolvimento">
    Ela não entra no pacote publicado: gera artefato em tempo de
    desenvolvimento, e nada dela roda em produção.

    ```bash
    uv add --dev --index "$PANLABS_INDICE" "panlabs-esteira>=4.0"
    ```
  </Step>

  <Step title="Importar o que já existe">
    O comando lê os workflows atuais e escreve o Python equivalente. Ele não
    apaga nada — a saída é um arquivo novo, para leitura.

    ```bash
    python -m panlabs.esteira importar .github/workflows > esteira.py
    ```
  </Step>

  <Step title="Conferir que a geração reproduz o que existe">
    Este é o passo que decide se a adoção é segura. `--diff` compara o YAML
    gerado com o commitado e não escreve nada.

    ```bash
    python -m panlabs.esteira gerar esteira.py --diff
    ```
  </Step>
</Steps>

## Verificação

Diff vazio significa que a biblioteca reproduz a esteira atual, e a troca é
mecânica. Diff não vazio significa que a importação simplificou algo — leia
antes de aceitar:

```bash
python -m panlabs.esteira gerar esteira.py --diff
# sem saída = o Python descreve exatamente o que já está no ar
```

:::tip
Se o diff só remove comentários e reordena chaves, aceite. Se ele remove um
`if:` ou um `continue-on-error`, **não aceite**: a importação não entendeu uma
condição, e o comportamento mudaria.
:::

## O arquivo de configuração

O que vale para o repositório inteiro mora em `panlabs.toml`, e não se repete em
cada esteira.

```toml
[esteira]
runner = "ubuntu-latest"
python = "3.12"
diretorio = ".github/workflows"

[esteira.permissoes]
contents = "read"
id-token = "write"
```

## Variações

**Mais de uma esteira no mesmo repositório.** Um arquivo Python por workflow, e
o comando aceita o diretório: `python -m panlabs.esteira gerar esteiras/`.

**Repositório que não pode gerar YAML.** Existe o modo de conferência pura, que
não escreve e só reprova quando o YAML diverge de uma esteira de referência.
Ele é a porta de entrada para repositórios com processo de aprovação sobre
`.github/`.

:::warning
Não apague os workflows antigos no mesmo `pull request` que adiciona os gerados.
Faça em dois: o primeiro adiciona e prova que os dois concordam, o segundo
remove. Num só, uma reprovação da geração deixa o repositório sem esteira
nenhuma.
:::
