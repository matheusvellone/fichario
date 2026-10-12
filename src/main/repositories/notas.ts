import type { DB } from '../db/connection'
import type { FiltroNotas, Nota, NotaInput, ResumoNotas } from '../../shared/types'

const SELECT_NOTA = `
  SELECT n.*,
         c.nome AS cliente_nome, c.deleted_at AS cliente_excluido_em,
         f.nome AS fornecedor_nome, f.deleted_at AS fornecedor_excluido_em
  FROM notas n
  LEFT JOIN clientes c ON c.id = n.cliente_id
  LEFT JOIN fornecedores f ON f.id = n.fornecedor_id`

// Mês "AAAA-MM" vira um intervalo de datas: inicio <= data < fim
export function intervaloDoMes(mes: string): { inicio: string; fim: string } {
  const [ano, m] = mes.split('-').map(Number)
  const proximo = m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, '0')}`
  return { inicio: `${mes}-01`, fim: `${proximo}-01` }
}

// Monta o WHERE a partir do filtro
function where(filtro: FiltroNotas): { sql: string; params: Record<string, string | number> } {
  const condicoes: string[] = []
  const params: Record<string, string | number> = {}
  if (filtro.clienteId !== undefined) {
    condicoes.push('n.cliente_id = :clienteId')
    params.clienteId = filtro.clienteId
  }
  if (filtro.fornecedorId !== undefined) {
    condicoes.push('n.fornecedor_id = :fornecedorId')
    params.fornecedorId = filtro.fornecedorId
  }
  if (filtro.mes) {
    condicoes.push('n.data >= :inicio AND n.data < :fim')
    Object.assign(params, intervaloDoMes(filtro.mes))
  }
  return { sql: condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '', params }
}

function valores(
  input: NotaInput
): [number | null, number | null, string, string, number, string | null] {
  return [
    input.cliente_id,
    input.fornecedor_id,
    input.data,
    input.tipo,
    input.valor_centavos,
    input.descricao?.trim() || null
  ]
}

export function notasRepo(db: DB) {
  const getStmt = db.prepare<[number], Nota>(`${SELECT_NOTA} WHERE n.id = ?`)

  return {
    list(filtro: FiltroNotas): Nota[] {
      const { sql, params } = where(filtro)
      return db
        .prepare<Record<string, string | number>, Nota>(
          `${SELECT_NOTA} ${sql} ORDER BY n.data DESC, n.id DESC`
        )
        .all(params)
    },

    // Os pagamentos de serviços entram junto, exceto na tela de um fornecedor
    resumo(filtro: FiltroNotas): ResumoNotas {
      const { sql, params } = where(filtro)
      const resumo = db
        .prepare<Record<string, string | number>, ResumoNotas>(
          `SELECT IFNULL(SUM(CASE WHEN n.tipo = 'entrada' THEN n.valor_centavos END), 0) AS entrou,
                  IFNULL(SUM(CASE WHEN n.tipo = 'saida' THEN n.valor_centavos END), 0) AS saiu
           FROM notas n ${sql}`
        )
        .get(params)!
      if (filtro.fornecedorId === undefined) {
        const condicoes: string[] = []
        const paramsPagamentos: Record<string, string | number> = {}
        if (filtro.clienteId !== undefined) {
          condicoes.push('s.cliente_id = :clienteId')
          paramsPagamentos.clienteId = filtro.clienteId
        }
        if (filtro.mes) {
          condicoes.push('p.data >= :inicio AND p.data < :fim')
          Object.assign(paramsPagamentos, intervaloDoMes(filtro.mes))
        }
        resumo.entrou += db
          .prepare<Record<string, string | number>, number>(
            `SELECT IFNULL(SUM(p.valor_centavos), 0)
             FROM pagamentos p JOIN servicos s ON s.id = p.servico_id
             ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}`
          )
          .pluck()
          .get(paramsPagamentos)!
      }
      return resumo
    },

    create(input: NotaInput): Nota {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO notas (cliente_id, fornecedor_id, data, tipo, valor_centavos, descricao)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(...valores(input))
      return getStmt.get(Number(lastInsertRowid))!
    },

    update(id: number, input: NotaInput): Nota {
      db.prepare(
        `UPDATE notas
         SET cliente_id = ?, fornecedor_id = ?, data = ?, tipo = ?, valor_centavos = ?, descricao = ?,
             updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(...valores(input), id)
      return getStmt.get(id)!
    },

    remove(id: number): void {
      db.prepare('DELETE FROM notas WHERE id = ?').run(id)
    }
  }
}
