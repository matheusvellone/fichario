import { app, ipcMain } from 'electron'
import type { DB } from './db/connection'
import type { ClienteInput } from '../shared/types'
import { clientesRepo } from './repositories/clientes'
import { notasRepo } from './repositories/notas'

export function registerIpc(db: DB): void {
  const clientes = clientesRepo(db)
  const notas = notasRepo(db)

  ipcMain.handle('clientes:list', (_e, busca?: string) => clientes.list(busca))
  ipcMain.handle('clientes:get', (_e, id: number) => clientes.get(id))
  ipcMain.handle('clientes:create', (_e, input: ClienteInput) => clientes.create(input))
  ipcMain.handle('clientes:update', (_e, id: number, input: ClienteInput) =>
    clientes.update(id, input)
  )
  ipcMain.handle('clientes:remove', (_e, id: number) => clientes.remove(id))

  ipcMain.handle('notas:listByCliente', (_e, clienteId: number) => notas.listByCliente(clienteId))
  ipcMain.handle('notas:create', (_e, clienteId: number, texto: string) =>
    notas.create(clienteId, texto)
  )
  ipcMain.handle('notas:update', (_e, id: number, texto: string) => notas.update(id, texto))
  ipcMain.handle('notas:remove', (_e, id: number) => notas.remove(id))

  ipcMain.handle('app:version', () => app.getVersion())
}
