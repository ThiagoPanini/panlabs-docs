# Diagramas draw.io dentro de páginas Docusaurus

> Pesquisa sobre como embarcar e renderizar diagramas `.drawio` (diagrams.net) em páginas Markdown/MDX deste acervo.
> Fontes primárias: código-fonte de [`jgraph/drawio`](https://github.com/jgraph/drawio) e [`jgraph/drawio-desktop`](https://github.com/jgraph/drawio-desktop) no branch `dev`, `node_modules/` do próprio repo (Docusaurus 3.10.2 instalado), e medição direta nesta máquina com `drawio-desktop` 31.3.1 headless e Chrome headless dirigido por CDP cru.
> Restrições vigentes: **zero dependência npm nova** (axioma 2, `scripts/cinco-zeros.sh:28-29`), **esteira de CI imutável** (nada roda em CI além do que já roda), Docusaurus obrigatório, ambiente-alvo corporativo com rede fechada.

---

## 1. Veredito

**O caminho é o híbrido `.drawio.svg`, referenciado por `<img>`, com o `color-scheme` do root do SVG removido ou preservado conforme a rota de entrega. O `viewer.min.js` vendorizado custa 8,77 MiB e perde em tudo que importa aqui, menos em zoom e navegação de páginas.**

A pesquisa girou em torno de uma tese, e a tese passou:

> Um arquivo `.drawio.svg` é **ao mesmo tempo** (a) um SVG válido que um `<img>` pinta sem uma linha de JavaScript e (b) o arquivo-fonte editável completo que o draw.io reabre e regrava. Havendo as duas propriedades, o problema de "o publicado desatualiza em relação à fonte" **deixa de existir por construção**: não há dois arquivos, há um.

As duas propriedades foram medidas e valem (§2.3, §4.1). E uma terceira, não prevista, decidiu a comparação: **um SVG dentro de `<img>` herda o `color-scheme` da página que o hospeda**, e este repo já declara `color-scheme: dark` em `:root` e `light` em `:root[data-theme='light']` (`src/css/tokens.css:708` e `:855`). O diagrama exportado pelo draw.io usa `light-dark()` para todas as cores. Consequência medida: **um `<img src="x.drawio.svg">` acompanha o botão de tema do Docusaurus, repintando ao vivo, sem JavaScript, sem `ThemedImage`, sem dois arquivos** (§4.4).

| | híbrido `.drawio.svg` em `<img>` | `viewer.min.js` vendorizado |
| --- | --- | --- |
| Peso por diagrama | **78 KB** (14 KB gz) | 78 KB de fonte |
| Peso fixo do motor | **0** | **8,77 MiB** (1,69 MiB gz) |
| Funciona offline | **sim** | sim, só se os 8,77 MiB forem todos vendorizados |
| Existe no HTML estático | **sim** | não |
| Sem JavaScript | **pinta** | tela em branco |
| Segue o tema do site | **sim, ao vivo** | só com fiação React explícita |
| Continua editável | **sim, é o próprio fonte** | sim, o `.drawio` fica ao lado |
| Zoom, camadas, multipágina | não | **sim** |
| Atraso até pintar | 0 (é imagem) | **1213 ms** medidos |

O dissenso e o gatilho de reabertura estão no §8.

**Uma pedra no caminho, e ela não é técnica:** `docs/design/componentes/frame.md:156-161` proíbe `<img>` para diagrama, por escrito, com a issue [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60) como procedência. A medição confirma o **motivo** que a regra dá (`currentColor` dentro de `<img>` resolve contra o documento do SVG, não contra o palco) e ao mesmo tempo mostra que a **conclusão** não cobre este caso, porque o draw.io não usa `currentColor` em lugar nenhum: usa `light-dark()`, que funciona em `<img>`. Isso é decisão do dono da spec, não desta pesquisa. Está registrado no §8.

---

## 2. Método: o que foi medido e o que foi lido

### 2.1 O que foi medido nesta máquina

Tudo com data de 2026-08-27, WSL2, Node 24.18.0, Python 3.12.3.

| Instrumento | O que mediu |
| --- | --- |
| `drawio-desktop` **31.3.1** em `~/.local/opt/drawio/squashfs-root/drawio`, sob `xvfb-run -a` | exportação real para SVG, PNG e XML; ida e volta do híbrido; comportamento de multipágina |
| **Chrome headless** (`chromium_headless_shell-1234` do cache do Playwright) dirigido por **CDP cru**, zero dependência, `WebSocket` nativo do Node 24 | cor resolvida em canvas 1×1, propagação de `color-scheme`, `foreignObject` em `<img>`, requisições de rede do viewer, tempo até pintar, comportamento sem JS, `media: print` |
| `curl`, `gzip -9`, `python3` (`zlib`, `base64`, `struct`) | peso servido, ratio de compressão, cabeçalho IHDR de PNG embutido, reimplementação do esquema de compressão do draw.io |
| `grep -n` sobre `node_modules/` e sobre os scripts do repo | versões, regras de webpack, escopo dos portões |

Os diagramas usados são reais, saídos da skill `panlabs-aws-diagrams`: `web-multi-az.drawio` (17.165 B, uma página) e `platform-3-accounts.drawio` (46.986 B, quatro páginas).

### 2.2 O que foi lido, e não medido

- O código-fonte de `jgraph/drawio` (branch `dev`): `Graph.js`, `Editor.js`, `EditorUi.js`, `GraphViewer.js`, baixados por `curl` e lidos com `grep -n`/`sed`. Cada afirmação abaixo carrega arquivo e linha.
- `src/main/args.js` de `jgraph/drawio-desktop` (branch `dev`), que é a definição autoritativa das flags de CLI.
- Os scripts e a spec deste repo.

### 2.3 O que não foi medido, e por quê

- **Nenhum `npm run build` foi rodado.** A correção de escopo declarou território proibido, e o repo não tem página de conteúdo onde encaixar um diagrama sem quebrar os cinco literais de contagem do portão 4 (`scripts/portao-4-conteudo.sh:319`, `:323`, `:332`, `:335`, `:338`). O comportamento do webpack foi lido do fonte instalado, não observado num build.
- **Nenhum navegador que não seja Chromium.** Firefox e Safari não estão nesta máquina. Onde o comportamento depende de suporte a `light-dark()`, o fonte do draw.io documenta o fallback (`Graph.js:1893-1906` cita nominalmente o Firefox ESR 115) mas isso não foi verificado.
- **A extensão Hediet Draw.io Integration do VS Code** não está instalada; o que ela grava por padrão foi lido da documentação dela, não observado.
- **Impressão real em papel.** O teste de `media: print` foi feito com `Page.printToPDF`, que é o mesmo caminho do "Salvar como PDF" do navegador, mas não é uma impressora.

---

## 3. O formato `.drawio`

### 3.1 A estrutura

Um `.drawio` é XML. A raiz é `<mxfile>`, que contém um ou mais `<diagram>`, e cada `<diagram>` carrega um `<mxGraphModel>` cujo `<root>` é uma lista plana de `<mxCell>`.

O esqueleto é montado em `EditorUi.js:1917-1945`:

```
<mxfile>
  <diagram name="Página-1" id="…guid…">
    <mxGraphModel …>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="…" value="…" style="…" vertex="1" parent="1">
          <mxGeometry x="…" y="…" width="…" height="…" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

As duas células `0` e `1` são obrigatórias: `0` é a raiz do modelo e `1` é a camada padrão. Não existe esquema publicado (XSD, JSON Schema); o formato **é** o que o `mxGraphModel` do mxGraph serializa, e a única especificação é o código.

### 3.2 A compressão

O esquema é exatamente este, em `Graph.js:2447-2459`:

```js
Graph.compress = function(data, deflate)
{
	…
   		var tmp = (deflate) ? pako.deflate(encodeURIComponent(data)) :
   			pako.deflateRaw(encodeURIComponent(data));

   		return btoa(Graph.arrayBufferToString(new Uint8Array(tmp)));
};
```

Ou seja, e nesta ordem: **`encodeURIComponent` → `deflate` raw (sem cabeçalho zlib) → `base64`**. A volta está em `Graph.js:2465-2479`. O resultado vira o **texto** do elemento `<diagram>`, no lugar do `<mxGraphModel>` filho.

**Medido, não só lido.** A reimplementação em Python do esquema acima produziu um arquivo que o draw.io real leu sem reclamar:

```
$ python3  # zlib.compressobj(9, DEFLATED, -MAX_WBITS) sobre urllib.parse.quote(model)
descomprimido: 17165 B
comprimido   : 3580 B
primeiros 120 chars do <diagram>: 7V1bc+I4Fv41VO0+kMLmmkdCkpmtmp7tmqS2q/olJdsCNLEttyVDkl+/kiwbWxeD6TQJg3NFsq5H37mgIx16w0X08lsKkvUXHMCw5w6Cl97wtue6A/bLk6+1
$ drawio -x -f xml -u -o descomp.xml comprimido.drawio
$ head -c 120 descomp.xml
<mxfile host="Electron" compressed="true">
  <diagram id="web-multi-az" name="Web · três camadas em duas zonas">
    <mxGraphModel …
```

A compressão corta **79%** do arquivo (17.165 → 3.580 B) e destrói o diff.

**Quando o draw.io grava comprimido.** Duas variáveis, ambas em `Editor.js`:

- `Editor.compressXml = true` (`Editor.js:276`) — se a compressão é *suportada*.
- `Editor.defaultCompressed = false` (`Editor.js:281`) — se ela é o *padrão*.

E o consumo, em três lugares de `EditorUi.js` (`:1889`, `:2040`, `:2515`), é sempre a mesma linha:

```js
uncompressed = (uncompressed != null) ? uncompressed : !Editor.defaultCompressed;
```

Com `defaultCompressed = false`, `uncompressed` vira `true`. **Versões atuais do draw.io gravam `.drawio` em texto puro por padrão.** Medido: `drawio -x -f xml` **sem** a flag `-u` devolveu `<mxfile host="Electron" compressed="false">` com o `<mxGraphModel>` legível.

Para desligar de vez, em ambiente que tenha configuração: `compressXml: false` no config do editor (`Editor.js:2932-2935`). No CLI, a flag é `-u/--uncompressed`.

**Neste acervo a questão já está resolvida na origem.** A skill `panlabs-aws-diagrams` emite o literal `<mxfile host="panlabs-aws-diagrams" compressed="false">` (`engine/emit.cjs:132` e `session/save.cjs:123`), com `<mxGraphModel>` legível dentro de cada `<diagram>` (`engine/emit.cjs:105-115`), e declara determinismo byte a byte como requisito (`session/save.cjs:28-33`).

### 3.3 Multipágina

Cada `<diagram>` é uma página, com `id` e `name` próprios (`EditorUi.js:1917-1919`). Um `.drawio` da skill sai com `1 + N` páginas: a vista consolidada mais uma por conta, costuradas num arquivo só por `session/save.cjs:112-128`. O `platform-3-accounts.drawio` medido tem quatro:

```
$ grep -c "<diagram " platform-3-accounts.drawio
4
$ ids: platform-3-accounts, -c-rede, -c-workload, -c-dados
```

Para escolher uma página na exportação, a flag é `-p/--page-index`, **1-based** e convertida com `parseInt(i) - 1` (`src/main/args.js`, entrada `pageIndex`). Para o viewer web, a chave é `page` no `data-mxgraph`. Não existe fragmento de URL que selecione página num `<img>`: um `<img>` renderiza o SVG inteiro, e o SVG tem uma página só.

### 3.4 Os híbridos editáveis

Este é o eixo da pesquisa, e o mecanismo é mais simples do que a fama sugere.

**`.drawio.svg` — o XML vai no atributo `content` do elemento `<svg>` raiz.** Uma linha, em `EditorUi.js:10955`, dentro de `getEmbeddedSvg`:

```js
if (xml != null)
{
    svgRoot.setAttribute('content', xml);
}
```

E a leitura, em `Editor.js:2299-2320` e no `isDataSvg` de `Editor.js:4342-4373`, aceita três formas no mesmo atributo, decidindo pelo primeiro caractere: começa com `<` é XML cru, começa com `%` é URI-encoded, qualquer outra coisa é base64.

O arquivo continua sendo um SVG **válido e completo**. O cabeçalho é montado em `EditorUi.js:10971-10972` a partir de três constantes de `Graph.js:1651-1662`:

```js
Graph.xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
Graph.svgDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" …>';
Graph.svgFileComment = '<!-- Do not edit this file with editors other than draw.io -->';
```

O atributo `content` é desconhecido para o SVG, logo é ignorado pelo renderizador. Nenhum navegador se importa. Medido no §4.1.

**`.drawio.png` — o XML vai num chunk PNG antes do primeiro `IDAT`.** `Editor.writeGraphModelToPng` (`Editor.js:6545-6640`) percorre os chunks, para no primeiro `IDAT`, e insere ali um chunk novo cujo corpo é `keyword + NUL (+ NUL extra se for zTXt) + value`, com CRC recalculado. O chamador real usa **`tEXt`**, não `zTXt`, com a keyword `mxfile` e o valor URI-encoded (`EditorUi.js:6654`):

```js
data = Editor.writeGraphModelToPng(data, 'tEXt', 'mxfile', encodeURIComponent(xml));
```

O `zTXt` existe no código, mas o caminho de exportação de imagem não o usa. O PNG resultante é um PNG válido: chunks auxiliares desconhecidos são, por especificação, ignoráveis.

**Medição dos dois lados, com o mesmo diagrama de origem:**

| Arquivo | Bytes | gzip -9 |
| --- | --- | --- |
| `web-multi-az.drawio` (fonte) | 17.165 | 2.475 |
| SVG puro, `--embed-svg-fonts false` | 55.596 | 12.187 |
| **`.drawio.svg`**, `-e --embed-svg-fonts false` | **77.804** | **14.454** |
| PNG 1x | 85.762 | 82.921 |
| PNG 2x (`-s 2`) | 206.503 | 193.607 |
| `.drawio.png` (`-e`) | 88.489 | 85.669 |

**O custo do XML embutido no SVG é 22.208 bytes crus, 2.267 gzipados** (77.804 − 55.596). Sobre o gzip, que é o que trafega, o híbrido custa **18,6% a mais** que o SVG puro e traz o fonte inteiro junto. É barato.

O `content` sai como **XML cru**, não comprimido, herdando o `compressed="false"` da fonte:

```
primeiros 70 chars do content=: '<mxfile host="Electron" compressed="false">\n  <diagram id="web-multi-a'
```

Isso significa que **o híbrido também é legível em `git diff`** — o XML está lá, em texto, dentro de um atributo.

---

## 4. Os caminhos, medidos

### 4.1 O híbrido `.drawio.svg` em `<img>`

**Pinta.** Screenshot em Chrome headless de `<img src="hib.drawio.svg">` mostra o diagrama completo, com texto, ícones AWS4 e cores, indistinguível do mesmo SVG colado inline no DOM.

**É o fonte, inteiro.** Reabrindo o híbrido pelo CLI:

```
$ drawio -x -f xml -u -o volta.xml hib.drawio.svg
fonte    len 17125  mxCell: 23
extraído len 17114  mxCell: 23
selo panlabsSchema: fonte=1  volta=1
```

O selo `<object panlabsSchema="panlabs-aws-diagrams/model@1" panlabsModelo="{…}">` que a skill usa como marca forte de sessão **sobrevive** à ida e volta.

**A ida e volta é estável byte a byte.** Reexportar o híbrido a partir do próprio híbrido devolve o mesmo arquivo:

```
$ drawio -x -f svg -e --embed-svg-fonts false -o hib2.drawio.svg hib.drawio.svg
$ cmp hib.drawio.svg hib2.drawio.svg
   round-trip byte a byte IDÊNTICO
```

**Multipágina sobrevive, e essa foi a surpresa.** O `platform-3-accounts.drawio` tem quatro páginas. Exportado **sem** `-p`:

| Export | Bytes | `<diagram>` dentro do `content` |
| --- | --- | --- |
| sem `-p` | 134.492 | **4** — `platform-3-accounts`, `-c-rede`, `-c-workload`, `-c-dados` |
| `-p 1` | 101.287 | 1 |
| `-p 2` | 31.974 | 1 |

Ou seja: **sem `-p`, o híbrido renderiza a primeira página e carrega as quatro dentro do `content`.** A ida e volta confirma:

```
fonte : 4 páginas, 64 mxCell, 46887 bytes, 4 selos
volta : 4 páginas, 64 mxCell, 46885 bytes, 4 selos
round-trip byte a byte IDÊNTICO
```

**A regra prática, então, é uma:** nunca passe `-p` ao gerar o híbrido, sob pena de truncar o fonte para a página exportada. Se uma página que não a primeira precisa aparecer publicada, ou o `.drawio` de origem é fatiado em um arquivo por página, ou aquela página específica sai como SVG puro derivado — e aí volta o problema de dois arquivos, para essa página só.

**O que a ida e volta muda no arquivo.** Duas coisas, ambas cosméticas e ambas relevantes para diff determinístico:

- `host="panlabs-aws-diagrams"` vira `host="Electron"`;
- os atributos de viewport do `<mxGraphModel>` (`dx`, `dy`, `fold`, `page`) são reescritos com a posição da janela do app no momento da exportação.

O modelo em si (células, geometria, estilos, selos) é preservado.

### 4.2 Fonte, texto e a flag que engana

**`--embed-svg-fonts` não embute fonte.** O nome sugere `@font-face`; o que ela faz é outra coisa. Medido nos dois arquivos:

| | `--embed-svg-fonts true` (padrão) | `--embed-svg-fonts false` |
| --- | --- | --- |
| `@font-face` | **0** | **0** |
| `foreignObject` | 40 | 40 |
| `<text>` | **1** | **21** |
| `<image>` | **20** | **0** |
| bytes | 449.817 | 55.596 |
| gzip | 272.773 | 12.187 |

A estrutura do texto exportado é sempre um `<switch>` com duas alternativas:

```
<switch>
  <foreignObject requiredFeatures="…#Extensibility">…HTML…</foreignObject>
  <FALLBACK/>
</switch>
```

O que a flag decide é **qual é o `FALLBACK`**: com `true`, é um `<image>` com o texto **rasterizado em PNG**; com `false`, é um `<text>` de SVG de verdade.

Decodificando os cabeçalhos IHDR dos PNGs embutidos:

```
caixa  320.00x 27.75 un  ->  PNG 1280x111 px   fator 4.0x   (27.245 B)
caixa  559.00x 17.00 un  ->  PNG 2236x68  px   fator 4.0x   (39.973 B)
…
total de bytes de PNG embutido: 297.334 B (290 KiB) em 20 imagens
```

**A rasterização é a 4x e custa 290 KiB num diagrama só.** Ela existe para blindar o texto contra a ausência da fonte, e o preço é: texto não selecionável, não copiável, não encontrável pelo `Ctrl+F` do navegador, e borrado além de 4x de zoom.

**Qual alternativa o navegador escolhe.** Medido por screenshot: em `<img>`, o `foreignObject` **não** é renderizado e o `FALLBACK` é usado; inline no DOM, o `foreignObject` **é** renderizado. Isso é o que produz a mensagem célebre "Text is not SVG - cannot display", que o draw.io emite como último recurso quando não há fallback nenhum, com link para [a própria FAQ](https://www.drawio.com/doc/faq/svg-export-text-problems) — o único `href="http…"` do arquivo inteiro.

**O risco real de fonte.** Com `--embed-svg-fonts false`, o texto sai assim:

```
<text x="2" y="19" fill="#232F3E" font-family="Arial, Helvetica" font-size="19px" …>
```

Medido no arquivo: **`textLength` aparece zero vezes**, `text-anchor` aparece 10, e a única `font-family` é `"Arial, Helvetica"`. Sem `textLength`, o navegador desenha o texto na largura natural da fonte que tiver. Se nem Arial nem Helvetica existirem (Linux sem `msttcorefonts`, por exemplo), a substituta muda a métrica e o rótulo pode transbordar a caixa. Como o draw.io calculou a geometria com Arial no momento do export, o transbordo é assimétrico e não tem correção automática.

A saída limpa, quando o desenho tem rótulo longo dentro de caixa apertada, é escolher no `.drawio` uma família com fallback garantido (`Helvetica, Arial, sans-serif` já melhora, porque a última é sempre resolvível) ou dar folga na caixa. A rasterização a 4x resolve o problema à força, e é a razão de ela ser o padrão. **Recomendação: `--embed-svg-fonts false`, e caixas com folga.** Oito vezes menos peso, texto selecionável, nitidez infinita.

### 4.3 Acessibilidade: o draw.io não emite nada

Medido nos três exports:

```
<title>: 0     <desc>: 0     role=: 0
```

**O SVG exportado não tem nome acessível de espécie alguma.** Não há `<title>`, não há `<desc>`, não há `role="img"`, não há `aria-label`. Para um leitor de tela, um SVG inline sem esses atributos é um punhado de formas sem semântica; a [Nota da WAI sobre SVG acessível](https://www.w3.org/WAI/tutorials/images/) e o padrão [`graphics-aria`](https://www.w3.org/TR/graphics-aria-1.0/) exigem `role="img"` mais rótulo para que a coisa seja anunciada como uma imagem única.

Isso inverte um argumento. A rota `<img>` **ganha** em acessibilidade sobre a rota inline, porque `alt` é obrigatório, óbvio e revisável em diff:

```mdx
![Web em três camadas e duas zonas de disponibilidade](/diagramas/web-multi-az.drawio.svg)
```

A rota inline exigiria um passo de pós-processamento que injeta `role="img"` e `aria-label` no `<svg>` — passo que teria de rodar em algum lugar, e não há lugar (§5.2). `docs/design/componentes/frame.md:175-178` já diz que `role="img"` mais rótulo é a única rota; com `<img>`, ela é gratuita.

### 4.4 Tema: a medição que decide

Esta é a parte central, e ela contraria a intuição de spec deste repo.

**Montagem.** Chrome headless, CDP cru, cor lida por `drawImage` numa `canvas` 1×1 (o `getComputedStyle` de um `<img>` não diz nada sobre o que está dentro dele). SVGs-sonda de 100×100 pintando vermelho no claro e azul no escuro. A página-hospedeira declara exatamente o que `src/css/tokens.css:707-708` e `:854-855` declaram:

```css
:root { color-scheme: dark; }
:root[data-theme='light'] { color-scheme: light; }
```

**Resultado, `<img>`:**

| SO `prefers-color-scheme` | `data-theme` no `<html>` | `color-scheme` de `:root` | cor pintada |
| --- | --- | --- | --- |
| light | (ausente) | dark | **escuro** |
| light | `dark` | dark | **escuro** |
| light | `light` | light | **claro** |
| dark | (ausente) | dark | **escuro** |
| dark | `dark` | dark | **escuro** |
| dark | `light` | light | **claro** |

**A preferência do sistema operacional não aparece na tabela.** O que decide é o `color-scheme` da página hospedeira, e ele é decidido pelo `data-theme` que o Docusaurus grava. Isso vale tanto para `light-dark()` quanto para `@media (prefers-color-scheme: dark)` escrito **dentro** do SVG: as duas coisas foram medidas e as duas seguem o hospedeiro.

**E o `<img>` já montado repinta ao vivo**, sem recarregar e sem trocar o `src`:

```
1. <img> já montado, tema inicial                          : escuro (rootCS=dark)
2. MESMO <img>, após data-theme=light SEM recarregar        : claro  (rootCS=light)
3. MESMO <img>, após voltar a data-theme=dark               : escuro (rootCS=dark)
```

**Três controles, para não confundir mecanismo com coincidência:**

1. Um SVG que **não** declara `color-scheme` no próprio root **trava no claro**, em qualquer combinação. O `light-dark()` precisa de `color-scheme: light dark` no elemento para que o lado escuro seja alcançável — e o draw.io escreve exatamente isso:

   ```
   <svg … style="background: #FFFFFF; background-color: light-dark(#FFFFFF, #121212); color-scheme: light dark;" …>
   ```

2. `data-theme` **sozinho** não faz nada. Numa página que não declara `color-scheme`, mudar `data-theme` não muda um pixel dentro do `<img>`. O elo é o `color-scheme`, e este repo já o tem.

3. `currentColor` dentro de `<img>` resolve para **preto**, mesmo com o palco declarando `color: rgb(0,128,0)`. Confirma, ao pé da letra, o que `docs/design/componentes/frame.md:158-159` afirma. A regra está certa sobre `currentColor`; o ponto é que o draw.io não usa `currentColor`.

**O caso inline é o inverso, e é uma armadilha.** Com o SVG colado no DOM:

| Variante | SO light, `data-theme=dark` | SO dark, `data-theme=light` |
| --- | --- | --- |
| como o draw.io exporta | **claro** (errado) | **escuro** (errado) |
| com `color-scheme` removido do root | **escuro** (certo) | **claro** (certo) |

Inline, o `color-scheme: light dark` que o draw.io grava no root **vence** o `color-scheme` herdado de `:root`, e o diagrama passa a seguir o sistema operacional enquanto o resto do site segue o botão. Para inlinar, é preciso **remover** aquele fragmento do atributo `style` do `<svg>`. Para usar em `<img>`, é preciso **mantê-lo**. As duas rotas querem o arquivo em estados diferentes, e essa é uma razão a mais para escolher uma.

Medido com o SVG real, fundo `light-dark(#FFFFFF, #121212)`:

```
inline, como exportado, SO=dark, data-theme=light   -> rgb(18,18,18)    ERRADO
inline, sem color-scheme no root, SO=dark, dt=light -> rgb(255,255,255) CERTO
inline, sem color-scheme no root, SO=light, dt=dark -> rgb(18,18,18)    CERTO
```

**Um efeito colateral do inline, medido de quebra:** o `<style>` de um SVG colado no DOM **vaza para a página inteira**. A sonda com `<style>rect{fill:#ff0000}</style>` reescreveu o `fill` de um `<rect>` de outro SVG na mesma página. O draw.io emite um `<style>` no root sempre que a cor adaptativa entra em jogo (`Graph.js:1955-1963`, o bloco `@supports (color: light-dark(…))`), e ele usa seletor de `id`, o que evita este caso específico. Mas a propriedade geral vale: **inlinar SVG de terceiro é injetar CSS global.**

### 4.5 O `viewer.min.js` vendorizado

Candidato de primeira classe, avaliado pelos próprios méritos.

**Peso servido, medido:**

```
$ curl -sI https://viewer.diagrams.net/js/viewer.min.js
HTTP/2 200 · content-type: text/javascript · cache-control: public, max-age=2592000
$ stat -c %s viewer.min.js
2680095            (2,68 MB)
$ curl -H 'Accept-Encoding: gzip' … | wc -c
830444             (o que o servidor entrega hoje)
$ gzip -9 -c viewer.min.js | wc -c
681275
```

**Ele telefona para casa, e não é opcional.** As primeiras linhas do arquivo cravam os caminhos remotos:

```js
window.STYLE_PATH=window.STYLE_PATH||"https://viewer.diagrams.net/styles";
window.SHAPES_PATH=window.SHAPES_PATH||"https://viewer.diagrams.net/shapes";
window.STENCIL_PATH=window.STENCIL_PATH||"https://viewer.diagrams.net/stencils";
window.DRAW_MATH_URL=window.DRAW_MATH_URL||"https://viewer.diagrams.net/math4/es5";
window.mxImageBasePath=window.mxImageBasePath||"https://viewer.diagrams.net/mxgraph/images";
```

Servindo o `viewer.min.js` de `127.0.0.1` e monitorando a rede com `Network.requestWillBeSent`, com um diagrama que usa duas formas `mxgraph.aws4.*`:

```
--- EXTERNAS (fora de 127.0.0.1): 9
   !! https://viewer.diagrams.net/shapes/mxAWS4.js
   !! https://viewer.diagrams.net/stencils/aws4.xml
   !! https://viewer.diagrams.net/math4/es5/startup.js
   !! …mais 6 do MathJax…
```

**Os stencils AWS4 não estão dentro do `viewer.min.js`.** São buscados sob demanda, quando o parser encontra a forma no XML.

**Bloqueando `*.diagrams.net`, o diagrama quebra em silêncio:**

```
--- DOM: {"svg":true,"paths":0,"rects":3,"imgs":0,"texto":"caixa comumLambda"}
```

`paths: 0`. As caixas e os rótulos continuam; **os ícones AWS somem e sobram quadrados coloridos vazios**. O screenshot confirma: onde deveria estar o λ do Lambda há um retângulo laranja liso, e onde deveria estar o Transit Gateway há um retângulo roxo liso. Sem erro no console, sem placeholder, sem aviso. Num corporativo com egress fechado, é exatamente esse o resultado.

**Vendorizando tudo, funciona — e o preço é este:**

| Arquivo | Bytes | gzip -9 |
| --- | --- | --- |
| `js/viewer.min.js` | 2.680.095 | 681.747 |
| `shapes/mxAWS4.js` | 10.747 | 1.462 |
| `stencils/aws4.xml` | **6.507.954** | 1.093.434 |
| **total** | **9.198.796** (8,77 MiB) | **1.776.643** (1,69 MiB) |

Com esses três arquivos servidos localmente e `window.STENCIL_PATH`/`SHAPES_PATH` redirecionados antes da carga do viewer, e com `*.diagrams.net` bloqueado no CDP:

```
--- EXTERNAS (fora de 127.0.0.1): 0
--- DOM: {"svg":true,"paths":3,"rects":3,"imgs":0,…}
```

Os ícones pintam. **A opção é tecnicamente viável offline, ao custo de 8,77 MiB commitados.**

`viewer-static.min.js` (4.151.717 B), a outra variante do repo, **não** resolve: ele embute o código das formas mas continua apontando `STENCIL_PATH` para o remoto, e a geometria dos stencils não está lá.

**Montagem em React funciona, e o caminho certo não é o atributo HTML.** Passar o XML por `data-mxgraph` escrito no HTML **quebrou** com `Expected ',' or '}' after property value in JSON at position 12728`, porque o XML de um diagrama real tem caracteres que não sobrevivem à dupla escapação HTML+JSON. O que funciona é o que um `useEffect` faria de qualquer forma:

```js
el.className = 'mxgraph';
el.setAttribute('data-mxgraph', JSON.stringify({ highlight:'#0000ff', nav:true, resize:true,
  toolbar:'zoom layers lightbox pages', xml }));
GraphViewer.createViewerForElement(el);
```

Medido: `{"montou":true,"paths":31,"texto":"Web · três camadas em duas zonas…"}`, zero requisições externas. Assinatura em `GraphViewer.js:2651`.

**O que se perde por renderizar no cliente. Cada item medido:**

| Pergunta | Medição |
| --- | --- |
| O diagrama existe no HTML estático? | **Não.** `curl` no HTML servido: **0** ocorrências de `<svg>`. |
| A busca do site indexa o texto de dentro do diagrama? | **Não**, e não indexaria nem no outro caminho. O índice é construído do **MDX fonte** (`src/plugins/busca/index.js:58-99`), e `aTextoPlano` apaga toda tag JSX com `.replace(/<[^>]*>/g, ' ')` (`:96`). Um `<Drawio src=…/>` some inteiro. Um `![alt](…)` **sobrevive pelo `alt`**, porque `:99` reduz `!?\[([^\]]*)\]\([^)]*\)` ao rótulo. Ponto para o `<img>`. |
| Leitor de tela lê o quê? | O SVG que o viewer monta não tem `<title>`, `<desc>` nem `role` (§4.3), e o container tampouco. Sem fiação manual, nada. |
| A página imprime o diagrama? | Sim, se o JS tiver rodado: o SVG está no DOM. Sob `media: print`, o `<img>` do híbrido imprimiu corretamente no PDF gerado por `Page.printToPDF`. |
| O que aparece se o JS não rodar? | **Nada.** Com `Emulation.setScriptExecutionDisabled`: `svg=0`, `innerText` vazio, container em branco. |
| Quanto atrasa a pintura? | **1213 ms** do `Page.navigate` até o `<svg>` existir, servindo os 8,77 MiB de `127.0.0.1`, sem latência de rede, sem concorrência de CPU. Na máquina de um leitor, com o bundle do Docusaurus disputando a thread, é piso, não estimativa. |

**O que o viewer entrega que um SVG não entrega.** Isto é real, e é o argumento honesto a favor dele:

| Recurso | Existe no viewer | Dá para ter num SVG? |
| --- | --- | --- |
| Zoom interativo com botões | sim (`toolbar: 'zoom'`) | **em parte** — `<img>` amplia com o zoom do navegador; ampliar só o diagrama exige JS |
| Lightbox (clique para ampliar) | sim (`toolbar: 'lightbox'`) | não, sem JS |
| Camadas ligáveis e desligáveis | sim (`toolbar: 'layers'`) | não |
| Navegação entre páginas do mesmo arquivo | sim (`toolbar: 'pages'`) | **não** — o `<img>` mostra a primeira página, mesmo com as quatro dentro do `content` |
| Tooltip por forma | sim (`show-tooltip-icons`) | não |
| Link clicável dentro de forma | sim | **sim** — o SVG exportado preserva `<a xlink:href>`, mas só é clicável se o SVG estiver **inline**; dentro de `<img>` é inerte |
| Botão "editar este diagrama" | sim (`edit` no config) | não |
| Modo escuro | `dark-mode: 'dark' \| 'light' \| 'auto'` (`GraphViewer.js:165-166`); `auto` segue `prefers-color-scheme` e escuta mudança (`:754-758`, `:1010-1011`) | **sim, e melhor** — segue o `data-theme` sem código (§4.4). O viewer **não** conhece `data-theme`: seguiria o sistema operacional a menos que o componente React passe `dark-mode` a partir de `useColorMode`, que hoje tem **zero** usos neste repo |

**Licença.** O repositório `jgraph/drawio` é **Apache License 2.0** (`LICENSE` na raiz do `dev`, 11.356 bytes, verificado por `curl`). O bundle carrega terceiros com aviso embutido, entre eles DOMPurify 3.4.13 (Apache 2.0 e MPL 2.0, dual) e spin.js (MIT). O `viewer.min.js` servido **não** carrega cabeçalho de licença próprio no topo; a licença é a do repositório. Nota de atenção: o bundle contém strings de licenciamento **comercial** (`licenseHasExpired`, `license-drawio-confluence-jira-cloud`) que pertencem aos plugins pagos de Confluence e Jira. Elas não se aplicam ao uso do viewer, mas quem for auditar o repositório vai encontrá-las e perguntar.

### 4.6 Os caminhos que morreram, um parágrafo cada

**SVG puro em `static/` com `<img>` ou `![]()`.** Tecnicamente idêntico ao híbrido menos os 22 KB do `content`, e portanto menos a propriedade que decide: o `.drawio` fonte fica num arquivo separado, e os dois divergem no dia em que alguém editar um e esquecer o outro. Era exatamente esse o problema que um portão de CI resolveria, e o portão é ilegal. **Morre porque reintroduz dois artefatos.**

**Importar o SVG como componente React via SVGR.** Funciona sem dependência nova: `@svgr/webpack` 8.1.0 (MIT) está em `node_modules/`, e `@docusaurus/plugin-svgr` entra pelo `preset-classic` a menos que se passe `svgr: false` (`node_modules/@docusaurus/preset-classic/lib/index.js:63-64`). A regra é envolvida em `oneOf` e só se aplica quando o `issuer` casa `/\.(?:tsx?|jsx?|mdx?)$/i` (`node_modules/@docusaurus/plugin-svgr/lib/svgrLoader.js`), o que dá `import Diagrama from './x.svg'` dentro de `.mdx`, com `titleProp: true` e SVGO preservando `viewBox` e `title`. Habilita CSS herdado e `currentColor`; quebra o `foreignObject` do draw.io? Não: inline, o `foreignObject` renderiza. **Morre por três razões:** exige remover o `color-scheme` do root (§4.4), injeta o `<style>` do SVG na página inteira, e leva o XML fonte para longe de novo.

**`<ThemedImage>` do Docusaurus.** A API está confirmada em `node_modules/@docusaurus/theme-classic/src/theme-classic.d.ts:1628-1638`: `sources: {light: string, dark: string}`, mais tudo de `<img>` menos `src`. A implementação em 3.10.2 delega a `ThemedComponent` do `theme-common`, que **renderiza as duas variantes no SSR** para evitar flash e mismatch de hidratação, escondendo uma por CSS. **Morre porque resolveria por dois arquivos um problema que o `light-dark()` já resolve com um** — e porque dois arquivos é o que se quer evitar. Continua sendo a saída correta para PNG e para captura de tela, que não têm como bifurcar sozinhos.

**SVG único respondendo a `prefers-color-scheme`.** Medido: **funciona dentro de `<img>`**, mas responde ao `color-scheme` do hospedeiro, não à preferência do sistema (§4.4). Não é um caminho separado; é o mesmo mecanismo por outro nome, e o `light-dark()` que o draw.io já emite é a forma canônica dele.

**iframe `embed.diagrams.net` / `viewer.diagrams.net/?…#R<xml>`.** O XML comprimido pelo esquema do §3.2 vai no fragmento da URL depois de `#R`. Morre porque **exige rede externa em runtime**, que é a definição do que um corporativo fechado bloqueia, e porque o fragmento cresce com o diagrama até esbarrar no teto prático de URL de navegadores e proxies — **teto não medido nesta pesquisa**, mas o diagrama medido daria 3.580 bytes comprimidos, e um de porte real, múltiplos disso.

> **Nota, e ela é uma lacuna do repo, não desta rota.** O **zero 3** de `scripts/cinco-zeros.sh` **não pegaria** um iframe. A primeira perna varre `src/` atrás de `fetch(`, `XMLHttpRequest`, `new WebSocket` e `EventSource(` (`:90`); a segunda isola, por decisão declarada em `:120-122`, apenas `<script>` e `<link>` com `src`/`href` de outra origem (`:123-124`). Um `<iframe src="https://…">` passa pelas duas. A rota morre pelo requisito de rede, não por régua de máquina — e a régua tem um furo do tamanho de um iframe.

**Pipeline de build com `drawio --export` em CI.** Morto por decreto de escopo: a esteira é imutável e nada roda em CI. Registre-se, porém, que **as flags existem e funcionam headless**, porque foi assim que esta pesquisa mediu tudo: `xvfb-run -a drawio -x -f svg -e --embed-svg-fonts false -o saida.drawio.svg entrada.drawio --no-sandbox --disable-gpu`. O `xvfb` é obrigatório (é Electron), e a skill `panlabs-aws-diagrams` já usa exatamente esse invocador em `tools/render.sh:32-34`. Isso continua sendo o passo **da máquina do autor**, que é legítimo; o que morre é fazê-lo em máquina alheia.

**Plugin remark ou webpack convertendo em tempo de build.** Mesmo motivo, mesma sentença: `docusaurus build` roda na esteira quando o site é publicado.

**Os plugins npm.** `docusaurus-plugin-drawio`, `remark-docusaurus-drawio` e `@docusaurus/theme-mermaid` estão fora antes da primeira linha de código, pelo axioma 2. `scripts/cinco-zeros.sh:68-82` compara a lista **ordenada de chaves** de `dependencies` e `devDependencies` contra dois literais fechados em `:28-29`; qualquer chave nova reprova. Vale registrar o que fariam: os dois primeiros embutem o viewer e resolvem a fiação que este relatório mediu à mão, e o terceiro habilita ` ```mermaid ` nativo. O gatilho para reabrir os três é um só: **o axioma 2 cair**.

### 4.7 Mermaid, a comparação honesta

Mermaid resolve o mesmo problema pelo eixo oposto: o diagrama é **texto na própria página**, e o motor desenha.

| | draw.io | Mermaid |
| --- | --- | --- |
| Fonte | XML, `17 KB` para o diagrama medido | texto, tipicamente 10 a 40 linhas |
| Diff | legível com `compressed="false"` | trivialmente legível |
| Autoria | ferramenta gráfica, ou motor determinístico (a skill) | escrito à mão |
| Controle de layout | absoluto, `x`/`y` por célula | nenhum, o motor decide |
| Ícones AWS | **sim**, `mxgraph.aws4.*` | **não**, só formas genéricas |
| Peso no site | 78 KB por diagrama | motor no bundle, diagrama ~0 |
| Custo aqui | **zero** | **uma dependência npm** |
| Tema | `light-dark()`, medido funcionando | tema do plugin, integrado ao `colorMode` |

**O que se perderia trocando por Mermaid:** os ícones AWS, e com eles a razão de existir da skill `panlabs-aws-diagrams`; o controle geométrico, que é o que o validador de 62 checagens da skill confere; e a possibilidade de abrir o desenho numa ferramenta gráfica.

**O que se ganharia:** o diagrama vira texto revisável em PR, sem binário e sem passo de exportação.

`docs/design/componentes/frame.md:42-52` já registra Mermaid como `lacuna por restrição`, com o gatilho escrito: *"reabre se o zero 2 se mover"*. Nada nesta pesquisa move esse gatilho. Para arquitetura AWS desenhada por motor determinístico, Mermaid não é substituto; para fluxograma e sequência simples, seria melhor que draw.io, e continua barrado pelo mesmo axioma.

---

## 5. Manutenção e fluxo de trabalho

### 5.1 O diff em git

Três estados possíveis do mesmo diagrama:

| Estado | Diff |
| --- | --- |
| `.drawio` com `compressed="true"` | **inútil** — uma linha de base64 muda inteira a cada edição |
| `.drawio` com `compressed="false"` | **legível** — uma linha por `<mxCell>` |
| `.drawio.svg` | **legível em duas camadas** — o `content` traz o XML em texto, e o corpo SVG traz a geometria pintada |

O `.drawio.svg` produz um diff **maior** (o desenho e o modelo mudam juntos), mas não um diff opaco. E como a exportação foi medida como determinística (§4.1, ida e volta byte a byte), duas gerações do mesmo modelo dão o mesmo arquivo.

O ponto de atenção para determinismo é o que o app reescreve: `host` e os atributos de viewport `dx`/`dy`/`fold`/`page` do `<mxGraphModel>` (§4.1). Se o arquivo publicado for sempre gerado pelo mesmo caminho, isso não oscila; se um dia sair do app gráfico e outro dia do CLI, oscila.

### 5.2 Fluxo de edição

| Ferramenta | O que grava por padrão |
| --- | --- |
| **app desktop** (`drawio-desktop` 31.x) | `.drawio` com `compressed="false"`, medido em §3.2. Salva `.drawio.svg` e `.drawio.png` diretamente pelo *Salvar como*, mantendo o arquivo editável |
| **CLI** (`drawio -x`) | o que as flags mandarem; **sem** `-u` já sai descomprimido |
| **app web** (app.diagrams.net) | idem, mesma base de código, mesmo `Editor.defaultCompressed = false` |
| **VS Code, Hediet Draw.io Integration** | abre `.drawio`, `.drawio.svg` e `.drawio.png` como editor visual, no lugar do texto; grava de volta no mesmo formato do arquivo aberto. **Não medido** — a extensão não está instalada nesta máquina |
| **skill `panlabs-aws-diagrams`** | `.drawio` com `host="panlabs-aws-diagrams" compressed="false"`, `1 + N` páginas num arquivo, `shape=mxgraph.aws4.*` (nunca `image=data:`), determinístico por requisito |

O fluxo que a medição sustenta, com um artefato só:

1. gerar o `.drawio` pela skill, ou desenhar no app;
2. na máquina do autor, uma vez: `xvfb-run -a drawio -x -f svg -e --embed-svg-fonts false -o <nome>.drawio.svg <nome>.drawio --no-sandbox --disable-gpu`;
3. commitar **só o `.drawio.svg`** e apagar o `.drawio`, porque ele está inteiro lá dentro;
4. para editar, abrir o próprio `.drawio.svg` no app ou no VS Code, salvar, e o arquivo já é o publicado.

O passo 3 é o que faz a tese valer. Manter os dois arquivos anula a pesquisa.

### 5.3 O que substitui o portão de CI que não pode existir

Nada precisa substituir. **O portão existia para conferir que o derivado corresponde à fonte, e com um artefato só não há correspondência a conferir.** Essa é a propriedade que decidiu a recomendação.

Se ainda assim fizer falta uma rede de segurança, ela cabe no único lugar dinâmico permitido: um plugin local de Docusaurus com hook que só roda em `npm start`. `docusaurus.config.js:224-225` já registra dois plugins locais (`./src/plugins/busca` e `./src/plugins/ai-era`), então o precedente e a fiação existem. O que ele poderia fazer, sem custo em CI e sem dependência:

- avisar no terminal do dev server quando um `.drawio.svg` **não** tiver o atributo `content` (alguém exportou sem `-e` e o fonte se perdeu);
- avisar quando um `.drawio` **e** um `.drawio.svg` de mesmo nome existirem lado a lado, que é a condição de deriva.

Isto é sugestão, não recomendação. **Com o fluxo do §5.2 seguido, a condição de erro que ele detectaria não pode ocorrer.**

---

## 6. Qualidade de renderização

Consolidando o que foi medido, contra o pedido de "a melhor possível".

**Nitidez e escala.** SVG com `<text>` é resolução-independente: nítido em qualquer zoom, em qualquer densidade de tela. PNG a 2x pesa 206 KB contra 78 KB do híbrido e borra a partir de 2x. A rasterização interna do `--embed-svg-fonts true` é 4x e pesa 290 KiB por diagrama. **`--embed-svg-fonts false` é a escolha de qualidade, não só de peso.**

**Texto.** Com `<text>`, é selecionável, copiável e encontrável pelo `Ctrl+F` — mas só quando o SVG está inline. Dentro de `<img>`, o texto é opaco ao `Ctrl+F` do navegador em qualquer variante. Isso é um custo real do `<img>`, e o `alt` é o que o compensa (§4.3, §4.5).

**Diagrama largo em coluna estreita.** O acervo publica a largura da coluna em `src/css/chrome.css` a partir de `--pd-container-width` e `--pd-doc-width`. Um diagrama de 727px como o medido já não cabe confortavelmente. As opções que não custam dependência nem JS novo:

- **rolagem horizontal** no contêiner, que é o comportamento padrão de `.frameStage` se o `overflow: hidden` de `src/components/catalogo.module.css:668-678` virar `overflow-x: auto`;
- **encolher para caber**, que `.frameStage :is(img, svg) { max-inline-size: 100% }` (`:698-703`) já faz, ao custo de rótulo pequeno;
- **`<details>`** para esconder o diagrama grande atrás de um resumo, HTML puro, zero JS;
- **sangria total**, quebrando a coluna com uma classe própria, que é decisão de spec e não desta pesquisa;
- **clique para ampliar sem JS novo**: envolver o `<img>` num `<a href="/diagramas/x.drawio.svg" target="_blank">`. O navegador abre o SVG em documento próprio, com zoom nativo. Custa uma tag e nenhuma linha de JavaScript. Vale notar que ali, em documento isolado, o `light-dark()` volta a seguir o sistema operacional, não o site.

Atenção a um detalhe deste repo: `docs/design/componentes/frame.md:10-11` diz que a moldura **não** enquadra mídia binária. Um `.drawio.svg` não é binário, mas é asset, e o parágrafo seguinte (`:17-22`) dá como razão que *"binário versionado num repo de documentação é peso que não se revisa em diff"*. O híbrido responde a essa objeção específica: **ele se revisa em diff**, nas duas camadas (§5.1).

**Acessibilidade.** Coberta em §4.3. `alt` no `<img>` é a rota, e é a única que o repo consegue cobrar por leitura de PR sem escrever máquina nenhuma.

**Peso.** Um diagrama de porte médio custa **78 KB crus, 14 KB gzipados**. Trinta e sete páginas com um diagrama cada custariam cerca de 2,9 MB crus e 520 KB gzipados no diretório de build. Para comparação, `stencils/aws4.xml`, sozinho, custa **6,5 MB**.

---

## 7. O que isto custaria a este repo

Assumindo a recomendação do §8 e uma primeira página com diagrama.

**Arquivos novos**

| Caminho | O que é | Peso |
| --- | --- | --- |
| `static/diagramas/<nome>.drawio.svg` | o híbrido: desenho publicado **e** fonte editável | ~78 KB por diagrama |
| `static/diagramas/LICENSE.txt` | nenhum, se o desenho for autoral. Os shapes `mxgraph.aws4.*` já vêm expandidos em `<path>` no SVG exportado, e o repositório de origem é Apache 2.0 | 0 ou ~11 KB |

**Por que `static/diagramas/` e não `static/icons/`:** `scripts/vendorizar-icones.mjs:24` fixa `DESTINO = 'static/icons'` e `--conferir` reprova qualquer `.svg` órfão ali (`:159-170`), passo que a CI roda (`npm run icones`). Um diagrama em `static/icons/` **quebraria a CI**. Qualquer outra pasta de `static/` não é conferida por nada, o que aqui é a propriedade desejada.

**Script novo:** nenhum obrigatório. O comando de exportação é uma linha na máquina do autor (§5.2), e a skill `panlabs-aws-diagrams` já tem o invocador headless pronto em `tools/render.sh`. Se valer a pena formalizar, o molde a copiar não é `espelho-tokens.mjs` (que confere derivado contra fonte, e não há mais o que conferir) e sim `scripts/vendorizar-icones.mjs`: script de mão, que precisa de rede ou de binário, **explicitamente fora da CI** — `docs/design/icones.md:43` já estabelece esse precedente com todas as letras.

**Portão novo:** nenhum. Por decreto de escopo, e porque a arquitetura de artefato único torna o portão vazio.

**KB no build:** 78 KB por diagrama, 14 KB gzipados. Nenhum byte no bundle JavaScript.

**O que os portões existentes cobram de uma página nova com diagrama.** Isto é o custo real, e ele não vem do diagrama:

| Cobrança | Onde | O que exige |
| --- | --- | --- |
| 1 — volume por aba | `portao-4-conteudo.sh:315-342` | **cinco literais a acertar**: `27` (`:319`), `33` (`:323`), `26` (`:332`), `31` (`:335`), `37` (`:338`), mais `VOLUME_*` em `:145-148` |
| 2 — tipo de página | `:346-419` | a página precisa de linha `caminho:tipo` no manifesto `TIPOS` do próprio script, com orçamento estrutural mínimo por tipo |
| 3 — heading | `:433-491` | mínimo de 3 `##`, com exceções por gabarito |
| 10 — front matter | `:668-676` | `description:` obrigatório. Cuidado com `: ` dentro do valor, que derruba o build |
| 13 — locale | `:749-761` | se nascer em `Ferramentas`, exige contraparte em `i18n/en/…` e o literal `31` de `:761` |
| 14 — travessão | `:815-866` | **atenção**: o `find` de `:825` é `-type f`, **sem filtro de extensão**. Um `.drawio` ou `.drawio.svg` posto dentro de `conteudo/`, `i18n/` ou `contratos/` **seria varrido**, e qualquer `—` num rótulo de diagrama reprovaria. Em `static/` não há varredura |

**O portão 1 não olha SVG.** `scripts/portao-1-literais.sh:68` é `find src -name '*.css'`. Um `.svg` com `fill="#232F3E"` cravado não é visto por régua nenhuma deste repo. Isso é uma lacuna real: **nada hoje impede um diagrama com cor assada.** O `light-dark()` do draw.io não é token do sistema; são as cores da paleta AWS bifurcadas pelo próprio draw.io. Um diagrama publicado por esta rota traz cores que não vêm de `src/css/tokens.css`, e a spec precisa decidir se isso é aceitável para o conteúdo de uma moldura. É outra procedência, não um portão.

**O ponto de spec que precisa de decisão:** `docs/design/componentes/frame.md:156-161` fecha a rota `<img>` por escrito. Adotar a recomendação exige mexer nessa linha, e mexer nela mexe na tabela de procedência do documento — que `.claude/rules/spec-design.md` diz ser a régua que mais reprova. Isso não é custo de implementação; é custo de decisão, e ele tem dono.

---

## 8. Recomendação fechada

**Publique o híbrido `.drawio.svg`, exportado com `-e --embed-svg-fonts false` e sem `-p`, referenciado por `<img>` com `alt` descritivo, servido de `static/diagramas/`. Commite o `.drawio.svg` e não commite o `.drawio`.**

O raciocínio, em quatro linhas:

1. É **um artefato só**. O publicado e o fonte são o mesmo arquivo, medido nos dois sentidos e estável byte a byte na ida e volta. O problema de deriva não é mitigado; ele **não existe**.
2. **Acompanha o tema do site sozinho**, ao vivo, sem JavaScript e sem `ThemedImage`, porque `src/css/tokens.css:708` e `:855` já declaram o `color-scheme` que o `light-dark()` do draw.io consome. Isso foi medido em seis combinações de sistema operacional e `data-theme`, mais o repinte de um `<img>` já montado.
3. **Custa 78 KB por diagrama e zero byte de motor.** A alternativa custa 8,77 MiB de motor commitado, mais 1213 ms de atraso, mais tela em branco sem JS, mais ausência total no HTML estático.
4. **Sobrevive ao corporativo fechado por construção**, porque não faz uma requisição.

**Premissa explícita, e ela é uma restrição de projeto, não uma verdade técnica:** *a esteira de CI é imutável e nada pode rodar fora da máquina do autor.* Se essa premissa cair, a resposta muda de forma, não de direção: com CI livre, o SVG puro derivado de um `.drawio` fonte, conferido por um verificador no molde de `scripts/portao-5-referencia.sh:100-124` (regenera e reprova em `git status --porcelain`), seria **melhor** que o híbrido, porque tiraria 22 KB de cada arquivo, deixaria o fonte com diff mais limpo e permitiria pós-processar o SVG (injetar `role="img"` e `aria-label`, remover o `color-scheme` do root para inlinar). O híbrido vence **por causa da restrição**, não apesar dela.

### O dissenso registrado

**Primeiro, e o mais forte: a spec proíbe `<img>` para diagrama, hoje, por escrito.** `docs/design/componentes/frame.md:156-161`, com procedência em [#60](https://github.com/ThiagoPanini/panlabs-docs/issues/60). A medição confirma o motivo declarado — `currentColor` dentro de `<img>` resolve para preto, contra o `color: rgb(0,128,0)` do palco — e mostra que a conclusão não alcança este caso, porque o draw.io não emite `currentColor` em lugar nenhum. A regra e a medição não se contradizem; a regra apenas foi escrita contra um mecanismo que este diagrama não usa. **Quem decide é o dono da spec, e a decisão é reescrever a regra ou recusar a recomendação.** Não há terceira saída: inlinar o SVG do draw.io traz o vazamento de `<style>`, a necessidade de remover o `color-scheme` do root, a ausência de nome acessível e o retorno de dois artefatos.

**Segundo: o viewer entrega quatro coisas que o `<img>` não entrega** — zoom com botões, camadas, navegação entre páginas do mesmo arquivo, e tooltip. A navegação entre páginas é a que mais dói neste acervo, porque a skill `panlabs-aws-diagrams` emite `1 + N` páginas de propósito, e o `<img>` mostra uma. **Se a jornada publicada depender de o leitor alternar entre a vista lógica e a técnica no mesmo lugar, o `<img>` não serve** e a escolha se reabre. A saída barata é publicar duas imagens lado a lado, ou uma por seção, o que custa um segundo export e nenhum byte de motor.

**Terceiro: o texto do diagrama não é encontrável.** Nem pelo `Ctrl+F` do navegador dentro de um `<img>`, nem pela busca do site, que indexa o MDX fonte (`src/plugins/busca/index.js:58-99`). O `alt` entra no índice; os rótulos de dentro do desenho, não. Isso vale para as duas rotas, mas quem espera que "VPC de produção" encontre a página vai se decepcionar.

**Quarto: as cores do diagrama não são tokens.** A paleta AWS4 entra no site por fora de `src/css/tokens.css`, e nenhum portão a vê. É uma superfície nova sem régua.

### Os gatilhos que reabrem a decisão

| Gatilho | O que muda |
| --- | --- |
| **O axioma 2 cai** (dependência npm permitida) | `docusaurus-plugin-drawio` e `@docusaurus/theme-mermaid` voltam à mesa. O primeiro entrega o viewer com a fiação pronta; o segundo entrega Mermaid. Reavalie os dois antes de manter esta recomendação |
| **A esteira de CI deixa de ser imutável** | O SVG puro derivado, com verificador no molde do portão 5, passa a ser melhor que o híbrido, pelas razões do parágrafo de premissa |
| **A jornada exigir navegação entre páginas do mesmo `.drawio`** | O `<img>` não serve para esse caso. Ou fatie o `.drawio` em um por vista, ou o viewer volta a ser candidato para essa página específica |
| **A spec passar a exigir que todo pigmento publicado venha de token** | O `light-dark()` da paleta AWS reprova, e a rota inteira precisa de um passo de reescrita de cor que não tem onde rodar |
| **`docs/design/componentes/frame.md:156-161` for mantida como está** | A recomendação está recusada, e o caminho vivo passa a ser o viewer vendorizado, a 8,77 MiB, com os quatro custos do §4.5 aceitos |

---

## 9. Apêndice: comandos exatos das medições

Para quem quiser reproduzir. Todos foram executados em `/tmp`, fora do repo.

```bash
# binário usado (já instalado nesta máquina, 216 MB, fora do repo)
DRAWIO=~/.local/opt/drawio/squashfs-root/drawio
xvfb-run -a "$DRAWIO" -V --no-sandbox --disable-gpu      # -> 31.3.1

# o export recomendado
xvfb-run -a "$DRAWIO" --no-sandbox --disable-gpu \
  -x -f svg -e --embed-svg-fonts false -o nome.drawio.svg nome.drawio

# provar que o híbrido é o fonte
xvfb-run -a "$DRAWIO" --no-sandbox --disable-gpu -x -f xml -o volta.xml nome.drawio.svg

# provar que a ida e volta é estável
xvfb-run -a "$DRAWIO" --no-sandbox --disable-gpu \
  -x -f svg -e --embed-svg-fonts false -o dois.drawio.svg nome.drawio.svg
cmp nome.drawio.svg dois.drawio.svg     # silêncio = idêntico

# extrair o XML embutido sem o draw.io
python3 -c "import re,html,sys; s=open(sys.argv[1],encoding='utf-8').read(); \
print(html.unescape(re.search(r'\scontent=\"([^\"]*)\"',s).group(1)))" nome.drawio.svg

# peso servido do viewer
curl -s https://viewer.diagrams.net/js/viewer.min.js      -o v.js   && stat -c %s v.js
curl -s https://viewer.diagrams.net/stencils/aws4.xml     -o a.xml  && stat -c %s a.xml
curl -s https://viewer.diagrams.net/shapes/mxAWS4.js      -o s.js   && stat -c %s s.js
```

O medidor de cor, de propagação de `color-scheme` e de rede é Chrome headless por CDP cru, com `WebSocket` nativo do Node 24 e binário em `~/.cache/ms-playwright/`. **Zero dependência nova**, como manda o axioma 2 — e como `docs/research/README.md:41` registra que a primeira pesquisa desta casa já fazia.

---

## Correção, 2026-08-27 — a ida e volta não é sempre byte a byte

A §4.1 afirma que reexportar o híbrido a partir dele mesmo devolve o arquivo idêntico. A afirmação foi remedida durante a implementação da [#145](https://github.com/ThiagoPanini/panlabs-docs/issues/145), e **ela vale condicionada ao fundo do diagrama**. O arquivo medido em §4.1 tinha `background: #FFFFFF`.

- **Fundo explícito** — o draw.io não emite bloco `<style>`, e o arquivo é estável byte a byte na reexportação. É o caso que a §4.1 mediu.
- **Fundo transparente** — ele emite `<style>@supports (color: light-dark(#000, #fff)) { #ge-svg-XXXXXXXX { … } }</style>` amarrado a um `id` **regerado a cada gravação**, e o mesmo `id` aparece no `<svg>` raiz. Duas gerações do mesmo modelo diferem em duas linhas, sem nenhuma mudança de desenho.

A #145 escolheu fundo transparente e **aceitou** as duas linhas de ruído por gravação, com gatilho de reversão declarado: se o ruído atrapalhar revisão de PR, declarar o fundo com a cor de superfície do site.

Nenhuma conclusão do relatório muda. O determinismo importava contra **deriva entre fonte e publicado**, e essa deriva segue impossível pela razão que decide: fonte e publicado são o mesmo arquivo.

## Correção, 2026-08-27 — o Docusaurus não mede o híbrido

O relatório não previu isto, e a implementação achou. O `image-size` que o Docusaurus usa para preencher `width` e `height` de imagem de markdown valida lendo **só os primeiros 1000 bytes** (`node_modules/image-size/dist/index.cjs:723`), e a regex dele precisa casar a tag `<svg …>` inteira, incluindo o `>` de fechamento. O atributo `content` mora dentro dessa tag e empurra o `>` para muito além da janela — medido no molde em branco: byte **1560**.

Consequência: `The image at "…" can't be read correctly` sai no build, e a imagem vai sem dimensão declarada. O build compila e a imagem aparece. A #145 aceitou o custo, e a rota alternativa não medida é a página `.mdx` importando o SVG com dimensão à mão.
