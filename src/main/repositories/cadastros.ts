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

// Colunas editáveis de cada tabela; só clientes têm documentos e cidade/estado
const CAMPOS = {
  clientes: ['nome', 'telefone', 'endereco', 'cidade', 'estado', 'rg', 'cpf', 'observacoes'],
  fornecedores: ['nome', 'telefone', 'endereco', 'observacoes']
} satisfies Record<string, (keyof CadastroInput)[]>

function valores(campos: (keyof CadastroInput)[], input: CadastroInput): (string | null)[] {
  return campos.map((campo) => input[campo]?.trim() || null)
}

function soDigitos(coluna: string): string {
  let expr = `IFNULL(${coluna}, '')`
  for (const c of [' ', '(', ')', '-', '.', '+', '/']) expr = `REPLACE(${expr}, '${c}', '')`
  return expr
}

// Mesmas operações para clientes e fornecedores; `tabela` nunca vem do usuário
export function cadastrosRepo(db: DB, tabela: 'clientes' | 'fornecedores') {
  const tabelaFts = `${tabela}_fts`
  const colunaNota = tabela === 'clientes' ? 'cliente_id' : 'fornecedor_id'
  const campos = CAMPOS[tabela]
  // Telefone, CPF e RG são comparados só pelos dígitos
  const colunasDigitos = tabela === 'clientes' ? ['telefone', 'cpf', 'rg'] : ['telefone']
  const buscaDigitos = colunasDigitos
    .map((coluna) => `${soDigitos(`c.${coluna}`)} LIKE '%' || :digitos || '%'`)
    .join(' OR ')
  const getStmt = db.prepare<[number], Cadastro>(`SELECT * FROM ${tabela} WHERE id = ?`)

  return {
    list(busca = ''): CadastroBusca[] {
      const fts = consultaFts(busca)
      if (!fts) {
        return db
          .prepare<[], CadastroBusca>(
            `SELECT *, NULL AS trecho, NULL AS trecho_nota FROM ${tabela} WHERE deleted_at IS NULL ORDER BY nome COLLATE NOCASE`
          )
          .all()
      }

      // Só os dígitos: "99999 1234" acha o telefone "(11) 99999-1234"
      const digitos = busca.replace(/\D/g, '')
      return db
        .prepare<{ fts: string; digitos: string; ini: string; fim: string }, CadastroBusca>(
          `WITH notas_achadas AS MATERIALIZED (
             SELECT n.${colunaNota} AS id, n.data, n.id AS nota_id,
                    snippet(notas_fts, 0, :ini, :fim, '…', 12) AS trecho
             FROM notas_fts
             JOIN notas n ON n.id = notas_fts.rowid
             WHERE notas_fts MATCH :fts AND n.${colunaNota} IS NOT NULL
           )
           SELECT c.*,
                  CASE WHEN instr(f.trecho, :ini) > 0 THEN f.trecho END AS trecho,
                  n.trecho AS trecho_nota
           FROM ${tabela} c
           LEFT JOIN (
             SELECT rowid AS id, snippet(${tabelaFts}, 2, :ini, :fim, '…', 12) AS trecho
             FROM ${tabelaFts}
             WHERE ${tabelaFts} MATCH :fts
           ) f ON f.id = c.id
           -- Nota mais recente do cadastro cuja descrição bateu com a busca. O snippet fica
           -- na CTE materializada porque o FTS5 não aceita ele junto de window function
           LEFT JOIN (
             SELECT id, trecho FROM (
               SELECT id, trecho,
                      ROW_NUMBER() OVER (PARTITION BY id ORDER BY data DESC, nota_id DESC) AS ordem
               FROM notas_achadas
             ) WHERE ordem = 1
           ) n ON n.id = c.id
           WHERE c.deleted_at IS NULL
             AND (f.id IS NOT NULL
              OR n.id IS NOT NULL
              OR (:digitos <> '' AND (${buscaDigitos})))
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
          `INSERT INTO ${tabela} (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`
        )
        .run(...valores(campos, input))
      return getStmt.get(Number(lastInsertRowid))!
    },

    update(id: number, input: CadastroInput): Cadastro {
      db.prepare(
        `UPDATE ${tabela}
         SET ${campos.map((campo) => `${campo} = ?`).join(', ')},
             updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(...valores(campos, input), id)
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
