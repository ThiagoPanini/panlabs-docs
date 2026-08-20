/**
 * `PainelComando` — a assinatura, os argumentos e o snippet de uso, **no fluxo
 * da prosa**, logo abaixo da linha que nomeia o comando.
 *
 * **Ele era um trilho lateral, e a razão de deixar de ser é a largura.** O
 * layout anterior comutava a página inteira: prosa 577 + trilho 511, sem coluna
 * para o TOC. A prosa da referência ficava mais estreita que a de qualquer
 * outra página do site (720), e o trilho grudado esvaziava a metade direita da
 * tela assim que a leitura passava do painel — que é curto e a prosa não. O
 * painel desce para o fluxo e a página volta a ser uma página de doc comum,
 * com a largura e o TOC que todas as outras têm. Ver docs/design/referencia.md §1.
 *
 * **Ele era um substituidor de texto, e agora monta a linha.** Até a versão 1 do
 * contrato o gerador congelava um template no build e este arquivo fazia
 * `String.replace` de `{{marcador}}` sobre ele. Um template congelado não tem
 * modelo de flag, e não sabia dizer três coisas que a ferramenta diz: que a flag
 * é opcional — apagar o campo produzia `overpower list --skill ""`, que a CLI
 * não aceita —, que dois seletores na mesma linha se excluem, e que a mesma flag
 * acumula em `install` e não acumula em `list`. Agora o front matter carrega o
 * MODELO e quem compõe a linha é `linha.mjs`, o mesmo módulo que o gerador usa
 * para derivar a assinatura. Ver ADR 12.
 *
 * **O componente é de conteúdo, o layout é do tema.** Em fluxo ele é um bloco de
 * MDX como `<Steps>` ou `<CodeGroup>`, e a rota deixa de precisar de componente
 * próprio: o gerador emite `<PainelComando />` no corpo e o registro global de
 * `MDXComponents` o resolve.
 *
 * **A fonte continua sendo o front matter**, lido por `useDoc()`. O componente
 * não recebe prop: um `<PainelComando />` sem atributo é o que o gerador
 * consegue emitir sem serializar JSON dentro do corpo do MDX.
 *
 * **Território da rota, não do catálogo — e o endereço prova.** `ParamField` e
 * `ResponseField` recusam explicitamente ter campo editável, e o zero 4 de
 * `cinco-zeros.sh` cobra isso por varredura: `src/components/` fecha em zero
 * handler e zero estado. Este arquivo guarda `useState` e ouve `onChange`, então
 * ele **não pode** morar lá — mora ao lado de `CopiarPagina.js`, que é o outro
 * registro de chrome desta pasta e já carrega a sua própria exceção nomeada no
 * mesmo script.
 *
 * **A11y é a superfície mais estreita que existe, e ela não cresceu:**
 * `<label>` com `<input type="checkbox">` e `<input type="text">` nativos. O
 * zero 5 de `cinco-zeros.sh` proíbe autor novo de modelo de interação, e uma
 * caixa de seleção não é um: é o controle que o HTML já tem para *ligar e
 * desligar*, que é exatamente o que acrescentar uma flag é. Campo recusado usa
 * o `disabled` nativo, e o motivo vai em texto ao lado, ligado por
 * `aria-describedby` — sem tecla, sem foco programático, sem ARIA a inventar.
 *
 * Composição, não swizzle: `CodeBlock` é o mesmo bloco que `CodeGroup` usa para
 * o catálogo — mas o `CodeGroup` autoral lê cercas de código ESTÁTICAS do MDX, e
 * aqui o texto do snippet muda a cada tecla.
 */

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
// O modelo de linha é lido do MESMO arquivo que o gerador importa. Ver o
// cabeçalho de `linha.mjs`: a assinatura emitida no build e a linha montada aqui
// são a mesma função sobre o mesmo campo, e por isso não podem divergir.
import {avaliar, estadoInicial, montar} from './linha.mjs';
import estilos from './painel.module.css';

export default function PainelComando() {
  const {frontMatter} = useDoc();
  const exemplos = frontMatter.api_exemplos;

  // Falha alto, e no build. Um `<PainelComando />` numa página sem
  // `api_exemplos` só pode vir de MDX editado à mão — a página gerada sempre
  // traz os dois juntos, e o portão 5 regenera e diffa.
  if (!exemplos) {
    throw new Error(
      '`<PainelComando />` numa página sem `api_exemplos` no front matter. ' +
        'A página de comando é gerada por `npm run gerar:referencia`, e o corpo não se edita à mão.',
    );
  }

  return exemplos.modelo ? <Montador exemplos={exemplos} /> : <Fluxo exemplos={exemplos} />;
}

