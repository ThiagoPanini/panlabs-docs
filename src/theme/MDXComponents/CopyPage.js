/**
 * O par segmentado do cabeçalho — copiar a página, e o menu do resto.
 *
 * Ele é a SEGUNDA peça que o override de `h1` injeta, e nasce pelo mesmo
 * motivo que o subtítulo: `DocItem/Layout` e `DocItem/Content` são `unsafe`
 * (perda 1 do ledger), e ancorar no `<h1>` alcança o cabeçalho sem encostar
 * neles. Ver `chrome.md` §6.4.
 *
 * ---------------------------------------------------------------------------
 * A FONTE É O `.md` QUE JÁ EXISTE, e isto é o que torna o botão barato
 *
 * O plugin `src/plugins/ai-era/` publica toda rota também como Markdown, em
 * `permalink + '.md'` (ver `informacao.md` §9.1). O botão não serializa nada,
 * não lê o DOM e não tem uma segunda ideia do que a página é: ele BUSCA o
 * arquivo que o site já serve. Uma fonte só, como no subtítulo — e o dia em
 * que o `.md` mudar de forma, o que o leitor copia muda junto, sem ninguém
 * lembrar deste arquivo.
 *
 * **Perda herdada, e ela é a mesma do §9.1:** em `docusaurus start` a rota
 * `.md` não existe e devolve 200 com o shell da SPA. Sem guarda, o leitor
 * copiaria HTML achando que copiou Markdown — o pior modo de falhar que uma
 * ação de copiar tem, porque o erro só aparece do outro lado, colado. A guarda
 * é olhar o corpo: documento HTML no lugar do Markdown vira estado de erro,
 * visível no próprio botão.
 *
 * ---------------------------------------------------------------------------
 * O RÓTULO NÃO MUDA DE LARGURA quando o estado muda
 *
 * "Copiar página" e "Copiado" têm larguras diferentes, e trocar o texto faria o
 * par inteiro pular no instante do clique — o mesmo defeito que o falso-negrito
 * do item de sidebar evita em `chrome.css` §4, e que `scrollbar-gutter: stable`
 * evita ao lado. A resposta é a mesma da âncora, medida no artefato dela: os
 * dois rótulos empilhados na MESMA célula de grade, o que não está em cena
 * segurando a largura com `visibility: hidden`. A caixa mede o mais largo dos
 * dois e nunca se mexe.
 *
 * ---------------------------------------------------------------------------
 * O MENU É `popover` NATIVO, e o zero 5 é quem escolheu
 *
 * A primeira escrita deste arquivo autorava modelo de interação: `onKeyDown`
 * para `Escape`, `onKeyDown` para as setas, `onBlur` para fechar ao sair. O
 * quinto zero reprovou na hora — *"um único autor de modelo de interação no
 * projeto inteiro"*, e o único é o `SearchBar`. A régua dele é estreita e
 * deliberada (`addEventListener|onKeyDown|onKeyUp|onKeyPress`), e o que ela
 * protege está no axioma 6: quem escreve tecla obriga a spec a descrever
 * tecla, foco e ARIA em prosa.
 *
 * O zero não foi afrouxado — o menu é que desceu para o substrato. `popover`
 * dá `Escape`, dá o fechar-ao-clicar-fora e dá a devolução do foco ao gatilho,
 * as três de graça e as três do navegador. É o mesmo movimento que o
 * `SearchBar` fez com `<dialog>` e `showModal()`, e o comentário de lá vale
 * verbatim aqui: *escrevê-lo seria escrever de novo o que o navegador já faz*.
 *
 * **O que a troca custou, e vai escrito:** o padrão `menu` do WAI-ARIA quer
 * `ArrowDown`/`ArrowUp` entre os itens, e isso é tecla — não há como tê-lo sem
 * reabrir o zero. Sem as setas, `role="menu"` seria ARIA mentindo sobre o
 * modelo, então o menu não o usa: os quatro itens são links e botões comuns,
 * numa ordem de tabulação comum, que é o que `Tab` já percorre. O leitor de
 * teclado alcança os quatro; ele os alcança com a tecla errada para um menu, e
 * com a certa para um grupo de controles — que é o que isto passou a ser.
 *
 * ---------------------------------------------------------------------------
 * Procedência: docs/design/chrome.md §6.4 · docs/design/informacao.md §9.
 */

import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Icon from '@site/src/components/Icon';

import styles from './copy.module.css';

/* Quanto tempo o botão fica dizendo "Copiado" antes de voltar ao rótulo. Não é
   animação — é o único tempo deste arquivo, e ele não passa pelo vocabulário de
   motion porque não há transição a nomear: é um `setTimeout` de estado. */
const NOTICE_DURATION = 2000;

/** O corpo veio como página, não como Markdown — é o caso do §9.1. */
function looksLikeHtml(text) {
  return /^\s*<(!doctype|html)\b/i.test(text);
}

