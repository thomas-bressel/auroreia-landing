import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { getMySQLPool } from '../../utils/mysql'
import { getSessionOwner } from '../../utils/session'

interface CreateProjectBody {
  displayName: string
  drawerUsername: string
  drawerPassword: string
}

/**
 * Génère un ID de projet unique : proj_xxxxxxxx
 */
function generateProjectId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'proj_'
  const bytes = randomBytes(8)
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length]
  }
  return id
}

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const body = await readBody<CreateProjectBody>(event)

  // Validation
  if (!body.displayName || !body.drawerUsername || !body.drawerPassword) {
    throw createError({
      statusCode: 400,
      message: 'Nom du projet, username et password Drawer requis'
    })
  }

  if (body.displayName.length < 3 || body.displayName.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Le nom du projet doit contenir entre 3 et 100 caractères'
    })
  }

  if (body.drawerUsername.length < 3 || body.drawerUsername.length > 50) {
    throw createError({
      statusCode: 400,
      message: 'Le username Drawer doit contenir entre 3 et 50 caractères'
    })
  }

  if (body.drawerPassword.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe Drawer doit contenir au moins 8 caractères'
    })
  }

  const pool = getMySQLPool()

  // Générer un ID unique
  let projectId = generateProjectId()

  // Vérifier que l'ID n'existe pas déjà (rare mais possible)
  const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [projectId])
  if ((existing as any[]).length > 0) {
    projectId = generateProjectId() // Regénérer
  }

  // Hasher le mot de passe Drawer
  const drawerPasswordHash = await bcrypt.hash(body.drawerPassword, 12)

  // Créer le projet (status = pending, sera provisionné ensuite)
  await pool.execute(
    `INSERT INTO projects (id, owner_id, display_name, status, drawer_admin_username, drawer_admin_password_hash)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [projectId, owner.id, body.displayName, body.drawerUsername, drawerPasswordHash]
  )

  return {
    success: true,
    project: {
      id: projectId,
      displayName: body.displayName,
      status: 'pending',
      drawerUsername: body.drawerUsername
    },
    message: 'Projet créé. Le provisioning va démarrer.'
  }
})
