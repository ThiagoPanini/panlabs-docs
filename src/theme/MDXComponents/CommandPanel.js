/**
 * `CommandPanel` — a assinatura, os argumentos e o snippet de uso, **no fluxo
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
 * MODELO e quem compõe a linha é `line.mjs`, o mesmo módulo que o gerador usa
 * para derivar a assinatura. Ver ADR 12.
 *
 * **O componente é de conteúdo, o layout é do tema.** Em fluxo ele é um bloco de
 * MDX como `<Steps>` ou `<CodeGroup>`, e a rota deixa de precisar de componente
 * próprio: o gerador emite `<CommandPanel />` no corpo e o registro global de
 * `MDXComponents` o resolve.
 *
 * **A fonte continua sendo o front matter**, lido por `useDoc()`. O componente
 * não recebe prop: um `<CommandPanel />` sem atributo é o que o gerador
 * consegue emitir sem serializar JSON dentro do corpo do MDX.
 *
 * **Território da rota, não do catálogo — e o endereço prova.** `ParamField` e
 * `ResponseField` recusam explicitamente ter campo editável, e o zero 4 de
 * `cinco-zeros.sh` cobra isso por varredura: `src/components/` fecha em zero
 * handler e zero estado. Este arquivo guarda `useState` e ouve `onChange`, então
 * ele **não pode** morar lá — mora ao lado de `CopyPage.js`, que é o outro
 * registro de chrome desta pasta e já carrega a sua própria exceção nomeada no
 * mesmo script.
 *
 * **A11y é a superfície mais estreita que existe, e ela não cresceu:**
 * `<label>` com `<input type="checkbox">` e `<input type="text">` nativos. O
 * zero 5 de `cinco-zeros.sh` proíbe autor novo de modelo de interação, e uma
 * caixa de seleção não é um: é o controle que o HTML já tem para *ligar e
 * desligar*, que é exatamente o que acrescentar uma flag é. Campo recusado usa
 * o `disabled` nativo, e o motivo é UM parágrafo por regra, abaixo da grade,
 * apontado por `aria-describedby` de todas as caixas que aquela regra recusou —
 * sem tecla, sem foco programático, sem ARIA a inventar. Três caixas apontando
 * para a mesma descrição é o que a especificação já prevê, e é mais barato para
 * quem ouve do que três frases idênticas.
 *
 * Composição, não swizzle: `CodeBlock` é o mesmo bloco que `CodeGroup` usa para
 * o catálogo — mas o `CodeGroup` autoral lê cercas de código ESTÁTICAS do MDX, e
 * aqui o texto do snippet muda a cada tecla.
 */

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
// O modelo de linha é lido do MESMO arquivo que o gerador importa. Ver o
// cabeçalho de `line.mjs`: a assinatura emitida no build e a linha montada aqui
// são a mesma função sobre o mesmo campo, e por isso não podem divergir.
import {evaluate, initialState, assemble, lineRefusals} from './line.mjs';
import styles from './panel.module.css';

export default function CommandPanel() {
  const {frontMatter} = useDoc();
  const examples = frontMatter.api_exemplos;

  // Falha alto, e no build. Um `<CommandPanel />` numa página sem
  // `api_exemplos` só pode vir de MDX editado à mão — a página gerada sempre
  // traz os dois juntos, e o portão 5 regenera e diffa.
  if (!examples) {
    throw new Error(
      '`<CommandPanel />` numa página sem `api_exemplos` no front matter. ' +
        'A página de comando é gerada por `npm run gerar:referencia`, e o corpo não se edita à mão.',
    );
  }

  return examples.model ? <Assembler examples={examples} /> : <Flow examples={examples} />;
}

/**
 * A página da raiz: o fluxo dos membros, estático.
 *
 * Não há o que montar — o que se digita para usar uma CLI é um comando dela, e
 * a raiz mostra quais são. Sem campo, o cabeçalho de assinatura é a única linha
 * que diz *como isto se chama*, e ele fica.
 */
function Flow({examples}) {
  const text = examples.lines.join('\n');
  return (
    <div className={styles.panel} data-pd-component="api-panel">
      <p className={styles.panelHeader}>
        <code>{examples.signature}</code>
      </p>
      <CodeBlock language={examples.language}>{text}</CodeBlock>
    </div>
  );
}

