import {Callout} from 'panlabs-docs';

/** As quatro variantes, na ordem em que o catálogo as declara. `info` é o
    neutro e o padrão; `note` é o azul. A inversão é deliberada. */
export const Variantes = () => (
  <div style={{display: 'grid', gap: 'var(--pd-space-4)'}}>
    <Callout variant="info" title="O catálogo é fechado">
      <p>
        Dezesseis componentes, registrados globalmente. Nenhum arquivo de
        conteúdo escreve um <code>import</code>, e não há escotilha de escape.
      </p>
    </Callout>
    <Callout variant="note" title="A numeração é do navegador">
      <p>
        Nenhum número sai de JavaScript. A lista ordenada é a numeração, e é
        isso que o leitor de tela anuncia.
      </p>
    </Callout>
    <Callout variant="tip" title="Rode sem instalar">
      <p>
        O <code>uvx</code> baixa o pacote num ambiente efêmero, roda e joga o
        ambiente fora. Nada sobra na máquina.
      </p>
    </Callout>
    <Callout variant="warning" title="A troca é destrutiva">
      <p>
        Um arquivo de configuração que já está quebrado é recusado, nunca
        consertado. Conserte-o à mão primeiro, e só então rode a instalação de
        novo.
      </p>
    </Callout>
  </div>
);

/** Sem `title` o corpo começa direto, e para uma frase só isso lê melhor. */
export const SemTitulo = () => (
  <Callout variant="warning">
    <p>
      O <code>pyright</code> roda em modo estrito contra o Python de piso, nunca
      contra a versão que o seu interpretador por acaso tem.
    </p>
  </Callout>
);

/** O corpo aceita mais que um parágrafo. */
export const ComLista = () => (
  <Callout variant="note" title="Cinco achados reprovam">
    <p>O <code>doctor</code> sai 3 quando qualquer um deles aparece:</p>
    <ul>
      <li>link pendurado</li>
      <li>link virado texto</li>
      <li>divergência de conteúdo</li>
      <li>servidor pendente de aprovação</li>
      <li>runner sumido do <code>PATH</code></li>
    </ul>
  </Callout>
);
