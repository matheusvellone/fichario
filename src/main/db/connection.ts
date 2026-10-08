import { join } from 'node:path'
import { app } from 'electron'
import Database from 'better-sqlite3'

export type DB = Database.Database

export function dbPath(): string {
  return join(app.getPath('userData'), 'fichario.db')
}

export function openDatabase(path = dbPath()): DB {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}
