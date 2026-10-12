import { app, ipcMain } from 'electron'
import type { DB } from './db/connection'
import type {
  CadastroInput,
  FiltroNotas,
  NotaInput,
  PagamentoInput,
  ServicoInput
} from '../shared/types'
import { cadastrosRepo } from './repositories/cadastros'
import { notasRepo } from './repositories/notas'
import { pagamentosRepo, servicosRepo } from './repositories/servicos'

export function registerIpc(db: DB): void {
  const notas = notasRepo(db)
  const servicos = servicosRepo(db)
  const pagamentos = pagamentosRepo(db)

  for (const tabela of ['clientes', 'fornecedores'] as const) {
    const repo = cadastrosRepo(db, tabela)
    ipcMain.handle(`${tabela}:list`, (_e, busca?: string) => repo.list(busca))
    ipcMain.handle(`${tabela}:get`, (_e, id: number) => repo.get(id))
    ipcMain.handle(`${tabela}:create`, (_e, input: CadastroInput) => repo.create(input))
    ipcMain.handle(`${tabela}:update`, (_e, id: number, input: CadastroInput) =>
      repo.update(id, input)
    )
    ipcMain.handle(`${tabela}:remove`, (_e, id: number) => repo.remove(id))
  }

  ipcMain.handle('notas:list', (_e, filtro: FiltroNotas) => notas.list(filtro))
  ipcMain.handle('notas:resumo', (_e, filtro: FiltroNotas) => notas.resumo(filtro))
  ipcMain.handle('notas:create', (_e, input: NotaInput) => notas.create(input))
  ipcMain.handle('notas:update', (_e, id: number, input: NotaInput) => notas.update(id, input))
  ipcMain.handle('notas:remove', (_e, id: number) => notas.remove(id))

  ipcMain.handle('servicos:list', (_e, clienteId: number) => servicos.list(clienteId))
  ipcMain.handle('servicos:create', (_e, input: ServicoInput) => servicos.create(input))
  ipcMain.handle('servicos:update', (_e, id: number, input: ServicoInput) =>
    servicos.update(id, input)
  )
  ipcMain.handle('servicos:remove', (_e, id: number) => servicos.remove(id))

  ipcMain.handle('pagamentos:list', (_e, mes: string) => pagamentos.list(mes))
  ipcMain.handle('pagamentos:create', (_e, servicoId: number, input: PagamentoInput) =>
    pagamentos.create(servicoId, input)
  )
  ipcMain.handle('pagamentos:update', (_e, id: number, input: PagamentoInput) =>
    pagamentos.update(id, input)
  )
  ipcMain.handle('pagamentos:remove', (_e, id: number) => pagamentos.remove(id))

  ipcMain.handle('app:version', () => app.getVersion())
}
