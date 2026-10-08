import type { DB } from '../db/connection'
import {
  MARCA_FIM,
  MARCA_INICIO,
  type Cadastro,
  type CadastroBusca,
  type CadastroInput
} from '../../shared/types'

// Converte o que o usuário digitou numa consulta FTS5 segura: cada palavra vira um
// prefixo entre aspas ("pint"* acha "pintura"), todas precisam aparecer no cadastro.
export function consultaFts(busca: string): string | null {
  const palavras = busca.match(/[\p{L}\p{N}]+/gu)
  if (!palavras) return null
  return palavras.map((p) => `"${p}"*`).join(' ')
}

function valores(input: CadastroInput): [string, string | null, string | null, string | null] {
  return [
    input.nome.trim(),
    input.telefone?.trim() || null,
    input.endereco?.trim() || null,
    input.observacoes?.trim() || null
  ]
}

function soDigitos(coluna: string): string {
  let expr = `IFNULL(${coluna}, '')`
  for (const c of [' ', '(', ')', '-', '.', '+', '/']) expr = `REPLACE(${expr}, '${c}', '')`
  return expr
}

// Mesmas operações para clientes e fornecedores; `tabela` nunca vem do usuário
export function cadastrosRepo(db: DB, tabela: 'clientes' | 'fornecedores') {
  const tabelaFts = `${tabela}_fts`
  const getStmt = db.prepare<[number], Cadastro>(`SELECT * FROM ${tabela} WHERE id = ?`)

  return {
    list(busca = ''): CadastroBusca[] {
      const fts = consultaFts(busca)
      if (!fts) {
        return db
          .prepare<[], CadastroBusca>(
            `SELECT *, NULL AS trecho FROM ${tabela} WHERE deleted_at IS NULL ORDER BY nome COLLATE NOCASE`
          )
          .all()
      }

      // Telefone é comparado só pelos dígitos: "99999 1234" acha "(11) 99999-1234"
      const digitos = busca.replace(/\D/g, '')
      return db
        .prepare<{ fts: string; digitos: string; ini: string; fim: string }, CadastroBusca>(
          `SELECT c.*,
                  CASE WHEN instr(f.trecho, :ini) > 0 THEN f.trecho END AS trecho
           FROM ${tabela} c
           LEFT JOIN (
             SELECT rowid AS id, snippet(${tabelaFts}, 2, :ini, :fim, '…', 12) AS trecho
             FROM ${tabelaFts}
             WHERE ${tabelaFts} MATCH :fts
           ) f ON f.id = c.id
           WHERE c.deleted_at IS NULL
             AND (f.id IS NOT NULL
              OR (:digitos <> '' AND ${soDigitos('c.telefone')} LIKE '%' || :digitos || '%'))
           ORDER BY c.nome COLLATE NOCASE`
        )
        .all({ fts, digitos, ini: MARCA_INICIO, fim: MARCA_FIM })
    },

    get(id: number): Cadastro | undefined {
      return getStmt.get(id)
    },

    create(input: CadastroInput): Cadastro {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO ${tabela} (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)`
        )
        .run(...valores(input))
      return getStmt.get(Number(lastInsertRowid))!
    },

    update(id: number, input: CadastroInput): Cadastro {
      db.prepare(
        `UPDATE ${tabela}
         SET nome = ?, telefone = ?, endereco = ?, observacoes = ?,
             updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(...valores(input), id)
      return getStmt.get(id)!
    },

    // Exclusão suave: as notas ligadas continuam existindo
    remove(id: number): void {
      db.prepare(
        `UPDATE ${tabela} SET deleted_at = datetime('now', 'localtime') WHERE id = ?`
      ).run(id)
    }
  }
}
