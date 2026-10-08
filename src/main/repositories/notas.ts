import type { DB } from '../db/connection'
import type { Nota } from '../../shared/types'

export function notasRepo(db: DB) {
  const getStmt = db.prepare<[number], Nota>('SELECT * FROM notas WHERE id = ?')

  return {
    listByCliente(clienteId: number): Nota[] {
      return db
        .prepare<[number], Nota>(
          'SELECT * FROM notas WHERE cliente_id = ? ORDER BY created_at DESC, id DESC'
        )
        .all(clienteId)
    },

    create(clienteId: number, texto: string): Nota {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO notas (cliente_id, texto) VALUES (?, ?)')
        .run(clienteId, texto.trim())
      return getStmt.get(Number(lastInsertRowid))!
    },

    update(id: number, texto: string): Nota {
      db.prepare(
        `UPDATE notas SET texto = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`
      ).run(texto.trim(), id)
      return getStmt.get(id)!
    },

    remove(id: number): void {
      db.prepare('DELETE FROM notas WHERE id = ?').run(id)
    }
  }
}
