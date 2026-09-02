import {Update} from 'panlabs-docs';

/** Um changelog, da versão mais nova para a mais velha, portado do
    `overpower`. */
export const Changelog = () => (
  <div>
    <Update label="0.31.0" tag="quebra">
      <p>
        <strong>A fonte de um servidor virou endereço, e nada mais é clonado.</strong>{' '}
        Uma receita cujo servidor tem código próprio declara <code>source:</code>{' '}
        com <code>git</code>, <code>ref</code>, <code>runner</code> e{' '}
        <code>entrypoint</code>.
      </p>
    </Update>
    <Update label="0.30.0" tag="quebra">
      <p>
        <strong>Um bundle passou a alcançar servidor MCP.</strong> Cada entrada
        de <code>items</code> carrega agora <code>skill:</code> ou{' '}
        <code>mcp:</code>. Não há janela de compatibilidade.
      </p>
    </Update>
    <Update label="0.29.0">
      <p>
        Um repositório caseiro declara tudo o que oferece num arquivo só, na
        raiz. Um arquivo, um formato, um leitor.
      </p>
    </Update>
  </div>
);

/** Sem `tag` é o caso comum. */
export const SemEtiqueta = () => (
  <Update label="0.28.1">
    <p>
      O <code>doctor</code> passou a nomear o runner sumido do <code>PATH</code>{' '}
      em vez de dizer só que a conferência reprovou.
    </p>
  </Update>
);

/** Rótulo por data, quando a página não versiona por semver. */
export const PorData = () => (
  <Update label="12 de março" tag="beta">
    <p>
      O seletor <code>--ai-framework</code> entrou, e é o único que{' '}
      <code>--from</code> recusa.
    </p>
  </Update>
);
