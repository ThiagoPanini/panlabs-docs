# Para cada declaração de gradiente, imprime `seletor<TAB>declaração`.
#
# Lê a saída de `css-sem-comentario.awk` (`arquivo:linha:código`), e existe por
# uma razão só: o portão 8 precisa provar que os DOIS `radial-gradient` do
# projeto moram na regra `[data-sd-showcase]` — não que existem dois em algum
# lugar. `grep` conta ocorrência; ocorrência não sabe em que bloco caiu.
#
# O prelúdio é ACUMULADO entre linhas, e isso não é zelo: `tokens.css` abre o
# bloco escuro com o seletor partido em duas linhas —
#
#   :root,
#   [data-sd-showcase] {
#
# — e sem acumular, esse bloco e o bloco só da ilha ficam com o mesmo nome. São
# exatamente os dois que este portão precisa distinguir: um põe token em `:root`
# e vaza o glow para o site inteiro; o outro é a confinação.
#
# Ele NÃO é um parser de CSS. Assume o que este repositório de fato escreve: uma
# declaração por linha, `{` fechando o prelúdio no fim da linha, e `}` sozinho.
# Um arquivo minificado passaria batido — e nenhum arquivo de `src/` é.

{
  codigo = $0
  sub(/^[^:]*:[0-9]+:/, "", codigo)
  gsub(/^[ \t]+|[ \t]+$/, "", codigo)
  if (codigo == "") next

  if (codigo ~ /radial-gradient/) {
    print (seletor == "" ? "(raiz)" : seletor) "\t" codigo
  }

  # `{` no fim da linha fecha o prelúdio acumulado e nomeia o bloco.
  if (codigo ~ /\{[ \t]*$/) {
    seletor = preludio substr(codigo, 1, index(codigo, "{") - 1)
    gsub(/[ \t]+/, " ", seletor)
    gsub(/^ | $/, "", seletor)
    preludio = ""
    next
  }

  if (codigo ~ /^\}/) { seletor = ""; preludio = ""; next }

  # Declaração termina em `;` e não é fragmento de seletor.
  if (codigo ~ /;[ \t]*$/) { preludio = ""; next }

  preludio = preludio codigo " "
}
