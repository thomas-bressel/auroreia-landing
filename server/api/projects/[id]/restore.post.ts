/**
 * Restore Project API Endpoint
 *
 * POST /api/projects/:id/restore
 *
 * Restores a project from the trash to its previous status.
 * If the project was previously active, restarts the Docker containers.
 * Project data is preserved since soft delete only stops containers.
 *
 * @param id - Project ID (route parameter)
 * @returns Success status and restored project status
 * @throws 400 - Project not in trash
 * @throws 401 - Not authenticated
 * @throws 404 - Project not found
 */
import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { restartProjectContainers } from '../../../provisioning/provisioning.service'

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

  // Verify project belongs to owner and is in trash
  const [rows] = await pool.execute(
    'SELECT id, status, previous_status FROM projects WHERE id = ? AND owner_id = ?',
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

  // Only trashed projects can be restored
  if (project.status !== 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Ce projet n\'est pas dans la corbeille'
    })
  }

  // Determine the status to restore to (fallback to 'pending' if not set)
  const restoreStatus = project.previous_status || 'pending'

  // If project was previously active, restart Docker containers
  if (restoreStatus === 'active') {
    console.log(`[Restore] Restarting containers for ${projectId}...`)
    const result = await restartProjectContainers(projectId)
    if (!result.success) {
      console.warn(`[Restore] Error restarting containers: ${result.error}`)
      // Continue with status restore - user can manually retry container start
    }
  }

  // Restore status and clear previous_status field
  await pool.execute(
    `UPDATE projects SET status = ?, previous_status = NULL, updated_at = NOW() WHERE id = ?`,
    [restoreStatus, projectId]
  )

  return {
    success: true,
    message: restoreStatus === 'active' ? 'Projet restauré (conteneurs redémarrés)' : 'Projet restauré',
    status: restoreStatus
  }
})
