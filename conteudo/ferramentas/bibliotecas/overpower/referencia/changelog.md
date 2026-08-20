---
title: Changelog
description: O que mudou em cada versão publicada do overpower, em cronologia reversa, montado dos fragmentos que cada pull request deixou.
---

# Changelog

Cronologia reversa, uma entrada por versão publicada. As entradas não são
escritas à mão: cada pull request que muda comportamento deixa um fragmento em
`changelog.d/`, e o lançamento os monta. Como o projeto está em `0.x`, uma quebra
não promove o primeiro dígito, e a régua inteira está em
[Release](../contribuir/release).

Os agrupamentos por minor existem para a coluna de navegação. Uma lista de trinta
entradas sem heading é uma lista que ninguém percorre.

## 0.27.x

<Update label="0.27.0" tag="mudança">
  **A documentação saiu do repositório da ferramenta e passou a viver aqui.** As
  dezenove páginas que moravam em `website/` foram publicadas neste acervo, em
  português e em inglês, e o pacote no PyPI declara este endereço em `Homepage` e
  em `Documentation`.

  O endereço antigo, `thiagopanini.github.io/overpower`, foi desligado em vez de
  ficar congelado: um site que ninguém atualiza e a busca continua indexando é
  pior que site nenhum. O que ficou lá é a memória de engenharia do projeto, os
  ADRs, os documentos de agente e a pesquisa, que nunca descreveram o produto
  para quem o usa.
</Update>

## 0.26.x

<Update label="0.26.0" tag="mudança">
  **O projeto saiu da organização e passou para o perfil pessoal.** O nome não
  mudou, o dono sim: o repositório é `ThiagoPanini/overpower`, e é esse endereço
  que o pacote declara.

  Os endereços antigos sobrevivem como redirecionamento do GitHub, e o projeto
  não trata redirecionamento como resposta: as 420 referências dentro da árvore
  foram reescritas uma a uma, do formato de issue que carimba o dono em toda
  entrada futura de changelog até os links dentro de docstring.
</Update>

## 0.25.x

<Update label="0.25.2" tag="correção">
  **O `--yes` passou a dizer o que faz.** A ajuda dele lia *"pula a confirmação, e
  nada além disso"*, e esse *nada além disso* carregava mais do que admitia: num
  terminal, `-y` sobre um destino de máquina já ocupado transformava uma pergunta
  que poderia escrever numa recusa com saída 3.

  O comportamento continua o mesmo, e por decisão: quem aceita a sobrescrita é o
  `--force`, e só ele, porque um `-y` que apagasse em silêncio poria este comando
  ao lado do `apt-get` quando ele foi construído para ficar ao lado do `pip`. O
  que mudou é que a tela consultada para descobrir o que as opções fazem agora
  nomeia qual das duas levanta a recusa.
</Update>

<Update label="0.25.2" tag="correção">
  **O `install --help` passou a mencionar o assistente.** O `--runtime` anuncia
  *"sem valor padrão"* e *"nem todo runtime está nas duas tabelas"*, e as duas
  frases juntas leem como exigência: a única tela que se consulta para saber o
  que as opções fazem concluía que `overpower install --skill x` é recusado. Num
  terminal não é, e a descrição do comando diz isso agora, ao lado da frase que
  registra que uma linha fora de terminal continua sendo recusada.
</Update>

<Update label="0.25.1" tag="correção">
  **O `doctor` deixou de reportar `0 artifacts · 0 places` num repositório cuja
  única instalação é um servidor MCP.** A contagem vinha só da classe de cópia,
  árvores dentro de um caminho de runtime, então um enxerto escrito ficava duas
  linhas abaixo de um bloco intitulado *o que está instalado* sem estar no
  número.

  **As duas classes de aterrissagem contam agora**, e a decisão veio de coerência
  e não de gosto. Elas são contadas em separado e somadas, nunca fundidas num
  conjunto só: o pool separa por tipo, então uma skill e um servidor podem
  compartilhar nome, e uma união responderia um onde o disco tem dois.
</Update>

