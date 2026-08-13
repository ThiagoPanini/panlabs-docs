/**
 * `Painel` — o nível 1 de interatividade da Referência da API.
 *
 * **Território da rota, não do catálogo.** `ParamField` e `ResponseField`
 * (docs/design/componentes/param-field.md, response-field.md) recusam
 * explicitamente ter campo editável — pôr estado de React ali furaria o
 * "zero JS" do catálogo e acoplaria um componente global ao layout de uma
 * rota só. A edição mora aqui, e só aqui.
 *
 * **O que é editável, e nada além:** parâmetros de caminho e de consulta. O
 * corpo da requisição é sempre estático — reflete `requestBody.example` do
 * contrato, sem input nenhum. Editar um parâmetro só troca texto nos três
 * snippets, por substituição de string; não existe chamada de rede, e não
 * existe campo de token — o snippet mostra `$TRILHO_API_KEY` como variável
 * de shell (ou o equivalente de ambiente em Python/JavaScript), o que
 * dispensa a conversa de segurança de pedir uma chave de verdade dentro de
 * um site estático em vez de vencê-la.
 *
 * **A11y é a superfície mais estreita que existe: `<label>` mais
 * `<input type="text">` nativos.** Sem tecla, sem foco programático, sem
 * ARIA a descrever — o contrato de estado de entrada (docs/design/foco.md)
 * cobre o resto de graça, porque não há nada aqui que ele não já cubra.
 *
 * Composição, não swizzle: `Tabs`/`TabItem`/`CodeBlock` são os mesmos
 * blocos que `src/components/CodeGroup.js` usa para o catálogo — mas o
 * `CodeGroup` autoral lê cercas de código ESTÁTICAS do MDX, e aqui o texto
 * do snippet muda a cada tecla. É por isso que o painel monta `Tabs` +
 * `CodeBlock` direto em vez de reusar o componente de catálogo.
 */

import React, {useMemo, useState} from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import estilos from './estilos.module.css';

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

function substituir(modelo, valores) {
  return modelo.replace(PLACEHOLDER, (tudo, nome) => valores[nome] ?? tudo);
}

export default function Painel({exemplos}) {
  // **O verbo saiu daqui junto com o `VerbBadge`.** O contrato deixou de ser
  // HTTP: não há verbo para pintar, e o badge saiu do catálogo por não ter
  // sobrado nenhum estado plausível que o peça de volta. O cabeçalho fica com o
  // identificador nu até o ticket seguinte, que o troca pela ASSINATURA da
  // função — é lá que o contrato novo chega, e adiantar a forma dele aqui seria
  // desenhar contra um dado que ainda não existe.
  const {caminho, parametros, exemplos: snippets, respostas} = exemplos;

  const [valores, setValores] = useState(() => Object.fromEntries(parametros.map((p) => [p.nome, p.exemplo])));

  const snippetsRenderizados = useMemo(
    () => snippets.map((s) => ({...s, texto: substituir(s.modelo, valores)})),
    [snippets, valores],
  );

  return (
    <div className={estilos.painel} data-sd-component="api-painel">
      <p className={estilos.painelCabecalho}>
        <code>{caminho}</code>
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

      <Tabs groupId="api-lang" queryString="lang" className={estilos.painelAbasLinguagem}>
        {snippetsRenderizados.map((s) => (
          <TabItem key={s.linguagem} value={s.linguagem} label={s.titulo}>
            <CodeBlock language={s.linguagem}>{s.texto}</CodeBlock>
          </TabItem>
        ))}
      </Tabs>

      {respostas.length > 0 && (
        <div className={estilos.painelRespostas}>
          {/* Sem `groupId`: a aba de status escolhida numa página não deve
              seguir o leitor para a próxima — um `404` lido aqui não tem
              relação com o `404` de outro endpoint. */}
          <Tabs>
            {respostas.map((r) => (
              <TabItem key={r.status} value={r.status} label={r.titulo}>
                {r.corpo === null ? null : <CodeBlock language="json">{JSON.stringify(r.corpo, null, 2)}</CodeBlock>}
              </TabItem>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
