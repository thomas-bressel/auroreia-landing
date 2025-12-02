import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'newsletter.db')
    db = new Database(dbPath)

    // Créer la table si elle n'existe pas
    db.exec(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `)

    // Index pour améliorer les performances
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_email ON newsletter_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_subscribed_at ON newsletter_subscribers(subscribed_at);
    `)
  }

  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
