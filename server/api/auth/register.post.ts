/**
 * Registration API Endpoint
 *
 * POST /api/auth/register
 *
 * Creates a new owner account with 'pending' status.
 * New accounts require admin approval before they can access the dashboard.
 * A session is created immediately to allow viewing the pending approval page.
 *
 * @param body.email - User's email address (must be unique)
 * @param body.password - User's password (min 8 characters)
 * @param body.displayName - Optional display name
 * @returns Owner info with pending status
 * @throws 400 - Invalid input (missing fields, invalid email format, weak password)
 * @throws 409 - Email already registered
 */
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { getMySQLPool } from '../../utils/mysql'
import { createSession } from '../../utils/session'

interface RegisterBody {
  email: string
  password: string
  displayName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  // Validate required fields
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis'
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      message: 'Format d\'email invalide'
    })
  }

  // Validate password strength (minimum 8 characters)
  if (body.password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    })
  }

  const pool = getMySQLPool()

  // Check if email is already registered
  const [existing] = await pool.execute(
    'SELECT id FROM owners WHERE email = ?',
    [body.email.toLowerCase()]
  )

  if ((existing as any[]).length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Cet email est déjà utilisé'
    })
  }

  // Hash password with bcrypt (cost factor 12)
  const passwordHash = await bcrypt.hash(body.password, 12)

  // Create owner account with 'pending' status (requires admin approval)
  const ownerId = randomUUID()
  await pool.execute(
    `INSERT INTO owners (id, email, password_hash, display_name, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [ownerId, body.email.toLowerCase(), passwordHash, body.displayName || null]
  )

  // Create session immediately to allow viewing the pending approval page
  const userAgent = getHeader(event, 'user-agent')
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip')
  await createSession(event, ownerId, userAgent, ip || undefined)

  return {
    success: true,
    pendingApproval: true,
    owner: {
      id: ownerId,
      email: body.email.toLowerCase(),
      displayName: body.displayName || null,
      status: 'pending'
    }
  }
})
