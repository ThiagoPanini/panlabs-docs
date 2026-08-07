# Sonda de Content-Type

**Este arquivo é temporário e sai antes do merge.**

Ele existe por uma razão só: medir o que o **host real** devolve ao servir um
`.md`, porque é isso que decide se o recurso de *Markdown por rota* sobrevive.

O que precisa sair na resposta:

- `Content-Type: text/markdown`
- `Content-Disposition: inline`

Sem o `inline`, o link vira download em vez de abrir no navegador — e aí o
recurso morre, independentemente do `trailingSlash`.

`docusaurus serve` não responde por isso: ele valida a config, não o host. Só a
URL pública responde.

Como medir:

    curl -sSI https://panlabs-tech.github.io/shinydoc-docusaurus/sonda-content-type.md

O resultado fica registrado em comentário na issue #34, e este arquivo é
removido.
