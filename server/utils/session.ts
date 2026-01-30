/**
 * Session Management Utility
 *
 * Handles user sessions with secure HTTP-only cookies.
 * Sessions are stored in MySQL and validated on each request.
 *
 * Security features:
 * - HttpOnly cookies (no JavaScript access)
 * - Secure flag in production (HTTPS only)
 * - SameSite=Strict (CSRF protection)
 * - Server-side session storage with expiration
 */
import { randomUUID } from 'crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { getMySQLPool } from './mysql'

/** Cookie name for session ID */
const SESSION_COOKIE_NAME = 'auroreia_session'

/** Session validity duration in days */
const SESSION_DURATION_DAYS = 7

/**
 * Session data structure stored in database
 */
export interface SessionData {
  id: string
  ownerId: string
  expiresAt: Date
}

/**
 * Owner account data structure
 */
export interface Owner {
  id: string
  email: string
  displayName: string | null
  status: 'pending' | 'active' | 'suspended'
  createdAt: Date
  emailVerified: boolean
}

/**
 * Creates a new session for an authenticated owner.
 * Stores session in database and sets secure HTTP-only cookie.
 *
 * @param event - H3 event object
 * @param ownerId - UUID of the authenticated owner
 * @param userAgent - Optional user agent string for session tracking
 * @param ipAddress - Optional IP address for session tracking
 * @returns Generated session ID (UUID)
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

  // Store session in database
  await pool.execute(
    `INSERT INTO sessions (id, owner_id, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, ownerId, expiresAt, userAgent || null, ipAddress || null]
  )

  // Set secure HTTP-only cookie
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
 * Retrieves the current session from the cookie.
 * Validates that session exists and hasn't expired.
 *
 * @param event - H3 event object
 * @returns Session data if valid, null otherwise
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

  return sessions[0] ?? null
}

/**
 * Retrieves the owner associated with the current session.
 * Combines session lookup with owner data fetch.
 *
 * @param event - H3 event object
 * @returns Owner data if authenticated, null otherwise
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

  return owners[0] ?? null
}

/**
 * Deletes the current session (logout).
 * Removes session from database and clears the cookie.
 *
 * @param event - H3 event object
 */
export async function deleteSession(event: H3Event): Promise<void> {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return

  const pool = getMySQLPool()
  await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId])

  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

/**
 * Cleans up expired sessions from the database.
 * Should be called periodically via cron job or scheduled task.
 *
 * @returns Number of deleted sessions
 */
export async function cleanExpiredSessions(): Promise<number> {
  const pool = getMySQLPool()
  const [result] = await pool.execute('DELETE FROM sessions WHERE expires_at < NOW()')
  return (result as any).affectedRows
}
