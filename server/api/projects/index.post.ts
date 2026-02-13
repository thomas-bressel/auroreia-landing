/**
 * Create Project API Endpoint
 *
 * POST /api/projects
 *
 * Creates a new Drawer CIS project with 'pending' status.
 * The project must be provisioned separately to create its Docker infrastructure.
 * Stores the Drawer admin credentials for the project.
 *
 * @param body.displayName - Human-readable project name (3-100 chars)
 * @param body.drawerUsername - Admin username for Drawer (3-50 chars)
 * @param body.drawerPassword - Admin password for Drawer (min 8 chars)
 * @returns Created project info with generated ID
 * @throws 400 - Invalid input
 * @throws 401 - Not authenticated
 */
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
 * Generates a unique project ID in format: proj_xxxxxxxx
 * Uses cryptographically secure random bytes.
 *
 * @returns Unique project identifier string
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
  // Verify authentication
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const body = await readBody<CreateProjectBody>(event)

  // Validate required fields
  if (!body.displayName || !body.drawerUsername || !body.drawerPassword) {
    throw createError({
      statusCode: 400,
      message: 'Nom du projet, username et password Drawer requis'
    })
  }

  // Validate display name length
  if (body.displayName.length < 3 || body.displayName.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Le nom du projet doit contenir entre 3 et 100 caractères'
    })
  }

  // Validate Drawer username length
  if (body.drawerUsername.length < 3 || body.drawerUsername.length > 50) {
    throw createError({
      statusCode: 400,
      message: 'Le username Drawer doit contenir entre 3 et 50 caractères'
    })
  }

  // Validate Drawer password strength
  if (body.drawerPassword.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe Drawer doit contenir au moins 8 caractères'
    })
  }

  const pool = getMySQLPool()

  // Generate unique project ID
  let projectId = generateProjectId()

  // Ensure ID doesn't already exist (extremely rare but possible)
  const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [projectId])
  if ((existing as any[]).length > 0) {
    projectId = generateProjectId()
  }

  // Hash Drawer admin password with bcrypt
  const drawerPasswordHash = await bcrypt.hash(body.drawerPassword, 12)

  // Create project record (status = pending, will be provisioned separately)
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
