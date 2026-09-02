import {Steps, Step} from 'panlabs-docs';

/** O procedimento de entrada do `overpower`, portado da página de instalação.
    A numeração é do `<ol>`; nenhum número sai de JavaScript. */
export const Procedimento = () => (
  <Steps>
    <Step title="Rodar sem instalar">
      <p>
        O <code>uvx</code> baixa o pacote num ambiente efêmero, roda e joga o
        ambiente fora. Nada sobra na máquina além do que o próprio{' '}
        <code>overpower</code> escreveu.
      </p>
    </Step>
    <Step title="Ver o que existe">
      <p>
        O catálogo sai em quatro blocos, cada entrada com o tamanho, a contagem
        de arquivos e a descrição por inteiro.
      </p>
    </Step>
    <Step title="Ler o plano antes de escrever">
      <p>
        O <code>--dry-run</code> resolve tudo, imprime todo destino e quem o lê,
        espelha o código de saída real e não encosta em disco.
      </p>
    </Step>
    <Step title="Conferir que continua de pé" icon="check">
      <p>
        O <code>doctor</code> responde se o que foi escrito continua sendo o que
        foi escrito, e sai 3 quando acha problema.
      </p>
    </Step>
  </Steps>
);

/** Três passos é o piso saudável. */
export const Curto = () => (
  <Steps>
    <Step title="Declare o alvo">
      <p>O namespace vem antes do nome, sempre.</p>
    </Step>
    <Step title="Rode a instalação">
      <p>Num terminal ele pergunta antes de escrever; fora dele, nunca pergunta.</p>
    </Step>
    <Step title="Confira" icon="check">
      <p>Saída 0 e o catálogo impresso significam que passou.</p>
    </Step>
  </Steps>
);
