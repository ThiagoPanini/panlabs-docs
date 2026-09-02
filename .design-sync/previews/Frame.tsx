import {Frame} from 'panlabs-docs';

/* Um diagrama da casa: SVG em linha, desenhado com `currentColor`, um arquivo
   para os dois modos de cor. É a rota que o componente documenta para desenho
   próprio — a outra, para desenho vindo do draw.io, é um `<img>`, porque o
   draw.io emite `light-dark()`, que atravessa a fronteira do `<img>`. */
function Fluxo(props: Record<string, unknown>) {
  const caixa = {fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, rx: 6};
  const rotulo = {fill: 'currentColor', fontSize: 11, textAnchor: 'middle' as const};
  const seta = {stroke: 'currentColor', strokeWidth: 1.25, markerEnd: 'url(#pd-seta)'};
  return (
    <svg viewBox="0 0 540 132" width="100%" style={{maxWidth: 540}} {...props}>
      <defs>
        <marker id="pd-seta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
        </marker>
      </defs>

      <rect x="8" y="34" width="108" height="46" {...caixa} />
      <text x="62" y="54" {...rotulo}>cli.py</text>
      <text x="62" y="70" {...rotulo} opacity="0.6">parseia a linha</text>

      <line x1="122" y1="57" x2="164" y2="57" {...seta} />

      <rect x="172" y="34" width="120" height="46" {...caixa} />
      <text x="232" y="54" {...rotulo}>planning.py</text>
      <text x="232" y="70" {...rotulo} opacity="0.6">monta o plano</text>

      <line x1="298" y1="57" x2="340" y2="57" {...seta} />

      <rect x="348" y="34" width="112" height="46" {...caixa} />
      <text x="404" y="54" {...rotulo}>writing.py</text>
      <text x="404" y="70" {...rotulo} opacity="0.6">fronteira única</text>

      <line x1="466" y1="57" x2="482" y2="57" {...seta} />
      <text x="508" y="61" {...rotulo}>disco</text>
      <text x="260" y="18" {...rotulo} opacity="0.6">
        toda escrita passa por uma fronteira só
      </text>
    </svg>
  );
}

/** Um diagrama da casa, o caso que o componente existe para segurar: fluxo,
    ciclo de vida, modelo de dado. Nunca captura de tela. */
export const Diagrama = () => (
  <Frame>
    <Fluxo
      role="img"
      aria-label="O cli.py parseia a linha e produz uma Request; o planning.py a transforma em Plan; toda escrita passa pela fronteira única do writing.py antes de virar arquivo no disco."
    />
  </Frame>
);
