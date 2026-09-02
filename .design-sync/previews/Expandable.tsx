import {Expandable, ResponseField} from 'panlabs-docs';

/** O lugar onde ele existe: dentro de um campo, abrindo as propriedades de um
    objeto aninhado. Sem moldura em volta, porque já está dentro de uma. */
export const DentroDoCampo = () => (
  <ResponseField name="bundles" type="object">
    <p>As composições nomeadas. A chave de cada uma é o nome que o seletor pede.</p>
    <Expandable title="campos" defaultOpen>
      <ResponseField name="nome-do-bundle" type="object" required>
        Uma composição.
      </ResponseField>
      <ResponseField name="items" type="list[str]" required>
        Cada entrada carrega <code>skill:</code> ou <code>mcp:</code>, resolvido
        dentro do mesmo repositório.
      </ResponseField>
    </Expandable>
  </ResponseField>
);

/** Nível 2 e abaixo nascem fechados. */
export const Fechado = () => (
  <ResponseField name="mcp" type="object">
    <p>As receitas de servidor, uma por chave.</p>
    <Expandable title="campos">
      <ResponseField name="transport" type="'stdio' | 'http'" required>
        Como o cliente fala com o servidor.
      </ResponseField>
    </Expandable>
  </ResponseField>
);
