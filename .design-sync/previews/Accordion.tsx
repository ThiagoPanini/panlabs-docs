import {Accordion, AccordionGroup} from 'panlabs-docs';

/** A forma padrão: uma pergunta que a maioria dos leitores não abre. */
export const Pergunta = () => (
  <Accordion title="Dá para rodar sem instalar?">
    <p>
      Dá. O <code>uvx</code> baixa o pacote num ambiente efêmero, roda e joga o
      ambiente fora. Nada sobra na máquina além do que o comando escreveu.
    </p>
  </Accordion>
);

/** `description` qualifica o título quando ele sozinho não separa este item do
    vizinho. */
export const ComDescricao = () => (
  <Accordion
    title="O comando falha com saída 2"
    description="alvo não resolvido"
    icon="triangle-alert">
    <p>
      O namespace vem antes do nome, sempre. Uma linha que nomeia o que instalar
      e nenhum runtime recusa com saída 2 em vez de adivinhar.
    </p>
  </Accordion>
);

/** `defaultOpen` para o item que o leitor quase sempre quer. */
export const Aberto = () => (
  <AccordionGroup>
    <Accordion title="Escopo de máquina" icon="check" defaultOpen>
      <p>
        O segredo mora num arquivo que o <code>git</code> não alcança, e é isso
        que autoriza a escrita.
      </p>
    </Accordion>
    <Accordion title="Escopo de repositório">
      <p>
        O <code>overpower</code> recusa escrever o valor. Colar um à mão põe o
        segredo sob versionamento.
      </p>
    </Accordion>
  </AccordionGroup>
);
