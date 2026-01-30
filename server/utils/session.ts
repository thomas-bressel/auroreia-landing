import { randomUUID } from 'crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { getMySQLPool } from './mysql'

const SESSION_COOKIE_NAME = 'auroreia_session'
const SESSION_DURATION_DAYS = 7

export interface SessionData {
  id: string
  ownerId: string
  expiresAt: Date
}

export interface Owner {
  id: string
  email: string
  displayName: string | null
  status: 'pending' | 'active' | 'suspended'
  createdAt: Date
  emailVerified: boolean
}

/**
 * Crée une nouvelle session pour un owner
 */
export async function createSession(
  event: H3Event,
  ownerId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const pool = getMySQLPool()
  const sessionId = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  await pool.execute(
    `INSERT INTO sessions (id, owner_id, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, ownerId, expiresAt, userAgent || null, ipAddress || null]
  )

  // Cookie HttpOnly, Secure, SameSite=Strict
  setCookie(event, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/'
  })

  return sessionId
}

/**
 * Récupère la session courante depuis le cookie
 */
export async function getSession(event: H3Event): Promise<SessionData | null> {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return null

  const pool = getMySQLPool()
  const [rows] = await pool.execute(
    `SELECT id, owner_id as ownerId, expires_at as expiresAt
     FROM sessions
     WHERE id = ? AND expires_at > NOW()`,
    [sessionId]
  )

  const sessions = rows as SessionData[]
  if (sessions.length === 0) return null

  return sessions[0]
}

/**
 * Récupère l'owner depuis la session courante
 */
export async function getSessionOwner(event: H3Event): Promise<Owner | null> {
  const session = await getSession(event)
  if (!session) return null

  const pool = getMySQLPool()
  const [rows] = await pool.execute(
    `SELECT id, email, display_name as displayName, status, created_at as createdAt, email_verified as emailVerified
     FROM owners
     WHERE id = ?`,
    [session.ownerId]
  )

  const owners = rows as Owner[]
  if (owners.length === 0) return null

  return owners[0]
}

/**
 * Supprime la session courante (logout)
 */
export async function deleteSession(event: H3Event): Promise<void> {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return

  const pool = getMySQLPool()
  await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId])

  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

/**
 * Nettoie les sessions expirées (à appeler périodiquement)
 */
export async function cleanExpiredSessions(): Promise<number> {
  const pool = getMySQLPool()
  const [result] = await pool.execute('DELETE FROM sessions WHERE expires_at < NOW()')
  return (result as any).affectedRows
}
