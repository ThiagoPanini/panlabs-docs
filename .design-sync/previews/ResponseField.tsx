import {ResponseField, Expandable} from 'panlabs-docs';

/** Os códigos de saída do `doctor`, portados da referência. */
export const Saidas = () => (
  <div>
    <ResponseField name="0" type="int" required>
      As cinco conferências que reprovam rodaram e nenhuma achou problema. Aviso
      não conta: slot vazio sai no relatório e não mexe no código de saída.
    </ResponseField>
    <ResponseField name="2" type="int">
      A linha não resolveu. Falta dado, ou o alvo não existe.
    </ResponseField>
    <ResponseField name="3" type="int">
      Achou problema. A conferência rodou certo e calculou uma resposta real,
      que por acaso é negativa.
    </ResponseField>
  </div>
);

/** Objeto aninhado: a recursão é o autor escrevendo outro `ResponseField`
    dentro de um `Expandable`, até quatro níveis. */
export const Aninhado = () => (
  <ResponseField name="bundles" type="object" required>
    <p>As composições nomeadas. A chave de cada uma é o nome que o seletor pede.</p>
    <Expandable title="campos" defaultOpen>
      <ResponseField name="items" type="list[str]" required>
        Cada entrada carrega <code>skill:</code> ou <code>mcp:</code>, resolvido
        dentro do mesmo repositório.
      </ResponseField>
      <ResponseField name="description" type="string">
        A frase que a vitrine imprime ao lado do nome.
      </ResponseField>
    </Expandable>
  </ResponseField>
);

/** Um campo que saiu da API. */
export const Removido = () => (
  <ResponseField name="path" type="string" deprecated>
    Saiu em 0.31.0, junto com <code>~/.overpower/mcp/</code>. Uma receita com
    fonte instala em escopo de projeto.
  </ResponseField>
);
