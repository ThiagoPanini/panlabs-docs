/**
 * `PainelComando` — a assinatura, os argumentos editáveis e o snippet de uso,
 * **no fluxo da prosa**, logo abaixo da linha que nomeia o comando.
 *
 * **Ele era um trilho lateral, e a razão de deixar de ser é a largura.** O
 * layout anterior comutava a página inteira: prosa 577 + trilho 511, sem coluna
 * para o TOC. A prosa da referência ficava mais estreita que a de qualquer
 * outra página do site (720), e o trilho grudado esvaziava a metade direita da
 * tela assim que a leitura passava do painel — que é curto e a prosa não. O
 * painel desce para o fluxo e a página volta a ser uma página de doc comum,
 * com a largura e o TOC que todas as outras têm. Ver docs/design/referencia.md §1.
 *
 * **O componente é de conteúdo, o layout é do tema.** Enquanto o painel morava
 * na grade, ele precisava ser irmão da prosa, e por isso o front matter comutava
 * o `docItemComponent`. Em fluxo ele é um bloco de MDX como `<Steps>` ou
 * `<CodeGroup>`, e a rota deixa de precisar de componente próprio: o gerador
 * emite `<PainelComando />` no corpo e o registro global de `MDXComponents` o
 * resolve. `position: sticky` some junto, e com ele o `align-self: start` que
 * era o erro nº 1 de quem reconstruía o layout — não há mais layout a reconstruir.
 *
 * **A fonte continua sendo o front matter**, lido por `useDoc()`. O componente
 * não recebe prop: um `<PainelComando />` sem atributo é o que o gerador
 * consegue emitir sem serializar JSON dentro do corpo do MDX, e a segunda fonte
 * que isso evitaria é a mesma que o `api_exemplos` já evita.
 *
 * **Território da rota, não do catálogo — e o endereço prova.** `ParamField` e
 * `ResponseField` (docs/design/componentes/param-field.md, response-field.md)
 * recusam explicitamente ter campo editável, e o zero 4 de `cinco-zeros.sh`
 * cobra isso por varredura: `src/components/` fecha em zero handler e zero
 * estado. Este arquivo guarda `useState` e ouve `onChange`, então ele **não
 * pode** morar lá — mora ao lado de `CopiarPagina.js`, que é o outro registro
 * de chrome desta pasta e já carrega a sua própria exceção nomeada no mesmo
 * script. A edição mora aqui, e só aqui.
 *
 * **O que é editável, e nada além: argumento escalar com exemplo.** Um `dict`
 * ou uma lista dentro de um `<input type="text">` obrigaria este painel a
 * parsear texto de volta para estrutura, que é um interpretador dentro de um
 * site estático. Editar um argumento só troca texto no snippet, por
 * substituição de string; não existe chamada de rede.
 *
 * **A11y é a superfície mais estreita que existe: `<label>` mais
 * `<input type="text">` nativos.** Sem tecla, sem foco programático, sem
 * ARIA a descrever — o contrato de estado de entrada (docs/design/foco.md)
 * cobre o resto de graça, porque não há nada aqui que ele não já cubra.
 *
 * Composição, não swizzle: `CodeBlock` é o mesmo bloco que `CodeGroup` usa para
 * o catálogo — mas o `CodeGroup` autoral lê cercas de código ESTÁTICAS do MDX, e
 * aqui o texto do snippet muda a cada tecla.
 */

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
// O marcador é declarado num lugar só, e o outro leitor dele é o gerador. Ver o
// cabeçalho de `placeholder.mjs`: o portão 5 regenera e diffa, e por isso NÃO
// pegaria as duas sintaxes divergindo.
import {substituir} from './placeholder.mjs';
import estilos from './painel.module.css';

export default function PainelComando() {
  const {frontMatter} = useDoc();
  const exemplos = frontMatter.api_exemplos;

  // Falha alto, e no build. Um `<PainelComando />` numa página sem
  // `api_exemplos` só pode vir de MDX editado à mão — a página gerada sempre
  // traz os dois juntos, e o portão 5 regenera e diffa.
  if (!exemplos) {
    throw new Error(
      '`<PainelComando />` numa página sem `api_exemplos` no front matter. ' +
        'A página de comando é gerada por `npm run gerar:referencia`, e o corpo não se edita à mão.',
    );
  }

  return <Painel exemplos={exemplos} />;
}

function Painel({exemplos}) {
  const {assinatura, parametros, snippet} = exemplos;

  const [valores, setValores] = useState(() => Object.fromEntries(parametros.map((p) => [p.nome, p.exemplo])));

  const texto = useMemo(() => substituir(snippet.modelo, valores), [snippet, valores]);

  // **Um comando sem opção nenhuma tem assinatura igual ao snippet.** É o caso
  // do `doctor`: os dois dizem `overpower doctor`, e o painel os empilhava, um
  // sobre o outro, separados por um fio. Duas cópias da mesma linha não são
  // duas informações — são a mesma, e a segunda faz o leitor procurar a
  // diferença que não existe. Quando elas coincidem, fica o snippet: ele é o
  // que carrega o botão de copiar, e o cabeçalho não carrega nada que ele não
  // tenha. A comparação é sobre o texto JÁ SUBSTITUÍDO, então editar um
  // argumento faz o cabeçalho reaparecer sozinho, que é exatamente quando ele
  // volta a dizer algo que o snippet não diz.
  const duplicada = texto.trim() === assinatura.trim();

  return (
    <div className={estilos.painel} data-pd-component="api-painel">
      {/* A assinatura é o cabeçalho do painel porque é a única linha que
          responde *como se chama isto* sem o leitor descer para a prosa. */}
      {!duplicada && (
        <p className={estilos.painelCabecalho}>
          <code>{assinatura}</code>
        </p>
      )}

      {parametros.length > 0 && (
        <div className={estilos.painelParametros}>
          {parametros.map((p) => (
            <label key={p.nome} className={estilos.painelCampo}>
              <span>{p.nome}</span>
              <input
                type="text"
                value={valores[p.nome] ?? ''}
                onChange={(evento) => setValores((atual) => ({...atual, [p.nome]: evento.target.value}))}
              />
            </label>
          ))}
        </div>
      )}

      <CodeBlock language={snippet.linguagem}>{texto}</CodeBlock>
    </div>
  );
}
