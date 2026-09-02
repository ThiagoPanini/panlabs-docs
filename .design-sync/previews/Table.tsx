import {Table} from 'panlabs-docs';

/* O `<table>` interno é pintado pelo Infima, que este pacote não embarca. O
   componente é a região rolável e nomeada em volta — o que ele conserta é a
   tabela larga ficar inalcançável pelo teclado. A tabela abaixo declara o
   mínimo para se ler como tabela. */
const celula = {
  padding: 'var(--pd-space-3) var(--pd-space-4)',
  borderBottom: '1px solid var(--pd-border-subtle)',
  textAlign: 'start' as const,
  verticalAlign: 'top' as const,
};
const cabecalho = {...celula, color: 'var(--pd-text-strong)', fontWeight: 600};

/** Uma comparação curta: a forma mais comum. */
export const Comparacao = () => (
  <Table style={{borderCollapse: 'collapse', width: '100%'}}>
    <thead>
      <tr>
        <th style={cabecalho}>Seletor</th>
        <th style={cabecalho}>Abre</th>
        <th style={cabecalho}>Aceita <code>--from</code></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style={celula}><code>--skill</code></td>
        <td style={celula}>Uma skill do pool, por inteiro.</td>
        <td style={celula}>sim</td>
      </tr>
      <tr>
        <td style={celula}><code>--bundle</code></td>
        <td style={celula}>Um bundle e os artefatos que o manifesto nomeia.</td>
        <td style={celula}>sim</td>
      </tr>
      <tr>
        <td style={celula}><code>--ai-framework</code></td>
        <td style={celula}>Um AI Framework, artefato por artefato.</td>
        <td style={celula}>não</td>
      </tr>
    </tbody>
  </Table>
);

/** Uma tabela larga, o caso que justifica o componente: a região rola, e é
    alcançável pelo teclado porque tem nome e `tabindex`. */
export const Larga = () => (
  <Table style={{borderCollapse: 'collapse', minWidth: '52rem'}}>
    <thead>
      <tr>
        <th style={cabecalho}>Código</th>
        <th style={cabecalho}>Significado</th>
        <th style={cabecalho}>Quem emite</th>
        <th style={cabecalho}>O que fazer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style={celula}><code>0</code></td>
        <td style={celula}>As cinco conferências passaram.</td>
        <td style={celula}><code>doctor</code>, <code>install</code></td>
        <td style={celula}>Nada.</td>
      </tr>
      <tr>
        <td style={celula}><code>2</code></td>
        <td style={celula}>A linha não resolveu: falta dado ou o alvo não existe.</td>
        <td style={celula}>todos</td>
        <td style={celula}>Nomeie o runtime, ou corrija o alvo.</td>
      </tr>
      <tr>
        <td style={celula}><code>3</code></td>
        <td style={celula}>Achou problema — a conferência rodou e reprovou.</td>
        <td style={celula}><code>doctor</code></td>
        <td style={celula}>Leia o achado nomeado no relatório.</td>
      </tr>
    </tbody>
  </Table>
);
