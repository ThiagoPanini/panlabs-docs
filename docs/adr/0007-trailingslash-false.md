# ADR 7 — `trailingSlash: false`

**Status:** aceito · slice 1 · 2026-08-07

## Contexto

`trailingSlash` precisa estar travado **antes** de qualquer implementação porque seis coisas diferentes derivam a URL de uma página a partir dele. Descobrir tarde custa o `.md` por rota, o `llms.txt`, o índice de busca e o link do footer.

### Os seis consumidores

| Consumidor | Origem |
| --- | --- |
| Mapeamento permalink → arquivo `.md` | [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) |
| Lista de links do `llms.txt` | [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) |
| Separador `--- [Document source](url) ---` do `llms-full.txt` | [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) |
| Ponteiro de volta injetado em cada `.md` | [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) |
| Campo `u` do índice de busca | [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) |
| Link `llms.txt` no footer | [#27](https://github.com/ThiagoPanini/panlabs-docs/issues/27) |

### `undefined` sai primeiro

Fato que a documentação oficial não explicita e o fonte prova: **`undefined` e `true` emitem o mesmo arquivo.** Em `ssg/ssgUtils.ts`, `pathnameToFilename` devolve `path.join(outputFileName, 'index.html')` nos dois casos. A diferença entre eles está **exclusivamente nos links**.

E em `applyTrailingSlash.ts`, `undefined` é no-op total — comentário verbatim no fonte: `// undefined = legacy retrocompatible behavior`, seguido de `return path`. Com `undefined`, os links saem **como cada plugin os gerou**, sem normalização: duas páginas podem linkar o mesmo alvo com e sem barra, as duas funcionam num host tolerante, e uma quebra quando o host muda.

A própria documentação do Docusaurus concorda, na seção de GitHub Pages do guia de deployment: *"It is recommended to set a `trailingSlash` config (`true` or `false`, **not `undefined`**)."*

## Decisão

**`trailingSlash: false`.** URLs sem barra final, `/docs/foo.html` como arquivo emitido, e o `.md` companheiro em `/docs/foo.md` por concatenação de string.

A âncora estética do projeto não é ambígua neste eixo — medido ao vivo nos dois sites Mintlify de referência: canônica **sem** barra, e a forma com barra devolve `308` removendo a barra. Forma de URL não é um dos deltas deliberados, então o valor da âncora vale sem discussão. O equivalente Docusaurus dessa política é `trailingSlash: false`.

### As quatro razões mecânicas, todas verificadas no fonte da v3.10.2

**a) É o único valor que preserva a convenção do `.md`.** Todo site do alvo devolve o fonte quando se acrescenta `.md` à URL. Com barra final, a URL na barra de endereço é `/docs/foo/` e acrescentar dá `/docs/foo/.md` — que não é nada. Sem barra, é concatenação pura. **A afordância inteira do recurso é o `.md` acrescentado à URL que o leitor está vendo**; quebrá-la é ter o arquivo e perder o recurso.

**b) Colapsa permalink e rota numa string só.** As rotas ganham a barra em `addRoute`, via `applyRouteTrailingSlash` — depois do carregamento de conteúdo, onde o `permalink` do doc nasce. Com `false`, `removeTrailingSlash` sobre um path já sem barra é no-op, então as duas representações são idênticas seja qual for o caminho que o plugin use. Com `true` elas podem divergir, e o plugin passa a ter que escolher a certa.

**c) Não ameaça o `llms.txt` do footer.** `Link.tsx` aplica `applyTrailingSlash` a **qualquer URL interna, sem guarda de extensão** — `isInternalUrl` só checa ausência de protocolo. Com `true`, o link `llms.txt` do footer viraria `/llms.txt/`. Com `false`, no-op. *Registro honesto: isto é inferência de leitura do fonte da v3.10.2, sem afirmação oficial nem teste unitário cobrindo o caso.*

**d) Arquivos em `static/` são imunes**, confirmado no `StaticDirectoriesCopyPlugin` — cópia literal, nenhuma reescrita de path. O único eixo que altera onde eles são servidos é `baseUrl`.

### O que isto pina para quem implementa

