#!/usr/bin/env node
/**
 * O bloco `css` de `docs/design/tokens.md` é ESPELHO de `src/css/tokens.css` —
 * o mesmo texto, não uma redação paralela.
 *
 * A spec carrega o bloco para ser COPIADO, não redigitado: sessenta cores
 * redigitadas de uma tabela são sessenta oportunidades de erro de transcrição.
 * Um espelho que envelhece devolve o problema com juros, porque passa a haver
 * duas versões da mesma verdade e nenhuma marcada como errada.
 *
 * Este script é o que impede isso. Não é um sétimo portão — é a verificação que
 * torna a palavra "espelho" conferível.
 *
 *   node scripts/espelho-tokens.mjs --sincronizar   reescreve o bloco a partir do CSS
 *   node scripts/espelho-tokens.mjs --verificar     falha se os dois divergirem
 */

import {readFileSync, writeFileSync} from 'node:fs';

const CSS = 'src/css/tokens.css';
const DOC = 'docs/design/tokens.md';
const INICIO = '<!-- ESPELHO:INICIO — gerado de src/css/tokens.css por scripts/espelho-tokens.mjs -->';
const FIM = '<!-- ESPELHO:FIM -->';

const modo = process.argv[2];
if (modo !== '--sincronizar' && modo !== '--verificar') {
  console.error('uso: espelho-tokens.mjs --sincronizar | --verificar');
  process.exit(2);
}

const css = readFileSync(CSS, 'utf8');
const doc = readFileSync(DOC, 'utf8');

const i = doc.indexOf(INICIO);
const f = doc.indexOf(FIM);
if (i === -1 || f === -1 || f < i) {
  console.error(`${DOC} não tem os marcadores de espelho.`);
  process.exit(2);
}

const blocoNovo = `${INICIO}\n\n\`\`\`css\n${css}\`\`\`\n\n${FIM}`;
const docNovo = doc.slice(0, i) + blocoNovo + doc.slice(f + FIM.length);

if (modo === '--sincronizar') {
  if (docNovo === doc) {
    console.log('Espelho já em dia.');
  } else {
    writeFileSync(DOC, docNovo);
    console.log(`Espelho sincronizado: ${DOC} <- ${CSS}`);
  }
  process.exit(0);
}

if (docNovo !== doc) {
  console.error(`Espelho DIVERGIU — o bloco css de ${DOC} não é ${CSS} byte a byte.`);
  console.error('Rode: node scripts/espelho-tokens.mjs --sincronizar');
  process.exit(1);
}
console.log(`Espelho em dia — o bloco css de ${DOC} é ${CSS} byte a byte.`);
