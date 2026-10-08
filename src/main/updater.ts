import { app, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater'

const QUATRO_HORAS = 4 * 60 * 60 * 1000

export function setupUpdater(getWindow: () => BrowserWindow | null): void {
  let versaoBaixada: string | null = null

  ipcMain.handle('updater:restart', () => {
    // isSilent = true (sem telas do instalador), isForceRunAfter = true (reabre o app)
    autoUpdater.quitAndInstall(true, true)
  })
  // Caso a janela tenha sido recarregada depois do download
  ipcMain.handle('updater:pending', () => versaoBaixada)

  if (!app.isPackaged) return

  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', (info) => {
    versaoBaixada = info.version
    getWindow()?.webContents.send('updater:downloaded', info.version)
  })
  autoUpdater.on('error', (err) => log.warn('Falha ao verificar atualização', err))

  const check = (): void => {
    autoUpdater.checkForUpdates().catch((err) => log.warn('Falha ao verificar atualização', err))
  }
  check()
  setInterval(check, QUATRO_HORAS)
}
