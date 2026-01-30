/**
 * Soft Delete Project API Endpoint
 *
 * DELETE /api/projects/:id
 *
 * Moves a project to the trash (soft delete).
 * Stops Docker containers to free up server RAM.
 * The previous status is saved to allow restoration.
 * Project data and volumes are preserved for recovery.
 *
 * @param id - Project ID (route parameter)
 * @returns Success status
 * @throws 400 - Project already in trash
 * @throws 401 - Not authenticated
 * @throws 404 - Project not found or doesn't belong to user
 */
import { getMySQLPool } from '../../utils/mysql'
import { getSessionOwner } from '../../utils/session'
import { stopProjectContainers } from '../../provisioning/provisioning.service'

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

  // Verify project belongs to the authenticated owner
  const [rows] = await pool.execute(
    'SELECT id, status FROM projects WHERE id = ? AND owner_id = ?',
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

  // Prevent double-deletion
  if (project.status === 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Ce projet est déjà dans la corbeille'
    })
  }

  // Stop containers if project was active/provisioning to free up server RAM
  if (project.status === 'active' || project.status === 'provisioning') {
    console.log(`[Delete] Stopping containers for ${projectId}...`)
    const result = await stopProjectContainers(projectId)
    if (!result.success) {
      console.warn(`[Delete] Error stopping containers: ${result.error}`)
    }
  }

  // Save previous status for restoration, then mark as deleted
  await pool.execute(
    `UPDATE projects SET previous_status = status, status = 'deleted', updated_at = NOW() WHERE id = ?`,
    [projectId]
  )

  return {
    success: true,
    message: 'Projet déplacé dans la corbeille (conteneurs arrêtés)'
  }
})
