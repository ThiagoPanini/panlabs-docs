/**
 * `SearchBar` — **degrau 5** do ADR 2, o primeiro `--eject` do projeto.
 *
 *   ejetado de @docusaurus/theme-classic@3.10.2
 *
 * Cabeçalho de versão obrigatório: o gerador do Docusaurus remove o cabeçalho de
 * licença ao ejetar, e sem anotação não há contra o que diffar no upgrade.
 *
 * **Zero linha de upstream copiada, e isso é fato e não disciplina.** O
 * `SearchBar` do `theme-classic` é `export {default} from '@docusaurus/Noop'` —
 * uma linha, que devolve `null`. O tema clássico não tem busca; ele tem o
 * ponto de extensão. É por isso que o degrau 5 aqui não carrega a dívida que o
 * degrau 5 costuma carregar: não há implementação upstream para reconciliar.
 *
 * > **Desvio de `--typescript` — o desvio 2, e hoje o único do repositório.** O
 * > desvio 1 saiu com `NavbarItem/ComponentTypes.js`, que era idêntico ao
 * > upstream nas nove chaves; a numeração não é remendada. O ADR 2 diz
 * > *sempre*, e a regra existe para o que a flag protege — **assinatura de
 * > props**. Medido no 3.10.2: os dois consumidores (`Navbar/Content` e
 * > `NavbarItem/SearchNavbarItem`) montam `<SearchBar />`, sem uma prop. E o
 * > repositório não tem `typescript` instalado: o que compila `.tsx` aqui é o
 * > `@babel/preset-typescript` do `@docusaurus/babel`, que **apaga** os tipos
 * > sem conferir nenhum. A flag entregaria a forma da garantia sem a garantia,
 * > e cobraria uma dependência de toolchain contra o axioma 2.
 * >
 * > O que fica no lugar dela: este arquivo tem superfície de props **zero**,
 * > então a mudança que a flag pegaria não existe. O que pode mudar é o nome do
 * > componente no upstream — e isso quem pega é o portão 7, diffando o
 * > `swizzle --list` congelado.
 *
 * ---------------------------------------------------------------------------
 * O que este arquivo NÃO escreve
 *
 * Armadilha de foco, camada superior sobre todo `z-index` da página,
 * `::backdrop`, `Escape` e restauração do foco ao elemento que abriu o modal.
 * Tudo isso vem de `<dialog>` + `showModal()`, do navegador. **Não há uma linha
 * de gestão de foco aqui**, e é o motivo de o modal ser um `<dialog>` em vez de
 * uma `<div>` com `position: fixed`.
 *
 * Este é o **único JS de interação que o projeto autora**, e ele mora no
 * chrome. O catálogo de conteúdo continua em zero — ver o *substrato nativo*
 * em `docs/agents/domain.md`.
 *
 * A escada de pontuação, a normalização e o cálculo do realce **não moram
 * aqui**: são lógica pura, vivem em `./ladder.mjs` e são cobradas por
 * `scripts/busca.test.mjs`. O que sobra neste arquivo é JSX mais os ganchos do
 * `<dialog>` — que é a parte que só um navegador sabe conferir.
 *
 * Procedência: docs/design/busca.md · ADR 6.
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useHistory} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import Icon from '@site/src/components/Icon';
import styles from './styles.module.css';
import {
  highlightRanges,
  normalizeIndex,
  score,
  termsFrom,
  excerpt,
} from './ladder.mjs';

const LIST_ID = 'pd-search-list';
const optionId = (i) => `pd-search-option-${i}`;

export default function SearchBar() {
  const data = usePluginData('pd-search');
  const history = useHistory();
  const dialog = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [mac, setMac] = useState(false);

  // O índice normalizado, uma vez na montagem e não a cada tecla. `undefined`
  // quando o plugin não está na config — ver o `return null` lá embaixo.
  const index = useMemo(() => data && normalizeIndex(data.records), [data]);

  const results = useMemo(() => (index ? score(index, query) : []), [index, query]);

  const open = useCallback(() => {
    dialog.current?.showModal();
    // Não é gestão de foco: é pôr o cursor no único campo do modal. A armadilha,
    // a camada e a restauração continuam sendo do `<dialog>`.
    input.current?.select();
  }, []);

  const close = useCallback(() => dialog.current?.close(), []);

  // O glifo da tecla só é decidido DEPOIS da montagem, e é de propósito: o
  // servidor não sabe em que plataforma a página vai abrir, e renderizar `⌘`
  // no HTML produziria divergência de hidratação. `Ctrl` é o estado inicial
  // porque é o da maioria; no Mac ele troca no primeiro quadro.
  useEffect(() => setMac(/mac|iphone|ipad/i.test(navigator.userAgent)), []);

  // `⌘K` / `Ctrl K` e NADA MAIS. `/` foi recusado: ele exige uma guarda de
  // *"estou dentro de um campo?"*, e o modo de falhar dessa guarda é invisível —
  // o leitor digita uma barra num formulário e o modal abre por cima.
  useEffect(() => {
    if (!index) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialog.current?.open) {
          close();
        } else {
          open();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, open, close]);

  // Sem teto de resultados, a lista rola — e a opção ativa precisa estar à
  // vista. Rolagem não é foco: o foco nunca sai do campo, que é o que
  // `aria-activedescendant` compra.
  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({block: 'nearest'});
  }, [active]);

  const choose = useCallback(
    (i) => {
      const target = results[i];
      if (target) {
        close();
        history.push(target.u);
      }
    },
    [results, close, history],
  );

  const onFieldKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(active);
    }
    // `Escape` NÃO aparece aqui. O `<dialog>` o trata, fecha e devolve o foco
    // ao botão. Escrevê-lo seria escrever de novo o que o navegador já faz.
  };

  // **Quando a busca não existe, o navbar não muda.** Tirar o plugin da config
  // faz `usePluginData` devolver `undefined`; o componente devolve `null`, e o
  // `Navbar/Search` do upstream esconde o contêiner vazio pelo próprio
  // `:empty`. Sem botão, sem atalho, sem modal — e o navbar reflui sozinho.
  if (!index) {
    return null;
  }

  const labels = data.tabs;
  const terms = termsFrom(query);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        data-pd-component="search"
        data-pd-part="trigger"
        onClick={open}>
        <Icon name="search" size="sm" />
        <span className={styles.label}>Buscar</span>
        <kbd className={styles.shortcut}>{mac ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <dialog ref={dialog} className={styles.modal} data-pd-component="search" onClose={() => setActive(0)}>
        {/* ARIA por CITAÇÃO do padrão `Combobox With List Autocomplete` do
            WAI-ARIA APG, e não por invenção. É o único lugar do projeto onde a
            spec descreve ARIA em prosa, e ela aponta para um padrão publicado:
            `role="combobox"` no próprio campo (ARIA 1.2, não o invólucro do
            1.0), `aria-controls` para a listbox, `aria-autocomplete="list"`, e
            `aria-activedescendant` — que é o que mantém o FOCO no campo
            enquanto a seleção anda pela lista. */}
        <div className={styles.field} data-pd-part="field">
          <Icon name="search" size="sm" />
          <input
            ref={input}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck="false"
            aria-expanded={results.length > 0}
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
            aria-label="Buscar na documentação"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onFieldKeyDown}
          />
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Fechar a busca">
            <Icon name="x" size="sm" />
          </button>
        </div>

        <ul
          id={LIST_ID}
          role="listbox"
          className={styles.list}
          aria-label="Resultados">
          {results.map((r, i) => (
            <li
              key={r.u}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              data-pd-part="result"
              onClick={() => choose(i)}
              onMouseMove={() => setActive(i)}>
              <span className={styles.title}>{highlight(r.t, terms)}</span>
              <span className={styles.tab}>{labels[r.x]}</span>
              <span className={styles.excerpt}>{highlight(excerpt(r, terms), terms)}</span>
            </li>
          ))}
        </ul>

        <p role="status" className={styles.visuallyHidden}>
          {query.trim() === '' ? '' : `${results.length} resultados`}
        </p>

        {/* As teclas são CARACTERES SOLTOS desde a #98 — nem ícone, nem
            elemento de teclado. Três setas desenhadas custariam três slots e
            estourariam o teto de 64 do manifesto — e `↑` já é a seta. */}
        <footer className={styles.footer}>
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </footer>
      </dialog>
    </>
  );
}

/**
 * O realce — peso e, desde a #98, tinta de acento.
 *
 * A linha ativa deixou de ser `--pd-surface-wash` (ver `styles.module.css`,
 * `.option[aria-selected]`), então o `<mark>` pode colorir sem cair acento
 * sobre acento no mesmo pixel. O elemento continua sendo `<mark>` porque é
 * ele que carrega o significado; o que o CSS troca agora é a tinta e o peso.
 *
 * Quem sabe ONDE cortar é `ladder.mjs`, que devolve faixas já mapeadas para o
 * texto original. Aqui só se monta o JSX.
 */
function highlight(text, terms) {
  const ranges = highlightRanges(text, terms);
  if (ranges.length === 0) {
    return text;
  }
  const pieces = [];
  let cursor = 0;
  for (const [from, to] of ranges) {
    pieces.push(text.slice(cursor, from));
    pieces.push(<mark key={`${from}-${to}`}>{text.slice(from, to)}</mark>);
    cursor = to;
  }
  pieces.push(text.slice(cursor));
  return pieces;
}
