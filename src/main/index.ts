import { join } from 'node:path'
import { app, BrowserWindow, dialog, shell } from 'electron'
import log from 'electron-log/main'
import { dbPath, openDatabase, type DB } from './db/connection'
import { migrate } from './db/migrate'
import { registerIpc } from './ipc'
import { setupUpdater } from './updater'

log.initialize()

let mainWindow: BrowserWindow | null = null
let db: DB | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'Fichário',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.maximize()
    mainWindow?.show()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Links externos abrem no navegador, nunca dentro do app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    try {
      const file = dbPath()
      db = openDatabase(file)
      await migrate(db, file)
      log.info(`Banco de dados: ${file}`)
    } catch (err) {
      log.error('Erro ao abrir o banco de dados', err)
      dialog.showErrorBox(
        'Fichário',
        'Não foi possível abrir os dados do programa. Feche e abra novamente. ' +
          'Se o problema continuar, peça ajuda ao suporte.'
      )
      app.quit()
      return
    }

    registerIpc(db)
    setupUpdater(() => mainWindow)
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('will-quit', () => {
    db?.close()
  })
}
