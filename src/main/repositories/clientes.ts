import type { DB } from '../db/connection'
import {
  MARCA_FIM,
  MARCA_INICIO,
  type Cliente,
  type ClienteBusca,
  type ClienteInput
} from '../../shared/types'

// Converte o que o usuário digitou numa consulta FTS5 segura: cada palavra vira um
// prefixo entre aspas ("pint"* acha "pintura"), todas precisam aparecer na nota.
export function consultaFts(busca: string): string | null {
  const palavras = busca.match(/[\p{L}\p{N}]+/gu)
  if (!palavras) return null
  return palavras.map((p) => `"${p}"*`).join(' ')
}

function valores(input: ClienteInput): [string, string | null, string | null] {
  return [input.nome.trim(), input.endereco?.trim() || null, input.telefone?.trim() || null]
}

function soDigitos(coluna: string): string {
  let expr = `IFNULL(${coluna}, '')`
  for (const c of [' ', '(', ')', '-', '.', '+', '/']) expr = `REPLACE(${expr}, '${c}', '')`
  return expr
}

export function clientesRepo(db: DB) {
  const getStmt = db.prepare<[number], Cliente>('SELECT * FROM clientes WHERE id = ?')

  return {
    list(busca = ''): ClienteBusca[] {
      const fts = consultaFts(busca)
      if (!fts) {
        return db
          .prepare<[], ClienteBusca>(
            'SELECT *, NULL AS trecho FROM clientes ORDER BY nome COLLATE NOCASE'
          )
          .all()
      }

      const termo = `%${busca.trim()}%`
      // Telefone é comparado só pelos dígitos: "99999 1234" acha "(11) 99999-1234"
      const digitos = busca.replace(/\D/g, '')
      return db
        .prepare<
          { fts: string; termo: string; digitos: string; ini: string; fim: string },
          ClienteBusca
        >(
          `WITH achados AS (
             SELECT n.cliente_id,
                    snippet(notas_fts, 0, :ini, :fim, '…', 12) AS trecho,
                    notas_fts.rank AS rank
             FROM notas_fts
             JOIN notas n ON n.id = notas_fts.rowid
             WHERE notas_fts MATCH :fts
           )
           SELECT c.*,
                  (SELECT a.trecho FROM achados a
                   WHERE a.cliente_id = c.id ORDER BY a.rank LIMIT 1) AS trecho
           FROM clientes c
           WHERE c.nome LIKE :termo
              OR IFNULL(c.endereco, '') LIKE :termo
              OR (:digitos <> '' AND ${soDigitos('c.telefone')} LIKE '%' || :digitos || '%')
              OR c.id IN (SELECT cliente_id FROM achados)
           ORDER BY c.nome COLLATE NOCASE`
        )
        .all({ fts, termo, digitos, ini: MARCA_INICIO, fim: MARCA_FIM })
    },

    get(id: number): Cliente | undefined {
      return getStmt.get(id)
    },

    create(input: ClienteInput): Cliente {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO clientes (nome, endereco, telefone) VALUES (?, ?, ?)')
        .run(...valores(input))
      return getStmt.get(Number(lastInsertRowid))!
    },

    update(id: number, input: ClienteInput): Cliente {
      db.prepare(
        `UPDATE clientes
         SET nome = ?, endereco = ?, telefone = ?, updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(...valores(input), id)
      return getStmt.get(id)!
    },

    remove(id: number): void {
      db.prepare('DELETE FROM clientes WHERE id = ?').run(id)
    }
  }
}
