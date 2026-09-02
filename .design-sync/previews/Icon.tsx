import {Icon} from 'panlabs-docs';

/* O registro é gerado a partir do que o conteúdo deste projeto usa: estes
   quinze são o conjunto inteiro, e um nome fora dele quebra a build. */
const REGISTRO = [
  'book-open', 'check', 'chevron-right', 'copy', 'download',
  'external-link', 'file-text', 'info', 'lightbulb', 'maximize',
  'pencil-line', 'search', 'terminal', 'triangle-alert', 'x',
] as const;

const celula = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 'var(--pd-space-2)',
  fontSize: 'var(--pd-type-sm)',
  color: 'var(--pd-text-muted)',
};

/** Os três tamanhos, lado a lado. Cada um traz sua própria compensação óptica
    de traço — 2.25, 2 e 1.75 — porque um traço fixo engorda no pequeno e some
    no grande. */
export const Tamanhos = () => (
  <div style={{display: 'flex', gap: 'var(--pd-space-6)', alignItems: 'flex-end'}}>
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <span key={size} style={celula}>
        <Icon name="terminal" size={size} />
        {size}
      </span>
    ))}
  </div>
);

/** O registro inteiro. É fechado: o que não está aqui não existe. */
export const Registro = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: 'var(--pd-space-5)',
    }}>
    {REGISTRO.map((name) => (
      <span key={name} style={celula}>
        <Icon name={name} size="md" />
        {name}
      </span>
    ))}
  </div>
);

/** Onde ele de fato aparece: herdando `currentColor` de um texto ao lado, e
    fora da árvore de acessibilidade — o sentido vive na palavra. */
export const NoTexto = () => (
  <p style={{display: 'flex', alignItems: 'center', gap: 'var(--pd-space-2)'}}>
    <Icon name="triangle-alert" size="sm" />
    O arquivo já estava quebrado, e a instalação recusou.
  </p>
);
