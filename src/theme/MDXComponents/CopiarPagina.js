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
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Icon from '@site/src/components/Icon';

import estilos from './copiar.module.css';

/* Quanto tempo o botão fica dizendo "Copiado" antes de voltar ao rótulo. Não é
   animação — é o único tempo deste arquivo, e ele não passa pelo vocabulário de
   motion porque não há transição a nomear: é um `setTimeout` de estado. */
const TEMPO_DO_AVISO = 2000;

/** O corpo veio como página, não como Markdown — é o caso do §9.1. */
function pareceHtml(texto) {
  return /^\s*<(!doctype|html)\b/i.test(texto);
}

export default function CopiarPagina({permalink}) {
  const {siteConfig} = useDocusaurusContext();
  const [estado, setEstado] = useState('ocioso'); // ocioso | copiado | erro
  const [aberto, setAberto] = useState(false);
  const menu = useRef(null);
  const relogio = useRef(null);
  /* `useId` porque `popovertarget` casa por `id`, e a página pode um dia ter
     dois cabeçalhos — um `id` fixo os faria apontar para o mesmo menu. */
  const idDoMenu = useId();

  /* A rota do Markdown é concatenação pura, e é o [ADR 7](trailingSlash: false)
     que a torna possível — o permalink já vem sem barra final. A absoluta é a
     que vai no prompt do assistente: ele precisa de um endereço que resolva
     fora do navegador do leitor. */
  const rotaMd = `${permalink}.md`;
  const urlMd = `${siteConfig.url}${rotaMd}`;

  useEffect(() => () => clearTimeout(relogio.current), []);

  const avisar = useCallback((qual) => {
    setEstado(qual);
    clearTimeout(relogio.current);
    relogio.current = setTimeout(() => setEstado('ocioso'), TEMPO_DO_AVISO);
  }, []);

  const copiar = useCallback(async () => {
    menu.current?.hidePopover?.();
    try {
      const resposta = await fetch(rotaMd);
      if (!resposta.ok) throw new Error(String(resposta.status));
      const texto = await resposta.text();
      if (pareceHtml(texto)) throw new Error('a rota devolveu a página, não o Markdown');
      await navigator.clipboard.writeText(texto);
      avisar('copiado');
    } catch {
      avisar('erro');
    }
  }, [avisar, rotaMd]);

  /* Os três rótulos saem de `translate()` e não de `<Translate>`, porque os
     dois que estão fora de cena também precisam ser TEXTO: eles seguram a
     largura da caixa, e uma frase em português segurando a largura de uma
     tela em inglês devolveria o pulo que a técnica existe para evitar. */
  const rotulos = {
    ocioso: translate({
      id: 'shinydoc.copiar.rotulo',
      message: 'Copiar página',
      description: 'Rótulo do botão que copia a página em Markdown',
    }),
    copiado: translate({
      id: 'shinydoc.copiar.feito',
      message: 'Copiado',
      description: 'Confirmação de que a página foi copiada',
    }),
    erro: translate({
      id: 'shinydoc.copiar.erro',
      message: 'Não copiou',
      description: 'Aviso de que a cópia falhou',
    }),
  };

  const promptDoAssistente = translate(
    {
      id: 'shinydoc.copiar.prompt',
      message: 'Leia {url} para eu poder fazer perguntas sobre esta página da documentação.',
      description: 'Pergunta que o assistente externo recebe já escrita, com a URL do Markdown',
    },
    {url: urlMd},
  );

  const acoes = [
    {
      chave: 'copiar',
      icone: 'copy',
      aoAtivar: copiar,
      titulo: <Translate id="shinydoc.copiar.menu.copiar" description="Item de menu que copia o Markdown">Copiar página</Translate>,
      apoio: <Translate id="shinydoc.copiar.menu.copiar.apoio" description="Explicação do item que copia o Markdown">O Markdown desta página, para colar num assistente</Translate>,
    },
    {
      chave: 'ver',
      icone: 'file-text',
      href: rotaMd,
      titulo: <Translate id="shinydoc.copiar.menu.ver" description="Item de menu que abre o Markdown">Ver como Markdown</Translate>,
      apoio: <Translate id="shinydoc.copiar.menu.ver.apoio" description="Explicação do item que abre o Markdown">A mesma página em texto puro</Translate>,
    },
    {
      chave: 'chatgpt',
      icone: 'external-link',
      href: `https://chatgpt.com/?q=${encodeURIComponent(promptDoAssistente)}`,
      externo: true,
      titulo: <Translate id="shinydoc.copiar.menu.chatgpt" description="Item de menu que abre a página no ChatGPT">Abrir no ChatGPT</Translate>,
      apoio: <Translate id="shinydoc.copiar.menu.assistente.apoio" description="Explicação dos itens que abrem a página num assistente">Perguntar sobre esta página</Translate>,
    },
    {
      chave: 'claude',
      icone: 'external-link',
      href: `https://claude.ai/new?q=${encodeURIComponent(promptDoAssistente)}`,
      externo: true,
      titulo: <Translate id="shinydoc.copiar.menu.claude" description="Item de menu que abre a página no Claude">Abrir no Claude</Translate>,
      apoio: <Translate id="shinydoc.copiar.menu.assistente.apoio" description="Explicação dos itens que abrem a página num assistente">Perguntar sobre esta página</Translate>,
    },
  ];

  return (
    <div className={estilos.par} data-sd-component="copiar-pagina">
      <button
        type="button"
        className={estilos.copiar}
        data-sd-part="copiar"
        data-sd-estado={estado}
        onClick={copiar}>
        <Icon name={estado === 'copiado' ? 'check' : 'copy'} size="sm" />
        {/* Os três rótulos empilhados: o que está em cena e os que só seguram a
            largura. `aria-hidden` nos ocultos para o leitor de tela não ler os
            três em sequência. */}
        <span className={estilos.rotulos}>
          {Object.entries(rotulos).map(([qual, texto]) => (
            <span
              key={qual}
              className={estilos.rotulo}
              data-sd-visivel={qual === estado ? 'sim' : 'nao'}
              aria-hidden={qual === estado ? undefined : 'true'}>
              {texto}
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
        className={estilos.mais}
        data-sd-part="mais"
        popovertarget={idDoMenu}
        aria-expanded={aberto}
        aria-label={translate({
          id: 'shinydoc.copiar.mais',
          message: 'Mais formas de levar esta página',
          description: 'Nome acessível do botão que abre o menu ao lado de Copiar página',
        })}>
        <Icon name="chevron-right" size="sm" />
      </button>

      <div
        ref={menu}
        id={idDoMenu}
        popover="auto"
        className={estilos.menu}
        data-sd-part="menu"
        onToggle={(evento) => setAberto(evento.newState === 'open')}>
        {acoes.map(({chave, icone, titulo, apoio, href, externo, aoAtivar}) => {
          const conteudo = (
            <>
              <Icon name={icone} size="sm" />
              <span className={estilos.textos}>
                <span className={estilos.titulo}>{titulo}</span>
                <span className={estilos.apoio}>{apoio}</span>
              </span>
            </>
          );
          return href ? (
            <a
              key={chave}
              className={estilos.item}
              href={href}
              target="_blank"
              rel={externo ? 'noreferrer' : undefined}>
              {conteudo}
            </a>
          ) : (
            <button key={chave} type="button" className={estilos.item} onClick={aoAtivar}>
              {conteudo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
