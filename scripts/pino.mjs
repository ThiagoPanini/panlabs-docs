#!/usr/bin/env node
/**
 * O comparador do pino — diz se alguma versão publicada do `overpower` passou
 * sem ser varrida.
 *
 * **NENHUM JUÍZO SOBRE A DOCUMENTAÇÃO MORA AQUI.** Este script não lê uma
 * página, não abre um contrato e não sabe o que é uma boa varredura. Ele
 * confere uma coisa só, e é a única conferível por máquina: que o topo de
 * `scripts/pino-overpower.txt` não está atrás do que o PyPI publica. O juízo
 * é da varredura, e ela mora em `.claude/skills/varredura-overpower/`.
 *
 * A separação é o assunto da ADR 11. O portão 5 confere que a página é a
 * projeção do contrato; este confere que ninguém deixou a ferramenta andar sem
 * olhar. Entre os dois continua havendo espaço para o contrato estar em dia e
 * errado — e esse espaço é humano por desenho, não por omissão.
 *
 * **Zero dependência npm.** `node:https` e `node:fs`, como o `contraste.mjs` e
 * o `paridade.mjs`. O axioma 2 vale também para o instrumento.
 *
 * Dois modos:
 *   `node scripts/pino.mjs`              relatório legível, sempre sai 0
 *   `node scripts/pino.mjs --verificar`  sai 1 se o pino estiver atrás do PyPI
 *
 * A rede entra aqui, e entra declarada: o PyPI é a definição operacional de
 * "publicado" neste projeto, porque no `overpower` publicar é mergear. A
 * alternativa seria a tag no GitHub, que é o mesmo fato uma etapa antes e
 * custa credencial. Falha de rede reprova com mensagem própria e NÃO é
 * confundida com pino atrasado: um portão que passa quando a rede cai é um
 * portão que se silencia sozinho.
 *
 * Procedência: ADR 11 · docs/agents/domain.md § Vocabulário, verbete `pino`.
 */

import { readFileSync } from 'node:fs'
import { get } from 'node:https'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { realpathSync } from 'node:fs'

const AQUI = dirname(fileURLToPath(import.meta.url))
const PINO = join(AQUI, 'pino-overpower.txt')
const PYPI = 'https://pypi.org/pypi/overpower/json'
const TENTATIVAS = 3

const VEREDITOS = new Set(['varrido', 'sem-deriva'])

/** Lê o arquivo do pino e devolve as linhas de dados, na ordem do arquivo. */
export function lerPino (caminho = PINO) {
  const linhas = readFileSync(caminho, 'utf8')
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() !== '' && !l.trimStart().startsWith('#'))

  return linhas.map((linha, i) => {
    const partes = linha.split('\t')
    if (partes.length < 4) {
      throw new Error(
        `pino-overpower.txt linha ${i + 1}: esperava 4 colunas separadas por TAB, ` +
        `achei ${partes.length}. Colunas: versão, data, veredito, nota.`
      )
    }
    const [versao, data, veredito, ...resto] = partes
    if (!VEREDITOS.has(veredito)) {
      throw new Error(
        `pino-overpower.txt linha ${i + 1}: veredito \`${veredito}\` fora da lista. ` +
        `A lista é fechada: ${[...VEREDITOS].join(', ')}.`
      )
    }
    return { versao, data, veredito, nota: resto.join('\t') }
  })
}

/**
 * Compara duas versões no esquema do `uv version` — inteiros separados por
 * ponto. Devolve <0, 0 ou >0. Sufixo não numérico ordena depois do número puro,
 * que é o suficiente para dizer "atrás" sem virar um `semver` de mentira.
 */