- **`trailingSlash: false`** em `docusaurus.config.js`.
- **O caminho do `.md` é `permalink + '.md'`, concatenação pura.** Nenhuma transformação.
- **O plugin não importa `applyTrailingSlash`.** Ele existe e é exportado por `@docusaurus/utils-common`, mas **não tem página de documentação oficial** — zero menções em toda a árvore `website/docs/`. É interno-porém-acessível, sem semver documentada. Com `false` ele seria no-op de qualquer forma.
- **O plugin tira os permalinks de `allContentLoaded`, não de `postBuild({routesPaths})`.** Dois motivos verificados: `routesPaths[0]` é **sempre `/404.html`** (iterar sem tratar produz `/404.html.md`), e o fonte carrega TODO dos mantenedores para depreciar `postBuild({routesPaths})` na v4. O `postBuild` continua sendo onde se **escreve** — só não é de onde se lê o caminho.
- **Os `.md` são escritos no `outDir`, não em `static/`.** Perda aceita e nomeada: em `docusaurus start` as rotas `.md` não existem e devolvem `200` com o shell da SPA. É recurso de build, verificado por `build` + `serve`.
- **`baseUrl` está coberto:** `applyTrailingSlash` nunca altera `/` nem o próprio `baseUrl`, por guarda explícita no fonte. Implantação em subcaminho corporativo não muda nada acima.

## O preço, e ele é real

`false` emite `/docs/foo.html` e **exige do host resolução sem extensão** — `/docs/foo` → `docs/foo.html`. Segundo a matriz do `slorber/trailing-slash-guide`, que é a fonte que a documentação oficial indica:

- `/file` → `file.html` **funciona** em GitHub Pages, Netlify (todos os modos), Cloudflare Pages, Render e Azure Static Web Apps.
- **Falha com 404** na Vercel com `cleanUrls=false`, que é o **default** dela. É o caso mais severo da tabela.
- Em contraste, `/folder/` → `folder/index.html` é ✅ nas **doze** configurações medidas, sem exceção. É o único padrão universalmente seguro da matriz.

### A lacuna de medição, carimbada

**Nenhum host do cenário corporativo alvo está na matriz.** O `docs/Hosting-Providers.md` do guia termina com um TODO explícito listando *"S3/CloudFront, Amplify, Azure, Heroku, Surge, Firebase... and self-hosting tools (Apache, Nginx...)"* como pendentes. IIS e Artifactory não aparecem no repositório inteiro. Último commit do guia: 2024-11-19; os dados de host mais recentes são de 2023-08-10.

**Sobre nginx, Apache, IIS, S3 e Artifactory não existe medição — nem nossa, nem de terceiro.** É a lacuna do lado que mais importa para o transplante.

### Armadilha registrada

**`docusaurus serve` não testa isto.** Em `commands/serve.ts` ele aplica `applyTrailingSlash` ao `req.url` e passa `cleanUrls: true` ao `serve-handler`. Rodar local **valida a config, não o host**.

## A alavanca de emissão dupla, pré-escrita

Se o host não fizer resolução sem extensão, **emitem-se os dois arquivos**: cada `foo.html` ganha um irmão `foo/index.html`. A solução é documentada pelo próprio guia (`docs/Solutions.md`, com script de referência), e a coluna `/both` da matriz mede o resultado — com os dois arquivos presentes, `/both` e `/both/` funcionam em **11 das 12** configurações, e a décima segunda apenas redireciona, não quebra.

**`trailingSlash: false` não muda.** Links, canônica, mapeamento do `.md`, `llms.txt`, `llms-full.txt` e o campo `u` do índice ficam onde estão. A emissão é uma **alavanca de host**, não uma mudança de contrato — e são ~10 linhas dentro do plugin de `postBuild`.

**Por que não emitir os dois desde já.** Porque duas formas de URL vivas significam que a barra de endereço pode mostrar qualquer uma das duas, e **só uma suporta acrescentar `.md`**. Isso troca uma falha alta — 404 em toda página, pega no primeiro teste de fumaça — por uma ambiguidade macia que aparece só para quem usa o recurso. **Falhar à vista ganha de falhar em silêncio.**

## O portão de implantação

Três `curl` contra o host real, custo zero em dependência. É o único portão do projeto que depende de alguém fora dele, e ele abre a terceira cadência do repositório: commit · upgrade · **implantação**.

| # | Verificação | Passa se |
| ---: | --- | --- |
| 1 | `GET <base>/docs/<qualquer>` | `200` · `text/html` · sem redirect |
| 2 | `GET <base>/docs/<qualquer>.md` | `200` · `text/markdown` · `Content-Disposition: inline` |
| 3 | `GET <base>/docs/<qualquer>/` | **não** `200` — ou `404`, ou `301` para a forma sem barra |