/**
 * A página da raiz: o fluxo dos membros, estático.
 *
 * Não há o que montar — o que se digita para usar uma CLI é um comando dela, e
 * a raiz mostra quais são. Sem campo, o cabeçalho de assinatura é a única linha
 * que diz *como isto se chama*, e ele fica.
 */
function Fluxo({exemplos}) {
  const texto = exemplos.linhas.join('\n');
  return (
    <div className={estilos.painel} data-pd-component="api-painel">
      <p className={estilos.painelCabecalho}>
        <code>{exemplos.assinatura}</code>
      </p>
      <CodeBlock language={exemplos.linguagem}>{texto}</CodeBlock>
    </div>
  );
}

function Montador({exemplos}) {
  const {assinatura, linguagem, modelo} = exemplos;

  // **O estado inicial é derivado, e é por isso que o SSR bate.** O servidor
  // pinta `estadoInicial(modelo, contexto)` e o cliente reidrata calculando a
  // mesma função sobre o mesmo dado. Nada aqui lê o navegador.
  const [estado, setEstado] = useState(() => estadoInicial(modelo, modelo.contexto));

  const veredito = useMemo(() => avaliar(modelo, estado), [modelo, estado]);
  const texto = useMemo(() => montar(modelo, estado), [modelo, estado]);

  const alternar = (nome) =>
    setEstado((atual) => ({...atual, [nome]: {...atual[nome], ligada: !atual[nome].ligada}}));

  const digitar = (nome, valor) =>
    setEstado((atual) => ({...atual, [nome]: {...atual[nome], valor}}));

  // **Um comando sem opção nenhuma tem assinatura igual ao snippet.** É o caso
  // do `doctor`: os dois dizem `overpower doctor`, e o painel os empilhava, um
  // sobre o outro, separados por um fio. Duas cópias da mesma linha não são
  // duas informações — são a mesma, e a segunda faz o leitor procurar a
  // diferença que não existe. A comparação é sobre o texto JÁ MONTADO, então
  // ligar uma flag faz o cabeçalho reaparecer sozinho, que é exatamente quando
  // ele volta a dizer algo que a linha não diz.
  const duplicada = texto.trim() === assinatura.trim();

  return (
    <div className={estilos.painel} data-pd-component="api-painel">
      {/* A assinatura é o cabeçalho do painel porque é a única linha que
          responde *como se chama isto* sem o leitor descer para a prosa. */}
      {!duplicada && (
        <p className={estilos.painelCabecalho}>
          <code>{assinatura}</code>
        </p>
      )}

      {modelo.parametros.length > 0 && (
        <div className={estilos.painelParametros}>
          {modelo.parametros.map((parametro) => (
            <Campo
              key={parametro.nome}
              parametro={parametro}
              campo={estado[parametro.nome]}
              veredito={veredito[parametro.nome]}
              onAlternar={() => alternar(parametro.nome)}
              onDigitar={(valor) => digitar(parametro.nome, valor)}
            />
          ))}
        </div>
      )}

      <CodeBlock language={linguagem}>{texto}</CodeBlock>
    </div>
  );
}

/**
 * Uma flag: a caixa que a liga, o campo do valor, e o motivo quando a linha não
 * pode tê-la.
 *
 * **A recusa desabilita em vez de esconder.** Uma flag que some da tela quando
 * outra é ligada faz o leitor procurar o que ele viu; uma que fica visível e
 * desabilitada, com a mensagem que a ferramenta imprime, ENSINA a regra —
 * que é a diferença entre um painel que impede o erro e um que o explica.
 */
function Campo({parametro, campo, veredito, onAlternar, onDigitar}) {
  const permitida = veredito?.permitida !== false;
  const idMotivo = `motivo-${parametro.nome.replace(/^-+/, '')}`;
  const booleana = parametro.tipo === 'flag';

  return (
    <div className={estilos.painelCampo} data-recusada={permitida ? undefined : ''}>
      <label className={estilos.painelRotulo}>
        <input
          type="checkbox"
          checked={campo?.ligada ?? false}
          disabled={!permitida}
          aria-describedby={permitida ? undefined : idMotivo}
          onChange={onAlternar}
        />
        <span>{parametro.nome}</span>
      </label>

      {!booleana && (
        <input
          type="text"
          aria-label={parametro.nome}
          value={campo?.valor ?? ''}
          disabled={!permitida || !campo?.ligada}
          onChange={(evento) => onDigitar(evento.target.value)}
        />
      )}

      {/* A mensagem é a da CLI, byte a byte, e é o contrato que a carrega —
          traduzi-la faria o leitor procurar no terminal um texto que não existe. */}
      {!permitida && veredito.mensagem && (
        <p className={estilos.painelMotivo} id={idMotivo}>
          {veredito.mensagem}
          {veredito.exit === undefined ? null : <> (exit {veredito.exit})</>}
        </p>
      )}
    </div>
  );
}
