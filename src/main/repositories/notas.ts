import type { DB } from '../db/connection'
import type { FiltroNotas, Nota, NotaInput, ResumoNotas } from '../../shared/types'

const SELECT_NOTA = `
  SELECT n.*, c.nome AS cliente_nome, f.nome AS fornecedor_nome
  FROM notas n
  LEFT JOIN clientes c ON c.id = n.cliente_id
  LEFT JOIN fornecedores f ON f.id = n.fornecedor_id`

// Monta o WHERE a partir do filtro; mês "AAAA-MM" vira um intervalo de datas
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
    const [ano, mes] = filtro.mes.split('-').map(Number)
    const proximo = mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, '0')}`
    condicoes.push('n.data >= :inicio AND n.data < :fim')
    params.inicio = `${filtro.mes}-01`
    params.fim = `${proximo}-01`
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

    resumo(filtro: FiltroNotas): ResumoNotas {
      const { sql, params } = where(filtro)
      return db
        .prepare<Record<string, string | number>, ResumoNotas>(
          `SELECT IFNULL(SUM(CASE WHEN n.tipo = 'entrada' THEN n.valor_centavos END), 0) AS entrou,
                  IFNULL(SUM(CASE WHEN n.tipo = 'saida' THEN n.valor_centavos END), 0) AS saiu
           FROM notas n ${sql}`
        )
        .get(params)!
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