Implementado em `scripts/portao-6-rotas.sh`. As rotas 1 e 3 rodam desde o slice 1; a rota 2 é pulada em voz alta até existirem `.md` por rota.

### Medição do host, feita no slice 1

O portão 6 rodou contra `https://thiagopanini.github.io/panlabs-docs` assim que o site subiu, e uma sonda temporária mediu o `.md`. Os três resultados:

| Rota | Medido | Veredito |
| ---: | --- | --- |
| 1 | `200` · `text/html; charset=utf-8` · sem redirect | **passa** |
| 3 | `404` | **passa** |
| 2 (sonda) | `200` · `text/markdown; charset=utf-8` · **`Content-Disposition` ausente** | **passa com ressalva** |

**A rota 1 passar é o resultado que mais importa deste slice:** o GitHub Pages faz resolução sem extensão, `trailingSlash: false` fica de pé, e a alavanca de emissão dupla continua guardada. O risco que este slice existia para concentrar está resolvido para *este* host — a lacuna sobre nginx, Apache, IIS, S3 e Artifactory continua aberta, e é ela que mantém a alavanca escrita.

**A ressalva da rota 2, e por que ela não mata o recurso.** As duas referências do alvo mandam `Content-Disposition: inline` **explicitamente**; o GitHub Pages **não manda o cabeçalho**. Ausente não é `attachment`: pela RFC 6266 a disposição default é `inline`, e a verificação em navegador confirma — o Chromium abre a URL, `document.contentType` é `text/markdown`, o corpo renderiza e nenhum download dispara.

**Consequência para a redação do portão:** a rota 2 exige que a disposição **não seja `attachment`**. Exigir o cabeçalho literal reprovaria um host onde o recurso funciona, e portão que reprova o que funciona é portão que alguém desliga. O que mata o recurso é `attachment`, não ausência.

**Reprovar a rota 1 aciona a alavanca acima — não uma mudança no `trailingSlash`.** Reprovar a rota 2 mata o recurso de `.md` independentemente do `trailingSlash`, e é a mesma conversa com o mesmo time de infraestrutura: é esse o argumento que derruba a suposta economia do `true`. Ele não reduz a conversa de host de uma para zero; reduz de duas para uma, quebrando o recurso pelo qual a conversa existe.

## Dissenso registrado

- **`true` é a aposta mais segura sob host desconhecido, e isso é verdade.** Diretório mais `index.html` é ✅ nas doze configurações medidas, sem uma única falha; `/foo` → `foo.html` tem falha medida. Recusado por três coisas: mata a convenção do `.md`, diverge da âncora num eixo que não é delta, e — decisivo — **o custo de host é recuperável e o custo de convenção não é**. Se o host não colaborar, a alavanca devolve a compatibilidade sem mover uma URL; se a convenção morrer, não há alavanca que a traga de volta.
- **Emitir os dois arquivos desde o início** é defensável e quase levou. Recusado pelo critério falha-alta × ambiguidade-macia, não por custo — são ~10 linhas e alguns MB de saída.
- **A medição que sustenta o preço tem buraco, e o buraco é do lado que importa.** Se alguém medir nginx, IIS ou S3 e a resolução sem extensão não sair barata, a alavanca deixa de ser saída de emergência e vira o default — e isso é mudança de emissão, não de ADR.

## Procedência

| Decisão | Classe | Fonte |
| --- | --- | --- |
| `trailingSlash: false` | herdado | canônica sem barra e `308` medidos nos dois sites Mintlify de referência ([#33](https://github.com/ThiagoPanini/panlabs-docs/issues/33)) |
| `undefined` descartado | delta deliberado | doutrina de saída determinada pela config; a doc do Docusaurus recomenda o mesmo para GitHub Pages |
| Emissão dupla como alavanca | mecanismo emprestado | `slorber/trailing-slash-guide`, `docs/Solutions.md` |
| Comportamento do host corporativo | **lacuna de medição** | nginx, Apache, IIS, S3+CloudFront e Artifactory ausentes do guia, com TODO explícito; dados de host de 2023-08-10 |
| Portão de implantação de três `curl` | origem própria | [#33](https://github.com/ThiagoPanini/panlabs-docs/issues/33) §6; a rota 2 é a recomendação 7 da [#8](https://github.com/ThiagoPanini/panlabs-docs/issues/8) virando verificação |
| `.md` no `outDir` em vez de `static/` | herdado | a régua da [#19](https://github.com/ThiagoPanini/panlabs-docs/issues/19) — commita-se o que muda por decisão, não por escrita |