export default function CopyPage({permalink}) {
  const {siteConfig} = useDocusaurusContext();
  const [state, setState] = useState('idle'); // idle | copied | error
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const timer = useRef(null);
  /* `useId` porque `popovertarget` casa por `id`, e a página pode um dia ter
     dois cabeçalhos — um `id` fixo os faria apontar para o mesmo menu. */
  const menuId = useId();

  /* A rota do Markdown é concatenação pura, e é o [ADR 7](trailingSlash: false)
     que a torna possível — o permalink já vem sem barra final. A absoluta é a
     que vai no prompt do assistente: ele precisa de um endereço que resolva
     fora do navegador do leitor. */
  const mdRoute = `${permalink}.md`;
  const mdUrl = `${siteConfig.url}${mdRoute}`;

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = useCallback((which) => {
    setState(which);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), NOTICE_DURATION);
  }, []);

  const copy = useCallback(async () => {
    menu.current?.hidePopover?.();
    try {
      const response = await fetch(mdRoute);
      if (!response.ok) throw new Error(String(response.status));
      const text = await response.text();
      if (looksLikeHtml(text)) throw new Error('a rota devolveu a página, não o Markdown');
      await navigator.clipboard.writeText(text);
      notify('copied');
    } catch {
      notify('error');
    }
  }, [notify, mdRoute]);

  /* Os três rótulos são texto simples e não elemento, porque os dois que
     estão fora de cena também precisam ser TEXTO: eles seguram a largura da
     caixa, e um nó React fora de cena mediria diferente de um em cena. */
  const labels = {
    idle: 'Copiar página',
    copied: 'Copiado',
    error: 'Não copiou',
  };

  const assistantPrompt = `Leia ${mdUrl} para eu poder fazer perguntas sobre esta página da documentação.`;

  const actions = [
    {
      key: 'copiar',
      icon: 'copy',
      onActivate: copy,
      title: 'Copiar página',
      support: 'O Markdown desta página, para colar num assistente',
    },
    {
      key: 'ver',
      icon: 'file-text',
      href: mdRoute,
      title: 'Ver como Markdown',
      support: 'A mesma página em texto puro',
    },
    {
      key: 'chatgpt',
      icon: 'external-link',
      href: `https://chatgpt.com/?q=${encodeURIComponent(assistantPrompt)}`,
      external: true,
      title: 'Abrir no ChatGPT',
      support: 'Perguntar sobre esta página',
    },
    {
      key: 'claude',
      icon: 'external-link',
      href: `https://claude.ai/new?q=${encodeURIComponent(assistantPrompt)}`,
      external: true,
      title: 'Abrir no Claude',
      support: 'Perguntar sobre esta página',
    },
  ];

  return (
    <div className={styles.pair} data-pd-component="copy-page">
      <button
        type="button"
        className={styles.copy}
        data-pd-part="copiar"
        data-pd-state={state}
        onClick={copy}>
        <Icon name={state === 'copied' ? 'check' : 'copy'} size="sm" />
        {/* Os três rótulos empilhados: o que está em cena e os que só seguram a
            largura. `aria-hidden` nos ocultos para o leitor de tela não ler os
            três em sequência. */}
        <span className={styles.labels}>
          {Object.entries(labels).map(([which, text]) => (
            <span
              key={which}
              className={styles.label}
              data-pd-visible={which === state ? 'true' : 'false'}
              aria-hidden={which === state ? undefined : 'true'}>
              {text}
            </span>
          ))}
        </span>
      </button>

      {/* `popovertarget` é a ligação inteira: o navegador abre, fecha no
          `Escape`, fecha no clique fora e devolve o foco ao gatilho. O
          `aria-expanded` acompanha pelo evento `toggle`, que é o próprio
          navegador contando o que fez. */}
      <button
        type="button"
        className={styles.more}
        data-pd-part="mais"
        popovertarget={menuId}
        aria-expanded={open}
        aria-label="Mais formas de levar esta página">
        <Icon name="chevron-right" size="sm" />
      </button>

      <div
        ref={menu}
        id={menuId}
        popover="auto"
        className={styles.menu}
        data-pd-part="menu"
        onToggle={(event) => setOpen(event.newState === 'open')}>
        {actions.map(({key, icon, title, support, href, external, onActivate}) => {
          const content = (
            <>
              <Icon name={icon} size="sm" />
              <span className={styles.texts}>
                <span className={styles.title}>{title}</span>
                <span className={styles.support}>{support}</span>
              </span>
            </>
          );
          return href ? (
            <a
              key={key}
              className={styles.item}
              href={href}
              target="_blank"
              rel={external ? 'noreferrer' : undefined}>
              {content}
            </a>
          ) : (
            <button key={key} type="button" className={styles.item} onClick={onActivate}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
