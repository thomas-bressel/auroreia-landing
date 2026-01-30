/**
 * SQLite Database Utility
 *
 * Manages the SQLite database connection for the newsletter feature.
 * Uses better-sqlite3 for synchronous, fast database operations.
 * This is separate from the main MySQL database used for auth/projects.
 *
 * Database location: ./data/newsletter.db
 */
import Database from 'better-sqlite3'
import { join } from 'path'

/** Singleton database instance */
let db: Database.Database | null = null

/**
 * Gets or creates the SQLite database connection.
 * Automatically creates the newsletter_subscribers table if it doesn't exist.
 * Uses lazy initialization - database is only opened when first needed.
 *
 * @returns Database instance ready for queries
 */
export function getDatabase() {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'newsletter.db')
    db = new Database(dbPath)

    // Create table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `)

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_email ON newsletter_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_subscribed_at ON newsletter_subscribers(subscribed_at);
    `)
  }

  return db
}

/**
 * Closes the database connection and clears the singleton.
 * Should be called during graceful shutdown.
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
