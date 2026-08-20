/**
 * A régua do pino — exercita o que o `pino.mjs` decide sem tocar na rede.
 *
 * A rede fica de fora por desenho: `versaoPublicada` é uma chamada HTTP, e um
 * teste que dependesse dela reprovaria por motivo alheio ao repositório. O que
 * se testa aqui é o que erra em silêncio: a ordenação de versão e a lista
 * fechada de vereditos.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { comparar, lerPino } from './pino.mjs'

const arquivoCom = (conteudo) => {
  const dir = mkdtempSync(join(tmpdir(), 'pino-'))
  const caminho = join(dir, 'pino-overpower.txt')
  writeFileSync(caminho, conteudo)
  return caminho
}

test('comparar ordena por número, não por texto', () => {
  // O caso que mata uma comparação lexicográfica, e o único motivo de esta
  // função existir em vez de um `<` direto.
  assert.equal(comparar('0.9.0', '0.10.0'), -1)
  assert.equal(comparar('0.10.0', '0.9.0'), 1)
  assert.equal(comparar('0.27.0', '0.27.0'), 0)
  assert.equal(comparar('0.26.0', '0.27.0'), -1)
  assert.equal(comparar('1.0.0', '0.99.99'), 1)
})

test('comparar aceita comprimentos diferentes', () => {
  assert.equal(comparar('0.27', '0.27.0'), 0)
  assert.equal(comparar('0.27.1', '0.27'), 1)
})

test('lerPino devolve as linhas de dados, e só elas', () => {
  const caminho = arquivoCom(
    '# um comentário\n' +
    '\n' +
    '0.25.1\t2026-08-19\tvarrido\tprimeira, à mão\n' +
    '0.27.0\t2026-08-20\tsem-deriva\tnada mudou na superfície\n'
  )
  const linhas = lerPino(caminho)
  assert.equal(linhas.length, 2)
  assert.deepEqual(linhas[1], {
    versao: '0.27.0',
    data: '2026-08-20',
    veredito: 'sem-deriva',
    nota: 'nada mudou na superfície',
  })
})

test('a lista de vereditos é fechada, e o de fora reprova pelo nome', () => {
  const caminho = arquivoCom('0.27.0\t2026-08-20\tquase\tx\n')
  assert.throws(() => lerPino(caminho), /veredito `quase` fora da lista/)
})

test('coluna faltando reprova dizendo quantas achou', () => {
  const caminho = arquivoCom('0.27.0\t2026-08-20\tvarrido\n')
  assert.throws(() => lerPino(caminho), /esperava 4 colunas.*achei 3/s)
})

test('a nota pode conter TAB sem partir a linha', () => {
  const caminho = arquivoCom('0.27.0\t2026-08-20\tvarrido\tum\tdois\n')
  assert.equal(lerPino(caminho)[0].nota, 'um\tdois')
})

test('o pino versionado deste repositório é legível e termina em veredito válido', () => {
  const linhas = lerPino()
  assert.ok(linhas.length > 0, 'o pino não pode ficar sem linha de dados')
  assert.ok(['varrido', 'sem-deriva'].includes(linhas.at(-1).veredito))
})
