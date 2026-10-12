import type { DB } from '../db/connection'
import type {
  Pagamento,
  PagamentoDoMes,
  PagamentoInput,
  Servico,
  ServicoInput
} from '../../shared/types'
import { intervaloDoMes } from './notas'

export function servicosRepo(db: DB) {
  return {
    // Serviços do cliente, do mais recente para o mais antigo, cada um com seus pagamentos
    list(clienteId: number): Servico[] {
      const servicos = db
        .prepare<[number], Omit<Servico, 'pagamentos'>>(
          'SELECT * FROM servicos WHERE cliente_id = ? ORDER BY data DESC, id DESC'
        )
        .all(clienteId)
      const pagamentos = db
        .prepare<[number], Pagamento>(
          `SELECT p.* FROM pagamentos p
           JOIN servicos s ON s.id = p.servico_id
           WHERE s.cliente_id = ?
           ORDER BY p.data, p.id`
        )
        .all(clienteId)
      return servicos.map((s) => ({
        ...s,
        pagamentos: pagamentos.filter((p) => p.servico_id === s.id)
      }))
    },

    create(input: ServicoInput): void {
      db.prepare(
        `INSERT INTO servicos (cliente_id, data, valor_centavos, descricao) VALUES (?, ?, ?, ?)`
      ).run(input.cliente_id, input.data, input.valor_centavos, input.descricao?.trim() || null)
    },

    update(id: number, input: ServicoInput): void {
      db.prepare(
        `UPDATE servicos
         SET data = ?, valor_centavos = ?, descricao = ?, updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(input.data, input.valor_centavos, input.descricao?.trim() || null, id)
    },

    // Os pagamentos do serviço são apagados junto (ON DELETE CASCADE)
    remove(id: number): void {
      db.prepare('DELETE FROM servicos WHERE id = ?').run(id)
    }
  }
}

export function pagamentosRepo(db: DB) {
  return {
    // Pagamentos recebidos no mês "AAAA-MM", para a aba Notas
    list(mes: string): PagamentoDoMes[] {
      return db
        .prepare<{ inicio: string; fim: string }, PagamentoDoMes>(
          `SELECT p.*, s.descricao AS servico_descricao, s.cliente_id,
                  c.nome AS cliente_nome, c.deleted_at AS cliente_excluido_em
           FROM pagamentos p
           JOIN servicos s ON s.id = p.servico_id
           JOIN clientes c ON c.id = s.cliente_id
           WHERE p.data >= :inicio AND p.data < :fim
           ORDER BY p.data DESC, p.id DESC`
        )
        .all(intervaloDoMes(mes))
    },

    create(servicoId: number, input: PagamentoInput): void {
      db.prepare(
        'INSERT INTO pagamentos (servico_id, data, valor_centavos, meio) VALUES (?, ?, ?, ?)'
      ).run(servicoId, input.data, input.valor_centavos, input.meio)
    },

    update(id: number, input: PagamentoInput): void {
      db.prepare(
        `UPDATE pagamentos
         SET data = ?, valor_centavos = ?, meio = ?, updated_at = datetime('now', 'localtime')
         WHERE id = ?`
      ).run(input.data, input.valor_centavos, input.meio, id)
    },

    remove(id: number): void {
      db.prepare('DELETE FROM pagamentos WHERE id = ?').run(id)
    }
  }
}
