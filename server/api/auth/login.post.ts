import bcrypt from 'bcryptjs'
import { getMySQLPool } from '../../utils/mysql'
import { createSession } from '../../utils/session'

interface LoginBody {
  email: string
  password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  // Validation
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis'
    })
  }

  const pool = getMySQLPool()

  // Récupérer l'owner par email
  const [rows] = await pool.execute(
    `SELECT id, email, password_hash as passwordHash, display_name as displayName, status
     FROM owners
     WHERE email = ?`,
    [body.email.toLowerCase()]
  )

  const owners = rows as any[]
  if (owners.length === 0) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect'
    })
  }

  const owner = owners[0]

  // Vérifier le mot de passe
  const passwordValid = await bcrypt.compare(body.password, owner.passwordHash)
  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect'
    })
  }

  // Vérifier si le compte est suspendu
  if (owner.status === 'suspended') {
    throw createError({
      statusCode: 403,
      message: 'Votre compte a été suspendu'
    })
  }

  // Créer une session
  const userAgent = getHeader(event, 'user-agent')
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip')
  await createSession(event, owner.id, userAgent, ip || undefined)

  return {
    success: true,
    pendingApproval: owner.status === 'pending',
    owner: {
      id: owner.id,
      email: owner.email,
      displayName: owner.displayName,
      status: owner.status
    }
  }
})
