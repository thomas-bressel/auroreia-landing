/**
 * MySQL Database Pool Utility
 *
 * Manages the MySQL connection pool for the main platform database.
 * Used for authentication, sessions, and project management.
 * Uses mysql2/promise for async/await support.
 *
 * Configuration via environment variables:
 * - MYSQL_HOST: Database host (default: localhost)
 * - MYSQL_PORT: Database port (default: 3306)
 * - MYSQL_USER: Database user (default: auroreia)
 * - MYSQL_PASSWORD: Database password
 * - MYSQL_DATABASE: Database name (default: auroreia_platform)
 */
import mysql from 'mysql2/promise'

/** Singleton connection pool */
let pool: mysql.Pool | null = null

/**
 * Gets or creates the MySQL connection pool.
 * Uses lazy initialization - pool is only created when first needed.
 * Pool is configured with:
 * - 10 max connections
 * - Wait for connections when pool is full
 * - No queue limit (unlimited pending connection requests)
 *
 * @returns MySQL connection pool
 */
export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'auroreia',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'auroreia_platform',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

/**
 * Closes the connection pool and clears the singleton.
 * Should be called during graceful shutdown.
 */
export async function closeMySQLPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
