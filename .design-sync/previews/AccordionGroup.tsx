import {Accordion, AccordionGroup} from 'panlabs-docs';

/** Três itens numa peça só, com divisórias entre eles e uma borda em volta.
    Nenhum fecha quando outro abre. */
export const Pilha = () => (
  <AccordionGroup>
    <Accordion title="Linux" icon="terminal">
      <p>
        O binário vai para <code>~/.local/bin</code>. Confira que ele está no{' '}
        <code>PATH</code> antes de abrir um terminal novo.
      </p>
    </Accordion>
    <Accordion title="macOS" icon="terminal">
      <p>
        Mesmo caminho do Linux. O Gatekeeper não entra no meio: o pacote é
        Python puro.
      </p>
    </Accordion>
    <Accordion title="Windows" icon="terminal">
      <p>
        Só sob WSL. Fora dele o caminho de escrita não existe e a instalação
        recusa.
      </p>
    </Accordion>
  </AccordionGroup>
);

/** Dois itens é o piso: abaixo disso, use um `Accordion` solto. */
export const Duas = () => (
  <AccordionGroup>
    <Accordion title="Aprovado" description="o servidor responde" icon="check">
      <p>Nada a fazer.</p>
    </Accordion>
    <Accordion title="Pendente de aprovação" description="reprova o doctor">
      <p>
        É um dos cinco achados. Um <code>install</code> que saiu 0 seguido de um{' '}
        <code>doctor</code> na mesma máquina sai 3 pelo mesmo servidor.
      </p>
    </Accordion>
  </AccordionGroup>
);
