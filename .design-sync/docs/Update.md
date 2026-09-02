---
category: Sequence
---

Uma entrada de changelog: cabeçalho com rótulo e etiqueta, corpo com o que mudou.

## Quando usar

Numa página de changelog, uma `Update` por versão, da mais nova para a mais velha. Não é um aviso — para isso existe o `Callout`.

## Regras

- `label` é a versão ou a data, e é o cabeçalho do registro. Escolha um dos dois e mantenha a escolha na página inteira.
- `tag` qualifica a entrada em uma palavra: `breaking`, `beta`, `segurança`. Sem `tag` é o caso comum.
- O conteúdo **não é versionado** — a API é, por cabeçalho. Não crie uma página por versão.

## Uso

```jsx
<Update label="1.4.0" tag="breaking">
  <p>O alvo agora exige namespace. A forma antiga passou a falhar com exit 2.</p>
</Update>
```
