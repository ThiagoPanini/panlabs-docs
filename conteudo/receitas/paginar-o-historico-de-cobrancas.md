---
title: Paginar o histórico de cobranças
description: Varrer todas as cobranças de um período por cursor, sem repetir nem pular linha.
---

# Paginar o histórico de cobranças

<Untranslated />

**O problema:** exportar todas as cobranças de um mês, com dezenas de milhares de
linhas, sem repetição e sem buraco.

```python title="exportar.py"
import csv
import os

from trilho import Trilho

trilho = Trilho(os.environ["TRILHO_SECRET_KEY"])


def exportar(caminho: str, de: str, ate: str) -> int:
    total = 0
    with open(caminho, "w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.writer(arquivo, delimiter=";")
        escritor.writerow(["id", "referencia_externa", "meio", "status", "valor"])

        # O iterador do SDK segue o cursor sozinho. Ele para quando a página
        # devolve `tem_mais: false`, e não quando devolve uma página vazia.
        for cobranca in trilho.cobrancas.listar(
            criada_de=de,
            criada_ate=ate,
            ordem="asc",       # ascendente e por data de criação: a única
            por_pagina=100,    # ordenação estável enquanto o mês corre
        ):
            escritor.writerow(
                [
                    cobranca.id,
                    cobranca.referencia_externa or "",
                    cobranca.meio,
                    cobranca.status,
                    cobranca.valor,
                ]
            )
            total += 1

    return total


if __name__ == "__main__":
    print(exportar("cobrancas-2026-07.csv", "2026-07-01", "2026-08-01"))
```

```bash title="Sem SDK, o mesmo laço"
cursor=""
while : ; do
  pagina=$(curl -sS "https://api.trilho.dev/v1/cobrancas?por_pagina=100&cursor=$cursor" \
    -H "Authorization: Bearer $TRILHO_SECRET_KEY")
  echo "$pagina" | jq -c '.dados[]'
  [ "$(echo "$pagina" | jq -r '.tem_mais')" = "true" ] || break
  cursor=$(echo "$pagina" | jq -r '.proximo_cursor')
done
```

`ordem="asc"` não é preferência estética. A ordenação padrão é decrescente por
data de criação, e uma varredura decrescente sobre dados que estão crescendo
**repete linhas**: cada cobrança nova empurra a janela e o que estava na fronteira
da página aparece de novo.

O critério de parada é `tem_mais`, nunca *"a página veio vazia"*. Uma página pode
vir com menos de `por_pagina` itens e ainda haver mais — o filtro é aplicado
depois da busca, e uma página inteira de linhas filtradas devolve zero itens com
`tem_mais: true`.

E o cursor é opaco de propósito. Ele codifica posição e ordenação; decodificá-lo
ou construí-lo à mão quebra no dia em que a ordenação mudar.
