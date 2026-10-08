import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '../shared/types'

const api: Api = {
  clientes: {
    list: (busca) => ipcRenderer.invoke('clientes:list', busca),
    get: (id) => ipcRenderer.invoke('clientes:get', id),
    create: (input) => ipcRenderer.invoke('clientes:create', input),
    update: (id, input) => ipcRenderer.invoke('clientes:update', id, input),
    remove: (id) => ipcRenderer.invoke('clientes:remove', id)
  },
  notas: {
    listByCliente: (clienteId) => ipcRenderer.invoke('notas:listByCliente', clienteId),
    create: (clienteId, texto) => ipcRenderer.invoke('notas:create', clienteId, texto),
    update: (id, texto) => ipcRenderer.invoke('notas:update', id, texto),
    remove: (id) => ipcRenderer.invoke('notas:remove', id)
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
