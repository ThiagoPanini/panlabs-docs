import {ParamField} from 'panlabs-docs';

/** As flags de seleção do `overpower list`, portadas da referência. */
export const Seletores = () => (
  <div>
    <ParamField name="--skill" type="name">
      Abre uma skill do pool por inteiro. Aceita a forma curta <code>-s</code>.
    </ParamField>
    <ParamField name="--bundle" type="name">
      Abre um bundle e lista os artefatos que o manifesto dele nomeia. Aceita a
      forma curta <code>-b</code>.
    </ParamField>
    <ParamField name="--from" type="url">
      Lê de um repositório do GitHub em vez do catálogo embutido. Nu, imprime a
      vitrine daquele repositório.
    </ParamField>
  </div>
);

/** Os três estados que a linha do cabeçalho sabe carregar. Só o obrigatório é
    marcado: a ausência do chip é o sinal de opcional. */
export const Estados = () => (
  <div>
    <ParamField name="--runtime" type="key" required>
      Quem recebe o que foi instalado. Aceita as chaves de uma tabela fechada de
      77 runtimes, e não tem valor padrão.
    </ParamField>
    <ParamField name="--formato" type="'json' | 'texto'" default="texto">
      Como a saída é impressa.
    </ParamField>
    <ParamField name="--target" type="name" deprecated>
      Saiu em 0.29.0. Use <code>--skill</code> ou <code>--bundle</code>, que
      dizem qual dos dois você quer.
    </ParamField>
  </div>
);

/** Um campo só, a forma mínima. */
export const Unico = () => (
  <ParamField name="--dry-run" type="flag">
    Resolve tudo, imprime todo destino e quem o lê, espelha o código de saída
    real e não encosta em disco.
  </ParamField>
);
