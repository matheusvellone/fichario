import { contextBridge, ipcRenderer } from 'electron'
import type { Api, CadastroApi } from '../shared/types'

function cadastroApi(tabela: 'clientes' | 'fornecedores'): CadastroApi {
  return {
    list: (busca, campos) => ipcRenderer.invoke(`${tabela}:list`, busca, campos),
    get: (id) => ipcRenderer.invoke(`${tabela}:get`, id),
    create: (input) => ipcRenderer.invoke(`${tabela}:create`, input),
    update: (id, input) => ipcRenderer.invoke(`${tabela}:update`, id, input),
    remove: (id) => ipcRenderer.invoke(`${tabela}:remove`, id)
  }
}

const api: Api = {
  clientes: cadastroApi('clientes'),
  fornecedores: cadastroApi('fornecedores'),
  notas: {
    list: (filtro) => ipcRenderer.invoke('notas:list', filtro),
    resumo: (filtro) => ipcRenderer.invoke('notas:resumo', filtro),
    create: (input) => ipcRenderer.invoke('notas:create', input),
    update: (id, input) => ipcRenderer.invoke('notas:update', id, input),
    remove: (id) => ipcRenderer.invoke('notas:remove', id)
  },
  servicos: {
    list: (clienteId) => ipcRenderer.invoke('servicos:list', clienteId),
    create: (input) => ipcRenderer.invoke('servicos:create', input),
    update: (id, input) => ipcRenderer.invoke('servicos:update', id, input),
    remove: (id) => ipcRenderer.invoke('servicos:remove', id)
  },
  pagamentos: {
    list: (mes) => ipcRenderer.invoke('pagamentos:list', mes),
    create: (servicoId, input) => ipcRenderer.invoke('pagamentos:create', servicoId, input),
    update: (id, input) => ipcRenderer.invoke('pagamentos:update', id, input),
    remove: (id) => ipcRenderer.invoke('pagamentos:remove', id)
  },
  updater: {
    onUpdateDownloaded: (cb) => {
      const listener = (_e: Electron.IpcRendererEvent, versao: string): void => cb(versao)
      ipcRenderer.on('updater:downloaded', listener)
      ipcRenderer.invoke('updater:pending').then((versao: string | null) => {
        if (versao) cb(versao)
      })
      return () => ipcRenderer.removeListener('updater:downloaded', listener)
    },
    restart: () => ipcRenderer.invoke('updater:restart')
  },
  appVersion: () => ipcRenderer.invoke('app:version')
}

contextBridge.exposeInMainWorld('api', api)
