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

  // Validation
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis'
    })
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      message: 'Format d\'email invalide'
    })
  }

  // Validation mot de passe (minimum 8 caractères)
  if (body.password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    })
  }

  const pool = getMySQLPool()

  // Vérifier si l'email existe déjà
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

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(body.password, 12)

  // Créer l'owner avec status "pending" (en attente d'approbation)
  const ownerId = randomUUID()
  await pool.execute(
    `INSERT INTO owners (id, email, password_hash, display_name, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [ownerId, body.email.toLowerCase(), passwordHash, body.displayName || null]
  )

  // Créer une session (même en pending, pour pouvoir afficher la page d'attente)
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