<Update label="0.25.1" tag="correção">
  **Um arquivo de configuração sem JSON dentro é recusado nas palavras deste
  produto, e não nas do parser.** Um `.mcp.json` de 0 byte respondia *Expecting
  value: line 1 column 1 (char 0)*, sobre um arquivo que não tem linha 1 nem
  coluna 1. Vazio e só espaço em branco passam a ser nomeados antes de o leitor
  ser chamado, cada um nas próprias palavras.
</Update>

## 0.25.0

<Update label="0.25.0" tag="novidade">
  **O bundle atravessou o `--from`.** Um repositório declara as composições dele
  em `.overpower/catalog.yaml` na raiz, e `install --bundle <slug> --from <url>`
  equipa um contexto inteiro de trabalho num comando. O `list --bundle <slug>
  --from <url>` mostra o que o bundle nomeia primeiro, então a decisão é tomada
  com o conteúdo à vista.

  O manifesto passa pelo **mesmo leitor** que lê o catálogo publicado, então um
  manifesto malformado é recusado nomeando o mesmo campo dos dois lados.
</Update>

## 0.24.x

<Update label="0.24.0" tag="mudança">
  **O único arquivo que o `overpower` escreve sobre o próprio conteúdo virou
  YAML.** O `catalog.toml` virou `catalog.yaml` dentro da wheel, e o leitor que o
  decodifica passa por um módulo sancionado que responde `object`.

  **Nada responde diferente**: o `list`, o `install` e o `doctor` imprimem o que
  imprimiam, byte a byte, e os mesmos arquivos aterrissam em disco. O que a
  mudança compra é *um* leitor. Ela custa uma garantia: o TOML não tinha tipo de
  chave além de string, então uma chave de tabela passa a ser conferida onde
  antes era convertida.
</Update>

<Update label="0.24.0" tag="correção">
  **Uma descrição de skill escrita como bloco YAML deixou de chegar com o
  marcador de bloco dentro do texto.** O `description: >` produzia *"> primeira
  metade segunda metade"*, porque o frontmatter era lido por um parser escrito à
  mão em vez de por YAML. **O parser feito à mão sumiu**, e ele era invisível
  enquanto o produto só lia o próprio conteúdo.
</Update>

## 0.23.x

<Update label="0.23.0" tag="mudança">
  **O site de documentação passou a ser canônico, e o `README.md` encolheu para
  apontar para ele.** As seis páginas da barra lateral de contribuição passaram a
  carregar prosa de verdade: o laço de desenvolvimento e os hooks locais, a
  doutrina de testes, como uma tela é testada por snapshot, o mapa de módulos e as
  duas raízes irmãs, como o conteúdo vendorizado é curado, e como um lançamento
  publica.
</Update>

## 0.22.x

<Update label="0.22.0" tag="novidade">
  **O `--from` passou a responder a pergunta que vem antes do nome, *o que este
  repositório oferece?*** O `list --from <url>` sem seletor nenhum imprime a
  vitrine daquele repositório num comando, e o `install --from <url>` sem seletor
  abre o **mesmo assistente** que todo mundo já conhece, com o catálogo remoto no
  lugar do embutido.

  A vitrine é **ancorada**: ela anda por `<repositório>/skills/**` mais
  `<repositório>/.overpower/mcp/*.toml`, e ignora o subcaminho da URL por
  inteiro, porque uma oferta é propriedade do repositório e não do caminho que
  alguém colou. O preço é declarado em vez de escondido, e **2 dos 75 `SKILL.md`
  medidos** ficam fora da âncora e continuam instaláveis pelo nome.
</Update>

## 0.21.x

<Update label="0.21.4" tag="correção">
  **Um arquivo de configuração carregando a mesma chave duas vezes é recusado em
  vez de escrito.** Todo parser medido resolve chave repetida pela **última**
  ocorrência, e o enxerto aterrissava na **primeira**: o `install` saía `0`,
  reportava `1 write · 1 file`, nomeava a chave no plano, e o runtime seguia
  lendo o valor antigo do usuário.

  A recusa é **estreita por construção**: ela cobre as chaves que o enxerto de
  fato consulta para decidir onde aterrissar, e nada além disso.
</Update>
