import { app, ipcMain } from 'electron'
import type { DB } from './db/connection'
import type { CadastroInput, FiltroNotas, NotaInput } from '../shared/types'
import { cadastrosRepo } from './repositories/cadastros'
import { notasRepo } from './repositories/notas'

export function registerIpc(db: DB): void {
  const notas = notasRepo(db)

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

  ipcMain.handle('app:version', () => app.getVersion())
}
