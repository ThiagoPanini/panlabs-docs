import {Steps, Step} from 'panlabs-docs';

/** Um passo numerado, a forma comum. */
export const Numerado = () => (
  <Steps>
    <Step title="Ler o plano antes de escrever">
      <p>
        O <code>--dry-run</code> resolve tudo, imprime todo destino e quem o lê,
        e não encosta em disco.
      </p>
    </Step>
  </Steps>
);

/** Um ícone SUBSTITUI o número — não senta ao lado dele. A decisão é por
    passo, via `:has(svg)` no CSS, nunca por variante da lista. */
export const ComIcone = () => (
  <Steps>
    <Step title="Conferir que continua de pé" icon="check">
      <p>
        O <code>doctor</code> sai 3 quando acha problema, e 0 quando as cinco
        conferências passam.
      </p>
    </Step>
  </Steps>
);

/** Sem `title`, quando o corpo é uma frase que já se explica. */
export const SemTitulo = () => (
  <Steps>
    <Step>
      <p>
        Abra um terminal novo antes de continuar: o <code>PATH</code> só vale a
        partir do próximo.
      </p>
    </Step>
  </Steps>
);
