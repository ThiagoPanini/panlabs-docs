import {Card, CardGroup} from 'panlabs-docs';

/** Três cartões, a grade da página de entrada do `overpower`. A contagem de
    cartões define as colunas sozinha — não há prop, media query nem container
    query. */
export const Grade = () => (
  <CardGroup>
    <Card title="Instalação" icon="download" href="/instalacao">
      <p>
        Como pôr o <code>overpower</code> numa máquina, e a flag que prova que
        ele chegou inteiro.
      </p>
    </Card>
    <Card title="Conceitos" icon="book-open" href="/conceitos">
      <p>O vocabulário em que o resto deste site se apoia sem reexplicar.</p>
    </Card>
    <Card title="Comandos" icon="terminal" href="/comandos">
      <p>
        O que vale para toda invocação, antes de você chegar a um comando
        isolado.
      </p>
    </Card>
  </CardGroup>
);

/** Dois cartões. Abaixo disso não é grade. */
export const Duas = () => (
  <CardGroup>
    <Card title="Alvos" icon="file-text" href="/alvos">
      <p>O que um comando pode abrir, e a forma de nomear cada um.</p>
    </Card>
    <Card title="Referência" icon="search" href="/referencia">
      <p>A saída de cada comando, campo a campo.</p>
    </Card>
  </CardGroup>
);
