/**
 * Provision Project API Endpoint
 *
 * POST /api/projects/:id/provision
 *
 * Starts the provisioning process for a project.
 * Creates Docker infrastructure: MySQL, Redis, phpMyAdmin, Redis Insight, File Browser.
 * Runs asynchronously in the background - returns immediately.
 * Project status changes: pending -> provisioning -> active
 *
 * Note: In production, this should use a job queue (Bull, etc.) for better reliability.
 *
 * @param id - Project ID (route parameter)
 * @returns Success status and project ID
 * @throws 400 - Project not in 'pending' status
 * @throws 401 - Not authenticated
 * @throws 404 - Project not found
 */
import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { provisionProject } from '../../../provisioning/provisioning.service'

export default defineEventHandler(async (event) => {
  // Verify authentication
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const projectId = getRouterParam(event, 'id')
  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'ID de projet requis'
    })
  }

  const pool = getMySQLPool()

  // Fetch project and verify ownership
  const [rows] = await pool.execute(
    `SELECT id, display_name as displayName, status, drawer_admin_username as adminUsername,
            drawer_admin_password_hash as adminPasswordHash
     FROM projects
     WHERE id = ? AND owner_id = ?`,
    [projectId, owner.id]
  )

  const projects = rows as any[]
  if (projects.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Projet non trouvé'
    })
  }

  const project = projects[0]

  // Only projects in 'pending' status can be provisioned
  if (project.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: `Le projet ne peut pas être provisionné (status actuel: ${project.status})`
    })
  }

  // Start provisioning in background (non-blocking)
  // Note: In production, use a job queue (Bull, etc.) for better reliability
  provisionProject(
    projectId,
    project.displayName,
    owner.id,
    owner.email,
    project.adminUsername,
    project.adminPasswordHash
  ).then(result => {
    if (result.success) {
      console.log(`[API] Provisioning of ${projectId} completed successfully`)
    } else {
      console.error(`[API] Provisioning of ${projectId} failed:`, result.error)
    }
  })

  return {
    success: true,
    message: 'Provisioning démarré',
    projectId
  }
})
