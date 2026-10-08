import { existsSync } from 'node:fs'
import log from 'electron-log/main'
import type { DB } from './connection'

interface Migration {
  version: number
  name: string
  sql: string
}

const files = import.meta.glob<string>('./migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true
})

// Arquivos devem seguir o padrão NNN_descricao.sql
export const migrations: Migration[] = Object.entries(files)
  .map(([path, sql]) => {
    const name = path.split('/').pop()!.replace(/\.sql$/, '')
    const version = Number.parseInt(name.split('_')[0], 10)
    if (!Number.isInteger(version)) throw new Error(`Migration com nome inválido: ${path}`)
    return { version, name, sql }
  })
  .sort((a, b) => a.version - b.version)

export async function migrate(db: DB, dbFile: string): Promise<void> {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`)

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').pluck().all() as number[]
  )
  const pending = migrations.filter((m) => !applied.has(m.version))
  if (pending.length === 0) return

  // Cópia de segurança antes de mexer na estrutura de um banco que já tem dados
  if (applied.size > 0 && existsSync(dbFile)) {
    const current = Math.max(...applied)
    const backup = `${dbFile}.bak-${current}`
    await db.backup(backup)
    log.info(`Backup do banco salvo em ${backup}`)
  }

  const insert = db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)')
  for (const m of pending) {
    db.transaction(() => {
      db.exec(m.sql)
      insert.run(m.version, m.name)
    })()
    log.info(`Migration aplicada: ${m.name}`)
  }
}