function Assembler({examples}) {
  const {signature, language, model} = examples;

  // O prefixo dos ids desta instância. Ele sai do comando, que é único na
  // página gerada, e não de um contador — um contador dependeria da ordem de
  // renderização e o SSR e a hidratação poderiam discordar dele.
  const baseId = `panel-${(model.qualified ?? 'command').replace(/[^a-z0-9]+/gi, '-')}`;

  // **O estado inicial é derivado, e é por isso que o SSR bate.** O servidor
  // pinta `estadoInicial(modelo, contexto)` e o cliente reidrata calculando a
  // mesma função sobre o mesmo dado. Nada aqui lê o navegador.
  const [state, setState] = useState(() => initialState(model, model.context));

  const verdict = useMemo(() => evaluate(model, state), [model, state]);
  const text = useMemo(() => assemble(model, state), [model, state]);

  // **A recusa é agrupada por REGRA, e a razão é medida.** Antes, cada flag
  // recusada carregava a própria cópia da mensagem: marcar `--mcp` em `install`
  // imprimia a MESMA frase três vezes e empurrava a grade 132px; marcar
  // `--skill` em `list` imprimia três frases que só diferiam no nome da flag.
  // O texto aparecia embaixo de três controles que o leitor não tinha tocado,
  // que é o que o fazia parecer surgido do nada. Uma regra, uma frase, num
  // lugar só — abaixo da grade, no caminho entre o que ele marcou e a linha.
  const refusedRules = useMemo(() => lineRefusals(model, state), [model, state]);

  // O id da mensagem, por flag: o `aria-describedby` de três caixas
  // desabilitadas passa a apontar para o MESMO parágrafo, em vez de três.
  const refusalId = useMemo(() => {
    const map = {};
    refusedRules.forEach((rule, index) => {
      rule.refused.forEach((name) => {
        map[name] = `${baseId}-recusa-${index}`;
      });
    });
    return map;
  }, [refusedRules, baseId]);

  const toggle = (name) =>
    setState((current) => ({...current, [name]: {...current[name], on: !current[name].on}}));

  const type = (name, value) =>
    setState((current) => ({...current, [name]: {...current[name], value}}));

  // **Um comando sem opção nenhuma tem assinatura igual ao snippet.** É o caso
  // do `doctor`: os dois dizem `overpower doctor`, e o painel os empilhava, um
  // sobre o outro, separados por um fio. Duas cópias da mesma linha não são
  // duas informações — são a mesma, e a segunda faz o leitor procurar a
  // diferença que não existe. A comparação é sobre o texto JÁ MONTADO, então
  // ligar uma flag faz o cabeçalho reaparecer sozinho, que é exatamente quando
  // ele volta a dizer algo que a linha não diz.
  const duplicated = text.trim() === signature.trim();

  return (
    <div className={styles.panel} data-pd-component="api-panel">
      {/* A assinatura é o cabeçalho do painel porque é a única linha que
          responde *como se chama isto* sem o leitor descer para a prosa. */}
      {!duplicated && (
        <p className={styles.panelHeader}>
          <code>{signature}</code>
        </p>
      )}

      {model.parameters.length > 0 && (
        <div className={styles.panelParameters}>
          {model.parameters.map((parameter) => (
            <Field
              key={parameter.name}
              parameter={parameter}
              field={state[parameter.name]}
              verdict={verdict[parameter.name]}
              reasonId={refusalId[parameter.name]}
              onToggle={() => toggle(parameter.name)}
              onType={(value) => type(parameter.name, value)}
            />
          ))}
        </div>
      )}

      {/* A recusa, uma por regra, entre a grade e a linha — que é o caminho
          que o olho já faz depois de marcar uma caixa. A mensagem é a da CLI,
          byte a byte, e é o contrato que a carrega: traduzi-la faria o leitor
          procurar no terminal um texto que não existe. */}
      {refusedRules.map((rule, index) => (
        <p
          key={rule.errorClass ?? index}
          className={styles.panelRefusal}
          id={`${baseId}-recusa-${index}`}
        >
          {rule.message}
          {rule.exit === undefined ? null : <> (exit {rule.exit})</>}
        </p>
      ))}

      <CodeBlock language={language}>{text}</CodeBlock>
    </div>
  );
}

/**
 * Uma flag: a caixa que a liga e o campo do valor.
 *
 * **A recusa desabilita em vez de esconder.** Uma flag que some da tela quando
 * outra é ligada faz o leitor procurar o que ele viu; uma que fica visível e
 * desabilitada, com a mensagem que a ferramenta imprime, ENSINA a regra —
 * que é a diferença entre um painel que impede o erro e um que o explica.
 *
 * **O motivo NÃO mora aqui**, e é a correção que este componente recebeu: ele
 * é da regra, não da flag, e uma regra que recusa três flags escrevia três
 * cópias de si mesma. O que sobra aqui é o `data-refused`, que apaga a célula,
 * e o `aria-describedby` apontando para a frase única lá embaixo.
 */
function Field({parameter, field, verdict, reasonId, onToggle, onType}) {
  const allowed = verdict?.allowed !== false;
  const boolean = parameter.type === 'flag';

  return (
    <div className={styles.panelField} data-refused={allowed ? undefined : ''}>
      <label className={styles.panelLabel}>
        <input
          type="checkbox"
          checked={field?.on ?? false}
          disabled={!allowed}
          aria-describedby={allowed ? undefined : reasonId}
          onChange={onToggle}
        />
        <span>{parameter.name}</span>
      </label>

      {!boolean && (
        <input
          type="text"
          aria-label={parameter.name}
          value={field?.value ?? ''}
          disabled={!allowed || !field?.on}
          onChange={(event) => onType(event.target.value)}
        />
      )}
    </div>
  );
}