export function comparar (a, b) {
  const partir = (v) => v.split('.').map((p) => {
    const n = Number.parseInt(p, 10)
    return Number.isNaN(n) ? [Infinity, p] : [n, '']
  })
  const pa = partir(a)
  const pb = partir(b)
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const [na, sa] = pa[i] ?? [0, '']
    const [nb, sb] = pb[i] ?? [0, '']
    if (na !== nb) return na < nb ? -1 : 1
    if (sa !== sb) return sa < sb ? -1 : 1
  }
  return 0
}

/** Busca a última versão publicada no PyPI. Rejeita com causa nomeada. */
export function versaoPublicada (url = PYPI, tentativas = TENTATIVAS) {
  return new Promise((cumprir, rejeitar) => {
    const tentar = (restam) => {
      const req = get(url, { timeout: 10_000 }, (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          const erro = new Error(`PyPI respondeu ${res.statusCode}`)
          return restam > 0 ? tentar(restam - 1) : rejeitar(erro)
        }
        let corpo = ''
        res.setEncoding('utf8')
        res.on('data', (c) => { corpo += c })
        res.on('end', () => {
          try {
            const versao = JSON.parse(corpo)?.info?.version
            if (typeof versao !== 'string' || versao === '') {
              return rejeitar(new Error('PyPI respondeu 200 sem `info.version`'))
            }
            cumprir(versao)
          } catch (e) {
            rejeitar(new Error(`PyPI respondeu 200 com corpo ilegível: ${e.message}`))
          }
        })
      })
      req.on('timeout', () => { req.destroy(new Error('PyPI não respondeu em 10s')) })
      req.on('error', (e) => {
        if (restam > 0) return tentar(restam - 1)
        rejeitar(e)
      })
    }
    tentar(tentativas)
  })
}

async function principal (argv) {
  const verificar = argv.includes('--verificar')
  let historico
  try {
    historico = lerPino()
  } catch (e) {
    console.error(`\x1b[31m✗\x1b[0m ${e.message}`)
    return 1
  }
  if (historico.length === 0) {
    console.error('\x1b[31m✗\x1b[0m pino-overpower.txt não tem nenhuma linha de dados.')
    return 1
  }

  const ultimo = historico[historico.length - 1]

  let publicada
  try {
    publicada = await versaoPublicada()
  } catch (e) {
    // Rede caída NÃO é pino atrasado, e a mensagem separa os dois casos para
    // que ninguém conserte o problema errado.
    console.error(`\x1b[31m✗\x1b[0m Não deu para perguntar ao PyPI: ${e.message}`)
    console.error('  Isto não é pino atrasado. É a régua sem conseguir medir.')
    console.error(`  Confira à mão: curl -s ${PYPI} | jq -r .info.version`)
    return verificar ? 1 : 0
  }

  const distancia = comparar(ultimo.versao, publicada)

  console.log(`  pino     ${ultimo.versao}  (${ultimo.data}, ${ultimo.veredito})`)
  console.log(`  PyPI     ${publicada}`)
  console.log(`  varreduras registradas: ${historico.length}`)

  if (distancia >= 0) {
    console.log('\x1b[32m✓\x1b[0m O pino está em dia: nenhuma versão publicada passou sem varredura.')
    return 0
  }

  console.error('')
  console.error(`\x1b[31m✗\x1b[0m O pino está atrás: \`${ultimo.versao}\` varrida, \`${publicada}\` publicada.`)
  console.error('')
  console.error('  A documentação do `overpower` neste repositório pode estar descrevendo')
  console.error('  uma ferramenta que já mudou, e ninguém olhou. Rode a varredura:')
  console.error('')
  console.error('    claude "varre a documentação do overpower"')
  console.error('')
  console.error('  Ela cobre de `pino` até `PyPI` numa passada só e move o pino ao fim,')
  console.error('  inclusive quando não achar nada — `sem-deriva` também é registro.')
  console.error('  A skill está em `.claude/skills/varredura-overpower/`.')
  return verificar ? 1 : 0
}

if (realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  principal(process.argv.slice(2)).then((codigo) => { process.exitCode = codigo })
}
