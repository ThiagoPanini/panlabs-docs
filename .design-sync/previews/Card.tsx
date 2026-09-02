import {Card, CardGroup} from 'panlabs-docs';

/** A forma padrão: ícone, título e uma linha de apoio, com o cartão inteiro
    virando o link. */
export const ComLink = () => (
  <CardGroup>
    <Card title="Instalação" icon="download" href="/instalacao">
      <p>
        Como pôr o <code>overpower</code> numa máquina, e a flag que prova que
        ele chegou inteiro.
      </p>
    </Card>
  </CardGroup>
);

/** Sem ícone. Ou todos os cartões do grupo têm, ou nenhum tem. */
export const SemIcone = () => (
  <CardGroup>
    <Card title="Conceitos" href="/conceitos">
      <p>O vocabulário em que o resto deste site se apoia sem reexplicar.</p>
    </Card>
    <Card title="Comandos" href="/comandos">
      <p>O que vale para toda invocação, antes de você chegar a um comando isolado.</p>
    </Card>
  </CardGroup>
);

/** Sem `href` o cartão é uma superfície inerte — para o item do grupo que
    ainda não tem destino. */
export const SemLink = () => (
  <CardGroup>
    <Card title="Alvos" icon="terminal">
      <p>Para onde o comando aponta. A página ainda não existe.</p>
    </Card>
  </CardGroup>
);
