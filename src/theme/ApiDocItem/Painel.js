/**
 * `Painel` — o nível 1 de interatividade da referência de biblioteca.
 *
 * **Território da rota, não do catálogo.** `ParamField` e `ResponseField`
 * (docs/design/componentes/param-field.md, response-field.md) recusam
 * explicitamente ter campo editável — pôr estado de React ali furaria o
 * "zero JS" do catálogo e acoplaria um componente global ao layout de uma
 * rota só. A edição mora aqui, e só aqui.
 *
 * **O que ele mostra, e nada além: a assinatura e um snippet de uso em
 * Python.** O verbo saiu junto com o `VerbBadge` — o contrato deixou de ser
 * HTTP, e não sobrou verbo para pintar. As três linguagens saíram junto: o
 * cenário fixado tem **uma** linguagem de programação real, e três abas para
 * uma linguagem seria a moldura sem o quadro. As abas de resposta saíram pela
 * mesma porta: uma chamada de função tem uma forma de resultado, não um status
 * por resultado — o que ela devolve e o que ela levanta são as seções
 * `Retorno` e `Erros` da prosa, onde se leem.
 *
 * **O que é editável, e nada além: argumento escalar com exemplo.** É o porte
 * direto da regra anterior — lá caminho e consulta eram editáveis e o corpo era
 * estático. Um `dict` ou uma lista dentro de um `<input type="text">` obrigaria
 * este painel a parsear texto de volta para estrutura, que é um interpretador
 * dentro de um site estático. Editar um argumento só troca texto no snippet, por
 * substituição de string; não existe chamada de rede.
 *
 * **A11y é a superfície mais estreita que existe: `<label>` mais
 * `<input type="text">` nativos.** Sem tecla, sem foco programático, sem
 * ARIA a descrever — o contrato de estado de entrada (docs/design/foco.md)
 * cobre o resto de graça, porque não há nada aqui que ele não já cubra.
 *
 * Composição, não swizzle: `CodeBlock` é o mesmo bloco que
 * `src/components/CodeGroup.js` usa para o catálogo — mas o `CodeGroup` autoral
 * lê cercas de código ESTÁTICAS do MDX, e aqui o texto do snippet muda a cada
 * tecla. É por isso que o painel monta `CodeBlock` direto em vez de reusar o
 * componente de catálogo.
 */

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
// O marcador é declarado num lugar só, e o outro leitor dele é o gerador. Ver o
// cabeçalho de `placeholder.mjs`: o portão 5 regenera e diffa, e por isso NÃO
// pegaria as duas sintaxes divergindo.
import {substituir} from './placeholder.mjs';
import estilos from './estilos.module.css';

export default function Painel({exemplos}) {
  const {assinatura, parametros, snippet} = exemplos;

  const [valores, setValores] = useState(() => Object.fromEntries(parametros.map((p) => [p.nome, p.exemplo])));

  const texto = useMemo(() => substituir(snippet.modelo, valores), [snippet, valores]);

  return (
    <div className={estilos.painel} data-sd-component="api-painel">
      {/* A assinatura no lugar onde o verbo e o caminho ficavam. Ela é o
          cabeçalho do painel porque é a única linha que responde *como se
          chama isto* sem o leitor descer para a prosa. */}
      <p className={estilos.painelCabecalho}>
        <code>{assinatura}</code>
      </p>

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
